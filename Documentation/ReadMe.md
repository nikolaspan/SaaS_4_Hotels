HOTEL MANAGEMENT WEB APPLICATION
PRD + TECHNICAL ARCHITECTURE + TYPEORM ENTITIES + README


============================================================
1)  PRD (v2)
============================================================

1.1 Product Overview
- Product Name: Hotel Management Web Application
- Purpose: A web-based system for managing hotel rooms, guests, bookings, and users.
- Architecture: Three-tier architecture
  (1) Front-end SPA (Next.js)
  (2) Business Logic API (TypeScript, OOP)
  (3) Database (PostgreSQL, relational; accessed via TypeORM ORM)

1.2 Goals
- Provide CRUD functionality for Rooms, Guests, Bookings, and Users (Admin only for Users).
- Secure system using username/password authentication.
- Implement JWT-based authentication (recommended) and enforce protected endpoints.
- Implement role-based access control (RBAC) if possible (recommended):
  - ADMIN: full access
  - STAFF: manage rooms/guests/bookings
  - VIEWER (optional): read-only access

1.3 Out of Scope
- Online payments
- External OTA integrations (Booking.com, Expedia)
- Mobile application
- Advanced analytics/AI features

------------------------------------------------------------
1.4 Core Roles (RBAC)
------------------------------------------------------------

ADMIN
- Create/update/deactivate users
- Assign roles
- Full CRUD access to rooms, guests, bookings

STAFF
- CRUD rooms, guests, bookings
- No access to user/role management

VIEWER (Optional)
- Read-only access to rooms/guests/bookings

------------------------------------------------------------
1.5 Key Modules & Functional Requirements
------------------------------------------------------------

A) Authentication & Authorization
- Login via username/password
- Password hashing (bcrypt)
- JWT issuance at login
- Protected endpoints require JWT
- RBAC enforced via middleware/guard at endpoint level

B) User Management (ADMIN only)
- Create user
- Update user
- Deactivate/activate user
- Assign role

C) Room Management
- Create/update/delete rooms
- Room fields:
  - roomNumber (unique)
  - type (SINGLE/DOUBLE/TRIPLE/SUITE)
  - capacity
  - pricePerNight
  - isActive

D) Guest Management
- Create/update/delete guests
- Guest fields:
  - firstName, lastName
  - email (optional)
  - phone (optional)

E) Booking Management
- Create/update/cancel bookings
- Booking fields:
  - roomId, guestId
  - checkInDate, checkOutDate (DATE)
  - status (PENDING/CONFIRMED/CHECKED_IN/CHECKED_OUT/CANCELLED)
  - notes (optional)
- Booking search/listing:
  - filter by date range, status
  - pagination and sorting
- Prevent double booking:
  - same room cannot have overlapping bookings (except CANCELLED)

------------------------------------------------------------
1.6 Business Rules (must be implemented in Service layer)
------------------------------------------------------------

Booking Required Fields
- guestId, roomId, checkInDate, checkOutDate, status

Date Validations
- checkInDate < checkOutDate
- dates must be valid ISO YYYY-MM-DD

No Double Booking Rule
- For the same room:
  - Overlap exists when: newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn
  - Ignore bookings with status = CANCELLED
- If overlap exists: return HTTP 409 Conflict

Status Transitions
- PENDING -> CONFIRMED -> CHECKED_IN -> CHECKED_OUT
- PENDING/CONFIRMED -> CANCELLED

------------------------------------------------------------
1.7 Non-Functional Requirements
------------------------------------------------------------

Security
- Hash passwords (bcrypt)
- JWT for authentication
- RBAC restrictions on endpoints
- Input validation (DTO validation)
- Consistent error responses

Performance
- Pagination for lists
- Index on bookings by (roomId, checkInDate, checkOutDate)

Maintainability
- Clear separation of concerns (controllers/services/repositories)
- Dependency Injection usage
- Modular code

------------------------------------------------------------
1.8 Course Constraints Checklist
------------------------------------------------------------
- SPA frontend in Next.js + TailwindCSS: YES
- Front-end -> Back-end via RESTful web services: YES
- OOP business logic language: TypeScript: YES
- Relational database: PostgreSQL: YES
- ORM used for DB access: TypeORM: YES
- Backend 3 layers (controllers, business logic, data): YES
- Dependency Injection: YES
- Basic automated integration tests (end of semester): YES

============================================================
2) TYPEORM ENTITY DEFINITIONS (TypeScript)
============================================================

Assumptions:
- TypeORM 0.3+
- PostgreSQL
- UUID primary keys
- Numeric fields stored as string for precision (TypeORM best practice)

------------------------------------------------------------
2.1 src/domain/enums.ts
------------------------------------------------------------

