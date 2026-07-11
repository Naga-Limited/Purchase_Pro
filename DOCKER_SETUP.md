# Docker Setup Guide for Purchase Pro

This guide will help you set up and run Purchase Pro using Docker containers.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- Minimum 4GB RAM allocated to Docker
- Ports 3000, 8080, 8081, and 3306 available

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Naga-Limited/Purchase_Pro.git
cd Purchase_Pro
```

### 2. Configure Environment Variables

Copy the Docker environment file:

```bash
# Windows
copy .env.docker .env

# Linux/Mac
cp .env.docker .env
```

Edit `.env` file if needed:

```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=purchase_pro
MYSQL_USER=purchase_user
MYSQL_PASSWORD=purchase_password

# Application Configuration
CI_ENVIRONMENT=development
APP_BASE_URL=http://localhost:8080

# React Configuration
REACT_APP_API_URL=http://localhost:8080
```

### 3. Start Docker Containers

```bash
docker-compose up -d
```

This will start all services:
- **PHP Backend** on port 8080
- **React Frontend** on port 3000
- **MySQL Database** on port 3306
- **phpMyAdmin** on port 8081

### 4. Wait for Services to Initialize

First time startup may take 5-10 minutes as it:
- Downloads Docker images
- Installs PHP dependencies (Composer)
- Installs Node.js dependencies (npm)
- Initializes database

Check the logs:

```bash
docker-compose logs -f
```

### 5. Import Database (if you have a SQL dump)

```bash
# Copy your SQL file to the project directory, then:
docker-compose exec db mysql -u purchase_user -ppurchase_password purchase_pro < database.sql
```

Or use phpMyAdmin at http://localhost:8081

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **phpMyAdmin**: http://localhost:8081
  - Server: `db`
  - Username: `purchase_user`
  - Password: `purchase_password`

## Docker Commands Reference

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d app
docker-compose up -d db
docker-compose up -d node
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db
docker-compose logs -f node
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
docker-compose restart node
```

### Rebuild Containers

After changing Dockerfile or dependencies:

```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build app
```

### Execute Commands in Containers

```bash
# Access PHP container bash
docker-compose exec app bash

# Access MySQL
docker-compose exec db mysql -u root -p

# Run Composer commands
docker-compose exec app composer install
docker-compose exec app composer update

# Run PHP Spark commands
docker-compose exec app php spark serve
docker-compose exec app php spark cache:clear
docker-compose exec app php spark migrate

# Access Node container
docker-compose exec node sh

# Run npm commands
docker-compose exec node npm install
docker-compose exec node npm run build
```

## Troubleshooting

### Port Already in Use

If you get port conflict errors:

```bash
# Check what's using the port (Windows)
netstat -ano | findstr :8080

# Check what's using the port (Linux/Mac)
lsof -i :8080

# Kill the process or change port in docker-compose.yml
```

### Container Fails to Start

```bash
# Check container status
docker-compose ps

# Check logs for errors
docker-compose logs app
docker-compose logs db

# Remove and recreate
docker-compose down
docker-compose up -d --force-recreate
```

### Database Connection Issues

1. Ensure MySQL container is running:
```bash
docker-compose ps db
```

2. Check database logs:
```bash
docker-compose logs db
```

3. Verify connection from PHP container:
```bash
docker-compose exec app php -r "echo (new mysqli('db', 'purchase_user', 'purchase_password', 'purchase_pro'))->ping() ? 'Connected' : 'Failed';"
```

### Permission Issues (Linux/Mac)

If you get permission errors:

```bash
# Set correct ownership
sudo chown -R $USER:$USER .
chmod -R 755 writable/
chmod -R 755 public/
```

### React Dev Server Not Starting

1. Check if node modules are installed:
```bash
docker-compose exec node ls node_modules
```

2. Install manually if needed:
```bash
docker-compose exec node npm install
```

3. Restart the service:
```bash
docker-compose restart node
```

### Clear Everything and Start Fresh

```bash
# Stop and remove everything
docker-compose down -v

# Remove Docker images
docker-compose down --rmi all

# Start fresh
docker-compose up -d --build
```

## Production Deployment

For production, modify `docker-compose.yml`:

1. **Set production environment**:
```yaml
environment:
  - CI_ENVIRONMENT=production
```

2. **Remove development volumes** (to use built-in code):
```yaml
# Remove or comment out in app service:
# volumes:
#   - ./:/var/www/html
```

3. **Build production React app**:
```bash
cd UI
npm run build
```

4. **Use production-ready images**:
- Use specific version tags instead of `latest`
- Build optimized PHP image with `--optimize-autoloader --no-dev`

5. **Secure your secrets**:
- Use Docker secrets or environment variable injection
- Never commit `.env` with production credentials

6. **Enable HTTPS**:
- Add nginx/traefik as reverse proxy
- Configure SSL certificates

## Backup and Restore

### Backup Database

```bash
# Backup to file
docker-compose exec db mysqldump -u root -proot_password purchase_pro > backup_$(date +%Y%m%d).sql

# Or use phpMyAdmin export feature
```

### Restore Database

```bash
# Restore from file
docker-compose exec -T db mysql -u root -proot_password purchase_pro < backup.sql
```

### Backup Uploaded Files

```bash
# Backup writable directory
tar -czf uploads_backup.tar.gz writable/uploads public/Tmpupload
```

## Performance Optimization

### 1. Allocate More Resources to Docker

Docker Desktop → Settings → Resources:
- CPU: 4+ cores
- Memory: 4+ GB
- Disk: 20+ GB

### 2. Enable BuildKit

```bash
# Windows PowerShell
$env:DOCKER_BUILDKIT=1

# Linux/Mac
export DOCKER_BUILDKIT=1
```

### 3. Use Volume Drivers

For better performance on Windows/Mac, consider using volume drivers or mounting specific directories only.

## Useful Docker Commands

```bash
# View all containers
docker ps -a

# View all images
docker images

# Clean up unused resources
docker system prune -a

# Monitor resource usage
docker stats

# Inspect container
docker-compose exec app env

# Copy files from container
docker cp purchase_pro_app:/var/www/html/writable/logs ./logs
```

## Development Workflow

1. **Make code changes** - Edit files in your IDE
2. **Changes auto-reload**:
   - PHP changes: Instant (Apache auto-reloads)
   - React changes: Hot reload via dev server
3. **Run tests**:
```bash
docker-compose exec app composer test
docker-compose exec node npm test
```
4. **Check logs**:
```bash
docker-compose logs -f app
```

## Support

For issues specific to Docker setup:
- Check Docker logs: `docker-compose logs`
- Verify Docker version: `docker --version` and `docker-compose --version`
- Ensure Docker Desktop is running (Windows/Mac)

For application issues, refer to the main [README.md](README.md).

---

**Happy Dockering! 🐳**
