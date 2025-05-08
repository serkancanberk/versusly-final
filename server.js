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
import authenticateUser from './src/middleware/authMiddleware.js';

const app = express();
// Trust first proxy (needed for secure cookies when behind a proxy)
app.set('trust proxy', 1);
let server; // Server instance'ını global olarak tutuyoruz

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
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true, // This is critical for cookies
  exposedHeaders: ["set-cookie"],
};
app.use(cors(corsOptions));
// Enable preflight across all routes
app.options('*', cors(corsOptions));

// Parse cookies from incoming requests
app.use(cookieParser());

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log('----------------------------------------');
  console.log('New Request Received:');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('----------------------------------------');
  next();
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// API routes
app.use('/api/clashes', clashRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gpt', gptRoutes);
app.use('/api/reactions', authenticateUser, reactionRoutes);

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.url);
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