export enum UserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  VIEWER = "VIEWER",
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  CANCELLED = "CANCELLED",
}

export enum RoomType {
  SINGLE = "SINGLE",
  DOUBLE = "DOUBLE",
  TRIPLE = "TRIPLE",
  SUITE = "SUITE",
}

------------------------------------------------------------
2.2 src/domain/entities/BaseEntity.ts
------------------------------------------------------------

import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

export abstract class AppBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deletedAt?: Date | null;
}

------------------------------------------------------------
2.3 src/domain/entities/User.ts
------------------------------------------------------------

import { Column, Entity, Index } from "typeorm";
import { AppBaseEntity } from "./BaseEntity";
import { UserRole } from "../enums";

@Entity({ name: "users" })
export class User extends AppBaseEntity {
  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 160 })
  username!: string;

  @Column({ type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.STAFF })
  role!: UserRole;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;
}

------------------------------------------------------------
2.4 src/domain/entities/Room.ts
------------------------------------------------------------

import { Column, Entity, Index, OneToMany } from "typeorm";
import { AppBaseEntity } from "./BaseEntity";
import { Booking } from "./Booking";
import { RoomType } from "../enums";

@Entity({ name: "rooms" })
export class Room extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 20 })
  roomNumber!: string;

  @Column({ type: "enum", enum: RoomType })
  type!: RoomType;

  @Column({ type: "int" })
  capacity!: number;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  pricePerNight!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @OneToMany(() => Booking, (b) => b.room)
  bookings!: Booking[];
}

------------------------------------------------------------
2.5 src/domain/entities/Guest.ts
------------------------------------------------------------

import { Column, Entity, Index, OneToMany } from "typeorm";
import { AppBaseEntity } from "./BaseEntity";
import { Booking } from "./Booking";

@Entity({ name: "guests" })
export class Guest extends AppBaseEntity {
  @Column({ type: "varchar", length: 120 })
  firstName!: string;

  @Column({ type: "varchar", length: 120 })
  lastName!: string;

  @Index()
  @Column({ type: "varchar", length: 180, nullable: true })
  email?: string | null;

  @Column({ type: "varchar", length: 40, nullable: true })
  phone?: string | null;

  @OneToMany(() => Booking, (b) => b.guest)
  bookings!: Booking[];
}

------------------------------------------------------------
2.6 src/domain/entities/Booking.ts
------------------------------------------------------------

import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { AppBaseEntity } from "./BaseEntity";
import { BookingStatus } from "../enums";
import { Room } from "./Room";
import { Guest } from "./Guest";

@Entity({ name: "bookings" })
@Index(["roomId", "checkInDate", "checkOutDate"])
export class Booking extends AppBaseEntity {
  @Column({ type: "uuid" })
  roomId!: string;

  @ManyToOne(() => Room, (r) => r.bookings, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "roomId" })
  room!: Room;

  @Column({ type: "uuid" })
  guestId!: string;

  @ManyToOne(() => Guest, (g) => g.bookings, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "guestId" })
  guest!: Guest;

  @Column({ type: "date" })
  checkInDate!: string;

  @Column({ type: "date" })
  checkOutDate!: string;

  @Column({ type: "enum", enum: BookingStatus, default: BookingStatus.PENDING })
  status!: BookingStatus;

  @Column({ type: "text", nullable: true })
  notes?: string | null;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: true })
  totalPrice?: string | null;
}

NOTE: Overlap prevention is enforced in the Service layer with a query,
not solely by schema constraints.

============================================================
3) TECHNICAL ARCHITECTURE (REPORT SECTION)
============================================================

3.1 Architectural Style
The application follows a three-tier architecture:
1) Presentation Layer: Next.js SPA (TailwindCSS)
2) Business Logic Layer: REST API (TypeScript OOP)
3) Data Layer: PostgreSQL relational database (TypeORM ORM)

3.2 Backend Internal Design (3 Layers)
- Controllers Layer
  - Defines REST endpoints
  - Parses/validates requests (DTO validation)
  - Calls services and returns responses
  - No business rules here

- Services Layer (Business Logic)
  - Implements business rules:
    - no overlapping bookings
    - status transitions
    - domain validations
  - Coordinates transactions when required
  - Handles authorization decisions when needed

- Data Layer (Repositories)
  - TypeORM repositories + query builders
  - Encapsulates database operations
  - No business rules

3.3 Dependency Injection (DI)
Dependency Injection is used to decouple components:
- Controllers depend on Service interfaces
- Services depend on Repository interfaces
A DI container (e.g., tsyringe or typedi) manages object creation and
injection.

Benefits:
- Loose coupling and cleaner architecture
- Easier testing (swap repositories with mocks)
- Better maintainability and extensibility

