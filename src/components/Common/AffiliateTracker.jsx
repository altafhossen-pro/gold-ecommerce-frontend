'use client';

import { useEffect, useState } from 'react';
import { setCookie } from 'cookies-next';
import { X, CheckCircle, Gift } from 'lucide-react';
import { settingsAPI } from '@/services/api';

export default function AffiliateTracker() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Get affiliate code from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const affiliateCode = urlParams.get('affiliate');

    if (affiliateCode) {
      // Store in cookie with 15 minutes expiry
      const expiryMinutes = 15;
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);
      
      setCookie('affiliateCode', affiliateCode, {
        expires: expiryDate,
        sameSite: 'lax',
        path: '/'
      });
      
      // Fetch affiliate settings to check if modal should be shown
      const checkAndShowModal = async () => {
        try {
          const response = await settingsAPI.getAffiliateSettings();
          if (response.success && response.data) {
            const shouldShow = response.data.isConfirmationModalShowWhenUseAffiliateLink !== false;
            if (shouldShow) {
              setShowModal(true);
            }
          } else {
            // Default to showing modal if API fails
            setShowModal(true);
          }
        } catch (error) {
          // If API fails, default to showing modal
          console.log('Failed to fetch affiliate settings, defaulting to show modal');
          setShowModal(true);
        }
      };

      checkAndShowModal();
      
      // Clean URL - remove affiliate parameter
      urlParams.delete('affiliate');
      const newQueryString = urlParams.toString();
      const pathname = window.location.pathname;
      const newUrl = newQueryString 
        ? `${pathname}?${newQueryString}` 
        : pathname;
      
      // Replace URL without page reload
      window.history.replaceState({}, '', newUrl);
    }
  }, []); // Run only once on mount

  return (
    <>
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-99 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                You Successfully Used Affiliate Link!
              </h3>

              {/* Message */}
              <p className="text-gray-600 mb-4">
                This link is valid for <span className="font-semibold text-pink-600">15 minutes</span>.
              </p>

              {/* CTA */}
              <div className="flex items-center justify-center gap-2 bg-pink-50 rounded-lg p-3 mb-4">
                <Gift className="h-5 w-5 text-pink-600" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Purchase and enjoy</span> discount or rewards!
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium cursor-pointer"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

