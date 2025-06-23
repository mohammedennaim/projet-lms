@echo off
echo ====================================
echo     Demarrage du Systeme LMS
echo ====================================
echo.

REM Demarrer le serveur backend
echo Demarrage du serveur backend Symfony...
cd /d "c:\Users\Youcode\Videos\projet-lms\BackEnd"
start "Backend Server" cmd /k "php -S localhost:8000 -t public"

REM Attendre 3 secondes
timeout /t 3 /nobreak > nul

REM Demarrer le serveur frontend
echo Demarrage du serveur frontend React...
cd /d "c:\Users\Youcode\Videos\projet-lms\FrontEnd"
start "Frontend Server" cmd /k "npm start"

echo.
echo ====================================
echo Les serveurs sont en cours de demarrage...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo ====================================
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause > nul
