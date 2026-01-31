'use client';
 
import { useEffect } from 'react';
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error caught:', error);
  }, [error]);
 
  return (
    <html>
      <body>
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Application Crashed (Global)</h2>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            A critical error occurred preventing the app from loading.
          </p>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '16px', 
            borderRadius: '8px', 
            overflow: 'auto', 
            maxWidth: '800px', 
            margin: '0 auto 24px',
            textAlign: 'left'
          }}>
            {error.message || 'Unknown Error'}
            {'\n'}
            {error.digest && `Digest: ${error.digest}`}
          </pre>
          <button 
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
