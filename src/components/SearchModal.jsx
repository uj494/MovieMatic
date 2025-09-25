import API_BASE_URL from '../config/api.js';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const SearchModal = ({ isOpen, onClose, initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const delayDebounceFn = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Search Movies
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search movies, directors, actors, or descriptions..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </form>
        </div>

        {/* Search Results */}
        <div 
          className="flex-1 overflow-y-auto p-6"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db #f3f4f6'
          }}
        >
          {searchQuery.trim() && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isSearching ? 'Searching...' : hasSearched ? `Found ${searchResults.length} results` : 'Type to search...'}
              </p>
            </div>
          )}

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((movie) => (
                <Link
                  key={movie._id}
                  to={`/movie/${movie._id}`}
                  onClick={handleClose}
                  className="bg-white dark:bg-gray-700 rounded-lg shadow-lg dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/70 transition-shadow border border-gray-200 dark:border-gray-600"
                >
                  {movie.portraitImage && (
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={`${API_BASE_URL}${movie.portraitImage}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
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
                  </div>
                </Link>
              ))}
            </div>
          ) : searchQuery.trim() && hasSearched && !isSearching ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                No movies found for "{searchQuery}"
              </div>
              <p className="text-gray-400 dark:text-gray-500 mb-4">
                Try searching with different keywords or check the spelling.
              </p>
              <div className="text-sm text-gray-400 dark:text-gray-500">
                <p>Search tips:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Use movie titles, director names, or actor names</li>
                  <li>• Try partial matches (e.g., "star" for "Star Wars")</li>
                  <li>• Check for typos in your search</li>
                </ul>
              </div>
            </div>
          ) : !searchQuery.trim() ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                Start typing to search movies
              </div>
              <p className="text-gray-400 dark:text-gray-500 mb-4">
                Search by title, director, actor, or description
              </p>
              <div className="text-sm text-gray-400 dark:text-gray-500">
                <p>Popular searches:</p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  {['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller'].map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSearchQuery(genre)}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>
              {searchResults.length > 0 && `Showing ${searchResults.length} results`}
            </span>
            <span>
              Press Esc to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
