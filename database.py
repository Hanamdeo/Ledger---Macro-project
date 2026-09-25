"""
Database Manager Module (SQLite)
Personal Finance Analytics and Expense Management System
Authors: Harshit Namdeo (BTCB25O1059), Aryan Gupta (BTCB25O1027)
Institution: Madhav Institute of Technology & Science (MITS), Gwalior
"""

import sqlite3
import os
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "finance.db")
SCHEMA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")

class DatabaseManager:
    """Encapsulates SQLite database operations matching the project's planned schema."""

    def __init__(self, db_path: str = DB_FILE):
        self.db_path = db_path
        self._shared_conn = None
        if self.db_path == ":memory:":
            self._shared_conn = sqlite3.connect(":memory:")
            self._shared_conn.row_factory = sqlite3.Row
        self._init_db()

    def get_connection(self) -> sqlite3.Connection:
        if self._shared_conn is not None:
            return self._shared_conn
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        if not os.path.exists(self.db_path) or os.path.getsize(self.db_path) == 0:
            with self.get_connection() as conn:
                if os.path.exists(SCHEMA_FILE):
                    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
                        conn.executescript(f.read())

    def insert_transaction(self, txn: Dict[str, Any]) -> bool:
        query = """
            INSERT OR REPLACE INTO transactions (
                transaction_id, date, raw_description, description,
                category, debit, credit, balance, source_file
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        with self.get_connection() as conn:
            conn.execute(query, (
                txn["transaction_id"],
                txn["date"],
                txn.get("raw_description", txn.get("description", "")),
                txn["description"],
                txn["category"],
                float(txn.get("debit", 0.0) or 0.0),
                float(txn.get("credit", 0.0) or 0.0),
                float(txn.get("balance", 0.0) or 0.0),
                txn.get("source_file", "Manual_Entry")
            ))
            conn.commit()
        return True

    def insert_transactions_batch(self, txns: List[Dict[str, Any]]) -> int:
        query = """
            INSERT OR REPLACE INTO transactions (
                transaction_id, date, raw_description, description,
                category, debit, credit, balance, source_file
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        count = 0
        with self.get_connection() as conn:
            for txn in txns:
                conn.execute(query, (
                    txn["transaction_id"],
                    txn["date"],
                    txn.get("raw_description", txn.get("description", "")),
                    txn["description"],
                    txn["category"],
                    float(txn.get("debit", 0.0) or 0.0),
                    float(txn.get("credit", 0.0) or 0.0),
                    float(txn.get("balance", 0.0) or 0.0),
                    txn.get("source_file", "Imported")
                ))
                count += 1
            conn.commit()
        return count

    def get_all_transactions(self, sort_by: str = "date", ascending: bool = False) -> List[Dict[str, Any]]:
        order = "ASC" if ascending else "DESC"
        valid_cols = ["date", "debit", "credit", "balance", "category", "description", "transaction_id"]
        col = sort_by if sort_by in valid_cols else "date"
        
        query = f"SELECT * FROM transactions ORDER BY {col} {order}"
        with self.get_connection() as conn:
            rows = conn.execute(query).fetchall()
            return [dict(r) for r in rows]

    def delete_transaction(self, txn_id: str) -> bool:
        with self.get_connection() as conn:
            cur = conn.execute("DELETE FROM transactions WHERE transaction_id = ?", (txn_id,))
            conn.commit()
            return cur.rowcount > 0

    def get_kpis(self) -> Dict[str, Any]:
        with self.get_connection() as conn:
            row = conn.execute("""
                SELECT 
                    COALESCE(SUM(credit), 0) as total_income,
                    COALESCE(SUM(debit), 0) as total_expense,
                    COUNT(*) as total_txns
                FROM transactions
            """).fetchone()

            total_income = float(row["total_income"])
            total_expense = float(row["total_expense"])
            net_savings = total_income - total_expense
            savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0.0

            # Latest balance
            latest = conn.execute("SELECT balance FROM transactions ORDER BY date DESC, transaction_id DESC LIMIT 1").fetchone()
            current_balance = float(latest["balance"]) if latest else 0.0

            # Top expense category
            top_cat_row = conn.execute("""
                SELECT category, SUM(debit) as spent
                FROM transactions
                WHERE category != 'Income' AND debit > 0
                GROUP BY category
                ORDER BY spent DESC
                LIMIT 1
            """).fetchone()
            top_cat = top_cat_row["category"] if top_cat_row else "None"
            top_cat_amt = float(top_cat_row["spent"]) if top_cat_row else 0.0

            return {
                "total_income": total_income,
                "total_expense": total_expense,
                "net_savings": net_savings,
                "savings_rate": round(savings_rate, 1),
                "current_balance": current_balance,
                "total_transactions": row["total_txns"],
                "top_category": top_cat,
                "top_category_amount": top_cat_amt
            }

    def get_category_breakdown(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute("""
                SELECT category, SUM(debit) as total_spent, COUNT(*) as txn_count
                FROM transactions
                WHERE category != 'Income' AND debit > 0
                GROUP BY category
                ORDER BY total_spent DESC
            """).fetchall()
            return [dict(r) for r in rows]

    def get_monthly_breakdown(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute("""
                SELECT 
                    substr(date, 1, 7) as month,
                    SUM(credit) as income,
                    SUM(debit) as expense,
                    (SUM(credit) - SUM(debit)) as net_savings
                FROM transactions
                GROUP BY month
                ORDER BY month ASC
            """).fetchall()
            return [dict(r) for r in rows]
