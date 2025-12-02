const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in this exercise
        methods: ["GET", "POST"]
    }
});

// --- Simulation State ---
const ROUTES = [
    ['Wien Hbf', 'St. Pölten Hbf', 'Linz Hbf', 'Salzburg Hbf'],
    ['Graz Hbf', 'Bruck an der Mur', 'Leoben Hbf', 'Kapfenberg'],
    ['Innsbruck Hbf', 'Wörgl Hbf', 'Kufstein', 'Rosenheim'],
    ['Wien Westbahnhof', 'Wien Meidling', 'Baden bei Wien', 'Wiener Neustadt'],
    ['Salzburg Hbf', 'Bischofshofen', 'Zell am See', 'Saalfelden'],
    ['Villach Hbf', 'Klagenfurt Hbf', 'Wolfsberg', 'Graz Hbf'],
    ['Linz Hbf', 'Wels Hbf', 'Attnang-Puchheim', 'Salzburg Hbf'],
    ['Wien Hbf', 'Wiener Neustadt', 'Mürzzuschlag', 'Bruck an der Mur', 'Graz Hbf'],
    ['Innsbruck Hbf', 'Jenbach', 'Schwaz', 'Wörgl Hbf'],
    ['St. Pölten Hbf', 'Amstetten', 'Steyr', 'Linz Hbf'],
    ['Feldkirch', 'Bludenz', 'Landeck-Zams', 'Innsbruck Hbf'],
    ['Wien Hbf', 'Hütteldorf', 'St. Pölten Hbf', 'Amstetten']
];

const TRAIN_TYPES = ['RJ', 'ICE', 'REX', 'S-Bahn'];

let trains = [];
let incidents = [];
let isDosActive = false;

// Helper to pick a random route from the predefined list
function getRandomRoute() {
    const routeStations = ROUTES[Math.floor(Math.random() * ROUTES.length)];
    return {
        start: routeStations[0],
        end: routeStations[routeStations.length - 1],
        stations: routeStations
    };
}

// Initialize some trains
function initTrains() {
    trains = Array.from({ length: 10 }, (_, i) => ({
        id: `TR-${100 + i}`,
        type: TRAIN_TYPES[Math.floor(Math.random() * TRAIN_TYPES.length)],
        route: getRandomRoute(),
        progress: Math.random() * 100, // 0 to 100%
        status: 'On Time', // 'On Time', 'Delayed', 'Cancelled'
        delayMinutes: 0,
        totalDelayMinutes: 0 // Track accumulated delay
    }));
}

initTrains();

// --- Simulation Loop ---
setInterval(() => {
    if (isDosActive) return; // Stop updates during DoS

    trains.forEach(train => {
        if (train.status !== 'Cancelled') {
            let speed = 0.5; // Base speed

            // Handle Delay
            if (train.delayMinutes > 0) {
                speed = 0; // Stop the train
                train.status = 'Delayed';

                // Count down delay. 
                // 1 minute delay = 60 real seconds
                const delta = 1 / 60;
                train.delayMinutes -= delta;
                train.totalDelayMinutes += delta; // Increment total delay as it passes

                if (train.delayMinutes <= 0) {
                    train.delayMinutes = 0;
                    train.status = 'On Time'; // Resume normal status

                    // Log the expiration
                    incidents.push({
                        id: Date.now(),
                        type: 'Delay Update',
                        trainId: train.id,
                        description: `Verspätung für ${train.id} wurde aufgehoben.`
                    });
                }
            } else {
                // Ensure status is correct if not delayed
                if (train.status === 'Delayed') {
                    train.status = 'On Time';
                }
            }

            train.progress += speed;

            // Reset if reached destination
            if (train.progress >= 100) {
                train.progress = 0;
                train.route = getRandomRoute();
                train.status = 'On Time';
                train.delayMinutes = 0;
                train.totalDelayMinutes = 0; // Reset total delay for new route
            }
        }
    });

    io.emit('update', { trains, incidents, isDosActive });
}, 1000);

// --- API Endpoints ---

app.get('/api/trains', (req, res) => {
    if (isDosActive) return res.status(503).json({ error: 'Service Unavailable' });
    res.json(trains);
});

app.post('/api/inject', (req, res) => {
    const { type, targetId, value, message } = req.body;

    console.log(`Inject received: ${type} on ${targetId} with value ${value}`);

    if (type === 'DELAY') {
        const train = trains.find(t => t.id === targetId);
        if (train) {
            train.status = 'Delayed';
            const delayVal = value || 10;
            train.delayMinutes += delayVal;
            // Total delay is now accumulated in the loop, not here.

            // Build description with optional message
            const baseDescription = `${train.id} (${train.route.start} → ${train.route.end}) verspätet sich`;
            const description = message && message.trim()
                ? `${baseDescription} aufgrund ${message}!`
                : `${baseDescription}!`;

            // Add to incidents list if not already there
            if (!incidents.find(i => i.trainId === targetId)) {
                incidents.push({
                    id: Date.now(),
                    type: 'Delay',
                    trainId: targetId,
                    description: description
                });
            } else {
                // Update existing incident description or add new one? 
                // Let's add a new one for history tracking
                incidents.push({
                    id: Date.now(),
                    type: 'Delay Update',
                    trainId: targetId,
                    description: description
                });
            }
        }
    } else if (type === 'DOS') {
        isDosActive = !isDosActive; // Toggle DoS
        if (isDosActive) {
            incidents.push({
                id: Date.now(),
                type: 'Security Alert',
                trainId: 'SYSTEM',
                description: 'Hohe Anfragemenge erkannt. Möglicher Denial of Service.'
            });
        }
    }

    io.emit('update', { trains, incidents, isDosActive });
    res.json({ success: true, message: `Injected ${type}` });
});

app.post('/api/cancel-delay', (req, res) => {
    const { trainId } = req.body;
    const train = trains.find(t => t.id === trainId);

    if (train) {
        // Only cancel if it is actually delayed
        if (train.delayMinutes > 0) {
            train.delayMinutes = 0;
            train.status = 'On Time';

            // Log the cancellation
            incidents.push({
                id: Date.now(),
                type: 'Delay Update',
                trainId: trainId,
                description: `${train.id} (${train.route.start} → ${train.route.end}) fährt wieder.`
            });

            io.emit('update', { trains, incidents, isDosActive });
            res.json({ success: true, message: `Delay cancelled for ${trainId}` });
        } else {
            res.json({ success: false, message: `Train ${trainId} is not delayed` });
        }
    } else {
        res.status(404).json({ error: 'Train not found' });
    }
});

app.post('/api/reset', (req, res) => {
    initTrains();
    incidents = [];
    isDosActive = false;
    io.emit('update', { trains, incidents, isDosActive });
    res.json({ success: true, message: 'System Reset' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`ARAMIS Simulation Server running on port ${PORT}`);
});
