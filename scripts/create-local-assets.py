from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
HEADER_LOGO_SOURCE = ROOT / "images" / "The Therapy logo2_edited.png"
HEADER_LOGO_143 = ROOT / "images" / "opt" / "therapy-path-header-logo-143w.webp"
HEADER_LOGO_286 = ROOT / "images" / "opt" / "therapy-path-header-logo-286w.webp"
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
CLINICAL_CAROUSEL = [
    (
        ROOT / "images" / "Clinical carousel blue.png",
        ROOT / "images" / "opt" / "clinical-carousel-blue-1600w.webp",
    ),
    (
        ROOT / "images" / "Clinical carousel green.png",
        ROOT / "images" / "opt" / "clinical-carousel-green-1600w.webp",
    ),
    (
        ROOT / "images" / "Clinical carousel orange.png",
        ROOT / "images" / "opt" / "clinical-carousel-orange-1600w.webp",
    ),
]


def save_webp(source: Path, dest: Path, width: int = 1600) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = image.convert("RGB")
        if image.width > width:
            height = round(image.height * width / image.width)
            image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.save(dest, "WEBP", quality=82, method=6)
        print(f"created {dest.relative_to(ROOT)} ({image.width}x{image.height})")


def save_header_logo(source: Path, dest: Path, width: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        # Match the original Wix crop used in the header logo.
        image = image.convert("RGBA").crop((145, 185, 871, 870))
        height = round(image.height * width / image.width)
        image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.save(dest, "WEBP", quality=90, method=6)
        print(f"created {dest.relative_to(ROOT)} ({image.width}x{image.height})")


def main() -> None:
    if HEADER_LOGO_SOURCE.exists():
        save_header_logo(HEADER_LOGO_SOURCE, HEADER_LOGO_143, 143)
        save_header_logo(HEADER_LOGO_SOURCE, HEADER_LOGO_286, 286)
    else:
        print(f"missing {HEADER_LOGO_SOURCE.relative_to(ROOT)}")

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

    for source, dest in CLINICAL_CAROUSEL:
        if source.exists():
            save_webp(source, dest, 1600)
        else:
            print(f"missing {source.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
