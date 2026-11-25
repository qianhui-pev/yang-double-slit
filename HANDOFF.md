# HANDOFF · 双缝之外 YDS-01（第五阶段 · 视觉/动效样片 V2+V3 已落地，待用户拍板）

> 只读这一篇就能接着干，不用翻上一轮对话。
> **下一个会话开场直接说**：
> `读 D:\hermes-workspace\courses\yang-double-slit\HANDOFF.md，接着做 U 趟`
>
> 本文件已重写为「当前状态」而不是「变更流水」，旧的分节记录（第 9–18 节）已经合并进来。

---

## 0. 一句话现状

功能全在（6 个学生视图 + 口令控制台 + 调试面板），结构排版 / 字体趟 / U 趟 / 体检 P1–P3 / 手机手感 / 磁吸都已落地；
**动效样片 V2（光谱滑杆）+ V3（幽灵条纹）已实现并量过阈值（见第 16 节）**，等用户滑一遍再决定要不要做第 2 批（V1/V4/V5/V6/V7/V8）。
AI 悬浮球压面板的问题已在 P2-3 修掉（实验台隐藏 FAB）。

| 指标 | 当前值 |
|---|---|
| 交付物 | `dist/index.html` **1471.0 KB**（1511397 字节，单文件、零外链、断网可用） |
| 打包 | `双缝之外-杨氏干涉实验室.zip` **1023.5 KB**（1048024 字节，只含 index.html） |
| 发布副本 | `docs/index.html` + `docs/.nojekyll` + `docs/README-PUBLISH.md`（GitHub Pages 用 `/docs`） |
| 学生流程 | **6 步**：入口 / 前测 / 概念 / 实验 / 后测 / 复盘 |
| 控制台口令 | **2580**（`src/js/boot.js` 的 `CONSOLE_CODE`，改一行即可换） |
| 字号字符集 | 978 个字符（自动扫出来的，决定字体子集；**文案一改就要重建**） |
| 视觉自查 | 桌面 1431/1431、手机 390/390 无横向溢出（越界元素只在 `overflow-x:auto` 容器内）；8 条路由 `onerror=[]` |

---

### 0.1 文案第一趟（2026-11-23，已落地）

- 通读 673 条全部文案，按「平直、明白、少 AI 腔」改了 **23 条**（views-concept 8 / tutor 4 / views-lab 3 / analysis 3 / views-enter 2 / views-post 2 / views-pre 1）。
- 主要动作：去掉拟人化比喻（「两条光记得彼此 / 记忆有两种失效方式」→「保持固定的相位关系 / 破坏它的情形有两种」）、去掉「不是…而是」和「那才是…真正的成绩单」这类句式、把破折号长句拆短。
- **技术解释类（干扰项为什么错）一条没动** —— 那是在教学生，改短反而害人。
- 备份：`文案\backup\20261123-165045_agent\`（shell.html + 全部 js），回退 = 整目录覆盖回 `src\` 再 `build.py`。
- 验证：构建 0 错误；缺字 34/7/7（与上一版完全一致，未引入新字）；`__errs=[]`；入口 / 概念 / 实验（任务 02）/ 后测 / 前测 五页实测渲染；1431 与 390 两个宽度 `scrollWidth == clientWidth`。
- 剩余可做：`文案\strings.json` 里 216 条长文案其余部分未通读第二遍；用户若还想再压一轮口语化，按 ID 给批次即可。

## 1. 项目位置与构建

```
D:\hermes-workspace\courses\yang-double-slit\
├─ build.py                  # 内联 CSS/JS **+ 字体子集化与 base64 内嵌**
├─ src\shell.html            # 外壳：顶栏 / 抽屉 / 挂载点
├─ src\css\base.css          # 设计令牌 + 基础组件（原始版，尽量不改）
├─ src\css\app.css           # 各视图布局（原始版）
├─ src\css\refine.css        # ★ 视觉层（19 节起是这几轮的成果，改样式优先改这里）
├─ src\js\                   # physics/core/optics/views-*/fx …
├─ src\_retired\views-eval.js.bak   # 自评互评页，已下线（要恢复：搬回 + 加进 build.py）
├─ build\fontsrc\            # 字体原始文件（站酷小薇 / Orbitron …）
├─ build\fonts\cache\        # 按字符集子集化后的 woff2（哈希命名，可删）
├─ dist\index.html           # ★ 交付物
├─ docs\                     # GitHub Pages 发布副本（index.html + .nojekyll + 发布说明）
├─ 评审模式.url / .bat        # 双击带 DEV 面板打开（可任意跳页 + 一键造数）
├─ 打开实验室.bat             # 双击：起本地服务 8410 + cloudflared 隧道
├─ specimen3.html            # 旧字体样张（中文候选）
├─ specimen4.html            # 新字体样张（科技拉丁 × 艺术中文，1.06 MB 内嵌）
└─ shots\                    # 验收截图：v3*/v4*/spec*/compare-before-after.png
```

**构建**（Windows 用户名含撇号，别用 bash 的 `cd`）：

```python
import subprocess, sys
subprocess.run([sys.executable, "build.py"], cwd=r"D:\hermes-workspace\courses\yang-double-slit")
```

正常输出（首次或字符集变化时约 11 秒，命中缓存 0.1 秒）：

```
  YDS xiaowei    子集 280.4 KB（957 字）
  YDS notoserif  子集 347.2 KB（957 字）
  YDS notosans   子集 266.1 KB（957 字）
  YDS orbit      原样 6.2 KB
  字体 base64 合计 1199.9 KB
built dist/index.html  1436.0 KB
```

**字体管线（build.py 已自动化，别手工改）**
1. 扫 `css + js + shell` 全部文本 → 得到字符集（当前 957）；
2. `fontTools` + `brotli` 按字符集子集化为 woff2，缓存到 `build/fonts/cache/<family>-<hash>.woff2`；
3. 子集后回读 cmap **校验缺字**并打印（小薇缺 34 个数学符号；思源宋/黑各缺 7 个）；
4. base64 内嵌成 `@font-face` 拼在 CSS 最前。
> **改了文案 → 字符集变了 → 必须重跑 build**，否则新字会悄悄回落系统字体，出现混排穿帮。

**发布**：`build` 后把 `dist/index.html` 覆盖到 `docs/index.html`，网页上传到 GitHub 仓库 → Settings → Pages 选 `/docs`。
GitHub 直连在这台机器上不通，走 `ghfast.top` 或网页上传时先开 Clash。

---

## 2. 设计系统（现行，别推翻）

**字体分工**（`refine.css` 第 22 节，全部内嵌、跨设备一致）

| CSS 变量 | 字族 | 用在哪 |
|---|---|---|
| `--display` | `YDS xiaowei`（站酷小薇，OFL，280 KB） | `.display` `.h-sec` `.h-sub` `.arc__lead span` `.gate__t` `.bound__t` `.taskcard h3` |
| `--serif` | `YDS notoserif`（思源宋体，347 KB） | 概念页正文、公式 `.eq`、边注、`.cmp__q` |
| `--sans` | `YDS notosans`（思源黑体，266 KB） | `body` 与界面正文（原来是系统 sans） |
| `--num` | `YDS orbit`（Orbitron，拉丁 6.2 KB） | 只有读数：`.read__v` `.stage__hud b` `.sld__val` `.probe__row b` |
| 保留 | `Cascadia Mono` | 表格数字 `.num` `.stat__v` `.arc__row-v` `.tbl--arc td.num`（**换字会撑破 1339px 的贴合**） |
| 保留 | `Bahnschrift SemiCondensed` | 所有小标签 / 元数据（`.read__k` `.sld__val u` 等） |
| 保留 | `Castellar` | 罗马编号 |

**两条禁令**
- **站酷小薇不能上含数学符号的字符串**（Δ δ θ λ ½ ² ′ ⅓ 都没有）。题干（含 Δy）与边注已改回 `--serif`。
- **Orbitron 只有拉丁**：读数里的中文单位、表格数字一律留在原字体。

**配色/线条令牌**（`refine.css` 顶部）
`--bg #05070A` / `--panel #090C10` / `--rule rgba(158,197,216,.14)`（`-soft .07` / `-hard .26`）/ 唯一暖色 `--laser #FF3B2E` / 状态色 `--jade` `--amber` / 纸面 `--paper #EDE8DC` + `--paper-ink #16151A` `-2 #4A4750` `-3 #8A8578`。
入场曲线 `--ease cubic-bezier(.16,1,.3,1)`。

---

## 3. 已落地（按块，含类名，别重复做也别改坏）

