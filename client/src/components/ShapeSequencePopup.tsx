import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Square, Circle, Triangle, Star } from 'lucide-react';

interface ShapeSequencePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSequenceComplete: () => void;
}

type ShapeType = 'square' | 'circle' | 'triangle' | 'star';

const correctSequence: ShapeType[] = ['square', 'circle', 'circle', 'triangle', 'star', 'square'];

const shapeIcons = {
  square: Square,
  circle: Circle,
  triangle: Triangle,
  star: Star,
};

const shapeNames = {
  square: 'Square',
  circle: 'Circle',
  triangle: 'Triangle',
  star: 'Star',
};

export function ShapeSequencePopup({ isOpen, onClose, onSequenceComplete }: ShapeSequencePopupProps) {
  const [tappedSequence, setTappedSequence] = useState<ShapeType[]>([]);
  const [isError, setIsError] = useState(false);

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      setTappedSequence([]);
      setIsError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShapeTap = (shape: ShapeType) => {
    // Don't process clicks during error state
    if (isError) return;
    
    // Check if the current tap matches the expected position in the sequence
    const currentIndex = tappedSequence.length;
    const expectedShape = correctSequence[currentIndex];
    const isCorrectTap = shape === expectedShape;
    
    if (!isCorrectTap) {
      // Wrong shape tapped - reset sequence and show error
      setIsError(true);
      setTappedSequence([]);
      setTimeout(() => setIsError(false), 1000);
      return;
    }
    
    // Create new sequence with current shape
    const newSequence = [...tappedSequence, shape];
    setTappedSequence(newSequence);
    
    // Check if sequence is complete
    if (newSequence.length === correctSequence.length) {
      // Sequence completed successfully
      setTimeout(() => {
        onSequenceComplete();
      }, 500);
    }
  };

  const availableShapes: ShapeType[] = ['square', 'circle', 'triangle', 'star'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dull screen overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Popup content */}
      <Card className="relative w-full max-w-md mx-4 bg-card/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Security Check</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
              data-testid="button-close-shape-popup"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Kindly tap the shapes in the correct order.
            </p>
            <p className="text-xs text-muted-foreground/80">
              This is an alternative to a passcode.
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {correctSequence.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full border-2 ${
                  index < tappedSequence.length
                    ? 'bg-primary border-primary'
                    : 'bg-transparent border-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          
          {/* Shape grid */}
          <div className="grid grid-cols-2 gap-4">
            {availableShapes.map((shape) => {
              const IconComponent = shapeIcons[shape];
              return (
                <Button
                  key={shape}
                  variant="outline"
                  className={`h-16 w-full flex flex-col items-center justify-center space-y-1 hover-elevate ${
                    isError ? 'border-destructive/50 bg-destructive/5' : ''
                  }`}
                  onClick={() => handleShapeTap(shape)}
                  data-testid={`button-shape-${shape}`}
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="text-xs">{shapeNames[shape]}</span>
                </Button>
              );
            })}
          </div>
          
          {/* Status messages */}
          {isError && (
            <div className="text-center">
              <p className="text-sm text-destructive">
                Incorrect sequence. Please try again.
              </p>
            </div>
          )}
          
          {tappedSequence.length > 0 && !isError && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground" data-testid="text-shape-progress">
                {tappedSequence.length} of {correctSequence.length} shapes correct
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}