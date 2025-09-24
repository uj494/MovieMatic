import { useState } from 'react';
import { useReview } from '../context/ReviewContext';
import StarRating from './StarRating';

const ReviewList = ({ movieId, onEditReview }) => {
  const { reviews, userReview, deleteReview, isLoading } = useReview();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this movie!</p>
      </div>
    );
  }

  // Separate user's review from other reviews
  const otherReviews = reviews.filter(review => !userReview || review._id !== userReview._id);

  const renderReview = (review, isUserReview = false) => (
    <div 
      key={review._id} 
      className={`rounded-lg p-4 border ${
        isUserReview 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-2 ring-blue-100 dark:ring-blue-800/50' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-medium ${
            isUserReview ? 'bg-blue-600' : 'bg-blue-600'
          }`}>
            {review.user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {review.user?.firstName && review.user?.lastName 
                ? `${review.user.firstName} ${review.user.lastName}` 
                : 'Anonymous User'}
              {isUserReview && (
                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                  Your Review
                </span>
              )}
            </h4>
            <div className="flex items-center space-x-2">
              <StarRating 
                rating={review.rating} 
                interactive={false} 
                size="sm" 
                showLabel={false}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action buttons for user's own review */}
        {isUserReview && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEditReview && onEditReview(review)}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              title="Edit review"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(review._id)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              title="Delete review"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {review.reviewText}
      </p>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm === review._id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Review
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete your review? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteReview(review._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* User's review at the top */}
      {userReview && renderReview(userReview, true)}
      
      {/* Other reviews */}
      {otherReviews.map((review) => renderReview(review, false))}
    </div>
  );
};

export default ReviewList;