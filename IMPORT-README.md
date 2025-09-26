# 🎬 TMDB Movie Import Script

This script allows you to import 20 popular movies from The Movie Database (TMDB) into your MovieMatic database.

## ✨ Features

- **Duplicate Check**: Automatically checks if movies already exist before importing
- **Complete Data**: Imports title, description, genre, year, rating, poster, and trailer
- **Local Image Storage**: Downloads and saves poster images locally to your server
- **Rate Limiting**: Respects TMDB API rate limits with delays
- **Error Handling**: Robust error handling and detailed logging
- **Progress Tracking**: Shows real-time import progress and summary

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Copy the import package.json to package.json
cp import-package.json package.json

# Install dependencies
npm install
```

### 2. Set Environment Variables

Make sure your `.env` file contains your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moviematic
```

### 3. Run the Import Script

```bash
npm run import
```

## 📋 What Gets Imported

For each movie, the script imports:

- **Title**: Movie title
- **Description**: Plot overview
- **Genre**: Mapped to your genre format
- **Year**: Release year
- **Rating**: TMDB average rating (rounded to 1 decimal)
- **Poster**: High-quality poster image URL
- **Trailer**: YouTube trailer URL (if available)
- **Streaming Services**: Empty (can be filled manually later)

## 🔍 Duplicate Detection

The script checks for duplicates using:
- **Title**: Case-insensitive matching
- **Year**: Exact year match

If a movie with the same title and year exists, it will be skipped.

## 📊 Sample Output

```
🎬 Starting TMDB Movie Import...
📋 This will import 20 popular movies from TMDB
🔍 Checking for duplicates before importing...

Connected to MongoDB
Fetching popular movies from TMDB...
Found 20 popular movies
✅ Imported "Spider-Man: No Way Home" (2021)
⏭️  Skipping "The Batman" - already exists in database
✅ Imported "Top Gun: Maverick" (2022)
...

📊 Import Summary:
✅ Successfully imported: 15 movies
⏭️  Skipped (already exists): 5 movies
📝 Total processed: 20 movies
Database connection closed
```

## ⚙️ Configuration

### TMDB API Settings
- **API Key**: Already configured in the script
- **Rate Limit**: 250ms delay between requests
- **Movies Count**: 20 movies per run

### Database Settings
- **Schema**: Matches your existing Movie model
- **Table Name**: `movie_details` (corrected)
- **Connection**: Uses MONGODB_URI from environment

### Image Handling
- **Poster Download**: Automatically downloads poster images from TMDB
- **Local Storage**: Saves images to `server/uploads/` folder
- **Database Path**: Stores local path (`/uploads/filename.jpg`) instead of TMDB URL
- **File Naming**: Safe filenames with timestamp to prevent conflicts

## 🛠️ Customization

### Change Number of Movies
Edit line 47 in `import-movies.js`:
```javascript
return data.results.slice(0, 20); // Change 20 to desired number
```

### Add More Genre Mapping
Edit the `mapGenres` function to add more genre mappings.

### Change Rate Limit
Edit line 120 in `import-movies.js`:
```javascript
await new Promise(resolve => setTimeout(resolve, 250)); // Change 250ms
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MONGODB_URI in .env file
   - Ensure MongoDB Atlas allows connections from your IP

2. **TMDB API Error**
   - Check if API key is valid
   - Verify rate limits aren't exceeded

3. **Import Errors**
   - Check console output for specific error messages
   - Ensure all required fields are present

### Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your environment variables
3. Test your MongoDB connection separately

## 📝 Notes

- The script uses TMDB's "popular" movies endpoint
- Trailers are only imported if available on YouTube
- Streaming services are left empty for manual configuration
- All imported movies are set as non-featured by default

Happy importing! 🎬✨