### 3.1 入口 / 顶栏 / 全局（第一阶段）
- 满幅光场 `.stage` + `.stage__scrim` 五段护罩 + `.stage__rail` 竖排档案字 + `.stage__hud` LIVE 仪表（λ/d/L/Δy）。
- 顶栏 64px、底部 `--laser` 渐变腰线；步骤条改"光学导轨"（`.stepper::before` + `.step-dot`）。
- 滑杆 `.sld` 刻度轨 + 已走段发光（`fx.js` 每帧写 `backgroundImage`，**CSS 里不能写 `!important`**）。
- 光谱条 `.specbar`；光场渲染 filmic 滚降 / 三层辉光总 alpha<1 / `1/sqrt(d+58)`。
- `#fxGrain` `#fxVig`（纸面页自动换 multiply 0.14）；换页 `.beam-wipe`、`.view-in` 揭幕。

### 3.2 概念页"档案纸"（P0-1）
- `.paper__strip` 档案条（`003 / 008 · 第二校次`）、`.paper__rail` 竖排 rail（≤1180px 隐藏）、`.paper__stamp` 朱红印章（**≤1500px 隐藏**，1440 屏看不到是正常的）。
- `.sec-rule` 四段式分节线：`I. ——— 光程与光程差 ——— 006 / 024`（编号 Castellar 朱红 / 两侧 34px 细线 / 页码右对齐），四节页码 006/010/014/018。
- 图卡 `.figwrap/.figcap/.figbody/.figfoot`；SVG 标注按 0.705 渲染比例倒推（术语 22、关键量 17、装置名 16 → 屏上 15.5/12.0/11.3px），参考线 1.5px `#4A4750`。
- 画布上**不再写任何文字**（原来 9px 的 `I(y)`、`V ≈` 已被删，见坑 3）。

### 3.3 复盘 / 控制台"档案式表格"（P0-2）
- `.arc` 双栏 `1.95fr / 1fr`（窄列实测 0.327），顶线 `--rule-hard`；左栏罗马编号眉 + 巨型结论（`--roman` clamp 46–74px）+ 副文 + 竖线斜体边注；右栏 `.arc__row` 支撑数据。
- 复盘页边注放左栏副文下方（`48ch`）：放右窄栏会导致右 503 vs 左 150 的大空洞。
- `.tbl--arc` 无外框（`tblwrap` 只留顶/底 `--rule-hard`），表头 din 9.5px 字距 .2em，数字列右对齐 + tabular；学号用 `.numc`（等宽但左对齐）。
- `.compare--arc` 去边框改细线记录串；`@media print` 白纸黑字（实测 meanL 234.6、白像素 89%）。

### 3.4 实验台编辑式层级（P1-1）
- `.labrail`：滚过大标题后固定在顶栏下（`top:64`，≤820px 为 56，条高 46/40），`IntersectionObserver` 观察 `#labhead`（`rootMargin:-66px`）同时置 `data-on` / `data-compact`（后者 `max-height:0` 收起）。
- 任务条当前项 `flex-grow:1.7` → 实测 382 vs 239 = **1.598 倍**；序号 `I.`(Castellar)+`01`(mono)。
- 任务卡 A/B/C 栅格 `.8 / 1.4 / 1`（实测 334/585/418），题头 `.92 / 1.35`，≤980px 单列。

### 3.5 自评互评下线 + 控制台加口令
- `eval` 从 `STEPS` 删除（流程 8→6 步）；`views-eval.js` 移到 `src/_retired/`，`build.py` 不再打包；复盘页"去完成自评与互评"→"打印 / 存 PDF"；控制台 CSV 去掉自评/互评两列；`dev.js` 去掉"填自评互评"。
- 教师端 → **控制台**：标题 `07 / CONSOLE · 控制台`，顶栏按钮"控制台"，**不在步骤条里**。
- `Views.gate`（定义在 `boot.js`）：`CONSOLE_CODE='2580'`；`App.go('teacher')` 被包一层，未解锁一律改写成 `gate`（含 `#teacher` 深链接）；解锁是**会话级**，刷新重新要口令。
- ⚠️ 这是**前端门**：公开仓库里口令可见。可以接受，因为控制台读的是**访问者自己浏览器的 localStorage**，别人的档案根本不在服务器上。

### 3.6 字体趟 T（站酷小薇 + Orbitron）
- 见第 2 节与 3.6 的构建管线；成品 1436 KB。
- 验收：四款 `document.fonts.check` 全 True；`body`=`YDS notosans`、`.h-sec`=`YDS xiaowei`、`.read__v`=`YDS orbit`；教师端表格仍 `1339=1339`；`#reads` 无溢出。

### 3.7 评审模式（用户自测用）
- `评审模式.url` / `评审模式.bat` 双击 → `file:///…/dist/index.html?dev=1`。
- DEV 面板三组：跳页（6 个学生步骤 + **「控制台」**（2026-11-17 补的，点它没解锁就是口令门、输 2580 后进控制台）/ 造数（填前测后测、混合错误、完成 4 任务、含一处错、造记录）/ 档案（一键完整档案、示例学生×4、**切到示例学生**、清空、导出、复制）。
- **改过的行为**：`?dev=1` 打开时 `persist=false`，不写 `localStorage['yds.dev']`（旧版会永久挂面板）；只有 `Ctrl+Shift+D` 手动开关才持久化。

---

### 3.8 U 趟（交互态 / 边框光 / 角标刻度 / 留白节奏 / 空态）
全部写在 `refine.css` **第 23 节**（末尾），另加 4 处 JS 小改（都只加类名/换数值，不动逻辑）：
- **交互态**：`.btn` 悬停抬 1px + 描边按钮一道白色扫光（实心按钮沿用第 4 节自带扫光，paper 页扫光换成淡墨）；按下压回 + 内阴影；`.btn--ghost` 向箭头方向蹭 1px。`.opt[data-sel]` 左缘 2px 朱红细线 `scaleY(0→1)` + `opt-pop` 0.44s 光晕脉冲（paper 页只留细线不脉冲）。`.tasktab` 悬停亮顶线（`::before` 1px 渐隐线）。滑杆 `cursor:grab/grabbing`，拖拽时 thumb `scale(1.15)` + 强辉光（paper 页换朱红）。`.tbl--arc tr:hover` 底色 `.03` + 首列 `inset 2px 0 0 var(--laser)`。
- **边框光**：`.panel/.bench/.taskcard/.pathcard` 边框 `--rule → --rule-hard` 过渡 180ms（paper 页用 `rgba(22,21,26,.16→.36)`）。`.crop` 四角注册标 hover 才亮（`.42 → .82` + 10px 冷光）；新增 `.crop--in` 变体（角标内收 1px），给 `.bench__stage` 用（否则被 `.bench{overflow:hidden}` 裁掉）。
- **角标/刻度**：`.read` 顶部 4px `repeating-linear-gradient` 刻度（透明度 .5）+ 悬停淡色底；`.specbar` 两端加 `380 nm` / `780 nm`，抬到条子上沿、与居中的 `SPECTRUM` 同一行（`margin-top:18px` 是关键，见坑 14）。
- **留白节奏**：新增 `--sp-1:28px / --sp-2:40px / --sp-3:56px`，`.sec-hd` 40、`.paper__strip` 28、`.sec-rule` 56/28、`.arc-note` 28、`.paper__end` 56；JS 里 9 处行内间距 22/26/30/34/36 → 28 或 40（对照表：块内 28、块间 40、大段 56）。窄屏 `@media(max-width:820px)` 的 `.sec-rule` 保持 38/22 不变。
- **空态**：`.reclist__empty` 改成虚线仪器框 + `NO DATA` 眉；教师端空态加 `.empty--arc` 类（`views-teacher.js` 的 `emptyState()`），内嵌 `inset:16px` 虚线框，与实验台空态同一套语言。
- 回归（本次实测）：8 条路由 × 1440/390 均 `scrollWidth == clientWidth`、`onerror=[]`、四款字体 `document.fonts.check` 全 true；控制台 `.tbl--arc` 1348/1348；`.arc` 栅格 861.86 / 441.98（窄列占比 0.327）；`:hover` 用 CDP `Input.dispatchMouseEvent` 实测 `.bench` 边框 0.26、角标 0.82、表行底色 `.03` + `2px` 朱红 inset、`.opt[data-sel]` 细线 `matrix(1,0,0,1)`（= 完全展开）。

### 3.9 文案改稿系统（`文案/` 目录，2026-11-17 建）
用户反馈「有很浓的 AI 说教味」，决定自己重写文案。为此把全部面向学生的文字抽成一张改稿表，让改稿不依赖「模型猜哪句」：
- **`文案/文案清单.html`**：673 条（长文案 ≥16 字共 218 条、含排版标记 225 条、自动标「语气嫌疑」48 条），按页面分组、可按「只长文案 / 带语气标记」筛、可搜关键字；每条有固定 ID `C-001…C-673` 与 `文件:行`。
- **`文案/strings.json`**：同一份数据的改稿表，只填 `新文案` 字段。
- **`文案/apply_copy.py`**：逐条把「带引号的完整原文」在对应源文件里替换；**任何一条 0 命中就整体放弃、一个字都不写**；写前把 `src/` 备份到 `文案/backup/<时间戳>/`；成功后自动 `build.py` → 覆盖 `docs/` → 重打 zip。`--dry` 只预演。
- **`文案/rollback_copy.py`**：还原上一份备份并重新打包（取 `backup/` 里**倒数第二个**时间戳目录，因为最新那份就是当前状态）。
- **`文案/gen_inventory.py`**：重扫源码刷新清单/表，按（文件+原文）**保留已填的新文案**；样式在 `template.html`。
- 双击入口：`重写文案并打包.bat` / `回退上次文案.bat` / `更新文案清单.bat` / `安装构建依赖.bat`（本机 Store 版 Python 3.14 原本没有 fontTools，已用清华镜像装好 4.68.0，实测 `py -3 build.py` 可跑）。
- 端到端实测（改一条 → 构建 → dist 里出现新串 → 回退 → 旧串复原、dist 字节数回到 1518961），构建是确定性的（连跑两次 sha256 一致）。

