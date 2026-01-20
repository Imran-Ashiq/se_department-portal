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
    // Load OneSignal script
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.OneSignalDeferred.push(async function(OneSignal: any) {
        try {
          await OneSignal.init({
            appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
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
