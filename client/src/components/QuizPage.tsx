import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Zap, Star, Rocket } from 'lucide-react';

interface QuizPageProps {
  onBack: () => void;
}

export function QuizPage({ onBack }: QuizPageProps) {
  const [name, setName] = useState('');

  const handleJoinQuiz = () => {
    if (name.trim()) {
      // For now, just show an alert - the user said they'll handle the actual quiz functionality later
      alert(`Welcome ${name}! Quiz functionality coming soon...`);
    }
  };

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
                  QUIZ TIME!
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
                  and join quiz
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
                className="h-12 text-lg font-semibold border-4 border-black dark:border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(64,64,64,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[6px_6px_0px_0px_rgba(64,64,64,1)] transition-shadow"
                data-testid="input-quiz-name"
              />
              
              <Button
                onClick={handleJoinQuiz}
                disabled={!name.trim()}
                className="w-full h-12 text-lg font-black bg-green-500 dark:bg-green-600 text-white border-4 border-black dark:border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(64,64,64,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-join-quiz"
              >
                <Rocket className="w-5 h-5 mr-2" />
                JOIN THE QUIZ!
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