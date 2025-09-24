@echo off
echo Starting MovieMatic Application...
echo.

echo Starting Backend Server...
echo Backend will be available at: http://localhost:3001
echo Image uploads will be stored in: server/uploads/
echo.
start "Backend Server" cmd /k "cd server && npm run dev"

echo.
echo Starting Frontend...
echo Frontend will be available at: http://localhost:5173
echo.
start "Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul
