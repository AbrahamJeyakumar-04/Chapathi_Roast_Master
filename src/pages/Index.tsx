import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ResultDisplay } from '@/components/ResultDisplay';
import { analyzeChapathi } from '@/utils/chapathiAnalyzer';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Sparkles } from 'lucide-react';

interface AnalysisResult {
  perfection: number;
  roastMessage: string;
  direction?: string;
  issueType?: string;
  imageUrl: string;
  analyzedImageUrl?: string;
}

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    try {
      setIsAnalyzing(true);
      
      // Create image element
      const img = new Image();
      const imageUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        try {
          const analysis = analyzeChapathi(img);
          
          setResult({
            ...analysis,
            imageUrl
          });
          
          toast({
            title: "Analysis Complete! 🔥",
            description: "Your chapathi has been thoroughly roasted!",
          });
        } catch (error) {
          console.error('Analysis error:', error);
          toast({
            title: "Analysis Failed",
            description: "Could not analyze the chapathi. Please try a different image.",
            variant: "destructive",
          });
        } finally {
          setIsAnalyzing(false);
        }
      };
      
      img.onerror = () => {
        setIsAnalyzing(false);
        toast({
          title: "Image Load Error",
          description: "Could not load the image. Please try again.",
          variant: "destructive",
        });
      };
      
      img.src = imageUrl;
    } catch (error) {
      setIsAnalyzing(false);
      toast({
        title: "Upload Error",
        description: "Could not process the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="hero-gradient text-white py-8 shadow-warm">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="w-12 h-12 animate-float" />
            <h1 className="text-5xl font-bold">Chapathi Roast Master</h1>
            <Sparkles className="w-8 h-8 animate-pulse-glow" />
          </div>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Upload your chapathi and get brutally honest feedback from our South Indian Roast Engine! 
            We'll analyze the roundness and deliver the spiciest roasts this side of Chennai.
          </p>
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            <Badge className="bg-white/20 text-white border-white/30">AI-Powered Analysis</Badge>
            <Badge className="bg-white/20 text-white border-white/30">South Indian Sass</Badge>
            <Badge className="bg-white/20 text-white border-white/30">100% Authentic Roasts</Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {!result ? (
            <div className="space-y-6">
              <ImageUpload onImageSelect={handleImageSelect} isAnalyzing={isAnalyzing} />
              
              {/* Info Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 card-gradient shadow-warm">
                  <h3 className="font-semibold text-masala mb-2">How it works:</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI analyzes your chapathi's roundness using advanced geometry 
                    and delivers authentic South Indian roasts based on perfection score.
                  </p>
                </Card>
                <Card className="p-4 card-gradient shadow-warm">
                  <h3 className="font-semibold text-masala mb-2">Pro Tips:</h3>
                  <p className="text-sm text-muted-foreground">
                    Take a clear photo against a contrasting background for best results. 
                    The roastier the feedback, the more you need to practice! 😄
                  </p>
                </Card>
              </div>
            </div>
          ) : (
            <ResultDisplay result={result} onReset={handleReset} />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-secondary/30 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Made with ❤️ and a healthy dose of South Indian humor</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