## 4. 待办

### U 趟 —— 已完成，见 3.8
六项（交互态 / 边框光 / 角标刻度 / 留白节奏 / 空态 / 只写在 `refine.css` 第 23 节）全部落地，
验收数据与实现细节见 **3.8**。别再重做；要改手感就改第 23 节对应小节。

### 文案重写（用户自己在做）
用 `文案/文案清单.html` 挑句子 → 填 `strings.json` 或直接把「ID + 新文案」发我。控制台口令门已按用户意见先改成最短版（`持有口令即可查看数据。` / 提示只剩 `口令由任课教师持有。`，删掉了原来那句「分层、卡点、导出都在这页」的解释性小作文）。

### 已知瑕疵（不算进 U 趟，留给下一轮决定）
- **AI 悬浮球压住参数面板右缘**：`.tutor-fab` 固定 `right:22px/bottom:22px`（50px），实验台右侧参数栏在 1440 宽下占到 x 1048–1384，实测球体覆盖 x 1359–1384 的那 25px，正压在某条滑杆的端点刻度数字上（`elementFromPoint` 实测）。根因是「固定元素 + 满高侧栏」的结构性冲突，任何固定位置都会在某个宽度撞上；单纯平移只能治一个视口宽度。要真修得改交互（例如实验中把球收进面板、或抽屉入口换到顶栏），属设计决策，未擅自改。

### P2 动效（最后，克制）
- 拖 λ 时场色 120ms 插值（现在是离散跟随）。
- 单光子模式落点闪 + 短拖尾。
- 只在 `Δy` 一处做数字滚动，别全站加。

### 其他可选
- 学生版 / 教师版两个 zip（学生版不含 `views-teacher.js`）——用户明确说不需要。
- GitHub Pages 实发（`docs/` 已备好，只差上传）。

---

## 5. 验证流程（必须走完再报完成）

1. `python build.py`（看四个字体的子集 KB 与缺字提示）。
2. 浏览器逐视图截图（1440×900 + 390×844），存 `shots/vN-*.png`。**截图前必须 `cdp('Page.bringToFront')` + `sleep(1)`**，后台标签会节流动画导致全黑。
3. 外部视觉评审：`vision_analyze` 会超时（60s 上限 vs 模型 100–170s），改用直连：
   ```python
   # POST https://api.deepseek.com/v1/chat/completions
   # model=deepseek-v4-flash-vision-exp，必须带 thinking:{type:disabled}
   # 否则 reasoning 烧光 max_tokens、content 返回空
   ```
   它的"毛病"里有一半是编的（例：说分节线两侧短划一长一短，实测两个 `<i>` 都是 34px）。**只采信能被 DOM 量出来的那几条**。
4. 数值自查（比视觉可靠）：
   ```python
   from PIL import Image; import numpy as np
   a = np.asarray(Image.open(p).convert("RGB")).astype(int)
   a.mean(axis=2).mean(); (a[:,:,0] >= 250).mean()   # >0.1 = 过曝
   ((a>90).sum(axis=1)>5).sum()                     # 有内容的行数，深色页 >300 才算正常
   ```
5. DOM 量化：`document.documentElement.scrollWidth == clientWidth`（桌面 1431、手机 390）；表格 `clientWidth == scrollWidth`；`.arc` 窄列占比 ~0.33。
6. 6 视图 + `gate` + 控制台冒烟，`window.onerror` 必须 `[]`。
7. **交互态/悬停必须真测**：CDP `Input.dispatchMouseEvent(type='mouseMoved')` 指到元素中心再读 `getComputedStyle`；注意元素必须真在视口里（先 `scrollIntoView` 再确认 `rect.top>0 && rect.bottom<clientHeight`），否则鼠标事件打空、读到的还是未悬停值（本轮踩过）。`::after/::before` 的状态用 `getComputedStyle(el,'::after')` 读 `content/transform/background`。
8. `dist` → `docs` 复制 → 重打 zip（zip 只放 `index.html`，压缩级别 9；本轮 1521434 字节 → 1029.9 KB）。

---

## 6. 坑（按"会咬人"的程度排）

1. **用户名含撇号**：`bash -c "cd …"` 直接炸（terminal 工具在本机不可用），用 `execute_code` + `subprocess.run(..., cwd=…)` / 原生 `open()`；`write_file` 也会因为临时文件路径失败——**一律用 `open(path,'w',encoding='utf-8')`**。
2. **SVG 字号要按渲染比例倒推**：viewBox 780 在 550px 里渲染=0.705，源码写 12px 实际只有 8.5px。判断字号要量 `getComputedStyle(t).fontSize * (rect.width/viewBox.width)`。
3. **canvas 上别写字**：`miniStrip()` 曾在图里画 9px `I(y)`、`drawVis()` 画 `V ≈ x.xx`，被用户当成"神秘文字"。容器里已有标题/读数就别在画布重复写。
4. **`.view-in` 带 `animation … both` 会保留 `transform/filter`**，把 `#view` 内的 `position:fixed` 元素关进页面坐标（实测 rail top=-1388 跟着滚）。已去掉 `both`；**以后在视图里放 fixed/sticky 先查祖先 transform/filter/contain**。
5. **定宽子元素会撑破栅格**：`.figbody svg{min-width:560px}` 让 390px 屏算出 578px 列宽、整页右侧被裁 190px，而 `scrollWidth` 仍显示 390（只看这个数字会漏诊）。修法：`.paper .grid > *{min-width:0}` + `.figwrap{min-width:0}`。
6. **CSS 里给 `input[type=range]` 写 `!important`** 会压掉 `fx.js` 的内联填充渐变。
7. **动画简写里两个时间值 = duration + delay**：`animation: x 1s var(--mode)` 里 `--mode:500ms …` 会变成 delay，元素永远停在 0% 关键帧。
8. **canvas 通道量纲**：亮度 0–190 必须 `/255`，否则三通道全 255 → 永远死白偏黄。多层 `lighter` 总 alpha 要 <1。
9. **内联 style 里的 font-family 必须用单引号**：`style="--h:"X",serif"` 会在第一个内层双引号处截断，变量静默失效、全部回落 body 字体。判断是否生效看 `getComputedStyle().fontFamily`。
10. **中文子集化必须覆盖全部用字**：`build.py` 会校验并打印缺字；站酷小薇缺 34 个数学符号、思源两套各缺 7 个（✗ ✦ 🔒 ₁ ₂ ⅓ ⅔）——这些字会回落系统字体，属已知可接受。
11. **`?dev=1` 原本会持久化**，已改成不落盘；但 `Ctrl+Shift+D` 开关仍会写 `localStorage['yds.dev']`，截图前记得关。
12. **浏览器标签页会在两次调用之间回到 `about:blank`**：每条 `browser_exec` 里都要先 `goto_url(...)`。
13. **别改 `core.js` 的存档格式**（`yds.v1.students`）、也别动 DEV 面板的既有按钮语义。
14. **`.specbar` 端点小字的位置是量出来的，不是手感出来的**：参数面板头 `.ctrl-hd` 底边 380、光谱条 398、第一根滑杆 423（1440×900）。小字 `top:-12px` + 条子 `margin-top:18px` 才落在这 18px 的空隙里。改字号、改 margin 必须重新 `getBoundingClientRect` 量一遍——第一次写 `top:-17px` 就压到面板头那条下框线上了。
15. **`.crop` 四角标在 `overflow:hidden` 的宿主里会被裁掉**：`.bench{overflow:hidden}` 会吃掉 `top:-1px` 的角标。用 `.crop--in`（角标内收 1px），别把 `.crop` 直接挂到有 overflow 的宿主上。
16. **固定 FAB + 满高侧栏 = 结构性重叠**：别以为把 `.tutor-fab` 挪几像素就解决了；`right:22px` 换成 `right:8px` 只在 1440 宽度下好看，1280 下照样撞。判断方法：`elementFromPoint` 先 `display:none` 掉 FAB 再取，才知道底下是哪个元素。
17. **`含标记=true` 的条目要「整串替换」，不是「换字」**：那些原文里夹着 `<b>`/`<div>`/变量拼接，只改文字会把标签弄丢。`apply_copy.py` 默认跳过它们；手工处理时把**整条原文（含标签）**当 needle、新文案里把标签写全——2026-11-23 那趟 23 条里有 8 条含标记，全部安全落地。判定标准：改完必须在浏览器里逐页看渲染（只查 dist 里有没有那个字符串不算验证）。
18. **越界/溢出检查要区分「页面溢出」和「容器内滚动」**：只看 `scrollWidth == clientWidth` 会漏诊（坑 5 就是这种）；把 `#view *` 全部量 `right > clientWidth` 又会误报 `figbody / taskbar / tblwrap`（它们本来就 `overflow-x:auto`）。正确做法：越界元素若存在 `overflowX:auto|scroll` 的祖先，就判为合规。

