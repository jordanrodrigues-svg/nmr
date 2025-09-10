import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Unlock, BookOpen, Lightbulb } from 'lucide-react';
import { NMRModule } from '@/data/nmr-content';

interface ContentModuleProps {
  module: NMRModule;
  isUnlocked: boolean;
  canUnlock: boolean;
  onUnlock: (code: string) => void;
  isUnlocking?: boolean;
  errorMessage?: string;
}

export function ContentModule({ module, isUnlocked, canUnlock, onUnlock, isUnlocking, errorMessage }: ContentModuleProps) {
  const [codeInput, setCodeInput] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleUnlock = () => {
    if (codeInput.trim()) {
      onUnlock(codeInput.trim().toUpperCase());
      setCodeInput('');
      setShowCodeInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <Card className={`transition-all duration-500 ${
      isUnlocked 
        ? 'bg-gradient-to-br from-chart-2/10 to-chart-1/10 border-chart-2/30 shadow-lg' 
        : canUnlock
          ? 'bg-card/60 hover-elevate cursor-pointer border-primary/20'
          : 'bg-muted/30 border-muted-foreground/10'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {isUnlocked ? (
                <Unlock className="w-5 h-5 text-chart-2" />
              ) : (
                <Lock className={`w-5 h-5 ${canUnlock ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
              <span className={`text-sm font-mono px-2 py-1 rounded ${
                isUnlocked 
                  ? 'bg-chart-2/20 text-chart-2' 
                  : 'bg-muted/50 text-muted-foreground'
              }`}>
                {module.slides}
              </span>
            </div>
            <CardTitle className={`text-lg leading-tight ${
              !isUnlocked && !canUnlock ? 'text-muted-foreground' : ''
            }`}>
              {module.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="relative">
          {/* Content - Always Show (Blurred if Locked) */}
          <div className={`space-y-4 ${
            !isUnlocked ? 'blur-sm pointer-events-none select-none' : ''
          }`}>
            {/* Main Content */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-chart-1" />
                <span className="text-sm font-semibold text-chart-1">Content</span>
              </div>
              <div className="pl-6 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                {module.content}
              </div>
            </div>

            {/* Interactive Section */}
            <div className="space-y-2 p-4 bg-chart-3/10 rounded-lg border border-chart-3/20">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-chart-3" />
                <span className="text-sm font-semibold text-chart-3">Interactive Challenge</span>
              </div>
              <p className="text-sm text-foreground/80 pl-6 italic">
                {module.interactive}
              </p>
            </div>
          </div>

          {/* Lock Overlay for Locked Content */}
          {!isUnlocked && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center z-10">
              <div className="text-center space-y-4 p-6">
                {/* Large Padlock Icon */}
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <Lock className="w-16 h-16 text-muted-foreground/60" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-chart-2/10 rounded-full blur-xl"></div>
                </div>
                
                {canUnlock ? (
                  <div className="space-y-4 w-full max-w-xs">
                    <p className="text-sm text-muted-foreground text-center">
                      Content locked. Enter your code to unlock.
                    </p>
                    
                    {/* Per-module Error Message */}
                    {errorMessage && (
                      <div className="p-2 bg-destructive/10 rounded border border-destructive/30">
                        <p className="text-destructive text-xs font-medium text-center">
                          {errorMessage}
                        </p>
                      </div>
                    )}
                    
                    {!showCodeInput ? (
                      <Button 
                        onClick={() => setShowCodeInput(true)}
                        className="w-full"
                        variant="outline"
                        data-testid={`button-unlock-${module.id}`}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Enter Unlock Code
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          type="text"
                          placeholder="Enter code (e.g., X7B2)"
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="text-center font-mono tracking-wider bg-background/95"
                          disabled={isUnlocking}
                          data-testid={`input-code-${module.id}`}
                        />
                        <div className="flex space-x-2">
                          <Button 
                            onClick={handleUnlock}
                            disabled={!codeInput.trim() || isUnlocking}
                            className="flex-1"
                            data-testid={`button-submit-code-${module.id}`}
                          >
                            {isUnlocking ? 'Unlocking...' : 'Unlock'}
                          </Button>
                          <Button 
                            onClick={() => {
                              setShowCodeInput(false);
                              setCodeInput('');
                            }}
                            variant="outline"
                            disabled={isUnlocking}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Complete previous modules to unlock
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}