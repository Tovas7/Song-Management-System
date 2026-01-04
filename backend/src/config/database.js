const mongoose = require('mongoose');

/**
 * Database connection utility functions
 */
class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connectionString = null;
  }

  /**
   * Connect to MongoDB database
   * @param {string} connectionString - MongoDB connection string
   * @returns {Promise<void>}
   */
  async connect(connectionString = null) {
    try {
      // Use provided connection string or fall back to environment variable
      this.connectionString = connectionString || process.env.MONGODB_URI;
      
      if (!this.connectionString) {
        throw new Error('MongoDB connection string is required. Set MONGODB_URI environment variable.');
      }

      // Configure mongoose options for better error handling and performance
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
      };

      await mongoose.connect(this.connectionString, options);
      this.isConnected = true;
      
      console.log(`MongoDB connected successfully to: ${this.getMaskedConnectionString()}`);
      
      // Set up connection event listeners
      this.setupEventListeners();
      
    } catch (error) {
      this.isConnected = false;
      console.error('MongoDB connection error:', error.message);
      throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
  }

  /**
   * Disconnect from MongoDB database
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log('MongoDB disconnected successfully');
      }
    } catch (error) {
      console.error('MongoDB disconnection error:', error.message);
      throw new Error(`Failed to disconnect from MongoDB: ${error.message}`);
    }
  }

  /**
   * Check if database is connected
   * @returns {boolean}
   */
  isConnectionActive() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get current connection state
   * @returns {string}
   */
  getConnectionState() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }

  /**
   * Get masked connection string for logging (hides credentials)
   * @returns {string}
   */
  getMaskedConnectionString() {
    if (!this.connectionString) return 'No connection string';
    
    // Replace credentials with asterisks for security
    return this.connectionString.replace(/:\/\/([^:]+):([^@]+)@/, '://*****:*****@');
  }

  /**
   * Set up mongoose connection event listeners
   * @private
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      console.error('Mongoose connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await this.disconnect();
        console.log('Database connection closed due to application termination');
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });
  }

  /**
   * Test database connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      if (!this.isConnectionActive()) {
        return false;
      }
      
      // Ping the database
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error.message);
      return false;
    }
  }
}

// Create singleton instance
const databaseConnection = new DatabaseConnection();

module.exports = databaseConnection;