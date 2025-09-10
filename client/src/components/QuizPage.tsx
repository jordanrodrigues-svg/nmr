import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Zap, Star, Rocket, Clock, Users, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { quizQuestions, type Player, type GameState } from '@shared/quiz-data';

interface QuizPageProps {
  onBack: () => void;
}

export function QuizPage({ onBack }: QuizPageProps) {
  const [name, setName] = useState('');
  const [gamePhase, setGamePhase] = useState<'join' | 'waiting' | 'quiz' | 'results'>('join');
  const [gameState, setGameState] = useState<GameState>({ phase: 'lobby', currentQuestion: 0, players: [] });
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [finalResults, setFinalResults] = useState<any[]>([]);
  const [playerId, setPlayerId] = useState<string>('');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const connectToQuiz = () => {
    if (!name.trim()) return;
    
    // Connect to WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/quiz`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('Connected to quiz WebSocket');
      // Generate a unique player ID and join
      const id = Math.random().toString(36).substr(2, 9);
      setPlayerId(id);
      
      ws.current?.send(JSON.stringify({
        type: 'join',
        data: { id, name: name.trim() }
      }));
      
      setGamePhase('waiting');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'playerIdAssigned':
          // Server sends back the actual player ID to ensure consistency
          console.log('Server assigned player ID:', data.data.playerId);
          setPlayerId(data.data.playerId);
          break;
          
        case 'gameState':
          setGameState(data.data);
          if (data.data.phase === 'quiz') {
            setGamePhase('quiz');
            setCurrentQuestion(quizQuestions[data.data.currentQuestion]);
            setSelectedAnswer('');
            setHasAnswered(false);
          } else if (data.data.phase === 'results') {
            setGamePhase('results');
          }
          break;
          
        case 'quizStarted':
          setGamePhase('quiz');
          setCurrentQuestion(quizQuestions[0]);
          setSelectedAnswer('');
          setHasAnswered(false);
          break;
          
        case 'nextQuestion':
          if (data.data && data.data.question) {
            setCurrentQuestion(data.data.question);
            setSelectedAnswer('');
            setHasAnswered(false);
          }
          break;
          
        case 'quizFinished':
          setFinalResults(data.data.allResults);
          console.log('QuizFinished - Looking for playerId:', playerId);
          console.log('All results:', data.data.allResults);
          const myResult = data.data.allResults.find((r: any) => r.id === playerId);
          console.log('My result found:', myResult);
          if (myResult) {
            setMyScore(myResult.score);
          } else {
            // Fallback: try to find by name as well
            const nameResult = data.data.allResults.find((r: any) => r.name === name);
            if (nameResult) {
              console.log('Found by name instead:', nameResult);
              setMyScore(nameResult.score);
            }
          }
          setGamePhase('results');
          break;
          
        case 'gameReset':
          setGamePhase('waiting');
          setGameState(data.data);
          setCurrentQuestion(null);
          setSelectedAnswer('');
          setHasAnswered(false);
          setMyScore(0);
          setFinalResults([]);
          break;
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from quiz WebSocket');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      alert('Unable to connect to quiz server. Please try again.');
      setGamePhase('join');
    };
  };

  const submitAnswer = (answer: string) => {
    if (hasAnswered || !ws.current) return;
    
    setSelectedAnswer(answer);
    setHasAnswered(true);
    
    ws.current.send(JSON.stringify({
      type: 'submitAnswer',
      data: { 
        playerId, 
        answer, 
        questionIndex: gameState.currentQuestion 
      }
    }));
  };

  const leaveQuiz = () => {
    if (ws.current) {
      ws.current.close();
    }
    setGamePhase('join');
    setName('');
    setGameState({ phase: 'lobby', currentQuestion: 0, players: [] });
    setCurrentQuestion(null);
    setSelectedAnswer('');
    setHasAnswered(false);
    setMyScore(0);
    setFinalResults([]);
    setPlayerId('');
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
                    MULTIPLAYER QUIZ!
                  </span>
                </h1>
                
                <div className="space-y-2">
                  <p className="text-xl font-bold text-black dark:text-gray-900">
                    Enter your name
                  </p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-700">
                    (real names please!!!)
                  </p>
                  <p className="text-lg font-bold text-black dark:text-gray-900">
                    and join live quiz
                  </p>
                </div>
              </div>

              {/* Name input form */}
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your real name here..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && connectToQuiz()}
                  className="h-12 text-lg font-semibold border-4 border-black dark:border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(64,64,64,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[6px_6px_0px_0px_rgba(64,64,64,1)] transition-shadow"
                  data-testid="input-quiz-name"
                />
                
                <Button
                  onClick={connectToQuiz}
                  disabled={!name.trim()}
                  className="w-full h-12 text-lg font-black bg-green-500 dark:bg-green-600 text-white border-4 border-black dark:border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(64,64,64,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-join-quiz"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  JOIN LIVE QUIZ!
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

  // Waiting Phase
  if (gamePhase === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-white text-center flex items-center justify-center space-x-4">
                <Users className="w-10 h-10" />
                <span>Waiting for Quiz to Start...</span>
              </CardTitle>
              <p className="text-white/80 text-center text-xl">
                You're in! Wait for your teacher to start the quiz.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <Clock className="w-8 h-8 text-white animate-spin" />
                  <p className="text-2xl font-bold text-white">Connected as {name}</p>
                </div>
                <p className="text-white/80">Players in lobby: {gameState.players.length}</p>
                
                <div className="mt-8">
                  <Button
                    onClick={leaveQuiz}
                    variant="outline"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    data-testid="button-leave-quiz"
                  >
                    Leave Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  Question {gameState.currentQuestion + 1} of {quizQuestions.length}
                </CardTitle>
                <div className="text-white font-bold text-lg">
                  Your Score: {myScore}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h2 className="text-xl text-white mb-6">{currentQuestion.question}</h2>
              
              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isSelected = selectedAnswer === key;
                  const isCorrect = hasAnswered && key === currentQuestion.correct;
                  const isWrong = hasAnswered && isSelected && key !== currentQuestion.correct;
                  
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
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold ${
                          isSelected ? 'bg-white text-black' : ''
                        }`}>
                          {key.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <span className="text-lg">{value as string}</span>
                        </div>
                        {hasAnswered && (
                          <div>
                            {isCorrect && <CheckCircle className="w-6 h-6 text-green-200" />}
                            {isWrong && <XCircle className="w-6 h-6 text-red-200" />}
                          </div>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {hasAnswered && (
                <div className="mt-6 p-4 bg-white/20 rounded-lg">
                  <p className="text-white text-center">
                    {selectedAnswer === currentQuestion.correct ? '🎉 Correct!' : '❌ Incorrect'}
                    {selectedAnswer !== currentQuestion.correct && (
                      <span className="block mt-2">
                        The correct answer was: {currentQuestion.options[currentQuestion.correct]}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leave Quiz Button */}
          <div className="flex justify-center">
            <Button
              onClick={leaveQuiz}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Leave Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Results Phase
  if (gamePhase === 'results') {
    const myRank = finalResults.findIndex(r => r.id === playerId) + 1;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-white text-center flex items-center justify-center space-x-4">
                <Trophy className="w-10 h-10 text-yellow-400" />
                <span>Quiz Complete!</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="bg-white/20 rounded-lg p-6">
                  <h2 className="text-3xl font-bold text-white mb-2">Your Results</h2>
                  <p className="text-2xl text-white">
                    Score: {myScore} / {quizQuestions.length}
                  </p>
                  <p className="text-xl text-white/80">
                    Rank: #{myRank} out of {finalResults.length} players
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={leaveQuiz}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4"
                    data-testid="button-back-to-learning"
                  >
                    Back to Learning
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}