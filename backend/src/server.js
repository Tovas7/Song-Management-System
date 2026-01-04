const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const databaseConnection = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbConnected = await databaseConnection.testConnection();
  res.status(200).json({ 
    status: 'OK', 
    message: 'Song Management API is running',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbConnected,
      state: databaseConnection.getConnectionState()
    }
  });
});

// Import routes
const songRoutes = require('./routes/songRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'Song Management API v1.0.0' });
});

// Song routes
app.use('/api/songs', songRoutes);
app.use('/api/statistics', statisticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: {
      message: 'Route not found',
      code: 'ROUTE_NOT_FOUND'
    }
  });
});

// Error handling middleware
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Start server
if (require.main === module) {
  // Initialize database connection before starting server
  databaseConnection.connect()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    });
}

module.exports = app;