#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 文案/strings.json 里填好的「新文案」写回源码，然后重新打包。

用法（双击「重写文案并打包.bat」等价）：
    py -3 文案/apply_copy.py           # 应用 + 构建 + 打包
    py -3 文案/apply_copy.py --dry     # 只报告会改哪些，不动文件

规则：
  · 只处理 新文案 非空、且 含标记=false 的条目（含 HTML 标记的条目要人工接线）
  · 每条必须在对应文件里「完整原文（带引号）恰好出现 ≥1 次」，0 次直接报错、一个文件都不写
  · 写之前先备份 src 到 文案/backup/<时间戳>/
"""
import io, json, os, re, sys, shutil, zipfile, subprocess, hashlib, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def rd(p):
    with io.open(p, encoding="utf-8") as f:
        return f.read()

def wr(p, s):
    with io.open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

def src_path(row):
    f = row["文件"]
    return os.path.join(ROOT, "src", f) if f == "shell.html" else os.path.join(ROOT, "src", "js", f)

def backup(tag):
    d = os.path.join(ROOT, "文案", "backup", tag)
    os.makedirs(os.path.join(d, "js"), exist_ok=True)
    for f in os.listdir(os.path.join(ROOT, "src", "js")):
        if f.endswith(".js"):
            shutil.copyfile(os.path.join(ROOT, "src", "js", f), os.path.join(d, "js", f))
    shutil.copyfile(os.path.join(ROOT, "src", "shell.html"), os.path.join(d, "shell.html"))
    return d

def build_and_pack():
    r = subprocess.run([sys.executable, os.path.join(ROOT, "build.py")], cwd=ROOT,
                       capture_output=True, text=True)
    print(r.stdout.strip())
    if r.returncode != 0:
        print("构建失败：\n" + (r.stderr or "")[-2000:])
        return False
    dist = os.path.join(ROOT, "dist", "index.html")
    docs = os.path.join(ROOT, "docs", "index.html")
    shutil.copyfile(dist, docs)
    zp = os.path.join(ROOT, "双缝之外-杨氏干涉实验室.zip")
    with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.write(dist, "index.html")
    kb = os.path.getsize(dist) / 1024
    print("\n已打包：dist/docs 同源（%d 字节 / %.1f KB），zip %.1f KB" %
          (os.path.getsize(dist), kb, os.path.getsize(zp) / 1024))
    return True

def main():
    dry = "--dry" in sys.argv
    data = json.loads(rd(os.path.join(ROOT, "文案", "strings.json")))
    rows = [r for r in data["条目"] if (r.get("新文案") or "").strip()]
    if not rows:
        print("strings.json 里还没有任何「新文案」，什么都没做。")
        return 0
    errors, plans = [], []
    for r in rows:
        if r.get("含标记"):
            print("  · 跳过 %s（含排版标记，需人工接线）：%s" % (r["id"], r["显示"][:40]))
            continue
        p = src_path(r)
        q = r["引号"]
        needle = q + r["原文"] + q
        body = rd(p)
        n = body.count(needle)
        if n == 0:
            errors.append("%s %s:%s 找不到原文（可能已经改过）：%s" % (r["id"], r["文件"], r["行"], r["原文"][:50]))
            continue
        plans.append((r, p, needle, n))

    if errors:
        print("\n有 %d 条对不上，一个字都没改：" % len(errors))
        for e in errors:
            print("  ✗ " + e)
        return 1

    print("\n将应用 %d 条：" % len(plans))
    for r, p, needle, n in plans:
        once = "·1处" if n == 1 else "·%d处" % n
        print("  %s %-14s %s %s → %s" % (r["id"], r["文件"], r["行"], once, r["新文案"][:60]))
    if dry:
        print("\n（--dry 预演模式：没有写文件）")
        return 0

    tag = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    d = backup(tag)
    print("\n已备份 src → 文案/backup/%s" % tag)

    touched = {}
    for r, p, needle, n in plans:
        body = rd(p)
        touched[p] = body.replace(needle, r["引号"] + r["新文案"] + r["引号"])
    for p, body in touched.items():
        wr(p, body)
        print("  写入 %s（%d 条）" % (os.path.basename(p), sum(1 for r, pp, _n, _c in plans if pp == p)))

    print("\n重新构建 ……")
    if not build_and_pack():
        print("\n构建失败：源码已改，但打包没完成。可双击「回退上次文案.bat」还原到 %s。" % tag)
        return 2
    print("\n好了。想撤掉这次改动：双击「回退上次文案.bat」。")
    return 0

if __name__ == "__main__":
    sys.exit(main())
