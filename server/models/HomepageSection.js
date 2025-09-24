import mongoose from 'mongoose';

const homepageSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  movieIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export const HomepageSection = mongoose.model('HomepageSection', homepageSectionSchema, 'homepage_sections');
