import React from 'react';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-mist rounded-2xl bg-white max-w-lg mx-auto py-12 w-full">
      {Icon && <Icon className="w-12 h-12 text-gray-300 mb-4" />}
      <h3 className="text-base font-bold text-ink font-display mb-1.5">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm font-body leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-forest hover:bg-forest-dark text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors font-body cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
