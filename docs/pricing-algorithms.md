# Tour Booking System - Admin Pricing Algorithms

## 1. Pricing Engine Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ADMIN PRICING MODULE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │  Pricing Input  │───▶│  Core Engine    │───▶│  Price Output   │     │
│  │  Parameters     │    │  (Algorithms)   │    │  Breakdown      │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│         │                      │                      │                  │
│         ▼                      ▼                      ▼                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Algorithm Components                          │    │
│  │                                                                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │    │
│  │  │   Base Price │  │  Adjustments │  │   Final Calculation  │  │    │
│  │  │  Calculator  │  │   Engine     │  │      & Formatting    │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │    │
│  │         │                  │                      │              │    │
│  │         ▼                  ▼                      ▼              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │    │
│  │  │ • Tour cost  │  │ • Seasonal   │  │ • Tax application    │  │    │
│  │  │ • Vehicle    │  │ • Group disc.│  │ • Fee calculation    │  │    │
│  │  │ • Hotel      │  │ • Early bird │  │ • Rounding rules     │  │    │
│  │  │ • Guide      │  │ • Loyalty    │  │ • Multi-currency     │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Base Price Calculation Algorithm

### Purpose
Calculate the foundational cost before any adjustments.

### Formula
```
BASE_PRICE = (TOUR_COST + VEHICLE_COST + HOTEL_COST + GUIDE_COST) × PEOPLE_COUNT

Where:
  TOUR_COST    = tour.base_price_per_person × duration_days
  VEHICLE_COST = vehicle.price_per_day × duration_days ÷ vehicle_capacity × people_count
  HOTEL_COST   = hotel.price_per_night × room_count × nights
  GUIDE_COST   = guide.daily_rate × duration_days
```

### Implementation
```typescript
interface BasePriceInput {
  tourId: string;
  vehicleId: string;
  hotelId: string;
  guideId: string;
  peopleCount: number;
  durationDays: number;
  roomCount: number;
}

async function calculateBasePrice(input: BasePriceInput): Promise<number> {
  // Fetch all resources in parallel
  const [tour, vehicle, hotel, guide] = await Promise.all([
    TourRepository.findById(input.tourId),
    VehicleRepository.findById(input.vehicleId),
    HotelRepository.findById(input.hotelId),
    GuideRepository.findById(input.guideId)
  ]);

  // Calculate each component
  const tourCost = tour.basePrice * input.durationDays;
  
  const vehicleCost = (vehicle.pricePerDay * input.durationDays) / 
                      vehicle.capacity * input.peopleCount;
  
  const hotelCost = hotel.pricePerNight * input.roomCount * 
                    (input.durationDays - 1); // Nights = days - 1
  
  const guideCost = guide.dailyRate * input.durationDays;

  // Sum per-person costs, multiply by people count
  const perPersonBase = tourCost + vehicleCost + guideCost;
  const totalBase = (perPersonBase * input.peopleCount) + hotelCost;

  return roundToCents(totalBase);
}

function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}
```

### Example Calculation
```
Input:
  Tour: $50/person/day × 7 days = $350/person
  Vehicle: SUV $85/day, capacity 7, 4 people
    = ($85 × 7 ÷ 7) × 4 = $340 total
  Hotel: $150/night × 2 rooms × 6 nights = $1,800
  Guide: $120/day × 7 days = $840
  People: 4

Calculation:
  Per-person: $350 (tour) + $85 (vehicle share) + $210 (guide share) = $645
  Total base: ($645 × 4 people) + $1,800 (hotel) = $4,380

Result: BASE_PRICE = $4,380.00
```

---

## 3. Seasonal Pricing Algorithm

### Purpose
Apply multipliers based on travel dates (peak, shoulder, off-season).

### Season Classification
```
PEAK_SEASON     = [June, July, August, December]     // Multiplier: 1.40
SHOULDER_SEASON = [March, April, May, September,     // Multiplier: 1.15
                    October, November]
OFF_SEASON      = [January, February]                 // Multiplier: 0.85
```

