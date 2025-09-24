import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { ReviewProvider } from './context/ReviewContext';
import ThemeToggle from './components/ThemeToggle';
import UserHome from './pages/UserHome';
import MovieDetails from './pages/MovieDetails';
import BrowseMovies from './pages/BrowseMovies';
import Home from './pages/Home';
import UploadMovies from './pages/UploadMovies';
import ViewMovies from './pages/ViewMovies';
import AdminStreamingServices from './pages/AdminStreamingServices';
import AdminHomepageSections from './pages/AdminHomepageSections';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import Watchlist from './pages/Watchlist';
import ProtectedRoute from './components/ProtectedRoute';

// Navigation component for admin pages
const AdminNavigation = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              MovieMatic Admin
            </Link>
          </div>
          <nav className="flex items-center space-x-8">
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin')
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/upload"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin/upload')
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Upload Movie
            </Link>
            <Link
              to="/admin/movies"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin/movies')
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Manage Movies
            </Link>
            <Link
              to="/admin/streaming-services"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin/streaming-services')
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Streaming Services
            </Link>
            <Link
              to="/admin/homepage-sections"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin/homepage-sections')
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Homepage Sections
            </Link>
            <Link
              to="/"
              className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              View Site
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WatchlistProvider>
          <ReviewProvider>
            <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Routes>
              {/* User-facing routes */}
              <Route path="/" element={<UserHome />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/browse" element={<BrowseMovies />} />
              <Route path="/genre/:genre" element={<BrowseMovies />} />
              
              {/* Authentication routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              <Route path="/watchlist" element={
                <ProtectedRoute>
                  <Watchlist />
                </ProtectedRoute>
              } />
              
              {/* Admin routes with navigation */}
              <Route path="/admin" element={
                <>
                  <AdminNavigation />
                  <Home />
                </>
              } />
              <Route path="/admin/upload" element={
                <>
                  <AdminNavigation />
                  <UploadMovies />
                </>
              } />
                       <Route path="/admin/movies" element={
                         <>
                           <AdminNavigation />
                           <ViewMovies />
                         </>
                       } />
                       <Route path="/admin/streaming-services" element={
                         <>
                           <AdminNavigation />
                           <AdminStreamingServices />
                         </>
                       } />
                       <Route path="/admin/homepage-sections" element={
                         <>
                           <AdminNavigation />
                           <AdminHomepageSections />
                         </>
                       } />
            </Routes>
          </div>
            </Router>
          </ReviewProvider>
        </WatchlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
