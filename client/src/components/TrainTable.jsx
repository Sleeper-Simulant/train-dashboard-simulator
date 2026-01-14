import React from 'react';

const TrainTable = ({ trains, isAdmin, onCancelDelay }) => {
    return (
        <div className="space-y-4">
            {trains.map((train) => (
                <div key={train.id} className={`bg-white p-6 rounded-xl shadow-sm border transition-all ${train.status === 'Delayed' ? 'border-red-200 bg-red-50/30' :
                    train.status === 'Maintenance' ? 'border-orange-200 bg-orange-50/30' :
                        'border-gray-200'
                    }`}>
                    {/* Top Row: Info */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">{train.id}</h3>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase tracking-wide">
                                {train.type}
                            </span>
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
                        </div>
                    </div>

                    {/* Middle Row: Progress Bar + Delay Columns */}
                    <div className="flex items-end gap-6">
                        {/* Left Column: Progress Bar & Stations (Grows to fill space) */}
                        <div className="flex-grow">
                            {/* Progress Bar */}
                            <div className="relative mb-2">
                                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-linear ${train.status === 'Delayed' ? 'bg-red-500' :
                                            train.status === 'Maintenance' ? 'bg-gray-400' :
                                                'bg-blue-600'
                                            }`}
                                        style={{ width: `${train.progress}%` }}
                                    >
                                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30"></div>
                                    </div>
                                </div>
                                {/* Train Icon */}
                                <div
                                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-linear"
                                    style={{ left: `${train.progress}%` }}
                                >
                                    <span className="text-lg" role="img" aria-label="train">🚆</span>
                                </div>
                            </div>

                            {/* Stations */}
                            <div className="relative h-6 mt-2 text-xs font-medium text-gray-600">
                                {train.route.stations ? (
                                    train.route.stations.map((station, index) => {
                                        const total = train.route.stations.length;
                                        const position = (index / (total - 1)) * 100;

                                        return (
                                            <div
                                                key={index}
                                                className="absolute transform -translate-x-1/2 flex flex-col items-center"
                                                style={{ left: `${position}%` }}
                                            >
                                                <span className="w-2 h-2 bg-gray-300 rounded-full mb-1 border border-white shadow-sm"></span>
                                                <span className="whitespace-nowrap">{station}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    // Fallback for old data format if any
                                    <>
                                        <div className="absolute left-0 transform -translate-x-1/2 flex flex-col items-center">
                                            <span className="w-2 h-2 bg-gray-300 rounded-full mb-1 border border-white shadow-sm"></span>
                                            <span>{train.route.start}</span>
                                        </div>
                                        <div className="absolute right-0 transform translate-x-1/2 flex flex-col items-center">
                                            <span className="w-2 h-2 bg-gray-300 rounded-full mb-1 border border-white shadow-sm"></span>
                                            <span>{train.route.end}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Columns: Delay Info */}
                        <div className="flex gap-6 pb-1">
                            {isAdmin && (
                                <div className="flex flex-col items-end min-w-[100px]">
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Injected Verspätung</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-lg font-bold ${train.delayMinutes > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                            {train.delayMinutes > 0 ? `+${Math.ceil(train.delayMinutes)} min` : '-'}
                                        </span>
                                        {train.delayMinutes > 0 && (
                                            <button
                                                onClick={() => onCancelDelay(train.id)}
                                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded transition-colors"
                                                title="Verspätung aufheben"
                                            >
                                                STOP
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col items-end min-w-[100px]">
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Gesamtverspätung</span>
                                <span className={`text-lg font-bold ${train.totalDelayMinutes > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                                    {train.totalDelayMinutes > 0 ? `+${Math.floor(train.totalDelayMinutes)} min` : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrainTable;
