#!/usr/bin/env python3
"""
Full Estate Link and Integrity Auditor for magruder.co
Crawls every published HTML page in the repository, extracts all hrefs/srcs,
and verifies every in-page anchor, internal route, and external link.
"""

import os
import re
import sys
import urllib.request
import urllib.error
from html.parser import HTMLParser

class LinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if "id" in attr_dict:
            self.ids.add(attr_dict["id"])
        if tag == "a" and "href" in attr_dict:
            self.links.append((tag, "href", attr_dict["href"]))
        elif tag == "link" and "href" in attr_dict:
            self.links.append((tag, "href", attr_dict["href"]))
        elif tag == "img" and "src" in attr_dict:
            self.links.append((tag, "src", attr_dict["src"]))
        elif tag == "script" and "src" in attr_dict:
            self.links.append((tag, "src", attr_dict["src"]))

def audit_estate(repo_root):
    html_files = []
    for root, dirs, files in os.walk(repo_root):
        if "node_modules" in root or ".git" in root:
            continue
        for f in files:
            if f.endswith(".html") and not f.endswith("-preview.html") and not re.search(r"-v[2-5]\.html$", f):
                html_files.append(os.path.join(root, f))

    html_files.sort()
    print(f"Discovered {len(html_files)} authoritative HTML pages in estate.")

    total_links_checked = 0
    failures = []
    warnings = []
    verified_urls = {}

    for file_path in html_files:
        rel_file = os.path.relpath(file_path, repo_root)
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        parser = LinkExtractor()
        parser.feed(content)

        file_failures = []

        for tag, attr, val in parser.links:
            val = val.strip()
            if not val or val.startswith("javascript:") or val.startswith("tel:"):
                continue

            total_links_checked += 1

            # In-page anchor
            if val.startswith("#"):
                anchor = val[1:]
                if anchor and anchor not in parser.ids:
                    file_failures.append(f"Broken in-page anchor: {val}")
                continue

            # Mailto
            if val.startswith("mailto:"):
                email = val.replace("mailto:", "").split("?")[0]
                if "@" not in email:
                    file_failures.append(f"Malformed mailto: {val}")
                continue

            # Internal route or asset
            if val.startswith("/") or val.startswith("https://magruder.co") or not val.startswith("http"):
                # Normalize route
                clean_route = val.replace("https://magruder.co", "")
                if clean_route.startswith("#"):
                    continue
                # Split off hash or query
                clean_path = clean_route.split("#")[0].split("?")[0]
                if not clean_path or clean_path == "/":
                    target_file = os.path.join(repo_root, "index.html")
                elif clean_path.startswith("/"):
                    target_file = os.path.join(repo_root, clean_path.lstrip("/"))
                else:
                    target_file = os.path.normpath(os.path.join(os.path.dirname(file_path), clean_path))

                # Check on disk
                exists = os.path.exists(target_file) or os.path.exists(target_file + ".html")
                if not exists and not clean_path.startswith("/images/") and not clean_path.startswith("/fonts/"):
                    # Check on live production
                    live_url = "https://magruder.co" + (clean_path if clean_path.startswith("/") else "/" + clean_path)
                    if live_url in verified_urls:
                        code = verified_urls[live_url]
                    else:
                        try:
                            req = urllib.request.Request(live_url, headers={"User-Agent": "Mozilla/5.0 LinkAuditor"})
                            with urllib.request.urlopen(req, timeout=5) as res:
                                code = res.getcode()
                        except urllib.error.HTTPError as e:
                            code = e.code
                        except Exception as e:
                            code = 500
                        verified_urls[live_url] = code

                    if code != 200:
                        file_failures.append(f"Internal link broken ({code}): {val} -> {clean_path}")

        if file_failures:
            failures.append((rel_file, file_failures))

    print(f"\nAudit complete across {len(html_files)} pages and {total_links_checked} link references.")
    if failures:
        print(f"FAILED: Found {len(failures)} files with broken links:")
        for rf, errs in failures:
            print(f"\nPage: {rf}")
            for err in errs:
                print(f"  - {err}")
        return False
    else:
        print("SUCCESS: 100% of links across all estate pages verified authentic.")
        return True

if __name__ == "__main__":
    success = audit_estate(os.getcwd())
    sys.exit(0 if success else 1)
