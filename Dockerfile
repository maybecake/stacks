FROM python:3.12-slim

# Install essential tools and dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    protobuf-compiler \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (this layer will be cached)
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /tmp/requirements.txt

# Create working directory
WORKDIR /app

# Copy only the entrypoint script first (this layer will be cached)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set environment variables
ENV PYTHONPATH="/app:${PYTHONPATH}"

# Expose port for backend
EXPOSE 8000

# Copy the rest of the application code last
# This layer will change most frequently, so it's at the end
COPY . .

ENTRYPOINT ["/entrypoint.sh"]
CMD ["bash"]


