import { Card, CardContent } from '@/components/ui/card';

export function WelcomeBox() {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl">
      <CardContent className="pt-8 pb-8 px-8 text-center">
        {/* Animated Hand Pointing Up */}
        <div className="mb-6">
          <div className="inline-block animate-bounce">
            <svg 
              className="w-16 h-16 mx-auto text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L13.5 5.5L17 7L13.5 8.5L12 12L10.5 8.5L7 7L10.5 5.5L12 2Z" />
              <path d="M8 16L9 17L12 14L15 17L16 16L12 12L8 16Z" />
            </svg>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Welcome to the Class
          </h1>
          <p className="text-xl md:text-2xl text-primary font-semibold">
            by Jordan Rodrigues
          </p>
          <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
            Please listen to your instructor for details
          </p>
        </div>

        {/* Chemistry decoration */}
        <div className="mt-6 flex justify-center space-x-4 opacity-30">
          <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-chart-3 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          <div className="w-2 h-2 bg-chart-4 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
        </div>
      </CardContent>
    </Card>
  );
}