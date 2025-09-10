import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { quizQuestions, type Player, type GameState } from "../shared/quiz-data";
import { storage } from "./storage";

// Global game state
let gameState: GameState = {
  phase: 'lobby',
  currentQuestion: 0,
  players: []
};

interface ExtendedWebSocket extends WebSocket {
  playerId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup WebSocket server for real-time quiz functionality on a specific path
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws/quiz'
  });

  const broadcastToAll = (data: any) => {
    wss.clients.forEach((client: ExtendedWebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('New WebSocket connection');

    // Send current game state to new connection
    ws.send(JSON.stringify({
      type: 'gameState',
      data: gameState
    }));

    ws.on('close', () => {
      // Remove disconnected player from game state
      if (ws.playerId) {
        const playerIndex = gameState.players.findIndex(p => p.id === ws.playerId);
        if (playerIndex >= 0) {
          gameState.players.splice(playerIndex, 1);
          
          // Broadcast updated lobby to all remaining clients
          broadcastToAll({
            type: 'lobbyUpdate',
            data: gameState.players
          });

          // Update scores if quiz is in progress
          if (gameState.phase === 'quiz') {
            broadcastToAll({
              type: 'scoresUpdate',
              data: gameState.players.map(p => ({
                id: p.id,
                name: p.name,
                score: p.score
              }))
            });
          }
        }
        console.log(`Player ${ws.playerId} disconnected and removed from game`);
      }
    });

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case 'join':
            // Add player to lobby
            const playerName = data.data.name;
            const clientPlayerId = data.data.id;
            console.log(`Join request: name=${playerName}, clientId=${clientPlayerId}`);
            
            const existingPlayerIndex = gameState.players.findIndex(p => p.name === playerName);
            let playerId: string;

            if (existingPlayerIndex >= 0) {
              // Player rejoining
              playerId = gameState.players[existingPlayerIndex].id;
              ws.playerId = playerId;
              console.log(`Player ${playerName} rejoining with id: ${playerId}`);
            } else {
              // New player - use client ID if provided, otherwise generate
              playerId = clientPlayerId || Math.random().toString(36).substr(2, 9);
              const newPlayer: Player = {
                id: playerId,
                name: playerName,
                score: 0,
                answers: []
              };
              gameState.players.push(newPlayer);
              ws.playerId = playerId;
              console.log(`New player ${playerName} added with id: ${playerId}`);
            }

            // Send the assigned player ID back to the client to ensure consistency
            ws.send(JSON.stringify({
              type: 'playerIdAssigned',
              data: { playerId: playerId }
            }));

            // Broadcast updated lobby to all clients
            broadcastToAll({
              type: 'lobbyUpdate',
              data: gameState.players
            });
            break;

          case 'startQuiz':
            // Only allow starting quiz from presenter (check if request comes from /present page)
            gameState.phase = 'quiz';
            gameState.currentQuestion = 0;
            gameState.startTime = Date.now();
            
            broadcastToAll({
              type: 'quizStarted',
              data: {
                question: quizQuestions[0],
                questionNumber: 1,
                totalQuestions: quizQuestions.length
              }
            });
            break;

          case 'submitAnswer':
            if (gameState.phase === 'quiz' && ws.playerId) {
              const player = gameState.players.find(p => p.id === ws.playerId);
              if (player) {
                const currentQ = quizQuestions[gameState.currentQuestion];
                const isCorrect = data.data.answer === currentQ.correct;
                const timeToAnswer = Date.now() - (gameState.startTime || 0);

                // Record answer
                player.answers.push({
                  questionId: currentQ.id,
                  answer: data.data.answer,
                  correct: isCorrect,
                  timeToAnswer
                });

                // Update score
                if (isCorrect) {
                  player.score += 1;
                }

                // Send individual feedback
                ws.send(JSON.stringify({
                  type: 'answerFeedback',
                  data: {
                    correct: isCorrect,
                    correctAnswer: currentQ.correct,
                    score: player.score
                  }
                }));

                // Update presenter with live scores
                broadcastToAll({
                  type: 'scoresUpdate',
                  data: gameState.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    score: p.score
                  }))
                });
              }
            }
            break;

          case 'nextQuestion':
            if (gameState.phase === 'quiz') {
              gameState.currentQuestion += 1;
              
              if (gameState.currentQuestion < quizQuestions.length) {
                gameState.startTime = Date.now();
                broadcastToAll({
                  type: 'nextQuestion',
                  data: {
                    question: quizQuestions[gameState.currentQuestion],
                    questionNumber: gameState.currentQuestion + 1,
                    totalQuestions: quizQuestions.length
                  }
                });
              } else {
                // Quiz finished
                gameState.phase = 'results';
                
                // Calculate percentiles and leaderboard
                const sortedPlayers = gameState.players.sort((a, b) => b.score - a.score);
                const results = sortedPlayers.map((player, index) => {
                  const percentage = (player.score / quizQuestions.length) * 100;
                  const percentile = ((sortedPlayers.length - index - 1) / sortedPlayers.length) * 100;
                  
                  return {
                    ...player,
                    position: index + 1,
                    percentage,
                    percentile: Math.round(percentile)
                  };
                });

                broadcastToAll({
                  type: 'quizFinished',
                  data: {
                    leaderboard: results.slice(0, 3),
                    allResults: results
                  }
                });
              }
            }
            break;

          case 'resetGame':
            gameState = {
              phase: 'lobby',
              currentQuestion: 0,
              players: []
            };
            
            broadcastToAll({
              type: 'gameReset',
              data: gameState
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
