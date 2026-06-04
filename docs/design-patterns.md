# Tour Booking System - Software Design Patterns

## 1. Architectural Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  React   │ │  Admin   │ │ Booking  │ │  User    │           │
│  │   UI     │ │ Dashboard│ │  Wizard  │ │ Profile  │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
└───────┼────────────┼────────────┼────────────┼─────────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Tour    │ │ Booking  │ │ Pricing  │ │  User    │           │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       └────────────┴────────────┴────────────┘                  │
│                    │                                             │
│              ┌─────┴─────┐                                      │
│              │  API      │                                      │
│              │ Gateway   │                                      │
│              │ (Facade)  │                                      │
│              └─────┬─────┘                                      │
└────────────────────┼────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│   Tour   │ │ Booking  │ │  User    │
│ Repository│ │Repository│ │Repository│
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │
     └────────────┼────────────┘
                  ▼
┌─────────────────────────────────────┐
│         DATA ACCESS LAYER            │
│  ┌──────────┐ ┌──────────────────┐ │
│  │PostgreSQL│ │   Redis Cache    │ │
│  │  (RDS)   │ │   (Session/      │ │
│  │          │ │    Availability) │ │
│  └──────────┘ └──────────────────┘ │
└─────────────────────────────────────┘
```

---

## 2. Creational Patterns

### 2.1 Singleton Pattern
**Purpose**: Ensure only one instance of critical services exists.

```typescript
// Database Connection Manager
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({ /* config */ });
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  query(sql: string, params: any[]) {
    return this.pool.query(sql, params);
  }
}

// Usage: All repositories share one connection pool
const db = DatabaseConnection.getInstance();
```

**Applied to:**
- Database Connection Pool
- Redis Cache Client
- Logger Service
- Configuration Manager

---

### 2.2 Factory Method Pattern
**Purpose**: Create different tour package types without exposing instantiation logic.

```typescript
// Abstract Creator
abstract class TourPackageFactory {
  abstract createPackage(): TourPackage;
  
  getPackageDetails(): string {
    const pkg = this.createPackage();
    return pkg.getDescription();
  }
}

// Concrete Creators
class FamilyPackageFactory extends TourPackageFactory {
  createPackage(): TourPackage {
    return new FamilyTourPackage();
  }
}

class SoloPackageFactory extends TourPackageFactory {
  createPackage(): TourPackage {
    return new SoloTourPackage();
  }
}

class GroupPackageFactory extends TourPackageFactory {
  createPackage(): TourPackage {
    return new GroupTourPackage();
  }
}

// Product Interface
interface TourPackage {
  getDescription(): string;
  getMaxPeople(): number;
  getDiscountRate(): number;
}

// Concrete Products
class FamilyTourPackage implements TourPackage {
  getDescription() { return "Family package with kid-friendly activities"; }
  getMaxPeople() { return 6; }
  getDiscountRate() { return 0.15; } // 15% family discount
}

class SoloTourPackage implements TourPackage {
  getDescription() { return "Solo traveler optimized experience"; }
  getMaxPeople() { return 1; }
  getDiscountRate() { return 0; }
}

class GroupTourPackage implements TourPackage {
  getDescription() { return "Group tour with shared costs"; }
  getMaxPeople() { return 20; }
  getDiscountRate() { return 0.20; } // 20% group discount
}
```

---

### 2.3 Builder Pattern
**Purpose**: Construct complex Booking objects step-by-step through the 5-step wizard.

```typescript
class BookingBuilder {
  private booking: Partial<Booking> = {};

  setCustomerInfo(name: string, nationalId: string, phone: string): this {
    this.booking.customerName = name;
    this.booking.nationalId = nationalId;
    this.booking.phoneNumber = phone;
    return this;
  }

  setTourPreferences(location: string, dates: Date[]): this {
    this.booking.location = location;
    this.booking.preferredDates = dates;
    return this;
  }

  setVehicle(vehicleType: VehicleType): this {
    this.booking.vehicleType = vehicleType;
    return this;
  }

