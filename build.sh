#!/bin/bash

# Build script for Docker

# Set image name
IMAGE_NAME="nextjs-dashboard-template"
TAG="latest"

echo "Building Docker image: $IMAGE_NAME:$TAG"

# Build the Docker image
docker build -t $IMAGE_NAME:$TAG .

echo "Build completed!"
echo "Run with: docker-compose up -d"
