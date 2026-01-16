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
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Hardcoded User
const USERS = {
    'ARS-User1': '3dLS6fBWyy9fak21d',
    'ARS-User2': 'Dbf73bKW2nMWs9a',
    'ARS-User3': 'FsvI61B72kLapS9a2b',
    'ARS-User4': 'La2vMde341smWQx',
    'Hacker': 'DEATH GRIPS',
};
let activeUsers = [];

// Hardcoded Simulation Routen
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

const TRAIN_TYPES = ['RJ', 'ICE', 'REX'];

let trains = [];
let incidents = [];
let isHackActive = false;

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
    const now = Date.now();
    trains = Array.from({ length: 15 }, (_, i) => {
        const route = getRandomRoute();
        // Random start time within last 30 mins to next 30 mins
        // Note: Simulation logic below needs to handle "not started" trains if we want to get fancy,
        // but for now let's assume they are all "active" or "just started" for simplicity,
        // or we just set start times in past to ensure they are on track.
        // Let's settle on: Trains started randomly between -10 mins and +0 mins ago to ensure they are on track.
        // Duration: 200 simulation ticks (seconds) implies ~3.33 mins travel time at 1.0 speed?
        // Let's standardize: Total Route Duration = 5 minutes (300 seconds).
        const totalDurationSeconds = 3000;

        // Progress 0-100. Let's reverse calc start time from progress for existing trains to align visual to logic.
        const progress = Math.random() * 100;
        const progressSeconds = (progress / 100) * totalDurationSeconds;

        return {
            id: `TR-${1000 + i}`,
            type: TRAIN_TYPES[Math.floor(Math.random() * TRAIN_TYPES.length)],
            route: route,
            progress: progress, // 0 to 100%
            status: 'On Time', // 'On Time', 'Delayed', 'Cancelled', 'Maintenance' // Added Maintenance
            delayMinutes: 0,
            totalDelayMinutes: 0,

            // Scheduling
            totalDurationSeconds: totalDurationSeconds,
            startTime: now - (progressSeconds * 1000), // Backdate start time to match progress

            // Computed for UI (will be updated in loop)
            currentStationName: route.start,
            nextStationName: route.stations[1],
            plannedArrivalNext: 0,
            estimatedArrivalNext: 0
        };
    });
}

initTrains();

// --- Simulation Loop ---
setInterval(() => {
    if (isHackActive) return; // Stop updates during Hack

    trains.forEach(train => {
        if (train.status !== 'Cancelled' && train.status !== 'Maintenance') {
            let speed = (100 / train.totalDurationSeconds); // Calculate speed to match duration

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
                train.startTime = Date.now(); // Restart timer
            }

            // --- Update Computed Properties ---
            const stationCount = train.route.stations.length;
            // Current segment index (0 to stationCount - 2)
            const segmentIndex = Math.floor((train.progress / 100) * (stationCount - 1));
            const safeSegmentIndex = Math.min(segmentIndex, stationCount - 2);

            train.currentStationName = train.route.stations[safeSegmentIndex];
            train.nextStationName = train.route.stations[safeSegmentIndex + 1];

            // Time Calculations
            // Total Progress needed for next station (end of segment)
            const segmentProgressStep = 100 / (stationCount - 1);
            const nextStationProgress = (safeSegmentIndex + 1) * segmentProgressStep;

            // Validating: If start time is T0, Duration D.
            // Planned Arrival at Progress P = T0 + (P/100 * D)
            const msPerPercent = (train.totalDurationSeconds * 1000) / 100;
            const timeToNextStationMs = train.startTime + (nextStationProgress * msPerPercent);

            train.plannedArrivalNext = timeToNextStationMs;
            train.estimatedArrivalNext = timeToNextStationMs + (train.totalDelayMinutes * 60 * 1000);
        }
    });

    io.emit('update', { trains, incidents, isHackActive, activeUsers, allUsers: Object.keys(USERS) });
}, 1000);

// --- API Endpoints ---

app.get('/api/trains', (req, res) => {
    if (isHackActive) return res.status(503).json({ error: 'Service Unavailable' });
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
    } else if (type === 'MAINTENANCE') {
        const train = trains.find(t => t.id === targetId);
        if (train) {
            train.status = 'Maintenance';
            incidents.push({
                id: Date.now(),
                type: 'Instandhaltung',
                trainId: targetId,
                description: `Zug ${train.id} ist wegen Reperaturarbeiten im Werk`
            });
        }
    } else if (type === 'HACK') {
        isHackActive = !isHackActive; // Toggle Hack
        if (isHackActive) {
            incidents.push({
                id: Date.now(),
                type: 'Security Alert',
                trainId: 'SYSTEM',
                description: 'Oh nein... Da wurde wohl jemand gehacked! lol'
            });
        }
    }

    io.emit('update', { trains, incidents, isHackActive, activeUsers, allUsers: Object.keys(USERS) });
    res.json({ success: true, message: `Injected ${type}` });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (USERS[username] && USERS[username] === password) {
        if (!activeUsers.includes(username)) {
            activeUsers.push(username);
        }
        res.json({ success: true, username });
    } else {
        res.status(401).json({ success: false, message: 'Falsche Zugangsdaten' });
    }
});

app.post('/api/kick', (req, res) => {
    const { username } = req.body;
    activeUsers = activeUsers.filter(u => u !== username);
    // Notify all clients that a user was kicked
    io.emit('kick', { username });
    res.json({ success: true, message: `User ${username} kicked` });
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

            io.emit('update', { trains, incidents, isHackActive, activeUsers, allUsers: Object.keys(USERS) });
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
    isHackActive = false;
    io.emit('update', { trains, incidents, isHackActive, activeUsers, allUsers: Object.keys(USERS) });
    res.json({ success: true, message: 'System Reset' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`ARAMIS Simulation Server running on port ${PORT}`);
});
