# VELORA-Secure Chat Application

A secure, AI-monitored chat platform with advanced facial recognition authentication.

## Overview

VELORA combines secure messaging with cutting-edge authentication and AI-powered monitoring to provide a safe and reliable communication platform. The application features real-time messaging, facial recognition authentication with liveness detection, and intelligent content monitoring.

## Features

### Secure Chat Application
- Real-time messaging with end-to-end encryption
- Modern, responsive UI
- AI-powered content monitoring
- User presence detection
- Message history and persistence

### Advanced Authentication System
- Facial recognition-based login
- CAPTCHA verification
- Eye blink detection for liveness verification
- Secure token-based session management

### AI Monitoring System
- Real-time sentiment analysis
- Keyword monitoring for inappropriate content
- Behavioral pattern recognition
- Dynamic performance optimization

## Tech Stack

### Frontend
- React.js
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT Authentication

### Authentication System
- Python
- OpenCV
- face-recognition
- pymongo

### Databases
- PostgreSQL (chat data)
- MongoDB (authentication data)

### AI/ML
- spaCy
- TextBlob
- Custom NLP models

### DevOps
- Docker
- Docker Compose

## Prerequisites

- Node.js (v18 or higher)
- Python 3.8+
- Docker and Docker Compose
- PostgreSQL
- MongoDB

## Installation

1. Clone the repository:

```
git clone https://github.com/yourusername/velora-secure-chat.git
cd velora-secure-chat
```

2. Install Frontend dependencies:

```
cd frontend
npm install
```

3. Install Backend dependencies:

```
cd backend
npm install
```

4. Install Python dependencies:

```bash
cd ../auth-service
pip install -r requirements.txt
```

5. Set up environment variables:
```bash
# Create .env files in frontend, backend, and auth-service directories
cp .env.example .env
```

## Running the Application

### Using Docker (Recommended)

1. Build and start all services:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Authentication Service: http://localhost:5001

### Manual Setup

1. Start the frontend development server:
```bash
cd frontend
npm run dev
```

2. Start the backend server:
```bash
cd backend
npm run dev
```

3. Start the authentication service:
```bash
cd auth-service
python app.py
```

## Configuration

Update the following environment variables in your .env files:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AUTH_URL=http://localhost:5001

# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/velora
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb://localhost:27017/velora

# Authentication Service
MONGODB_URI=mongodb://localhost:27017/velora
FACE_RECOGNITION_THRESHOLD=0.6
```

## Development

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git add .
git commit -m "Add your feature description"
```

3. Push your changes:
```bash
git push origin feature/your-feature-name
```

## Testing

Run tests for each service:

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# Authentication service tests
cd auth-service
python -m pytest
```

## Security Considerations

- All sensitive data is encrypted at rest and in transit
- Face recognition data is stored securely in MongoDB
- JWT tokens are used for session management
- Regular security audits are performed
- AI monitoring system runs in isolation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Authors

- Aiswarya K V
- Amjed Usman
- Aarsha C P
- Yadurajakrishnan M

## Acknowledgments

- List any third-party libraries or resources used
- Credits to contributors and inspiration sources

