FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/app/cache

# Install Python and dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-venv \
    python3-pip \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install Python packages
RUN pip3 install --upgrade pip && \
    pip3 install torch==2.6.0 torchvision==0.21.0 --index-url https://download.pytorch.org/whl/cpu && \
    pip3 install transformers==4.46.3 tokenizers==0.20.3 einops addict easydict && \
    pip3 install fastapi uvicorn python-multipart pillow

# Copy the API server code
COPY server.py /app/server.py

# Pre-download the model (optional - can be done at runtime)
# RUN python3 -c "from transformers import AutoModel, AutoTokenizer; AutoTokenizer.from_pretrained('deepseek-ai/DeepSeek-OCR', trust_remote_code=True); AutoModel.from_pretrained('deepseek-ai/DeepSeek-OCR', trust_remote_code=True)"

# Expose port
EXPOSE 8080

# Run the API server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