  setHotel(hotelId: string, roomCount: number): this {
    this.booking.hotelId = hotelId;
    this.booking.roomCount = roomCount;
    return this;
  }

  setPeople(count: number, type: 'family' | 'individual'): this {
    this.booking.peopleCount = count;
    this.booking.bookingType = type;
    return this;
  }

  build(): Booking {
    if (!this.booking.customerName || !this.booking.location) {
      throw new Error("Missing required booking information");
    }
    return {
      id: generateUUID(),
      status: 'pending',
      createdAt: new Date(),
      ...this.booking
    } as Booking;
  }
}

// Usage in the wizard flow
const booking = new BookingBuilder()
  .setTourPreferences("Paris", [new Date("2024-07-01"), new Date("2024-07-15")])
  .setVehicle("SUV")
  .setHotel("hotel_123", 2)
  .setPeople(4, 'family')
  .setCustomerInfo("John Doe", "ID123456", "+1234567890")
  .build();
```

---

## 3. Structural Patterns

### 3.1 Facade Pattern
**Purpose**: Provide a simplified interface to the complex subsystem of booking management.

```typescript
class BookingFacade {
  private tourService: TourService;
  private vehicleService: VehicleService;
  private hotelService: HotelService;
  private guideService: GuideService;
  private pricingService: PricingService;
  private notificationService: NotificationService;

  constructor() {
    this.tourService = new TourService();
    this.vehicleService = new VehicleService();
    this.hotelService = new HotelService();
    this.guideService = new GuideService();
    this.pricingService = new PricingService();
    this.notificationService = new NotificationService();
  }

  // Simplified method that orchestrates the entire booking process
  async processBooking(bookingRequest: BookingRequest): Promise<BookingConfirmation> {
    // Step 1: Validate availability
    const availability = await this.checkAvailability(bookingRequest);
    if (!availability.available) {
      throw new Error("Selected options not available");
    }

    // Step 2: Assign resources (guide + vehicle)
    const guide = await this.guideService.assignGuide(
      bookingRequest.location,
      bookingRequest.languagePreference
    );
    const vehicle = await this.vehicleService.reserveVehicle(
      bookingRequest.vehicleType,
      bookingRequest.peopleCount
    );

    // Step 3: Confirm hotel
    const hotelBooking = await this.hotelService.bookRooms(
      bookingRequest.hotelId,
      bookingRequest.roomCount,
      bookingRequest.dates
    );

    // Step 4: Calculate pricing
    const pricing = await this.pricingService.calculateTotal({
      tour: bookingRequest.location,
      vehicle: vehicle.type,
      hotel: hotelBooking.nightlyRate,
      nights: bookingRequest.dates.length,
      people: bookingRequest.peopleCount,
      guide: guide.dailyRate,
      dates: bookingRequest.dates
    });

    // Step 5: Create booking record
    const booking = await this.createBookingRecord({
      ...bookingRequest,
      guideId: guide.id,
      vehicleId: vehicle.id,
      hotelBookingId: hotelBooking.id,
      pricing: pricing
    });

    // Step 6: Send confirmation
    await this.notificationService.sendConfirmation(booking);

    return {
      bookingId: booking.id,
      status: 'confirmed',
      totalPrice: pricing.total,
      schedule: pricing.schedule,
      guideDetails: guide.getPublicProfile(),
      vehicleDetails: vehicle,
      hotelConfirmation: hotelBooking.confirmationNumber
    };
  }

  private async checkAvailability(request: BookingRequest): Promise<AvailabilityResult> {
    const [tourAvail, vehicleAvail, hotelAvail, guideAvail] = await Promise.all([
      this.tourService.isAvailable(request.location, request.dates),
      this.vehicleService.isAvailable(request.vehicleType, request.dates),
      this.hotelService.hasAvailability(request.hotelId, request.roomCount, request.dates),
      this.guideService.hasAvailableGuide(request.location, request.dates)
    ]);

    return {
      available: tourAvail && vehicleAvail && hotelAvail && guideAvail,
      details: { tourAvail, vehicleAvail, hotelAvail, guideAvail }
    };
  }
}
```

---

### 3.2 Adapter Pattern
**Purpose**: Integrate external payment gateways and third-party hotel APIs with unified interfaces.

```typescript
// Target interface
interface PaymentProcessor {
  processPayment(amount: number, currency: string, paymentDetails: PaymentDetails): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount: number): Promise<RefundResult>;
}

