import dotenv from 'dotenv';
dotenv.config();
console.log("✅ OPENAI_API_KEY:", process.env.OPENAI_API_KEY?.slice(0, 8));
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import clashRoutes from './src/routes/clashRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import gptRoutes from './src/routes/gptRoutes.js';
import reactionRoutes from './src/routes/reactionRoutes.js';
import argumentRoutes from './src/routes/argumentRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import authenticateUser from './src/middleware/authMiddleware.js';
import { multerErrorHandler } from './src/middleware/uploadMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
// Trust first proxy (needed for secure cookies when behind a proxy)
app.set('trust proxy', 1);
let server; // Server instance'ını global olarak tutuyoruz

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Graceful shutdown function
const gracefulShutdown = () => {
  console.log('\nStarting graceful shutdown...');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
};

// Process event handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown();
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log but don't shutdown for unhandled rejections
});

// Configure CORS - Ensure proper cookie sharing between frontend and backend
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true, // This is critical for cookies
  exposedHeaders: ["set-cookie"],
  maxAge: 86400, // 24 hours
};

// Add cookie parser before CORS
app.use(cookieParser());

// Add detailed logging for cookie and CORS issues
app.use((req, res, next) => {
  console.log('Request details:', {
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
    cookies: req.cookies,
    headers: {
      cookie: req.headers.cookie,
      authorization: req.headers.authorization,
      'content-type': req.headers['content-type']
    }
  });
  next();
});

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Enable preflight across all routes
app.options('*', cors(corsOptions));

app.use(express.json());

// Request logging middleware (only in development)
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// API routes
app.use('/api/clashes', clashRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gpt', gptRoutes);
app.use('/api/reactions', authenticateUser, reactionRoutes);
app.use('/api/arguments', argumentRoutes);
app.use('/api/user', authenticateUser, userRoutes);

// Add multer error handler after routes that use file upload
console.log('Multer error handler:', multerErrorHandler); // Verify the handler is defined
app.use(multerErrorHandler);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// 404 handler
app.use((req, res) => {
  if (isDev) {
    console.log('404 - Route not found:', req.url);
  }
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = 8080;

// MongoDB bağlantısı ve server başlatma
const startServer = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    server = app.listen(PORT, '0.0.0.0', (error) => {
      if (error) {
        console.error('Error starting server:', error);
        return;
      }
      console.log(`Server running on port ${PORT}`);
      console.log('Server is ready to accept requests');
      console.log(`Test the server: curl http://localhost:${PORT}/test`);
    });

    // MongoDB connection error handling
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(startServer, 5000);
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB. Error details:');
    console.error(error);
    console.error('Stack trace:', error.stack);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(startServer, 5000);
  }
};

startServer();
