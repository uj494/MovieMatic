# 🎬 MovieMatic - Free Deployment Guide

Deploy your MovieMatic application for **FREE** using these hosting platforms!

## 🚀 Quick Start (5 minutes)

### 1. **Push to GitHub**
```bash
# In your moviematic folder
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/moviematic.git
git push -u origin main
```

### 2. **Deploy Frontend (Vercel)**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Set **Root Directory** to `moviematic`
6. Add Environment Variable: `VITE_API_URL` = `https://your-backend-url.railway.app`
7. Click "Deploy"

### 3. **Deploy Backend (Railway)**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set **Root Directory** to `moviematic/server`
6. Add Environment Variables:
   - `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/moviematic`
   - `JWT_SECRET` = `your-secret-key`
7. Deploy!

### 4. **Set Up Database (MongoDB Atlas)**
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster (free tier)
4. Get connection string
5. Add to Railway environment variables

## 💰 Cost: $0/month!

- **Vercel**: Free tier (100GB bandwidth)
- **Railway**: $5 credit monthly (usually enough)
- **MongoDB Atlas**: Free tier (512MB storage)

## 🔧 Configuration

The project is already configured for deployment:
- ✅ API URLs use environment variables
- ✅ CORS configured for production domains
- ✅ Build scripts ready
- ✅ Environment variable support

## 📱 Your Live URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **Database**: MongoDB Atlas (cloud)

## 🎯 Features Included

- ✅ User authentication
- ✅ Movie management
- ✅ Watchlist functionality
- ✅ Reviews and ratings
- ✅ Streaming platforms
- ✅ Admin panel
- ✅ Responsive design
- ✅ File uploads

## 🆘 Need Help?

1. Check the detailed guide in `DEPLOYMENT.md`
2. Make sure all environment variables are set
3. Verify CORS settings match your frontend URL
4. Test API endpoints after deployment

## 🎉 Success!

Once deployed, your MovieMatic app will be live and accessible worldwide!

