# Purchase Pro - Quick Reference Card

## 🚀 Quick Start Commands

### Local Development (Docker)
```bash
# Windows
start-docker.bat

# Linux/Mac
./start-docker.sh

# Manual
docker-compose up -d
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- phpMyAdmin: http://localhost:8081

---

## 📦 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart app

# Rebuild containers
docker-compose up -d --build

# Access PHP container
docker-compose exec app bash

# Access MySQL
docker-compose exec db mysql -u purchase_user -ppurchase_password

# Run Composer
docker-compose exec app composer install

# Clear cache
docker-compose exec app php spark cache:clear

# Run migrations
docker-compose exec app php spark migrate
```

---

## 🔧 Backend Commands (CodeIgniter 4)

```bash
# Development server (without Docker)
php spark serve
php spark serve --port 8080

# Cache management
php spark cache:clear
php spark cache:info

# Database
php spark migrate
php spark migrate:rollback
php spark migrate:status
php spark db:seed SeedName

# Code generation
php spark make:controller ControllerName
php spark make:model ModelName
php spark make:migration MigrationName

# Routes
php spark routes

# Environment
php spark env

# Tests
composer test
./vendor/bin/phpunit
```

---

## ⚛️ Frontend Commands (React)

```bash
cd UI

# Install dependencies
npm install

# Development server
npm start

# Build for production
npm run build

# Tests
npm test

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

---

## ☁️ AWS Deployment

### ECS Deployment
```bash
# Deploy via GitHub Actions (automatic on push to main)
git push origin main

# Manual trigger
gh workflow run deploy-aws.yml -f environment=production

# Check ECS service
aws ecs describe-services --cluster purchase-pro-cluster --services purchase-pro-service

# View logs
aws logs tail /ecs/purchase-pro --follow

# Update service
aws ecs update-service --cluster purchase-pro-cluster --service purchase-pro-service --force-new-deployment
```

### EC2 Deployment
```bash
# Deploy via GitHub Actions
git push origin main

# SSH to EC2
ssh -i your-key.pem ubuntu@ec2-host

# Apache commands
sudo systemctl status apache2
sudo systemctl restart apache2
sudo systemctl stop apache2
sudo systemctl start apache2

# View logs
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/www/purchase-pro/writable/logs/log-*.log
```

---

## 🗄️ Database Commands

### MySQL (Docker)
```bash
# Access MySQL
docker-compose exec db mysql -u purchase_user -ppurchase_password

# Backup
docker-compose exec db mysqldump -u purchase_user -ppurchase_password purchase_pro > backup.sql

# Restore
docker-compose exec -T db mysql -u purchase_user -ppurchase_password purchase_pro < backup.sql
```

### MySQL (Direct)
```bash
# Access
mysql -u root -p

# Backup
mysqldump -u root -p purchase_pro > backup.sql

# Restore
mysql -u root -p purchase_pro < backup.sql

# Create database
mysql -u root -p -e "CREATE DATABASE purchase_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## 🔐 GitHub Secrets (Required)

### For Docker Hub
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

### For AWS
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### For ECS
- `ECR_REPOSITORY`
- `ECS_CLUSTER`
- `ECS_SERVICE`
- `SUBNET_IDS`
- `SECURITY_GROUP_ID`

### For EC2
- `EC2_INSTANCE_ID`
- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_PRIVATE_KEY`

### For Both
- `S3_BUCKET_NAME`
- `RDS_HOSTNAME`
- `RDS_DATABASE`
- `RDS_USERNAME`
- `RDS_PASSWORD`
- `BACKEND_URL`
- `FRONTEND_URL`

---

## 📝 Environment Variables

### Required in `.env`
```env
CI_ENVIRONMENT=development

database.default.hostname=localhost
database.default.database=purchase_pro
database.default.username=root
database.default.password=root
database.default.DBDriver=MySQLi
database.default.port=3306

app.baseURL='http://localhost:8080/'
```

### Docker Environment
```env
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=purchase_pro
MYSQL_USER=purchase_user
MYSQL_PASSWORD=purchase_password
REACT_APP_API_URL=http://localhost:8080
```

---

## 🧪 Testing & Quality

### Backend Tests
```bash
# Run all tests
composer test
./vendor/bin/phpunit

# Run specific test
./vendor/bin/phpunit tests/YourTest.php

