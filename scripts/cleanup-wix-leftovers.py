import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXTERNAL_FETCH_PRELOAD_RE = re.compile(
    r"\s*<link\b(?=[^>]*\brel=\"preload\")(?=[^>]*\bas=\"fetch\")(?=[^>]*https://(?:static|siteassets)\.parastorage\.com)[^>]*>\s*(?:</link>)?",
    re.I,
)


def clean_html(content: str) -> str:
    content = re.sub(r"([\"'(])(?:\.\./)+https://", r"\1https://", content)
    content = re.sub(r"([\"'(])http://static\.", r"\1https://static.", content)
    content = EXTERNAL_FETCH_PRELOAD_RE.sub("\n", content)
    content = re.sub(r"\n{3,}", "\n\n", content)
    return content


def main() -> None:
    changed = 0
    for path in ROOT.rglob("*.html"):
        if "_archive" in path.parts:
            continue
        content = path.read_text(encoding="utf-8", errors="ignore")
        updated = clean_html(content)
        if updated != content:
            path.write_text(updated, encoding="utf-8")
            changed += 1
            print(f"cleaned {path.relative_to(ROOT)}")
    print(f"updated {changed} files")


if __name__ == "__main__":
    main()
