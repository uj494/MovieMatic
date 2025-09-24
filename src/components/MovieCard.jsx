import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';

const MovieCard = ({ movie }) => {
  const { isAuthenticated } = useAuth();
  const { isInWatchlist, toggleWatchlist, watchlist, loading: watchlistLoading } = useWatchlist();
  const [isInWatchlistState, setIsInWatchlistState] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Check if movie is in watchlist
  useEffect(() => {
    if (isAuthenticated && watchlist) {
      const inWatchlist = isInWatchlist(movie._id);
      setIsInWatchlistState(inWatchlist);
    } else {
      setIsInWatchlistState(false);
    }
  }, [isAuthenticated, movie._id, isInWatchlist, watchlist]);

  const handleWatchlistToggle = async (e) => {
    e.preventDefault(); // Prevent navigation to movie details
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    setIsToggling(true);
    try {
      const result = await toggleWatchlist(movie._id);
      if (result.success) {
        // The watchlist state will be updated by the context, so we don't need to manually update here
        // The useEffect will handle the state update when watchlist changes
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="relative group">
      <Link
        key={movie._id}
        to={`/movie/${movie._id}`}
        className="block"
      >
        {movie.portraitImage && (
          <div className="aspect-[2/3] overflow-hidden relative">
            <img
              src={`http://localhost:3001${movie.portraitImage}`}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Watchlist Button Overlay */}
            {isAuthenticated && (
              <button
                onClick={handleWatchlistToggle}
                disabled={isToggling || watchlistLoading}
                className={`absolute top-2 right-2 p-2 rounded-full shadow-lg transition-all duration-200 ${
                  isInWatchlistState
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-black bg-opacity-50 hover:bg-opacity-70 text-white'
                } ${(isToggling || watchlistLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                title={isInWatchlistState ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {(isToggling || watchlistLoading) ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : isInWatchlistState ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}
        <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {movie.title}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p className="font-medium">{movie.director}</p>
            <p>{movie.releaseYear} • {formatDuration(movie.duration)}</p>
            {movie.rating > 0 && (
                <p className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                {movie.rating}/10
                </p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
                {movie.genre.slice(0, 2).map((genre, index) => (
                <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                    {genre}
                </span>
                ))}
                {movie.genre.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{movie.genre.length - 2} more
                </span>
                )}
            </div>
            {/* {movie.movieOfTheWeek && (
                <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-medium rounded-full">
                    🏆 Movie of the Week
                </span>
                </div>
            )} */}
            </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;