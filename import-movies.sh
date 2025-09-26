#!/bin/bash

echo "🎬 MovieMatic TMDB Import Script"
echo "================================"
echo

echo "📦 Installing dependencies..."
npm install

echo
echo "🚀 Starting movie import..."
echo

npm run import

echo
echo "✅ Import completed!"
