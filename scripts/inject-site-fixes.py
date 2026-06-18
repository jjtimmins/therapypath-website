import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "6"
CSS = f'  <link rel="stylesheet" href="/site-fixes.css?v={VERSION}" />\n'
BOOT_STYLE = (
    '  <style id="tp-mobile-boot-style">'
    "@media (max-width:980px){"
    "html.tp-mobile-booting:not(.tp-mobile-ready) #SITE_CONTAINER{opacity:0}"
    "html.tp-mobile-booting:not(.tp-mobile-ready) body{background:#fff}"
    "}"
    "</style>\n"
)
BOOT_JS = f'  <script src="/site-fixes-boot.js?v={VERSION}"></script>\n'
JS = f'  <script src="/site-fixes.js?v={VERSION}" defer></script>\n'

SITE_FIXES_BLOCK = CSS + BOOT_STYLE + BOOT_JS

LEGACY_PATTERNS = [
    re.compile(r'  <link rel="stylesheet" href="/site-fixes\.css(?:\?v=[^"]*)?" />\n'),
    re.compile(r'  <style id="tp-mobile-boot-style">.*?</style>\n', re.DOTALL),
    re.compile(r'  <script src="/site-fixes-boot\.js(?:\?v=[^"]*)?"></script>\n'),
    re.compile(r'  <script src="/site-fixes\.js(?:\?v=[^"]*)?" defer></script>\n'),
]


def normalize_site_fixes(content: str) -> str:
    for pattern in LEGACY_PATTERNS:
        content = pattern.sub("", content)
    if "site-fixes.css" not in content:
        content = content.replace("</head>", SITE_FIXES_BLOCK + "</head>", 1)
    elif f"site-fixes.css?v={VERSION}" not in content:
        content = content.replace("</head>", SITE_FIXES_BLOCK + "</head>", 1)
    if f"site-fixes.js?v={VERSION}" not in content:
        content = content.replace("</body>", JS + "</body>", 1)
    return content


for path in ROOT.rglob("*.html"):
    if "_archive" in path.parts:
        continue
    content = path.read_text(encoding="utf-8")
    updated = normalize_site_fixes(content)
    if updated != content:
        try:
            path.write_text(updated, encoding="utf-8")
            print(f"injected {path.relative_to(ROOT)}")
        except OSError as err:
            print(f"failed {path.relative_to(ROOT)}: {err}")
