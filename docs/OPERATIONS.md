# Operations Manual
## OpenCode Development Platform

**Version:** 1.0  
**Date:** 2024-10-25  
**Status:** Draft  
**Related:** [PRD.md](./PRD.md), [TECHNICAL_SPECIFICATIONS.md](./TECHNICAL_SPECIFICATIONS.md), [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

---

## Table of Contents

1. [Deployment Guide](#deployment-guide)
2. [Monitoring & Alerts](#monitoring--alerts)
3. [Backup & Recovery](#backup--recovery)
4. [Maintenance Procedures](#maintenance-procedures)
5. [Incident Response](#incident-response)
6. [Scaling Strategy](#scaling-strategy)
7. [Security Operations](#security-operations)
8. [Support Runbook](#support-runbook)

---

## Deployment Guide

### Prerequisites

```bash
# Required software
- Docker 24.0+
- Docker Compose 2.0+
- Git
- Bun 1.0+ (optional, for local dev)
- 4GB RAM minimum
- 10GB disk space
```

### Initial Setup

#### 1. Clone Repository

```bash
git clone https://github.com/opencode/platform.git
cd platform
```

#### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Required Environment Variables:**

```bash
# Core
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://opencode.example.com

# AI Configuration
OPENROUTER_API_KEY=sk-or-...
DEFAULT_AI_MODEL=openai/gpt-4o-mini
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=4000

# Database
MEMGRAPH_URI=bolt://memgraph:7687
MEMGRAPH_USERNAME=
MEMGRAPH_PASSWORD=
SQLITE_PATH=/data/taskmaster.db

# Security
ENCRYPTION_KEY=<generate-with-openssl-rand>
JWT_SECRET=<generate-with-openssl-rand>
ALLOWED_ORIGINS=https://opencode.example.com

# Features
ENABLE_CACHING=true
CACHE_TTL=3600
MAX_PROJECT_SIZE_MB=500
MAX_FILE_SIZE_MB=10

# Monitoring (Optional)
SENTRY_DSN=
LOG_LEVEL=info
METRICS_ENABLED=true
```

#### 3. Generate Secrets

```bash
# Generate encryption key (32 bytes)
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 64
```

#### 4. Deploy with Docker Compose

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Verify services
docker-compose ps
```

Expected output:

```
NAME                  STATUS              PORTS
opencode-backend      Up 10 seconds       0.0.0.0:3000->3000/tcp
opencode-frontend     Up 10 seconds       0.0.0.0:5173->5173/tcp
opencode-memgraph     Up 10 seconds       0.0.0.0:7687->7687/tcp
```

#### 5. Health Check

```bash
# Check backend
curl http://localhost:3000/api/health

# Expected response
{"status":"ok","timestamp":"2024-10-25T10:00:00Z"}

# Check Memgraph
docker exec opencode-memgraph mgconsole
```

### Production Deployment

#### Architecture

```
Internet
    |
[Load Balancer / Reverse Proxy]
    |
    ├─> [Frontend Container] (Nginx/Caddy)
    |
    ├─> [Backend Container] (Bun)
    |       |
    |       ├─> [SQLite Volume]
    |       └─> [Project Files Volume]
    |
    └─> [Memgraph Container]
            |
            └─> [Graph Data Volume]
```

#### SSL/TLS Setup (Caddy)

```caddyfile
# Caddyfile
opencode.example.com {
    reverse_proxy frontend:80
    reverse_proxy /api/* backend:3000
    reverse_proxy /ws/* backend:3000
    
    encode gzip
    
    log {
        output file /var/log/caddy/access.log
    }
}
```

#### Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  caddy:
    image: caddy:2.7-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
      - caddy-config:/config
    restart: unless-stopped

  memgraph:
    image: memgraph/memgraph:2.12
    volumes:
      - memgraph-data:/var/lib/memgraph
      - memgraph-log:/var/log/memgraph
    environment:
      - MEMGRAPH_LOG_LEVEL=WARNING
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "7687"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - MEMGRAPH_URI=bolt://memgraph:7687
    env_file:
      - .env.production
    volumes:
      - project-data:/app/projects
      - sqlite-data:/app/data
    depends_on:
      memgraph:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: unless-stopped

volumes:
  caddy-data:
  caddy-config:
  memgraph-data:
  memgraph-log:
  project-data:
  sqlite-data:
```

#### Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Deploying OpenCode Platform..."

# Pull latest changes
git pull origin main

# Backup data
./scripts/backup.sh

# Build images
docker-compose -f docker-compose.prod.yml build

# Stop old containers
docker-compose -f docker-compose.prod.yml down

# Start new containers
docker-compose -f docker-compose.prod.yml up -d

# Wait for health checks
echo "⏳ Waiting for services..."
sleep 10

# Verify deployment
if curl -f http://localhost:3000/api/health; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed! Rolling back..."
    docker-compose -f docker-compose.prod.yml down
    ./scripts/restore.sh
    exit 1
fi

# Run smoke tests
./scripts/smoke-test.sh

echo "🎉 Deployment complete!"
```

---

## Monitoring & Alerts

### Health Endpoints

```typescript
// GET /api/health
{
  "status": "ok",
  "timestamp": "2024-10-25T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "memgraph": "connected",
    "filesystem": "ok",
    "ai": "ok"
  },
  "metrics": {
    "uptime": 86400,
    "memory": { "used": 512, "total": 2048 },
    "cpu": { "usage": 15 }
  }
}

// GET /api/health/deep
// More detailed health check (slower)
{
  "status": "ok",
  "checks": {
    "memgraph": {
      "status": "ok",
      "latency": 5,
      "nodeCount": 1523
    },
    "sqlite": {
      "status": "ok",
      "size": 1048576,
      "integrityCheck": "ok"
    },
    "ai": {
      "status": "ok",
      "lastRequest": "2024-10-25T09:59:00Z",
      "errorRate": 0.02
    }
  }
}
```

### Metrics Collection

```typescript
// Prometheus metrics endpoint
// GET /metrics

# HELP opencode_http_requests_total Total HTTP requests
# TYPE opencode_http_requests_total counter
opencode_http_requests_total{method="GET",path="/api/files",status="200"} 1523

# HELP opencode_ai_requests_total Total AI requests
# TYPE opencode_ai_requests_total counter
opencode_ai_requests_total{agent="general",status="success"} 452

# HELP opencode_graph_query_duration_seconds Graph query duration
# TYPE opencode_graph_query_duration_seconds histogram
opencode_graph_query_duration_seconds_bucket{le="0.1"} 150
opencode_graph_query_duration_seconds_bucket{le="0.5"} 280
opencode_graph_query_duration_seconds_bucket{le="1.0"} 295
```

### Logging Strategy

```typescript
// Log levels
const LOG_LEVELS = {
  ERROR: 'error',    // Critical issues requiring immediate attention
  WARN: 'warn',      // Warning conditions
  INFO: 'info',      // Informational messages
  DEBUG: 'debug',    // Debug-level messages
}

// Log format (JSON)
{
  "level": "info",
  "timestamp": "2024-10-25T10:00:00.123Z",
  "module": "FileService",
  "action": "read",
  "path": "/src/App.tsx",
  "duration": 23,
  "user": "user-123",
  "requestId": "req-abc123"
}

// Error log format
{
  "level": "error",
  "timestamp": "2024-10-25T10:00:00.123Z",
  "module": "AIService",
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "OpenRouter API timeout",
    "stack": "...",
    "context": {
      "model": "gpt-4o-mini",
      "tokens": 1500
    }
  },
  "requestId": "req-abc124"
}
```

### Alert Rules

#### Critical Alerts (Page On-Call)

```yaml
alerts:
  - name: ServiceDown
    condition: up == 0
    duration: 2m
    severity: critical
    message: "OpenCode service is down"
    
  - name: HighErrorRate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    message: "Error rate above 5%"
    
  - name: DatabaseConnectionFailed
    condition: memgraph_connected == 0
    duration: 1m
    severity: critical
    message: "Memgraph connection failed"
    
  - name: DiskSpaceCritical
    condition: disk_usage > 90%
    duration: 5m
    severity: critical
    message: "Disk usage above 90%"
```

#### Warning Alerts (Notify Team)

```yaml
  - name: HighLatency
    condition: p95_latency > 2000ms
    duration: 10m
    severity: warning
    message: "High API latency detected"
    
  - name: MemoryHigh
    condition: memory_usage > 80%
    duration: 10m
    severity: warning
    message: "Memory usage above 80%"
    
  - name: AICostHigh
    condition: ai_cost_per_hour > 10
    duration: 1h
    severity: warning
    message: "AI costs exceeding budget"
```

### Monitoring Dashboard

**Grafana Dashboard Panels:**

1. **System Health**
   - Service uptime
   - Error rate
   - Request rate

2. **Performance**
   - API latency (p50, p95, p99)
   - File operation time
   - Graph query time

3. **Resources**
   - CPU usage
   - Memory usage
   - Disk usage

4. **Business Metrics**
   - Active users
   - Projects created
   - AI requests
   - Documents generated

5. **AI Metrics**
   - AI response time
   - Token usage
   - Cost per request
   - Error rate by model

---

## Backup & Recovery

### Backup Strategy

#### What to Backup

```yaml
critical:
  - SQLite database (taskmaster.db)
  - Memgraph graph data
  - Project files
  - Configuration files (.env)

optional:
  - Logs (recent 7 days)
  - Cache data
```

#### Backup Schedule

```bash
# Crontab
# Daily backups at 2 AM
0 2 * * * /opt/opencode/scripts/backup.sh

# Weekly full backups (Sunday 3 AM)
0 3 * * 0 /opt/opencode/scripts/backup.sh --full

# Hourly incremental backups (during business hours)
0 9-17 * * 1-5 /opt/opencode/scripts/backup-incremental.sh
```

#### Backup Script

```bash
#!/bin/bash
# backup.sh

set -e

BACKUP_DIR="/backups/opencode"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"

echo "🔐 Starting backup..."

# Create backup directory
mkdir -p "$BACKUP_PATH"

# Backup SQLite
echo "Backing up SQLite..."
docker exec opencode-backend sqlite3 /app/data/taskmaster.db ".backup /app/data/taskmaster-backup.db"
docker cp opencode-backend:/app/data/taskmaster-backup.db "$BACKUP_PATH/taskmaster.db"

# Backup Memgraph
echo "Backing up Memgraph..."
docker exec opencode-memgraph mgconsole -e "DUMP DATABASE;"
docker cp opencode-memgraph:/var/lib/memgraph/dump.cypher "$BACKUP_PATH/graph.cypher"

# Backup project files
echo "Backing up projects..."
tar -czf "$BACKUP_PATH/projects.tar.gz" -C /var/lib/docker/volumes/opencode_project-data/_data .

# Backup configuration
echo "Backing up configuration..."
cp .env.production "$BACKUP_PATH/env.backup"

# Create manifest
cat > "$BACKUP_PATH/manifest.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "version": "$(cat VERSION)",
  "files": {
    "sqlite": "taskmaster.db",
    "graph": "graph.cypher",
    "projects": "projects.tar.gz",
    "config": "env.backup"
  }
}
EOF

# Compress backup
echo "Compressing backup..."
tar -czf "$BACKUP_DIR/backup-$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "$TIMESTAMP"
rm -rf "$BACKUP_PATH"

# Cleanup old backups (keep last 30 days)
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
if [ "$CLOUD_BACKUP" = "true" ]; then
    echo "Uploading to cloud..."
    aws s3 cp "$BACKUP_DIR/backup-$TIMESTAMP.tar.gz" "s3://opencode-backups/"
fi

echo "✅ Backup complete: backup-$TIMESTAMP.tar.gz"
```

#### Restore Script

```bash
#!/bin/bash
# restore.sh <backup-file>

set -e

BACKUP_FILE=$1
RESTORE_DIR="/tmp/opencode-restore"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <backup-file>"
    exit 1
fi

echo "🔄 Starting restore from $BACKUP_FILE..."

# Extract backup
mkdir -p "$RESTORE_DIR"
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"

# Stop services
echo "Stopping services..."
docker-compose down

# Restore SQLite
echo "Restoring SQLite..."
cp "$RESTORE_DIR"/*/taskmaster.db /var/lib/docker/volumes/opencode_sqlite-data/_data/

# Restore Memgraph
echo "Restoring Memgraph..."
docker-compose up -d memgraph
sleep 5
cat "$RESTORE_DIR"/*/graph.cypher | docker exec -i opencode-memgraph mgconsole

# Restore projects
echo "Restoring projects..."
tar -xzf "$RESTORE_DIR"/*/projects.tar.gz -C /var/lib/docker/volumes/opencode_project-data/_data/

# Restore configuration
echo "Restoring configuration..."
cp "$RESTORE_DIR"/*/env.backup .env.production

# Restart services
echo "Starting services..."
docker-compose up -d

# Verify
sleep 10
if curl -f http://localhost:3000/api/health; then
    echo "✅ Restore successful!"
else
    echo "❌ Restore failed!"
    exit 1
fi

# Cleanup
rm -rf "$RESTORE_DIR"
```

### Disaster Recovery

#### RTO & RPO Targets

| Scenario | RTO | RPO | Priority |
|----------|-----|-----|----------|
| Service crash | 5 minutes | 0 | Critical |
| Database corruption | 30 minutes | 1 hour | High |
| Complete data loss | 4 hours | 24 hours | High |
| Infrastructure failure | 2 hours | 24 hours | Medium |

#### Recovery Procedures

**Scenario 1: Service Crash**

```bash
# 1. Check logs
docker-compose logs -f backend

# 2. Restart service
docker-compose restart backend

# 3. Verify
curl http://localhost:3000/api/health
```

**Scenario 2: Database Corruption**

```bash
# 1. Stop services
docker-compose down

# 2. Run SQLite integrity check
sqlite3 taskmaster.db "PRAGMA integrity_check;"

# 3a. If recoverable, repair
sqlite3 taskmaster.db ".recover" | sqlite3 taskmaster-recovered.db

# 3b. If not recoverable, restore from backup
./scripts/restore.sh /backups/latest.tar.gz

# 4. Restart
docker-compose up -d
```

**Scenario 3: Complete Infrastructure Loss**

```bash
# 1. Provision new infrastructure
# 2. Install Docker and dependencies
# 3. Clone repository
git clone https://github.com/opencode/platform.git

# 4. Restore latest backup
./scripts/restore.sh s3://opencode-backups/latest.tar.gz

# 5. Update DNS
# 6. Verify functionality
```

---

## Maintenance Procedures

### Routine Maintenance

#### Daily

```bash
# Check service health
docker-compose ps
curl http://localhost:3000/api/health

# Check disk space
df -h

# Review error logs
docker-compose logs --tail=100 backend | grep ERROR
```

#### Weekly

```bash
# Update dependencies (security patches)
docker-compose pull
docker-compose up -d

# Vacuum SQLite database
sqlite3 taskmaster.db "VACUUM;"

# Review metrics
# - Check Grafana dashboard
# - Review AI costs
# - Check error rates

# Clean old logs
find /var/log/opencode -name "*.log" -mtime +7 -delete
```

#### Monthly

```bash
# Update system packages
apt update && apt upgrade -y

# Review and optimize Memgraph
docker exec opencode-memgraph mgconsole -e "ANALYZE GRAPH;"

# Capacity planning
# - Review disk usage trends
# - Review memory usage trends
# - Plan scaling if needed

# Security audit
./scripts/security-audit.sh
```

### Database Maintenance

#### SQLite Optimization

```bash
# Vacuum (reclaim space)
sqlite3 taskmaster.db "VACUUM;"

# Analyze (update statistics)
sqlite3 taskmaster.db "ANALYZE;"

# Integrity check
sqlite3 taskmaster.db "PRAGMA integrity_check;"

# Check size
du -h taskmaster.db
```

#### Memgraph Optimization

```cypher
// Rebuild indexes
DROP INDEX ON :File(path);
CREATE INDEX ON :File(path);

// Analyze graph
ANALYZE GRAPH;

// Check stats
SHOW STORAGE INFO;
```

### Updating OpenCode

```bash
#!/bin/bash
# update.sh

set -e

echo "🔄 Updating OpenCode..."

# Backup first
./scripts/backup.sh

# Pull latest code
git fetch origin
git checkout tags/v1.1.0  # or main for latest

# Update dependencies
docker-compose build

# Run migrations (if any)
docker-compose run --rm backend bun run migrate

# Rolling restart
docker-compose up -d --no-deps --build backend
sleep 30
docker-compose up -d --no-deps --build frontend

# Verify
./scripts/smoke-test.sh

echo "✅ Update complete!"
```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P0** | Critical - Service down | 15 minutes | Complete outage, data loss |
| **P1** | High - Major impact | 1 hour | High error rate, slow performance |
| **P2** | Medium - Partial impact | 4 hours | Single feature broken |
| **P3** | Low - Minor impact | 24 hours | UI bug, minor inconvenience |

### Incident Response Workflow

```
Incident Detected
    ↓
[Assess Severity]
    ↓
[Page On-Call] (P0/P1 only)
    ↓
[Create Incident Channel]
    ↓
[Investigate & Diagnose]
    ↓
[Implement Fix]
    ↓
[Verify Resolution]
    ↓
[Write Post-Mortem]
```

### Common Issues & Solutions

#### Issue: High Memory Usage

**Symptoms:**
- Memory usage > 90%
- OOM kills
- Slow performance

**Diagnosis:**
```bash
# Check memory
docker stats opencode-backend

# Check process memory
docker exec opencode-backend ps aux --sort=-%mem | head

# Check for memory leaks
docker exec opencode-backend bun run memory-profile
```

**Solution:**
```bash
# Quick fix: Restart
docker-compose restart backend

# Long-term: Increase memory limit
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 4G
```

#### Issue: AI Requests Timing Out

**Symptoms:**
- AI responses taking > 30s
- Timeout errors
- 503 errors

**Diagnosis:**
```bash
# Check OpenRouter status
curl https://openrouter.ai/api/v1/models

# Check logs
docker-compose logs backend | grep "AI_SERVICE_ERROR"

# Check rate limits
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/auth/key
```

**Solution:**
```bash
# 1. Check rate limits (may be exhausted)
# 2. Switch to different model (fallback)
# 3. Increase timeout
# In .env:
AI_TIMEOUT_MS=60000

# 4. Implement request queuing
# 5. Add retry logic
```

#### Issue: Memgraph Connection Failed

**Symptoms:**
- Graph queries failing
- "Connection refused" errors
- Graph visualization not loading

**Diagnosis:**
```bash
# Check Memgraph status
docker-compose ps memgraph

# Check Memgraph logs
docker-compose logs memgraph

# Try connecting
docker exec opencode-memgraph mgconsole
```

**Solution:**
```bash
# Restart Memgraph
docker-compose restart memgraph

# If corrupted, restore from backup
docker-compose down
./scripts/restore.sh --graph-only
docker-compose up -d

# Check connection settings
echo $MEMGRAPH_URI  # Should be bolt://memgraph:7687
```

### Post-Mortem Template

```markdown
# Incident Post-Mortem: [Title]

**Date:** 2024-10-25
**Duration:** 2 hours 15 minutes
**Severity:** P1
**Impact:** 80% of users unable to use AI chat

## Summary
Brief description of what happened.

## Timeline (UTC)
- 10:00 - First alert received
- 10:15 - On-call engineer paged
- 10:30 - Incident channel created
- 10:45 - Root cause identified
- 11:30 - Fix deployed
- 12:15 - Incident resolved

## Root Cause
Detailed explanation of what caused the incident.

## Impact
- 80% of users affected
- 1,200 failed AI requests
- $0 revenue impact

## Resolution
Steps taken to resolve the incident.

## Lessons Learned

### What Went Well
- Quick detection (< 5 min)
- Clear communication
- Rapid response

### What Went Wrong
- No rate limit monitoring
- Missing fallback model
- Insufficient testing

## Action Items
- [ ] Add rate limit monitoring (#123)
- [ ] Implement fallback models (#124)
- [ ] Add integration tests (#125)
- [ ] Update runbook (#126)

**Owner:** @engineer
**Due:** 2024-11-01
```

---

## Scaling Strategy

### Horizontal Scaling

#### Backend Scaling

```yaml
# docker-compose.scale.yml
services:
  backend:
    deploy:
      replicas: 3
      
  nginx-lb:
    image: nginx:alpine
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

```nginx
# nginx-lb.conf
upstream backend {
    least_conn;
    server backend-1:3000;
    server backend-2:3000;
    server backend-3:3000;
}

server {
    listen 3000;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Stateless Design

All session state should be stored in:
- SQLite (shared volume)
- Memgraph (centralized)
- No in-memory sessions

### Vertical Scaling

#### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
          
  memgraph:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
```

### Database Scaling

#### Memgraph Scaling

```yaml
# Memgraph High Availability (future)
services:
  memgraph-1:
    image: memgraph/memgraph:2.12
    environment:
      - MEMGRAPH_HA_CLUSTER_INIT=coordinator
      
  memgraph-2:
    image: memgraph/memgraph:2.12
    environment:
      - MEMGRAPH_HA_CLUSTER_INIT=replica
      
  memgraph-3:
    image: memgraph/memgraph:2.12
    environment:
      - MEMGRAPH_HA_CLUSTER_INIT=replica
```

### Capacity Planning

| Metric | Current | Scaling Trigger | Action |
|--------|---------|-----------------|--------|
| **CPU** | 30% | > 70% sustained | Add backend replicas |
| **Memory** | 2GB | > 3GB | Increase limits |
| **Disk** | 10GB | > 40GB | Expand volume |
| **Memgraph Nodes** | 10K | > 50K | Optimize queries |
| **Concurrent Users** | 50 | > 200 | Scale backend |

---

## Security Operations

### Security Checklist

#### Daily
- [ ] Review failed login attempts
- [ ] Check for unusual API usage
- [ ] Review error logs for security issues

#### Weekly
- [ ] Update dependencies
- [ ] Scan for vulnerabilities
- [ ] Review API key usage

#### Monthly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review access logs
- [ ] Update security policies

### Vulnerability Scanning

```bash
# Scan Docker images
docker scan opencode-backend:latest

# Scan dependencies
bun audit

# OWASP ZAP scan (if web-facing)
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://opencode.example.com
```

### Security Monitoring

```typescript
// Suspicious activity detection
const SECURITY_RULES = {
  // Too many failed requests
  failedRequests: {
    threshold: 10,
    window: '5m',
    action: 'block_ip',
  },
  
  // Large file upload
  largeUpload: {
    threshold: 100 * 1024 * 1024, // 100MB
    action: 'alert',
  },
  
  // Unusual AI usage
  aiSpike: {
    threshold: 100,
    window: '1h',
    action: 'alert',
  },
  
  // Path traversal attempt
  pathTraversal: {
    pattern: /\.\.\//,
    action: 'block',
  },
}
```

### Incident Response (Security)

```bash
# If compromised:

# 1. Isolate affected systems
docker-compose down

# 2. Preserve evidence
./scripts/collect-logs.sh
tar -czf evidence.tar.gz /var/log/opencode

# 3. Reset all secrets
./scripts/rotate-secrets.sh

# 4. Investigate
grep "suspicious-ip" /var/log/opencode/*.log

# 5. Patch vulnerability
git pull origin hotfix/security-patch
docker-compose build
docker-compose up -d

# 6. Notify users (if needed)
./scripts/notify-users.sh --template security-incident
```

---

## Support Runbook

### User Issues

#### Issue: User Can't Log In

**Questions:**
- What error message do you see?
- Have you tried resetting your password?
- Are you using the correct URL?

**Steps:**
1. Verify user account exists
2. Check password hash
3. Review login logs
4. Reset password if needed

#### Issue: File Won't Save

**Questions:**
- What's the file size?
- What's the error message?
- Does it work for other files?

**Steps:**
1. Check disk space
2. Check file permissions
3. Check file size limits
4. Review error logs

#### Issue: AI Not Responding

**Questions:**
- Is it just you or all users?
- What model are you using?
- Does it timeout or error?

**Steps:**
1. Check OpenRouter status
2. Check rate limits
3. Check API key
4. Try different model

### Admin Tasks

#### Add New User

```bash
# Create user account
docker exec opencode-backend bun run cli user:create \
  --email user@example.com \
  --name "John Doe" \
  --role user
```

#### Reset User Password

```bash
docker exec opencode-backend bun run cli user:reset-password \
  --email user@example.com
```

#### View System Stats

```bash
# Overall stats
docker exec opencode-backend bun run cli stats

# Output:
# Users: 150
# Projects: 250
# AI Requests (24h): 1,523
# Storage Used: 15.2 GB
```

#### Export User Data

```bash
# GDPR data export
docker exec opencode-backend bun run cli user:export \
  --email user@example.com \
  --output /tmp/user-data.json
```

---

## Appendix

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment mode |
| `PORT` | No | `3000` | Backend port |
| `OPENROUTER_API_KEY` | Yes | - | AI API key |
| `DEFAULT_AI_MODEL` | No | `gpt-4o-mini` | Default model |
| `MEMGRAPH_URI` | Yes | - | Memgraph connection |
| `SQLITE_PATH` | No | `./data/taskmaster.db` | SQLite path |
| `ENCRYPTION_KEY` | Yes | - | Encryption key |
| `ENABLE_CACHING` | No | `true` | Enable caching |
| `MAX_PROJECT_SIZE_MB` | No | `500` | Max project size |
| `LOG_LEVEL` | No | `info` | Logging level |

### Port Reference

| Port | Service | Purpose |
|------|---------|---------|
| 3000 | Backend | API server |
| 5173 | Frontend | Web UI |
| 7687 | Memgraph | Graph database (Bolt) |
| 7444 | Memgraph | Monitoring |

### File Locations

```
/opt/opencode/
├── docker-compose.yml
├── .env.production
├── scripts/
│   ├── backup.sh
│   ├── restore.sh
│   ├── deploy.sh
│   └── smoke-test.sh
└── data/
    ├── taskmaster.db
    └── projects/

/var/log/opencode/
├── backend.log
├── frontend.log
└── memgraph.log

/backups/opencode/
├── backup-20241025_020000.tar.gz
├── backup-20241024_020000.tar.gz
└── ...
```

### Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f memgraph

# Enter container
docker exec -it opencode-backend bash
docker exec -it opencode-memgraph bash

# Database console
docker exec -it opencode-backend sqlite3 /app/data/taskmaster.db
docker exec -it opencode-memgraph mgconsole

# Resource usage
docker stats

# Cleanup
docker system prune -a --volumes
```

---

**Document Status:** Draft  
**Next Review:** 2024-11-01  
**Maintained By:** DevOps Team

---

*This operations manual is a living document and should be updated as procedures evolve.*
