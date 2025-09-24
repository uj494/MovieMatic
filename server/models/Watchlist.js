import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['want_to_watch', 'watching', 'watched'],
    default: 'want_to_watch'
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  notes: {
    type: String,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure a user can only add a movie to watchlist once
watchlistSchema.index({ user: 1, movie: 1 }, { unique: true });

// Add virtual for movie details population
watchlistSchema.virtual('movieDetails', {
  ref: 'Movie',
  localField: 'movie',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
watchlistSchema.set('toJSON', { virtuals: true });

export const Watchlist = mongoose.model('Watchlist', watchlistSchema, 'watchlists');