---

## 7. 用户偏好与红线

- **不会命令行**：说明用"双击 `dist\index.html` / 双击 `评审模式.url` / 双击 `打开实验室.bat`"这种表述，命令只当兜底。
- **要求具体**：给数值、路径、类名，反感模糊估计；**报"完成"必须整体核对，不能抽查**（曾因只抽查被判错 4 次）。
- **产物统一放** `D:\hermes-workspace\courses\yang-double-slit\`，桌面只放快捷方式。
- 学物理、看重严谨：**不要为了好看把物理模型改错**（显示层可放大尺度，读数面板必须真量纲）。
- 字体口味：要「有艺术感 + 混搭 + 读得清」，**单一高级字体全站铺会腻**；现在这版就是按这个分的层（标题/正文/界面/读数四层各用一族）。
- 单文件、零外链、断网可用；**不引 CDN**（字体也必须内嵌）。
- 敏感点：控制台不要"随便谁都能打开"，但也接受"前端门 + 数据本来就不集中"这个现实。

---

## 8. 参考资产（本机，按需读，别整包导入）

- `D:\hermes-workspace\dev\open-design\design-templates\open-design-landing\` — atelier-zero 版式语言（元数据条 / 竖排 rail / `sec-rule` / 大衬线 display）。
- `D:\hermes-workspace\dev\open-design\design-systems\` — 154 套 DESIGN.md + tokens.css。
- `D:\hermes-workspace\games\elona-lore-site` — 同一套版式语言的成品。
- 字体：`build/fontsrc/`（站酷小薇、Orbitron）+ `C:\Windows\Fonts\NotoSerifSC-VF.ttf`、`NotoSansSC-VF.ttf`（都是 OFL，可子集内嵌）。
- 下载通道：`https://ghfast.top/https://raw.githubusercontent.com/...`（GitHub 直连不通；gh-proxy 时好时坏）；Google Fonts CSS 直连可用（Python 需 `verify_mode=CERT_NONE`）；PyPI 走清华镜像。

---

## 9. 决策记录（为什么是现在这样，别反复推翻）

| 决策 | 理由 |
|---|---|
| 单文件内嵌字体，不挂 CDN | 用户要求断网可用；且手机上系统字体差异大 |
| 只嵌 OFL 字体 | 华文中宋/隶书/仿宋等 Windows 字体不许再分发，公开网页内嵌=侵权 |
| 科技感只给读数层 | 日文字体缺简体字、小薇缺数学符号；拉丁层不会缺字且体积极小（6.2 KB） |
| 表格数字仍用等宽 | 教师端表格宽度按 1339px 卡过，换 Orbitron 会撑破 |
| 去掉自评互评页 | 作业的评价走另一份文档，不进网页 |
| 控制台加口令 + 不进步骤条 | 用户要求"不能随便被打开"，同时接受前端门的能力边界 |
| 边注放左栏 | 放右窄栏时右 503 vs 左 150，左侧塌出大空洞 |
| 光谱端点数字放条子上沿、SPECTRUM 居中 | 放条子下方会被读成下面那根 λ 滑杆的量程；放上沿与 SPECTRUM 同一行才读成「光谱两端」 |
| 位移一律 ≤1px、动效 ≤180ms（table 420ms 展开） | 用户要「高级感」不是「花」；细碎弹跳在仪器风里显得廉价 |
| 留白收敛到 28/40/56 三档并定义成 `--sp-1/2/3` | 原来 22/26/30/34/36 混用，肉眼说不清但整体偏乱 |
| 空态做成虚线仪器框 | 与注册角标/机械线同一套语言，比居中一行灰字更像「仪器的空槽」 |


---

## 10. 文案第二版（2026-11-24，用户要求「直接肯定句、清掉废话、报告口吻」）

**用户原话的落点**：能直接下判断就别写「不怎么怎样」的铺垫；能一句说完就别切碎；科学文体，一个多余的字不要。

**四条改法（改任何句子都按这个）**
1. **删否定铺垫**：「不看公式／不用背／先别算／而不是」一律换成直接判断。
2. **并句**：主谓齐全、一句一个判断，不用破折号把话掰成两半。
3. **去口语**：「你会发现／说白了／其实／反正／吧／呢」全删；「你」也不再出现（全站已 0 次）。
4. **术语统一**：缝距 d / 屏距 L / 谱宽 Δλ / 可见度 V / 判定为 ××级 / 控制台（不再是「教师端」）。

**动过的文件**：`views-enter.js`(12) · `views-pre.js`(38) · `views-concept.js`(26) · `views-lab.js`(72) · `views-post.js`(5) ·
`views-review.js`(14) · `views-teacher.js`(6) · `tutor.js`(19) · `analysis.js`(23) · `physics.js`(2) · `boot.js`(2) · `shell.html`(1)。
共约 220 处字符串，源码净减 ~1 KB。

**几个定下来的写法（别回退）**
- 入口主标题：`光程差 / 决定屏上亮暗。`
- 入口正文：`两条缝到屏上同一点的光程不等。δ 为 λ 的整数倍时干涉加强，为 λ/2 的奇数倍时相消。缝距、屏距、波长改变的都只是 δ 本身。`
- 前测：`先记录判断，再进实验室。` / `5 题为判断题，只需给出结论；结果与实验数据对照，用于定位判断偏差。`
- 概念：`光程：几何长度 / 折算为相位。`；四节标题 `I. 光程与光程差` `II. 明暗条件 · 条纹间距` `III. 相干条件 · 可见度` `IV. 模型的适用边界`
- 实验台：`单一变量，数据判定。`；任务卡 `A · 预测 / B · 测量 / C · 结论与依据`；按钮 `提交结论 →`
- 复盘：`本次实验的 / 记录与判定。`；表格头 `预测 / 实测数据 / 结论 / 自洽`；`层级仅用于教学干预建议，不计入成绩。`
- 控制台：`学生档案与 / 卡点分布。`
- 个性化路径的序号改为**顺序编号 01…05**（原来混用 `?` `→` `✓`，看着像占位符）。

**同轮附带修的两处**
- `analysis.js` 的 path 序号统一重排（不影响判定逻辑）。
- 助教抽屉标题 `助教 · 只问不喂` → `助教 · 概念补充`；`stepName` 的「教师端」→「控制台」。

**验收（本轮实测）**
- build：字体子集 955 字，缺字仍是已知的 34/7/7（无新增缺字）；dist 1474135 B。
- dist = docs = zip 内 index.html，sha256 前16位 `427d8db1f7fc0188`。
- 6 个学生路由 + gate + 控制台 × 1440/390：`scrollWidth == clientWidth`、无未兜住的越界元素、`window.onerror` 空。
- 物理数值未变（Δy 2.53 mm、边界标签、探针读数与改前一致）。
- 冷启动 `#teacher` 仍被口令门拦到 gate。
- 截图：`shots/copy-20261124/c-*.png`（7 张）。
- 文案清单已按新源码重扫：`文案/文案清单.html` 667 条（长文案 183、含标记 221）；阅读版 `文案/当前文案-阅读版.html` 701 行。

**注意**：`文案/strings.json` 这次被 `gen_inventory.py` 重写了（条目跟着新源码走）。以后再做批量改稿，仍走 `apply_copy.py` 那套（它按「原文句子」精确匹配，一条不中就整体放弃）。


---

## 11. 修复轮（2026-11-24，按体检报告 P1–P3 逐条落地）

