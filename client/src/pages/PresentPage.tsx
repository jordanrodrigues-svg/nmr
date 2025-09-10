import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Play, SkipForward, RotateCcw, Trophy, Crown, Medal, Award } from 'lucide-react';
import { quizQuestions, type Player, type GameState } from '@shared/quiz-data';

interface QuestionData {
  question: any;
  questionNumber: number;
  totalQuestions: number;
}

export default function PresentPage() {
  const [gameState, setGameState] = useState<GameState>({ phase: 'lobby', currentQuestion: 0, players: [] });
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/quiz`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('Connected to quiz WebSocket server');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'gameState':
          setGameState(data.data);
          break;
          
        case 'lobbyUpdate':
          setGameState((prev: GameState) => ({ ...prev, players: data.data }));
          break;
          
        case 'scoresUpdate':
          setGameState((prev: GameState) => ({ 
            ...prev, 
            players: prev.players.map((p: Player) => {
              const updated = data.data.find((u: any) => u.id === p.id);
              return updated ? { ...p, score: updated.score } : p;
            })
          }));
          break;
          
        case 'quizFinished':
          setLeaderboard(data.data.leaderboard);
          setAllResults(data.data.allResults);
          setGameState((prev: GameState) => ({ ...prev, phase: 'results' }));
          break;
          
        case 'gameReset':
          setGameState(data.data);
          setCurrentQuestion(null);
          setLeaderboard([]);
          setAllResults([]);
          break;
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from quiz WebSocket server');
    };

    ws.current.onerror = (error) => {
      console.error('PresentPage WebSocket error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const startQuiz = () => {
    sendMessage({ type: 'startQuiz' });
    setCurrentQuestion({
      question: quizQuestions[0],
      questionNumber: 1,
      totalQuestions: quizQuestions.length
    });
    setGameState((prev: GameState) => ({ ...prev, phase: 'quiz', currentQuestion: 0 }));
  };

  const nextQuestion = () => {
    const next = gameState.currentQuestion + 1;
    if (next < quizQuestions.length) {
      sendMessage({ type: 'nextQuestion' });
      setCurrentQuestion({
        question: quizQuestions[next],
        questionNumber: next + 1,
        totalQuestions: quizQuestions.length
      });
      setGameState((prev: GameState) => ({ ...prev, currentQuestion: next }));
    } else {
      sendMessage({ type: 'nextQuestion' });
    }
  };

  const resetGame = () => {
    sendMessage({ type: 'resetGame' });
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

  if (gameState.phase === 'lobby') {
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
                    <p className="text-2xl font-bold text-white">{gameState.players.length}</p>
                    <p className="text-white/80">Players Connected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button 
                onClick={startQuiz} 
                disabled={gameState.players.length === 0}
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
                {gameState.players.map((player: Player, index: number) => (
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
              {gameState.players.length === 0 && (
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

  if (gameState.phase === 'quiz') {
    const maxScore = Math.max(...gameState.players.map(p => p.score), quizQuestions.length);
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
                      Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
                    </CardTitle>
                    <p className="text-xl text-white mb-6">{(currentQuestion.question as any).question}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(currentQuestion.question.options).map(([key, value]) => (
                        <div key={key} className="bg-white/20 rounded-lg p-4">
                          <p className="text-white"><span className="font-bold">{key.toUpperCase()})</span> {value}</p>
                        </div>
                      ))}
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
                    {gameState.players.map((player: Player, index: number) => {
                      const barHeight = maxScore > 0 ? (player.score / maxScore) * graphHeight : 0;
                      return (
                        <div key={player.id} className="flex flex-col items-center space-y-2">
                          <div 
                            className={`${getPlayerColor(index)} rounded-t-md transition-all duration-500 min-w-12 flex items-end justify-center text-white font-bold text-sm pb-2`}
                            style={{ 
                              height: `${Math.max(barHeight, 20)}px`,
                              width: Math.max(200 / gameState.players.length, 40) + 'px'
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
                <Button 
                  onClick={nextQuestion}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xl"
                  data-testid="button-next-question"
                >
                  <SkipForward className="w-6 h-6 mr-2" />
                  {gameState.currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
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

  if (gameState.phase === 'results') {
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
          {leaderboard.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-3xl text-white text-center">🏆 Top 3 Winners 🏆</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-end space-x-8">
                  {/* Second Place */}
                  {leaderboard[1] && (
                    <div className="text-center">
                      <div className="bg-gray-400 rounded-t-lg h-32 w-32 flex flex-col items-center justify-center mb-4">
                        <Medal className="w-8 h-8 text-white mb-2" />
                        <span className="text-white font-bold text-3xl">2</span>
                      </div>
                      <h3 className="text-white text-xl font-bold">{leaderboard[1].name}</h3>
                      <p className="text-white/80">{leaderboard[1].score} / {quizQuestions.length}</p>
                      <p className="text-white/60 text-sm">{leaderboard[1].percentage.toFixed(1)}%</p>
                    </div>
                  )}

                  {/* First Place */}
                  {leaderboard[0] && (
                    <div className="text-center">
                      <div className="bg-yellow-500 rounded-t-lg h-40 w-36 flex flex-col items-center justify-center mb-4">
                        <Crown className="w-10 h-10 text-white mb-2" />
                        <span className="text-white font-bold text-4xl">1</span>
                      </div>
                      <h3 className="text-white text-2xl font-bold">{leaderboard[0].name}</h3>
                      <p className="text-white/80 text-lg">{leaderboard[0].score} / {quizQuestions.length}</p>
                      <p className="text-white/60">{leaderboard[0].percentage.toFixed(1)}%</p>
                    </div>
                  )}

                  {/* Third Place */}
                  {leaderboard[2] && (
                    <div className="text-center">
                      <div className="bg-orange-600 rounded-t-lg h-24 w-28 flex flex-col items-center justify-center mb-4">
                        <Award className="w-6 h-6 text-white mb-1" />
                        <span className="text-white font-bold text-2xl">3</span>
                      </div>
                      <h3 className="text-white text-lg font-bold">{leaderboard[2].name}</h3>
                      <p className="text-white/80">{leaderboard[2].score} / {quizQuestions.length}</p>
                      <p className="text-white/60 text-sm">{leaderboard[2].percentage.toFixed(1)}%</p>
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