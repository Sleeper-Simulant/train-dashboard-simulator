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
const STATIONS = ['Wien Hbf', 'St. Pölten', 'Linz Hbf', 'Salzburg Hbf', 'Innsbruck Hbf'];
const TRAIN_TYPES = ['RJ', 'ICE', 'REX', 'S-Bahn'];

let trains = [];
let incidents = [];
let isDosActive = false;

// Initialize some trains
function initTrains() {
    trains = Array.from({ length: 10 }, (_, i) => ({
        id: `TR-${100 + i}`,
        type: TRAIN_TYPES[Math.floor(Math.random() * TRAIN_TYPES.length)],
        route: {
            start: STATIONS[Math.floor(Math.random() * STATIONS.length)],
            end: STATIONS[Math.floor(Math.random() * STATIONS.length)]
        },
        progress: Math.random() * 100, // 0 to 100%
        status: 'On Time', // 'On Time', 'Delayed', 'Cancelled'
        delayMinutes: 0,
        totalDelayMinutes: 0 // Track accumulated delay
    })).filter(t => t.route.start !== t.route.end);
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
                train.delayMinutes -= (1 / 60);

                if (train.delayMinutes <= 0) {
                    train.delayMinutes = 0;
                    train.status = 'On Time'; // Resume normal status
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
                // Pick new random route
                const start = train.route.end;
                let end = STATIONS[Math.floor(Math.random() * STATIONS.length)];
                while (end === start) {
                    end = STATIONS[Math.floor(Math.random() * STATIONS.length)];
                }
                train.route = { start, end };
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
    const { type, targetId, value } = req.body;

    console.log(`Inject received: ${type} on ${targetId} with value ${value}`);

    if (type === 'DELAY') {
        const train = trains.find(t => t.id === targetId);
        if (train) {
            train.status = 'Delayed';
            const delayVal = value || 10;
            train.delayMinutes += delayVal;
            train.totalDelayMinutes += delayVal; // Accumulate total delay

            // Add to incidents list if not already there
            if (!incidents.find(i => i.trainId === targetId)) {
                incidents.push({
                    id: Date.now(),
                    type: 'Delay',
                    trainId: targetId,
                    description: `Delay of ${delayVal} min detected.`
                });
            } else {
                // Update existing incident description or add new one? 
                // Let's add a new one for history tracking
                incidents.push({
                    id: Date.now(),
                    type: 'Delay Update',
                    trainId: targetId,
                    description: `Additional delay of ${delayVal} min.`
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
                description: 'High traffic load detected. Possible DoS attack.'
            });
        }
    }

    io.emit('update', { trains, incidents, isDosActive });
    res.json({ success: true, message: `Injected ${type}` });
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
