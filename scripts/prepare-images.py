import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
OPT = IMAGES / "opt"
WIX_CACHE = IMAGES / "wix"
USAGE_PATH = ROOT / "scripts" / "image-usage.json"
MANIFEST_PATH = ROOT / "scripts" / "image-manifest.json"

LOCAL_ALIASES = {
    "AdobeStock_363566581.jpeg": "AdobeStock_486112793.jpeg",
    "ba2cd3_501a358c30d1498d855bbdeacb20d2ae~mv2.png": "The Therapy logo2_edited.png",
    "ba2cd3_ce429fe317704238b6b68ffe39659f77~mv2.jpeg": "wix/ba2cd3_ce429fe317704238b6b68ffe39659f77.jpg",
    "dda575_0c007f24a248480781cff40e0d157f46~mv2.png": "favicon.png",
    "dda575_0c007f24a248480781cff40e0d157f46_mv2.png": "favicon.png",
    "dda575_6b7dc4ddcb124f1bbcce99b3a046fa26~mv2.png": "The Therapy logo2_edited.png",
    "dda575_6b7dc4ddcb124f1bbcce99b3a046fa26_mv2.png": "The Therapy logo2_edited.png",
    "dda575_7d642f34c3524555a2dabdd59ecd1e3f~mv2.jpeg": "wix/dda575_7d642f34c3524555a2dabdd59ecd1e3f.jpg",
    "5f9399_30ec07ce19d84aa1823ac391f5b926a5~mv2.jpg": "wix/5f9399_30ec07ce19d84aa1823ac391f5b926a5.jpg",
    "5f9399_30ec07ce19d84aa1823ac391f5b926a5_mv2.jpg": "wix/5f9399_30ec07ce19d84aa1823ac391f5b926a5.jpg",
    "Yellow Pages for business.webp": "wix/Yellow_Pages_for_business.webp",
    "Picture2.png": "Picture2_edited.png",
    "a3c153_017c8cfe7afd4435b2951f0dc0b8429d~mv2.jpg": "iView Notes_edited.jpg",
    "11062b_1c1dad37976a477086dea4fefabe1e09~mv2.jpg": "Our Team hero hands.png",
    "5f9399_d7cbc8774a6741be918a3fd4a4c280b9~mv2.jpg": "AdobeStock_315113823_edited.jpg",
}

EXTRA_USAGE = {
    "adobestock_495222202": {
        "source_name": "AdobeStock_495222202.jpeg",
        "max_width": 980,
        "sample_url": "",
        "pages": ["index.html", "fr.html"],
    },
    "assessment-speech-service": {
        "source_name": "Assessment speech service_edited_cropped.JPG",
        "max_width": 864,
        "sample_url": "",
        "pages": ["index.html", "fr.html"],
    },
}


def media_key(url: str) -> str | None:
    match = re.search(r"/media/([^/]+)/", url)
    if not match:
        return None
    return match.group(1).split(".")[0].replace("%7E", "~")


def normalize_media_key(key: str) -> str:
    return key.replace("%7E", "~").replace("_mv2", "").replace("~mv2", "")


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return
    parsed = urllib.parse.urlsplit(urllib.parse.unquote(url))
    safe_path = urllib.parse.quote(parsed.path, safe="/%")
    safe_url = urllib.parse.urlunsplit(
        (parsed.scheme, parsed.netloc, safe_path, parsed.query, parsed.fragment)
    )
    request = urllib.request.Request(
        safe_url, headers={"User-Agent": "Mozilla/5.0 (compatible; TherapyPathMirror/1.0)"}
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        dest.write_bytes(response.read())
    print(f"downloaded {dest.relative_to(ROOT)}")


def wix_cache_match(stem: str) -> Path | None:
    for candidate in WIX_CACHE.glob(stem + ".*"):
        if candidate.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".avif"}:
            return candidate
    return None


