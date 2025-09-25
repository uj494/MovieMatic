import API_BASE_URL from '../config/api.js';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import FilterPanel from '../components/FilterPanel';
import MovieCard from '../components/MovieCard';

const BrowseMovies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    year: '',
    rating: '',
    sortBy: 'newest'
  });
  const { genre } = useParams();

  useEffect(() => {
    if (genre) {
      fetchMoviesByGenre(genre);
    } else {
      fetchMovies();
    }
  }, [genre]);

  // Apply filters whenever movies or filters change
  useEffect(() => {
    applyFilters();
  }, [movies, filters]);

  const fetchMoviesByGenre = async (genre) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/movies/genre/${genre}`);
      if (response.ok) {
        const moviesData = await response.json();
        setMovies(moviesData);
      } else {
        setError('Failed to fetch movies');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/movies`);
      if (response.ok) {
        const moviesData = await response.json();
        setMovies(moviesData);
      } else {
        setError('Failed to fetch movies');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredMovies = async (searchFilters) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (searchFilters.search) queryParams.append('q', searchFilters.search);
      if (searchFilters.genre) queryParams.append('genre', searchFilters.genre);
      if (searchFilters.year) queryParams.append('year', searchFilters.year);
      if (searchFilters.rating) queryParams.append('rating', searchFilters.rating);

      const response = await fetch(`${API_BASE_URL}/api/movies/search?${queryParams}`);
      if (response.ok) {
        const moviesData = await response.json();
        setMovies(moviesData);
      } else {
        setError('Failed to fetch movies');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...movies];

    // Apply text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.director.toLowerCase().includes(searchTerm) ||
        movie.description.toLowerCase().includes(searchTerm) ||
        movie.cast.some(actor => actor.toLowerCase().includes(searchTerm))
      );
    }

    // Apply genre filter
    if (filters.genre) {
      filtered = filtered.filter(movie => 
        movie.genre.includes(filters.genre)
      );
    }

    // Apply year filter
    if (filters.year) {
      filtered = filtered.filter(movie => 
        movie.releaseYear === parseInt(filters.year)
      );
    }

    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter(movie => 
        movie.rating >= parseFloat(filters.rating)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'rating-asc':
          return (a.rating || 0) - (b.rating || 0);
        case 'year-desc':
          return b.releaseYear - a.releaseYear;
        case 'year-asc':
          return a.releaseYear - b.releaseYear;
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredMovies(filtered);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🎬</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Movies</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchMovies}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            {genre ? genre+' Movies' : 'Browse All Movies'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {genre ? 'Discover our complete collection of '+genre+' movies.' : 'Discover our complete collection of movies. From blockbusters to indie gems, find your next favorite film.'}
          </p>
        </div>

        {/* Filter Toggle Button for Mobile */}
        <div className="mb-6 md:hidden">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              onFiltersChange={handleFiltersChange}
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
            />
          </div>

          {/* Movies Grid */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Showing {filteredMovies.length} of {movies.length} movies
              </p>
            </div>

            {/* Movies Grid */}
            {filteredMovies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMovies.map((movie) => (
                  <div key={movie._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/70 transition-shadow border border-gray-200 dark:border-gray-700 group">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                  {movies.length === 0 ? 'No movies found' : 'No movies match your filters'}
                </div>
                <p className="text-gray-400 dark:text-gray-500">
                  {movies.length === 0 
                    ? 'It looks like there are no movies in the database yet.'
                    : 'Try adjusting your search criteria or clearing the filters.'
                  }
                </p>
                {movies.length === 0 ? (
                  <Link
                    to="/admin/upload"
                    className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Movie
                  </Link>
                ) : (
                  <button
                    onClick={() => setFilters({
                      search: '',
                      genre: '',
                      year: '',
                      rating: '',
                      sortBy: 'newest'
                    })}
                    className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center pt-12">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default BrowseMovies;