### Algorithm
```typescript
interface SeasonalInput {
  basePrice: number;
  travelDates: Date[];
  destination: string;  // For destination-specific overrides
}

interface SeasonalResult {
  adjustedPrice: number;
  multiplier: number;
  seasonName: string;
  dailyBreakdown: DailyPrice[];
}

async function applySeasonalPricing(input: SeasonalInput): Promise<SeasonalResult> {
  const { basePrice, travelDates, destination } = input;
  
  // Calculate price per day
  const dailyBasePrice = basePrice / travelDates.length;
  
  // Check for destination-specific overrides
  const override = await SeasonalOverrideRepository.findByDestination(destination);
  
  const dailyBreakdown: DailyPrice[] = travelDates.map(date => {
    const month = date.getMonth(); // 0-11
    
    let multiplier = getBaseMultiplier(month);
    
    // Apply destination override if exists
    if (override?.monthOverrides?.[month]) {
      multiplier = override.monthOverrides[month];
    }
    
    // Holiday premium check
    if (isHoliday(date)) {
      multiplier += 0.10; // +10% for holidays
    }
    
    return {
      date,
      basePrice: dailyBasePrice,
      multiplier,
      adjustedPrice: roundToCents(dailyBasePrice * multiplier)
    };
  });
  
  const totalAdjusted = dailyBreakdown.reduce((sum, day) => sum + day.adjustedPrice, 0);
  const blendedMultiplier = totalAdjusted / basePrice;
  
  return {
    adjustedPrice: roundToCents(totalAdjusted),
    multiplier: roundToCents(blendedMultiplier),
    seasonName: classifySeason(travelDates[0]),
    dailyBreakdown
  };
}

function getBaseMultiplier(month: number): number {
  if ([5, 6, 7, 11].includes(month)) return 1.40;  // Peak
  if ([2, 3, 4, 8, 9, 10].includes(month)) return 1.15; // Shoulder
  return 0.85; // Off-season
}

function classifySeason(date: Date): string {
  const month = date.getMonth();
  if ([5, 6, 7, 11].includes(month)) return 'peak';
  if ([2, 3, 4, 8, 9, 10].includes(month)) return 'shoulder';
  return 'off-season';
}

function isHoliday(date: Date): boolean {
  const holidays = [
    '01-01', '07-04', '12-25', '12-31' // US holidays
  ];
  const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return holidays.includes(dateStr);
}
```

### Example
```
Input: Base price $4,380, Dates: July 15-22 (7 days)

Daily breakdown:
  July 15: $625.71 × 1.40 = $876.00
  July 16: $625.71 × 1.40 = $876.00
  July 17: $625.71 × 1.40 = $876.00
  ... (all peak season days)

Result: $6,132.00 (multiplier: 1.40)
```

---

## 4. Group Discount Algorithm

### Purpose
Apply volume discounts based on group size.

### Tier Structure
```
Tier 1:  1-4  people  →  0% discount
Tier 2:  5-9  people  →  10% discount
Tier 3:  10-14 people  →  15% discount
Tier 4:  15+  people  →  25% discount

Family Bonus: 4+ people with bookingType='family' → additional 5% discount
```

### Algorithm
```typescript
interface GroupDiscountInput {
  price: number;
  peopleCount: number;
  bookingType: 'individual' | 'family' | 'group';
}

interface GroupDiscountResult {
  discountedPrice: number;
  discountAmount: number;
  discountPercentage: number;
  tier: string;
  familyBonusApplied: boolean;
}

function calculateGroupDiscount(input: GroupDiscountInput): GroupDiscountResult {
  const { price, peopleCount, bookingType } = input;
  
  // Determine base tier
  let discountPercentage = getBaseDiscountRate(peopleCount);
  let tier = getTierName(peopleCount);
  let familyBonusApplied = false;
  
  // Apply family bonus
  if (bookingType === 'family' && peopleCount >= 4) {
    discountPercentage += 5;
    familyBonusApplied = true;
  }
  
  // Cap at 30%
  discountPercentage = Math.min(discountPercentage, 30);
  
  const discountAmount = roundToCents(price * (discountPercentage / 100));
  const discountedPrice = roundToCents(price - discountAmount);
  
  return {
    discountedPrice,
    discountAmount,
    discountPercentage,
    tier,
    familyBonusApplied
  };
}

function getBaseDiscountRate(peopleCount: number): number {
  if (peopleCount >= 15) return 25;
  if (peopleCount >= 10) return 15;
  if (peopleCount >= 5) return 10;
  return 0;
}

function getTierName(peopleCount: number): string {
  if (peopleCount >= 15) return 'enterprise';
  if (peopleCount >= 10) return 'large_group';
  if (peopleCount >= 5) return 'medium_group';
  return 'standard';
}
```

