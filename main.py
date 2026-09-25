#!/usr/bin/env python3
"""
Main Application CLI & Pipeline Orchestrator
Personal Finance Analytics and Expense Management System
Authors: Harshit Namdeo (BTCB25O1059), Aryan Gupta (BTCB25O1027)
Institution: Madhav Institute of Technology & Science (MITS), Gwalior
Mentor: Dr. Tejaswita Mishra, Dr. Abhishek Dixit
"""

import sys
import os
import argparse
from cleaner import MerchantCleaner
from database import DatabaseManager
from parser import StatementParser
from analytics import ReportGenerator
import serve

def print_banner():
    print("=" * 75)
    print("  LEDGER - PERSONAL FINANCE ANALYTICS & EXPENSE MANAGEMENT SYSTEM")
    print("  Authors: Harshit Namdeo (BTCB25O1059) & Aryan Gupta (BTCB25O1027)")
    print("=" * 75)

def cmd_summary(args):
    db = DatabaseManager()
    kpis = db.get_kpis()
    print_banner()
    print("\n[+] SYSTEM EXECUTIVE FINANCIAL SUMMARY:")
    print("-" * 50)
    print(f"  Total Inflow (Income)   : Rs. {kpis['total_income']:,.2f}")
    print(f"  Total Outflow (Expenses): Rs. {kpis['total_expense']:,.2f}")
    print(f"  Net Savings             : Rs. {kpis['net_savings']:,.2f}")
    print(f"  Savings Rate            : {kpis['savings_rate']}%")
    print(f"  Running Account Balance : Rs. {kpis['current_balance']:,.2f}")
    print(f"  Total Transactions      : {kpis['total_transactions']}")
    print(f"  Top Expense Category    : {kpis['top_category']} (Rs. {kpis['top_category_amount']:,.2f})")
    print("-" * 50)

    print("\n[+] CATEGORY-WISE SPENDING BREAKDOWN:")
    cats = db.get_category_breakdown()
    print(f"  {'Category':<30} {'Spent (Rs.)':<15} {'Txn Count':<10}")
    print("  " + "-" * 55)
    for c in cats:
        print(f"  {c['category']:<30} Rs. {c['total_spent']:<11,.2f} {c['txn_count']:<10}")

def cmd_parse(args):
    file_path = args.file
    if not os.path.exists(file_path):
        print(f"[!] Error: File '{file_path}' does not exist.")
        sys.exit(1)

    print_banner()
    print(f"\n[*] Initiating Statement Ingestion Pipeline for: {file_path}")
    cleaner = MerchantCleaner()
    db = DatabaseManager()
    parser = StatementParser(cleaner=cleaner, db=db)

    records = parser.parse_file(file_path)
    print(f"[+] Successfully extracted {len(records)} raw transactions.")
    
    saved_count = db.insert_transactions_batch(records)
    print(f"[+] Normalized and committed {saved_count} transactions to SQLite database (finance.db)!")

    print("\nSample Processed Records:")
    for r in records[:5]:
        print(f"  - {r['date']} | {r['description']} ({r['category']}) | Debit: Rs. {r['debit']:,.2f} | Credit: Rs. {r['credit']:,.2f}")

def cmd_report(args):
    print_banner()
    print("\n[*] Generating Publication-Ready Matplotlib Analytics Charts...")
    db = DatabaseManager()
    generator = ReportGenerator(db=db)
    charts = generator.generate_all_charts()
    print("[+] Charts generated successfully in 'exports/' folder:")
    for name, path in charts.items():
        print(f"  - {name}: {os.path.basename(path)} ({os.path.getsize(path)/1024:.1f} KB)")

def cmd_serve(args):
    print_banner()
    serve.run()

def main():
    parser = argparse.ArgumentParser(
        description="Personal Finance Analytics & Expense Management System (MITS Gwalior)"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # summary
    p_sum = subparsers.add_parser("summary", help="Show financial KPIs and category summaries")
    p_sum.set_defaults(func=cmd_summary)

    # parse
    p_parse = subparsers.add_parser("parse", help="Parse PDF/CSV/Excel statement and store in SQLite")
    p_parse.add_argument("file", help="Path to statement file (.pdf, .csv, .xlsx)")
    p_parse.set_defaults(func=cmd_parse)

    # report
    p_rep = subparsers.add_parser("report", help="Generate Matplotlib charts for project report")
    p_rep.set_defaults(func=cmd_report)

    # serve
    p_serve = subparsers.add_parser("serve", help="Launch interactive front-end web dashboard")
    p_serve.set_defaults(func=cmd_serve)

    args = parser.parse_args()
    if not args.command:
        # Default action: show summary
        cmd_summary(args)
        print("\n💡 Tip: Run 'python main.py serve' to open the web dashboard in your browser.")
        print("💡 Run 'python main.py --help' for all CLI options.")
    else:
        args.func(args)

if __name__ == "__main__":
    main()
