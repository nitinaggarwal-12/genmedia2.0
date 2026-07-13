#!/bin/bash
# Maestro Full-Stack Prototype Startup Runner
# Launches the FastAPI backend and Node.js frontend in parallel, handles signals gracefully.

echo "============================================================="
echo "🚀 LAUNCHING MAESTRO AGENTIC MARKETEERING WORKBENCH"
echo "============================================================="

# Resolve absolute workspace directory
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$WORKSPACE_DIR"

# Ensure virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Error: Virtual environment .venv not found. Please run ./setup.sh first."
    exit 1
fi

# Load environment variables if .env exists
if [ -f ".env" ]; then
    export $(cat .env | xargs)
fi

# Function to clean up background processes on exit
cleanup() {
    echo -e "\n\nStopping Maestro servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Killing FastAPI Backend (PID: $BACKEND_PID)..."
        kill -9 $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Killing Node.js Frontend (PID: $FRONTEND_PID)..."
        kill -9 $FRONTEND_PID 2>/dev/null || true
    fi
    echo "Done. All ports cleared."
    exit 0
}

# Trap Ctrl+C (SIGINT) and terminal exit (SIGTERM)
trap cleanup INT TERM

# 1. Start FastAPI Backend & Static Server
echo "Starting FastAPI Server on http://localhost:3000..."
# We add Python path of backend to allow imports
export PYTHONPATH="$WORKSPACE_DIR/backend:$PYTHONPATH"
cd "$WORKSPACE_DIR/backend"
../.venv/bin/python3 main.py &
BACKEND_PID=$!
cd "$WORKSPACE_DIR"

# Wait a moment for the server to bind to port 3000
sleep 1.5

echo -e "\n============================================================="
echo "👉 Maestro is fully online!"
echo "👉 Access the UI: http://localhost:3000"
echo "👉 Press Ctrl+C to terminate the server safely."
echo "=============================================================\n"

# Keep script running and wait for background processes
wait $BACKEND_PID
