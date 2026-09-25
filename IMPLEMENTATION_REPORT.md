# Implementation & Development Report
## Ledger: Personal Finance Analytics and Expense Management System

**Project Milestone:** Implementation / Development  
**Academic Status:** Disciplinary Semester Project / Micro Project-I  
**Authors:**
- **Harshit Namdeo** (Roll No: `BTCB25O1059`)
- **Aryan Gupta** (Roll No: `BTCB25O1027`)  
**Faculty Mentors:**
- **Dr. Tejaswita Mishra** (Assistant Professor)
- **Dr. Abhishek Dixit** (Coordinator)  
**GitHub Repository:** [https://github.com/Hanamdeo/Ledger---Macro-project](https://github.com/Hanamdeo/Ledger---Macro-project)

---

## 🎯 Executive Summary & Milestone Objective

**Objective:** To convert the Requirement Analysis and System Design into a fully working software system with core features implemented.

The **Ledger** Personal Finance Analytics and Expense Management System addresses the widespread issue of fragmented financial data. By ingesting messy transaction data from bank statement PDFs, UPI records (CSV), and e-commerce orders (Excel), the system normalizes cryptic narrations (e.g. `UPI/SWIGGY-REST4892-BLR` → `SWIGGY`), automatically assigns categories through rule-based heuristics, persists structured data in a local SQLite database, and presents visual analytics through dynamic interactive charts.

---

## 📦 Deliverable 1: Source Code (Module-Wise Architecture)

The system is developed following strict modular object-oriented programming (OOP) principles in Python 3 and modern vanilla Web technologies:

| Module / File | Responsibility | Primary Libraries |
| :--- | :--- | :--- |
| `index.html` | Front-end interface, dashboard, modal dialogues, responsive layout | HTML5, Tailwind CSS, CDN |
| `app.js` | Dynamic Chart.js engine, live normalization sandbox, ledger controls, 1-click sample data injector | ES6+ JavaScript, Chart.js |
| `styles.css` | Glassmorphic styling, dark theme, animations, table layout | Modern CSS3 |
| `cleaner.py` | Regex & keyword rule-based merchant normalization and auto-categorizer | `re`, standard library |
| `parser.py` | Ingestion engine parsing PDF bank statements, Excel files, and CSV exports | `pdfplumber`, `pandas`, `openpyxl` |
| `database.py` | SQLite database manager, transaction CRUD, KPI aggregation, financial metrics | `sqlite3` |
| `analytics.py` | Matplotlib report generator producing publication-ready 300 DPI analytical charts | `matplotlib`, `numpy` |
| `main.py` | Unified Command-Line Interface (`summary`, `parse`, `report`, `serve`) | `argparse`, `sys`, `os` |
| `serve.py` | Standalone local HTTP server with automatic browser launch | `http.server`, `socketserver`, `webbrowser` |
| `test_pipeline.py` | Automated unit and integration test suite | `unittest` |

---

## 🔌 Deliverable 2: Front-End and Back-End Integration

The front-end and back-end operate seamlessly through structured data synchronization:

1. **Dynamic Visual Analytics (Chart.js):**
   - **Category-wise Spending (Donut Chart):** Proportional breakdown of spending across 9 active expense categories.
   - **Monthly Inflow vs Outflow (Grouped Bar Chart):** Side-by-side comparison of Income vs Expenses with a Net Savings trendline.
   - **Historical Account Balance & Spend Velocity (Multi-line Trend Chart):** Chronological account balance progression alongside cumulative spend.
   - **Monthly Total Expenses (Bar Chart):** Grouped debit expenditures per calendar month.
   - **Category Ranking (Horizontal Bar Chart):** Sorted expenditure distribution.

2. **Interactive Merchant Normalization Sandbox:**
   - Real-time client-side and backend Python synchronization. Users can input any raw statement string (e.g. `UPI-SWIGGY-REST4892-BLR`) and immediately observe the cleaned merchant label (`SWIGGY`) and auto-assigned category (`Food & Dining`).

3. **1-Click Sample Data Engine:**
   - Allows evaluators and users to inject fresh sample transactions (5, 10, or 15 records) with one click to observe real-time chart re-rendering, recalculation of financial KPIs, and running account balances.

4. **Multi-Format Data Portability:**
   - Filtered and processed transactions can be exported directly from the front-end to **CSV**, **JSON**, or full **SQLite `.sql` script**.

---

## 🗄️ Deliverable 3: Database Implementation (SQLite)

The system fulfills the planned database schema using an embedded SQLite database (`finance.db`) initialized via `schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    raw_description TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    debit REAL DEFAULT 0.0,
    credit REAL DEFAULT 0.0,
    balance REAL NOT NULL,
    source_file TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT UNIQUE NOT NULL,
    color_hex TEXT DEFAULT '#64748b'
);

CREATE TABLE IF NOT EXISTS normalization_rules (
    rule_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern TEXT NOT NULL,
    pattern_type TEXT DEFAULT 'contains',
    clean_merchant TEXT NOT NULL,
    category_id INTEGER
);
```

### Database Features:
- **ACID Compliance:** Ensures zero data corruption during bulk statement ingestion.
- **Traceability:** Every transaction retains `raw_description` and `source_file` provenance for auditability.
- **Pre-populated Seed:** 54 realistic transaction records spanning May 2026 to September 2026.

---

## 🌿 Deliverable 4: Version Control & Repository Architecture

The project repository is structured for clean modularity, reproducibility, and version control:

```text
personal-finance-analytics/
├── index.html                           # Front-end user interface
├── app.js                               # Front-end application logic & charts
├── styles.css                           # UI styling
├── cleaner.py                           # Normalization module
├── parser.py                            # PDF/Excel/CSV parser
├── database.py                          # SQLite database interface
├── analytics.py                         # Matplotlib analytics engine
├── main.py                              # CLI controller
├── serve.py                             # Development server runner
├── test_pipeline.py                     # Test suite
├── schema.sql                           # Database DDL script
├── finance.db                           # Local SQLite database file
├── sample_data.json                     # JSON dataset
├── sample_bank_statement.pdf            # Sample bank statement PDF
├── sample_statement_hdfc.csv            # Sample CSV statement
├── sample_upi_records.csv               # Sample UPI transaction log
├── exports/                             # Generated report charts (300 DPI)
│   ├── category_spending_pie.png
│   ├── monthly_expense_bar.png
│   ├── monthly_trend_line.png
│   └── income_vs_expense_comp.png
├── README.md                            # Project documentation & guide
└── Ledger_Implementation_Deliverables.zip # Complete source code archive
```

---

## ✅ Deliverable 5: Testing, Validation & Functional Outcome

An automated test suite (`test_pipeline.py`) validates the system:
1. `test_cleaner_swiggy_food`: Verified rule mapping for food delivery.
2. `test_cleaner_amazon_shopping`: Verified rule mapping for e-commerce.
3. `test_cleaner_stipend_income`: Verified credit income classification.
4. `test_cleaner_mits_education`: Verified educational fee categorizations.
5. `test_database_crud`: Verified SQLite insert, query, KPI calculations, and deletion.
6. `test_pdf_parsing`: Verified tabular and text extraction from bank statement PDFs via `pdfplumber`.
7. `test_csv_parsing`: Verified multi-column CSV ingestion via `pandas`.
8. `test_matplotlib_report_generation`: Verified generation of all 4 publication charts.

**Test Outcome:** `8/8 Tests Passed (100% Success Rate)`.
