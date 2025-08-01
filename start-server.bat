 @echo off
echo Démarrage du serveur depuis le répertoire monrpg...
cd /d "%~dp0"
python -m http.server 5500
pause 