---

## 5. Early Bird Discount Algorithm

### Purpose
Reward customers who book well in advance.

### Advance Booking Tiers
```
90+ days in advance  →  20% discount
60-89 days           →  15% discount
30-59 days           →  10% discount
14-29 days           →   5% discount
< 14 days            →   0% discount
```

### Algorithm
```typescript
interface EarlyBirdInput {
  price: number;
  travelStartDate: Date;
  bookingDate: Date;  // Usually today, but can be backdated
}

interface EarlyBirdResult {
  discountedPrice: number;
  discountAmount: number;
  discountPercentage: number;
  daysInAdvance: number;
  tier: string;
}

function calculateEarlyBirdDiscount(input: EarlyBirdInput): EarlyBirdResult {
  const { price, travelStartDate, bookingDate } = input;
  
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysInAdvance = Math.floor(
    (travelStartDate.getTime() - bookingDate.getTime()) / msPerDay
  );
  
  const discountPercentage = getEarlyBirdRate(daysInAdvance);
  
  const discountAmount = roundToCents(price * (discountPercentage / 100));
  const discountedPrice = roundToCents(price - discountAmount);
  
  return {
    discountedPrice,
    discountAmount,
    discountPercentage,
    daysInAdvance,
    tier: getEarlyBirdTier(daysInAdvance)
  };
}

function getEarlyBirdRate(daysInAdvance: number): number {
  if (daysInAdvance >= 90) return 20;
  if (daysInAdvance >= 60) return 15;
  if (daysInAdvance >= 30) return 10;
  if (daysInAdvance >= 14) return 5;
  return 0;
}

function getEarlyBirdTier(days: number): string {
  if (days >= 90) return 'super_early';
  if (days >= 60) return 'early';
  if (days >= 30) return 'advance';
  if (days >= 14) return 'standard';
  return 'last_minute';
}
```

---

## 6. Tax and Fee Calculation Algorithm

### Purpose
Apply applicable taxes and service fees.

### Algorithm
```typescript
interface TaxAndFeeInput {
  subtotal: number;           // After discounts, before tax
  destination: string;        // For local tax rates
  vehicleType: string;        // For vehicle-specific fees
  serviceFeeType: 'standard' | 'premium' | 'enterprise';
}

interface TaxAndFeeResult {
  subtotal: number;
  tourismTax: number;
  vat: number;
  serviceFee: number;
  vehicleFee: number;
  totalFees: number;
  grandTotal: number;
  currency: string;
}

async function calculateTaxesAndFees(input: TaxAndFeeInput): Promise<TaxAndFeeResult> {
  const { subtotal, destination, vehicleType, serviceFeeType } = input;
  
  // Get destination-specific tax rate
  const taxRate = await TaxRateRepository.findByDestination(destination);
  
  // Calculate tourism tax (usually flat per person per day)
  const tourismTax = taxRate.tourismTaxRate 
    ? roundToCents(subtotal * taxRate.tourismTaxRate) 
    : 0;
  
  // Calculate VAT/GST
  const vat = roundToCents(subtotal * (taxRate.vatRate || 0.10));
  
  // Service fee based on tier
  const serviceFee = calculateServiceFee(serviceFeeType, subtotal);
  
  // Vehicle-specific fees (luxury car surcharge, etc.)
  const vehicleFee = calculateVehicleFee(vehicleType);
  
  const totalFees = roundToCents(tourismTax + vat + serviceFee + vehicleFee);
  const grandTotal = roundToCents(subtotal + totalFees);
  
  return {
    subtotal,
    tourismTax,
    vat,
    serviceFee,
    vehicleFee,
    totalFees,
    grandTotal,
    currency: taxRate.currency || 'USD'
  };
}

function calculateServiceFee(tier: string, subtotal: number): number {
  const fees = {
    standard: 25,
    premium: 49,
    enterprise: subtotal * 0.02 // 2% for large bookings
  };
  return fees[tier] || fees.standard;
}

function calculateVehicleFee(vehicleType: string): number {
  const surcharges: Record<string, number> = {
    'luxury_car': 50,
    'bus': 30,
    'SUV': 0,
    'minivan': 0
  };
  return surcharges[vehicleType] || 0;
}
```

