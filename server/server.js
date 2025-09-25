import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { Movie } from './models/Movie.js';
import { StreamingService } from './models/StreamingService.js';
import { HomepageSection } from './models/HomepageSection.js';
import authRoutes from './routes/auth.js';
import watchlistRoutes from './routes/watchlist.js';
import streamingServiceRoutes from './routes/streamingServices.js';
import homepageSectionRoutes from './routes/homepageSections.js';
import reviewRoutes from './routes/reviews.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/icons', express.static(path.join(__dirname, 'uploads/icons')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moviematic')
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔌 Connection state:', mongoose.connection.readyState);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', process.env.MONGODB_URI+" "+error);
  });

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Test streaming services endpoint
app.get('/api/test-streaming', async (req, res) => {
  try {
    const services = await StreamingService.find();
    res.json({ 
      message: 'Streaming services test', 
      count: services.length,
      services: services.map(s => ({ name: s.name, baseUrl: s.baseUrl, hasIcon: !!s.icon }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error testing streaming services', error: error.message });
  }
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Watchlist routes
app.use('/api/watchlist', watchlistRoutes);

// Streaming services routes
app.use('/api/streaming-services', streamingServiceRoutes);

// Homepage sections routes
app.use('/api/homepage-sections', homepageSectionRoutes);

// Reviews routes
app.use('/api/reviews', reviewRoutes);

// Get all movies
app.get('/api/movies', async (req, res) => {
  try {
    console.log('📋 Fetching all movies...');
    const movies = await Movie.find().populate('streamingPlatforms.service').sort({ createdAt: -1 });
    console.log(`✅ Found ${movies.length} movies`);
    res.json(movies);
  } catch (error) {
    console.error('❌ Error fetching movies:', error);
    res.status(500).json({ message: 'Error fetching movies', error: error.message });
  }
});

// Get movies by genre
app.get('/api/movies/genre/:genre', async (req, res) => {
  try {
    const movies = await Movie.find({ genre: req.params.genre }).populate('streamingPlatforms.service');
    console.log(`✅ Found ${movies.length} movies for genre: ${req.params.genre}`);
    console.log('🎬 Movies found:', movies.map(m => ({ title: m.title, genre: m.genre })));
    res.json(movies);
  } catch (error) {
    console.error('❌ Error fetching movies by genre:', error);
    res.status(500).json({ message: 'Error fetching movies by genre', error: error.message });
  }
});

// Debug endpoint to check all movies and their genres
app.get('/api/movies/debug/genres', async (req, res) => {
  try {
    const movies = await Movie.find({}).select('title genre');
    console.log('🎬 All movies and their genres:');
    movies.forEach(movie => {
      console.log(`- ${movie.title}: [${movie.genre.join(', ')}]`);
    });
    res.json(movies);
  } catch (error) {
    console.error('❌ Error fetching movies for debug:', error);
    res.status(500).json({ message: 'Error fetching movies for debug', error: error.message });
  }
});

// Get movie of the week
app.get('/api/movies/week/featured', async (req, res) => {
  try {
    console.log('🏆 Fetching movie of the week...');
    const featuredMovie = await Movie.findOne({ movieOfTheWeek: true }).populate('streamingPlatforms.service');
    if (!featuredMovie) {
      return res.status(404).json({ message: 'No movie of the week set' });
    }
    console.log(`✅ Found movie of the week: ${featuredMovie.title}`);
    res.json(featuredMovie);
  } catch (error) {
    console.error('❌ Error fetching movie of the week:', error);
    res.status(500).json({ message: 'Error fetching movie of the week', error: error.message });
  }
});

// Get popular genres
app.get('/api/movies/genres/popular', async (req, res) => {
  try {
    const popularGenres = await Movie.distinct('genre');
    res.json(popularGenres);
  } catch (error) {
    console.error('❌ Error fetching popular genres:', error);
    res.status(500).json({ message: 'Error fetching popular genres', error: error.message });
  }
});

// Search movies
app.get('/api/movies/search', async (req, res) => {
  try {
    const { q, genre, year, rating } = req.query;
    console.log('🔍 Searching movies with filters:', { q, genre, year, rating });
    
    let query = {};
    
    // Text search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { director: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { cast: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Genre filter
    if (genre) {
      query.genre = { $in: [genre] };
      console.log('🎭 Genre search query:', query.genre);
    }
    
    // Year filter
    if (year) {
      query.releaseYear = parseInt(year);
    }
    
    // Rating filter
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }
    
    console.log('🔍 Final query:', JSON.stringify(query, null, 2));
    const movies = await Movie.find(query).populate('streamingPlatforms.service').sort({ createdAt: -1 });
    console.log(`✅ Found ${movies.length} movies matching search criteria`);
    console.log('🎬 Movies found:', movies.map(m => ({ title: m.title, genre: m.genre })));
    res.json(movies);
  } catch (error) {
    console.error('❌ Error searching movies:', error);
    res.status(500).json({ message: 'Error searching movies', error: error.message });
  }
});

// Get single movie
app.get('/api/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('streamingPlatforms.service');
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movie', error: error.message });
  }
});

// Create new movie with image uploads
app.post('/api/movies', upload.fields([
  { name: 'portraitImage', maxCount: 1 },
  { name: 'landscapeImage', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('🎬 Creating new movie...');
    console.log('📁 Files received:', req.files);
    console.log('📝 Body data:', req.body);
    console.log('🎬 Trailer URL:', req.body.trailerUrl);
    console.log('🎬 Streaming Platforms:', req.body.streamingPlatforms);

    const movieData = {
      ...req.body,
      genre: Array.isArray(req.body.genre) ? req.body.genre : [req.body.genre],
      cast: req.body.cast ? req.body.cast.split(',').map(actor => actor.trim()).filter(actor => actor) : [],
      awards: req.body.awards ? req.body.awards.split(',').map(award => award.trim()).filter(award => award) : [],
      budget: req.body.budget ? Number(req.body.budget) : undefined,
      boxOffice: req.body.boxOffice ? Number(req.body.boxOffice) : undefined,
      rating: req.body.rating ? Number(req.body.rating) : 0,
      duration: Number(req.body.duration),
      releaseYear: Number(req.body.releaseYear),
      isReleased: req.body.isReleased === 'true',
      movieOfTheWeek: req.body.movieOfTheWeek === 'true',
      trailerUrl: req.body.trailerUrl || null,
      streamingPlatforms: req.body.streamingPlatforms ? JSON.parse(req.body.streamingPlatforms) : []
    };

    // Handle uploaded images
    if (req.files.portraitImage) {
      movieData.portraitImage = `/uploads/${req.files.portraitImage[0].filename}`;
    }
    if (req.files.landscapeImage) {
      movieData.landscapeImage = `/uploads/${req.files.landscapeImage[0].filename}`;
    }

    const movie = new Movie(movieData);
    const savedMovie = await movie.save();
    
    console.log('✅ Movie created successfully:', savedMovie.title);
    res.status(201).json(savedMovie);
  } catch (error) {
    console.error('❌ Error creating movie:', error);
    res.status(500).json({ message: 'Error creating movie', error: error.message });
  }
});

// Update movie with image uploads
app.put('/api/movies/:id', upload.fields([
  { name: 'portraitImage', maxCount: 1 },
  { name: 'landscapeImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const movieId = req.params.id;
    console.log('🎬 Updating movie...');
    console.log('📝 Body data:', req.body);
    console.log('🎬 Trailer URL:', req.body.trailerUrl);
    console.log('🎬 Streaming Platforms:', req.body.streamingPlatforms);
    
    const updateData = {
      ...req.body,
      genre: Array.isArray(req.body.genre) ? req.body.genre : [req.body.genre],
      cast: req.body.cast ? req.body.cast.split(',').map(actor => actor.trim()).filter(actor => actor) : [],
      awards: req.body.awards ? req.body.awards.split(',').map(award => award.trim()).filter(award => award) : [],
      budget: req.body.budget ? Number(req.body.budget) : undefined,
      boxOffice: req.body.boxOffice ? Number(req.body.boxOffice) : undefined,
      rating: req.body.rating ? Number(req.body.rating) : 0,
      duration: Number(req.body.duration),
      releaseYear: Number(req.body.releaseYear),
      isReleased: req.body.isReleased === 'true',
      movieOfTheWeek: req.body.movieOfTheWeek === 'true',
      trailerUrl: req.body.trailerUrl || null,
      streamingPlatforms: req.body.streamingPlatforms ? JSON.parse(req.body.streamingPlatforms) : []
    };

    // Handle uploaded images
    if (req.files.portraitImage) {
      updateData.portraitImage = `/uploads/${req.files.portraitImage[0].filename}`;
    }
    if (req.files.landscapeImage) {
      updateData.landscapeImage = `/uploads/${req.files.landscapeImage[0].filename}`;
    }

    // If movieOfTheWeek is true, reset the existing movieOfTheWeek
    if (updateData.movieOfTheWeek) {
      await Movie.updateMany(
        { movieOfTheWeek: true, _id: { $ne: movieId } }, // Exclude the current movie
        { $set: { movieOfTheWeek: false } }
      );
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      movieId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(updatedMovie);
  } catch (error) {
    console.error('❌ Error updating movie:', error);
    res.status(500).json({ message: 'Error updating movie', error: error.message });
  }
});

// Delete movie
app.delete('/api/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting movie', error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  res.status(500).json({ message: 'Internal server error', error: error.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Backend URL: http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
});
