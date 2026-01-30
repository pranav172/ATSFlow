'use client';

import { useState } from 'react';
import { optimizeSection } from '@/lib/actions/optimize-actions';
import { Button } from '@/components/ui/Button';
import { Loader2, Wand2, Check, Copy } from 'lucide-react';

interface OptimizationPanelProps {
  originalText: string;
  type: 'bullet' | 'summary' | 'skill';
  resumeContext?: string;
}

export function OptimizationPanel({ originalText, type, resumeContext }: OptimizationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [optimizedText, setOptimizedText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setIsOpen(true);
    if (optimizedText) return; // Already done

    setLoading(true);
    // Determine instruction based on type
    let instruction = "Improve this text to be more professional and impactful.";
    if (type === 'bullet') instruction = "Rewrite this bullet point to use strong action verbs, include metrics if implied, and be concise.";
    if (type === 'summary') instruction = "Rewrite this professional summary to be punchy, keyword-rich, and executive-level.";
    
    // If it's a missing section advice (starts with ! or contains 'Add a'), tweak instruction
    if (originalText.includes("Add a") || originalText.includes("Missing")) {
        instruction = "Generate this missing resume section based on the resume context.";
    }
    
    const res = await optimizeSection(originalText, instruction, resumeContext);
    if (res.success && res.text) {
      setOptimizedText(res.text);
    } else {
      setOptimizedText("Failed to generate suggestion. Please try again.");
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(optimizedText);
    alert('Copied to clipboard!');
  };

  if (!isOpen) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        onClick={handleOptimize}
      >
        <Wand2 className="w-3 h-3 mr-1" /> Fix with AI
      </Button>
    );
  }

  return (
    <div className="mt-3 p-4 bg-white dark:bg-black/20 rounded-lg border border-purple-100 dark:border-purple-900/30 animate-in slide-in-from-top-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center">
            <Wand2 className="w-3 h-3 mr-1" /> AI Suggestion
        </h4>
        <Button variant="ghost" size="sm" className="h-5 text-[10px]" onClick={() => setIsOpen(false)}>Close</Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
           <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Writing improved version...
        </div>
      ) : (
        <div>
           <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
             {optimizedText}
           </p>
           <div className="mt-3 flex gap-2">
             <Button size="sm" className="h-7 text-xs gap-1 bg-purple-600 hover:bg-purple-700" onClick={copyToClipboard}>
                <Copy className="w-3 h-3" /> Copy
             </Button>
             <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleOptimize}>
                Regenerate
             </Button>
           </div>
        </div>
      )}
    </div>
  );
}
