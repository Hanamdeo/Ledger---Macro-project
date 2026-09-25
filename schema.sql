-- SQLite Database Schema: Personal Finance Analytics and Expense Management System
-- Authors: Harshit Namdeo (BTCB25O1059), Aryan Gupta (BTCB25O1027)
-- Institution: Madhav Institute of Technology & Science (MITS), Gwalior
-- Mentor: Dr. Tejaswita Mishra

CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT UNIQUE NOT NULL,
    color_hex TEXT DEFAULT '#64748b',
    icon_name TEXT DEFAULT 'tag'
);

CREATE TABLE IF NOT EXISTS normalization_rules (
    rule_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern TEXT NOT NULL,
    pattern_type TEXT DEFAULT 'contains', -- contains, regex, exact
    clean_merchant TEXT NOT NULL,
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories (category_id)
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id TEXT PRIMARY KEY,
    date TEXT NOT NULL, -- ISO-8601 YYYY-MM-DD
    raw_description TEXT NOT NULL,
    description TEXT NOT NULL, -- Cleaned merchant / description
    category TEXT NOT NULL,
    debit REAL DEFAULT 0.0,
    credit REAL DEFAULT 0.0,
    balance REAL NOT NULL,
    source_file TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Categories
INSERT OR IGNORE INTO categories (category_name, color_hex, icon_name) VALUES
('Food & Dining', '#ef4444', 'utensils'),
('Shopping', '#f97316', 'shopping-bag'),
('Travel & Transport', '#3b82f6', 'car'),
('Utilities & Bills', '#8b5cf6', 'zap'),
('Education & Learning', '#06b6d4', 'book-open'),
('Subscriptions & Entertainment', '#ec4899', 'film'),
('Health & Wellness', '#10b981', 'activity'),
('Groceries', '#14b8a6', 'shopping-cart'),
('Investments', '#6366f1', 'trending-up'),
('Income', '#22c55e', 'arrow-down-left'),
('Miscellaneous', '#64748b', 'more-horizontal');

-- Insert Initial Normalization Rules
INSERT OR IGNORE INTO normalization_rules (pattern, pattern_type, clean_merchant, category_id) VALUES
('SWIGGY', 'contains', 'SWIGGY', 1),
('ZOMATO', 'contains', 'ZOMATO', 1),
('DOMINOS', 'contains', 'DOMINOS PIZZA', 1),
('CAFE COFFEE DAY', 'contains', 'CAFE COFFEE DAY', 1),
('AMAZON', 'contains', 'AMAZON', 2),
('AMZN', 'contains', 'AMAZON', 2),
('FLIPKART', 'contains', 'FLIPKART', 2),
('MYNTRA', 'contains', 'MYNTRA', 2),
('DECATHLON', 'contains', 'DECATHLON', 2),
('UBER', 'contains', 'UBER', 3),
('OLA CABS', 'contains', 'OLA', 3),
('IRCTC', 'contains', 'IRCTC', 3),
('RAPIDO', 'contains', 'RAPIDO', 3),
('INDIGO', 'contains', 'INDIGO AIRLINES', 3),
('AIRTEL', 'contains', 'AIRTEL BROADBAND', 4),
('JIO', 'contains', 'JIO TELECOM', 4),
('BESCOM', 'contains', 'BESCOM POWER', 4),
('TATASKY', 'contains', 'TATA PLAY', 4),
('MITS', 'contains', 'MITS GWALIOR', 5),
('COURSERA', 'contains', 'COURSERA', 5),
('UDEMY', 'contains', 'UDEMY', 5),
('NETFLIX', 'contains', 'NETFLIX', 6),
('SPOTIFY', 'contains', 'SPOTIFY', 6),
('BOOKMYSHOW', 'contains', 'BOOKMYSHOW', 6),
('HOTSTAR', 'contains', 'DISNEY+ HOTSTAR', 6),
('APOLLO', 'contains', 'APOLLO PHARMACY', 7),
('1MG', 'contains', 'TATA 1MG', 7),
('BLINKIT', 'contains', 'BLINKIT', 8),
('ZEPTO', 'contains', 'ZEPTO', 8),
('ZERODHA', 'contains', 'ZERODHA', 9),
('GROWW', 'contains', 'GROWW MF', 9),
('STIPEND', 'contains', 'INTERNSHIP STIPEND', 10),
('SALARY', 'contains', 'COMPANY SALARY', 10),
('UPWORK', 'contains', 'UPWORK FREELANCE', 10),
('INTEREST', 'contains', 'BANK INTEREST', 10);
