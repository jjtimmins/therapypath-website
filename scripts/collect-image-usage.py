import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
OPT = IMAGES / "opt"
MANIFEST_PATH = ROOT / "scripts" / "image-usage.json"

WIX_RE = re.compile(r"https://static\.wixstatic\.com/media/[^\"'\s)]+", re.I)
FILL_WIDTH_RE = re.compile(r"/fill/w_(\d+)", re.I)
TITLE_RE = re.compile(r'title="([^"]+)"')
URI_RE = re.compile(r"&quot;uri&quot;:&quot;([^&]+)&quot;")


def slugify(name: str) -> str:
    stem = Path(name.split("~")[0]).stem
    stem = re.sub(r"[^a-zA-Z0-9._-]+", "-", stem)
    return stem.strip("-").lower() or "image"


def local_source_path(source_name: str) -> Path | None:
    direct = IMAGES / source_name
    if direct.exists():
        return direct
    stem = Path(source_name.split("~")[0]).name
    for candidate in IMAGES.glob(stem + ".*"):
        if candidate.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".avif"}:
            return candidate
    lower = stem.lower()
    for candidate in IMAGES.iterdir():
        if candidate.is_file() and candidate.name.lower() == lower:
            return candidate
    return None


def collect_usage() -> dict[str, dict]:
    usage: dict[str, dict] = {}

    for html_path in ROOT.rglob("*.html"):
        if "_archive" in html_path.parts:
            continue
        text = html_path.read_text(encoding="utf-8", errors="ignore")
        for url in WIX_RE.findall(text):
            if "blur_" in url:
                continue
            width = 0
            for match in FILL_WIDTH_RE.finditer(url):
                width = max(width, int(match.group(1)))
            pos = text.find(url)
            window = text[max(0, pos - 1200) : pos + 200]
            source_name = None
            title_match = None
            for match in TITLE_RE.finditer(window):
                title_match = match
            if title_match:
                source_name = title_match.group(1)
            if not source_name:
                uri_match = URI_RE.search(window)
                if uri_match:
                    source_name = uri_match.group(1)
            if not source_name:
                source_name = Path(urllib.parse.unquote(url.split("/")[-1].split("?")[0])).name
            slug = slugify(source_name)
            entry = usage.setdefault(
                slug,
                {
                    "source_name": source_name,
                    "max_width": 0,
                    "sample_url": url,
                    "pages": set(),
                },
            )
            entry["max_width"] = max(entry["max_width"], width)
            entry["pages"].add(html_path.relative_to(ROOT).as_posix())
            if width >= entry.get("_best_width", 0):
                entry["sample_url"] = url
                entry["_best_width"] = width
            if width == 0 and entry["max_width"] == 0:
                entry["max_width"] = 800

    for entry in usage.values():
        entry["pages"] = sorted(entry["pages"])
        entry.pop("_best_width", None)
    return usage


def download_source(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        return
    request = urllib.request.Request(url, headers={"User-Agent": "TherapyPathImageMirror/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        dest.write_bytes(response.read())
    print(f"downloaded {dest.name}")


def ensure_source_file(entry: dict) -> Path:
    source_name = entry["source_name"]
    local = local_source_path(source_name)
    if local:
        return local

    download_name = Path(source_name.split("~")[0]).name
    if not download_name.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        download_name += ".jpg"
    dest = IMAGES / "wix" / download_name
    if dest.exists():
        return dest

    url = entry["sample_url"]
    media_id = re.search(r"/media/([^/]+)", url)
    if not media_id:
        raise RuntimeError(f"Could not parse media id from {url}")
    media = media_id.group(1)
    width = min(max(entry["max_width"] * 2, 1200), 2400)
    download_url = (
        f"https://static.wixstatic.com/media/{media}"
        f"/v1/fill/w_{width},h_{width},al_c,q_85,usm_0.66_1.00_0.01/{download_name}"
    )
    download_source(download_url, dest)
    return dest


def main() -> None:
    usage = collect_usage()
    MANIFEST_PATH.write_text(
        json.dumps(usage, indent=2),
        encoding="utf-8",
    )
    print(f"found {len(usage)} unique images across site")
    missing = []
    for slug, entry in sorted(usage.items()):
        if not local_source_path(entry["source_name"]):
            missing.append(entry["source_name"])
    print(f"missing local originals: {len(missing)}")
    for name in missing:
        print(f"  - {name}")


if __name__ == "__main__":
    main()
