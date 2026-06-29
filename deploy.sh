#!/usr/bin/env bash
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
SSH_USER="root"
SSH_HOST="109.73.196.156"
REMOTE_DIR="/srv/front"
BUILD_DIR="dist/bd-front-angular/browser"
# ──────────────────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

step()  { echo -e "\n${CYAN}▶ $*${RESET}"; }
ok()    { echo -e "${GREEN}✔ $*${RESET}"; }
fail()  { echo -e "${RED}✖ $*${RESET}" >&2; exit 1; }
warn()  { echo -e "${YELLOW}⚠ $*${RESET}"; }

# ── Build ─────────────────────────────────────────────────────────────────────
step "Building..."

npm run build || fail "Build failed"

[[ -d "$BUILD_DIR" ]] || fail "Build output not found: $BUILD_DIR"
ok "Build complete → $BUILD_DIR"

# ── Deploy ────────────────────────────────────────────────────────────────────
step "Deploying to ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR} ..."

step "Cleaning ${REMOTE_DIR} on server..."
ssh -o StrictHostKeyChecking=no "${SSH_USER}@${SSH_HOST}" \
  "rm -rf ${REMOTE_DIR:?}/* && echo 'cleaned'"
ok "Remote directory cleared"

rsync -az --progress \
  -e "ssh -o StrictHostKeyChecking=no" \
  "${BUILD_DIR}/" \
  "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/"

ok "Files synced"

step "Restarting nginx..."

ssh -o StrictHostKeyChecking=no "${SSH_USER}@${SSH_HOST}" \
  "systemctl restart nginx && systemctl is-active --quiet nginx"

ok "nginx restarted"
echo -e "\n${GREEN}Deploy complete ✔${RESET}\n"
