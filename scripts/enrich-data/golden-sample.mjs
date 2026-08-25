// Golden sample: 3 grammar points enriched end-to-end to validate the
// schema + pipeline before running the full batch. See scripts/apply-enrichment.mjs.
//
// STYLE CONVENTIONS for all enrichment batches (copy this header into each
// new batch file so 200+ hand-authored records read as one consistent work,
// not 18 batches drifting in voice):
//   - patternRomaji: lowercase Hepburn, hyphenate only true compounds (V1-tara).
//   - pragmatics.intent: a gerund phrase ("Giving advice"), not a sentence.
//   - pragmatics.tones: ordered least- to most-formal.
//   - notesAndPitfalls[].title: a claim about the pattern, not a topic label
//     (good: "たら still marks a one-time event, not a habit"; bad: "Usage notes").
//   - notesAndPitfalls[].examples[].incorrect/correct: bare Japanese sentences
//     ONLY -- no Vietnamese/English framing baked in (the UI renders these
//     struck-through/checkmarked as literal sentences). Put framing in
//     `explanation` instead.
//   - richExamples: exactly 5, categories standard/polite/question/negative/
//     casual/edge_case -- pick 5 of those 6 that best fit the pattern (a
//     pattern that has no natural negative form, e.g., skips it for another).
//   - jaRuby: ALWAYS authored when `ja` contains kanji -- all-or-nothing per
//     point (see validate-grammar.mjs), so the Furigana toggle never
//     silently no-ops on some examples of an enriched point but not others.
//   - contextualExplanation: names the specific conjugation/form used in
//     THIS example, not a restatement of the pattern's general meaning.
//   - relatedGrammar vs opposingGrammar: an id belongs in exactly one of the
//     two lists, never both (validate-grammar.mjs flags duplicates).
export default {
  g_001: {
    patternRomaji: '(N1 wa) N2 desu',
    formationRules: [
      { pos: 'noun', form: 'Dictionary form', exampleStr: '学生 ＋ です' },
    ],
    pragmatics: {
      tones: ['polite', 'neutral'],
      intent: 'Identifying or describing a person/thing by stating what it is',
      speakerStance: 'Neutral, objective statement of fact',
    },
    notesAndPitfalls: [
      {
        type: 'common_mistake',
        title: 'は marks the topic, not necessarily the grammatical subject',
        description: {
          vi: 'は đánh dấu chủ đề của câu (cái đang được nói tới), không phải lúc nào cũng là "chủ ngữ" theo nghĩa tiếng Việt. N1 thường được lược bỏ nếu đã rõ trong ngữ cảnh -- ví dụ khi trả lời một câu hỏi đã nêu rõ chủ đề.',
          en: 'は marks what the sentence is about (the topic), which is often but not always the same as the subject. N1 is commonly dropped entirely when clear from context -- e.g. when answering a question that already established the topic.',
        },
        examples: [
          { incorrect: '田中さんは田中さんです。', correct: '田中です。', explanation: { vi: 'Khi trả lời câu hỏi "Bạn là ai?", không lặp lại chủ đề đã rõ -- chỉ cần nói phần thông tin mới.', en: 'When answering "Who are you?", don\'t repeat the already-clear topic -- just state the new information.' } },
        ],
      },
      {
        type: 'false_friend',
        title: 'です is not a verb meaning "to be" in the Western sense',
        description: {
          vi: 'です là trợ động từ lịch sự, không chia theo ngôi hay số như "to be" trong tiếng Anh. Nó chỉ đơn giản làm câu trở nên lịch sự, thể thường tương ứng là だ (thường lược bỏ).',
          en: 'です is a polite copula, not a conjugating verb like English "to be" (am/is/are). It stays です regardless of person/number; its plain-form counterpart is だ (often omitted entirely in casual speech).',
        },
      },
    ],
    richExamples: [
      {
        category: 'standard',
        ja: '田中さんは先生です。',
        jaRuby: '<ruby>田中<rp>(</rp><rt>たなか</rt><rp>)</rp></ruby>さんは<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>です。',
        kana: 'たなかさんはせんせいです。',
        romaji: 'Tanaka-san wa sensei desu.',
        vi: 'Anh/chị Tanaka là giáo viên.',
        en: 'Mr./Ms. Tanaka is a teacher.',
        contextualExplanation: { vi: 'Câu khẳng định cơ bản: N1（田中さん）は N2（先生）です.', en: 'Basic affirmative statement: N1 (Tanaka-san) は N2 (teacher) です.' },
      },
      {
        category: 'polite',
        ja: 'こちらは田中さんでいらっしゃいます。',
        jaRuby: 'こちらは<ruby>田中<rp>(</rp><rt>たなか</rt><rp>)</rp></ruby>さんでいらっしゃいます。',
        kana: 'こちらはたなかさんでいらっしゃいます。',
        romaji: 'Kochira wa Tanaka-san de irasshaimasu.',
        vi: 'Đây là anh/chị Tanaka ạ.',
        en: 'This is Mr./Ms. Tanaka.',
        contextualExplanation: { vi: 'Ở mức độ trang trọng hơn (kính ngữ), です được thay bằng でいらっしゃいます khi giới thiệu người khác một cách kính trọng.', en: 'At a more formal (keigo) register, です is replaced by でいらっしゃいます when respectfully introducing someone else -- beyond N5 level but useful to recognize.' },
      },
      {
        category: 'question',
        ja: 'すみません、田中さんですか。',
        jaRuby: 'すみません、<ruby>田中<rp>(</rp><rt>たなか</rt><rp>)</rp></ruby>さんですか。',
        kana: 'すみません、たなかさんですか。',
        romaji: 'Sumimasen, Tanaka-san desu ka.',
        vi: 'Xin lỗi, anh/chị có phải là Tanaka không?',
        en: 'Excuse me, are you Mr./Ms. Tanaka?',
        contextualExplanation: { vi: 'Thêm か vào cuối câu です để biến thành câu hỏi (xem g_002).', en: 'Adding か after です turns the statement into a yes/no question (see g_002).' },
      },
      {
        category: 'negative',
        ja: 'いいえ、田中さんじゃないです。山田です。',
        jaRuby: 'いいえ、<ruby>田中<rp>(</rp><rt>たなか</rt><rp>)</rp></ruby>さんじゃないです。<ruby>山田<rp>(</rp><rt>やまだ</rt><rp>)</rp></ruby>です。',
        kana: 'いいえ、たなかさんじゃないです。やまだです。',
        romaji: 'Iie, Tanaka-san janai desu. Yamada desu.',
        vi: 'Không, tôi không phải là Tanaka. Tôi là Yamada.',
        en: 'No, I\'m not Tanaka. I\'m Yamada.',
        contextualExplanation: { vi: 'Thể phủ định じゃないです được học riêng ở g_004, đặt cạnh đây để đối chiếu.', en: 'The negative form janai desu is its own point (g_004) -- shown here for contrast with the affirmative.' },
      },
      {
        category: 'casual',
        ja: 'それ、私の傘だ。',
        jaRuby: 'それ、<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>の<ruby>傘<rp>(</rp><rt>かさ</rt><rp>)</rp></ruby>だ。',
        kana: 'それ、わたしのかさだ。',
        romaji: 'Sore, watashi no kasa da.',
        vi: 'Cái đó là ô của tôi.',
        en: 'That\'s my umbrella.',
        contextualExplanation: { vi: 'Trong hội thoại thân mật giữa bạn bè, です được thay bằng だ (thể thường) -- xem thêm g_028_1.', en: 'In casual speech among friends, です is replaced by its plain-form counterpart だ -- see g_028_1 for the full plain-form pattern.' },
      },
    ],
    relatedGrammar: ['g_002', 'g_004', 'g_028_1'],
    opposingGrammar: [],
  },

  g_081: {
    patternRomaji: 'V1-tara, V2',
    formationRules: [
      { pos: 'verb', form: 'た-form (Vた) + ら', exampleStr: '降る → 降った ＋ ら' },
      { pos: 'i-adj', form: 'かった (past) + ら', exampleStr: '忙しい → 忙しかった ＋ ら' },
      { pos: 'na-adj', form: 'だった (past) + ら', exampleStr: '暇 → 暇だった ＋ ら' },
      { pos: 'noun', form: 'だった (past) + ら', exampleStr: '休み → 休みだった ＋ ら' },
    ],
    pragmatics: {
      tones: ['neutral', 'polite', 'spoken'],
      intent: 'Stating a condition and its result',
      speakerStance: 'Presents V1 as a concrete, one-time trigger for V2; the most flexible and colloquial of the four conditionals',
    },
    notesAndPitfalls: [
      {
        type: 'nuance_trap',
        title: 'たら vs と／ば／なら -- four conditionals, four different feels',
        description: {
          vi: 'たら linh hoạt nhất, dùng được cho hầu hết mọi tình huống (kể cả yêu cầu, lời mời sau đó). と dùng cho quy luật/sự thật hiển nhiên (không dùng với mệnh lệnh ở V2). ば nhấn mạnh điều kiện logic/giả định. なら phản hồi lại điều đối phương vừa nói. Xem g_084/g_085 (ば) và g_112 (なら).',
          en: 'たら is the most flexible and can be followed by almost anything in V2, including commands/invitations -- the default choice when unsure. と is for automatic/general truths (V2 cannot be a command). ば emphasizes a logical/hypothetical condition. なら responds to something the listener just said. See g_084/g_085 (ば) and g_112 (なら) for contrast.',
        },
        relatedGrammarId: 'g_112',
      },
      {
        type: 'common_mistake',
        title: 'たら still marks a one-time/specific event, not a repeated habit',
        description: {
          vi: 'Với sự thật khoa học hoặc quy luật luôn đúng (ví dụ: "nước sôi ở 100 độ"), と tự nhiên hơn たら. たら nghe như đang nói về một tình huống cụ thể.',
          en: 'For scientific facts or rules that are always true ("water boils at 100°C"), と reads more naturally than たら, which implies a specific, one-off situation rather than a general law.',
        },
      },
    ],
    richExamples: [
      {
        category: 'standard',
        ja: '雨が降ったら、家にいます。',
        jaRuby: '<ruby>雨<rp>(</rp><rt>あめ</rt><rp>)</rp></ruby>が<ruby>降<rp>(</rp><rt>ふ</rt><rp>)</rp></ruby>ったら、<ruby>家<rp>(</rp><rt>いえ</rt><rp>)</rp></ruby>にいます。',
        kana: 'あめがふったら、いえにいます。',
        romaji: 'Ame ga futtara, ie ni imasu.',
        vi: 'Nếu trời mưa, tôi sẽ ở nhà.',
        en: 'If it rains, I\'ll stay home.',
        contextualExplanation: { vi: 'Điều kiện cụ thể cho một tình huống sắp tới: động từ 降る → thể た 降った ＋ ら.', en: 'A concrete condition for an upcoming situation: verb 降る → た-form 降った ＋ ら.' },
      },
      {
        category: 'question',
        ja: '仕事が終わったら、何をしますか。',
        jaRuby: '<ruby>仕事<rp>(</rp><rt>しごと</rt><rp>)</rp></ruby>が<ruby>終<rp>(</rp><rt>お</rt><rp>)</rp></ruby>わったら、<ruby>何<rp>(</rp><rt>なに</rt><rp>)</rp></ruby>をしますか。',
        kana: 'しごとがおわったら、なにをしますか。',
        romaji: 'Shigoto ga owattara, nani o shimasu ka.',
        vi: 'Khi xong việc rồi, bạn sẽ làm gì?',
        en: 'Once you finish work, what will you do?',
        contextualExplanation: { vi: 'たら cũng dùng được với ý nghĩa "sau khi/ngay khi" một sự kiện xảy ra.', en: 'たら here carries the "once/as soon as" nuance in addition to plain "if".' },
      },
      {
        category: 'negative',
        ja: '疲れていなかったら、一緒に行きたいです。',
        jaRuby: '<ruby>疲<rp>(</rp><rt>つか</rt><rp>)</rp></ruby>れていなかったら、<ruby>一緒<rp>(</rp><rt>いっしょ</rt><rp>)</rp></ruby>に<ruby>行<rp>(</rp><rt>い</rt><rp>)</rp></ruby>きたいです。',
        kana: 'つかれていなかったら、いっしょにいきたいです。',
        romaji: 'Tsukarete inakattara, issho ni ikitai desu.',
        vi: 'Nếu tôi không mệt thì tôi muốn đi cùng.',
        en: 'If I weren\'t tired, I\'d want to go with you.',
        contextualExplanation: { vi: 'Thể ない của 疲れている (疲れていない) chuyển thành たら: 疲れていなかったら.', en: 'The negative te-iru form (疲れていない) conjugates the same way: 疲れていなかったら.' },
      },
      {
        category: 'casual',
        ja: 'A：明日、暇？　B：暇だったら、映画見に行こうよ。',
        jaRuby: 'A：<ruby>明日<rp>(</rp><rt>あした</rt><rp>)</rp></ruby>、<ruby>暇<rp>(</rp><rt>ひま</rt><rp>)</rp></ruby>？　B：<ruby>暇<rp>(</rp><rt>ひま</rt><rp>)</rp></ruby>だったら、<ruby>映画<rp>(</rp><rt>えいが</rt><rp>)</rp></ruby><ruby>見<rp>(</rp><rt>み</rt><rp>)</rp></ruby>に<ruby>行<rp>(</rp><rt>い</rt><rp>)</rp></ruby>こうよ。',
        kana: 'A：あした、ひま？　B：ひまだったら、えいがみにいこうよ。',
        romaji: 'A: Ashita, hima? B: Hima dattara, eiga mi ni ikou yo.',
        vi: 'A: Mai rảnh không? B: Nếu rảnh thì đi xem phim đi.',
        en: 'A: Free tomorrow? B: If you\'re free, let\'s go watch a movie.',
        contextualExplanation: { vi: 'たら thường theo sau bằng lời mời/rủ rê (行こう) -- một điểm mà と không làm được.', en: 'たら is commonly followed by an invitation (行こう) -- something と cannot do.' },
      },
      {
        category: 'edge_case',
        ja: 'ボタンを押したら、ドアが開きました。',
        jaRuby: 'ボタンを<ruby>押<rp>(</rp><rt>お</rt><rp>)</rp></ruby>したら、ドアが<ruby>開<rp>(</rp><rt>あ</rt><rp>)</rp></ruby>きました。',
        kana: 'ボタンをおしたら、ドアがあきました。',
        romaji: 'Botan o oshitara, doa ga akimashita.',
        vi: 'Vừa bấm nút thì cửa mở ra.',
        en: 'As soon as I pressed the button, the door opened.',
        contextualExplanation: { vi: 'V2 ở thì quá khứ: たら có thể diễn tả một khám phá bất ngờ ngay sau khi V1 xảy ra, không chỉ là điều kiện giả định.', en: 'V2 in past tense: たら can express a surprising discovery immediately after V1, not just a hypothetical condition.' },
      },
    ],
    relatedGrammar: ['g_084', 'g_085', 'g_112'],
    opposingGrammar: [],
  },

  g_138: {
    patternRomaji: 'futsuukei + kamoshirenai',
    formationRules: [
      { pos: 'verb', form: 'Plain form (dictionary/ない/た)', exampleStr: '雨が降る ＋ かもしれない' },
      { pos: 'i-adj', form: 'Plain form', exampleStr: '難しい ＋ かもしれない' },
      { pos: 'na-adj', form: 'Stem (drop だ)', exampleStr: '元気（だ抜き）＋ かもしれない' },
      { pos: 'noun', form: 'Bare noun (drop だ)', exampleStr: '休み（だ抜き）＋ かもしれない' },
    ],
    pragmatics: {
      tones: ['casual', 'polite', 'neutral', 'spoken'],
      intent: 'Hedging a guess',
      emotionalNuance: 'Softer and more tentative than はず or でしょう; safe for expressing uncertainty without committing',
      speakerStance: 'Low-confidence, purely subjective possibility (the speaker is genuinely unsure)',
    },
    notesAndPitfalls: [
      {
        type: 'false_friend',
        title: 'かもしれない ≠ はず -- possibility vs. logical expectation',
        description: {
          vi: 'かもしれない chỉ khả năng thấp, người nói không chắc chắn ("có thể"). はず (g_141) diễn tả một kết luận logic dựa trên thông tin đã biết, mức độ chắc chắn cao hơn nhiều ("chắc hẳn là"). Nhầm hai cái này khiến câu nói nghe sai sắc thái.',
          en: 'かもしれない expresses low-confidence possibility ("might/could be"). はず (g_141) expresses a logical conclusion drawn from known facts, with much higher certainty ("should/must be, based on what I know"). Swapping them misrepresents how confident the speaker actually is.',
        },
        relatedGrammarId: 'g_141',
      },
      {
        type: 'common_mistake',
        title: 'Dropping だ before かもしれない for na-adjectives/nouns',
        description: {
          vi: 'Khác với んです hay ようだ (giữ な trước danh từ), かもしれない theo sau trực tiếp thân từ, không có だ hay な.',
          en: 'Unlike some other plain-form patterns, かもしれない attaches directly to the bare stem of na-adjectives/nouns with no だ (and no な) in between.',
        },
        examples: [
          { incorrect: '彼は元気だかもしれない。', correct: '彼は元気かもしれない。', explanation: { vi: 'Bỏ だ trước かもしれない.', en: 'Drop だ before かもしれない.' } },
        ],
      },
    ],
    richExamples: [
      {
        category: 'standard',
        ja: '明日は雨が降るかもしれません。',
        jaRuby: '<ruby>明日<rp>(</rp><rt>あした</rt><rp>)</rp></ruby>は<ruby>雨<rp>(</rp><rt>あめ</rt><rp>)</rp></ruby>が<ruby>降<rp>(</rp><rt>ふ</rt><rp>)</rp></ruby>るかもしれません。',
        kana: 'あしたはあめがふるかもしれません。',
        romaji: 'Ashita wa ame ga furu kamoshiremasen.',
        vi: 'Ngày mai có thể sẽ mưa.',
        en: 'It might rain tomorrow.',
        contextualExplanation: { vi: 'Thể lịch sự かもしれません, dùng động từ ở thể từ điển 降る.', en: 'Polite form かもしれません, attached to the dictionary form 降る.' },
      },
      {
        category: 'polite',
        ja: '田中さんはもう帰ったかもしれません。',
        jaRuby: '<ruby>田中<rp>(</rp><rt>たなか</rt><rp>)</rp></ruby>さんはもう<ruby>帰<rp>(</rp><rt>かえ</rt><rp>)</rp></ruby>ったかもしれません。',
        kana: 'たなかさんはもうかえったかもしれません。',
        romaji: 'Tanaka-san wa mou kaetta kamoshiremasen.',
        vi: 'Có lẽ anh Tanaka đã về rồi.',
        en: 'Mr. Tanaka might have already gone home.',
        contextualExplanation: { vi: 'Thể quá khứ 帰った ＋ かもしれません để phỏng đoán về một sự việc đã xảy ra.', en: 'Past-tense 帰った ＋ かもしれません to guess about something that may have already happened.' },
      },
      {
        category: 'negative',
        ja: 'この店は今日休みじゃないかもしれない。',
        jaRuby: 'この<ruby>店<rp>(</rp><rt>みせ</rt><rp>)</rp></ruby>は<ruby>今日<rp>(</rp><rt>きょう</rt><rp>)</rp></ruby><ruby>休<rp>(</rp><rt>やす</rt><rp>)</rp></ruby>みじゃないかもしれない。',
        kana: 'このみせはきょうやすみじゃないかもしれない。',
        romaji: 'Kono mise wa kyou yasumi janai kamoshirenai.',
        vi: 'Có thể hôm nay cửa hàng này không nghỉ.',
        en: 'This shop might not be closed today.',
        contextualExplanation: { vi: 'Danh từ phủ định じゃない ＋ かもしれない.', en: 'Negative noun form じゃない ＋ かもしれない.' },
      },
      {
        category: 'casual',
        ja: 'A：今日、鈴木来る？　B：うーん、来ないかも。',
        jaRuby: 'A：<ruby>今日<rp>(</rp><rt>きょう</rt><rp>)</rp></ruby>、<ruby>鈴木<rp>(</rp><rt>すずき</rt><rp>)</rp></ruby><ruby>来<rp>(</rp><rt>く</rt><rp>)</rp></ruby>る？　B：うーん、<ruby>来<rp>(</rp><rt>こ</rt><rp>)</rp></ruby>ないかも。',
        kana: 'A：きょう、すずきくる？　B：うーん、こないかも。',
        romaji: 'A: Kyou, Suzuki kuru? B: Uun, konai kamo.',
        vi: 'A: Hôm nay Suzuki có đến không? B: Ừm, chắc không đến đâu.',
        en: 'A: Is Suzuki coming today? B: Hmm, maybe not.',
        contextualExplanation: { vi: 'Trong văn nói thân mật, かもしれない thường rút ngắn thành かも.', en: 'In casual spoken Japanese, かもしれない is commonly shortened to just かも.' },
      },
      {
        category: 'edge_case',
        ja: '彼女は本当は日本人じゃなくて、中国人かもしれない。',
        jaRuby: '<ruby>彼女<rp>(</rp><rt>かのじょ</rt><rp>)</rp></ruby>は<ruby>本当<rp>(</rp><rt>ほんとう</rt><rp>)</rp></ruby>は<ruby>日本人<rp>(</rp><rt>にほんじん</rt><rp>)</rp></ruby>じゃなくて、<ruby>中国人<rp>(</rp><rt>ちゅうごくじん</rt><rp>)</rp></ruby>かもしれない。',
        kana: 'かのじょはほんとうはにほんじんじゃなくて、ちゅうごくじんかもしれない。',
        romaji: 'Kanojo wa hontou wa nihonjin janakute, chuugokujin kamoshirenai.',
        vi: 'Có lẽ thực ra cô ấy không phải người Nhật, mà là người Trung Quốc.',
        en: 'She might actually not be Japanese, but Chinese.',
        contextualExplanation: { vi: 'Có thể đặt かもしれない sau danh từ trần trụi (không だ) để phỏng đoán về danh tính/bản chất.', en: 'かもしれない attaches to a bare noun (no だ) to speculate about identity or nature.' },
      },
    ],
    relatedGrammar: ['g_136'],
    opposingGrammar: ['g_141'],
  },
}
