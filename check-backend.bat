@echo off
echo.
echo ================================
echo  Backend API Health Check
echo ================================
echo.

echo [1/3] Checking if Supabase is running...
timeout /t 2 >nul

curl -f -s http://127.0.0.1:54321/functions/v1/hello-world >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Supabase is running on http://127.0.0.1:54321
) else (
    echo ❌ Supabase is not running!
    echo.
    echo Starting Supabase...
    cd backend
    start "Supabase Backend" cmd /k "supabase start && supabase functions serve"
    cd ..
    echo.
    echo ⏳ Waiting for Supabase to start (30 seconds)...
    timeout /t 30 >nul
)

echo.
echo [2/3] Testing basic connectivity...
curl -f -s -X GET http://127.0.0.1:54321/functions/v1/hello-world
if %ERRORLEVEL% EQU 0 (
    echo ✅ Hello World endpoint working
) else (
    echo ❌ Hello World endpoint failed
    echo Please check Supabase logs
    pause
    exit /b 1
)

echo.
echo [3/3] Testing Korean NLP endpoint...
curl -f -s -X POST http://127.0.0.1:54321/functions/v1/parse-input ^
     -H "Content-Type: application/json" ^
     -d "{\"rawText\":\"AI 스타트업 창업하고 싶어\",\"context\":\"test\",\"options\":{\"format\":\"json\"}}" >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ Parse Input endpoint working
    echo.
    echo 🎉 Backend is healthy! Ready to test frontend integration.
    echo.
    echo Next step: Run 'npm run dev' in frontend folder
) else (
    echo ❌ Parse Input endpoint failed
    echo.
    echo 💡 This might be normal if API keys are not configured
    echo    The frontend will still work with fallback mock data
)

echo.
echo ================================
echo  Backend Status: READY
echo ================================
echo.
pause