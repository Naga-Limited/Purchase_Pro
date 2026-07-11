# Purchase Pro - Gate Management System

A comprehensive Purchase Management and Gate Management System built with CodeIgniter 4 (PHP) backend and React frontend. The system manages vehicle gate entries/exits, weighment operations, quality control, courier management, and warehouse operations.

## 🚀 Features

- **Gate Management (GatePro Module)**
  - Vehicle entry/exit tracking
  - Trip sheet management
  - Color token system for vehicle identification
  - CCTV camera integration
  - Real-time vehicle status updates

- **Weighment Management**
  - Automated weighbridge integration
  - Weight tracking for incoming/outgoing materials
  - Quality control integration

- **Courier Management**
  - Inbound/outbound courier tracking
  - Delivery status management
  - Automated notifications

- **Warehouse Operations**
  - Inventory management
  - Quality control (QC) tracking
  - Material movement tracking

- **Admin Dashboard**
  - User management with role-based access control
  - Real-time reporting and analytics
  - Master data configuration

## 🛠️ Technology Stack

### Backend
- **Framework**: CodeIgniter 4 (PHP 7.3+ / 8.0+)
- **Authentication**: JWT (Firebase PHP-JWT)
- **Database**: MySQL 5.7+
- **API Architecture**: RESTful API

### Frontend
- **Framework**: React 17
- **UI Library**: Reactstrap, Bootstrap 4
- **State Management**: Redux
- **Charts**: ApexCharts, Chart.js
- **Build Tool**: React App Rewired

## 📋 Prerequisites

- PHP >= 7.3 (PHP 8.0+ recommended)
- Composer >= 2.0
- Node.js >= 14.x
- npm or yarn
- MySQL >= 5.7 or MariaDB >= 10.3
- Apache/Nginx web server

## 🔧 Installation

### Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/Naga-Limited/Purchase_Pro.git
cd Purchase_Pro
```

2. **Start Docker containers**
```bash
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- phpMyAdmin: http://localhost:8081

### Manual Installation

#### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/Naga-Limited/Purchase_Pro.git
cd Purchase_Pro
```

2. **Install PHP dependencies**
```bash
composer install
```

3. **Configure environment**
```bash
cp dummy.env .env
```

4. **Edit `.env` file with your database credentials**
```env
CI_ENVIRONMENT = development

database.default.hostname = localhost
database.default.database = purchase_pro
database.default.username = root
database.default.password = your_password
database.default.DBDriver = MySQLi
database.default.DBPrefix =
database.default.port = 3306
```

5. **Create database**
```bash
mysql -u root -p
CREATE DATABASE purchase_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

6. **Import database schema** (if available)
```bash
mysql -u root -p purchase_pro < database.sql
```

7. **Set proper permissions**
```bash
chmod -R 755 writable/
chmod -R 755 public/
```

8. **Start PHP development server**
```bash
php spark serve
```

Or configure Apache/Nginx to point to the `public` folder.

#### Frontend Setup

1. **Navigate to UI folder**
```bash
cd UI
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure API endpoint**

Edit `UI/src/setupProxy.js` or relevant config file to set the backend API URL:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
```

4. **Start development server**
```bash
npm start
# or
yarn start
```

5. **Build for production**
```bash
npm run build
# or
yarn build
```

The build will be created in `public/react/` directory.

## 🐳 Docker Configuration

### Docker Compose Services

- **app** - PHP 8.1 with Apache
- **db** - MySQL 8.0
- **phpmyadmin** - Database management interface
- **node** - React development server

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
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

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Access PHP container
docker-compose exec app bash

# Access database
docker-compose exec db mysql -u root -p
```

## 📁 Project Structure

```
Purchase_Pro/
├── app/                      # CodeIgniter 4 Application
│   ├── Config/              # Configuration files
│   ├── Controllers/         # API Controllers
│   │   └── Api/            # REST API Controllers
│   │       ├── GatePro/    # Gate management controllers
│   │       └── ...
│   ├── Models/             # Database models
│   ├── Views/              # Server-side views
│   ├── Filters/            # Request filters
│   ├── Libraries/          # Custom libraries
│   └── Helpers/            # Helper functions
├── api/                     # Legacy/Standalone API endpoints
│   ├── GatePro/
│   ├── warehouse/
│   └── ...
├── UI/                      # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── redux/
│   │   ├── views/
│   │   └── router/
│   └── package.json
├── public/                  # Public web root
│   ├── index.php           # Application entry point
│   ├── react/              # Built React app
│   └── uploads/
├── writable/               # Writable directories (logs, cache, uploads)
├── vendor/                 # PHP dependencies
├── docker-compose.yml      # Docker configuration
├── Dockerfile             # PHP container image
└── .env                   # Environment configuration
```

## 🔑 API Documentation

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Key API Endpoints

#### GatePro Module

**Get Trip Sheet Details**
```
GET /api/GatePro/master/getTripsheetDetailsForFG
Body: { "Vehicle_Number": "TN57BF3425" }
```

**Add Gate In Info**
```
POST /api/GatePro/Gate/addGateInInfo
Body: {
  "userInfoId": "1",
  "movementType": "LOADING",
  "moduleType": "FG-SALES",
  "vehicleNo": "TN57BF3425",
  ...
}
```

**Update Vehicle Status**
```
POST /api/GatePro/Gate/updateVehicleStatus
Body: {
  "gateInOutInfoId": 1,
  "vehicelStatusId": 1,
  "userInfoId": 1
}
```

See `app/detailsOfApi.lock` for complete API documentation.

## 🧪 Testing

### Backend Tests
```bash
# Run PHPUnit tests
composer test

# Run specific test
./vendor/bin/phpunit tests/YourTest.php
```

### Frontend Tests
```bash
cd UI
npm test
```

## 🚀 Deployment

### Production Build

1. **Backend**
```bash
# Update .env for production
CI_ENVIRONMENT = production

# Clear cache
php spark cache:clear

# Set permissions
chmod -R 755 writable/
```

2. **Frontend**
```bash
cd UI
npm run build
```

The build output will be placed in `public/react/`.

### Web Server Configuration

#### Apache

Ensure `.htaccess` is enabled and `mod_rewrite` is active. The provided `.htaccess` file should work out of the box.

#### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/Purchase_Pro/public;
    
    index index.php index.html;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

## 🔒 Security Considerations

- Change default database credentials in production
- Set strong JWT secret key
- Enable HTTPS in production
- Configure CORS properly
- Disable directory listing
- Keep dependencies updated
- Use environment variables for sensitive data

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports

Please report bugs via [GitHub Issues](https://github.com/Naga-Limited/Purchase_Pro/issues).

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API documentation in `app/detailsOfApi.lock`

## 🔄 Version History

- **v6.3.0** - Current version with React frontend
- See commit history for detailed changes

## 📚 Additional Resources

- [CodeIgniter 4 Documentation](https://codeigniter4.github.io/userguide/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Reactstrap Components](https://reactstrap.github.io/)

---

**Built with ❤️ by Naga Limited**
