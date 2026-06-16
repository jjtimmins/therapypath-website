import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTACT_EMAIL = "services@therapypath.com"
FORM_ACTION = f"https://formsubmit.co/{CONTACT_EMAIL}"
HIDDEN = (
    '<input type="hidden" name="_subject" value="New message from The Therapy Path website" />'
    '<input type="hidden" name="_captcha" value="false" />'
    '<input type="hidden" name="_template" value="table" />'
    '<input type="hidden" name="_url" value="" />'
)
CAPTCHA_RE = re.compile(
    r'<div id="comp-m4d2ct0y" class="Captcha3940957316__root[^"]*"[^>]*>.*?</div>\s*'
    r'(?=<div class="comp-kq7zyxd6)',
    re.S,
)


def patch_contact(path: Path, thanks: str):
    content = path.read_text(encoding="utf-8")
    original = content

    m = re.search(r'<form id="([^"]+)"[^>]*class="[^"]*wixui-form[^"]*"[^>]*>', content)
    if not m:
        print(f"skip {path.name}: form not found")
        return

    form_id = m.group(1)

    if f'action="{FORM_ACTION}"' not in content:
        content = re.sub(
            rf'<form id="{re.escape(form_id)}" class="([^"]*wixui-form)"([^>]*)>',
            rf'<form id="{form_id}" class="\1 tp-contact-form"\2 '
            rf'action="{FORM_ACTION}" method="POST">'
            f"{HIDDEN}"
            f'<input type="hidden" name="_next" value="{thanks}" />',
            content,
            count=1,
        )

    if 'name="message"' not in content:
        content = content.replace(
            '<textarea id="textarea_comp-kq7zyxd1"',
            '<textarea name="message" id="textarea_comp-kq7zyxd1"',
        )

    if 'name="_url"' not in content:
        content = content.replace(
            '<input type="hidden" name="_template" value="table" />',
            '<input type="hidden" name="_template" value="table" />'
            '<input type="hidden" name="_url" value="" />',
            1,
        )

    content = re.sub(
        r'(<div[^>]*id="comp-kq7zyxd6"[^>]*>\s*<button)(?![^>]*type=)',
        r"\1 type=\"submit\"",
        content,
        count=1,
        flags=re.S,
    )

    content = CAPTCHA_RE.sub("", content)

    if content != original:
        path.write_text(content, encoding="utf-8")
        print(f"patched {path}")
    else:
        print(f"skip {path.name}: no changes")


for rel, thanks in [
    ("contact-us.html", "/contact-us.html?sent=1"),
    ("fr/contact-us.html", "/fr/contact-us.html?sent=1"),
]:
    p = ROOT / rel
    if p.exists():
        patch_contact(p, thanks)
