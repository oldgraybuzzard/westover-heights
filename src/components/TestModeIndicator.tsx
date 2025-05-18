import React from 'react';
import { isTestMode } from '@/lib/stripe/client';
import { TEST_CARDS } from '@/lib/stripe/testCards';

export default function TestModeIndicator() {
  // Only show in development or when using test keys
  if (!isTestMode) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 border-t border-yellow-300 p-2 text-xs text-center z-50">
      <p className="font-bold">⚠️ TEST MODE</p>
      <p>
        Use test card: <span className="font-mono bg-yellow-50 px-1">{TEST_CARDS.success}</span>
        <span className="mx-1">|</span>
        Any future date <span className="mx-1">|</span>
        Any 3-digit CVC
      </p>
    </div>
  );
}
