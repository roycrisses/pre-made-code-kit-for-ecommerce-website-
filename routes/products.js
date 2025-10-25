const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const { upload, uploadToLocal, deleteFromLocal } = require('../config/storage');
const { generateKey } = require('crypto');
const { productCache, keys, invalidate } = require('../config/cache');

const router = express.Router();

// Safe JSON parsing helper function
const safeJsonParse = (str, fallback = []) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    console.warn('JSON parse error:', e.message);
    return fallback;
  }
};

// Multer configuration is now in config/storage.js

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      brand,
      size,
      color,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Create cache key from query parameters
    const cacheKey = keys.productList({
      page, limit, category, minPrice, maxPrice, brand, size, color, search, sortBy, sortOrder
    });

    // Try to get from cache first
    const cachedResult = productCache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const query = { isActive: true };

    // Apply filters
    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (size) query['sizes.size'] = size;
    if (color) query['colors.color'] = new RegExp(color, 'i');
    if (search) {
      // Use text index for better search performance
      query.$text = { $search: search };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Use lean() for better performance and select only needed fields
    const products = await Product.find(query)
      .select('name description price category brand sizes colors images discount rating isFeatured createdAt')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Use aggregation for count to leverage indexes
    const [{ total = 0 } = {}] = await Product.aggregate([
      { $match: query },
      { $count: 'total' }
    ]);

    const result = {
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };

    // Cache the result for 5 minutes
    productCache.set(cacheKey, result, 300);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const cacheKey = keys.product(productId);

    // Try to get from cache first
    const cachedProduct = productCache.get(cacheKey);
    if (cachedProduct) {
      return res.json(cachedProduct);
    }

    // Use lean() for better performance
    const product = await Product.findById(productId)
      .select('-__v')
      .lean();
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Cache the product for 10 minutes
    productCache.set(cacheKey, product, 600);

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create product (Admin only)
// @access  Private/Admin
router.post('/', [auth, adminAuth, upload.array('images', 5)], async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    console.log('Received files:', req.files?.length || 0);
    
    // Manual validation
    if (!req.body.name || req.body.name.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Product name is required (minimum 2 characters)' 
      });
    }
    
    if (!req.body.description || req.body.description.trim().length < 10) {
      return res.status(400).json({ 
        message: 'Description is required (minimum 10 characters)' 
      });
    }
    
    if (!req.body.price || isNaN(parseFloat(req.body.price)) || parseFloat(req.body.price) <= 0) {
      return res.status(400).json({ 
        message: 'Valid price is required (must be greater than 0)' 
      });
    }
    
    if (!req.body.category) {
      return res.status(400).json({ 
        message: 'Category is required' 
      });
    }

    const {
      name,
      description,
      price,
      category,
      subcategory,
      brand,
      sizes,
      colors,
      material,
      careInstructions,
      tags,
      discount,
      isFeatured
    } = req.body;

    // Process uploaded images - Use disk storage
    const images = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
          images.push({
            fileName: file.filename,
            url: `${baseUrl}/uploads/${file.filename}`,
            contentType: file.mimetype,
            size: file.size,
            alt: `${name} image ${i + 1}`,
            isPrimary: i === 0
          });
        } catch (error) {
          console.error('Error processing image:', error);
          return res.status(500).json({ message: 'Failed to process images' });
        }
      }
    }

    // Parse JSON fields safely using helper function
    const parsedSizes = safeJsonParse(sizes, []);
    const parsedColors = safeJsonParse(colors, []);
    const parsedTags = safeJsonParse(tags, []);

    const productData = {
      name,
      description,
      price: parseFloat(price),
      category,
      subcategory: subcategory || '',
      brand: brand || '',
      sizes: parsedSizes,
      colors: parsedColors,
      images,
      material: material || '',
      careInstructions: careInstructions || '',
      tags: parsedTags,
      discount: parseFloat(discount || 0),
      isFeatured: isFeatured === 'true' || isFeatured === true,
      createdBy: req.user.id
    };

    console.log('Product data to save:', productData);

    const product = await Product.create(productData);

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
router.put('/:id', [auth, adminAuth, upload.array('images', 5)], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      description,
      price,
      category,
      subcategory,
      brand,
      sizes,
      colors,
      material,
      careInstructions,
      tags,
      discount,
      isFeatured,
      isActive
    } = req.body;

    // Update fields with safe parsing
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (subcategory) product.subcategory = subcategory;
    if (brand) product.brand = brand;
    if (sizes) product.sizes = safeJsonParse(sizes, product.sizes);
    if (colors) product.colors = safeJsonParse(colors, product.colors);
    if (material) product.material = material;
    if (careInstructions) product.careInstructions = careInstructions;
    if (tags) product.tags = safeJsonParse(tags, product.tags);
    if (discount !== undefined) product.discount = parseFloat(discount);
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true';
    if (isActive !== undefined) product.isActive = isActive === 'true';

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
          product.images.push({
            fileName: file.filename,
            url: `${baseUrl}/uploads/${file.filename}`,
            contentType: file.mimetype,
            size: file.size,
            alt: `${product.name} image ${product.images.length + 1}`,
            isPrimary: product.images.length === 0
          });
        } catch (error) {
          console.error('Error processing image:', error);
          return res.status(500).json({ message: 'Failed to process images' });
        }
      }
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (Admin only)
// @access  Private/Admin
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    console.log('Attempting to delete product with ID:', req.params.id);
    console.log('ID type:', typeof req.params.id);
    console.log('ID length:', req.params.id.length);
    
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format');
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    // Find product without isActive filter for deletion
    const product = await Product.findOne({ _id: req.params.id });
    console.log('Product found:', !!product);
    
    if (!product) {
      console.log('Product not found in database');
      // Let's also check if it exists but is inactive
      const inactiveProduct = await Product.findOne({ _id: req.params.id, isActive: false });
      if (inactiveProduct) {
        console.log('Product found but is inactive, deleting anyway');
        await Product.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Product deleted successfully' });
      }
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Product found, proceeding with deletion');

    // Delete associated image files (skip if using Base64 storage)
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.fileName) {
          try {
            await deleteFromLocal(image.fileName);
          } catch (imageError) {
            console.log('Error deleting image file:', imageError.message);
            // Continue with product deletion even if image deletion fails
          }
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    console.log('Product deleted successfully');
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   DELETE /api/products/:id/images/:imageIndex
// @desc    Delete specific product image (Admin only)
// @access  Private/Admin
router.delete('/:id/images/:imageIndex', [auth, adminAuth], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const imageIndex = parseInt(req.params.imageIndex);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (imageIndex < 0 || imageIndex >= product.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    // Delete image file
    const imageToDelete = product.images[imageIndex];
    if (imageToDelete.fileName) {
      await deleteFromLocal(imageToDelete.fileName);
    }

    // Remove image from array
    product.images.splice(imageIndex, 1);

    // If deleted image was primary and there are other images, make first one primary
    if (product.images.length > 0 && !product.images.some(img => img.isPrimary)) {
      product.images[0].isPrimary = true;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
