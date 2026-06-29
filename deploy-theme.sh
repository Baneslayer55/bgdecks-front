#!/usr/bin/env bash
set -euo pipefail

SSH_USER="root"
SSH_HOST="109.73.196.156"
KEYCLOAK_THEMES_DIR="/srv/kc/keycloak-26.6.3/themes"
THEME_NAME="bgdecks"
LOCAL_THEME="keycloak-theme/${THEME_NAME}"

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; RESET='\033[0m'
step() { echo -e "\n${CYAN}▶ $*${RESET}"; }
ok()   { echo -e "${GREEN}✔ $*${RESET}"; }
fail() { echo -e "${RED}✖ $*${RESET}" >&2; exit 1; }

[[ -d "$LOCAL_THEME" ]] || fail "Theme directory not found: $LOCAL_THEME"

step "Uploading theme '${THEME_NAME}' to ${SSH_HOST}:${KEYCLOAK_THEMES_DIR}/${THEME_NAME} ..."
rsync -az --delete --progress \
  -e "ssh -o StrictHostKeyChecking=no" \
  "${LOCAL_THEME}/" \
  "${SSH_USER}@${SSH_HOST}:${KEYCLOAK_THEMES_DIR}/${THEME_NAME}/"
ok "Theme uploaded"

step "Restarting Keycloak..."
ssh -o StrictHostKeyChecking=no "${SSH_USER}@${SSH_HOST}" \
  "systemctl restart keycloak && systemctl is-active --quiet keycloak"
ok "Keycloak restarted"

echo -e "\n${GREEN}Theme deploy complete ✔${RESET}"
echo -e "Activate in Keycloak Admin: Realm → Realm settings → Themes → Login theme → ${THEME_NAME}\n"
