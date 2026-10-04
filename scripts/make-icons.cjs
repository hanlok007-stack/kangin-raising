// 앱 아이콘(PNG)을 그린다. 이미지 라이브러리 없이 픽셀을 직접 칠하고 zlib으로 PNG를 만든다.
// 실행: node scripts/make-icons.cjs  → public/icon-192.png, public/icon-512.png
const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function draw(size) {
  const px = Buffer.alloc(size * (size * 4 + 1));
  const c = size / 2;
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const inCircle = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  // 오각형 (축구공 무늬)
  const penta = (x, y, cx, cy, r) => {
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      if ((x - cx) * Math.cos(a) + (y - cy) * Math.sin(a) > r * 0.81) return false;
    }
    return true;
  };
  for (let y = 0; y < size; y++) {
    px[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const stripe = Math.floor((x / size) * 6) % 2 ? '#2e9e4f' : '#289047';
      let col = hex(stripe);
      const R = size * 0.34;
      if (inCircle(x, y, c + size * 0.03, c + size * 0.03, R + size * 0.035)) col = hex('#1d1d1b'); // 그림자
      if (inCircle(x, y, c, c, R + size * 0.03)) col = hex('#1d1d1b'); // 외곽선
      if (inCircle(x, y, c, c, R)) col = hex('#fffaf0');
      if (penta(x, y, c, c, R * 0.36)) col = hex('#1d1d1b');
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const qx = c + Math.cos(a) * R * 0.92;
        const qy = c + Math.sin(a) * R * 0.92;
        if (penta(x, y, qx, qy, R * 0.3) && inCircle(x, y, c, c, R)) col = hex('#1d1d1b');
      }
      // 왼쪽 위의 주황색 띠: 왼발의 색
      if (x + y < size * 0.34) col = hex('#ff5a36');
      const o = y * (size * 4 + 1) + 1 + x * 4;
      px[o] = col[0];
      px[o + 1] = col[1];
      px[o + 2] = col[2];
      px[o + 3] = 255;
    }
  }
  const head = Buffer.alloc(13);
  head.writeUInt32BE(size, 0);
  head.writeUInt32BE(size, 4);
  head[8] = 8; // 비트 깊이
  head[9] = 6; // RGBA
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', zlib.deflateSync(px)), chunk('IEND', Buffer.alloc(0))]);
}

fs.mkdirSync('public', { recursive: true });
for (const size of [192, 512]) {
  fs.writeFileSync(`public/icon-${size}.png`, draw(size));
  console.log(`public/icon-${size}.png`);
}
