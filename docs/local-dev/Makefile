# ArdaLink local-dev — single entrypoint.
#
# Public surface: no secrets baked in. All credentials come from .env
# (gitignored) or environment variables.
#
# Quick start:
#   make setup     # one-time: copy .env.example to .env
#   make up        # boot the full stack (~90s)
#   make verify    # 30-point health check
#   make down      # tear down
#   make fresh     # full wipe + rebuild from scratch

SHELL := /bin/bash
PUBLIC_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
# This Makefile lives at ardalink-api/docs/local-dev/Makefile
# REPO_ROOT (the api repo) is two levels up; the JHUB workspace (with
# ardalink-engine and ardalink-web as siblings) is three levels up.
API_ROOT   := $(abspath $(PUBLIC_DIR)/../..)
REPO_ROOT  := $(abspath $(PUBLIC_DIR)/../../..)

.PHONY: setup up down verify fresh logs ps token brief help clean

help:
	@echo "ArdaLink local-dev targets:"
	@echo "  make setup   — copy .env.example to .env (one-time)"
	@echo "  make up      — boot the full stack (~90s)"
	@echo "  make down    — stop all services and remove containers"
	@echo "  make verify  — 30-point pre-flight health check"
	@echo "  make fresh   — full wipe (deletes demo data) + bring-up"
	@echo "  make clean   — stop + remove docker volumes (no data)"
	@echo "  make logs    — tail all service logs"
	@echo "  make ps      — list running services + containers"
	@echo "  make token T=bula-pesa  — print a demo JWT for tenant T"

setup:
	@if [ ! -f $(PUBLIC_DIR)/.env ]; then \
		cp $(PUBLIC_DIR)/.env.example $(PUBLIC_DIR)/.env && \
		echo "Created $(PUBLIC_DIR)/.env with dev-only defaults. Edit before non-dev use."; \
	else \
		echo "$(PUBLIC_DIR)/.env already exists — leaving it alone."; \
	fi

up:
	REPO_ROOT=$(REPO_ROOT) bash $(PUBLIC_DIR)/scripts/start-local.sh

down:
	bash $(PUBLIC_DIR)/scripts/stop-local.sh

verify:
	REPO_ROOT=$(REPO_ROOT) bash $(PUBLIC_DIR)/scripts/verify.sh

fresh: down
	docker volume rm ardalink-local-pgdata 2>/dev/null || true
	docker volume rm ardalink-local-redisdata 2>/dev/null || true
	@echo "Volumes removed. Bringing up fresh..."
	$(MAKE) up

clean: down
	docker volume rm ardalink-local-pgdata 2>/dev/null || true
	docker volume rm ardalink-local-redisdata 2>/dev/null || true
	@echo "Clean."

logs:
	@tail -f /tmp/ardalink-local/*.log

ps:
	@echo "--- Processes ---"
	@for f in /tmp/ardalink-local/*.pid; do \
		[ -f $$f ] && echo "  $$(basename $$f .pid): pid $$(cat $$f)"; \
	done
	@echo "--- Docker containers ---"
	@docker ps --filter name=ardalink-local --format "  {{.Names}}: {{.Status}}"

# Print a demo JWT for a tenant (default bula-pesa)
token:
	@if [ -z "$(T)" ]; then T=bula-pesa; fi; \
	. $(PUBLIC_DIR)/.env 2>/dev/null || true; \
	python3 -c "import base64,hmac,hashlib,json; s=b'$${JWT_SECRET:-local-dev-jwt-secret-at-least-32-chars-long-fixed}'; h=base64.urlsafe_b64encode(json.dumps({'alg':'HS256','typ':'JWT'}).encode()).rstrip(b'=').decode(); p=base64.urlsafe_b64encode(json.dumps({'sub':'demo','tenant_id':'$(T)','exp':9999999999}).encode()).rstrip(b'=').decode(); sig=base64.urlsafe_b64encode(hmac.new(s, f'{h}.{p}'.encode(),hashlib.sha256).digest()).rstrip(b'=').decode(); print(f'{h}.{p}.{sig}')"

# Print the Tenant Intelligence Brief for a tenant (default bula-pesa).
# This is the "wow moment" for the Tuesday demo. Requires the stack
# to be up (make up).
#
# Usage:
#   make brief T=bula-pesa           # English (default)
#   LANG=sw make brief T=bula-pesa   # Swahili
brief:
	@if [ -z "$(T)" ]; then T=bula-pesa; fi; \
	if echo "$${LANG:-en}" | grep -qi '^sw'; then LANG_VAL=sw; else LANG_VAL=en; fi; \
	TOKEN=$$($(MAKE) -s token T=$(T)); \
	echo "== $(T) — Intelligence Brief (lang=$$LANG_VAL) =="; \
	curl -s -H "Authorization: Bearer $$TOKEN" \
	  "http://localhost:3000/api/intelligence/brief?lang=$$LANG_VAL" \
	  | python3 /tmp/ardalink-local/print-brief.py