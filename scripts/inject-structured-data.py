import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = json.loads((ROOT / "site-config.json").read_text(encoding="utf-8"))[
    "baseUrl"
].rstrip("/")

SKIP_PARTS = {"_archive", "api", "booking-calendar", "envelope"}
SKIP_FILES = {"book-online.html", "fr/book-online.html"}
LD_JSON_RE = re.compile(
    r"\s*<script type=\"application/ld\+json\">.*?</script>\s*",
    re.DOTALL,
)

BUSINESS_SCHEMA = {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "LocalBusiness"],
    "@id": f"{BASE_URL}/#organization",
    "name": "The Therapy Path",
    "url": f"{BASE_URL}/",
    "image": f"{BASE_URL}/images/opt/dda575_0c007f24a248480781cff40e0d157f46_mv2-192w.webp",
    "logo": f"{BASE_URL}/images/opt/dda575_0c007f24a248480781cff40e0d157f46_mv2-192w.webp",
    "telephone": "+1-705-363-8871",
    "email": "services@therapypath.com",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "117 Kay Crescent",
        "addressLocality": "Timmins",
        "addressRegion": "ON",
        "postalCode": "P4N 8A9",
        "addressCountry": "CA",
    },
    "areaServed": [
        "Northern Ontario",
        "Timmins",
        "North Bay",
        "New Liskeard",
        "Kirkland Lake",
        "Cochrane",
        "Iroquois Falls",
        "Kapuskasing",
        "Hearst",
        "James Bay Coast",
    ],
    "medicalSpecialty": "Speech-language pathology",
    "priceRange": "$$",
}

WEBSITE_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": f"{BASE_URL}/#website",
    "name": "The Therapy Path",
    "url": f"{BASE_URL}/",
    "publisher": {"@id": f"{BASE_URL}/#organization"},
    "inLanguage": ["en-CA", "fr-CA"],
}

SERVICE_NAMES = {
    "services/assessments.html": "Speech and language assessments",
    "services/therapy.html": "Speech-language therapy",
    "services/consultations-workshops-reading-groups.html": (
        "Consultations, workshops, and reading groups"
    ),
    "services/clinical-management-software.html": "Clinical management software",
}


def rel_path(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def page_url(path: Path) -> str:
    rel = rel_path(path)
    if rel == "index.html":
        return f"{BASE_URL}/"
    return f"{BASE_URL}/{rel}"


def title(content: str) -> str:
    match = re.search(r"<title>(.*?)</title>", content, re.DOTALL | re.I)
    if not match:
        return "The Therapy Path"
    return re.sub(r"\s+", " ", match.group(1)).strip()


def description(content: str) -> str | None:
    match = re.search(r'<meta name="description" content="([^"]*)"', content, re.I)
    return match.group(1).strip() if match else None


def service_name(rel: str) -> str | None:
    if rel.startswith("fr/"):
        rel = rel[3:]
    return SERVICE_NAMES.get(rel)


def schema_block(schemas: list[dict]) -> str:
    graph = {"@context": "https://schema.org", "@graph": schemas}
    return (
        '<script type="application/ld+json">'
        + json.dumps(graph, ensure_ascii=False, separators=(",", ":"))
        + "</script>\n"
    )


def schemas_for(path: Path, content: str) -> list[dict]:
    url = page_url(path)
    rel = rel_path(path)
    schemas: list[dict] = [BUSINESS_SCHEMA, WEBSITE_SCHEMA]

    page_schema = {
        "@type": "WebPage",
        "@id": f"{url}#webpage",
        "url": url,
        "name": title(content),
        "isPartOf": {"@id": f"{BASE_URL}/#website"},
        "about": {"@id": f"{BASE_URL}/#organization"},
    }
    desc = description(content)
    if desc:
        page_schema["description"] = desc
    schemas.append(page_schema)

    name = service_name(rel)
    if name:
        service_schema = {
            "@type": "Service",
            "@id": f"{url}#service",
            "name": name,
            "url": url,
            "provider": {"@id": f"{BASE_URL}/#organization"},
            "areaServed": BUSINESS_SCHEMA["areaServed"],
        }
        if desc:
            service_schema["description"] = desc
        schemas.append(service_schema)

    return schemas


def should_skip(path: Path) -> bool:
    rel = rel_path(path)
    return rel in SKIP_FILES or any(part in SKIP_PARTS for part in path.parts)


def main() -> None:
    changed = 0
    for path in sorted(ROOT.rglob("*.html")):
        if should_skip(path):
            continue
        content = path.read_text(encoding="utf-8")
        if "</head>" not in content:
            continue
        updated = LD_JSON_RE.sub("\n", content)
        block = schema_block(schemas_for(path, updated))
        updated = updated.replace("</head>", block + "</head>", 1)
        if updated != content:
            path.write_text(updated, encoding="utf-8")
            changed += 1
            print(f"structured data: {rel_path(path)}")
    print(f"updated {changed} files")


if __name__ == "__main__":
    main()
