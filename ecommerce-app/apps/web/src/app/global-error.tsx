'use client';

import { useEffect } from 'react';
import { Button } from '@ecommerce/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            <div className="mb-8">
              <AlertTriangle className="h-24 w-24 text-red-600 mx-auto mb-6" />
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
                CRITICAL ERROR
              </h1>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-2">
                A critical error occurred. Please refresh the page to continue.
              </p>
              {error.digest && (
                <p className="text-sm text-gray-500 font-mono mt-4">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={reset}
                className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider px-8 py-4"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-gray-100 border-2 border-gray-300 text-left">
                <p className="font-bold text-sm uppercase tracking-wide mb-2">
                  Development Error Details:
                </p>
                <pre className="text-xs text-red-600 overflow-auto">
                  {error.message}
                </pre>
                {error.stack && (
                  <pre className="text-xs text-gray-600 overflow-auto mt-2">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
