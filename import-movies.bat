@echo off
echo 🎬 MovieMatic TMDB Import Script
echo ================================
echo.

echo 📦 Installing dependencies...
call npm install

echo.
echo 🚀 Starting movie import...
echo.

call npm run import

echo.
echo ✅ Import completed!
pause
