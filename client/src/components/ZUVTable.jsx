import React from 'react';

const ZUVTable = ({ trains }) => {
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Startbahnhof</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zielbahnhof</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Letzter Halt</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nächster Halt</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ankunft (Soll)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ankunft (Ist)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {trains.map((train) => {
                            const isDelayed = train.totalDelayMinutes > 0;
                            return (
                                <tr key={train.id} className={train.status === 'Maintenance' ? 'bg-orange-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{train.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{train.route.start}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{train.route.end}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{train.currentStationName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{train.nextStationName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(train.plannedArrivalNext)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDelayed ? 'text-red-600' : 'text-green-600'}`}>
                                        {train.status === 'Maintenance' ? '-' : formatTime(train.estimatedArrivalNext)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${train.status === 'On Time' ? 'bg-green-100 text-green-800' :
                                            train.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                                                train.status === 'Maintenance' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {train.status === 'On Time' ? 'Pünktlich' :
                                                train.status === 'Delayed' ? 'Verspätet' :
                                                    train.status === 'Maintenance' ? 'In Wartung' :
                                                        train.status}
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

export default ZUVTable;
