import API_BASE_URL from '../config/api.js';
import { useState, useEffect } from 'react';
import StreamingServiceForm from './StreamingServiceForm';

const StreamingServicesList = () => {
  const [streamingServices, setStreamingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    fetchStreamingServices();
  }, []);

  const fetchStreamingServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/streaming-services/admin`);
      if (response.ok) {
        const services = await response.json();
        setStreamingServices(services);
      } else {
        setError('Failed to fetch streaming services');
      }
    } catch (error) {
      setError('Error fetching streaming services');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this streaming service?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/streaming-services/${serviceId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setStreamingServices(prev => prev.filter(service => service._id !== serviceId));
        } else {
          setError('Failed to delete streaming service');
        }
      } catch (error) {
        setError('Error deleting streaming service');
        console.error('Error:', error);
      }
    }
  };

  const handleToggleActive = async (serviceId, currentStatus) => {
    try {
      const service = streamingServices.find(s => s._id === serviceId);
      const response = await fetch(`${API_BASE_URL}/api/streaming-services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...service,
          isActive: !currentStatus
        })
      });
      
      if (response.ok) {
        const updatedService = await response.json();
        setStreamingServices(prev => 
          prev.map(s => s._id === serviceId ? updatedService : s)
        );
      } else {
        setError('Failed to update streaming service');
      }
    } catch (error) {
      setError('Error updating streaming service');
      console.error('Error:', error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingService(null);
  };

  const handleFormSubmit = () => {
    fetchStreamingServices();
    handleFormClose();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Streaming Services
        </h1>
        <button
          onClick={handleAddService}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add New Service
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Base URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {streamingServices.map((service) => (
                <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {service.icon ? (
                        <img
                          src={`${API_BASE_URL}${service.icon}`}
                          alt={service.name}
                          className="h-8 w-8 rounded-lg mr-3"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg mr-3 flex items-center justify-center bg-gray-500">
                          <span className="text-white text-sm font-bold">
                            {service.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {service.baseUrl}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        service.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(service._id, service.isActive)}
                        className={`${
                          service.isActive
                            ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                        }`}
                      >
                        {service.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteService(service._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {streamingServices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            No streaming services found. Add your first service to get started.
          </div>
        </div>
      )}

      {isFormOpen && (
        <StreamingServiceForm
          service={editingService}
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default StreamingServicesList;
