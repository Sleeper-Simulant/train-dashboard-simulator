import React, { useState } from 'react';

const AdminPanel = ({ trains, isHackActive, onInject }) => {
    const [selectedTrain, setSelectedTrain] = useState('');
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
