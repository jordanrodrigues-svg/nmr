import { useState, useEffect } from 'react';
import { ChemistryBackground } from './ChemistryBackground';
import { WelcomeBox } from './WelcomeBox';
import { SessionCodeInput } from './SessionCodeInput';
import { ScrambledButton } from './ScrambledButton';
import { LearningDashboard } from './LearningDashboard';
import { MultiplayerQuizPage } from './MultiplayerQuizPage';
import { TestTubes } from 'lucide-react';

// Session persistence utilities
const SESSION_STORAGE_KEY = 'chemistry-session-valid';
const SESSION_CODE_KEY = 'chemistry-session-code';
const VALID_SESSION_CODE = 'CHEMWITHJ';
const OVERRIDE_SESSION_CODE = 'SKIPCONTENT';

const saveSessionToStorage = (code: string) => {
  localStorage.setItem(SESSION_STORAGE_KEY, 'true');
  localStorage.setItem(SESSION_CODE_KEY, code);
};

const clearSessionFromStorage = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(SESSION_CODE_KEY);
  // Also clear NMR progress to ensure clean state
  localStorage.removeItem('nmr-progress');
};

const isSessionValid = (): boolean => {
  return localStorage.getItem(SESSION_STORAGE_KEY) === 'true';
};

const getStoredSessionCode = (): string | null => {
  return localStorage.getItem(SESSION_CODE_KEY);
};

export function HomePage() {
  const [sessionCode, setSessionCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [showLearningDashboard, setShowLearningDashboard] = useState(false);
  const [showMultiplayerQuiz, setShowMultiplayerQuiz] = useState(false);

  // Check for existing session on component mount
  useEffect(() => {
    if (isSessionValid()) {
      const storedCode = getStoredSessionCode();
      if (storedCode) {
        setSessionCode(storedCode);
        setIsCodeValid(true);
      }
    }
  }, []);

  const handleCodeChange = (code: string, isValid: boolean) => {
    setSessionCode(code);
    setIsCodeValid(isValid);
    
    // Save session to localStorage when valid code is entered
    if (isValid) {
      saveSessionToStorage(code);
      
      // Handle session-specific setup
      if (code === VALID_SESSION_CODE) {
        // CHEMWITHJ: Enforce sequential progression (reset to first module only)
        localStorage.setItem('nmr-progress', JSON.stringify({
          unlockedModules: ["proton-intro"], // Only first module unlocked
          lastUpdated: new Date().toISOString()
        }));
      } else if (code === OVERRIDE_SESSION_CODE) {
        // SKIPCONTENT: Unlock all modules immediately
        const allModules = ["proton-intro", "magnetic-field-tms", "spectrum-peaks", "solvents-shifts", "oh-nh-signals", "forensic-nmr"];
        localStorage.setItem('nmr-progress', JSON.stringify({
          unlockedModules: allModules,
          lastUpdated: new Date().toISOString()
        }));
      }
    } else {
      clearSessionFromStorage();
    }
  };

  const handleStartLearning = () => {
    if (isCodeValid && isSessionValid()) {
      // CHEMWITHJ: Force sequential learning progression (no mode selection)
      if (sessionCode === VALID_SESSION_CODE) {
        setShowLearningDashboard(true);
      }
      // SKIPCONTENT: Show mode selection with all content unlocked
      else if (sessionCode === OVERRIDE_SESSION_CODE) {
        setShowModeSelection(true);
      }
    }
  };

  const handleIndividualLearning = () => {
    setShowModeSelection(false);
    setShowLearningDashboard(true);
  };

  const handleMultiplayerQuiz = () => {
    setShowModeSelection(false);
    setShowMultiplayerQuiz(true);
  };

  const handleBackToHome = () => {
    setShowModeSelection(false);
    setShowLearningDashboard(false);
    setShowMultiplayerQuiz(false);
    // Clear session when explicitly going back to home
    clearSessionFromStorage();
    setSessionCode('');
    setIsCodeValid(false);
  };

  const handleBackToModeSelection = () => {
    setShowLearningDashboard(false);
    setShowMultiplayerQuiz(false);
    setShowModeSelection(true);
  };

  if (showLearningDashboard) {
    // For CHEMWITHJ users, back goes to home (no mode selection)
    // For SKIPCONTENT users, back goes to mode selection
    const handleBackFromLearning = sessionCode === VALID_SESSION_CODE 
      ? handleBackToHome 
      : handleBackToModeSelection;
    
    return <LearningDashboard onBack={handleBackFromLearning} />;
  }

  if (showMultiplayerQuiz) {
    return <MultiplayerQuizPage onBack={handleBackToModeSelection} />;
  }

  // Mode Selection UI
  if (showModeSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        {/* Chemistry Background */}
        <ChemistryBackground />
        
        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-4">
          <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <TestTubes className="w-16 h-16 text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-white">
                Choose Your Learning Mode
              </h1>
              <p className="text-xl text-white/80">
                How would you like to explore NMR chemistry today?
              </p>
            </div>

            {/* Mode Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Individual Learning */}
              <button
                onClick={handleIndividualLearning}
                className="group p-6 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                data-testid="button-individual-learning"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-500/30 transition-colors">
                    <TestTubes className="w-8 h-8 text-blue-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Individual Learning</h3>
                  <p className="text-white/70">
                    Learn at your own pace through interactive NMR modules with sequential unlocking
                  </p>
                  <div className="bg-blue-500/20 rounded-lg p-3">
                    <p className="text-sm text-blue-200 font-medium">6 Learning Modules • Progress Tracking</p>
                  </div>
                </div>
              </button>

              {/* Multiplayer Quiz */}
              <button
                onClick={handleMultiplayerQuiz}
                className="group p-6 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                data-testid="button-multiplayer-quiz"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-500/30 transition-colors">
                    <TestTubes className="w-8 h-8 text-green-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Multiplayer Quiz</h3>
                  <p className="text-white/70">
                    Join live quizzes with classmates and see results on the big screen
                  </p>
                  <div className="bg-green-500/20 rounded-lg p-3">
                    <p className="text-sm text-green-200 font-medium">Live Competition • Real-time Results</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Back Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleBackToHome}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl transition-all duration-300"
                data-testid="button-back-to-home"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
        
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20 pointer-events-none z-5"></div>
      </div>
    );
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