| 原问题 | 处理 | 落点 |
|---|---|---|
| P1-1 学生写的理由全站不显示 | 复盘「结论」列下加一行 `依据：…`（实验台 why2）；控制台详情新增「任务结论与书面理由」块（四条任务结论+依据，另附前/后测各题理由）；CSV 新增 `后测理由`、`实验理由` 两列 | `views-review.js` · `views-teacher.js`（`reasons()`） |
| P1-2 空档案判 C 级 | `Analysis.of` 增加 `preN/postN` 计数：完全无作答且无记录时 `tier='—'`、依据写「尚无作答与实验记录，暂不评级。」；复盘显示 `— · 未评级`，控制台分布行追加「未评级 N」 | `analysis.js` · `views-review.js` · `views-teacher.js` |
| P2-1 正确答案位置扎堆 | 选项**轮转**（不是手工重排数组）：PRE 转 `[1,2,3,0,3]`、POST `[2,3,1,2,3]`、实验预测 `[3,0,2,1]`、结论 `[1,2,0,3]`；正确位变为 PRE `[0,3,2,1,2]`、POST `[2,1,3,3,2]`。示例档案用 `fixDemoRot()` 同步换算索引，层级结论不变 | `views-pre.js` · `views-lab.js` · `views-teacher.js` |
| P2-2 自由探索仍显示任务卡 | 任务卡渲染条件改为 `!free && T`；自由探索下改为一行说明「六项参数全部解锁，结论不进入任务档案，记录与轨迹照常保存」 | `views-lab.js` |
| P2-3 助教球压参数面板 | 实验台内**隐藏固定 FAB**（`body[data-step="lab"] .tutor-fab{display:none}`），改由参数面板底部「问助教」按钮打开抽屉 | `refine.css` §24 · `views-lab.js` |
| P3-1 入口 HUD 与光场不同源 | `hudD/hudL` 改为读 `state.lab.params`（λ 仍是装饰漂移，Δy 与光场同源计算） | `views-enter.js` |
| P3-2 探针面板吃掉点击 | `.probe{pointer-events:none}` + `.probe__x{pointer-events:auto}`：整块穿透，只有关闭按钮可点（实测 `elementFromPoint` 命中 canvas，探针可继续落点） | `refine.css` §24 |
| P3-3 路径序号 `?/→/✓` | 统一重排为 `01…05`（`path.slice(0,5).map(...)`） | `analysis.js` |
| P3-4 自评互评死代码 | 删 `dev.js` 的 `fillEval` 与按钮调用、示例档案里的 `eval` 字段（约 2KB） | `dev.js` · `views-teacher.js` |
| P3-5 多档案时无法自助恢复 | 「载入上次档案」优先读 `yds.v1.current` 直接恢复；目标步骤为 `enter` 时自动进 `pre`；仅当无 current+多份时才进口令门 | `views-enter.js` |

**附带**：DEV 面板的「示例学生×4 / 切到示例学生」在 `?dev=1` 下不再被口令门挡住（`App.__devUnlock()`，仅 DEV 调用）；
窄屏复盘表加 `min-width:720px`，改为横向滚动（390 下单元格高度从 248px 降到 174px）；
`dev.js` 里「王子航（示例，后测 4/5）」这句早就不对（实际 5/5），改为「示例档案 · B 级」。

**验收（本轮实测）**
- 选项正确位：PRE `[0,3,2,1,2]`、POST `[2,1,3,3,2]`、实验 `[[2,3],[1,2],[3,0],[0,2]]`
- 空档案：`tier='—'`、复盘显示 `— · 未评级`；有档案正常出 A/B/C
- 复盘「依据」出现；控制台详情含「任务结论与书面理由」；CSV 16 列（新增 2 列理由），实测抓到的 CSV 表头与首行都正确
- 自由探索：`#taskcard` 为 false、FREE 说明存在；实验台 FAB `display:none`、`#btnTutor` 可开抽屉
- 探针：点箱体覆盖区 `elementFromPoint` 返回 `CANVAS`，读数从 m=-3.56λ 变到 m=-5.70λ
- 六路由 × 1440/390：`scrollWidth==clientWidth`、无未兜住越界、`window.onerror` 空
- 打印仍白底；控制台表格 1348/1348；手机复盘表 720/350 横向滚动
- 打包：dist = docs = zip 内 index.html，1487012 B，sha256 前16位 `c4ed72b54e65eba3`

**⚠️ 迁移注意**：旧存档（本次之前造的）里的 `ans/pred` 是按**旧选项顺序**存的，轮转后会对不上，层级会算错。
交付前建议清一次本机存档（DEV 面板「清空本机」），或只给新用户用。


---

## 12. 工作区清理 + 重新打包（2026-11-24）

- 删除：`specimen*.html`（4 份旧样张）、`build/spec4bands.html`、`build/fonts/` 里旧子集与 `faces*.css`、`build/fonts/cache`、`build/fontsrc` 中构建不用的三款中文、整个旧 `shots/`。
- 保留：`dist` / `docs` / zip / `src` / `build.py` / `build/fontsrc`（站酷小薇 + Orbitron）/ `文案/` / `shots/验收/` / HANDOFF / CHECK。
- 体积 220.8 MB → **20.4 MB**。
- 清缓存后重新构建：字体子集从零重建（962 字，缺字仍是已知 34/7/7），dist 1486672 B。
- 重新打包：dist = docs = zip 内 index.html，sha256 前16位 **`277eaa0662ab4282`**（注意与上一版 `c4ed72b5…` 不同：缓存清空后子集重新生成，内容等价）。
- 回归：桌面/手机六路由 `scrollWidth==clientWidth`、越界 0、`onError` 空、四款字体 `document.fonts.check` 全 true。


## 13. 手机竖屏手感（2026-11-24）

实测问题（390×844）：把握程度按钮 30×11（点不中）、输入框/文本域 14px（iOS 聚焦会放大页面）、模式切换 27px 高、读数标签 9.5px、选项行高偏小。
修法（`refine.css` 第 25 节，`@media (max-width:820px)`）：
- `.input/.textarea` → 16px；`.conf__pips button` 26px 高 + `::before inset:-10px` 扩热区（实测按钮外 10px 仍命中 BUTTON）
- `#modeBar button` min-height 38、`.tasktab` 56、`.opt` min-height 48
- `.read__k` 11.5px、`.read__v` 17px、滑杆热区 34px、拇指 20px
改后复测：六路由 `scrollWidth==clientWidth`，最小可点元素 ≥38px（把握按钮实际热区约 54px）。
另修：`.reads` 窄屏排两列、`.read__k` 允许换行（实测 5 个标签 `scrollWidth>clientWidth` 全为 false）。
重新打包：dist = docs = zip 内 index.html，sha256 前16位 **e6f9db0154711191**（1493283 B）。


## 14. 滑杆磁吸 + 探针磁吸（2026-11-24）

### 14.1 滑杆刻度档位（用户反馈：分档位置没有停留/吸附，落不准）
- 新增 `physics.js` 的 `window.Snap`：`DETENTS`（每参数的有意义档位）+ `SNAP_WIN`（吸附窗口）+ 磁滞倍数 `SNAP_STICK=1.4`。
- 档位：`d [0.05,0.10,0.20,0.30,0.60,0.90,1.20]` / `L [0.30,0.60,1.00,1.20,1.50,2.00,3.00]` / `lam [380,405,436,532,589,632.8,660,700,780]` / `b [0,0.20,0.60,1.00,1.27,1.50]` / `R [0.20,0.40,0.60,0.80,1.00,1.50]` / `dLam [0,1,5,20,40,60,100,150]`。
- 吸附窗口：d 0.025 / L 0.04 / λ 4nm / b 0.025 / R 0.03 / Δλ 2。进入窗口即写回刻度值（`r.value` 同步回写，滑杆视觉也停在刻度上），已在吸附值内再小幅移动不脱离（磁滞 1.4×），超出窗口才释放。
- 轨道上加了刻度小标记 `.sld__det`（纯装饰、`pointer-events:none`，位置按 min/max 百分比算），吸附瞬间 `.sld__track[data-snap]` 让刻度提亮 620ms 并给拇指一圈红光。
- 概念页「相干性调节」两个滑杆（Δλ / b）同样接入（那里只改本地演示量 `tmp`，不动 state，符合原设计）。

**实测**（直接灌 `input` 事件）：`d 0.31→0.30`、`0.55→0.55`（不吸）、`0.58→0.60`、`0.63→0.60`（磁滞粘住）、`λ 634→632.8`、`645→645`、`590→589`；概念页 `Δλ 58→60`、`63→63`，`b 2→1.5`。

### 14.2 磁吸探针（本轮选定的手机画布方案）
- `optics.js` 点击换算出 `m = sPx·dy/(lamPx·Dpx)`，取最近的 0.5 级（整数=亮纹、半整数=暗纹），距离在 `mag = min(8px, dyPx·0.35)` 内就把探针吸到正中；半径随条纹间距自适应（手机上 dyPx≈11px，半径收到 3.8px，不会一吸一大片）。
- 吸附后 `probeInfo().snapped = true`，读数框文案变成「已吸附亮纹中心 · m = +3 λ」/「已吸附暗纹中心 · m = +3.5 λ」；未吸附仍是「亮纹附近 / 暗纹附近 / 明暗之间」。
- 实测：中心 +3px → m=0、snapped；半格处 → m=0.5、snapped；桌面 dy=32px、手机 dy=10.9px 下都正常。

### 14.3 打包与回归
- `dist = docs = zip 内 index.html = 传GitHub 里的 index.html`：1515213 B，sha256 前16位 **bbffe31497bf255a**（zip 1046380 B）。
- 六路由 × 1440/390：`scrollWidth==clientWidth`、越界 0、`onError` 空。
- 截图已更新：`shots/验收/桌面-04 实验台.png`、`桌面-03 概念.png`、`手机-实验台.png`。
- 文案清单重扫：681 条（新增「已吸附…」两句）。

