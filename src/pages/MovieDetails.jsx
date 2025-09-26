import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useReview } from '../context/ReviewContext';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import StarRating from '../components/StarRating';
import API_BASE_URL from '../config/api.js';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInWatchlist, toggleWatchlist, watchlist, loading: watchlistLoading } = useWatchlist();
  const { 
    reviews, 
    reviewStats, 
    userReview, 
    loadMovieReviews, 
    isLoading: reviewsLoading 
  } = useReview();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWatchlistState, setIsInWatchlistState] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Function to convert video URLs to embed URLs
  const getEmbedUrl = (url) => {
    if (!url) return '';

    try {
      // YouTube URLs - handle various formats
      if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}` : url;
      }

      // YouTube short URLs
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}` : url;
      }

      // YouTube embed URLs (already correct format)
      if (url.includes('youtube.com/embed/')) {
        const baseUrl = url.includes('?') ? url.split('?')[0] : url;
        const existingParams = url.includes('?') ? url.split('?')[1] : '';
        const params = new URLSearchParams(existingParams);
        params.set('rel', '0');
        params.set('modestbranding', '1');
        params.set('playsinline', '1');
        params.set('enablejsapi', '1');
        params.set('origin', window.location.origin);
        return `${baseUrl}?${params.toString()}`;
      }

      // Vimeo URLs
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        return videoId ? `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&playsinline=1` : url;
      }

      // Vimeo player URLs (already correct format)
      if (url.includes('player.vimeo.com/video/')) {
        const baseUrl = url.includes('?') ? url.split('?')[0] : url;
        const existingParams = url.includes('?') ? url.split('?')[1] : '';
        const params = new URLSearchParams(existingParams);
        params.set('title', '0');
        params.set('byline', '0');
        params.set('portrait', '0');
        params.set('playsinline', '1');
        return `${baseUrl}?${params.toString()}`;
      }

      // If it's already an embed URL, return as is
      if (url.includes('embed') || url.includes('player.vimeo.com')) {
        return url;
      }

      // Return original URL if no pattern matches
      return url;
    } catch (error) {
      console.error('Error processing video URL:', error);
      return url;
    }
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  // Reload reviews when authentication state changes
  useEffect(() => {
    if (movie && isAuthenticated) {
      loadMovieReviews(movie._id);
    }
  }, [isAuthenticated, movie]);

  // Check if movie is in watchlist
  useEffect(() => {
    if (isAuthenticated && watchlist && movie) {
      const inWatchlist = isInWatchlist(movie._id);
      setIsInWatchlistState(inWatchlist);
    } else {
      setIsInWatchlistState(false);
    }
  }, [isAuthenticated, movie, isInWatchlist, watchlist]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/movies/${id}`);
      if (response.ok) {
        const movieData = await response.json();
        setMovie(movieData);
        // Load reviews for this movie
        await loadMovieReviews(id);
      } else {
        setError('Movie not found');
      }
    } catch (error) {
      console.error('Error fetching movie:', error);
      setError('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Review handlers
  const handleWriteReview = () => {
    setShowReviewForm(true);
    setEditingReview(null);
  };

  const handleEditReview = () => {
    setShowReviewForm(true);
    setEditingReview(userReview);
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
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

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    setIsToggling(true);
    try {
      const result = await toggleWatchlist(movie._id);
      if (result.success) {
        // The watchlist state will be updated by the context
        // The useEffect will handle the state update when watchlist changes
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setIsToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🎬</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Movie Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The movie you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Hero Section with Trailer Preview */}
      <section className="relative">
        {movie.trailerUrl ? (
          <div className="w-full h-96 lg:h-[500px] relative overflow-hidden">
            <iframe
              src={getEmbedUrl(movie.trailerUrl)}
              title={`${movie.title} Trailer`}
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              playsInline
              webkit-playsinline="true"
              moz-playsinline="true"
              ms-playsinline="true"
            ></iframe>
          </div>
        ) : (
          /* Fallback: Show movie poster if no trailer */
          <div className="w-full h-96 lg:h-[500px] relative overflow-hidden bg-gray-800 dark:bg-gray-900">
            {movie.portraitImage && (
              <div className="flex items-center justify-center h-full">
                <img
                  src={`${API_BASE_URL}${movie.portraitImage}`}
                  alt={movie.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
            
            {/* Watchlist Button Overlay */}
            {isAuthenticated && (
              <button
                onClick={handleWatchlistToggle}
                disabled={isToggling || watchlistLoading}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all duration-200 ${
                  isInWatchlistState
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-black bg-opacity-50 hover:bg-opacity-70 text-white'
                } ${(isToggling || watchlistLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                title={isInWatchlistState ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {(isToggling || watchlistLoading) ? (
                  <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : isInWatchlistState ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-white/90 text-lg">
                  {movie.rating > 0 && (
                    <div className="flex items-center">
                      <svg className="h-6 w-6 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span>{movie.rating}/10</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{movie.releaseYear}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDuration(movie.duration)}</span>
                  </div>
                  {movie.isReleased ? (
                    <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                      Released
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Movie Details Section */}
        <div className="bg-white dark:bg-gray-900 p-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-700 dark:text-gray-300 text-lg">
              {movie.rating > 0 && (
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>{movie.rating}/10</span>
                </div>
              )}
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{movie.releaseYear}</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDuration(movie.duration)}</span>
              </div>
              {movie.isReleased ? (
                <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                  Released
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-full">
                  Coming Soon
                </span>
              )}
              
              {/* Watchlist Button */}
              {isAuthenticated && (
                <button
                  onClick={handleWatchlistToggle}
                  disabled={isToggling || watchlistLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    isInWatchlistState
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
                  } ${(isToggling || watchlistLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
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
                  <span className="text-sm font-medium">
                    {isInWatchlistState ? 'In Watchlist' : 'Add to Watchlist'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Detailed Information */}
          <div className="space-y-8">
            {/* Description */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Synopsis</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {movie.description || 'No description available.'}
              </p>
            </section>


            {/* Streaming Platforms */}
            {movie.streamingPlatforms && movie.streamingPlatforms.length > 0 && (
              <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Where to Watch
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {movie.streamingPlatforms.map((platform, index) => (
                    <a
                      key={index}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        {platform.service?.icon ? (
                          <img
                            src={`${API_BASE_URL}${platform.service.icon}`}
                            alt={platform.service.name}
                            className="w-10 h-10 rounded-lg object-cover group-hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:opacity-80 transition-opacity bg-blue-500">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {platform.service?.name || 'Unknown Service'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Watch Now
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Director and Cast */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Director
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 text-lg">{movie.director}</p>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cast</h2>
                  {movie.cast && movie.cast.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {movie.cast.map((actor, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                        >
                          {actor}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Cast information not available.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Genres */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Genres</h2>
              <div className="flex flex-wrap gap-3">
                {movie.genre && movie.genre.length > 0 ? (
                  movie.genre.map((genre, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                      {genre}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Genre information not available.</p>
                )}
              </div>
            </section>

            {/* Awards */}
            {movie.awards && movie.awards.length > 0 && (
              <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Awards & Recognition
                </h2>
                <div className="flex flex-wrap gap-2">
                  {movie.awards.map((award, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-full"
                    >
                      🏆 {award}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Financial Information */}
            {(movie.budget || movie.boxOffice) && (
              <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Financial Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {movie.budget && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Budget</h3>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(movie.budget)}
                      </p>
                    </div>
                  )}
                  {movie.boxOffice && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Box Office</h3>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(movie.boxOffice)}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Additional Details */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Release Status</h3>
                  <p className="text-gray-900 dark:text-white">
                    {movie.isReleased ? 'Released' : 'Coming Soon'}
                  </p>
                </div>
                
                {movie.movieOfTheWeek && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Special Status</h3>
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-500 text-yellow-900 text-sm font-medium rounded-full">
                      🏆 Movie of the Week
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Reviews & Ratings
                </h2>
                
                {/* Review Stats */}
                {reviewStats.totalReviews > 0 && (
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {reviewStats.averageRating}
                      </div>
                      <div className="flex items-center">
                        <StarRating 
                          rating={Math.round(reviewStats.averageRating)} 
                          interactive={false} 
                          size="sm" 
                          showLabel={false}
                        />
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Write Review Button - only show if user hasn't reviewed */}
              {isAuthenticated && !userReview && (
                <div className="mb-6">
                  <button
                    onClick={handleWriteReview}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Write a Review
                  </button>
                </div>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <div className="mb-6">
                  <ReviewForm
                    movieId={movie._id}
                    existingReview={editingReview}
                    onSuccess={handleReviewSuccess}
                    onCancel={handleCancelReview}
                  />
                </div>
              )}

              {/* Reviews List */}
              <ReviewList movieId={movie._id} onEditReview={handleEditReview} />
            </section>

            {/* Back to Home Button */}
            <div className="text-center pt-8">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MovieDetails;
