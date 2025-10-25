const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Upload file to local storage
const uploadToLocal = async (file, folder = 'products') => {
  try {
    if (!file || !file.filename) {
      throw new Error('Invalid file object');
    }
    
    // File is already saved by multer, just return the info
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const publicUrl = `${baseUrl}/uploads/${file.filename}`;
    
    return {
      filename: file.filename,
      url: publicUrl,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path
    };
  } catch (error) {
    console.error('Local upload error:', error);
    throw new Error('Failed to upload file to local storage');
  }
};

// Delete file from local storage
const deleteFromLocal = async (filename) => {
  try {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Local delete error:', error);
    return false;
  }
};

// Upload multiple files
const uploadMultipleToLocal = async (files, folder = 'products') => {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return [];
    }
    
    const results = files.map(file => uploadToLocal(file, folder));
    return await Promise.all(results);
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error('Failed to upload multiple files');
  }
};

module.exports = {
  upload,
  uploadToLocal,
  deleteFromLocal,
  uploadMultipleToLocal
};
