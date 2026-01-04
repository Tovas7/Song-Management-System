# Design Document

## Overview

The song management application is a full-stack MERN application that provides comprehensive CRUD operations for managing a music library. The system consists of a React TypeScript frontend with Redux state management, an Express.js RESTful API backend, and a MongoDB database. The application emphasizes real-time updates, comprehensive statistics, and modern development practices including containerization.

## Architecture

The application follows a clean, separated architecture with distinct layers and clear separation of concerns:

### Deployment Architecture
- **Frontend**: React TypeScript application built with Vite, deployed separately (e.g., Netlify, Vercel)
- **Backend**: Express.js API server deployed separately (e.g., Render, Railway)
- **Database**: MongoDB hosted separately (e.g., MongoDB Atlas)

### Application Layers

1. **Presentation Layer (Frontend)**
   - React TypeScript application with Vite build tool
   - Redux Toolkit for state management and Redux-Saga for side effects
   - Completely decoupled from backend, communicates only via HTTP APIs

2. **API Layer (Backend)**
   - Express.js HTTP handlers (controllers) - handle HTTP requests/responses only
   - Business logic layer (services) - contains all business rules and logic
   - Data access layer (repositories) - handles database operations
   - Middleware for cross-cutting concerns (CORS, validation, error handling)

3. **Data Layer**
   - MongoDB database with Mongoose ODM for data modeling and schema validation

### Separation of Concerns
- **HTTP Handlers**: Only handle HTTP request/response, delegate to services
- **Business Services**: Contain all business logic, validation, and orchestration
- **Data Repositories**: Handle database operations and data mapping
- **Models**: Define data structures and validation rules

## Components and Interfaces

### Frontend Components

#### Core Components
- **SongList**: Displays all songs in a table/list format with edit and delete actions
- **SongForm**: Handles creation and editing of songs with form validation
- **StatisticsPanel**: Shows aggregated statistics about the music library
- **FilterPanel**: Provides genre-based filtering functionality
- **ErrorBoundary**: Catches and displays application errors gracefully

#### Redux Store Structure
```typescript
interface AppState {
  songs: {
    items: Song[];
    loading: boolean;
    error: string | null;
  };
  statistics: {
    data: Statistics;
    loading: boolean;
    error: string | null;
  };
  filters: {
    genre: string | null;
  };
}
```

#### Frontend Build and Development
- **Build Tool**: Vite for fast development and optimized production builds
- **Development Server**: Vite dev server with hot module replacement
- **Environment Configuration**: Separate environment variables for API endpoints
- **Deployment**: Static files deployed to platforms like Netlify or Vercel

#### API Service Layer
- **SongAPI**: Handles all HTTP requests to the backend API
- **StatisticsAPI**: Manages statistics-related API calls
- **APIClient**: Base HTTP client with error handling and request/response interceptors

### Backend Components

#### HTTP Handlers (Controllers)
- **SongController**: Handles HTTP requests/responses for song operations
  - Extracts data from requests
  - Calls appropriate service methods
  - Formats and returns HTTP responses
- **StatisticsController**: Handles HTTP requests/responses for statistics
  - Delegates to StatisticsService
  - Returns formatted statistics data

#### Business Services
- **SongService**: Contains all business logic for song operations
  - Validates business rules
  - Orchestrates data operations
  - Handles complex business workflows
- **StatisticsService**: Contains logic for statistics calculation
  - Aggregates data from multiple sources
  - Calculates derived statistics
  - Caches frequently accessed statistics

#### Data Repositories
- **SongRepository**: Handles all database operations for songs
  - CRUD operations
  - Query building and execution
  - Data mapping between database and domain models
- **StatisticsRepository**: Handles aggregation queries
  - Complex aggregation pipelines
  - Performance-optimized queries

