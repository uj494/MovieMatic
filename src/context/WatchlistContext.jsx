import API_BASE_URL from '../config/api.js';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext();

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistStats, setWatchlistStats] = useState({ total: 0, byStatus: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, token } = useAuth();

  // Fetch user's watchlist
  const fetchWatchlist = async (status = null, page = 1, limit = 20) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      const response = await fetch(`${API_BASE_URL}/api/watchlist?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWatchlist(data.watchlist);
        return data;
      } else {
        throw new Error('Failed to fetch watchlist');
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add movie to watchlist
  const addToWatchlist = async (movieId, status = 'want_to_watch') => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to add movies to watchlist');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/watchlist/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ movieId, status })
      });

      const data = await response.json();

      if (response.ok) {
        // Check if movie already exists in watchlist
        const existingItem = watchlist.find(item => item.movie._id === movieId);
        
        if (existingItem) {
          // Update existing item
          setWatchlist(prev => prev.map(item => 
            item.movie._id === movieId ? data.watchlistItem : item
          ));
          // Update stats - decrease old status, increase new status
          setWatchlistStats(prev => ({
            ...prev,
            byStatus: {
              ...prev.byStatus,
              [existingItem.status]: Math.max(0, (prev.byStatus[existingItem.status] || 0) - 1),
              [status]: (prev.byStatus[status] || 0) + 1
            }
          }));
        } else {
          // Add new item
          setWatchlist(prev => [data.watchlistItem, ...prev]);
          // Update stats
          setWatchlistStats(prev => ({
            ...prev,
            total: prev.total + 1,
            byStatus: {
              ...prev.byStatus,
              [status]: (prev.byStatus[status] || 0) + 1
            }
          }));
        }
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to add to watchlist' };
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Remove movie from watchlist
  const removeFromWatchlist = async (movieId) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to remove movies from watchlist');
    }

    try {
      // Find the item to get its status before removing
      const itemToRemove = watchlist.find(item => item.movie._id === movieId);
      const statusToRemove = itemToRemove?.status;

      const response = await fetch(`${API_BASE_URL}/api/watchlist/remove/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Remove from local state
        setWatchlist(prev => prev.filter(item => item.movie._id !== movieId));
        // Update stats - decrease both total and status count
        setWatchlistStats(prev => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          byStatus: {
            ...prev.byStatus,
            [statusToRemove]: Math.max(0, (prev.byStatus[statusToRemove] || 0) - 1)
          }
        }));
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to remove from watchlist' };
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Update watchlist item
  const updateWatchlistItem = async (movieId, updates) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to update watchlist items');
    }

    try {
      // Find the current item to get its old status
      const currentItem = watchlist.find(item => item.movie._id === movieId);
      const oldStatus = currentItem?.status;

      const response = await fetch(`${API_BASE_URL}/api/watchlist/update/${movieId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setWatchlist(prev => prev.map(item => 
          item.movie._id === movieId ? data.watchlistItem : item
        ));
        
        // Update stats if status changed
        if (updates.status && oldStatus && oldStatus !== updates.status) {
          setWatchlistStats(prev => ({
            ...prev,
            byStatus: {
              ...prev.byStatus,
              [oldStatus]: Math.max(0, (prev.byStatus[oldStatus] || 0) - 1),
              [updates.status]: (prev.byStatus[updates.status] || 0) + 1
            }
          }));
        }
        
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to update watchlist item' };
      }
    } catch (error) {
      console.error('Error updating watchlist item:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Check if movie is in watchlist
  const checkInWatchlist = async (movieId) => {
    if (!isAuthenticated) return { inWatchlist: false, watchlistItem: null };

    try {
      const response = await fetch(`${API_BASE_URL}/api/watchlist/check/${movieId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        return { inWatchlist: false, watchlistItem: null };
      }
    } catch (error) {
      console.error('Error checking watchlist:', error);
      return { inWatchlist: false, watchlistItem: null };
    }
  };

  // Fetch watchlist statistics
  const fetchWatchlistStats = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/watchlist/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWatchlistStats(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching watchlist stats:', error);
    }
  };

  // Toggle movie in watchlist
  const toggleWatchlist = async (movieId, status = 'want_to_watch') => {
    const isInWatchlist = watchlist.some(item => item.movie._id === movieId);
    
    if (isInWatchlist) {
      return await removeFromWatchlist(movieId);
    } else {
      return await addToWatchlist(movieId, status);
    }
  };

  // Load watchlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchlist();
      fetchWatchlistStats();
    } else {
      setWatchlist([]);
      setWatchlistStats({ total: 0, byStatus: {} });
      setError(null);
    }
  }, [isAuthenticated]);

  const value = {
    watchlist,
    watchlistStats,
    loading,
    error,
    fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    checkInWatchlist,
    fetchWatchlistStats,
    toggleWatchlist,
    isInWatchlist: (movieId) => {
      return watchlist.some(item => item.movie && item.movie._id === movieId);
    }
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};
