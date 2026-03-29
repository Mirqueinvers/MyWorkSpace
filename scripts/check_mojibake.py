from __future__ import annotations

from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
SCAN_ROOTS = [ROOT / "src", ROOT / "electron"]
TEXT_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs", ".css", ".html"}

SUSPICIOUS_PATTERNS = [
    re.compile(r"(?:Р[А-Яа-яЁёЀ-ӿ]){2,}"),
    re.compile(r"(?:С[А-Яа-яЁёЀ-ӿ]){2,}"),
    re.compile(r"Р[^ \n\r\t]{0,2}С[^ \n\r\t]{0,2}Р"),
]


def file_has_issue(path: Path) -> list[str]:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return ["file is not valid UTF-8"]

    issues: list[str] = []

    if "???" in text:
        issues.append("contains ???")
    if "\ufffd" in text:
        issues.append("contains replacement character")

    for pattern in SUSPICIOUS_PATTERNS:
        match = pattern.search(text)
        if match:
            issues.append(f"suspicious mojibake fragment: {match.group(0)[:40]}")
            break

    return issues


def main() -> int:
    bad_files: list[tuple[Path, list[str]]] = []

    for base in SCAN_ROOTS:
        if not base.exists():
            continue

        for path in base.rglob("*"):
            if path.suffix.lower() not in TEXT_EXTENSIONS or not path.is_file():
                continue

            issues = file_has_issue(path)
            if issues:
                bad_files.append((path.relative_to(ROOT), issues))

    if not bad_files:
        print("No obvious encoding issues found.")
        return 0

    print("Potential encoding issues found:")
    for relative_path, issues in bad_files:
        print(f"- {relative_path}")
        for issue in issues:
            print(f"  {issue}")

    return 1


if __name__ == "__main__":
    sys.exit(main())
