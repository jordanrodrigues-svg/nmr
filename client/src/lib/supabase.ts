import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test database connection on initialization
console.log('🔗 Initializing Supabase connection...');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Has API key:', !!supabaseAnonKey);

// Test connection by checking if we can query the database
(async () => {
  try {
    const { data, error, count } = await supabase.from('game_sessions').select('id', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('🔍 Error details:', error);
      console.error('💡 Make sure to run the SQL commands to create the tables!');
    } else {
      console.log('✅ Database connection established successfully!');
      console.log('📊 Game sessions table accessible, count:', count);
    }
  } catch (err: any) {
    console.error('❌ Database connection error:', err);
  }
})();

// Also test players table
(async () => {
  try {
    const { data, error, count } = await supabase.from('players').select('id', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Players table not accessible:', error.message);
      console.error('💡 Make sure to run the SQL commands to create the tables!');
    } else {
      console.log('✅ Players table accessible, count:', count);
    }
  } catch (err: any) {
    console.error('❌ Players table error:', err);
  }
})();

// Database types
export interface GameSession {
  id: string;
  session_code: string;
  phase: 'lobby' | 'countdown' | 'quiz' | 'results';
  current_question: number;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  session_id: string;
  name: string;
  score: number;
  answers: any[];
  created_at: string;
  updated_at: string;
}

// Game session management
export async function createGameSession(sessionCode: string): Promise<GameSession> {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      session_code: sessionCode,
      phase: 'lobby',
      current_question: 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getGameSession(sessionCode: string): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('session_code', sessionCode)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateGameSession(sessionId: string, updates: Partial<GameSession>) {
  // Debug logging for troubleshooting constraint violations
  console.log('🔄 updateGameSession called with:');
  console.log('📍 sessionId:', sessionId);
  console.log('📝 updates:', JSON.stringify(updates, null, 2));
  
  const { data, error } = await supabase
    .from('game_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('❌ updateGameSession error details:');
    console.error('🔍 Error object:', JSON.stringify(error, null, 2));
    console.error('📄 Error message:', error.message);
    console.error('🏷️ Error code:', error.code);
    console.error('💾 Error details:', error.details);
    console.error('🔗 Error hint:', error.hint);
    throw error;
  }
  
  console.log('✅ updateGameSession successful:', JSON.stringify(data, null, 2));
  return data;
}

// Player management
export async function joinGame(sessionId: string, playerName: string): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .insert({
      session_id: sessionId,
      name: playerName,
      score: 0,
      answers: []
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionPlayers(sessionId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('session_id', sessionId)
    .order('score', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updatePlayerScore(playerId: string, score: number, answers: any[]) {
  const { data, error } = await supabase
    .from('players')
    .update({ score, answers })
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Real-time subscriptions
export function subscribeToGameSession(sessionId: string, callback: (session: GameSession) => void) {
  console.log('🔗 Setting up session subscription for:', sessionId);
  
  const channel = supabase
    .channel(`session-${sessionId}`)
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
      (payload) => {
        console.log('📡 Session update received:', payload.new);
        callback(payload.new as GameSession);
      }
    )
    .subscribe((status) => {
      console.log('🔌 Session subscription status:', status);
    });
    
  return channel;
}

export function subscribeToPlayers(sessionId: string, callback: (players: Player[]) => void) {
  console.log('🔗 Setting up players subscription for session:', sessionId);
  
  // Get initial players immediately
  (async () => {
    try {
      const initialPlayers = await getSessionPlayers(sessionId);
      console.log('📊 Initial players loaded:', initialPlayers);
      callback(initialPlayers);
    } catch (error) {
      console.error('❌ Failed to load initial players:', error);
    }
  })();
  
  const channel = supabase
    .channel(`players-${sessionId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'players', filter: `session_id=eq.${sessionId}` },
      async (payload) => {
        console.log('📡 Players table change detected:', payload);
        try {
          const players = await getSessionPlayers(sessionId);
          console.log('🔄 Fetched updated players:', players);
          callback(players);
        } catch (error) {
          console.error('❌ Failed to fetch updated players:', error);
        }
      }
    )
    .subscribe((status) => {
      console.log('🔌 Players subscription status:', status);
    });
    
  return channel;
}