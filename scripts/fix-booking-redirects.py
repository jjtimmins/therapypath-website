import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOKING_URL = "https://theramatic.ca/request-appointment/the-therapy-path"

REDIRECT_TEMPLATE_EN = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url={url}" />
    <title>Book Online | The Therapy Path</title>
    <link rel="canonical" href="{url}" />
    <meta name="robots" content="noindex" />
    <link rel="stylesheet" href="/site-fixes.css" />
  </head>
  <body>
    <p>
      Redirecting to online booking...
      <a href="{url}">Schedule an appointment with The Therapy Path</a>.
    </p>
    <script src="/site-fixes.js" defer></script>
  </body>
</html>
"""

REDIRECT_TEMPLATE_FR = """<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url={url}" />
    <title>Prendre rendez-vous | The Therapy Path</title>
    <link rel="canonical" href="{url}" />
    <meta name="robots" content="noindex" />
    <link rel="stylesheet" href="/site-fixes.css" />
  </head>
  <body>
    <p>
      Redirection vers la prise de rendez-vous en ligne...
      <a href="{url}">Prendre rendez-vous avec The Therapy Path</a>.
    </p>
    <script src="/site-fixes.js" defer></script>
  </body>
</html>
"""

BOOKING_HREF_RE = re.compile(
    r'href="(?:(?:\.\./)*)?(?:fr/)?booking-calendar/[^"]+\.html"'
)


def rewrite_booking_links(content: str) -> str:
    return BOOKING_HREF_RE.sub(
        f'href="{BOOKING_URL}" target="_blank" rel="noopener noreferrer"',
        content,
    )


def main() -> None:
    calendar_dirs = [ROOT / "booking-calendar", ROOT / "fr" / "booking-calendar"]
    for directory in calendar_dirs:
        if not directory.exists():
            continue
        template = REDIRECT_TEMPLATE_FR if "fr" in directory.parts else REDIRECT_TEMPLATE_EN
        for path in directory.glob("*.html"):
            path.write_text(template.format(url=BOOKING_URL), encoding="utf-8")
            print(f"redirect stub {path.relative_to(ROOT)}")

    changed = 0
    for path in ROOT.rglob("*.html"):
        if "_archive" in path.parts:
            continue
        if "booking-calendar" in path.parts and path.name.endswith(".html"):
            continue
        content = path.read_text(encoding="utf-8")
        updated = rewrite_booking_links(content)
        if updated != content:
            path.write_text(updated, encoding="utf-8")
            changed += 1
            print(f"patched links in {path.relative_to(ROOT)}")

    print(f"updated booking links in {changed} files")


if __name__ == "__main__":
    main()
