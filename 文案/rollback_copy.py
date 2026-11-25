#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 src 还原到 文案/backup/ 里最近一次备份，然后重新构建打包。"""
import io, os, sys, shutil, zipfile, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BK = os.path.join(ROOT, "文案", "backup")

def pick():
    if not os.path.isdir(BK):
        return None
    tags = sorted(t for t in os.listdir(BK) if os.path.isdir(os.path.join(BK, t)))
    if len(tags) >= 2:
        return tags[-2]          # 回退 = 上一版（当前这一版是最新备份）
    return tags[-1] if tags else None

def main():
    tag = pick()
    if not tag:
        print("没有备份可回退。")
        return 1
    d = os.path.join(BK, tag)
    for f in os.listdir(os.path.join(d, "js")):
        shutil.copyfile(os.path.join(d, "js", f), os.path.join(ROOT, "src", "js", f))
    shutil.copyfile(os.path.join(d, "shell.html"), os.path.join(ROOT, "src", "shell.html"))
    print("已还原 src ← 文案/backup/%s" % tag)
    r = subprocess.run([sys.executable, os.path.join(ROOT, "build.py")], cwd=ROOT,
                       capture_output=True, text=True)
    print(r.stdout.strip())
    if r.returncode != 0:
        print("构建失败：\n" + (r.stderr or "")[-1500:]); return 2
    dist = os.path.join(ROOT, "dist", "index.html"); docs = os.path.join(ROOT, "docs", "index.html")
    shutil.copyfile(dist, docs)
    with zipfile.ZipFile(os.path.join(ROOT, "双缝之外-杨氏干涉实验室.zip"), "w",
                         zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.write(dist, "index.html")
    print("已重新打包。")
    return 0

if __name__ == "__main__":
    sys.exit(main())
