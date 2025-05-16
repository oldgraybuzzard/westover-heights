import { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function TestModeIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    // Only show in development environment
    setIsDevelopment(process.env.NODE_ENV !== 'production');
    
    if (process.env.NODE_ENV !== 'production') {
      setIsVisible(true);
    }
  }, []);

  if (!isDevelopment || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 border-t border-yellow-300 p-2 text-yellow-800 text-sm z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <span>
            <strong>Development Mode:</strong> Using live Stripe keys. Use test card 4242 4242 4242 4242 to avoid real charges.
          </span>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-yellow-700 hover:text-yellow-900"
        >
          ✕
        </button>
      </div>
    </div>
  );
}