# Code coverage
./vendor/bin/phpunit --coverage-html coverage/
```

### Frontend Tests
```bash
cd UI

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Update snapshots
npm test -- -u
```

### Linting
```bash
# PHP (if installed)
./vendor/bin/phpcs app/

# JavaScript
cd UI
npm run lint
npm run lint:fix
```

---

## 🐛 Troubleshooting

### Docker Issues
```bash
# Port conflict
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac

# Clean everything
docker-compose down -v
docker system prune -a

# Force recreate
docker-compose up -d --force-recreate
```

### Permission Issues (Linux/Mac)
```bash
sudo chown -R $USER:$USER .
chmod -R 755 writable/
chmod -R 755 public/
```

### Cache Issues
```bash
# Backend
php spark cache:clear

# Frontend
cd UI
rm -rf node_modules
rm package-lock.json
npm install

# Docker
docker-compose exec app php spark cache:clear
```

### Database Connection
```bash
# Test from PHP container
docker-compose exec app php -r "echo (new mysqli('db', 'purchase_user', 'purchase_password', 'purchase_pro'))->ping() ? 'OK' : 'FAIL';"

# Check MySQL is running
docker-compose ps db
docker-compose logs db
```

---

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100 app

# Backend logs
tail -f writable/logs/log-*.log
```

### Health Checks
```bash
# Backend
curl http://localhost:8080
curl http://localhost:8080/api/health

# Frontend
curl http://localhost:3000

# Database
docker-compose exec db mysqladmin ping -u root -p
```

### Resource Usage
```bash
# Docker stats
docker stats

# Disk usage
docker system df

# Container info
docker-compose ps
```

---

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
git add .
git commit -m "Your message"

# Push to remote
git push origin feature/your-feature

# Create pull request (via GitHub UI or)
gh pr create

# Merge and deploy
git checkout main
git merge feature/your-feature
git push origin main  # Triggers auto-deployment
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `DOCKER_SETUP.md` | Docker guide |
| `AWS_DEPLOYMENT.md` | AWS deployment |
| `GITHUB_ACTIONS_SETUP.md` | CI/CD setup |
| `.env` | Environment config |
| `docker-compose.yml` | Docker orchestration |
| `Dockerfile` | PHP container |
| `app/Config/Database.php` | DB config |
| `app/Config/Routes.php` | API routes |

---

## 📞 Quick Links

- **Local Frontend**: http://localhost:3000
- **Local Backend**: http://localhost:8080
- **phpMyAdmin**: http://localhost:8081
- **GitHub Repo**: https://github.com/Naga-Limited/Purchase_Pro
- **Docker Hub**: https://hub.docker.com/r/nagalimited/purchase-pro

---

## 🎯 Common Tasks

### Setup New Developer
```bash
git clone https://github.com/Naga-Limited/Purchase_Pro.git
cd Purchase_Pro
start-docker.bat  # or ./start-docker.sh
# Wait for services to start
# Access http://localhost:3000
```

### Deploy to Production
```bash
# Via GitHub Actions (automatic)
git push origin main

# Or manual
gh workflow run deploy-aws.yml
```

### Update Dependencies
```bash
# Backend
docker-compose exec app composer update

# Frontend
cd UI
npm update
```

### Database Migration
```bash
# Create migration
docker-compose exec app php spark make:migration CreateUsersTable

# Run migrations
docker-compose exec app php spark migrate

# Rollback
docker-compose exec app php spark migrate:rollback
```

---

## ⚡ Pro Tips

1. **Use Docker for development** - Consistent environment
2. **Enable hot reload** - Faster development
3. **Use GitHub Actions** - Automated deployments
4. **Monitor logs** - Catch issues early
5. **Backup regularly** - Database and files
6. **Use environments** - Separate staging/production
7. **Document changes** - Update README
8. **Test before deploy** - Run tests locally

---

## 📱 Mobile Development (Future)

```bash
# Flutter/React Native setup
cd mobile-app
flutter pub get  # or npm install
flutter run      # or npm run android/ios
```

---

## 🆘 Need Help?

1. Check [README.md](README.md)
2. Check [DOCKER_SETUP.md](DOCKER_SETUP.md)
3. Check [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)
4. View logs: `docker-compose logs -f`
5. Create GitHub issue

---

**Quick Reference Version:** 1.0  
**Last Updated:** 2026-07-11

**Print this page for quick access!** 📄
