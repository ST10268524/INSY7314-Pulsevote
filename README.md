# PulseVote

PulseVote is a modern, full-stack polling application built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides a secure and user-friendly platform for creating, managing, and participating in online polls with real-time voting capabilities.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with registration and login
- **Poll Management**: Create, view, and vote on polls with multiple options
- **Real-time Voting**: Instant vote counting and display
- **User Roles**: Role-based access control (user, moderator, admin)

### Security Features
- **Password Hashing**: Bcrypt encryption for secure password storage
- **Account Locking**: Automatic account lockout after failed login attempts
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin resource sharing configuration
- **Security Headers**: Helmet.js for security headers and CSP

### Technical Features
- **RESTful API**: Well-documented API with Swagger/OpenAPI
- **Database**: MongoDB with Mongoose ODM
- **Logging**: Comprehensive logging with Winston
- **Docker Support**: Containerized deployment with Docker Compose
- **Monitoring**: Prometheus and Grafana integration
- **HTTPS Support**: SSL/TLS encryption for production

## 📁 Project Structure

```
PulseVote/
├── backend/                    # Express.js API server
│   ├── config/                # Configuration files
│   │   ├── db.js             # Database connection
│   │   ├── logger.js         # Logging configuration
│   │   └── swagger.js        # API documentation setup
│   ├── middleware/           # Custom middleware
│   │   └── authMiddleware.js # Authentication & authorization
│   ├── models/               # MongoDB models
│   │   ├── User.js          # User schema and methods
│   │   └── Poll.js          # Poll schema
│   ├── routes/               # API routes
│   │   ├── authRoutes.js    # Authentication endpoints
│   │   └── pollRoutes.js    # Poll management endpoints
│   ├── __tests__/           # Test files
│   ├── logs/                # Application logs
│   ├── certs/               # SSL certificates (production)
│   ├── server.js            # Main server file
│   └── package.json         # Backend dependencies
├── frontend/                  # React.js client application
│   ├── src/
│   │   ├── pages/           # React components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── PollList.jsx
│   │   │   └── CreatePoll.jsx
│   │   ├── api.js           # API client configuration
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Application entry point
│   └── package.json         # Frontend dependencies
├── grafana/                  # Monitoring dashboards
├── prometheus/              # Metrics configuration
├── docker-compose.yml       # Container orchestration
├── env.example             # Environment variables template
└── README.md               # Project documentation
```

## 🛠️ Technology Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Winston**: Logging library
- **Swagger**: API documentation
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Jest**: Testing framework

### Frontend
- **React**: JavaScript library for building user interfaces
- **Vite**: Build tool and development server
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **ESLint**: Code linting and formatting

### DevOps & Monitoring
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring and visualization
- **Nginx**: Reverse proxy and static file serving

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Docker (optional)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PulseVote
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

   Required environment variables:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/pulsevote
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   
   # Application URLs
   CLIENT_URL=http://localhost:5173
   VITE_API_URL=http://localhost:5000/api
   ```

### Local Development

#### Option 1: Manual Setup

1. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGO_URI in .env file
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend will be available at: `http://localhost:5000`
   API Documentation: `http://localhost:5000/api-docs`

3. **Start Frontend Application**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will be available at: `http://localhost:5173`

#### Option 2: Docker Setup

1. **Build and Start All Services**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - MongoDB on port 27017
   - Backend API on port 5000
   - Frontend on port 3000
   - Grafana on port 3001
   - Prometheus on port 9090

2. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs
   - Grafana: http://localhost:3001 (admin/admin)
   - Prometheus: http://localhost:9090

## 📚 API Documentation

The API is fully documented using Swagger/OpenAPI 3.0. Access the interactive documentation at:
- Local: `http://localhost:5000/api-docs`
- Production: `https://your-domain.com/api-docs`

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

#### Polls
- `GET /api/polls` - Get all polls
- `POST /api/polls` - Create new poll (authenticated)
- `POST /api/polls/:id/vote` - Vote on poll

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔒 Security Features

- **Authentication**: JWT-based authentication with 7-day expiration
- **Authorization**: Role-based access control
- **Password Security**: Bcrypt hashing with salt rounds
- **Account Protection**: Automatic lockout after 5 failed attempts
- **Rate Limiting**: 100 requests per 15 minutes (general), 5 requests per 15 minutes (auth)
- **Security Headers**: Helmet.js with Content Security Policy
- **CORS**: Configured for specific origins
- **Input Validation**: Server-side validation for all inputs

## 📊 Monitoring & Logging

### Logging
- **Application Logs**: Winston with daily rotation
- **Access Logs**: Morgan HTTP request logging
- **Error Logs**: Separate error log files
- **Security Logs**: Authentication and authorization events

### Monitoring
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and alerting
- **Health Checks**: Container health monitoring
- **Performance Metrics**: Response times, error rates, etc.

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export MONGO_URI=mongodb://your-production-db
   export JWT_SECRET=your-production-secret
   ```

2. **SSL Certificates**
   ```bash
   # Place SSL certificates in backend/certs/
   backend/certs/server.crt
   backend/certs/server.key
   ```

3. **Docker Deployment**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend port | `5000` |
| `HTTPS_PORT` | HTTPS port | `5443` |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` |
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `LOG_LEVEL` | Logging level | `info` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **PulseVote Team** - *Initial work* - [PulseVote](https://github.com/pulsevote)

## 🙏 Acknowledgments

- Built as part of INSY7314 3D course requirements
- Inspired by modern polling applications
- Uses industry-standard security practices
- Follows RESTful API design principles

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api-docs`

---

**PulseVote** - Making polling simple, secure, and scalable.
