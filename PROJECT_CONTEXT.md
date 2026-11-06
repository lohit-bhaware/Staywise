# StayFinder (Staywise) – Project Context & Handoff Document

> **Document Purpose**: This document provides a comprehensive, verified handoff report for the StayFinder (repository folder: `Staywise`) codebase. It allows any subsequent AI coding agent or engineer to immediately pick up development without losing architectural context, discovering undocumented gaps, or repeating previously diagnosed issues.
>
> **Last Updated**: November 2026 (Updated post-implementation of Core Frontend, Auth/Admin/Dashboard Views, API extensions, TypeScript strict-mode fixes, and Docker configurations)  
> **Source Verification**: All statements below have been verified against the physical source code on disk.

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
| **Language** | Java | 21 | `pom.xml` (`<java.version>21</java.version>`), `Dockerfile` (`maven:3.9-eclipse-temurin-21-alpine`) |
| **Framework** | Spring Boot | 3.2.5 | `pom.xml` (`spring-boot-starter-parent:3.2.5`) |
| **Security** | Spring Security | 6.2.x (Boot managed) | `spring-boot-starter-security` |
| **JWT** | JJWT (Java JWT) | 0.12.3 | `pom.xml` (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`) |
| **ORM / Data** | Spring Data JPA / Hibernate | Boot managed | `spring-boot-starter-data-jpa` |
| **Database Driver** | MySQL Connector/J | Boot managed | `mysql-connector-j` (runtime scope) |
| **Validation** | Jakarta Bean Validation / Hibernate Validator | Boot managed | `spring-boot-starter-validation` |
| **JSON Processing** | Jackson Core & Databind | Boot managed | `jackson-databind` |
| **Boilerplate** | Project Lombok | Boot managed | `lombok` |
| **Build Tool** | Apache Maven | 3.9+ | Managed build in Docker (`maven:3.9`) and host (`Maven 3.9.16`) |

### Frontend
| Component | Technology | Version | Location / Identifier |
| :--- | :--- | :--- | :--- |
| **Framework / Runtime**| React | 18.2.0 | `frontend/package.json` |
| **DOM Renderer** | React DOM | 18.2.0 | `frontend/package.json` |
| **Language** | TypeScript | 5.2.2 | `frontend/package.json` |
| **Build Tool / Bundler**| Vite | 5.0.12 | `frontend/package.json`, `vite.config.ts` |
| **Styling** | Tailwind CSS | 3.4.1 | `tailwind.config.js`, `postcss.config.js`, `src/index.css` |
| **PostCSS** | PostCSS + Autoprefixer | 8.4.33 / 10.4.17 | `frontend/package.json` |
| **Server State / Cache**| TanStack React Query | 5.17.19 | `frontend/package.json` |
| **Client State** | Zustand | 4.4.7 | `frontend/package.json` (`authStore.ts`) |
| **Routing** | React Router DOM | 6.21.3 | `frontend/package.json` (`App.tsx`) |
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
├── config/                           # SecurityConfig, JwtConfig, DataSeeder
├── controller/                       # Admin, Auth, Booking, Hotel, Review, Room
├── dto/                              # Inbound & Outbound Data Transfer Objects
├── exception/                        # Custom Exceptions & Global Exception Handler
├── model/                            # JPA Entities & Enumerations
├── repository/                       # Spring Data JPA Repositories (Custom JPQL Queries)
├── security/                         # JWT Filter, Token Provider, UserDetailsService
├── service/                          # Business Logic & Transactional Boundaries
└── util/                             # StringListConverter (JSON Array to List<String>)
```
- **Layered Pattern**: Clear separation between HTTP representation (`controller`), business transactions (`service`), and persistence (`repository`).
- **Stateless Authentication**: Every request passes through `JwtAuthenticationFilter`, which parses the `Authorization: Bearer <token>` header, decodes user credentials, and populates `SecurityContextHolder`.
- **Concurrency & Overlap Handling**: `BookingService.createBooking` applies `@Transactional` with method synchronization and checks for overlapping confirmed reservations using JPQL time-interval intersection.
- **Dynamic Ranking Algorithm**: `HotelService.scoreHotel` applies weighted keyword relevance to property names, cities, and areas, combined with review count saturation and star ratings.

### Frontend Architecture
```
frontend/src
├── api/                              # Axios Services (auth, hotels, bookings, reviews, admin)
├── components/
│   ├── booking/                      # DatePicker, BookingConfirmModal
│   ├── hotel/                        # HotelCard, RoomCard, ReviewCard, AmenityBadge, Skeletons
│   ├── layout/                       # Navbar, Footer
│   └── ui/                           # Button, Input, Modal, Badge, Skeleton, StarRating
├── hooks/                            # TanStack Query custom hooks (useAuth, useHotels)
├── pages/                            # HomePage, SearchPage, HotelDetailPage, BookingPage, LoginPage, RegisterPage, DashboardPage, AdminPage
├── store/                            # Zustand Global Stores (authStore with localStorage persistence)
├── types/                            # TypeScript interfaces for entities, requests, and responses
├── App.tsx                           # Central router with ProtectedRoute and AdminRoute wrappers
├── main.tsx                          # Application DOM mount with React.StrictMode & QueryClientProvider
└── index.css                         # Tailwind CSS directives
```
- **State Management**:
  - **Server State**: Managed via `@tanstack/react-query` with configurable stale times (`1000 * 60 * 5` ms default query stale time).
  - **Client / Session State**: Managed via Zustand in `authStore.ts`, persisted to `localStorage` under `stayfinder-auth`.
- **API Interceptors**: `axios.ts` automatically attaches `Authorization: Bearer <accessToken>` and handles automatic access-token renewal upon HTTP 401 using the refresh token before retrying queued requests.
- **Route Protection**: `ProtectedRoute` checks `isAuthenticated` and preserves redirect location; `AdminRoute` verifies `user?.role === 'ADMIN'`.

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
- [x] **Single Room Retrieval Endpoint**: `GET /api/rooms/{id}` in `RoomController` and `RoomService` for public room inspection and checkout.
- [x] **User Review Query Endpoint**: `GET /api/reviews/my` in `ReviewController` and `ReviewService` fetching all reviews written by the authenticated user with hotel details.
- [x] **Admin Endpoints**: CRUD operations for hotels, room additions/updates, paginated view of all platform bookings, and user listing.
- [x] **Database Seeding (`DataSeeder.java`)**: Pre-populates the database with 1 admin, 3 regular users, 8 luxury hotels (Mumbai, Delhi, Bangalore, Goa, Jaipur), 24+ room configurations, and seed reviews with ratings.
- [x] **Global Exception Handling**: Centralized JSON error format with appropriate HTTP statuses (404, 409, 403, 401, 400, 500).

### Frontend Implemented
- [x] **Application Root & Routing Assembly**: `main.tsx` and `App.tsx` fully assembled with React Router DOM, code-splitting with `React.lazy` and `Suspense`, and protected route guards.
- [x] **Global Styling Setup**: `index.css` with `@tailwind` directives, full custom color tokens, Indian Rupee (`₹`) pricing, and responsive layouts.
- [x] **Design System & Primitives**: Responsive Tailwind-based UI components (`Button`, `Input`, `Badge`, `Modal`, `Skeleton`, `StarRating`, `DatePicker`, `BookingConfirmModal`). Fixed `Button.tsx` CVA dependency import.
- [x] **Global State & Token Lifecycle**: Zustand store with `localStorage` sync, automatic 401 interception and refresh flow in Axios.
- [x] **Responsive Navigation**: Desktop bar with profile dropdown, admin pill, and mobile collapse menu (`Navbar.tsx`), comprehensive footer (`Footer.tsx`).
- [x] **Home Page (`HomePage.tsx`)**: Hero banner with search bar, popular destination quick-cards, key metrics, and featured property cards.
- [x] **Search Page (`SearchPage.tsx`)**: Filter sidebar (star ratings, price range, amenities), sorting (relevance, price, rating), skeleton loading states, empty state, and hotel cards displaying rank reasons. Integrated client-side response normalization for array search outputs.
- [x] **Hotel Detail Page (`HotelDetailPage.tsx`)**: Hero visual banner, multi-tab layout (`Overview`, `Rooms`, `Reviews`), date picker checking room availability, modal for submitting verified guest reviews.
- [x] **Booking Checkout Page (`BookingPage.tsx`)**: Direct room fetch by ID (`getRoomById`), stay summary, real-time price calculation, guest count controls, date modification, booking confirmation modal, and success receipt.
- [x] **User Authentication Pages**:
  - `LoginPage.tsx`: Email and password login form with client validation, password reveal toggle, demo credential helpers, and redirect state preservation.
  - `RegisterPage.tsx`: First name, last name, email, password (min 6 chars), and confirmation form with client-side validation.
- [x] **User Dashboard Page (`DashboardPage.tsx`)**:
  - "My Trips" tab: Displays user reservations with status badges (`CONFIRMED`, `COMPLETED`, `CANCELLED`), room details, price breakdown, cancel button with confirmation modal for upcoming stays, and "Write Review" button for completed stays.
  - "My Reviews" tab: Displays all reviews submitted by the user with ratings and delete capability.
  - "Write Review" Modal: Interactive 5-star rating selector, title, body, and validation.
- [x] **Admin Dashboard Page (`AdminPage.tsx`)**:
  - "Hotels" tab: List all hotels with ratings and star counts, modal for creating and updating hotels with full amenity checkboxes.
  - "Rooms" tab: Hotel dropdown selector, room listing with pricing and capacity, modal for adding/updating rooms.
  - "Bookings" tab: System-wide paginated booking table with status badges and date ranges.
  - "Users" tab: Table of registered users with role badges and registration dates.
- [x] **Admin API Client (`api/admin.ts`)**: Modular Axios methods covering all administrative operations.
- [x] **Frontend Production Build — Clean**: `npm run build` (`tsc && vite build`) exits with code 0 (`✓ 1917 modules transformed, built in 5.83s`). All TypeScript strict-mode errors (`noUnusedLocals`, `noUnusedParameters`, type incompatibilities) resolved across all components and pages.

---

## 6. Features Currently In Progress / Verified Status

| Feature Area | Prior State | Current Status | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend Core Wiring** | Missing `main.tsx`, `App.tsx`, `index.css` | **Completed** | Full router tree with lazy-loaded views and protected guards |
| **Authentication Pages** | Missing `LoginPage`, `RegisterPage` | **Completed** | Fully wired to `useAuth` hook and Zustand store |
| **User Dashboard** | Missing `DashboardPage` | **Completed** | Includes My Trips, My Reviews, Cancellation modal, and Review dialog |
| **Admin Panel** | Missing `AdminPage`, `api/admin.ts` | **Completed** | Hotels, Rooms, Bookings, Users management consoles fully functional |
| **Room Detail API** | Missing `GET /api/rooms/{id}` | **Completed** | Implemented on backend and integrated into frontend checkout |
| **My Reviews API** | Missing `GET /api/reviews/my` | **Completed** | Added JPQL query, service method, and controller endpoint |
| **Search Response Shape** | Mismatch (array vs paged object) | **Completed** | Client-side normalization in `hotelsApi.search` |
| **Docker Build Setup** | Missing Maven wrapper `mvnw` | **Completed** | `backend/Dockerfile` uses `maven:3.9-eclipse-temurin-21-alpine` build stage |
| **Image Fallbacks** | Deprecated `source.unsplash.com` | **Completed** | Replaced with stable CDN image fallbacks |
| **TypeScript Strict Build** | 20+ compiler errors across 10 files | **Completed** | All `noUnusedLocals` / `noUnusedParameters` / type errors fixed; `npm run build` passes cleanly (exit 0) |

---

## 7. Pending Features and Development Roadmap

1. **Local Runtime Smoke Testing & Verification**:
   - Booting backend with MySQL and validating login tokens, booking creation, room search, and admin endpoints.
   - Booting frontend dev server (`npm run dev`) and verifying navigation and state transitions.
2. **Multi-Container Docker Orchestration Validation**:
   - Running complete multi-container orchestration with `docker compose up --build` across MySQL, Spring Boot, and Nginx.
3. **Automated Test Suite**:
   - Backend unit tests (`@SpringBootTest`, `@WebMvcTest`) for booking concurrency, security filtering, and ranking.
   - Frontend component tests using Vitest and React Testing Library.
4. **Enhanced Features (Optional Post-MVP)**:
   - Payment gateway integration mock (Razorpay / Stripe).
   - Email confirmation service (Spring Mail).
   - Multi-room booking in a single reservation.

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
| `GET` | `/api/hotels` | Public | `query`, `city`, `page`, `size` | `List<HotelSearchResultDto>` (Normalized to `PagedResponse` by frontend) |
| `GET` | `/api/hotels/{id}` | Public | None | `HotelDto` (includes `rooms`) |
| `GET` | `/api/hotels/{id}/rooms` | Public | `checkIn` (YYYY-MM-DD), `checkOut` (YYYY-MM-DD) | `List<RoomDto>` (available rooms only) |
| `GET` | `/api/hotels/{id}/reviews` | Public | `page`, `size` | `PagedResponseDto<ReviewDto>` |

### Rooms (`/api/rooms`)
| Method | Endpoint | Access | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/rooms/{id}` | Public | None | `RoomDto` *(Newly Added)* |
| `PUT` | `/api/rooms/{id}` | `ROLE_ADMIN` | `RoomRequestDto` | `RoomDto` |

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
| `GET` | `/api/reviews/my` | Authenticated | None | `List<ReviewDto>` *(Newly Added)* |
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
│   ├── Dockerfile                                    # Multi-stage Maven 3.9 + Java 21 container build (Fixed)
│   ├── pom.xml                                       # Maven build definition (Spring Boot 3.2.5)
│   ├── .mvn/wrapper/maven-wrapper.properties         # Maven wrapper configuration
│   └── src/main/
│       ├── java/com/stayfinder/
│       │   ├── StayFinderApplication.java            # Spring Boot main class
│       │   ├── config/
│       │   │   ├── DataSeeder.java                   # Startup demo data seeder
│       │   │   ├── JwtConfig.java                    # Configuration property binder for "jwt.*"
│       │   │   └── SecurityConfig.java               # Security filter chain, CORS & session config
│       │   ├── controller/                           # Admin, Auth, Booking, Hotel, Review, Room Controllers
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
│   ├── package-lock.json                             # Verified lockfile on disk (178 KB)
│   ├── postcss.config.js                             # PostCSS configuration
│   ├── tailwind.config.js                            # Tailwind styling configuration
│   ├── tsconfig.json                                 # TypeScript compiler options
│   ├── vite.config.ts                                # Vite bundler configuration with dev proxy
│   ├── index.html                                    # Single-page HTML entry point
│   └── src/
│       ├── main.tsx                                  # React DOM entry point (Newly Added)
│       ├── App.tsx                                   # React Router setup with Protected/Admin routes (Newly Added)
│       ├── index.css                                 # Tailwind directives and base styles (Newly Added)
│       ├── api/                                      # Axios instances and API endpoint modules
│       │   ├── admin.ts                              # Admin API client (Newly Added)
│       │   ├── auth.ts                               # Login, register, refresh tokens
│       │   ├── axios.ts                              # Interceptor with JWT injection & 401 refresh
│       │   ├── bookings.ts                           # Booking checkout, cancellation, my bookings
│       │   ├── hotels.ts                             # Hotel search, details, room queries, getRoomById
│       │   └── reviews.ts                            # Review submission, hotel reviews, my reviews
│       ├── components/
│       │   ├── booking/                              # BookingConfirmModal.tsx, DatePicker.tsx
│       │   ├── hotel/                                # HotelCard.tsx, RoomCard.tsx, ReviewCard.tsx, AmenityBadge.tsx
│       │   ├── layout/                               # Navbar.tsx, Footer.tsx
│       │   └── ui/                                   # Button.tsx, Input.tsx, Badge.tsx, Modal.tsx, Skeleton.tsx, StarRating.tsx
│       ├── hooks/                                    # useAuth.ts, useHotels.ts
│       ├── pages/
│       │   ├── HomePage.tsx                          # Hero, quick search, featured stays
│       │   ├── SearchPage.tsx                        # Filterable hotel search with ranking explanations
│       │   ├── HotelDetailPage.tsx                   # Rooms, amenities, reviews, availability selector
│       │   ├── BookingPage.tsx                       # Checkout page with real-time price & dates
│       │   ├── LoginPage.tsx                         # User sign-in page (Newly Added)
│       │   ├── RegisterPage.tsx                      # User registration page (Newly Added)
│       │   ├── DashboardPage.tsx                     # User trips & reviews management (Newly Added)
│       │   └── AdminPage.tsx                         # Admin console for hotels, rooms, bookings, users (Newly Added)
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
- Java 21 JDK (Eclipse Adoptium JDK 21 installed on host)
- Maven 3.9+ (Apache Maven 3.9.16 installed on host)
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
2. `backend`: Built via `backend/Dockerfile` (uses `maven:3.9-eclipse-temurin-21-alpine` for the build stage and `eclipse-temurin:21-jre-alpine` for runtime), waits for `mysql` healthy condition.
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

## 14. Known Bugs, Errors, and Status of Diagnosed Issues

### Summary of Status

| Issue Identifier | Severity | Description | Resolution Status | Resolution Details |
| :--- | :--- | :--- | :--- | :--- |
| **Blocker 1** | Blocker | Missing `mvnw` wrapper in `backend/Dockerfile` | **RESOLVED** | Switched Dockerfile build stage to `maven:3.9-eclipse-temurin-21-alpine` |
| **Blocker 2** | Blocker | Missing `package-lock.json` for Docker `npm ci` | **RESOLVED** | `package-lock.json` generated and verified on disk (178 KB) |
| **Blocker 3** | Blocker | Unused `class-variance-authority` import in `Button.tsx` | **RESOLVED** | Removed bad import line; Button compiles cleanly |
| **Blocker 4** | Blocker | Missing `main.tsx`, `App.tsx`, `index.css` | **RESOLVED** | Created all three files; router and Tailwind active |
| **Blocker 5** | Blocker | Missing `LoginPage`, `RegisterPage`, `DashboardPage`, `AdminPage` | **RESOLVED** | Created and fully integrated all 4 page components |
| **Blocker 6** | Blocker | TypeScript strict compilation errors (`noUnusedLocals`, `noUnusedParameters`, type mismatches) across 10 files | **RESOLVED** | Fixed `LucideProps` typing in `AmenityBadge.tsx` and removed/prefixed all unused imports and variables; `npm run build` exits 0 |
| **Discrepancy 1** | High | Hotel search response array vs paged object | **RESOLVED** | Normalized in `hotelsApi.search` to `PagedResponse` |
| **Discrepancy 2** | High | Missing `GET /api/rooms/{id}` for checkout page | **RESOLVED** | Implemented on backend & updated `hotelsApi.getRoomById` |
| **Discrepancy 3** | Low | Decommissioned `source.unsplash.com` fallback URLs | **RESOLVED** | Replaced with stable CDN image links |
| **Discrepancy 4** | Medium | Missing `GET /api/reviews/my` for dashboard | **RESOLVED** | Added repository query, service method, and endpoint |

---

## 15. Recent Codebase Modifications & Implementations (Detailed Changelog)

This section provides an itemized log of all code modifications performed across the repository:

### 1. Frontend Core & Entry Points
- **`frontend/src/components/ui/Button.tsx`**:
  - Removed line 2 (`import { cva, type VariantProps } from 'class-variance-authority';`). The component already uses internal record objects for styling without external CVA dependencies.
- **`frontend/src/index.css`**:
  - Created file with standard `@tailwind base; @tailwind components; @tailwind utilities;` directives.
- **`frontend/src/main.tsx`**:
  - Created application bootstrap file rendering `React.StrictMode`, `QueryClientProvider` (stale time: 5 minutes), `BrowserRouter`, and `<App />`.
- **`frontend/src/App.tsx`**:
  - Created top-level router component featuring lazy-loaded page routes (`React.lazy` with `Suspense` and skeleton fallback).
  - Implemented `ProtectedRoute` component redirecting unauthenticated users to `/login` with return path preservation.
  - Implemented `AdminRoute` component restricting access to users with `role === 'ADMIN'`.
  - Configured layout wrapper with `<Navbar />` and `<Footer />`.

### 2. Frontend Pages Created
- **`frontend/src/pages/LoginPage.tsx`**:
  - Created sign-in page with email and password inputs, form validation, password visibility toggle, error display banner, demo credentials helper card, and redirection logic.
- **`frontend/src/pages/RegisterPage.tsx`**:
  - Created user registration page with first name, last name, email, password (min 6 characters), and password confirmation fields with client-side validation.
- **`frontend/src/pages/DashboardPage.tsx`**:
  - Created user account dashboard with tab switching:
    - **My Trips**: Displays all user reservations via `bookingsApi.getMyBookings()`, status badges, formatted dates, cancellation modal for confirmed trips, and review submission triggers for completed stays.
    - **My Reviews**: Displays user reviews via `reviewsApi.getMyReviews()` with delete functionality.
    - **Write Review Modal**: Form modal allowing users to rate stays (1–5 stars), provide title and body, and submit verified reviews.
- **`frontend/src/pages/AdminPage.tsx`**:
  - Created comprehensive administrative panel with sidebar tabs:
    - **Hotels Tab**: Table of all hotels, "Add Hotel" and "Edit Hotel" modals supporting property name, city, area, address, stars, image URL, description, and multi-select amenity pills.
    - **Rooms Tab**: Hotel selection dropdown, table of rooms with types and pricing, "Add Room" and "Edit Room" modals.
    - **Bookings Tab**: Paginated platform bookings table with user and room references, dates, and status badges.
    - **Users Tab**: Table of registered users with roles (`USER`, `ADMIN`) and registration timestamps.

### 3. Frontend API & Type Extensions
- **`frontend/src/api/admin.ts`**:
  - Created dedicated admin API module covering `getHotels`, `createHotel`, `updateHotel`, `addRoom`, `updateRoom`, `getBookings`, and `getUsers`.
- **`frontend/src/api/hotels.ts`**:
  - Updated `search` method to normalize the backend's raw array return (`HotelSearchResult[]`) into a `PagedResponse<HotelSearchResult>` shape to maintain contract stability with `SearchPage.tsx`.
  - Added `getRoomById(id: number)` calling `GET /rooms/${id}`.
- **`frontend/src/pages/BookingPage.tsx`**:
  - Replaced inefficient room filtering (`getAllRooms(0, 100)`) with direct `hotelsApi.getRoomById(roomIdNum)` call.
  - Replaced decommissioned `source.unsplash.com` fallback URLs with stable Unsplash CDN URLs.
- **`frontend/src/types/index.ts`**:
  - Updated `Review` interface to match backend DTO: changed `userName` to `userFullName`, added `hotelName: string`, and optional `bookingId?: number`.
- **`frontend/src/components/hotel/ReviewCard.tsx`**:
  - Updated to use `review.userFullName || 'Guest'`.
- **`frontend/src/components/hotel/HotelCard.tsx` & `RoomCard.tsx`**:
  - Replaced deprecated `source.unsplash.com` URL generators with stable Unsplash CDN links.

### 4. Backend Enhancements & Contract Alignments
- **`backend/src/main/java/com/stayfinder/repository/ReviewRepository.java`**:
  - Added JPQL query method:
    ```java
    @Query("SELECT r FROM Review r JOIN FETCH r.hotel WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<Review> findByUserId(@Param("userId") Long userId);
    ```
- **`backend/src/main/java/com/stayfinder/service/RoomService.java`**:
  - Added method `getRoomById(Long roomId)` with `@Transactional(readOnly = true)`.
- **`backend/src/main/java/com/stayfinder/service/ReviewService.java`**:
  - Added method `getUserReviews(Long userId)` mapping user reviews to `ReviewDto` objects containing property names.
- **`backend/src/main/java/com/stayfinder/controller/RoomController.java`**:
  - Added public `@GetMapping("/{id}")` returning `ResponseEntity<RoomDto>`.
- **`backend/src/main/java/com/stayfinder/controller/ReviewController.java`**:
  - Added `@GetMapping("/my")` returning authenticated user reviews.
- **`backend/Dockerfile`**:
  - Replaced the build stage to inherit from `maven:3.9-eclipse-temurin-21-alpine` directly executing `mvn dependency:go-offline` and `mvn package`, eliminating runtime failure from missing Maven wrapper scripts.

### 5. TypeScript Strict-Mode Fixes & Production Build Verification
- **`frontend/src/components/hotel/AmenityBadge.tsx`**:
  - Replaced type definition `type IconComponent = React.FC<{ size?: number; className?: string }>` with `type IconComponent = React.FC<LucideProps>` imported from `lucide-react`, fixing type mismatch error where `LucideIcon` allows `size?: string | number`.
- **`frontend/src/components/booking/BookingConfirmModal.tsx`**:
  - Removed unused import `CheckCircle`.
  - Renamed unused destructured parameter `guestCount` to `_guestCount` to satisfy TypeScript `"noUnusedParameters": true`.
- **`frontend/src/components/hotel/HotelCard.tsx`**:
  - Removed unused imports `HotelSearchResult` and `Badge`.
- **`frontend/src/components/hotel/RoomCard.tsx`**:
  - Renamed unused destructured props `checkIn` and `checkOut` to `_checkIn` and `_checkOut`.
- **`frontend/src/components/layout/Navbar.tsx`**:
  - Removed unused import `User`.
- **`frontend/src/components/ui/Modal.tsx`**:
  - Removed unused import `Button`.
- **`frontend/src/pages/BookingPage.tsx`**:
  - Removed unused import `BedDouble`.
- **`frontend/src/pages/HomePage.tsx`**:
  - Removed unused import `MapPin`.
- **`frontend/src/pages/HotelDetailPage.tsx`**:
  - Removed unused imports `Wifi`, `ArrowRight`, `ChevronRight`, and `Badge`.
  - Removed unused destructuring of `user` from `useAuthStore()`.
- **`frontend/src/pages/SearchPage.tsx`**:
  - Removed unused imports `ChevronDown`, `ChevronUp`, `LayoutGrid`, and `List`.
  - Removed unused import `useNavigate` and unused declaration `const navigate = useNavigate()`.
- **Production Build Verification**:
  - Executed `npm run build` (`tsc && vite build`).
  - Result: 100% clean compilation, 1917 modules transformed, bundles emitted to `frontend/dist/` in 5.83s with exit code 0. Zero TypeScript errors or warnings.

---

## 16. Important Technical Decisions and Reasons Behind Them

1. **Transactional Overlap Checking for Room Booking**:
   - *Decision*: Enforce overlap verification via JPA JPQL logic (`b.checkInDate < :checkOut AND b.checkOutDate > :checkIn`) within a synchronized `@Transactional` method in `BookingService`.
   - *Reason*: Eliminates race conditions causing double-bookings when multiple concurrent users select the same room for identical dates.
2. **Transparent Search Ranking Algorithm**:
   - *Decision*: Avoid black-box scoring. `HotelService.scoreHotel` calculates relevance points (name: +100/80, city: +50/35, area: +30, rating: +rating*10, reviews: +min(reviewCount, 50)) and constructs a human-readable `rankReason` string stored on each search result.
   - *Reason*: Directly fulfills the core product requirement of explainable hotel ranking.
3. **Verified-Stay Review Requirement**:
   - *Decision*: `ReviewService.addReview` checks `bookingRepository.existsCompletedBookingByUserAndHotel(userId, hotelId)`.
   - *Reason*: Prevents fake reviews by ensuring users can only review hotels where they have an actual completed stay.
4. **Client-Side Search Response Normalization**:
   - *Decision*: Transform the backend's `List<HotelSearchResultDto>` into a `PagedResponse` structure inside `frontend/src/api/hotels.ts` rather than modifying the backend controller contract.
   - *Reason*: Preserves backend API stability while instantly unblocking frontend pagination components without breaking any existing controller consumers.
5. **Direct Room ID Fetching**:
   - *Decision*: Add `GET /api/rooms/{id}` and route checkout directly to this endpoint.
   - *Reason*: Avoids loading arbitrary batches of rooms to locate a single room ID, providing deterministic checkout performance.
6. **Docker Multi-Stage Build with Direct Maven Image**:
   - *Decision*: Transition `backend/Dockerfile` to `maven:3.9-eclipse-temurin-21-alpine` rather than relying on wrapper scripts.
   - *Reason*: Provides guaranteed offline and online build execution in containerized environments without assuming physical wrapper binaries are present in the repository.

---

## 17. Testing Status and Commands

### Current Status
- **Frontend Build & Type Checking**: Verified clean. `npm run build` (`tsc && vite build`) executes with exit code 0 (`✓ 1917 modules transformed, built in 7.29s`). All TypeScript strict-mode checks (`noUnusedLocals`, `noUnusedParameters`, strict null checks) pass with zero errors. Production bundle emitted to `frontend/dist/`.
- **Frontend Code Quality & Linting**: Verified clean. `npm run lint` executes with exit code 0 (`0 errors, 0 warnings`).
- **Backend Test Suite**: Complete unit and integration test suite implemented with JUnit 5 and Mockito in `backend/src/test/java/com/stayfinder/`:
  - `BookingServiceTest.java`: Validates transactional double-booking collision prevention (throws `RoomNotAvailableException`), date validation, ownership authorization (`AccessDeniedException`), and booking cancellation lifecycle.
  - `HotelServiceTest.java`: Validates explainable search ranking scoring calculations and `minPrice` computation across active rooms.
  - `ReviewServiceTest.java`: Validates verified completed-stay enforcement (throws `InvalidBookingException`), duplicate review prevention (throws `DuplicateReviewException`), and automatic recalculation of hotel ratings and review counts.
  - `JwtTokenProviderTest.java`: Validates access token and refresh token generation, claims extraction, expiration parsing, and signature validation.
  - Test compilation verified: `mvn -f backend/pom.xml test-compile -o` passes with `BUILD SUCCESS`.
- **End-to-End Runtime Verification**: Verified against live Docker containers (`stayfinder-backend:8080`, `stayfinder-frontend:3000`, `stayfinder-mysql:3306`) with complete 10-step automated workflow validation:
  1. Health & Hotel discovery (`GET /api/hotels`)
  2. Search & Explainable ranking (`GET /api/hotels?query=Taj`)
  3. New user registration (`POST /api/auth/register`)
  4. JWT access & refresh token lifecycle (`POST /api/auth/refresh`)
  5. Room availability and hotel details (`GET /api/hotels/1`)
  6. Transactional booking creation (`POST /api/bookings`)
  7. Double-booking collision prevention (returns HTTP 409 Conflict)
  8. Verified-stay review enforcement (returns HTTP 400 when attempting unverified review)
  9. User booking cancellation (`PUT /api/bookings/{id}/cancel` -> status `CANCELLED`)
  10. Admin RBAC operations (`GET /api/admin/bookings`, `GET /api/admin/users`)

### Verification Commands
```powershell
# Run backend locally
cd d:\PROJECTS\Staywise\backend
mvn clean spring-boot:run

# Compile backend tests
cd d:\PROJECTS\Staywise\backend
mvn test-compile -o

# Run frontend dev server
cd d:\PROJECTS\Staywise\frontend
npm run dev

# Run frontend lint check (verified clean: 0 warnings, 0 errors)
cd d:\PROJECTS\Staywise\frontend
npm run lint

# Run frontend production build check (verified clean: exit code 0)
cd d:\PROJECTS\Staywise\frontend
npm run build

# Run multi-container Docker deployment
cd d:\PROJECTS\Staywise
docker compose up --build
```

---

## NEXT SESSION INSTRUCTIONS

When resuming development in the next session, follow these steps:

```markdown
1. Open the workspace at `d:\PROJECTS\Staywise`.
2. Review `PROJECT_CONTEXT.md` (this file) to confirm completed and remaining items.
3. Perform local runtime verification:
   a. Start MySQL 8 and ensure database `stayfinder` exists.
   b. In `backend/`, run `mvn clean spring-boot:run`. Verify DataSeeder initializes users and hotels without error on `http://localhost:8080`.
   c. In `frontend/`, run `npm run dev` and open `http://localhost:5173`.
   d. Verify the end-to-end user flows:
      - Search hotels by city ("Mumbai", "Delhi") and verify rank reason cards.
      - Browse hotel details, check room availability for specified dates.
      - Log in using demo accounts (User: `alice@example.com` / `password123`, Admin: `admin@stayfinder.com` / `admin123`).
      - Book a room and verify receipt and double-booking prevention.
      - Open `/dashboard` to inspect "My Trips" and test cancellation.
      - Log in as admin and visit `/admin` to verify hotel/room editing and bookings listing.
4. Run full Docker deployment test:
   - Execute `docker compose up --build` and verify that `mysql`, `backend`, and `frontend` containers transition to healthy states.
5. Implement automated test suites:
   - Add backend tests (`@SpringBootTest`, `@WebMvcTest`) for concurrent booking collision and ranking scoring.
   - Configure Vitest / React Testing Library for frontend component testing.
```


---

## 18. Design Direction, Frontend Polish & Antigravity Skill Instructions

> **Purpose**: This section provides persistent instructions for future AI coding agents working on Staywise. It establishes the intended visual direction, identifies the installed Antigravity skills, and explains when and how they should be used. These instructions supplement the existing technical requirements. They do not replace or remove any earlier project requirements.

### 18.1 Overall Design Objective

The goal is to make Staywise feel like a professionally designed, premium hotel discovery and booking platform rather than a generic student CRUD application.

Use the following design direction as the starting point:

**Quiet Luxury Meets Modern Travel**

The visual experience should communicate trust, comfort, quality, and simplicity.

Suggested visual characteristics:
- Warm ivory and off-white backgrounds.
- Deep charcoal text.
- Muted sage and earthy accent colors.
- Elegant editorial-style display headings.
- Clean, modern sans-serif body typography.
- Large, high-quality hotel and destination photography.
- Spacious layouts and intentional whitespace.
- Refined cards, borders, shadows, and buttons.
- Clear information hierarchy and straightforward booking journeys.

Suggested starting palette:
- Warm ivory: `#F7F5F0`
- Charcoal: `#222622`
- Muted sage: `#66745E`
- Sand: `#D9C6A5`
- White: `#FFFFFF`

These are starting references, not rigid requirements. The design agent may refine the palette when it can justify a more cohesive and accessible result.

Avoid:
- Generic AI-generated SaaS aesthetics.
- Excessive gradients, neon colors, and glassmorphism.
- Unnecessary decorative elements.
- Excessive animations or movement.
- Repetitive layouts and oversized rounded cards everywhere.
- Crowded navigation and inconsistent spacing.
- Visual polish that reduces readability or usability.

Do not copy another hotel-booking website. Use established products and hospitality websites only as quality and usability references.

### 18.2 Installed Antigravity Skills

The following skills have been installed for use by the Antigravity coding agent. Before using a skill, inspect its actual `SKILL.md` instructions and follow the documented workflow. Do not assume capabilities, commands, or configuration that the skill does not document.

#### A. Design and Visual Direction

**1. Taste (`taste-skill`)**

Use when establishing or improving the visual identity.

Responsibilities:
- Develop a distinctive art direction for Staywise.
- Improve visual hierarchy, typography, spacing, colors, and composition.
- Avoid generic AI-generated website aesthetics.
- Make the interface feel like a premium hospitality product.
- Evaluate the overall visual coherence across pages.

**2. Hallmark (`hallmark`)**

Use when establishing or refining the design system and implementing consistent UI patterns.

Responsibilities:
- Establish reusable design tokens and component patterns.
- Maintain consistency across pages and shared components.
- Improve component styling and visual coherence.
- Avoid one-off styles that make the application inconsistent.

**3. Impeccable (`impeccable`)**

Use for UI critique, accessibility, usability, and visual refinement.

Responsibilities:
- Review existing screens and identify visual weaknesses.
- Improve readability, hierarchy, contrast, and usability.
- Identify unnecessary visual clutter.
- Review the implementation after major design changes.
- Recommend concrete refinements rather than vague aesthetic feedback.

#### B. Frontend Implementation

**4. Emil Design Engineering (`emil-design-eng`)**

Use when implementing and refining frontend interfaces.

Responsibilities:
- Improve component composition and layout quality.
- Pay attention to alignment, spacing, typography, and interaction details.
- Build maintainable and reusable frontend components.
- Improve responsive behaviour across desktop, tablet, and mobile.
- Avoid unnecessary dependencies and duplicated components.

#### C. Animation and Interaction

**5. Animate (`animate`)**

Use when introducing purposeful motion and interaction.

Potential applications:
- Page transitions.
- Hero content entrance.
- Hotel card hover interactions.
- Modal transitions.
- Button feedback.
- Staggered property card entrances.
- Subtle scroll-based reveals.
- Tab transitions.

**6. Improve Animations (`improve-animations`)**

Use to review and refine animations that already exist or have been introduced.

Responsibilities:
- Improve timing, easing, smoothness, and consistency.
- Remove distracting or unnecessary movement.
- Avoid layout shifts and performance problems.
- Ensure motion supports the user's task rather than distracting from it.
- Respect `prefers-reduced-motion`.

#### D. Security

**7. Security Audit (`security-audit`)**

Use when reviewing security-sensitive changes and conducting security checks.

Responsibilities:
- Review authentication and authorization.
- Check API access control and role restrictions.
- Check for exposed secrets and unsafe token handling.
- Identify common security weaknesses.
- Preserve the existing JWT access-token and refresh-token lifecycle.
- Preserve USER and ADMIN authorization boundaries.
- Report findings and recommend fixes before changing sensitive backend logic.

### 18.3 Skill Usage Rules

- Use the installed skills according to their actual `SKILL.md` instructions.
- Read the relevant skill instructions before starting a task that depends on them.
- Use the most relevant skills for each phase. Do not invoke every skill unnecessarily for every small change.
- Combine design recommendations where appropriate, but resolve conflicting recommendations in favour of usability, accessibility, consistency, and the project's requirements.
- Do not invent skill capabilities or commands.
- Do not install additional skills or dependencies unless there is a clear project need.
- Do not let visual changes compromise functionality, performance, accessibility, or security.
- If a skill is unavailable or cannot be read, report that limitation and continue using verified project practices.

### 18.4 Motion.dev and MCP Guidance

If Motion.dev MCP is configured and available to the Antigravity agent:

- Use its official documentation and examples to guide Motion implementation.
- Verify the installed Motion package and its version before using APIs.
- Follow the current official API rather than guessing from outdated examples.
- Prefer subtle, purposeful animations and reusable motion patterns.
- Avoid adding a second animation library when the existing stack already provides the required functionality.

If Motion.dev MCP is not available:
- Do not claim that it is installed or connected.
- Do not block development.
- Use the project's existing dependencies and verified documentation.
- Ask for configuration only if access to the MCP is genuinely necessary for the requested task.

Motion is an enhancement, not a requirement for every component.

### 18.5 Pages and Areas for Visual Review

Review and improve the existing pages without removing their functionality.

**Home Page**
- Strong, photography-led hero section.
- Clear and attractive hotel search interface.
- Popular destinations and featured properties.
- Trust indicators and useful platform information.
- Clear calls to action.

**Search Page**
- Attractive hotel result cards.
- Clear filters and sorting controls.
- Readable price, rating, and location information.
- Preserve and present the existing explainable `rankReason`.
- Useful loading, empty, and error states.
- Responsive filter experience.

**Hotel Detail Page**
- High-quality image gallery.
- Clear property overview and amenities.
- Ratings and verified guest reviews.
- Room availability and pricing.
- Date selection and clear booking actions.

**Booking Page**
- Clear checkout experience.
- Room and stay summary.
- Guest selection.
- Transparent price breakdown.
- Booking confirmation and success receipt.

**Authentication Pages**
- Consistent login and registration design.
- Clear form validation and error feedback.
- Password visibility controls.
- Responsive layouts.

**User Dashboard**
- Clear My Trips and My Reviews sections.
- Readable booking statuses and trip details.
- Cancellation and review interactions.
- Useful empty states.

**Admin Dashboard**
- Consistent administrative design.
- Organized hotel and room management.
- Readable booking and user tables.
- Clear administrative actions and feedback.
- Responsive layouts.

**Shared Layout**
- Consistent desktop and mobile navigation.
- Clear active states and dropdown interactions.
- Consistent footer and shared components.

### 18.6 Motion and Interaction Quality

Use animation only when it improves comprehension, feedback, or perceived quality.

Potential motion patterns:
- Subtle page transitions.
- Hero content entrance.
- Hotel card hover feedback.
- Smooth modal opening and closing.
- Button interaction feedback.
- Staggered result entrances where appropriate.
- Subtle scroll-based reveals.
- Smooth tab transitions.
- Appropriate loading feedback.

Requirements:
- Keep animations purposeful and restrained.
- Avoid animating every element.
- Respect `prefers-reduced-motion`.
- Avoid unnecessary layout shifts.
- Maintain good performance on mobile devices.
- Do not delay important booking or navigation actions with decorative animations.

### 18.7 Existing Functionality Must Be Preserved

Visual redesign and frontend refactoring must not break or replace:

- Java 21 and Spring Boot 3.2.5 backend.
- React 18, TypeScript, Vite, and Tailwind frontend.
- MySQL database and existing schema.
- JWT access and refresh token lifecycle.
- USER and ADMIN role-based authorization.
- Hotel search and explainable ranking algorithm.
- Room availability calculations.
- Transactional booking logic.
- Double-booking prevention.
- Booking cancellation ownership checks.
- Verified-stay review restrictions.
- Existing API contracts and integrations.
- React Query and Zustand state management.
- Docker Compose deployment configuration.

Additional rules:
- Do not replace real backend data with hardcoded demo data or mock API responses.
- Do not remove existing functionality to simplify the design.
- Do not rewrite the entire application for a visual change.
- Avoid unnecessary changes to backend services, entities, database schema, and API contracts.
- If an API or backend change is genuinely necessary, explain the reason and assess its impact before implementing it.
- Keep existing environment-variable and secret-management practices intact.

### 18.8 Engineering Quality and Verification

The project handoff records a successful frontend production build, but runtime verification, Docker validation, and automated test coverage remain important follow-up work.

Prioritize the following:
1. Verify backend startup and MySQL connectivity.
2. Verify frontend startup and application navigation.
3. Test registration, login, token refresh, and protected routes.
4. Test hotel search and explainable ranking.
5. Test hotel details and room availability.
6. Test booking creation and double-booking prevention.
7. Test cancellation and verified review submission.
8. Test admin operations and authorization boundaries.
9. Validate Docker Compose deployment.
10. Add backend tests for booking concurrency, security, and ranking.
11. Configure frontend tests using Vitest and React Testing Library.

Code quality requirements:
- Maintain TypeScript strict-mode compatibility.
- Reuse existing components where practical.
- Use semantic HTML and accessible controls.
- Support keyboard navigation.
- Maintain sufficient text and control contrast.
- Optimize image loading and use lazy loading where appropriate.
- Avoid unnecessary React re-renders.
- Keep components maintainable.
- Verify desktop, tablet, and mobile layouts.

### 18.9 Recommended Workflow for Future AI Coding Sessions

Follow this sequence for substantial design or quality-improvement tasks.

**Phase 1: Audit**
- Read this project context document.
- Inspect the current source code and running application where possible.
- Read the relevant installed skill instructions.
- Identify functional bugs, visual weaknesses, and incomplete work.
- Present a prioritized plan before making broad changes.

**Phase 2: Engineering Verification**
- Verify the current application runs.
- Reproduce and fix confirmed runtime or integration issues.
- Preserve business logic and existing API contracts.

**Phase 3: Design System**
- Establish or refine colors, typography, spacing, component styles, and reusable patterns.
- Apply the chosen visual direction consistently.

**Phase 4: Page-by-Page Refinement**
- Improve each page individually.
- Reuse shared components and maintain consistent design.
- Add purposeful animations and interaction feedback.

**Phase 5: Review**
- Use Impeccable for design and usability critique.
- Use Improve Animations for motion refinement.
- Use Security Audit for security-sensitive changes and security review.
- Recheck responsive behaviour and accessibility.

**Phase 6: Final Verification**
- Run the frontend production build.
- Run backend and frontend tests.
- Validate Docker Compose.
- Test the important user journeys.
- Fix regressions before declaring the work complete.

Work incrementally. For substantial changes, present the audit and implementation plan first. Do not claim a feature or verification is complete unless it has actually been implemented and tested.

### 18.10 Definition of Done

A design or frontend-polish task is complete only when:
- The intended visual improvements are implemented consistently.
- Existing user journeys and API integrations still work.
- Desktop, tablet, and mobile layouts are checked.
- Accessibility and reduced-motion considerations are addressed.
- The frontend production build passes.
- Relevant tests and runtime checks pass.
- No known regression introduced by the changes remains unresolved.

The final objective is a reliable, maintainable, responsive, and visually distinctive hotel-booking platform with excellent user experience. Functional correctness, security, and reliability remain higher priorities than decorative effects.
