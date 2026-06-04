# Tour Booking System - Product Backlog

## Epic Structure

| Epic ID | Epic Name | Priority | Est. Weeks |
|---------|-----------|----------|------------|
| EPIC-01 | Project Setup & Infrastructure | Critical | 1 |
| EPIC-02 | Database Design & Data Layer | Critical | 1 |
| EPIC-03 | Core Backend API Development | Critical | 2 |
| EPIC-04 | Customer-Facing Frontend | High | 2 |
| EPIC-05 | Admin Dashboard | High | 2 |
| EPIC-06 | Booking Engine & 5-Step Flow | Critical | 2 |
| EPIC-07 | Pricing & Payment System | High | 1 |
| EPIC-08 | Notification System | Medium | 1 |
| EPIC-09 | Testing & Quality Assurance | High | 1 |
| EPIC-10 | Deployment & DevOps | Medium | 1 |

---

## Week 1: Foundation (Days 1-7)

### Day 1: Project Bootstrap & Repository

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-001 | Initialize Git repository with README.md | Setup | Critical | 1 | `chore: initialize repository with project overview` |
| T-002 | Set up folder structure (client/, server/, docs/) | Setup | Critical | 1 | `chore: create monorepo folder structure` |
| T-003 | Configure ESLint + Prettier for both frontend and backend | Setup | Critical | 2 | `chore: add linting and formatting configuration` |
| T-004 | Set up TypeScript configuration (tsconfig.json) | Setup | Critical | 2 | `chore: configure TypeScript for full-stack` |
| T-005 | Create .gitignore and .env.example files | Setup | Critical | 1 | `chore: add environment and ignore configuration` |

**Day 1 Deliverable**: Repository initialized, clean folder structure ready for development.

---

### Day 2: Database Schema & Migrations

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-006 | Design ERD (Entity Relationship Diagram) for all entities | DB | Critical | 3 | `docs: add entity relationship diagram` |
| T-007 | Create `users` table migration (id, name, national_id, phone, email, created_at) | DB | Critical | 2 | `db: create users table migration` |
| T-008 | Create `tours` table migration (id, location, description, images[], base_price, is_active) | DB | Critical | 2 | `db: create tours table migration` |
| T-009 | Create `vehicles` table migration (id, type, capacity, price_per_day, is_available) | DB | Critical | 2 | `db: create vehicles table migration` |
| T-010 | Create `guides` table migration (id, name, experience_years, languages[], contact, daily_rate) | DB | Critical | 2 | `db: create guides table migration` |

**Day 2 Deliverable**: Database schema designed, 4 core table migrations created.

---

### Day 3: Database Schema (Continued) & Seed Data

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-011 | Create `hotels` table migration (id, name, location, price_per_night, rating, amenities[]) | DB | Critical | 2 | `db: create hotels table migration` |
| T-012 | Create `bookings` table migration (id, user_id, tour_id, vehicle_id, guide_id, hotel_id, status, dates, people_count, total_price) | DB | Critical | 3 | `db: create bookings table with full relations` |
| T-013 | Create `available_dates` table (tour_id, date, max_capacity, booked_count) | DB | Critical | 2 | `db: add availability tracking table` |
| T-014 | Create seed script with sample tours, vehicles, guides, hotels | DB | Critical | 3 | `db: add seed data for development` |

**Day 3 Deliverable**: All 7 tables migrated, seed data ready for testing.

---

### Day 4: Backend Foundation - Express Server & Middleware

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-015 | Set up Express server with basic routing | Backend | Critical | 2 | `feat: initialize Express server with routing` |
| T-016 | Implement error handling middleware (AppError class, global handler) | Backend | Critical | 2 | `feat: add centralized error handling middleware` |
| T-017 | Implement request validation middleware (Zod schemas) | Backend | Critical | 2 | `feat: add request validation with Zod` |
| T-018 | Set up CORS, helmet, rate limiting security middleware | Backend | Critical | 2 | `feat: add security middleware (cors, helmet, rate limit)` |
| T-019 | Create database connection singleton (PostgreSQL pool) | Backend | Critical | 2 | `feat: add database connection pool singleton` |

