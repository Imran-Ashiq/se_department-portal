'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    OneSignalDeferred?: Promise<any>;
    OneSignal?: any;
  }
}

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize OneSignal on production
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (!isProduction) {
      console.log('OneSignal: Skipped on localhost (production only)');
      return;
    }

    // Load OneSignal script
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.OneSignalDeferred.push(async function(OneSignal: any) {
        try {
          const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
          console.log('Initializing OneSignal with App ID:', appId);
          
          await OneSignal.init({
            appId: appId,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: true,
            },
          });

          console.log('OneSignal initialized successfully');
          
          // Show native prompt
          OneSignal.Slidedown.promptPush();
        } catch (error) {
          console.error('OneSignal initialization error:', error);
        }
      });
    };

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return <>{children}</>;
}
