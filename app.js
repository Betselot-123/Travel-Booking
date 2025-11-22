const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database(':memory:');

// Create tables
db.serialize(() => {
    db.run(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            destination TEXT NOT NULL,
            departureDate TEXT NOT NULL,
            returnDate TEXT NOT NULL,
            travelers INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);
    
    // Insert a demo user (password: demo123)
    db.run(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        ['demo@example.com', 'demo123', 'Demo User']
    );
});

// Mock flight data
const mockFlights = {
    'paris': { seats: 45, basePrice: 450 },
    'london': { seats: 32, basePrice: 380 },
    'new york': { seats: 28, basePrice: 520 },
    'tokyo': { seats: 18, basePrice: 780 },
    'bangkok': { seats: 25, basePrice: 620 },
    'dubai': { seats: 36, basePrice: 550 },
    'rome': { seats: 29, basePrice: 420 },
    'sydney': { seats: 22, basePrice: 890 }
};

// Simple session storage
const sessions = {};

// Authentication middleware
const requireAuth = (req, res, next) => {
    const sessionId = req.headers.authorization;
    if (!sessionId || !sessions[sessionId]) {
        return res.status(401).json({ error: 'Please login first' });
    }
    req.user = sessions[sessionId];
    next();
};

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Create session
        const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        sessions[sessionId] = { id: user.id, email: user.email, name: user.name };
        
        res.json({
            success: true,
            sessionId: sessionId,
            user: { name: user.name, email: user.email }
        });
    });
});

// Serve login page
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Travel Booking - Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #87CEEB, #B0E0E6); 
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { 
            max-width: 400px; 
            width: 100%;
            background: white; 
            padding: 40px 30px; 
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #2c3e50; 
            margin-bottom: 30px; 
            text-align: center;
            font-size: 2em;
        }
        .form-group { margin-bottom: 20px; }
        label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: bold;
            color: #34495e;
        }
        input { 
            width: 100%; 
            padding: 12px; 
            border: 2px solid #bdc3c7; 
            border-radius: 8px; 
            font-size: 16px;
        }
        input:focus {
            border-color: #3498db;
            outline: none;
        }
        button { 
            background: #3498db; 
            color: white; 
            padding: 15px 20px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            width: 100%; 
            font-size: 18px;
            font-weight: bold;
            transition: background 0.3s;
            margin-bottom: 10px;
        }
        button:hover { background: #2980b9; }
        .demo-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 14px;
            color: #666;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌍 Travel Booking</h1>
        <div id="errorMessage" class="error"></div>
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" placeholder="Enter your password" required>
        </div>
        <button onclick="login()">Login</button>
        
        <div class="demo-info">
            <strong>Demo Account:</strong><br>
            Email: demo@example.com<br>
            Password: demo123
        </div>
    </div>

    <script>
        async function login() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('errorMessage');

            if (!email || !password) {
                showError('Please enter both email and password');
                return;
            }

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (result.success) {
                    localStorage.setItem('sessionId', result.sessionId);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    window.location.href = '/home';
                } else {
                    showError(result.error || 'Login failed');
                }
            } catch (error) {
                showError('Network error. Please try again.');
            }
        }

        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }

        document.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                login();
            }
        });
    </script>