// Adaptee: Stripe API
class StripeAPI {
  async createCharge(params: StripeChargeParams): Promise<StripeCharge> { /* ... */ }
  async createRefund(params: StripeRefundParams): Promise<StripeRefund> { /* ... */ }
}

// Adapter: Stripe → PaymentProcessor
class StripeAdapter implements PaymentProcessor {
  private stripe: StripeAPI;

  constructor(apiKey: string) {
    this.stripe = new StripeAPI(apiKey);
  }

  async processPayment(amount: number, currency: string, details: PaymentDetails): Promise<PaymentResult> {
    const charge = await this.stripe.createCharge({
      amount: amount * 100, // Stripe uses cents
      currency: currency.toLowerCase(),
      source: details.token,
      description: `Tour booking - ${details.bookingId}`
    });

    return {
      success: charge.status === 'succeeded',
      transactionId: charge.id,
      timestamp: new Date()
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<RefundResult> {
    const refund = await this.stripe.createRefund({
      charge: transactionId,
      amount: amount * 100
    });

    return {
      success: refund.status === 'succeeded',
      refundId: refund.id
    };
  }
}

// Adaptee: PayPal API
class PayPalAPI {
  async createOrder(params: PayPalOrderParams): Promise<PayPalOrder> { /* ... */ }
  async refundOrder(orderId: string): Promise<PayPalRefund> { /* ... */ }
}

// Adapter: PayPal → PaymentProcessor
class PayPalAdapter implements PaymentProcessor {
  private paypal: PayPalAPI;

  constructor(clientId: string, secret: string) {
    this.paypal = new PayPalAPI(clientId, secret);
  }

  async processPayment(amount: number, currency: string, details: PaymentDetails): Promise<PaymentResult> {
    const order = await this.paypal.createOrder({
      purchase_units: [{
        amount: { currency_code: currency, value: amount.toString() }
      }]
    });

    return {
      success: order.status === 'COMPLETED',
      transactionId: order.id,
      timestamp: new Date()
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<RefundResult> {
    const refund = await this.paypal.refundOrder(transactionId);
    return { success: true, refundId: refund.id };
  }
}

// Factory to get the right adapter
class PaymentAdapterFactory {
  static getProcessor(type: 'stripe' | 'paypal'): PaymentProcessor {
    switch(type) {
      case 'stripe': return new StripeAdapter(config.STRIPE_KEY);
      case 'paypal': return new PayPalAdapter(config.PAYPAL_ID, config.PAYPAL_SECRET);
      default: throw new Error(`Unknown payment type: ${type}`);
    }
  }
}
```

---

### 3.3 Decorator Pattern
**Purpose**: Add optional features to bookings (insurance, meal plans, priority support) dynamically.

```typescript
// Component interface
interface BookingComponent {
  getDescription(): string;
  getCost(): number;
}

// Concrete component
class BaseBooking implements BookingComponent {
  constructor(private tourPrice: number) {}
  getDescription() { return "Base Tour Package"; }
  getCost() { return this.tourPrice; }
}

// Base decorator
abstract class BookingDecorator implements BookingComponent {
  constructor(protected wrapped: BookingComponent) {}
  abstract getDescription(): string;
  abstract getCost(): number;
}

// Concrete decorators
class TravelInsuranceDecorator extends BookingDecorator {
  getDescription() {
    return `${this.wrapped.getDescription()} + Travel Insurance`;
  }
  getCost() {
    return this.wrapped.getCost() + 49.99;
  }
}

class MealPlanDecorator extends BookingDecorator {
  getDescription() {
    return `${this.wrapped.getDescription()} + Full Meal Plan`;
  }
  getCost() {
    return this.wrapped.getCost() + (this.wrapped.getCost() * 0.15); // 15% for meals
  }
}

class PrioritySupportDecorator extends BookingDecorator {
  getDescription() {
    return `${this.wrapped.getDescription()} + 24/7 Priority Support`;
  }
  getCost() {
    return this.wrapped.getCost() + 29.99;
  }
}

// Usage - dynamically compose features
let booking: BookingComponent = new BaseBooking(500);
booking = new TravelInsuranceDecorator(booking);
booking = new MealPlanDecorator(booking);
// Final: "Base Tour Package + Travel Insurance + Full Meal Plan" = ~$624.99
```

---

## 4. Behavioral Patterns

### 4.1 Observer Pattern
**Purpose**: Notify multiple services when booking status changes.

```typescript
// Subject
interface BookingSubject {
  attach(observer: BookingObserver): void;
  detach(observer: BookingObserver): void;
  notify(booking: Booking): void;
}

// Observer
interface BookingObserver {
  update(booking: Booking): Promise<void>;
  getObserverType(): string;
}

// Concrete Subject
class BookingStatusManager implements BookingSubject {
  private observers: BookingObserver[] = [];
  private booking: Booking;

  attach(observer: BookingObserver): void {
    this.observers.push(observer);
  }

  detach(observer: BookingObserver): void {
    this.observers = this.observers.filter(o => o !== observer);
  }

  async notify(booking: Booking): Promise<void> {
    await Promise.all(
      this.observers.map(o => o.update(booking).catch(err => 
        console.error(`Observer ${o.getObserverType()} failed:`, err)
      ))
    );
  }

  async updateStatus(status: BookingStatus): Promise<void> {
    this.booking.status = status;
    await this.notify(this.booking);
  }
}

// Concrete Observers
class EmailNotificationObserver implements BookingObserver {
  getObserverType() { return 'email'; }
  
  async update(booking: Booking): Promise<void> {
    const emailService = new EmailService();
    await emailService.sendStatusUpdate(booking.customerEmail, booking.status, booking.id);
  }
}

class SMSNotificationObserver implements BookingObserver {
  getObserverType() { return 'sms'; }
  
  async update(booking: Booking): Promise<void> {
    const smsService = new SMSService();
    await smsService.send(booking.phoneNumber, `Booking ${booking.id} is now ${booking.status}`);
  }
}

class AdminDashboardObserver implements BookingObserver {
  getObserverType() { return 'dashboard'; }
  
  async update(booking: Booking): Promise<void> {
    const ws = WebSocketManager.getInstance();
    ws.broadcast(`booking:${booking.id}`, { status: booking.status, updatedAt: new Date() });
  }
}

class AnalyticsObserver implements BookingObserver {
  getObserverType() { return 'analytics'; }
  
  async update(booking: Booking): Promise<void> {
    const analytics = AnalyticsService.getInstance();
    await analytics.trackEvent('booking_status_change', {
      bookingId: booking.id,
      from: booking.previousStatus,
      to: booking.status,
      timestamp: new Date()
    });
  }
}

// Setup
const bookingManager = new BookingStatusManager();
bookingManager.attach(new EmailNotificationObserver());
bookingManager.attach(new SMSNotificationObserver());
bookingManager.attach(new AdminDashboardObserver());
bookingManager.attach(new AnalyticsObserver());
```

---

### 4.2 Strategy Pattern
**Purpose**: Switch between different pricing algorithms based on context.

```typescript
// Strategy interface
interface PricingStrategy {
  calculate(basePrice: number, context: PricingContext): number;
  getStrategyName(): string;
}

// Concrete strategies
class StandardPricingStrategy implements PricingStrategy {
  getStrategyName() { return 'standard'; }
  
  calculate(basePrice: number, context: PricingContext): number {
    return basePrice * context.peopleCount;
  }
}

class SeasonalPricingStrategy implements PricingStrategy {
  getStrategyName() { return 'seasonal'; }
  
  calculate(basePrice: number, context: PricingContext): number {
    const seasonalMultiplier = this.getSeasonalMultiplier(context.dates);
    return basePrice * context.peopleCount * seasonalMultiplier;
  }

  private getSeasonalMultiplier(dates: Date[]): number {
    const month = dates[0].getMonth();
    // Peak season: June-August, December
    if ([5, 6, 7, 11].includes(month)) return 1.4;
    // Shoulder season: March-May, September-November
    if ([2, 3, 4, 8, 9, 10].includes(month)) return 1.15;
    // Off-season
    return 0.85;
  }
}

class GroupDiscountStrategy implements PricingStrategy {
  getStrategyName() { return 'group_discount'; }
  
  calculate(basePrice: number, context: PricingContext): number {
    const groupRate = this.getGroupRate(context.peopleCount);
    return basePrice * context.peopleCount * groupRate;
  }

  private getGroupRate(people: number): number {
    if (people >= 15) return 0.75;  // 25% off
    if (people >= 10) return 0.85;  // 15% off
    if (people >= 5) return 0.90;   // 10% off
    return 1.0;
  }
}

class EarlyBirdStrategy implements PricingStrategy {
  getStrategyName() { return 'early_bird'; }
  
  calculate(basePrice: number, context: PricingContext): number {
    const daysInAdvance = Math.floor(
      (context.dates[0].getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    let discount = 0;
    if (daysInAdvance >= 90) discount = 0.20;
    else if (daysInAdvance >= 60) discount = 0.15;
    else if (daysInAdvance >= 30) discount = 0.10;
    
    return basePrice * context.peopleCount * (1 - discount);
  }
}

// Context class
class PricingContext {
  private strategy: PricingStrategy;
  peopleCount: number;
  dates: Date[];
  vehicleType: string;
  hotelTier: string;

  setStrategy(strategy: PricingStrategy): void {
    this.strategy = strategy;
  }

  executeStrategy(basePrice: number): number {
    return this.strategy.calculate(basePrice, this);
  }

  getActiveStrategy(): string {
    return this.strategy.getStrategyName();
  }
}

// Strategy selector/factory
class PricingStrategyFactory {
  static getOptimalStrategy(context: PricingContext): PricingStrategy {
    // Auto-select best strategy based on booking parameters
    if (context.peopleCount >= 5) {
      return new GroupDiscountStrategy();
    }
    
    const daysInAdvance = Math.floor(
      (context.dates[0].getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysInAdvance >= 30) {
      return new EarlyBirdStrategy();
    }
    
    // Check if peak season
    const month = context.dates[0].getMonth();
    if ([5, 6, 7, 11].includes(month)) {
      return new SeasonalPricingStrategy();
    }
    
    return new StandardPricingStrategy();
  }
}
```

---

### 4.3 Command Pattern
**Purpose**: Encapsulate booking operations as objects for undo/redo and audit trails.

```typescript
// Command interface
interface BookingCommand {
  execute(): Promise<void>;
  undo(): Promise<void>;
  getDescription(): string;
  getTimestamp(): Date;
}

// Receiver
class BookingManager {
  private bookings: Map<string, Booking> = new Map();

  async createBooking(booking: Booking): Promise<void> {
    this.bookings.set(booking.id, booking);
  }

  async cancelBooking(bookingId: string): Promise<void> {
    const booking = this.bookings.get(bookingId);
    if (booking) {
      booking.status = 'cancelled';
    }
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<void> {
    const booking = this.bookings.get(bookingId);
    if (booking) {
      Object.assign(booking, updates);
    }
  }

  getBooking(bookingId: string): Booking | undefined {
    return this.bookings.get(bookingId);
  }
}

// Concrete Commands
class CreateBookingCommand implements BookingCommand {
  private timestamp: Date;
  private previousState: Booking | null = null;

  constructor(
    private manager: BookingManager,
    private booking: Booking
  ) {
    this.timestamp = new Date();
  }

  async execute(): Promise<void> {
    await this.manager.createBooking(this.booking);
  }

  async undo(): Promise<void> {
    // Soft-delete by marking cancelled
    await this.manager.cancelBooking(this.booking.id);
  }

  getDescription(): string {
    return `Create booking ${this.booking.id} for ${this.booking.customerName}`;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }
}

class UpdateBookingCommand implements BookingCommand {
  private timestamp: Date;
  private previousState: Booking;

  constructor(
    private manager: BookingManager,
    private bookingId: string,
    private updates: Partial<Booking>
  ) {
    this.timestamp = new Date();
  }

  async execute(): Promise<void> {
    const booking = this.manager.getBooking(this.bookingId);
    if (booking) {
      this.previousState = { ...booking };
      await this.manager.updateBooking(this.bookingId, this.updates);
    }
  }

  async undo(): Promise<void> {
    if (this.previousState) {
      await this.manager.updateBooking(this.bookingId, this.previousState);
    }
  }

  getDescription(): string {
    return `Update booking ${this.bookingId}: ${JSON.stringify(this.updates)}`;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }
}

// Invoker
class BookingCommandInvoker {
  private history: BookingCommand[] = [];
  private redoStack: BookingCommand[] = [];

  async execute(command: BookingCommand): Promise<void> {
    await command.execute();
    this.history.push(command);
    this.redoStack = []; // Clear redo on new action
  }

  async undo(): Promise<void> {
    const command = this.history.pop();
    if (command) {
      await command.undo();
      this.redoStack.push(command);
    }
  }

  async redo(): Promise<void> {
    const command = this.redoStack.pop();
    if (command) {
      await command.execute();
      this.history.push(command);
    }
  }

  getHistory(): BookingCommand[] {
    return [...this.history];
  }

  // Generate audit log
  generateAuditLog(): string {
    return this.history
      .map(cmd => `[${cmd.getTimestamp().toISOString()}] ${cmd.getDescription()}`)
      .join('\n');
  }
}
```

---

### 4.4 State Pattern
**Purpose**: Manage booking lifecycle states with state-specific behavior.

```typescript
// State interface
interface BookingState {
  getName(): string;
  canTransitionTo(newState: BookingState): boolean;
  onEnter(booking: Booking): Promise<void>;
  onExit(booking: Booking): Promise<void>;
}

// Concrete States
class DraftState implements BookingState {
  getName() { return 'draft'; }
  
  canTransitionTo(newState: BookingState): boolean {
    return ['pending', 'cancelled'].includes(newState.getName());
  }
  
  async onEnter(booking: Booking): Promise<void> {
    console.log(`Booking ${booking.id} entered draft state`);
  }
  
  async onExit(booking: Booking): Promise<void> {
    // Save draft data before moving forward
  }
}

class PendingState implements BookingState {
  getName() { return 'pending'; }
  
  canTransitionTo(newState: BookingState): boolean {
    return ['confirmed', 'rejected', 'cancelled'].includes(newState.getName());
  }
  
  async onEnter(booking: Booking): Promise<void> {
    // Notify admin of new pending booking
    await NotificationService.notifyAdmin(`New booking pending review: ${booking.id}`);
  }
  
  async onExit(booking: Booking): Promise<void> {
    // Log admin review time
  }
}

class ConfirmedState implements BookingState {
  getName() { return 'confirmed'; }
  
  canTransitionTo(newState: BookingState): boolean {
    return ['in_progress', 'cancelled'].includes(newState.getName());
  }
  
  async onEnter(booking: Booking): Promise<void> {
    // Send confirmation to customer
    await NotificationService.sendConfirmation(booking);
    // Reserve resources
    await ResourceManager.reserve(booking);
  }
  
  async onExit(booking: Booking): Promise<void> {
    // Release holds if moving to cancelled
  }
}

class InProgressState implements BookingState {
  getName() { return 'in_progress'; }
  
  canTransitionTo(newState: BookingState): boolean {
    return ['completed', 'cancelled'].includes(newState.getName());
  }
  
  async onEnter(booking: Booking): Promise<void> {
    // Activate guide, vehicle, hotel for the tour dates
    await ResourceManager.activate(booking);
  }
  
  async onExit(booking: Booking): Promise<void> {
    // Generate completion report
  }
}

class CompletedState implements BookingState {
  getName() { return 'completed'; }
  
  canTransitionTo(newState: BookingState): boolean {
    return ['archived'].includes(newState.getName());
  }
  
  async onEnter(booking: Booking): Promise<void> {
    // Request review from customer
    await NotificationService.requestReview(booking);
    // Process guide/vehicle payment
    await PaymentService.releaseVendorPayments(booking);
  }
  
  async onExit(booking: Booking): Promise<void> { }
}

class CancelledState implements BookingState {
  getName() { return 'cancelled'; }
  
  canTransitionTo(newState: BookingState): boolean {
    return ['archived'].includes(newState.getName());
  }
  
  async onEnter(booking: Booking): Promise<void> {
    // Calculate cancellation fee based on timing
    const fee = CancellationPolicy.calculateFee(booking);
    if (fee > 0) {
      await PaymentService.chargeCancellationFee(booking, fee);
    }
    // Release all resources
    await ResourceManager.release(booking);
    // Process refund if applicable
    await PaymentService.processRefund(booking);
  }
  
  async onExit(booking: Booking): Promise<void> { }
}

// Context
class BookingStateContext {
  private state: BookingState;
  private booking: Booking;

  constructor(booking: Booking) {
    this.booking = booking;
    this.state = new DraftState();
  }

  async transitionTo(newState: BookingState): Promise<void> {
    if (!this.state.canTransitionTo(newState)) {
      throw new Error(
        `Invalid transition from ${this.state.getName()} to ${newState.getName()}`
      );
    }

    await this.state.onExit(this.booking);
    this.state = newState;
    this.booking.status = newState.getName() as BookingStatus;
    await this.state.onEnter(this.booking);
  }

  getCurrentState(): string {
    return this.state.getName();
  }
}

// State transition diagram
// ┌──────┐     ┌─────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────┐
// │Draft │────▶│ Pending │────▶│ Confirmed│────▶│ In Progress │────▶│Completed │
// └──┬───┘     └────┬────┘     └────┬─────┘     └──────┬──────┘     └────┬─────┘
//    │              │               │                  │                 │
//    │         ┌────┴────┐     ┌────┴─────┐       ┌────┴─────┐           │
//    └────────▶│Cancelled│◀────┘          ◀───────┘          ◀───────────┘
//              └────┬────┘
//                   ▼
//               ┌────────┐
//               │Archived│
//               └────────┘
```

---

### 4.5 Template Method Pattern
**Purpose**: Define the skeleton of the pricing calculation algorithm with customizable steps.

```typescript
abstract class PricingTemplate {
  // Template method - defines the algorithm skeleton
  async calculateFinalPrice(context: PricingContext): Promise<PriceBreakdown> {
    const basePrice = await this.calculateBasePrice(context);
    const addons = await this.calculateAddons(context);
    const discounts = await this.calculateDiscounts(context, basePrice);
    const taxes = await this.calculateTaxes(context, basePrice - discounts);
    const fees = await this.calculateFees(context);
    
    const subtotal = basePrice + addons - discounts + taxes + fees;
    const total = this.applyFinalRounding(subtotal);
    
    return {
      basePrice,
      addons,
      discounts,
      taxes,
      fees,
      total,
      currency: context.currency || 'USD',
      breakdown: this.generateBreakdown(basePrice, addons, discounts, taxes, fees)
    };
  }

  // Abstract methods - subclasses must implement
  protected abstract calculateBasePrice(context: PricingContext): Promise<number>;
  protected abstract calculateAddons(context: PricingContext): Promise<number>;
  protected abstract calculateDiscounts(context: PricingContext, basePrice: number): Promise<number>;
  
  // Hook methods - subclasses can override
  protected async calculateTaxes(context: PricingContext, taxable: number): Promise<number> {
    return taxable * 0.10; // Default 10% tax
  }
  
  protected async calculateFees(context: PricingContext): Promise<number> {
    return 25; // Default processing fee
  }
  
  protected applyFinalRounding(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
  
  private generateBreakdown(...amounts: number[]): string {
    return amounts.map((a, i) => `Line ${i + 1}: $${a.toFixed(2)}`).join('\n');
  }
}

// Concrete implementation for domestic tours
class DomesticPricingTemplate extends PricingTemplate {
  protected async calculateBasePrice(context: PricingContext): Promise<number> {
    const tour = await TourService.getById(context.tourId);
    return tour.domesticPrice * context.peopleCount;
  }

  protected async calculateAddons(context: PricingContext): Promise<number> {
    let addons = 0;
    if (context.mealPlan) addons += 30 * context.peopleCount * context.nights;
    if (context.insurance) addons += 49.99 * context.peopleCount;
    return addons;
  }

  protected async calculateDiscounts(context: PricingContext, basePrice: number): Promise<number> {
    // Domestic tours: loyalty discount
    const loyalty = await CustomerService.getLoyaltyTier(context.customerId);
    const loyaltyDiscount = basePrice * loyalty.discountRate;
    
    // Family discount
    const familyDiscount = context.peopleCount >= 4 ? basePrice * 0.10 : 0;
    
    return loyaltyDiscount + familyDiscount;
  }

  protected override async calculateTaxes(context: PricingContext, taxable: number): Promise<number> {
    // Domestic tax rate
    return taxable * 0.08;
  }
}

// Concrete implementation for international tours
class InternationalPricingTemplate extends PricingTemplate {
  protected async calculateBasePrice(context: PricingContext): Promise<number> {
    const tour = await TourService.getById(context.tourId);
    return tour.internationalPrice * context.peopleCount;
  }

  protected async calculateAddons(context: PricingContext): Promise<number> {
    let addons = 0;
    if (context.mealPlan) addons += 45 * context.peopleCount * context.nights;
    if (context.insurance) addons += 89.99 * context.peopleCount; // Higher for international
    if (context.visaAssistance) addons += 150;
    return addons;
  }

  protected async calculateDiscounts(context: PricingContext, basePrice: number): Promise<number> {
    // International: early bird only
    const daysAhead = this.getDaysAhead(context.dates[0]);
    if (daysAhead >= 90) return basePrice * 0.20;
    if (daysAhead >= 60) return basePrice * 0.15;
    return 0;
  }

  protected override async calculateFees(context: PricingContext): Promise<number> {
    return 75; // Higher processing fee for international
  }

  protected override async calculateTaxes(context: PricingContext, taxable: number): Promise<number> {
    // International: VAT + tourism tax
    return taxable * 0.15;
  }

  private getDaysAhead(date: Date): number {
    return Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }
}
```

---

## 5. Pattern Summary Matrix

| Pattern | Category | Component | Purpose |
|---------|----------|-----------|---------|
| **Singleton** | Creational | DatabaseConnection, Logger, Cache | Single shared instance |
| **Factory Method** | Creational | TourPackageFactory | Dynamic package creation |
| **Builder** | Creational | BookingBuilder | Step-by-step wizard construction |
| **Facade** | Structural | BookingFacade | Simplified subsystem interface |
| **Adapter** | Structural | PaymentProcessor adapters | Third-party integration |
| **Decorator** | Structural | BookingDecorator | Dynamic feature composition |
| **Observer** | Behavioral | BookingStatusManager | Status change notifications |
| **Strategy** | Behavioral | PricingStrategy | Algorithm switching |
| **Command** | Behavioral | BookingCommand | Undo/redo + audit trail |
| **State** | Behavioral | BookingState | Lifecycle management |
| **Template Method** | Behavioral | PricingTemplate | Algorithm skeleton customization |

---

## 6. Technology Stack Recommendations

| Layer | Technology | Pattern Implementation |
|-------|-----------|----------------------|
| Frontend | React + TypeScript | Builder (wizard), Observer (WebSocket) |
| API | Node.js + Express | Facade, Adapter, Command |
| Database | PostgreSQL | Singleton (connection pool) |
| Cache | Redis | Singleton, Strategy (caching) |
| Queue | Redis/Bull | Observer (async notifications) |
| Payments | Stripe/PayPal SDK | Adapter |
| Real-time | Socket.io | Observer (live updates) |
| Testing | Jest + Supertest | All patterns |
| Deployment | Docker + AWS/GCP | Factory (environment configs) |
