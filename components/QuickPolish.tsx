'use client';

import { useState } from 'react';
import { Wand2, Loader2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QuickPolishProps {
  text: string;
  onPolished?: (text: string) => void;
  variant?: 'inline' | 'button';
}

export function QuickPolish({ text, onPolished, variant = 'button' }: QuickPolishProps) {
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedText, setPolishedText] = useState('');
  const [copied, setCopied] = useState(false);

  const handlePolish = async () => {
    setIsPolishing(true);
    
    try {
      const response = await fetch('/api/ai/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      
      if (data.polished) {
        setPolishedText(data.polished);
        onPolished?.(data.polished);
      }
    } catch (error) {
      console.error('Polish failed:', error);
    } finally {
      setIsPolishing(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(polishedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === 'inline' && !polishedText) {
    return (
      <button
        onClick={handlePolish}
        disabled={isPolishing}
        className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 hover:underline disabled:opacity-50 transition-all"
      >
        {isPolishing ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Wand2 className="w-3 h-3" />
        )}
        Polish
      </button>
    );
  }

  if (!polishedText) {
    return (
      <Button
        onClick={handlePolish}
        disabled={isPolishing}
        variant="ghost"
        size="sm"
        className="gap-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
      >
        {isPolishing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Polishing...
          </>
        ) : (
          <>
            <Wand2 className="w-3.5 h-3.5" />
            Quick Polish
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900 rounded-lg border border-purple-200 dark:border-purple-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide flex items-center gap-1">
          <Wand2 className="w-3 h-3" /> Polished
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={copyText}
          className="h-6 px-2 text-xs"
        >
          {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-200">{polishedText}</p>
    </div>
  );
}
