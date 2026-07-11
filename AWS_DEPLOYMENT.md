# AWS Deployment Guide for Purchase Pro

Complete guide to deploy Purchase Pro on AWS using GitHub Actions.

## 🏗️ Architecture Options

### Option 1: ECS + ECR + RDS (Containerized - Recommended for Scale)
- Docker containers on AWS ECS (Elastic Container Service)
- Images stored in ECR (Elastic Container Registry)
- RDS MySQL for database
- S3 + CloudFront for frontend static files
- Application Load Balancer

### Option 2: EC2 + RDS (Traditional Server)
- Single or multiple EC2 instances
- Apache/Nginx web server
- RDS MySQL for database
- S3 for static assets
- Elastic Load Balancer (optional)

---

## 📋 Prerequisites

### AWS Resources Required

1. **AWS Account** with appropriate permissions
2. **IAM User** with programmatic access
3. **S3 Bucket** (for frontend static files)
4. **RDS MySQL Instance** (or use EC2-hosted MySQL)
5. **ECR Repository** (for Docker images - ECS option)
6. **ECS Cluster** (ECS option)
7. **EC2 Instance(s)** (EC2 option)
8. **CloudFront Distribution** (optional, for CDN)
9. **Route 53** (for domain management)

### GitHub Repository Secrets

Configure these secrets in your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

#### Required for Both Options:
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalrXU...
AWS_REGION=ap-south-1
```

#### For ECS Deployment:
```
ECR_REPOSITORY=purchase-pro
ECS_CLUSTER=purchase-pro-cluster
ECS_SERVICE=purchase-pro-service
ECS_TASK_DEFINITION=purchase-pro-task
SUBNET_IDS=subnet-xxx,subnet-yyy
SECURITY_GROUP_ID=sg-xxxxx
```

#### For EC2 Deployment:
```
EC2_INSTANCE_ID=i-xxxxx
EC2_HOST=ec2-xx-xx-xx-xx.compute.amazonaws.com
EC2_USER=ubuntu
EC2_SSH_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY----- ...
```

#### Common Secrets:
```
S3_BUCKET_NAME=purchase-pro-frontend
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC (optional)
RDS_HOSTNAME=purchase-pro-db.xxxxxx.ap-south-1.rds.amazonaws.com
RDS_DATABASE=purchase_pro
RDS_USERNAME=admin
RDS_PASSWORD=your-secure-password
BACKEND_URL=https://api.yourapp.com
FRONTEND_URL=https://yourapp.com
```

---

## 🚀 Deployment Method 1: AWS ECS (Containerized)

### Step 1: Set Up AWS Infrastructure

#### 1.1 Create VPC and Subnets
```bash
# Use default VPC or create a new one
# Ensure you have at least 2 subnets in different AZs
```

#### 1.2 Create RDS MySQL Database
```bash
# In AWS Console: RDS → Create Database
Database engine: MySQL 8.0
Template: Production (or Dev/Test)
DB instance identifier: purchase-pro-db
Master username: admin
Master password: [secure password]
DB instance class: db.t3.micro (or larger)
Storage: 20 GB (or more)
VPC: Select your VPC
Subnet group: Create new or use existing
Public access: No
VPC security group: Create new (allow port 3306 from ECS security group)
Database name: purchase_pro
```

#### 1.3 Create ECR Repository
```bash
aws ecr create-repository \
  --repository-name purchase-pro \
  --region ap-south-1
```

#### 1.4 Create S3 Bucket for Frontend
```bash
aws s3 mb s3://purchase-pro-frontend --region ap-south-1

# Configure bucket for static website hosting
aws s3 website s3://purchase-pro-frontend \
  --index-document index.html \
  --error-document index.html
```

#### 1.5 Create ECS Cluster
```bash
aws ecs create-cluster \
  --cluster-name purchase-pro-cluster \
  --region ap-south-1
