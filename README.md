# 🗺️ Tourify - Travel Planning Platform

Tourify is a comprehensive travel planning platform that helps users create, manage, and share their travel experiences. The application features blog creation, tour planning, destination management, and interactive maps.

## 🚀 Features

- **Blog System**: Create and share travel blogs with photos and comments
- **Tour Planning**: Design custom tours with multiple destinations
- **Interactive Maps**: Visualize routes and destinations using Mapbox
- **Hotel & Transport Management**: Select accommodations and transportation options
- **User Authentication**: Secure login and registration system
- **Photo Upload**: Share travel photos with your blogs
- **Route Optimization**: Plan efficient travel routes

## 🏗️ Architecture

The project follows a microservices architecture with:

- **Frontend**: React.js with modern UI components
- **Backend**: Spring Boot REST API with Java 17
- **Database**: PostgreSQL for data persistence
- **Containerization**: Docker for easy deployment

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

- **Java 17** or higher
- **Node.js 16** or higher
- **Docker** and **Docker Compose**
- **PostgreSQL** (if running locally)
- **Maven** (for backend development)

## 🛠️ Installation & Setup

### Option 1: Using Docker (Recommended)

The easiest way to run the entire application is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd CSE_408

# Start all services
docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans
docker image prune -af
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Check if all services are running
docker-compose ps
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5430

### Option 2: Local Development Setup

#### 1. Database Setup

First, set up PostgreSQL:

```bash
# Install PostgreSQL (if not already installed)
# For Windows: Download from https://www.postgresql.org/download/windows/
# For macOS: brew install postgresql
# For Ubuntu: sudo apt-get install postgresql postgresql-contrib

# Create database and user
psql -U postgres
CREATE DATABASE tourify;
CREATE USER tourify_user WITH PASSWORD 'tourify123';
GRANT ALL PRIVILEGES ON DATABASE tourify TO tourify_user;
\q
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend/tourify

# Install dependencies and run
mvn clean install
mvn spring-boot:run
```

The backend will start on http://localhost:8080

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will start on http://localhost:3000

## 🗄️ Database Setup

The application uses PostgreSQL. If you're running locally, you'll need to set up the database:

```bash
# Connect to PostgreSQL
psql -U postgres -d tourify

# Run the SQL scripts (in order)
\i tourify.sql
\i hotel_data.sql
\i transport_tables.sql
\i enhanced_blog_schema.sql
\i add_cover_photo_migration.sql
\i add_starting_point_migration.sql
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8080
```

### Backend Configuration

The backend configuration is in `backend/tourify/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/tourify
spring.datasource.username=tourify_user
spring.datasource.password=tourify123

# Server
server.port=8080

# File Upload
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

## 🧪 Testing

### Backend Tests

```bash
cd backend/tourify
mvn test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📁 Project Structure

```
CSE_408/
├── backend/                 # Spring Boot backend
│   └── tourify/
│       ├── src/main/java/   # Java source code
│       ├── src/main/resources/ # Configuration files
│       └── pom.xml          # Maven dependencies
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   └── context/        # React context
│   └── package.json        # Node.js dependencies
├── docker-compose.yml       # Docker configuration
└── *.sql                   # Database scripts
```

## 🚀 Available Scripts

### Backend (Maven)
```bash
mvn clean install          # Build the project
mvn spring-boot:run       # Run the application
mvn test                  # Run tests
```

### Frontend (npm)
```bash
npm install               # Install dependencies
npm start                 # Start development server
npm build                 # Build for production
npm test                  # Run tests
```

### Docker
```bash
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose logs       # View logs
docker-compose ps         # Check service status
```

## 🔍 API Endpoints

The backend provides REST APIs for:

- **Authentication**: `/api/auth/*`
- **Blogs**: `/api/blogs/*`
- **Tours**: `/api/tours/*`
- **Destinations**: `/api/destinations/*`
- **Hotels**: `/api/hotels/*`
- **Transport**: `/api/transport/*`
- **Profile**: `/api/profile/*`

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Check what's using the port
   netstat -ano | findstr :8080
   # Kill the process
   taskkill /PID <process_id> /F
   ```

2. **Database connection issues**:
   - Ensure PostgreSQL is running
   - Check database credentials in `application.properties`
   - Verify database exists: `psql -U tourify_user -d tourify`

3. **Docker issues**:
   ```bash
   # Clean up Docker containers
   docker-compose down -v
   docker system prune -a
   # Rebuild and start
   docker-compose up --build
   ```

4. **Frontend build issues**:
   ```bash
   # Clear npm cache
   npm cache clean --force
   # Remove node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📝 Development Guidelines

- Use meaningful commit messages
- Follow the existing code style
- Add tests for new features
- Update documentation when adding new features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of BUET CSE-408: Software Development Sessional coursework.

---

**Happy Traveling! 🌍✈️**
