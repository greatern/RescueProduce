@echo off
set NODE_ENV=development
cd android
gradlew assembleDebug
cd ..
echo.
echo APK built at: android\app\build\outputs\apk\debug\app-debug.apk
pause