import { useState, useEffect } from 'react';
import { ChemistryBackground } from './ChemistryBackground';
import { WelcomeBox } from './WelcomeBox';
import { SessionCodeInput } from './SessionCodeInput';
import { ScrambledButton } from './ScrambledButton';
import { LearningDashboard } from './LearningDashboard';
import { TestTubes } from 'lucide-react';

// Session persistence utilities
const SESSION_STORAGE_KEY = 'chemistry-session-valid';
const VALID_SESSION_CODE = 'CHEMWITHJ';

const saveSessionToStorage = () => {
  localStorage.setItem(SESSION_STORAGE_KEY, 'true');
};

const clearSessionFromStorage = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

const isSessionValid = (): boolean => {
  return localStorage.getItem(SESSION_STORAGE_KEY) === 'true';
};

export function HomePage() {
  const [sessionCode, setSessionCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [showLearningDashboard, setShowLearningDashboard] = useState(false);

  // Check for existing session on component mount
  useEffect(() => {
    if (isSessionValid()) {
      setSessionCode(VALID_SESSION_CODE);
      setIsCodeValid(true);
    }
  }, []);

  const handleCodeChange = (code: string, isValid: boolean) => {
    setSessionCode(code);
    setIsCodeValid(isValid);
    
    // Save session to localStorage when valid code is entered
    if (isValid) {
      saveSessionToStorage();
    } else {
      clearSessionFromStorage();
    }
  };

  const handleStartLearning = () => {
    if (isCodeValid && isSessionValid()) {
      setShowLearningDashboard(true);
    }
  };

  const handleBackToHome = () => {
    setShowLearningDashboard(false);
    // Clear session when explicitly going back to home
    clearSessionFromStorage();
    setSessionCode('');
    setIsCodeValid(false);
  };

  if (showLearningDashboard) {
    return <LearningDashboard onBack={handleBackToHome} />;
  }

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
          <ScrambledButton isEnabled={isCodeValid} onStartLearning={handleStartLearning} />
        </div>
        
        {/* Footer with chemistry hint */}
        <div className="text-center space-y-2 mt-12">
          <p className="text-sm text-muted-foreground flex items-center justify-center space-x-2">
            <TestTubes className="w-4 h-4" />
            <span>Interactive Chemistry Learning Experience</span>
            <TestTubes className="w-4 h-4" />
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