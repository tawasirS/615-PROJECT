#!/usr/bin/env bash

set -Eeuo pipefail

# ==================================================
# 615 Project — Docker Deploy Script
# รองรับ Raspberry Pi ARM64
# ==================================================

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

PROJECT_DIR="$SCRIPT_DIR"

LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/deploy_$(date '+%Y-%m-%d_%H-%M-%S').log"

# ==================================================
# Logging
# ==================================================
mkdir -p "$LOG_DIR"

exec > >(tee -a "$LOG_FILE") 2>&1

trap 'EXIT_CODE=$?; echo ""; echo "======================================"; echo "Deploy FAILED at: $(date)"; echo "Exit code: $EXIT_CODE"; echo "Log saved to: $LOG_FILE"; echo "======================================"; exit $EXIT_CODE' ERR


# ==================================================
# Helper functions
# ==================================================
run_step() {
    local title="$1"
    shift

    echo ""
    echo "--------------------------------------"
    echo "Running: $title"
    echo "Command: $*"
    echo "--------------------------------------"

    "$@"

    echo "Success: $title"
}


run_step_in_dir() {
    local title="$1"
    local target_dir="$2"
    shift 2

    echo ""
    echo "--------------------------------------"
    echo "Running: $title"
    echo "Directory: $target_dir"
    echo "Command: $*"
    echo "--------------------------------------"

    (
        cd "$target_dir"
        "$@"
    )

    echo "Success: $title"
}


wait_for_http() {
    local service_name="$1"
    local url="$2"
    local max_attempts=15

    for ((attempt = 1; attempt <= max_attempts; attempt++)); do
        if curl --fail --silent --show-error "$url" > /dev/null; then
            echo "$service_name is healthy: $url"
            return 0
        fi

        echo "Waiting for $service_name... ($attempt/$max_attempts)"
        sleep 2
    done

    echo "$service_name health check failed: $url"
    return 1
}


# ==================================================
# Start
# ==================================================
echo "======================================"
echo "Deploy started at: $(date)"
echo "Project path: $PROJECT_DIR"
echo "Log file: $LOG_FILE"
echo "======================================"


# ==================================================
# Check folders
# ==================================================
[[ -d "$WEB_DIR" ]] || { echo "WEB folder not found: $WEB_DIR"; exit 1; }
[[ -d "$API_DIR" ]] || { echo "API folder not found: $API_DIR"; exit 1; }


# ==================================================
# Pull source code
# ==================================================
run_step "Pull latest code from main" \
    git -C "$PROJECT_DIR" pull --ff-only origin main


# ==================================================
# Prepare .env
# ==================================================
if [[ ! -f "$PROJECT_DIR/.env" ]]; then
    run_step "Create .env from .env.example" \
        cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"

    echo ""
    echo "⚠   Please edit .env and set POSTGRES_PASSWORD before continuing."
    echo "    Then re-run this script."
    exit 1
fi


# ==================================================
# Docker Compose build & start
# ==================================================
run_step_in_dir \
    "Docker Compose build (ARM64)" \
    "$PROJECT_DIR" \
    docker compose build


# ==================================================
# Database migration (run once via migration service)
# ==================================================
run_step_in_dir \
    "Run Alembic migration" \
    "$PROJECT_DIR" \
    docker compose run --rm migration


# ==================================================
# Start all services
# ==================================================
run_step_in_dir \
    "Start all services with Docker Compose" \
    "$PROJECT_DIR" \
    docker compose up -d


# ==================================================
# Health checks
# ==================================================
echo ""
echo "Waiting for services to be ready..."
sleep 5

run_step \
    "Check Nginx (port 80)" \
    wait_for_http "Nginx" "http://127.0.0.1/"

run_step \
    "Check API health" \
    wait_for_http "API" "http://127.0.0.1/api/"


# ==================================================
# Show status
# ==================================================
run_step_in_dir \
    "Docker Compose status" \
    "$PROJECT_DIR" \
    docker compose ps


echo ""
echo "======================================"
echo "Deploy success at: $(date)"
echo "Log saved to: $LOG_FILE"
echo "======================================"