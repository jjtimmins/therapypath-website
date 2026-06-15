import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS = '  <link rel="stylesheet" href="/site-fixes.css" />\n'
JS = '  <script src="/site-fixes.js" defer></script>\n'

for path in ROOT.rglob("*.html"):
    if "_archive" in path.parts:
        continue
    content = path.read_text(encoding="utf-8")
    original = content
    if "site-fixes.css" not in content:
        content = content.replace("</head>", CSS + "</head>", 1)
    if "site-fixes.js" not in content:
        content = content.replace("</body>", JS + "</body>", 1)
    if content != original:
        try:
            path.write_text(content, encoding="utf-8")
            print(f"injected {path.relative_to(ROOT)}")
        except OSError as err:
            print(f"failed {path.relative_to(ROOT)}: {err}")
