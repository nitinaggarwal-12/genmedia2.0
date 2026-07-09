import os
import sys
from unittest.mock import MagicMock

# -------------------------------------------------------------
# MOCK LLM AGENTS & VERTEX AI MODULES BEFORE IMPORTING MAIN.PY
# -------------------------------------------------------------
mock_vertexai = MagicMock()
sys.modules["vertexai"] = mock_vertexai
sys.modules["vertexai.agent_engines"] = mock_vertexai.agent_engines
sys.modules["google"] = MagicMock()
sys.modules["google.adk"] = MagicMock()
sys.modules["google.adk.agents"] = MagicMock()
sys.modules["pptx"] = MagicMock()

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from fastapi.testclient import TestClient
from main import app

def test_heatmap():
    client = TestClient(app)
    response = client.get("/api/strategic-heatmap")
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 200, "API returned non-200 status code"
    
    result = response.json()
    assert result.get("success") is True, "API returned success=False"
    assert "columns" in result, "Columns missing from API response"
    assert "matrix" in result, "Matrix missing from API response"
    
    print("\n--- Columns ---")
    for col in result["columns"]:
        print(f"Col ID: {col['id']}, Name: {col['name']}, Compound: {col['compound']}")
        
    print("\n--- Matrix Rows (First 3) ---")
    for row in result["matrix"][:3]:
        print(f"\nIndication: {row['indication']}")
        for col_id, cell in row["cells"].items():
            print(f"  Brand: {col_id} -> Value: {cell['value']}, Class: {cell['class']}, Count: {cell['count']} runs")
            
    print("\n✅ Heatmap API validation successful!")

if __name__ == "__main__":
    test_heatmap()
