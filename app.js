const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database(':memory:');

// Create table
db.serialize(() => {
    db.run(`
        CREATE TABLE bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            destination TEXT NOT NULL,
            departureDate TEXT NOT NULL,
            returnDate TEXT NOT NULL,
            travelers INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
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

// Flight availability check
app.post('/check-flights', (req, res) => {
    const { destination, departureDate, returnDate, travelers } = req.body;
    
    console.log('Flight check received:', { destination, departureDate, returnDate, travelers });
    
    if (!destination || !departureDate || !returnDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const destinationLower = destination.toLowerCase().trim();
    const flight = mockFlights[destinationLower];
    const requestedSeats = parseInt(travelers) || 1;
    
    // Simulate API delay
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
                    message: `Flights available to ${destination}`
                });
            } else {
                res.json({
                    available: false,
                    message: `Not enough seats to ${destination}. Only ${seatsAvailable} seats left.`
                });
            }
        } else {
            // For unknown destinations
            const isAvailable = Math.random() > 0.3;
            const seatsAvailable = isAvailable ? Math.floor(Math.random() * 30) + 10 : 0;
            const price = isAvailable ? (Math.floor(Math.random() * 400) + 300) * requestedSeats : 0;
            
            if (isAvailable && seatsAvailable >= requestedSeats) {
                res.json({
                    available: true,
                    seatsAvailable: seatsAvailable,
                    price: price,
                    message: `Flights available to ${destination}`
                });
            } else {
                res.json({
                    available: false,
                    message: `No flights available to ${destination} for selected dates`
                });
            }
        }
    }, 800);
});

// Bookings routes
app.get('/bookings', (req, res) => {
    db.all('SELECT * FROM bookings ORDER BY createdAt DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/bookings', (req, res) => {
    const { destination, departureDate, returnDate, travelers } = req.body;
    
    console.log('New booking:', { destination, departureDate, returnDate, travelers });
    
    db.run(
        'INSERT INTO bookings (destination, departureDate, returnDate, travelers) VALUES (?, ?, ?, ?)',
        [destination, departureDate, returnDate, travelers],
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

// Serve the HTML page
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Travel Booking</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #87CEEB, #B0E0E6); 
            padding: 20px;
            min-height: 100vh;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #2c3e50; 
            margin-bottom: 25px; 
            text-align: center;
            font-size: 2.2em;
        }
        .form-group { margin-bottom: 20px; }
        label { 
            display: block; 
            margin-bottom: 8px; 
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
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 10px;
            border-left: 5px solid #3498db;
        }
        .hidden { display: none; }
        .flight-status {
            padding: 15px;
            margin: 15px 0;
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
            gap: 15px;
        }
        .success { background: #27ae60; }
        .secondary { background: #e74c3c; }
        @media (max-width: 600px) {
            .date-group {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌍 Simple Travel Booking</h1>
        
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

    <script>
        let currentFlightAvailable = false;

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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ destination, departureDate, returnDate, travelers })
                });
                
                if (!response.ok) {
                    throw new Error(\`Server returned \${response.status}: \${response.statusText}\`);
                }
                
                const result = await response.json();
                console.log('Flight check result:', result);
                
                if (result.available) {
                    statusDiv.className = 'flight-status available';
                    statusDiv.innerHTML = \`✅ Flights available to \${destination}!<br>
                                          💺 \${result.seatsAvailable} seats available<br>
                                          💰 Estimated price: $\${result.price}\`;
                    currentFlightAvailable = true;
                    document.getElementById('bookButton').disabled = false;
                } else {
                    statusDiv.className = 'flight-status unavailable';
                    statusDiv.innerHTML = \`❌ \${result.message}\`;
                    currentFlightAvailable = false;
                    document.getElementById('bookButton').disabled = true;
                }
                
            } catch (error) {
                console.error('Flight check error:', error);
                statusDiv.className = 'flight-status unavailable';
                statusDiv.innerHTML = \`❌ Error checking flights: \${error.message}<br>
                                      🔧 Make sure the server is running properly\`;
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
                    headers: { 'Content-Type': 'application/json' },
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
                const response = await fetch('/bookings');
                const bookings = await response.json();
                
                const bookingsHTML = bookings.map(booking => \`
                    <div class="booking">
                        <strong>✈️ \${booking.destination}</strong><br>
                        🗓️ Depart: \${booking.departureDate} | Return: \${booking.returnDate}<br>
                        👥 Travelers: \${booking.travelers}<br>
                        <small>📅 Booked on: \${new Date(booking.createdAt).toLocaleDateString()}</small>
                    </div>
                \`).join('');
                
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

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Server is running!', 
        endpoints: ['GET /', 'POST /check-flights', 'GET /bookings', 'POST /bookings', 'GET /health']
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Travel booking app running at http://localhost:${PORT}`);
    console.log(`✈️ Try these destinations: Paris, London, New York, Tokyo, etc.`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});