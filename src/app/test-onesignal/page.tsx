'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OneSignalTestPage() {
  const [status, setStatus] = useState<string>('Checking...');
  const [userId, setUserId] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    const checkOneSignal = async () => {
      try {
        if (typeof window !== 'undefined' && window.OneSignal) {
          const OneSignal = window.OneSignal;
          
          // Check initialization
          const initialized = await OneSignal.User.PushSubscription.optedIn;
          setStatus(initialized ? 'Initialized ✅' : 'Not subscribed');
          
          // Get user ID
          const externalUserId = await OneSignal.User.PushSubscription.id;
          if (externalUserId) {
            setUserId(externalUserId);
            setIsSubscribed(true);
          }
        } else {
          setStatus('OneSignal not loaded ❌');
        }
      } catch (error) {
        console.error('Error checking OneSignal:', error);
        setStatus('Error: ' + (error as Error).message);
      }
    };

    // Wait for OneSignal to load
    setTimeout(checkOneSignal, 2000);
  }, []);

  const handleSubscribe = async () => {
    try {
      if (window.OneSignal) {
        await window.OneSignal.Slidedown.promptPush();
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
      });
      const data = await response.json();
      alert(data.message || 'Notification sent!');
    } catch (error) {
      alert('Failed to send notification');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">OneSignal Test Page</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>OneSignal integration status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Status:</p>
              <p className="text-lg font-semibold">{status}</p>
            </div>

            {userId && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Subscriber ID:</p>
                <code className="block p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs break-all">
                  {userId}
                </code>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Badge variant={isSubscribed ? "default" : "secondary"}>
                {isSubscribed ? "Subscribed" : "Not Subscribed"}
              </Badge>
            </div>

            <div className="space-y-2">
              {!isSubscribed && (
                <Button onClick={handleSubscribe} className="w-full">
                  Subscribe to Notifications
                </Button>
              )}
              
              <Button onClick={handleTestNotification} variant="outline" className="w-full">
                Send Test Notification
              </Button>

              <Button onClick={() => window.location.reload()} variant="ghost" className="w-full">
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">App ID: </span>
              <code className="text-xs">{process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'Not set'}</code>
            </div>
            <div>
              <span className="font-semibold">Browser: </span>
              <code className="text-xs">{typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</code>
            </div>
            <div>
              <span className="font-semibold">Protocol: </span>
              <code className="text-xs">{typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
