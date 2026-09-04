// 使い方とニュアンス (Usage & Nuances) -- a reference feature for three
// recurring learner-confusion areas that don't fit any existing dataset:
//
//   1. synonymGroups     -- near-synonym words that split on use-case, not
//                            meaning (着る/履く/被る/かける/締める, all "to wear")
//   2. collocationGroups -- strict/exception verb-particle pairings
//                            (電車に乗る vs 電車を降りる, 先生に会う)
//   3. auxiliaryVerbs    -- hojo doushi riding on the て-form
//                            (〜てしまう, 〜てみる, 〜ておく, 〜ていく, 〜てくる...)
//
// Level-agnostic like transitivity.ts (these are usage/vocabulary facts,
// not tied to one textbook's chapter split), but auxiliaryVerbs entries can
// cross-link into the level-aware grammar.ts database via grammarIds, the
// same way Transitivity.tsx cross-links via getGrammar().
import type { AuxiliaryVerb, CollocationGroup, SynonymGroup } from "@/types"

export const synonymGroups: SynonymGroup[] = [
  {
    id: "wear",
    glossJa: "着る／履く／被る／かける／締める",
    title: { vi: "mặc / mang / đội / đeo (từ chỉ hành động mặc)", en: "to wear" },
    note: {
      vi: "Tiếng Việt chỉ có một từ \"mặc/mang/đội\" chung chung, nhưng tiếng Nhật chọn động từ theo BỘ PHẬN CƠ THỂ mà món đồ che phủ, không theo loại quần áo. Học quy tắc theo vị trí (thân trên, chân, đầu, mặt, quanh eo/cổ) sẽ đoán đúng hơn là học thuộc lòng từng món đồ.",
      en: "Vietnamese and English both reach for one generic verb, but Japanese picks the verb based on WHICH BODY PART the item covers, not the type of clothing. Learn the rule by body region (torso, legs/feet, head, face, around the waist/neck) rather than memorizing item by item.",
    },
    words: [
      {
        kanji: "着る", kana: "きる", pos: "verb-group2",
        meaning: { vi: "mặc (áo, quần áo che thân trên)", en: "to wear/put on (torso clothing)" },
        nuance: {
          vi: "Dùng cho quần áo che THÂN TRÊN hoặc cả người khi mặc vào bằng cách chui/xỏ tay qua (áo sơ mi, áo khoác, áo dài, kimono). Đây cũng là động từ \"mặc\" mặc định mà học sinh học đầu tiên.",
          en: "For clothing worn over the TORSO (or the whole body) that you put on by pulling it over your arms/head -- shirts, jackets, coats, kimono. This is the default \"wear\" verb taught first.",
        },
        example: { ja: "私は白いシャツを着ています。", kana: "わたしはしろいシャツをきています。", vi: "Tôi đang mặc áo sơ mi trắng.", en: "I'm wearing a white shirt." },
      },
      {
        kanji: "履く", kana: "はく", pos: "verb-group1",
        meaning: { vi: "mang, xỏ (giày, quần, tất -- đồ che chân)", en: "to wear/put on (legs/feet)" },
        nuance: {
          vi: "Dùng cho bất cứ thứ gì bạn XỎ CHÂN vào: giày, dép, tất, và cả quần/váy (vì quần cũng xỏ qua chân, dù che thân dưới chứ không chỉ bàn chân). Đừng nhầm với 着る chỉ vì quần cũng là \"quần áo\".",
          en: "For anything you step INTO with your feet: shoes, socks, sandals -- and also pants/skirts (they go on over the legs, even though they're not footwear). The easy mistake is reaching for 着る just because pants are \"clothing\".",
        },
        example: { ja: "彼はいつも黒いズボンを履いています。", kana: "かれはいつもくろいズボンをはいています。", vi: "Anh ấy lúc nào cũng mặc quần đen.", en: "He always wears black pants." },
      },
      {
        kanji: "被る", kana: "かぶる", pos: "verb-group1",
        meaning: { vi: "đội (mũ, nón -- đồ che đầu)", en: "to wear/put on (headwear)" },
        nuance: {
          vi: "Dùng riêng cho đồ ĐỘI LÊN ĐẦU và trùm xuống (mũ, nón, mũ bảo hiểm). Không dùng cho kính hay khăn quàng cổ dù chúng cũng ở gần đầu.",
          en: "Reserved for things placed ON TOP OF and covering the head -- hats, caps, helmets. Not used for glasses or scarves even though they're also near the head.",
        },
        example: { ja: "兄は野球帽を被っています。", kana: "あにはやきゅうぼうをかぶっています。", vi: "Anh trai tôi đang đội mũ bóng chày.", en: "My older brother is wearing a baseball cap." },
      },
      {
        kanji: "かける", kana: "かける", pos: "verb-group2",
        meaning: { vi: "đeo (kính -- đồ móc/gác lên mặt)", en: "to wear (glasses)" },
        nuance: {
          vi: "Gần như chỉ dùng cho kính (めがねをかける) -- vật được \"gác\" lên tai và sống mũi chứ không mặc/đội/xỏ vào đâu cả. かける cũng là động từ đa nghĩa (gọi điện, treo tranh...) nên ở đây chỉ mượn nghĩa \"treo/gác lên\".",
          en: "Almost exclusively for glasses (めがねをかける) -- something \"hung\" on the ears and nose bridge rather than pulled on, over, or into anything. かける is a very multipurpose verb elsewhere (to call, to hang a picture...) -- this is just its \"hang onto\" sense borrowed for eyewear.",
        },
        example: { ja: "田中さんはめがねをかけています。", kana: "たなかさんはめがねをかけています。", vi: "Chị Tanaka đang đeo kính.", en: "Ms. Tanaka is wearing glasses." },
      },
      {
        kanji: "締める", kana: "しめる", pos: "verb-group2",
        meaning: { vi: "thắt, đeo (cà vạt, thắt lưng -- đồ buộc/siết quanh người)", en: "to wear/fasten (things tied around you)" },
        nuance: {
          vi: "Dùng cho đồ được BUỘC/SIẾT quanh một phần cơ thể: cà vạt, thắt lưng, dây an toàn. Nhấn mạnh động tác thắt chặt, khác với 着る/履く/被る/かける vốn chỉ nói về việc \"mặc vào\" đơn thuần.",
          en: "For things TIED or CINCHED around a part of the body -- neckties, belts, seatbelts. It carries the sense of tightening/fastening, unlike 着る/履く/被る/かける, which just describe putting something on.",
        },
        example: { ja: "父はネクタイを締めています。", kana: "ちちはネクタイをしめています。", vi: "Bố tôi đang thắt cà vạt.", en: "My father is wearing (tying) a necktie." },
      },
    ],
  },
  {
    id: "play",
    glossJa: "遊ぶ／弾く／やる／する",
    title: { vi: "chơi", en: "to play" },
    note: {
      vi: "Nhạc cụ dây/phím dùng 弾く, còn nhạc cụ hơi (sáo, kèn) lại dùng 吹く (fuku, \"thổi\") chứ không phải 弾く -- một cái bẫy nhỏ ngoài phạm vi 4 từ chính ở đây.",
      en: "Wind instruments (flute, trumpet) take 吹く (fuku, \"to blow\"), not 弾く, even though 弾く is \"to play\" for strings/keys -- a small trap just outside these four core words.",
    },
    words: [
      {
        kanji: "遊ぶ", kana: "あそぶ", pos: "verb-group1",
        meaning: { vi: "chơi, vui chơi, đi chơi", en: "to play, to have fun, to hang out" },
        nuance: {
          vi: "Nghĩa \"chơi\" chung chung nhất -- trẻ con chơi đùa, hoặc người lớn đi chơi/giao lưu với bạn bè. KHÔNG dùng cho việc chơi một môn thể thao hay nhạc cụ cụ thể.",
          en: "The most general \"play\" -- children playing, or adults hanging out/socializing with friends. NOT used for playing a specific sport or instrument.",
        },
        example: { ja: "子供たちは公園で遊んでいます。", kana: "こどもたちはこうえんであそんでいます。", vi: "Bọn trẻ đang chơi ở công viên.", en: "The children are playing in the park." },
      },
      {
        kanji: "弾く", kana: "ひく", pos: "verb-group1",
        meaning: { vi: "chơi, đánh (đàn -- nhạc cụ dây hoặc có phím)", en: "to play (string/keyboard instruments)" },
        nuance: {
          vi: "Dùng riêng cho nhạc cụ có DÂY hoặc PHÍM mà bạn gảy/gõ bằng tay: piano, guitar, đàn tranh. Không dùng cho môn thể thao.",
          en: "Specific to instruments with STRINGS or KEYS that you pluck or press: piano, guitar. Never used for sports.",
        },
        example: { ja: "彼女はピアノを弾くのが上手です。", kana: "かのじょはピアノをひくのがじょうずです。", vi: "Cô ấy chơi piano rất giỏi.", en: "She's good at playing the piano." },
      },
      {
        kanji: "やる", kana: "やる", pos: "verb-group1",
        meaning: { vi: "chơi, làm (thể thao/trò chơi -- văn nói, thân mật)", en: "to play/do (casual register)" },
        nuance: {
          vi: "Đồng nghĩa với する nhưng THÂN MẬT hơn, hay dùng trong văn nói khi rủ bạn bè chơi thể thao hoặc trò chơi. Tránh dùng với người trên/khách hàng vì hơi suồng sã.",
          en: "A CASUAL synonym of する, common in speech when talking about playing a sport or game with friends. Avoid it with superiors or customers -- it reads as a bit too informal.",
        },
        example: { ja: "週末、友達とテニスをやりました。", kana: "しゅうまつ、ともだちとテニスをやりました。", vi: "Cuối tuần tôi đã chơi tennis với bạn.", en: "I played tennis with a friend over the weekend." },
      },
      {
        kanji: "する", kana: "する", pos: "verb-group3",
        meaning: { vi: "chơi, làm (thể thao/trò chơi -- trung tính, lịch sự)", en: "to play/do (neutral, the textbook default)" },
        nuance: {
          vi: "Động từ TRUNG TÍNH, an toàn để dùng với môn thể thao hoặc trò chơi trong mọi hoàn cảnh, kể cả trang trọng. Là lựa chọn mặc định khi không chắc nên dùng やる hay する.",
          en: "The NEUTRAL, safe choice for a sport or game in any register, including formal contexts. When unsure whether やる or する fits, する is the default.",
        },
        example: { ja: "兄はサッカーをします。", kana: "あにはサッカーをします。", vi: "Anh trai tôi chơi bóng đá.", en: "My older brother plays soccer." },
      },
    ],
  },
  {
    id: "see-hear",
    glossJa: "見る／見える／聞く／聞こえる",
    title: { vi: "nhìn/thấy — nghe/nghe thấy", en: "to see & to hear" },
    note: {
      vi: "Cặp 見る/聞く (chủ động) và 見える/聞こえる (tự nhiên) đi theo hai cấu trúc khác nhau: 見る/聞く lấy を cho thứ mình chủ động hướng mắt/tai tới, còn 見える/聞こえる lấy が cho thứ tự nhiên lọt vào tầm nhìn/tai -- đảo ngược trợ từ là lỗi rất phổ biến.",
      en: "見る/聞く (deliberate) and 見える/聞こえる (spontaneous) follow different case patterns: 見る/聞く take を for what you deliberately look/listen at, while 見える/聞こえる take が for what simply reaches your eyes/ears -- swapping the particle is a very common mistake.",
    },
    words: [
      {
        kanji: "見る", kana: "みる", pos: "verb-group2",
        meaning: { vi: "xem, nhìn (chủ động)", en: "to look at, to watch (deliberate)" },
        nuance: {
          vi: "Hành động CHỦ ĐỘNG hướng mắt tới một thứ và tập trung vào nó -- xem TV, xem phim, nhìn ai đó. Vật được xem đi với を.",
          en: "A DELIBERATE action of directing your eyes at something and focusing on it -- watching TV, watching a movie, looking at someone. Takes を for the thing looked at.",
        },
        example: { ja: "私は毎晩テレビを見ます。", kana: "わたしはまいばんテレビをみます。", vi: "Tối nào tôi cũng xem TV.", en: "I watch TV every night." },
      },
      {
        kanji: "見える", kana: "みえる", pos: "verb-group2",
        meaning: { vi: "thấy được, nhìn thấy (tự nhiên, không chủ ý)", en: "to be visible, to be able to see (spontaneous)" },
        nuance: {
          vi: "Mô tả việc một thứ TỰ NHIÊN lọt vào tầm mắt mà không cần cố gắng -- không phải hành động \"nhìn\", mà là trạng thái \"nhìn thấy được\". Vật thấy được đi với が, không phải を.",
          en: "Describes something entering your field of vision on its own, with no effort -- not the action of looking, but the state of being visible. Takes が for the thing seen, never を.",
        },
        example: { ja: "ここから富士山が見えます。", kana: "ここからふじさんがみえます。", vi: "Từ đây có thể thấy núi Phú Sĩ.", en: "You can see Mt. Fuji from here." },
      },
      {
        kanji: "聞く", kana: "きく", pos: "verb-group1",
        meaning: { vi: "nghe, nghe (chủ động); hỏi", en: "to listen to (deliberate); to ask" },
        nuance: {
          vi: "Hành động CHỦ ĐỘNG lắng nghe một thứ (nhạc, bài giảng), hoặc \"hỏi\" ai đó. Vật được nghe đi với を.",
          en: "A DELIBERATE action of listening to something (music, a lecture), or \"to ask\" someone. Takes を for what's listened to.",
        },
        example: { ja: "音楽を聞くのが好きです。", kana: "おんがくをきくのがすきです。", vi: "Tôi thích nghe nhạc.", en: "I like listening to music." },
      },
      {
        kanji: "聞こえる", kana: "きこえる", pos: "verb-group2",
        meaning: { vi: "nghe thấy được (tự nhiên, không chủ ý)", en: "to be audible, to be able to hear (spontaneous)" },
        nuance: {
          vi: "Mô tả âm thanh TỰ NHIÊN lọt vào tai mà không cần cố nghe -- trạng thái \"nghe thấy được\", không phải hành động lắng nghe. Vật nghe được đi với が.",
          en: "Describes a sound reaching your ears on its own, unbidden -- the state of being audible, not the act of listening. Takes が for the sound heard.",
        },
        example: { ja: "となりの部屋から声が聞こえます。", kana: "となりのへやからこえがきこえます。", vi: "Nghe thấy tiếng nói vọng từ phòng bên cạnh.", en: "I can hear a voice from the next room." },
      },
    ],
  },
  {
    id: "know-understand",
    glossJa: "知る／わかる",
    title: { vi: "biết / hiểu", en: "to know & to understand" },
    note: {
      vi: "知る thường chỉ xuất hiện ở dạng 知っている (\"đang ở trạng thái biết\") khi nói về hiện tại -- dạng 知ります từ điển nhấn mạnh khoảnh khắc BIẾT ĐƯỢC, không phải trạng thái \"biết\" kéo dài.",
      en: "知る almost always shows up as 知っている (\"is in the state of knowing\") when talking about the present -- the bare dictionary form 知ります emphasizes the moment of finding out, not an ongoing state of knowing.",
    },
    words: [
      {
        kanji: "知る", kana: "しる", pos: "verb-group1",
        meaning: { vi: "biết (một thông tin/sự việc)", en: "to know (a fact), to learn of/find out" },
        nuance: {
          vi: "Nói về việc biết một THÔNG TIN, SỰ VIỆC cụ thể (tin tức, tên, địa chỉ). Ở thì phủ định KHÔNG dùng 知っていません mà dùng 知りません.",
          en: "About knowing a specific FACT or piece of INFORMATION (news, a name, an address). Its negative is 知りません, never 知っていません.",
        },
        example: { ja: "そのニュースを知っていますか。", kana: "そのニュースをしっていますか。", vi: "Bạn có biết tin đó không?", en: "Do you know that news?" },
      },
      {
        kanji: "わかる", kana: "わかる", pos: "verb-group1",
        meaning: { vi: "hiểu, hiểu được", en: "to understand, to comprehend" },
        nuance: {
          vi: "Nói về việc HIỂU một ý nghĩa, tình huống, cảm xúc, hay ngôn ngữ -- một quá trình \"vỡ ra\" trong đầu, không chỉ đơn thuần \"có thông tin\" như 知る. Vật hiểu được đi với が.",
          en: "About comprehending a meaning, situation, feeling, or language -- something \"clicking\" mentally, not just possessing information the way 知る does. Takes が for what's understood.",
        },
        example: { ja: "意味がわかりません。", kana: "いみがわかりません。", vi: "Tôi không hiểu ý nghĩa.", en: "I don't understand the meaning." },
      },
    ],
  },
  {
    id: "borrow-lend",
    glossJa: "借りる／貸す",
    title: { vi: "mượn / cho mượn", en: "to borrow & to lend" },
    note: {
      vi: "Hai từ đi ngược hướng nhau nên chiều trợ từ cũng đảo: \"mượn TỪ ai\" dùng から/に + 借りる, còn \"cho ai mượn\" dùng に + 貸す. Nhầm hai từ này là lỗi rất phổ biến vì tiếng Việt/Anh dễ lẫn hướng cho-nhận.",
      en: "The two verbs point in opposite directions, so the particle direction flips too: \"borrow FROM someone\" uses から/に + 借りる, while \"lend TO someone\" uses に + 貸す. Mixing them up is a very common mistake since English/Vietnamese speakers easily lose track of which way the giving goes.",
    },
    words: [
      {
        kanji: "借りる", kana: "かりる", pos: "verb-group2",
        meaning: { vi: "mượn, vay (nhận tạm thời)", en: "to borrow (receive temporarily)" },
        nuance: {
          vi: "Bạn là người NHẬN đồ tạm thời. Nguồn mượn đi với から (hoặc に): 図書館で本を借りる (mượn sách ở thư viện).",
          en: "You're the one RECEIVING something temporarily. The source takes から (or に): 図書館で本を借りる (borrow a book at the library).",
        },
        example: { ja: "図書館で本を借りました。", kana: "としょかんでほんをかりました。", vi: "Tôi đã mượn sách ở thư viện.", en: "I borrowed a book at the library." },
      },
      {
        kanji: "貸す", kana: "かす", pos: "verb-group1",
        meaning: { vi: "cho mượn, cho vay (đưa tạm thời)", en: "to lend (give temporarily)" },
        nuance: {
          vi: "Bạn là người ĐƯA đồ cho người khác dùng tạm. Người nhận đi với に: 友達に傘を貸す (cho bạn mượn ô).",
          en: "You're the one GIVING something for someone else's temporary use. The recipient takes に: 友達に傘を貸す (lend an umbrella to a friend).",
        },
        example: { ja: "友達に傘を貸しました。", kana: "ともだちにかさをかしました。", vi: "Tôi đã cho bạn mượn ô.", en: "I lent my umbrella to a friend." },
      },
    ],
  },
  {
    id: "teach-learn",
    glossJa: "教える／習う／学ぶ",
    title: { vi: "dạy / học", en: "to teach & to learn" },
    words: [
      {
        kanji: "教える", kana: "おしえる", pos: "verb-group2",
        meaning: { vi: "dạy; chỉ, cho biết (thông tin)", en: "to teach; to tell/inform" },
        nuance: {
          vi: "Nghĩa \"dạy\" (dạy học sinh), nhưng cũng thường dùng với nghĩa \"cho biết, chỉ cho\" một thông tin -- điện話番号を教えてください (làm ơn cho tôi biết số điện thoại) không liên quan gì đến việc \"dạy học\".",
          en: "Means \"to teach\" (a teacher teaching students), but just as often means \"to tell/inform\" -- 電話番号を教えてください (please tell me your phone number) has nothing to do with classroom teaching.",
        },
        example: { ja: "田中先生は日本語を教えています。", kana: "たなかせんせいはにほんごをおしえています。", vi: "Thầy Tanaka đang dạy tiếng Nhật.", en: "Mr. Tanaka teaches Japanese." },
      },
      {
        kanji: "習う", kana: "ならう", pos: "verb-group1",
        meaning: { vi: "học (từ ai đó, có người dạy)", en: "to learn (from a teacher/in lessons)" },
        nuance: {
          vi: "Nói về việc học một KỸ NĂNG hoặc MÔN HỌC cụ thể, thường ngụ ý có người dạy/hướng dẫn trực tiếp (lớp học, gia sư). Người dạy đi với に.",
          en: "About learning a specific SKILL or SUBJECT, usually implying a teacher or instructor is directly involved (a class, a tutor). The teacher takes に.",
        },
        example: { ja: "私は先生にピアノを習っています。", kana: "わたしはせんせいにピアノをならっています。", vi: "Tôi đang học piano với thầy.", en: "I'm learning piano from a teacher." },
      },
      {
        kanji: "学ぶ", kana: "まなぶ", pos: "verb-group1",
        meaning: { vi: "học, nghiên cứu (trang trọng, học thuật)", en: "to study/learn (formal, academic)" },
        nuance: {
          vi: "TRANG TRỌNG và mang tính học thuật hơn 習う -- hay dùng cho việc học ở đại học, nghiên cứu chuyên sâu, hoặc \"học được\" một bài học từ trải nghiệm, không nhất thiết cần một người thầy cụ thể.",
          en: "More FORMAL and academic than 習う -- common for university-level study, deep research, or \"learning a lesson\" from an experience, without necessarily naming a specific teacher.",
        },
        example: { ja: "大学で経済学を学んでいます。", kana: "だいがくでけいざいがくをまなんでいます。", vi: "Tôi đang học kinh tế học ở đại học.", en: "I'm studying economics at university." },
      },
    ],
  },
  {
    id: "bring-take",
    glossJa: "持っていく／持ってくる／連れていく／連れてくる",
    title: { vi: "mang đi / mang đến — dẫn đi / dẫn đến", en: "to bring & to take (things vs. people)" },
    note: {
      vi: "持つ (cầm, mang) chỉ dùng cho ĐỒ VẬT, còn 連れる (dẫn theo) chỉ dùng cho NGƯỜI/ĐỘNG VẬT -- không bao giờ đảo ngược. Sau đó ghép với いく (đi xa người nói) hoặc くる (đến gần người nói) như một cặp riêng.",
      en: "持つ (to hold/carry) is only for OBJECTS, and 連れる (to bring along) is only for PEOPLE/ANIMALS -- they're never interchangeable. Both then combine with いく (moving away from the speaker) or くる (moving toward the speaker), a separate choice.",
    },
    words: [
      {
        kanji: "持っていく", kana: "もっていく", pos: "verb-group1",
        meaning: { vi: "mang (đồ vật) đi", en: "to take (an object) there" },
        nuance: {
          vi: "Mang một ĐỒ VẬT rời khỏi vị trí người nói, hướng tới nơi khác.",
          en: "Taking an OBJECT away from the speaker's location, toward somewhere else.",
        },
        example: { ja: "傘を持っていってください。", kana: "かさをもっていってください。", vi: "Hãy mang theo ô đi nhé.", en: "Please take an umbrella with you." },
      },
      {
        kanji: "持ってくる", kana: "もってくる", pos: "verb-group3",
        meaning: { vi: "mang (đồ vật) đến/lại đây", en: "to bring (an object) here" },
        nuance: {
          vi: "Mang một ĐỒ VẬT tới vị trí người nói (hoặc quay lại mang theo).",
          en: "Bringing an OBJECT to the speaker's location (or going and coming back with it).",
        },
        example: { ja: "明日、資料を持ってきます。", kana: "あした、しりょうをもってきます。", vi: "Ngày mai tôi sẽ mang tài liệu tới.", en: "I'll bring the documents tomorrow." },
      },
      {
        kanji: "連れていく", kana: "つれていく", pos: "verb-group1",
        meaning: { vi: "dẫn (người/động vật) đi", en: "to take (a person/animal) there" },
        nuance: {
          vi: "Dẫn một NGƯỜI hoặc ĐỘNG VẬT rời khỏi vị trí người nói -- không bao giờ dùng cho đồ vật.",
          en: "Taking a PERSON or ANIMAL away from the speaker's location -- never used for objects.",
        },
        example: { ja: "弟を病院に連れていきました。", kana: "おとうとをびょういんにつれていきました。", vi: "Tôi đã dẫn em trai đi bệnh viện.", en: "I took my younger brother to the hospital." },
      },
      {
        kanji: "連れてくる", kana: "つれてくる", pos: "verb-group3",
        meaning: { vi: "dẫn (người/động vật) đến/lại đây", en: "to bring (a person/animal) here" },
        nuance: {
          vi: "Dẫn một NGƯỜI hoặc ĐỘNG VẬT tới vị trí người nói -- cũng không bao giờ dùng cho đồ vật.",
          en: "Bringing a PERSON or ANIMAL to the speaker's location -- also never used for objects.",
        },
        example: { ja: "パーティーに友達を連れてきてもいいですか。", kana: "パーティーにともだちをつれてきてもいいですか。", vi: "Tôi có thể dẫn bạn tới bữa tiệc không?", en: "Can I bring a friend to the party?" },
      },
    ],
  },
  {
    id: "say-speak",
    glossJa: "言う／話す／しゃべる",
    title: { vi: "nói", en: "to say & to speak" },
    words: [
      {
        kanji: "言う", kana: "いう", pos: "verb-group1",
        meaning: { vi: "nói (một lời/câu cụ thể)", en: "to say (specific words)" },
        nuance: {
          vi: "Nói ra NỘI DUNG CỤ THỂ của lời nói, thường theo sau bởi と và phần trích dẫn. Không dùng để nói về khả năng ngôn ngữ (không nói 日本語を言う khi ý là \"biết nói tiếng Nhật\").",
          en: "About the specific CONTENT of what's said, usually followed by と and a quotation. Not used for language ability -- 日本語を言う doesn't mean \"can speak Japanese\".",
        },
        example: { ja: "彼は「ありがとう」と言いました。", kana: "かれは「ありがとう」といいました。", vi: "Anh ấy đã nói \"cảm ơn\".", en: "He said \"thank you\"." },
      },
      {
        kanji: "話す", kana: "はなす", pos: "verb-group1",
        meaning: { vi: "nói chuyện, nói (một thứ tiếng)", en: "to speak, to talk (about); to speak (a language)" },
        nuance: {
          vi: "Dùng cho việc TRÒ CHUYỆN, bàn luận một chủ đề, hoặc khả năng NÓI MỘT THỨ TIẾNG (英語を話す = nói được tiếng Anh). Đây là động từ đúng khi nói về năng lực ngôn ngữ.",
          en: "For CONVERSATION, discussing a topic, or language ABILITY (英語を話す = can speak English). This is the correct verb for talking about language proficiency.",
        },
        example: { ja: "田中さんは英語を話すことができます。", kana: "たなかさんはえいごをはなすことができます。", vi: "Anh Tanaka có thể nói tiếng Anh.", en: "Mr. Tanaka can speak English." },
      },
      {
        kanji: "しゃべる", kana: "しゃべる", pos: "verb-group1",
        meaning: { vi: "tán gẫu, nói chuyện phiếm (thân mật)", en: "to chat, to talk idly (casual)" },
        nuance: {
          vi: "THÂN MẬT hơn 話す nhiều, thường hàm ý nói chuyện phiếm, đôi khi nói \"quá nhiều\". Tránh dùng trong văn viết trang trọng.",
          en: "Much more CASUAL than 話す, often implying idle chit-chat, sometimes with a hint of talking \"too much\". Avoid in formal writing.",
        },
        example: { ja: "女子学生たちは休み時間にずっとしゃべっていた。", kana: "じょしがくせいたちはやすみじかんにずっとしゃべっていた。", vi: "Các nữ sinh cứ tán gẫu suốt giờ giải lao.", en: "The girls chatted the entire break." },
      },
    ],
  },
  {
    id: "return",
    glossJa: "帰る／戻る",
    title: { vi: "về / quay lại", en: "to return & to go back" },
    words: [
      {
        kanji: "帰る", kana: "かえる", pos: "verb-group1",
        meaning: { vi: "về (nhà, nơi thuộc về mình)", en: "to go home, to return to one's base" },
        nuance: {
          vi: "Ngụ ý về nơi mình THUỘC VỀ -- nhà, quê hương, công ty (khi hết ngày làm việc và về hẳn). Mang cảm giác \"kết thúc\" chuyến đi hôm đó.",
          en: "Implies returning to where you BELONG -- home, your home country, or the office at the end of the workday. Carries a sense of \"done for the day\", the trip wrapping up.",
        },
        example: { ja: "今日は早く家に帰ります。", kana: "きょうははやくいえにかえります。", vi: "Hôm nay tôi sẽ về nhà sớm.", en: "I'll go home early today." },
      },
      {
        kanji: "戻る", kana: "もどる", pos: "verb-group1",
        meaning: { vi: "quay lại, trở về (một nơi bất kỳ, tạm thời)", en: "to go back, to return (to any place, often briefly)" },
        nuance: {
          vi: "Trung tính hơn 帰る -- quay lại BẤT KỲ nơi nào (chỗ ngồi, lớp học, văn phòng) mà không ngụ ý đó là nơi \"thuộc về\" mình, thường mang tính tạm thời (quay lại rồi sẽ đi tiếp).",
          en: "More neutral than 帰る -- going back to ANY place (a seat, a classroom, an office) without implying it's home base, often something temporary (you'll head out again after).",
        },
        example: { ja: "すみません、忘れ物を取りに教室に戻ります。", kana: "すみません、わすれものをとりにきょうしつにもどります。", vi: "Xin lỗi, tôi quay lại lớp lấy đồ để quên.", en: "Excuse me, I'm going back to the classroom to get something I forgot." },
      },
    ],
  },
  {
    id: "think",
    glossJa: "思う／考える",
    title: { vi: "nghĩ", en: "to think" },
    words: [
      {
        kanji: "思う", kana: "おもう", pos: "verb-group1",
        meaning: { vi: "cảm thấy, nghĩ (cảm nhận chủ quan)", en: "to feel, to have an opinion/impression" },
        nuance: {
          vi: "CẢM NHẬN mang tính chủ quan, bộc phát -- ý kiến, cảm xúc, ấn tượng. Mẫu 〜と思います cực kỳ phổ biến để làm mềm ý kiến cá nhân trong giao tiếp.",
          en: "A SUBJECTIVE, spontaneous feeling -- an opinion, emotion, or impression. The pattern 〜と思います is extremely common for softening a personal opinion in conversation.",
        },
        example: { ja: "この映画は面白いと思います。", kana: "このえいがはおもしろいとおもいます。", vi: "Tôi nghĩ bộ phim này thú vị.", en: "I think this movie is interesting." },
      },
      {
        kanji: "考える", kana: "かんがえる", pos: "verb-group2",
        meaning: { vi: "suy nghĩ, cân nhắc (chủ động, có chủ đích)", en: "to think about, to consider (deliberately)" },
        nuance: {
          vi: "Quá trình SUY NGHĨ CHỦ ĐỘNG, có chủ đích -- cân nhắc lựa chọn, giải quyết vấn đề, lên kế hoạch. Khác với 思う vốn chỉ là cảm nhận thoáng qua.",
          en: "An ACTIVE, deliberate mental process -- weighing options, working through a problem, planning. Unlike 思う, which is just a passing impression.",
        },
        example: { ja: "将来のことをよく考えています。", kana: "しょうらいのことをよくかんがえています。", vi: "Tôi đang suy nghĩ kỹ về tương lai.", en: "I'm carefully thinking about my future." },
      },
    ],
  },
]

