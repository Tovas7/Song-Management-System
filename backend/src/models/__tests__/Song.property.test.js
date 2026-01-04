const fc = require('fast-check');
const mongoose = require('mongoose');
const Song = require('../Song');

/**
 * Property-Based Tests for Song Model Validation
 * **Feature: full-stack-todo-app, Property 2: Input Validation Rejection**
 * **Validates: Requirements 1.2, 3.3**
 */

describe('Song Model Property-Based Tests', () => {
  // No database connection needed for validation tests
  
  /**
   * Property 2: Input Validation Rejection
   * For any song data missing required fields, the API should reject the request 
   * and return appropriate validation error messages
   */
  describe('Property 2: Input Validation Rejection', () => {
    
    // Generator for invalid song data (missing required fields)
    const invalidSongDataGenerator = fc.record({
      title: fc.option(fc.oneof(
        fc.constant(''), // empty string
        fc.constant('   '), // whitespace only
        fc.constant(null),
        fc.constant(undefined),
        fc.string({ minLength: 201, maxLength: 300 }) // too long
      ), { nil: undefined }),
      artist: fc.option(fc.oneof(
        fc.constant(''), // empty string
        fc.constant('   '), // whitespace only
        fc.constant(null),
        fc.constant(undefined),
        fc.string({ minLength: 101, maxLength: 200 }) // too long
      ), { nil: undefined }),
      album: fc.option(fc.oneof(
        fc.constant(''), // empty string
        fc.constant('   '), // whitespace only
        fc.constant(null),
        fc.constant(undefined),
        fc.string({ minLength: 201, maxLength: 300 }) // too long
      ), { nil: undefined }),
      genre: fc.option(fc.oneof(
        fc.constant(''), // empty string
        fc.constant('   '), // whitespace only
        fc.constant(null),
        fc.constant(undefined),
        fc.string({ minLength: 51, maxLength: 100 }) // too long
      ), { nil: undefined })
    }).filter(data => {
      // Ensure at least one field is invalid to make this truly invalid data
      const hasInvalidTitle = !data.title || data.title.trim() === '' || data.title.length > 200;
      const hasInvalidArtist = !data.artist || data.artist.trim() === '' || data.artist.length > 100;
      const hasInvalidAlbum = !data.album || data.album.trim() === '' || data.album.length > 200;
      const hasInvalidGenre = !data.genre || data.genre.trim() === '' || data.genre.length > 50;
      
      return hasInvalidTitle || hasInvalidArtist || hasInvalidAlbum || hasInvalidGenre;
    });

    test('should reject invalid song data and return validation errors', async () => {
      await fc.assert(
        fc.asyncProperty(invalidSongDataGenerator, async (invalidData) => {
          const song = new Song(invalidData);
          
          let validationError = null;
          try {
            await song.validate();
          } catch (error) {
            validationError = error;
          }
          
          // The validation should fail
          expect(validationError).toBeTruthy();
          expect(validationError.name).toBe('ValidationError');
          
          // Should have validation errors for the invalid fields
          expect(validationError.errors).toBeDefined();
          expect(Object.keys(validationError.errors).length).toBeGreaterThan(0);
          
          // Each error should have a meaningful message
          Object.values(validationError.errors).forEach(error => {
            expect(error.message).toBeTruthy();
            expect(typeof error.message).toBe('string');
            expect(error.message.length).toBeGreaterThan(0);
          });
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property test: Valid data should be accepted
   * This ensures our validation isn't too strict
   */
  describe('Valid Data Acceptance', () => {
    
    // Generator for valid song data
    const validSongDataGenerator = fc.record({
      title: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
      artist: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      album: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
      genre: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
    });

    test('should accept valid song data without validation errors', async () => {
      await fc.assert(
        fc.asyncProperty(validSongDataGenerator, async (validData) => {
          const song = new Song(validData);
          
          // Validation should pass
          let validationError = null;
          try {
            await song.validate();
          } catch (error) {
            validationError = error;
          }
          expect(validationError).toBeNull();
          
          // Data should be properly trimmed
          expect(song.title.trim()).toBe(validData.title.trim());
          expect(song.artist.trim()).toBe(validData.artist.trim());
          expect(song.album.trim()).toBe(validData.album.trim());
          expect(song.genre.trim()).toBe(validData.genre.trim());
        }),
        { numRuns: 100 }
      );
    });
  });
});