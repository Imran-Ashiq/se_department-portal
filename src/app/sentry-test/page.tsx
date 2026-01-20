'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function SentryTestPage() {
  const throwError = () => {
    throw new Error("Sentry Test Error - This is a deliberate error for testing!");
  };

  const throwAsyncError = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error("Sentry Async Test Error - This is a deliberate async error!");
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
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Synchronous Error</h3>
            <Button 
              onClick={throwError}
              variant="destructive"
              className="w-full"
            >
              Throw Sync Error
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Asynchronous Error</h3>
            <Button 
              onClick={throwAsyncError}
              variant="destructive"
              className="w-full"
            >
              Throw Async Error
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-md">
            <p className="font-semibold mb-1">Note:</p>
            <p>After clicking a button, check your Sentry dashboard to see the captured error with full stack traces.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
