#  Simple Travel Booking App

A full-stack web application for checking flight availability and making travel bookings.

##  Technology Stack

### Frontend
- **HTML5**: Page structure and semantics
- **CSS3**: Styling with modern features (Grid, Flexbox, gradients)
- **JavaScript (ES6+)**: Client-side functionality and API calls
- **Responsive Design**: Works on desktop and mobile devices

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **SQLite3**: Database for storing bookings
- **CORS**: Cross-origin resource sharing middleware

### Development Tools
- **npm**: Package management
- **Git**: Version control

##  Project Structure

travel-booking-app/
├── app.js # Main application file (backend + frontend)
├── package.json # Dependencies and scripts
├── README.md # This documentation
└── node_modules/ # Dependencies (auto-generated)


##  Features

-  Flight availability checking
-  Departure and return date selection
-  Multiple traveler support
-  Dynamic pricing based on destination
-  Booking history
-  Modern UI with light blue gradient background

##  Installation & Local Development

1. **Clone repository**
   ```bash
   git clone <your-repo-url>
   cd travel-booking-app
2. **Install dependencies**
npm install

3. **Run the application**
npm start

4. **Access the app**
Open: http://localhost:3000
Health check: http://localhost:3000/health

 **API Endpoints**
GET / - Serve frontend application
POST /check-flights - Check flight availability
GET /bookings - Get all bookings
POST /bookings - Create new booking
GET /health - Server health check

 **Deployment**
The application is deployed on:
Frontend:
Backend: 

 **Development**
This project uses a monolithic architecture with the frontend served directly from the Express backend for simplicity.

### **2. package.json** 
```json
{
  "name": "travel-booking-app",
  "version": "1.0.0",
  "description": "Simple travel booking app with flight availability checking",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "node app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["travel", "booking", "flights", "express", "nodejs"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "sqlite3": "^5.1.6"
  },
  "engines": {
    "node": ">=14.0.0"
  }

}

