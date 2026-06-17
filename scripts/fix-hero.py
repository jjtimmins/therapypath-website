import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HERO_IMAGE = "/images/opt/adobestock_495222202-980w.webp"
HERO_BLOCK = (
    '<wow-image id="img_comp-m4n0yl36" class="Qh0lWW ayCf9D fO4mKs NgeJ4N bgImage" '
    'data-image-info="{&quot;containerId&quot;:&quot;comp-m4n0yl36&quot;,&quot;alignType&quot;:&quot;center&quot;,'
    '&quot;displayMode&quot;:&quot;fill&quot;,&quot;targetWidth&quot;:980,&quot;targetHeight&quot;:555,'
    '&quot;isLQIP&quot;:true,&quot;encoding&quot;:&quot;AVIF&quot;,&quot;imageData&quot;:{&quot;width&quot;:6528,'
    '&quot;height&quot;:4352,&quot;uri&quot;:&quot;AdobeStock_495222202.jpeg&quot;,&quot;name&quot;:&quot;&quot;,'
    '&quot;displayMode&quot;:&quot;fill&quot;,&quot;hasAnimation&quot;:false}}" '
    'data-motion-part="BG_IMG comp-m4n0yl36" data-bg-effect-name="" data-has-ssr-src="true">'
    f'<img src="{HERO_IMAGE}" alt="Speech therapy session" '
    'style="width:100%;height:100%;object-fit:cover;object-position:50% 50%" width="980" height="555"/></wow-image>'
)
PATTERN = re.compile(r'<wow-image id="img_comp-m4n0yl36"[^>]*>.*?</wow-image>', re.DOTALL)

for name in ("index.html", "fr.html"):
    path = ROOT / name
    if not path.exists():
        continue
    content = path.read_text(encoding="utf-8")
    if not PATTERN.search(content):
        print(f"skip {name}: hero block not found")
        continue
    content = PATTERN.sub(HERO_BLOCK, content, count=1)
    path.write_text(content, encoding="utf-8")
    print(f"fixed {name}")
