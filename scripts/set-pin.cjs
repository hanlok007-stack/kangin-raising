// 관리자 PIN을 바꾼다. 코드에는 PIN이 아니라 해시만 남는다.
// 실행: node scripts/set-pin.cjs <새 PIN>
const fs = require('fs');
const crypto = require('crypto');

const pin = process.argv[2];
if (!pin) {
  console.error('사용법: node scripts/set-pin.cjs <새 PIN>');
  process.exit(1);
}
const hash = crypto.createHash('sha256').update('kangin:' + pin).digest('hex');
const file = 'src/platform/admin.ts';
const next = fs.readFileSync(file, 'utf8').replace(/ADMIN_HASH = '[0-9a-f]*'/, `ADMIN_HASH = '${hash}'`);
fs.writeFileSync(file, next);
console.log('관리자 PIN을 바꿨습니다. 다시 빌드·배포해야 적용됩니다.');
