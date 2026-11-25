#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""扫描源码里全部面向学生的文字，生成/更新 文案/strings.json 与 文案/文案清单.html。
已填的「新文案」按（文件 + 原文）保留，不会丢。"""
import io, json, os, re, sys, html, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
OUT = os.path.join(ROOT, "文案")
cjk = re.compile(r'[\u4e00-\u9fff]')
tag = re.compile(r'<[^>]*>')

PAGES = {"shell.html": "顶栏外壳", "boot.js": "口令门 / 顶栏入口", "core.js": "步骤名 / 存档",
         "views-enter.js": "入口页", "views-pre.js": "前测", "views-concept.js": "概念导读",
         "views-lab.js": "实验台", "views-post.js": "后测", "views-review.js": "复盘",
         "views-teacher.js": "控制台", "tutor.js": "AI 助教抽屉",
         "analysis.js": "错因 / 分层 / 个性化路径", "physics.js": "物理量标签"}
TONE = [("祈使", r"请|记得|务必|不要|别忘|注意"), ("解释", r"因为|所以|意味着|其实|就是说|换句话说|也就是"),
        ("鼓励", r"可以试试|不妨|建议|慢慢来|别急|放心"), ("断言", r"才|只要|必须|一定")]

def rd(p):
    with io.open(p, encoding="utf-8") as f:
        return f.read()

def display(s):
    return tag.sub("", s).replace("\\n", " ").strip()

def scan():
    rows, n = [], 0
    files = [("shell.html", os.path.join(SRC, "shell.html"))]
    jsdir = os.path.join(SRC, "js")
    files += [(b, os.path.join(jsdir, b)) for b in sorted(os.listdir(jsdir))
              if b.endswith(".js") and b not in ("dev.js", "fx.js")]
    for base, path in files:
        txt = rd(path); seen = set(); local = []
        for i, line in enumerate(txt.splitlines(), 1):
            for pat in (r"'((?:\\.|[^'\\])*)'", r'"((?:\\.|[^"\\])*)"'):
                for m in re.finditer(pat, line):
                    raw = m.group(1); q = line[m.start()]; d = display(raw)
                    if not cjk.search(d) or len(d) < 2 or raw in seen:
                        continue
                    seen.add(raw); local.append((i, raw, q, d))
        for i, raw, q, d in local:
            n += 1
            rows.append({"id": "C-%03d" % n, "页": PAGES.get(base, base), "文件": base, "行": i,
                         "引号": q, "原文": raw, "显示": d, "字数": len(d),
                         "长文案": len(d) >= 16, "含标记": d != raw,
                         "语气": [k for k, rx in TONE if re.search(rx, d)], "新文案": ""})
    return rows

def merge(rows):
    p = os.path.join(OUT, "strings.json")
    if os.path.exists(p):
        try:
            old = json.loads(rd(p)).get("条目", [])
        except Exception:
            old = []
        keep = {(o["文件"], o["原文"]): o.get("新文案", "") for o in old if o.get("新文案")}
        kept = 0
        for r in rows:
            v = keep.get((r["文件"], r["原文"]))
            if v:
                r["新文案"] = v; kept += 1
        if kept:
            print("  保留了 %d 条已填的新文案" % kept)
    return rows

def write_json(rows):
    os.makedirs(OUT, exist_ok=True)
    with io.open(os.path.join(OUT, "strings.json"), "w", encoding="utf-8") as f:
        json.dump({"说明": "只填「新文案」；含标记=true 的条目自动应用会跳过（要人工接线）。", "条目": rows},
                  f, ensure_ascii=False, indent=1)

def esc(s):
    return html.escape(s)

def write_html(rows):
    order = ["顶栏外壳", "口令门 / 顶栏入口", "步骤名 / 存档", "入口页", "前测", "概念导读", "实验台",
             "后测", "复盘", "控制台", "AI 助教抽屉", "错因 / 分层 / 个性化路径", "物理量标签"]
    pages = [p for p in order if any(r["页"] == p for r in rows)]
    secs = []
    for pg in pages:
        rs = sorted([r for r in rows if r["页"] == pg], key=lambda r: (-len(r["显示"]), r["行"]))
        items = "\n".join(
            '<tr data-long="%d" data-tag="%d"><td class="id">%s</td><td class="loc">%s<span class="ln">:%s</span></td>'
            '<td class="txt">%s%s%s</td><td class="n">%d</td></tr>' % (
                r["长文案"], r["含标记"], r["id"], r["文件"], r["行"],
                esc(r["原文"] if r["含标记"] else r["显示"]),
                ('<i class="chip">含排版标记</i>' if r["含标记"] else ""),
                "".join('<i class="tone">%s</i>' % t for t in r["语气"]), len(r["显示"]))
            for r in rs)
        secs.append('<section><h2>%s<span class="cnt">%d 条 · %d 字</span></h2><table>%s</table></section>' % (
            esc(pg), len(rs), sum(len(r["显示"]) for r in rs), items))
    tot = len(rows); longn = sum(1 for r in rows if r["长文案"]); tagd = sum(1 for r in rows if r["含标记"])
    chars = sum(len(r["显示"]) for r in rows)
    tpl = rd(os.path.join(OUT, "template.html"))
    doc = (tpl.replace("{{TOT}}", str(tot)).replace("{{CHARS}}", str(chars))
               .replace("{{LONGN}}", str(longn)).replace("{{TAGD}}", str(tagd))
               .replace("{{SECS}}", "".join(secs)))
    with io.open(os.path.join(OUT, "文案清单.html"), "w", encoding="utf-8") as f:
        f.write(doc)

def main():
    rows = merge(scan())
    write_json(rows)
    if os.path.exists(os.path.join(OUT, "template.html")):
        write_html(rows)
        print("文案清单.html 已更新")
    print("共 %d 条（长文案 %d，含标记 %d）" % (len(rows), sum(1 for r in rows if r["长文案"]),
                                        sum(1 for r in rows if r["含标记"])))

if __name__ == "__main__":
    main()
