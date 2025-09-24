import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/reviews/movie/:movieId - Get all reviews for a specific movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      movie: req.params.movieId,
      isActive: true 
    })
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// GET /api/reviews/user/:userId - Get all reviews by a specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Only allow users to see their own reviews
    if (req.user._id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const reviews = await Review.find({ 
      user: req.params.userId,
      isActive: true 
    })
    .populate('movie', 'title portraitImage')
    .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Error fetching user reviews' });
  }
});

// GET /api/reviews/movie/:movieId/user/:userId - Get user's review for a specific movie
router.get('/movie/:movieId/user/:userId', auth, async (req, res) => {
  try {
    // Only allow users to see their own review
    if (req.user._id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const review = await Review.findOne({ 
      movie: req.params.movieId,
      user: req.params.userId,
      isActive: true 
    })
    .populate('user', 'firstName lastName email');

    res.json(review);
  } catch (error) {
    console.error('Error fetching user review:', error);
    res.status(500).json({ message: 'Error fetching user review' });
  }
});

// POST /api/reviews - Create a new review
router.post('/', auth, async (req, res) => {
  try {
    const { movieId, rating, reviewText } = req.body;

    // Validate required fields
    if (!movieId || !rating || !reviewText) {
      return res.status(400).json({ message: 'Movie ID, rating, and review text are required' });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user already has a review for this movie
    const existingReview = await Review.findOne({
      movie: movieId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    // Create new review
    const review = new Review({
      user: req.user._id,
      movie: movieId,
      rating,
      reviewText
    });

    await review.save();
    await review.populate('user', 'firstName lastName email');

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'You have already reviewed this movie' });
    } else {
      res.status(500).json({ message: 'Error creating review' });
    }
  }
});

// PUT /api/reviews/:reviewId - Update a review
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { rating, reviewText } = req.body;

    // Validate required fields
    if (!rating || !reviewText) {
      return res.status(400).json({ message: 'Rating and review text are required' });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Find review and check ownership
    const review = await Review.findOne({
      _id: req.params.reviewId,
      user: req.user._id,
      isActive: true
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or access denied' });
    }

    // Update review
    review.rating = rating;
    review.reviewText = reviewText;
    await review.save();
    await review.populate('user', 'firstName lastName email');

    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
});

// DELETE /api/reviews/:reviewId - Delete a review (soft delete)
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    // Find review and check ownership
    const review = await Review.findOne({
      _id: req.params.reviewId,
      user: req.user._id,
      isActive: true
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or access denied' });
    }

    // Soft delete
    review.isActive = false;
    await review.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

// GET /api/reviews/movie/:movieId/stats - Get review statistics for a movie
router.get('/movie/:movieId/stats', async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $match: {
          movie: new mongoose.Types.ObjectId(req.params.movieId),
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const result = stats[0];
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result.ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    res.json({
      averageRating: Math.round(result.averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: result.totalReviews,
      ratingDistribution: distribution
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ message: 'Error fetching review statistics' });
  }
});

export default router;
