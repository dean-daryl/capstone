#!/usr/bin/env python3
"""Analyze PYZ-00.toc to find largest packages."""

import re
from collections import defaultdict

with open('build/somatek-cli/PYZ-00.toc', 'r') as f:
    content = f.read()

# Extract package names from lines like: ('IPython.core',
packages = defaultdict(int)
for match in re.findall(r"\('([^']+)',\s*'/", content):
    top_level = match.split('.')[0]
    packages[top_level] += 1

# Sort by count (proxy for size)
sorted_packages = sorted(packages.items(), key=lambda x: x[1], reverse=True)

print("Top 30 packages by module count (proxy for size):\n")
for pkg, count in sorted_packages[:30]:
    print(f"{pkg:40s} {count:5d} modules")

print(f"\nTotal packages: {len(packages)}")
print(f"Total modules: {sum(packages.values())}")
