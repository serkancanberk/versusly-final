import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // Keep original file extension
    cb(null, uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Image optimization middleware
const optimizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const originalPath = req.file.path;
    const { dir, name } = path.parse(originalPath);
    
    // Create new path with -optimized suffix
    let optimizedPath = path.join(dir, `${name}-optimized.webp`);

    if (originalPath === optimizedPath) {
      const fallbackPath = path.join(dir, `${name}-final.webp`);
      console.warn('Original and optimized paths are the same. Using fallback path:', fallbackPath);
      optimizedPath = fallbackPath;
    }

    const originalSize = fs.statSync(originalPath).size;

    console.log('Optimizing image:', {
      originalPath,
      optimizedPath
    });

    // Process image with sharp
    await sharp(originalPath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(optimizedPath);

    // Get optimized file size
    const optimizedSize = fs.statSync(optimizedPath).size;
    console.log('Image optimization complete:', {
      originalSize,
      optimizedSize,
      reduction: `${Math.round((1 - optimizedSize / originalSize) * 100)}%`
    });

    // Delete original file
    fs.unlinkSync(originalPath);

    // Update request file info
    req.file.path = optimizedPath;
    req.file.filename = path.basename(optimizedPath);

    next();
  } catch (error) {
    console.error('Image optimization error:', {
      error: error.message,
      stack: error.stack,
      file: req.file?.path
    });

    // Clean up files if optimization fails
    if (req.file) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up files:', cleanupError);
      }
    }

    next(error);
  }
};

// Multer error handler middleware
export function multerErrorHandler(err, req, res, next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Max size is 5MB.' });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  next(err);
}

export default {
  upload,
  optimizeImage
};