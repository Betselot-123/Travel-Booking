# Tour Booking System - 7-Day GitHub Daily Commit Plan

## Repository Setup

```bash
# Initial repository commands (run once on Day 1)
git init
git remote add origin https://github.com/YOUR_USERNAME/tour-booking-system.git
git branch -M main
```

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

---

## Day 1: Project Foundation

### Morning (2-3 commits)

```bash
# Commit 1: Repository initialization
git add README.md
git commit -m "chore: initialize repository with project overview

Add comprehensive README with project description, tech stack,
and development setup instructions.

Refs: T-001"

# Commit 2: Folder structure
git add .
git commit -m "chore: create monorepo folder structure

Set up client/, server/, and docs/ directories.
Initialize with .gitkeep files and base configs.

Refs: T-002"
```

### Afternoon (2-3 commits)

```bash
# Commit 3: Linting configuration
git add .eslintrc.json .prettierrc .eslintignore
git commit -m "chore: add linting and formatting configuration

Configure ESLint with TypeScript support and Prettier for
consistent code formatting across frontend and backend.

Refs: T-003"

# Commit 4: TypeScript setup
git add tsconfig.json tsconfig.server.json
git commit -m "chore: configure TypeScript for full-stack

Add tsconfig files for both client and server with strict
mode enabled and proper path aliases.

Refs: T-004"

# Commit 5: Environment configuration
git add .env.example .gitignore
git commit -m "chore: add environment and ignore configuration

Create .env.example with all required variables.
Add comprehensive .gitignore for Node.js, React, and OS files.

Refs: T-005"
```

### Day 1 Summary
| # | Commit | Type | Scope |
|---|--------|------|-------|
| 1 | Initialize repository | `chore` | setup |
| 2 | Monorepo structure | `chore` | setup |
| 3 | ESLint + Prettier | `chore` | tooling |
| 4 | TypeScript config | `chore` | tooling |
| 5 | Environment files | `chore` | setup |

### End of Day Push
```bash
git push -u origin main
```

---

## Day 2: Database Schema

### Morning (2-3 commits)

```bash
# Commit 1: Database ERD documentation
git add docs/database/erd.md docs/database/schema.sql
git commit -m "docs: add entity relationship diagram

Design complete ERD for Tour Booking System:
- Users, Tours, Vehicles, Guides, Hotels
- Bookings with full relationship mapping
- Availability tracking table

Refs: T-006"

# Commit 2: Core table migrations (batch 1)
git add server/database/migrations/001_create_users.sql
git add server/database/migrations/002_create_tours.sql
git commit -m "db: create users and tours table migrations

Add migrations for:
- users: id, name, national_id, phone, email, created_at
- tours: id, location, description, images, base_price, is_active

Refs: T-007, T-008"

# Commit 3: Core table migrations (batch 2)
git add server/database/migrations/003_create_vehicles.sql
git add server/database/migrations/004_create_guides.sql
git commit -m "db: create vehicles and guides table migrations

Add migrations for:
- vehicles: id, type, capacity, price_per_day, is_available
- guides: id, name, experience_years, languages, contact, daily_rate

Refs: T-009, T-010"
```

### Afternoon (2-3 commits)

```bash
# Commit 4: Remaining tables
git add server/database/migrations/005_create_hotels.sql
git add server/database/migrations/006_create_bookings.sql
git commit -m "db: create hotels and bookings table migrations

Add migrations for:
- hotels: id, name, location, price_per_night, rating, amenities
- bookings: id, user_id, tour_id, vehicle_id, guide_id, hotel_id,
  status, dates, people_count, total_price, timestamps

Refs: T-011, T-012"

# Commit 5: Availability table + seed data
git add server/database/migrations/007_create_available_dates.sql
git add server/database/seeds/
git commit -m "db: add availability tracking and seed data

- available_dates: tour_id, date, max_capacity, booked_count
- Seed script with 5 sample tours, 8 vehicles, 6 guides, 10 hotels

Refs: T-013, T-014"
```

### Day 2 Summary
| # | Commit | Type | Scope |
|---|--------|------|-------|
| 6 | ERD documentation | `docs` | database |
| 7 | Users + Tours migrations | `db` | database |
| 8 | Vehicles + Guides migrations | `db` | database |
| 9 | Hotels + Bookings migrations | `db` | database |
| 10 | Availability + seeds | `db` | database |

### End of Day
```bash
git push origin main
```

---

## Day 3: Backend Server & Core APIs

### Morning (3 commits)

