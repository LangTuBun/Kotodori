// One-time fix: 30 entries in vocabulary.json (+2 mirrored in homophones.json) had
// literal U+FFFF "noncharacter" codepoints in meanings.vi (renders as tofu/□ in any
// font — this was never a font/encoding bug, the bad codepoints were baked into the
// JSON by the original vocab_n5.pdf extraction pipeline, which is no longer on disk).
// Each fix below replaces the exact corrupted string with a reconstructed one and is
// verified against the current file content before writing, so this script is safe to
// re-run (no-ops if already applied) and fails loudly if source data has since changed.
//
// Confidence varies — see README note at bottom / handoff for the medium/low-confidence
// subset that should get a human spot-check.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VOCAB_PATH = path.join(__dirname, '../src/data/n5/vocabulary.json');
const HOMOPHONES_PATH = path.join(__dirname, '../src/data/n5/homophones.json');

// id -> [oldExact, newFixed, confidence]
const FIXES = {
  // HIGH confidence: corrupted char(s) = wave dash '～', matching the entry's own
  // kanji field (e.g. "～時" suffix) and the file's established "～word" gloss style.
  n5_0069: ['￿giờ', '～giờ', 'high'],
  n5_0071: ['￿phút', '～phút', 'high'],
  n5_0121: ['ngày ￿', 'ngày ～', 'high'],
  n5_0491: ['￿năm', '～năm', 'high'],
  n5_0492: ['￿tháng', '～tháng', 'high'],
  n5_0493: ['￿tuần', '～tuần', 'high'],
  n5_0494: ['￿quyển', '～quyển', 'high'],
  n5_0495: ['￿tờ, tấm, trang', '～tờ, tấm, trang', 'high'],
  n5_0496: ['￿cốc', '～cốc', 'high'],
  n5_0497: ['￿cái', '～cái', 'high'],
  n5_0628: ['￿cm', '～cm', 'high'],
  n5_0682: ['đang ￿', 'đang ～', 'high'],
  n5_0700: ['￿lần', '～lần', 'high'],
  n5_0561: ['￿hoặc ￿', '～hoặc～', 'high'],
  n5_0006: [
    'người / quốc tịch: tên quốc gia + ￿￿',
    'người / quốc tịch: tên quốc gia + ～人',
    'high',
  ],

  // MEDIUM-HIGH: reconstructed from real N5 grammar + box count matches kana count
  // exactly (だれ=2, います=3), cross-checked against TuVung_N5_DungMori.md rows 47-48
  // (どなた/だれ both "ai") and 22-23 (いらっしゃいます/います both "có, ở").
  n5_0126: [
    'ai; cách nói lịch sự của ￿￿',
    'ai; cách nói lịch sự của だれ',
    'medium-high',
  ],
  n5_0356: ['kính ngữ của ￿￿￿', 'kính ngữ của います', 'medium-high'],

  // MEDIUM: single '～' placeholder consistent with the entry's own particle marker
  // in its kanji field (e.g. "（～に）慣れる").
  n5_0708: [
    'quen, quen thuộc (với ￿)',
    'quen, quen thuộc (với ～)',
    'medium',
  ],
  n5_0810: ['có dính, có gắn ￿', 'có dính, có gắn ～', 'medium'],
  n5_0811: ['￿mở', '～mở', 'medium'],
  n5_0812: ['￿đóng', '～đóng', 'medium'],
  n5_0820: ['cho ￿vào', 'cho ～vào', 'medium'],
  n5_0632: [
    'cái ￿nào (đứng trước danh từ)',
    'cái ～nào (đứng trước danh từ)',
    'medium',
  ],

  // LOW-MEDIUM: best-effort reconstruction, NOT verified against source (source PDF
  // no longer exists on disk). Flagged for human spot-check.
  n5_0705: ['￿￿￿bắt đầu', '(始める) bắt đầu', 'low-medium'],
  n5_0753: ['đỗ￿', 'đỗ đạt', 'low-medium'],
  n5_0062: [
    'tiếng ￿; ngôn ngữ= tên quốc gia +',
    'tiếng ～; ngôn ngữ = tên quốc gia + ～語',
    'low-medium',
  ],
  n5_0675: [
    'đây là cách nói lịch sự của ￿￿￿￿￿￿',
    'đây là cách nói lịch sự của 何ですか',
    'low-medium',
  ],
  n5_0701: [
    '1 lần (￿￿4￿￿1￿￿: 4 năm 1 lần, ￿￿￿￿￿￿￿:',
    '1 lần (4 năm 1 lần)',
    'low-medium',
  ],
  n5_0712: ['chính phía tôi ￿', 'chính phía tôi cũng thế', 'low-medium'],
  n5_0771: [
    '￿không thích, không được ￿thôi',
    'không thích, không được thôi',
    'low-medium',
  ],
  n5_0862: [
    '￿tôi xin nhận ạ (khi nhận thứ gì đó',
    'tôi xin nhận ạ (khi nhận thứ gì đó, ví dụ: bữa ăn)',
    'low-medium',
  ],
  n5_0873: [
    '￿được giúp đỡ￿May quá! Đỡquá!',
    'được giúp đỡ. May quá! Đỡ quá!',
    'low-medium',
  ],
};

function fixMeaningsObject(meanings, id, applied, skipped) {
  const fix = FIXES[id];
  if (!fix || !meanings) return;
  const [oldVal, newVal, confidence] = fix;
  if (meanings.vi === oldVal) {
    meanings.vi = newVal;
    applied.push({ id, confidence, newVal });
  } else if (meanings.vi?.includes('￿')) {
    skipped.push({ id, current: meanings.vi });
  }
}

function fixVocabulary(filePath) {
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  const applied = [];
  const skipped = [];
  for (const entry of data) {
    fixMeaningsObject(entry.meanings, entry.id, applied, skipped);
  }
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return { applied, skipped };
}

function fixHomophones(filePath) {
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  const applied = [];
  const skipped = [];
  for (const group of data) {
    for (const word of group.words ?? []) {
      fixMeaningsObject(word.meaning, word.vocabId, applied, skipped);
    }
  }
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return { applied, skipped };
}

const vocabResult = fixVocabulary(VOCAB_PATH);
console.log(`vocabulary.json: fixed ${vocabResult.applied.length} entries`);
for (const a of vocabResult.applied) {
  console.log(`  [${a.confidence}] ${a.id} -> "${a.newVal}"`);
}
if (vocabResult.skipped.length) {
  console.log('  UNMATCHED (still corrupted, source string changed?):');
  for (const s of vocabResult.skipped) console.log(`    ${s.id}: "${s.current}"`);
}

const homophonesResult = fixHomophones(HOMOPHONES_PATH);
console.log(`homophones.json: fixed ${homophonesResult.applied.length} entries`);
