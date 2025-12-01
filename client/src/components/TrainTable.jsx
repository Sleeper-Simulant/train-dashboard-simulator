import React from 'react';

const TrainTable = ({ trains, isAdmin }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Delay</th>}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Delay</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {trains.map((train) => (
                        <tr key={train.id} className={train.status === 'Delayed' ? 'bg-red-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{train.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{train.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {train.route.start} &rarr; {train.route.end}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                                        style={{ width: `${train.progress}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs">{Math.round(train.progress)}%</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${train.status === 'On Time' ? 'bg-green-100 text-green-800' :
                                        train.status === 'Delayed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {train.status}
                                </span>
                            </td>
                            {isAdmin && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {train.delayMinutes > 0 ? `+${Math.ceil(train.delayMinutes)} min` : '-'}
                                </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                                {train.totalDelayMinutes > 0 ? `+${Math.floor(train.totalDelayMinutes)} min` : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TrainTable;
