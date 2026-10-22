"""Ghép danh sách từ vựng N5 (jlpt-word-list, dữ liệu tanos) với nghĩa tiếng Việt,
loại từ, chủ đề; xuất ra CSV (mở bằng Excel) và JSON (cho app).

Cách dùng: python3 build_n5.py <thư mục chứa n5.csv và vi_*.txt> <thư mục xuất>
"""
import csv
import json
import re
import sys
from pathlib import Path

TYPES = {
    "N": "danh từ", "V1": "động từ nhóm 1", "V2": "động từ nhóm 2",
    "V3": "động từ bất quy tắc", "VS": "danh từ + する", "AI": "tính từ い",
    "ANA": "tính từ な", "ADV": "trạng từ", "PRO": "đại từ",
    "DEM": "từ chỉ định", "Q": "từ để hỏi", "CONJ": "liên từ",
    "INT": "thán từ, câu giao tiếp", "CTR": "trợ số từ", "SUF": "hậu tố",
    "PRE": "tiền tố", "NUM": "số từ",
}
TOPICS = {
    "CH": "Chào hỏi, giao tiếp", "GD": "Gia đình, con người", "AU": "Ăn uống",
    "NH": "Nhà ở, đồ vật", "TH": "Trường học, công việc", "SH": "Sinh hoạt hằng ngày",
    "ST": "Sở thích, giải trí", "PX": "Phố xá, giao thông", "MS": "Mua sắm, tiền",
    "TT": "Thời tiết, thiên nhiên", "CT": "Cơ thể, sức khỏe", "MA": "Màu sắc",
    "QA": "Quần áo", "TG": "Thời gian", "SO": "Số, đếm", "VT": "Vị trí, phương hướng",
    "TC": "Tính chất, cảm xúc", "CD": "Chỉ định, nghi vấn", "NP": "Từ chức năng, trạng từ",
    "DV": "Động vật", "HD": "Động từ thường dùng",
}
KANJI_RE = re.compile(r"[一-鿿々]")


def clean(text: str) -> str:
    text = re.sub(r"\s*\((する|〜を)\)", "", text)
    return text.strip()


def main(src: Path, out: Path) -> None:
    rows = list(csv.DictReader(open(src / "n5.csv", encoding="utf-8")))
    vi = {}
    for f in sorted(src.glob("vi_*.txt")):
        for line in f.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            idx, meaning, typ, topic = line.split("|")
            vi[int(idx)] = (meaning, typ, topic)

    assert len(rows) == len(vi) == 718, (len(rows), len(vi))
    words = []
    for i, r in enumerate(rows, start=1):
        meaning, typ, topic = vi[i]
        assert typ in TYPES and topic in TOPICS, (i, typ, topic)
        word = clean(r["expression"])
        words.append({
            "id": f"n5-{i:04d}",
            "word": word,
            "reading": clean(r["reading"]),
            "meaning_vi": meaning,
            "meaning_en": r["meaning"].strip(),
            "type": TYPES[typ],
            "topic": TOPICS[topic],
            "kanji": sorted(set(KANJI_RE.findall(word)), key=word.index),
            "suru_verb": typ == "VS" or "(する)" in r["reading"],
            "level": "N5",
        })

    out.mkdir(parents=True, exist_ok=True)
    meta = {
        "name": "JLPT N5 vocabulary (tiếng Việt)",
        "count": len(words),
        "source": "jlpt-word-list (github.com/elzup/jlpt-word-list), dữ liệu gốc tanos.co.uk – Jonathan Waller, CC BY",
        "note": "Nghĩa tiếng Việt, loại từ và chủ đề được bổ sung; nên rà lại trước khi dùng.",
    }
    (out / "n5_vocab.json").write_text(
        json.dumps({"meta": meta, "words": words}, ensure_ascii=False, indent=1),
        encoding="utf-8")

    cols = ["id", "word", "reading", "meaning_vi", "meaning_en", "type", "topic", "kanji", "suru_verb", "level"]
    with open(out / "n5_vocab.csv", "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for word in words:
            w.writerow({**word, "kanji": " ".join(word["kanji"]), "suru_verb": "x" if word["suru_verb"] else ""})
    print(f"Wrote {len(words)} words to {out}")


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
