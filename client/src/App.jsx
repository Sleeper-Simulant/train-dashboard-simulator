import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import io from 'socket.io-client';
import TrainTable from './components/TrainTable';
import ZUVTable from './components/ZUVTable';
import SollIstTable from './components/SollIstTable';
import AdminPanel from './components/AdminPanel';

const socket = io('http://localhost:3001');

function App() {
    const [trains, setTrains] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [isHackActive, setIsHackActive] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [currentView, setCurrentView] = useState('SSP');

    useEffect(() => {
        socket.on('connect', () => setConnectionStatus('Connected'));
        socket.on('disconnect', () => setConnectionStatus('Disconnected'));
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
        }).catch(err => console.error("Inject failed", err));
    };

    const handleCancelDelay = (trainId) => {
        fetch('http://localhost:3001/api/cancel-delay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trainId })
        }).catch(err => console.error("Cancel delay failed", err));
    };

    // Shared Header Component (No Admin Toggle)
    const Header = ({ titleSuffix }) => (
        <header className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">ARS <span className="text-blue-600">Live</span> {titleSuffix}</h1>
                <p className="text-gray-600">Echtzeit-Zugverfolgungssystem</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <span className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {connectionStatus === 'Connected' ? 'Verbunden' : 'Getrennt'}
            </div>
        </header>
    );

    return (
        <Router>
            <div className="min-h-screen bg-gray-100 p-8 font-sans">
                <Routes>
                    {/* PUBLIC USER ROUTE */}
                    <Route path="/" element={
                        <main className="max-w-7xl mx-auto space-y-8">
                            <Header titleSuffix="" />
                            
                            {isHackActive ? (
                                <div className="bg-red-600 text-white p-8 rounded-lg shadow-lg text-center">
                                    <p className="font-bold text-2xl mb-4">Oh nein... Da wurde wohl jemand gehacked! lol</p>
                                    <img src="/troll.jpg" alt="Hack Error" className="mx-auto max-w-2xl w-full rounded-lg shadow-xl" />
                                </div>
                            ) : (
                                <>
                                    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Vorfallprotokoll</h2>
                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                            {incidents.length === 0 && <p className="text-gray-500 italic">Keine aktiven Vorfälle.</p>}
                                            {incidents.slice().reverse().map(inc => (
                                                <div key={inc.id} className="flex items-start gap-3 text-sm p-2 border-b last:border-0">
                                                    <span className="font-mono text-gray-400">{new Date(inc.id).toLocaleTimeString()}</span>
                                                    <span className={`font-bold ${inc.type === 'Security Alert' ? 'text-red-600' : 'text-yellow-600'}`}>{inc.type === 'Security Alert' ? 'Sicherheitswarnung' : 'Meldung'}:</span>
                                                    <span className="text-gray-700">{inc.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <div className="flex border-b border-gray-200 mb-6">
                                        {['SSP', 'ZUV', 'SIA'].map(view => (
                                            <button key={view} className={`px-4 py-2 font-medium text-sm ${currentView === view ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`} onClick={() => setCurrentView(view)}>
                                                {view === 'SSP' ? 'Streckenspiegel' : view === 'ZUV' ? 'Zugverzeichnis' : 'Soll-Ist-Abweichung'}
                                            </button>
                                        ))}
                                    </div>

                                    {currentView === 'SSP' && <TrainTable trains={trains} isAdmin={false} />}
                                    {currentView === 'ZUV' && <ZUVTable trains={trains} />}
                                    {currentView === 'SIA' && <SollIstTable trains={trains} />}
                                </>
                            )}
                        </main>
                    } />

                    {/* HIDDEN ADMIN ROUTE */}
                    <Route path="/admin-control-center" element={
                        <main className="max-w-7xl mx-auto space-y-8">
                            <Header titleSuffix="(Admin)" />
                            <AdminPanel trains={trains} isHackActive={isHackActive} onInject={handleInject} />
                            <div className="mt-8">
                                <h2 className="text-xl font-semibold mb-4">Live-Vorschau</h2>
                                <TrainTable trains={trains} isAdmin={true} onCancelDelay={handleCancelDelay} />
                            </div>
                        </main>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;