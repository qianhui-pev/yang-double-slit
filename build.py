
import os, re, sys, io, hashlib, base64

ROOT = os.path.dirname(os.path.abspath(__file__))
def rd(p):
    with io.open(os.path.join(ROOT,p),encoding="utf-8") as f: return f.read()

shell = rd("src/shell.html")
css = ["src/css/base.css","src/css/app.css","src/css/refine.css"]
js  = ["src/js/physics.js","src/js/core.js","src/js/optics.js","src/js/views-enter.js",
       "src/js/views-pre.js","src/js/views-concept.js","src/js/views-lab.js",
       "src/js/views-post.js","src/js/analysis.js","src/js/views-review.js",
       "src/js/views-teacher.js","src/js/tutor.js","src/js/boot.js","src/js/dev.js","src/js/fx.js"]

css_txt = "\n".join(rd(f) for f in css if os.path.exists(os.path.join(ROOT,f)))
parts = []
for f in js:
    fp = os.path.join(ROOT,f)
    if not os.path.exists(fp):
        print("  ! missing:", f); continue
    parts.append("/* ==== %s ==== */\n%s" % (os.path.basename(f), rd(f)))
js_txt = "\n".join(parts)
body_txt = css_txt + "\n" + js_txt + "\n" + shell

# ---------- 字体：按实际用到的字符做子集，base64 内嵌 ----------
FONTS = [
    # (family, 源文件, 字重声明, 是否子集化)
    ("YDS xiaowei", "build/fontsrc/ZCOOLXiaoWei-Regular.ttf", "400", True),
    ("YDS notoserif","C:/Windows/Fonts/NotoSerifSC-VF.ttf",  "100 900", True),
    ("YDS notosans","C:/Windows/Fonts/NotoSansSC-VF.ttf",     "100 900", True),
    ("YDS orbit",   "build/fontsrc/Orbitron-latin.woff2",    "400 900", False),
]

def charset_of(text):
    s = set(text)
    s |= set(chr(c) for c in range(32,127))
    s |= set("—·Δλδθ≈≪≥≤∞±½⅓⅔πΣØ✦✓✗←→↑↓…“”‘’「」『』（）《》〈〉：；！？、。，°′″²²³")
    return "".join(sorted(c for c in s if c not in "\r\n\t"))

def subset_font(src_path, dst, chars):
    from fontTools.ttLib import TTFont
    from fontTools import subset as ftsub
    f = TTFont(src_path)
    opts = ftsub.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    opts.notdef_outline = True
    sub = ftsub.Subsetter(options=opts)
    sub.populate(unicodes=[ord(c) for c in chars])
    sub.subset(f)
    f.flavor = "woff2"
    f.save(dst)
    # 覆盖校验：子集里必须含全部字符
    g = TTFont(dst)
    cmap = set()
    for t in g["cmap"].tables: cmap |= set(t.cmap.keys())
    missing = [c for c in chars if ord(c) not in cmap]
    return os.path.getsize(dst), missing

def build_fonts(body_txt):
    chars = charset_of(body_txt)
    key = hashlib.sha1(chars.encode("utf-8")).hexdigest()[:10]
    cache_dir = os.path.join(ROOT, "build", "fonts", "cache")
    os.makedirs(cache_dir, exist_ok=True)
    faces = []
    total = 0
    for fam, src, weight, do_subset in FONTS:
        sp = src if os.path.isabs(src) else os.path.join(ROOT, src)
        if not os.path.exists(sp):
            print("  ! 字体缺失，跳过:", src); continue
        if do_subset:
            dst = os.path.join(cache_dir, "%s-%s.woff2" % (fam.replace(" ", "_"), key))
            if not os.path.exists(dst):
                sz, miss = subset_font(sp, dst, chars)
                if miss:
                    print("  ! 缺字 %d 个，最多列出：%s" % (len(miss), "".join(miss[:20])))
            else:
                sz = os.path.getsize(dst)
            print("  %-14s 子集 %.1f KB（%d 字）" % (fam, sz/1024, len(chars)))
        else:
            dst = sp; sz = os.path.getsize(dst)
            print("  %-14s 原样 %.1f KB" % (fam, sz/1024))
        b64 = base64.b64encode(open(dst,"rb").read()).decode()
        total += len(b64)
        faces.append("@font-face{font-family:'%s';font-weight:%s;font-display:swap;"
                     "src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, weight, b64))
    print("  字体 base64 合计 %.1f KB" % (total/1024))
    return "\n".join(faces)

font_css = build_fonts(body_txt)
css_txt = font_css + "\n" + css_txt

out = shell.replace("/*__CSS__*/", css_txt).replace("/*__JS__*/", js_txt)
os.makedirs(os.path.join(ROOT,"dist"),exist_ok=True)
with io.open(os.path.join(ROOT,"dist","index.html"),"w",encoding="utf-8") as f:
    f.write(out)
print("built dist/index.html  %.1f KB" % (len(out.encode("utf-8"))/1024))
