const Song = require('../models/Song');

/**
 * Get comprehensive statistics about the music library
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStatistics = async (req, res) => {
  try {
    // Aggregation pipeline to calculate all statistics in one go
    const stats = await Song.aggregate([
      {
        $facet: {
          // Total counts
          totalSongs: [{ $count: "count" }],
          totalArtists: [{ $group: { _id: "$artist" } }, { $count: "count" }],
          totalAlbums: [{ $group: { _id: "$album" } }, { $count: "count" }],
          totalGenres: [{ $group: { _id: "$genre" } }, { $count: "count" }],
          
          // Grouped statistics
          songsByGenre: [
            { $group: { _id: "$genre", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          songsByArtist: [
            { $group: { _id: "$artist", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          albumsByArtist: [
             { $group: { _id: { artist: "$artist", album: "$album" } } },
             { $group: { _id: "$_id.artist", count: { $sum: 1 } } },
             { $sort: { count: -1 } }
          ],
          songsByAlbum: [
            { $group: { _id: "$album", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]
        }
      }
    ]);

    // Format the result
    const result = stats[0];
    
    // Helper to convert array of objects to map
    const toMap = (arr) => arr.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {});

    const formattedStats = {
      totalSongs: result.totalSongs[0]?.count || 0,
      totalArtists: result.totalArtists[0]?.count || 0,
      totalAlbums: result.totalAlbums[0]?.count || 0,
      totalGenres: result.totalGenres[0]?.count || 0,
      songsByGenre: toMap(result.songsByGenre),
      songsByArtist: toMap(result.songsByArtist),
      albumsByArtist: toMap(result.albumsByArtist),
      songsByAlbum: toMap(result.songsByAlbum)
    };

    res.status(200).json({
      success: true,
      data: formattedStats,
      message: 'Statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve statistics',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

module.exports = {
  getStatistics
};
