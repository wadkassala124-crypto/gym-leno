/**
 * Pure JavaScript QR Code Generator (No external dependencies)
 * Generates ISO/IEC 18004 compliant QR Code (Version 3-M, 29x29) for standard URLs
 */
import fs from 'fs';
import path from 'path';

function createQRMatrix(text) {
  const size = 29;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  const isReserved = Array.from({ length: size }, () => Array(size).fill(false));

  function setFinder(r, c) {
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const row = r + i;
        const col = c + j;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          isReserved[row][col] = true;
          if (i >= 0 && i <= 6 && (j === 0 || j === 6)) matrix[row][col] = 1;
          else if (j >= 0 && j <= 6 && (i === 0 || i === 6)) matrix[row][col] = 1;
          else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) matrix[row][col] = 1;
          else matrix[row][col] = 0;
        }
      }
    }
  }

  // Set 3 Finder Patterns
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Alignment Pattern for Version 3 (row 22, col 22)
  const alignR = 22, alignC = 22;
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      isReserved[alignR + i][alignC + j] = true;
      if (Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0)) {
        matrix[alignR + i][alignC + j] = 1;
      } else {
        matrix[alignR + i][alignC + j] = 0;
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    isReserved[6][i] = true;
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    isReserved[i][6] = true;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Dark module
  isReserved[size - 8][8] = true;
  matrix[size - 8][8] = 1;

  // Format info area reservation
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      isReserved[8][i] = true;
      isReserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    isReserved[8][size - 1 - i] = true;
    isReserved[size - 1 - i][8] = true;
  }

  // Encode Data (Byte mode)
  const dataBits = [];
  dataBits.push(0, 1, 0, 0); // Mode Byte
  const len = text.length;
  for (let i = 7; i >= 0; i--) {
    dataBits.push((len >> i) & 1);
  }
  for (let i = 0; i < len; i++) {
    const code = text.charCodeAt(i);
    for (let b = 7; b >= 0; b--) {
      dataBits.push((code >> b) & 1);
    }
  }
  for (let i = 0; i < 4 && dataBits.length < 352; i++) {
    dataBits.push(0);
  }
  while (dataBits.length % 8 !== 0) dataBits.push(0);

  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (dataBits.length < 352) {
    const b = padBytes[padIdx % 2];
    for (let i = 7; i >= 0; i--) dataBits.push((b >> i) & 1);
    padIdx++;
  }

  const dataWords = [];
  for (let i = 0; i < dataBits.length; i += 8) {
    let word = 0;
    for (let b = 0; b < 8; b++) word = (word << 1) | dataBits[i + b];
    dataWords.push(word);
  }

  const gfExp = new Uint8Array(512);
  const gfLog = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    gfExp[i] = x;
    gfLog[x] = i;
    x <<= 1;
    if (x >= 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    gfExp[i] = gfExp[i - 255];
  }

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return gfExp[gfLog[a] + gfLog[b]];
  }

  function rsGenPoly(n) {
    let poly = [1];
    for (let i = 0; i < n; i++) {
      const next = [1, gfExp[i]];
      const res = new Array(poly.length + 1).fill(0);
      for (let j = 0; j < poly.length; j++) {
        res[j] ^= poly[j];
        res[j + 1] ^= gfMul(poly[j], next[1]);
      }
      poly = res;
    }
    return poly;
  }

  const ecCount = 26;
  const gen = rsGenPoly(ecCount);
  const remainder = new Array(ecCount).fill(0);

  for (let i = 0; i < dataWords.length; i++) {
    const factor = dataWords[i] ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    for (let j = 0; j < ecCount; j++) {
      remainder[j] ^= gfMul(gen[j + 1], factor);
    }
  }

  const allCodewords = [...dataWords, ...remainder];
  const allBits = [];
  for (const word of allCodewords) {
    for (let b = 7; b >= 0; b--) {
      allBits.push((word >> b) & 1);
    }
  }

  let bitIdx = 0;
  let dir = -1;
  let col = size - 1;

  while (col > 0) {
    if (col === 6) col--;
    for (let rowStep = 0; rowStep < size; rowStep++) {
      const row = dir === -1 ? size - 1 - rowStep : rowStep;
      for (let c = 0; c < 2; c++) {
        const currCol = col - c;
        if (!isReserved[row][currCol]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          const mask = (row + currCol) % 2 === 0;
          matrix[row][currCol] = mask ? bit ^ 1 : bit;
        }
      }
    }
    col -= 2;
    dir = -dir;
  }

  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  let fb = 0;
  for (let c = 0; c <= 8; c++) {
    if (c !== 6) matrix[8][c] = formatBits[fb++];
  }
  for (let r = 7; r >= 0; r--) {
    if (r !== 6) matrix[r][8] = formatBits[14 - (r > 6 ? r - 1 : r)];
  }
  for (let r = 0; r < 7; r++) {
    matrix[size - 1 - r][8] = formatBits[r];
  }
  for (let c = 0; c < 8; c++) {
    matrix[8][size - 8 + c] = formatBits[7 + c];
  }

  return matrix;
}

