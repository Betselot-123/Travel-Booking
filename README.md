# Roamify - Premium Tour & Travel Booking System

Roamify is a state-of-the-art, high-fidelity responsive web application designed for premium tourism management, travel agencies, and booking services. Built using React 19, TypeScript, Vite, and Tailwind CSS v4, Roamify offers a seamless, premium user experience with tailored dark modes, multi-language/multi-currency capabilities, interactive booking mechanisms, and comprehensive staff/admin management utilities.

![Roamify Showcase](https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&auto=format&fit=crop&q=80)

---

## 🌟 Key Features

### 1. **User Experience & Personalization**
*   **Vibrant HSL-tailored Aesthetics**: Sleek modern UI design incorporating elements of glassmorphism, smooth animations, and tailored color tokens.
*   **Dynamic Theme Switcher**: Full support for system-wide light mode and custom dark mode settings.
*   **Multi-Language Integration**: High-fidelity dynamic translation engine backing localization across multiple languages (English, Spanish, French, German).
*   **Multi-Currency Support**: Real-time pricing calculations supporting dynamic toggling across USD ($), EUR (€), GBP (£), and AUD (A$).
*   **Toast Notifications**: Interactive, non-blocking custom status toasts indicating actions, successes, and warnings.

### 2. **Travel & Catalog Directories**
*   **Tour Listings**: Browse specialized global packages with rich criteria searching, category filters (Adventure, Cultural, Luxury, Beach), pricing ranges, and reviews.
*   **Hotel & Resort Directory**: Browse luxury suites and hotels complete with ratings, structural descriptions, and amenities checks.
*   **Vehicle Rental Catalog**: Explore high-end private transportation fleets, executive cars, and charter options.
*   **Tour Guide Profiles**: Dedicated pages highlighting expert, certified tour guides with ratings, specialty tags, languages, and booking availability.

### 3. **Interactive Booking System**
*   **Custom Seat Selection**: Highly visual, interactive seat mapping utility that updates in real-time based on selection status.
*   **Structured Booking Forms**: Step-by-step checkout forms including guest count calculations, price calculations, billing address entries, and document/passport file uploading.
*   **Dynamic Invoices**: Instant PDF-style transaction invoices generated upon successful bookings detailing tour information, tax splits, totals, and receipt numbers.

### 4. **Staff & Administration Panels**
*   **Interactive Simulator Toggler**: Instant quick-switch widget between **Admin**, **Staff**, and **Customer** personas to preview role-based access.
*   **Tourism Management Dashboard**: Comprehensive overview graphs (using Recharts), tour management tables, booking lists, vehicle dispatch monitors, and configuration panels.

---

## 🛠️ Technology Stack

*   **Frontend Library**: [React 19](https://react.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Build Tooling & Dev Server**: [Vite 8](https://vite.dev/)
*   **Styling Engine**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Icon Library**: [Lucide React](https://lucide.dev/)
*   **Data Visualization**: [Recharts](https://recharts.org/)
*   **Routing**: [React Router DOM v7](https://reactrouter.com/)

---

## 📂 Project Structure

```bash
fev-new/
├── public/                 # Static asset definitions
├── src/
│   ├── assets/             # Images, local vectors, and visual resources
│   ├── components/         # Reusable global UI widgets (Modal, SeatMap, FileUpload)
│   ├── context/            # Global React Contexts (Theme, Language, Currency, Auth, Toast)
│   ├── data/               # Local mock database layers (tours, hotels, bookings)
│   ├── layouts/            # Custom Layout templates (Customer, Staff Main, Auth Layouts)
│   ├── pages/              # Primary Page views
│   │   ├── auth/           # Login, Sign Up, and Password retrieval
│   │   ├── customer/       # Home, Listings, Details, Booking, Invoices, Profiles
│   │   └── dashboard/      # Admin overview, tables, dispatches, and configurations
│   ├── App.css             # Entry typography classes
│   ├── App.tsx             # Application router wrapping and root path bindings
│   ├── index.css           # Global custom design system tokens & Tailwind imports
│   └── main.tsx            # DOM initialization entrypoint
├── index.html              # HTML5 template frame
├── tailwind.config.js      # Styling overrides & Tailwind extension declarations
├── tsconfig.json           # Compiler rules for TypeScript
└── vite.config.ts          # Vite asset bundling rules
```

---

## 🚀 Running Locally

### Prerequisites
*   Ensure that you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch the Development Server
```bash
npm run dev
```
*   The application will start running at `http://localhost:5173`. Open this URL in your web browser to explore.

### 3. Build for Production
To bundle the project for distribution:
```bash
npm run build
```
