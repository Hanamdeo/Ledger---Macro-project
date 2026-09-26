"""
Merchant Cleaner & Rule-Based Categorization Engine
Ledger - Personal Finance Analytics and Expense Management System
Authors: Harshit Namdeo (BTCB25O1059), Aryan Gupta (BTCB25O1027)
"""

import re
from typing import Dict, Any, List, Optional

DEFAULT_RULES = [
    {"pattern": r"SWIGGY", "type": "contains", "clean": "SWIGGY", "category": "Food & Dining"},
    {"pattern": r"ZOMATO", "type": "contains", "clean": "ZOMATO", "category": "Food & Dining"},
    {"pattern": r"DOMINOS|JUBILANT", "type": "regex", "clean": "DOMINOS PIZZA", "category": "Food & Dining"},
    {"pattern": r"CAFE COFFEE DAY|CCD", "type": "regex", "clean": "CAFE COFFEE DAY", "category": "Food & Dining"},
    {"pattern": r"AMAZON|AMZN", "type": "regex", "clean": "AMAZON", "category": "Shopping"},
    {"pattern": r"FLIPKART", "type": "contains", "clean": "FLIPKART", "category": "Shopping"},
    {"pattern": r"MYNTRA", "type": "contains", "clean": "MYNTRA", "category": "Shopping"},
    {"pattern": r"DECATHLON", "type": "contains", "clean": "DECATHLON", "category": "Shopping"},
    {"pattern": r"UBER", "type": "contains", "clean": "UBER", "category": "Travel & Transport"},
    {"pattern": r"OLA CABS|OLA", "type": "regex", "clean": "OLA", "category": "Travel & Transport"},
    {"pattern": r"IRCTC", "type": "contains", "clean": "IRCTC", "category": "Travel & Transport"},
    {"pattern": r"RAPIDO", "type": "contains", "clean": "RAPIDO", "category": "Travel & Transport"},
    {"pattern": r"INDIGO", "type": "contains", "clean": "INDIGO AIRLINES", "category": "Travel & Transport"},
    {"pattern": r"AIRTEL", "type": "contains", "clean": "AIRTEL BROADBAND", "category": "Utilities & Bills"},
    {"pattern": r"JIO", "type": "contains", "clean": "JIO TELECOM", "category": "Utilities & Bills"},
    {"pattern": r"BESCOM|ELECTRICITY", "type": "regex", "clean": "BESCOM POWER", "category": "Utilities & Bills"},
    {"pattern": r"COLLEGE|TUITION|EXAM|FEE", "type": "regex", "clean": "COLLEGE EDUCATION", "category": "Education & Learning"},
    {"pattern": r"COURSERA", "type": "contains", "clean": "COURSERA", "category": "Education & Learning"},
    {"pattern": r"UDEMY", "type": "contains", "clean": "UDEMY", "category": "Education & Learning"},
    {"pattern": r"NETFLIX", "type": "contains", "clean": "NETFLIX", "category": "Subscriptions & Entertainment"},
    {"pattern": r"SPOTIFY", "type": "contains", "clean": "SPOTIFY", "category": "Subscriptions & Entertainment"},
    {"pattern": r"BOOKMYSHOW", "type": "contains", "clean": "BOOKMYSHOW", "category": "Subscriptions & Entertainment"},
    {"pattern": r"HOTSTAR|DISNEY", "type": "regex", "clean": "DISNEY+ HOTSTAR", "category": "Subscriptions & Entertainment"},
    {"pattern": r"APOLLO", "type": "contains", "clean": "APOLLO PHARMACY", "category": "Health & Wellness"},
    {"pattern": r"1MG|TATA 1MG", "type": "regex", "clean": "TATA 1MG", "category": "Health & Wellness"},
    {"pattern": r"BLINKIT", "type": "contains", "clean": "BLINKIT", "category": "Groceries"},
    {"pattern": r"ZEPTO", "type": "contains", "clean": "ZEPTO", "category": "Groceries"},
    {"pattern": r"ZERODHA", "type": "contains", "clean": "ZERODHA", "category": "Investments"},
    {"pattern": r"GROWW", "type": "contains", "clean": "GROWW MF", "category": "Investments"},
    {"pattern": r"STIPEND|TCS", "type": "regex", "clean": "INTERNSHIP STIPEND", "category": "Income"},
    {"pattern": r"SALARY", "type": "contains", "clean": "COMPANY SALARY", "category": "Income"},
    {"pattern": r"UPWORK", "type": "contains", "clean": "UPWORK FREELANCE", "category": "Income"},
    {"pattern": r"INTEREST|INT CR", "type": "regex", "clean": "BANK INTEREST", "category": "Income"},
]

class MerchantCleaner:
    """Cleans cryptic merchant descriptions and assigns categories using rule-based mapping."""
    
    def __init__(self, custom_rules: Optional[List[Dict[str, str]]] = None):
        self.rules = custom_rules if custom_rules is not None else DEFAULT_RULES

    def clean_and_categorize(self, raw_description: str) -> Dict[str, Any]:
        if not raw_description or not isinstance(raw_description, str):
            return {
                "clean_merchant": "UNKNOWN",
                "category": "Miscellaneous",
                "matched_rule": None
            }

        text = raw_description.strip()
        upper_text = text.upper()

        for rule in self.rules:
            pattern = rule.get("pattern", "")
            rule_type = rule.get("type", "contains")
            clean_name = rule.get("clean", pattern)
            category = rule.get("category", "Miscellaneous")

            matched = False
            if rule_type == "regex":
                try:
                    if re.search(pattern, upper_text, re.IGNORECASE):
                        matched = True
                except re.error:
                    if pattern.upper() in upper_text:
                        matched = True
            else:
                if pattern.upper() in upper_text:
                    matched = True

            if matched:
                return {
                    "clean_merchant": clean_name,
                    "category": category,
                    "matched_rule": rule
                }

        # Fallback heuristic: strip common transaction prefixes
        cleaned = re.sub(r'^(UPI[-/]|POS[-/]|ACH[-/]|NEFT[-/]|BILLPAY[-/])', '', text, flags=re.IGNORECASE)
        tokens = re.split(r'[-/*_ ]', cleaned)
        fallback_name = tokens[0].strip().upper() if tokens else "MISCELLANEOUS"

        return {
            "clean_merchant": fallback_name if fallback_name else "MISCELLANEOUS",
            "category": "Miscellaneous",
            "matched_rule": None
        }
