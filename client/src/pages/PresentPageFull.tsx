import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Play, SkipForward, RotateCcw, Trophy, Crown, Medal, Award, Monitor } from 'lucide-react';
import { quizQuestions } from '@shared/quiz-data';
import { supabase, type GameSession, type Player, getGameSession, createGameSession, updateGameSession, subscribeToGameSession, subscribeToPlayers } from '@/lib/supabase';

export default function PresentPageFull() {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const sessionSubscription = useRef<any>(null);
  const playersSubscription = useRef<any>(null);

  const currentQuestion = gameSession && gameSession.phase === 'quiz' ? quizQuestions[gameSession.current_question] : null;

  useEffect(() => {
    initializeSession();
    
    return () => {
      if (sessionSubscription.current) {
        sessionSubscription.current.unsubscribe();
      }
      if (playersSubscription.current) {
        playersSubscription.current.unsubscribe();
      }
    };
  }, []);

  const initializeSession = async () => {
    try {
      let session = await getGameSession('CHEMWITHJ');
      
      if (!session) {
        session = await createGameSession('CHEMWITHJ');
      }
      
      setGameSession(session);
      
      // Subscribe to session updates
      sessionSubscription.current = subscribeToGameSession(session.id, (updatedSession) => {
        setGameSession(updatedSession);
      });
      
      // Subscribe to players updates
      playersSubscription.current = subscribeToPlayers(session.id, (updatedPlayers) => {
        setPlayers(updatedPlayers);
      });
      
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const startQuiz = async () => {
    if (!gameSession) return;
    
    try {
      await updateGameSession(gameSession.id, { 
        phase: 'quiz',
        current_question: 0
      });
      setShowAnswer(false);
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const nextQuestion = async () => {
    if (!gameSession) return;
    
    const next = gameSession.current_question + 1;
    setShowAnswer(false);
    
    try {
      if (next < quizQuestions.length) {
        await updateGameSession(gameSession.id, { 
          current_question: next
        });
      } else {
        await updateGameSession(gameSession.id, { 
          phase: 'results'
        });
      }
    } catch (error) {
      console.error('Error advancing question:', error);
    }
  };

  const showCorrectAnswer = () => {
    setShowAnswer(true);
  };

  const resetGame = async () => {
    if (!gameSession) return;
    
    try {
      // Clear all players
      await supabase
        .from('players')
        .delete()
        .eq('session_id', gameSession.id);
      
      await updateGameSession(gameSession.id, { 
        phase: 'lobby',
        current_question: 0
      });
      setShowAnswer(false);
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  };

  // Generate colors for HNMR graph bars
  const getPlayerColor = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500',
      'bg-orange-500', 'bg-teal-500', 'bg-lime-500', 'bg-amber-500'
    ];
    return colors[index % colors.length];
  };

  if (!gameSession || gameSession.phase === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-white text-center flex items-center justify-center space-x-4">
                <Users className="w-10 h-10" />
                <span>NMR Quiz Lobby</span>
              </CardTitle>
              <p className="text-white/80 text-center text-xl">
                Students are joining the quiz. Press "Start Quiz" when everyone is ready!
              </p>
            </CardHeader>
          </Card>

          {/* Player Count & Start Button */}
          <div className="flex justify-between items-center">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Users className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-2xl font-bold text-white">{players.length}</p>
                    <p className="text-white/80">Players Connected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button 
                onClick={startQuiz} 
                disabled={players.length === 0}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-xl"
                data-testid="button-start-quiz-presenter"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Quiz
              </Button>
              
              <Button 
                onClick={resetGame}
                variant="outline"
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-4 text-xl"
                data-testid="button-reset-game"
              >
                <RotateCcw className="w-6 h-6 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Player List */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Connected Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {players.map((player, index) => (
                  <div 
                    key={player.id}
                    className="bg-white/20 rounded-lg p-4 text-center"
                  >
                    <div className={`w-12 h-12 ${getPlayerColor(index)} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-white text-sm font-medium truncate">{player.name}</p>
                  </div>
                ))}
              </div>
              {players.length === 0 && (
                <p className="text-white/60 text-center py-8 text-lg">
                  Waiting for students to join...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameSession.phase === 'quiz') {
    const maxScore = Math.max(...players.map(p => p.score), quizQuestions.length);
    const graphHeight = 400;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Question Display */}
          {currentQuestion && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-white mb-4">
                      Question {gameSession.current_question + 1} of {quizQuestions.length}
                    </CardTitle>
                    <p className="text-xl text-white mb-6 leading-relaxed break-words">{currentQuestion.question}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(currentQuestion.options).map(([key, value]) => {
                        const isCorrect = showAnswer && key === currentQuestion.correct;
                        
                        return (
                          <div key={key} className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            isCorrect 
                              ? 'bg-green-600/30 border-green-400 shadow-lg shadow-green-400/20' 
                              : 'bg-white/20 border-white/30'
                          }`}>
                            <p className="text-white break-words">
                              <span className="font-bold">{key.toUpperCase()})</span> {value as string}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* HNMR-Style Graph */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">Live Scores - NMR Spectrum Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative" style={{ height: `${graphHeight + 100}px` }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-20 flex flex-col justify-between text-white/60 text-sm">
                  {Array.from({ length: maxScore + 1 }, (_, i) => maxScore - i).map(score => (
                    <div key={score} className="flex items-center">
                      <span className="w-8 text-right">{score}</span>
                      <div className="w-2 h-px bg-white/30 ml-2"></div>
                    </div>
                  ))}
                </div>

                {/* Graph area */}
                <div className="ml-16 mr-4 h-full relative">
                  {/* Grid lines */}
                  {Array.from({ length: maxScore + 1 }, (_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-full border-t border-white/20" 
                      style={{ top: `${(i / maxScore) * graphHeight}px` }}
                    ></div>
                  ))}

                  {/* Player bars */}
                  <div className="absolute bottom-20 left-0 right-0 flex items-end justify-center space-x-2">
                    {players.map((player, index) => {
                      const barHeight = maxScore > 0 ? (player.score / maxScore) * graphHeight : 0;
                      return (
                        <div key={player.id} className="flex flex-col items-center space-y-2">
                          <div 
                            className={`${getPlayerColor(index)} rounded-t-md transition-all duration-500 min-w-12 flex items-end justify-center text-white font-bold text-sm pb-2`}
                            style={{ 
                              height: `${Math.max(barHeight, 20)}px`,
                              width: Math.max(200 / players.length, 40) + 'px'
                            }}
                          >
                            {player.score > 0 && player.score}
                          </div>
                          <p className="text-white text-xs font-medium text-center max-w-16 truncate">
                            {player.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* X-axis */}
                  <div className="absolute bottom-0 left-0 right-0 border-t border-white/60 h-20"></div>
                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-6">
                {!showAnswer && currentQuestion && (
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
                  {gameSession.current_question < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameSession.phase === 'results') {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-blue-900 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-5xl font-bold text-white text-center flex items-center justify-center space-x-4">
                <Trophy className="w-12 h-12 text-yellow-400" />
                <span>Quiz Results!</span>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Podium - Top 3 */}
          {sortedPlayers.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-3xl text-white text-center">🏆 Top 3 Winners 🏆</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-end space-x-8">
                  {/* Second Place */}
                  {sortedPlayers[1] && (
                    <div className="text-center">
                      <div className="bg-gray-400 rounded-t-lg h-32 w-32 flex flex-col items-center justify-center mb-4">
                        <Medal className="w-8 h-8 text-white mb-2" />
                        <span className="text-white font-bold text-3xl">2</span>
                      </div>
                      <h3 className="text-white text-xl font-bold">{sortedPlayers[1].name}</h3>
                      <p className="text-white/80">{sortedPlayers[1].score} / {quizQuestions.length}</p>
                      <p className="text-white/60 text-sm">{((sortedPlayers[1].score / quizQuestions.length) * 100).toFixed(1)}%</p>
                    </div>
                  )}

                  {/* First Place */}
                  {sortedPlayers[0] && (
                    <div className="text-center">
                      <div className="bg-yellow-500 rounded-t-lg h-40 w-36 flex flex-col items-center justify-center mb-4">
                        <Crown className="w-10 h-10 text-white mb-2" />
                        <span className="text-white font-bold text-4xl">1</span>
                      </div>
                      <h3 className="text-white text-2xl font-bold">{sortedPlayers[0].name}</h3>
                      <p className="text-white/80 text-lg">{sortedPlayers[0].score} / {quizQuestions.length}</p>
                      <p className="text-white/60">{((sortedPlayers[0].score / quizQuestions.length) * 100).toFixed(1)}%</p>
                    </div>
                  )}

                  {/* Third Place */}
                  {sortedPlayers[2] && (
                    <div className="text-center">
                      <div className="bg-orange-600 rounded-t-lg h-24 w-28 flex flex-col items-center justify-center mb-4">
                        <Award className="w-6 h-6 text-white mb-1" />
                        <span className="text-white font-bold text-2xl">3</span>
                      </div>
                      <h3 className="text-white text-lg font-bold">{sortedPlayers[2].name}</h3>
                      <p className="text-white/80">{sortedPlayers[2].score} / {quizQuestions.length}</p>
                      <p className="text-white/60 text-sm">{((sortedPlayers[2].score / quizQuestions.length) * 100).toFixed(1)}%</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reset Button */}
          <div className="flex justify-center">
            <Button 
              onClick={resetGame}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl"
              data-testid="button-new-game"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              Start New Game
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}