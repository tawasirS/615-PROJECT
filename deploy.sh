#!/bin/bash

APP_NAME="615-WEB@56151"
API_NAME="615-API@56152"
LOG_DIR="../logs"
LOG_FILE="$LOG_DIR/deploy_$(date '+%Y-%m-%d_%H-%M-%S').log"

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

run_step() {
  echo ""
  echo "--------------------------------------"
  echo "Running: $1"
  echo "--------------------------------------"

  eval "$1"

  echo "Success: $1"
}

echo "======================================"
echo "Deploy started at: $(date)"
echo "Current path: $(pwd)"
echo "======================================"

set -e

#! FOR WEB
run_step "git pull origin main"
run_step "cd WEB"
run_step "npm ci"
run_step "npm run build"
run_step "cd ../"
run_step "pm2 reload $APP_NAME"

#! FOR API
run_step "cd API"
run_step "python3 -m venv venv"
run_step "source venv/bin/activate"
run_step "venv/bin/pip install --upgrade pip"
run_step "venv/bin/pip install -r requirements.txt"
run_step "cd ../"
run_step "pm2 reload $API_NAME"

echo ""
echo "======================================"
echo "Deploy success at: $(date)"
echo "Log saved to: $LOG_FILE"
echo "======================================"
