import React, { useState } from 'react';

const AdminPanel = ({ trains, isHackActive, onInject, activeUsers, onKick }) => {
    const [selectedTrain, setSelectedTrain] = useState('');
    const [maintenanceTrain, setMaintenanceTrain] = useState('');
    const [delayValue, setDelayValue] = useState(10);
    const [delayMessage, setDelayMessage] = useState('');

    const handleDelayInject = () => {
        if (!selectedTrain) return;
        onInject('DELAY', selectedTrain, parseInt(delayValue), delayMessage);
        setDelayMessage(''); // Clear message after inject
    };

    const handleHackToggle = () => {
        onInject('HACK', 'SYSTEM', 0);
    };

    const handleReset = () => {
        fetch('http://localhost:3001/api/reset', { method: 'POST' })
            .then(res => res.json())
            .then(data => console.log(data.message));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Admin-Kontrollpanel (Injects)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delay Inject */}
                <div className="p-4 border rounded bg-gray-50">
                    <h3 className="font-semibold mb-2">Verspätung einfügen</h3>
                    <div className="space-y-3">
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedTrain}
                            onChange={(e) => setSelectedTrain(e.target.value)}
                        >
                            <option value="">Zug auswählen...</option>
                            {trains.map(t => (
                                <option key={t.id} value={t.id}>{t.id} ({t.route.start} - {t.route.end})</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            className="w-full p-2 border rounded"
                            value={delayValue}
                            onChange={(e) => setDelayValue(e.target.value)}
                            placeholder="Minuten"
                        />
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={delayMessage}
                            onChange={(e) => setDelayMessage(e.target.value)}
                            placeholder="Grund (Zug verspätet sich aufgrund ... !)"
                        />
                        <button
                            onClick={handleDelayInject}
                            disabled={!selectedTrain}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            Verspätung einfügen
                        </button>
                    </div>
                </div>

                {/* Maintenance Inject */}
                <div className="p-4 border rounded bg-gray-50">
                    <h3 className="font-semibold mb-2">Wartung / Zug entfernen</h3>
                    <p className="text-sm text-gray-600 mb-4">Entfernt einen Zug von der Strecke für Reparaturen.</p>
                    <div className="space-y-3">
                        <select
                            className="w-full p-2 border rounded"
                            value={maintenanceTrain}
                            onChange={(e) => setMaintenanceTrain(e.target.value)}
                        >
                            <option value="">Zug auswählen...</option>
                            {trains.map(t => (
                                <option key={t.id} value={t.id}>{t.id} ({t.route.start} - {t.route.end})</option>
                            ))}
                        </select>
                        <button
                            onClick={() => {
                                if (maintenanceTrain) {
                                    onInject('MAINTENANCE', maintenanceTrain, 0, '');
                                    setMaintenanceTrain('');
                                }
                            }}
                            disabled={!maintenanceTrain}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            In Wartung senden
                        </button>
                    </div>
                </div>

                {/* User Management Section */}
                <div className="p-4 border rounded bg-gray-50 md:col-span-2">
                    <h3 className="font-semibold mb-2">Benutzerverwaltung</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['user1', 'user2', 'user3'].map(username => {
                            const isOnline = activeUsers.includes(username);
                            return (
                                <div key={username} className="flex flex-col p-3 bg-white border rounded shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold">{username}</span>
                                        <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    </div>
                                    <button
                                        onClick={() => onKick(username)}
                                        disabled={!isOnline}
                                        className="text-xs bg-red-100 text-red-700 py-1 rounded hover:bg-red-200 disabled:opacity-30"
                                    >
                                        Sitzung beenden (Kick)
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Hack Attack */}
                <div className="p-4 border rounded bg-gray-50">
                    <h3 className="font-semibold mb-2">Hackerangriff</h3>
                    <p className="text-sm text-gray-600 mb-4">Simuliere einen gelungenen Hackerangriff.</p>
                    <button
                        onClick={handleHackToggle}
                        className={`w-full font-bold py-2 px-4 rounded ${isHackActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-800 hover:bg-gray-900 text-white'}`}
                    >
                        {isHackActive ? 'Hackerangriff beenden' : 'Hacken'}
                    </button>
                </div>

                {/* System Reset */}
                <div className="p-4 border rounded bg-gray-50">
                    <h3 className="font-semibold mb-2">Systemverwaltung</h3>
                    <p className="text-sm text-gray-600 mb-4">Setze die Simulation auf den Ausgangszustand zurück.</p>
                    <button
                        onClick={handleReset}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        System zurücksetzen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
