"""
Statement Parser Module (PDF, Excel, CSV)
Personal Finance Analytics and Expense Management System
Authors: Harshit Namdeo (BTCB25O1059), Aryan Gupta (BTCB25O1027)
Institution: Madhav Institute of Technology & Science (MITS), Gwalior
"""

import os
import re
import csv
from datetime import datetime
from typing import List, Dict, Any, Optional
import pandas as pd
import pdfplumber
try:
    import pypdf
except ImportError:
    pypdf = None
from cleaner import MerchantCleaner
from database import DatabaseManager

class PasswordRequiredError(Exception):
    """Raised when an encrypted PDF is provided without a password."""
    pass

class InvalidPasswordError(Exception):
    """Raised when an incorrect password is provided for an encrypted PDF."""
    pass

class StatementParser:
    """Parses bank statements from PDF, Excel, and CSV files, then normalizes & categorizes."""

    def __init__(self, cleaner: MerchantCleaner = None, db: DatabaseManager = None):
        self.cleaner = cleaner or MerchantCleaner()
        self.db = db or DatabaseManager()

    def is_pdf_encrypted(self, file_path: str) -> bool:
        """Checks if a PDF file is encrypted/password-protected."""
        if not file_path.lower().endswith(".pdf"):
            return False
        if pypdf:
            try:
                reader = pypdf.PdfReader(file_path)
                return reader.is_encrypted
            except Exception:
                pass
        try:
            with pdfplumber.open(file_path) as pdf:
                _ = len(pdf.pages)
            return False
        except Exception:
            return True

    def parse_file(self, file_path: str, password: Optional[str] = None) -> List[Dict[str, Any]]:
        """Dispatcher based on file extension with optional PDF password."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return self.parse_pdf(file_path, password=password)
        elif ext in [".xlsx", ".xls"]:
            return self.parse_excel(file_path)
        elif ext in [".csv", ".txt"]:
            return self.parse_csv(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    def parse_csv(self, file_path: str) -> List[Dict[str, Any]]:
        """Parses bank or UPI statement from CSV."""
        df = pd.read_csv(file_path)
        parsed_records = []
        filename = os.path.basename(file_path)

        # Standardize column names (lowercase strip)
        col_map = {c: c.lower().strip() for c in df.columns}
        df.rename(columns=col_map, inplace=True)

        for idx, row in df.iterrows():
            # Date detection
            date_val = str(row.get("date", row.get("value dt", datetime.today().strftime("%Y-%m-%d"))))
            date_clean = self._standardize_date(date_val)

            # Description / Narration detection
            narration = str(row.get("narration", row.get("description", row.get("paid to / received from", "UNKNOWN"))))

            # Debit / Credit detection
            w_amt = row.get("withdrawal amt", row.get("debit", 0.0))
            d_amt = row.get("deposit amt", row.get("credit", 0.0))
            debit = 0.0 if pd.isna(w_amt) else float(w_amt or 0.0)
            credit = 0.0 if pd.isna(d_amt) else float(d_amt or 0.0)

            # If UPI format with Type column:
            txn_type = str(row.get("type", "")).upper()
            amt_val = row.get("amount", 0.0)
            amt = 0.0 if pd.isna(amt_val) else float(amt_val or 0.0)
            if txn_type == "DEBIT" and amt > 0:
                debit = amt
            elif txn_type == "CREDIT" and amt > 0:
                credit = amt

            # Balance
            b_val = row.get("closing balance", row.get("balance", 0.0))
            balance = 0.0 if pd.isna(b_val) else float(b_val or 0.0)

            # Clean and categorize
            cleaned = self.cleaner.clean_and_categorize(narration)

            record = {
                "transaction_id": f"TXN-CSV-{idx+1:04d}-{int(datetime.now().timestamp())%10000}",
                "date": date_clean,
                "raw_description": narration,
                "description": cleaned["clean_merchant"],
                "category": cleaned["category"],
                "debit": debit,
                "credit": credit,
                "balance": balance,
                "source_file": filename
            }
            parsed_records.append(record)

        return parsed_records

    def parse_excel(self, file_path: str) -> List[Dict[str, Any]]:
        """Parses statement from Excel (.xlsx/.xls) using pandas / openpyxl."""
        df = pd.read_excel(file_path)
        # Convert to temp CSV logic or parse directly
        parsed_records = []
        filename = os.path.basename(file_path)
        col_map = {c: str(c).lower().strip() for c in df.columns}
        df.rename(columns=col_map, inplace=True)

        for idx, row in df.iterrows():
            date_val = str(row.get("date", datetime.today().strftime("%Y-%m-%d")))
            narration = str(row.get("narration", row.get("description", row.get("item name", "UNKNOWN"))))
            w_amt = row.get("withdrawal amt", row.get("debit", row.get("amount", 0.0)))
            d_amt = row.get("deposit amt", row.get("credit", 0.0))
            b_val = row.get("closing balance", row.get("balance", 0.0))
            debit = 0.0 if pd.isna(w_amt) else float(w_amt or 0.0)
            credit = 0.0 if pd.isna(d_amt) else float(d_amt or 0.0)
            balance = 0.0 if pd.isna(b_val) else float(b_val or 0.0)

            cleaned = self.cleaner.clean_and_categorize(narration)
            record = {
                "transaction_id": f"TXN-XLS-{idx+1:04d}-{int(datetime.now().timestamp())%10000}",
                "date": self._standardize_date(date_val),
                "raw_description": narration,
                "description": cleaned["clean_merchant"],
                "category": cleaned["category"],
                "debit": debit,
                "credit": credit,
                "balance": balance,
                "source_file": filename
            }
            parsed_records.append(record)
        return parsed_records

    def parse_pdf(self, file_path: str, password: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parses bank statement PDF using pdfplumber with optional password decryption."""
        parsed_records = []
        filename = os.path.basename(file_path)

        # Check encryption using pypdf if available
        if pypdf:
            try:
                reader = pypdf.PdfReader(file_path)
                if reader.is_encrypted:
                    if not password:
                        raise PasswordRequiredError(
                            f"Bank statement '{filename}' is password-protected. Please supply the statement password."
                        )
                    decrypt_res = reader.decrypt(password)
                    if decrypt_res == 0:
                        raise InvalidPasswordError(
                            f"Incorrect password provided for bank statement '{filename}'."
                        )
            except (PasswordRequiredError, InvalidPasswordError):
                raise
            except Exception:
                pass

        try:
            with pdfplumber.open(file_path, password=password) as pdf:
                for page_idx, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                if tables:
                    for table in tables:
                        if not table or len(table) < 2:
                            continue
                        headers = [str(c).lower().strip() if c else "" for c in table[0]]
                        
                        # Find indices
                        date_idx = self._find_col_index(headers, ["date", "txn date", "value date"])
                        narr_idx = self._find_col_index(headers, ["narration", "description", "particulars", "remarks"])
                        debit_idx = self._find_col_index(headers, ["withdrawal", "debit", "dr"])
                        credit_idx = self._find_col_index(headers, ["deposit", "credit", "cr"])
                        bal_idx = self._find_col_index(headers, ["balance", "closing bal"])

                        for row_idx, row in enumerate(table[1:]):
                            if not row or len(row) <= 1:
                                continue
                            date_str = str(row[date_idx]) if date_idx is not None and date_idx < len(row) else ""
                            if not self._is_valid_date(date_str):
                                continue

                            narration = str(row[narr_idx]) if narr_idx is not None and narr_idx < len(row) else "BANK TXN"
                            debit_str = str(row[debit_idx]) if debit_idx is not None and debit_idx < len(row) else "0"
                            credit_str = str(row[credit_idx]) if credit_idx is not None and credit_idx < len(row) else "0"
                            bal_str = str(row[bal_idx]) if bal_idx is not None and bal_idx < len(row) else "0"

                            debit = self._parse_amount(debit_str)
                            credit = self._parse_amount(credit_str)
                            balance = self._parse_amount(bal_str)

                            cleaned = self.cleaner.clean_and_categorize(narration)

                            parsed_records.append({
                                "transaction_id": f"TXN-PDF-P{page_idx+1}-{row_idx+1:03d}",
                                "date": self._standardize_date(date_str),
                                "raw_description": narration,
                                "description": cleaned["clean_merchant"],
                                "category": cleaned["category"],
                                "debit": debit,
                                "credit": credit,
                                "balance": balance,
                                "source_file": filename
                            })
                else:
                    # Fallback to regex text extraction if no tabular structure
                    text = page.extract_text()
                    lines = text.split("\n") if text else []
                    for line_idx, line in enumerate(lines):
                        line = line.strip()
                        # Match: YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY followed by narration and numbers
                        match = re.search(r'^(\d{4}-\d{2}-\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\s+(.+?)\s+([\d,]+\.\d{2})(?:\s+([\d,]+\.\d{2}))?$', line)
                        if match:
                            date_str, narration, num1_str, num2_str = match.groups()
                            cleaned = self.cleaner.clean_and_categorize(narration)
                            num1 = self._parse_amount(num1_str)
                            num2 = self._parse_amount(num2_str) if num2_str else 0.0

                            # Determine if credit or debit
                            is_credit = cleaned["category"] == "Income" or "CR" in narration.upper() or "STIPEND" in narration.upper()
                            debit = 0.0 if is_credit else num1
                            credit = num1 if is_credit else 0.0
                            balance = num2 if num2 else 0.0

                            parsed_records.append({
                                "transaction_id": f"TXN-PDF-TXT-{line_idx+1:03d}",
                                "date": self._standardize_date(date_str),
                                "raw_description": narration.strip(),
                                "description": cleaned["clean_merchant"],
                                "category": cleaned["category"],
                                "debit": debit,
                                "credit": credit,
                                "balance": balance,
                                "source_file": filename
                            })
        except (PasswordRequiredError, InvalidPasswordError):
            raise
        except Exception as e:
            err_str = str(e).lower() + " " + type(e).__name__.lower()
            if "password" in err_str or "encrypt" in err_str:
                if not password:
                    raise PasswordRequiredError(f"PDF statement '{filename}' is password-protected. Please provide the statement password.")
                else:
                    raise InvalidPasswordError(f"Incorrect password provided for '{filename}'.")
            raise e

        return parsed_records

    def _find_col_index(self, headers: List[str], candidates: List[str]) -> Optional[int]:
        for i, h in enumerate(headers):
            for c in candidates:
                if c in h:
                    return i
        return None

    def _is_valid_date(self, s: str) -> bool:
        if not s:
            return False
        patterns = [r'^\d{4}-\d{2}-\d{2}', r'^\d{2}/\d{2}/\d{4}', r'^\d{2}-\d{2}-\d{4}']
        return any(re.search(p, s.strip()) for p in patterns)

    def _standardize_date(self, date_str: str) -> str:
        s = str(date_str).strip()
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d", "%d-%b-%Y"):
            try:
                return datetime.strptime(s.split()[0], fmt).strftime("%Y-%m-%d")
            except ValueError:
                pass
        return datetime.today().strftime("%Y-%m-%d")

    def _parse_amount(self, s: str) -> float:
        if not s:
            return 0.0
        cleaned = re.sub(r'[^\d.]', '', str(s).replace(',', ''))
        try:
            return float(cleaned) if cleaned else 0.0
        except ValueError:
            return 0.0
