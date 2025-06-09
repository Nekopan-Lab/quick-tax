import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PWAUpdatePrompt() {
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('Service Worker registered:', swUrl);
      if (r) {
        // Store the registration for use in visibility change handler
        swRegistrationRef.current = r;
        
        // Check for updates immediately on app launch
        r.update();
        
        // Then check for updates every hour
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
  });

  // Check for updates when app becomes visible (e.g., when reopened from home screen)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && swRegistrationRef.current) {
        console.log('App became visible, checking for updates...');
        swRegistrationRef.current.update();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also check when the app gains focus
    const handleFocus = () => {
      if (swRegistrationRef.current) {
        console.log('App gained focus, checking for updates...');
        swRegistrationRef.current.update();
      }
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">Update Available</h3>
          <p className="mt-1 text-sm text-gray-500">
            A new version of QuickTax is available. Please update to get the latest features and improvements.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 inline-flex text-gray-400 hover:text-gray-500"
          aria-label="Dismiss"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="mt-4 flex space-x-3">
        <button
          onClick={handleUpdate}
          className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Update Now
        </button>
        <button
          onClick={handleDismiss}
          className="inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Later
        </button>
      </div>
    </div>
  );
}