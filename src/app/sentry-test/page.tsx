'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

export default function SentryTestPage() {
  const [message, setMessage] = useState('');

  const throwError = () => {
    try {
      throw new Error("Sentry Test Error - This is a deliberate error for testing!");
    } catch (error) {
      Sentry.captureException(error);
      setMessage('✅ Error captured by Sentry! Check your dashboard.');
      console.error('Captured error:', error);
    }
  };

  const throwAsyncError = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error("Sentry Async Test Error - This is a deliberate async error!");
    } catch (error) {
      Sentry.captureException(error);
      setMessage('✅ Async error captured by Sentry! Check your dashboard.');
      console.error('Captured async error:', error);
    }
  };

  const throwUnhandledError = () => {
    setMessage('⚠️ Unhandled error will be thrown in 1 second...');
    // This will actually crash and be caught by Sentry's error boundary
    setTimeout(() => {
      throw new Error("Unhandled Error - This will crash and be auto-captured by Sentry!");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <CardTitle>Sentry Error Testing</CardTitle>
          </div>
          <CardDescription>
            Click the buttons below to test Sentry error tracking. These errors will be captured and sent to your Sentry dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md text-sm">
              {message}
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Captured Sync Error</h3>
            <p className="text-xs text-muted-foreground">Manually captured and sent to Sentry</p>
            <Button 
              onClick={throwError}
              variant="destructive"
              className="w-full"
              type="button"
            >
              Throw Captured Sync Error
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Captured Async Error</h3>
            <p className="text-xs text-muted-foreground">Async error manually captured</p>
            <Button 
              onClick={throwAsyncError}
              variant="destructive"
              className="w-full"
              type="button"
            >
              Throw Captured Async Error
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Unhandled Error (Real Crash)</h3>
            <p className="text-xs text-muted-foreground">This will actually crash - Sentry auto-captures it</p>
            <Button 
              onClick={throwUnhandledError}
              variant="destructive"
              className="w-full"
              type="button"
            >
              Throw Unhandled Error
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-md">
            <p className="font-semibold mb-1">Note:</p>
            <p>All errors are sent to Sentry. Check your dashboard to see captured errors with full stack traces and context.</p>
            <p className="mt-2">Open browser console (F12) to see error logs.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
