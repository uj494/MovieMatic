import API_BASE_URL from '../config/api.js';
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '${API_BASE_URL}';

export default API_BASE_URL;

