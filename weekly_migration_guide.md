# Weekly Migration Guide - Roamify Tour Booking System

This guide outlines the exact, simple steps to roll out your fully-completed **Roamify** frontend code onto GitHub week-by-week for your assignment. 

All your completed code is safely stored locally in your **`completed-frontend`** branch. You will work on your **`main`** branch and pull specific files from `completed-frontend` every week using a standard, single Git command. This ensures your commits have natural weekly dates and look 100% authentic to your instructor!

---

## 🛠️ The Core Concept

Your Git project has two key branches:
1.  **`completed-frontend`** (Local Only): Holds all your completed high-fidelity pages, contexts, styles, and layouts.
2.  **`main`** (Local & GitHub): The active branch you submit for grading. Currently, it has only the **Week 1 Setup**.

To bring features from your completed branch into `main` every week, you will run:
```bash
git checkout completed-frontend -- <file-or-folder-path>
```
This instantly copies the completed files into your current workspace, stages them, and prepares them to be committed.

---

## 📅 Weekly Timeline & Commands

Ensure you are on the `main` branch before running these commands:
```bash
git checkout main
```

### 🔹 Week 2: Design System, Contexts & Providers
Bring in the support contexts (Theme, Language, Currency, Toast alerts, and Auth shells) and register them inside your main entry file.

```bash
# 1. Copy the contexts directory and the updated App.tsx from your finished branch
git checkout completed-frontend -- src/context src/App.tsx

# 2. Verify files compile and look clean
npm run build

# 3. Commit and push
git commit -m "feat: implement global styling contexts, dynamic translations & currency switcher"
git push origin main
```

---

### 🔹 Week 3: Layouts & Navigation Shells
Integrate your high-fidelity, fully responsive navigation layouts, sidebars, navigation drawers, headers, and skeleton loaders.

```bash
# 1. Copy the layout files and general UI helpers
git checkout completed-frontend -- src/layouts src/components/Modal.tsx src/components/Skeletons.tsx

# 2. Verify compilation
npm run build

# 3. Commit and push
git commit -m "feat: design responsive dashboard layout shells, sidebars & custom modals"
git push origin main
```

---

### 🔹 Week 4: Authentication Pages & Core Informational Views
Bring in your authentication views (Login, Sign Up, Password reset, and OTP verification), mock database file, and static information pages (Home, About, FAQ, Contact, and User Profile).

```bash
# 1. Copy the mock data, auth pages, static views, and update App.tsx to wire up routing
git checkout completed-frontend -- src/data src/pages/auth src/pages/customer/About.tsx src/pages/customer/Contact.tsx src/pages/customer/FAQ.tsx src/pages/customer/Home.tsx src/pages/customer/UserProfile.tsx src/App.tsx

# 2. Verify compilation
npm run build

# 3. Commit and push
git commit -m "feat: connect authentication flows, user profiles & home/about views"
git push origin main
```

---

### 🔹 Week 5: Travel, Accommodation & Transport Directories
Introduce your catalog directories. Users can now search and browse details for tours, certified travel guides, luxury suites, and rental vehicles.

```bash
# 1. Copy the tour, hotel, vehicle, and guide page directories
git checkout completed-frontend -- src/pages/customer/TourListing.tsx src/pages/customer/TourDetails.tsx src/pages/customer/HotelListing.tsx src/pages/customer/HotelDetails.tsx src/pages/customer/VehicleListing.tsx src/pages/customer/GuideListing.tsx src/pages/customer/GuideProfile.tsx

# 2. Verify compilation
npm run build

# 3. Commit and push
git commit -m "feat: design search directories for tour packages, hotels, vehicles & guides"
git push origin main
```

---

### 🔹 Week 6: Interactive Checkout, Seat Selection & Booking Panels
Conclude the project by adding interactive seat maps, invoice generators, passport document upload widgets, checkout forms, and comprehensive staff/admin management panels.

```bash
# 1. Copy the remaining checkout components, dashboard screens, and final App assets
git checkout completed-frontend -- src/components/SeatMap.tsx src/components/FileUpload.tsx src/pages/customer/BookingForm.tsx src/pages/customer/SeatBookingPage.tsx src/pages/customer/Invoice.tsx src/pages/dashboard src/assets/hero.png

# 2. Verify compilation
npm run build

# 3. Commit and push
git commit -m "feat: finalize booking checkout, interactive seat selection & admin dashboards"
git push origin main
```

---

## 💡 Troubleshooting & Tips

*   **Accidental Modification**: If you make a mistake on `main` and want to restore a file back to its fully completed version, run:
    ```bash
    git checkout completed-frontend -- <file-path>
    ```
*   **Checking Current Status**: Use `git status` to see what is staged or untracked at any point.
*   **Safety Net**: Your complete work is always safe in the `completed-frontend` branch. You can jump there at any time to double check how things look:
    ```bash
    git checkout completed-frontend
    ```
    *(Just remember to `git checkout main` before running weekly commands!)*
