import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Play, SkipForward, RotateCcw, Trophy, Crown, Medal, Award, Monitor } from 'lucide-react';
import { quizQuestions } from '@shared/quiz-data';

export default function PresentPage() {
  const [gamePhase, setGamePhase] = useState<'lobby' | 'quiz' | 'results'>('lobby');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentQuestion = gamePhase === 'quiz' ? quizQuestions[currentQuestionIndex] : null;
  const totalQuestions = quizQuestions.length;

  const startQuiz = () => {
    setGamePhase('quiz');
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
  };

  const nextQuestion = () => {
    const next = currentQuestionIndex + 1;
    setShowAnswer(false);
    
    if (next < quizQuestions.length) {
      setCurrentQuestionIndex(next);
    } else {
      setGamePhase('results');
    }
  };

  const showCorrectAnswer = () => {
    setShowAnswer(true);
  };

  const resetGame = () => {
    setGamePhase('lobby');
    setCurrentQuestion(null);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
  };

  if (gamePhase === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-white text-center flex items-center justify-center space-x-4">
                <Monitor className="w-10 h-10" />
                <span>NMR Quiz Presenter</span>
              </CardTitle>
              <p className="text-white/80 text-center text-xl">
                Static presentation mode for displaying quiz questions on the big screen
              </p>
            </CardHeader>
          </Card>

          {/* Instructions */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/90">
              <p className="text-lg">This presenter page is designed for displaying quiz questions on a big screen or projector.</p>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>Click "Start Quiz" to begin the presentation</li>
                <li>Use "Show Answer" to reveal the correct answer</li>
                <li>Use "Next Question" to proceed through the quiz</li>
                <li>Students can take the quiz individually on their devices by visiting the main page</li>
              </ul>
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={startQuiz} 
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-6 text-2xl"
              data-testid="button-start-quiz-presenter"
            >
              <Play className="w-8 h-8 mr-3" />
              Start Quiz Presentation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'quiz' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Question Display */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex justify-between items-start mb-6">
                <CardTitle className="text-3xl text-white">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </CardTitle>
                <div className="text-white/60 text-lg">
                  NMR Chemistry Quiz
                </div>
              </div>
              
              {/* Question text with proper text wrapping */}
              <div className="mb-8">
                <p className="text-2xl text-white leading-relaxed break-words" data-testid="text-question">
                  {currentQuestion.question}
                </p>
              </div>
              
              {/* Answer Options with improved layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isCorrect = showAnswer && key === currentQuestion.correct;
                  
                  return (
                    <div 
                      key={key} 
                      className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                        isCorrect 
                          ? 'bg-green-600/30 border-green-400 shadow-lg shadow-green-400/20' 
                          : 'bg-white/20 border-white/30'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-2 ${
                          isCorrect 
                            ? 'bg-green-500 border-green-400 text-white' 
                            : 'bg-white/20 border-white/50 text-white'
                        }`}>
                          {key.toUpperCase()}
                        </div>
                        <p className="text-white text-xl leading-relaxed break-words flex-1">
                          {value as string}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardHeader>
          </Card>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!showAnswer && (
              <Button 
                onClick={showCorrectAnswer}
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 text-xl"
                data-testid="button-show-answer"
              >
                Show Answer
              </Button>
            )}
            
            <Button 
              onClick={nextQuestion}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xl"
              data-testid="button-next-question"
            >
              <SkipForward className="w-6 h-6 mr-2" />
              {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
            
            <Button 
              onClick={resetGame}
              variant="outline"
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-6 py-4 text-xl"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-blue-900 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-5xl font-bold text-white text-center flex items-center justify-center space-x-4">
                <Trophy className="w-12 h-12 text-yellow-400" />
                <span>Quiz Complete!</span>
              </CardTitle>
              <p className="text-white/80 text-center text-xl mt-4">
                Great job everyone! Check your individual results on your devices.
              </p>
            </CardHeader>
          </Card>

          {/* Summary */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-3xl text-white text-center">Quiz Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-2xl text-white">
                Total Questions: <span className="font-bold text-yellow-400">{totalQuestions}</span>
              </div>
              <div className="text-xl text-white/80">
                Students can review their individual scores and answers on their devices
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <div className="flex justify-center">
            <Button 
              onClick={resetGame}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl"
              data-testid="button-new-game"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              Start New Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}