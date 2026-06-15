import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CMS = "/services/clinical-management-software.html"
CLICK_READER = f"{CMS}#comp-m4wzb8lj6"

html_files = [
    p
    for p in ROOT.rglob("*.html")
    if "_archive" not in p.parts
]

for path in html_files:
    content = path.read_text(encoding="utf-8")
    original = content

    content = re.sub(
        r'(<a[^>]*data-anchor="anchors-m4wzb8ll3"[^>]*href=")[^"]*(")',
        rf"\1{CLICK_READER}\2",
        content,
    )

    content = re.sub(
        r'(<a[^>]*href=")(?:\.\./)*(?:services/)?clinical-management-software\.html("[^>]*>\s*<div[^>]*>\s*<span[^>]*>\s*Clinical Management Software)',
        rf"\1{CMS}\2",
        content,
        flags=re.S,
    )

    content = content.replace(
        'href="services/clinical-management-software.html"',
        f'href="{CMS}"',
    )
    content = content.replace(
        'href="../services/clinical-management-software.html"',
        f'href="{CMS}"',
    )

    if content != original:
        path.write_text(content, encoding="utf-8")
        print(f"patched {path.relative_to(ROOT)}")

cms_path = ROOT / "services" / "clinical-management-software.html"
if cms_path.exists():
    cms = cms_path.read_text(encoding="utf-8")
    if 'id="anchors-m4wzb8ll3"' not in cms:
        cms = cms.replace(
            '<div id="comp-m4wzb8lj6"',
            '<div id="anchors-m4wzb8ll3" class="tp-page-anchor" aria-hidden="true"></div><div id="comp-m4wzb8lj6"',
            1,
        )
        cms_path.write_text(cms, encoding="utf-8")
        print("patched clinical-management-software anchor")
