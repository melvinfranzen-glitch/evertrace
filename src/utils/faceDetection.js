/**
 * Erkennt Gesichter in einem Bild und berechnet die optimale Y-Position (0-100).
 * Strategie: 1) Browser FaceDetector API, 2) Canvas-Hautton-Analyse, 3) Fallback 33%
 */
export async function detectFacePosition(imageUrl) {
  try {
    const img = await loadImage(imageUrl);

    const facePos = await tryBrowserFaceDetection(img);
    if (facePos !== null) return facePos;

    const canvasPos = analyzeImageForFace(img);
    if (canvasPos !== null) return canvasPos;
  } catch (e) {
    // silent fallback
  }
  return 33;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
    img.src = url;
  });
}

async function tryBrowserFaceDetection(img) {
  if (!("FaceDetector" in window)) return null;
  try {
    // eslint-disable-next-line no-undef
    const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
    const faces = await detector.detect(img);
    if (faces.length === 0) return null;

    const mainFace = faces.reduce((biggest, face) => {
      const area = face.boundingBox.width * face.boundingBox.height;
      const biggestArea = biggest.boundingBox.width * biggest.boundingBox.height;
      return area > biggestArea ? face : biggest;
    });

    const faceCenterY = mainFace.boundingBox.y + mainFace.boundingBox.height / 2;
    const positionPercent = Math.round((faceCenterY / img.naturalHeight) * 100);
    return Math.max(15, Math.min(85, positionPercent));
  } catch {
    return null;
  }
}

function analyzeImageForFace(img) {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 200 / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  const strips = 20;
  const stripHeight = Math.floor(height / strips);
  const skinScores = [];

  for (let strip = 0; strip < strips; strip++) {
    let skinPixels = 0;
    let totalPixels = 0;
    for (let y = strip * stripHeight; y < (strip + 1) * stripHeight && y < height; y++) {
      const xStart = Math.floor(width * 0.2);
      const xEnd = Math.floor(width * 0.8);
      for (let x = xStart; x < xEnd; x++) {
        const idx = (y * width + x) * 4;
        if (isSkinTone(data[idx], data[idx + 1], data[idx + 2])) skinPixels++;
        totalPixels++;
      }
    }
    skinScores.push(totalPixels > 0 ? skinPixels / totalPixels : 0);
  }

  let bestStrip = -1;
  let bestScore = 0;
  for (let i = 0; i < strips; i++) {
    const weight = 1 + (strips - i) * 0.05;
    const weightedScore = skinScores[i] * weight;
    if (weightedScore > bestScore && skinScores[i] > 0.08) {
      bestScore = weightedScore;
      bestStrip = i;
    }
  }

  if (bestStrip === -1) return null;
  const position = Math.round(((bestStrip + 0.5) / strips) * 100);
  return Math.max(15, Math.min(85, position));
}

function isSkinTone(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0 || max - min === 0) return false;
  if (max < 60 || min > 230) return false;
  if (r < g || r < b) return false;
  const rgRatio = r / (g || 1);
  const rbRatio = r / (b || 1);
  return rgRatio > 1.0 && rgRatio < 1.8 && rbRatio > 1.1 && rbRatio < 3.0;
}