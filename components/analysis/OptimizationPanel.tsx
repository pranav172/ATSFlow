'use client';

import { useState } from 'react';
import { optimizeSection } from '@/lib/actions/optimize-actions';
import { Button } from '@/components/ui/Button';
import { Loader2, Wand2, Copy, Check } from 'lucide-react';

interface OptimizationPanelProps {
  originalText: string;
  type: 'bullet' | 'summary' | 'skill';
  resumeContext?: string;
}

export function OptimizationPanel({ originalText, type: _type, resumeContext }: OptimizationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [optimizedText, setOptimizedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    setIsOpen(true);
    if (optimizedText) return; // Already done

    setLoading(true);
    
    // Create specific, unique instruction based on the actual suggestion
    let instruction = "";
    
    // Check what kind of improvement this is and create a targeted instruction
    if (originalText.toLowerCase().includes('summary') || originalText.toLowerCase().includes('objective')) {
      instruction = `Based on this feedback: "${originalText}"
      
Generate a concise, impactful Professional Summary (3-4 sentences max) that:
- Opens with a strong value proposition
- Includes relevant keywords from the resume context
- Uses active voice and power verbs
- Is specific to the candidate's actual experience

DO NOT use generic phrases like "Results-driven professional". Be specific to this person's background.`;
    } else if (originalText.toLowerCase().includes('bullet') || originalText.toLowerCase().includes('rewrite')) {
      instruction = `Based on this feedback: "${originalText}"
      
Rewrite the relevant bullet point to be more impactful:
- Start with a strong action verb (not "Responsible for")
- Include specific metrics/numbers if possible
- Keep it to 1-2 lines max
- Highlight the impact, not just the activity

Be specific to what's in the resume, not generic.`;
    } else if (originalText.toLowerCase().includes('missing') || originalText.toLowerCase().includes('add')) {
      instruction = `Based on this feedback: "${originalText}"
      
Generate the missing content that would address this gap. Keep it:
- Concise and professional
- Relevant to the candidate's actual background
- ATS-friendly with proper formatting`;
    } else {
      // Default: create a targeted fix for this specific issue
      instruction = `Address this specific resume issue: "${originalText}"
      
Provide a concrete, actionable improvement that:
- Is specific to this feedback
- Uses professional language
- Is concise (1-3 sentences max)
- Can be directly used in the resume`;
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setOptimizedText('');
    setLoading(true);
    handleOptimize();
  };

  if (!isOpen) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 px-3 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 mt-2 transition-all duration-200 hover:scale-105"
        onClick={handleOptimize}
      >
        <Wand2 className="w-3 h-3 mr-1.5" /> Get AI Fix
      </Button>
    );
  }

  return (
    <div className="mt-3 p-4 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-black/20 rounded-xl border border-purple-200 dark:border-purple-800/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center">
            <Wand2 className="w-3.5 h-3.5 mr-1.5" /> AI Suggestion
        </h4>
        <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-500 hover:text-gray-700" onClick={() => setIsOpen(false)}>Close</Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            <span className="text-sm text-gray-500">Generating unique suggestion...</span>
          </div>
        </div>
      ) : (
        <div>
           <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed bg-white dark:bg-black/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
             {optimizedText}
           </p>
           <div className="mt-3 flex gap-2">
             <Button 
               size="sm" 
               className={`h-8 text-xs gap-1.5 transition-all duration-200 ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`} 
               onClick={copyToClipboard}
             >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
             </Button>
             <Button size="sm" variant="outline" className="h-8 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20" onClick={handleRegenerate}>
                <Wand2 className="w-3 h-3 mr-1" /> Regenerate
             </Button>
           </div>
        </div>
      )}
    </div>
  );
}