---

## 15. 交给了下一轮：视觉/动效升级

本轮到此收工，下一阶段（动效/光效）的完整交接写在 **`交接-视觉升级.md`**（同目录另有 `交接-视觉升级.html` 可直接双击阅读）：硬约束、效果清单（V1–V8 / B1–B2）、可感度阈值（ΔL≥12 / ΔE≥15 / 帧差≥3%）、施工规范、验收流程、已知坑，以及「先做 V2+V3 样片、用前后对比图让用户拍板」的建议打法。

---

## 16. 动效样片 V2 + V3（2026-11-24，待用户拍板）

按 `交接-视觉升级.md` 第 8 节的建议，**只做 V2 光谱取样器 + V3 幽灵条纹两条样片**，其余一律未动。
改前基线已备份为 **`dist_prev.html`**（1515213 B / `bbffe31497bf255a`，原第四阶段版本），
回退 = 把 `dist_prev.html` 复制回 `dist/index.html` 并重跑打包（或 `git`-less 手工覆盖）。

### 16.1 V2 光谱取样器（λ 滑杆 + 光场换色）

| 项 | 落点 | 做法 |
|---|---|---|
| 轨道改成真实光谱 | `fx.js` 第 4 段 `sliders()` + `specGradient()` | 380–780 nm 每 20 nm 一个色标，**取值直接调 `Phys.wavelengthColor()`**，不手写死色标；轨道 7px 高，上面压一层 45% 黑的刻度梳 |
| 拇指填当前波长色 | `refine.css` §27 | 内联 `--lam-col`（`fx.js` 每次 input 写入 `rgb(...)`），拇指 `background:var(--lam-col)` + 1.5px 白环 + 白辉光；拖拽时 `.sld__track[data-drag]` 换成该波长的彩色辉光（`--lam-glow`） |
| 光场 120ms 缓动 | `optics.js` `step()` | 新增 `this.lamShow`（显示 λ）按 **τ=80ms 一阶**追 `p.lam`；`geom()` 用 `lamPxOf(lamShow)`，场 / 屏带 / 光束 / 缝口辉光全部跟显示 λ；**读数面板仍用真 λ**（`probeInfo` 的 δ 用 `p.lam`） |
| 关掉 | `?fx=0` 或 `body[data-fx="off"]` | `fx.js` 顶部解析 `?fx=0`；`Bench.fxOff()` 同时认 `prefers-reduced-motion` |

**偏离交接稿的两处（都是主动决定）**：① 没做「拖动时浮出 ±2nm 窄带小色块」——那 4 nm 只占轨道 1%（约 3px），要么看不见要么得作假放大，改成「拇指本身填当前波长色」，信息一样但更干净；② 缓动取 τ=80ms（交接稿写 120ms），120ms 收敛要 0.5 s，拖滑杆会觉得跟不上手。

**实测**
- λ 缓动曲线（页面内 rAF 逐帧读 `lamShow`，380→780）：0ms → 380；36ms → 526；70ms → 619；147ms → 715；246ms → 763；355ms → 776；505ms → 779.3；724ms → 780（一阶 τ=80ms，**95% 在 240ms**）。
- 屏带中线平均色（同参数、同取样窗）：405 `[99.2,59.4,118]` / 532 `[98.6,135.8,63.6]` / 632.8 `[125.8,79,56.2]` / 700 `[123.2,59.1,57.3]`。
  **与改前逐位相同**（632.8 改前 125.8、改后 125.9）——V2 不改配色映射，只把「只有 9 个磁吸档位」变成「全程连续」。
- ΔE76（Lab，相邻波长）：405→532 **84.6**、532→632.8 **47.2**、632.8→700 **13.9**。前两对远超阈值 15；最后一对 13.9 是红→红（只变明度不变色相，物理上本该如此），不是缺陷。
- 静置后画布与真值一致：λ=632.8 / d=0.30 → `lamShow=632.8`、`dyPx=50.81`（`lamPx 9.844 × Dpx 645.6 / sPx 124.4`），读数 `Δy=2.53 mm`。

### 16.2 V3 幽灵条纹（参数变化的记忆）

| 项 | 落点 | 做法 |
|---|---|---|
| 抓帧 | `optics.js` `Bench.set()` → `captureGhost()` | 改 **d / λ / L** 且非 silent 时，把当前画布 `drawImage` 进离屏 canvas；**120ms 节流**（磁吸与快速拖动不逐帧抓图） |
| 叠影 | `draw()` 末尾、`drawVignette` 之前 | `globalAlpha = 0.42 × life`，`life` 每帧 `-dt/1200` 线性淡出，1.2 s 后销毁 |
| 不启用 | 单光子模式 / `fxOff()` / reduced-motion | 三处都在 `set()` 与 `draw()` 里挡掉 |

**实测**（同一时刻「开残影 vs 关残影」两帧对比，中间隔 45 ms 只差动画相位，重复 3 次）
- t≈150 ms：差异像素（单通道 >10/255）**18.42% / 18.32% / 17.76%**，平均亮度差 **5.6**/255 → 远超「帧差 ≥3%」的阈值。
- t≈1.25 s：**0.01% / 0.01% / 0.12%** → 残影已完全消失（不是「残留 <0.3%」勉强达标，是基本归零）。
- 1.2 s 内 alpha 衰减：0.42 → 0.31（150 ms）→ 0.16（600 ms）→ 0。

**观感**：0.4 s 那一帧的视觉评审结论是「示波器余辉 / 长曝光的仪器残像感」，不是脏糊——因为叠的是整幅台面（含网格、光轴、屏带），旧图案与新图案只在真正变化的地方露出，静止区域两者重合、叠了等于没叠。

### 16.3 回归（本轮实测，非抽查）

- 构建：988 字（新增的是源码注释里的中文），缺字仍是已知 **34 / 7 / 7**，无新增缺字；连跑两次 sha 一致。
- 打包：`dist` = `docs` = `传GitHub/index.html` = zip 内 index.html，**1534442 B，sha256 前16位 `d6e2a48f8b16cff2`**（zip 1057929 B）。
- 8 条路由 × 1440 / 390：`scrollWidth == clientWidth`（学生页 1431/1431、gate 与 teacher 1440/1440；手机全 390/390），未兜住的越界元素 **0**，`onerror / unhandledrejection` **[]**。
- 四款字体 `document.fonts.check` 全 true，`body` = `"YDS notosans"`。
- 物理：默认参数 `Δy = 2.53 mm`；磁吸 `d 0.31→0.30 / 0.55→0.55 / 0.58→0.60 / 0.63→0.60`、`λ 634→632.8 / 645→645 / 590→589`。
- `?fx=0`：`body[data-fx="off"]`、改 d 后 `bench.ghost === null`（残影完全不出现），且 λ 不再缓动（`lamShow` 直接等于目标值）。
- 打印：`body` 背景 `rgb(255,255,255)`、文字 `rgb(17,17,17)`。
- 截图：`shots/fx/`（前后面板对照、λ 四张、手机滑杆特写、两条 GIF）；`shots/验收/` 的「桌面-04 实验台」「手机-实验台」已换成含光谱滑杆的新版。

### 16.4 交付物（给用户看的对比材料）

- `shots/fx/残影-改缝距.gif`（480×314，150 ms/帧，9 帧，d 0.30→0.60 全过程）
- `shots/fx/波长扫色.gif`（480×314，300 ms/帧，9 帧，380→760 nm）
- `shots/fx/滑杆-前后对照.png`（上=旧红轨、下=新光谱轨，同位置裁切）
- `shots/fx/before-lam-*.png` / `after-lam-*.png`（1440×900 同角度）

### 16.5 还没做（等用户拍板）

V1 入口光斑照字 / V4 单光子余辉 / V5 读数数字滚动 / V6 屏带材质冷暖分离 / V7 换页揭幕升级 / V8 HUD 联动 / B1 单缝衍射包络 + 缺级 / B2 数据舱拟合图。
用户确认样片后，建议下一批是 **V1 + V4**（两条都在现有文件里改，风险低、观感强），B1 单独排一轮（动物理模型与任务文案）。

### 16.6 刻度清理（2026-11-24，用户反馈「刻度线咋这么多，把没用的删了」）

两处都只删装饰、不动磁吸逻辑：

1. **λ 光谱条上不叠任何竖线**。上一轮我在这条 7px 彩虹上压了一层等距刻度梳（`repeating-linear-gradient` 每 10% 一根，隐藏在光谱里等于没有信息），再叠 9 根档位刻度 → 303px 宽的条上共 19 根竖线，把彩虹切碎。
   现在：`fx.js` 的 λ 分支只写 `specGradient()` 一层背景（实测 `backgroundImage` 拆出来 **1 个 linear-gradient**）；`physics.js` 的 `detentTicks` 对 `k==='lam'` 直接返回空串（实测 λ 档位刻度 **0 条**）。位置靠滑块本身（拇指填当前波长色）+ 下方 380/780；吸附反馈仍由 `.sld__track[data-snap]` 的滑块辉光给出（实测 `λ 634→632.8`、`data-snap` 置上）。
