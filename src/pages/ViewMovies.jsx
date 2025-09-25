import API_BASE_URL from '../config/api.js';
import { useState, useEffect } from 'react';
import EditMovieModal from '../components/EditMovieModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const ViewMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMovie, setEditingMovie] = useState(null);
  const [deletingMovie, setDeletingMovie] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies`);
      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      } else {
        setError('Failed to fetch movies');
      }
    } catch (error) {
      setError('Error fetching movies: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
  };

  const handleDeleteMovie = (movie) => {
    setDeletingMovie(movie);
  };

  const handleUpdateMovie = (updatedMovie) => {
    setMovies(prevMovies => 
      prevMovies.map(movie => 
        movie._id === updatedMovie._id ? updatedMovie : movie
      )
    );
  };

  const handleDeleteConfirm = (movieId) => {
    setMovies(prevMovies => prevMovies.filter(movie => movie._id !== movieId));
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={fetchMovies}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">No movies uploaded yet</div>
        <div className="text-gray-400 dark:text-gray-500">Start by uploading your first movie!</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Movie Collection</h1>
        <p className="text-gray-600 dark:text-gray-300">Browse and manage your uploaded movies</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div key={movie._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/70 transition-shadow">
            {movie.portraitImage && (
              <div className="aspect-[2/3] overflow-hidden">
                <img
                  src={`${API_BASE_URL}${movie.portraitImage}`}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                {movie.title}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <span className="font-medium">Director:</span>
                  <span className="ml-2">{movie.director}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium">Year:</span>
                  <span className="ml-2">{movie.releaseYear}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium">Duration:</span>
                  <span className="ml-2">{formatDuration(movie.duration)}</span>
                </div>
                
                {movie.rating > 0 && (
                  <div className="flex items-center">
                    <span className="font-medium">Rating:</span>
                    <span className="ml-2 flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      {movie.rating}/10
                    </span>
                  </div>
                )}
                
                <div className="flex items-start">
                  <span className="font-medium">Genres:</span>
                  <div className="ml-2 flex flex-wrap gap-1">
                    {movie.genre.slice(0, 3).map((genre, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                    {movie.genre.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{movie.genre.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                {movie.cast.length > 0 && (
                  <div className="flex items-start">
                    <span className="font-medium">Cast:</span>
                    <span className="ml-2 text-xs line-clamp-2">
                      {movie.cast.slice(0, 3).join(', ')}
                      {movie.cast.length > 3 && '...'}
                    </span>
                  </div>
                )}
                
                {movie.budget && (
                  <div className="flex items-center">
                    <span className="font-medium">Budget:</span>
                    <span className="ml-2">{formatCurrency(movie.budget)}</span>
                  </div>
                )}
                
                {movie.boxOffice && (
                  <div className="flex items-center">
                    <span className="font-medium">Box Office:</span>
                    <span className="ml-2">{formatCurrency(movie.boxOffice)}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {movie.description}
                </p>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {movie.language} • {movie.country}
                </span>
                <span>
                  {new Date(movie.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex space-x-2">
                <button
                  onClick={() => handleEditMovie(movie)}
                  className="flex-1 px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteMovie(movie)}
                  className="flex-1 px-3 py-2 bg-red-600 dark:bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <EditMovieModal
        movie={editingMovie}
        isOpen={!!editingMovie}
        onClose={() => setEditingMovie(null)}
        onUpdate={handleUpdateMovie}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        movie={deletingMovie}
        isOpen={!!deletingMovie}
        onClose={() => setDeletingMovie(null)}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
};

export default ViewMovies;
