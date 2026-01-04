// Test setup file for backend
const mongoose = require('mongoose');

// Setup test database connection
beforeAll(async () => {
  // Test database connection will be configured in subsequent tasks
});

afterAll(async () => {
  // Cleanup test database connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Global test timeout
jest.setTimeout(10000);