</body>
</html>
    `);
});

// Serve home page (protected)
app.get('/home', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Travel Booking - Home</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #87CEEB, #B0E0E6); 
            min-height: 100vh;
        }
        .navbar {
            background: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .nav-brand { 
            font-size: 1.5em; 
            font-weight: bold; 
            color: #2c3e50; 
        }
        .nav-links { 
            display: flex; 
            gap: 2rem; 
        }
        .nav-links a { 
            text-decoration: none; 
            color: #34495e; 
            font-weight: 500;
            cursor: pointer;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            transition: background 0.3s;
        }
        .nav-links a:hover { 
            background: #ecf0f1; 
        }
        .user-info {
            color: #7f8c8d;
        }
        .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            padding: 2rem;
        }
        .section {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        h1 { 
            color: #2c3e50; 
            margin-bottom: 1.5rem; 
        }
        h2 {
            color: #34495e;
            margin-bottom: 1rem;
            border-bottom: 2px solid #3498db;
            padding-bottom: 0.5rem;
        }
        .form-group { margin-bottom: 1.5rem; }
        label { 
            display: block; 
            margin-bottom: 0.5rem; 
            font-weight: bold;
            color: #34495e;
        }
        input, select { 
            width: 100%; 
            padding: 12px; 
            border: 2px solid #bdc3c7; 
            border-radius: 8px; 
            font-size: 16px;
        }
        input:focus, select:focus {
            border-color: #3498db;
            outline: none;
        }
        button { 
            background: #3498db; 
            color: white; 
            padding: 15px 20px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            width: 100%; 
            font-size: 18px;
            font-weight: bold;
            transition: background 0.3s;
            margin-bottom: 10px;
        }
        button:hover { background: #2980b9; }
        button:disabled { 
            background: #95a5a6; 
            cursor: not-allowed; 
        }
        .booking { 
            background: #ecf0f1; 
            padding: 1.5rem; 
            margin: 1rem 0; 
            border-radius: 10px;
            border-left: 5px solid #3498db;
        }
        .hidden { display: none; }
        .flight-status {
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
            border: 2px solid transparent;
        }
        .available { background: #d4edda; color: #155724; border-color: #c3e6cb; }
        .unavailable { background: #f8d7da; color: #721c24; border-color: #f5c6cb; }
        .checking { background: #fff3cd; color: #856404; border-color: #ffeaa7; }
        .date-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        .success { background: #27ae60; }
        .secondary { background: #e74c3c; }
        .about-content, .contact-content {
            line-height: 1.6;
            color: #555;
        }
        .contact-info {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
        }
        @media (max-width: 768px) {
            .date-group {
                grid-template-columns: 1fr;
            }
            .navbar {
                flex-direction: column;
                gap: 1rem;
            }
            .nav-links {
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-brand">🌍 TravelBooking</div>
        <div class="nav-links">
            <a onclick="showSection('booking')">Book Flight</a>
            <a onclick="showSection('about')">About Us</a>
            <a onclick="showSection('contact')">Contact Us</a>
        </div>
        <div class="user-info">
            Welcome, <span id="userName">User</span> | 
            <a onclick="logout()" style="color: #e74c3c; cursor: pointer;">Logout</a>
        </div>
    </nav>

    <div class="container">
        <!-- Booking Section -->
        <div id="bookingSection" class="section">
            <h1>✈️ Book Your Flight</h1>
            
            <div id="bookingForm">
                <div class="form-group">
                    <label for="destination">Destination:</label>
                    <input type="text" id="destination" placeholder="Where do you want to go?" required>
                </div>
                
                <div class="form-group date-group">
                    <div>
                        <label for="departureDate">Departure Date:</label>
                        <input type="date" id="departureDate" required>
                    </div>
                    <div>
                        <label for="returnDate">Return Date:</label>
                        <input type="date" id="returnDate" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="travelers">Number of Travelers:</label>
                    <select id="travelers">
                        <option value="1">1 Traveler</option>
                        <option value="2">2 Travelers</option>
                        <option value="3">3 Travelers</option>
                        <option value="4">4 Travelers</option>
                    </select>
                </div>
                
                <div id="flightStatus" class="flight-status hidden"></div>
                
                <button onclick="checkFlights()">Check Flight Availability</button>
                <button onclick="bookTravel()" class="success" id="bookButton" disabled>Book Flight</button>
            </div>
            
            <div id="bookingsList" class="hidden">
                <h2>Your Bookings</h2>
                <div id="bookings"></div>
                <button onclick="showBookingForm()" class="secondary">Make Another Booking</button>
            </div>
        </div>

        <!-- About Us Section -->
        <div id="aboutSection" class="section hidden">
            <h1>About Us</h1>
            <div class="about-content">
                <p>Welcome to TravelBooking, your trusted partner for all your travel needs!</p>
                
                <h2>Our Mission</h2>
                <p>We strive to make travel booking simple, affordable, and accessible to everyone. Whether you're planning a business trip or a vacation, we've got you covered.</p>
                
                <h2>Why Choose Us?</h2>
                <ul>
                    <li>✈️ Best flight deals and availability</li>
                    <li>🔒 Secure and easy booking process</li>
                    <li>📱 User-friendly platform</li>
                    <li>🛡️ Reliable customer support</li>
                    <li>💰 Competitive pricing</li>
                </ul>
                
                <h2>Our Story</h2>
                <p>Founded in 2024, TravelBooking has been helping thousands of travelers reach their destinations safely and comfortably. We believe that everyone deserves to explore the world.</p>
            </div>
        </div>

        <!-- Contact Us Section -->
        <div id="contactSection" class="section hidden">
            <h1>Contact Us</h1>
            <div class="contact-content">
                <p>We'd love to hear from you! Get in touch with us through any of the following methods:</p>
                
                <div class="contact-info">
                    <h3>📞 Phone Support</h3>
                    <p>1-800-TRAVEL-1 (1-800-872-8351)</p>
                    <p>Available Monday-Friday: 9AM-6PM EST</p>
                    
                    <h3>📧 Email Support</h3>
                    <p>support@travelbooking.com</p>
                    <p>We typically respond within 24 hours</p>
                    
                    <h3>🏢 Office Address</h3>
                    <p>123 Travel Street<br>Suite 100<br>New York, NY 10001</p>
                    
                    <h3>💬 Live Chat</h3>
                    <p>Available on our website during business hours</p>
                </div>
                
                <h2>Send us a Message</h2>
                <div class="form-group">
                    <label for="messageSubject">Subject:</label>
                    <input type="text" id="messageSubject" placeholder="What is this regarding?">
                </div>
                <div class="form-group">
                    <label for="messageContent">Message:</label>
                    <textarea id="messageContent" rows="5" placeholder="Your message..." style="width: 100%; padding: 12px; border: 2px solid #bdc3c7; border-radius: 8px; font-size: 16px; font-family: Arial;"></textarea>
                </div>
                <button onclick="sendMessage()" class="success">Send Message</button>
            </div>
        </div>
    </div>

    <script>
        let currentFlightAvailable = false;
        let currentSessionId = localStorage.getItem('sessionId');
        let currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        // Check if user is logged in
        if (!currentSessionId) {
            window.location.href = '/';
        }

        // Display user name
        document.getElementById('userName').textContent = currentUser.name || currentUser.email;

        function showSection(sectionName) {
            // Hide all sections
            document.getElementById('bookingSection').classList.add('hidden');
            document.getElementById('aboutSection').classList.add('hidden');
            document.getElementById('contactSection').classList.add('hidden');
            
            // Show selected section
            document.getElementById(sectionName + 'Section').classList.remove('hidden');
        }

        function logout() {
            localStorage.removeItem('sessionId');
            localStorage.removeItem('user');
            window.location.href = '/';
        }

        async function checkFlights() {
            const destination = document.getElementById('destination').value;
            const departureDate = document.getElementById('departureDate').value;
            const returnDate = document.getElementById('returnDate').value;
            const travelers = document.getElementById('travelers').value;

            if (!destination || !departureDate || !returnDate) {
                alert('Please fill in all fields');
                return;
            }

            const statusDiv = document.getElementById('flightStatus');
            statusDiv.className = 'flight-status checking';
            statusDiv.innerHTML = '🔍 Checking flight availability...';
            statusDiv.classList.remove('hidden');
            
            document.getElementById('bookButton').disabled = true;

            try {
                const response = await fetch('/check-flights', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': currentSessionId
                    },
                    body: JSON.stringify({ destination, departureDate, returnDate, travelers })
                });
                
                if (!response.ok) {
                    throw new Error('Server returned ' + response.status + ': ' + response.statusText);
                }
                
                const result = await response.json();
                console.log('Flight check result:', result);
                
                if (result.available) {
                    statusDiv.className = 'flight-status available';
                    statusDiv.innerHTML = '✅ Flights available to ' + destination + '!<br>' +
                                          '💺 ' + result.seatsAvailable + ' seats available<br>' +
                                          '💰 Estimated price: $' + result.price;
                    currentFlightAvailable = true;
                    document.getElementById('bookButton').disabled = false;
                } else {
                    statusDiv.className = 'flight-status unavailable';
                    statusDiv.innerHTML = '❌ ' + result.message;
                    currentFlightAvailable = false;
                    document.getElementById('bookButton').disabled = true;
                }
                
            } catch (error) {
                console.error('Flight check error:', error);
                statusDiv.className = 'flight-status unavailable';
                statusDiv.innerHTML = '❌ Error checking flights: ' + error.message;
                currentFlightAvailable = false;
                document.getElementById('bookButton').disabled = true;
            }
        }

        async function bookTravel() {
            if (!currentFlightAvailable) {
                alert('Please check flight availability first!');
                return;
            }

            const booking = {
                destination: document.getElementById('destination').value,
                departureDate: document.getElementById('departureDate').value,
                returnDate: document.getElementById('returnDate').value,
                travelers: document.getElementById('travelers').value
            };

            try {
                const response = await fetch('/bookings', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': currentSessionId
                    },
                    body: JSON.stringify(booking)
                });
                
                if (response.ok) {
                    alert('🎉 Booking successful! Happy travels!');
                    document.getElementById('destination').value = '';
                    document.getElementById('departureDate').value = '';
                    document.getElementById('returnDate').value = '';
                    document.getElementById('travelers').value = '1';
                    document.getElementById('flightStatus').classList.add('hidden');
                    document.getElementById('bookButton').disabled = true;
                    currentFlightAvailable = false;
                    loadBookings();
                } else {
                    throw new Error('Failed to create booking');
                }
            } catch (error) {
                alert('Error making booking: ' + error.message);
            }
        }

        async function loadBookings() {
            try {
                const response = await fetch('/bookings', {
                    headers: {
                        'Authorization': currentSessionId
                    }
                });
                const bookings = await response.json();
                
                const bookingsHTML = bookings.map(booking => 
                    '<div class="booking">' +
                    '<strong>✈️ ' + booking.destination + '</strong><br>' +
                    '🗓️ Depart: ' + booking.departureDate + ' | Return: ' + booking.returnDate + '<br>' +
                    '👥 Travelers: ' + booking.travelers + '<br>' +
                    '<small>📅 Booked on: ' + new Date(booking.createdAt).toLocaleDateString() + '</small>' +
                    '</div>'
                ).join('');
                
                document.getElementById('bookings').innerHTML = bookingsHTML;
                document.getElementById('bookingForm').classList.add('hidden');
                document.getElementById('bookingsList').classList.remove('hidden');
            } catch (error) {
                console.error('Error loading bookings:', error);
            }
        }

        function showBookingForm() {
            document.getElementById('bookingForm').classList.remove('hidden');
            document.getElementById('bookingsList').classList.add('hidden');
        }

        function sendMessage() {
            const subject = document.getElementById('messageSubject').value;
            const content = document.getElementById('messageContent').value;
            
            if (!subject || !content) {
                alert('Please fill in both subject and message');
                return;
            }
            
            alert('Thank you for your message! We will get back to you soon.');
            document.getElementById('messageSubject').value = '';
            document.getElementById('messageContent').value = '';
        }

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('departureDate').min = today;
        document.getElementById('returnDate').min = today;

        // Load bookings when page loads
        loadBookings();
    </script>
</body>
</html>
    `);
});

