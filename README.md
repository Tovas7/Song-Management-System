# Song Management Application

A full-stack MERN application for managing a music library with comprehensive CRUD operations, statistics tracking, and modern development practices.

## Project Structure

```
├── backend/                 # Express.js API server
│   ├── src/                # Source code
│   ├── package.json        # Backend dependencies
│   ├── Dockerfile          # Backend container config
│   └── .env                # Environment variables
├── frontend/               # React TypeScript application
│   ├── src/                # Source code
│   ├── package.json        # Frontend dependencies
│   ├── Dockerfile          # Frontend container config
│   └── .env                # Environment variables
├── docker-compose.yml      # Multi-container setup
└── README.md              # This file
```

## Technology Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **MongoDB** with **Mongoose** - Database and ODM
- **Jest** + **fast-check** - Testing framework with property-based testing
- **Docker** - Containerization

### Frontend
- **React 18** with **TypeScript** - UI framework with type safety
- **Vite** - Build tool and development server
- **Redux Toolkit** - State management
- **Redux-Saga** - Side effects management
- **Emotion** + **Styled System** - CSS-in-JS styling
- **Jest** + **React Testing Library** - Testing framework

## Development Setup

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- MongoDB (if running locally)

### Quick Start with Docker

1. Clone the repository
2. Start all services:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Local Development

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/song-management
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

## API Endpoints

- `GET /health` - Health check
- `GET /api` - API information
- More endpoints will be added in subsequent development phases

## Features (Planned)

- ✅ Project structure and development environment
- ⏳ Song CRUD operations
- ⏳ Real-time statistics
- ⏳ Genre filtering
- ⏳ Responsive UI design
- ⏳ Property-based testing
- ⏳ Docker containerization

## Development Workflow

This project follows a spec-driven development approach with:
1. Requirements gathering with EARS patterns
2. Comprehensive design documentation
3. Property-based testing for correctness
4. Incremental implementation

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

MIT
