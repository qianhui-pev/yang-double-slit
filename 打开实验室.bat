@echo off
title YDS Optics Lab
cd /d "%~dp0"
start "" /min cmd /c "python -m http.server 8410 --directory dist"
timeout /t 2 >nul
start "" "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:8410
timeout /t 8 >nul
start "" http://127.0.0.1:8410/index.html
echo.
echo   本机: http://127.0.0.1:8410/index.html
echo   公网: 看上面 cloudflared 窗口里 https://xxxx.trycloudflare.com 那一行
echo.
echo   关掉这两个黑窗口 = 关闭服务
pause
