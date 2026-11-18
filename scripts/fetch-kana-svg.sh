#!/usr/bin/env bash
# Tải SVG thứ tự nét của hiragana/katakana từ KanjiVG (CC BY-SA 3.0) và đặt tên theo chữ.
# KanjiVG đặt tên file theo mã Unicode (vd. 03057.svg = し).
# Bản đang dùng: KanjiVG commit 9d7220dfca09107dca2e0b0e45f90f696185e3c3 (18/11/2026).
# Cách chạy: bash scripts/fetch-kana-svg.sh [commit]
set -euo pipefail
REF="${1:-9d7220dfca09107dca2e0b0e45f90f696185e3c3}"
OUT="$(dirname "$0")/../public/kana/svg"
mkdir -p "$OUT"
python3 - "$REF" "$OUT" <<'PY'
import sys, urllib.request, pathlib
ref, out = sys.argv[1], pathlib.Path(sys.argv[2])
cps = list(range(0x3041, 0x3094)) + list(range(0x30A1, 0x30F5)) + [0x30FC]
for c in cps:
    url = f'https://raw.githubusercontent.com/KanjiVG/kanjivg/{ref}/kanji/{c:05x}.svg'
    (out / f'{chr(c)}.svg').write_bytes(urllib.request.urlopen(url).read())
print(f'{len(cps)} file -> {out}')
PY
