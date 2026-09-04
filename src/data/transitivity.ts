// 自動詞・他動詞 (jidoushi/tadoushi) -- transitive/intransitive verb pairs.
// Level-agnostic vocabulary content (not split n5/n4 like grammar.ts/
// verb-forms.ts): the pairs themselves are just words, but the construction
// that motivates learning them (Nを+他動詞てある vs Nが+自動詞ている) is N4
// chapter 19 -- see grammar.json's "transitive-intransitive" category
// (g_161-g_164) and g_094_4 (ている, N5 ch.12), cross-linked from the page
// itself via getGrammar()/allGrammar rather than duplicated here.
import type { TransitivityPattern, VerbTransitivityPair } from "@/types"

export const IRREGULAR_PATTERN_ID = "irregular"

// Ending-correspondence patterns, the standard "recognition table" taught
// alongside these pairs (Genki/Minna no Nihongo appendix style). These are a
// *mnemonic* grouping, not a strict morphological classification -- a few
// pairs (見つかる/見つける's -aru/-eru, for instance) are textbook-perfect,
// while others are looser family resemblances. That's fine: the goal is
// "guess the shape of the pair you haven't met yet", not formal linguistics.
export const transitivityPatterns: TransitivityPattern[] = [
  {
    id: "aru-eru",
    label: "〜aru ⇄ 〜eru",
    transitiveEnding: "〜eru",
    intransitiveEnding: "〜aru",
    description: {
      vi: "Tự động từ đuôi 〜aru (godan), tha động từ cùng gốc đổi thành 〜eru (ichidan). Đây là cặp phổ biến nhất -- phần lớn tha động từ đuôi 〜eru sẽ có một tự động từ 〜aru tương ứng.",
      en: "Intransitive ends 〜aru (godan); the transitive twin swaps to 〜eru (ichidan) on the same root. The single most common pair shape -- most 〜eru transitives have an 〜aru intransitive partner.",
    },
  },
  {
    id: "u-eru",
    label: "〜u ⇄ 〜eru",
    transitiveEnding: "〜eru",
    intransitiveEnding: "〜u",
    description: {
      vi: "Tự động từ đuôi 〜u (godan) đổi thành 〜eru (ichidan) ở dạng tha động từ -- dễ nhầm với mẫu 〜aru/〜eru ở trên vì cùng kết thúc 〜eru, nhưng nguyên âm trước đó khác (く→ける chứ không phải まる→める).",
      en: "Intransitive ends 〜u (godan), the transitive twin becomes 〜eru (ichidan) -- easy to confuse with the 〜aru/〜eru shape above since both land on 〜eru, but the vowel just before it differs (く→ける, not まる→める).",
    },
  },
  {
    id: "reru-su",
    label: "〜reru ⇄ 〜su",
    transitiveEnding: "〜su",
    intransitiveEnding: "〜reru",
    description: {
      vi: "Tự động từ đuôi 〜reru (ichidan), tha động từ đổi thành 〜su (godan). Thường gặp ở các động từ chỉ sự hư hỏng/bẩn/đổ ngã.",
      en: "Intransitive ends 〜reru (ichidan), the transitive twin becomes 〜su (godan). Common among verbs about breaking, getting dirty, or falling over.",
    },
  },
  {
    id: "u-reru",
    label: "〜u ⇄ 〜reru",
    transitiveEnding: "〜u",
    intransitiveEnding: "〜reru",
    description: {
      vi: "Ngược với mẫu trên: ở đây THA động từ mới là 〜u (godan), còn TỰ động từ đổi thành 〜reru (ichidan). Dễ lẫn lộn với 〜reru/〜su nên cần chú ý xem từ nào đi với を.",
      en: "The mirror image of the pattern above: here the TRANSITIVE verb is the 〜u (godan) one, and the INTRANSITIVE twin becomes 〜reru (ichidan). Easy to mix up with 〜reru/〜su -- check which member actually takes を.",
    },
  },
  {
    id: "eru-su",
    label: "〜eru/〜iru ⇄ 〜su/〜osu",
    transitiveEnding: "〜su / 〜osu",
    intransitiveEnding: "〜eru / 〜iru",
    description: {
      vi: "Tự động từ đuôi 〜eru hoặc 〜iru (ichidan), tha động từ thêm 〜su hoặc 〜osu (godan) vào gốc.",
      en: "Intransitive ends 〜eru or 〜iru (ichidan); the transitive twin adds 〜su or 〜osu (godan) onto the same root.",
    },
  },
  {
    id: "u-asu",
    label: "〜u ⇄ 〜asu",
    transitiveEnding: "〜asu",
    intransitiveEnding: "〜u",
    description: {
      vi: "Tự động từ đuôi 〜u (godan), tha động từ thêm 〜asu -- trông giống thể sai khiến (使役形) nhưng đây là một từ độc lập, không phải chia động từ.",
      en: "Intransitive ends 〜u (godan); the transitive twin tacks on 〜asu -- it LOOKS like a causative (使役形) conjugation, but it's its own dictionary word, not a conjugated form.",
    },
  },
  {
    id: "ru-su",
    label: "〜ru ⇄ 〜su",
    transitiveEnding: "〜su",
    intransitiveEnding: "〜ru",
    description: {
      vi: "Tự động từ đuôi 〜ru (thường ichidan), tha động từ đổi 〜ru thành 〜su. Mẫu của 出る／出す -- rất hay gặp.",
      en: "Intransitive ends 〜ru (usually ichidan); the transitive twin swaps that 〜ru for 〜su. The 出る/出す shape -- very common.",
    },
  },
  {
    // label/endings are placeholders -- the page renders this pattern's
    // header specially (t('transitivity.irregular')) instead of an
    // ending-swap label, since there's no ending pair to show.
    id: IRREGULAR_PATTERN_ID,
    label: "―",
    transitiveEnding: "",
    intransitiveEnding: "",
    description: {
      vi: "Vài cặp rất thường dùng không đổi âm cuối theo mẫu nào cả (gốc từ thậm chí khác nhau) -- phải học thuộc từng cặp riêng lẻ, không đoán được.",
      en: "A handful of very common pairs don't follow any ending-swap pattern at all (sometimes the roots barely resemble each other) -- these just have to be memorized individually, not guessed.",
    },
  },
]