2. **所有滑杆不再画「端点档位」刻度**：两端下方已经印着 min/max，再画一根竖线是重复。`detentTicks` 里过滤掉 `d <= min` 与 `d >= max` 的档位。实测各滑杆刻度条数：`d 7→5`、`L 7→5`、`λ 9→0`、`b 6→4`、`R 6→4`、`Δλ 8→6`（概念页两根同为 `Δλ 6 / b 4`）。
3. 像素级复核（不是只查 DOM）：沿轨道做横向高反差扫描，只剩余滑块与其辉光，彩虹条上无竖线。

**回归**：8 路由 × 1440/390 全部 `scrollWidth==clientWidth`、越界 0、`onerror=[]`；打包 `dist` = `docs` = `传GitHub` = zip，**1539960 B / sha256 前16位 `b48ac14db9535042`**（zip 1062515 B）。
对照图：`shots/fx/滑杆刻度-清理前后.png`（上=19 根竖线，下=0 根）、`shots/fx/cleaned-lam-row.png`、`shots/fx/mobile-lam-clean-crop.png`。

### 16.7 刻度清理·第二趟（2026-11-24，用户贴 b 滑杆问「这个怎么也是分的这样子」）

同一个毛病扩散到另外五根：每根滑杆轨道上都压着一层**每 10% 一根的等距刻度梳**（`rgba(158,197,216,.26)`，6px 高），把一根 1px 细线切成三十来个小短杠。b 那行实测：**10 根梳齿 = 20 个像素列**的竖线，全无信息价值。

- `fx.js` 的通用分支只写「已走段」一层（`linear-gradient(90deg, var(--laser) 0 pct%, rgba(158,197,216,.30) pct% 100%)`，`backgroundSize:100% 1px`）；`refine.css` 第 6 节的首帧兜底也把梳齿删了（否则没 paint 前会闪出一格一格）。
- 档位刻度压到 `1px × 7px`、`rgba(158,197,216,.30)`（`refine.css` 末尾），只留真正能吸附的值：`d 5 / L 5 / λ 0 / b 4 / R 4 / Δλ 6`。
- 像素复核（不是只查 DOM）：轨道带内“明显高于邻域的列” 前 **30** → 后 **8**（正好是 4 根档位 × DPR2 两像素），梳齿 20 列全消失。

**回归**：8 路由 × 1440/390 全部 `scrollWidth==clientWidth`、越界 0、`onerror=[]`；磁吸 `d 0.31→0.30 / 0.55→0.55`、`λ 634→632.8` 照旧；读数 `Δy` 与公式一致（d=0.55 时 1.38 mm）。
**打包**：`dist` = `docs` = `传GitHub` = zip，**1542120 B / sha256 前16位 `06b080327af3654e`**（zip 1064200 B）。
对照图：`shots/fx/b滑杆-前后对照.png`、`shots/fx/clean-b-row.png`、`shots/fx/clean-panel.png`。

### 16.8 装饰专场（2026-11-24，用户原话「这就是表面功夫，我要装饰」）

只做「别人不玩也能看见」的三样，物理公式、题库、文案一个字没动。第四样 V6 试了又撤回（见下）。

**V1 入口「手电照字」**（`fx.js` `heroLight()` + `refine.css` §28）
- `.hero-veil`：只盖左侧文字栏（`width:min(660px,52vw)`）的一层暗纱（`rgba(3,5,9,.58)`），`mask-image` 径向挖一个洞跟着指针走 → 光斑里的字亮、其余压暗。
- `.hero-glow`：同一位置叠一片暖光（`screen` 混合），让「手电」有边缘，不只是「中间没那么暗」。
- 坐标按**文字栏**（`.hero-veil` 自身框）算百分比，不是按整个舞台 —— 否则光斑会滞后于指针。指针离开后回到 52% / 44%（标题上），静止时也像一束打在标题上的光。
- 实测：标题笔画亮度 p99 **236 → 111**（光斑移走时，ΔL 125）；光斑内几乎不变（ΔL 0.8）；右侧光场未受影响（meanL 30.3；全屏暗纱的初版只有 18.1）；`?fx=0` 时 `display:none`。

**V4 单光子「曝光累积」**（`optics.js` `drawPhotons` 重写 + `addPhotons(8)`）
- 旧实现：每帧把 2600 个点按随机 alpha（0.55~0.8）重画 → 观感是闪烁噪点。
- 新实现两层：**累积层**（每个光子只画一次，alpha 0.14、半径 1.7px、`lighter` 叠加，参数一变就清空）+ **活跃层**（最近 1.5s 的光子，亮度 `0.80·e^(−t/600ms)`，新到的点略大）。
- 速率 4→8 个/帧（约 240/s；渲染仍限 30fps）。
- 实测：光子数 2200 / 5688 时，屏幕带逐行亮度与 cos² 理论分布的相关 **0.89 / 0.892**；10s 与 25s 两帧肉眼可辨「显影」（`shots/fx/photon-10s-vs-25s.png`）。

**V7 换页光扫改成「沿光轴」**（`refine.css`，替换原 `.beam-wipe` 竖向落线）
- 原来是一道 2px 横线从上往下掉、1.05s；现在 34% 宽的光带**从左往右**扫过，`mix-blend-mode:screen`，时长 **0.21s**。
- 第一版前缘写 `rgba(255,255,255,.92)`，冻结帧实测像一条白条（视觉评审原话「廉价白色蒙版」）；改暖白 `.46` + 更长拖尾后：峰值 ΔL **171**、帧差占比 **5.15%**（第一版 209 / 3.15%）。

**V6 屏带冷暖（做了又撤）**：亮纹偏暖 + 暗纹偏冷试过一版，实测「暗纹偏冷」根本出不来 —— 暗纹处 alpha 接近 0，冷色一乘就没影；要看得见就得抬高极小值，等于牺牲条纹对比度。按「物理不能为了好看改错」这条线撤回，`drawScreenStrip` 恢复原算法（maxRB 回到 116）。

**回归（本轮实测）**：8 路由 × 1440/390 `scrollWidth==clientWidth`、越界 0、`onerror=[]`；四款字体全 true；`Δy=2.53 mm`；`?fx=0` 下 veil/glow 均 `display:none`；光子模式约 30fps（240 光子/秒）。
**打包**：`dist` = `docs` = `传GitHub` = zip，**1569758 B / sha256 前16位 `c32d032e9c7d6221`**（zip 1083748 B）。
**教训**：回退 V6 时删多了，`const col` 留成重复声明 → 整个 `optics.js` SyntaxError → `App` 未定义、整页白跑。以后每次改完 js 先 `node --check src/js/*.js` 再构建。

### 16.9 中间两页的装饰（前测 / 后测 / 概念，2026-11-24，用户反馈「美化都集中在首页和 lab」）

四处，全部只做一次、不循环、不动物理与文案；实现集中在 `fx.js` 的 `qaRail()` / `reveals()` 与 `refine.css` 第 29 节。

1. **答题进度光轨（前测 / 后测共用）**：`qaRail()` 在 `#qhost` 上方插一条 5 段细线（段数 = `.qcard` 数量），答一题那一段变朱红并发光，亮起瞬间一道光扫过该段（0.7s）；右侧只显示数字 `n/总数`（**不加任何新文案**，避免动到文案清单）。用 `MutationObserver(attributeFilter:['data-sel'])` 同步，不碰 `QBank.bindQ` 的逻辑。实测 `0/5 → 1/5 … 5/5`，`qa-wrap` 在 1440 下宽 848px、与原 940px 正文栏左对齐。
2. **题卡落定**：`.qcard` 进视口时左缘 2px 朱红细标从 0 长到 26px（0.52s），眉标 `Q1 · 条纹间距` 由淡入到实。
3. **分节线展开（概念页）**：`.sec-rule` 进视口时两侧 34px 细线 `scaleX(0→1)`（0.62s）。实测中途 `matrix(0.744…)`、收敛 `matrix(1…)`，宽度仍是 34px（版式未变）。
4. **图卡扫一遍（概念页）**：`.figwrap` 进视口时一条淡墨扫描带从左扫到右（1.05s，`overflow:hidden` 内，不碰版面）。实测帧差（差 >5 的像素）**9.02%**，纸面上最暗处 ΔL **29**（在浅色纸上够看但不抢眼）。

另外把 `.qcard` 加进光标聚光列表（悬停时卡片内有一小片跟随光）。

