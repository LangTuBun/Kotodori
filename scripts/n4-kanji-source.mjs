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
  // --- Chapters 25-33, hand-transcribed from data/kanji_list_n4_25_33.md ---
  { chapter: 25, anchors: [
    ["声", "Voice, sound", [
      ["声", "こえ", "Voice"],
      ["音声", "おんせい", "Sound, audio"],
    ]],
    ["仕", "Work, serve", [
      ["仕事", "しごと", "Job, work"],
    ]],
    ["才", "Talent, ability", [
      ["天才", "てんさい", "Genius"],
      ["才能", "さいのう", "Talent, ability"],
    ]],
    ["事", "Matter, affair, work", [
      ["仕事", "しごと", "Job, work"],
      ["事務所", "じむしょ", "Office"],
      ["工事します", "こうじします", "To do construction work"],
      ["用事", "ようじ", "Errand, business to attend to"],
      ["事故", "じこ", "Accident"],
      ["火事", "かじ", "Fire (disaster)"],
      ["大事", "だいじ", "Important"],
    ]],
    ["予", "Beforehand, in advance", [
      ["予約します", "よやくします", "To make a reservation"],
      ["天気予報", "てんきよほう", "Weather forecast"],
      ["予習", "よしゅう", "Preparation, preview (studying ahead)"],
      ["予定", "よてい", "Plan, schedule"],
      ["予想します", "よそうします", "To predict"],
    ]],
    ["服", "Clothing, clothes", [
      ["服", "ふく", "Clothes"],
      ["制服", "せいふく", "Uniform"],
      ["洋服", "ようふく", "Western-style clothes"],
    ]],
    ["報", "Report, news", [
      ["天気予報", "てんきよほう", "Weather forecast"],
    ]],
    ["指", "Finger, point to", [
      ["指", "ゆび", "Finger"],
      ["指輪", "ゆびわ", "Ring"],
    ]],
    ["押", "Push, press", [
      ["押します", "おします", "To push, press"],
    ]],
    ["洋", "The West, ocean", [
      ["洋服", "ようふく", "Western-style clothes"],
      ["洋食", "ようしょく", "Western food"],
    ]],
    ["遅", "Late, slow", [
      ["遅い", "おそい", "Late, slow"],
      ["遅れます", "おくれます", "To be late"],
      ["遅刻", "ちこく", "Tardiness, being late"],
      ["遅延", "ちえん", "Delay"],
    ]],
    ["様", "Appearance, Mr./Mrs. (honorific)", [
      ["お客様", "おきゃくさま", "Customer, guest (honorific)"],
      ["奥様", "おくさま", "Wife (honorific), Madam"],
      ["様子", "ようす", "Situation, condition"],
    ]],
    ["着", "Wear, arrive", [
      ["着ます", "きます", "To wear"],
      ["着物", "きもの", "Kimono"],
      ["上着", "うわぎ", "Jacket, coat"],
      ["試着", "しちゃく", "Trying on (clothes)"],
    ]],
  ]},
  { chapter: 26, anchors: [
    ["有", "Have, exist", [
      ["有名", "ゆうめい", "Famous"],
      ["有名人", "ゆうめいじん", "Famous person, celebrity"],
      ["有休", "ゆうきゅう", "Paid leave"],
    ]],
    ["育", "Raise, nurture", [
      ["育ちます", "そだちます", "To grow up"],
      ["育てます", "そだてます", "To raise, bring up"],
      ["教育", "きょういく", "Education"],
      ["体育", "たいいく", "Physical education"],
      ["保育園", "ほいくえん", "Nursery school"],
    ]],
    ["教", "Teach", [
      ["教えます", "おしえます", "To teach"],
      ["教わります", "おそわります", "To be taught"],
      ["教師", "きょうし", "Teacher"],
      ["教室", "きょうしつ", "Classroom"],
      ["教育", "きょういく", "Education"],
    ]],
    ["数", "Number, count", [
      ["数えます", "かぞえます", "To count"],
      ["数", "かず", "Number, quantity"],
      ["数学", "すうがく", "Mathematics"],
      ["数字", "すうじ", "Numeral, digit"],
    ]],
    ["楽", "Fun, music", [
      ["楽しい", "たのしい", "Fun, enjoyable"],
      ["楽しみ", "たのしみ", "Enjoyment, looking forward to"],
      ["楽しみます", "たのしみます", "To enjoy"],
      ["音楽", "おんがく", "Music"],
      ["楽器", "がっき", "Musical instrument"],
    ]],
    ["薬", "Medicine", [
      ["薬", "くすり", "Medicine"],
      ["目薬", "めぐすり", "Eye drops"],
    ]],
    ["記", "Record, note", [
      ["日記", "にっき", "Diary"],
    ]],
    ["起", "Wake up, rise, begin", [
      ["起きます", "おきます", "To wake up, get up; to happen"],
      ["起こします", "おこします", "To wake someone up; to cause"],
      ["早起き", "はやおき", "Getting up early"],
    ]],
    ["港", "Harbor, port", [
      ["港", "みなと", "Harbor"],
      ["空港", "くうこう", "Airport"],
    ]],
  ]},
  { chapter: 27, anchors: [
    ["赤", "Red", [
      ["赤", "あか", "Red (color)"],
      ["赤い", "あかい", "Red"],
      ["赤ちゃん", "あかちゃん", "Baby"],
    ]],
    ["走", "Run", [
      ["走ります", "はしります", "To run"],
    ]],
    ["場", "Place, location", [
      ["場所", "ばしょ", "Place, location"],
      ["売り場", "うりば", "Sales counter"],
      ["乗り場", "のりば", "Boarding point"],
      ["駐車場", "ちゅうしゃじょう", "Parking lot"],
      ["会場", "かいじょう", "Venue, hall"],
      ["工場", "こうじょう", "Factory"],
    ]],
    ["室", "Room", [
      ["教室", "きょうしつ", "Classroom"],
      ["休憩室", "きゅうけいしつ", "Break room, lounge"],
      ["会議室", "かいぎしつ", "Meeting room"],
    ]],
    ["屋", "House, shop", [
      ["部屋", "へや", "Room"],
      ["本屋", "ほんや", "Bookstore"],
      ["ラーメン屋", "ラーメンや", "Ramen shop"],
      ["電気屋", "でんきや", "Electronics store"],
      ["屋上", "おくじょう", "Rooftop"],
    ]],
    ["堂", "Hall", [
      ["食堂", "しょくどう", "Dining hall, cafeteria"],
    ]],
    ["院", "Institution", [
      ["病院", "びょういん", "Hospital"],
      ["美容院", "びよういん", "Beauty salon"],
      ["入院", "にゅういん", "Hospitalization"],
      ["大学院", "だいがくいん", "Graduate school"],
    ]],
    ["降", "Fall, get off", [
      ["降ります", "おります", "To get off (a vehicle)"],
      ["降ります", "ふります", "To fall (rain, snow)"],
    ]],
    ["部", "Part, section", [
      ["全部", "ぜんぶ", "All, everything"],
      ["部長", "ぶちょう", "Department manager"],
      ["部屋", "へや", "Room"],
    ]],
    ["原", "Cause, origin, field", [
      ["原因", "げんいん", "Cause, reason"],
    ]],
    ["反", "Opposite, against", [
      ["反対", "はんたい", "Opposition, opposite"],
    ]],
    ["文", "Text, writing, sentence", [
      ["文", "ぶん", "Sentence"],
      ["作文", "さくぶん", "Composition, essay"],
      ["文句", "もんく", "Complaint"],
      ["論文", "ろんぶん", "Thesis, paper"],
    ]],
    ["済", "Settle, economy", [
      ["経済", "けいざい", "Economy"],
    ]],
    ["対", "Opposite, versus", [
      ["反対", "はんたい", "Opposition, opposite"],
      ["絶対に", "ぜったいに", "Absolutely"],
    ]],
  ]},
  { chapter: 28, anchors: [
    ["糸", "Thread", [
      ["糸", "いと", "Thread"],
      ["毛糸", "けいと", "Wool yarn"],
    ]],
    ["緑", "Green", [
      ["緑", "みどり", "Green"],
    ]],
    ["経", "Pass through, economy", [
      ["経験", "けいけん", "Experience"],
      ["経済", "けいざい", "Economy"],
    ]],
    ["紙", "Paper", [
      ["紙", "かみ", "Paper"],
      ["手紙", "てがみ", "Letter"],
      ["折り紙", "おりがみ", "Origami"],
      ["申し込み用紙", "もうしこみようし", "Application form"],
    ]],
    ["細", "Thin, fine, detailed", [
      ["細かい", "こまかい", "Detailed, fine"],
      ["細い", "ほそい", "Thin, slender"],
    ]],
    ["練", "Practice, train", [
      ["練習", "れんしゅう", "Practice"],
    ]],
    ["羽", "Feather, wing", [
      ["羽", "はね", "Wing, feather"],
    ]],
    ["習", "Learn, practice", [
      ["習います", "ならいます", "To learn"],
      ["練習", "れんしゅう", "Practice"],
      ["予習", "よしゅう", "Preparation, preview"],
      ["復習", "ふくしゅう", "Review (studying)"],
    ]],
    ["馬", "Horse", [
      ["馬", "うま", "Horse"],
    ]],
    ["駅", "Station", [
      ["駅", "えき", "Station"],
      ["駅前", "えきまえ", "In front of the station"],
    ]],
    ["験", "Test, experiment", [
      ["試験", "しけん", "Exam, test"],
      ["実験", "じっけん", "Experiment"],
      ["経験", "けいけん", "Experience"],
    ]],
  ]},
  { chapter: 29, anchors: [
    ["作", "Make, create", [
      ["作ります", "つくります", "To make, create; to cook"],
      ["作文", "さくぶん", "Composition, essay"],
      ["作業", "さぎょう", "Work, task"],
      ["作家", "さっか", "Author, writer"],
    ]],
    ["低", "Low", [
      ["低い", "ひくい", "Low, short"],
      ["最低", "さいてい", "Lowest, minimum; the worst"],
    ]],
    ["夜", "Night", [
      ["夜", "よる", "Night"],
      ["今夜", "こんや", "Tonight"],
      ["夜行バス", "やこうバス", "Overnight bus"],
    ]],
    ["家", "House, family", [
      ["家", "いえ", "House"],
      ["家族", "かぞく", "Family"],
      ["作家", "さっか", "Author, writer"],
      ["実家", "じっか", "Parents' house, hometown home"],
      ["建築家", "けんちくか", "Architect"],
      ["家賃", "やちん", "Rent"],
    ]],
    ["宅", "Home, residence", [
      ["お宅", "おたく", "Home, house (someone else's)"],
      ["宅配便", "たくはいびん", "Home delivery service"],
    ]],
    ["客", "Guest, customer", [
      ["旅行客", "りょこうきゃく", "Tourist"],
      ["お客様", "おきゃくさま", "Customer, guest (honorific)"],
    ]],
    ["館", "Building, hall", [
      ["旅館", "りょかん", "Traditional Japanese inn"],
      ["美術館", "びじゅつかん", "Art museum"],
    ]],
  ]},
  { chapter: 30, anchors: [
    ["特", "Special", [
      ["特に", "とくに", "Especially, particularly"],
      ["特別", "とくべつ", "Special"],
      ["特急", "とっきゅう", "Limited express train"],
    ]],
    ["持", "Hold, have", [
      ["持ちます", "もちます", "To hold, carry; to own"],
      ["持ち運び", "もちはこび", "Carrying, portability"],
      ["気持ち", "きもち", "Feeling, mood"],
      ["お金持ち", "おかねもち", "Rich person"],
    ]],
    ["当", "Hit, win, this/that", [
      ["当たります", "あたります", "To win, hit"],
      ["本当", "ほんとう", "Real, true"],
      ["お弁当", "おべんとう", "Boxed lunch"],
    ]],
    ["急", "Urgent, sudden", [
      ["急ぎます", "いそぎます", "To hurry"],
      ["急行", "きゅうこう", "Express train"],
      ["特急", "とっきゅう", "Limited express train"],
      ["急に", "きゅうに", "Suddenly"],
      ["救急車", "きゅうきゅうしゃ", "Ambulance"],
    ]],
    ["竹", "Bamboo", [
      ["竹", "たけ", "Bamboo"],
    ]],
    ["答", "Answer", [
      ["答え", "こたえ", "Answer"],
      ["答えます", "こたえます", "To answer"],
      ["解答", "かいとう", "Answer, solution"],
    ]],
  ]},
  { chapter: 31, anchors: [
    ["市", "City", [
      ["～市", "～し", "~ City"],
      ["市役所", "しやくしょ", "City hall"],
    ]],
    ["世", "World, generation", [
      ["世界", "せかい", "World"],
      ["世界中", "せかいじゅう", "All over the world"],
      ["世話", "せわ", "Care, looking after"],
    ]],
    ["写", "Copy, photograph", [
      ["写します", "うつします", "To take (a photo), to copy"],
      ["写真", "しゃしん", "Photograph"],
    ]],
    ["県", "Prefecture", [
      ["千葉県", "ちばけん", "Chiba Prefecture"],
    ]],
    ["真", "True, genuine", [
      ["真ん中", "まんなか", "The middle, center"],
      ["真っ暗", "まっくら", "Pitch dark"],
      ["真面目", "まじめ", "Serious, diligent"],
      ["写真", "しゃしん", "Photograph"],
    ]],
    ["置", "Place, put", [
      ["置きます", "おきます", "To place, put"],
    ]],
    ["眠", "Sleep", [
      ["眠い", "ねむい", "Sleepy"],
      ["眠ります", "ねむります", "To sleep"],
      ["睡眠", "すいみん", "Sleep"],
    ]],
  ]},
  { chapter: 32, anchors: [
    ["夏", "Summer", [
      ["夏", "なつ", "Summer"],
      ["夏休み", "なつやすみ", "Summer vacation"],
    ]],
    ["道", "Road, way", [
      ["道", "みち", "Road, path"],
      ["道路", "どうろ", "Road"],
      ["道具", "どうぐ", "Tool"],
      ["水道", "すいどう", "Tap water, water supply"],
      ["茶道", "さどう", "Tea ceremony"],
    ]],
    ["春", "Spring", [
      ["春", "はる", "Spring"],
    ]],
    ["昼", "Noon, daytime", [
      ["昼", "ひる", "Noon"],
      ["昼ご飯", "ひるごはん", "Lunch"],
      ["昼寝", "ひるね", "Nap"],
    ]],
    ["星", "Star", [
      ["星", "ほし", "Star"],
    ]],
    ["村", "Village", [
      ["村", "むら", "Village"],
    ]],
    ["府", "Urban prefecture", [
      ["大阪府", "おおさかふ", "Osaka Prefecture"],
    ]],
    ["区", "Ward, district", [
      ["区", "く", "Ward (administrative district)"],
    ]],
    ["図", "Diagram, drawing", [
      ["図", "ず", "Diagram, illustration"],
      ["地図", "ちず", "Map"],
      ["図書館", "としょかん", "Library"],
    ]],
  ]},
  { chapter: 33, anchors: [
    ["進", "Advance, proceed", [
      ["進みます", "すすみます", "To advance, proceed"],
      ["進学", "しんがく", "Advancing to the next level of education"],
    ]],
    ["集", "Gather, collect", [
      ["集まります", "あつまります", "To gather (intransitive)"],
      ["集めます", "あつめます", "To collect, gather (transitive)"],
    ]],
    ["曜", "Day of the week", [
      ["何曜日", "なんようび", "What day of the week"],
      ["水曜日", "すいようび", "Wednesday"],
    ]],
    ["営", "Manage, operate (business)", [
      ["営業します", "えいぎょうします", "To operate (a business)"],
    ]],
    ["業", "Business, occupation", [
      ["授業", "じゅぎょう", "Class, lesson"],
      ["卒業します", "そつぎょうします", "To graduate"],
      ["営業します", "えいぎょうします", "To operate (a business)"],
      ["作業", "さぎょう", "Work, operation"],
      ["残業", "ざんぎょう", "Overtime work"],
    ]],
    ["麦", "Wheat, barley", [
      ["麦", "むぎ", "Wheat"],
    ]],
    ["乗", "Ride, board", [
      ["乗ります", "のります", "To ride, board"],
      ["乗り換えます", "のりかえます", "To transfer (trains/buses)"],
      ["乗り場", "のりば", "Boarding point"],
    ]],
    ["以", "By means of, threshold marker", [
      ["以上", "いじょう", "~ or more"],
      ["以内", "いない", "Within ~"],
      ["以下", "いか", "~ or less"],
      ["以外", "いがい", "Except, other than"],
    ]],
  ]},
]
