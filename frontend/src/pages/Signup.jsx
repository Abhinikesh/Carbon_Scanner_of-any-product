import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Signup() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white border border-mist rounded-2xl p-8 text-center shadow-sm">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-ink">Climate Lens</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-ink mb-2">Sign Up</h1>
        <p className="font-body text-sm text-gray-500 mb-8">Signup — coming in Part 5</p>
        <Link to="/" className="inline-flex items-center justify-center w-full bg-forest hover:bg-forest-dark text-white font-bold py-3 rounded-xl text-sm transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
