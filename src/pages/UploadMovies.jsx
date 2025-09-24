import MovieUploadForm from '../components/MovieUploadForm';

const UploadMovies = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Upload New Movie</h1>
        <p className="text-gray-600 dark:text-gray-300">Add a new movie to your collection with detailed information</p>
      </div>
      
      <MovieUploadForm />
    </div>
  );
};

export default UploadMovies;
