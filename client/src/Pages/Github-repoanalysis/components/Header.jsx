import React from 'react';

export default function Header() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold text-indigo-300 drop-shadow-lg animate-pulse-slow">Gitify</h1>
      <p className="mt-4 text-xl text-gray-400">
        Quick analysis without cloning the repository.
      </p>
    </div>
  );
}
