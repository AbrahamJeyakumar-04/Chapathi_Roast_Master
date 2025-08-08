interface AnalysisResult {
  perfection: number;
  roastMessage: string;
  direction?: string;
  issueType?: string;
}

const roastBank = {
  high: [
    "Aiyyo pa! This chapathi is rounder than Amma's steel tiffin lid.",
    "Perfect da! Even filter coffee foam can't be this consistent.",
    "Super! If this was dosa, hotel owner would give you free sambar refill.",
    "Wah! This chapathi is so perfect, even Chennai aunties would approve.",
    "Excellent work! This chapathi deserves a place in Saravana Bhavan."
  ],
  medium: [
    "Hmm… okay okay. But {direction} side {issueType}, roll properly pa.",
    "Appa will eat it, but he will still compare it to patti's chapathi.",
    "{direction} side is {issueType}… even idli is laughing at the shape.",
    "Not bad da, but my neighbor's cat could make it rounder.",
    "Decent attempt! But temple prasadam has better geometry than this."
  ],
  low: [
    "Dei! Is this chapathi or map of Sri Lanka after cyclone?",
    "{direction} side is {issueType}. Even dosa master will reject this.",
    "Aiyyo! If you serve this to in-laws, they'll send you back with just coconut chutney.",
    "What is this shape pa? Looks like autorickshaw ran over it twice!",
    "Even my engineering drawing was more circular than this chapathi!"
  ]
};

function getRandomRoast(perfection: number, direction?: string, issueType?: string): string {
  let category: keyof typeof roastBank;
  
  if (perfection > 90) category = "high";
  else if (perfection > 75) category = "medium";
  else category = "low";

  const roasts = roastBank[category];
  const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
  
  return randomRoast
    .replace('{direction}', direction || '')
    .replace('{issueType}', issueType || '');
}

function findContours(imageData: ImageData): number[][] {
  const { data, width, height } = imageData;
  const edges: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));
  
  // Simple edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
      const grayTop = (data[((y-1) * width + x) * 4] + data[((y-1) * width + x) * 4 + 1] + data[((y-1) * width + x) * 4 + 2]) / 3;
      const grayLeft = (data[(y * width + (x-1)) * 4] + data[(y * width + (x-1)) * 4 + 1] + data[(y * width + (x-1)) * 4 + 2]) / 3;
      
      if (Math.abs(gray - grayTop) > 30 || Math.abs(gray - grayLeft) > 30) {
        edges[y][x] = true;
      }
    }
  }

  // Find contour points
  const contour: number[][] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (edges[y][x]) {
        contour.push([x, y]);
      }
    }
  }
  
  return contour;
}

function calculateCircularity(contour: number[][]): number {
  if (contour.length < 3) return 0;

  // Calculate area using shoelace formula
  let area = 0;
  for (let i = 0; i < contour.length; i++) {
    const j = (i + 1) % contour.length;
    area += contour[i][0] * contour[j][1];
    area -= contour[j][0] * contour[i][1];
  }
  area = Math.abs(area) / 2;

  // Calculate perimeter
  let perimeter = 0;
  for (let i = 0; i < contour.length; i++) {
    const j = (i + 1) % contour.length;
    const dx = contour[j][0] - contour[i][0];
    const dy = contour[j][1] - contour[i][1];
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }

  if (perimeter === 0) return 0;

  // Circularity = 4π * area / perimeter²
  const circularity = (4 * Math.PI * area) / (perimeter * perimeter);
  return Math.min(circularity, 1.0);
}

function findCentroid(contour: number[][]): [number, number] {
  let cx = 0, cy = 0;
  for (const point of contour) {
    cx += point[0];
    cy += point[1];
  }
  return [cx / contour.length, cy / contour.length];
}

function analyzeDeviations(contour: number[][], cx: number, cy: number): { direction: string; issueType: string } {
  const distances = contour.map(([x, y]) => Math.sqrt((x - cx) ** 2 + (y - cy) ** 2));
  const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
  
  let maxDeviation = 0;
  let maxDeviationIndex = 0;
  
  for (let i = 0; i < distances.length; i++) {
    const deviation = Math.abs(distances[i] - avgDistance);
    if (deviation > maxDeviation) {
      maxDeviation = deviation;
      maxDeviationIndex = i;
    }
  }

  const [maxX, maxY] = contour[maxDeviationIndex];
  const dx = maxX - cx;
  const dy = maxY - cy;

  let direction: string;
  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? "right" : "left";
  } else {
    direction = dy > 0 ? "bottom" : "top";
  }

  const issueType = distances[maxDeviationIndex] > avgDistance ? "bulging" : "flat";

  return { direction, issueType };
}

export function analyzeChapathi(imageElement: HTMLImageElement): AnalysisResult {
  // Create canvas and get image data
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  ctx.drawImage(imageElement, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Find contours
  const contour = findContours(imageData);
  
  if (contour.length < 10) {
    return {
      perfection: 0,
      roastMessage: "Aiyyo! I can't even find the chapathi in this photo! Is this a magic trick?"
    };
  }

  // Calculate circularity
  const circularity = calculateCircularity(contour);
  const perfection = circularity * 100;

  // Find issues
  const [cx, cy] = findCentroid(contour);
  const { direction, issueType } = analyzeDeviations(contour, cx, cy);

  // Get roast message
  const roastMessage = getRandomRoast(perfection, direction, issueType);

  return {
    perfection,
    roastMessage,
    direction,
    issueType
  };
}