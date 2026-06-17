import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WOW_RE = re.compile(
    r'<wow-image id="(img_[^"]+)"[^>]*data-image-info="([^"]+)"[^>]*>(.*?)</wow-image>',
    re.DOTALL,
)
SITE_CONTAINER = 'id="SITE_CONTAINER"'
PRELOAD_RE = re.compile(
    r'\s*<link rel="preload" as="image" href="[^"]+" fetchpriority="high" />\n'
)


def first_hero_src(body: str) -> str | None:
    for match in WOW_RE.finditer(body):
        img_id = match.group(1)
        if "pageBackground" in img_id:
            continue
        inner = match.group(3)
        src_match = re.search(r'\bsrc="(/images/opt/[^"]+)"', inner)
        if src_match:
            return src_match.group(1)
    return None


def inject_preload(content: str, hero_src: str) -> str:
    preload = (
        f'  <link rel="preload" as="image" href="{hero_src}" fetchpriority="high" />\n'
    )
    content = PRELOAD_RE.sub("\n", content, count=1)
    if hero_src in content and preload.strip() in content:
        return content
    return content.replace("</head>", preload + "</head>", 1)


def main() -> None:
    changed = 0
    for path in ROOT.rglob("*.html"):
        if "_archive" in path.parts or "booking-calendar" in path.parts:
            continue
        if path.name == "book-online.html":
            continue
        content = path.read_text(encoding="utf-8")
        site_idx = content.find(SITE_CONTAINER)
        if site_idx < 0:
            continue
        hero_src = first_hero_src(content[site_idx:])
        if not hero_src:
            continue
        updated = inject_preload(content, hero_src)
        if updated != content:
            path.write_text(updated, encoding="utf-8")
            changed += 1
            print(f"preloaded {hero_src} in {path.relative_to(ROOT)}")
    print(f"updated {changed} files")


if __name__ == "__main__":
    main()
