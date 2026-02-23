import re

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\d]+", "-", text, flags=re.UNICODE)
    text = text.strip("-")
    return text