```bash
# Commit 11: Express server setup
git add server/src/app.ts server/src/server.ts server/src/config/
git commit -m "feat: initialize Express server with routing

- Set up Express with JSON parsing
- Configure environment-based settings
- Add health check endpoint

Refs: T-015"

# Commit 12: Error handling
git add server/src/middleware/errorHandler.ts server/src/utils/AppError.ts
git commit -m "feat: add centralized error handling middleware

- Custom AppError class with status codes
- Global error handler with stack traces (dev)
- Error response standardization

Refs: T-016"

# Commit 13: Validation + Security
git add server/src/middleware/validate.ts server/src/middleware/security.ts
git commit -m "feat: add request validation and security middleware

- Zod schema validation for all inputs
- Helmet, CORS, rate limiting configured
- Security headers and request sanitization

Refs: T-017, T-018"
```

### Afternoon (2-3 commits)

```bash
# Commit 14: Database connection
git add server/src/database/connection.ts
git commit -m "feat: add database connection pool singleton

- PostgreSQL pool with connection limits
- Singleton pattern for shared instance
- Connection health check on startup

Refs: T-019"

# Commit 15: Tour API
git add server/src/repositories/tour.repository.ts
git add server/src/services/tour.service.ts
git add server/src/routes/tour.routes.ts
git commit -m "feat: add tour management API

- TourRepository with CRUD operations
- TourService with filtering and pagination
- REST endpoints: GET /tours, GET /tours/:id

Refs: T-020, T-021, T-022"

# Commit 16: Vehicle + Guide APIs
git add server/src/repositories/vehicle.repository.ts
git add server/src/routes/vehicle.routes.ts
git add server/src/repositories/guide.repository.ts
git add server/src/routes/guide.routes.ts
git commit -m "feat: add vehicle and guide management APIs

- Vehicle CRUD with availability checks
- Guide CRUD with language filtering
- Consistent error handling across endpoints

Refs: T-023, T-025"
```

### Day 3 Summary
| # | Commit | Type | Scope |
|---|--------|------|-------|
| 11 | Express server | `feat` | backend |
| 12 | Error handling | `feat` | backend |
| 13 | Validation + Security | `feat` | backend |
| 14 | DB connection | `feat` | backend |
| 15 | Tour API | `feat` | backend |
| 16 | Vehicle + Guide APIs | `feat` | backend |

---

## Day 4: Hotel API, Availability & Frontend Setup

### Morning (2-3 commits)

```bash
# Commit 17: Hotel API
git add server/src/repositories/hotel.repository.ts
git add server/src/routes/hotel.routes.ts
git commit -m "feat: add hotel management API

- Hotel CRUD with location-based filtering
- Rating and amenities search support

Refs: T-026"

# Commit 18: Availability service
git add server/src/services/availability.service.ts
git add server/src/routes/availability.routes.ts
git commit -m "feat: add tour availability checking service

- Date range availability queries
- Capacity checking with booked_count
- Calendar endpoint for month views

Refs: T-027, T-028"

# Commit 19: API documentation
git add server/src/docs/openapi.yaml
git commit -m "docs: add OpenAPI specification

Document all endpoints for tours, vehicles, guides,
hotels, and availability with request/response schemas.

Refs: T-024"
```

### Afternoon (2-3 commits)

```bash
# Commit 20: Frontend bootstrap
git add client/package.json client/vite.config.ts
git add client/index.html client/src/main.tsx
git commit -m "feat: initialize React frontend with Vite

- React 18 + TypeScript + Vite setup
- Development server configured with proxy
- Entry point and root component

Refs: T-030"

# Commit 21: Routing + Layout
git add client/src/App.tsx client/src/routes/
git add client/src/components/layout/
git commit -m "feat: add React Router and main layout

- Route configuration for all pages
- Navbar, Footer, MainLayout components
- Responsive layout structure

Refs: T-031, T-032"

# Commit 22: State management + API client
git add client/src/store/ client/src/lib/api.ts
git add client/src/components/ui/
git commit -m "feat: add state management and shared components

- Zustand store for global state
- Axios client with auth interceptors
- Reusable UI: Button, Input, Card, Loading

Refs: T-033, T-034, T-035"
```

### Day 4 Summary
| # | Commit | Type | Scope |
|---|--------|------|-------|
| 17 | Hotel API | `feat` | backend |
| 18 | Availability service | `feat` | backend |
| 19 | OpenAPI docs | `docs` | documentation |
| 20 | React + Vite setup | `feat` | frontend |
| 21 | Router + Layout | `feat` | frontend |
| 22 | State + UI components | `feat` | frontend |

---

## Day 5: Customer Booking Wizard (Steps 1-3)

### Morning (2-3 commits)