---

## 7. Master Pricing Orchestrator

### Purpose
Combine all algorithms into a single pricing calculation pipeline.

### Pipeline Flow
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Base Price  │────▶│   Seasonal   │────▶│  Discounts   │────▶│  Tax & Fees  │
│ Calculation  │     │ Adjustment   │     │  (Best of)   │     │  Addition    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       $4,380              × 1.40              - 15%               + $450
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
  Intermediate: $4,380   →   $6,132   →   $5,212.20   →   $5,662.20
```

### Implementation
```typescript
interface PricingRequest {
  tourId: string;
  vehicleId: string;
  hotelId: string;
  guideId: string;
  peopleCount: number;
  roomCount: number;
  bookingType: 'individual' | 'family' | 'group';
  travelDates: Date[];
  customerId?: string;  // For loyalty check
}

interface PricingResponse {
  bookingId: string;
  breakdown: PriceBreakdown;
  appliedStrategies: string[];
  validUntil: Date;  // Quote expiration
}

async function calculateFinalPrice(request: PricingRequest): Promise<PricingResponse> {
  const durationDays = request.travelDates.length;
  
  // Step 1: Base Price
  const basePrice = await calculateBasePrice({
    tourId: request.tourId,
    vehicleId: request.vehicleId,
    hotelId: request.hotelId,
    guideId: request.guideId,
    peopleCount: request.peopleCount,
    durationDays,
    roomCount: request.roomCount
  });
  
  // Step 2: Seasonal Adjustment
  const seasonalResult = await applySeasonalPricing({
    basePrice,
    travelDates: request.travelDates,
    destination: (await TourRepository.findById(request.tourId)).location
  });
  
  // Step 3: Calculate all possible discounts
  const groupDiscount = calculateGroupDiscount({
    price: seasonalResult.adjustedPrice,
    peopleCount: request.peopleCount,
    bookingType: request.bookingType
  });
  
  const earlyBirdDiscount = calculateEarlyBirdDiscount({
    price: seasonalResult.adjustedPrice,
    travelStartDate: request.travelDates[0],
    bookingDate: new Date()
  });
  
  // Check loyalty discount
  let loyaltyDiscount = { discountedPrice: seasonalResult.adjustedPrice, discountAmount: 0, discountPercentage: 0 };
  if (request.customerId) {
    loyaltyDiscount = await calculateLoyaltyDiscount({
      price: seasonalResult.adjustedPrice,
      customerId: request.customerId
    });
  }
  
  // Pick best discount (largest savings)
  const discounts = [
    { name: 'group', ...groupDiscount },
    { name: 'early_bird', ...earlyBirdDiscount },
    { name: 'loyalty', ...loyaltyDiscount }
  ];
  
  const bestDiscount = discounts.reduce((best, current) => 
    current.discountAmount > best.discountAmount ? current : best
  );
  
  // Step 4: Tax and Fees
  const taxResult = await calculateTaxesAndFees({
    subtotal: bestDiscount.discountedPrice,
    destination: (await TourRepository.findById(request.tourId)).location,
    vehicleType: (await VehicleRepository.findById(request.vehicleId)).type,
    serviceFeeType: request.peopleCount >= 10 ? 'enterprise' : 'standard'
  });
  
  // Compile breakdown
  const breakdown: PriceBreakdown = {
    tourId: request.tourId,
    
    // Base components
    tourBasePrice: basePrice,
    
    // Seasonal
    seasonalMultiplier: seasonalResult.multiplier,
    seasonName: seasonalResult.seasonName,
    afterSeasonal: seasonalResult.adjustedPrice,
    
    // Discounts
    discountName: bestDiscount.name,
    discountPercentage: bestDiscount.discountPercentage,
    discountAmount: bestDiscount.discountAmount,
    afterDiscount: bestDiscount.discountedPrice,
    
    // Taxes and fees
    tourismTax: taxResult.tourismTax,
    vat: taxResult.vat,
    serviceFee: taxResult.serviceFee,
    vehicleFee: taxResult.vehicleFee,
    
    // Totals
    subtotal: bestDiscount.discountedPrice,
    totalFees: taxResult.totalFees,
    grandTotal: taxResult.grandTotal,
    currency: taxResult.currency
  };
  
  return {
    bookingId: generateUUID(),
    breakdown,
    appliedStrategies: ['base', 'seasonal', bestDiscount.name, 'tax_and_fees'],
    validUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 min quote validity
  };
}

