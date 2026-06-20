import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white py-12 border-t border-mist">
      <div className="max-w-6xl mx-auto px-6">
        {/* Top section: Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-forest rounded-lg flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-ink tracking-tight">
                Climate Lens
              </span>
            </Link>
            <p className="font-body text-xs text-gray-500 leading-relaxed max-w-sm">
              Climate Lens turns everyday receipts into real climate accountability.
            </p>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-3 gap-6">
            {/* Product */}
            <div className="flex flex-col gap-3">
              <span className="font-display text-xs font-bold text-ink uppercase tracking-wider">
                Product
              </span>
              <a href="#features" className="font-body text-xs text-gray-500 hover:text-forest transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="font-body text-xs text-gray-500 hover:text-forest transition-colors">
                How It Works
              </a>
              <a href="#" className="font-body text-xs text-gray-500 hover:text-forest transition-colors">
                Pricing
              </a>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-3">
              <span className="font-display text-xs font-bold text-ink uppercase tracking-wider">
                Company
              </span>
              <a href="#" className="font-body text-xs text-gray-500 hover:text-forest transition-colors">
                About
              </a>
              <a href="#" className="font-body text-xs text-gray-500 hover:text-forest transition-colors">
                Contact
              </a>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-3">
              <span className="font-display text-xs font-bold text-ink uppercase tracking-wider">
                Legal
              </span>
              <a href="#" className="font-body text-xs text-gray-500 hover:text-forest transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="font-body text-xs text-gray-500 hover:text-forest transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="border-t border-mist/50 pt-6 flex justify-between items-center text-xs text-gray-400 font-body">
          <div>
            <span>&copy; </span>
            <span className="font-mono">2026</span>
            <span> Climate Lens. Built on open data.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
