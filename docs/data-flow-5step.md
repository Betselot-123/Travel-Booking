# Tour Booking System - 5-Step Process Flow: Data Flow Documentation

## Overview

The booking process follows a 5-step wizard pattern where customer selections are progressively collected and validated. Each step captures specific data, persists it to a stateful context, and feeds into the final booking submission.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          5-STEP BOOKING FLOW                              │
├──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐│
│  STEP 1  │─▶│  STEP 2  │─▶│  STEP 3  │─▶│  STEP 4  │─▶│    STEP 5      ││
│  Tour    │  │ Personal │  │ Vehicle  │  │  Guide   │  │   Review &     ││
│ Selection│  │  Details │  │  & Hotel │  │  & Date  │  │  Confirmation  ││
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────────────┘│
     │                                                        │            │
     ▼                                                        ▼            │
  ┌──────────────────────────────────────────────────────────────────┐    │
  │                    BookingContext (State)                         │    │
  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │    │
  │  │ tourId  │ │ customer │ │ vehicleId│ │ guideId  │ │ pricing│ │    │
  │  │ location│ │   Info   │ │ hotelId  │ │  dates   │ │  total │ │    │
  │  │  dates  │ │          │ │  rooms   │ │          │ │breakdown│ │    │
  │  └─────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │    │
  └──────────────────────────────────────────────────────────────────┘    │
                                    │                                     │
                                    ▼                                     │
                              ┌──────────┐                                │
                              │  POST    │                                │
                              │/bookings │                                │
                              └──────────┘                                │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Customer   │────▶│   Frontend   │────▶│   Backend    │────▶│  Database    │
│   Browser    │◀────│   (React)    │◀────│   (Express)  │◀────│ (PostgreSQL) │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                            │                     │
                            ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐
                     │ LocalStorage │     │  Redis Cache │
                     │ (Draft Save) │     │ (Availability)│
                     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │ Notification │
                                           │   Service    │
                                           └──────────────┘
```

---

## Step 1: Tour Selection

### Purpose
Customer browses available tours and selects their preferred destination and travel dates.

### Input Data Flow
```
Customer ──browse──▶ Frontend ──GET /tours?page=1&filters──▶ Backend
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │   PostgreSQL │
                                                  │  SELECT * FROM│
                                                  │  tours WHERE  │
                                                  │  is_active=true│
                                                  └─────────────┘
                                                         │
Customer ◀──TourCards[]─────────────────────────────── Backend
```

### State Changes
```typescript
interface Step1Data {
  tourId: string;           // Selected tour UUID
  location: string;         // Human-readable location name
  description: string;      // Tour description
  images: string[];         // Array of image URLs
  selectedDates: Date[];    // Customer's preferred travel dates
  peopleCount: number;      // Number of travelers
  bookingType: 'family' | 'individual' | 'group';
}

// Context Update
bookingContext.setStep1({
  tourId: "tour_abc123",
  location: "Paris, France",
  description: "7-day cultural tour of Paris...",
  images: ["/paris-1.jpg", "/paris-2.jpg"],
  selectedDates: ["2024-07-15", "2024-07-22"],
  peopleCount: 4,
  bookingType: "family"
});
```

### Validation Rules
| Field | Validation | Error Message |
|-------|-----------|---------------|
| tourId | Required, must exist in DB | "Please select a tour" |
| selectedDates | Array, min 1 date, must be in future | "Select at least one valid future date" |
| peopleCount | Integer, min 1, max tour capacity | "Invalid number of travelers" |
| bookingType | Enum: family/individual/group | "Please select booking type" |

### API Calls
```
GET /api/v1/tours
  Response: { tours: Tour[], total: number, page: number }

GET /api/v1/tours/:id/availability?start=2024-07-01&end=2024-07-31
  Response: { 
    availableDates: [
      { date: "2024-07-15", spotsRemaining: 12, priceMultiplier: 1.2 },
      { date: "2024-07-16", spotsRemaining: 8, priceMultiplier: 1.2 }
    ]
  }
