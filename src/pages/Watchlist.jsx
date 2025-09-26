import API_BASE_URL from '../config/api.js';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const Watchlist = () => {
  const { user } = useAuth();
  const { 
    watchlist, 
    watchlistStats, 
    loading, 
    error, 
    fetchWatchlist, 
    removeFromWatchlist,
    updateWatchlistItem 
  } = useWatchlist();
  
  const [activeTab, setActiveTab] = useState('all');
  const [isRemoving, setIsRemoving] = useState({});

  useEffect(() => {
    console.log('Watchlist component mounted, fetching watchlist...');
    fetchWatchlist();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Watchlist state updated:', { watchlist, watchlistStats, loading, error });
  }, [watchlist, watchlistStats, loading, error]);

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-500 text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Please Sign In</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be signed in to view your watchlist.</p>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (movieId, newStatus) => {
    try {
      await updateWatchlistItem(movieId, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRemove = async (movieId) => {
    setIsRemoving(prev => ({ ...prev, [movieId]: true }));
    try {
      await removeFromWatchlist(movieId);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    } finally {
      setIsRemoving(prev => ({ ...prev, [movieId]: false }));
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'want_to_watch':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'watching':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'watched':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'want_to_watch':
        return 'Want to Watch';
      case 'watching':
        return 'Watching';
      case 'watched':
        return 'Watched';
      default:
        return status;
    }
  };

  // Fallback for when watchlist data is not properly initialized
  const safeWatchlist = watchlist || [];
  const safeStats = watchlistStats || { total: 0, byStatus: {} };

  const filteredWatchlist = (activeTab === 'all' 
    ? safeWatchlist 
    : safeWatchlist.filter(item => item.status === activeTab)
  ).filter(item => item && item.movie); // Filter out items with missing movie data

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your watchlist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Watchlist</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => fetchWatchlist()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            My Watchlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {safeStats.total} movies in your collection
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {safeStats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Movies</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {safeStats.byStatus.want_to_watch || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Want to Watch</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {safeStats.byStatus.watching || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Watching</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {safeStats.byStatus.watched || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Watched</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', label: 'All Movies', count: safeStats.total },
              { id: 'want_to_watch', label: 'Want to Watch', count: safeStats.byStatus.want_to_watch || 0 },
              { id: 'watching', label: 'Watching', count: safeStats.byStatus.watching || 0 },
              { id: 'watched', label: 'Watched', count: safeStats.byStatus.watched || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Movies Grid */}
        {filteredWatchlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWatchlist.map((item) => {
              // Skip items with missing movie data
              if (!item || !item.movie) {
                console.warn('Skipping watchlist item with missing movie data:', item);
                return null;
              }

              return (
                <div key={item._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/70 transition-shadow border border-gray-200 dark:border-gray-700 group">
                  {item.movie.portraitImage && (
                    <div className="aspect-[2/3] overflow-hidden relative">
                      <img
                        src={`${API_BASE_URL}${item.movie.portraitImage}`}
                        alt={item.movie.title || 'Movie poster'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.movie._id)}
                        disabled={isRemoving[item.movie._id]}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                        title="Remove from watchlist"
                      >
                        {isRemoving[item.movie._id] ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                  <div className="p-4">
                    <Link
                      to={`/movie/${item.movie._id}`}
                      className="block"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.movie.title || 'Untitled Movie'}
                      </h3>
                    </Link>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <p className="font-medium">{item.movie.director || 'Unknown Director'}</p>
                      <p>{item.movie.releaseYear || 'Unknown Year'} • {formatDuration(item.movie.duration || 0)}</p>
                      {item.movie.rating > 0 && (
                        <p className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          {item.movie.rating}/10
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(item.movie.genre || []).slice(0, 2).map((genre, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                          >
                            {genre}
                          </span>
                        ))}
                        {(item.movie.genre || []).length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{(item.movie.genre || []).length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Change Dropdown */}
                    <div className="mt-3">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.movie._id, e.target.value)}
                        className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="want_to_watch">Want to Watch</option>
                        <option value="watching">Watching</option>
                        <option value="watched">Watched</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              {activeTab === 'all' ? 'No movies in your watchlist' : `No ${getStatusText(activeTab).toLowerCase()} movies`}
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              {activeTab === 'all' 
                ? 'Start building your watchlist by adding movies you want to watch!'
                : `No movies marked as "${getStatusText(activeTab).toLowerCase()}" yet.`
              }
            </p>
            <Link
              to="/browse"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Movies
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Watchlist;
