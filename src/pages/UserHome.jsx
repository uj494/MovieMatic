import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // basic styles
import "swiper/css/pagination"; 
import { Pagination } from "swiper/modules";
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import '../styles/swiper-custom.css';
import API_BASE_URL from '../config/api.js';

const UserHome = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [popularGenres, setPopularGenres] = useState([]);
  const [homepageSections, setHomepageSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedMovie();
    PopularGenres();
    fetchHomepageSections();
  }, []);

  const fetchFeaturedMovie = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/week/featured`);
      if (response.ok) {
        const movie = await response.json();
        setFeaturedMovie(movie);
      }
    } catch (error) {
      console.log('No featured movie set');
    }
  };
  const PopularGenres = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies/genres/popular`);
      const genres = await response.json();
      setPopularGenres(genres);
    } catch (error) {
      console.log('No popular genres set');
    }
  };

  const fetchHomepageSections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage-sections`);
      const sections = await response.json();
      setHomepageSections(sections);
    } catch (error) {
      console.log('No homepage sections set');
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Main Content */}
      <main>
        {/* Movie of the Week Banner */}
        {featuredMovie && (
          <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="space-y-6">
                  <div className="inline-flex items-center px-3 py-1 bg-yellow-500 text-yellow-900 text-sm font-medium rounded-full">
                    🏆 Movie of the Week
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                    {featuredMovie.title}
                  </h1>
                  <p className="text-xl text-gray-300 leading-relaxed">
                    {featuredMovie.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <span className="flex items-center">
                      <span className="text-yellow-400 mr-2">★</span>
                      {featuredMovie.rating}/10
                    </span>
                    <span>{featuredMovie.releaseYear}</span>
                    <span>{formatDuration(featuredMovie.duration)}</span>
                    <span>{featuredMovie.director}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {featuredMovie.genre.slice(0, 4).map((genre, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 text-white text-sm rounded-full backdrop-blur-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/movie/${featuredMovie._id}`}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Learn More
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>

                {/* Landscape Image */}
                {featuredMovie.landscapeImage && (
                  <div className="relative">
                    <img
                      src={`${API_BASE_URL}${featuredMovie.landscapeImage}`}
                      alt={featuredMovie.title}
                      className="w-full h-80 lg:h-96 object-cover rounded-lg shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* popular genres */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
              Popular Genres
            </h2>
            <div className="flex flex-wrap gap-4">
              {popularGenres.map((genre) => (
                <Link to={`/genre/${genre}`} key={genre}>
                <button
                  key={genre}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {genre}
                </button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Homepage Sections */}
        {homepageSections.map((section) => (
          <section key={section._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
                {section.title}
              </h2>

              {/* Mobile: slider */}
              <div className="block md:hidden relative overflow-hidden">
                {section.movieIds && section.movieIds.length > 0 ? (
                  <Swiper
                    modules={[Pagination]}
                    spaceBetween={16}
                    slidesPerView={2.1}
                    pagination={{ 
                      clickable: true,
                      dynamicBullets: true,
                      dynamicMainBullets: 3,
                      renderBullet: function (index, className) {
                        return '<span class="' + className + '"></span>';
                      }
                    }}
                    className="action-swiper"
                    watchSlidesProgress={true}
                    watchSlidesVisibility={true}
                  >
                    {section.movieIds.map((movie) => (
                        <SwiperSlide key={movie._id}>
                          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/70 transition-shadow border border-gray-200 dark:border-gray-700 group h-full'>
                            <MovieCard movie={movie} />
                          </div>
                        </SwiperSlide>
                      )
                    )}
                  </Swiper>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No movies available in this section
                  </div>
                )}
              </div>

              {/* Desktop: slider */}
              <div className="hidden md:block relative overflow-hidden">
                {section.movieIds && section.movieIds.length > 0 ? (
                  <Swiper
                    modules={[Pagination]}
                    spaceBetween={16}
                    slidesPerView={4.2}
                    breakpoints={{
                      640: {
                        slidesPerView: 2.2,
                      },
                      768: {
                        slidesPerView: 3.2,
                      },
                      1024: {
                        slidesPerView: 4.2,
                      },
                    }}
                    pagination={{ 
                      clickable: true,
                      dynamicBullets: true,
                      dynamicMainBullets: 3,
                      renderBullet: function (index, className) {
                        return '<span class="' + className + '"></span>';
                      }
                    }}
                    className="action-swiper"
                    watchSlidesProgress={true}
                    watchSlidesVisibility={true}
                  >
                    {section.movieIds.map((movie) => (
                        <SwiperSlide key={movie._id}>
                          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/70 transition-shadow border border-gray-200 dark:border-gray-700 group h-full'>
                            <MovieCard movie={movie} />
                          </div>
                        </SwiperSlide>
                      )
                    )}
                  </Swiper>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No movies available in this section
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-center text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} MovieMatic. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default UserHome;
