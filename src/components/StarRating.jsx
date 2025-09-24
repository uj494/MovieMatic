import { useState, useEffect } from 'react';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  interactive = true, 
  size = 'md',
  showLabel = true 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [displayRating, setDisplayRating] = useState(rating);

  useEffect(() => {
    setDisplayRating(rating);
  }, [rating]);

  const handleMouseEnter = (starValue) => {
    if (interactive) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const handleClick = (starValue) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
      setDisplayRating(starValue);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-10 h-10';
      default:
        return 'w-6 h-6';
    }
  };

  const getLabelText = () => {
    if (!showLabel) return '';
    
    const currentRating = hoverRating || displayRating;
    switch (currentRating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= (hoverRating || displayRating);
          const isInteractive = interactive;
          
          return (
            <button
              key={starValue}
              type="button"
              className={`${getSizeClasses()} transition-colors duration-150 ${
                isInteractive 
                  ? 'cursor-pointer hover:scale-110 transform' 
                  : 'cursor-default'
              }`}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(starValue)}
              disabled={!isInteractive}
            >
              <svg
                className={`w-full h-full ${
                  isFilled 
                    ? 'text-yellow-400' 
                    : 'text-gray-300 dark:text-gray-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
      </div>
      
      {showLabel && (
        <span className={`ml-2 text-sm font-medium ${
          hoverRating || displayRating > 0
            ? 'text-gray-700 dark:text-gray-300'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {getLabelText()}
        </span>
      )}
      
      {displayRating > 0 && (
        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
          ({displayRating}/5)
        </span>
      )}
    </div>
  );
};

export default StarRating;