```

### Data Flow Diagram (Step 1)
```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Customer   │     │  TourList Page   │     │   Backend    │
└──────┬───────┘     └────────┬─────────┘     └──────┬───────┘
       │                      │                      │
       │  1. View tours       │                      │
       │─────────────────────▶│                      │
       │                      │  2. GET /tours       │
       │                      │─────────────────────▶│
       │                      │                      │  3. Query DB
       │                      │                      │────┐
       │                      │                      │◀───┘
       │                      │  4. Return tours[]   │
       │                      │◀─────────────────────│
       │  5. Render cards     │                      │
       │◀─────────────────────│                      │
       │                      │                      │
       │  6. Click tour       │                      │
       │─────────────────────▶│                      │
       │                      │  7. GET /tours/:id   │
       │                      │─────────────────────▶│
       │                      │                      │  8. Query details
       │                      │                      │────┐
       │                      │                      │◀───┘
       │                      │  9. Return details   │
       │                      │◀─────────────────────│
       │                      │                      │
       │                      │  10. Show calendar   │
       │◀─────────────────────│                      │
       │                      │                      │
       │  11. Select dates    │                      │
       │─────────────────────▶│                      │
       │                      │  12. Save to context │
       │                      │────┐                 │
       │                      │◀───┘                 │
       │  13. Enable Next     │                      │
       │◀─────────────────────│                      │
       │                      │                      │
       │  14. Click Next      │                      │
       │─────────────────────▶│                      │
       │                      │  15. Navigate to     │
       │                      │      Step 2          │
       │                      │────┐                 │
       │                      │◀───┘                 │
```

---

## Step 2: Personal Information

### Purpose
Collect customer identity and contact details for the booking record.

### Input Data Flow
```
Customer ──fills form──▶ Frontend ──validates──▶ BookingContext (local state)
                                                          │
                                                          ▼
                                                   ┌─────────────┐
                                                   │ localStorage │
                                                   │ (auto-save)  │
                                                   └─────────────┘
```

### State Changes
```typescript
interface Step2Data {
  fullName: string;         // "John Doe"
  nationalId: string;       // Government ID number
  phoneNumber: string;      // "+1-555-0123"
  email: string;            // "john@example.com"
  emergencyContact: {       // Optional
    name: string;
    phone: string;
    relationship: string;
  };
}

// Context Update
bookingContext.setStep2({
  fullName: "John Doe",
  nationalId: "ID-123456789",
  phoneNumber: "+1-555-0123",
  email: "john@example.com"
});
```

### Validation Rules
| Field | Validation | Error Message |
|-------|-----------|---------------|
| fullName | Required, min 2 chars, max 100 | "Full name is required" |
| nationalId | Required, alphanumeric, unique check | "Valid national ID is required" |
| phoneNumber | Required, E.164 format | "Valid phone number required" |
| email | Required, valid email format | "Valid email address required" |

### Auto-Save Mechanism
```typescript
// Debounced auto-save to localStorage
useEffect(() => {
  const timeout = setTimeout(() => {
    localStorage.setItem('booking_draft', JSON.stringify(bookingContext));
  }, 1000); // Save 1 second after last change
  
  return () => clearTimeout(timeout);
}, [bookingContext]);

// Restore on page refresh
useEffect(() => {
  const saved = localStorage.getItem('booking_draft');
  if (saved) {
    bookingContext.restore(JSON.parse(saved));
  }
}, []);
```

---

## Step 3: Vehicle & Hotel Selection

### Purpose
Customer selects transportation type and accommodation preferences.

### Input Data Flow
```
Customer ──select vehicle──▶ Frontend ──GET /vehicles?capacity=4──▶ Backend
                                                              │
                                                              ▼
                                                        ┌─────────────┐
                                                        │   PostgreSQL │
                                                        │ SELECT * FROM│
                                                        │ vehicles WHERE│
                                                        │ capacity >= 4 │
                                                        └─────────────┘

Customer ──select hotel──▶ Frontend ──GET /hotels?location=Paris──▶ Backend
                                                              │
                                                              ▼
                                                        ┌─────────────┐
                                                        │   PostgreSQL │
                                                        │ SELECT * FROM│
                                                        │ hotels WHERE  │
                                                        │ location=$1   │
                                                        └─────────────┘
