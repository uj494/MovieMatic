import API_BASE_URL from '../config/api.js';
import { useState, useEffect } from 'react';

const MovieUploadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    director: '',
    releaseYear: new Date().getFullYear(),
    genre: [],
    rating: 0,
    duration: 120,
    description: '',
    cast: '',
    language: 'English',
    country: 'United States',
    budget: '',
    boxOffice: '',
    awards: '',
    isReleased: true,
    trailerUrl: '',
    streamingPlatforms: []
  });

  const [portraitImage, setPortraitImage] = useState(null);
  const [landscapeImage, setLandscapeImage] = useState(null);
  const [portraitPreview, setPortraitPreview] = useState('');
  const [landscapePreview, setLandscapePreview] = useState('');
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
    const castArray = e.target.value;
    setFormData(prev => ({
      ...prev,
      cast: castArray
    }));
  };

  const handleAwardsChange = (e) => {
    const awardsArray = e.target.value.split(',').map(award => award.trim()).filter(award => award);
    setFormData(prev => ({
      ...prev,
      awards: awardsArray
    }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'portrait') {
        setPortraitImage(file);
        const reader = new FileReader();
        reader.onload = () => setPortraitPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setLandscapeImage(file);
        const reader = new FileReader();
        reader.onload = () => setLandscapePreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (type) => {
    if (type === 'portrait') {
      setPortraitImage(null);
      setPortraitPreview('');
    } else {
      setLandscapeImage(null);
      setLandscapePreview('');
    }
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
      const formDataToSend = new FormData();
      
      // Add all form data
      Object.keys(formData).forEach(key => {
        if (key === 'genre') {
          formData.genre.forEach(genre => {
            formDataToSend.append('genre', genre);
          });
        } else if (key === 'cast') {
          const castArray = formData.cast.split(',').map(actor => actor.trim()).filter(actor => actor);
          formDataToSend.append('cast', castArray);
        } else if (key === 'awards') {
          formDataToSend.append('awards', formData.awards);
        } else if (key === 'streamingPlatforms') {
          formDataToSend.append('streamingPlatforms', JSON.stringify(formData.streamingPlatforms));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add images if selected
      if (portraitImage) {
        formDataToSend.append('portraitImage', portraitImage);
      }
      if (landscapeImage) {
        formDataToSend.append('landscapeImage', landscapeImage);
      }

      const response = await fetch(`${API_BASE_URL}/api/movies`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const savedMovie = await response.json();
        setMessage(`Movie "${savedMovie.title}" uploaded successfully!`);
        
        // Reset form
        setFormData({
          title: '',
          director: '',
          releaseYear: new Date().getFullYear(),
          genre: [],
          rating: 0,
          duration: 120,
          description: '',
          cast: '',
          language: 'English',
          country: 'United States',
          budget: '',
          boxOffice: '',
          awards: '',
          isReleased: true,
          trailerUrl: '',
          streamingPlatforms: []
        });
        setPortraitImage(null);
        setLandscapeImage(null);
        setPortraitPreview('');
        setLandscapePreview('');
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Upload Movie Details
      </h2>
      
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

        {/* Image Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Portrait Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Portrait Image (Poster)
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'portrait')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
              />
              {portraitPreview && (
                <div className="relative">
                  <img
                    src={portraitPreview}
                    alt="Portrait preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage('portrait')}
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

          {/* Landscape Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Landscape Image (Banner)
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'landscape')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
              />
              {landscapePreview && (
                <div className="relative">
                  <img
                    src={landscapePreview}
                    alt="Landscape preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage('landscape')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Recommended: 16:9 aspect ratio (e.g., 1200x675px)
            </p>
          </div>
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

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Uploading...' : 'Upload Movie'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovieUploadForm;
