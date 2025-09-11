import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Zap, Star, Rocket, Clock, Users, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { quizQuestions } from '@shared/quiz-data';
import { supabase, type GameSession, type Player, getGameSession, joinGame, subscribeToGameSession, subscribeToPlayers, updatePlayerScore } from '@/lib/supabase';

interface MultiplayerQuizPageProps {
  onBack: () => void;
}

export function MultiplayerQuizPage({ onBack }: MultiplayerQuizPageProps) {
  const [name, setName] = useState('');
  const [gamePhase, setGamePhase] = useState<'join' | 'waiting' | 'countdown' | 'quiz' | 'results'>('join');
  const [countdown, setCountdown] = useState(3);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const sessionSubscription = useRef<any>(null);
  const playersSubscription = useRef<any>(null);
  const lastPhaseRef = useRef<string>('lobby');
  const countdownRef = useRef<boolean>(false);
  const countdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionPollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup subscriptions and timers
      if (sessionSubscription.current) {
        sessionSubscription.current.unsubscribe();
      }
      if (playersSubscription.current) {
        playersSubscription.current.unsubscribe();
      }
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (sessionPollingRef.current) {
        clearInterval(sessionPollingRef.current);
      }
    };
  }, []);

  const connectToQuiz = async () => {
    if (!name.trim()) return;
    
    try {
      // Only join existing sessions - do not auto-create (instructor must create from /present)
      let session = await getGameSession('CHEMWITHJ');
      
      if (!session) {
        alert('No active session found. Ask your instructor to start the quiz from the presenter screen (/present)');
        return;
      }
      
      setGameSession(session);
      lastPhaseRef.current = session.phase;
      
      // Handle initial session state for late joiners
      if (session.phase === 'quiz') {
        setGamePhase('quiz');
        setCurrentQuestion(quizQuestions[session.current_question]);
        setSelectedAnswer('');
        setHasAnswered(false);
      } else if (session.phase === 'results') {
        setGamePhase('results');
      } else {
        setGamePhase('waiting');
      }
      
      // Join the game
      console.log('🎮 Attempting to join game with session ID:', session.id, 'and name:', name.trim());
      const player = await joinGame(session.id, name.trim());
      console.log('✅ Player joined successfully:', player);
      setCurrentPlayer(player);
      
      // Subscribe to session updates
      sessionSubscription.current = subscribeToGameSession(session.id, (updatedSession) => {
        console.log('📡 [Student] Received session update via subscription:', updatedSession);
        console.log('📡 [Student] Previous phase:', lastPhaseRef.current, '-> New phase:', updatedSession.phase);
        setGameSession(updatedSession);
        
        // Check if transitioning from lobby/waiting to quiz
        if (lastPhaseRef.current === 'lobby' && updatedSession.phase === 'quiz' && !countdownRef.current) {
          // Trigger countdown animation
          countdownRef.current = true;
          setGamePhase('countdown');
          setCountdown(3);
          
          // Start countdown animation with proper cleanup
          let countdownTimer = 3;
          
          countdownIntervalRef.current = setInterval(() => {
            countdownTimer--;
            setCountdown(countdownTimer);
            if (countdownTimer <= 0) {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            }
          }, 1000);
          
          // After countdown, show the quiz (3000ms to match countdown)
          countdownTimeoutRef.current = setTimeout(() => {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            setGamePhase('quiz');
            setCurrentQuestion(quizQuestions[updatedSession.current_question]);
            setSelectedAnswer('');
            setHasAnswered(false);
            countdownRef.current = false;
          }, 3000);
          
        } else if (updatedSession.phase === 'quiz' && !countdownRef.current) {
          // Direct transition to quiz (no countdown for late joiners or subsequent questions)
          setGamePhase('quiz');
          setCurrentQuestion(quizQuestions[updatedSession.current_question]);
          setSelectedAnswer('');
          setHasAnswered(false);
        } else if (updatedSession.phase === 'results') {
          setGamePhase('results');
        }
        
        // Update last phase reference
        lastPhaseRef.current = updatedSession.phase;
      });
      
      // Subscribe to players updates
      playersSubscription.current = subscribeToPlayers(session.id, (updatedPlayers) => {
        console.log('🔄 [Student] Players list updated:', updatedPlayers);
        setPlayers(updatedPlayers);
      });

      // Add polling fallback for session updates (every 2 seconds for students)
      const pollInterval = setInterval(async () => {
        try {
          const currentSession = await getGameSession('CHEMWITHJ');
          if (currentSession && currentSession.phase !== gameSession?.phase) {
            console.log('🔄 [Student] Polling detected session change:', currentSession.phase);
            
            // Manually trigger the same logic as the subscription
            if (lastPhaseRef.current === 'lobby' && currentSession.phase === 'quiz' && !countdownRef.current) {
              console.log('🎬 [Student] Triggering countdown via polling fallback');
              // Trigger countdown animation
              countdownRef.current = true;
              setGamePhase('countdown');
              setCountdown(3);
              
              // Start countdown animation with proper cleanup
              let countdownTimer = 3;
              
              countdownIntervalRef.current = setInterval(() => {
                countdownTimer--;
                setCountdown(countdownTimer);
                if (countdownTimer <= 0) {
                  if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                }
              }, 1000);
              
              // After countdown, show the quiz (3000ms to match countdown)
              countdownTimeoutRef.current = setTimeout(() => {
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                setGamePhase('quiz');
                setCurrentQuestion(quizQuestions[currentSession.current_question]);
                setSelectedAnswer('');
                setHasAnswered(false);
                countdownRef.current = false;
              }, 3000);
              
            } else if (currentSession.phase === 'quiz' && !countdownRef.current) {
              // Direct transition to quiz (no countdown for late joiners or subsequent questions)
              setGamePhase('quiz');
              setCurrentQuestion(quizQuestions[currentSession.current_question]);
              setSelectedAnswer('');
              setHasAnswered(false);
            } else if (currentSession.phase === 'results') {
              setGamePhase('results');
            }
            
            setGameSession(currentSession);
            lastPhaseRef.current = currentSession.phase;
          }
        } catch (error) {
          console.error('❌ [Student] Session polling failed:', error);
        }
      }, 2000);

      // Store interval for cleanup
      sessionPollingRef.current = pollInterval;
    } catch (error) {
      console.error('Error connecting to quiz:', error);
      alert('Unable to connect to quiz. Please try again.');
    }
  };

  const submitAnswer = async (answer: string) => {
    if (hasAnswered || !currentPlayer || !gameSession || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    setHasAnswered(true);
    
    const isCorrect = answer === currentQuestion.correct;
    const newAnswer = {
      questionId: currentQuestion.id,
      answer,
      correct: isCorrect,
      timeToAnswer: Date.now()
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    
    const newScore = currentPlayer.score + (isCorrect ? 1 : 0);
    
    // Handle offline mode (when session_code is 'OFFLINE')
    if (gameSession.session_code === 'OFFLINE') {
      setCurrentPlayer({ ...currentPlayer, score: newScore, answers: updatedAnswers });
      
      // Auto-advance to next question after 2 seconds in offline mode
      setTimeout(() => {
        const nextQuestionIndex = gameSession.current_question + 1;
        if (nextQuestionIndex < quizQuestions.length) {
          // Move to next question
          setGameSession({
            ...gameSession,
            current_question: nextQuestionIndex
          });
          setCurrentQuestion(quizQuestions[nextQuestionIndex]);
          setSelectedAnswer('');
          setHasAnswered(false);
        } else {
          // Quiz finished - show results
          setGamePhase('results');
        }
      }, 2000);
      return;
    }
    
    // Online mode - update via Supabase
    try {
      await updatePlayerScore(currentPlayer.id, newScore, updatedAnswers);
      setCurrentPlayer({ ...currentPlayer, score: newScore, answers: updatedAnswers });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const leaveQuiz = () => {
    if (sessionSubscription.current) {
      sessionSubscription.current.unsubscribe();
    }
    if (playersSubscription.current) {
      playersSubscription.current.unsubscribe();
    }
    
    setGamePhase('join');
    setName('');
    setGameSession(null);
    setPlayers([]);
    setCurrentPlayer(null);
    setCurrentQuestion(null);
    setSelectedAnswer('');
    setHasAnswered(false);
    setAnswers([]);
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
                  onKeyDown={(e) => e.key === 'Enter' && connectToQuiz()}
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

  // Waiting Phase (Lobby)
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
                <p className="text-white/80">Players in lobby: {players.length}</p>
                
                <div className="mt-8 space-y-4">
                  <Button
                    onClick={leaveQuiz}
                    variant="outline"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    data-testid="button-leave-quiz"
                  >
                    Leave Quiz
                  </Button>
                  
                  {/* Discrete failsafe link */}
                  <div className="text-center">
                    <button
                      onClick={() => {
                        // Start quiz in passive mode (offline without real-time functionality)
                        setGamePhase('quiz');
                        setCurrentQuestion(quizQuestions[0]);
                        setSelectedAnswer('');
                        setHasAnswered(false);
                        // Create offline session
                        setGameSession({
                          id: 'offline',
                          session_code: 'OFFLINE',
                          phase: 'quiz',
                          current_question: 0,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        });
                        setCurrentPlayer({
                          id: 'offline-player',
                          session_id: 'offline',
                          name: name.trim() || 'Student',
                          score: 0,
                          answers: [],
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        });
                      }}
                      className="text-white/50 hover:text-white/70 text-xs underline transition-colors"
                      data-testid="link-failsafe-backup"
                    >
                      Game not starting? Click here for offline mode
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Countdown Phase - Fun animation before quiz starts!
  if (gamePhase === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 p-6 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Floating chemistry elements */}
          <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-20 right-20 w-12 h-12 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 bg-green-400 rounded-full animate-spin" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-40 right-40 w-14 h-14 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-10 h-10 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-18 h-18 bg-indigo-400 rounded-full animate-spin" style={{ animationDelay: '1.2s' }}></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
          {/* Main countdown display */}
          <div className="text-center space-y-8">
            {/* Quiz starting message */}
            <div className="space-y-4">
              <h1 className="text-6xl font-black text-white animate-pulse">
                🚀 QUIZ STARTING! 🚀
              </h1>
              <p className="text-2xl text-yellow-300 font-bold animate-bounce">
                Get ready to show your chemistry knowledge!
              </p>
            </div>

            {/* Countdown number with massive animation */}
            <div className="relative">
              {countdown > 0 ? (
                <div 
                  key={countdown}
                  className="text-[20rem] font-black text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.5)] animate-pulse"
                  style={{
                    textShadow: '0 0 100px #ff6b6b, 0 0 200px #ff6b6b, 0 0 300px #ff6b6b',
                    animation: 'countdownPulse 1s ease-in-out'
                  }}
                >
                  {countdown}
                </div>
              ) : (
                <div className="text-8xl font-black text-green-400 animate-bounce">
                  ✨ GO! ✨
                </div>
              )}
            </div>

            {/* Player info */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30">
              <p className="text-xl text-white font-bold">
                Ready, <span className="text-yellow-300">{name}</span>? 
              </p>
              <p className="text-white/80">
                {players.length} student{players.length !== 1 ? 's' : ''} in this epic chemistry battle!
              </p>
            </div>
          </div>
        </div>

        {/* Custom CSS for countdown animation */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes countdownPulse {
              0% { transform: scale(0.8); opacity: 0.5; }
              50% { transform: scale(1.2); opacity: 1; }
              100% { transform: scale(1); opacity: 0.9; }
            }
          `
        }} />
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
                  Question {(gameSession?.current_question || 0) + 1} of {quizQuestions.length}
                </CardTitle>
                <div className="text-white font-bold text-lg">
                  Your Score: {currentPlayer?.score || 0}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h2 className="text-xl text-white leading-relaxed break-words" data-testid="text-question">
                  {currentQuestion.question}
                </h2>
              </div>
              
              {/* Answer Options */}
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isSelected = selectedAnswer === key;
                  const isCorrect = hasAnswered && key === currentQuestion.correct;
                  const isWrong = hasAnswered && isSelected && key !== currentQuestion.correct;
                  
                  return (
                    <Button
                      key={key}
                      onClick={() => !hasAnswered && submitAnswer(key)}
                      disabled={hasAnswered}
                      className={`p-6 h-auto text-left justify-start min-h-[4rem] ${
                        isCorrect ? 'bg-green-600 hover:bg-green-600' : 
                        isWrong ? 'bg-red-600 hover:bg-red-600' : 
                        isSelected ? 'bg-blue-600 hover:bg-blue-600' : 
                        'bg-white/20 hover:bg-white/30'
                      } text-white border-white/30`}
                      data-testid={`button-answer-${key}`}
                    >
                      <div className="flex items-start space-x-4 w-full">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {key.toUpperCase()}
                        </div>
                        <span className="text-lg leading-relaxed break-words flex-1 text-left">{value as string}</span>
                        <div className="flex-shrink-0">
                          {hasAnswered && isCorrect && <CheckCircle className="w-6 h-6 text-green-300" />}
                          {hasAnswered && isWrong && <XCircle className="w-6 h-6 text-red-300" />}
                        </div>
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
                  <p className="text-white/60 text-center mt-2">
                    Waiting for next question...
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
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const myRank = sortedPlayers.findIndex(p => p.id === currentPlayer?.id) + 1;
    
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
                    Score: {currentPlayer?.score || 0} / {quizQuestions.length}
                  </p>
                  <p className="text-xl text-white/80">
                    Rank: #{myRank} out of {players.length} players
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