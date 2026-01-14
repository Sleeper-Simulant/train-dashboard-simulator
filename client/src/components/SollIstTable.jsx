import React from 'react';

const SollIstTable = ({ trains }) => {
    const formatTime = (ms) => {
        if (!ms) return '--:--';
        return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zugnummer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zielbahnhof</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Geplante Ankunft</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prognostizierte Ankunft</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abweichung</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {trains.map((train) => {
                            // Calculate total planned arrival (Start + Plan Duration)
                            const plannedArrival = train.startTime + (train.totalDurationSeconds * 1000);
                            const estimatedArrival = plannedArrival + (train.totalDelayMinutes * 60 * 1000);
                            const variance = Math.floor(train.totalDelayMinutes);

                            return (
                                <tr key={train.id} className={train.status === 'Maintenance' ? 'bg-orange-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{train.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{train.route.end}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {formatTime(plannedArrival)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono font-medium ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {train.status === 'Maintenance' ? '-' : formatTime(estimatedArrival)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${train.status === 'Maintenance' ? 'bg-orange-100 text-orange-800' :
                                                variance > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {train.status === 'Maintenance' ? 'In Wartung' :
                                                variance > 0 ? `+${variance} min` : 'Pünktlich'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SollIstTable;
