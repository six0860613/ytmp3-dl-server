@echo off
cd /d F:\MFEE19\practice\ytmp3-dl-server
echo Building the project...
nvm use 20
node -v
call npm start
pause