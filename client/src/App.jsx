import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import TrainTable from './components/TrainTable';
import ZUVTable from './components/ZUVTable';
import SollIstTable from './components/SollIstTable';
import AdminPanel from './components/AdminPanel';

// Connect to the backend
const socket = io('http://localhost:3001');

function App() {
    const [trains, setTrains] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [isHackActive, setIsHackActive] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [isAdmin, setIsAdmin] = useState(false); // Simple toggle for view
    const [currentView, setCurrentView] = useState('SSP'); // 'SSP' (Streckenspiegel), 'ZUV' (Zugverzeichnis), 'SIA' (Soll-Ist)

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
            setIsHackActive(data.isHackActive);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('update');
        };
    }, []);

    const handleInject = (type, targetId, value, message) => {
        fetch('http://localhost:3001/api/inject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, targetId, value, message })
        }).then(res => res.json())
            .then(data => console.log(data.message))
            .catch(err => console.error("Inject failed", err));
    };

    const handleCancelDelay = (trainId) => {
        fetch('http://localhost:3001/api/cancel-delay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trainId })
        }).then(res => res.json())
            .then(data => console.log(data.message))
            .catch(err => console.error("Cancel delay failed", err));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">ARS <span className="text-blue-600">Live</span></h1>
                    <p className="text-gray-600">Echtzeit-Zugverfolgungssystem</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {connectionStatus === 'Connected' ? 'Verbunden' : 'Getrennt'}
                    </div>
                    <button
                        onClick={() => setIsAdmin(!isAdmin)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        {isAdmin ? 'Zur Benutzeransicht' : 'Zur Admin-Ansicht'}
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-8">

                {/* Hack State - Show only error message when active */}
                {isHackActive && !isAdmin && (
                    <div className="bg-red-600 text-white p-8 rounded-lg shadow-lg text-center">
                        <p className="font-bold text-2xl mb-4">Oh nein... Da wurde wohl jemand gehacked! lol</p>
                        <img
                            src="/troll.jpg"
                            alt="Hack Error"
                            className="mx-auto max-w-2xl w-full rounded-lg shadow-xl"
                        />
                    </div>
                )}

                {/* Admin Panel */}
                {isAdmin && (
                    <AdminPanel
                        trains={trains}
                        isHackActive={isHackActive}
                        onInject={handleInject}
                    />
                )}

                {/* Only show these sections if hack is NOT active or if user is admin */}
                {(!isHackActive || isAdmin) && (
                    <>
                        {/* Incidents Log (Visible to all for monitoring) */}
                        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Vorfallprotokoll</h2>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {incidents.length === 0 && <p className="text-gray-500 italic">Keine aktiven Vorfälle.</p>}
                                {incidents.slice().reverse().map(inc => (
                                    <div key={inc.id} className="flex items-start gap-3 text-sm p-2 border-b last:border-0">
                                        <span className="font-mono text-gray-400">{new Date(inc.id).toLocaleTimeString()}</span>
                                        <span className={`font-bold ${inc.type === 'Security Alert' ? 'text-red-600' : 'text-yellow-600'}`}>{inc.type === 'Security Alert' ? 'Sicherheitswarnung' : inc.type === 'Delay' ? 'Verspätung' : 'Verspätungs-Update'}:</span>
                                        <span className="text-gray-700">{inc.description}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* View Selection Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                className={`px-4 py-2 font-medium text-sm transition-colors ${currentView === 'SSP' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setCurrentView('SSP')}
                            >
                                Streckenspiegel (SSP)
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm transition-colors ${currentView === 'ZUV' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setCurrentView('ZUV')}
                            >
                                Zugverzeichnis (ZUV)
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm transition-colors ${currentView === 'SIA' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setCurrentView('SIA')}
                            >
                                Soll-Ist-Abweichung (SIA)
                            </button>
                        </div>

                        {/* Train Tables */}
                        <section>
                            {currentView === 'SSP' && (
                                <>
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Streckenspiegel</h2>
                                    <TrainTable trains={trains} isAdmin={isAdmin} onCancelDelay={handleCancelDelay} />
                                </>
                            )}
                            {currentView === 'ZUV' && (
                                <>
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Zugverzeichnis (ZUV)</h2>
                                    <ZUVTable trains={trains} />
                                </>
                            )}
                            {currentView === 'SIA' && (
                                <>
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Soll-Ist-Abweichung (SIA)</h2>
                                    <SollIstTable trains={trains} />
                                </>
                            )}
                        </section>
                    </>
                )}

            </main>
        </div>
    );
}

export default App;
