import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSESSMENT_SRC = "/images/opt/assessment-speech-service-864w.webp"
ASSESSMENT_SET = (
    "/images/opt/assessment-speech-service-864w.webp 1x, "
    "/images/opt/assessment-speech-service-1728w.webp 2x"
)
THERAPY_SRC = "/images/opt/adobestock_363566581-864w.webp"
THERAPY_SET = (
    "/images/opt/adobestock_363566581-864w.webp 1x, "
    "/images/opt/adobestock_363566581-1728w.webp 2x"
)


def fix_img_tag(tag: str, item_suffix: str) -> str:
    if f"img_comp-m4rmsvne__{item_suffix}" not in tag:
        return tag
    src, srcset = (
        (ASSESSMENT_SRC, ASSESSMENT_SET)
        if item_suffix == "item1"
        else (THERAPY_SRC, THERAPY_SET)
    )
    tag = re.sub(r'\bsrc="[^"]*"', f'src="{src}"', tag)
    tag = re.sub(r'\bsrcSet="[^"]*"', f'srcSet="{srcset}"', tag)
    return tag


def fix_file(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")
    updated = IMG_TAG_RE.sub(
        lambda match: fix_img_tag(match.group(0), "item1")
        if "img_comp-m4rmsvne__item1" in match.group(0)
        else fix_img_tag(match.group(0), "item-j9r9uz7e")
        if "img_comp-m4rmsvne__item-j9r9uz7e" in match.group(0)
        else match.group(0),
        content,
    )
    if updated != content:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


IMG_TAG_RE = re.compile(r"<img\b[^>]*>", re.I)


def main() -> None:
    for name in ("index.html", "fr.html"):
        path = ROOT / name
        if fix_file(path):
            print(f"updated {name}")


if __name__ == "__main__":
    main()
