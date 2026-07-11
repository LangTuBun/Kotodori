// One-time fix for missing-space bugs in vocabulary.json's meanings.vi field
// (a PDF-extraction artifact — spaces silently dropped at certain points,
// e.g. "chữhiragana" instead of "chữ hiragana"). Found by scanning for
// long no-space tokens and for common Vietnamese connector words glued
// directly onto a preceding word, then hand-verified against full field
// context (some entries also turned out to be genuinely truncated
// mid-sentence, or contain "￿" placeholder corruption from the same PDF
// extraction — those are separate pre-existing issues, left alone here,
// only the spacing within the existing text is fixed).
//
// Each entry: exact original meanings.vi -> corrected string. Applied by
// exact match so a stale mapping fails loudly instead of double-patching.

import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../src/data/n5/vocabulary.json', import.meta.url)
const vocab = JSON.parse(readFileSync(path, 'utf-8'))

const FIXES = {
  n5_0034: ['rất mong được anh/chịgiúp đỡ', 'rất mong được anh/chị giúp đỡ'],
  n5_0057: ['chữhiragana', 'chữ hiragana'],
  n5_0058: ['chữkatakana', 'chữ katakana'],
  n5_0077: ['từđiển', 'từ điển'],
  n5_0080: ['tòa thịchính', 'tòa thị chính'],
  n5_0089: ['yên; đơn vịtiền tệcủa Nhật', 'yên; đơn vị tiền tệ của Nhật'],
  n5_0090: ['đồng; đơn vịtiền tệcủa Việt Nam', 'đồng; đơn vị tiền tệ của Việt Nam'],
  n5_0094: ['thán từthểhiện ngại ngùng, bối rối', 'thán từ thể hiện ngại ngùng, bối rối'],
  n5_0108: ['tuần lễvàng', 'tuần lễ vàng'],
  n5_0124: ['… thếnào? Hỏi cảm nhận trong', '… thế nào? Hỏi cảm nhận trong'],
  n5_0126: ['ai; cách nói lịch sựcủa ￿￿', 'ai; cách nói lịch sự của ￿￿'],
  n5_0144: ['xe máy; từthường dùng trong cuộc', 'xe máy; từ thường dùng trong cuộc'],
  n5_0145: ['xe máy; từthường dùng trong tin', 'xe máy; từ thường dùng trong tin'],
  n5_0158: ['ồ; từcảm thán, thểhiện sựngạc', 'ồ; từ cảm thán, thể hiện sự ngạc'],
  n5_0167: ['chỗnày, chỗđó, chỗkia', 'chỗ này, chỗ đó, chỗ kia'],
  n5_0231: ['như thếnào, luôn đứng trước danh', 'như thế nào, luôn đứng trước danh'],
  n5_0234: ['hả? gì? thểhiện sựngạc nhiên', 'hả? gì? thể hiện sự ngạc nhiên'],
  n5_0243: ['chỗnào, ởđâu', 'chỗ nào, ở đâu'],
  n5_0263: ['con, trẻcon', 'con, trẻ con'],
  n5_0285: ['trong sốđó', 'trong số đó'],
  n5_0293: ['hmmm, lời ậm ừkhi phân vân, suy', 'hmmm, lời ậm ừ khi phân vân, suy'],
  n5_0322: ['ởgiữa', 'ở giữa'],
  n5_0327: ['chỗnày, chỗđó, chỗkia', 'chỗ này, chỗ đó, chỗ kia'],
  n5_0331: ['ghếsô-pha', 'ghế sô-pha'],
  n5_0333: ['có, ở(dùng cho vật vô tri)', 'có, ở (dùng cho vật vô tri)'],
  n5_0355: ['có, ở(dùng cho người, động vật)', 'có, ở (dùng cho người, động vật)'],
  n5_0356: ['kính ngữcủa ￿￿￿', 'kính ngữ của ￿￿￿'],
  n5_0357: ['nghỉgiải lao', 'nghỉ giải lao'],
  n5_0363: ['quảtrứng', 'quả trứng'],
  n5_0374: ['nhiều (chỉdùng cho người)', 'nhiều (chỉ dùng cho người)'],
  n5_0379: ['Tôi xin lỗi ạ(lịch sựhơn)', 'Tôi xin lỗi ạ (lịch sự hơn)'],
  n5_0381: ['nhờanh/chị', 'nhờ anh/chị'],
  n5_0392: ['nghỉngơi', 'nghỉ ngơi'],
  n5_0398: ['từgiờ(trởđi)', 'từ giờ (trở đi)'],
  n5_0401: ['từtừ, thong thả', 'từ từ, thong thả'],
  n5_0411: ['nhà bốmẹđẻ', 'nhà bố mẹ đẻ'],
  n5_0432: ['về, trởvề', 'về, trở về'],
  n5_0466: ['cảm thấy thoải mái, dễchịu', 'cảm thấy thoải mái, dễ chịu'],
  n5_0468: ['không vấn đềgì', 'không vấn đề gì'],
  n5_0470: ['kỳnghỉlễObon', 'kỳ nghỉ lễ Obon'],
  n5_0484: ['quảchuối', 'quả chuối'],
  n5_0551: ['sửdụng', 'sử dụng'],
  n5_0558: ['quảnhiên', 'quả nhiên'],
  n5_0563: ['mức này, cỡnày', 'mức này, cỡ này'],
  n5_0595: ['giỏi, sởtrường', 'giỏi, sở trường'],
  n5_0600: ['bốcủa mình', 'bố của mình'],
  n5_0601: ['bố(của người khác / cách gọi bố)', 'bố (của người khác / cách gọi bố)'],
  n5_0602: ['mẹcủa mình', 'mẹ của mình'],
  n5_0603: ['mẹ(của người khác / cách gọi mẹ)', 'mẹ (của người khác / cách gọi mẹ)'],
  n5_0648: ['nhạc cổđiển', 'nhạc cổ điển'],
  n5_0672: ['đến mức này, như thếnày', 'đến mức này, như thế này'],
  n5_0675: ['đây là cách nói lịch sựcủa ￿￿￿￿￿￿', 'đây là cách nói lịch sự của ￿￿￿￿￿￿'],
  n5_0689: ['bài vềnhà', 'bài về nhà'],
  n5_0695: ['tất cả(mọi người) (cùng thực hiện', 'tất cả (mọi người) (cùng thực hiện'],
  n5_0711: ['xin lỗi đã đểanh/chị/bạn chờ(lưu', 'xin lỗi đã để anh/chị/bạn chờ (lưu'],
  n5_0715: ['bốmẹ', 'bố mẹ'],
  n5_0729: ['anh/ chịlàm việc vất vảrồi.', 'anh/ chị làm việc vất vả rồi.'],
  n5_0730: ['anh/ chịlàm việc vất vảrồi.', 'anh/ chị làm việc vất vả rồi.'],
  n5_0749: ['xoay tròn, vung tròn (thứgì đó)', 'xoay tròn, vung tròn (thứ gì đó)'],
  n5_0752: ['chú ý; nhắc nhở(người khác)', 'chú ý; nhắc nhở (người khác)'],
  n5_0759: ['vậy à, thếà (sửdụng đểthểhiện sự', 'vậy à, thế à (sử dụng để thể hiện sự'],
  n5_0781: ['đi lại (chỉviệc thường hay đi đến', 'đi lại (chỉ việc thường hay đi đến'],
  n5_0790: ['tốt cho cơ thể(cách chia thì và thể', 'tốt cho cơ thể (cách chia thì và thể'],
  n5_0830: ['Bạn đã làm việc vất vảrồi (chỉcó', 'Bạn đã làm việc vất vả rồi (chỉ có'],
  n5_0841: ['nơi làm thêm, chỗlàm thêm', 'nơi làm thêm, chỗ làm thêm'],
  n5_0856: ['mặc thử(quần áo...)', 'mặc thử (quần áo...)'],
  n5_0861: ['anh/ chịthấy thếnào ạ? (Cách nói', 'anh/ chị thấy thế nào ạ? (Cách nói'],
  n5_0862: ['￿tôi xin nhận ạ(khi nhận thứgì đó', '￿tôi xin nhận ạ (khi nhận thứ gì đó'],
  n5_0889: ['bốmẹ', 'bố mẹ'],
  n5_0916: ['tờtiền giấy', 'tờ tiền giấy'],
  n5_0941: ['∼trước (Trước ￿là từchỉkhoảng', '∼trước (Trước ￿là từ chỉ khoảng'],
  n5_0960: ['nhờ, nhờvả', 'nhờ, nhờ vả'],
}

let applied = 0
const misses = []
for (const v of vocab) {
  const fix = FIXES[v.id]
  if (!fix) continue
  const [expected, replacement] = fix
  if (v.meanings.vi !== expected) {
    misses.push({ id: v.id, expected, actual: v.meanings.vi })
    continue
  }
  v.meanings.vi = replacement
  applied++
}

if (misses.length > 0) {
  console.error('MISMATCHES (not applied) — mapping is stale, re-check:')
  for (const m of misses) console.error(' ', m.id, 'expected:', JSON.stringify(m.expected), 'actual:', JSON.stringify(m.actual))
  process.exit(1)
}

writeFileSync(path, JSON.stringify(vocab, null, 2) + '\n', 'utf-8')
console.log(`Applied ${applied}/${Object.keys(FIXES).length} spacing fixes to vocabulary.json.`)
