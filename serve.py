#!/usr/bin/env python3
"""
Personal Finance Analytics and Expense Management System
Local Development Server Runner
Authors: Harshit Namdeo (BTCB25O1059), Aryan Gupta (BTCB25O1027)
Institution: Madhav Institute of Technology & Science (MITS), Gwalior
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

def run():
    os.chdir(DIRECTORY)
    port = PORT
    while port < 3050:
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                url = f"http://localhost:{port}/index.html"
                print("=" * 70)
                print(" LEDGER - PERSONAL FINANCE ANALYTICS & EXPENSE MANAGEMENT SYSTEM")
                print(" Developed by: Harshit Namdeo & Aryan Gupta")
                print("=" * 70)
                print(f"\n🚀 Server running at: {url}")
                print("💡 Press Ctrl+C in terminal to stop server.\n")
                webbrowser.open(url)
                httpd.serve_forever()
        except OSError:
            port += 1

if __name__ == "__main__":
    run()
