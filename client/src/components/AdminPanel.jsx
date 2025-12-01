import React, { useState } from 'react';

const AdminPanel = ({ trains, isDosActive, onInject }) => {
    const [selectedTrain, setSelectedTrain] = useState('');
    const [delayValue, setDelayValue] = useState(10);

    const handleDelayInject = () => {
        if (!selectedTrain) return;
        onInject('DELAY', selectedTrain, parseInt(delayValue));
    };

    const handleDosToggle = () => {
        onInject('DOS', 'SYSTEM', 0);
    };

    const handleReset = () => {
        // We'll handle reset via a special inject type or separate prop, but for now let's use a fetch call directly in App or pass a handler.
        // Let's assume onInject handles it or we pass a separate prop. 
        // Actually, let's just make onInject generic enough or add a specific handler.
        // For simplicity, let's assume the parent handles "RESET" type if we send it, or we can just fetch directly here.
        // But to keep it clean, let's use a separate fetch in the parent or a specific callback.
        // Let's assume the parent passed a `onReset` prop, or we just use `fetch` here for simplicity as it's an admin action.
        fetch('http://localhost:3001/api/reset', { method: 'POST' })
            .then(res => res.json())
            .then(data => console.log(data.message));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Admin Control Panel (Injects)</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Delay Inject */}
                <div className="p-4 border rounded bg-gray-50">
                    <h3 className="font-semibold mb-2">Inject Delay</h3>
                    <div className="space-y-3">
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedTrain}
                            onChange={(e) => setSelectedTrain(e.target.value)}
                        >
                            <option value="">Select Train...</option>
                            {trains.map(t => (
                                <option key={t.id} value={t.id}>{t.id} ({t.route.start} - {t.route.end})</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            className="w-full p-2 border rounded"
                            value={delayValue}
                            onChange={(e) => setDelayValue(e.target.value)}
                            placeholder="Minutes"
                        />
                        <button
                            onClick={handleDelayInject}
                            disabled={!selectedTrain}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            Inject Delay
                        </button>
                    </div>
                </div>

                {/* DoS Attack */}
                <div className="p-4 border rounded bg-gray-50">
                    <h3 className="font-semibold mb-2">Network Attack</h3>
                    <p className="text-sm text-gray-600 mb-4">Simulate a Denial of Service attack on the tracking system.</p>
                    <button
                        onClick={handleDosToggle}
                        className={`w-full font-bold py-2 px-4 rounded ${isDosActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-800 hover:bg-gray-900 text-white'}`}
                    >
                        {isDosActive ? 'STOP DoS Attack' : 'START DoS Simulation'}
                    </button>
                </div>

                {/* System Reset */}
                <div className="p-4 border rounded bg-gray-50">
                    <h3 className="font-semibold mb-2">System Management</h3>
                    <p className="text-sm text-gray-600 mb-4">Reset the simulation to its initial state.</p>
                    <button
                        onClick={handleReset}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Reset System
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
