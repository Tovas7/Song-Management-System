const mongoose = require('mongoose');

/**
 * Song Schema Definition
 * Defines the structure and validation rules for song documents
 */
const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true,
    maxlength: [200, 'Song title cannot exceed 200 characters'],
    minlength: [1, 'Song title cannot be empty']
  },
  artist: {
    type: String,
    required: [true, 'Artist name is required'],
    trim: true,
    maxlength: [100, 'Artist name cannot exceed 100 characters'],
    minlength: [1, 'Artist name cannot be empty']
  },
  album: {
    type: String,
    required: [true, 'Album name is required'],
    trim: true,
    maxlength: [200, 'Album name cannot exceed 200 characters'],
    minlength: [1, 'Album name cannot be empty']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    maxlength: [50, 'Genre cannot exceed 50 characters'],
    minlength: [1, 'Genre cannot be empty']
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  versionKey: false // Disable __v field
});

/**
 * Schema Indexes
 * Add indexes for better query performance
 */
songSchema.index({ title: 1, artist: 1 }); // Compound index for title and artist
songSchema.index({ genre: 1 }); // Index for genre filtering
songSchema.index({ artist: 1 }); // Index for artist queries
songSchema.index({ album: 1 }); // Index for album queries

/**
 * Schema Methods
 */

/**
 * Instance method to get a formatted display name
 * @returns {string} Formatted song display name
 */
songSchema.methods.getDisplayName = function() {
  return `${this.title} by ${this.artist}`;
};

/**
 * Instance method to get song info as plain object
 * @returns {Object} Song data as plain object
 */
songSchema.methods.toJSON = function() {
  const songObject = this.toObject();
  return {
    _id: songObject._id,
    title: songObject.title,
    artist: songObject.artist,
    album: songObject.album,
    genre: songObject.genre,
    createdAt: songObject.createdAt,
    updatedAt: songObject.updatedAt
  };
};

/**
 * Static Methods
 */

/**
 * Find songs by genre
 * @param {string} genre - Genre to filter by
 * @returns {Promise<Array>} Array of songs matching the genre
 */
songSchema.statics.findByGenre = function(genre) {
  return this.find({ genre: new RegExp(genre, 'i') }).sort({ title: 1 });
};

/**
 * Find songs by artist
 * @param {string} artist - Artist to filter by
 * @returns {Promise<Array>} Array of songs by the artist
 */
songSchema.statics.findByArtist = function(artist) {
  return this.find({ artist: new RegExp(artist, 'i') }).sort({ album: 1, title: 1 });
};

/**
 * Find songs by album
 * @param {string} album - Album to filter by
 * @returns {Promise<Array>} Array of songs from the album
 */
songSchema.statics.findByAlbum = function(album) {
  return this.find({ album: new RegExp(album, 'i') }).sort({ title: 1 });
};

/**
 * Get statistics about songs
 * @returns {Promise<Object>} Statistics object
 */
songSchema.statics.getStatistics = async function() {
  const pipeline = [
    {
      $group: {
        _id: null,
        totalSongs: { $sum: 1 },
        uniqueArtists: { $addToSet: '$artist' },
        uniqueAlbums: { $addToSet: '$album' },
        uniqueGenres: { $addToSet: '$genre' }
      }
    },
    {
      $project: {
        _id: 0,
        totalSongs: 1,
        totalArtists: { $size: '$uniqueArtists' },
        totalAlbums: { $size: '$uniqueAlbums' },
        totalGenres: { $size: '$uniqueGenres' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalSongs: 0,
    totalArtists: 0,
    totalAlbums: 0,
    totalGenres: 0
  };
};

/**
 * Validation Middleware
 */

/**
 * Pre-save middleware to normalize data
 */
songSchema.pre('save', function(next) {
  // Normalize strings: trim whitespace and convert to proper case
  if (this.title) {
    this.title = this.title.trim();
  }
  if (this.artist) {
    this.artist = this.artist.trim();
  }
  if (this.album) {
    this.album = this.album.trim();
  }
  if (this.genre) {
    this.genre = this.genre.trim();
  }
  
  next();
});

/**
 * Pre-validation middleware for additional validation
 */
songSchema.pre('validate', function(next) {
  // Check for empty strings after trimming
  if (this.title && this.title.trim() === '') {
    this.invalidate('title', 'Song title cannot be empty or only whitespace');
  }
  if (this.artist && this.artist.trim() === '') {
    this.invalidate('artist', 'Artist name cannot be empty or only whitespace');
  }
  if (this.album && this.album.trim() === '') {
    this.invalidate('album', 'Album name cannot be empty or only whitespace');
  }
  if (this.genre && this.genre.trim() === '') {
    this.invalidate('genre', 'Genre cannot be empty or only whitespace');
  }
  
  next();
});

/**
 * Create and export the Song model
 */
const Song = mongoose.model('Song', songSchema);

module.exports = Song;