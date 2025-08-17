import React from 'react';

export default function ProgressDisplay({ progressMsgs, running }) {
  return (
    <div className="mt-8 p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-indigo-500/10">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${running ? 'bg-indigo-500' : 'bg-gray-700'}`}>
          <div className={`w-3 h-3 rounded-full ${running ? 'bg-white animate-ping-slow' : 'bg-gray-500'}`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-300">Analysis Status</h3>
      </div>
      <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-500 ease-in-out rounded-full"
          style={{ width: `${Math.min(95, 10 + progressMsgs.length * 18)}%` }}
        />
      </div>
      <p className="mt-4 text-sm text-gray-400">
        {progressMsgs[progressMsgs.length - 1] || 'Idle, waiting for a repo URL.'}
      </p>
      <div className="mt-4 max-h-40 overflow-y-auto">
        {progressMsgs.map((m, i) => (
          <div key={i} className="text-xs text-gray-500">{m}</div>
        ))}
      </div>
    </div>
  );
}
