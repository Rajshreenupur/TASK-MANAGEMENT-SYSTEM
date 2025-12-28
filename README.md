# Jira Workflow Management System

A production-grade, multi-user workflow management system built with the MERN stack, comparable in complexity to a simplified Jira or Linear platform. This system supports collaborative project management, controlled task lifecycles, role-based access control, comprehensive activity tracking, refresh token authentication, and rate limiting.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [Authentication and Authorization](#authentication-and-authorization)
- [State Transition Handling](#state-transition-handling)
- [Performance Considerations](#performance-considerations)
- [Rate Limiting](#rate-limiting)
- [API Documentation](#api-documentation)
- [Trade-offs and Assumptions](#trade-offs-and-assumptions)
- [Known Limitations](#known-limitations)
- [Future Enhancements](#future-enhancements)

## Architecture Overview

This application is built as a monorepo using Turborepo, with separate frontend and backend applications:

- **Backend**: Express.js REST API with MongoDB, implementing strict role-based access control, refresh token authentication, rate limiting, and business logic validation
- **Frontend**: React SPA with client-side routing, optimistic UI updates, centralized state management, and automatic token refresh

### Key Architectural Decisions

1. **Monorepo Structure**: Using Turborepo for efficient development and build processes across frontend and backend
2. **Separation of Concerns**: Clear separation between authentication, authorization, business logic, and data access layers
3. **Backend-First Security**: All authorization checks are enforced at the backend level, never relying on frontend-only validation
4. **Strict State Management**: Task state transitions are enforced server-side with validation rules
5. **Activity Logging**: Comprehensive audit trail for all task operations
6. **Refresh Token Strategy**: Secure token rotation with automatic refresh on expiration
7. **Layered Rate Limiting**: Different rate limits for different endpoint types to prevent abuse

### System Flow

```
User Request → Rate Limiter → Authentication Middleware → Authorization Middleware → Controller → Database → Response
```

## Technology Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with Refresh Tokens
- **Validation**: Zod
- **Rate Limiting**: express-rate-limit
- **Language**: TypeScript

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand with persistence
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS
- **Notifications**: react-hot-toast
- **Language**: TypeScript

### Development Tools
- **Monorepo**: Turborepo
- **Version Control**: Git
- **Testing**: Jest with TypeScript support

## Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local installation or MongoDB Atlas connection string)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jira
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**

   Copy the example environment files and configure them:
   
   **Backend** (`apps/backend/.env`):
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```
   
   Then edit `apps/backend/.env` with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Database Configuration
   # For local MongoDB: mongodb://localhost:27017/jira-workflow
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/jira-workflow
   MONGODB_URI=mongodb://localhost:27017/jira-workflow

   # JWT Configuration
   # IMPORTANT: Change this to a strong, random secret in production
   # Generate a secure secret: openssl rand -base64 32
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-characters
   JWT_EXPIRE=7d

   # Refresh Token Configuration
   REFRESH_TOKEN_EXPIRE=30d

   # Rate Limiting Configuration
   # Authentication endpoints (login, register) - stricter limits
   AUTH_RATE_LIMIT_WINDOW_MS=900000
   AUTH_RATE_LIMIT_MAX=5

   # Refresh token endpoint - moderate limits
   REFRESH_RATE_LIMIT_WINDOW_MS=900000
   REFRESH_RATE_LIMIT_MAX=10

   # General API endpoints - more lenient limits
   GENERAL_RATE_LIMIT_WINDOW_MS=900000
   GENERAL_RATE_LIMIT_MAX=100
   ```

   **Frontend** (`apps/frontend/.env`):
   ```bash
   cp apps/frontend/.env.example apps/frontend/.env
   ```
   
   Then edit `apps/frontend/.env` with your configuration:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:5000/api
   ```

   **Important Notes:**
   - The `.env` files are gitignored and won't be committed
   - `.env.example` files are provided as templates
   - Change `JWT_SECRET` to a strong random string in production
   - For MongoDB Atlas, update `MONGODB_URI` with your connection string
   - Rate limiting values are in milliseconds (900000ms = 15 minutes)

4. **Start MongoDB**

   If using local MongoDB:
   ```bash
   mongod
   ```

   Or use MongoDB Atlas and update `MONGODB_URI` in `.env`

5. **Start Development Servers**

   From the root directory:
   ```bash
   npm run dev
   ```

   This will start both frontend (port 3000) and backend (port 5000) concurrently.

6. **Access the Application**

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

### Building for Production

```bash
npm run build
```

This builds both frontend and backend applications.

### Running Tests

To run unit tests for business logic:

```bash
cd apps/backend
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

To generate coverage reports:

```bash
npm run test:coverage
```

The test suite includes:
- Task state transition validation (32 tests)
- Request validation schemas (25 tests)
- Authorization middleware logic (18 tests)
- Task business logic (10 tests)
- Activity log business logic (10 tests)

See `apps/backend/TEST_README.md` for detailed testing documentation.

## Project Structure

```
jira/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/          # Database configuration
│   │   │   ├── controllers/      # Request handlers
│   │   │   ├── middleware/       # Auth, authorization, error handling, rate limiting
│   │   │   ├── models/           # Mongoose schemas
│   │   │   ├── routes/           # API route definitions
│   │   │   ├── utils/            # Utilities (JWT, validation, state transitions)
│   │   │   └── index.ts          # Application entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/
│       ├── src/
│       │   ├── api/              # API client functions
│       │   ├── components/      # Reusable React components
│       │   ├── pages/            # Page components
│       │   ├── store/            # Zustand state management
│       │   ├── validations/      # Zod validation schemas
│       │   ├── App.tsx           # Main app component with routing
│       │   └── main.tsx          # Application entry point
│       ├── package.json
│       └── vite.config.ts
├── package.json                  # Root package.json for Turborepo
├── turbo.json                    # Turborepo configuration
└── README.md
```

## Authentication and Authorization

### Authentication Strategy

The system uses JWT-based authentication with refresh tokens for enhanced security:

1. **Registration**: Users can register with email, password, and name. Passwords are hashed using bcrypt (12 rounds) before storage.
2. **Login**: Users authenticate with email and password, receiving both an access token (JWT) and a refresh token upon successful authentication.
3. **Token Storage**: 
   - Access tokens are stored in Zustand state with persistence (localStorage)
   - Refresh tokens are also stored securely in the same state
   - Tokens are sent via `Authorization: Bearer <token>` header
4. **Token Refresh**: 
   - Access tokens expire after 7 days (configurable)
   - Refresh tokens expire after 30 days (configurable)
   - When an access token expires, the API client automatically attempts to refresh it using the refresh token
   - On successful refresh, both tokens are rotated (new tokens issued)
   - Failed refresh attempts redirect to login
5. **Token Rotation**: Each refresh generates new access and refresh tokens, invalidating the old refresh token

### Authorization Strategy

Authorization is enforced at multiple levels with a defense-in-depth approach:

#### Role-Based Access Control (RBAC)

The system implements a two-tier role model:

- **OWNER Role**: 
  - Can create projects
  - Can invite/remove members from projects they own
  - Has full access to all projects they own
  - Cannot be assigned through normal registration (must be set manually in database or via admin panel)

- **MEMBER Role**: 
  - Default role for all new registrations
  - Can only access projects they are explicitly associated with (as owner or member)
  - Can create and manage tasks within accessible projects
  - Cannot create new projects

#### Project-Level Authorization

All project and task operations verify that the user has access to the project:

1. **Project Access Check**: Middleware verifies user is either the project owner or a member
2. **Owner-Only Operations**: Certain operations (create project, invite/remove members) require OWNER role
3. **Project Owner Operations**: Operations like removing members require project ownership (not just OWNER role)
4. **Backend Enforcement**: All authorization checks happen server-side; frontend UI is for UX only

#### Authorization Middleware Chain

The system uses a layered middleware approach:

1. **`authenticate` middleware**: 
   - Validates JWT token
   - Verifies user still exists in database
   - Attaches user information to request object
   - Returns 401 if authentication fails

2. **`authorizeOwner` middleware**: 
   - Checks if user has OWNER role
   - Returns 403 if user is not an owner
   - Used for project creation endpoint

3. **`authorizeProjectAccess` middleware**: 
   - Verifies user can access the project (owner or member)
   - Fetches project from database
   - Attaches project to request for use in controllers
   - Returns 403 if user lacks access
   - Returns 404 if project doesn't exist

4. **`authorizeProjectOwner` middleware**: 
   - Verifies user owns the specific project
   - Returns 403 if user is not the project owner
   - Used for member management operations

#### Security Principles

1. **Never Trust the Client**: All authorization checks are performed server-side
2. **Fail Secure**: Default to denying access if authorization cannot be verified
3. **Least Privilege**: Users only have access to resources they need
4. **Defense in Depth**: Multiple layers of authorization checks
5. **Explicit Permissions**: Users must be explicitly added to projects; no implicit access

## State Transition Handling

### Task Status Flow

Tasks follow a strict state machine with the following transitions:

| Current State | Allowed Next State | Description |
|---------------|-------------------|-------------|
| BACKLOG       | IN_PROGRESS       | Task moves from planning to active work |
| IN_PROGRESS   | REVIEW            | Task moves from development to review |
| REVIEW        | DONE              | Task moves from review to completion |
| DONE          | (No transitions)  | Completed tasks cannot be moved back |

### Task Assignment and Reassignment

The system supports comprehensive task assignment functionality:

1. **Default Assignment**: When a task is created without specifying an assignee, it is automatically assigned to the creator
2. **Assignment During Creation**: Users can assign tasks to any project member (owner or members) during task creation via the Create Task modal
3. **Task Reassignment**: Tasks can be reassigned to different project members through the Task Detail Sheet
4. **Activity Tracking**: All assignment and reassignment actions are logged in the activity log with:
   - Previous assignee name (or "Unassigned")
   - New assignee name
   - User who performed the action
   - Timestamp
5. **Creator Display**: Task cards in both Kanban and List views display the creator's name with an icon for easy identification

### Implementation Details

State transitions are enforced server-side with multiple validation layers:

1. **Validation Utility**: The `isValidTransition()` function in `taskStateTransition.ts` checks if a transition is allowed based on the current state
2. **Controller Validation**: Both `updateTaskStatus` and `updateTask` controllers validate transitions before updating
3. **Error Handling**: Invalid transitions return HTTP 400 with descriptive error messages
4. **Activity Logging**: Every status change generates an activity log entry with:
   - Previous status
   - New status
   - User who performed the action
   - Timestamp
5. **Frontend Enforcement**: The frontend uses `getValidTransitions()` to show only valid transition buttons, but this is for UX only - backend is the source of truth

### State Transition Rules

```typescript
const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  BACKLOG: ['IN_PROGRESS'],
  IN_PROGRESS: ['REVIEW'],
  REVIEW: ['DONE'],
  DONE: [], // No transitions allowed from DONE
};
```

### Example Error Response

```json
{
  "error": "Invalid status transition from DONE to IN_PROGRESS"
}
```

### Why Strict State Transitions?

1. **Business Logic Enforcement**: Ensures tasks follow a logical workflow
2. **Data Integrity**: Prevents invalid states that could break reporting
3. **Audit Trail**: Clear history of task progression
4. **User Experience**: Prevents user errors by disallowing invalid actions

### Task Assignment and Reassignment

The system supports comprehensive task assignment functionality:

1. **Default Assignment**: When a task is created without specifying an assignee, it is automatically assigned to the creator
2. **Assignment During Creation**: Users can assign tasks to any project member (owner or members) during task creation via the Create Task modal
3. **Task Reassignment**: Tasks can be reassigned to different project members through the Task Detail Sheet
4. **Activity Tracking**: All assignment and reassignment actions are logged in the activity log with:
   - Previous assignee name (or "Unassigned")
   - New assignee name
   - User who performed the action
   - Timestamp
5. **Creator Display**: Task cards in both Kanban and List views display the creator's name with an icon for easy identification

### Activity Logging for State Changes

Every state transition and assignment change is automatically logged:

- **Task Creation**: Logs task creation with initial status (BACKLOG) and assignment
- **Status Changes**: Logs previous and new status with user who made the change
- **Assignments**: Logs initial assignment (TASK_ASSIGNED) with assignee name
- **Reassignments**: Logs reassignment (TASK_REASSIGNED) with previous and new assignee names
- **Metadata**: Stores user-friendly names in metadata for better display in activity logs

## Performance Considerations

### Database Optimization

#### Strategic Indexing

The system uses MongoDB indexes on frequently queried fields:

1. **User Model**:
   - `email` (unique): Fast user lookup during authentication
   
2. **Project Model**:
   - `owner`: Efficient filtering of projects by owner
   - `members`: Fast lookup of projects a user is a member of
   - `createdAt`: Efficient sorting by creation date

3. **Task Model**:
   - `projectId + status`: Compound index for filtering tasks by project and status (used in Kanban board)
   - `assignee`: Fast lookup of tasks assigned to a user
   - `createdAt`: Efficient sorting and pagination
   - `projectId + createdAt`: Compound index for paginated task lists

4. **ActivityLog Model**:
   - `taskId + createdAt`: Efficient retrieval of activity logs for a task (sorted by date)
   - `performedBy`: Fast lookup of activities by user

#### Query Optimization

1. **Pagination**: All list endpoints support pagination:
   - Query parameters: `page` (default: 1), `limit` (default: 10-20)
   - Response includes pagination metadata (total, page, limit, totalPages)
   - Prevents loading large datasets into memory

2. **Field Projection**: 
   - Mongoose queries use `.select()` to fetch only needed fields
   - Password fields are excluded by default (`.select('-password')`)
   - Population is selective (only required fields)

3. **Lean Queries**: 
   - Where appropriate, queries use `.lean()` to return plain JavaScript objects
   - Reduces memory overhead and improves performance

4. **Single Query Access Checks**: 
   - Project access verification happens in a single database query
   - Project is attached to request to avoid re-querying in controllers

5. **Efficient Filtering**: 
   - Uses MongoDB operators (`$in`, `$eq`) for efficient filtering
   - Avoids N+1 queries through proper population and aggregation

### Frontend Optimization

1. **Optimistic UI Updates**: 
   - Task status changes update UI immediately
   - Server response syncs the state
   - Failed updates revert to previous state
   - Provides instant feedback to users

2. **Efficient Re-renders**: 
   - Zustand state management for minimal re-renders
   - Component-level state where appropriate
   - Memoization of expensive computations

3. **API Client Optimization**: 
   - Centralized axios instance with interceptors
   - Automatic token refresh prevents unnecessary failed requests
   - Request queuing during token refresh prevents race conditions

4. **Data Fetching Strategy**:
   - Fetch only required data
   - Separate queries for different views (Kanban vs List)
   - Maintain separate state for filtered vs all data (for accurate counts)

### Scalability Considerations

1. **Horizontal Scaling**: 
   - Stateless JWT authentication allows multiple server instances
   - MongoDB can be sharded for very large datasets
   - Rate limiting can be distributed using Redis (future enhancement)

2. **Database Scaling**: 
   - Indexes support efficient queries as data grows
   - Pagination prevents loading large datasets
   - Compound indexes optimize common query patterns

3. **Caching Opportunities** (Future):
   - User session data
   - Project membership lists
   - Frequently accessed tasks

4. **Connection Pooling**: 
   - Mongoose handles connection pooling automatically
   - Configurable pool size for high-traffic scenarios

## Rate Limiting

### Overview

The system implements layered rate limiting to protect against abuse and brute force attacks:

1. **General Rate Limiter**: Applied to all `/api/*` routes (100 requests per 15 minutes)
2. **Auth Rate Limiter**: Stricter limits for login/register (5 requests per 15 minutes)
3. **Refresh Token Rate Limiter**: Moderate limits for token refresh (10 requests per 15 minutes)

### Configuration

Rate limits are configurable via environment variables:

```env
# Authentication endpoints (login, register)
AUTH_RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
AUTH_RATE_LIMIT_MAX=5

# Refresh token endpoint
REFRESH_RATE_LIMIT_WINDOW_MS=900000
REFRESH_RATE_LIMIT_MAX=10

# General API endpoints
GENERAL_RATE_LIMIT_WINDOW_MS=900000
GENERAL_RATE_LIMIT_MAX=100
```

### Implementation Details

1. **IP-Based Limiting**: Unauthenticated requests are limited by IP address
2. **User-Based Limiting**: Authenticated requests use user ID for general rate limiting
3. **Standard Headers**: Returns `RateLimit-*` headers for client awareness
4. **Test Environment**: Rate limiting is automatically disabled in test environment
5. **Trust Proxy**: Configured to work correctly behind reverse proxies

### Rate Limit Responses

When a rate limit is exceeded, the API returns:

```json
{
  "error": "Too many authentication attempts. Please try again later."
}
```

HTTP Status: `429 Too Many Requests`

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user.

**Rate Limit**: 5 requests per 15 minutes

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-access-token",
  "refreshToken": "refresh-token-string",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "MEMBER"
  }
}
```

#### POST `/api/auth/login`
Authenticate user.

**Rate Limit**: 5 requests per 15 minutes

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-access-token",
  "refreshToken": "refresh-token-string",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "MEMBER"
  }
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Rate Limit**: 10 requests per 15 minutes

**Request Body:**
```json
{
  "refreshToken": "refresh-token-string"
}
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "token": "new-jwt-access-token",
  "refreshToken": "new-refresh-token-string"
}
```

#### POST `/api/auth/logout`
Logout and invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token-string"
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### GET `/api/auth/me`
Get current authenticated user (requires authentication).

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "OWNER"
  }
}
```

### Project Endpoints

#### POST `/api/projects`
Create a new project (requires OWNER role).

**Request Body:**
```json
{
  "name": "Project Name",
  "description": "Project description"
}
```

**Response:**
```json
{
  "project": {
    "id": "project-id",
    "name": "Project Name",
    "description": "Project description",
    "owner": { "id": "...", "name": "...", "email": "..." },
    "members": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/projects`
Get all projects for authenticated user (paginated).

**Query Parameters:** 
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response:**
```json
{
  "projects": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### GET `/api/projects/:projectId`
Get project details (requires project access).

#### POST `/api/projects/:projectId/invite`
Invite member to project (requires project ownership).

**Request Body:**
```json
{
  "email": "member@example.com"
}
```

#### DELETE `/api/projects/:projectId/members/:memberId`
Remove member from project (requires project ownership).

### Task Endpoints

#### POST `/api/tasks`
Create a new task (requires project access).

**Request Body:**
```json
{
  "title": "Task Title",
  "description": "Task description",
  "projectId": "project-id",
  "assignee": "user-id",
  "priority": "HIGH"
}
```

#### GET `/api/tasks/project/:projectId`
Get all tasks for a project (paginated, requires project access).

**Query Parameters:** 
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `status` (optional, filter by status)

#### GET `/api/tasks/:taskId`
Get task details.

#### PATCH `/api/tasks/:taskId`
Update task (validates state transitions).

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM"
}
```

#### PATCH `/api/tasks/:taskId/status`
Update task status (validates state transitions).

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

#### GET `/api/tasks/:taskId/activity`
Get activity logs for a task (paginated).

**Query Parameters:** 
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

#### DELETE `/api/tasks/:taskId`
Delete a task.

### Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message"
}
```

Validation errors include details:

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

Rate limit errors:

```json
{
  "error": "Too many requests. Please try again later."
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors, invalid transitions)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (authorization failed)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Trade-offs and Assumptions

### Trade-offs

1. **JWT vs Session Tokens**: 
   - **Chose**: JWT with refresh tokens for stateless authentication
   - **Benefit**: Enables horizontal scaling without shared session storage
   - **Trade-off**: Token revocation requires a blacklist (not implemented). Refresh token rotation mitigates this.

2. **MongoDB vs SQL**: 
   - **Chose**: MongoDB for flexibility in schema evolution and document-based storage
   - **Benefit**: Easy to add new fields, nested documents for activity logs
   - **Trade-off**: Less strict referential integrity (handled in application code). No foreign key constraints.

3. **Monorepo vs Separate Repos**: 
   - **Chose**: Turborepo for code sharing and unified development
   - **Benefit**: Shared types, unified builds, easier dependency management
   - **Trade-off**: Slightly more complex initial setup, larger repository size

4. **Optimistic UI Updates**: 
   - **Chose**: Implement optimistic updates for better UX
   - **Benefit**: Instant feedback, perceived performance improvement
   - **Trade-off**: Requires error handling to revert on failure, potential for temporary inconsistencies

5. **No Real-time Updates**: 
   - **Chose**: Keep initial implementation simple without WebSockets
   - **Benefit**: Simpler architecture, no need for WebSocket server management
   - **Trade-off**: Users must refresh to see changes from other users. Can be added later.

6. **In-Memory Rate Limiting**: 
   - **Chose**: express-rate-limit with in-memory storage
   - **Benefit**: Simple setup, no external dependencies
   - **Trade-off**: Doesn't work across multiple server instances. Redis adapter can be added for distributed rate limiting.

7. **Refresh Token Storage in Database**: 
   - **Chose**: Store refresh tokens in user document
   - **Benefit**: Easy to invalidate, can limit number of active tokens
   - **Trade-off**: Slightly more database queries. Could use Redis for better performance at scale.

### Assumptions

1. **User Registration**: 
   - First user can be manually set to OWNER role via database
   - In production, this could be handled via admin panel or first-user logic
   - Email addresses are unique identifiers

2. **Project Membership**: 
   - Users must be explicitly invited to projects
   - No public projects or open access
   - Project owner has full control over membership

3. **Task Assignment**: 
   - Tasks can be assigned to any project member, not just the creator
   - Unassigned tasks are allowed (assignee is optional)
   - Task creator is tracked separately from assignee

4. **Activity Logs**: 
   - Activity logs are primarily for audit purposes
   - No automatic cleanup implemented (could grow large over time)
   - Logs are immutable (no updates or deletions)

5. **Token Expiration**: 
   - Access tokens expire after 7 days (configurable)
   - Refresh tokens expire after 30 days (configurable)
   - Users are expected to use the application regularly

6. **Rate Limiting**: 
   - Rate limits are per IP/user, not per endpoint
   - Limits are reasonable for normal usage patterns
   - Legitimate users won't hit limits under normal circumstances

7. **Database**: 
   - MongoDB is available and accessible
   - Connection pooling handles concurrent requests
   - Indexes are maintained for performance

## Known Limitations

1. **No Real-time Collaboration**: 
   - Task updates require page refresh to see changes from other users
   - **Solution**: WebSocket implementation would address this
   - **Impact**: Medium - affects collaborative workflows

2. **No File Uploads**: 
   - System doesn't support file attachments for tasks or projects
   - **Solution**: Integrate file storage service (S3, Cloudinary, etc.)
   - **Impact**: Medium - limits task documentation

3. **Limited Search**: 
   - No full-text search for tasks or projects
   - **Solution**: MongoDB text search or Elasticsearch integration
   - **Impact**: Medium - makes finding tasks difficult at scale

4. **No Email Notifications**: 
   - Member invitations and task assignments don't send email notifications
   - **Solution**: Integrate email service (SendGrid, AWS SES, etc.)
   - **Impact**: Low - users must check the application

5. **No Task Comments**: 
   - Tasks don't support comments or discussions
   - **Solution**: Add comment model and endpoints
   - **Impact**: Medium - limits collaboration

6. **Basic Drag-and-Drop**: 
   - Kanban board has status change buttons but not full drag-and-drop functionality
   - **Solution**: Integrate drag-and-drop library (react-beautiful-dnd, dnd-kit)
   - **Impact**: Low - current buttons work but less intuitive

7. **No Bulk Operations**: 
   - Cannot perform bulk updates or deletions
   - **Solution**: Add bulk operation endpoints
   - **Impact**: Low - manageable for small to medium projects

8. **No Project Templates**: 
   - Projects must be created from scratch
   - **Solution**: Add template system
   - **Impact**: Low - convenience feature

9. **In-Memory Rate Limiting**: 
   - Rate limiting doesn't work across multiple server instances
   - **Solution**: Use Redis adapter for distributed rate limiting
   - **Impact**: Low - only affects multi-instance deployments

10. **No Token Blacklist**: 
    - Revoked tokens remain valid until expiration
    - **Solution**: Implement token blacklist (Redis or database)
    - **Impact**: Low - refresh token rotation mitigates this

11. **Limited Activity Log Cleanup**: 
    - Activity logs grow indefinitely
    - **Solution**: Implement automatic cleanup or archival
    - **Impact**: Low - only affects long-running systems

## Future Enhancements

Potential improvements (not implemented but considered):

### High Priority
- WebSocket integration for real-time updates
- Full-text search (MongoDB text search or Elasticsearch)
- Email notifications for invitations and assignments
- Task comments and discussions

### Medium Priority
- File uploads and attachments
- Advanced drag-and-drop Kanban board
- Bulk operations (update, delete)
- Project templates
- Token blacklist for immediate revocation

### Low Priority
- Docker containerization
- Advanced filtering and sorting
- Task dependencies
- Time tracking
- Reports and analytics
- Redis-based distributed rate limiting
- Activity log archival system
- Admin panel for user management
- Project archiving
- Task tags and labels
- Custom workflows

## License

This project is created as a technical assignment for Fusiontecz Solutions.
