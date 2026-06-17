from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRELOAD = (
    '  <link rel="preload" as="image" href="/images/opt/adobestock_495222202-980w.webp" '
    'fetchpriority="high" />\n'
)

for name in ("index.html", "fr.html"):
    path = ROOT / name
    if not path.exists():
        continue
    content = path.read_text(encoding="utf-8")
    if "adobestock_495222202-980w.webp" in content and 'rel="preload" as="image"' in content:
        continue
    if "</head>" not in content:
        continue
    content = content.replace("</head>", PRELOAD + "</head>", 1)
    path.write_text(content, encoding="utf-8")
    print(f"injected LCP preload into {name}")