3.4 Authentication (JWT)
- User logs in with username/password
- Password verified via bcrypt hash comparison
- On success, API returns a JWT containing:
  - sub (userId)
  - role
  - exp (expiry)
- Protected routes require valid JWT

3.5 Authorization (RBAC)
Endpoints require a user role:
- ADMIN: can manage users and access all resources
- STAFF: can manage rooms/guests/bookings but not users
- VIEWER: read-only endpoints only

Authorization is implemented via middleware/guards that check the user role
from the decoded JWT.

3.6 Key Business Rule: Prevent Double Booking
Before creating or updating a booking, BookingService checks if an overlap
exists for the same room (excluding CANCELLED bookings).

Overlap condition:
- newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn

If overlap exists:
- API returns HTTP 409 Conflict

3.7 REST API Conventions
- JSON request/response
- Standard HTTP status codes:
  - 200 OK / 201 Created
  - 400 Bad Request (validation errors)
  - 401 Unauthorized (missing/invalid JWT)
  - 403 Forbidden (role not allowed)
  - 404 Not Found
  - 409 Conflict (booking overlap)
  - 500 Internal Server Error

3.8 Integration Testing Strategy
Unit tests are not required for CRUD-heavy apps per course guidance.
Instead, basic automated integration tests will be implemented:
- Auth: login returns JWT
- RBAC: STAFF cannot access /users
- Booking: overlapping booking returns 409
- CRUD: create/list/update basic flows
Integration tests run against a dedicated test database (Docker recommended).

============================================================
4) GRADING-FRIENDLY README (copy/paste)
============================================================

# Hotel Management Web Application (SPA + REST API)

A course project implementing a hotel reservation management system using:
- Next.js SPA (frontend)
- RESTful API (backend)
- TypeScript OOP business logic
- PostgreSQL relational database
- TypeORM ORM access
- Dependency Injection
- JWT authentication + optional RBAC
- Basic integration tests

## Features
- Authentication: username/password + JWT
- RBAC roles: ADMIN, STAFF, VIEWER (optional)
- Rooms: CRUD (room number, type, capacity, price)
- Guests: CRUD (name, email, phone)
- Bookings: CRUD + business rules
  - Prevent overlapping bookings for the same room
  - Status flow (PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT / CANCELLED)
- Search bookings by date range + pagination

## Tech Stack
Frontend:
- Next.js
- Tailwind CSS

Backend:
- Node.js + TypeScript
- TypeORM (PostgreSQL)
- JWT Auth (bcrypt password hashing)
- DI container (tsyringe or typedi)
- Integration tests (Jest + Supertest)

Database:
- PostgreSQL

## Architecture (Course Requirements)
Three-tier architecture:
1) Frontend SPA (Next.js)
2) Backend Business Logic (REST API, OOP TS)
3) Database (PostgreSQL via ORM)

Backend internal structure:
- Controllers: HTTP routing + request/response
- Services: business logic (rules, RBAC)
- Repositories: TypeORM queries

Dependency Injection is used to decouple components.

## Setup (Development)
Prerequisites:
- Node.js >= 18
- PostgreSQL >= 14 (or Docker)

Backend env:
Create backend/.env
- DATABASE_URL=postgres://user:pass@localhost:5432/hotel_db
- JWT_SECRET=your_secret
- JWT_EXPIRES_IN=3600

Run backend:
cd backend
npm install
npm run dev

Run frontend:
cd frontend
npm install
npm run dev

## Database (Migrations)
Run migrations:
cd backend
npm run migration:run

(Optional) seed admin user:
npm run seed

## Example API Endpoints
Auth:
- POST /auth/login

Rooms:
- GET /rooms
- POST /rooms (ADMIN/STAFF)
- PUT /rooms/:id (ADMIN/STAFF)
- DELETE /rooms/:id (ADMIN/STAFF)

Guests:
- GET /guests
- POST /guests (ADMIN/STAFF)

Bookings:
- GET /bookings?from=YYYY-MM-DD&to=YYYY-MM-DD&page=1
- POST /bookings (ADMIN/STAFF)
- PUT /bookings/:id (ADMIN/STAFF)
- DELETE /bookings/:id (ADMIN/STAFF)

## Booking Rule: No Double Booking
Before creating/updating a booking, the service checks overlap:
Overlap exists if:
- newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn
and status != CANCELLED

If conflict exists:
- HTTP 409 Conflict

## Testing (Integration)
Run:
cd backend
npm test

Suggested tests:
- login returns token
- STAFF cannot access /users endpoints
- create booking works
- overlapping booking returns 409
- list bookings returns paginated results

## Suggested Backend Structure
backend/src
- controllers/
- services/
- repositories/
- domain/entities/
- middleware/ (auth, rbac)
- config/ (typeorm datasource)
- tests/ (integration)

============================================================
END OF FILE
============================================================