```bash
# Commit 23: Tour browsing
git add client/src/components/tours/TourCard.tsx
git add client/src/components/tours/TourList.tsx
git add client/src/pages/ToursPage.tsx
git commit -m "feat: add tour browsing pages

- TourCard component with image, description, pricing
- TourList with location and price filters
- Detail page with full tour information

Refs: T-036, T-037, T-038"

# Commit 24: Booking wizard state + Step 1
git add client/src/context/BookingContext.tsx
git add client/src/components/booking/BookingWizard.tsx
git add client/src/components/booking/steps/TourSelectionStep.tsx
git commit -m "feat: add booking wizard with tour selection step

- BookingContext for wizard state management
- Multi-step wizard shell with progress indicator
- Step 1: Tour selection with date picker

Refs: T-041, T-042"

# Commit 25: Steps 2-3
git add client/src/components/booking/steps/PersonalInfoStep.tsx
git add client/src/components/booking/steps/PreferencesStep.tsx
git commit -m "feat: add personal info and preferences steps

- Step 2: Personal information form (name, ID, phone, email)
- Step 3: People count and booking type selection
- Form validation with real-time feedback

Refs: T-042, T-043"
```

### Afternoon (2-3 commits)

```bash
# Commit 26: Vehicle + Hotel selection
git add client/src/components/booking/steps/VehicleSelectionStep.tsx
git add client/src/components/booking/steps/HotelSelectionStep.tsx
git commit -m "feat: add vehicle and hotel selection steps

- Step 3 continued: Vehicle selection with type cards
- Hotel selection with room count picker
- Running price calculation display

Refs: T-044, T-045"

# Commit 27: Steps 4-5 + submission
git add client/src/components/booking/steps/GuideSelectionStep.tsx
git add client/src/components/booking/steps/ReviewStep.tsx
git add client/src/pages/BookingConfirmationPage.tsx
git commit -m "feat: complete booking wizard flow

- Step 4: Guide selection with profile cards
- Step 5: Review all selections before submit
- Booking submission and confirmation page

Refs: T-046, T-047, T-048, T-049, T-050"
```

### Day 5 Summary
| # | Commit | Type | Scope |
|---|--------|------|-------|
| 23 | Tour browsing | `feat` | frontend |
| 24 | Booking wizard + Step 1 | `feat` | frontend |
| 25 | Steps 2-3 | `feat` | frontend |
| 26 | Vehicle + Hotel steps | `feat` | frontend |
| 27 | Steps 4-5 + confirmation | `feat` | frontend |

---

## Day 6: Booking Backend & Admin Dashboard Setup

### Morning (2-3 commits)

```bash
# Commit 28: Booking submission API
git add server/src/repositories/booking.repository.ts
git add server/src/services/booking.service.ts
git add server/src/routes/booking.routes.ts
git commit -m "feat: add booking submission API

- BookingRepository with transaction support
- Availability validation before booking
- POST /bookings endpoint with full validation

Refs: T-051, T-052, T-053"

# Commit 29: Booking state machine
git add server/src/state-machine/BookingStateMachine.ts
git add server/src/models/booking.states.ts
git commit -m "feat: implement booking status state machine

- State pattern for booking lifecycle
- Valid transitions: draft → pending → confirmed → in_progress → completed
- Automatic notifications on state changes

Refs: T-054"

# Commit 30: Admin layout + Tour management
git add client/src/components/admin/AdminLayout.tsx
git add client/src/components/admin/AdminSidebar.tsx
git add client/src/pages/admin/TourManagementPage.tsx
git commit -m "feat: add admin dashboard layout and tour management

- AdminLayout with sidebar navigation
- Tour management CRUD table
- Admin route guards

Refs: T-057, T-058"
```

### Afternoon (2-3 commits)

```bash
# Commit 31: Admin CRUD pages
git add client/src/pages/admin/VehicleManagementPage.tsx
git add client/src/pages/admin/GuideManagementPage.tsx
git add client/src/pages/admin/HotelManagementPage.tsx
git commit -m "feat: add admin management pages

- Vehicle management with type filters
- Guide management with language search
- Hotel management with rating display

Refs: T-059, T-062, T-063"

# Commit 32: Admin booking review
git add client/src/pages/admin/PendingBookingsPage.tsx
git add client/src/pages/admin/BookingDetailPage.tsx
git add server/src/routes/admin.routes.ts
git commit -m "feat: add booking approval workflow

- Pending bookings review page
- Booking detail with approve/reject actions
- Admin API endpoints for booking management

Refs: T-065, T-066, T-068"
```

### Day 6 Summary
| # | Commit | Type | Scope |
|---|--------|------|-------|
| 28 | Booking submission API | `feat` | backend |
| 29 | Booking state machine | `feat` | backend |
| 30 | Admin layout + Tours | `feat` | frontend |
| 31 | Admin CRUD pages | `feat` | frontend |
| 32 | Booking approval workflow | `feat` | fullstack |

---

## Day 7: Pricing Engine & Testing

### Morning (2-3 commits)

