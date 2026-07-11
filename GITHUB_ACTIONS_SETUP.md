# GitHub Actions Setup Guide

Complete guide to set up CI/CD with GitHub Actions for Purchase Pro.

## 📋 Overview

This repository includes 4 GitHub Actions workflows:

1. **CI Tests** (`.github/workflows/ci-tests.yml`)
   - Runs on every push and pull request
   - Tests backend (PHP) and frontend (React)
   - Linting and code quality checks
   - Docker build verification
   - Security scanning

2. **Docker Publish** (`.github/workflows/docker-publish.yml`)
   - Builds and publishes Docker images
   - Pushes to Docker Hub and GitHub Container Registry
   - Multi-architecture support (amd64, arm64)
   - Vulnerability scanning

3. **AWS ECS Deploy** (`.github/workflows/deploy-aws.yml`)
   - Deploys to AWS ECS (Elastic Container Service)
   - Pushes images to ECR
   - Updates ECS service
   - Runs database migrations

4. **AWS EC2 Deploy** (`.github/workflows/deploy-ec2.yml`)
   - Deploys to AWS EC2 instances
   - SSH-based deployment
   - Automatic backups and rollback
   - Health checks

---

## 🔐 Required GitHub Secrets

### For All Workflows

Navigate to: **Repository → Settings → Secrets and variables → Actions**

#### AWS Credentials (Required for AWS deployments)
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalrXU...
```

**How to create:**
1. Go to AWS Console → IAM
2. Create a new user: `github-actions-deploy`
3. Attach policies:
   - `AmazonEC2ContainerRegistryFullAccess` (for ECR)
   - `AmazonECS_FullAccess` (for ECS)
   - `AmazonS3FullAccess` (for S3)
   - `CloudFrontFullAccess` (for CloudFront)
4. Create access key
5. Copy Access Key ID and Secret Access Key

---

### For Docker Hub Publishing

```
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password-or-token
```

**How to create:**
1. Go to [Docker Hub](https://hub.docker.com/)
2. Account Settings → Security → New Access Token
3. Copy the token (you can only see it once!)

---

### For AWS ECS Deployment

```
ECR_REPOSITORY=purchase-pro
ECS_CLUSTER=purchase-pro-cluster
ECS_SERVICE=purchase-pro-service
ECS_TASK_DEFINITION=purchase-pro-task
SUBNET_IDS=subnet-xxx,subnet-yyy
SECURITY_GROUP_ID=sg-xxxxx
S3_BUCKET_NAME=purchase-pro-frontend
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
BACKEND_URL=https://api.yourapp.com
FRONTEND_URL=https://yourapp.com
```

**How to get these values:**
- ECR Repository: AWS Console → ECR → Repositories
- ECS Cluster: AWS Console → ECS → Clusters
- ECS Service: AWS Console → ECS → Services
- Subnets: AWS Console → VPC → Subnets
- Security Group: AWS Console → EC2 → Security Groups
- S3 Bucket: AWS Console → S3 → Buckets
- CloudFront: AWS Console → CloudFront → Distributions

---

### For AWS EC2 Deployment

```
EC2_INSTANCE_ID=i-0123456789abcdef
EC2_HOST=ec2-xx-xx-xx-xx.compute.amazonaws.com
EC2_USER=ubuntu
EC2_SSH_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

**How to get these values:**
1. **Instance ID**: AWS Console → EC2 → Instances
2. **Host**: Public IPv4 DNS of your EC2 instance
3. **User**: `ubuntu` for Ubuntu, `ec2-user` for Amazon Linux
4. **SSH Key**: 
   ```bash
   # View your private key
   cat ~/.ssh/your-key.pem
   
   # Copy the ENTIRE content including the BEGIN and END lines
   ```

---

### For Database Configuration

```
RDS_HOSTNAME=purchase-pro-db.xxxxx.ap-south-1.rds.amazonaws.com
RDS_DATABASE=purchase_pro
RDS_USERNAME=admin
RDS_PASSWORD=your-secure-password
```

**How to get:**
- RDS Hostname: AWS Console → RDS → Databases → Endpoint
- Database name: What you specified during RDS creation
- Username/Password: Your RDS credentials

