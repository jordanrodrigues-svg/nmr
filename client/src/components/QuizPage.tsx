import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Zap, Star, Rocket, Clock, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { quizQuestions, type Player } from '@shared/quiz-data';

interface QuizPageProps {
  onBack: () => void;
}

interface PlayerAnswer {
  questionId: number;
  answer: 'a' | 'b' | 'c' | 'd';
  correct: boolean;
  timeToAnswer: number;
}

export function QuizPage({ onBack }: QuizPageProps) {
  const [name, setName] = useState('');
  const [gamePhase, setGamePhase] = useState<'join' | 'quiz' | 'results'>('join');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [showAnswer, setShowAnswer] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const totalQuestions = quizQuestions.length;

  const startQuiz = () => {
    if (!name.trim()) return;
    setGamePhase('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers([]);
    setQuestionStartTime(Date.now());
    setHasAnswered(false);
    setShowAnswer(false);
    setSelectedAnswer('');
  };

  const submitAnswer = (answer: string) => {
    if (hasAnswered) return;
    
    setSelectedAnswer(answer);
    setHasAnswered(true);
    setShowAnswer(true);
    
    const isCorrect = answer === currentQuestion.correct;
    const timeToAnswer = Date.now() - questionStartTime;
    
    const newAnswer: PlayerAnswer = {
      questionId: currentQuestion.id,
      answer: answer as 'a' | 'b' | 'c' | 'd',
      correct: isCorrect,
      timeToAnswer
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Auto-advance to next question after 3 seconds
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        nextQuestion();
      } else {
        setGamePhase('results');
      }
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setHasAnswered(false);
      setShowAnswer(false);
      setQuestionStartTime(Date.now());
    } else {
      setGamePhase('results');
    }
  };

  const resetQuiz = () => {
    setGamePhase('join');
    setName('');
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setHasAnswered(false);
    setScore(0);
    setAnswers([]);
    setShowAnswer(false);
  };

  // Join Phase
  if (gamePhase === 'join') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Neo-brutalism background with colorful dark theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/90 to-indigo-900">
          {/* Geometric shapes for neo-brutalism effect */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 transform rotate-12 shadow-2xl"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-pink-500 transform -rotate-45 shadow-2xl"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-cyan-400 transform rotate-45 shadow-2xl"></div>
          <div className="absolute bottom-40 right-16 w-12 h-12 bg-green-400 transform -rotate-12 shadow-2xl"></div>
          <div className="absolute top-1/3 left-1/3 w-8 h-8 bg-orange-400 transform rotate-45 shadow-xl"></div>
          <div className="absolute top-2/3 right-1/3 w-14 h-14 bg-red-500 transform -rotate-45 shadow-xl"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border border-white/20"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          {/* Main content card with neo-brutalism styling */}
          <Card className="w-full max-w-lg bg-white dark:bg-gray-100 border-4 border-black dark:border-gray-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(64,64,64,1)] transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <CardContent className="p-8 space-y-6">
              {/* Flashy title */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
                  <Zap className="w-8 h-8 text-purple-500 animate-bounce" />
                  <Sparkles className="w-8 h-8 text-pink-500 animate-pulse" />
                </div>
                
                <h1 className="text-4xl font-black text-black dark:text-gray-900 leading-tight" data-testid="text-quiz-title">
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 bg-clip-text text-transparent">
                    NMR QUIZ!
                  </span>
                </h1>
                
                <div className="space-y-2">
                  <p className="text-xl font-bold text-black dark:text-gray-900">
                    Enter your name
                  </p>
                  <p className="text-lg font-bold text-black dark:text-gray-900">
                    and test your knowledge
                  </p>
                </div>
              </div>

              {/* Name input form */}
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your name here..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && startQuiz()}
                  className="h-12 text-lg font-semibold border-4 border-black dark:border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(64,64,64,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[6px_6px_0px_0px_rgba(64,64,64,1)] transition-shadow"
                  data-testid="input-quiz-name"
                />
                
                <Button
                  onClick={startQuiz}
                  disabled={!name.trim()}
                  className="w-full h-12 text-lg font-black bg-green-500 dark:bg-green-600 text-white border-4 border-black dark:border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(64,64,64,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-start-quiz"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  START QUIZ!
                  <Rocket className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Back button */}
              <div className="pt-4 border-t-4 border-black dark:border-gray-800 border-dashed">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="w-full font-bold border-2 border-gray-600 dark:border-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(64,64,64,1)]"
                  data-testid="button-back-from-quiz"
                >
                  ← Back to Learning
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Animated decorative elements */}
          <div className="absolute top-20 left-1/4 animate-bounce">
            <div className="w-6 h-6 bg-yellow-400 transform rotate-45"></div>
          </div>
          <div className="absolute bottom-20 right-1/4 animate-pulse">
            <div className="w-8 h-8 bg-pink-500 rounded-full"></div>
          </div>
          <div className="absolute top-1/2 left-10 animate-spin">
            <div className="w-4 h-4 bg-cyan-400 transform rotate-45"></div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Phase
  if (gamePhase === 'quiz' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Question Header */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl text-white">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </CardTitle>
                <div className="text-white font-bold text-lg">
                  Score: {score}/{totalQuestions}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h2 className="text-xl text-white mb-6" data-testid="text-question">
                {currentQuestion.question}
              </h2>
              
              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isSelected = selectedAnswer === key;
                  const isCorrect = showAnswer && key === currentQuestion.correct;
                  const isWrong = showAnswer && isSelected && key !== currentQuestion.correct;
                  
                  return (
                    <Button
                      key={key}
                      onClick={() => !hasAnswered && submitAnswer(key)}
                      disabled={hasAnswered}
                      className={`p-6 h-auto text-left justify-start ${
                        isCorrect ? 'bg-green-600 hover:bg-green-600' : 
                        isWrong ? 'bg-red-600 hover:bg-red-600' : 
                        isSelected ? 'bg-blue-600 hover:bg-blue-600' : 
                        'bg-white/20 hover:bg-white/30'
                      } text-white border-white/30`}
                      data-testid={`button-answer-${key}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-2xl">{key.toUpperCase()}</span>
                        <span className="text-lg">{value}</span>
                        {showAnswer && isCorrect && <CheckCircle className="w-6 h-6 text-green-300 ml-auto" />}
                        {showAnswer && isWrong && <XCircle className="w-6 h-6 text-red-300 ml-auto" />}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Show result after answering */}
              {showAnswer && (
                <div className="mt-6 p-4 bg-white/10 rounded-lg">
                  <p className="text-white text-lg font-semibold">
                    {selectedAnswer === currentQuestion.correct ? '✅ Correct!' : '❌ Incorrect'}
                  </p>
                  <p className="text-white/80">
                    The correct answer is: {currentQuestion.correct.toUpperCase()} - {currentQuestion.options[currentQuestion.correct]}
                  </p>
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <p className="text-white/60 mt-2">Next question in 3 seconds...</p>
                  ) : (
                    <p className="text-white/60 mt-2">Quiz complete! Showing results in 3 seconds...</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results Phase
  if (gamePhase === 'results') {
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Results Header */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-4xl text-white text-center flex items-center justify-center space-x-4">
                <Trophy className="w-12 h-12 text-yellow-400" />
                <span>Quiz Complete!</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white" data-testid="text-player-name">
                    {name}
                  </h2>
                  <div className="text-6xl font-black text-white" data-testid="text-final-score">
                    {score}/{totalQuestions}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {percentage}%
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xl text-white">
                    {percentage >= 80 ? '🎉 Excellent work!' :
                     percentage >= 60 ? '👏 Good job!' :
                     percentage >= 40 ? '📚 Keep studying!' :
                     '💪 Try again!'}
                  </p>
                </div>

                <div className="flex justify-center space-x-4 pt-6">
                  <Button
                    onClick={resetQuiz}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3"
                    data-testid="button-retake-quiz"
                  >
                    Take Quiz Again
                  </Button>
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-bold px-8 py-3"
                    data-testid="button-back-to-learning"
                  >
                    Back to Learning
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Question Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {answers.map((answer, index) => {
                  const question = quizQuestions.find(q => q.id === answer.questionId);
                  if (!question) return null;
                  
                  return (
                    <div
                      key={answer.questionId}
                      className={`p-4 rounded-lg ${
                        answer.correct ? 'bg-green-600/20' : 'bg-red-600/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white font-semibold">
                            Q{index + 1}: {question.question}
                          </p>
                          <p className="text-white/80 mt-1">
                            Your answer: {answer.answer.toUpperCase()} - {question.options[answer.answer]}
                          </p>
                          {!answer.correct && (
                            <p className="text-white/80">
                              Correct answer: {question.correct.toUpperCase()} - {question.options[question.correct]}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {answer.correct ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}