**Day 4 Deliverable**: Express server running with security, validation, and DB connection.

---

### Day 5: API Layer - Tours & Vehicles

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-020 | Create Tour repository (CRUD operations) | Backend | Critical | 3 | `feat: add tour repository with CRUD` |
| T-021 | Create Tour service (business logic) | Backend | Critical | 2 | `feat: add tour service layer` |
| T-022 | Create Tour routes (GET /tours, GET /tours/:id) | Backend | Critical | 2 | `feat: add tour API endpoints` |
| T-023 | Create Vehicle repository, service, routes | Backend | Critical | 3 | `feat: add vehicle management endpoints` |
| T-024 | Add API documentation (Swagger/OpenAPI) | Docs | Medium | 2 | `docs: add OpenAPI specification for tours and vehicles` |

**Day 5 Deliverable**: Tours and Vehicles APIs fully functional with documentation.

---

### Day 6: API Layer - Guides, Hotels & Availability

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-025 | Create Guide repository, service, routes | Backend | Critical | 3 | `feat: add guide management endpoints` |
| T-026 | Create Hotel repository, service, routes | Backend | Critical | 3 | `feat: add hotel management endpoints` |
| T-027 | Create Availability service (check dates, capacity) | Backend | Critical | 3 | `feat: add tour availability checking service` |
| T-028 | Create availability endpoint (GET /tours/:id/availability?month=) | Backend | Critical | 2 | `feat: add availability calendar endpoint` |
| T-029 | Write unit tests for all services (Day 5-6) | Test | Critical | 3 | `test: add unit tests for guide, hotel, availability services` |

**Day 6 Deliverable**: Guides, Hotels, Availability APIs complete with unit tests.

---

### Day 7: Frontend Bootstrap - React + Routing

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-030 | Initialize React + Vite project in client/ | Frontend | Critical | 2 | `feat: initialize React frontend with Vite` |
| T-031 | Set up React Router with route definitions | Frontend | Critical | 2 | `feat: add React Router with route configuration` |
| T-032 | Create layout components (Navbar, Footer, MainLayout) | Frontend | Critical | 2 | `feat: add main layout components` |
| T-033 | Set up global state management (Zustand/Context) | Frontend | Critical | 2 | `feat: add global state management store` |
| T-034 | Create API client utility (axios instance with interceptors) | Frontend | Critical | 2 | `feat: add API client with request/response interceptors` |
| T-035 | Create shared UI components (Button, Input, Card, Loading) | Frontend | Critical | 3 | `feat: add shared reusable UI components` |

**Day 7 Deliverable**: React app running with routing, layout, state management, and API client.

---

## Week 2: Core Features (Days 8-14)

### Day 8: Step 1 - Tour Selection UI

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-036 | Create TourCard component with image, location, description | Frontend | High | 2 | `feat: add TourCard component for browsing` |
| T-037 | Create TourList page with filtering (location, price range) | Frontend | High | 3 | `feat: add tour browsing page with filters` |
| T-038 | Create TourDetail page with full information | Frontend | High | 3 | `feat: add tour detail view page` |
| T-039 | Integrate with GET /tours API | Frontend | High | 1 | `feat: connect tour browsing to backend API` |
| T-040 | Add image gallery component for tour photos | Frontend | Medium | 2 | `feat: add image gallery component for tours` |

**Day 8 Deliverable**: Customers can browse tours with photos, descriptions, and filters.

---

