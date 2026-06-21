import React from 'react';

export default function ScoreBadge({ score }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full text-gray-500 bg-gray-100 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" aria-hidden="true" />
        —
      </span>
    );
  }

  const badgeColor = score >= 70 
    ? 'text-green-600 bg-green-50' 
    : score >= 40 
      ? 'text-yellow-600 bg-yellow-50' 
      : 'text-red-500 bg-red-50';

  const dotColor = score >= 70 
    ? 'bg-green-500' 
    : score >= 40 
      ? 'bg-yellow-500' 
      : 'bg-red-500';

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span className="font-mono tabular-nums">{score}</span>
    </span>
  );
}
