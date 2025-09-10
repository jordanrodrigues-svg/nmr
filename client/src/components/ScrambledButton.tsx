import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ScrambledButtonProps {
  isEnabled: boolean;
}

export function ScrambledButton({ isEnabled }: ScrambledButtonProps) {
  const targetText = 'Let the fun begin!';
  const [displayText, setDisplayText] = useState('Xpz kwv gnm cgdgm!');
  const [isAnimating, setIsAnimating] = useState(false);

  // Generate random scrambled text
  const generateScrambledText = (text: string) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';
    return text.split('').map(char => {
      if (char === ' ') return ' ';
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
  };

  // Animate text unscrambling
  const unscrambleText = async () => {
    setIsAnimating(true);
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 80));
      
      let newText = '';
      for (let j = 0; j < targetText.length; j++) {
        if (j < (targetText.length * i) / steps) {
          newText += targetText[j];
        } else {
          newText += generateScrambledText(targetText[j]);
        }
      }
      setDisplayText(newText);
    }
    
    setDisplayText(targetText);
    setIsAnimating(false);
  };

  // Start unscrambling when enabled
  useEffect(() => {
    if (isEnabled && !isAnimating) {
      unscrambleText();
    } else if (!isEnabled && !isAnimating) {
      setDisplayText(generateScrambledText(targetText));
    }
  }, [isEnabled]);

  // Keep scrambling when disabled
  useEffect(() => {
    if (!isEnabled && !isAnimating) {
      const interval = setInterval(() => {
        setDisplayText(generateScrambledText(targetText));
      }, 150);
      
      return () => clearInterval(interval);
    }
  }, [isEnabled, isAnimating]);

  const handleClick = () => {
    if (isEnabled) {
      console.log('Let the fun begin! Button clicked - ready for next phase');
    } else {
      console.log('Button clicked but code not entered yet');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Button
        onClick={handleClick}
        disabled={!isEnabled}
        className={`w-full py-4 px-8 text-lg font-bold transition-all duration-500 transform ${
          isEnabled 
            ? 'bg-chart-2 hover:bg-chart-2/90 text-white shadow-lg hover:shadow-xl hover:scale-105 border-2 border-chart-2/20' 
            : 'bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed'
        } ${isEnabled ? 'animate-pulse' : ''}`}
        style={{
          transform: isEnabled ? 'translateZ(0) rotateX(5deg) rotateY(-2deg)' : 'none',
          boxShadow: isEnabled 
            ? '0 10px 25px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)' 
            : 'none',
        }}
        data-testid="button-start-fun"
      >
        <span className="font-mono tracking-wide">
          {displayText}
        </span>
      </Button>
      
      {!isEnabled && (
        <p className="text-xs text-muted-foreground text-center mt-3 animate-pulse">
          Enter the correct session code to unlock
        </p>
      )}
    </div>
  );
}