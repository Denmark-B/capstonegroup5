@echo off
title Lost and Found - http://localhost:8000
cd /d "%~dp0"
echo.
echo  Lost ^& Found website is running at:  http://localhost:8000
echo  Keep this window OPEN while using the site. Close it to stop.
echo  (MySQL must be started in the XAMPP Control Panel.)
echo.
start "" "http://localhost:8000/"
"C:\xampp\php\php.exe" -S localhost:8000 router.php
echo.
echo  The server stopped. If it says the port is in use, close the other program using port 8000
echo  (for example Laravel "php artisan serve") and try again.
pause
