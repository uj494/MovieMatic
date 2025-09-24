import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center py-16">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-6">
          MovieMatic Admin Dashboard 🎬
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          Manage your movie collection, upload new films, and curate the perfect cinematic experience for your users.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            to="/admin/upload"
            className="group p-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">📤</div>
              <h3 className="text-2xl font-bold text-white mb-3">Upload Movies</h3>
              <p className="text-blue-100 mb-4">
                Add new movies to your collection with comprehensive details including cast, genres, ratings, and images.
              </p>
              <div className="inline-flex items-center text-blue-100 group-hover:text-white transition-colors">
                <span className="mr-2">Get Started</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
          
          <Link
            to="/admin/movies"
            className="group p-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-2xl font-bold text-white mb-3">Manage Collection</h3>
              <p className="text-purple-100 mb-4">
                Browse your movie collection, edit details, manage images, and set featured movies of the week.
              </p>
              <div className="inline-flex items-center text-purple-100 group-hover:text-white transition-colors">
                <span className="mr-2">Manage Now</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-3xl mb-3">🚀</div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Fast & Efficient</h4>
            <p className="text-gray-600 dark:text-gray-300">Quick upload and management with real-time updates</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Secure Storage</h4>
            <p className="text-gray-600 dark:text-gray-300">Your data is safely stored in MongoDB database</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">📱</div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Responsive Design</h4>
            <p className="text-gray-600 dark:text-gray-300">Works perfectly on all devices and screen sizes</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Public Site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