```

### State Changes
```typescript
interface Step3Data {
  vehicle: {
    vehicleId: string;      // Selected vehicle UUID
    type: 'SUV' | 'bus' | 'luxury_car' | 'minivan';
    capacity: number;       // Passenger capacity
    pricePerDay: number;    // Daily rate
  };
  hotel: {
    hotelId: string;        // Selected hotel UUID
    name: string;           // Hotel name
    roomCount: number;      // Number of rooms needed
    pricePerNight: number;  // Nightly rate
    checkIn: Date;          // Check-in date
    checkOut: Date;         // Check-out date
  };
}

// Context Update
bookingContext.setStep3({
  vehicle: {
    vehicleId: "veh_suv_001",
    type: "SUV",
    capacity: 7,
    pricePerDay: 85.00
  },
  hotel: {
    hotelId: "hotel_abc",
    name: "Grand Hotel Paris",
    roomCount: 2,
    pricePerNight: 150.00,
    checkIn: "2024-07-15",
    checkOut: "2024-07-22"
  }
});
```

### Dynamic Pricing Calculation (Preview)
```
Frontend calculates running total:

Subtotal = (Vehicle: $85/day × 7 days) + (Hotel: $150/night × 2 rooms × 7 nights)
         = $595 + $2,100
         = $2,695

Displayed in real-time as customer makes selections.
```

### Validation Rules
| Field | Validation | Error Message |
|-------|-----------|---------------|
| vehicleId | Required, vehicle must be available | "Please select a vehicle" |
| vehicle capacity | Must be >= peopleCount | "Vehicle capacity insufficient" |
| hotelId | Required | "Please select a hotel" |
| roomCount | Integer >= 1, <= peopleCount/2+1 | "Invalid room count" |
| checkIn/checkOut | Must align with tour dates | "Dates must match tour dates" |

---

## Step 4: Guide & Final Date Confirmation

### Purpose
Customer selects a tour guide and confirms final travel dates based on availability.

### Input Data Flow
```
Customer ──view guides──▶ Frontend ──GET /guides?location=Paris&language=en──▶ Backend
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │   PostgreSQL │
                                                            │ SELECT * FROM│
                                                            │ guides WHERE  │
                                                            │ languages @>│
                                                            │ ARRAY['en']  │
                                                            └─────────────┘

Customer ──pick date──▶ Frontend ──GET /availability?tourId=xxx&date=2024-07-15──▶ Backend
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │  Redis Cache │
                                                            │ (fast lookup)│
                                                            └─────────────┘
```

### State Changes
```typescript
interface Step4Data {
  guide: {
    guideId: string;        // Selected guide UUID
    name: string;           // Guide name
    experience: number;     // Years of experience
    languages: string[];    // Spoken languages
    photo: string;          // Profile photo URL
    dailyRate: number;      // Guide daily fee
  };
  confirmedDates: {
    startDate: Date;        // Tour start date (final)
    endDate: Date;          // Tour end date (final)
    duration: number;       // Days
  };
}

// Context Update
bookingContext.setStep4({
  guide: {
    guideId: "guide_marie_01",
    name: "Marie Dubois",
    experience: 8,
    languages: ["English", "French", "Spanish"],
    photo: "/guides/marie.jpg",
    dailyRate: 120.00
  },
  confirmedDates: {
    startDate: "2024-07-15",
    endDate: "2024-07-22",
    duration: 7
  }
});
```

### Guide Selection Component Data Flow
```
┌────────────────────────────────────────────────────────────────┐
│                    GuideSelection Component                      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  GET /guides?location=Paris&language=en,fr           │      │
│  │                                                      │      │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │      │
│  │  │  Marie D.  │  │  Jean P.   │  │  Sofia L.  │    │      │
│  │  │  8 years   │  │  5 years   │  │  12 years  │    │      │
│  │  │  EN, FR, ES│  │  EN, FR    │  │  EN, IT, DE│    │      │
│  │  │  $120/day  │  │  $95/day   │  │  $150/day  │    │      │
│  │  └─────┬──────┘  └────────────┘  └────────────┘    │      │
│  │        │ selected                                     │      │
│  │        ▼                                              │      │
│  │  ┌────────────────────────────────────┐               │      │
│  │  │  Selected: Marie Dubois            │               │      │
│  │  │  Experience: 8 years               │               │      │
│  │  │  Languages: English, French, Spanish│              │      │
│  │  │  Rate: $120/day × 7 days = $840    │               │      │
│  │  └────────────────────────────────────┘               │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────┘
```

---

## Step 5: Review & Confirmation

### Purpose
Display complete booking summary with full pricing breakdown. Customer reviews and submits.

### Complete Data Aggregation
```typescript
interface CompleteBookingData {
  // Step 1: Tour
  tourId: string;
  location: string;
  description: string;
  
