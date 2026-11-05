# StayFinder (Staywise) – Project Context & Handoff Document

> **Document Purpose**: This document provides a comprehensive, verified handoff report for the StayFinder (repository folder: `Staywise`) codebase. It allows any subsequent AI coding agent or engineer to immediately pick up development without losing architectural context, discovering undocumented gaps, or repeating previously diagnosed issues.
>
> **Inspection Date**: November 2026  
> **Source Verification**: All statements below have been verified by inspecting the actual source code files on disk.

---

## 1. Project Overview and Objectives

**StayFinder** is a production-grade full-stack hotel search and booking web application. The application is built to feel polished, realistic, and complete—avoiding mock/demo shortcuts while adhering to real-world transactional rules.

### Key Objectives
1. **Intelligent Hotel Search**: Enable users to search properties across name, city, or area with an explainable ranking algorithm that shows a clear reason why each hotel appears in its position.
2. **Comprehensive Hotel & Room Exploration**: Dedicated hotel detail pages showcasing amenities, interactive image galleries, star ratings, verified guest reviews, and dynamic room availability by date range.
3. **Double-Booking Prevention**: Strict transactional guarantees preventing simultaneous or overlapping bookings of the same room across the same date range.
4. **End-to-End User Journeys**: User registration, JWT-based authentication with refresh tokens, guest booking flows, user dashboard for trip history, and verified stay-only review submission.
5. **Role-Based Administration**: Administrative controls to inspect bookings, manage hotels and rooms, and view registered users.
6. **Containerized Deployment**: Local and production readiness via Docker and Docker Compose orchestrating MySQL 8, Spring Boot 3, and React (via Nginx).

---

## 2. Complete Technology Stack and Identifiable Versions

