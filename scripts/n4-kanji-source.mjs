// Hand-transcribed from ../../N4_Grammar_and_Kanji_Summary-Final.md (Bài 15-24,
// section II "Chữ Hán"). One anchor kanji per array entry (matching N5's
// one-group-per-anchor convention, NOT the MD's 15.1/15.2 sub-numbering --
// see build-n4-kanji.mjs). Meanings are hand-translated to English here;
// hanviet (per word), onyomi/kunyomi, and per-word onkun tags are all
// *computed* by build-n4-kanji.mjs from hanviet-dictionary.json /
// all-readings.json / onkun-classifier.mjs rather than hand-typed.
//
// Each anchor: [kanji, meaningEn, [[wordKanji, wordKana, wordMeaningEn], ...]]

export const CHAPTERS = [
  { chapter: 15, anchors: [
    ["力", "Strength, power", [
      ["力", "ちから", "Strength, power"],
      ["協力", "きょうりょく", "Cooperation"],
    ]],
    ["動", "Move, activity", [
      ["動きます", "うごきます", "To move"],
      ["運動します", "うんどうします", "To exercise"],
      ["自動", "じどう", "Automatic"],
      ["動画", "どうが", "Video, clip"],
      ["動物", "どうぶつ", "Animal"],
      ["感動", "かんどう", "To be moved, impressed"],
      ["不動産", "ふどうさん", "Real estate"],
    ]],
    ["働", "To work, labor", [
      ["働きます", "はたらきます", "To work"],
    ]],
    ["知", "To know", [
      ["知ります", "しります", "To know, find out"],
      ["お知らせ", "おしらせ", "Notice, announcement"],
      ["知り合い", "しりあい", "Acquaintance"],
      ["承知", "しょうち", "To agree, understand, consent"],
    ]],
    ["短", "Short", [
      ["短い", "みじかい", "Short"],
      ["短気", "たんき", "Short-tempered"],
    ]],
    ["医", "Medicine, doctor", [
      ["医者", "いしゃ", "Doctor"],
      ["歯医者", "はいしゃ", "Dentist"],
      ["医学", "いがく", "Medicine (the study of)"],
    ]],
    ["皿", "Plate", [
      ["お皿", "おさら", "Plate, dish"],
    ]],
    ["血", "Blood", [
      ["血", "ち", "Blood"],
    ]],
  ]},
  { chapter: 16, anchors: [
    ["工", "Industry, construction", [
      ["工事", "こうじ", "Construction work"],
      ["工場", "こうじょう", "Factory"],
    ]],
    ["空", "Sky, empty", [
      ["空", "そら", "Sky"],
      ["空港", "くうこう", "Airport"],
      ["空気", "くうき", "Air"],
    ]],
    ["試", "Try, test", [
      ["試験", "しけん", "Exam, test"],
      ["試合", "しあい", "Match, competition"],
      ["試着します", "しちゃくします", "To try on (clothes)"],
    ]],
    ["計", "Measure, plan", [
      ["時計", "とけい", "Clock, watch"],
      ["腕時計", "うでどけい", "Wristwatch"],
      ["計算", "けいさん", "Calculation"],
      ["計画", "けいかく", "Plan"],
    ]],
    ["説", "Explain, theory", [
      ["小説", "しょうせつ", "Novel"],
      ["説明", "せつめい", "Explanation"],
      ["説明会", "せつめいかい", "Briefing session"],
      ["説明書", "せつめいしょ", "Instruction manual"],
    ]],
    ["心", "Heart, mind", [
      ["安心します", "あんしんします", "To feel relieved, at ease"],
      ["心配します", "しんぱいします", "To worry"],
    ]],
    ["思", "Think", [
      ["思います", "おもいます", "To think, feel"],
      ["思い出します", "おもいだします", "To recall, remember"],
      ["不思議", "ふしぎ", "Strange, mysterious"],
    ]],
    ["性", "Nature, gender", [
      ["女性", "じょせい", "Woman, female"],
      ["男性", "だんせい", "Man, male"],
      ["性格", "せいかく", "Personality"],
    ]],
    ["地", "Earth, ground", [
      ["地図", "ちず", "Map"],
      ["地下鉄", "ちかてつ", "Subway"],
      ["地面", "じめん", "Ground"],
      ["地震", "じしん", "Earthquake"],
    ]],
    ["池", "Pond", [
      ["池", "いけ", "Pond"],
      ["電池", "でんち", "Battery"],
    ]],
  ]},
  { chapter: 17, anchors: [
    ["公", "Public, fair", [
      ["公園", "こうえん", "Park"],
      ["主人公", "しゅじんこう", "Main character, protagonist"],
    ]],
    ["広", "Wide", [
      ["広い", "ひろい", "Wide, spacious"],
      ["広告", "こうこく", "Advertisement"],
    ]],
    ["去", "Past, leave", [
      ["去年", "きょねん", "Last year"],
    ]],
    ["転", "Roll, turn", [
      ["転びます", "ころびます", "To fall, trip"],
      ["運転します", "うんてんします", "To drive"],
      ["運転手", "うんてんしゅ", "Driver"],
      ["自転車", "じてんしゃ", "Bicycle"],
    ]],
    ["遠", "Far", [
      ["遠い", "とおい", "Far"],
    ]],
    ["園", "Garden, park", [
      ["公園", "こうえん", "Park"],
      ["遊園地", "ゆうえんち", "Amusement park"],
      ["動物園", "どうぶつえん", "Zoo"],
      ["保育園", "ほいくえん", "Nursery school"],
    ]],
    ["台", "Stand, platform", [
      ["台所", "だいどころ", "Kitchen"],
      ["台風", "たいふう", "Typhoon"],
    ]],
    ["始", "Begin", [
      ["始めます", "はじめます", "To begin (something)"],
      ["始まります", "はじまります", "(Something) begins"],
      ["開始", "かいし", "Start, commencement"],
    ]],
    ["治", "Govern, cure", [
      ["治します", "なおします", "To cure, treat"],
      ["治ります", "なおります", "To heal, recover"],
      ["政治", "せいじ", "Politics"],
    ]],
    ["正", "Correct, right", [
      ["正しい", "ただしい", "Correct, right"],
      ["お正月", "おしょうがつ", "New Year"],
    ]],
    ["政", "Politics, policy", [
      ["政治", "せいじ", "Politics"],
    ]],
  ]},
  { chapter: 18, anchors: [
    ["王", "King", [
      ["王様", "おうさま", "King"],
    ]],
    ["玉", "Jewel, ball", [
      ["お年玉", "おとしだま", "New Year's money gift"],
      ["目玉焼き", "めだまやき", "Fried egg, sunny-side up"],
    ]],
    ["国", "Country", [
      ["国", "くに", "Country"],
      ["外国", "がいこく", "Foreign country"],
      ["外国語", "がいこくご", "Foreign language"],
      ["国際", "こくさい", "International"],
    ]],
    ["主", "Master, main", [
      ["飼い主", "かいぬし", "Pet owner"],
      ["ご主人", "ごしゅじん", "(Someone else's) husband"],
      ["主人公", "しゅじんこう", "Main character, protagonist"],
    ]],
    ["住", "Reside", [
      ["住みます", "すみます", "To live, reside"],
      ["住所", "じゅうしょ", "Address"],
    ]],
    ["所", "Place", [
      ["所", "ところ", "Place"],
      ["台所", "だいどころ", "Kitchen"],
      ["住所", "じゅうしょ", "Address"],
      ["市役所", "しやくしょ", "City hall"],
      ["近所", "きんじょ", "Neighborhood, nearby area"],
    ]],
    ["近", "Near", [
      ["近い", "ちかい", "Near, close"],
      ["近づきます", "ちかづきます", "To approach, get closer"],
      ["最近", "さいきん", "Recently"],
      ["近所", "きんじょ", "Neighborhood, nearby area"],
    ]],
    ["辺", "Vicinity, area", [
      ["この辺", "このへん", "Around here"],
    ]],
    ["切", "Cut", [
      ["切ります", "きります", "To cut; to hang up (phone)"],
      ["切符", "きっぷ", "Ticket"],
      ["切手", "きって", "Postage stamp"],
      ["締め切り", "しめきり", "Deadline"],
      ["親切", "しんせつ", "Kind, friendly"],
      ["大切", "たいせつ", "Important"],
    ]],
  ]},
  { chapter: 19, anchors: [
    ["勉", "Endeavor, study", [
      ["勉強します", "べんきょうします", "To study"],
    ]],
    ["晩", "Evening", [
      ["今晩", "こんばん", "Tonight"],
      ["毎晩", "まいばん", "Every night"],
      ["晩ご飯", "ばんごはん", "Dinner"],
    ]],
    ["色", "Color", [
      ["色", "いろ", "Color"],
      ["色んな", "いろいろな", "Various"],
      ["茶色", "ちゃいろ", "Brown"],
      ["景色", "けしき", "Scenery"],
    ]],
    ["発", "Depart, emit", [
      ["発明", "はつめい", "Invention"],
      ["発見", "はっけん", "Discovery"],
      ["出発", "しゅっぱつ", "Departure"],
      ["発音", "はつおん", "Pronunciation"],
      ["発売", "はつばい", "On sale, release"],
    ]],
    ["黄", "Yellow", [
      ["黄色", "きいろ", "Yellow (noun)"],
      ["黄色い", "きいろい", "Yellow (adjective)"],
    ]],
    ["虫", "Insect", [
      ["虫", "むし", "Insect, bug"],
    ]],
    ["風", "Wind, style", [
      ["風", "かぜ", "Wind"],
      ["風邪", "かぜ", "Cold (illness)"],
      ["台風", "たいふう", "Typhoon"],
    ]],
    ["強", "Strong", [
      ["強い", "つよい", "Strong"],
      ["勉強", "べんきょう", "Study"],
    ]],
    ["油", "Oil", [
      ["油", "あぶら", "Oil"],
      ["石油", "せきゆ", "Petroleum"],
    ]],
    ["決", "Decide", [
      ["決めます", "きめます", "To decide (something)"],
      ["決まります", "きまります", "(Something) is decided"],
    ]],
    ["漢", "Han (China), kanji", [
      ["漢字", "かんじ", "Kanji, Chinese character"],
    ]],
  ]},
  { chapter: 20, anchors: [
    ["止", "Stop", [
      ["止まります", "とまります", "(Something) stops"],
      ["止みます", "やみます", "To stop, let up (rain)"],
      ["中止", "ちゅうし", "Cancellation, suspension"],
    ]],
    ["歩", "Walk", [
      ["歩きます", "あるきます", "To walk"],
      ["散歩します", "さんぽします", "To take a walk"],
    ]],
    ["歴", "Pass through, history", [
      ["歴史", "れきし", "History"],
    ]],
    ["史", "History", [
      ["歴史", "れきし", "History"],
    ]],
    ["使", "Use, envoy", [
      ["使います", "つかいます", "To use"],
      ["大使館", "たいしかん", "Embassy"],
      ["使用します", "しようします", "To use, utilize"],
    ]],
    ["品", "Product, quality", [
      ["商品", "しょうひん", "Merchandise, product"],
      ["化粧品", "けしょうひん", "Cosmetics"],
    ]],
    ["号", "Number, sign", [
      ["信号", "しんごう", "Traffic light, signal"],
      ["電話番号", "でんわばんごう", "Phone number"],
      ["暗証番号", "あんしょうばんごう", "PIN code"],
    ]],
    ["味", "Taste", [
      ["味", "あじ", "Taste, flavor"],
      ["意味", "いみ", "Meaning"],
      ["興味", "きょうみ", "Interest"],
      ["調味料", "ちょうみりょう", "Seasoning, condiment"],
    ]],
    ["研", "Study, research", [
      ["研究", "けんきゅう", "Research"],
      ["研究者", "けんきゅうしゃ", "Researcher"],
    ]],
    ["丸", "Round, circle", [
      ["丸", "まる", "Circle"],
    ]],
    ["究", "Investigate thoroughly", [
      ["研究", "けんきゅう", "Research"],
      ["研究者", "けんきゅうしゃ", "Researcher"],
    ]],
    ["谷", "Valley", [
      ["谷", "たに", "Valley"],
    ]],
    ["船", "Ship, boat", [
      ["船", "ふね", "Ship, boat"],
    ]],
  ]},
  { chapter: 21, anchors: [
    ["里", "Village, ri (unit)", [
      ["里芋", "さといも", "Taro"],
      ["万里の長城", "ばんりのちょうじょう", "The Great Wall of China"],
    ]],
    ["理", "Reason, logic", [
      ["料理", "りょうり", "Dish, cooking"],
      ["修理", "しゅうり", "Repair"],
    ]],
    ["野", "Field, wild", [
      ["野菜", "やさい", "Vegetable"],
      ["野球", "やきゅう", "Baseball"],
    ]],
    ["若", "Young", [
      ["若い", "わかい", "Young"],
    ]],
    ["菜", "Vegetable, greens", [
      ["野菜", "やさい", "Vegetable"],
    ]],
    ["番", "Number, order, watch", [
      ["一番", "いちばん", "Number one, the most"],
      ["交番", "こうばん", "Police box"],
      ["番組", "ばんぐみ", "TV program"],
      ["電話番号", "でんわばんごう", "Phone number"],
      ["暗証番号", "あんしょうばんごう", "PIN code"],
    ]],
    ["料", "Fee, material", [
      ["無料", "むりょう", "Free of charge"],
      ["料理", "りょうり", "Dish, cooking"],
      ["調味料", "ちょうみりょう", "Seasoning, condiment"],
      ["材料", "ざいりょう", "Ingredient, material"],
      ["給料", "きゅうりょう", "Salary"],
      ["食料品", "しょくりょうひん", "Groceries, foodstuffs"],
    ]],
    ["奥", "Interior, depths", [
      ["奥さん", "おくさん", "(Someone else's) wife"],
    ]],
    ["鳥", "Bird", [
      ["鳥", "とり", "Bird"],
    ]],
    ["鳴", "Cry, chirp, ring", [
      ["鳴きます", "なきます", "To cry, chirp (animal)"],
      ["鳴ります", "なります", "To ring (bell)"],
    ]],
    ["島", "Island", [
      ["島", "しま", "Island"],
    ]],
  ]},
  { chapter: 22, anchors: [
    ["化", "Change, -ify", [
      ["文化", "ぶんか", "Culture"],
      ["化粧", "けしょう", "Makeup"],
      ["化粧品", "けしょうひん", "Cosmetics"],
    ]],
    ["便", "Convenient, mail", [
      ["不便", "ふべん", "Inconvenient"],
      ["便利", "べんり", "Convenient"],
      ["郵便局", "ゆうびんきょく", "Post office"],
      ["宅配便", "たくはいびん", "Home delivery service"],
    ]],
    ["係", "Relation, in charge of", [
      ["係の人", "かかりのひと", "Person in charge"],
    ]],
    ["宿", "Lodge, stay", [
      ["宿題", "しゅくだい", "Homework"],
    ]],
    ["私", "I, private", [
      ["私", "わたし", "I, me"],
    ]],
    ["利", "Benefit, advantage", [
      ["便利", "べんり", "Convenient"],
      ["利用", "りよう", "Use, utilization"],
    ]],
    ["科", "Branch of study", [
      ["科学", "かがく", "Science"],
      ["教科書", "きょうかしょ", "Textbook"],
    ]],
    ["顔", "Face", [
      ["顔", "かお", "Face"],
    ]],
    ["題", "Topic, subject", [
      ["問題", "もんだい", "Problem, question"],
      ["宿題", "しゅくだい", "Homework"],
      ["食べ放題", "たべほうだい", "All-you-can-eat"],
    ]],
    ["速", "Fast, speed", [
      ["速い", "はやい", "Fast"],
    ]],
    ["通", "Pass through, understand", [
      ["通います", "かよいます", "To commute, attend regularly"],
      ["交通", "こうつう", "Traffic, transportation"],
    ]],
    ["週", "Week", [
      ["先週", "せんしゅう", "Last week"],
      ["今週", "こんしゅう", "This week"],
      ["週末", "しゅうまつ", "Weekend"],
      ["来週", "らいしゅう", "Next week"],
      ["再来週", "さらいしゅう", "The week after next"],
    ]],
  ]},
  { chapter: 23, anchors: [
    ["夫", "Husband", [
      ["夫", "おっと", "Husband (own)"],
      ["大丈夫", "だいじょうぶ", "Okay, fine, no problem"],
    ]],
    ["鉄", "Iron", [
      ["地下鉄", "ちかてつ", "Subway"],
    ]],
    ["妹", "Younger sister", [
      ["妹", "いもうと", "Younger sister (own)"],
      ["妹さん", "いもうとさん", "Younger sister (someone else's)"],
      ["姉妹", "しまい", "Sisters"],
    ]],
    ["姉", "Older sister", [
      ["姉", "あね", "Older sister (own)"],
      ["お姉さん", "おねえさん", "Older sister (someone else's)"],
      ["姉妹", "しまい", "Sisters"],
    ]],
    ["妻", "Wife", [
      ["妻", "つま", "Wife (own)"],
    ]],
    ["天", "Sky, heaven", [
      ["天気", "てんき", "Weather"],
      ["天気予報", "てんきよほう", "Weather forecast"],
    ]],
    ["送", "Send", [
      ["送ります", "おくります", "To send; to see (someone) off"],
    ]],
    ["弟", "Younger brother", [
      ["弟", "おとうと", "Younger brother (own)"],
      ["弟さん", "おとうとさん", "Younger brother (someone else's)"],
      ["兄弟", "きょうだい", "Siblings"],
    ]],
    ["引", "Pull", [
      ["引きます", "ひきます", "To pull"],
      ["引き出し", "ひきだし", "Drawer"],
      ["引き出します", "ひきだします", "To withdraw (money)"],
      ["引っ越します", "ひっこします", "To move (house)"],
    ]],
    ["弱", "Weak", [
      ["弱い", "よわい", "Weak"],
    ]],
    ["考", "Think, consider", [
      ["考えます", "かんがえます", "To think, consider"],
    ]],
    ["者", "Person", [
      ["医者", "いしゃ", "Doctor"],
      ["研究者", "けんきゅうしゃ", "Researcher"],
      ["歯医者", "はいしゃ", "Dentist"],
    ]],
    ["都", "Capital, metropolis", [
      ["都合", "つごう", "Convenience, circumstances"],
      ["都会", "とかい", "City, urban area"],
    ]],
    ["暑", "Hot (weather)", [
      ["暑い", "あつい", "Hot (weather)"],
    ]],
  ]},
  { chapter: 24, anchors: [
    ["開", "Open", [
      ["開きます", "あきます", "(Something) opens"],
      ["開けます", "あけます", "To open (something)"],
      ["開始", "かいし", "Start, commencement"],
      ["開催", "かいさい", "Holding (an event)"],
    ]],
    ["閉", "Close", [
      ["閉まります", "しまります", "(Something) closes"],
      ["閉めます", "しめます", "To close (something)"],
      ["閉じます", "とじます", "To close, shut (eyes, book)"],
    ]],
    ["問", "Ask, question", [
      ["問題", "もんだい", "Problem, question"],
      ["質問", "しつもん", "Question"],
      ["疑問", "ぎもん", "Doubt, question"],
    ]],
    ["質", "Quality, nature", [
      ["質問", "しつもん", "Question"],
    ]],
    ["貸", "Lend", [
      ["貸します", "かします", "To lend"],
    ]],
    ["員", "Member, staff", [
      ["社員", "しゃいん", "Company employee"],
      ["店員", "てんいん", "Store clerk"],
      ["駅員", "えきいん", "Station staff"],
      ["会社員", "かいしゃいん", "Company employee"],
      ["全員", "ぜんいん", "Everyone, all members"],
    ]],
    ["店", "Shop", [
      ["店", "みせ", "Shop, store"],
      ["店員", "てんいん", "Store clerk"],
      ["店長", "てんちょう", "Store manager"],
      ["喫茶店", "きっさてん", "Coffee shop, cafe"],
    ]],
    ["度", "Degree, time(s)", [
      ["今度", "こんど", "Next time"],
      ["温度", "おんど", "Temperature"],
      ["支度", "したく", "Preparation"],
      ["何度でも", "なんどでも", "As many times as you like"],
    ]],
    ["黒", "Black", [
      ["黒", "くろ", "Black (noun)"],
      ["黒い", "くろい", "Black (adjective)"],
      ["真っ黒", "まっくろ", "Pitch black"],
      ["黒板", "こくばん", "Blackboard"],
    ]],
    ["点", "Point, mark", [
      ["点", "てん", "Point"],
      ["点数", "てんすう", "Score, points"],
      ["交差点", "こうさてん", "Intersection"],
    ]],
    ["然", "Naturally, so", [
      ["全然", "ぜんぜん", "Not at all / entirely"],
      ["自然", "しぜん", "Nature"],
    ]],
  ]},
]
