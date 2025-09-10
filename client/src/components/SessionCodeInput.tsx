import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { TestTubes, Check } from 'lucide-react';

interface SessionCodeInputProps {
  onCodeChange: (code: string, isValid: boolean) => void;
}

export function SessionCodeInput({ onCodeChange }: SessionCodeInputProps) {
  const [code, setCode] = useState('');
  const targetCode = 'CHEMWITHJ';

  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setCode(upperValue);
    const isValid = upperValue === targetCode;
    onCodeChange(upperValue, isValid);
  };

  const isValid = code === targetCode;

  return (
    <Card className="w-full max-w-md mx-auto bg-card/60 backdrop-blur-sm border-primary/10">
      <CardContent className="pt-6 pb-6 px-6">
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <svg 
              className="w-5 h-5 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <label className="text-sm font-semibold text-foreground">
              Enter Session Code
            </label>
          </div>
          <Input
            type="text"
            placeholder="Type your session code here..."
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className={`text-center text-lg font-mono tracking-wider transition-all duration-300 ${
              isValid 
                ? 'border-chart-2 ring-2 ring-chart-2/20 bg-chart-2/5' 
                : code ? 'border-chart-4/50' : ''
            }`}
            data-testid="input-session-code"
          />
          {code && !isValid && (
            <p className="text-xs text-muted-foreground text-center animate-pulse flex items-center justify-center space-x-1">
              <span>Keep trying... the code is chemistry-related!</span>
              <TestTubes className="w-3 h-3" />
            </p>
          )}
          {isValid && (
            <p className="text-xs text-chart-2 text-center font-semibold flex items-center justify-center space-x-1">
              <span>Perfect! Code accepted</span>
              <Check className="w-3 h-3" />
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}