async function calculateLoyaltyDiscount(input: { price: number; customerId: string }): Promise<{ discountedPrice: number; discountAmount: number; discountPercentage: number }> {
  const customer = await CustomerRepository.findById(input.customerId);
  const tiers = {
    bronze: 0,
    silver: 5,
    gold: 10,
    platinum: 15
  };
  
  const percentage = tiers[customer.loyaltyTier] || 0;
  const discountAmount = roundToCents(input.price * (percentage / 100));
  
  return {
    discountedPrice: roundToCents(input.price - discountAmount),
    discountAmount,
    discountPercentage: percentage
  };
}
```

---

## 8. Admin Pricing Override Algorithm

### Purpose
Allow administrators to manually adjust pricing for special cases.

### Algorithm
```typescript
interface AdminPricingOverride {
  bookingId: string;
  adminId: string;          // Who made the change
  overrideType: 'discount_amount' | 'discount_percentage' | 'fixed_price' | 'addon';
  value: number;
  reason: string;           // Required audit reason
  applyTo: 'total' | 'tour' | 'vehicle' | 'hotel' | 'guide';
}

interface OverrideResult {
  originalPrice: number;
  newPrice: number;
  overrideAmount: number;
  auditLog: AuditEntry;
}

async function applyAdminPricingOverride(override: AdminPricingOverride): Promise<OverrideResult> {
  // 1. Fetch current booking
  const booking = await BookingRepository.findById(override.bookingId);
  if (!booking) throw new Error('Booking not found');
  
  // 2. Verify admin permissions
  const admin = await AdminRepository.findById(override.adminId);
  if (!admin.canModifyPricing) {
    throw new Error('Insufficient permissions to modify pricing');
  }
  
  // 3. Calculate override
  let newPrice: number;
  let overrideAmount: number;
  
  switch (override.overrideType) {
    case 'discount_amount':
      newPrice = booking.totalPrice - override.value;
      overrideAmount = override.value;
      break;
      
    case 'discount_percentage':
      overrideAmount = roundToCents(booking.totalPrice * (override.value / 100));
      newPrice = booking.totalPrice - overrideAmount;
      break;
      
    case 'fixed_price':
      newPrice = override.value;
      overrideAmount = booking.totalPrice - override.value;
      break;
      
    case 'addon':
      newPrice = booking.totalPrice + override.value;
      overrideAmount = override.value;
      break;
      
    default:
      throw new Error(`Unknown override type: ${override.overrideType}`);
  }
  
  // 4. Validation
  if (newPrice < 0) {
    throw new Error('Override would result in negative price');
  }
  
  // 5. Maximum discount check (e.g., 50% max)
  const maxDiscount = booking.totalPrice * 0.50;
  if (overrideAmount > maxDiscount && override.overrideType !== 'addon') {
    throw new Error(`Discount exceeds maximum allowed (${maxDiscount})`);
  }
  
  // 6. Apply change
  await BookingRepository.updatePrice(override.bookingId, newPrice);
  
  // 7. Create audit log
  const auditEntry = await AuditLogRepository.create({
    action: 'PRICE_OVERRIDE',
    adminId: override.adminId,
    bookingId: override.bookingId,
    details: {
      originalPrice: booking.totalPrice,
      newPrice,
      overrideType: override.overrideType,
      overrideValue: override.value,
      reason: override.reason
    },
    timestamp: new Date()
  });
  
  // 8. Notify customer of price change
  await NotificationService.sendPriceUpdate(booking.customerId, {
    originalPrice: booking.totalPrice,
    newPrice,
    reason: override.reason
  });
  
  return {
    originalPrice: booking.totalPrice,
    newPrice: roundToCents(newPrice),
    overrideAmount: roundToCents(Math.abs(overrideAmount)),
    auditLog: auditEntry
  };
}
```

---

## 9. Price Quote Generation & Sending

### Purpose
Generate a formal price quote and send it to the customer.

### Algorithm
```typescript
interface QuoteRequest {
  bookingId: string;
  adminId: string;
  sendToCustomer: boolean;
  expirationHours?: number;
}

