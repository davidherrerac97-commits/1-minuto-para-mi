import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// Minimal uncompressed/deflated RGBA PNG generator in pure Node.js (no external deps)
function createPNG(width, height, colorFn) {
  const rowBytes = width * 4;
  const rawData = Buffer.alloc(height * (rowBytes + 1));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = colorFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]); // PNG Signature

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = chunk('IHDR', ihdrData);
  const idatChunk = chunk('IDAT', deflated);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Function to draw serene hospital icon (emerald circle, progress ring, heart/1min)
function hospitalIconPainter(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w / 2;

  // Background corner rounding if not maskable
  if (!isMaskable) {
    const cornerR = w * 0.22;
    const cornerDistX = Math.max(0, Math.abs(dx) - (w / 2 - cornerR));
    const cornerDistY = Math.max(0, Math.abs(dy) - (h / 2 - cornerR));
    if (Math.sqrt(cornerDistX * cornerDistX + cornerDistY * cornerDistY) > cornerR) {
      return [0, 0, 0, 0];
    }
  }

  // Base background gradient: Deep emerald (#064e3b) to Forest green (#047857)
  const gradT = (y / h);
  let r = Math.round(6 + (4 - 6) * gradT);
  let g = Math.round(78 + (120 - 78) * gradT);
  let b = Math.round(59 + (87 - 59) * gradT);
  let a = 255;

  const ringRadius = w * 0.35;
  const ringWidth = Math.max(3, w * 0.045);

  // Outer ring
  if (Math.abs(dist - ringRadius) < ringWidth / 2) {
    // Ring color: bright mint emerald (#34d399)
    r = 52;
    g = 211;
    b = 153;
  }

  // Inner circle core
  if (dist < ringRadius - ringWidth) {
    // Soft deep tone
    r = 2;
    g = 44;
    b = 34;
  }

  // Central symbol: heart or cross
  const heartScale = w * 0.18;
  const hx = (x - cx) / heartScale;
  const hy = (y - (cy - w * 0.04)) / heartScale;
  // Heart formula: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
  const hTerm = hx * hx + hy * hy - 0.7;
  if (hTerm * hTerm * hTerm - hx * hx * (hy * hy * hy) <= 0) {
    r = 110;
    g = 231;
    b = 183;
  }

  return [r, g, b, a];
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. 192x192
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, (x, y, w, h) => hospitalIconPainter(x, y, w, h, false)));
// 2. 512x512
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, (x, y, w, h) => hospitalIconPainter(x, y, w, h, false)));
// 3. 512x512 maskable (safe zone)
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, (x, y, w, h) => hospitalIconPainter(x, y, w, h, true)));
// 4. Apple Touch Icon 180x180
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, (x, y, w, h) => hospitalIconPainter(x, y, w, h, true)));

console.log('Successfully generated all PWA PNG icons in public/');
