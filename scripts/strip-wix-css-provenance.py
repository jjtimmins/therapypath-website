from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

SOURCE_MAP_COMMENT = re.compile(
    r"/\*# sourceMappingURL=https://static\.parastorage\.com/[^*]*\*/",
    re.IGNORECASE,
)


def clean_html(text: str) -> str:
    text = re.sub(
        r"\sdata-(?:href|url)=\"https://static\.parastorage\.com/[^\"]*\"",
        "",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(
        r"\sdata-(?:href|url)='https://static\.parastorage\.com/[^']*'",
        "",
        text,
        flags=re.IGNORECASE,
    )
    text = SOURCE_MAP_COMMENT.sub("", text)
    text = re.sub(r"\s*<!-- sentryOnLoad Setup Script -->", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*<!-- Sentry[^>]*-->", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*<!-- Add the rest of the ViewerModel -->", "", text, flags=re.IGNORECASE)
    return text


def main() -> None:
    changed = []
    for path in ROOT.rglob("*.html"):
        if ".git" in path.parts:
            continue
        original = path.read_text(encoding="utf-8", errors="ignore")
        cleaned = clean_html(original)
        if cleaned != original:
            path.write_text(cleaned, encoding="utf-8", newline="")
            changed.append(path.relative_to(ROOT).as_posix())

    print(f"Changed {len(changed)} HTML files.")
    for name in changed:
        print(name)


if __name__ == "__main__":
    main()
