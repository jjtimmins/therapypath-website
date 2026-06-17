from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUR_TEAM_SOURCE = ROOT / "images" / "Our Team hero hands.png"
OUR_TEAM_WEBP = ROOT / "images" / "opt" / "our-team-hero-hands-1600w.webp"
OUR_TEAM_WIX_1600 = ROOT / "images" / "opt" / "11062b_1c1dad37976a477086dea4fefabe1e09-1600w.webp"
OUR_TEAM_WIX_2400 = ROOT / "images" / "opt" / "11062b_1c1dad37976a477086dea4fefabe1e09-2400w.webp"
ASSISTIVE_SOURCE = ROOT / "images" / "AdobeStock_364584967.jpeg"
ASSISTIVE_758 = ROOT / "images" / "opt" / "adobestock_364584967-758w.webp"
ASSISTIVE_1516 = ROOT / "images" / "opt" / "adobestock_364584967-1516w.webp"
CONSULTATIONS_SOURCE = ROOT / "images" / "AdobeStock_315113823_edited.jpg"
CONSULTATIONS_WIX_1600 = (
    ROOT / "images" / "opt" / "5f9399_d7cbc8774a6741be918a3fd4a4c280b9-1600w.webp"
)
CONSULTATIONS_WIX_2400 = (
    ROOT / "images" / "opt" / "5f9399_d7cbc8774a6741be918a3fd4a4c280b9-2400w.webp"
)


def save_webp(source: Path, dest: Path, width: int = 1600) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = image.convert("RGB")
        if image.width > width:
            height = round(image.height * width / image.width)
            image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.save(dest, "WEBP", quality=82, method=6)
        print(f"created {dest.relative_to(ROOT)} ({image.width}x{image.height})")


def main() -> None:
    if OUR_TEAM_SOURCE.exists():
        save_webp(OUR_TEAM_SOURCE, OUR_TEAM_WEBP)
        save_webp(OUR_TEAM_SOURCE, OUR_TEAM_WIX_1600, 1600)
        save_webp(OUR_TEAM_SOURCE, OUR_TEAM_WIX_2400, 2400)
    else:
        print(f"missing {OUR_TEAM_SOURCE.relative_to(ROOT)}")

    if ASSISTIVE_SOURCE.exists():
        save_webp(ASSISTIVE_SOURCE, ASSISTIVE_758, 758)
        save_webp(ASSISTIVE_SOURCE, ASSISTIVE_1516, 1516)
    else:
        print(f"missing {ASSISTIVE_SOURCE.relative_to(ROOT)}")

    if CONSULTATIONS_SOURCE.exists():
        save_webp(CONSULTATIONS_SOURCE, CONSULTATIONS_WIX_1600, 1600)
        save_webp(CONSULTATIONS_SOURCE, CONSULTATIONS_WIX_2400, 2400)
    else:
        print(f"missing {CONSULTATIONS_SOURCE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