### Day 9: Step 2 - Booking Form (Personal Details) + Step 3 Preferences

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-041 | Create BookingContext (wizard state management) | Frontend | Critical | 3 | `feat: add booking wizard state management` |
| T-042 | Create PersonalInfoStep form (name, nationalId, phone, email) | Frontend | Critical | 3 | `feat: add personal information step form` |
| T-043 | Create PreferencesStep (people count, family/individual toggle) | Frontend | Critical | 2 | `feat: add preferences selection step` |
| T-044 | Create VehicleSelectionStep component | Frontend | Critical | 3 | `feat: add vehicle selection step` |
| T-045 | Create HotelSelectionStep component | Frontend | Critical | 3 | `feat: add hotel selection step` |

**Day 9 Deliverable**: Steps 1-3 of booking wizard functional with state persistence.

---

### Day 10: Step 4 - Guide & Date Selection + Step 5 Review

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-046 | Create GuideCard component (experience, languages, photo) | Frontend | High | 2 | `feat: add guide profile card component` |
| T-047 | Create DatePicker with availability display | Frontend | High | 3 | `feat: add date picker with availability indicators` |
| T-048 | Create ReviewStep (summary of all selections) | Frontend | High | 3 | `feat: add booking review step` |
| T-049 | Create BookingConfirmation page | Frontend | High | 2 | `feat: add booking confirmation page` |
| T-050 | Integrate wizard with POST /bookings API | Frontend | Critical | 2 | `feat: connect booking wizard to submission API` |

**Day 10 Deliverable**: Complete 5-step booking flow from selection to confirmation.

---

### Day 11: Booking API Backend - Submission & Processing

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-051 | Create Booking repository with transaction support | Backend | Critical | 3 | `feat: add booking repository with transactions` |
| T-052 | Create Booking service (validation, availability check) | Backend | Critical | 3 | `feat: add booking submission service` |
| T-053 | Create POST /bookings endpoint | Backend | Critical | 2 | `feat: add booking submission endpoint` |
| T-054 | Implement booking status state machine | Backend | Critical | 3 | `feat: implement booking status state machine` |
| T-055 | Create GET /bookings/:id endpoint for status tracking | Backend | High | 2 | `feat: add booking status tracking endpoint` |
| T-056 | Write integration tests for booking flow | Test | Critical | 3 | `test: add integration tests for booking submission` |

**Day 11 Deliverable**: Booking submission API complete with state management and tests.

---

### Day 12: Admin Dashboard - Tour & Vehicle Management

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-057 | Create AdminLayout with sidebar navigation | Frontend | High | 2 | `feat: add admin dashboard layout` |
| T-058 | Create TourManagement page (CRUD table) | Frontend | High | 3 | `feat: add admin tour management page` |
| T-059 | Create VehicleManagement page (CRUD table) | Frontend | High | 3 | `feat: add admin vehicle management page` |
| T-060 | Add admin API endpoints (PUT, DELETE for tours/vehicles) | Backend | High | 3 | `feat: add admin CRUD endpoints for tours and vehicles` |
| T-061 | Add image upload handling (multer/cloudinary) | Backend | High | 2 | `feat: add image upload service for tour photos` |

**Day 12 Deliverable**: Admin can manage tours and vehicles with full CRUD.

---

### Day 13: Admin Dashboard - Guide & Hotel Management

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-062 | Create GuideManagement page with CRUD | Frontend | High | 3 | `feat: add admin guide management page` |
| T-063 | Create HotelManagement page with CRUD | Frontend | High | 3 | `feat: add admin hotel management page` |
| T-064 | Add admin API endpoints for guides and hotels | Backend | High | 2 | `feat: add admin CRUD endpoints for guides and hotels` |
| T-065 | Add booking approval workflow (GET /admin/bookings/pending, PUT /admin/bookings/:id/approve) | Backend | Critical | 3 | `feat: add booking approval workflow endpoints` |
| T-066 | Create PendingBookings page for admin review | Frontend | High | 3 | `feat: add pending bookings review page` |

**Day 13 Deliverable**: Admin can manage guides, hotels, and review pending bookings.

---

