'use client';

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '',
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: true,
          },
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          serviceWorkerParam: { scope: '/' },
        });

        console.log('OneSignal initialized successfully');
      } catch (error) {
        console.error('OneSignal initialization error:', error);
      }
    };

    initOneSignal();
  }, []);

  return <>{children}</>;
}
