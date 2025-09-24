import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import API_BASE_URL from '../config/api.js';

const ReviewContext = createContext();

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [userReview, setUserReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Fetch reviews for a specific movie
  const fetchMovieReviews = async (movieId) => {
    if (!movieId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/movie/${movieId}`);
      if (response.ok) {
        const reviewsData = await response.json();
        setReviews(reviewsData);
        
        // Find user's review from the reviews list as a fallback
        if (isAuthenticated && user) {
          const currentUserReview = reviewsData.find(review => review.user?._id === user._id);
          console.log('Found user review in reviews list:', currentUserReview);
          if (currentUserReview) {
            setUserReview(currentUserReview);
          } else {
            // If no user review found in the list, set to null
            setUserReview(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch review statistics for a movie
  const fetchReviewStats = async (movieId) => {
    if (!movieId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/movie/${movieId}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setReviewStats(stats);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  // Fetch user's review for a specific movie
  const fetchUserReview = async (movieId) => {
    if (!isAuthenticated || !user || !movieId) {
      setUserReview(null);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reviews/movie/${movieId}/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const review = await response.json();
        console.log('Fetched user review from API:', review);
        setUserReview(review);
      } else if (response.status === 404) {
        console.log('No user review found (404)');
        setUserReview(null);
      }
    } catch (error) {
      console.error('Error fetching user review:', error);
      setUserReview(null);
    }
  };

  // Submit a new review
  const submitReview = async (movieId, rating, reviewText) => {
    if (!isAuthenticated || !user) {
      throw new Error('You must be logged in to submit a review');
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId,
          rating,
          reviewText
        })
      });

      if (response.ok) {
        const newReview = await response.json();
        setUserReview(newReview);
        // Refresh reviews and stats
        await fetchMovieReviews(movieId);
        await fetchReviewStats(movieId);
        return newReview;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  // Update an existing review
  const updateReview = async (reviewId, rating, reviewText) => {
    if (!isAuthenticated || !user) {
      throw new Error('You must be logged in to update a review');
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          reviewText
        })
      });

      if (response.ok) {
        const updatedReview = await response.json();
        setUserReview(updatedReview);
        // Update in reviews list
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review._id === reviewId ? updatedReview : review
          )
        );
        // Refresh stats
        if (reviews.length > 0) {
          const movieId = reviews[0].movie;
          await fetchReviewStats(movieId);
        }
        return updatedReview;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  };

  // Delete a review
  const deleteReview = async (reviewId) => {
    if (!isAuthenticated || !user) {
      throw new Error('You must be logged in to delete a review');
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUserReview(null);
        // Remove from reviews list
        setReviews(prevReviews => 
          prevReviews.filter(review => review._id !== reviewId)
        );
        // Refresh stats
        if (reviews.length > 0) {
          const movieId = reviews[0].movie;
          await fetchReviewStats(movieId);
        }
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  };

  // Load all data for a movie
  const loadMovieReviews = async (movieId) => {
    // First fetch all reviews and stats
    await Promise.all([
      fetchMovieReviews(movieId),
      fetchReviewStats(movieId)
    ]);
    
    // Always try to fetch user review as a fallback
    if (isAuthenticated && user) {
      await fetchUserReview(movieId);
    }
  };

  // Clear reviews when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setReviews([]);
      setUserReview(null);
      setReviewStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }
  }, [isAuthenticated]);

  // Update user review when reviews change and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && reviews.length > 0) {
      const currentUserReview = reviews.find(review => review.user?._id === user._id);
      console.log('Updating user review from reviews list:', currentUserReview);
      setUserReview(currentUserReview || null);
    }
  }, [reviews, isAuthenticated, user]);

  const value = {
    reviews,
    reviewStats,
    userReview,
    isLoading,
    fetchMovieReviews,
    fetchReviewStats,
    fetchUserReview,
    submitReview,
    updateReview,
    deleteReview,
    loadMovieReviews
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};

