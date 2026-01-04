const mongoose = require('mongoose');
const databaseConnection = require('../database');

/**
 * Unit Tests for Database Connection
 * Tests successful connection scenarios and connection failure handling
 * Requirements: 9.1
 */

describe('Database Connection Unit Tests', () => {
  let originalConsoleLog;
  let originalConsoleError;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeAll(() => {
    // Mock console methods to avoid cluttering test output
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    consoleLogSpy = jest.fn();
    consoleErrorSpy = jest.fn();
    console.log = consoleLogSpy;
    console.error = consoleErrorSpy;
  });

  afterAll(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    // Clear console spies
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
    
    // Reset connection state
    databaseConnection.isConnected = false;
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Connection State Management', () => {
    test('should return correct initial connection state', () => {
      // Act
      const isActive = databaseConnection.isConnectionActive();
      const state = databaseConnection.getConnectionState();

      // Assert
      expect(isActive).toBe(false);
      expect(state).toBe('disconnected');
    });

    test('should return correct connection states', () => {
      // Test all possible states
      const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
      
      // Mock different mongoose connection states
      const originalReadyState = mongoose.connection.readyState;
      
      // Test disconnected (0)
      mongoose.connection.readyState = 0;
      expect(databaseConnection.getConnectionState()).toBe('disconnected');
      
      // Test connected (1)
      mongoose.connection.readyState = 1;
      expect(databaseConnection.getConnectionState()).toBe('connected');
      
      // Test connecting (2)
      mongoose.connection.readyState = 2;
      expect(databaseConnection.getConnectionState()).toBe('connecting');
      
      // Test disconnecting (3)
      mongoose.connection.readyState = 3;
      expect(databaseConnection.getConnectionState()).toBe('disconnecting');
      
      // Test unknown state
      mongoose.connection.readyState = 99;
      expect(databaseConnection.getConnectionState()).toBe('unknown');
      
      // Restore original state
      mongoose.connection.readyState = originalReadyState;
    });

    test('should correctly identify active connection', () => {
      const originalReadyState = mongoose.connection.readyState;
      
      // Test connected state
      mongoose.connection.readyState = 1;
      databaseConnection.isConnected = true;
      expect(databaseConnection.isConnectionActive()).toBe(true);
      
      // Test disconnected state
      mongoose.connection.readyState = 0;
      databaseConnection.isConnected = false;
      expect(databaseConnection.isConnectionActive()).toBe(false);
      
      // Test connected but internal flag false
      mongoose.connection.readyState = 1;
      databaseConnection.isConnected = false;
      expect(databaseConnection.isConnectionActive()).toBe(false);
      
      // Restore original state
      mongoose.connection.readyState = originalReadyState;
    });
  });

  describe('Connection String Handling', () => {
    test('should throw error when no connection string provided and no environment variable', async () => {
      // Arrange
      const originalEnv = process.env.MONGODB_URI;
      delete process.env.MONGODB_URI;

      try {
        // Act & Assert
        await expect(databaseConnection.connect()).rejects.toThrow(
          'MongoDB connection string is required'
        );
      } finally {
        // Restore original environment
        process.env.MONGODB_URI = originalEnv;
      }
    });

    test('should mask credentials in connection string for logging', () => {
      // Test with credentials
      databaseConnection.connectionString = 'mongodb://user:password@localhost:27017/test';
      const masked = databaseConnection.getMaskedConnectionString();
      expect(masked).toBe('mongodb://*****:*****@localhost:27017/test');
      
      // Test without credentials
      databaseConnection.connectionString = 'mongodb://localhost:27017/test';
      const unmasked = databaseConnection.getMaskedConnectionString();
      expect(unmasked).toBe('mongodb://localhost:27017/test');
      
      // Test with no connection string
      databaseConnection.connectionString = null;
      const noString = databaseConnection.getMaskedConnectionString();
      expect(noString).toBe('No connection string');
    });
  });

  describe('Connection Failure Handling', () => {
    test('should handle connection errors gracefully', async () => {
      // Arrange
      const invalidUri = 'mongodb://invalid-host:99999/test';

      // Act & Assert
      await expect(databaseConnection.connect(invalidUri)).rejects.toThrow(
        'Failed to connect to MongoDB'
      );
      expect(databaseConnection.isConnectionActive()).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'MongoDB connection error:',
        expect.any(String)
      );
    });

    test('should return false when testing connection while disconnected', async () => {
      // Arrange - ensure disconnected state
      databaseConnection.isConnected = false;
      mongoose.connection.readyState = 0;

      // Act
      const testResult = await databaseConnection.testConnection();

      // Assert
      expect(testResult).toBe(false);
    });

    test('should handle disconnect gracefully when not connected', async () => {
      // Arrange - ensure disconnected state
      databaseConnection.isConnected = false;

      // Act & Assert - should not throw
      await expect(databaseConnection.disconnect()).resolves.not.toThrow();
    });
  });

  describe('Error Logging', () => {
    test('should log connection errors with proper format', async () => {
      // Arrange
      const invalidUri = 'mongodb://invalid-host:99999/test';

      // Act
      try {
        await databaseConnection.connect(invalidUri);
      } catch (error) {
        // Expected to fail
      }

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'MongoDB connection error:',
        expect.any(String)
      );
    });

    test('should log test connection failures', async () => {
      // Arrange - simulate connection test failure
      databaseConnection.isConnected = true;
      mongoose.connection.readyState = 1;
      
      // Mock mongoose connection to throw error
      const originalDb = mongoose.connection.db;
      mongoose.connection.db = {
        admin: () => ({
          ping: () => Promise.reject(new Error('Connection lost'))
        })
      };

      // Act
      const result = await databaseConnection.testConnection();

      // Assert
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Database connection test failed:',
        'Connection lost'
      );

      // Restore
      mongoose.connection.db = originalDb;
    });
  });

  describe('Environment Variable Handling', () => {
    test('should use environment variable when no connection string provided', async () => {
      // Arrange
      const originalEnv = process.env.MONGODB_URI;
      const testUri = 'mongodb://test-host:27017/test-db';
      process.env.MONGODB_URI = testUri;

      try {
        // Act - This will fail to connect but should use the env variable
        try {
          await databaseConnection.connect();
        } catch (error) {
          // Expected to fail with test URI
        }

        // Assert - Check that it attempted to use the environment variable
        expect(databaseConnection.connectionString).toBe(testUri);
      } finally {
        // Restore original environment
        process.env.MONGODB_URI = originalEnv;
      }
    });

    test('should prefer provided connection string over environment variable', async () => {
      // Arrange
      const originalEnv = process.env.MONGODB_URI;
      const envUri = 'mongodb://env-host:27017/env-db';
      const providedUri = 'mongodb://provided-host:27017/provided-db';
      process.env.MONGODB_URI = envUri;

      try {
        // Act - This will fail to connect but should use the provided URI
        try {
          await databaseConnection.connect(providedUri);
        } catch (error) {
          // Expected to fail with provided URI
        }

        // Assert - Check that it used the provided URI, not the env variable
        expect(databaseConnection.connectionString).toBe(providedUri);
      } finally {
        // Restore original environment
        process.env.MONGODB_URI = originalEnv;
      }
    });
  });
});