#!/usr/bin/env python3
"""
Populate local SQLite database (finance.db) using schema.sql and sample_data.json
"""
import sqlite3
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "finance.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")
DATA_PATH = os.path.join(BASE_DIR, "sample_data.json")

def init_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Execute schema
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        cursor.executescript(f.read())

    # Load and insert sample transactions
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        transactions = json.load(f)

    for txn in transactions:
        cursor.execute("""
            INSERT INTO transactions (
                transaction_id, date, raw_description, description,
                category, debit, credit, balance, source_file
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            txn["transaction_id"],
            txn["date"],
            txn.get("raw_description", txn["description"]),
            txn["description"],
            txn["category"],
            txn.get("debit", 0.0),
            txn.get("credit", 0.0),
            txn["balance"],
            txn.get("source_file", "Initial_Statement")
        ))

    conn.commit()
    cursor.execute("SELECT count(*) FROM transactions")
    count = cursor.fetchone()[0]
    print(f"Successfully created finance.db with {count} transactions!")
    conn.close()

if __name__ == "__main__":
    init_db()
