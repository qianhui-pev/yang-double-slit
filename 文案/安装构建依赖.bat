@echo off
chcp 65001 >nul
setlocal
echo === 给本机 Python 安装构建依赖（fonttools / brotli，用清华镜像）===
py -3 -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple fonttools brotli
echo.
py -3 -c "import fontTools,brotli;print('OK: fontTools',fontTools.version)"
pause