```

#### 1.6 Create ECS Task Definition

Create file: `ecs-task-definition.json`
```json
{
  "family": "purchase-pro-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "purchase-pro-app",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/purchase-pro:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "CI_ENVIRONMENT",
          "value": "production"
        },
        {
          "name": "database.default.hostname",
          "value": "purchase-pro-db.xxxxxx.ap-south-1.rds.amazonaws.com"
        },
        {
          "name": "database.default.database",
          "value": "purchase_pro"
        },
        {
          "name": "database.default.username",
          "value": "admin"
        }
      ],
      "secrets": [
        {
          "name": "database.default.password",
          "valueFrom": "arn:aws:secretsmanager:ap-south-1:YOUR_ACCOUNT_ID:secret:purchase-pro/db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/purchase-pro",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register task definition:
```bash
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json
```

#### 1.7 Create Application Load Balancer
```bash
# In AWS Console: EC2 → Load Balancers → Create Load Balancer
Type: Application Load Balancer
Name: purchase-pro-alb
Scheme: Internet-facing
VPC: Select your VPC
Subnets: Select at least 2 subnets in different AZs
Security group: Create new (allow HTTP/HTTPS)

# Create Target Group
Target type: IP
Protocol: HTTP
Port: 80
VPC: Select your VPC
Health check path: /
```

#### 1.8 Create ECS Service
```bash
aws ecs create-service \
  --cluster purchase-pro-cluster \
  --service-name purchase-pro-service \
  --task-definition purchase-pro-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=purchase-pro-app,containerPort=80"
```

### Step 2: Configure GitHub Actions

The workflow file `.github/workflows/deploy-aws.yml` is already created.

Update these values in the workflow:
```yaml
env:
  AWS_REGION: ap-south-1
  ECR_REPOSITORY: purchase-pro
  ECS_SERVICE: purchase-pro-service
  ECS_CLUSTER: purchase-pro-cluster
  ECS_TASK_DEFINITION: purchase-pro-task
  CONTAINER_NAME: purchase-pro-app
```

### Step 3: Deploy

```bash
# Push to main branch to trigger deployment
git add .
git commit -m "Deploy to AWS ECS"
git push origin main

# Or manually trigger workflow
gh workflow run deploy-aws.yml
```

---

## 🚀 Deployment Method 2: AWS EC2 (Traditional)

### Step 1: Launch EC2 Instance

#### 1.1 Create EC2 Instance
```bash
# In AWS Console: EC2 → Launch Instance
AMI: Ubuntu Server 22.04 LTS
Instance type: t3.medium (or larger)
Key pair: Create or use existing
Network: Default VPC
Security group:
  - SSH (22) from your IP
  - HTTP (80) from anywhere
  - HTTPS (443) from anywhere
Storage: 30 GB gp3
```

#### 1.2 Connect to EC2 and Install Dependencies
```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com

# Update system
sudo apt update && sudo apt upgrade -y

# Install Apache
sudo apt install apache2 -y

# Install PHP 8.1
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install php8.1 php8.1-cli php8.1-common php8.1-mysql \
  php8.1-xml php8.1-mbstring php8.1-curl php8.1-zip php8.1-gd \
  php8.1-intl libapache2-mod-php8.1 -y

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Enable Apache modules
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl restart apache2
```

#### 1.3 Configure Apache Virtual Host
```bash
sudo nano /etc/apache2/sites-available/purchase-pro.conf
```

Add:
```apache
<VirtualHost *:80>
    ServerName yourapp.com
    ServerAlias www.yourapp.com
    DocumentRoot /var/www/purchase-pro/public

    <Directory /var/www/purchase-pro/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/purchase-pro-error.log
    CustomLog ${APACHE_LOG_DIR}/purchase-pro-access.log combined
</VirtualHost>
```

Enable site:
```bash
sudo a2ensite purchase-pro.conf
sudo a2dissite 000-default.conf
sudo systemctl restart apache2
```

#### 1.4 Create RDS Database (Same as ECS method)

### Step 2: Configure GitHub Actions

The workflow file `.github/workflows/deploy-ec2.yml` is already created.

### Step 3: Set Up GitHub Secrets

Add EC2 SSH key to GitHub secrets:
```bash
# Your private key content
cat your-key.pem
# Copy the entire content including:
# -----BEGIN RSA PRIVATE KEY-----
# ...
# -----END RSA PRIVATE KEY-----
```

Add to GitHub Secrets as `EC2_SSH_PRIVATE_KEY`

### Step 4: Create Environment File on EC2
```bash
sudo nano /var/www/.env
```

Add production configuration:
```env
CI_ENVIRONMENT = production

database.default.hostname = purchase-pro-db.xxxxx.rds.amazonaws.com
database.default.database = purchase_pro
database.default.username = admin
database.default.password = your-secure-password
database.default.DBDriver = MySQLi
database.default.DBPrefix =
database.default.port = 3306

app.baseURL = 'https://api.yourapp.com/'
```

### Step 5: Deploy

```bash
# Push to main branch
git push origin main

# GitHub Actions will automatically deploy to EC2
```

---

## 🔐 Security Best Practices

### 1. Database Security
```bash
# Create IAM database authentication
aws rds create-db-instance \
  --enable-iam-database-authentication

# Use Secrets Manager for database credentials
aws secretsmanager create-secret \
  --name purchase-pro/db-password \
  --secret-string "your-secure-password"
```

### 2. SSL/TLS Configuration
```bash
# Install Certbot on EC2
sudo apt install certbot python3-certbot-apache -y

# Obtain SSL certificate
sudo certbot --apache -d yourapp.com -d www.yourapp.com
```

### 3. Security Groups
```
Inbound Rules:
- Port 22 (SSH): Your IP only
- Port 80 (HTTP): 0.0.0.0/0 (redirect to HTTPS)
- Port 443 (HTTPS): 0.0.0.0/0
- Port 3306 (MySQL): Security group of EC2/ECS only

Outbound Rules:
- All traffic: 0.0.0.0/0
```

### 4. Environment Variables
- Use AWS Secrets Manager for sensitive data
- Never commit `.env` files
- Rotate credentials regularly

---

## 📊 Monitoring and Logging

### CloudWatch Logs
```bash
# Create log group for ECS
aws logs create-log-group --log-group-name /ecs/purchase-pro

# View logs
aws logs tail /ecs/purchase-pro --follow
```

### CloudWatch Alarms
```bash
# Create CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name purchase-pro-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

---

## 🔄 Rollback Procedure

### For ECS:
```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster purchase-pro-cluster \
  --service purchase-pro-service \
  --task-definition purchase-pro-task:PREVIOUS_REVISION
```

### For EC2:
The GitHub Actions workflow automatically creates backups and has rollback capability.

Manual rollback:
```bash
ssh ubuntu@ec2-host
cd /var/www
sudo systemctl stop apache2
sudo rm -rf purchase-pro
sudo mv purchase-pro-backup-YYYYMMDD-HHMMSS purchase-pro
sudo systemctl start apache2
```

---

## 💰 Cost Estimation (Monthly)

### ECS Deployment (Small Scale):
- ECS Fargate (1 task, 0.5 vCPU, 1GB): ~$15
- RDS MySQL (db.t3.micro): ~$15
- Application Load Balancer: ~$20
- S3 Storage (10GB): ~$0.25
- Data Transfer: ~$5-20
- **Total: ~$55-70/month**

### EC2 Deployment (Small Scale):
- EC2 t3.medium: ~$30
- RDS MySQL (db.t3.micro): ~$15
- S3 Storage: ~$0.25
- Data Transfer: ~$5-20
- **Total: ~$50-65/month**

---

## 🧪 Testing Deployment

### 1. Test Backend API
```bash
curl https://api.yourapp.com/api/health
```

### 2. Test Frontend
```bash
curl https://yourapp.com
```

### 3. Test Database Connection
```bash
# From EC2/ECS container
php -r "echo (new mysqli('RDS_HOST', 'USER', 'PASS', 'purchase_pro'))->ping() ? 'Connected' : 'Failed';"
```

---

## 📚 Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [GitHub Actions AWS Deployment](https://github.com/aws-actions)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

## 🆘 Troubleshooting

### ECS Tasks Not Starting
```bash
# Check task logs
aws ecs describe-tasks \
  --cluster purchase-pro-cluster \
  --tasks TASK_ID

# Check CloudWatch logs
aws logs tail /ecs/purchase-pro --follow
```

### EC2 Deployment Failing
```bash
# Check Apache logs
sudo tail -f /var/log/apache2/error.log

# Check PHP errors
sudo tail -f /var/www/purchase-pro/writable/logs/log-*.log
```

### Database Connection Issues
```bash
# Test connection from EC2/ECS
telnet RDS_ENDPOINT 3306

# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

---

**Ready to deploy? Start with the CI/CD workflow and let GitHub Actions handle the rest!** 🚀