**回归**：8 路由 × 1440/390 `scrollWidth==clientWidth`、越界 0、`onerror=[]`；`node --check` 全部 js 通过；二次构建 sha 一致。
**打包**：`dist` = `docs` = `传GitHub` = zip，**1578051 B / sha256 前16位 `c6c110ede39113cf`**（zip 1087879 B）。
**材料**：`shots/fx/qa-rail.gif`（答 5 题进度轨逐格亮起）、`shots/fx/29-概念页揭示.gif`（逐段下滚看揭示）、`shots/fx/qa-rail-crop.png`、`shots/fx/c-freeze-view.png`（扫描光冻结在半路）。

### 16.10 A+B（2026-11-24）：复盘盖章 + 读数数字滚动

**A 层级盖章**（`views-review.js` 加一个 `.stamp`，样式在 `refine.css` §30）
- 朱红圆章（双圈 + `inset` 压印阴影 + `.2px` 模糊做油墨边），旋转 −9°，进页时 `scale 1.42 → 1`、`rotate −14° → −9°`（0.46s，一次性，`prefers-reduced-motion` 兜底）。内容直接取现有 `A.tier` / `tierWord`，**没加一句新文案**；`— · 未评级` 时改成虚线灰章。
- 位置：`.arc__main` 右上（`right:6px; top:2px`，桌面 104px / 窄屏 78px）。实测桌面 `stamp.right 886 < side.left 928`（不与右栏相撞）；390 宽下 `realOverlap=false`（与 `.arc__lead` 只在空白处相交，不压字）。
- 外发光：第一版有 `0 0 22px` 的辉光，视觉评审说「像霓虹徽章」，去掉了。**用径向亮度剖面验证**（沿章心横向采样，圈外亮度立刻回落 8.3/255）——确实无光晕。
- 打印：`@media print` 里固定为不透明 + 深红 `#a33`，不跑动画。

**B 读数数字滚动**（`fx.js` 的 `rollReads()`，挂在 `#reads` 的 MutationObserver 上）
- 数值变化时按 `1-(1-k)^3` 缓动 150ms 滚到目标（保留小数位与单位后缀），`∞` / `点击屏幕` 这类非数字文本自动跳过；`.read__v` 加 `font-variant-numeric:tabular-nums` 防抖宽。
- **不碰 `views-lab.js` 的 `updateReads`**：观察 innerHTML 重建即可，逻辑零改动。
- 实测（拖 d 0.30→0.60，每帧采样）：`2.53 mm → 2.52 → 1.63 → 1.34 → 1.27 mm`（约 180ms 收敛，中间态可见）。

**回归**：8 路由 × 1440/390 `scrollWidth==clientWidth`、越界 0、`onerror=[]`；缺字回到已知 **34/7/7**（中途因注释里有个 `τ` 让小薇缺字 34→35，把注释改成「时间常数」后复原）；二次构建 sha 一致。
**打包**：`dist` = `docs` = `传GitHub` = zip，**1584095 B / sha256 前16位 `8f6a7f6def7df9ba`**（zip 1090526 B）。
**材料**：`shots/fx/A-层级盖章.gif`、`shots/fx/stamp-crop3.png`、`shots/验收/桌面-06 复盘.png`（已换成盖章版）。

### 16.11 暗室「墙面材质」（2026-11-24，用户选定第 4 项）

**问题**：全站背景是 `--bg` 一层纯黑平涂，所有元素都像浮在真空里；原本那层 `#fxGrain` 用的是 `mix-blend-mode:soft-light`，**在近黑底上几乎等于不存在**（soft-light 对黑不产生任何提亮），所以"细颗粒"一直是白做的。

**做法**（`refine.css` §31，全部静态，不跑动画、零性能成本）：
1. `body` 的 `background-image` 叠 5 层：右上暖光斑（远处一盏灯的漏光，42vw/32vw，α .135）、左下冷光斑（36vw/30vw，α .115）、大面积中性提亮（70vw/44vw，α .022）、一道 116° 的斜向柔光（α .022）、以及**每 260px 一根的墙板竖缝**（1px，α .013，`repeat`）。
2. 暗色页的颗粒改成 `screen`：`body:not([data-step=concept]) #fxGrain{mix-blend-mode:screen;opacity:.062}` —— 这样近黑底上终于能看到"砂"。
3. 概念页（纸页）有自己的纸面渐变，`body[data-step=concept]{background-image:none}` 挡住暗室材质外溢；`body[data-fx="off"]` 也整层关掉。
4. 打印：现有 `@media print` 里 `body{background:#fff !important}` 会把整层背景重置为白（实测 `background-image: none`、`color: rgb(255,255,255)`）。

**实测**（同一页、只切 `data-fx` 的 A/B）：
- 右上暖光区 ΔL **+6.8**、左下冷光区 **+7.6**、中部 **+5.0**、底部中间仅 +1.3（说明亮部集中在边角，正文区几乎不动）
- 整页差异 >3 的像素 **24.9%**，最大 ΔL 16
- 题干笔画 p99 **211 / 211**（改前改后完全一致）→ 文字对比度零损失
- 第三版曾把光斑做成 62vw 的大块，视觉评审原话「像屏幕蒙了雾」；缩小光斑 + 加墙板竖缝 + 补 `screen` 颗粒后，评审改为「像暗室墙面被环境光照到，不是脏污/起雾，无硬边无带状」

**回归**：8 路由 × 1440/390 `scrollWidth==clientWidth`、越界 0、`onerror=[]`；概念页 `body background-image: none`（纸面不受影响）；打印白底；缺字仍 34/7/7。
**打包**：`dist` = `docs` = `传GitHub` = zip，**1592498 B / sha256 前16位 `224641aad371053d`**（zip 1095649 B）。
**材料**：`shots/fx/材质-前后对照3.png`（左无材质 / 右有材质）、`shots/fx/mat4-on.png`、`shots/fx/mat-mobile.png`；`shots/验收/桌面-02 前测.png` 已换成材质版。

---

## 17. 发布记录（GitHub Pages，2026-11-25）

**线上地址**：<https://qianhui-pev.github.io/yang-double-slit/>
**仓库**：`qianhui-pev/yang-double-slit`（Public，分支 `main`，Pages 源 = `/docs`）

### 17.1 入库内容（50 个文件 / 11.5 MB）

`src/`（全部源码）· `docs/`（index.html + .nojekyll + 发布说明）· `dist/index.html` · `build.py` · `build/fontsrc`（两款字体原文件）· `文案/`（改稿表与脚本，不含 `backup/`）· `HANDOFF.md` · `CHECK-20261124.md` · `README.md` · 双击入口 `.bat/.url`。
**不进库**：`shots/`（43 MB 截图）、`build/fonts/cache/`、`文案/backup/`、`传GitHub（拖这两个文件）/`、zip、`dist_prev.html` —— 见根目录 `.gitignore`。

### 17.2 怎么发上去的（git 走不通，改走 REST）

- `gh` CLI 已装：`D:\hermes-workspace\ops\gh\bin\gh.exe`（v2.105.0，从 release 直下）
- 授权走 **device flow**（GitHub CLI 的公开 OAuth client），用户在自己浏览器批准；token 存在 `D:\hermes-workspace\ops\gh_token.txt`（撤销入口：GitHub → Settings → Applications → GitHub CLI）
- **`git push` 在这台机器上会挂**：代理（127.0.0.1:7897）下 4.8 MiB 的推送 300 s 未完成；而且空仓库上 `/git/blobs` 直接返回 `409 Git Repository is empty`。
- 实际用的脚本：**`D:\hermes-workspace\ops\gh_publish.py`**（可重跑）
  1. `PUT /contents/README.md` 建第一个提交（空仓库只有 Contents API 能写）
  2. 其余 49 个文件并发 6 线程 `POST /git/blobs`
  3. `POST /git/trees`（`base_tree` = 首提交的树）→ `POST /git/commits` → `PATCH /git/refs/heads/main`
  4. `POST /pages` 开 Pages（`/docs`）
  5. 日志：`D:\hermes-workspace\ops\publish.log`

### 17.3 线上验证（实测，不是「应该能用」）

- Pages `status: built`，`builds/latest` = built
- 首页 HTTP 200，**1592498 字节**，与本地 `dist/index.html` 完全一致；标题命中「双缝之外」
- 浏览器实测 live 站点：`App` 正常、四款内嵌字体 `document.fonts.check` 全 true、`enter/pre/concept/lab/post/review/gate` 七条路由 `scrollWidth==clientWidth`、`onerror=[]`

### 17.4 以后怎么更新

改源码 → `python build.py` → 把 `dist/index.html` 覆盖到 `docs/index.html` → 再跑一次 `gh_publish.py`（或网页上传 / 代理稳定时 `git push`）。
本地仓库已 init 并提交过一次（`.git`，remote 指向该仓库，凭据在 URL 里，别把 `.git/config` 外发）。

**坑（已踩过）**：连续两条 API 提交后 Pages 会卡在 `errored`（`builds/latest` 却一直显示 `building`），站点本身仍正常返回。
修法：`POST /repos/qianhui-pev/yang-double-slit/pages/builds` 手动重跑一次，15–30 s 后回到 `built`。
