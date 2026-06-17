import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
titles: set[str] = set()
wix_ids: set[str] = set()

for path in ROOT.rglob("*.html"):
    if "_archive" in path.parts:
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    titles.update(re.findall(r'title="([^"]+\.(?:jpe?g|png|webp)[^"]*)"', text, re.I))
    titles.update(re.findall(r"&quot;uri&quot;:&quot;([^&]+\.(?:jpe?g|png))&quot;", text))
    for match in re.finditer(r"wixstatic\.com/media/([a-z0-9_~%-]+)", text, re.I):
        wix_ids.add(match.group(1).split("/")[0])

local = {p.name.lower(): p.name for p in (ROOT / "images").glob("*") if p.is_file()}
print(f"titles in html: {len(titles)}")
print(f"wix media ids: {len(wix_ids)}")
print(f"local images: {len(local)}")
missing = []
for title in sorted(titles):
    base = Path(title.split("~")[0]).name.lower()
    if base not in local and base.replace("_mv2", "") not in local:
        missing.append(title)
print(f"missing local files for titles: {len(missing)}")
for item in missing[:30]:
    print("  MISSING", item)
