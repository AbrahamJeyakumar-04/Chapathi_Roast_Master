import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Trophy, Target, MessageSquare } from 'lucide-react';

interface AnalysisResult {
  perfection: number;
  roastMessage: string;
  direction?: string;
  issueType?: string;
  imageUrl: string;
  analyzedImageUrl?: string;
}

interface ResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function ResultDisplay({ result, onReset }: ResultDisplayProps) {
  const getPerfectionLevel = (perfection: number) => {
    if (perfection > 90) return { level: "Master Chef", color: "bg-mint", icon: Trophy };
    if (perfection > 75) return { level: "Good Effort", color: "bg-turmeric", icon: Target };
    return { level: "Needs Practice", color: "bg-destructive", icon: MessageSquare };
  };

  const { level, color, icon: Icon } = getPerfectionLevel(result.perfection);

  return (
    <div className="space-y-6">
      <Card className="p-6 result-gradient shadow-warm border-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={`${color} text-white px-4 py-2 text-lg`}>
              <Icon className="w-5 h-5 mr-2" />
              {level}
            </Badge>
            <div className="text-right">
              <div className="text-3xl font-bold text-masala">{result.perfection.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Roundness Score</div>
            </div>
          </div>

          <div className="text-center p-4 bg-white/80 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-masala mb-2">The Verdict:</h3>
            <p className="text-lg text-curry italic leading-relaxed">
              "{result.roastMessage}"
            </p>
          </div>

          {result.direction && result.issueType && (
            <div className="flex gap-2 flex-wrap justify-center">
              <Badge variant="outline" className="text-curry border-curry">
                Issue: {result.direction} side {result.issueType}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Original Image */}
        <Card className="p-4 card-gradient shadow-warm">
          <h3 className="text-center font-semibold text-masala mb-2">Original Chapathi</h3>
          <div className="aspect-square w-full rounded-lg overflow-hidden">
            <img 
              src={result.imageUrl} 
              alt="Original chapathi" 
              className="w-full h-full object-cover"
            />
          </div>
        </Card>

        {/* Analyzed Image with Circle */}
        <Card className="p-4 card-gradient shadow-warm">
          <h3 className="text-center font-semibold text-masala mb-2">
            Analysis Results
            <span className="block text-xs text-muted-foreground mt-1">
              Green: Perfect Circle | Red: Actual Shape
            </span>
          </h3>
          <div className="aspect-square w-full rounded-lg overflow-hidden">
            <img 
              src={result.analyzedImageUrl || result.imageUrl} 
              alt="Analyzed chapathi with virtual circle" 
              className="w-full h-full object-cover"
            />
          </div>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={onReset}
          size="lg"
          className="hero-gradient text-white transition-bounce hover:scale-105 shadow-warm"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Analyze Another Chapathi
        </Button>
      </div>
    </div>
  );
}