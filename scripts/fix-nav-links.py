import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CMS = "/services/clinical-management-software.html"
CLICK_READER = f"{CMS}#comp-m4wzb8lj6"
FEES_ANCHOR = "anchors-m4uec27r6"
FEES_SECTION = "comp-m4uec27w1"
FEES_EN = f"/contact-us.html#{FEES_SECTION}"
FEES_FR = f"/fr/contact-us.html#{FEES_SECTION}"
SPEECH_THERAPY_ANCHOR = "anchors-m4u9ygef6"
LANGUAGE_THERAPY_ANCHOR = "anchors-m4u9yger9"
ASSISTIVE_THERAPY_ANCHOR = "anchors-m4u9ygfe4"
ASSISTIVE_THERAPY_SECTION = "comp-m4u9ygfg2"

MENU_THERAPY_MARKERS = {
    "comp-m4ug6tb2": SPEECH_THERAPY_ANCHOR,
    "comp-m4ugakei": LANGUAGE_THERAPY_ANCHOR,
    "comp-m4ugdit94": ASSISTIVE_THERAPY_ANCHOR,
}

FR_LANGUAGE_MENU_OLD = (
    '<span class="color_37 wixui-rich-text__text"><span style="text-decoration:underline;" '
    'class="wixui-rich-text__text"><span style="font-weight:bold;" '
    'class="wixui-rich-text__text">Langage</span></span></span>'
)

MENU_THERAPY_LINK_PATTERN = (
    r'(<a href=")(?:\.\./)*(?:fr/)?(?:services/)?therapy\.html(?:#[^"]*)?("'
    r'(?:\s+target="_self")?(?:\s+data-anchor="[^"]*")?\s+class="wixui-rich-text__text")'
)

html_files = [
    p
    for p in ROOT.rglob("*.html")
    if "_archive" not in p.parts
]


def fees_href(path: Path) -> str:
    if path.name == "fr.html" or "fr" in path.parts:
        return FEES_FR
    return FEES_EN


def therapy_href(path: Path, anchor: str) -> str:
    if path.name == "fr.html" or "fr" in path.parts:
        return f"/fr/services/therapy.html#{anchor}"
    if path.parent.name == "services":
        return f"therapy.html#{anchor}"
    return f"/services/therapy.html#{anchor}"


def fix_menu_therapy_link(content: str, marker_div_id: str, anchor: str, path: Path) -> str:
    marker = f'<div id="{marker_div_id}"'
    idx = content.rfind(marker)
    if idx < 0:
        return content

    chunk_start = max(0, idx - 1500)
    chunk = content[chunk_start:idx]
    matches = list(re.finditer(MENU_THERAPY_LINK_PATTERN, chunk))
    if not matches:
        return content

    match = matches[-1]
    replacement = f"{match.group(1)}{therapy_href(path, anchor)}{match.group(2)}"
    new_chunk = chunk[: match.start()] + replacement + chunk[match.end() :]
    return content[:chunk_start] + new_chunk + content[idx:]


def fix_fr_language_menu_link(content: str, path: Path) -> str:
    if path.name != "fr.html" and "fr" not in path.parts:
        return content
    if FR_LANGUAGE_MENU_OLD not in content:
        return content
    new = (
        f'<span class="color_37 wixui-rich-text__text">'
        f'<a href="{therapy_href(path, LANGUAGE_THERAPY_ANCHOR)}" target="_self" class="wixui-rich-text__text">'
        f'<span style="text-decoration:underline;" class="wixui-rich-text__text">'
        f'<span style="font-weight:bold;" class="wixui-rich-text__text">Langage</span></span></a></span>'
    )
    return content.replace(FR_LANGUAGE_MENU_OLD, new)


def fix_malformed_therapy_hashes(content: str) -> str:
    return re.sub(
        r'href="((?:\.\./)*(?:fr/)?(?:services/)?therapy\.html)"#(anchors-m4u9yg[^"]+)"',
        r'href="\1#\2"',
        content,
    )