// Flight availability check (protected)
app.post('/check-flights', requireAuth, (req, res) => {
    const { destination, departureDate, returnDate, travelers } = req.body;
    
    console.log('Flight check received from user:', req.user.email, { destination, departureDate, returnDate, travelers });
    
    if (!destination || !departureDate || !returnDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const destinationLower = destination.toLowerCase().trim();
    const flight = mockFlights[destinationLower];
    const requestedSeats = parseInt(travelers) || 1;
    
    setTimeout(() => {
        if (flight) {
            const seatsAvailable = flight.seats;
            const isAvailable = seatsAvailable >= requestedSeats;
            const price = flight.basePrice * requestedSeats;
            
            if (isAvailable) {
                res.json({
                    available: true,
                    seatsAvailable: seatsAvailable,
                    price: price,
                    message: 'Flights available to ' + destination
                });
            } else {
                res.json({
                    available: false,
                    message: 'Not enough seats to ' + destination + '. Only ' + seatsAvailable + ' seats left.'
                });
            }
        } else {
            const isAvailable = Math.random() > 0.3;
            const seatsAvailable = isAvailable ? Math.floor(Math.random() * 30) + 10 : 0;
            const price = isAvailable ? (Math.floor(Math.random() * 400) + 300) * requestedSeats : 0;
            
            if (isAvailable && seatsAvailable >= requestedSeats) {
                res.json({
                    available: true,
                    seatsAvailable: seatsAvailable,
                    price: price,
                    message: 'Flights available to ' + destination
                });
            } else {
                res.json({
                    available: false,
                    message: 'No flights available to ' + destination + ' for selected dates'
                });
            }
        }
    }, 800);
});

// Bookings routes (protected)
app.get('/bookings', requireAuth, (req, res) => {
    db.all('SELECT * FROM bookings WHERE user_id = ? ORDER BY createdAt DESC', [req.user.id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/bookings', requireAuth, (req, res) => {
    const { destination, departureDate, returnDate, travelers } = req.body;
    
    console.log('New booking from user:', req.user.email, { destination, departureDate, returnDate, travelers });
    
    db.run(
        'INSERT INTO bookings (user_id, destination, departureDate, returnDate, travelers) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, destination, departureDate, returnDate, travelers],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                id: this.lastID, 
                destination, 
                departureDate, 
                returnDate, 
                travelers 
            });
        }
    );
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Server is running!', 
        endpoints: ['GET /', 'GET /home', 'POST /login', 'POST /check-flights', 'GET /bookings', 'POST /bookings', 'GET /health']
    });
});

app.listen(PORT, () => {
    console.log('🚀 Travel booking app running at http://localhost:' + PORT);
    console.log('🔐 Demo login: demo@example.com / demo123');
    console.log(' Try these destinations: Paris, London, New York, Tokyo, etc.');
    console.log('🔍 Health check: http://localhost:' + PORT + '/health');
});