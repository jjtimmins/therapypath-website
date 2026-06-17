import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / "site-config.json").read_text(encoding="utf-8"))
BASE_URL = CONFIG["baseUrl"].rstrip("/")

SKIP_PARTS = {"_archive", "envelope", "api"}
SKIP_FILES = {
    "book-online.html",
    "services/index.html",
    "fr/book-online.html",
    "fr/services/index.html",
}

CANONICAL_RE = re.compile(r'<link rel="canonical" href="[^"]*"\s*/>')
HREFLANG_RE = re.compile(
    r'<link rel="alternate" href="[^"]*" hreflang="(x-default|fr-fr|en-ca)"\s*/>'
)


def rel_path(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def path_to_url(path: Path) -> str:
    rel = rel_path(path)
    if rel == "index.html":
        return f"{BASE_URL}/"
    return f"{BASE_URL}/{rel}"


def english_path(path: Path) -> str | None:
    rel = rel_path(path)
    if rel in SKIP_FILES or any(part in SKIP_PARTS for part in path.parts):
        return None
    if rel == "fr.html":
        return "index.html"
    if rel.startswith("fr/"):
        return rel[3:]
    return rel


def french_path(en_rel: str) -> str:
    if en_rel == "index.html":
        return "fr.html"
    return f"fr/{en_rel}"


def english_url(path: Path) -> str:
    en_rel = english_path(path)
    if not en_rel:
        return path_to_url(path)
    return path_to_url(ROOT / en_rel)


def french_url(path: Path) -> str:
    en_rel = english_path(path)
    if not en_rel:
        return path_to_url(path)
    return path_to_url(ROOT / french_path(en_rel))


def fix_hreflang(content: str, en_url: str, fr_url: str) -> str:
    if 'hreflang="x-default"' not in content:
        return content

    content = re.sub(
        r'<link rel="alternate" href="[^"]*" hreflang="x-default"\s*/>',
        f'<link rel="alternate" href="{en_url}" hreflang="x-default"/>',
        content,
        count=1,
    )
    content = re.sub(
        r'<link rel="alternate" href="[^"]*" hreflang="fr-fr"\s*/>',
        f'<link rel="alternate" href="{fr_url}" hreflang="fr-fr"/>',
        content,
        count=1,
    )
    content = re.sub(
        r'<link rel="alternate" href="[^"]*" hreflang="en-ca"\s*/>',
        f'<link rel="alternate" href="{en_url}" hreflang="en-ca"/>',
        content,
        count=1,
    )
    return content


def iter_html_files() -> list[Path]:
    files = []
    for path in ROOT.rglob("*.html"):
        if any(part in SKIP_PARTS for part in path.parts):
            continue
        if rel_path(path) in SKIP_FILES:
            continue
        files.append(path)
    return sorted(files)


def generate_sitemap(files: list[Path]) -> None:
    today = date.today().isoformat()
    urls = []
    for path in files:
        rel = rel_path(path)
        if rel in {"book-online.html", "fr/book-online.html"}:
            continue
        content = path.read_text(encoding="utf-8")
        if 'content="noindex"' in content:
            continue
        loc = path_to_url(path)
        priority = "1.0" if rel in {"index.html", "fr.html"} else "0.8"
        urls.append(
            "  <url>\n"
            f"    <loc>{loc}</loc>\n"
            f"    <lastmod>{today}</lastmod>\n"
            f"    <changefreq>monthly</changefreq>\n"
            f"    <priority>{priority}</priority>\n"
            "  </url>"
        )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    (ROOT / "sitemap.xml").write_text(xml, encoding="utf-8")
    print(f"generated sitemap.xml ({len(urls)} urls)")


def main() -> None:
    html_files = iter_html_files()

    for path in html_files:
        content = path.read_text(encoding="utf-8")
        original = content

        if 'rel="canonical"' not in content:
            continue

        canonical_url = path_to_url(path)
        if rel_path(path) in {"book-online.html", "fr/book-online.html"}:
            continue

        content = CANONICAL_RE.sub(
            f'<link rel="canonical" href="{canonical_url}"/>',
            content,
            count=1,
        )
        content = fix_hreflang(content, english_url(path), french_url(path))

        if content != original:
            path.write_text(content, encoding="utf-8")
            print(f"patched {rel_path(path)}")

    generate_sitemap(html_files)


if __name__ == "__main__":
    main()
