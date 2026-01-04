const fc = require('fast-check');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const Song = require('../../models/Song');

/**
 * Property-Based Tests for Song Controller
 * **Feature: full-stack-todo-app, Property 1: Song Creation Persistence**
 * **Validates: Requirements 1.1, 1.3**
 */

describe('Song Controller Property-Based Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await Song.deleteMany({});
  });

  // Generator for valid song data
  const validSongDataGenerator = fc.record({
    title: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
    artist: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    album: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
    genre: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
  });

  /**
   * Property 1: Song Creation Persistence
   * For any valid song data (title, artist, album, genre), when submitted to the API, 
   * the song should be successfully stored in the database with a unique identifier and timestamp
   */
  describe('Property 1: Song Creation Persistence', () => {
    
    test('should persist valid song data with unique identifier and timestamp', async () => {
      await fc.assert(
        fc.asyncProperty(validSongDataGenerator, async (songData) => {
          // Submit song data to API
          const response = await request(app)
            .post('/api/songs')
            .send(songData)
            .expect(201);

          // Verify API response structure
          expect(response.body.success).toBe(true);
          expect(response.body.data).toBeDefined();
          expect(response.body.message).toBe('Song created successfully');

          const createdSong = response.body.data;

          // Verify the song has a unique identifier
          expect(createdSong._id).toBeDefined();
          expect(typeof createdSong._id).toBe('string');
          expect(createdSong._id.length).toBe(24); // MongoDB ObjectId length

          // Verify timestamps are present
          expect(createdSong.createdAt).toBeDefined();
          expect(createdSong.updatedAt).toBeDefined();
          expect(new Date(createdSong.createdAt)).toBeInstanceOf(Date);
          expect(new Date(createdSong.updatedAt)).toBeInstanceOf(Date);

          // Verify the song data matches input (trimmed)
          expect(createdSong.title).toBe(songData.title.trim());
          expect(createdSong.artist).toBe(songData.artist.trim());
          expect(createdSong.album).toBe(songData.album.trim());
          expect(createdSong.genre).toBe(songData.genre.trim());

          // Verify the song is actually stored in the database
          const storedSong = await Song.findById(createdSong._id);
          expect(storedSong).toBeTruthy();
          expect(storedSong.title).toBe(songData.title.trim());
          expect(storedSong.artist).toBe(songData.artist.trim());
          expect(storedSong.album).toBe(songData.album.trim());
          expect(storedSong.genre).toBe(songData.genre.trim());

          // Verify timestamps are consistent
          expect(storedSong.createdAt.toISOString()).toBe(createdSong.createdAt);
          expect(storedSong.updatedAt.toISOString()).toBe(createdSong.updatedAt);
        }),
        { numRuns: 100 }
      );
    });

    test('should generate unique identifiers for different songs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(validSongDataGenerator, { minLength: 2, maxLength: 5 }),
          async (songsData) => {
            // Clear database before this property test run
            await Song.deleteMany({});
            
            const createdSongs = [];

            // Create multiple songs
            for (const songData of songsData) {
              const response = await request(app)
                .post('/api/songs')
                .send(songData)
                .expect(201);

              createdSongs.push(response.body.data);
            }

            // Verify all songs have unique identifiers
            const ids = createdSongs.map(song => song._id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);

            // Verify all songs are stored in database
            const storedSongs = await Song.find({});
            expect(storedSongs.length).toBe(songsData.length);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 3: API Response Completeness
   * For any successful song creation or update, the API response should contain 
   * all song properties including the assigned ID and timestamps
   */
  describe('Property 3: API Response Completeness', () => {
    
    test('should return complete song data in creation response', async () => {
      await fc.assert(
        fc.asyncProperty(validSongDataGenerator, async (songData) => {
          // Create song via API
          const response = await request(app)
            .post('/api/songs')
            .send(songData)
            .expect(201);

          // Verify response structure
          expect(response.body.success).toBe(true);
          expect(response.body.data).toBeDefined();
          expect(response.body.message).toBe('Song created successfully');

          const returnedSong = response.body.data;

          // Verify all required properties are present
          expect(returnedSong._id).toBeDefined();
          expect(typeof returnedSong._id).toBe('string');
          expect(returnedSong._id.length).toBe(24); // MongoDB ObjectId

          expect(returnedSong.title).toBeDefined();
          expect(typeof returnedSong.title).toBe('string');
          expect(returnedSong.title).toBe(songData.title.trim());

          expect(returnedSong.artist).toBeDefined();
          expect(typeof returnedSong.artist).toBe('string');
          expect(returnedSong.artist).toBe(songData.artist.trim());

          expect(returnedSong.album).toBeDefined();
          expect(typeof returnedSong.album).toBe('string');
          expect(returnedSong.album).toBe(songData.album.trim());

          expect(returnedSong.genre).toBeDefined();
          expect(typeof returnedSong.genre).toBe('string');
          expect(returnedSong.genre).toBe(songData.genre.trim());

          // Verify timestamps are present and valid
          expect(returnedSong.createdAt).toBeDefined();
          expect(returnedSong.updatedAt).toBeDefined();
          expect(new Date(returnedSong.createdAt)).toBeInstanceOf(Date);
          expect(new Date(returnedSong.updatedAt)).toBeInstanceOf(Date);
          expect(new Date(returnedSong.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
          expect(new Date(returnedSong.updatedAt).getTime()).toBeLessThanOrEqual(Date.now());
        }),
        { numRuns: 100 }
      );
    });

    test('should return complete song data in update response', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(validSongDataGenerator, validSongDataGenerator),
          async ([initialData, updateData]) => {
            // Create initial song
            const createResponse = await request(app)
              .post('/api/songs')
              .send(initialData)
              .expect(201);

            const songId = createResponse.body.data._id;

            // Update the song
            const updateResponse = await request(app)
              .put(`/api/songs/${songId}`)
              .send(updateData)
              .expect(200);

            // Verify response structure
            expect(updateResponse.body.success).toBe(true);
            expect(updateResponse.body.data).toBeDefined();
            expect(updateResponse.body.message).toBe('Song updated successfully');

            const returnedSong = updateResponse.body.data;

            // Verify all required properties are present
            expect(returnedSong._id).toBeDefined();
            expect(typeof returnedSong._id).toBe('string');
            expect(returnedSong._id).toBe(songId);

            expect(returnedSong.title).toBeDefined();
            expect(typeof returnedSong.title).toBe('string');
            expect(returnedSong.title).toBe(updateData.title.trim());

            expect(returnedSong.artist).toBeDefined();
            expect(typeof returnedSong.artist).toBe('string');
            expect(returnedSong.artist).toBe(updateData.artist.trim());

            expect(returnedSong.album).toBeDefined();
            expect(typeof returnedSong.album).toBe('string');
            expect(returnedSong.album).toBe(updateData.album.trim());

            expect(returnedSong.genre).toBeDefined();
            expect(typeof returnedSong.genre).toBe('string');
            expect(returnedSong.genre).toBe(updateData.genre.trim());

            // Verify timestamps are present and valid
            expect(returnedSong.createdAt).toBeDefined();
            expect(returnedSong.updatedAt).toBeDefined();
            expect(new Date(returnedSong.createdAt)).toBeInstanceOf(Date);
            expect(new Date(returnedSong.updatedAt)).toBeInstanceOf(Date);
            
            // Updated timestamp should be >= created timestamp
            expect(new Date(returnedSong.updatedAt).getTime())
              .toBeGreaterThanOrEqual(new Date(returnedSong.createdAt).getTime());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Complete Data Retrieval
   * For any request to retrieve songs, the API should return all songs 
   * currently stored in the database in JSON format
   */
  describe('Property 5: Complete Data Retrieval', () => {
    
    test('should return all songs stored in database', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(validSongDataGenerator, { minLength: 0, maxLength: 10 }),
          async (songsData) => {
            // Clear database and create songs
            await Song.deleteMany({});
            
            const createdSongs = [];
            for (const songData of songsData) {
              const response = await request(app)
                .post('/api/songs')
                .send(songData)
                .expect(201);
              createdSongs.push(response.body.data);
            }

            // Retrieve all songs via API
            const response = await request(app)
              .get('/api/songs')
              .expect(200);

            // Verify response structure
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.count).toBe(songsData.length);

            const retrievedSongs = response.body.data;

            // Verify count matches
            expect(retrievedSongs.length).toBe(songsData.length);

            // Verify all created songs are returned
            const createdIds = new Set(createdSongs.map(song => song._id));
            const retrievedIds = new Set(retrievedSongs.map(song => song._id));
            expect(retrievedIds).toEqual(createdIds);

            // Verify each song has all required properties in JSON format
            retrievedSongs.forEach(song => {
              expect(song._id).toBeDefined();
              expect(typeof song._id).toBe('string');
              expect(song.title).toBeDefined();
              expect(typeof song.title).toBe('string');
              expect(song.artist).toBeDefined();
              expect(typeof song.artist).toBe('string');
              expect(song.album).toBeDefined();
              expect(typeof song.album).toBe('string');
              expect(song.genre).toBeDefined();
              expect(typeof song.genre).toBe('string');
              expect(song.createdAt).toBeDefined();
              expect(typeof song.createdAt).toBe('string');
              expect(song.updatedAt).toBeDefined();
              expect(typeof song.updatedAt).toBe('string');
            });

            // Verify data integrity - each retrieved song matches a created song
            retrievedSongs.forEach(retrievedSong => {
              const matchingCreated = createdSongs.find(created => created._id === retrievedSong._id);
              expect(matchingCreated).toBeDefined();
              expect(retrievedSong.title).toBe(matchingCreated.title);
              expect(retrievedSong.artist).toBe(matchingCreated.artist);
              expect(retrievedSong.album).toBe(matchingCreated.album);
              expect(retrievedSong.genre).toBe(matchingCreated.genre);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should return empty array when no songs exist', async () => {
      // Clear database
      await Song.deleteMany({});

      // Retrieve songs from empty database
      const response = await request(app)
        .get('/api/songs')
        .expect(200);

      // Verify response structure
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
      expect(response.body.count).toBe(0);
      expect(response.body.message).toBe('No songs found');
    });

    test('should return songs in consistent JSON format across multiple requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(validSongDataGenerator, { minLength: 1, maxLength: 5 }),
          async (songsData) => {
            // Clear database and create songs
            await Song.deleteMany({});
            
            for (const songData of songsData) {
              await request(app)
                .post('/api/songs')
                .send(songData)
                .expect(201);
            }

            // Make multiple requests and verify consistency
            const responses = [];
            for (let i = 0; i < 3; i++) {
              const response = await request(app)
                .get('/api/songs')
                .expect(200);
              responses.push(response.body);
            }

            // Verify all responses are identical
            const firstResponse = responses[0];
            responses.forEach(response => {
              expect(response.success).toBe(firstResponse.success);
              expect(response.count).toBe(firstResponse.count);
              expect(response.data.length).toBe(firstResponse.data.length);
              
              // Verify songs are in same order and have same data
              response.data.forEach((song, index) => {
                const firstSong = firstResponse.data[index];
                expect(song._id).toBe(firstSong._id);
                expect(song.title).toBe(firstSong.title);
                expect(song.artist).toBe(firstSong.artist);
                expect(song.album).toBe(firstSong.album);
                expect(song.genre).toBe(firstSong.genre);
                expect(song.createdAt).toBe(firstSong.createdAt);
                expect(song.updatedAt).toBe(firstSong.updatedAt);
              });
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 8: Update Persistence
   * For any valid song update, the changes should be persisted to the database 
   * and reflected in subsequent retrievals
   */
  describe('Property 8: Update Persistence', () => {
    
    test('should persist song updates to database and reflect in retrievals', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(validSongDataGenerator, validSongDataGenerator),
          async ([initialData, updateData]) => {
            // Clear database and create initial song
            await Song.deleteMany({});
            
            const createResponse = await request(app)
              .post('/api/songs')
              .send(initialData)
              .expect(201);

            const songId = createResponse.body.data._id;
            const originalCreatedAt = createResponse.body.data.createdAt;

            // Update the song
            const updateResponse = await request(app)
              .put(`/api/songs/${songId}`)
              .send(updateData)
              .expect(200);

            // Verify update response
            expect(updateResponse.body.success).toBe(true);
            expect(updateResponse.body.data).toBeDefined();
            expect(updateResponse.body.message).toBe('Song updated successfully');

            const updatedSong = updateResponse.body.data;

            // Verify the updated data matches input
            expect(updatedSong._id).toBe(songId);
            expect(updatedSong.title).toBe(updateData.title.trim());
            expect(updatedSong.artist).toBe(updateData.artist.trim());
            expect(updatedSong.album).toBe(updateData.album.trim());
            expect(updatedSong.genre).toBe(updateData.genre.trim());

            // Verify timestamps
            expect(updatedSong.createdAt).toBe(originalCreatedAt); // Should not change
            expect(updatedSong.updatedAt).toBeDefined();
            expect(new Date(updatedSong.updatedAt).getTime())
              .toBeGreaterThanOrEqual(new Date(originalCreatedAt).getTime());

            // Verify changes are persisted in database
            const storedSong = await Song.findById(songId);
            expect(storedSong).toBeTruthy();
            expect(storedSong.title).toBe(updateData.title.trim());
            expect(storedSong.artist).toBe(updateData.artist.trim());
            expect(storedSong.album).toBe(updateData.album.trim());
            expect(storedSong.genre).toBe(updateData.genre.trim());

            // Verify changes are reflected in subsequent API retrievals
            const retrieveResponse = await request(app)
              .get('/api/songs')
              .expect(200);

            const retrievedSongs = retrieveResponse.body.data;
            expect(retrievedSongs.length).toBe(1);
            
            const retrievedSong = retrievedSongs[0];
            expect(retrievedSong._id).toBe(songId);
            expect(retrievedSong.title).toBe(updateData.title.trim());
            expect(retrievedSong.artist).toBe(updateData.artist.trim());
            expect(retrievedSong.album).toBe(updateData.album.trim());
            expect(retrievedSong.genre).toBe(updateData.genre.trim());
            expect(retrievedSong.createdAt).toBe(originalCreatedAt);
            expect(retrievedSong.updatedAt).toBe(updatedSong.updatedAt);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle multiple updates correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(
            validSongDataGenerator,
            fc.array(validSongDataGenerator, { minLength: 2, maxLength: 5 })
          ),
          async ([initialData, updateSequence]) => {
            // Clear database and create initial song
            await Song.deleteMany({});
            
            const createResponse = await request(app)
              .post('/api/songs')
              .send(initialData)
              .expect(201);

            const songId = createResponse.body.data._id;
            let lastUpdatedAt = createResponse.body.data.updatedAt;

            // Apply updates sequentially
            for (const updateData of updateSequence) {
              const updateResponse = await request(app)
                .put(`/api/songs/${songId}`)
                .send(updateData)
                .expect(200);

              const updatedSong = updateResponse.body.data;

              // Verify each update is applied correctly
              expect(updatedSong._id).toBe(songId);
              expect(updatedSong.title).toBe(updateData.title.trim());
              expect(updatedSong.artist).toBe(updateData.artist.trim());
              expect(updatedSong.album).toBe(updateData.album.trim());
              expect(updatedSong.genre).toBe(updateData.genre.trim());

              // Verify updatedAt timestamp progresses
              expect(new Date(updatedSong.updatedAt).getTime())
                .toBeGreaterThanOrEqual(new Date(lastUpdatedAt).getTime());

              lastUpdatedAt = updatedSong.updatedAt;
            }

            // Verify final state is persisted correctly
            const finalData = updateSequence[updateSequence.length - 1];
            const storedSong = await Song.findById(songId);
            expect(storedSong.title).toBe(finalData.title.trim());
            expect(storedSong.artist).toBe(finalData.artist.trim());
            expect(storedSong.album).toBe(finalData.album.trim());
            expect(storedSong.genre).toBe(finalData.genre.trim());
          }
        ),
        { numRuns: 50 }
      );
    });

    test('should reject updates to non-existent songs', async () => {
      await fc.assert(
        fc.asyncProperty(validSongDataGenerator, async (updateData) => {
          // Clear database
          await Song.deleteMany({});
          
          // Try to update non-existent song
          const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
          const response = await request(app)
            .put(`/api/songs/${fakeId}`)
            .send(updateData)
            .expect(404);

          // Verify error response
          expect(response.body.success).toBe(false);
          expect(response.body.error).toBeDefined();
          expect(response.body.error.message).toBe('Song not found');
          expect(response.body.error.code).toBe('SONG_NOT_FOUND');
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 10: Delete Operation Completeness
   * For any song deletion request, the song should be completely removed from the database 
   * and no longer appear in retrievals
   */
  describe('Property 10: Delete Operation Completeness', () => {
    
    test('should completely remove song from database and subsequent retrievals', async () => {
      await fc.assert(
        fc.asyncProperty(validSongDataGenerator, async (songData) => {
          // Clear database and create song
          await Song.deleteMany({});
          
          const createResponse = await request(app)
            .post('/api/songs')
            .send(songData)
            .expect(201);

          const songId = createResponse.body.data._id;

          // Verify song exists before deletion
          const beforeDelete = await Song.findById(songId);
          expect(beforeDelete).toBeTruthy();

          // Delete the song
          const deleteResponse = await request(app)
            .delete(`/api/songs/${songId}`)
            .expect(200);

          // Verify delete response
          expect(deleteResponse.body.success).toBe(true);
          expect(deleteResponse.body.data).toBeDefined();
          expect(deleteResponse.body.message).toBe('Song deleted successfully');
          expect(deleteResponse.body.data._id).toBe(songId);

          // Verify song is completely removed from database
          const afterDelete = await Song.findById(songId);
          expect(afterDelete).toBeNull();

          // Verify song no longer appears in retrievals
          const retrieveResponse = await request(app)
            .get('/api/songs')
            .expect(200);

          expect(retrieveResponse.body.data).toEqual([]);
          expect(retrieveResponse.body.count).toBe(0);
          expect(retrieveResponse.body.message).toBe('No songs found');

          // Verify database is actually empty
          const allSongs = await Song.find({});
          expect(allSongs.length).toBe(0);
        }),
        { numRuns: 100 }
      );
    });

    test('should handle deletion from collection with multiple songs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(validSongDataGenerator, { minLength: 2, maxLength: 5 }),
          async (songsData) => {
            // Clear database and create multiple songs
            await Song.deleteMany({});
            
            const createdSongs = [];
            for (const songData of songsData) {
              const response = await request(app)
                .post('/api/songs')
                .send(songData)
                .expect(201);
              createdSongs.push(response.body.data);
            }

            // Pick a random song to delete
            const songToDelete = createdSongs[Math.floor(Math.random() * createdSongs.length)];
            const remainingSongs = createdSongs.filter(song => song._id !== songToDelete._id);

            // Delete the selected song
            const deleteResponse = await request(app)
              .delete(`/api/songs/${songToDelete._id}`)
              .expect(200);

            // Verify delete response
            expect(deleteResponse.body.success).toBe(true);
            expect(deleteResponse.body.data._id).toBe(songToDelete._id);

            // Verify deleted song is removed from database
            const deletedSong = await Song.findById(songToDelete._id);
            expect(deletedSong).toBeNull();

            // Verify remaining songs are still present
            const retrieveResponse = await request(app)
              .get('/api/songs')
              .expect(200);

            expect(retrieveResponse.body.data.length).toBe(remainingSongs.length);
            expect(retrieveResponse.body.count).toBe(remainingSongs.length);

            // Verify each remaining song is still present
            const retrievedIds = new Set(retrieveResponse.body.data.map(song => song._id));
            remainingSongs.forEach(song => {
              expect(retrievedIds.has(song._id)).toBe(true);
            });

            // Verify deleted song is not in the results
            expect(retrievedIds.has(songToDelete._id)).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('should return appropriate error for non-existent song deletion', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          // Clear database
          await Song.deleteMany({});
          
          // Try to delete non-existent song
          const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
          const response = await request(app)
            .delete(`/api/songs/${fakeId}`)
            .expect(404);

          // Verify error response
          expect(response.body.success).toBe(false);
          expect(response.body.error).toBeDefined();
          expect(response.body.error.message).toBe('Song not found');
          expect(response.body.error.code).toBe('SONG_NOT_FOUND');

          // Verify database remains empty
          const allSongs = await Song.find({});
          expect(allSongs.length).toBe(0);
        }),
        { numRuns: 50 }
      );
    });

    test('should reject deletion with invalid song ID format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }).filter(s => {
            const trimmed = s.trim();
            return trimmed.length > 0 && !trimmed.match(/^[0-9a-fA-F]{24}$/);
          }),
          async (invalidId) => {
            // Try to delete with invalid ID format
            const response = await request(app)
              .delete(`/api/songs/${invalidId}`);

            // Should return either 400 (invalid format) or 404 (route not found)
            // Both indicate proper rejection of the invalid ID
            expect([400, 404]).toContain(response.status);

            // Verify error response structure
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
            
            if (response.status === 400) {
              expect(response.body.error.message).toBe('Invalid song ID format');
              expect(response.body.error.code).toBe('INVALID_ID');
            } else if (response.status === 404) {
              // 404 responses can have different error messages depending on routing
              expect(response.body.error.message).toMatch(/not found|route not found/i);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});