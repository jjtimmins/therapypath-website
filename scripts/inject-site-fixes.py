import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS = '  <link rel="stylesheet" href="/site-fixes.css" />\n'
BOOT_STYLE = (
    '  <style id="tp-mobile-boot-style">'
    "@media (max-width:980px){"
    "html.tp-mobile-booting:not(.tp-mobile-ready) #SITE_CONTAINER{opacity:0}"
    "html.tp-mobile-booting:not(.tp-mobile-ready) body{background:#fff}"
    "}"
    "</style>\n"
)
BOOT_JS = '  <script src="/site-fixes-boot.js"></script>\n'
JS = '  <script src="/site-fixes.js" defer></script>\n'

for path in ROOT.rglob("*.html"):
    if "_archive" in path.parts:
        continue
    content = path.read_text(encoding="utf-8")
    original = content
    if "site-fixes.css" not in content:
        content = content.replace("</head>", CSS + BOOT_STYLE + BOOT_JS + "</head>", 1)
    else:
        if "site-fixes-boot.js" not in content:
            content = content.replace(
                '  <link rel="stylesheet" href="/site-fixes.css" />\n',
                CSS + BOOT_STYLE + BOOT_JS,
                1,
            )
    if "site-fixes.js" not in content:
        content = content.replace("</body>", JS + "</body>", 1)
    if content != original:
        try:
            path.write_text(content, encoding="utf-8")
            print(f"injected {path.relative_to(ROOT)}")
        except OSError as err:
            print(f"failed {path.relative_to(ROOT)}: {err}")