### Day 14: Admin Dashboard - Booking Management & Analytics

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-067 | Create AllBookings page with filters and search | Frontend | High | 3 | `feat: add admin bookings list with filters` |
| T-068 | Create BookingDetail view for admin (assign guide, vehicle, hotel) | Frontend | High | 3 | `feat: add booking detail view for admin` |
| T-069 | Add dashboard statistics cards (total bookings, revenue, pending) | Frontend | Medium | 2 | `feat: add admin dashboard statistics cards` |
| T-070 | Create basic analytics chart (bookings over time) | Frontend | Medium | 2 | `feat: add booking analytics chart` |
| T-071 | Add end-to-end tests for admin flows | Test | High | 3 | `test: add e2e tests for admin dashboard` |

**Day 14 Deliverable**: Admin dashboard complete with booking management and analytics.

---

## Week 3: Pricing, Notifications & Polish (Days 15-21)

### Day 15: Pricing Engine - Core Algorithm

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-072 | Create PricingStrategy interface and context | Backend | Critical | 3 | `feat: implement pricing strategy pattern` |
| T-073 | Implement StandardPricingStrategy | Backend | Critical | 2 | `feat: add standard pricing strategy` |
| T-074 | Implement SeasonalPricingStrategy (peak/off-peak multipliers) | Backend | High | 2 | `feat: add seasonal pricing strategy` |
| T-075 | Implement GroupDiscountStrategy | Backend | High | 2 | `feat: add group discount pricing strategy` |
| T-076 | Implement EarlyBirdStrategy | Backend | High | 2 | `feat: add early bird pricing strategy` |
| T-077 | Create POST /pricing/calculate endpoint | Backend | Critical | 2 | `feat: add pricing calculation endpoint` |

**Day 15 Deliverable**: Pricing engine with multiple strategies and calculation API.

---

### Day 16: Pricing Engine - Admin Tools

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-078 | Create PricingTemplate abstract class | Backend | Critical | 3 | `feat: implement pricing template method pattern` |
| T-079 | Implement DomesticPricingTemplate | Backend | Critical | 2 | `feat: add domestic pricing template` |
| T-080 | Implement InternationalPricingTemplate | Backend | High | 2 | `feat: add international pricing template` |
| T-081 | Create admin pricing override endpoint | Backend | High | 2 | `feat: add admin pricing override capability` |
| T-082 | Create AdminPricing page (view/edit pricing rules) | Frontend | High | 3 | `feat: add admin pricing management UI` |
| T-083 | Add pricing preview functionality | Frontend | High | 2 | `feat: add pricing preview for admin` |

**Day 16 Deliverable**: Admin can calculate, preview, and override pricing rules.

---

### Day 17: Notification System

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-084 | Create NotificationService (Observer pattern) | Backend | High | 3 | `feat: implement notification observer service` |
| T-085 | Implement EmailNotificationObserver (Nodemailer/SendGrid) | Backend | High | 3 | `feat: add email notification observer` |
| T-086 | Implement SMSNotificationObserver (Twilio) | Backend | Medium | 2 | `feat: add SMS notification observer` |
| T-087 | Create notification templates (booking confirmed, pending, cancelled) | Backend | High | 2 | `feat: add notification email templates` |
| T-088 | Add WebSocket for real-time admin notifications | Backend | High | 3 | `feat: add WebSocket real-time notifications` |
| T-089 | Create notification preferences for users | Backend | Low | 2 | `feat: add user notification preferences` |

**Day 17 Deliverable**: Multi-channel notification system with real-time updates.

---

### Day 18: Frontend Polish - UX/UI Improvements

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-090 | Add loading skeletons for all async components | Frontend | Medium | 2 | `feat: add loading skeleton screens` |
| T-091 | Add error boundaries and friendly error pages | Frontend | Medium | 2 | `feat: add error boundaries and error pages` |
| T-092 | Implement form validation feedback (inline errors) | Frontend | Medium | 2 | `feat: add inline form validation feedback` |
| T-093 | Add success/error toast notifications (react-hot-toast) | Frontend | Medium | 2 | `feat: add toast notification system` |
| T-094 | Implement responsive design for mobile (booking wizard) | Frontend | High | 3 | `feat: add mobile responsive booking wizard` |
| T-095 | Add animations and transitions (Framer Motion) | Frontend | Low | 2 | `feat: add page transition animations` |