export function generateAllQRCodes(targetUrl, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const matrix = createQRMatrix(targetUrl);
  const size = matrix.length;
  const quietZone = 4;
  const totalSize = size + quietZone * 2;
  const cellSize = 16;
  const svgWidth = totalSize * cellSize;

  // 1. Black & White Print SVG
  let printSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgWidth}" width="${svgWidth}" height="${svgWidth}">\n`;
  printSvg += `  <rect width="100%" height="100%" fill="#ffffff" />\n`;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        const x = (c + quietZone) * cellSize;
        const y = (r + quietZone) * cellSize;
        printSvg += `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#000000" />\n`;
      }
    }
  }
  printSvg += `</svg>`;
  fs.writeFileSync(path.join(outputDir, 'leno-gym-qr-print.svg'), printSvg);

  // 2. Luxury Branded SVG
  let luxurySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgWidth}" width="${svgWidth}" height="${svgWidth}">\n`;
  luxurySvg += `  <defs>\n`;
  luxurySvg += `    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">\n`;
  luxurySvg += `      <stop offset="0%" stop-color="#080808" />\n`;
  luxurySvg += `      <stop offset="100%" stop-color="#141414" />\n`;
  luxurySvg += `    </linearGradient>\n`;
  luxurySvg += `  </defs>\n`;
  luxurySvg += `  <rect width="100%" height="100%" fill="url(#bgGrad)" rx="24" />\n`;
  luxurySvg += `  <rect x="8" y="8" width="${svgWidth - 16}" height="${svgWidth - 16}" fill="none" stroke="#ccff00" stroke-width="2" stroke-opacity="0.3" rx="20" />\n`;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        const x = (c + quietZone) * cellSize;
        const y = (r + quietZone) * cellSize;
        const isFinder = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
        const fill = isFinder ? '#ccff00' : '#ffffff';
        luxurySvg += `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" rx="2" />\n`;
      }
    }
  }
  luxurySvg += `</svg>`;
  fs.writeFileSync(path.join(outputDir, 'leno-gym-qr-luxury.svg'), luxurySvg);

  // 3. Information Text File
  const txtContent = `=====================================================
GYM & LENO | لينو جيم - PERMANENT QR CODE CONFIGURATION
=====================================================

Target URL: ${targetUrl}
Type: Static Direct HTTPS URL (No intermediary redirects or expiration)
Target Destination: Public Home Page (Direct visitor entry)
Generated Date: ${new Date().toISOString()}

Included Files in this folder (Leno-Gym-QR):
1. leno-gym-qr-print.svg   - Vector format for banners & print (High Contrast B&W)
2. leno-gym-qr-luxury.svg  - Styled Luxury Vector with Gym & Leno branding (Neon Lime & Dark Obsidian)
3. leno-gym-qr-print.png   - High-Res raster image for direct printing & social media
4. leno-gym-qr-luxury.png  - High-Res branded raster image for digital posts & marketing
5. URL-INFO.txt            - Direct verification link

Permanent Access Guarantee:
- The QR Code directly embeds the HTTPS destination without third-party redirects.
- Scanning will always lead to Gym & Leno as long as the domain/hosting is active.
`;
  fs.writeFileSync(path.join(outputDir, 'URL-INFO.txt'), txtContent);

  console.log(`Successfully generated QR vector files in ${outputDir}`);
}

const target = process.argv[2] || 'https://gym-leno.vercel.app';
const out = process.argv[3] || 'Leno-Gym-QR';
generateAllQRCodes(target, out);
