import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ASSISTIVE_SRC = "/images/opt/adobestock_364584967-758w.webp"
ASSISTIVE_SET = (
    "/images/opt/adobestock_364584967-758w.webp 1x, "
    "/images/opt/adobestock_364584967-1516w.webp 2x"
)
IMG_TAG_RE = re.compile(r"<img\b[^>]*>", re.I)


def fix_img_tag(tag: str) -> str:
    if 'id="img_comp-m4u9ygfj6"' not in tag:
        return tag
    tag = re.sub(r'\bsrc="[^"]*"', f'src="{ASSISTIVE_SRC}"', tag)
    tag = re.sub(r'\bsrcSet="[^"]*"', f'srcSet="{ASSISTIVE_SET}"', tag)
    tag = re.sub(r'\balt="[^"]*"', 'alt="Children using assistive learning materials"', tag)
    if 'loading="' not in tag:
        tag = tag.replace("<img", '<img loading="lazy"', 1)
    return tag


def fix_file(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")
    updated = IMG_TAG_RE.sub(lambda match: fix_img_tag(match.group(0)), content)
    if updated != content:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> None:
    for rel in ("services/therapy.html", "fr/services/therapy.html"):
        path = ROOT / rel
        if path.exists() and fix_file(path):
            print(f"updated {rel}")


if __name__ == "__main__":
    main()
