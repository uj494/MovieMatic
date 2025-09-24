import { useState, useEffect } from 'react';

const StreamingServiceForm = ({ service, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    isActive: true
  });
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        baseUrl: service.baseUrl || '',
        isActive: service.isActive !== undefined ? service.isActive : true
      });
      if (service.icon) {
        setIconPreview(`http://localhost:3001${service.icon}`);
      }
    } else {
      setFormData({
        name: '',
        baseUrl: '',
        isActive: true
      });
      setIconPreview('');
    }
    setIcon(null);
  }, [service]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage('Image size must be less than 2MB');
        return;
      }

      setIcon(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIcon = () => {
    setIcon(null);
    setIconPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('baseUrl', formData.baseUrl);
      formDataToSend.append('isActive', formData.isActive);
      
      if (icon) {
        formDataToSend.append('icon', icon);
      }

      const url = service 
        ? `http://localhost:3001/api/streaming-services/${service._id}`
        : 'http://localhost:3001/api/streaming-services';
      
      const method = service ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        setMessage(service ? 'Streaming service updated successfully!' : 'Streaming service created successfully!');
        setTimeout(() => {
          onSubmit();
        }, 1500);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {service ? 'Edit Streaming Service' : 'Add New Streaming Service'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('Error') 
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' 
                : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Netflix, Amazon Prime, etc."
              />
            </div>

            {/* Base URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Base URL *
              </label>
              <input
                type="url"
                name="baseUrl"
                value={formData.baseUrl}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://www.netflix.com"
              />
            </div>


            {/* Icon Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Service Icon
              </label>
              <div className="space-y-3">
                {iconPreview && (
                  <div className="relative inline-block">
                    <img
                      src={iconPreview}
                      alt="Icon preview"
                      className="h-16 w-16 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeIcon}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload a square icon (PNG, JPG, SVG). Max size: 2MB
                </p>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                Active (visible to users)
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : (service ? 'Update Service' : 'Create Service')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StreamingServiceForm;