### Backend
| Component | Technology | Version | Location / Identifier |
| :--- | :--- | :--- | :--- |
| **Language** | Java | 21 | `pom.xml` (`<java.version>21</java.version>`), `Dockerfile` (`eclipse-temurin:21`) |
| **Framework** | Spring Boot | 3.2.5 | `pom.xml` (`spring-boot-starter-parent:3.2.5`) |
| **Security** | Spring Security | 6.2.x (Boot managed) | `spring-boot-starter-security` |
| **JWT** | JJWT (Java JWT) | 0.12.3 | `pom.xml` (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`) |
| **ORM / Data** | Spring Data JPA / Hibernate | Boot managed | `spring-boot-starter-data-jpa` |
| **Database Driver** | MySQL Connector/J | Boot managed | `mysql-connector-j` (runtime scope) |
| **Validation** | Jakarta Bean Validation / Hibernate Validator | Boot managed | `spring-boot-starter-validation` |
| **JSON Processing** | Jackson Core & Databind | Boot managed | `jackson-databind` |
| **Boilerplate** | Project Lombok | Boot managed | `lombok` |
| **Build Tool** | Apache Maven | 3.9+ | Wrapper config in `.mvn/wrapper/maven-wrapper.properties` (v3.9.6) |

### Frontend
| Component | Technology | Version | Location / Identifier |
| :--- | :--- | :--- | :--- |
| **Framework / Runtime**| React | 18.2.0 | `frontend/package.json` |
| **DOM Renderer** | React DOM | 18.2.0 | `frontend/package.json` |
| **Language** | TypeScript | 5.2.2 | `frontend/package.json` |
| **Build Tool / Bundler**| Vite | 5.0.12 | `frontend/package.json`, `vite.config.ts` |
| **Styling** | Tailwind CSS | 3.4.1 | `tailwind.config.js`, `postcss.config.js` |
| **PostCSS** | PostCSS + Autoprefixer | 8.4.33 / 10.4.17 | `frontend/package.json` |
| **Server State / Cache**| TanStack React Query | 5.17.19 | `frontend/package.json` |
| **Client State** | Zustand | 4.4.7 | `frontend/package.json` (`authStore.ts`) |
| **Routing** | React Router DOM | 6.21.3 | `frontend/package.json` |
| **HTTP Client** | Axios | 1.6.5 | `frontend/package.json` (`axios.ts`) |
| **Form Management** | React Hook Form | 7.49.3 | `frontend/package.json` |
| **Validation** | Zod + Hookform Resolvers | 3.22.4 / 3.3.4 | `frontend/package.json` |
| **Icons** | Lucide React | 0.316.0 | `frontend/package.json` |
| **Date Utilities** | date-fns | 3.3.1 | `frontend/package.json` |

### Infrastructure & Storage
| Component | Technology | Version | Details |
| :--- | :--- | :--- | :--- |
| **Database** | MySQL | 8.0 | `docker-compose.yml` (`image: mysql:8.0`) |
| **Web Server / Reverse Proxy** | Nginx | Alpine | `frontend/Dockerfile` (`nginx:alpine`) |
| **Container Engine** | Docker Compose | 3.9 Specification | `docker-compose.yml` |

---

## 3. Frontend and Backend Architecture

### Backend Architecture
```
com.stayfinder
├── StayFinderApplication.java        # Spring Boot Entry Point
├── config/                           # Security, JWT, & Startup Seeding
├── controller/                       # REST Endpoints (Admin, Auth, Booking, Hotel, Review, Room)
├── dto/                              # Inbound & Outbound Data Transfer Objects
├── exception/                        # Custom Exceptions & Global Exception Handler
├── model/                            # JPA Entities & Enumerations
├── repository/                       # Spring Data JPA Repositories (Custom JPQL Queries)
├── security/                         # JWT Filter, Token Provider, & UserDetailsService
├── service/                          # Business Logic & Transactional Boundaries
└── util/                             # JPA Converters (JSON to List<String>)
```
- **Layered Pattern**: Clear separation between HTTP representation (`controller`), business transactions (`service`), and persistence (`repository`).
- **Stateless Authentication**: Every request passes through `JwtAuthenticationFilter`, which parses the `Authorization: Bearer <token>` header, decodes user credentials, and populates `SecurityContextHolder`.
- **Concurrency & Overlap Handling**: `BookingService.createBooking` applies `@Transactional` with method synchronization and checks for overlapping confirmed reservations using JPQL time-interval intersection.
- **Dynamic Ranking Algorithm**: `HotelService.scoreHotel` applies weighted keyword relevance to property names, cities, and areas, combined with review count saturation and star ratings.

### Frontend Architecture
```
frontend/src
├── api/                              # Modular Axios API Services (auth, hotels, bookings, reviews)
├── components/
│   ├── booking/                      # DatePicker, BookingConfirmModal
│   ├── hotel/                        # HotelCard, RoomCard, ReviewCard, AmenityBadge, Skeletons
│   ├── layout/                       # Navbar, Footer
│   └── ui/                           # Button, Input, Modal, Badge, Skeleton, StarRating
├── hooks/                            # TanStack Query custom hooks (useAuth, useHotels)
├── pages/                            # Page views (HomePage, SearchPage, HotelDetailPage, BookingPage)
├── store/                            # Zustand Global Stores (authStore with localStorage persistence)
└── types/                            # TypeScript interfaces for entities, requests, and responses
```
- **State Management**:
  - **Server State**: Managed via `@tanstack/react-query` with configurable stale times (`1000 * 60 * 2` ms for searches, `5` minutes for hotel details).
  - **Client / Session State**: Managed via Zustand in `authStore.ts`, persisted to `localStorage` under `stayfinder-auth`.
- **API Interceptors**: `axios.ts` automatically attaches `Authorization: Bearer <accessToken>` and handles automatic access-token renewal upon HTTP 401 using the refresh token before retrying queued requests.

---

## 4. Database Schema and Relationships

All tables are managed by Hibernate JPA mapping to MySQL (`dialect: org.hibernate.dialect.MySQL8Dialect`).

```mermaid
erDiagram
    users ||--o{ bookings : "makes"
    users ||--o{ reviews : "writes"
    hotels ||--|{ rooms : "contains"
    hotels ||--o{ reviews : "receives"
    rooms ||--o{ bookings : "reserved in"
    bookings ||--o| reviews : "optionally associated with"

    users {
        bigint id PK
        varchar(255) email UK
        varchar(255) password_hash
        varchar(100) first_name
        varchar(100) last_name
        varchar(20) role "USER, ADMIN"
        datetime created_at
    }

    hotels {
        bigint id PK
        varchar(255) name
        varchar(100) city
        varchar(100) area
        varchar(500) address
        text description
        int stars
        varchar(1000) main_image_url
        text amenities "JSON Array"
        double avg_rating
        int review_count
        double latitude
        double longitude
    }

    rooms {
        bigint id PK
        bigint hotel_id FK
        varchar(150) name
        varchar(20) type "STANDARD, DELUXE, SUITE, FAMILY"
        decimal(10,2) price_per_night
        int capacity
        text description
        varchar(1000) image_url
        text amenities "JSON Array"
        boolean is_active
    }

    bookings {
        bigint id PK
        bigint user_id FK
        bigint room_id FK
        date check_in_date
        date check_out_date
        decimal(10,2) total_price
        varchar(20) status "CONFIRMED, CANCELLED, COMPLETED"
        int guest_count
        datetime created_at
    }

    reviews {
        bigint id PK
        bigint user_id FK
        bigint hotel_id FK
        bigint booking_id FK "nullable"
        int rating
        varchar(255) title
        text body
        datetime created_at
    }
```

### Constraints & Indexes
- `users.email`: Unique index (`unique = true`).
- `reviews`: Unique composite constraint on `(user_id, hotel_id)` ensuring a user can submit only one review per property.
- `bookings`: Double-booking overlap constraint enforced via database query:
  $$\text{existing.checkIn} < \text{requested.checkOut} \quad\land\quad \text{existing.checkOut} > \text{requested.checkIn}$$
  for all records where `status = 'CONFIRMED'`.

---

## 5. All Implemented Features

### Backend Implemented
- [x] **JWT Authentication System**: Registration, credential validation, access token generation (15 min expiry), and refresh token generation (7 days expiry).
- [x] **Role-Based Access Control**: Spring Security configuration protecting routes by `ROLE_USER` and `ROLE_ADMIN`.
- [x] **Smart Hotel Search & Ranking**: Query across property name, city, and area with score computation and human-readable explanation strings (`rankReason`).
- [x] **Availability Calculation**: Date-range filtering returning only rooms without overlapping confirmed bookings.
- [x] **Transactional Booking Flow**: Price calculation based on `pricePerNight * nights`, date validation (check-out > check-in, check-in $\ge$ today), room active status verification, and duplicate check.
- [x] **Booking Cancellation**: Owner-only cancellation endpoint transitioning status to `CANCELLED`.
- [x] **Verified Review System**: Review submission requiring a prior `COMPLETED` booking by that user at the hotel, enforcing single review per hotel, and recalculating hotel `avgRating` and `reviewCount`.
- [x] **Admin Endpoints**: CRUD operations for hotels, room additions/updates, paginated view of all platform bookings, and user listing.
- [x] **Database Seeding (`DataSeeder.java`)**: Pre-populates the database with 1 admin, 3 regular users, 8 luxury hotels (Mumbai, Delhi, Bangalore, Goa, Jaipur), 24+ room configurations, and seed reviews with ratings.
- [x] **Global Exception Handling**: Centralized JSON error format with appropriate HTTP statuses (404, 409, 403, 401, 400, 500).

### Frontend Implemented
- [x] **Design System & Primitives**: Responsive Tailwind-based UI components (`Button`, `Input`, `Badge`, `Modal`, `Skeleton`, `StarRating`, `DatePicker`, `BookingConfirmModal`).
- [x] **Global State & Token Lifecycle**: Zustand store with `localStorage` sync, automatic 401 interception and refresh flow in Axios.
- [x] **Responsive Navigation**: Desktop bar with profile dropdown and mobile collapse menu (`Navbar.tsx`), comprehensive footer (`Footer.tsx`).
- [x] **Home Page (`HomePage.tsx`)**: Hero banner with search bar, popular destination quick-cards, key metrics, and featured property cards.
- [x] **Search Page (`SearchPage.tsx`)**: Filter sidebar (star ratings, price range, amenities), sorting (relevance, price, rating), skeleton loading states, empty state, and hotel cards displaying rank reasons.
- [x] **Hotel Detail Page (`HotelDetailPage.tsx`)**: Hero visual banner, multi-tab layout (`Overview`, `Rooms`, `Reviews`), date picker checking room availability, modal for submitting verified guest reviews.
- [x] **Booking Checkout Page (`BookingPage.tsx`)**: Date selection, guest count adjustment, real-time price summary calculation, booking confirmation modal, and success receipt.

---

## 6. Features Currently In Progress / Partially Completed

1. **Frontend Application Root & Routing Assembly**:
   - `index.html` references `/src/main.tsx`, but `main.tsx` and `App.tsx` have not yet been created.
   - Individual pages (`HomePage`, `SearchPage`, `HotelDetailPage`, `BookingPage`) exist as components, but the React Router tree is not yet wired together.
2. **Global Styling Setup**:
   - `tailwind.config.js` and `postcss.config.js` are in place, but `src/index.css` containing `@tailwind base; @tailwind components; @tailwind utilities;` is missing.
3. **Room Detail Fetching for Booking Page**:
   - `BookingPage.tsx` expects to fetch individual room details, but the backend lacks a direct `GET /api/rooms/{id}` endpoint.
4. **Search Page Pagination & API Shape Compatibility**:
   - `SearchPage.tsx` expects `data.content` and `data.totalElements` (`PagedResponse<T>`), whereas backend `HotelController.searchHotels` currently returns a raw JSON array `List<HotelSearchResultDto>`.

---

## 7. Pending Features and Development Roadmap

1. **User Authentication Pages**:
   - `src/pages/LoginPage.tsx`: Form for email/password with client validation, error banners, and redirect.
   - `src/pages/RegisterPage.tsx`: Form for first name, last name, email, password, and confirmation.
2. **User Dashboard Page (`src/pages/DashboardPage.tsx`)**:
   - "My Trips" tab: Listing bookings fetched from `GET /api/bookings/my`, showing status badges, cancellation action for upcoming trips, and review submission triggers for completed stays.
   - "My Reviews" tab: Displaying user's authored reviews.
3. **Admin Dashboard Page (`src/pages/AdminPage.tsx`)**:
   - Tabbed admin console for managing hotels (create/edit), managing rooms per hotel, viewing system-wide bookings with status filters, and viewing registered user accounts.
4. **Backend Endpoint Extensions**:
   - `GET /api/rooms/{id}`: Single room retrieval endpoint.
   - `GET /api/reviews/my`: Retrieve reviews authored by the authenticated user.
   - `GET /api/auth/me`: Lightweight session validation endpoint returning the current user profile.
5. **Testing & QA**:
   - Backend unit tests (`@SpringBootTest`, `@WebMvcTest`) for security, double-booking race condition, and ranking.
   - Frontend unit/component tests using Vitest / React Testing Library.

---

## 8. API Endpoints and Integrations

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `RegisterRequestDto` | `AuthResponseDto` |
| `POST` | `/api/auth/login` | Public | `LoginRequestDto` | `AuthResponseDto` |
| `POST` | `/api/auth/refresh` | Public | `{"refreshToken": "..."}` | `AuthResponseDto` |

### Hotels (`/api/hotels`)
| Method | Endpoint | Access | Query Parameters | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/hotels` | Public | `query`, `city`, `page`, `size` | `List<HotelSearchResultDto>` *(Note: see discrepancy section)* |
| `GET` | `/api/hotels/{id}` | Public | None | `HotelDto` (includes `rooms`) |
| `GET` | `/api/hotels/{id}/rooms` | Public | `checkIn` (YYYY-MM-DD), `checkOut` (YYYY-MM-DD) | `List<RoomDto>` (available rooms only) |
| `GET` | `/api/hotels/{id}/reviews` | Public | `page`, `size` | `PagedResponseDto<ReviewDto>` |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Authenticated | `BookingRequestDto` | `BookingDto` |
| `GET` | `/api/bookings/my` | Authenticated | None | `List<BookingDto>` |
| `GET` | `/api/bookings/{id}` | Authenticated | None | `BookingDto` |
| `PUT` | `/api/bookings/{id}/cancel` | Authenticated | None | `BookingDto` |

### Reviews (`/api/reviews`)
| Method | Endpoint | Access | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews` | Authenticated | `ReviewRequestDto` | `ReviewDto` |
| `DELETE`| `/api/reviews/{id}` | Authenticated | None | `204 No Content` |

### Admin (`/api/admin`)
| Method | Endpoint | Access | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/hotels` | `ROLE_ADMIN` | None | `List<HotelDto>` |
| `POST` | `/api/admin/hotels` | `ROLE_ADMIN` | `HotelRequestDto` | `HotelDto` |
| `PUT` | `/api/admin/hotels/{id}`| `ROLE_ADMIN` | `HotelRequestDto` | `HotelDto` |
| `POST` | `/api/admin/hotels/{hotelId}/rooms` | `ROLE_ADMIN` | `RoomRequestDto` | `RoomDto` |
| `PUT` | `/api/admin/rooms/{id}` | `ROLE_ADMIN` | `RoomRequestDto` | `RoomDto` |
| `GET` | `/api/admin/bookings` | `ROLE_ADMIN` | `page`, `size` | `PagedResponseDto<BookingDto>` |
| `GET` | `/api/admin/users` | `ROLE_ADMIN` | None | `List<UserSummaryDto>` |

---

## 9. Authentication and Authorization Implementation

### JWT Token Design
- **Signature Algorithm**: HMAC-SHA256 (`Keys.hmacShaKeyFor`). The provider auto-pads keys shorter than 256 bits to prevent weak-key exceptions.
- **Claims Stored**:
  - `sub`: User ID (`Long` encoded as String).
  - `email`: User email address.
  - `role`: Role string (`USER` or `ADMIN`).
  - `tokenType`: `"access"` or `"refresh"`.
- **Expirations**:
  - Access Token: 900,000 ms (15 minutes).
  - Refresh Token: 604,800,000 ms (7 days).

### Security Filter Chain Flow
1. Incoming HTTP Request hits `JwtAuthenticationFilter` (`OncePerRequestFilter`).
2. Header `Authorization: Bearer <token>` is extracted.
3. Token signature and expiration are verified via `JwtTokenProvider.validateToken`.
4. User identity is set into `SecurityContextHolder` as `UsernamePasswordAuthenticationToken` with:
   - `principal`: `Long userId`
   - `credentials`: `String email`
   - `authorities`: `List.of(new SimpleGrantedAuthority("ROLE_" + role))`
5. Controllers access the user ID directly via `(Long) authentication.getPrincipal()`.

---

## 10. Important Files and Folder Structure

```
d:\PROJECTS\Staywise\
├── .env.example                                      # Template environment variables
├── docker-compose.yml                                # Multi-container orchestration (MySQL, Backend, Frontend)
├── README.md                                         # Public documentation and setup instructions
├── PROJECT_CONTEXT.md                                # THIS FILE (Master technical handoff)
│
├── backend/
│   ├── Dockerfile                                    # Multi-stage Java 21 alpine container build
│   ├── pom.xml                                       # Maven build definition (Spring Boot 3.2.5)
│   ├── .mvn/wrapper/maven-wrapper.properties         # Maven wrapper configuration
│   └── src/main/
│       ├── java/com/stayfinder/
│       │   ├── StayFinderApplication.java            # Spring Boot main class
│       │   ├── config/
│       │   │   ├── DataSeeder.java                   # Startup demo data seeder
│       │   │   ├── JwtConfig.java                    # Configuration property binder for "jwt.*"
│       │   │   └── SecurityConfig.java               # Security filter chain, CORS & session config
│       │   ├── controller/                           # Controllers for Admin, Auth, Booking, Hotel, Review, Room
│       │   ├── dto/                                  # All request and response DTO records/classes
│       │   ├── exception/                            # Custom exceptions and GlobalExceptionHandler
│       │   ├── model/                                # JPA entities (User, Hotel, Room, Booking, Review)
│       │   ├── repository/                           # JPA repositories with custom JPQL queries
│       │   ├── security/                             # JwtTokenProvider, JwtAuthFilter, UserDetailsServiceImpl
│       │   ├── service/                              # Business logic services
│       │   └── util/StringListConverter.java         # Jackson-backed List<String> to JSON TEXT JPA converter
│       └── resources/
│           └── application.yml                       # Spring configuration & datasource properties
│
├── frontend/
│   ├── Dockerfile                                    # Multi-stage Node 20 build -> Nginx serving
│   ├── nginx.conf                                    # Nginx reverse proxy configuration for /api and SPA routing
│   ├── package.json                                  # NPM dependencies and scripts
│   ├── postcss.config.js                             # PostCSS configuration
│   ├── tailwind.config.js                            # Tailwind styling configuration
│   ├── tsconfig.json                                 # TypeScript compiler options
│   ├── vite.config.ts                                # Vite bundler configuration with dev proxy
│   ├── index.html                                    # Single-page HTML entry point
│   └── src/
│       ├── api/                                      # Axios instances and API endpoint modules
│       ├── components/
│       │   ├── booking/                              # BookingConfirmModal.tsx, DatePicker.tsx
│       │   ├── hotel/                                # HotelCard.tsx, RoomCard.tsx, ReviewCard.tsx, AmenityBadge.tsx
│       │   ├── layout/                               # Navbar.tsx, Footer.tsx
│       │   └── ui/                                   # Button.tsx, Input.tsx, Badge.tsx, Modal.tsx, Skeleton.tsx, StarRating.tsx
│       ├── hooks/                                    # useAuth.ts, useHotels.ts
│       ├── pages/                                    # HomePage.tsx, SearchPage.tsx, HotelDetailPage.tsx, BookingPage.tsx
│       ├── store/authStore.ts                        # Zustand authentication store
│       └── types/index.ts                            # Full TypeScript type definitions
│
└── mysql/
    └── init/                                         # Mounted to /docker-entrypoint-initdb.d in MySQL container
```

---

## 11. Environment Variables Required

> [!CAUTION]
> Never commit actual credentials, private keys, or passwords to source control. Use the dummy names and descriptions below when creating `.env`.

| Variable Name | Required By | Description / Default Example |
| :--- | :--- | :--- |
| `DB_HOST` | Backend | Hostname of the MySQL server (use `mysql` in Docker, `localhost` for local dev) |
| `DB_PORT` | Backend | Port for MySQL server (default: `3306`) |
| `DB_NAME` | Backend & MySQL | Database schema name (default: `stayfinder`) |
| `DB_USER` | Backend & MySQL | MySQL application username |
| `DB_PASSWORD` | Backend & MySQL | MySQL application password |
| `MYSQL_ROOT_PASSWORD`| MySQL Container | MySQL administrative root password |
| `JWT_SECRET` | Backend | 256-bit+ HMAC cryptographic secret key |
| `SPRING_PROFILES_ACTIVE`| Backend | Active Spring profile (e.g. `docker` or `dev`) |

---

## 12. How to Install Dependencies and Run Locally

### Prerequisites
- Java 21 JDK (verified: Eclipse Adoptium JDK 21 installed on host)
- Maven 3.9+ (verified: Apache Maven 3.9.16 installed on host)
- Node.js 20+ and npm 10+
- Running MySQL 8 instance on port 3306

### Step-by-Step Local Run

#### 1. Start MySQL
Ensure MySQL is running with database `stayfinder`:
```sql
CREATE DATABASE IF NOT EXISTS stayfinder;
```

#### 2. Start Backend
```powershell
cd d:\PROJECTS\Staywise\backend
mvn clean spring-boot:run
```
*The backend will boot on `http://localhost:8080`. On initial boot, `DataSeeder` will seed default admin and user accounts along with sample hotels.*

#### 3. Start Frontend
```powershell
cd d:\PROJECTS\Staywise\frontend
npm install
npm run dev
```
*The frontend Vite dev server will run on `http://localhost:5173`. Requests made to `/api` are automatically proxied to `http://localhost:8080` via `vite.config.ts`.*

---

## 13. Docker Configuration and Deployment Instructions

### Docker Setup
The repository contains a top-level `docker-compose.yml` defining three interdependent services:
1. `mysql`: MySQL 8.0 image with health check (`mysqladmin ping`).
2. `backend`: Built via `backend/Dockerfile`, waits for `mysql` healthy condition.
3. `frontend`: Built via `frontend/Dockerfile`, runs Nginx on port 80 (mapped to host 3000) and proxies `/api` requests internally to `http://backend:8080`.

### Running with Docker Compose
```powershell
cd d:\PROJECTS\Staywise
docker compose up --build
```

### Access Points
- **Web Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080/api`
- **MySQL Direct**: `localhost:3306`

---

## 14. Known Bugs, Errors, and Incomplete Implementations

This section lists verified discrepancies and blockers identified in the codebase that require immediate correction.

### Blocker 1: Missing Maven Wrapper Script in Backend Dockerfile
- **Location**: `backend/Dockerfile` line 6: `COPY mvnw pom.xml ./`
- **Issue**: The physical scripts `mvnw` and `mvnw.cmd` were not committed to `backend/` (only `.mvn/wrapper/maven-wrapper.properties` exists).
- **Consequence**: `docker compose up --build` or `docker build` fails immediately with `COPY failed: file not found: mvnw`.
- **Fix**: Either generate the wrapper via `mvn wrapper:wrapper` in `backend/`, or adjust `backend/Dockerfile` to use a Maven image to compile (e.g., `FROM maven:3.9-eclipse-temurin-21-alpine AS build`).

### Blocker 2: Missing `package-lock.json` in Frontend Dockerfile
- **Location**: `frontend/Dockerfile` line 4: `RUN npm ci`
- **Issue**: There is no `package-lock.json` in `frontend/`.
- **Consequence**: `npm ci` fails because it requires an existing lockfile.
- **Fix**: Run `npm install` inside `frontend/` to generate `package-lock.json` or change the Dockerfile line to `RUN npm install`.

### Blocker 3: Unused Module Import in `Button.tsx` Causing TypeScript Failure
- **Location**: `frontend/src/components/ui/Button.tsx` line 2:
  ```typescript
  import { cva, type VariantProps } from 'class-variance-authority';
  ```
- **Issue**: `class-variance-authority` is not listed in `frontend/package.json`. Line 4 notes `// Simple CVA-like helper without the package`.
- **Consequence**: `npm run build` (`tsc && vite build`) fails with `Cannot find module 'class-variance-authority'`.
- **Fix**: Delete line 2 from `Button.tsx`.

### Blocker 4: Missing Frontend Entry Point Files
- **Location**: `frontend/src/`
- **Issue**: `src/main.tsx`, `src/App.tsx`, and `src/index.css` do not exist.
- **Consequence**: The frontend cannot start or build.
- **Fix**: Implement `src/index.css` (Tailwind directives), `src/App.tsx` (React Router routes matching all views), and `src/main.tsx` (React 18 `createRoot` rendering `QueryClientProvider` and `App`).

### Blocker 5: Missing Frontend Pages
- **Location**: `frontend/src/pages/`
- **Missing Files**:
  - `LoginPage.tsx`
  - `RegisterPage.tsx`
  - `DashboardPage.tsx`
  - `AdminPage.tsx`
- **Consequence**: Links in `Navbar.tsx` and redirects in `HotelDetailPage.tsx` break with 404 or missing route errors.

### Discrepancy 1: Hotel Search Response Format Mismatch
- **Backend**: `HotelController.java` returns `List<HotelSearchResultDto>` (a JSON array):
  ```java
  public ResponseEntity<List<HotelSearchResultDto>> searchHotels(...)
  ```
- **Frontend**: `hotels.ts` and `SearchPage.tsx` expect `PagedResponse<HotelSearchResult>` (`data.content` and `data.totalElements`):
  ```typescript
  const results = data?.content || [];
  ```
- **Consequence**: On `SearchPage.tsx`, `results` evaluates to `[]` because `data` is an Array, not an object containing `content`.
- **Fix**: Standardize on either wrapping `searchHotels` in `PagedResponseDto` on the backend, or adapting `hotelsApi.search` in `hotels.ts` to transform the response.

### Discrepancy 2: Room Fetching in `BookingPage.tsx`
- **Location**: `BookingPage.tsx` lines 33-34:
  ```typescript
  const response = await hotelsApi.getAllRooms(0, 100);
  return response.content.find((r) => r.id === roomIdNum) || null;
  ```
- **Issue**: `hotelsApi.getAllRooms` requests `GET /api/rooms`, but backend `RoomController.java` only exposes `PUT /api/rooms/{id}`.
- **Consequence**: Attempting to book a room results in a 404 or 405 error on room fetch.
- **Fix**: Add a `GET /api/rooms/{id}` endpoint in `RoomController.java` (and `RoomService.java`), and update `BookingPage.tsx` to fetch the room by ID directly.

### Discrepancy 3: Deprecated Image Fallback Service
- **Location**: `HotelCard.tsx` and `RoomCard.tsx`
- **Issue**: Uses `https://source.unsplash.com/...`, which was permanently decommissioned.
- **Consequence**: Image fallback fails or produces 404 broken image placeholders when hotels do not provide an image.
- **Fix**: Use direct Unsplash CDN URLs (`https://images.unsplash.com/...`) or a stable placeholder SVG.

---

## 15. Important Technical Decisions and Reasons Behind Them

1. **Transactional Overlap Checking for Room Booking**:
   - *Decision*: Enforce overlap verification via JPA JPQL logic (`b.checkInDate < :checkOut AND b.checkOutDate > :checkIn`) within a synchronized `@Transactional` method in `BookingService`.
   - *Reason*: Eliminates race conditions causing double-bookings when multiple concurrent users select the same room for identical dates.
2. **Transparent Search Ranking Algorithm**:
   - *Decision*: Avoid black-box scoring. `HotelService.scoreHotel` calculates relevance points (name: +100/80, city: +50/35, area: +30, rating: +rating*10, reviews: +min(reviewCount, 50)) and constructs a human-readable `rankReason` string stored on each search result.
   - *Reason*: Directly fulfills the core product requirement of explainable hotel ranking.
3. **Verified-Stay Review Requirement**:
   - *Decision*: `ReviewService.addReview` checks `bookingRepository.existsCompletedBookingByUserAndHotel(userId, hotelId)`.
   - *Reason*: Prevents fake reviews by ensuring users can only review hotels where they have an actual completed stay.
4. **JWT with Stateless Spring Security**:
   - *Decision*: Pass access token in `Authorization` header and manage refresh tokens via an explicit `/api/auth/refresh` endpoint.
   - *Reason*: Enables horizontal scalability of the Spring Boot backend without HTTP session affinity or cluster-wide sticky sessions.
5. **Separate Admin and User Endpoints**:
   - *Decision*: Administrative management operations reside under `/api/admin/**` protected by `@PreAuthorize("hasRole('ADMIN')")`, while client browsing is under public `/api/hotels/**`.
   - *Reason*: Clean security boundary and auditability.

---

## 16. Testing Status and Commands

### Current Status
- **Backend Tests**: No test files exist in `backend/src/test`. Test suite has not been executed.
- **Frontend Tests**: No testing framework (e.g. Vitest) is configured in `package.json`.

### Commands to Run Once Tests Are Added
```powershell
# Run backend tests
cd d:\PROJECTS\Staywise\backend
mvn test

# Run frontend linting
cd d:\PROJECTS\Staywise\frontend
npm run lint

# Run frontend type checking & build
cd d:\PROJECTS\Staywise\frontend
npm run build
```

---

## 17. Exact Next Recommended Development Tasks

The following tasks are ordered strictly by dependency and impact:

1. **Fix Build Blockers**:
   - Remove unused `class-variance-authority` import in `frontend/src/components/ui/Button.tsx`.
   - Run `npm install` in `frontend/` to generate `package-lock.json`.
   - In `backend/`, generate the Maven wrapper (`mvn -N wrapper:wrapper`) or update `backend/Dockerfile` to avoid referencing missing `mvnw`.
2. **Create Core Frontend Wiring**:
   - Create `frontend/src/index.css` with `@tailwind base; @tailwind components; @tailwind utilities;`.
   - Create `frontend/src/App.tsx` configuring `BrowserRouter`, `Routes`, `Route`, `Navbar`, and `Footer`.
   - Create `frontend/src/main.tsx` initializing `ReactDOM.createRoot` with `QueryClientProvider` and `App`.
3. **Implement Remaining Frontend Pages**:
   - Implement `frontend/src/pages/LoginPage.tsx` (using `useAuth.login`).
   - Implement `frontend/src/pages/RegisterPage.tsx` (using `useAuth.register`).
   - Implement `frontend/src/pages/DashboardPage.tsx` (fetching `GET /api/bookings/my` and rendering trips + review dialog).
   - Implement `frontend/src/pages/AdminPage.tsx` (hotel/room CRUD and booking overview).
4. **Fix API Shape & Missing Endpoints**:
   - Add `GET /api/rooms/{id}` to `RoomController.java` and `RoomService.java`.
   - Update `BookingPage.tsx` to call a dedicated `getRoomById` API method instead of `getAllRooms`.
   - Align search response format between `HotelController.searchHotels` and `hotels.ts` / `SearchPage.tsx`.
   - Add `GET /api/reviews/my` to `ReviewController.java` to support the user dashboard.
5. **End-to-End Verification**:
   - Start MySQL and run the backend.
   - Start the frontend dev server and verify search, hotel details, booking checkout, cancellation, and review submission end-to-end.
   - Test full container orchestration with `docker compose up --build`.

---

## NEXT SESSION INSTRUCTIONS

When resuming development in the next session, follow these precise steps:

```markdown
1. Open the workspace at `d:\PROJECTS\Staywise`.
2. Review `PROJECT_CONTEXT.md` (this file) to understand the architecture and identified issues.
3. Fix the frontend compilation blockers:
   a. Open `frontend/src/components/ui/Button.tsx` and delete the import:
      `import { cva, type VariantProps } from 'class-variance-authority';`
   b. In `d:\PROJECTS\Staywise\frontend`, run `npm install` to create `package-lock.json`.
4. Create the three missing core frontend files:
   a. `frontend/src/index.css` with Tailwind directives.
   b. `frontend/src/App.tsx` defining the application router (`/`, `/search`, `/hotels/:id`, `/book/:roomId`, `/dashboard`, `/login`, `/register`, `/admin`).
   c. `frontend/src/main.tsx` importing `index.css`, configuring `QueryClient`, and rendering `App`.
5. Create the four missing frontend pages:
   a. `frontend/src/pages/LoginPage.tsx`
   b. `frontend/src/pages/RegisterPage.tsx`
   c. `frontend/src/pages/DashboardPage.tsx`
   d. `frontend/src/pages/AdminPage.tsx`
6. Fix backend-frontend API contracts:
   a. In `backend/src/main/java/com/stayfinder/controller/RoomController.java` and `service/RoomService.java`, add `GET /api/rooms/{id}`.
   b. In `backend/src/main/java/com/stayfinder/controller/HotelController.java`, wrap the `searchHotels` return value in `PagedResponseDto<HotelSearchResultDto>` (or update `frontend/src/api/hotels.ts` to accept `List<HotelSearchResultDto>`).
   c. In `backend/src/main/java/com/stayfinder/controller/ReviewController.java` and `service/ReviewService.java`, add `GET /api/reviews/my`.
7. Verify Docker build:
   a. In `backend/`, run `mvn -N wrapper:wrapper` to produce `mvnw` and `mvnw.cmd` (or adjust `backend/Dockerfile` to use a maven base image).
   b. Run `docker compose up --build` and verify that MySQL, backend, and frontend containers boot healthy.
```

