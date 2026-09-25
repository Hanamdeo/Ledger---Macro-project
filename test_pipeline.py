"""
Unit and Integration Test Suite
Personal Finance Analytics and Expense Management System
Authors: Harshit Namdeo (BTCB25O1059), Aryan Gupta (BTCB25O1027)
Institution: Madhav Institute of Technology & Science (MITS), Gwalior
"""

import unittest
import os
import tempfile
import sqlite3
from cleaner import MerchantCleaner
from database import DatabaseManager
from parser import StatementParser
from analytics import ReportGenerator

class TestPersonalFinanceSystem(unittest.TestCase):

    def setUp(self):
        self.cleaner = MerchantCleaner()
        self.db = DatabaseManager(db_path=":memory:")
        self.parser = StatementParser(cleaner=self.cleaner, db=self.db)

    def tearDown(self):
        pass

    def test_cleaner_swiggy_food(self):
        result = self.cleaner.clean_and_categorize("UPI/SWIGGY-19284-DELHI/REST")
        self.assertEqual(result["clean_merchant"], "SWIGGY")
        self.assertEqual(result["category"], "Food & Dining")

    def test_cleaner_amazon_shopping(self):
        result = self.cleaner.clean_and_categorize("POS-AMZN MKTP IN*PAY98124")
        self.assertEqual(result["clean_merchant"], "AMAZON")
        self.assertEqual(result["category"], "Shopping")

    def test_cleaner_stipend_income(self):
        result = self.cleaner.clean_and_categorize("ACH-TCS-INNOVATION-LABS-STIPEND-CR")
        self.assertEqual(result["clean_merchant"], "INTERNSHIP STIPEND")
        self.assertEqual(result["category"], "Income")

    def test_cleaner_mits_education(self):
        result = self.cleaner.clean_and_categorize("UPI/MITS-GWALIOR-EXAM-FEE/GWL")
        self.assertEqual(result["clean_merchant"], "MITS GWALIOR")
        self.assertEqual(result["category"], "Education & Learning")

    def test_database_crud(self):
        test_txn = {
            "transaction_id": "TEST-001",
            "date": "2026-09-25",
            "raw_description": "UPI-SWIGGY-REST",
            "description": "SWIGGY",
            "category": "Food & Dining",
            "debit": 450.0,
            "credit": 0.0,
            "balance": 15000.0,
            "source_file": "test.pdf"
        }
        self.assertTrue(self.db.insert_transaction(test_txn))
        txns = self.db.get_all_transactions()
        self.assertEqual(len(txns), 1)
        self.assertEqual(txns[0]["transaction_id"], "TEST-001")

        kpis = self.db.get_kpis()
        self.assertEqual(kpis["total_expense"], 450.0)
        self.assertEqual(kpis["top_category"], "Food & Dining")

        self.assertTrue(self.db.delete_transaction("TEST-001"))
        self.assertEqual(len(self.db.get_all_transactions()), 0)

    def test_pdf_parsing(self):
        pdf_path = os.path.join(os.path.dirname(__file__), "sample_bank_statement.pdf")
        if os.path.exists(pdf_path):
            records = self.parser.parse_pdf(pdf_path)
            self.assertGreater(len(records), 0)
            self.assertEqual(records[0]["description"], "SWIGGY")

    def test_csv_parsing(self):
        csv_path = os.path.join(os.path.dirname(__file__), "sample_statement_hdfc.csv")
        if os.path.exists(csv_path):
            records = self.parser.parse_csv(csv_path)
            self.assertEqual(len(records), 12)

    def test_matplotlib_report_generation(self):
        # Insert a sample credit and debit
        self.db.insert_transaction({
            "transaction_id": "T1", "date": "2026-08-01", "description": "STIPEND",
            "category": "Income", "debit": 0, "credit": 35000, "balance": 35000
        })
        self.db.insert_transaction({
            "transaction_id": "T2", "date": "2026-08-05", "description": "SWIGGY",
            "category": "Food & Dining", "debit": 500, "credit": 0, "balance": 34500
        })
        temp_dir = tempfile.mkdtemp()
        rep = ReportGenerator(db=self.db, export_dir=temp_dir)
        charts = rep.generate_all_charts()
        for key, path in charts.items():
            self.assertTrue(os.path.exists(path), f"Chart {key} was not created!")
            self.assertGreater(os.path.getsize(path), 0)

if __name__ == "__main__":
    unittest.main()
