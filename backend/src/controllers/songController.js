const Song = require('../models/Song');
const Joi = require('joi');

/**
 * Validation schema for song data
 */
const songValidationSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Song title is required',
    'string.min': 'Song title cannot be empty',
    'string.max': 'Song title cannot exceed 200 characters',
    'any.required': 'Song title is required'
  }),
  artist: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Artist name is required',
    'string.min': 'Artist name cannot be empty',
    'string.max': 'Artist name cannot exceed 100 characters',
    'any.required': 'Artist name is required'
  }),
  album: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Album name is required',
    'string.min': 'Album name cannot be empty',
    'string.max': 'Album name cannot exceed 200 characters',
    'any.required': 'Album name is required'
  }),
  genre: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Genre is required',
    'string.min': 'Genre cannot be empty',
    'string.max': 'Genre cannot exceed 50 characters',
    'any.required': 'Genre is required'
  })
});

/**
 * Create a new song
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createSong = async (req, res) => {
  try {
    // Validate input data
    const { error, value } = songValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.details.map(detail => ({
            field: detail.path[0],
            message: detail.message
          }))
        }
      });
    }

    // Create new song
    const song = new Song(value);
    const savedSong = await song.save();

    res.status(201).json({
      success: true,
      data: savedSong,
      message: 'Song created successfully'
    });
  } catch (error) {
    console.error('Error creating song:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create song',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Get all songs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: songs,
      count: songs.length,
      message: songs.length === 0 ? 'No songs found' : 'Songs retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving songs:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve songs',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Update an existing song
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateSong = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate song ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid song ID format',
          code: 'INVALID_ID'
        }
      });
    }

    // Validate input data
    const { error, value } = songValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.details.map(detail => ({
            field: detail.path[0],
            message: detail.message
          }))
        }
      });
    }

    // Update song
    const updatedSong = await Song.findByIdAndUpdate(
      id,
      value,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    );

    if (!updatedSong) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Song not found',
          code: 'SONG_NOT_FOUND'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: updatedSong,
      message: 'Song updated successfully'
    });
  } catch (error) {
    console.error('Error updating song:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update song',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Delete a song
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate song ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid song ID format',
          code: 'INVALID_ID'
        }
      });
    }

    // Delete song
    const deletedSong = await Song.findByIdAndDelete(id);

    if (!deletedSong) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Song not found',
          code: 'SONG_NOT_FOUND'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: deletedSong,
      message: 'Song deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting song:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete song',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Filter songs by genre
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const filterSongs = async (req, res) => {
  try {
    const { genre } = req.query;

    if (!genre) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Genre query parameter is required',
          code: 'MISSING_PARAMETER'
        }
      });
    }

    const songs = await Song.find({ genre: genre }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: songs,
      count: songs.length,
      message: songs.length === 0 ? `No songs found for genre: ${genre}` : `Songs filtered by genre: ${genre}`
    });
  } catch (error) {
    console.error('Error filtering songs:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to filter songs',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

module.exports = {
  createSong,
  getAllSongs,
  updateSong,
  deleteSong,
  filterSongs
};