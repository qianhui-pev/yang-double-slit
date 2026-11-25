# 双缝之外 · 杨氏干涉实验室 — 发布说明

## 一、这是什么

单文件网页（`index.html`，约 1.45 MB / 1521175 字节，字体已子集化内嵌），零外链、零依赖、断网可用。
GitHub Pages 直接托管这个目录即可，访问形式：`https://<你的用户名>.github.io/<仓库名>/`

## 二、怎么发（网页上点就行，不用命令行）

1. 在 GitHub 网页点 **New repository**，名字随便（例如 `yang-double-slit`），**Public**。
2. 仓库页点 **Add file → Upload files**，把这个 `docs` 文件夹里的 `index.html` 和 `.nojekyll` 一起拖进去（`.nojekyll` 是隐藏文件，Windows 资源管理器要先开「显示隐藏文件」）。
3. 仓库 **Settings → Pages** → Source 选 **Deploy from a branch** → Branch 选 `main`、目录选 **`/docs`** → Save。
4. 等 1–2 分钟，Pages 页面顶部会给你的链接。

## 三、必须知道的三个事实

1. **公开仓库 = 源码公开。** 控制台口令 `2580` 写在 `boot.js`（会内联进 index.html）里，任何人 `Ctrl+F` 就能找到。
   所以它挡得住"顺手点进来"，挡不住"想进去的人"。
2. **但控制台里没有别人的数据。** 控制台读的是**访问者自己这台浏览器的 localStorage**；全班档案从来不在服务器上，是老师用「导入学生档案」把学生导出的 JSON 合并进自己电脑的。
   也就是说：公开链接上随便谁点进控制台，看到的都是**他自己机器的空档案**。真正的隐私边界是"数据不集中"，不是口令。
3. **想连口令都不给看**，只有两条路：① 私有仓库 + Pages（GitHub 免费号不支持私有仓库开 Pages，要付费版）；② 学生拿到的版本**不含教师视图代码**（另出一个 index-student.html）。

## 四、本地（离线）用法

教室没网就用根目录的 `dist\index.html` 或 `打开实验室.bat`，功能完全一样，存档也各存在各自浏览器里。

## 五、更新流程

改完源码：`python build.py` → 会把 `src` 内联成 `dist/index.html`；
再把 `dist/index.html` 覆盖到 `docs/index.html`，然后网页上重新上传即可。
（`双缝之外-杨氏干涉实验室.zip` 只是给静态托管用的单文件包，Pages 不需要。）
