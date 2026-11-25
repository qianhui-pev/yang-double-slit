@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0.."
echo === 回退到上一次文案备份并重新打包 ===
echo.
py -3 "文案\rollback_copy.py"
echo.
pause
