# Hotel Management Web Application

A full-stack hotel management system built with Next.js (frontend) and Node.js/Express (backend) with TypeScript, PostgreSQL, and TypeORM.

## Features

- JWT-based authentication with role-based access control (ADMIN, STAFF, VIEWER)
- Room management (create, edit, delete rooms)
- Guest management (create, edit, delete guests)
- Booking management with overlap prevention and date validation
- User management (ADMIN only)
- Pagination and filtering for bookings
- Clean architecture with 3 backend layers (controllers, services, repositories)
- Dependency injection using tsyringe
- Integration tests with Jest and Supertest

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + TypeORM
- JWT + bcrypt
- tsyringe (Dependency Injection)
- class-validator (DTO validation)
- Jest + Supertest (testing)

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios

## Project Structure

```
hotel-management/
├── backend/
│   ├── src/
│   │   ├── entities/          # TypeORM entities
│   │   ├── repositories/      # Data access layer
│   │   ├── services/          # Business logic layer
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── middleware/        # Auth, error handling
│   │   ├── dto/               # Data validation
│   │   ├── config/            # DB config, DI container
│   │   ├── utils/             # Utilities
│   │   ├── migrations/        # Database migrations
│   │   └── scripts/           # Seed scripts
│   └── tests/
│       └── integration/       # Integration tests
├── frontend/
│   └── src/
│       ├── app/               # Next.js pages
│       ├── components/        # React components
│       ├── lib/               # API client, auth context
│       └── types/             # TypeScript types
└── docker-compose.yml         # PostgreSQL setup
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose

### 1. Start PostgreSQL Databases

```bash
docker-compose up -d
```

This starts two PostgreSQL instances:
- Development DB on port 5432
- Test DB on port 5433

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the environment file:
```bash
cp .env.example .env
```

Run database migrations:
```bash
npm run migration:run
```

Seed the default ADMIN user:
```bash
npm run seed
```

This creates:
- Username: `admin`
- Password: `admin123`
- Role: ADMIN

Start the development server:
```bash
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Access the Application

1. Open browser to `http://localhost:3000`
2. Login with:
   - Username: `admin`
   - Password: `admin123`

## Running Tests

### Backend Integration Tests

Make sure the test database is running:
```bash
docker-compose up -d postgres_test
```

Run tests:
```bash
cd backend
npm test
```

The tests cover:
- Authentication (login returns token)
- Authorization (STAFF cannot access /users)
- Booking creation (success case)
- Booking overlap detection (returns 409)
- Date validation
- Cancelled bookings exclusion

## API Endpoints

### Authentication
- `POST /auth/login` - Login with username/password
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user info

### Users (ADMIN only)
- `GET /users` - List all users
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `PATCH /users/:id/deactivate` - Deactivate user

### Rooms
- `GET /rooms` - List all rooms
- `POST /rooms` - Create new room
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room

### Guests
- `GET /guests` - List all guests
- `POST /guests` - Create new guest
- `PUT /guests/:id` - Update guest
- `DELETE /guests/:id` - Delete guest

### Bookings
- `GET /bookings` - List bookings (with filters and pagination)
  - Query params: `from`, `to`, `status`, `page`, `limit`
- `POST /bookings` - Create new booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking (soft delete)

## Data Models

### User
- id (UUID)
- name
- username (unique)
- passwordHash
- role (ADMIN | STAFF | VIEWER)
- isActive
- createdAt, updatedAt

### Room
- id
- roomNumber (unique)
- type (SINGLE | DOUBLE | SUITE | DELUXE)
- capacity
- pricePerNight
- isActive

### Guest
- id
- firstName
- lastName
- email (optional)
- phone (optional)

### Booking
- id
- roomId
- guestId
- checkInDate
- checkOutDate
- status (PENDING | CONFIRMED | CHECKED_IN | CHECKED_OUT | CANCELLED)
- notes (optional)
- totalPrice (optional)

## Business Rules

### Booking Validation
1. Check-in date must be before check-out date
2. No overlapping bookings for the same room
   - Overlap check: `newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn`
   - CANCELLED bookings are excluded from overlap check
3. Returns HTTP 409 on booking conflict
4. DELETE booking sets status to CANCELLED (soft delete)

### Authorization
- ADMIN: Full access to all endpoints
- STAFF: Access to rooms, guests, bookings (NOT users)
- VIEWER: Read-only access

## Error Format

All errors follow this JSON structure:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": []
  }
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request / Validation Error
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Development Commands

### Backend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run migration:generate -- src/migrations/MigrationName  # Generate migration
npm run migration:run    # Run migrations
npm run seed         # Seed default admin user
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=hotel_management
TEST_DB_HOST=localhost
TEST_DB_PORT=5433
TEST_DB_USERNAME=postgres
TEST_DB_PASSWORD=postgres
TEST_DB_DATABASE=hotel_management_test
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Production Deployment

### Backend
1. Build: `npm run build`
2. Set environment variables for production database
3. Run migrations: `npm run migration:run`
4. Run seed: `npm run seed`
5. Start: `npm start`

### Frontend
1. Build: `npm run build`
2. Set `NEXT_PUBLIC_API_URL` to production backend URL
3. Start: `npm start`

## License

MIT
