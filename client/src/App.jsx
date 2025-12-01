import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import TrainTable from './components/TrainTable';
import AdminPanel from './components/AdminPanel';

// Connect to the backend
const socket = io('http://localhost:3001');

function App() {
    const [trains, setTrains] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [isDosActive, setIsDosActive] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [isAdmin, setIsAdmin] = useState(false); // Simple toggle for view

    useEffect(() => {
        socket.on('connect', () => {
            setConnectionStatus('Connected');
        });

        socket.on('disconnect', () => {
            setConnectionStatus('Disconnected');
        });

        socket.on('update', (data) => {
            setTrains(data.trains);
            setIncidents(data.incidents);
            setIsDosActive(data.isDosActive);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('update');
        };
    }, []);

    const handleInject = (type, targetId, value) => {
        fetch('http://localhost:3001/api/inject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, targetId, value })
        }).then(res => res.json())
            .then(data => console.log(data.message))
            .catch(err => console.error("Inject failed", err));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">ARAMIS <span className="text-blue-600">Live</span></h1>
                    <p className="text-gray-600">Real-time Train Tracking System</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {connectionStatus}
                    </div>
                    <button
                        onClick={() => setIsAdmin(!isAdmin)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {isAdmin ? 'Switch to User View' : 'Switch to Admin View'}
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-8">

                {/* Status Banner for DoS */}
                {isDosActive && (
                    <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg animate-pulse text-center font-bold text-xl">
                        ⚠️ CRITICAL SYSTEM ALERT: NETWORK INSTABILITY DETECTED ⚠️
                    </div>
                )}
                
                {/* Admin Panel */}
                {isAdmin && (
                    <AdminPanel
                        trains={trains}
                        isDosActive={isDosActive}
                        onInject={handleInject}
                    />
                )}

                {/* Incidents Log (Visible to all for monitoring) */}
                <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Incident Log</h2>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                        {incidents.length === 0 && <p className="text-gray-500 italic">No active incidents.</p>}
                        {incidents.slice().reverse().map(inc => (
                            <div key={inc.id} className="flex items-start gap-3 text-sm p-2 border-b last:border-0">
                                <span className="font-mono text-gray-400">{new Date(inc.id).toLocaleTimeString()}</span>
                                <span className={`font-bold ${inc.type === 'Security Alert' ? 'text-red-600' : 'text-yellow-600'}`}>{inc.type}:</span>
                                <span className="text-gray-700">{inc.description}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Train Table */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Trains</h2>
                    <TrainTable trains={trains} isAdmin={isAdmin} />
                </section>



            </main>
        </div>
    );
}

export default App;
