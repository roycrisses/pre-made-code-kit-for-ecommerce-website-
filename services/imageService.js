const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const path = require('path');
require('dotenv').config();

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg, .jpeg, and .webp formats are allowed'));
  }
}).array('images', 5); // Allow up to 5 files

// Process and upload image to S3
const processAndUploadImage = async (file, folder = 'products') => {
  try {
    // Resize and optimize image
    const optimizedImage = await sharp(file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Generate unique filename
    const extension = 'webp';
    const filename = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: optimizedImage,
      ContentType: `image/${extension}`,
      ACL: 'public-read'
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // Return the public URL
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

// Remove background using Remove.bg API
const removeBackground = async (imageUrl) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.remove.bg/v1.0/removebg',
      data: {
        image_url: imageUrl,
        size: 'auto',
      },
      responseType: 'arraybuffer',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Background removal error:', error.message);
    throw new Error('Failed to remove background');
  }
};

// Delete image from S3
const deleteImage = async (url) => {
  try {
    const key = new URL(url).pathname.substring(1); // Remove leading '/'
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    };
    
    await s3Client.send(new DeleteObjectCommand(params));
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

module.exports = {
  upload,
  processAndUploadImage,
  removeBackground,
  deleteImage
};
