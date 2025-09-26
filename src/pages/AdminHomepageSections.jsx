import API_BASE_URL from '../config/api.js';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const AdminHomepageSections = () => {
  const { isDark } = useTheme();
  const [sections, setSections] = useState([]);
  const [movies, setMovies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    movieIds: [],
    order: 0
  });
  const [movieSearchTerm, setMovieSearchTerm] = useState('');

  useEffect(() => {
    fetchSections();
    fetchMovies();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage-sections/admin`);
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage-sections/movies/available`);
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || formData.movieIds.length === 0) {
      alert('Please provide a title and select at least one movie');
      return;
    }

    try {
      const url = editingSection 
        ? `${API_BASE_URL}/api/homepage-sections/${editingSection._id}`
        : `${API_BASE_URL}/api/homepage-sections`;
      
      const method = editingSection ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedSection = await response.json();
        
        if (editingSection) {
          setSections(sections.map(section => 
            section._id === editingSection._id ? updatedSection : section
          ));
        } else {
          setSections([...sections, updatedSection]);
        }
        
        resetForm();
        alert(editingSection ? 'Section updated successfully!' : 'Section created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Error saving section');
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      movieIds: section.movieIds.map(movie => movie._id),
      order: section.order
    });
    setShowForm(true);
  };

  const handleDelete = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage-sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSections(sections.filter(section => section._id !== sectionId));
        alert('Section deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      movieIds: [],
      order: 0
    });
    setMovieSearchTerm('');
    setEditingSection(null);
    setShowForm(false);
  };

  // Filter movies based on search term
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(movieSearchTerm.toLowerCase()) ||
    movie.genre?.some(g => g.toLowerCase().includes(movieSearchTerm.toLowerCase())) ||
    movie.director?.toLowerCase().includes(movieSearchTerm.toLowerCase()) ||
    movie.cast?.some(actor => actor.toLowerCase().includes(movieSearchTerm.toLowerCase()))
  );

  const handleMovieToggle = (movieId) => {
    setFormData(prev => ({
      ...prev,
      movieIds: prev.movieIds.includes(movieId)
        ? prev.movieIds.filter(id => id !== movieId)
        : [...prev.movieIds, movieId]
    }));
  };

  const handleSelectAll = () => {
    const allFilteredMovieIds = filteredMovies.map(movie => movie._id);
    setFormData(prev => ({
      ...prev,
      movieIds: [...new Set([...prev.movieIds, ...allFilteredMovieIds])]
    }));
  };

  const handleClearAll = () => {
    const filteredMovieIds = filteredMovies.map(movie => movie._id);
    setFormData(prev => ({
      ...prev,
      movieIds: prev.movieIds.filter(id => !filteredMovieIds.includes(id))
    }));
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Homepage Sections
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add New Section
          </button>
        </div>

        {/* Sections List */}
        <div className={`rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Title
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Movies Count
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Order
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {sections.map((section) => (
                  <tr key={section._id}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {section.title}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {section.movieIds.length} movies
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {section.order}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap`}>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        section.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {section.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(section._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter section title"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Order (lower numbers appear first)
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Movies
                  </label>
                  
                  {/* Movie Search Input */}
                  <div className="mt-2 mb-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={movieSearchTerm}
                        onChange={(e) => setMovieSearchTerm(e.target.value)}
                        className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Search movies by title, genre, director, or cast..."
                      />
                      {movieSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setMovieSearchTerm('')}
                          className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${
                            isDark ? 'hover:text-gray-300' : 'hover:text-gray-800'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {movieSearchTerm && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Found {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} matching "{movieSearchTerm}"
                      </p>
                    )}
                  </div>

                  {/* Select All / Clear All Buttons */}
                  {filteredMovies.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className={`px-3 py-1 text-xs rounded border ${
                          isDark 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Select All ({filteredMovies.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className={`px-3 py-1 text-xs rounded border ${
                          isDark 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Clear All
                      </button>
                    </div>
                  )}

                  <div className={`max-h-60 overflow-y-auto border rounded-md p-3 ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}>
                    {filteredMovies.length === 0 ? (
                      <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {movieSearchTerm ? 'No movies found matching your search.' : 'No movies available.'}
                      </p>
                    ) : (
                      filteredMovies.map((movie) => (
                      <label key={movie._id} className="flex items-center space-x-3 py-2">
                        <input
                          type="checkbox"
                          checked={formData.movieIds.includes(movie._id)}
                          onChange={() => handleMovieToggle(movie._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-3">
                          {movie.portraitImage && (
                            <img
                              src={`${API_BASE_URL}${movie.portraitImage}`}
                              alt={movie.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {movie.title}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {movie.releaseYear}
                            </p>
                          </div>
                        </div>
                      </label>
                      ))
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Selected: {formData.movieIds.length} movies
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-4 py-2 border rounded-md ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingSection ? 'Update Section' : 'Create Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHomepageSections;