---

## 🔧 Workflow Configuration

### 1. Enable GitHub Actions

If not already enabled:
1. Go to **Repository → Settings → Actions → General**
2. Under "Actions permissions", select **Allow all actions and reusable workflows**
3. Click **Save**

### 2. Configure Workflow Permissions

1. Go to **Repository → Settings → Actions → General**
2. Scroll to "Workflow permissions"
3. Select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

### 3. Set Up Environments (Optional but Recommended)

1. Go to **Repository → Settings → Environments**
2. Click **New environment**
3. Create environments:
   - `staging`
   - `production`
4. For each environment:
   - Add environment-specific secrets
   - Set up required reviewers for production
   - Configure deployment branches

---

## 🚀 How to Use the Workflows

### CI Tests (Automatic)

**Triggers:** 
- Every push to `main` or `develop` branches
- Every pull request to `main` or `develop`

**What it does:**
- Runs PHPUnit tests
- Runs React tests
- Lints code
- Builds Docker image
- Security scan

**No configuration needed** - just push your code!

```bash
git push origin main
# or
git push origin develop
```

---

### Docker Publish (Automatic)

**Triggers:**
- Push to `main` or `develop`
- Version tags (e.g., `v1.0.0`)
- Manual trigger

**What it does:**
- Builds Docker image
- Pushes to Docker Hub
- Pushes to GitHub Container Registry
- Multi-architecture build
- Vulnerability scan

**Setup:**
1. Add `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets
2. Push to main branch:
```bash
git tag v1.0.0
git push origin v1.0.0
```

**Pull the image:**
```bash
docker pull nagalimited/purchase-pro:latest
# or
docker pull ghcr.io/naga-limited/purchase_pro:latest
```

---

### AWS ECS Deployment

**Triggers:**
- Push to `main` or `production` branches
- Manual trigger via GitHub UI

**Manual trigger:**
1. Go to **Repository → Actions**
2. Select **Deploy to AWS** workflow
3. Click **Run workflow**
4. Select environment (staging/production)
5. Click **Run workflow**

**Or via GitHub CLI:**
```bash
gh workflow run deploy-aws.yml -f environment=production
```

**What it does:**
1. Builds Docker image
2. Pushes to AWS ECR
3. Builds React frontend
4. Deploys to S3
5. Invalidates CloudFront cache
6. Updates ECS service
7. Runs database migrations
8. Health checks

---

### AWS EC2 Deployment

**Triggers:**
- Push to `main` branch
- Manual trigger

**What it does:**
1. Builds React frontend
2. Creates deployment package
3. Uploads to EC2 via SSH
4. Stops Apache
5. Backs up current deployment
6. Extracts new deployment
7. Installs dependencies
8. Runs migrations
9. Starts Apache
10. Health check
11. Rollback on failure

**Manual trigger:**
```bash
gh workflow run deploy-ec2.yml
```

---

## 📊 Monitoring Workflows

### View Workflow Status

1. Go to **Repository → Actions**
2. See all workflow runs
3. Click on a run to see details
4. Click on a job to see logs

### Check Deployment Status

```bash
# Via GitHub CLI
gh run list --workflow=deploy-aws.yml
gh run view <run-id>
gh run watch <run-id>
```

### View Logs

```bash
gh run view <run-id> --log
```

---

## 🛠️ Customizing Workflows

### Change Deployment Branch

Edit the workflow file:

```yaml
on:
  push:
    branches:
      - main          # Change this
      - production    # Or add more branches
```

### Change AWS Region

Edit the workflow file:

```yaml
env:
  AWS_REGION: ap-south-1  # Change to your region
