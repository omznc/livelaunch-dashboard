#!/bin/sh

# Build the image
DOCKER_BUILDKIT=1 docker build -t livelaunch .

# Stop the compose
docker compose down

# Start the compose
docker compose up -d
