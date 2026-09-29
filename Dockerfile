FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/backend
ENV PORT=8080

RUN pip install --no-cache-dir \
    "fastapi>=0.110.0" \
    "uvicorn>=0.28.0" \
    "python-multipart>=0.0.9" \
    "pydantic>=2.6.0" \
    "python-dotenv>=1.0.0" \
    "websockets>=12.0" \
    "Pillow>=10.0.0" \
    "python-pptx>=0.6.23" \
    "pypdf>=4.0.0" \
    "google-genai>=1.0.0" \
    "google-adk>=1.0.0" \
    "google-cloud-aiplatform>=1.70.0" \
    "requests>=2.31.0"

COPY backend ./backend
COPY frontend ./frontend
COPY config ./config
COPY datasets ./datasets
COPY demo_files ./demo_files
COPY files ./files
COPY public ./public
COPY Protocol-Alpha_Clinical_Launch_Briefing.pptx ./Protocol-Alpha_Clinical_Launch_Briefing.pptx

EXPOSE 8080

CMD ["sh", "-c", "PYTHONPATH=/app/backend uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
