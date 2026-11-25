@echo off
chcp 65001 >nul
set "P=%~dp0dist\index.html"
set "P=%P:\=/%"
start "" "file:///%P%?dev=1"
exit
