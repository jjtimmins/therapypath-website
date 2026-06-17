import json
import re
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "scripts" / "image-manifest.json"
WIX_URL_RE = re.compile(r"https://static\.wixstatic\.com/media/[^\"'\s)]+", re.I)
IMG_TAG_RE = re.compile(r"<img\b[^>]*>", re.I)


def load_manifest() -> dict[str, dict]:
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def media_key_from_url(url: str) -> str | None:
    match = re.search(r"/media/([^/\"'\s?]+)", url)
    if not match:
        return None
    return urllib.parse.unquote(match.group(1)).split(".")[0]


def display_name_from_url(url: str) -> str | None:
    name = Path(urllib.parse.unquote(url.split("?")[0].split("/")[-1])).name
    if name and re.search(r"\.(jpe?g|png|webp|avif|gif)$", name, re.I):
        return name
    return None


def lookup_variant(manifest: dict, url: str) -> str | None:
    display_name = display_name_from_url(url)
    if display_name:
        display_key = Path(display_name).stem.lower()
        for manifest_key, entry in manifest.items():
            source = entry.get("source_name", "")
            if Path(source).name.lower() == display_name.lower():
                return entry["variants"]["default"]
            if entry.get("slug", "").lower() == display_key:
                return entry["variants"]["default"]

    key = media_key_from_url(url)
    if not key:
        return None
    entry = manifest.get(key)
    if entry:
        return entry["variants"]["default"]
    normalized = key.replace("~mv2", "").replace("_mv2", "")
    for manifest_key, entry in manifest.items():
        if manifest_key.replace("~mv2", "").replace("_mv2", "") == normalized:
            return entry["variants"]["default"]
    return None


def simplify_img_tag(tag: str, manifest: dict) -> str:
    src_match = re.search(r'\bsrc="([^"]+)"', tag)
    if not src_match or "wixstatic.com" not in src_match.group(1):
        return tag

    src_url = src_match.group(1)
    local = lookup_variant(manifest, src_url)
    if not local:
        return tag

    width_match = re.search(r'\bwidth="(\d+)"', tag)
    width = width_match.group(1) if width_match else "0"

    entry_key = None
    for key, entry in manifest.items():
        if entry["variants"]["default"] == local:
            entry_key = key
            break
    variants = manifest[entry_key]["variants"] if entry_key else {"default": local, "retina": local}
    srcset = f'{variants["default"]} 1x, {variants["retina"]} 2x'

    tag = WIX_URL_RE.sub(lambda m: lookup_variant(manifest, m.group(0)) or m.group(0), tag)
    tag = re.sub(r'\bsrcset="[^"]*"', f'srcset="{srcset}"', tag)
    tag = re.sub(r'\bsrc="[^"]*"', f'src="{variants["default"]}"', tag)
    if 'loading="' not in tag and int(width or 0) >= 400:
        tag = tag.replace("<img", '<img loading="lazy"', 1)
    if "img_comp-m4n0yl36" in tag or "AdobeStock_495222202" in tag:
        tag = re.sub(r'\bfetchpriority="[^"]*"', "", tag)
        tag = tag.replace("<img", '<img fetchpriority="high"', 1)
        tag = re.sub(r'\bloading="[^"]*"', "", tag)
    return tag


def fix_malformed_paths(content: str) -> str:
    content = re.sub(
        r'(?:\.\./)+https://static\.wixstatic\.com/',
        "https://static.wixstatic.com/",
        content,
    )
    content = re.sub(
        r'src="(?:\.\./)+(/images/opt/[^"]+)"',
        r'src="\1"',
        content,
    )
    return content


def localize_html(content: str, manifest: dict) -> str:
    content = fix_malformed_paths(content)

    def replace_url(match: re.Match[str]) -> str:
        url = match.group(0)
        local = lookup_variant(manifest, url)
        return local or url

    content = WIX_URL_RE.sub(replace_url, content)
    content = IMG_TAG_RE.sub(lambda m: simplify_img_tag(m.group(0), manifest), content)
    return content


def main() -> None:
    manifest = load_manifest()
    changed = 0
    for path in ROOT.rglob("*.html"):
        if "_archive" in path.parts:
            continue
        content = path.read_text(encoding="utf-8")
        updated = localize_html(content, manifest)
        if updated != content:
            path.write_text(updated, encoding="utf-8")
            changed += 1
            print(f"localized {path.relative_to(ROOT)}")

    print(f"updated {changed} html files")


if __name__ == "__main__":
    main()
