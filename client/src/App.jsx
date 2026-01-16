import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import io from 'socket.io-client';
import TrainTable from './components/TrainTable';
import ZUVTable from './components/ZUVTable';
import SollIstTable from './components/SollIstTable';
import AdminPanel from './components/AdminPanel';

const socket = io('http://localhost:3001');

// Simple Login Component
function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) onLogin(data.username);
                else setError(data.message);
            });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">ARS Login</h2>
                {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}
                <div className="space-y-4">
                    <input className="w-full p-2 border rounded" placeholder="Benutzername" value={username} onChange={e => setUsername(e.target.value)} required />
                    <input className="w-full p-2 border rounded" type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">Anmelden</button>
                </div>
            </form>
        </div>
    );
}

function App() {
    const [trains, setTrains] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [isHackActive, setIsHackActive] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [currentView, setCurrentView] = useState('SSP');

    // Authentifizierung
    const [currentUser, setCurrentUser] = useState(localStorage.getItem('user') || null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        socket.on('connect', () => setConnectionStatus('Connected'));
        socket.on('disconnect', () => setConnectionStatus('Disconnected'));
        socket.on('update', (data) => {
            setTrains(data.trains);
            setIncidents(data.incidents);
            setIsHackActive(data.isHackActive);
            setActiveUsers(data.activeUsers || []); // aktive userliste
            setAllUsers(data.allUsers || []); // alle registrierten user
        });

        // User kicken
        socket.on('kick', (data) => {
            if (data.username === currentUser) {
                setCurrentUser(null);
                localStorage.removeItem('user');
                alert('Unbekannter Fehler.'); // Kick Popup Nachricht
            }
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('update');
            socket.off('kick');
        };
    }, [currentUser]);

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

    const handleLogin = (user) => {
        setCurrentUser(user);
        localStorage.setItem('user', user);
    };

    const handleKick = (username) => {
        fetch('http://localhost:3001/api/kick', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        }).catch(err => console.error("Kick failed", err));
    };

    // Shared Header Component, admin panel weg
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
                        !currentUser ? <Login onLogin={handleLogin} /> : (
                            <main className="max-w-7xl mx-auto space-y-8">
                                <Header titleSuffix="" />

                                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <span className="text-blue-800">Angemeldet als: <strong>{currentUser}</strong></span>
                                    <button onClick={() => { setCurrentUser(null); localStorage.removeItem('user'); }} className="text-sm text-blue-600 underline">Abmelden</button>
                                </div>

                                {isHackActive ? (
                                    <div className="bg-red-600 text-white p-8 rounded-lg shadow-lg text-center">
                                        <p className="font-bold text-2xl mb-4">Oh nein... Da wurde wohl jemand gehacked! lol</p>
                                        <img src="/troll.jpg" alt="Hack Error" className="mx-auto max-w-2xl w-full rounded-lg shadow-xl" />
                                    </div>
                                ) : (
                                    <>
                                        {/* Tab Navigation Menu */}
                                        <div className="flex border-b border-gray-200 mb-6">
                                            {['SSP', 'ZUV', 'SIA'].map(view => (
                                                <button 
                                                    key={view} 
                                                    className={`px-4 py-2 font-medium text-sm transition-colors ${currentView === view ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`} 
                                                    onClick={() => setCurrentView(view)}
                                                >
                                                    {view === 'SSP' ? 'Streckenspiegel' : view === 'ZUV' ? 'Zugverzeichnis' : 'Soll-Ist-Abweichung'}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Main Content Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                            {/* Left Column: Tables (Spans 3/4 of the width) */}
                                            <div className="lg:col-span-3 space-y-6">
                                                {currentView === 'SSP' && <TrainTable trains={trains} isAdmin={false} />}
                                                {currentView === 'ZUV' && <ZUVTable trains={trains} />}
                                                {currentView === 'SIA' && <SollIstTable trains={trains} />}
                                            </div>

                                            {/* Right Column: Incident Log (Spans 1/4 of the width) */}
                                            <aside className="lg:col-span-1">
                                                <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-8">
                                                    <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                                        Vorfallprotokoll
                                                    </h2>
                                                    <div className="max-h-[calc(100vh-300px)] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                                        {incidents.length === 0 && <p className="text-gray-500 italic text-sm">Keine aktiven Vorfälle.</p>}
                                                        {incidents.slice().reverse().map(inc => (
                                                            <div key={inc.id} className="flex flex-col gap-1 text-xs p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                                                                <div className="flex justify-between items-center">
                                                                    <span className={`font-bold ${inc.type === 'Security Alert' ? 'text-red-600' : 'text-blue-600'}`}>{inc.type === 'Security Alert' ? 'WARNUNG' : 'INFO'}</span>
                                                                    <span className="font-mono text-gray-400">{new Date(inc.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                                <span className="text-gray-700 leading-relaxed">{inc.description}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            </aside>
                                        </div>
                                    </>
                                )}
                            </main>
                        )
                    } />

                    {/* HIDDEN ADMIN ROUTE */}
                    <Route path="/admin-control-center" element={
                        <main className="max-w-7xl mx-auto space-y-8">
                            <Header titleSuffix="(Admin)" />
                            <AdminPanel
                                trains={trains}
                                isHackActive={isHackActive}
                                onInject={handleInject}
                                activeUsers={activeUsers}
                                allUsers={allUsers}
                                onKick={handleKick}
                            />
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