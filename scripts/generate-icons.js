import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createSolidPng(width, height, r, g, b, a = 255) {
  const bytesPerPixel = 4;
  const rowBytes = width * bytesPerPixel;
  const rawData = Buffer.alloc((rowBytes + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      // Gradient or circle motif
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isInner = dist < width * 0.38;
      const isBar = Math.abs(dx) < width * 0.25 && Math.abs(dy) < height * 0.25 && (Math.floor(x / 14) % 2 === 0);

      if (isBar || isInner) {
        rawData[pixelOffset] = Math.min(255, r + 80);
        rawData[pixelOffset + 1] = Math.min(255, g + 40);
        rawData[pixelOffset + 2] = Math.min(255, b + 100);
        rawData[pixelOffset + 3] = a;
      } else {
        rawData[pixelOffset] = r;
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
        rawData[pixelOffset + 3] = a;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(len + 12);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, len + 8));
  chunk.writeUInt32BE(crc, len + 8);
  return chunk;
}

// Standard CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Purple/black theme colors (#09090b with #9333ea inner)
const p192 = createSolidPng(192, 192, 18, 18, 24);
const p512 = createSolidPng(512, 512, 18, 18, 24);
const pMaskable = createSolidPng(512, 512, 10, 10, 14);
const pApple = createSolidPng(180, 180, 18, 18, 24);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), p192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), p512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pMaskable);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pApple);

console.log('PWA PNG Icons generated successfully in public/');
