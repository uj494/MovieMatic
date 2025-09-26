import mongoose from 'mongoose';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// TMDB API Configuration
const TMDB_API_KEY = 'fe20a51ad3e8a5576796029de60bbca2';
const TMDB_READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZTIwYTUxYWQzZThhNTU3Njc5NjAyOWRlNjBiYmNhMiIsIm5iZiI6MTY0NjEyOTkxMy4xMjUsInN1YiI6IjYyMWRmMmY5NzcxOWQ3MDA2ZDlkNjYwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NrvuRFqFXpcP3k8lPecKl5_Dxb_f1VnNMkpMc9ZoiEw';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Import the actual Movie model
import { Movie } from './server/models/Movie.js';

// Function to check if movie exists in database
async function movieExists(title, releaseYear) {
  try {
    const existingMovie = await Movie.findOne({ 
      title: { $regex: new RegExp(title, 'i') },
      releaseYear: releaseYear 
      });
    return !!existingMovie;
  } catch (error) {
    console.error('Error checking movie existence:', error);
    return false;
  }
}

// Function to get popular movies from TMDB
async function getPopularMovies() {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`);
     const data = await response.json();
     return data.results.slice(0, 20); // Get first 20 movies
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
}

// Function to get movie details from TMDB
async function getMovieDetails(movieId) {
  try {
    // Fetch movie details and credits in parallel
    const [movieResponse, creditsResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`)
    ]);
    
    const movieData = await movieResponse.json();
    const creditsData = await creditsResponse.json();
    
    // Combine movie details with cast information
    return {
      ...movieData,
      cast: creditsData.cast || [],
      crew: creditsData.crew || []
    };
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    return null;
  }
}

// Function to get movie trailer from TMDB
async function getMovieTrailer(movieId) {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    
    // Find YouTube trailer
    const trailer = data.results.find(video => 
      video.type === 'Trailer' && 
      video.site === 'YouTube' && 
      video.official === true
    );
    
    if (trailer) {
      return `https://www.youtube.com/watch?v=${trailer.key}`;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching trailer for movie ID ${movieId}:`, error);
    return null;
  }
}

// Function to download and save poster image
async function downloadPosterImage(tmdbPosterPath, movieTitle) {
  try {
    if (!tmdbPosterPath) {
      return null;
    }

    const imageUrl = `https://image.tmdb.org/t/p/w500${tmdbPosterPath}`;
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.log(`❌ Could not download poster for "${movieTitle}"`);
      return null;
    }

    // Create a safe filename from movie title
    const safeTitle = movieTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const fileExtension = path.extname(tmdbPosterPath) || '.jpg';
    const fileName = `${safeTitle}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save the image
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Return the relative path for database storage
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error(`❌ Error downloading poster for "${movieTitle}":`, error.message);
    return null;
  }
}

// Function to map TMDB genres to your genre format
function mapGenres(tmdbGenres) {
  const genreMap = {
    'Action': 'Action',
    'Adventure': 'Adventure',
    'Animation': 'Animation',
    'Comedy': 'Comedy',
    'Crime': 'Crime',
    'Documentary': 'Documentary',
    'Drama': 'Drama',
    'Family': 'Family',
    'Fantasy': 'Fantasy',
    'History': 'History',
    'Horror': 'Horror',
    'Music': 'Music',
    'Mystery': 'Mystery',
    'Romance': 'Romance',
    'Science Fiction': 'Sci-Fi',
    'TV Movie': 'TV Movie',
    'Thriller': 'Thriller',
    'War': 'War',
    'Western': 'Western'
  };
  
  return tmdbGenres.map(genre => genreMap[genre.name] || genre.name);
}

// Function to import movies
async function importMovies() {
  try {
     // Connect to MongoDB
     await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moviematic');
     console.log('Connected to MongoDB');

    // Get popular movies
    console.log('Fetching popular movies from TMDB...');
    const popularMovies = await getPopularMovies();
    
    if (popularMovies.length === 0) {
      console.log('No popular movies found');
      return;
    }

    console.log(`Found ${popularMovies.length} popular movies`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const movie of popularMovies) {
      try {
        // Check if movie already exists
        const exists = await movieExists(movie.title, new Date(movie.release_date).getFullYear());
        
        if (exists) {
          console.log(`⏭️  Skipping "${movie.title}" - already exists in database`);
          skippedCount++;
          continue;
        }

        // Get detailed movie information
        const movieDetails = await getMovieDetails(movie.id);
        if (!movieDetails) {
          console.log(`❌ Could not fetch details for "${movie.title}"`);
          continue;
        }

         // Get trailer
         const trailerUrl = await getMovieTrailer(movie.id);

         // Download and save poster image
         console.log(`📥 Downloading poster for "${movieDetails.title}"...`);
         const localPosterPath = await downloadPosterImage(movieDetails.poster_path, movieDetails.title);

         // Get director from crew
         const director = movieDetails.crew?.find(person => person.job === 'Director')?.name || 'Unknown Director';

         // Create movie object with all required fields
         const newMovie = new Movie({
           title: movieDetails.title,
           director: director,
           description: movieDetails.overview || 'No description available',
           genre: mapGenres(movieDetails.genres || []),
           releaseYear: new Date(movieDetails.release_date).getFullYear(),
           rating: Math.round(movieDetails.vote_average * 10) / 10, // Round to 1 decimal
           duration: movieDetails.runtime || 120, // Default to 120 minutes if not available
           portraitImage: localPosterPath || '', // Use local path instead of TMDB URL
           cast: movieDetails.cast?.slice(0, 10).map(actor => actor.name) || [], // Top 10 cast members
           language: movieDetails.original_language || 'English',
           country: movieDetails.production_countries?.[0]?.name || 'United States',
           budget: movieDetails.budget || 0,
           boxOffice: movieDetails.revenue || 0,
           awards: [], // Empty for now
           isReleased: true, // Set to true for imported movies
           movieOfTheWeek: false,
           trailerUrl: trailerUrl || '',
           streamingPlatforms: [] // Empty for now, can be filled manually later
         });

         // Save to database
         await newMovie.save();
         console.log(`✅ Imported "${movieDetails.title}" (${newMovie.releaseYear})${localPosterPath ? ' with poster' : ' without poster'}`);
         importedCount++;

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 250));

      } catch (error) {
        console.error(`❌ Error importing "${movie.title}":`, error.message);
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Successfully imported: ${importedCount} movies`);
    console.log(`⏭️  Skipped (already exists): ${skippedCount} movies`);
    console.log(`📝 Total processed: ${importedCount + skippedCount} movies`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the import
console.log('🎬 Starting TMDB Movie Import...');
console.log('📋 This will import 20 popular movies from TMDB');
console.log('📥 Poster images will be downloaded and saved locally');
console.log('🔍 Checking for duplicates before importing...\n');

importMovies();
