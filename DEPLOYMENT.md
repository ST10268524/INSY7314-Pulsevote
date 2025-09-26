# PulseVote Deployment Guide

## Overview
This guide covers the deployment of the PulseVote application with all security features, monitoring, and infrastructure components.

## Prerequisites
- Docker and Docker Compose
- Git
- SSL certificates (for production)
- Environment variables configured

## Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd PulseVote
cp env.example .env
# Edit .env with your configuration
```

### 2. Generate SSL Certificates (Development)
```bash
cd backend/certs
openssl genrsa -out server.key 2048
openssl req -new -x509 -key server.key -out server.crt -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

### 3. Start the Application
```bash
docker-compose up -d
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090

## Security Features Implemented

### 1. SSL/TLS Support
- HTTPS server on port 5443
- Automatic certificate detection
- Production-ready SSL configuration

### 2. Authentication & Authorization
- JWT-based authentication
- Role-based access control (user, moderator, admin)
- Account lockout after failed attempts
- Secure password hashing with bcrypt

### 3. Security Headers
- Helmet.js for security headers
- Content Security Policy (CSP)
- CORS configuration
- XSS protection

### 4. Rate Limiting
- General API rate limiting (100 requests/15min)
- Stricter auth rate limiting (5 requests/15min)
- IP-based limiting

### 5. Input Validation
- Request validation
- MongoDB schema validation
- SQL injection prevention

## Monitoring & Logging

### 1. Application Logging
- Winston logger with multiple transports
- Structured JSON logging
- Log rotation and retention
- Security event logging
- Application event logging

### 2. Monitoring Stack
- Prometheus for metrics collection
- Grafana for visualization
- Health checks for all services
- Performance monitoring

### 3. Log Files
- Application logs: `backend/logs/application-*.log`
- Error logs: `backend/logs/error-*.log`
- Access logs: `backend/logs/access-*.log`

## Development

### 1. Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### 2. Testing
```bash
# Backend tests
cd backend
npm test
npm run test:watch

# Linting
npm run lint
npm run lint:fix
```

### 3. Building
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Production Deployment

### 1. Environment Configuration
```bash
# Copy and edit environment file
cp env.example .env

# Required production variables:
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret
MONGO_ROOT_PASSWORD=your-secure-mongodb-password
GRAFANA_PASSWORD=your-grafana-password
```

### 2. SSL Certificates
- Use certificates from a trusted CA (Let's Encrypt, DigiCert, etc.)
- Place certificates in `backend/certs/`
- Ensure proper file permissions

### 3. Database Security
- Change default MongoDB credentials
- Enable MongoDB authentication
- Use strong passwords
- Consider MongoDB Atlas for managed database

### 4. Container Security
- Run containers as non-root user
- Use multi-stage builds
- Scan images for vulnerabilities
- Keep base images updated

## CI/CD Pipeline

### 1. GitHub Actions
- Automated testing on pull requests
- Security scanning with Trivy
- Docker image building and pushing
- Deployment to staging/production

### 2. Pipeline Stages
1. **Lint & Test**: ESLint, unit tests, coverage
2. **Security Scan**: Vulnerability scanning
3. **Build & Push**: Docker image creation
4. **Deploy**: Staging and production deployment

## Monitoring & Alerting

### 1. Grafana Dashboards
- Application performance metrics
- Error rates and response times
- User activity and security events
- Database performance

### 2. Prometheus Metrics
- HTTP request metrics
- Application performance metrics
- System resource usage
- Custom business metrics

### 3. Alerting Rules
- High error rates
- Slow response times
- Security events
- System resource usage

## Troubleshooting

### 1. Common Issues
- **SSL Certificate Errors**: Check certificate paths and permissions
- **Database Connection**: Verify MongoDB credentials and network
- **Rate Limiting**: Check IP whitelisting for monitoring tools
- **Log Permissions**: Ensure log directory is writable

### 2. Health Checks
```bash
# Check all services
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Check health endpoints
curl http://localhost:5000/
curl http://localhost:3000/
```

### 3. Performance Tuning
- Adjust rate limiting based on traffic
- Optimize database queries
- Configure log retention policies
- Monitor memory and CPU usage

## Security Checklist

- [ ] SSL certificates configured
- [ ] Strong JWT secret set
- [ ] Database credentials changed
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Input validation implemented
- [ ] Logging and monitoring active
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Incident response plan

## Support

For issues and questions:
1. Check the logs first
2. Review the troubleshooting section
3. Check GitHub issues
4. Contact the development team

## License

This project is licensed under the MIT License.