  // Step 2: Customer
  customerName: string;
  nationalId: string;
  phoneNumber: string;
  email: string;
  
  // Step 3: Vehicle & Hotel
  vehicleId: string;
  vehicleType: string;
  hotelId: string;
  roomCount: number;
  
  // Step 4: Guide & Dates
  guideId: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  
  // Pricing (calculated)
  pricing: PriceBreakdown;
}

interface PriceBreakdown {
  tourBasePrice: number;        // $500
  vehicleCost: number;          // $85 × 7 = $595
  hotelCost: number;            // $150 × 2 rooms × 7 nights = $2,100
  guideCost: number;            // $120 × 7 = $840
  
  subtotal: number;             // $4,035
  
  // Dynamic adjustments
  seasonalMultiplier: number;   // 1.2 (peak season)
  groupDiscount: number;        // -$201.75 (5% for 4 people)
  earlyBirdDiscount: number;    // -$0 (booked < 30 days ahead)
  
  adjustedSubtotal: number;     // $4,640.25
  
  taxes: number;                // $464.03 (10%)
  serviceFee: number;           // $25.00
  
  total: number;                // $5,129.28
  currency: string;             // "USD"
}
```

### Final Submission Flow
```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐     ┌──────────────┐
│   Customer   │     │  Review Page     │     │   Backend    │     │  PostgreSQL  │
└──────┬───────┘     └────────┬─────────┘     └──────┬───────┘     └──────┬───────┘
       │                      │                      │                    │
       │  1. Review summary   │                      │                    │
       │◀─────────────────────│                      │                    │
       │                      │                      │                    │
       │  2. Click "Confirm"  │                      │                    │
       │─────────────────────▶│                      │                    │
       │                      │  3. POST /bookings   │                    │
       │                      │  (full booking JSON) │                    │
       │                      │─────────────────────▶│                    │
       │                      │                      │  4. Begin          │
       │                      │                      │     Transaction    │
       │                      │                      │                    │
       │                      │                      │  5. Validate       │
       │                      │                      │     availability   │────┐
       │                      │                      │                    │◀───┘
       │                      │                      │  6. Lock resources │
       │                      │                      │     (vehicle,      │────┐
       │                      │                      │      guide, hotel) │◀───┘
       │                      │                      │                    │
       │                      │                      │  7. Calculate      │
       │                      │                      │     final price    │
       │                      │                      │                    │
       │                      │                      │  8. Insert booking │────┐
       │                      │                      │     record         │    │
       │                      │                      │                    │◀───┘
       │                      │                      │  9. Commit         │
       │                      │                      │     transaction    │
       │                      │                      │                    │
       │                      │  10. Return          │                    │
       │                      │      confirmation    │                    │
       │                      │◀─────────────────────│                    │
       │                      │                      │                    │
       │                      │                      │  11. Trigger       │
       │                      │                      │      notifications │────▶ Email
       │                      │                      │                    │────▶ SMS
       │                      │                      │                    │────▶ WebSocket
       │  12. Show success    │                      │                    │
       │◀─────────────────────│                      │                    │
```

### Transaction Flow (Backend)
```sql
BEGIN TRANSACTION;

-- 1. Check availability (pessimistic locking)
SELECT * FROM available_dates 
WHERE tour_id = $1 AND date = ANY($2) 
FOR UPDATE;

-- 2. Check vehicle availability
SELECT * FROM vehicles 
WHERE id = $3 AND is_available = true 
FOR UPDATE;

