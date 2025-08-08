import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isAnalyzing: boolean;
}

export function ImageUpload({ onImageSelect, isAnalyzing }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      onImageSelect(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card 
      className={cn(
        "p-8 border-2 border-dashed transition-all duration-300 cursor-pointer card-gradient shadow-warm",
        isDragOver 
          ? "border-saffron bg-turmeric/10 shadow-glow" 
          : "border-accent hover:border-saffron hover:shadow-glow",
        isAnalyzing && "pointer-events-none opacity-60"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFileDialog}
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          {isAnalyzing ? (
            <RotateCcw className="w-16 h-16 text-saffron animate-spin" />
          ) : (
            <div className="relative">
              <Upload className="w-16 h-16 text-saffron animate-float" />
              <Camera className="w-6 h-6 text-turmeric absolute -bottom-1 -right-1" />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-masala">
            {isAnalyzing ? "Analyzing Your Chapathi..." : "Upload Your Chapathi"}
          </h3>
          <p className="text-muted-foreground text-lg">
            {isAnalyzing 
              ? "Getting ready to roast your circular masterpiece! 🔥"
              : "Drag & drop your chapathi photo here or click to browse"
            }
          </p>
        </div>

        {!isAnalyzing && (
          <Button variant="secondary" size="lg" className="transition-bounce hover:scale-105">
            <Upload className="w-5 h-5 mr-2" />
            Choose Photo
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </Card>
  );
}