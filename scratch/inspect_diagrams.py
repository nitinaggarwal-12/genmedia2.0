import html
import json
import re
import xml.etree.ElementTree as ET
import urllib.parse

file_path = "/Users/nitinagga/Documents/genmedia2.0/public/user_guide.html"
print(f"Inspecting diagrams in: {file_path}")

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find all data-mxgraph attributes
matches = re.findall(r'data-mxgraph="([^"]+)"', content)
print(f"Found {len(matches)} mxgraph diagram definitions.\\n")

for idx, match in enumerate(matches):
    try:
        # Unescape HTML entities
        unescaped = html.unescape(match)
        # Parse JSON
        data = json.loads(unescaped)
        xml_content = data.get("xml", "")
        
        print(f"--- DIAGRAM {idx + 1} ---")
        # Extract diagram ID and name from the XML
        diag_match = re.search(r'<diagram\s+id="([^"]+)"\s+name="([^"]+)"', xml_content)
        if diag_match:
            print(f"  Diagram ID:   {diag_match.group(1)}")
            print(f"  Diagram Name: {diag_match.group(2)}")
        else:
            print("  No <diagram> tag found or could not parse ID/Name.")
            
        # Let's count how many mxCell elements are there and print a few node values
        # The XML inside mxfile is often compressed or URL-encoded. Let's see if it's plain text.
        cells = re.findall(r'value="([^"]+)"', xml_content)
        print(f"  Total Nodes/Edges: {len(cells)}")
        print("  Sample Node Values:")
        for cell in cells[:5]:
            # Clean up HTML tags in values for printing
            clean_val = re.sub(r'<[^>]+>', ' ', html.unescape(cell))
            print(f"    - {clean_val.strip()}")
        print()
    except Exception as e:
        print(f"  Error parsing diagram {idx + 1}: {e}\\n")