-- 3. Check guide availability
SELECT * FROM guides 
WHERE id = $4 
AND NOT EXISTS (
  SELECT 1 FROM bookings 
  WHERE guide_id = $4 AND dates OVERLAP $2
) FOR UPDATE;

-- 4. Update availability counts
UPDATE available_dates 
SET booked_count = booked_count + $5 
WHERE tour_id = $1 AND date = ANY($2);

-- 5. Create booking record
INSERT INTO bookings (
  id, user_id, tour_id, vehicle_id, guide_id, hotel_id,
  status, dates, people_count, total_price, created_at
) VALUES ($6, $7, $8, $9, $10, $11, 'pending', $2, $5, $12, NOW());

-- 6. Create initial status history
INSERT INTO booking_status_history (
  booking_id, status, changed_at, changed_by
) VALUES ($6, 'pending', NOW(), 'system');

COMMIT;
```

---

## State Persistence Strategy

### Wizard State Machine
```
                    ┌──────────────┐
         ┌─────────▶│   Step 1     │◀────────┐
         │          │  (Tour)      │         │
         │          └──────┬───────┘         │
         │                 │                 │
    ┌────┴────┐            ▼                 │
    │  DRAFT  │◀─────  ┌──────────────┐      │
    │ (local) │         │   Step 2     │      │
    └────┬────┘         │  (Personal)  │      │
         │              └──────┬───────┘      │
         │                     │              │
         │                     ▼              │
         │              ┌──────────────┐      │
         └─────────────│   Step 3     │      │
                       │(Vehicle+Hotel)│      │
                       └──────┬───────┘      │
                              │              │
                              ▼              │
                       ┌──────────────┐      │
                       │   Step 4     │      │
                       │ (Guide+Date) │      │
                       └──────┬───────┘      │
                              │              │
                              ▼              │
                       ┌──────────────┐      │
                       │   Step 5     │      │
                       │  (Review)    │      │
                       └──────┬───────┘      │
                              │              │
                              ▼              │
                       ┌──────────────┐      │
                       │  SUBMITTED   │──────┘
                       │  (pending)   │
                       └──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  ADMIN REVIEW    │
                    │  (confirmed/     │
                    │   rejected)      │
                    └──────────────────┘
```

### State Storage Locations by Step
| Step | Primary Storage | Backup | Persistence |
|------|----------------|--------|-------------|
| 1 | React Context | localStorage | Until booking complete |
| 2 | React Context | localStorage | Auto-save every 1s |
| 3 | React Context | localStorage | Until booking complete |
| 4 | React Context | localStorage | Until booking complete |
| 5 | React Context + API | Database | Permanent after submit |

### Error Handling at Each Step
| Step | Error Type | Handling Strategy |
|------|-----------|-------------------|
| 1 | API failure (tours not loading) | Retry 3x, then show cached data + error message |
| 1 | No availability | Show alternative dates, suggest similar tours |
| 2 | Validation error | Inline field errors, prevent progression |
| 2 | Auto-save failure | Silent fail, warn on page unload |
| 3 | Vehicle unavailable | Show alternatives, update pricing |
| 3 | Hotel fully booked | Suggest nearby hotels, price comparison |
| 4 | Guide unavailable | Show available guides, skill-match ranking |
| 4 | Date conflict | Calendar highlighting of conflicts |
| 5 | Price changed | Show diff, require re-confirmation |
| 5 | Submit fails | Save as draft, allow retry |
| 5 | Concurrent booking | Optimistic locking, notify of conflict |

---

## Data Flow Summary Table

| Step | Data In | Data Out | API Calls | DB Tables |
|------|---------|----------|-----------|-----------|
| 1 | Tour filters | tourId, dates, people | GET /tours, GET /availability | tours, available_dates |
| 2 | Form input | customer details | (client-side validation only) | — |
| 3 | Vehicle/Hotel IDs | vehicleId, hotelId, rooms | GET /vehicles, GET /hotels | vehicles, hotels |
| 4 | Guide ID, Date | guideId, confirmed dates | GET /guides, GET /availability | guides, available_dates |
| 5 | Complete context | Booking confirmation | POST /bookings | bookings, booking_status_history |
