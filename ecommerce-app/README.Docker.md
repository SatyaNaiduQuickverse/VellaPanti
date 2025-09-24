# Docker Setup for VellaPanti E-commerce

This guide explains how to containerize and deploy the VellaPanti e-commerce application using Docker.

## 🐳 Quick Start

### Development
```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### Production
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📦 What's Included

- **Web App** (Next.js) - Port 3000
- **API Server** (Node.js/Express) - Port 3001
- **PostgreSQL Database** - Port 5432
- **Auto Migration & Seeding**

## 🚀 Deployment Commands

### Local Development
```bash
# Start everything
docker-compose up --build

# Stop everything
docker-compose down

# Remove volumes (reset database)
docker-compose down -v
```

### Production Deployment
```bash
# Set environment variables
export DB_PASSWORD=your-secure-password
export JWT_SECRET=your-jwt-secret
export NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Deploy
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🌐 Server Migration

### Any Docker-capable server:
1. Install Docker & Docker Compose
2. Copy application files
3. Set environment variables
4. Run: `docker-compose up -d --build`

### Supported Platforms:
- ✅ AWS EC2, ECS, Fargate
- ✅ Google Cloud Run, GKE
- ✅ Azure Container Instances
- ✅ DigitalOcean Droplets/App Platform
- ✅ Any VPS with Docker

## ⚙️ Configuration

### Environment Variables (.env.production)
```env
# Database
DB_PASSWORD=your-secure-password

# Security
JWT_SECRET=your-super-secure-jwt-secret
SESSION_SECRET=your-session-secret

# API URLs
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Ports (optional)
WEB_PORT=3000
API_PORT=3001
```

### Database Persistence
Data is automatically persisted in Docker volumes:
- Development: `postgres_data`
- Production: `postgres_data_prod`

## 🔧 Troubleshooting

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs web
docker-compose logs api
docker-compose logs db
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart web
```

### Reset Database
```bash
# Remove volumes and restart
docker-compose down -v
docker-compose up --build
```

### Access Database
```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d vellapanti
```

## 🏥 Health Checks

All services include health checks:
- **API**: `curl http://localhost:3001/api/health`
- **Web**: `curl http://localhost:3000`
- **Database**: `pg_isready`

## 🔒 Security Notes

### Production Checklist:
- [ ] Change default passwords
- [ ] Update JWT secrets
- [ ] Configure HTTPS/SSL
- [ ] Set up proper firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable container security scanning

### Default Credentials (CHANGE IN PRODUCTION):
- **Database**: postgres/postgres123
- **Admin**: admin@vellapanti.com/admin123
- **User**: user@example.com/user123

## 📊 Monitoring

### Container Status
```bash
docker-compose ps
docker stats
```

### Resource Usage
```bash
# View resource consumption
docker system df
docker images
```

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up --build -d
```

### Backup Database
```bash
# Create backup
docker-compose exec db pg_dump -U postgres vellapanti > backup.sql

# Restore backup
docker-compose exec -T db psql -U postgres vellapanti < backup.sql
```

## 🎯 Performance Tips

- Use production builds (`NODE_ENV=production`)
- Enable container resource limits
- Use multi-stage builds (already implemented)
- Consider Redis for session storage
- Use CDN for static assets

---

**Your VellaPanti e-commerce application is now fully containerized and portable across any server! 🚀**