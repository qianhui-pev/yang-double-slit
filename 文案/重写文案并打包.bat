@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0.."
set "PY=py -3"
%PY% -c "import fontTools" 2>nul
if errorlevel 1 (
  echo [x] 这台电脑的 Python 还没装 fontTools，字体子集化跑不了。
  echo     先双击「安装构建依赖.bat」一次，再回来跑这个。
  pause & exit /b 1
)
echo === 应用 文案/strings.json 里的新文案并重新打包 ===
echo.
%PY% "文案\apply_copy.py"
set RC=%errorlevel%
echo.
if not "%RC%"=="0" echo   ^(退出码 %RC%^)
pause