**Day 18 Deliverable**: Polished UI with responsive design, animations, and feedback.

---

### Day 19: Testing & Bug Fixes

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-096 | Write unit tests for all repository methods | Test | Critical | 3 | `test: add repository unit tests` |
| T-097 | Write integration tests for all API endpoints | Test | Critical | 3 | `test: add API integration tests` |
| T-098 | Write frontend component tests (React Testing Library) | Test | High | 3 | `test: add frontend component tests` |
| T-099 | Fix bugs from testing (round 1) | Bugfix | Critical | 3 | `fix: resolve bugs from testing round 1` |
| T-100 | Add API rate limiting and security tests | Test | High | 2 | `test: add security and rate limit tests` |

**Day 19 Deliverable**: Comprehensive test coverage, initial bugs resolved.

---

### Day 20: Authentication & Authorization

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-101 | Implement JWT authentication (register/login) | Backend | Critical | 3 | `feat: add JWT authentication system` |
| T-102 | Create auth middleware (protect routes) | Backend | Critical | 2 | `feat: add authentication middleware` |
| T-103 | Create role-based access control (customer/admin) | Backend | Critical | 3 | `feat: implement RBAC authorization` |
| T-104 | Create Login/Register pages | Frontend | Critical | 3 | `feat: add authentication pages` |
| T-105 | Add protected route guards | Frontend | Critical | 2 | `feat: add route guards for protected pages` |
| T-106 | Add auth context (login state, logout) | Frontend | Critical | 2 | `feat: add authentication context` |

**Day 20 Deliverable**: Full authentication flow with role-based access control.

---

### Day 21: Final Polish & Documentation

| Task ID | Task | Type | Priority | Story Points | GitHub Commit Message |
|---------|------|------|----------|-------------|----------------------|
| T-107 | Write comprehensive README with setup instructions | Docs | Critical | 3 | `docs: add comprehensive project README` |
| T-108 | Add JSDoc comments to all functions | Docs | Medium | 2 | `docs: add JSDoc documentation to codebase` |
| T-109 | Create API documentation (updated OpenAPI spec) | Docs | Medium | 2 | `docs: finalize API documentation` |
| T-110 | Performance optimization (query optimization, lazy loading) | Backend | Medium | 3 | `perf: optimize database queries and add lazy loading` |
| T-111 | Final bug fixes and code cleanup | Bugfix | Critical | 3 | `fix: final bug fixes and code cleanup` |

**Day 21 Deliverable**: Fully documented, optimized, production-ready application.

---

## GitHub Project Board Columns

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  To Do   │──▶│ In Prog  │──▶│ Review   │──▶│  Test    │──▶│  Done    │
│ (Backlog)│   │          │   │          │   │          │   │          │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
     │                                                          │
     │                    ┌──────────┐                           │
     └───────────────────▶│Blocked   │◀──────────────────────────┘
                          │          │
                          └──────────┘
```

---

## Sprint Velocity Tracking

| Week | Planned Points | Completed Points | Velocity |
|------|---------------|-----------------|----------|
| Week 1 | 42 | TBD | TBD |
| Week 2 | 47 | TBD | TBD |
| Week 3 | 44 | TBD | TBD |
| **Total** | **133** | **TBD** | **TBD** |

---

## Definition of Done

- [ ] Code is written and follows project style guidelines
- [ ] Unit tests pass with >80% coverage
- [ ] Integration tests pass
- [ ] Code is reviewed and approved
- [ ] Feature is documented (JSDoc + README if needed)
- [ ] No linting errors (ESLint/Prettier)
- [ ] Feature works in local development environment
- [ ] Commit message follows conventional commits format
