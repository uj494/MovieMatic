#!/bin/bash

# MovieMatic Deployment Script
echo "🚀 Starting MovieMatic deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy MovieMatic to production"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No remote repository found!"
    echo "Please add your GitHub repository:"
    echo "git remote add origin https://github.com/yourusername/moviematic.git"
    echo "Then run this script again."
    exit 1
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel.com and deploy your frontend"
echo "2. Go to Railway.app and deploy your backend"
echo "3. Set up MongoDB Atlas database"
echo "4. Configure environment variables"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions!"

