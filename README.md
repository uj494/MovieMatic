# MovieMatic 🎬

A modern web application for uploading and managing movie details with a MongoDB backend.

## Features

### **User-Facing Features:**
- **Public Home Page**: Beautiful landing page with search functionality
- **Search Bar**: Search movies by title, director, actor, or description
- **Movie of the Week Banner**: Featured movie showcase with landscape image
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Dark Theme**: Beautiful dark mode with theme toggle and system preference detection

### **Admin Features:**
- **Admin Dashboard**: Centralized management interface
- **Movie Upload Form**: Comprehensive form with image uploads and validation
- **Image Management**: Upload portrait (poster) and landscape (banner) images
- **Movie Database**: MongoDB storage with detailed movie information
- **Edit Movies**: Full editing capability for all movie details including images
- **Delete Movies**: Safe deletion with confirmation modal
- **Featured Movies**: Mark movies as "Movie of the Week" for public display
- **Real-time Updates**: View uploaded movies immediately with instant updates
- **Data Validation**: Server-side and client-side validation
- **File Upload**: Secure image upload with size limits and type validation
- **Routing**: Clean URL structure with React Router

## Movie Details Captured

- **Basic Information**: Title, Director, Release Year, Duration, Description
- **Images**: Portrait (poster) and Landscape (banner) image uploads
- **Classification**: Genre, Rating (0-10), Language, Country
- **Cast & Crew**: Cast members, Awards
- **Financial Data**: Budget, Box Office revenue
- **Status**: Release status (released/unreleased), Movie of the Week
- **Metadata**: Creation and update timestamps

## Tech Stack

### Frontend
- React 19
- Tailwind CSS 4
- Vite (Build tool)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd moviematic

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Create a database named `moviematic`

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string

### 3. Environment Configuration

```bash
# Copy the environment example file
cd server
cp env.example .env

# Edit .env file with your MongoDB connection
MONGODB_URI=mongodb://localhost:27017/moviematic
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moviematic
PORT=5000
```

### 4. Start the Application

#### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

#### Terminal 2 - Frontend Development Server
```bash
# In the root directory
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Usage

### Navigation
- **Home** (`/`): Landing page with overview and navigation
- **Upload Movie** (`/upload`): Add new movies to your collection
- **View Movies** (`/movies`): Browse, edit, and manage existing movies

### Uploading a Movie
1. Navigate to the "Upload Movie" page (`/upload`)
2. Fill in the required fields (marked with *)
3. Select genres from the checkbox list
4. Add optional details like cast, budget, awards
5. Click "Upload Movie"

### Viewing and Managing Movies
1. Navigate to the "View Movies" page (`/movies`)
2. Browse uploaded movies in a responsive grid
3. Use Edit and Delete buttons to manage each movie
4. See all movie details including posters

## API Endpoints

- `GET /api/movies` - Retrieve all movies
- `GET /api/movies/:id` - Retrieve a specific movie
- `POST /api/movies` - Upload a new movie
- `PUT /api/movies/:id` - Update an existing movie
- `DELETE /api/movies/:id` - Delete a movie

## Project Structure

```
moviematic/
├── src/
│   ├── components/
│   │   ├── MovieUploadForm.jsx    # Movie upload form component
│   │   ├── EditMovieModal.jsx     # Edit movie modal
│   │   └── DeleteConfirmationModal.jsx # Delete confirmation modal
│   ├── pages/
│   │   ├── Home.jsx               # Landing page with navigation
│   │   ├── UploadMovies.jsx       # Movie upload page
│   │   └── ViewMovies.jsx         # Movie listing and management page
│   ├── App.jsx                    # Main application with routing
│   ├── main.jsx                   # Application entry point
│   └── index.css                  # Global styles
├── server/
│   ├── models/
│   │   └── Movie.js              # MongoDB schema
│   ├── server.js                 # Express server with CRUD endpoints
│   ├── package.json              # Backend dependencies
│   └── env.example               # Environment variables template
├── package.json                   # Frontend dependencies
└── README.md                      # This file
```

## Customization

### Adding New Movie Fields
1. Update the Movie schema in `server/models/Movie.js`
2. Add form fields in `src/components/MovieUploadForm.jsx`
3. Update the movie list display in `src/components/MovieList.jsx`

### Styling
- The app uses Tailwind CSS for styling
- Custom styles can be added in `src/index.css`
- Component-specific styles are inline with Tailwind classes

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env` file
   - Ensure network access for cloud MongoDB

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill processes using the port: `npx kill-port 5000`

3. **CORS Issues**
   - Backend has CORS enabled for localhost
   - Update CORS settings in `server/server.js` if needed

### Development Tips

- Use `npm run dev` for both frontend and backend during development
- Check browser console and terminal for error messages
- MongoDB Compass can be helpful for database inspection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
- Check the troubleshooting section
- Review MongoDB documentation
- Open an issue on GitHub

---

**Happy Movie Management! 🎭🍿**