```

### Add Slack Notifications

Add this step to any workflow:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Email Notifications

GitHub automatically sends email notifications for workflow failures to the committer.

To customize:
1. Go to **GitHub Settings** (not repository settings)
2. Notifications → Actions
3. Configure as needed

---

## 🔍 Troubleshooting

### Workflow Not Triggering

**Check:**
1. Workflow file is in `.github/workflows/` directory
2. YAML syntax is correct (use yamllint)
3. Branch name matches the trigger
4. GitHub Actions is enabled
5. Workflow permissions are correct

### Secrets Not Working

**Check:**
1. Secret name matches exactly (case-sensitive)
2. No spaces in secret name
3. Secret is in correct scope (repository/environment)
4. Secret value doesn't have extra spaces

**Test secrets:**
```yaml
- name: Test Secrets
  run: |
    echo "AWS Key exists: ${{ secrets.AWS_ACCESS_KEY_ID != '' }}"
    echo "Docker user exists: ${{ secrets.DOCKER_USERNAME != '' }}"
```

### Docker Build Failing

**Common issues:**
- Not enough disk space: Increase runner disk space or clean cache
- Dependency issues: Check `composer.lock` and `package-lock.json`
- Network timeout: Add retry logic

**Debug:**
```yaml
- name: Build Docker Image
  run: |
    docker build --progress=plain --no-cache .
```

### AWS Deployment Failing

**Check:**
1. AWS credentials are correct
2. IAM user has required permissions
3. Security groups allow access
4. Subnets are in correct VPC
5. Task definition exists

**Debug:**
```bash
# Check ECS service
aws ecs describe-services --cluster purchase-pro-cluster --services purchase-pro-service

# Check task logs
aws logs tail /ecs/purchase-pro --follow
```

### EC2 SSH Connection Failing

**Check:**
1. EC2 instance is running
2. Security group allows SSH from GitHub Actions IPs
3. SSH key is correct (entire key including headers)
4. Host is correct (public IP or DNS)

**Debug:**
Add this to workflow:
```yaml
- name: Test SSH Connection
  run: |
    ssh -vvv -i ~/.ssh/deploy_key.pem -o StrictHostKeyChecking=no ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }} "echo 'Connected'"
```

---

## 🎯 Best Practices

### 1. Use Environments
```yaml
environment:
  name: production
  url: https://yourapp.com
```

### 2. Add Required Reviewers
- Go to Settings → Environments → production
- Add required reviewers
- No one can deploy to production without approval

### 3. Use Manual Approvals
```yaml
environment: production
```

### 4. Separate Staging and Production
```yaml
on:
  push:
    branches:
      - develop    # Deploy to staging
      - main       # Deploy to production
```

### 5. Use Branch Protection
- Settings → Branches → Add rule
- Require status checks to pass
- Require pull request reviews

### 6. Cache Dependencies
```yaml
- uses: actions/cache@v3
  with:
    path: vendor
    key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
```

### 7. Fail Fast
```yaml
strategy:
  fail-fast: true
```

### 8. Use Matrix Builds (for multiple PHP versions)
```yaml
strategy:
  matrix:
    php-version: [8.0, 8.1, 8.2]
```

---

## 📈 Advanced Configuration

### Deploy Only on Version Tags

```yaml
on:
  push:
    tags:
      - 'v*.*.*'
```

### Deploy Different Branches to Different Environments

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Set environment
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "ENV=production" >> $GITHUB_ENV
          else
            echo "ENV=staging" >> $GITHUB_ENV
          fi
```

### Rollback on Failure

Already implemented in EC2 workflow. For ECS:

```yaml
- name: Rollback on Failure
  if: failure()
  run: |
    aws ecs update-service \
      --cluster ${{ env.ECS_CLUSTER }} \
      --service ${{ env.ECS_SERVICE }} \
      --force-new-deployment \
      --task-definition previous-revision
```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Actions](https://github.com/aws-actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

---

## ✅ Setup Checklist

- [ ] GitHub Actions enabled
- [ ] Workflow permissions configured
- [ ] All required secrets added
- [ ] AWS infrastructure ready (ECS or EC2)
- [ ] RDS database created
- [ ] S3 bucket created
- [ ] Docker Hub account (optional)
- [ ] Test workflows manually
- [ ] Set up environments (staging/production)
- [ ] Configure required reviewers for production
- [ ] Test deployment to staging
- [ ] Deploy to production

---

**Ready to deploy?** Push your code and let GitHub Actions do the magic! 🚀

**Need help?** Check the [troubleshooting section](#troubleshooting) or create an issue.
