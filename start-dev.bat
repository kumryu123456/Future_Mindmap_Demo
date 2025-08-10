@echo off
echo.
echo ================================
echo  Future Mindmap Demo - Dev Setup
echo ================================
echo.

echo [1/3] Starting Supabase backend...
cd backend
start "Supabase Backend" cmd /k "supabase start && echo Backend started at http://127.0.0.1:54321 && supabase functions serve"
cd ..

echo.
echo [2/3] Installing frontend dependencies...
cd frontend
call npm install

echo.
echo [3/3] Starting frontend development server...
start "Frontend Dev Server" cmd /k "npm run dev"
cd ..

echo.
echo ================================
echo  Development servers starting...
echo ================================
echo  Backend:  http://127.0.0.1:54321
echo  Frontend: http://127.0.0.1:5173
echo ================================
echo.

timeout /t 5
echo Opening browser...
start http://127.0.0.1:5173

pause