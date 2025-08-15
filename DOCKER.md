# Docker Setup for Portfolio App

## 🐳 Quick Start with Docker Desktop

### Prerequisites
- Docker Desktop installed and running
- Ports 3000, 5432, and 5555 available

### 1. Environment Setup
Create a `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://portfolio_user:portfolio_password@postgres:5432/portfolio"

# Application Configuration
NODE_ENV="production"
PORT=3000
```

### 2. Start the Application
```bash
# Start all services (app + database)
docker-compose up -d

# Start with Prisma Studio (database management)
docker-compose --profile tools up -d
```

### 3. Access Your Application
- **Portfolio App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Prisma Studio**: http://localhost:5555 (if using --profile tools)

## 🚀 Docker Commands

### Development
```bash
# Build and start
docker-compose up --build

# View logs
docker-compose logs -f portfolio-app

# Stop services
docker-compose down
```

### Production
```bash
# Build production image
docker build -t portfolio-app:latest .

# Run production container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-production-db-url" \
  -e NODE_ENV=production \
  portfolio-app:latest
```

### Database Management
```bash
# Access PostgreSQL
docker exec -it portfolio-postgres psql -U portfolio_user -d portfolio

# Run Prisma migrations
docker exec -it portfolio-app npx prisma migrate deploy

# Generate Prisma client
docker exec -it portfolio-app npx prisma generate
```

## 🔧 Docker Configuration Details

### Multi-Stage Build
- **Base**: Node.js 24 Alpine with dependencies
- **Dependencies**: Install npm packages
- **Prisma**: Generate database client
- **Builder**: Build the application
- **Runner**: Production-ready container

### Security Features
- Non-root user (nextjs:nodejs)
- Minimal Alpine Linux base
- Health checks for monitoring
- Proper file permissions

### Health Checks
- **App**: HTTP endpoint at `/health`
- **Database**: PostgreSQL connection check
- **Interval**: 30s for app, 10s for database

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Verify database is running
   docker-compose ps
   ```

3. **Build Failures**
   ```bash
   # Clean build cache
   docker-compose build --no-cache
   
   # Remove all containers and images
   docker-compose down --rmi all
   ```

### Logs and Debugging
```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f portfolio-app

# Access container shell
docker exec -it portfolio-app sh
```

## 📊 Monitoring

### Health Check Endpoint
- **URL**: `/health`
- **Response**: JSON with status and timestamp
- **Docker**: Used for container health monitoring

### Resource Usage
```bash
# View container stats
docker stats

# View resource usage
docker system df
```

## 🔄 Updates and Maintenance

### Update Dependencies
```bash
# Rebuild with new dependencies
docker-compose up --build

# Update base images
docker-compose pull
```

### Database Backups
```bash
# Backup database
docker exec portfolio-postgres pg_dump -U portfolio_user portfolio > backup.sql

# Restore database
docker exec -i portfolio-postgres psql -U portfolio_user portfolio < backup.sql
```

## 🌐 Production Deployment

### Environment Variables
```bash
# Production .env
DATABASE_URL="postgresql://user:pass@your-db-host:5432/dbname"
NODE_ENV="production"
PORT=3000
```

### Docker Compose Override
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'
services:
  portfolio-app:
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
    restart: always
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
