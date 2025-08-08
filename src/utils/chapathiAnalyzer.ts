interface AnalysisResult {
  perfection: number;
  roastMessage: string;
  direction?: string;
  issueType?: string;
  analyzedImageUrl?: string;
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
    "Hmm… okay okay. But {direction} side is {issueType}, roll properly pa.",
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

// Convert RGB to grayscale
function rgbToGray(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Apply Gaussian blur
function gaussianBlur(imageData: ImageData, radius: number = 2): ImageData {
  const { data, width, height } = imageData;
  const output = new ImageData(width, height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, weightSum = 0;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const idx = (ny * width + nx) * 4;
          
          const weight = Math.exp(-(dx*dx + dy*dy) / (2 * radius * radius));
          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
          a += data[idx + 3] * weight;
          weightSum += weight;
        }
      }
      
      const outIdx = (y * width + x) * 4;
      output.data[outIdx] = r / weightSum;
      output.data[outIdx + 1] = g / weightSum;
      output.data[outIdx + 2] = b / weightSum;
      output.data[outIdx + 3] = a / weightSum;
    }
  }
  
  return output;
}

// Canny edge detection
function cannyEdgeDetection(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  const edges = new ImageData(width, height);
  
  // Convert to grayscale and apply edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Get surrounding pixels
      const pixels = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          pixels.push(rgbToGray(data[nIdx], data[nIdx + 1], data[nIdx + 2]));
        }
      }
      
      // Sobel operators
      const gx = pixels[0] + 2*pixels[3] + pixels[6] - pixels[2] - 2*pixels[5] - pixels[8];
      const gy = pixels[0] + 2*pixels[1] + pixels[2] - pixels[6] - 2*pixels[7] - pixels[8];
      const magnitude = Math.sqrt(gx*gx + gy*gy);
      
      const edgeValue = magnitude > 50 ? 255 : 0;
      edges.data[idx] = edgeValue;
      edges.data[idx + 1] = edgeValue;
      edges.data[idx + 2] = edgeValue;
      edges.data[idx + 3] = 255;
    }
  }
  
  return edges;
}

// Find contours from edge image
function findContours(edgeData: ImageData): Array<{x: number, y: number}> {
  const { data, width, height } = edgeData;
  const contourPoints: Array<{x: number, y: number}> = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx] > 128) { // Edge pixel
        contourPoints.push({x, y});
      }
    }
  }
  
  return contourPoints;
}

// Fit minimum enclosing circle
function fitCircle(contour: Array<{x: number, y: number}>): {center: {x: number, y: number}, radius: number} {
  if (contour.length === 0) {
    return {center: {x: 0, y: 0}, radius: 0};
  }
  
  // Calculate centroid
  let cx = 0, cy = 0;
  for (const point of contour) {
    cx += point.x;
    cy += point.y;
  }
  cx /= contour.length;
  cy /= contour.length;
  
  // Find maximum distance from centroid
  let maxDist = 0;
  for (const point of contour) {
    const dist = Math.sqrt((point.x - cx) ** 2 + (point.y - cy) ** 2);
    maxDist = Math.max(maxDist, dist);
  }
  
  return {center: {x: cx, y: cy}, radius: maxDist};
}

// Calculate deviations and directions
function analyzeDeviations(contour: Array<{x: number, y: number}>, circle: {center: {x: number, y: number}, radius: number}) {
  const deviations = contour.map(point => {
    const dist = Math.sqrt((point.x - circle.center.x) ** 2 + (point.y - circle.center.y) ** 2);
    return {
      point,
      deviation: dist - circle.radius,
      distance: dist
    };
  });
  
  // Find max positive and negative deviations
  let maxOutward = deviations[0];
  let maxInward = deviations[0];
  
  for (const dev of deviations) {
    if (dev.deviation > maxOutward.deviation) maxOutward = dev;
    if (dev.deviation < maxInward.deviation) maxInward = dev;
  }
  
  // Determine direction of major deviation
  const majorDeviation = Math.abs(maxOutward.deviation) > Math.abs(maxInward.deviation) ? maxOutward : maxInward;
  const dx = majorDeviation.point.x - circle.center.x;
  const dy = majorDeviation.point.y - circle.center.y;
  
  let direction: string;
  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? "right" : "left";
  } else {
    direction = dy > 0 ? "bottom" : "top";
  }
  
  const issueType = majorDeviation.deviation > 0 ? "lengthier" : "smaller";
  
  // Calculate roundness score
  const avgDeviation = deviations.reduce((sum, dev) => sum + Math.abs(dev.deviation), 0) / deviations.length;
  const perfection = Math.max(0, Math.min(100, 100 - (avgDeviation / circle.radius) * 100));
  
  return { direction, issueType, perfection };
}

// Draw analysis on image
function drawAnalysis(
  canvas: HTMLCanvasElement, 
  contour: Array<{x: number, y: number}>, 
  circle: {center: {x: number, y: number}, radius: number},
  perfection: number
): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Draw original image (already drawn)
  
  // Draw fitted circle (green)
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Draw contour (red)
  if (contour.length > 0) {
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(contour[0].x, contour[0].y);
    for (let i = 1; i < contour.length; i++) {
      ctx.lineTo(contour[i].x, contour[i].y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  
  // Draw perfection text
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(10, 10, 300, 80);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`${perfection.toFixed(1)}% Perfect`, 20, 40);
  ctx.font = '16px Arial';
  ctx.fillText('Green: Fitted Circle | Red: Actual Shape', 20, 70);
  
  return canvas.toDataURL('image/png');
}

export function analyzeChapathi(imageElement: HTMLImageElement): AnalysisResult {
  try {
    // Create canvas and draw image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Resize if too large for performance
    const maxSize = 800;
    let { width, height } = imageElement;
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width *= ratio;
      height *= ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageElement, 0, 0, width, height);

    // Get image data and process
    const imageData = ctx.getImageData(0, 0, width, height);
    const blurred = gaussianBlur(imageData, 2);
    const edges = cannyEdgeDetection(blurred);
    
    // Find contours
    const contour = findContours(edges);
    
    if (contour.length < 50) {
      return {
        perfection: 0,
        roastMessage: "Aiyyo! I can't find the chapathi in this photo! Is this a magic trick? Make sure there's good contrast!"
      };
    }

    // Fit circle and analyze
    const circle = fitCircle(contour);
    const { direction, issueType, perfection } = analyzeDeviations(contour, circle);
    
    // Draw analysis on canvas
    const analyzedImageUrl = drawAnalysis(canvas, contour, circle, perfection);
    
    // Get roast message
    const roastMessage = getRandomRoast(perfection, direction, issueType);

    return {
      perfection,
      roastMessage,
      direction,
      issueType,
      analyzedImageUrl
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      perfection: 0,
      roastMessage: "Aiyyo! Something went wrong while analyzing your chapathi. Try a clearer photo!"
    };
  }
}