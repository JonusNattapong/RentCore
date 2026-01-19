FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install PaddlePaddle 2.6.2 (Stable) and PaddleOCR 3.3.2 (Latest)
RUN pip install --no-cache-dir --default-timeout=300 \
    paddlepaddle==2.6.2 \
    paddleocr==3.3.2 \
    fastapi \
    uvicorn \
    python-multipart \
    pillow

# Copy API server
COPY server.py /app/server.py

# Skip model source check to speed up
ENV DISABLE_MODEL_SOURCE_CHECK=True

EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8082/health || exit 1

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8082"]
