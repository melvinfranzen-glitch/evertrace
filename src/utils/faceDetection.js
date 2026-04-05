/**
 * Erkennt die optimale Y-Position (0-100) für Bildzentrierung.
 *
 * Strategien (in Reihenfolge):
 * 1. Browser FaceDetector API (Chrome/Edge) — am genauesten
 * 2. Kontrast-basierte Analyse — findet helle/kontrastreiche Bereiche im oberen Bilddrittel
 * 3. Intelligenter Fallback basierend auf Bildformat
 */
export async function detectFacePosition(imageUrl) {
  console.log('[FaceDetect] Analysiere Bild...', imageUrl.substring(0, 50));
  try {
    const img = await loadImage(imageUrl);
    console.log('[FaceDetect] Bild geladen:', img.naturalWidth, 'x', img.naturalHeight);

    // Strategie 1: Browser Face Detection API
    const facePos = await tryBrowserFaceDetection(img);
    if (facePos !== null) {
      console.log('[FaceDetect] ✅ Browser FaceDetector → Position:', facePos);
      return facePos;
    }
    console.log('[FaceDetect] Browser FaceDetector nicht verfügbar oder kein Gesicht');

    // Strategie 2: Kontrast/Helligkeits-Analyse
    const contrastPos = analyzeImageContrast(img);
    if (contrastPos !== null) {
      console.log('[FaceDetect] ✅ Kontrast-Analyse → Position:', contrastPos);
      return contrastPos;
    }
    console.log('[FaceDetect] Kontrast-Analyse fehlgeschlagen');

  } catch (e) {
    console.log('[FaceDetect] ❌ Fehler:', e.message);
  }

  const fallback = 30;
  console.log('[FaceDetect] Fallback → Position:', fallback);
  return fallback;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Nur crossOrigin setzen wenn es KEINE blob-URL ist
    if (!url.startsWith('blob:')) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
    img.src = url;
  });
}

async function tryBrowserFaceDetection(img) {
  if (!("FaceDetector" in window)) return null;
  try {
    const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
    const faces = await detector.detect(img);
    if (faces.length === 0) return null;

    // Nimm das größte Gesicht
    const mainFace = faces.reduce((biggest, face) => {
      const area = face.boundingBox.width * face.boundingBox.height;
      const bigArea = biggest.boundingBox.width * biggest.boundingBox.height;
      return area > bigArea ? face : biggest;
    });

    const faceCenterY = mainFace.boundingBox.y + mainFace.boundingBox.height / 2;
    const percent = Math.round((faceCenterY / img.naturalHeight) * 100);
    return Math.max(10, Math.min(90, percent));
  } catch {
    return null;
  }
}

/**
 * Kontrast-basierte Analyse: Findet den Bereich mit der höchsten Detailmenge.
 * Funktioniert für alle Hauttöne, S/W-Fotos, und verschiedene Lichtverhältnisse.
 */
function analyzeImageContrast(img) {
  const canvas = document.createElement("canvas");
  const maxDim = 150;
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let imageData;
  try {
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch {
    return null; // Canvas tainted (CORS)
  }

  const { data, width, height } = imageData;
  const strips = 10;
  const stripH = Math.floor(height / strips);
  const edgeScores = [];

  for (let strip = 0; strip < strips; strip++) {
    let edgePixels = 0;
    let totalChecked = 0;

    const yStart = strip * stripH;
    const yEnd = Math.min((strip + 1) * stripH, height - 1);
    const xStart = Math.floor(width * 0.15);
    const xEnd = Math.floor(width * 0.85);

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd - 1; x++) {
        const idx = (y * width + x) * 4;
        const idxRight = (y * width + x + 1) * 4;
        const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
        const grayRight = data[idxRight] * 0.299 + data[idxRight + 1] * 0.587 + data[idxRight + 2] * 0.114;
        if (Math.abs(gray - grayRight) > 20) edgePixels++;
        totalChecked++;
      }
    }

    edgeScores.push(totalChecked > 0 ? edgePixels / totalChecked : 0);
  }

  let bestStrip = -1;
  let bestScore = 0;

  for (let i = 0; i < strips; i++) {
    const positionWeight = 1 + (strips - i) * 0.03; // Leichte Bevorzugung oben
    const weighted = edgeScores[i] * positionWeight;
    if (weighted > bestScore && edgeScores[i] > 0.05) {
      bestScore = weighted;
      bestStrip = i;
    }
  }

  if (bestStrip === -1) return null;

  let weightedCenter = bestStrip;
  let neighborCount = 1;

  if (bestStrip > 0 && edgeScores[bestStrip - 1] > 0.03) {
    weightedCenter += (bestStrip - 1) * (edgeScores[bestStrip - 1] / edgeScores[bestStrip]);
    neighborCount++;
  }
  if (bestStrip < strips - 1 && edgeScores[bestStrip + 1] > 0.03) {
    weightedCenter += (bestStrip + 1) * (edgeScores[bestStrip + 1] / edgeScores[bestStrip]);
    neighborCount++;
  }
  weightedCenter /= neighborCount;

  const position = Math.round(((weightedCenter + 0.5) / strips) * 100);
  return Math.max(10, Math.min(90, position));
}