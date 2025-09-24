# 📦 Direct Deployment Package

## Files to Upload for Frontend (Vercel)

Upload the entire `moviematic` folder to Vercel, but make sure these files are present:

### Required Files:
- `package.json` ✅
- `vite.config.js` ✅
- `index.html` ✅
- `src/` folder ✅
- `public/` folder ✅

### Environment Variables to Set in Vercel:
- `VITE_API_URL` = `https://your-backend-url.railway.app`

## Files to Upload for Backend (Railway)

Upload the `moviematic/server` folder to Railway:

### Required Files:
- `package.json` ✅
- `server.js` ✅
- `models/` folder ✅
- `routes/` folder ✅
- `middleware/` folder ✅
- `uploads/` folder ✅

### Environment Variables to Set in Railway:
- `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/moviematic`
- `JWT_SECRET` = `your-secret-key-here`
- `PORT` = (Railway will set this automatically)

## Database Setup (MongoDB Atlas)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster (free tier)
4. Get connection string
5. Add to Railway environment variables

## Step-by-Step Process

### 1. Prepare Frontend
- Zip the `moviematic` folder
- Upload to Vercel
- Set environment variable

### 2. Prepare Backend
- Zip the `moviematic/server` folder
- Upload to Railway
- Set environment variables

### 3. Test
- Check if backend is running
- Check if frontend can connect
- Test all features

## Troubleshooting

### Common Issues:
1. **CORS errors**: Update CORS settings in server.js with your frontend URL
2. **Environment variables**: Make sure they're set correctly
3. **File uploads**: Check if hosting platform supports file storage

### Update CORS in server.js:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app', // Replace with your actual URL
    'https://your-frontend-url.netlify.app'  // Replace with your actual URL
  ],
  credentials: true
}));
```

## Success! 🎉

Once both are deployed:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`
- Database: MongoDB Atlas (cloud)

Your MovieMatic app will be live and accessible worldwide!

