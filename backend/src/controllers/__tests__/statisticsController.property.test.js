const fc = require('fast-check');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const Song = require('../../models/Song');

/**
 * Property-Based Tests for Statistics Controller
 * **Feature: full-stack-todo-app, Property 11: Statistics Accuracy**
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
 * 
 * **Feature: full-stack-todo-app, Property 12: Statistics Real-time Updates**
 * **Validates: Requirements 5.5**
 */

describe('Statistics Controller Property-Based Tests', () => {
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

  describe('Property 11: Statistics Accuracy', () => {
    test('should accurately calculate statistics for any set of songs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(validSongDataGenerator, { minLength: 0, maxLength: 20 }),
          async (songsData) => {
            await Song.deleteMany({});
            
            // Insert songs
            if (songsData.length > 0) {
              await Song.insertMany(songsData);
            }

            // Calculate expected stats manually
            const totalSongs = songsData.length;
            const uniqueArtists = new Set(songsData.map(s => s.artist)).size;
            const uniqueAlbums = new Set(songsData.map(s => s.album)).size;
            const uniqueGenres = new Set(songsData.map(s => s.genre)).size;

            const songsByGenre = {};
            songsData.forEach(s => {
              songsByGenre[s.genre] = (songsByGenre[s.genre] || 0) + 1;
            });

            const songsByArtist = {};
            songsData.forEach(s => {
              songsByArtist[s.artist] = (songsByArtist[s.artist] || 0) + 1;
            });

            const songsByAlbum = {};
            songsData.forEach(s => {
              songsByAlbum[s.album] = (songsByAlbum[s.album] || 0) + 1;
            });
            
            const albumsByArtist = {};
            // Map artist -> Set of albums
            const artistAlbums = {};
            songsData.forEach(s => {
                if (!artistAlbums[s.artist]) artistAlbums[s.artist] = new Set();
                artistAlbums[s.artist].add(s.album);
            });
            Object.keys(artistAlbums).forEach(artist => {
                albumsByArtist[artist] = artistAlbums[artist].size;
            });

            // Get stats from API
            const response = await request(app)
              .get('/api/statistics')
              .expect(200);

            const stats = response.body.data;

            expect(stats.totalSongs).toBe(totalSongs);
            expect(stats.totalArtists).toBe(uniqueArtists);
            expect(stats.totalAlbums).toBe(uniqueAlbums);
            expect(stats.totalGenres).toBe(uniqueGenres);
            
            // Helper to check map equality
            const checkMap = (actual, expected) => {
                const actualKeys = Object.keys(actual);
                const expectedKeys = Object.keys(expected);
                // Sort keys to compare
                expect(actualKeys.sort()).toEqual(expectedKeys.sort());
                actualKeys.forEach(key => {
                    expect(actual[key]).toBe(expected[key]);
                });
            };

            checkMap(stats.songsByGenre, songsByGenre);
            checkMap(stats.songsByArtist, songsByArtist);
            checkMap(stats.songsByAlbum, songsByAlbum);
            checkMap(stats.albumsByArtist, albumsByArtist);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 12: Statistics Real-time Updates', () => {
      test('should update statistics immediately after adding a song', async () => {
          await fc.assert(
              fc.asyncProperty(
                  fc.array(validSongDataGenerator, { minLength: 0, maxLength: 5 }),
                  validSongDataGenerator,
                  async (initialSongs, newSong) => {
                      await Song.deleteMany({});
                      if (initialSongs.length > 0) await Song.insertMany(initialSongs);
                      
                      const initialStatsRes = await request(app).get('/api/statistics');
                      const initialStats = initialStatsRes.body.data;
                      
                      // Add new song via API to simulate real usage
                      await request(app).post('/api/songs').send(newSong).expect(201);
                      
                      const updatedStatsRes = await request(app).get('/api/statistics');
                      const updatedStats = updatedStatsRes.body.data;
                      
                      expect(updatedStats.totalSongs).toBe(initialStats.totalSongs + 1);
                      
                      // Check if genre count updated
                      const genreCountBefore = initialStats.songsByGenre[newSong.genre] || 0;
                      const genreCountAfter = updatedStats.songsByGenre[newSong.genre];
                      expect(genreCountAfter).toBe(genreCountBefore + 1);
                  }
              ),
              { numRuns: 50 }
          );
      });

      test('should update statistics immediately after deleting a song', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(validSongDataGenerator, { minLength: 1, maxLength: 5 }),
                async (songs) => {
                    await Song.deleteMany({});
                    const createdSongs = await Song.insertMany(songs);
                    const songToDelete = createdSongs[0];
                    
                    const initialStatsRes = await request(app).get('/api/statistics');
                    const initialStats = initialStatsRes.body.data;
                    
                    await request(app).delete(`/api/songs/${songToDelete._id}`).expect(200);
                    
                    const updatedStatsRes = await request(app).get('/api/statistics');
                    const updatedStats = updatedStatsRes.body.data;
                    
                    expect(updatedStats.totalSongs).toBe(initialStats.totalSongs - 1);
                    
                    const genreCountBefore = initialStats.songsByGenre[songToDelete.genre];
                    const genreCountAfter = updatedStats.songsByGenre[songToDelete.genre] || 0;
                    expect(genreCountAfter).toBe(genreCountBefore - 1);
                }
            ),
            { numRuns: 50 }
        );
      });
  });
});
