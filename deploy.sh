#!/usr/bin/env bash

set -Eeuo pipefail

# ==================================================
# Project config
# ==================================================
APP_NAME="615-WEB@56151"
API_NAME="615-API@56152"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

PROJECT_DIR="$SCRIPT_DIR"
WEB_DIR="$PROJECT_DIR/WEB"
API_DIR="$PROJECT_DIR/API"
VENV_DIR="$API_DIR/venv"

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
# WEB deploy
# ==================================================
run_step_in_dir \
    "Install WEB dependencies" \
    "$WEB_DIR" \
    npm ci


run_step_in_dir \
    "Build WEB" \
    "$WEB_DIR" \
    npm run build


# ==================================================
# API deploy
# ==================================================
if [[ ! -x "$VENV_DIR/bin/python" ]]; then
    run_step "Create Python virtual environment" \
        python3 -m venv "$VENV_DIR"
else
    echo "Python venv already exists: $VENV_DIR"
fi


run_step \
    "Upgrade pip" \
    "$VENV_DIR/bin/python" -m pip install --upgrade pip


run_step \
    "Install API dependencies" \
    "$VENV_DIR/bin/python" -m pip install -r "$API_DIR/requirements.txt"


run_step \
    "Check Python syntax" \
    "$VENV_DIR/bin/python" -m compileall -q "$API_DIR"


# ==================================================
# Database migration
# IMPORTANT:
# Server runs upgrade only.
# Do NOT run revision --autogenerate on production.
# ==================================================
run_step_in_dir \
    "Apply Alembic database migration" \
    "$API_DIR" \
    "$VENV_DIR/bin/alembic" upgrade head


# ==================================================
# Reload PM2
# ==================================================
run_step \
    "Reload WEB PM2 process" \
    pm2 reload "$APP_NAME" --update-env


run_step \
    "Reload API PM2 process" \
    pm2 reload "$API_NAME" --update-env


run_step "Show PM2 status" pm2 status


# ==================================================
# Health checks
# เปลี่ยน path/port ได้ตาม config PM2 จริง
# ==================================================
run_step \
    "Check WEB health" \
    wait_for_http "WEB" "http://127.0.0.1:56151/"


run_step \
    "Check API health" \
    wait_for_http "API" "http://127.0.0.1:56152/"


echo ""
echo "======================================"
echo "Deploy success at: $(date)"
echo "Log saved to: $LOG_FILE"
echo "======================================"