```bash
# Commit 33: Pricing strategies
git add server/src/pricing/PricingStrategy.ts
git add server/src/pricing/SeasonalPricingStrategy.ts
git add server/src/pricing/GroupDiscountStrategy.ts
git add server/src/pricing/EarlyBirdStrategy.ts
git commit -m "feat: implement pricing strategy pattern

- Strategy interface for interchangeable algorithms
- Seasonal pricing with month-based multipliers
- Group discount with tier-based rates
- Early bird discount with advance booking tiers

Refs: T-072, T-073, T-074, T-075, T-076"

# Commit 34: Pricing API + admin tools
git add server/src/routes/pricing.routes.ts
git add server/src/pricing/PricingOrchestrator.ts
git add client/src/pages/admin/AdminPricingPage.tsx
git commit -m "feat: add pricing calculation API and admin tools

- POST /pricing/calculate endpoint
- Orchestrator combining all strategies
- Admin pricing preview and override UI

Refs: T-077, T-078, T-082, T-083"

# Commit 35: Unit tests
git add server/src/**/*.test.ts
git commit -m "test: add unit tests for services

- Tour service tests with mocked repository
- Pricing strategy tests with fixtures
- Booking state machine transition tests

Refs: T-096, T-097"
```

### Afternoon (2-3 commits)

```bash
# Commit 36: Notification service
git add server/src/notifications/
git commit -m "feat: implement notification observer service

- Observer pattern for booking events
- Email notifications via Nodemailer
- SMS notifications via Twilio
- WebSocket real-time updates

Refs: T-084, T-085, T-086, T-088"

# Commit 37: Final documentation
git add README.md
git add docs/
git commit -m "docs: add comprehensive project documentation

- Updated README with setup and run instructions
- Architecture diagrams and API docs
- Contributing guidelines

Refs: T-107, T-108, T-109"

# Commit 38: Polish and cleanup
git add .
git commit -m "fix: final bug fixes and code cleanup

- Fix responsive layout issues
- Clean up console warnings
- Optimize database queries

Refs: T-111"
```

### Day 7 Summary
| # | Commit | Type | Scope |
|---|--------|------|-------|
| 33 | Pricing strategies | `feat` | backend |
| 34 | Pricing API + admin | `feat` | fullstack |
| 35 | Unit tests | `test` | backend |
| 36 | Notifications | `feat` | backend |
| 37 | Documentation | `docs` | documentation |
| 38 | Polish + cleanup | `fix` | fullstack |

---

## Complete Commit Log Summary

| Day | Commits | Focus Area |
|-----|---------|------------|
| Day 1 | 5 | Repository setup, tooling |
| Day 2 | 5 | Database schema |
| Day 3 | 6 | Backend server, core APIs |
| Day 4 | 6 | Hotels, availability, frontend setup |
| Day 5 | 5 | Booking wizard (customer) |
| Day 6 | 5 | Booking backend, admin dashboard |
| Day 7 | 6 | Pricing, tests, notifications, docs |
| **Total** | **38** | |

---

## GitHub Activity Heat Map

```
Week 1:
     Mon   Tue   Wed   Thu   Fri   Sat   Sun
      5     5     6     6     5     5     6
      ▓▓▓   ▓▓▓   ▓▓▓▓  ▓▓▓▓  ▓▓▓   ▓▓▓   ▓▓▓▓

      ████  ████  █████ █████ ████  ████  █████
```

---

## Daily Git Commands Cheat Sheet

```bash
# Start of day - pull latest
git pull origin main

# After each feature/section
git add <files>
git commit -m "type: description

Detailed explanation of what changed and why.

Refs: T-XXX"

# End of day - push
git push origin main

# If you need to fix last commit
git add <files>
git commit --amend -m "type: updated message"

# View commit history
git log --oneline --graph --decorate

# Check status
git status

# Create feature branch (optional)
git checkout -b feature/booking-wizard
# ... commits ...
git checkout main
git merge feature/booking-wizard
git push origin main
```

---

## GitHub Profile Contribution Graph

After 7 days, your contribution graph will show:
- **38 commits** across the week
- Consistent daily activity
- Professional commit message history
- Well-organized repository with clear documentation

### Repository Stats After Week 1
```
📁 tour-booking-system/
├── 📂 client/          (React frontend)
├── 📂 server/          (Express backend)
├── 📂 docs/            (Documentation)
├── 📄 README.md        (Comprehensive guide)
├── 📄 .gitignore       (Proper exclusions)
└── 📄 package.json     (Root workspace config)

Languages:
- TypeScript    ████████████████████  75%
- SQL           ████████              15%
- Markdown      ███                    8%
- Other         █                      2%

Commits: 38
Files: 80+
Lines of Code: ~5,000+
```