def resolve_source(source_name: str, sample_url: str, max_width: int) -> Path:
    alias = LOCAL_ALIASES.get(source_name)
    if alias:
        candidate = IMAGES / alias
        if candidate.exists():
            return candidate

    direct = IMAGES / source_name
    if direct.exists():
        return direct

    stem = Path(source_name.split("~")[0]).name
    for candidate in IMAGES.glob(stem + ".*"):
        if candidate.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".avif"}:
            return candidate

    cached = wix_cache_match(stem)
    if cached:
        return cached

    if not sample_url:
        raise RuntimeError(f"No source or download URL for {source_name}")

    download_name = re.sub(r"[^\w.\-]+", "_", Path(source_name.split("~")[0]).name)
    if not download_name.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        download_name += ".jpg"
    dest = WIX_CACHE / download_name
    if dest.exists() and dest.stat().st_size > 0:
        return dest

    download(urllib.parse.unquote(sample_url), dest)
    return dest


def save_webp(source: Path, dest: Path, width: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = image.convert("RGBA" if image.mode in {"RGBA", "LA", "P"} else "RGB")
        if image.width > width:
            ratio = width / image.width
            height = max(1, round(image.height * ratio))
            image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.save(dest, format="WEBP", quality=82, method=6)


def build_variants(slug: str, source: Path, max_width: int) -> dict[str, str]:
    widths = sorted({min(max_width, 2000), min(max_width * 2, 2400)})
    if max_width <= 200:
        widths = sorted({max_width, min(max_width * 2, 400)})

    paths: dict[str, str] = {}
    for width in widths:
        filename = f"{slug}-{width}w.webp"
        out = OPT / filename
        save_webp(source, out, width)
        paths[str(width)] = f"/images/opt/{filename}"
    paths["default"] = paths[str(widths[0])]
    if len(widths) > 1:
        paths["retina"] = paths[str(widths[-1])]
    else:
        paths["retina"] = paths["default"]
    return paths


def merge_usage() -> dict:
    usage = json.loads(USAGE_PATH.read_text(encoding="utf-8"))
    usage.update(EXTRA_USAGE)
    merged: dict[str, dict] = {}
    for slug, entry in usage.items():
        sample_url = entry.get("sample_url", "")
        key = normalize_media_key(media_key(sample_url) or entry["source_name"])
        if key in merged:
            merged[key]["max_width"] = max(merged[key]["max_width"], entry["max_width"])
            merged[key]["pages"] = sorted(set(merged[key]["pages"]) | set(entry["pages"]))
            if not merged[key].get("source_name"):
                merged[key]["source_name"] = entry["source_name"]
            if not merged[key].get("sample_url") and sample_url:
                merged[key]["sample_url"] = sample_url
        else:
            merged[key] = {
                "slug": slug,
                "source_name": entry["source_name"],
                "max_width": entry["max_width"],
                "sample_url": sample_url,
                "pages": list(entry["pages"]),
            }
    return merged


def main() -> None:
    OPT.mkdir(parents=True, exist_ok=True)
    merged = merge_usage()
    manifest: dict[str, dict] = {}

    for key, entry in sorted(merged.items()):
        slug = entry["slug"]
        try:
            source = resolve_source(entry["source_name"], entry["sample_url"], entry["max_width"])
        except Exception as exc:
            print(f"SKIP {slug}: {exc}")
            continue
        variants = build_variants(slug, source, entry["max_width"])
        manifest[key] = {
            "slug": slug,
            "source_name": entry["source_name"],
            "variants": variants,
        }
        raw_key = media_key(entry["sample_url"]) if entry.get("sample_url") else None
        if raw_key and raw_key != key:
            manifest[raw_key] = manifest[key]
        print(f"optimized {slug} -> {variants['default']}")

    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"wrote {MANIFEST_PATH.relative_to(ROOT)} ({len(manifest)} media keys)")


if __name__ == "__main__":
    main()
