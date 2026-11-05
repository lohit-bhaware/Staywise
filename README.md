# StayFinder 🏨

A full-stack hotel search and booking application built with React, Spring Boot, and MySQL.

## Features

- 🔍 **Smart Hotel Search** — Search by name, city, or area with ranked results and ranking reasons
- 🏨 **Hotel Details** — Full hotel pages with photos, amenities, ratings, and reviews
- 📅 **Room Availability** — Real-time availability check for selected dates
- 🔒 **No Double Booking** — Concurrency-safe booking system prevents double reservations
- 👤 **Authentication** — Secure JWT-based sign up / login with refresh tokens
- 🛡️ **Role-based Access** — Separate USER and ADMIN roles
- 📋 **My Trips** — Users can view past and upcoming bookings
- ⭐ **Reviews** — Leave reviews after completing stays
- 📱 **Responsive** — Mobile-first design, works on all screen sizes
- 🐳 **Docker Ready** — Run everything locally with one command

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| State | Zustand + TanStack Query |
| Backend | Spring Boot 3.2 + Java 21 |
| Security | Spring Security + JWT (JJWT 0.12) |
| Database | MySQL 8 |
| ORM | Spring Data JPA + Hibernate |
| Container | Docker + Docker Compose |

## Quick Start (Docker)

```bash
# 1. Clone and enter the directory
cd stayfinder

# 2. Copy env file
cp .env.example .env

# 3. Start everything
docker compose up --build

# App will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api
```

## Local Development

### Prerequisites
- Java 21+
- Node.js 20+
- MySQL 8 (or use the Docker MySQL only)
- Maven 3.9+

### Start MySQL only via Docker
```bash
docker compose up mysql -d
```

### Start Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Demo Accounts

After Docker starts, the database is seeded with demo data:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@stayfinder.com | admin123 |
| User | alice@example.com | password123 |
| User | bob@example.com | password123 |
| User | carol@example.com | password123 |

## API Documentation

### Auth
```
POST /api/auth/register   - Create account
POST /api/auth/login      - Login, get JWT
POST /api/auth/refresh    - Refresh access token
```

### Hotels
```
GET  /api/hotels?query=&page=0&size=20   - Search hotels
GET  /api/hotels/:id                      - Hotel detail
GET  /api/hotels/:id/rooms?checkIn=&checkOut=  - Available rooms
GET  /api/hotels/:id/reviews?page=0&size=10    - Hotel reviews
```

### Bookings (authenticated)
```
POST /api/bookings         - Create booking
GET  /api/bookings/my      - My bookings
GET  /api/bookings/:id     - Booking detail
PUT  /api/bookings/:id/cancel  - Cancel booking
```

### Reviews (authenticated)
```
POST   /api/reviews      - Add review
DELETE /api/reviews/:id  - Delete own review
```

### Admin (ADMIN role required)
```
GET/POST   /api/admin/hotels
PUT        /api/admin/hotels/:id
POST       /api/admin/hotels/:id/rooms
PUT        /api/admin/rooms/:id
GET        /api/admin/bookings
GET        /api/admin/users
```

## Search Ranking

Results are ranked using a scoring formula:
- **+100** — Hotel name matches the query
- **+50** — City matches the query  
- **+30** — Area/district matches the query
- **+avgRating × 10** — Rating bonus
- **+min(reviewCount, 50)** — Popularity bonus

Each result card shows the reason for its ranking (e.g., *"Exact name match · 4.8★ rated"*).

## Project Structure

```
stayfinder/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/           # Spring Boot application
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
└── frontend/          # React + Vite application
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
```

