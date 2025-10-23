import React, { useState, useEffect } from 'react';
import { Instagram, X } from 'lucide-react';

const InstagramFloat = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has previously closed the float
    const hasClosed = localStorage.getItem('instagram-float-closed');
    if (!hasClosed) {
      // Show after a delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('instagram-float-closed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-6 bottom-6 z-50 animate-in slide-in-from-left-2 duration-300">
      <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white/90 backdrop-blur px-4 py-3 shadow-lg">
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          aria-label="Fechar"
        >
          <X className="w-3 h-3 text-gray-600" />
        </button>
        
        <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm">
          <Instagram className="w-5 h-5 text-pink-600" />
        </span>
        
        <div>
          <p className="text-xs text-gray-600 leading-none">Nos acompanhe</p>
          <a 
            href="https://www.instagram.com/admoving" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-semibold text-gray-900 leading-tight hover:underline"
          >
            @admoving
          </a>
        </div>
      </div>
    </div>
  );
};

export default InstagramFloat;
