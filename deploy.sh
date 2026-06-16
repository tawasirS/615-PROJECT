#!/bin/bash

APP_NAME="test-deploy-web@56151"
API_NAME="test-deploy-api@56152"
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

run_step "git fetch"
#! run_step "git reset --hard origin/main"
run_step "cd web"
run_step "npm ci"
run_step "npm run build"
run_step "cd ../"
run_step "pm2 reload $APP_NAME"
run_step "pm2 reload $API_NAME"

echo ""
echo "======================================"
echo "Deploy success at: $(date)"
echo "Log saved to: $LOG_FILE"
echo "======================================"