#### Models
```typescript
interface Song {
  _id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Middleware
- **ValidationMiddleware**: Validates request data using Joi or similar
- **ErrorMiddleware**: Centralized error handling
- **CorsMiddleware**: Handles cross-origin requests for separated deployment

### API Endpoints

#### Song Management
- `GET /api/songs` - Retrieve all songs
- `POST /api/songs` - Create a new song
- `PUT /api/songs/:id` - Update an existing song
- `DELETE /api/songs/:id` - Delete a song
- `GET /api/songs/filter?genre=:genre` - Filter songs by genre

#### Statistics
- `GET /api/statistics` - Get comprehensive statistics
- `GET /api/statistics/genres` - Get genre-specific statistics
- `GET /api/statistics/artists` - Get artist-specific statistics
- `GET /api/statistics/albums` - Get album-specific statistics

## Data Models

### Song Schema (Mongoose)
```javascript
const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  artist: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  album: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  genre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  }
}, {
  timestamps: true
});
```

### Statistics Interface
```typescript
interface Statistics {
  totalSongs: number;
  totalArtists: number;
  totalAlbums: number;
  totalGenres: number;
  songsByGenre: { [genre: string]: number };
  songsByArtist: { [artist: string]: number };
  albumsByArtist: { [artist: string]: number };
  songsByAlbum: { [album: string]: number };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Song Creation Persistence
*For any* valid song data (title, artist, album, genre), when submitted to the API, the song should be successfully stored in the database with a unique identifier and timestamp
**Validates: Requirements 1.1, 1.3**

### Property 2: Input Validation Rejection
*For any* song data missing required fields, the API should reject the request and return appropriate validation error messages
**Validates: Requirements 1.2, 3.3**

### Property 3: API Response Completeness
*For any* successful song creation or update, the API response should contain all song properties including the assigned ID and timestamps
**Validates: Requirements 1.4, 3.4**

### Property 4: Real-time UI Updates
*For any* successful CRUD operation (create, update, delete), the Web Client should update the display immediately without requiring a page reload
**Validates: Requirements 1.5, 3.4, 4.2**

### Property 5: Complete Data Retrieval
*For any* request to retrieve songs, the API should return all songs currently stored in the database in JSON format
**Validates: Requirements 2.1, 2.5**

### Property 6: UI Data Display Completeness
*For any* song displayed in the Web Client, all required fields (title, artist, album, genre) should be visible
**Validates: Requirements 2.2**

### Property 7: Edit Form Population
*For any* song selected for editing, the edit form should be populated with the current song data
**Validates: Requirements 3.1**

### Property 8: Update Persistence
*For any* valid song update, the changes should be persisted to the database and reflected in subsequent retrievals
**Validates: Requirements 3.2**

### Property 9: Error Handling Integrity
*For any* failed operation, the system should display appropriate error messages and maintain data integrity
**Validates: Requirements 3.5, 4.3, 9.1, 9.2, 9.3, 9.4**

### Property 10: Delete Operation Completeness
*For any* song deletion request, the song should be completely removed from the database and no longer appear in retrievals
**Validates: Requirements 4.1, 4.4**

### Property 11: Statistics Accuracy
*For any* database state, the calculated statistics should accurately reflect the actual counts of songs, artists, albums, and genres
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 12: Statistics Real-time Updates
*For any* CRUD operation that changes the database, the statistics should automatically update to reflect the new state
**Validates: Requirements 5.5**

### Property 13: Genre Filtering Accuracy
*For any* genre filter applied, only songs matching that exact genre should be displayed
**Validates: Requirements 6.1**

### Property 14: Filter State Management
*For any* filter operation (apply or clear), the Web Client should correctly manage and display the current filter state
**Validates: Requirements 6.2, 6.4, 6.5**

### Property 15: RESTful API Compliance
*For any* API endpoint, it should use appropriate HTTP methods, status codes, and follow RESTful URL patterns
**Validates: Requirements 7.1, 7.2, 7.3**

### Property 16: JSON Data Format Consistency
*For any* API request or response, the data should be in valid JSON format with consistent structure
**Validates: Requirements 7.4, 7.5**

### Property 17: Error Logging Completeness
*For any* error that occurs in the system, appropriate error details should be logged for debugging purposes
**Validates: Requirements 9.5**

## Error Handling

### Frontend Error Handling
- **Network Errors**: Display user-friendly messages when API calls fail
- **Validation Errors**: Show field-specific error messages for form validation
- **Loading States**: Provide visual feedback during asynchronous operations
- **Error Boundaries**: Catch and handle React component errors gracefully

### Backend Error Handling
- **Input Validation**: Use Joi or similar library for request validation
- **Database Errors**: Handle connection failures and query errors
- **HTTP Status Codes**: Return appropriate status codes (400, 404, 500, etc.)
- **Error Logging**: Log errors with sufficient detail for debugging

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
}
```

## Testing Strategy

### Unit Testing
- **Frontend**: Test individual React components, Redux reducers, and utility functions
- **Backend**: Test controllers, services, and middleware functions
- **Database**: Test Mongoose models and schema validation

### Property-Based Testing
The application will use property-based testing to verify correctness properties across many inputs:

- **Library**: fast-check for JavaScript/TypeScript property-based testing
- **Configuration**: Minimum 100 iterations per property test
- **Coverage**: Each correctness property will be implemented as a separate property-based test
- **Tagging**: Each test will reference its corresponding design document property

### Integration Testing
- **API Testing**: Test complete request/response cycles
- **Database Integration**: Test data persistence and retrieval
- **Frontend-Backend Integration**: Test complete user workflows

### End-to-End Testing
- **User Workflows**: Test complete user journeys from UI to database
- **Cross-Browser Testing**: Ensure compatibility across different browsers
- **Performance Testing**: Verify application performance under load

### Testing Tools
- **Frontend**: Jest, React Testing Library, fast-check, Vite test runner
- **Backend**: Jest, Supertest, fast-check
- **E2E**: Cypress or Playwright
- **API Testing**: Postman or Insomnia for manual testing

### Development and Deployment
- **Frontend Development**: Vite dev server with hot reload
- **Backend Development**: Node.js with nodemon for auto-restart
- **Frontend Deployment**: Build with Vite and deploy to Netlify/Vercel
- **Backend Deployment**: Deploy to Render/Railway with Docker containerization
- **Database**: MongoDB Atlas for cloud database hosting
- **Environment Management**: Separate environment variables for different deployment stages