async function generateAndSendQuote(request: QuoteRequest): Promise<QuoteResult> {
  // 1. Calculate final price
  const booking = await BookingRepository.findById(request.bookingId);
  const pricing = await calculateFinalPrice({
    tourId: booking.tourId,
    vehicleId: booking.vehicleId,
    hotelId: booking.hotelId,
    guideId: booking.guideId,
    peopleCount: booking.peopleCount,
    roomCount: booking.roomCount,
    bookingType: booking.bookingType,
    travelDates: booking.dates,
    customerId: booking.userId
  });
  
  // 2. Generate quote document
  const quote = {
    quoteId: `Q-${generateUUID().slice(0, 8)}`,
    bookingId: request.bookingId,
    generatedAt: new Date(),
    expiresAt: new Date(Date.now() + (request.expirationHours || 48) * 3600 * 1000),
    breakdown: pricing.breakdown,
    terms: await TermsRepository.getCurrentTerms(),
    adminId: request.adminId
  };
  
  // 3. Save quote
  await QuoteRepository.save(quote);
  
  // 4. Update booking with quote reference
  await BookingRepository.updateQuote(request.bookingId, quote.quoteId);
  
  // 5. Send to customer if requested
  if (request.sendToCustomer) {
    const customer = await UserRepository.findById(booking.userId);
    
    // Send email
    await EmailService.sendQuote({
      to: customer.email,
      quoteId: quote.quoteId,
      customerName: customer.name,
      tourName: booking.tourName,
      dates: booking.dates,
      peopleCount: booking.peopleCount,
      breakdown: pricing.breakdown,
      acceptUrl: `${config.FRONTEND_URL}/quotes/${quote.quoteId}/accept`,
      expiresAt: quote.expiresAt
    });
    
    // Send SMS notification
    await SMSService.send(customer.phoneNumber, 
      `Your tour quote (${quote.quoteId}) for ${booking.peopleCount} people is ready. ` +
      `Total: $${pricing.breakdown.grandTotal}. ` +
      `View and accept: ${config.FRONTEND_URL}/quotes/${quote.quoteId}`
    );
  }
  
  return {
    quoteId: quote.quoteId,
    sent: request.sendToCustomer,
    expiresAt: quote.expiresAt,
    totalAmount: pricing.breakdown.grandTotal
  };
}
```

---

## 10. Algorithm Complexity Analysis

| Algorithm | Time Complexity | Space Complexity | DB Queries |
|-----------|----------------|-----------------|------------|
| Base Price | O(1) parallel | O(1) | 4 (concurrent) |
| Seasonal | O(n) where n=days | O(n) | 1 |
| Group Discount | O(1) | O(1) | 0 |
| Early Bird | O(1) | O(1) | 0 |
| Tax & Fees | O(1) | O(1) | 1 |
| Master Orchestrator | O(n) | O(n) | 8-9 |
| Admin Override | O(1) | O(1) | 4 |
| Quote Generation | O(n) | O(n) | 6-7 |

---

## 11. Caching Strategy

```typescript
// Cache pricing results to avoid recalculation
const PRICING_CACHE_TTL = 300; // 5 minutes

async function getCachedOrCalculatePrice(request: PricingRequest): Promise<PricingResponse> {
  const cacheKey = `pricing:${hashRequest(request)}`;
  
  // Check cache
  const cached = await RedisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Calculate fresh
  const result = await calculateFinalPrice(request);
  
  // Cache result
  await RedisClient.setex(cacheKey, PRICING_CACHE_TTL, JSON.stringify(result));
  
  return result;
}

// Invalidate cache on pricing rule changes
async function invalidatePricingCache(tourId?: string): Promise<void> {
  if (tourId) {
    await RedisClient.del(`pricing:*:tour:${tourId}:*`);
  } else {
    await RedisClient.del('pricing:*');
  }
}
```
