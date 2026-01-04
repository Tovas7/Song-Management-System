const express = require('express');
const { 
  createSong, 
  getAllSongs, 
  updateSong, 
  deleteSong 
} = require('../controllers/songController');

const router = express.Router();

/**
 * @route   GET /api/songs
 * @desc    Get all songs
 * @access  Public
 */
router.get('/', getAllSongs);

/**
 * @route   POST /api/songs
 * @desc    Create a new song
 * @access  Public
 */
router.post('/', createSong);

/**
 * @route   GET /api/songs/filter
 * @desc    Filter songs by genre
 * @access  Public
 */
router.get('/filter', require('../controllers/songController').filterSongs);

/**
 * @route   PUT /api/songs/:id
 * @desc    Update an existing song
 * @access  Public
 */
router.put('/:id', updateSong);

/**
 * @route   DELETE /api/songs/:id
 * @desc    Delete a song
 * @access  Public
 */
router.delete('/:id', deleteSong);

module.exports = router;