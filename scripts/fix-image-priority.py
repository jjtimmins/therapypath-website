import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WOW_RE = re.compile(
    r'<wow-image id="(img_[^"]+)"[^>]*data-image-info="([^"]+)"[^>]*>(.*?)</wow-image>',
    re.DOTALL,
)
IMG_RE = re.compile(r"<img\b[^>]*>", re.I)
SITE_CONTAINER = 'id="SITE_CONTAINER"'


def first_page_hero(body: str) -> tuple[str, str] | None:
    for match in WOW_RE.finditer(body):
        img_id = match.group(1)
        if "pageBackground" in img_id:
            continue
        inner = match.group(3)
        src_match = re.search(r'\bsrc="([^"]+)"', inner)
        if not src_match:
            continue
        return img_id, src_match.group(1)
    return None


def tune_img_tag(tag: str, hero_id: str | None, is_hero_inner: bool) -> str:
    img_id_match = re.search(r'\bid="(img_[^"]+)"', tag)
    img_id = img_id_match.group(1) if img_id_match else ""

    if is_hero_inner or img_id == hero_id:
        tag = re.sub(r'\bfetchpriority="[^"]*"', "", tag)
        tag = re.sub(r'\bloading="[^"]*"', "", tag)
        if 'fetchpriority="' not in tag:
            tag = tag.replace("<img", '<img fetchpriority="high"', 1)
        return tag

    if img_id == "img_comp-m4n0yl36" or img_id == "img_comp-m4u3wh0r":
        return tag

    tag = re.sub(r'\bfetchpriority="[^"]*"', "", tag)
    width_match = re.search(r'\bwidth="(\d+)"', tag)
    width = int(width_match.group(1)) if width_match else 0
    if width and width < 500 and 'loading="' not in tag:
        tag = tag.replace("<img", '<img loading="lazy"', 1)
    return tag


def fix_wow_block(match: re.Match[str], hero_id: str | None) -> str:
    block = match.group(0)
    img_id = match.group(1)
    inner = match.group(3)
    if img_id != hero_id or "<img" not in inner:
        return block
    new_inner = IMG_RE.sub(lambda m: tune_img_tag(m.group(0), hero_id, True), inner)
    return block.replace(inner, new_inner, 1)


def fix_file(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")
    site_idx = content.find(SITE_CONTAINER)
    if site_idx < 0:
        return False
    body = content[site_idx:]
    hero = first_page_hero(body)
    if not hero:
        return False
    hero_id, _hero_src = hero

    def replace_wow(match: re.Match[str]) -> str:
        return fix_wow_block(match, hero_id)

    new_body = WOW_RE.sub(replace_wow, body)
    new_body = IMG_RE.sub(lambda m: tune_img_tag(m.group(0), hero_id, False), new_body)
    updated = content[:site_idx] + new_body
    if updated != content:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = 0
    for path in ROOT.rglob("*.html"):
        if "_archive" in path.parts or "booking-calendar" in path.parts:
            continue
        if path.name == "book-online.html":
            continue
        if fix_file(path):
            changed += 1
            print(f"tuned priorities in {path.relative_to(ROOT)}")
    print(f"updated {changed} files")


if __name__ == "__main__":
    main()
