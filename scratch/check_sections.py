import re

file_path = "/Users/nitinagga/Documents/genmedia2.0/public/user_guide.html"
print(f"Checking section order in: {file_path}")

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find all sections and their headings
# We look for <section id="..." ...> and the first <h2> inside it
sections = re.findall(r'<section\s+id="([^"]+)"[^>]*>.*?<h2[^>]*>(.*?)</h2>', content, re.DOTALL)

print(f"Found {len(sections)} sections in order:")
for idx, (sec_id, heading) in enumerate(sections):
    # Clean up HTML tags in heading
    clean_heading = re.sub(r'<[^>]+>', ' ', heading).strip()
    # Replace multiple spaces with single space
    clean_heading = re.sub(r'\s+', ' ', clean_heading)
    print(f"  {idx + 1}. ID: {sec_id:<25} | Heading: {clean_heading}")
