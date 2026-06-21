import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 'medium' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center py-6 w-full">
      <Loader2 className={`animate-spin text-forest ${sizeClasses[size] || sizeClasses.medium}`} />
    </div>
  );
}
