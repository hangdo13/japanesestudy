"""Vẽ icon app từ linh vật Pyon (Kotoba.mascot) bằng Playwright.

Chạy một lần khi cần đổi icon: python3 scripts/make-icons.py
Kết quả nằm trong public/icons/. Nền là --surface-tint (theme sáng) của tokens.css.
"""
import asyncio
import pathlib
import re

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
BUNDLE = (ROOT / 'src/ui/components/bundle.js').read_text(encoding='utf-8')
TOKENS = (ROOT / 'src/ui/tokens.css').read_text(encoding='utf-8')
_m = re.search(r'--surface-tint:\s*(#[0-9a-fA-F]+)', TOKENS)
if not _m:
    raise SystemExit('Không tìm thấy token --surface-tint (dạng mã hex) trong src/ui/tokens.css')
TINT = _m.group(1)
# kích thước -> tên file (180 là icon màn hình chính của iOS)
NAMES = {180: 'apple-touch-icon.png', 192: 'icon-192.png', 512: 'icon-512.png'}

PAGE = f"""<!doctype html><html><body style="margin:0">
<div id="box" style="width:512px;height:512px;background:{TINT};display:flex;align-items:center;justify-content:center">
<span class="kt-mascot" data-mascot="happy" data-size="400" data-flag="off"></span></div>
<script>{BUNDLE}</script><script>Kotoba.hydrate();</script></body></html>"""


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        out_dir = ROOT / 'public/icons'
        out_dir.mkdir(parents=True, exist_ok=True)
        for size, name in NAMES.items():
            pg = await b.new_page(viewport={'width': 512, 'height': 512}, device_scale_factor=size / 512)
            await pg.set_content(PAGE)
            await pg.wait_for_selector('.kt-mascot svg')
            out = out_dir / name
            await (await pg.query_selector('#box')).screenshot(path=str(out))
            print(out.relative_to(ROOT))
        await b.close()


asyncio.run(main())
