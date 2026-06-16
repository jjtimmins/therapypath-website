import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CMS = "/services/clinical-management-software.html"
CLICK_READER = f"{CMS}#comp-m4wzb8lj6"
FEES_ANCHOR = "anchors-m4uec27r6"
FEES_SECTION = "comp-m4uec27w1"
FEES_EN = f"/contact-us.html#{FEES_SECTION}"
FEES_FR = f"/fr/contact-us.html#{FEES_SECTION}"

html_files = [
    p
    for p in ROOT.rglob("*.html")
    if "_archive" not in p.parts
]


def fees_href(path: Path) -> str:
    if path.name == "fr.html" or "fr" in path.parts:
        return FEES_FR
    return FEES_EN


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

    content = re.sub(
        rf'(<a[^>]*data-anchor="{FEES_ANCHOR}"[^>]*href=")[^"]*(")',
        rf"\1{fees_href(path)}\2",
        content,
    )

    content = re.sub(
        rf'(<a[^>]*)\s*data-anchor="{FEES_ANCHOR}"',
        r"\1",
        content,
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

for contact_path in [ROOT / "contact-us.html", ROOT / "fr" / "contact-us.html"]:
    if not contact_path.exists():
        continue
    contact = contact_path.read_text(encoding="utf-8")
    original = contact
    contact = contact.replace(
        '<div id="anchors-m4uec27r6" class="tp-page-anchor" aria-hidden="true"></div>',
        "",
    )
    if contact != original:
        contact_path.write_text(contact, encoding="utf-8")
        print(f"removed legacy fees anchor from {contact_path.relative_to(ROOT)}")

