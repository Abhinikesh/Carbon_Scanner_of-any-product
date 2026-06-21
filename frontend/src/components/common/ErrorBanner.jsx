import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5 font-body mb-4 w-full">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
