import express from 'express';
import { Watchlist } from '../models/Watchlist.js';
import { Movie } from '../models/Movie.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's watchlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = { user: userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const watchlist = await Watchlist.find(query)
      .populate('movie', 'title director releaseYear duration rating genre portraitImage landscapeImage description')
      .sort({ addedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Watchlist.countDocuments(query);

    res.json({
      watchlist,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ 
      message: 'Error fetching watchlist', 
      error: error.message 
    });
  }
});

// Add movie to watchlist
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { movieId, status = 'want_to_watch' } = req.body;
    const userId = req.user._id;

    if (!movieId) {
      return res.status(400).json({ 
        message: 'Movie ID is required',
        code: 'MISSING_MOVIE_ID'
      });
    }

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ 
        message: 'Movie not found',
        code: 'MOVIE_NOT_FOUND'
      });
    }

    // Check if already in watchlist
    const existingItem = await Watchlist.findOne({ 
      user: userId, 
      movie: movieId 
    });

    if (existingItem) {
      return res.status(409).json({ 
        message: 'Movie already in watchlist',
        code: 'ALREADY_IN_WATCHLIST'
      });
    }

    // Add to watchlist
    const watchlistItem = new Watchlist({
      user: userId,
      movie: movieId,
      status
    });

    await watchlistItem.save();
    await watchlistItem.populate('movie', 'title director releaseYear duration rating genre portraitImage landscapeImage description');

    res.status(201).json({
      message: 'Movie added to watchlist successfully',
      watchlistItem
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ 
      message: 'Error adding to watchlist', 
      error: error.message 
    });
  }
});

// Remove movie from watchlist
router.delete('/remove/:movieId', authenticateToken, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user._id;

    const watchlistItem = await Watchlist.findOneAndDelete({ 
      user: userId, 
      movie: movieId 
    });

    if (!watchlistItem) {
      return res.status(404).json({ 
        message: 'Movie not found in watchlist',
        code: 'NOT_IN_WATCHLIST'
      });
    }

    res.json({
      message: 'Movie removed from watchlist successfully'
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ 
      message: 'Error removing from watchlist', 
      error: error.message 
    });
  }
});

// Update watchlist item (status, rating, notes)
router.put('/update/:movieId', authenticateToken, async (req, res) => {
  try {
    const { movieId } = req.params;
    const { status, rating, notes } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (status) updateData.status = status;
    if (rating !== undefined) updateData.rating = rating;
    if (notes !== undefined) updateData.notes = notes;

    const watchlistItem = await Watchlist.findOneAndUpdate(
      { user: userId, movie: movieId },
      updateData,
      { new: true, runValidators: true }
    ).populate('movie', 'title director releaseYear duration rating genre portraitImage landscapeImage description');

    if (!watchlistItem) {
      return res.status(404).json({ 
        message: 'Movie not found in watchlist',
        code: 'NOT_IN_WATCHLIST'
      });
    }

    res.json({
      message: 'Watchlist item updated successfully',
      watchlistItem
    });
  } catch (error) {
    console.error('Error updating watchlist:', error);
    res.status(500).json({ 
      message: 'Error updating watchlist', 
      error: error.message 
    });
  }
});

// Check if movie is in user's watchlist
router.get('/check/:movieId', authenticateToken, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user._id;

    const watchlistItem = await Watchlist.findOne({ 
      user: userId, 
      movie: movieId 
    }).populate('movie', 'title director releaseYear duration rating genre portraitImage landscapeImage description');

    res.json({
      inWatchlist: !!watchlistItem,
      watchlistItem: watchlistItem || null
    });
  } catch (error) {
    console.error('Error checking watchlist:', error);
    res.status(500).json({ 
      message: 'Error checking watchlist', 
      error: error.message 
    });
  }
});

// Get watchlist statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Watchlist.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Watchlist.countDocuments({ user: userId });

    res.json({
      total,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching watchlist stats:', error);
    res.status(500).json({ 
      message: 'Error fetching watchlist stats', 
      error: error.message 
    });
  }
});

export default router;
