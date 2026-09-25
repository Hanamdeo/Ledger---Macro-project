"""
Visual Analytics & Report Generator Module (Matplotlib)
Personal Finance Analytics and Expense Management System
Authors: Harshit Namdeo (BTCB25O1059), Aryan Gupta (BTCB25O1027)
Institution: Madhav Institute of Technology & Science (MITS), Gwalior
"""

import os
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for server/script usage
import matplotlib.pyplot as plt
import numpy as np
from database import DatabaseManager

EXPORTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "exports")

CATEGORY_PALETTE = {
    "Food & Dining": "#ef4444",
    "Shopping": "#f97316",
    "Travel & Transport": "#3b82f6",
    "Utilities & Bills": "#8b5cf6",
    "Education & Learning": "#06b6d4",
    "Subscriptions & Entertainment": "#ec4899",
    "Health & Wellness": "#10b981",
    "Groceries": "#14b8a6",
    "Investments": "#6366f1",
    "Miscellaneous": "#94a3b8"
}

class ReportGenerator:
    """Generates the 4 visual analytics charts defined in Section 3 of the Project Scope."""

    def __init__(self, db: DatabaseManager = None, export_dir: str = EXPORTS_DIR):
        self.db = db or DatabaseManager()
        self.export_dir = export_dir
        os.makedirs(self.export_dir, exist_ok=True)
        # Setup aesthetic matplotlib style
        plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")

    def generate_all_charts(self) -> dict:
        """Generates all 4 charts specified in the report."""
        pie_path = self.generate_category_pie_chart()
        bar_path = self.generate_monthly_expense_bar()
        trend_path = self.generate_monthly_trend_line()
        comp_path = self.generate_income_vs_expense_comp()
        return {
            "category_pie": pie_path,
            "monthly_expense_bar": bar_path,
            "monthly_trend_line": trend_path,
            "income_vs_expense": comp_path
        }

    def generate_category_pie_chart(self) -> str:
        """1. Pie chart of category-wise spending."""
        categories = self.db.get_category_breakdown()
        if not categories:
            return ""

        labels = [c["category"] for c in categories]
        values = [c["total_spent"] for c in categories]
        colors = [CATEGORY_PALETTE.get(c, "#94a3b8") for c in labels]

        fig, ax = plt.subplots(figsize=(8, 6), subplot_kw=dict(aspect="equal"))
        wedges, texts, autotexts = ax.pie(
            values,
            labels=labels,
            autopct="%1.1f%%",
            startangle=140,
            colors=colors,
            pctdistance=0.8,
            wedgeprops=dict(width=0.45, edgecolor="white", linewidth=1.5)
        )

        plt.setp(autotexts, size=9, weight="bold", color="white")
        plt.setp(texts, size=9)
        ax.set_title("Category-wise Spending Breakdown (Donut Chart)\nPersonal Finance Management System", fontsize=12, pad=15, weight="bold")

        output_path = os.path.join(self.export_dir, "category_spending_pie.png")
        fig.tight_layout()
        fig.savefig(output_path, dpi=300)
        plt.close(fig)
        return output_path

    def generate_monthly_expense_bar(self) -> str:
        """2. Bar chart of expenses per month."""
        monthly_data = self.db.get_monthly_breakdown()
        if not monthly_data:
            return ""

        months = [m["month"] for m in monthly_data]
        expenses = [m["expense"] for m in monthly_data]

        fig, ax = plt.subplots(figsize=(9, 5))
        bars = ax.bar(months, expenses, color="#f43f5e", width=0.45, edgecolor="#e11d48", linewidth=1.2)

        for bar in bars:
            height = bar.get_height()
            ax.annotate(f'₹{int(height):,}',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 4),
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=9, weight="semibold")

        ax.set_ylabel("Total Expenditure (₹ INR)", fontsize=10)
        ax.set_title("Monthly Total Expenses Breakdown\nLedger - Financial Analytics", fontsize=12, weight="bold", pad=12)
        ax.grid(axis='y', linestyle='--', alpha=0.5)

        output_path = os.path.join(self.export_dir, "monthly_expense_bar.png")
        fig.tight_layout()
        fig.savefig(output_path, dpi=300)
        plt.close(fig)
        return output_path

    def generate_monthly_trend_line(self) -> str:
        """3. Monthly trend lines for spending, income, and running account balance."""
        txns = self.db.get_all_transactions(sort_by="date", ascending=True)
        if not txns:
            return ""

        dates = [t["date"] for t in txns]
        balances = [t["balance"] for t in txns]

        fig, ax = plt.subplots(figsize=(10, 5))
        ax.plot(dates, balances, label="Running Account Balance (₹)", color="#6366f1", linewidth=2.5, marker="o", markersize=4)

        # Highlight zero line
        ax.axhline(0, color="gray", linestyle="--", alpha=0.5)

        # Show selective date ticks to prevent clutter
        step = max(1, len(dates) // 6)
        ax.set_xticks(range(0, len(dates), step))
        ax.set_xticklabels([dates[i] for i in range(0, len(dates), step)], rotation=25, ha="right", fontsize=9)

        ax.set_ylabel("Account Balance (₹ INR)", fontsize=10)
        ax.set_title("Historical Account Balance Progression Over Time\nPersonal Finance Analytics System", fontsize=12, weight="bold", pad=12)
        ax.legend(loc="upper left")
        ax.grid(True, linestyle="--", alpha=0.5)

        output_path = os.path.join(self.export_dir, "monthly_trend_line.png")
        fig.tight_layout()
        fig.savefig(output_path, dpi=300)
        plt.close(fig)
        return output_path

    def generate_income_vs_expense_comp(self) -> str:
        """4. Income-vs-Expense comparison chart."""
        monthly_data = self.db.get_monthly_breakdown()
        if not monthly_data:
            return ""

        months = [m["month"] for m in monthly_data]
        incomes = [m["income"] for m in monthly_data]
        expenses = [m["expense"] for m in monthly_data]

        x = np.arange(len(months))
        width = 0.35

        fig, ax = plt.subplots(figsize=(9, 5))
        ax.bar(x - width/2, incomes, width, label="Income (Credit)", color="#22c55e", edgecolor="#16a34a")
        ax.bar(x + width/2, expenses, width, label="Expenses (Debit)", color="#f43f5e", edgecolor="#dc2626")

        ax.set_xticks(x)
        ax.set_xticklabels(months, fontsize=9)
        ax.set_ylabel("Amount (₹ INR)", fontsize=10)
        ax.set_title("Monthly Inflow vs Outflow Comparison (Income vs Expenses)\nAuthors: Harshit Namdeo & Aryan Gupta", fontsize=12, weight="bold", pad=12)
        ax.legend(loc="upper right")
        ax.grid(axis='y', linestyle='--', alpha=0.5)

        output_path = os.path.join(self.export_dir, "income_vs_expense_comp.png")
        fig.tight_layout()
        fig.savefig(output_path, dpi=300)
        plt.close(fig)
        return output_path