export const collocationGroups: CollocationGroup[] = [
  {
    id: "transport",
    title: { vi: "Lên / xuống phương tiện", en: "Boarding & getting off vehicles" },
    description: {
      vi: "乗る (lên xe) và 降りる (xuống xe) đều là TỰ ĐỘNG TỪ, nhưng lấy hai trợ từ khác nhau -- に cho điểm đến, を cho điểm rời đi. Cả hai đều dễ bị đoán nhầm thành を vì nghe như \"lên/xuống CÁI GÌ\" trong tiếng Việt/Anh.",
      en: "乗る (board) and 降りる (get off) are both INTRANSITIVE, yet take different particles -- に for the destination boarded, を for the point departed. Both are easy to misguess as を, since English/Vietnamese phrase them like a direct object.",
    },
    entries: [
      {
        id: "densha-ni-noru", pattern: "Nに乗る", particle: "に",
        verb: { kanji: "乗る", kana: "のる", meaning: { vi: "lên (xe, tàu)", en: "to board, to get on" } },
        explanation: {
          vi: "に đánh dấu phương tiện mà bạn LÊN -- điểm bạn di chuyển tới và tiếp xúc với. 乗る là tự động từ nên を sẽ sai ngữ pháp ở đây.",
          en: "に marks the vehicle you get ONTO -- the point you move to and make contact with. 乗る is intransitive, so を here would be ungrammatical.",
        },
        trap: {
          vi: "Học sinh hay chọn を vì \"đi tàu\" nghe như tàu là tân ngữ bị tác động -- nhưng bạn không \"làm gì\" cho cái tàu, bạn chỉ di chuyển lên nó, nên に mới đúng.",
          en: "Learners often reach for を because \"ride the train\" sounds like the train is being acted on -- but you're not doing anything TO the train, just moving onto it, so に is correct.",
        },
        example: { ja: "駅で電車に乗ります。", kana: "えきででんしゃにのります。", vi: "Tôi lên tàu ở nhà ga.", en: "I board the train at the station." },
        contrastId: "densha-wo-oriru",
      },
      {
        id: "densha-wo-oriru", pattern: "Nを降りる", particle: "を",
        verb: { kanji: "降りる", kana: "おりる", meaning: { vi: "xuống (xe, tàu)", en: "to get off, to disembark" } },
        explanation: {
          vi: "を ở đây đánh dấu điểm bạn RỜI ĐI, không phải tân ngữ bị tác động -- cùng cách dùng を với 家を出る (rời khỏi nhà). 降りる vẫn là tự động từ dù lấy を.",
          en: "を here marks the point you DEPART FROM, not an object being acted on -- the same を-for-departure-point pattern as 家を出る (leave the house). 降りる is still intransitive despite taking を.",
        },
        trap: {
          vi: "から (電車から降りる) cũng đúng ngữ pháp và nhấn mạnh \"từ\" phương tiện, nhưng を tự nhiên và phổ biến hơn trong hầu hết ngữ cảnh.",
          en: "から (電車から降りる) is also grammatical and emphasizes \"from\" the vehicle, but を is the more natural, common choice in most contexts.",
        },
        example: { ja: "次の駅で電車を降ります。", kana: "つぎのえきででんしゃをおります。", vi: "Tôi sẽ xuống tàu ở ga tiếp theo.", en: "I'll get off the train at the next station." },
        contrastId: "densha-ni-noru",
      },
    ],
  },
  {
    id: "feelings-relationships",
    title: { vi: "Cảm xúc & mối quan hệ (bẫy trợ từ が/と)", en: "Feelings & relationships (が/と traps)" },
    description: {
      vi: "Bốn mẫu câu dưới đây đều \"trông giống\" động từ có tân ngữ trực tiếp trong tiếng Việt/Anh, nhưng tiếng Nhật lại dùng が, に, hoặc と thay vì を -- một trong những nhóm bẫy trợ từ phổ biến nhất với người mới học.",
      en: "All four patterns below \"look like\" they take a direct object in English/Vietnamese, but Japanese uses が, に, or と instead of を -- one of the most common particle-trap clusters for beginners.",
    },
    entries: [
      {
        id: "sensei-ni-au", pattern: "Nに会う", particle: "に",
        verb: { kanji: "会う", kana: "あう", meaning: { vi: "gặp", en: "to meet" } },
        explanation: {
          vi: "に đánh dấu người được gặp. を không bao giờ dùng với 会う, dù \"gặp ai đó\" nghe như câu có tân ngữ trực tiếp trong tiếng Việt/Anh.",
          en: "に marks the person met. を is never used with 会う, even though \"meet someone\" reads like a transitive verb with a direct object in English.",
        },
        trap: {
          vi: "と会う cũng đúng ngữ pháp (友達と会う), nhưng ngụ ý một cuộc gặp có SẮP XẾP TRƯỚC, mang tính hai chiều/bình đẳng -- còn に là lựa chọn mặc định, trung tính trong hầu hết trường hợp.",
          en: "と会う is also grammatical (友達と会う) but implies a PREARRANGED, mutual/equal meeting -- while に is the neutral default in most cases.",
        },
        example: { ja: "明日、先生に会います。", kana: "あした、せんせいにあいます。", vi: "Ngày mai tôi sẽ gặp thầy giáo.", en: "I'll meet my teacher tomorrow." },
      },
      {
        id: "ga-suki", pattern: "Nが好きです", particle: "が",
        verb: { kanji: "好き", kana: "すき", meaning: { vi: "thích", en: "to like" } },
        explanation: {
          vi: "好き là TÍNH TỪ đuôi な, không phải động từ -- thứ được thích đi với が, không phải を.",
          en: "好き is a な-adjective, not a verb -- the thing liked takes が, not を.",
        },
        trap: {
          vi: "Học sinh hay dịch thẳng \"tôi thích X\" thành 私はXを好きです -- câu này SAI ngữ pháp. Phải là Xが好きです.",
          en: "Learners often translate \"I like X\" directly as 私はXを好きです -- this is UNGRAMMATICAL. It must be Xが好きです.",
        },
        example: { ja: "私は日本のアニメが好きです。", kana: "わたしはにほんのアニメがすきです。", vi: "Tôi thích anime Nhật Bản.", en: "I like Japanese anime." },
      },
      {
        id: "ga-wakaru", pattern: "Nがわかる", particle: "が",
        verb: { kanji: "分かる", kana: "わかる", meaning: { vi: "hiểu", en: "to understand" } },
        explanation: {
          vi: "わかる là tự động từ -- thứ được hiểu đi với が, không phải を.",
          en: "わかる is intransitive -- the thing understood takes が, not を.",
        },
        trap: {
          vi: "意味を分かります là lỗi rất phổ biến; câu đúng là 意味がわかります.",
          en: "意味を分かります is a very common learner mistake; the correct form is 意味がわかります.",
        },
        example: { ja: "この漢字の意味がわかりません。", kana: "このかんじのいみがわかりません。", vi: "Tôi không hiểu nghĩa của chữ Hán này.", en: "I don't understand the meaning of this kanji." },
      },
      {
        id: "to-kekkon-suru", pattern: "Nと結婚する", particle: "と",
        verb: { kanji: "結婚する", kana: "けっこんする", meaning: { vi: "kết hôn", en: "to marry" } },
        explanation: {
          vi: "と đánh dấu người mà bạn kết hôn CÙNG -- kết hôn ngụ ý một hành động hai chiều giữa hai người, nên dùng と (\"cùng với\") chứ không phải を.",
          en: "と marks the person you marry -- marriage implies a mutual action between two people, so と (\"together with\") is used, not を.",
        },
        trap: {
          vi: "彼女を結婚する là lỗi kinh điển. 結婚をする một mình (không nêu đối tượng) thì đúng (\"kết hôn/lập gia đình\"), nhưng khi nêu người kết hôn cùng, luôn phải là と.",
          en: "彼女を結婚する is a classic mistake. 結婚をする alone (no partner named) is fine (\"to get married\"), but naming who you marry always requires と.",
        },
        example: { ja: "来年、彼女と結婚します。", kana: "らいねん、かのじょとけっこんします。", vi: "Sang năm tôi sẽ kết hôn với cô ấy.", en: "I'm marrying her next year." },
      },
    ],
  },
  {
    id: "motion-through-space",
    title: { vi: "を với động từ di chuyển (tự động từ)", en: "を with motion verbs (intransitive)" },
    description: {
      vi: "を không chỉ đánh dấu tân ngữ bị tác động bởi tha động từ -- với các động từ CHỈ SỰ DI CHUYỂN (đều là tự động từ), を đánh dấu ĐIỂM XUẤT PHÁT hoặc KHÔNG GIAN ĐI QUA. Đây là một trong những cú sốc cấu trúc lớn nhất với người quen logic tiếng Anh.",
      en: "を isn't only for the object of a transitive verb -- with verbs of MOTION (all intransitive), を marks the POINT OF DEPARTURE or the SPACE TRAVERSED. This is one of the biggest structural surprises for learners used to English's object-marking logic.",
    },
    entries: [
      {
        id: "ie-wo-deru", pattern: "Nを出る", particle: "を",
        verb: { kanji: "出る", kana: "でる", meaning: { vi: "ra khỏi, rời khỏi", en: "to leave, to exit" } },
        explanation: {
          vi: "を đánh dấu nơi bạn RỜI KHỎI. 出る là tự động từ (không có ai \"bị\" rời đi), nhưng vẫn lấy を cho điểm xuất phát.",
          en: "を marks the place you LEAVE. 出る is intransitive (nothing is being \"left\" in the transitive sense), yet still takes を for the point of departure.",
        },
        example: { ja: "毎朝七時に家を出ます。", kana: "まいあさしちじにいえをでます。", vi: "Sáng nào tôi cũng ra khỏi nhà lúc 7 giờ.", en: "I leave the house at 7 every morning." },
      },
      {
        id: "hashi-wo-wataru", pattern: "Nを渡る", particle: "を",
        verb: { kanji: "渡る", kana: "わたる", meaning: { vi: "băng qua, đi qua", en: "to cross" } },
        explanation: {
          vi: "を đánh dấu KHÔNG GIAN bạn đi qua/băng qua (cầu, đường, sông) -- cùng loại を với 出る, không phải tân ngữ.",
          en: "を marks the SPACE you cross or move through (a bridge, a road, a river) -- the same kind of を as 出る, not an object.",
        },
        example: { ja: "この橋を渡ると公園があります。", kana: "このはしをわたるとこうえんがあります。", vi: "Băng qua cây cầu này thì có công viên.", en: "There's a park once you cross this bridge." },
      },
      {
        id: "sora-wo-tobu", pattern: "Nを飛ぶ", particle: "を",
        verb: { kanji: "飛ぶ", kana: "とぶ", meaning: { vi: "bay", en: "to fly" } },
        explanation: {
          vi: "を đánh dấu không gian di chuyển qua (bầu trời) -- cùng cấu trúc \"を = không gian đi qua\" như 渡る/歩く, không phải \"bay cái bầu trời\".",
          en: "を marks the space moved through (the sky) -- the same \"を = traversed space\" pattern as 渡る/歩く, not \"flying the sky\" as an object.",
        },
        example: { ja: "鳥が空を飛んでいます。", kana: "とりがそらをとんでいます。", vi: "Chim đang bay trên bầu trời.", en: "A bird is flying through the sky." },
      },
    ],
  },
  {
    id: "phone-everyday",
    title: { vi: "Điện thoại & sinh hoạt hằng ngày", en: "Phone & everyday actions" },
    description: {
      vi: "Vài động từ hằng ngày có trợ từ cố định không đoán được từ nghĩa tiếng Việt/Anh -- phải học thuộc từng cụm như một cặp trọn vẹn.",
      en: "A handful of everyday verbs pair with a fixed particle that can't be guessed from the English/Vietnamese meaning -- learn each as a fixed chunk.",
    },
    entries: [
      {
        id: "hito-ni-denwa-wo-kakeru", pattern: "（人）に電話をかける", particle: "に",
        verb: { kanji: "電話をかける", kana: "でんわをかける", meaning: { vi: "gọi điện (cho ai)", en: "to make a phone call (to someone)" } },
        explanation: {
          vi: "電話 (cuộc gọi) là tân ngữ với を, còn NGƯỜI ĐƯỢC GỌI đi với に -- hai trợ từ trong cùng một câu, dễ nhầm lẫn nếu chỉ nhớ một trợ từ duy nhất.",
          en: "電話 (the call) is the object with を, while the PERSON CALLED takes に -- two particles in one sentence, easy to blur if you only remember one.",
        },
        example: { ja: "友達に電話をかけました。", kana: "ともだちにでんわをかけました。", vi: "Tôi đã gọi điện cho bạn.", en: "I made a phone call to a friend." },
        contrastId: "denwa-ni-deru",
      },
      {
        id: "denwa-ni-deru", pattern: "電話に出る", particle: "に",
        verb: { kanji: "電話に出る", kana: "でんわにでる", meaning: { vi: "nghe (trả lời) điện thoại", en: "to answer the phone" } },
        explanation: {
          vi: "Cụm cố định nghĩa đen \"ra/xuất hiện trước cuộc gọi\" -- に ở đây không chỉ hướng di chuyển vật lý mà chỉ cuộc gọi bạn phản hồi. Học thuộc như một cụm từ, không suy luận từ nghĩa từng chữ.",
          en: "A fixed idiom literally \"come out to the call\" -- に here doesn't mark physical motion toward a place but the call you respond to. Learn it as a set phrase rather than reasoning from the individual words.",
        },
        example: { ja: "電話に出られませんでした。", kana: "でんわにでられませんでした。", vi: "Tôi đã không thể nghe máy.", en: "I wasn't able to answer the phone." },
        contrastId: "hito-ni-denwa-wo-kakeru",
      },
      {
        id: "ni-sumu", pattern: "Nに住む", particle: "に",
        verb: { kanji: "住む", kana: "すむ", meaning: { vi: "sống, sinh sống (ở)", en: "to live (in)" } },
        explanation: {
          vi: "に đánh dấu nơi CƯ TRÚ, một vị trí tồn tại lâu dài, không phải hướng di chuyển.",
          en: "に marks the place of RESIDENCE -- an ongoing location, not a direction of motion.",
        },
        example: { ja: "私は東京に住んでいます。", kana: "わたしはとうきょうにすんでいます。", vi: "Tôi sống ở Tokyo.", en: "I live in Tokyo." },
      },
      {
        id: "ni-maniau", pattern: "Nに間に合う", particle: "に",
        verb: { kanji: "間に合う", kana: "まにあう", meaning: { vi: "kịp (giờ)", en: "to make it in time (for)" } },
        explanation: {
          vi: "に đánh dấu thời điểm/sự kiện bạn kịp tới, giống cách に đánh dấu thời gian trong nhiều mẫu câu khác.",
          en: "に marks the time or event you make it in time for, the same way に marks time elsewhere.",
        },
        example: { ja: "急げば、電車に間に合います。", kana: "いそげば、でんしゃにまにあいます。", vi: "Nếu vội thì sẽ kịp chuyến tàu.", en: "If we hurry, we'll make it in time for the train." },
      },
      {
        id: "ni-mayou", pattern: "Nに迷う", particle: "に",
        verb: { kanji: "迷う", kana: "まよう", meaning: { vi: "lạc, phân vân (về)", en: "to get lost (in); to be at a loss (over)" } },
        explanation: {
          vi: "に đánh dấu thứ khiến bạn lạc hoặc phân vân (con đường, sự lựa chọn) -- 道に迷う (lạc đường) là cụm cố định thường gặp.",
          en: "に marks what you're lost in or torn over (a road, a choice) -- 道に迷う (get lost) is a common fixed collocation.",
        },
        example: { ja: "知らない町で道に迷いました。", kana: "しらないまちでみちにまよいました。", vi: "Tôi đã bị lạc đường ở thành phố lạ.", en: "I got lost in an unfamiliar town." },
      },
    ],
  },
]

