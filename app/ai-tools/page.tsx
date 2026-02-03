'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { Wand2, Loader2, Copy, Check, Sparkles, Target, MessageSquare, Briefcase } from 'lucide-react';

const POLISH_TYPES = [
  { id: 'professional', label: 'Professional', icon: Briefcase, instruction: 'Make this more professional and impactful for a resume' },
  { id: 'concise', label: 'Concise', icon: Target, instruction: 'Make this shorter and more punchy while keeping the key impact' },
  { id: 'action-driven', label: 'Action-Driven', icon: Sparkles, instruction: 'Rewrite using strong action verbs and quantifiable achievements' },
];

export default function AIToolsPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedType, setSelectedType] = useState('professional');
  const { addToast } = useToast();

  const handlePolish = async () => {
    if (inputText.length < 10) {
      addToast({ title: 'Text too short', description: 'Enter at least 10 characters', variant: 'danger' });
      return;
    }

    setIsPolishing(true);
    setOutputText('');

    try {
      const type = POLISH_TYPES.find(t => t.id === selectedType);
      const response = await fetch('/api/ai/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText,
          instruction: type?.instruction || 'Make this more professional'
        }),
      });

      const data = await response.json();
      
      if (data.polished) {
        setOutputText(data.polished);
      } else {
        throw new Error(data.error || 'Polish failed');
      }
    } catch (error) {
      addToast({ 
        title: 'Polish failed', 
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'danger' 
      });
    } finally {
      setIsPolishing(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({ title: 'Copied!', variant: 'success' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Text Polish</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Instantly improve any resume bullet point, summary, or experience description
        </p>
      </div>

      {/* Polish Type Selector */}
      <div className="flex flex-wrap justify-center gap-3">
        {POLISH_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedType === type.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <type.icon className="w-4 h-4" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              Original Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your resume bullet point, job description, or any text to improve..."
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">{inputText.length} characters</p>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-amber-600" />
                Polished Text
              </span>
              {outputText && (
                <Button size="sm" variant="ghost" onClick={copyOutput} className="h-8">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outputText ? (
              <div className="min-h-[200px] p-4 bg-white dark:bg-gray-900 rounded-lg border">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{outputText}</p>
              </div>
            ) : (
              <div className="min-h-[200px] flex items-center justify-center text-gray-400">
                {isPolishing ? (
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
                    <p>Polishing your text...</p>
                  </div>
                ) : (
                  <p>Your improved text will appear here</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Polish Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handlePolish}
          disabled={isPolishing || inputText.length < 10}
          className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          {isPolishing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Polishing...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Polish Text
            </>
          )}
        </Button>
      </div>

      {/* Tips */}
      <Card className="bg-gray-50 dark:bg-gray-900/50">
        <CardContent className="py-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 Tips for best results:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li>Paste one bullet point or paragraph at a time for focused improvements</li>
            <li>Try different polish types to see which fits your style best</li>
            <li>Add specific numbers or metrics for even more impactful results</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
