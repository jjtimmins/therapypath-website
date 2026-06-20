from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

SCRIPT_TAG = re.compile(r"<script\b[^>]*>[\s\S]*?</script>\s*", re.IGNORECASE)

REMOVE_IF_CONTAINS = (
    "static.parastorage.com/unpkg/%40formatjs/intl-segmenter",
    "static.parastorage.com/unpkg/core-js-bundle",
    "static.parastorage.com/unpkg/focus-within-polyfill",
    "static.parastorage.com/unpkg/react",
    "static.parastorage.com/unpkg/react-dom",
    "static.parastorage.com/unpkg/lodash",
    "static.parastorage.com/services/wix-thunderbolt/dist/",
    "static.parastorage.com/services/tag-manager-client/",
    'id="wix-essential-viewer-model"',
    "id='wix-essential-viewer-model'",
    'id="wix-viewer-model"',
    "id='wix-viewer-model'",
    'id="wix-fedops"',
    "id='wix-fedops'",
    "window.viewerModel",
    "window.commonConfig = viewerModel.commonConfig",
    "window.fedops",
    'type="wix/htmlEmbeds"',
    "type='wix/htmlEmbeds'",
    'id="wix-skip-played-animations-setup"',
    "id='wix-skip-played-animations-setup'",
    "fedops.phaseStarted('missing_polyfills')",
    "window.thunderboltTag",
    "window.thunderboltVersion",
    'id="sentryOnLoadSetup"',
    "id='sentryOnLoadSetup'",
    'id="sentry"',
    "id='sentry'",
    "browser.sentry-cdn.com",
    "sentry",
    "resolveExternalsRegistryModule",
    'id="used-platform-apis-data"',
    "id='used-platform-apis-data'",
    "usedPlatformApis",
)

KEEP_IF_CONTAINS = (
    "/site-fixes.js",
    "/site-fixes-boot.js",
)


def should_remove_script(script: str) -> bool:
    script_lc = script.lower()
    if any(token.lower() in script_lc for token in KEEP_IF_CONTAINS):
        return False
    return any(token.lower() in script_lc for token in REMOVE_IF_CONTAINS)


def clean_html(text: str) -> tuple[str, int]:
    removed = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal removed
        script = match.group(0)
        if should_remove_script(script):
            removed += 1
            return ""
        return script

    text = SCRIPT_TAG.sub(replace, text)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    return text, removed


def main() -> None:
    changed = []
    removed_total = 0
    for path in ROOT.rglob("*.html"):
        if ".git" in path.parts:
            continue
        original = path.read_text(encoding="utf-8", errors="ignore")
        cleaned, removed = clean_html(original)
        if cleaned != original:
            path.write_text(cleaned, encoding="utf-8", newline="")
            changed.append(path.relative_to(ROOT).as_posix())
            removed_total += removed

    print(f"Changed {len(changed)} HTML files; removed {removed_total} Wix runtime scripts.")
    for name in changed:
        print(name)


if __name__ == "__main__":
    main()