export const auxiliaryVerbs: AuxiliaryVerb[] = [
  {
    id: "te-shimau", pattern: "〜てしまう", colloquial: "〜ちゃう／〜じゃう",
    meaning: { vi: "làm xong hẳn / lỡ làm gì đó", en: "to finish completely / to end up doing" },
    nuance: {
      vi: "Có hai cách hiểu tùy ngữ cảnh: (a) HOÀN THÀNH trọn vẹn, nhấn mạnh hành động đã xong hẳn, không còn dang dở; (b) TIẾC NUỐI, ngụ ý một việc không hay đã xảy ra và không thể vãn hồi. Ngữ điệu và ngữ cảnh quyết định cách hiểu nào, không phải ngữ pháp.",
      en: "Two readings depending on context: (a) COMPLETION, emphasizing the action is done thoroughly, nothing left hanging; (b) REGRET, implying something unfortunate happened and can't be undone. Tone and context decide which reading applies, not grammar.",
    },
    trap: {
      vi: "Đừng nhầm với 〜ておく (chuẩn bị trước) -- てしまう hướng về việc HOÀN TẤT/kết quả, còn ておく hướng về lợi ích trong TƯƠNG LAI.",
      en: "Don't confuse with 〜ておく (advance preparation) -- てしまう looks toward completion/a result, while ておく looks toward a future benefit.",
    },
    examples: [
      { ja: "宿題を全部やってしまいました。", kana: "しゅくだいをぜんぶやってしまいました。", vi: "Tôi đã làm xong hết bài tập rồi.", en: "I finished all of my homework." },
      { ja: "電車の中でスマホを落としてしまいました。", kana: "でんしゃのなかでスマホをおとしてしまいました。", vi: "Tôi lỡ làm rơi điện thoại trên tàu điện.", en: "I ended up dropping my phone on the train." },
    ],
  },
  {
    id: "te-miru", pattern: "〜てみる",
    meaning: { vi: "thử làm gì đó", en: "to try doing (and see what happens)" },
    nuance: {
      vi: "Đóng khung hành động như một PHÉP THỬ -- \"thử xem sao\", không phải sự cam kết chắc chắn. Thường đi kèm nhận xét về kết quả ở câu sau.",
      en: "Frames the action as an EXPERIMENT -- \"let's see what happens\", not a firm commitment. Often followed by a comment about the result.",
    },
    trap: {
      vi: "Đừng dịch từng chữ -- 見る (nhìn) đã mất hoàn toàn nghĩa gốc, てみる chỉ còn nghĩa \"thử\", không liên quan gì đến việc nhìn.",
      en: "Don't translate word-by-word -- 見る's literal \"look\" meaning is completely bleached out; てみる just means \"try\", with no connection to looking.",
    },
    examples: [
      { ja: "この服を着てみてください。", kana: "このふくをきてみてください。", vi: "Hãy thử mặc bộ đồ này xem.", en: "Please try wearing this outfit." },
      { ja: "一度、富士山に登ってみたいです。", kana: "いちど、ふじさんにのぼってみたいです。", vi: "Tôi muốn thử leo núi Phú Sĩ một lần.", en: "I'd like to try climbing Mt. Fuji once." },
    ],
  },
  {
    id: "te-oku", pattern: "〜ておく", colloquial: "〜とく／〜どく",
    meaning: { vi: "làm sẵn trước / cứ để nguyên như vậy", en: "to do in advance / to leave as is" },
    nuance: {
      vi: "Hai nghĩa liên quan: (a) làm X ngay bây giờ để CHUẨN BỊ cho việc sau này; (b) CỐ Ý để nguyên hiện trạng vì có lợi về sau. Cả hai đều nhìn về phía trước, khác với てしまう vốn nhìn về kết quả đã xong.",
      en: "Two related senses: (a) doing X now to PREPARE for later; (b) deliberately LEAVING something as it is because it's convenient later. Both look forward, unlike てしまう which looks at a completed result.",
    },
    trap: {
      vi: "Dễ lẫn với てある trên bề mặt (cả hai đều mô tả một \"trạng thái đã chuẩn bị\"), nhưng ておく nhấn vào Ý ĐỊNH/hành động của người làm hướng tới tương lai, còn てある chỉ nêu trạng thái kết quả, không quan tâm ai là người lên kế hoạch.",
      en: "Easy to blur with てある on the surface (both describe a \"prepared\" state), but ておく emphasizes the doer's INTENT/action going forward, while てある just states the resultant state with no sense of whose plan it was.",
    },
    examples: [
      { ja: "明日の会議のために資料を準備しておきます。", kana: "あしたのかいぎのためにしりょうをじゅんびしておきます。", vi: "Tôi sẽ chuẩn bị sẵn tài liệu cho cuộc họp ngày mai.", en: "I'll prepare the materials in advance for tomorrow's meeting." },
      { ja: "ビールを冷蔵庫に入れておいてください。", kana: "ビールをれいぞうこにいれておいてください。", vi: "Hãy để bia vào tủ lạnh sẵn nhé.", en: "Please put the beer in the fridge (in advance)." },
    ],
  },
  {
    id: "te-iku", pattern: "〜ていく",
    meaning: { vi: "cứ làm rồi đi / tiếp tục (về sau)", en: "to go on doing / to continue into the future" },
    nuance: {
      vi: "Hai nghĩa: (a) nghĩa đen về HƯỚNG -- hành động di chuyển RA XA vị trí người nói; (b) nghĩa ẩn dụ -- một trạng thái/quá trình tiếp diễn TỪ BÂY GIỜ VỀ SAU.",
      en: "Two senses: (a) literal DIRECTIONAL motion, moving AWAY from the speaker's position; (b) metaphorical -- a state/process continuing FROM NOW INTO THE FUTURE.",
    },
    trap: {
      vi: "Dễ lẫn với 〜ている (đang diễn ra ngay lúc này) -- ていく nhấn mạnh sự THAY ĐỔI/tiếp diễn hướng về tương lai, không phải trạng thái tĩnh ở hiện tại.",
      en: "Easy to conflate with 〜ている (happening right now) -- ていく specifically frames change/continuation moving forward in time, not a static present state.",
    },
    examples: [
      { ja: "毎日少しずつ漢字を覚えていきます。", kana: "まいにちすこしずつかんじをおぼえていきます。", vi: "Tôi sẽ tiếp tục học thuộc chữ Hán mỗi ngày một ít.", en: "I'll keep memorizing kanji little by little, going forward." },
      { ja: "傘を持っていくのを忘れないでください。", kana: "かさをもっていくのをわすれないでください。", vi: "Đừng quên mang ô theo nhé.", en: "Please don't forget to take an umbrella with you." },
    ],
  },
  {
    id: "te-kuru", pattern: "〜てくる",
    meaning: { vi: "làm rồi quay lại / bắt đầu (tính đến giờ)", en: "to come doing / to do and return; to start happening (up to now)" },
    nuance: {
      vi: "Hình ảnh ngược lại của ていく: (a) nghĩa đen -- di chuyển HƯỚNG VỀ người nói, hoặc \"đi làm gì đó rồi quay lại\"; (b) nghĩa ẩn dụ -- một sự thay đổi đã diễn ra dần dần CHO ĐẾN THỜI ĐIỂM HIỆN TẠI.",
      en: "The mirror image of ていく: (a) literal -- motion TOWARD the speaker, or \"go do X and come back\"; (b) metaphorical -- a change that's been building UP TO NOW.",
    },
    trap: {
      vi: "行ってきます (câu nói khi ra khỏi nhà) gói trọn cả hai chiều trong một cụm -- \"tôi sẽ đi VÀ quay lại\" -- đó là lý do nó trở thành câu cố định để chào tạm biệt, chứ không dịch sát nghĩa từng chữ.",
      en: "行ってきます (said when leaving home) packs both directions into one phrase -- \"I'll go AND come back\" -- which is why it became the fixed farewell phrase, not a literal word-for-word translation.",
    },
    examples: [
      { ja: "コンビニでジュースを買ってきます。", kana: "コンビニでジュースをかってきます。", vi: "Tôi sẽ ra cửa hàng tiện lợi mua nước rồi quay lại.", en: "I'll go buy a drink at the convenience store (and come back)." },
      { ja: "空が急に暗くなってきました。", kana: "そらがきゅうにくらくなってきました。", vi: "Bầu trời đột nhiên tối sầm lại (cho tới bây giờ).", en: "The sky has suddenly gotten dark." },
    ],
  },
  {
    id: "te-aru", pattern: "〜てある",
    meaning: { vi: "trạng thái được chuẩn bị sẵn có chủ ý (đi với tha động từ)", en: "a deliberately set-up resultant state (with a transitive verb)" },
    nuance: {
      vi: "Ghép て-form của THA ĐỘNG TỪ với ある, dùng が cho thứ ở trạng thái đó -- tập trung vào trạng thái đã được chuẩn bị, không quan tâm ai làm hay khi nào. Xem thêm phần Tự động từ／Tha động từ để đối chiếu đầy đủ を/が với ている.",
      en: "Pairs a TRANSITIVE verb's て-form with ある, using が for the thing in that state -- focuses on the prepared state itself, not who did it or when. See the Transitivity page for the full を/が contrast with ている.",
    },
    trap: {
      vi: "窓が開けてある (ai đó cố ý để cửa sổ mở) khác với 窓が開いている (cửa sổ [chỉ đơn giản là] đang mở, không ngụ ý chủ đích) -- đảo hai câu này sẽ đổi luôn việc câu có ngụ ý mục đích hay không.",
      en: "窓が開けてある (someone deliberately left the window open) differs from 窓が開いている (the window is [just] open, no implied intent) -- swapping them changes whether the sentence implies a purpose.",
    },
    examples: [
      { ja: "テーブルの上に食器が並べてあります。", kana: "テーブルのうえにしょっきがならべてあります。", vi: "Chén bát đã được bày sẵn trên bàn.", en: "The dishes have been laid out on the table." },
      { ja: "壁に地図が貼ってあります。", kana: "かべにちずがはってあります。", vi: "Có một tấm bản đồ đã được dán sẵn trên tường.", en: "A map has been put up on the wall." },
    ],
    grammarIds: ["g_163", "g_164"],
  },
  {
    id: "te-iru", pattern: "〜ている",
    meaning: { vi: "đang diễn ra / trạng thái kết quả / thói quen", en: "ongoing action, resulting state, or habitual action" },
    nuance: {
      vi: "Ba cách hiểu tùy vào BẢN CHẤT của động từ đi kèm: (a) hành động ĐANG DIỄN RA với động từ kéo dài (食べている = đang ăn); (b) TRẠNG THÁI kết quả với động từ tức thời/thay đổi (結婚している = đã kết hôn, không phải \"đang kết hôn\"); (c) THÓI QUEN, hành động lặp lại (毎朝走っている = sáng nào cũng chạy bộ). Chính động từ quyết định cách hiểu, không phải ている.",
      en: "Three readings depending on the verb's own nature: (a) an action IN PROGRESS with a continuous verb (食べている = is eating); (b) a resulting STATE with an instantaneous/change verb (結婚している = is married, not \"is marrying\"); (c) a HABITUAL/repeated action (毎朝走っている = runs every morning). The verb decides the reading, not ている itself.",
    },
    trap: {
      vi: "知っている có cách chia đặc biệt -- thể phủ định là 知らない, không bao giờ là 知っていない (xem thêm cặp 知る／わかる ở mục Đồng nghĩa & Sắc thái).",
      en: "知っている behaves specially -- its negative is 知らない, never 知っていない (see the 知る/わかる pair in the Synonyms tab).",
    },
    examples: [
      { ja: "今、テレビを見ています。", kana: "いま、テレビをみています。", vi: "Bây giờ tôi đang xem TV.", en: "I'm watching TV right now." },
      { ja: "もう結婚しています。", kana: "もうけっこんしています。", vi: "Tôi đã kết hôn rồi.", en: "I'm already married." },
      { ja: "毎朝ジョギングをしています。", kana: "まいあさジョギングをしています。", vi: "Sáng nào tôi cũng đi bộ chạy bộ.", en: "I go jogging every morning." },
    ],
    grammarIds: ["g_094_4"],
  },
]
