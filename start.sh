#!/bin/sh

# Build the image
DOCKER_BUILDKIT=1 docker build -t livelaunch --build-arg NEXT_PUBLIC_DISCORD_CLIENT_ID="$NEXT_PUBLIC_DISCORD_CLIENT_ID" .

# Stop the compose
docker compose down

# Start the compose
docker compose up -d
