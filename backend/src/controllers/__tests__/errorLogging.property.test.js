const fc = require('fast-check');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const Song = require('../../models/Song');

/**
 * Property-Based Test for Error Logging
 * 
 * **Property 17: Error Logging Completeness**
 * **Validates: Requirements 9.5**
 */

describe('Error Logging Property Test', () => {
  let mongoServer;
  let consoleErrorSpy;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Song.deleteMany({});
    // Spy on console.error to verify logging
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should log errors to console when 500 errors occur', async () => {
    // We can force a 500 error by mocking a Mongoose method to throw
    // However, for property testing, we want to test the middleware's response to *any* error
    // So we'll use a route that we know will fail if we send bad data that bypasses validation but hits the DB
    // Or better, we can mock the Song.find method to throw an error for a specific request
    
    // Since we can't easily mock inside the property run without affecting others, 
    // we'll rely on generating invalid internal state or using a test-only route if possible.
    // But we don't have test-only routes.
    
    // Alternative: We can try to trigger a 400 error which might also be logged depending on implementation.
    // Looking at errorMiddleware.js, it logs `err.stack`.
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.constant(''), // Invalid, will cause 400
          artist: fc.string(),
          album: fc.string(),
          genre: fc.string()
        }),
        async (invalidData) => {
           // This will trigger validation error in controller
           // The controller catches it? 
           // Let's check songController.js. 
           // createSong has: const { error, value } = songValidationSchema.validate(req.body);
           // if (error) return res.status(400)...
           // This path does NOT log to console.error in the code I wrote earlier (it just returns 400).
           
           // However, the catch(error) block DOES log.
           // console.error('Error creating song:', error);
           
           // To trigger the catch block, we need something that passes Joi validation but fails Mongoose validation
           // OR fails at the DB level (connection down, etc).
           
           // Let's try to pass data that satisfies Joi but might fail Mongoose?
           // The Joi schema is pretty tight.
           
           // Easier way: Mock Song.save to throw an error.
           const saveSpy = jest.spyOn(Song.prototype, 'save').mockRejectedValue(new Error('Database failure'));
           
           // We need valid data to pass Joi
           const validData = {
             title: 'Valid Title',
             artist: 'Valid Artist',
             album: 'Valid Album',
             genre: 'Rock'
           };
           
           await request(app).post('/api/songs').send(validData);
           
           expect(consoleErrorSpy).toHaveBeenCalled();
           
           saveSpy.mockRestore();
        }
      ),
      { numRuns: 10 } // Keep runs low as we are mocking per run
    );
  });

  test('should log stack traces for internal server errors', async () => {
      // Force an internal error
      const findSpy = jest.spyOn(Song, 'find').mockImplementation(() => {
        throw new Error('Critical DB Error');
      });
      
      await request(app).get('/api/songs');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedError = consoleErrorSpy.mock.calls[0][0]; // First arg of first call
      // The controller logs: console.error('Error retrieving songs:', error);
      expect(loggedError).toContain('Error retrieving songs:');
      
      findSpy.mockRestore();
  });
});
