import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  director: {
    type: String,
    required: true,
    trim: true
  },
  releaseYear: {
    type: Number,
    required: true,
    min: 1888,
    max: new Date().getFullYear() + 5
  },
  genre: [{
    type: String,
    required: true,
    enum: [
      'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
      'Documentary', 'Drama', 'Family', 'Fantasy', 'Film-Noir', 'History',
      'Horror', 'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi',
      'Sport', 'Thriller', 'War', 'Western'
    ]
  }],
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 600
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  portraitImage: {
    type: String, // This will store the file path
    default: null
  },
  landscapeImage: {
    type: String, // This will store the file path
    default: null
  },
  cast: [{
    type: String,
    trim: true
  }],
  language: {
    type: String,
    default: 'English',
    trim: true
  },
  country: {
    type: String,
    default: 'United States',
    trim: true
  },
  budget: {
    type: Number,
    min: 0
  },
  boxOffice: {
    type: Number,
    min: 0
  },
  awards: [{
    type: String,
    trim: true
  }],
  isReleased: {
    type: Boolean,
    default: true
  },
  movieOfTheWeek: {
    type: Boolean,
    default: false
  },
  trailerUrl: {
    type: String,
    trim: true,
    default: null
  },
  streamingPlatforms: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StreamingService',
      required: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  }]
}, {
  timestamps: true
});

export const Movie = mongoose.model('Movie', movieSchema, 'movie_details');
