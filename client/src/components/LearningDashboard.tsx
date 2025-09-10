import { useState, useEffect } from 'react';
import { ContentModule } from './ContentModule';
import { ShapeSequencePopup } from './ShapeSequencePopup';
import { QuizPage } from './QuizPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Trophy, Sparkles, TestTubes } from 'lucide-react';
import { nmrModules, getModuleByCode, isModuleUnlockable } from '@/data/nmr-content';

interface LearningDashboardProps {
  onBack: () => void;
}

export function LearningDashboard({ onBack }: LearningDashboardProps) {
  const [unlockedModules, setUnlockedModules] = useState<string[]>([]);
  const [unlockingModule, setUnlockingModule] = useState<string | null>(null);
  const [moduleErrors, setModuleErrors] = useState<Record<string, string>>({});
  const [showShapeSequence, setShowShapeSequence] = useState(false);
  const [showQuizPage, setShowQuizPage] = useState(false);

  // Load progress from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('nmr-progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        setUnlockedModules(progress.unlockedModules || []);
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);

  // Save progress to localStorage whenever unlocked modules change
  useEffect(() => {
    if (unlockedModules.length > 0) {
      localStorage.setItem('nmr-progress', JSON.stringify({
        unlockedModules,
        lastUpdated: new Date().toISOString()
      }));
    }
  }, [unlockedModules]);

  const handleUnlock = async (code: string, moduleId: string) => {
    setUnlockingModule(code);
    // Clear previous error for this module
    setModuleErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[moduleId];
      return newErrors;
    });

    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const module = getModuleByCode(code);
    
    if (module) {
      // Check if this module can be unlocked (sequential order)
      const canUnlock = isModuleUnlockable(module.order, unlockedModules);
      
      if (canUnlock) {
        setUnlockedModules(prev => {
          if (!prev.includes(module.id)) {
            return [...prev, module.id];
          }
          return prev;
        });
        console.log(`Module unlocked: ${module.title}`);
      } else {
        setModuleErrors(prev => ({
          ...prev,
          [moduleId]: 'Complete previous modules first!'
        }));
      }
    } else {
      setModuleErrors(prev => ({
        ...prev,
        [moduleId]: 'Invalid code. Check with your instructor.'
      }));
    }
    
    setUnlockingModule(null);
  };

  const progress = (unlockedModules.length / nmrModules.length) * 100;
  const completedCount = unlockedModules.length;

  const handleBeginQuiz = () => {
    setShowShapeSequence(true);
  };

  const handleShapeSequenceClose = () => {
    setShowShapeSequence(false);
  };

  const handleShapeSequenceComplete = () => {
    setShowShapeSequence(false);
    setShowQuizPage(true);
  };

  const handleQuizBack = () => {
    setShowQuizPage(false);
  };

  // Show quiz page if active
  if (showQuizPage) {
    return <QuizPage onBack={handleQuizBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            onClick={onBack}
            variant="ghost"
            className="flex items-center space-x-2"
            data-testid="button-back-to-home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">
              Proton NMR Learning Journey
            </h1>
            <p className="text-muted-foreground">
              by Jordan Rodrigues
            </p>
          </div>
          
          <div className="w-24"> {/* Spacer for balance */}</div>
        </div>

        {/* Progress Card */}
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-chart-3" />
              <span>Your Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Modules Completed</span>
                <span className="font-semibold">{completedCount} / {nmrModules.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedCount === 0 
                  ? "Ready to start your NMR adventure!" 
                  : completedCount === nmrModules.length
                    ? (
                        <span className="flex items-center justify-center space-x-1">
                          <span>Congratulations! You've mastered Proton NMR!</span>
                          <Sparkles className="w-4 h-4 text-chart-3" />
                        </span>
                      )
                    : `Great progress! ${nmrModules.length - completedCount} modules remaining.`
                }
              </p>
            </div>
          </CardContent>
        </Card>


        {/* Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {nmrModules.map((module) => {
            const isUnlocked = unlockedModules.includes(module.id);
            const canUnlock = isModuleUnlockable(module.order, unlockedModules);
            const isCurrentlyUnlocking = unlockingModule === module.code;

            return (
              <ContentModule
                key={module.id}
                module={module}
                isUnlocked={isUnlocked}
                canUnlock={canUnlock}
                onUnlock={(code) => handleUnlock(code, module.id)}
                isUnlocking={isCurrentlyUnlocking}
                errorMessage={moduleErrors[module.id]}
              />
            );
          })}
        </div>

        {/* Begin Course Quiz Button */}
        {completedCount === nmrModules.length && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleBeginQuiz}
              size="lg"
              className="bg-primary text-primary-foreground px-8 py-3 text-lg font-semibold"
              data-testid="button-begin-quiz"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Begin Course Quiz
            </Button>
          </div>
        )}

        {/* Footer with chemistry decorations */}
        <div className="text-center space-y-2 mt-12 pb-8">
          <div className="flex justify-center space-x-4 text-xs text-muted-foreground/70">
            <span>¹H-NMR</span>
            <span>•</span>
            <span>TMS</span>
            <span>•</span>
            <span>ppm</span>
            <span>•</span>
            <span>D₂O</span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center justify-center space-x-2">
            <TestTubes className="w-4 h-4" />
            <span>Interactive Chemistry Learning Experience</span>
            <TestTubes className="w-4 h-4" />
          </p>
        </div>

        {/* Shape Sequence Popup */}
        <ShapeSequencePopup
          isOpen={showShapeSequence}
          onClose={handleShapeSequenceClose}
          onSequenceComplete={handleShapeSequenceComplete}
        />
      </div>
    </div>
  );
}