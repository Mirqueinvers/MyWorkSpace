from __future__ import annotations

import re
import sqlite3
import sys
import zipfile
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path


NS = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkg": "http://schemas.openxmlformats.org/package/2006/relationships",
}

SKIP_ADDRESS_PREFIXES = (
    "область ",
    "край ",
    "республика ",
    "автономный округ ",
    "район ",
    "муниципальный округ ",
    "городской округ ",
)


@dataclass
class PatientRow:
    last_name: str
    first_name: str
    patronymic: str
    birth_date: str
    address: str


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def normalize_name_part(value: str) -> str:
    return normalize_space(value)


def patient_key(last_name: str, first_name: str, patronymic: str, birth_date: str) -> str:
    return "|".join(
        [
            normalize_space(last_name).lower(),
            normalize_space(first_name).lower(),
            normalize_space(patronymic).lower(),
            re.sub(r"\D", "", birth_date),
        ]
    )


def excel_serial_to_ddmmyyyy(raw_value: str) -> str:
    raw_value = str(raw_value).strip()
    if not raw_value:
        return ""

    if re.fullmatch(r"\d{8}", raw_value):
        return raw_value

    try:
        serial = int(float(raw_value))
    except ValueError:
        digits = re.sub(r"\D", "", raw_value)
        return digits[:8] if len(digits) >= 8 else ""

    base_date = datetime(1899, 12, 30)
    date_value = base_date + timedelta(days=serial)
    return date_value.strftime("%d%m%Y")


def clean_registration_address(address: str) -> str:
    parts = [normalize_space(part) for part in str(address).split(",")]
    parts = [part for part in parts if part]

    while parts and parts[0].lower().startswith(SKIP_ADDRESS_PREFIXES):
        parts.pop(0)

    if len(parts) >= 2 and parts[0].lower().startswith("город ") and parts[1].lower().startswith("район "):
        parts.pop(1)

    return ", ".join(parts)


def read_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []

    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    shared_strings: list[str] = []

    for si in root.findall("a:si", NS):
        shared_strings.append("".join((node.text or "") for node in si.findall(".//a:t", NS)))

    return shared_strings


def resolve_first_sheet_path(archive: zipfile.ZipFile) -> str:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    rel_map = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels.findall("pkg:Relationship", NS)}
    first_sheet = workbook.find("a:sheets/a:sheet", NS)

    if first_sheet is None:
        raise RuntimeError("Workbook does not contain sheets")

    rid = first_sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
    target = rel_map[rid]
    return target if target.startswith("xl/") else f"xl/{target}"


def cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")

    if cell_type == "inlineStr":
        node = cell.find("a:is/a:t", NS)
        return node.text if node is not None and node.text is not None else ""

    node = cell.find("a:v", NS)
    if node is None or node.text is None:
        return ""

    if cell_type == "s":
        index = int(node.text)
        return shared_strings[index] if 0 <= index < len(shared_strings) else ""

    return node.text


def parse_patients(xlsx_path: Path) -> list[PatientRow]:
    patients: list[PatientRow] = []

    with zipfile.ZipFile(xlsx_path) as archive:
        shared_strings = read_shared_strings(archive)
        sheet_path = resolve_first_sheet_path(archive)
        root = ET.fromstring(archive.read(sheet_path))
        rows = root.findall(".//a:sheetData/a:row", NS)

        for row in rows[3:]:
            values: dict[str, str] = {}
            for cell in row.findall("a:c", NS):
                ref = cell.attrib.get("r", "")
                column = "".join(ch for ch in ref if ch.isalpha())
                values[column] = cell_value(cell, shared_strings)

            last_name = normalize_name_part(values.get("D", ""))
            first_name = normalize_name_part(values.get("E", ""))
            patronymic = normalize_name_part(values.get("F", ""))
            birth_date = excel_serial_to_ddmmyyyy(values.get("G", ""))
            address = clean_registration_address(values.get("H", ""))

            if not last_name or not first_name or not birth_date or not address:
                continue

            patients.append(
                PatientRow(
                    last_name=last_name,
                    first_name=first_name,
                    patronymic=patronymic,
                    birth_date=birth_date,
                    address=address,
                )
            )

    return patients


def import_patients(xlsx_path: Path, sqlite_path: Path) -> None:
    patients = parse_patients(xlsx_path)
    connection = sqlite3.connect(sqlite_path)
    connection.row_factory = sqlite3.Row

    existing_keys = {
        patient_key(row["last_name"], row["first_name"], row["patronymic"], row["birth_date"])
        for row in connection.execute(
            """
            SELECT last_name, first_name, patronymic, birth_date
            FROM xray_patients
            """
        )
    }

    inserted = 0
    skipped_existing = 0
    skipped_duplicates = 0
    seen_in_file: set[str] = set()

    insert_query = """
        INSERT INTO xray_patients (
            last_name,
            first_name,
            patronymic,
            birth_date,
            address,
            rmis_url,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, NULL, datetime('now'))
    """

    with connection:
        for patient in patients:
            key = patient_key(
                patient.last_name,
                patient.first_name,
                patient.patronymic,
                patient.birth_date,
            )

            if key in seen_in_file:
                skipped_duplicates += 1
                continue

            seen_in_file.add(key)

            if key in existing_keys:
                skipped_existing += 1
                continue

            connection.execute(
                insert_query,
                (
                    patient.last_name,
                    patient.first_name,
                    patient.patronymic,
                    patient.birth_date,
                    patient.address,
                ),
            )
            existing_keys.add(key)
            inserted += 1

    total_in_db = connection.execute("SELECT COUNT(*) FROM xray_patients").fetchone()[0]
    connection.close()

    print(f"parsed={len(patients)}")
    print(f"inserted={inserted}")
    print(f"skipped_existing={skipped_existing}")
    print(f"skipped_duplicates_in_file={skipped_duplicates}")
    print(f"total_in_db={total_in_db}")


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: import_district_patients.py <xlsx_path> <sqlite_path>")
        return 1

    xlsx_path = Path(sys.argv[1])
    sqlite_path = Path(sys.argv[2])

    if not xlsx_path.exists():
        print(f"XLSX file not found: {xlsx_path}")
        return 1

    if not sqlite_path.exists():
        print(f"SQLite file not found: {sqlite_path}")
        return 1

    import_patients(xlsx_path, sqlite_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
