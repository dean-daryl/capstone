#!/usr/bin/env bash
# ============================================================
# SomaTek Production Deployment Script
# Usage: ./scripts/deploy.sh
# ============================================================
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
ENV_FILE="$PROJECT_DIR/.env.production"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# -----------------------------------------------------------
# Prerequisites
# -----------------------------------------------------------
info "Checking prerequisites..."

command -v docker >/dev/null 2>&1 || error "Docker is not installed"
docker compose version >/dev/null 2>&1 || error "Docker Compose V2 is not available"

[ -f "$COMPOSE_FILE" ] || error "Compose file not found: $COMPOSE_FILE"
[ -f "$ENV_FILE" ] || error "Environment file not found: $ENV_FILE"

# Check that placeholder passwords have been changed
if grep -q "CHANGE_ME" "$ENV_FILE"; then
    error "Placeholder passwords found in $ENV_FILE — replace all CHANGE_ME values before deploying"
fi

# Check domain is set
DOMAIN=$(grep '^DOMAIN=' "$ENV_FILE" | cut -d= -f2)
if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "yourdomain.com" ]; then
    error "Set your real domain in $ENV_FILE (DOMAIN=)"
fi

# Check SSL certificates exist
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    warn "SSL certificates not found at /etc/letsencrypt/live/$DOMAIN"
    warn "Run: sudo certbot certonly --standalone -d $DOMAIN"
    error "Cannot proceed without SSL certificates"
fi

# Check nginx config exists
[ -f "$PROJECT_DIR/nginx/nginx.conf" ] || error "Nginx config not found: $PROJECT_DIR/nginx/nginx.conf"

# Check ML model directories
[ -d "$PROJECT_DIR/models/textCat" ] || warn "textCat model not found at models/textCat — textcat service will fail"
[ -d "$PROJECT_DIR/models/nllb-kin-ct2" ] || warn "NLLB model not found at models/nllb-kin-ct2 — nllb-translate service will fail"

# -----------------------------------------------------------
# Pull latest code (if in a git repo)
# -----------------------------------------------------------
if [ -d "$PROJECT_DIR/.git" ]; then
    info "Pulling latest code..."
    cd "$PROJECT_DIR"
    git pull --ff-only || warn "Git pull failed — deploying current local code"
fi

# -----------------------------------------------------------
# Deploy
# -----------------------------------------------------------
info "Building and starting services..."
cd "$PROJECT_DIR"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

# -----------------------------------------------------------
# Health check
# -----------------------------------------------------------
info "Waiting for services to start..."
sleep 15

info "Container status:"
docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}"

# Check key services are healthy
UNHEALTHY=$(docker compose -f "$COMPOSE_FILE" ps --format json | grep -c '"Health":"unhealthy"' || true)
if [ "$UNHEALTHY" -gt 0 ]; then
    warn "$UNHEALTHY service(s) are unhealthy — check logs with: docker compose -f $COMPOSE_FILE logs <service>"
else
    info "All services are running"
fi

echo ""
info "Deployment complete!"
info "Site: https://$DOMAIN"
info "Check logs: docker compose -f $COMPOSE_FILE logs -f"