for path in html_files:
    content = path.read_text(encoding="utf-8")
    original = content

    content = fix_malformed_therapy_hashes(content)

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

    content = re.sub(
        rf'(<a data-testid="linkElement") data-anchor="{SPEECH_THERAPY_ANCHOR}" href="therapy\.html"',
        rf'\1 href="{therapy_href(path, SPEECH_THERAPY_ANCHOR)}"',
        content,
    )

    content = re.sub(
        rf'(<a data-testid="linkElement") data-anchor="{LANGUAGE_THERAPY_ANCHOR}" href="therapy\.html"',
        rf'\1 href="{therapy_href(path, LANGUAGE_THERAPY_ANCHOR)}"',
        content,
    )

    content = re.sub(
        r'(<div id="comp-m6awikg0__item-64b1b493-7eb5-4e7e-975a-7fe92298fcca"[^>]*>\s*'
        r'<a data-testid="linkElement") href="consultations-workshops-reading-groups\.html"',
        rf'\1 href="{therapy_href(path, LANGUAGE_THERAPY_ANCHOR)}"',
        content,
        flags=re.S,
    )

    content = content.replace('href=\\"', 'href="')
    content = content.replace('\\" target="_self"', '" target="_self"')

    content = re.sub(
        rf'(<a[^>]*href=")therapy\.html("\s[^>]*)\s*data-anchor="{SPEECH_THERAPY_ANCHOR}"',
        rf'\1therapy.html#{SPEECH_THERAPY_ANCHOR}\2',
        content,
    )

    content = re.sub(
        rf'(<a[^>]*href=")therapy\.html("\s[^>]*)\s*data-anchor="{LANGUAGE_THERAPY_ANCHOR}"',
        rf'\1therapy.html#{LANGUAGE_THERAPY_ANCHOR}\2',
        content,
    )

    content = re.sub(
        rf'(<a[^>]*href=")therapy\.html("\s[^>]*)\s*data-anchor="{ASSISTIVE_THERAPY_ANCHOR}"',
        rf'\1therapy.html#{ASSISTIVE_THERAPY_ANCHOR}\2',
        content,
    )

    content = re.sub(
        rf'(<a[^>]*)\s*data-anchor="({SPEECH_THERAPY_ANCHOR}|{LANGUAGE_THERAPY_ANCHOR}|{ASSISTIVE_THERAPY_ANCHOR})"',
        r"\1",
        content,
    )

    for marker_div_id, anchor in MENU_THERAPY_MARKERS.items():
        content = fix_menu_therapy_link(content, marker_div_id, anchor, path)

    content = fix_fr_language_menu_link(content, path)

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

for therapy_path in [ROOT / "services" / "therapy.html", ROOT / "fr" / "services" / "therapy.html"]:
    if not therapy_path.exists():
        continue
    therapy = therapy_path.read_text(encoding="utf-8")
    original = therapy
    if f'id="{SPEECH_THERAPY_ANCHOR}"' not in therapy:
        therapy = therapy.replace(
            '<div id="comp-m4u9ygeh8"',
            f'<div id="{SPEECH_THERAPY_ANCHOR}" class="tp-page-anchor" aria-hidden="true"></div>'
            f'<div id="comp-m4u9ygeh8"',
            1,
        )
    if f'id="{LANGUAGE_THERAPY_ANCHOR}"' not in therapy:
        therapy = therapy.replace(
            '<div id="comp-m4u9ygew"',
            f'<div id="{LANGUAGE_THERAPY_ANCHOR}" class="tp-page-anchor" aria-hidden="true"></div>'
            f'<div id="comp-m4u9ygew"',
            1,
        )
    if f'id="{ASSISTIVE_THERAPY_ANCHOR}"' not in therapy:
        therapy = therapy.replace(
            f'<div id="{ASSISTIVE_THERAPY_SECTION}"',
            f'<div id="{ASSISTIVE_THERAPY_ANCHOR}" class="tp-page-anchor" aria-hidden="true"></div>'
            f'<div id="{ASSISTIVE_THERAPY_SECTION}"',
            1,
        )
    if therapy != original:
        therapy_path.write_text(therapy, encoding="utf-8")
        print(f"patched {therapy_path.relative_to(ROOT)} therapy anchors")

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

