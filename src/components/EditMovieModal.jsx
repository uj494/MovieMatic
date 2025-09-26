import API_BASE_URL from '../config/api.js';
import { useState, useEffect } from 'react';

const EditMovieModal = ({ movie, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    director: '',
    releaseYear: '',
    genre: [],
    rating: 0,
    duration: '',
    description: '',
    cast: '',
    language: '',
    country: '',
    budget: '',
    boxOffice: '',
    awards: '',
    isReleased: true,
    movieOfTheWeek: false,
    trailerUrl: '',
    streamingPlatforms: []
  });

  const [portraitImage, setPortraitImage] = useState(null);
  const [portraitPreview, setPortraitPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [streamingServices, setStreamingServices] = useState([]);

  const genres = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'Film-Noir', 'History',
    'Horror', 'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi',
    'Sport', 'Thriller', 'War', 'Western'
  ];

  // Fetch streaming services on component mount
  useEffect(() => {
    const fetchStreamingServices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/streaming-services`);
        if (response.ok) {
          const services = await response.json();
          setStreamingServices(services);
        }
      } catch (error) {
        console.error('Error fetching streaming services:', error);
      }
    };
    fetchStreamingServices();
  }, []);

  useEffect(() => {
    if (movie) {
      console.log('🎬 Populating form with movie data:', movie);
      console.log('🎬 Movie streaming platforms:', movie.streamingPlatforms);
      
      setFormData({
        title: movie.title || '',
        director: movie.director || '',
        releaseYear: movie.releaseYear || '',
        genre: movie.genre || [],
        rating: movie.rating || 0,
        duration: movie.duration || '',
        description: movie.description || '',
        cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : '',
        language: movie.language || '',
        country: movie.country || '',
        budget: movie.budget || '',
        boxOffice: movie.boxOffice || '',
        awards: Array.isArray(movie.awards) ? movie.awards.join(', ') : '',
        isReleased: movie.isReleased !== undefined ? movie.isReleased : true,
        movieOfTheWeek: movie.movieOfTheWeek !== undefined ? movie.movieOfTheWeek : true,
        trailerUrl: movie.trailerUrl || '',
        streamingPlatforms: movie.streamingPlatforms ? movie.streamingPlatforms.map(platform => ({
          service: platform.service?._id || platform.service || '',
          url: platform.url || ''
        })) : []
      });
      
      // Set existing image previews
      if (movie.portraitImage) {
        setPortraitPreview(`${API_BASE_URL}${movie.portraitImage}`);
      }
      
      // Reset new image upload
      setPortraitImage(null);
    }
  }, [movie]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGenreChange = (genre) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }));
  };

  const handleCastChange = (e) => {
    setFormData(prev => ({
      ...prev,
      cast: e.target.value
    }));
  };

  const handleAwardsChange = (e) => {
    setFormData(prev => ({
      ...prev,
      awards: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPortraitImage(file);
      const reader = new FileReader();
      reader.onload = () => setPortraitPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPortraitImage(null);
    setPortraitPreview('');
  };

  const addStreamingPlatform = () => {
    setFormData(prev => ({
      ...prev,
      streamingPlatforms: [...prev.streamingPlatforms, { service: '', url: '' }]
    }));
  };

  const removeStreamingPlatform = (index) => {
    setFormData(prev => ({
      ...prev,
      streamingPlatforms: prev.streamingPlatforms.filter((_, i) => i !== index)
    }));
  };

  const updateStreamingPlatform = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      streamingPlatforms: prev.streamingPlatforms.map((platform, i) => 
        i === index ? { ...platform, [field]: value } : platform
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      console.log('🎬 Submitting form data:', formData);
      console.log('🎬 Trailer URL:', formData.trailerUrl);
      console.log('🎬 Streaming Platforms:', formData.streamingPlatforms);
      
      const formDataToSend = new FormData();
      
      // Add all form data
      Object.keys(formData).forEach(key => {
        if (key === 'genre') {
          formData.genre.forEach(genre => {
            formDataToSend.append('genre', genre);
          });
        } else if (key === 'cast') {
          formDataToSend.append('cast', formData.cast);
        } else if (key === 'awards') {
          formDataToSend.append('awards', formData.awards);
        } else if (key === 'streamingPlatforms') {
          formDataToSend.append('streamingPlatforms', JSON.stringify(formData.streamingPlatforms));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add new image if selected
      if (portraitImage) {
        formDataToSend.append('portraitImage', portraitImage);
      }

      const response = await fetch(`${API_BASE_URL}/api/movies/${movie._id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (response.ok) {
        const updatedMovie = await response.json();
        onUpdate(updatedMovie);
        onClose();
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Edit Movie: {movie.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {message && (
            <div className={`p-4 mb-6 rounded-lg ${
              message.includes('Error') 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Movie Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter movie title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Director *
                </label>
                <input
                  type="text"
                  name="director"
                  value={formData.director}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter director name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Release Year *
                </label>
                <input
                  type="number"
                  name="releaseYear"
                  value={formData.releaseYear}
                  onChange={handleInputChange}
                  required
                  min="1888"
                  max={new Date().getFullYear() + 5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="600"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Genre Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Genres *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {genres.map(genre => (
                  <label key={genre} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.genre.includes(genre)}
                      onChange={() => handleGenreChange(genre)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{genre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                maxLength="1000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter movie description..."
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Trailer URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Trailer URL
              </label>
              <input
                type="url"
                name="trailerUrl"
                value={formData.trailerUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter YouTube, Vimeo, or other video platform URL
              </p>
            </div>

            {/* Streaming Platforms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Streaming Platforms
              </label>
              <div className="space-y-4">
                {formData.streamingPlatforms.map((platform, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Streaming Service
                      </label>
                      <select
                        value={platform.service}
                        onChange={(e) => updateStreamingPlatform(index, 'service', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select a streaming service</option>
                        {streamingServices.map((service) => (
                          <option key={service._id} value={service._id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Movie URL
                      </label>
                      <input
                        type="url"
                        value={platform.url}
                        onChange={(e) => updateStreamingPlatform(index, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="https://www.netflix.com/title/..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStreamingPlatform(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStreamingPlatform}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add Streaming Platform
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add platforms where this movie is available for streaming
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Movie Poster
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
                />
                {portraitPreview && (
                  <div className="relative max-w-xs">
                    <img
                      src={portraitPreview}
                      alt="Poster preview"
                      className="w-full h-64 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Recommended: 2:3 aspect ratio (e.g., 400x600px)
              </p>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Cast Members
                </label>
                <input
                  type="text"
                  name="cast"
                  value={formData.cast}
                  onChange={handleCastChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Actor 1, Actor 2, Actor 3..."
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Separate multiple actors with commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Language
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="English"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="United States"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="50000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Box Office (USD)
                </label>
                <input
                  type="number"
                  name="boxOffice"
                  value={formData.boxOffice}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="200000000"
                />
              </div>
            </div>

            {/* Rating and Awards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Rating (0-10)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Awards
                </label>
                <input
                  type="text"
                  name="awards"
                  value={formData.awards}
                  onChange={handleAwardsChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Best Picture, Best Director..."
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Separate multiple awards with commas
                </p>
              </div>
            </div>

            {/* Release Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isReleased"
                checked={formData.isReleased}
                onChange={handleInputChange}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Movie has been released
              </label>
            </div>

            {/* Movie of the Week */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="movieOfTheWeek"
                checked={formData.movieOfTheWeek}
                onChange={handleInputChange}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Mark as Movie of the Week
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Updating...' : 'Update Movie'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMovieModal;
