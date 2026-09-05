FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (needed for psycopg2, opencv)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set PYTHONPATH
ENV PYTHONPATH=/app

# Command to run API
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
