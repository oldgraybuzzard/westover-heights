import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PaymentModal from './PaymentModal';
import { format } from 'date-fns';

type RenewalButtonProps = {
  expiryDate: Date;
};

export default function RenewalButton({ expiryDate }: RenewalButtonProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        {daysUntilExpiry > 0 ? (
          <span className="text-gray-600">
            Expires in {daysUntilExpiry} days ({format(expiryDate, 'PP')})
          </span>
        ) : (
          <span className="text-red-600">
            Expired on {format(expiryDate, 'PP')}
          </span>
        )}
      </div>

      <button
        onClick={() => setShowPaymentModal(true)}
        className="btn-primary text-sm"
      >
        Renew Now
      </button>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setShowPaymentModal(false);
        }}
        mode="renewal"
      />
    </div>
  );
} 