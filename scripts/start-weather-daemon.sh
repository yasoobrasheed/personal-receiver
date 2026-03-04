#!/bin/bash
# Start the weather proxy server as a background daemon
# Usage: ./scripts/start-weather-daemon.sh

cd "$(dirname "$0")/.."

# Kill any existing instance
pkill -f "weather-proxy-server" 2>/dev/null

# Start the server in background with logging
nohup npx tsx scripts/weather-proxy-server.ts >> logs/weather-proxy.log 2>&1 &
echo "Weather proxy started (PID: $!)"
echo "Logs: logs/weather-proxy.log"

# Optionally start cloudflared tunnel
# nohup cloudflared tunnel --url http://localhost:3001 >> logs/tunnel.log 2>&1 &
