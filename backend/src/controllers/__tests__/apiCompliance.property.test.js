const fc = require('fast-check');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const Song = require('../../models/Song');

/**
 * Property-Based Tests for API Compliance and Error Handling
 * 
 * **Property 15: RESTful API Compliance**
 * **Validates: Requirements 7.1, 7.2, 7.3**
 * 
 * **Property 16: JSON Data Format Consistency**
 * **Validates: Requirements 7.4, 7.5**
 * 
 * **Property 9: Error Handling Integrity**
 * **Validates: Requirements 3.5, 4.3, 9.1, 9.2, 9.3, 9.4**
 */

describe('API Compliance Property-Based Tests', () => {
  let mongoServer;

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
  });

  const validSongDataGenerator = fc.record({
    title: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
    artist: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    album: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
    genre: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
  });

  describe('Property 15: RESTful API Compliance', () => {
    test('should use appropriate HTTP methods and status codes', async () => {
      await fc.assert(
        fc.asyncProperty(validSongDataGenerator, async (songData) => {
            // POST -> 201
            const postRes = await request(app).post('/api/songs').send(songData);
            expect(postRes.status).toBe(201);
            
            const id = postRes.body.data._id;
            
            // GET -> 200
            const getRes = await request(app).get('/api/songs');
            expect(getRes.status).toBe(200);
            
            // PUT -> 200
            const putRes = await request(app).put(`/api/songs/${id}`).send(songData);
            expect(putRes.status).toBe(200);
            
            // DELETE -> 200
            const delRes = await request(app).delete(`/api/songs/${id}`);
            expect(delRes.status).toBe(200);
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 16: JSON Data Format Consistency', () => {
      test('should always return valid JSON with success/data/error structure', async () => {
          await fc.assert(
              fc.asyncProperty(validSongDataGenerator, async (songData) => {
                  const res = await request(app).post('/api/songs').send(songData);
                  expect(res.header['content-type']).toMatch(/json/);
                  expect(res.body).toHaveProperty('success');
                  if (res.body.success) {
                      expect(res.body).toHaveProperty('data');
                  } else {
                      expect(res.body).toHaveProperty('error');
                  }
              }),
              { numRuns: 20 }
          );
      });
  });

  describe('Property 9: Error Handling Integrity', () => {
      test('should return structured error for invalid input', async () => {
          await fc.assert(
              fc.asyncProperty(
                  fc.record({
                      title: fc.constant(''), // Invalid
                      artist: fc.string(),
                      album: fc.string(),
                      genre: fc.string()
                  }),
                  async (invalidData) => {
                      const res = await request(app).post('/api/songs').send(invalidData);
                      expect(res.status).toBe(400);
                      expect(res.body.success).toBe(false);
                      expect(res.body.error).toBeDefined();
                      expect(res.body.error.code).toBe('VALIDATION_ERROR');
                  }
              ),
              { numRuns: 20 }
          );
      });
      
      test('should return 404 for non-existent routes', async () => {
          const res = await request(app).get('/api/non-existent');
          expect(res.status).toBe(404);
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
      });
  });
});
