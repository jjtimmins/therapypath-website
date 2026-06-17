import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "fonts"
MANIFEST_PATH = ROOT / "scripts" / "font-manifest.json"

FONT_URL_RE = re.compile(
    r"https://static\.(?:wixstatic\.com/ufonts|parastorage\.com/(?:fonts|tag-bundler/api/v1/fonts-cache))/[^\s\"')]+",
    re.I,
)


def font_local_path(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    parts = [part for part in parsed.path.split("/") if part]
    if "ufonts" in parts:
        idx = parts.index("ufonts")
        slug = parts[idx + 1]
        ext = Path(parts[-1]).suffix or ".woff2"
        return f"/fonts/ufonts/{slug}{ext}"
    if "fonts" in parts:
        idx = parts.index("fonts")
        tail = "/".join(parts[idx + 1 :])
        return f"/fonts/parastorage/{tail}"
    if "fonts-cache" in parts:
        idx = parts.index("fonts-cache")
        tail = "/".join(parts[idx + 1 :])
        return f"/fonts/parastorage/fonts-cache/{tail}"
    raise ValueError(f"Unrecognized font URL: {url}")


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return
    request = urllib.request.Request(
        url, headers={"User-Agent": "Mozilla/5.0 (compatible; TherapyPathMirror/1.0)"}
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        dest.write_bytes(response.read())
    print(f"downloaded {dest.relative_to(ROOT)}")


def collect_font_urls() -> set[str]:
    urls: set[str] = set()
    for html in ROOT.rglob("*.html"):
        if "_archive" in html.parts:
            continue
        text = html.read_text(encoding="utf-8", errors="ignore")
        urls.update(FONT_URL_RE.findall(text))
    return urls


def build_manifest(urls: set[str]) -> dict[str, str]:
    manifest: dict[str, str] = {}
    for url in sorted(urls):
        local = font_local_path(url)
        dest = ROOT / local.lstrip("/")
        download(url, dest)
        manifest[url] = local
    return manifest


def localize_html(content: str, manifest: dict[str, str]) -> str:
    for remote, local in sorted(manifest.items(), key=lambda item: len(item[0]), reverse=True):
        content = content.replace(remote, local)
    return content


def main() -> None:
    urls = collect_font_urls()
    manifest = build_manifest(urls)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"font manifest: {len(manifest)} files")

    changed = 0
    for html in ROOT.rglob("*.html"):
        if "_archive" in html.parts:
            continue
        content = html.read_text(encoding="utf-8")
        updated = localize_html(content, manifest)
        if updated != content:
            html.write_text(updated, encoding="utf-8")
            changed += 1
            print(f"localized fonts in {html.relative_to(ROOT)}")

    print(f"updated {changed} html files")


if __name__ == "__main__":
    main()
