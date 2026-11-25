@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0.."
echo === 重新扫描源码，刷新 文案/文案清单.html（已填的新文案会保留）===
echo.
py -3 "文案\gen_inventory.py"
echo.
pause
