import mongoose from 'mongoose';

const streamingServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  baseUrl: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String, // URL or path to icon
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const StreamingService = mongoose.model('StreamingService', streamingServiceSchema, 'streaming_services');
