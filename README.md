# Personal Finance Analytics & Expense Management System

**Academic Institution:** Madhav Institute of Technology & Science (MITS), Gwalior  
*(Deemed University, NAAC Accredited with A++ Grade)*  
**Department:** Centre for Computer Science and Technology  
**Program:** Bachelor of Technology in Computer Science and Business Systems (CSBS)  
**Project Category:** Micro Project-I / Disciplinary Semester Project  
**Authors:**
- **Harshit Namdeo** (Enrollment / Roll No: `BTCB25O1059`)
- **Aryan Gupta** (Enrollment / Roll No: `BTCB25O1027`)  
**Faculty Mentors:**
- **Dr. Tejaswita Mishra** (Assistant Professor, Centre for CST)
- **Dr. Abhishek Dixit** (Coordinator, Centre for CST)

---

## 🎯 Executive Summary & Problem Addressed

Most individuals and students receive financial transaction records in fragmented, unstructured formats:
1. **Bank Statements (PDF)** with multi-column tabular data and cryptic narrations.
2. **UPI Payment Logs (CSV/Excel)** from Google Pay, PhonePe, and Paytm.
3. **E-Commerce / Food Delivery Logs** from Amazon Pay, Flipkart, Swiggy, and Zomato.

Merchant narrations in these statements are often convoluted (e.g. `UPI/SWIGGY-19284-DELHI/REST` vs `SWIGGY`, `AMZN MKTP IN*PAY98124` vs `AMAZON`). Consequently, users cannot get a unified, automated view of expenses or categorize spending into Food, Travel, Utilities, Education, and Investments.

This frontend application delivers an interactive, automated dashboard that extracts, normalizes, categorizes, stores, and visually charts personal financial transactions.

---

## 🚀 Key Features

### 1. Dynamic Interactive Charts (Chart.js)
- **Category-wise Spending (Donut/Pie Chart):** Proportional distribution of all expenditures across categories (Food & Dining, Shopping, Travel, Utilities, Subscriptions, Education, Groceries, Investments).
- **Monthly Inflow vs Outflow (Grouped Bar Chart):** Side-by-side comparison of monthly credits (stipend, freelance, cashback) and debits with a smooth Net Savings trend overlay.
- **Account Balance & Spend Velocity (Multi-line Trend Chart):** Historical progression of running account balances alongside cumulative expenditure.
- **Monthly Expense Totals (Bar Chart):** Month-by-month debit aggregates.
- **Category Comparison (Ranked Horizontal Bar):** Visual ranking of highest-spending buckets.

### 2. 1-Click Sample Data Generation & Simulation
- **Top Header Button (`+ Add Sample Data`):** Click once to instantly inject 5 fresh, diverse student transactions (Swiggy, Uber, Flipkart, TCS Stipend, BookMyShow, etc.).
- **Batch Menu Options:**
  - `⚡ Add 5 Quick Transactions`
  - `🚀 Add 15 Monthly Batch` (simulates a full month of inflows & outflows)
  - `🔄 Reset Full 54 Records` (restores base May–Sep dataset)
  - `🗑️ Clear All Transactions` (test empty state & 1-click re-population)
- **Automatic Rule-Engine Run:** Every generated transaction passes through the normalization engine in real-time, instantly updating all Chart.js visualizations, KPI cards, and ledger tables.

### 3. Merchant Normalization & Rule Engine (Live Sandbox)
- **Pattern Matching:** Case-insensitive string contains and regex matching.
- **Auto-Categorization:** Converts raw narrations (e.g., `UPI-SWIGGY-REST4892-BLR` → `SWIGGY` → `Food & Dining`).
- **Live Sandbox:** Test any string in real-time to see cleaned merchant label and matched rule.
- **Custom Rule Builder:** Add new patterns and re-classify all database records with one click.

### 3. SQLite Database Design & Transaction Ledger
- Fulfills the planned relational database schema from the project document:
  - `Transaction ID` (Unique identifier, e.g. `TXN-202609-001`)
  - `Date` (ISO format `YYYY-MM-DD`)
  - `Description` (Cleaned merchant label)
  - `Raw Description` (Original narration for auditability)
  - `Category` (Auto-assigned category)
  - `Debit` / `Credit` (Monetary values in INR ₹)
  - `Balance` (Running account balance in INR ₹)
  - `Source File` (Statement origin, e.g. `HDFC_Statement_Sep2026.pdf`)
- Interactive features: Multi-column sorting, real-time search, date/category/type filtering, pagination, manual entry modal, and deletion.

### 4. Statement & File Parser Simulator
- **Real File Upload:** Drag-and-drop or select any `.csv` or `.txt` statement for live parsing.
- **1-Click Presets:** Simulates `pdfplumber` and `pandas` extraction from HDFC PDF statements, SBI passbooks, and PhonePe UPI CSV records.
- **Parser Execution Log:** Step-by-step console showing stream initialization, regex extraction, rule normalization, and SQLite commits.

### 5. Multi-Format Data Export
- Export filtered records to **CSV**.
- Export full database state to **JSON**.
- Export complete **SQLite DDL & SQL Inserts** script (`schema.sql`).

---

## 📁 Project Directory Structure

```text
personal-finance-analytics/
├── index.html                  # Main responsive single-page application
├── app.js                      # Application state, Rule engine, Chart.js instances, parser logic
├── styles.css                  # Custom styling, glassmorphism, responsive utilities
├── sample_data.json            # 54 realistic sample transactions (May - Sep 2026)
├── sample_statement_hdfc.csv   # Sample HDFC Bank statement for upload testing
├── sample_upi_records.csv      # Sample PhonePe/UPI records for upload testing
├── schema.sql                  # SQLite DDL and initial normalization rules seed
├── serve.py                    # Local Python web server with auto-browser launch
└── README.md                   # Complete documentation & project report mapping
```

---

## 🏃 How to Run the Website

### Option A: Local Python Server (Recommended)
Open PowerShell or Command Prompt in this folder and run:
```powershell
python serve.py
```
This automatically launches your default web browser at `http://localhost:3000/index.html`.

### Option B: Direct Browser Launch
Simply double-click `index.html` in Windows Explorer or open it in Google Chrome, Microsoft Edge, or Mozilla Firefox. No build tools or node dependencies are required.

---

## 📊 Sample Dataset Overview
The pre-loaded dataset includes **54 realistic transactions** reflecting an Indian university student / young professional's financial profile:
- **Income sources:** Monthly TCS Innovation Labs Stipend (₹35,000/month), Upwork freelance escrow credits (₹12,400 – ₹18,500), quarterly bank interest credits, and Amazon Pay cashback.
- **Expenses:** Food delivery (Swiggy, Zomato, Dominos), Travel (Uber, Ola, Rapido, IRCTC train tickets, IndiGo flight), Utilities (Airtel Broadband, Jio 5G, BESCOM electricity), Education (MITS exam fees, Coursera, Udemy), Subscriptions (Netflix, Spotify, BookMyShow), and Investments (Zerodha, Groww SIPs).

---

## 🎓 Academic Compliance & Plagiarism Verification
- **Coursework:** Micro Project-I, Flexible Curriculum Scheme (AICTE Model Curriculum 2018).
- **Institute:** Madhav Institute of Technology & Science (MITS), Gwalior.

