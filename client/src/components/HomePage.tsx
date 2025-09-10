import { useState } from 'react';
import { ChemistryBackground } from './ChemistryBackground';
import { WelcomeBox } from './WelcomeBox';
import { SessionCodeInput } from './SessionCodeInput';
import { ScrambledButton } from './ScrambledButton';

export function HomePage() {
  const [sessionCode, setSessionCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);

  const handleCodeChange = (code: string, isValid: boolean) => {
    setSessionCode(code);
    setIsCodeValid(isValid);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Chemistry Background */}
      <ChemistryBackground />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-4 space-y-8">
        {/* Welcome Section */}
        <div className="w-full max-w-4xl">
          <WelcomeBox />
        </div>
        
        {/* Session Code Input */}
        <div className="w-full max-w-md">
          <SessionCodeInput onCodeChange={handleCodeChange} />
        </div>
        
        {/* Scrambled Button */}
        <div className="w-full max-w-md">
          <ScrambledButton isEnabled={isCodeValid} />
        </div>
        
        {/* Footer with chemistry hint */}
        <div className="text-center space-y-2 mt-12">
          <p className="text-sm text-muted-foreground">
            🧪 Interactive Chemistry Learning Experience 🧪
          </p>
          <div className="flex justify-center space-x-4 text-xs text-muted-foreground/70">
            <span>H₂O</span>
            <span>•</span>
            <span>CO₂</span>
            <span>•</span>
            <span>CH₄</span>
            <span>•</span>
            <span>C₆H₆</span>
          </div>
        </div>
      </div>
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20 pointer-events-none z-5"></div>
    </div>
  );
}