#!/bin/sh

# Build the image
docker build -t livelaunch .

# Stop the compose
docker compose down

# Start the compose
docker compose up -d