export const verbPairs: VerbTransitivityPair[] = [
  // -- 〜aru / 〜eru --------------------------------------------------------
  {
    id: "ageru-agaru",
    patternId: "aru-eru",
    transitive: {
      kanji: "上げる", kana: "あげる",
      meaning: { vi: "nâng lên, giơ lên", en: "to raise, lift" },
      example: { ja: "田中さんは手を上げました。", kana: "たなかさんはてをあげました。", vi: "Anh Tanaka đã giơ tay lên.", en: "Tanaka raised his hand." },
    },
    intransitive: {
      kanji: "上がる", kana: "あがる",
      meaning: { vi: "tăng lên, đi lên", en: "to rise, go up" },
      example: { ja: "気温が上がりました。", kana: "きおんがあがりました。", vi: "Nhiệt độ đã tăng lên.", en: "The temperature went up." },
    },
  },
  {
    id: "sageru-sagaru",
    patternId: "aru-eru",
    transitive: {
      kanji: "下げる", kana: "さげる",
      meaning: { vi: "hạ xuống, dọn đi", en: "to lower, take away" },
      example: { ja: "すみません、テーブルを下げてください。", kana: "すみません、テーブルをさげてください。", vi: "Xin lỗi, hãy dọn bàn giúp tôi.", en: "Excuse me, please clear the table." },
    },
    intransitive: {
      kanji: "下がる", kana: "さがる",
      meaning: { vi: "hạ xuống, giảm", en: "to go down, fall" },
      example: { ja: "熱が下がりました。", kana: "ねつがさがりました。", vi: "Cơn sốt đã hạ xuống.", en: "The fever went down." },
    },
  },
  {
    id: "shimeru-shimaru",
    patternId: "aru-eru",
    transitive: {
      kanji: "閉める", kana: "しめる",
      meaning: { vi: "đóng (cái gì)", en: "to close (something)" },
      example: { ja: "寒いので、窓を閉めてください。", kana: "さむいので、まどをしめてください。", vi: "Vì lạnh nên hãy đóng cửa sổ giúp tôi.", en: "It's cold, so please close the window." },
    },
    intransitive: {
      kanji: "閉まる", kana: "しまる",
      meaning: { vi: "tự đóng lại", en: "to close (by itself)" },
      example: { ja: "このドアは自動的に閉まります。", kana: "このドアはじどうてきにしまります。", vi: "Cánh cửa này tự động đóng lại.", en: "This door closes automatically." },
    },
    note: { vi: "Đừng nhầm với 締める (thắt, buộc, cùng đọc しめる nhưng khác nghĩa/kanji).", en: "Don't confuse with 締める (\"to tighten/fasten\", also read しめる but a different word/kanji)." },
  },
  {
    id: "atsumeru-atsumaru",
    patternId: "aru-eru",
    transitive: {
      kanji: "集める", kana: "あつめる",
      meaning: { vi: "thu thập, sưu tầm", en: "to collect, gather (something)" },
      example: { ja: "彼は切手を集めています。", kana: "かれはきってをあつめています。", vi: "Anh ấy đang sưu tập tem.", en: "He collects stamps." },
    },
    intransitive: {
      kanji: "集まる", kana: "あつまる",
      meaning: { vi: "tụ tập", en: "to gather, assemble" },
      example: { ja: "公園にたくさんの人が集まりました。", kana: "こうえんにたくさんのひとがあつまりました。", vi: "Nhiều người đã tụ tập ở công viên.", en: "Many people gathered in the park." },
    },
  },
  {
    id: "kimeru-kimaru",
    patternId: "aru-eru",
    transitive: {
      kanji: "決める", kana: "きめる",
      meaning: { vi: "quyết định", en: "to decide (something)" },
      example: { ja: "旅行の日程を決めました。", kana: "りょこうのにっていをきめました。", vi: "Chúng tôi đã quyết định lịch trình du lịch.", en: "We decided on the trip schedule." },
    },
    intransitive: {
      kanji: "決まる", kana: "きまる",
      meaning: { vi: "được quyết định", en: "to be decided" },
      example: { ja: "次の会議の日が決まりました。", kana: "つぎのかいぎのひがきまりました。", vi: "Ngày họp tiếp theo đã được quyết định.", en: "The date for the next meeting was decided." },
    },
  },
  {
    id: "hajimeru-hajimaru",
    patternId: "aru-eru",
    transitive: {
      kanji: "始める", kana: "はじめる",
      meaning: { vi: "bắt đầu (làm gì)", en: "to start (something)" },
      example: { ja: "来月から日本語の勉強を始めます。", kana: "らいげつからにほんごのべんきょうをはじめます。", vi: "Tôi sẽ bắt đầu học tiếng Nhật từ tháng sau.", en: "I'll start studying Japanese next month." },
    },
    intransitive: {
      kanji: "始まる", kana: "はじまる",
      meaning: { vi: "bắt đầu", en: "to begin" },
      example: { ja: "授業は9時に始まります。", kana: "じゅぎょうはくじにはじまります。", vi: "Buổi học bắt đầu lúc 9 giờ.", en: "Class starts at 9." },
    },
  },

  // -- 〜u / 〜eru -----------------------------------------------------------
  {
    id: "akeru-aku",
    patternId: "u-eru",
    transitive: {
      kanji: "開ける", kana: "あける",
      meaning: { vi: "mở (cái gì)", en: "to open (something)" },
      example: { ja: "ドアを開けてください。", kana: "ドアをあけてください。", vi: "Hãy mở cửa giúp tôi.", en: "Please open the door." },
    },
    intransitive: {
      kanji: "開く", kana: "あく",
      meaning: { vi: "tự mở ra", en: "to open (by itself)" },
      example: { ja: "このドアは重くて開きません。", kana: "このドアはおもくてあきません。", vi: "Cánh cửa này nặng nên không mở được.", en: "This door is heavy and won't open." },
    },
  },
  {
    id: "tsukeru-tsuku",
    patternId: "u-eru",
    transitive: {
      kanji: "付ける", kana: "つける",
      meaning: { vi: "gắn, bật", en: "to attach, turn on" },
      example: { ja: "電気を付けてください。", kana: "でんきをつけてください。", vi: "Hãy bật đèn giúp tôi.", en: "Please turn on the light." },
    },
    intransitive: {
      kanji: "付く", kana: "つく",
      meaning: { vi: "được gắn, được bật", en: "to be attached, to turn on" },
      example: { ja: "テレビが付いています。", kana: "テレビがついています。", vi: "Ti vi đang bật.", en: "The TV is on." },
    },
  },
  {
    id: "tsuzukeru-tsuzuku",
    patternId: "u-eru",
    transitive: {
      kanji: "続ける", kana: "つづける",
      meaning: { vi: "tiếp tục (làm gì)", en: "to continue (something)" },
      example: { ja: "彼は勉強を続けています。", kana: "かれはべんきょうをつづけています。", vi: "Anh ấy tiếp tục học.", en: "He keeps studying." },
    },
    intransitive: {
      kanji: "続く", kana: "つづく",
      meaning: { vi: "tiếp diễn", en: "to continue, go on" },
      example: { ja: "雨が三日間続いています。", kana: "あめがみっかかんつづいています。", vi: "Trời mưa đã kéo dài ba ngày.", en: "The rain has continued for three days." },
    },
  },
  {
    id: "katazukeru-katazuku",
    patternId: "u-eru",
    transitive: {
      kanji: "片付ける", kana: "かたづける",
      meaning: { vi: "dọn dẹp", en: "to tidy up, put away" },
      example: { ja: "部屋を片付けました。", kana: "へやをかたづけました。", vi: "Tôi đã dọn dẹp phòng.", en: "I tidied up the room." },
    },
    intransitive: {
      kanji: "片付く", kana: "かたづく",
      meaning: { vi: "được dọn gọn", en: "to get tidied up" },
      example: { ja: "部屋がやっと片付きました。", kana: "へやがやっとかたづきました。", vi: "Căn phòng cuối cùng đã được dọn gọn.", en: "The room is finally tidy." },
    },
  },
  {
    id: "tateru-tatsu",
    patternId: "u-eru",
    transitive: {
      kanji: "建てる", kana: "たてる",
      meaning: { vi: "xây (công trình)", en: "to build (a structure)" },
      example: { ja: "家を建てました。", kana: "いえをたてました。", vi: "Chúng tôi đã xây một ngôi nhà.", en: "We built a house." },
    },
    intransitive: {
      kanji: "建つ", kana: "たつ",
      meaning: { vi: "được xây lên", en: "to be built, to stand" },
      example: { ja: "あそこに新しいビルが建ちました。", kana: "あそこにあたらしいビルがたちました。", vi: "Một tòa nhà mới đã được xây ở đằng kia.", en: "A new building went up over there." },
    },
  },

  // -- 〜reru / 〜su ---------------------------------------------------------
  {
    id: "kowasu-kowareru",
    patternId: "reru-su",
    transitive: {
      kanji: "壊す", kana: "こわす",
      meaning: { vi: "làm hỏng", en: "to break (something)" },
      example: { ja: "弟がおもちゃを壊しました。", kana: "おとうとがおもちゃをこわしました。", vi: "Em trai đã làm hỏng đồ chơi.", en: "My brother broke the toy." },
    },
    intransitive: {
      kanji: "壊れる", kana: "こわれる",
      meaning: { vi: "bị hỏng", en: "to break, get broken" },
      example: { ja: "テレビが壊れています。", kana: "テレビがこわれています。", vi: "Ti vi bị hỏng.", en: "The TV is broken." },
    },
  },
  {
    id: "yogosu-yogoreru",
    patternId: "reru-su",
    transitive: {
      kanji: "汚す", kana: "よごす",
      meaning: { vi: "làm bẩn", en: "to make dirty" },
      example: { ja: "靴を汚してしまいました。", kana: "くつをよごしてしまいました。", vi: "Tôi đã làm bẩn giày.", en: "I got my shoes dirty." },
    },
    intransitive: {
      kanji: "汚れる", kana: "よごれる",
      meaning: { vi: "bị bẩn", en: "to get dirty" },
      example: { ja: "シャツが汚れています。", kana: "シャツがよごれています。", vi: "Cái áo bị bẩn.", en: "The shirt is dirty." },
    },
  },
  {
    id: "taosu-taoreru",
    patternId: "reru-su",
    transitive: {
      kanji: "倒す", kana: "たおす",
      meaning: { vi: "đánh đổ, hạ gục", en: "to knock down, defeat" },
      example: { ja: "木を倒しました。", kana: "きをたおしました。", vi: "Chúng tôi đã đốn ngã cái cây.", en: "We cut down the tree." },
    },
    intransitive: {
      kanji: "倒れる", kana: "たおれる",
      meaning: { vi: "đổ, ngã", en: "to fall over, collapse" },
      example: { ja: "台風で木が倒れました。", kana: "たいふうできがたおれました。", vi: "Cây đã đổ vì bão.", en: "A tree fell over because of the typhoon." },
    },
  },
  {
    id: "nagasu-nagareru",
    patternId: "reru-su",
    transitive: {
      kanji: "流す", kana: "ながす",
      meaning: { vi: "xả, làm chảy", en: "to pour, flush" },
      example: { ja: "トイレの水を流してください。", kana: "トイレのみずをながしてください。", vi: "Hãy xả nước bồn cầu giúp tôi.", en: "Please flush the toilet." },
    },
    intransitive: {
      kanji: "流れる", kana: "ながれる",
      meaning: { vi: "chảy", en: "to flow" },
      example: { ja: "この川はゆっくり流れています。", kana: "このかわはゆっくりながれています。", vi: "Con sông này chảy chậm rãi.", en: "This river flows slowly." },
    },
  },

  // -- 〜u / 〜reru (mirror of the pair above -- watch which one takes を) --
  {
    id: "waru-wareru",
    patternId: "u-reru",
    transitive: {
      kanji: "割る", kana: "わる",
      meaning: { vi: "làm vỡ", en: "to break, split (something)" },
      example: { ja: "弟がコップを割りました。", kana: "おとうとがコップをわりました。", vi: "Em trai đã làm vỡ cái ly.", en: "My brother broke the glass." },
    },
    intransitive: {
      kanji: "割れる", kana: "われる",
      meaning: { vi: "bị vỡ", en: "to break, shatter" },
      example: { ja: "地震でコップが割れました。", kana: "じしんでコップがわれました。", vi: "Cái ly đã vỡ vì động đất.", en: "The glass broke in the earthquake." },
    },
  },
  {
    id: "oru-oreru",
    patternId: "u-reru",
    transitive: {
      kanji: "折る", kana: "おる",
      meaning: { vi: "gấp, bẻ gãy", en: "to fold, snap (something)" },
      example: { ja: "紙を半分に折ってください。", kana: "かみをはんぶんにおってください。", vi: "Hãy gấp tờ giấy làm đôi giúp tôi.", en: "Please fold the paper in half." },
    },
    intransitive: {
      kanji: "折れる", kana: "おれる",
      meaning: { vi: "bị gãy", en: "to fold, snap, break" },
      example: { ja: "強い風で木の枝が折れました。", kana: "つよいかぜできのえだがおれました。", vi: "Cành cây đã gãy vì gió mạnh.", en: "A branch broke off in the strong wind." },
    },
  },
  {
    id: "yaburu-yabureru",
    patternId: "u-reru",
    transitive: {
      kanji: "破る", kana: "やぶる",
      meaning: { vi: "xé rách", en: "to tear, rip (something)" },
      example: { ja: "子供が本のページを破りました。", kana: "こどもがほんのページをやぶりました。", vi: "Đứa trẻ đã xé một trang sách.", en: "The child tore a page of the book." },
    },
    intransitive: {
      kanji: "破れる", kana: "やぶれる",
      meaning: { vi: "bị rách", en: "to tear, get torn" },
      example: { ja: "このズボンは破れています。", kana: "このズボンはやぶれています。", vi: "Cái quần này bị rách.", en: "These pants are torn." },
    },
  },

  // -- 〜eru/〜iru / 〜su/〜osu -----------------------------------------------
  {
    id: "kesu-kieru",
    patternId: "eru-su",
    transitive: {
      kanji: "消す", kana: "けす",
      meaning: { vi: "tắt, xóa", en: "to turn off, erase" },
      example: { ja: "テレビを消してください。", kana: "テレビをけしてください。", vi: "Hãy tắt ti vi giúp tôi.", en: "Please turn off the TV." },
    },
    intransitive: {
      kanji: "消える", kana: "きえる",
      meaning: { vi: "tắt, biến mất", en: "to go out, disappear" },
      example: { ja: "ろうそくの火が消えました。", kana: "ろうそくのひがきえました。", vi: "Ngọn nến đã tắt.", en: "The candle flame went out." },
    },
  },
  {
    id: "otosu-ochiru",
    patternId: "eru-su",
    transitive: {
      kanji: "落とす", kana: "おとす",
      meaning: { vi: "làm rơi", en: "to drop (something)" },
      example: { ja: "財布を落としてしまいました。", kana: "さいふをおとしてしまいました。", vi: "Tôi đã làm rơi ví.", en: "I dropped my wallet." },
    },
    intransitive: {
      kanji: "落ちる", kana: "おちる",
      meaning: { vi: "rơi", en: "to fall, drop" },
      example: { ja: "木の葉が落ちています。", kana: "きのはがおちています。", vi: "Lá cây đang rơi.", en: "Leaves are falling from the tree." },
    },
  },
  {
    id: "okosu-okiru",
    patternId: "eru-su",
    transitive: {
      kanji: "起こす", kana: "おこす",
      meaning: { vi: "đánh thức, gây ra", en: "to wake (someone), cause" },
      example: { ja: "明日6時に起こしてください。", kana: "あした6じにおこしてください。", vi: "Ngày mai hãy đánh thức tôi lúc 6 giờ.", en: "Please wake me up at 6 tomorrow." },
    },
    intransitive: {
      kanji: "起きる", kana: "おきる",
      meaning: { vi: "thức dậy, xảy ra", en: "to wake up, happen" },
      example: { ja: "事故が起きました。", kana: "じこがおきました。", vi: "Một vụ tai nạn đã xảy ra.", en: "An accident happened." },
    },
  },
  {
    id: "hiyasu-hieru",
    patternId: "eru-su",
    transitive: {
      kanji: "冷やす", kana: "ひやす",
      meaning: { vi: "làm lạnh", en: "to chill, cool (something)" },
      example: { ja: "ビールを冷蔵庫で冷やしています。", kana: "ビールをれいぞうこでひやしています。", vi: "Tôi đang làm lạnh bia trong tủ lạnh.", en: "I'm chilling the beer in the fridge." },
    },
    intransitive: {
      kanji: "冷える", kana: "ひえる",
      meaning: { vi: "trở nên lạnh", en: "to get cold, chilly" },
      example: { ja: "今夜は冷えますね。", kana: "こんやはひえますね。", vi: "Tối nay trời lạnh nhỉ.", en: "It's getting cold tonight." },
    },
  },

  // -- 〜u / 〜asu (looks causative -- it isn't) ----------------------------
  {
    id: "ugokasu-ugoku",
    patternId: "u-asu",
    transitive: {
      kanji: "動かす", kana: "うごかす",
      meaning: { vi: "di chuyển (cái gì)", en: "to move (something)" },
      example: { ja: "この机を動かしてください。", kana: "このつくえをうごかしてください。", vi: "Hãy di chuyển cái bàn này giúp tôi.", en: "Please move this desk." },
    },
    intransitive: {
      kanji: "動く", kana: "うごく",
      meaning: { vi: "tự di chuyển", en: "to move (by itself)" },
      example: { ja: "電車が動いています。", kana: "でんしゃがうごいています。", vi: "Tàu điện đang chạy.", en: "The train is moving." },
    },
  },
  {
    id: "wakasu-waku",
    patternId: "u-asu",
    transitive: {
      kanji: "沸かす", kana: "わかす",
      meaning: { vi: "đun sôi", en: "to boil (something)" },
      example: { ja: "お湯を沸かしています。", kana: "おゆをわかしています。", vi: "Tôi đang đun nước sôi.", en: "I'm boiling water." },
    },
    intransitive: {
      kanji: "沸く", kana: "わく",
      meaning: { vi: "sôi", en: "to boil" },
      example: { ja: "お湯が沸きました。", kana: "おゆがわきました。", vi: "Nước đã sôi.", en: "The water has boiled." },
    },
  },
  {
    id: "kawakasu-kawaku",
    patternId: "u-asu",
    transitive: {
      kanji: "乾かす", kana: "かわかす",
      meaning: { vi: "làm khô", en: "to dry (something)" },
      example: { ja: "ドライヤーで髪を乾かします。", kana: "ドライヤーでかみをかわかします。", vi: "Tôi sấy khô tóc bằng máy sấy.", en: "I dry my hair with a hair dryer." },
    },
    intransitive: {
      kanji: "乾く", kana: "かわく",
      meaning: { vi: "khô", en: "to dry, become dry" },
      example: { ja: "洗濯物がもう乾きました。", kana: "せんたくものがもうかわきました。", vi: "Đồ giặt đã khô rồi.", en: "The laundry has already dried." },
    },
  },
  {
    id: "narasu-naru",
    patternId: "u-asu",
    transitive: {
      kanji: "鳴らす", kana: "ならす",
      meaning: { vi: "bấm, làm vang", en: "to ring, sound (something)" },
      example: { ja: "ベルを鳴らしてください。", kana: "ベルをならしてください。", vi: "Hãy bấm chuông giúp tôi.", en: "Please ring the bell." },
    },
    intransitive: {
      kanji: "鳴る", kana: "なる",
      meaning: { vi: "vang, kêu", en: "to ring, sound" },
      example: { ja: "電話が鳴っています。", kana: "でんわがなっています。", vi: "Điện thoại đang reo.", en: "The phone is ringing." },
    },
  },
  {
    id: "herasu-heru",
    patternId: "u-asu",
    transitive: {
      kanji: "減らす", kana: "へらす",
      meaning: { vi: "giảm bớt", en: "to reduce (something)" },
      example: { ja: "塩の量を減らしましょう。", kana: "しおのりょうをへらしましょう。", vi: "Hãy giảm lượng muối nhé.", en: "Let's reduce the amount of salt." },
    },
    intransitive: {
      kanji: "減る", kana: "へる",
      meaning: { vi: "giảm đi", en: "to decrease" },
      example: { ja: "体重が少し減りました。", kana: "たいじゅうがすこしへりました。", vi: "Cân nặng đã giảm một chút.", en: "My weight has decreased a little." },
    },
  },

  // -- 〜ru / 〜su -----------------------------------------------------------
  {
    id: "dasu-deru",
    patternId: "ru-su",
    transitive: {
      kanji: "出す", kana: "だす",
      meaning: { vi: "lấy ra, nộp", en: "to take out, submit" },
      example: { ja: "宿題を出してください。", kana: "しゅくだいをだしてください。", vi: "Hãy nộp bài tập giúp thầy.", en: "Please submit your homework." },
    },
    intransitive: {
      kanji: "出る", kana: "でる",
      meaning: { vi: "ra, xuất hiện", en: "to go out, come out" },
      example: { ja: "部屋を出て、外に行きました。", kana: "へやをでて、そとにいきました。", vi: "Tôi đã rời khỏi phòng và ra ngoài.", en: "I left the room and went outside." },
    },
  },
  {
    id: "naosu-naoru",
    patternId: "ru-su",
    transitive: {
      kanji: "治す", kana: "なおす",
      meaning: { vi: "chữa khỏi", en: "to cure, heal (something)" },
      example: { ja: "早く風邪を治してください。", kana: "はやくかぜをなおしてください。", vi: "Hãy mau chữa khỏi cảm cúm giúp mình.", en: "Please get over your cold soon." },
    },
    intransitive: {
      kanji: "治る", kana: "なおる",
      meaning: { vi: "khỏi bệnh", en: "to be cured, healed" },
      example: { ja: "風邪はもう治りました。", kana: "かぜはもうなおりました。", vi: "Cảm cúm đã khỏi rồi.", en: "My cold has already healed." },
    },
    note: { vi: "Cùng đọc なおす／なおる với 直す／直る (sửa chữa) -- khác kanji, khác nghĩa cụ thể nhưng cùng mẫu ru/su.", en: "Shares its なおす／なおる reading with 直す／直る (\"to fix/be fixed\") -- different kanji and specific meaning, but the same ru/su shape." },
  },
  {
    id: "kaesu-kaeru",
    patternId: "ru-su",
    transitive: {
      kanji: "返す", kana: "かえす",
      meaning: { vi: "trả lại", en: "to return (something)" },
      example: { ja: "図書館に本を返しました。", kana: "としょかんにほんをかえしました。", vi: "Tôi đã trả sách cho thư viện.", en: "I returned the book to the library." },
    },
    intransitive: {
      kanji: "返る", kana: "かえる",
      meaning: { vi: "được trả lại", en: "to be returned, come back" },
      example: { ja: "落とした財布が返ってきました。", kana: "おとしたさいふがかえってきました。", vi: "Cái ví tôi đánh rơi đã được trả lại.", en: "The wallet I dropped came back to me." },
    },
    note: { vi: "Đọc giống 変える (かえる, \"thay đổi\") -- nghe cùng âm nhưng khác kanji/nghĩa, dễ nhầm khi chỉ nghe.", en: "Sounds identical to 変える (かえる, \"to change\") -- same pronunciation, different kanji/meaning, an easy mix-up by ear alone." },
  },
  {
    id: "toosu-tooru",
    patternId: "ru-su",
    transitive: {
      kanji: "通す", kana: "とおす",
      meaning: { vi: "cho qua, xỏ qua", en: "to let through, pass (something)" },
      example: { ja: "針に糸を通してください。", kana: "はりにいとをとおしてください。", vi: "Hãy xỏ chỉ qua kim giúp tôi.", en: "Please thread the needle." },
    },
    intransitive: {
      kanji: "通る", kana: "とおる",
      meaning: { vi: "đi qua", en: "to pass through" },
      example: { ja: "このバスは駅の前を通ります。", kana: "このバスはえきのまえをとおります。", vi: "Xe buýt này đi qua trước nhà ga.", en: "This bus passes in front of the station." },
    },
  },
  {
    id: "watasu-wataru",
    patternId: "ru-su",
    transitive: {
      kanji: "渡す", kana: "わたす",
      meaning: { vi: "đưa, trao", en: "to hand over" },
      example: { ja: "これを田中さんに渡してください。", kana: "これをたなかさんにわたしてください。", vi: "Hãy đưa cái này cho anh Tanaka giúp tôi.", en: "Please hand this to Tanaka." },
    },
    intransitive: {
      kanji: "渡る", kana: "わたる",
      meaning: { vi: "băng qua", en: "to cross" },
      example: { ja: "信号が青になったら道を渡ります。", kana: "しんごうがあおになったらみちをわたります。", vi: "Khi đèn xanh thì băng qua đường.", en: "When the light turns green, we cross the street." },
    },
  },

  // -- irregular / no shared ending pattern ---------------------------------
  {
    id: "ireru-hairu",
    patternId: "irregular",
    transitive: {
      kanji: "入れる", kana: "いれる",
      meaning: { vi: "cho vào", en: "to put in" },
      example: { ja: "かばんに本を入れました。", kana: "かばんにほんをいれました。", vi: "Tôi đã cho sách vào cặp.", en: "I put the book in the bag." },
    },
    intransitive: {
      kanji: "入る", kana: "はいる",
      meaning: { vi: "vào", en: "to enter" },
      example: { ja: "部屋に入ってもいいですか。", kana: "へやにはいってもいいですか。", vi: "Tôi có thể vào phòng được không?", en: "May I enter the room?" },
    },
    note: { vi: "Cặp N4 kinh điển hay bị coi nhầm là mẫu 〜aru/〜eru vì cùng viết chung kanji 入 -- nhưng cách đọc (いれる／はいる) không theo mẫu nào cả.", en: "The classic N4 pair everyone assumes fits the 〜aru/〜eru shape because they share the kanji 入 -- but the readings (いれる／はいる) don't follow any pattern at all." },
  },
  {
    id: "noseru-noru",
    patternId: "irregular",
    transitive: {
      kanji: "乗せる", kana: "のせる",
      meaning: { vi: "cho lên (xe)", en: "to give a ride, load" },
      example: { ja: "子供を車に乗せました。", kana: "こどもをくるまにのせました。", vi: "Tôi đã cho con lên xe.", en: "I put my child in the car." },
    },
    intransitive: {
      kanji: "乗る", kana: "のる",
      meaning: { vi: "lên (xe)", en: "to ride, board" },
      example: { ja: "バスに乗ります。", kana: "バスにのります。", vi: "Tôi lên xe buýt.", en: "I get on the bus." },
    },
  },
  {
    id: "umu-umareru",
    patternId: "irregular",
    transitive: {
      kanji: "生む", kana: "うむ",
      meaning: { vi: "sinh ra", en: "to give birth to" },
      example: { ja: "猫が子猫を生みました。", kana: "ねこがこねこをうみました。", vi: "Con mèo đã sinh ra mèo con.", en: "The cat gave birth to kittens." },
    },
    intransitive: {
      kanji: "生まれる", kana: "うまれる",
      meaning: { vi: "được sinh ra", en: "to be born" },
      example: { ja: "先週、赤ちゃんが生まれました。", kana: "せんしゅう、あかちゃんがうまれました。", vi: "Tuần trước, em bé đã ra đời.", en: "A baby was born last week." },
    },
  },
]
