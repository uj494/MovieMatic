# 🚀 MovieMatic Deployment Guide

## Free Hosting Options

### Option 1: Vercel (Frontend) + Railway (Backend) - RECOMMENDED

#### Frontend Deployment (Vercel)
1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/moviematic.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Set **Root Directory** to `moviematic` (your frontend folder)
   - Add Environment Variable: `VITE_API_URL` = `https://your-backend-url.railway.app`
   - Click "Deploy"

#### Backend Deployment (Railway)
1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Set Root Directory to `moviematic/server`**
6. **Add Environment Variables:**
   - `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/moviematic?retryWrites=true&w=majority`
   - `JWT_SECRET` = `your-secret-key`
   - `PORT` = (Railway will set this automatically)

### Option 2: Netlify (Frontend) + Render (Backend)

#### Frontend on Netlify
1. **Go to [netlify.com](https://netlify.com)**
2. **Connect GitHub repository**
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `moviematic/dist`
   - Environment Variable: `VITE_API_URL` = `https://your-backend-url.onrender.com`

#### Backend on Render
1. **Go to [render.com](https://render.com)**
2. **Create new Web Service**
3. **Connect GitHub repository**
4. **Settings:**
   - Root Directory: `moviematic/server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `MONGODB_URI`
     - `JWT_SECRET`

## Database Setup (MongoDB Atlas)

1. **Go to [mongodb.com/atlas](https://mongodb.com/atlas)**
2. **Create free account**
3. **Create new cluster (free tier)**
4. **Get connection string:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/moviematic?retryWrites=true&w=majority
   ```

## Configuration Changes Made

### 1. API Configuration
- Created `src/config/api.js` for centralized API URL management
- Updated all API calls to use `API_BASE_URL` instead of hardcoded localhost

### 2. Environment Variables
- Frontend: `VITE_API_URL` (for Vite to pick up)
- Backend: `MONGODB_URI`, `JWT_SECRET`, `PORT`

## Step-by-Step Deployment

### 1. Prepare Your Code
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Set Up Database
- Create MongoDB Atlas account
- Create free cluster
- Get connection string
- Whitelist all IPs (0.0.0.0/0) for development

### 3. Deploy Backend First
- Deploy to Railway or Render
- Add environment variables
- Test the API endpoints

### 4. Deploy Frontend
- Deploy to Vercel or Netlify
- Add environment variable: `VITE_API_URL` = your backend URL
- Test the complete application

## Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Database connection is working
- [ ] Frontend can connect to backend
- [ ] All features work (auth, movies, reviews, etc.)
- [ ] File uploads work (for movie posters, streaming service icons)
- [ ] CORS is properly configured

## Troubleshooting

### Common Issues:
1. **CORS errors**: Make sure backend allows your frontend domain
2. **Environment variables**: Check they're set correctly in hosting platform
3. **Database connection**: Verify MongoDB URI is correct
4. **File uploads**: Check if hosting platform supports file storage

### Backend CORS Configuration:
Make sure your server.js has:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.vercel.app'],
  credentials: true
}));
```

## Free Tier Limits

### Vercel:
- 100GB bandwidth/month
- Unlimited deployments
- Custom domains

### Railway:
- $5 credit monthly (usually enough for small apps)
- Automatic deployments
- Custom domains

### MongoDB Atlas:
- 512MB storage
- Shared clusters
- No time limit

## Cost: $0/month! 🎉

