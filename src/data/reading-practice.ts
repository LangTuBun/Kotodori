import { s, type ReadingParagraph } from './reading-passages.ts'
import type { Bilingual } from './sentence-breakdowns'
import type { ReadingContext } from './reading-contexts'

export interface PracticeQuestion { jp: string; options: string[]; answer: number; explanation: Bilingual }
export interface PracticeReading {
  chapter: number
  /** practice: drills the chapter's own grammar. review: mixes it with earlier chapters, JLPT N4 読解 style. */
  kind: 'practice' | 'review'
  title: Bilingual
  context: ReadingContext
  paragraphs: ReadingParagraph[]
  questions: PracticeQuestion[]
}
type Context = [string, string, string, string, string, string]
type Question = [jp: string, options: string[], answer: number, whyEn: string, whyVi: string]

function build(kind: PracticeReading['kind'], chapter: number, en: string, vi: string, context: Context, paragraphs: ReadingParagraph[], questions: Question[]): PracticeReading {
  const [typeEn, typeVi, sitEn, sitVi, focusEn, focusVi] = context
  return {
    chapter, kind, title: { en, vi }, paragraphs,
    context: { type: { en: typeEn, vi: typeVi }, situation: { en: sitEn, vi: sitVi }, focus: { en: focusEn, vi: focusVi } },
    questions: questions.map(([jp, options, answer, whyEn, whyVi]) => ({ jp, options, answer, explanation: { en: whyEn, vi: whyVi } })),
  }
}
function p(chapter: number, en: string, vi: string, context: Context, paragraphs: ReadingParagraph[], q: string, options: string[], answer: number, whyEn: string, whyVi: string): PracticeReading {
  return build('practice', chapter, en, vi, context, paragraphs, [[q, options, answer, whyEn, whyVi]])
}
function r(chapter: number, en: string, vi: string, context: Context, paragraphs: ReadingParagraph[], ...questions: Question[]): PracticeReading {
  return build('review', chapter, en, vi, context, paragraphs, questions)
}

// Original practice texts, not from the book. Each uses only N5 grammar plus N4
// grammar from its own chapter or earlier (checked by scripts/check-sentence-breakdowns.mjs).
export const practiceReadings: PracticeReading[] = [
  p(16, 'A new café by the station', 'Quán cà phê mới gần ga',
    ['Message', 'Tin nhắn', 'Linh texts her roommate Aya about a new café she heard about.', 'Linh nhắn cho bạn cùng phòng Aya về quán cà phê mới cô nghe nói.', 'Who is the source of each piece of information?', 'Nguồn của từng thông tin là ai?'],
    [
      [s('アヤさん、駅の前に新しいカフェができたそうです。', 'Aya, apparently a new café has opened in front of the station.', 'Aya ơi, nghe nói trước ga có quán cà phê mới mở.', 144), s('クラスのミンさんが「ケーキがとてもおいしい」と言っていました。', 'Minh from class said, “The cake is really good.”', 'Minh trong lớp nói: “Bánh ngọt rất ngon”.', 145)],
      [s('お店は小さいですが、静かだし、Wi-Fiもあるし、勉強にいいらしいです。', 'The shop is small, but it is quiet and has Wi-Fi, so it seems good for studying.', 'Quán nhỏ nhưng yên tĩnh, lại có Wi-Fi nên nghe đâu rất hợp để học.', 146, 142), s('写真を見ましたが、中は森みたいでした。', 'I saw photos; inside it looked like a forest.', 'Mình xem ảnh rồi, bên trong trông như một khu rừng.', 143)],
      [s('土曜日はたぶん込むと思います。', 'I think it will probably be crowded on Saturday.', 'Mình nghĩ thứ Bảy chắc sẽ đông.', 147), s('だから、金曜日の授業の後で行きませんか。', 'So shall we go after class on Friday?', 'Vậy sau giờ học thứ Sáu mình đi nhé?')],
    ],
    'リンさんはどうして金曜日に行きたいですか。', ['ケーキが安いから', 'ミンさんが金曜日に行くから', '土曜日は込むと思うから', '金曜日はWi-Fiがあるから'], 3,
    'Linh says 土曜日はたぶん込むと思います, then suggests Friday. The cake and Wi-Fi are hearsay about the café, not reasons for the day.',
    'Linh nói 土曜日はたぶん込むと思います rồi đề xuất thứ Sáu. Bánh và Wi-Fi là thông tin nghe được về quán, không phải lý do chọn ngày.'),

  p(17, 'Late for the meeting', 'Đến muộn buổi họp',
    ['Conversation', 'Hội thoại', 'Kim arrives late at the office; a coworker, Mori, asks what happened.', 'Kim đến công ty muộn; đồng nghiệp Mori hỏi chuyện gì đã xảy ra.', 'Find the reason behind each んです.', 'Tìm lý do đằng sau mỗi câu んです.'],
    [
      [s('森：キムさん、どうしたんですか。顔が赤いですよ。', 'Mori: Kim, what happened? Your face is red.', 'Mori: Kim, có chuyện gì vậy? Mặt bạn đỏ quá.', 153), s('キム：すみません、駅から走ったんです。', 'Kim: Sorry, I ran from the station.', 'Kim: Xin lỗi, tôi đã chạy từ ga.', 148)],
      [s('キム：電車が30分も止まったんです。', 'Kim: The train stopped for a whole thirty minutes.', 'Kim: Tàu dừng những 30 phút.', 149, 154), s('森：そうですか。会議はもう始まりましたよ。', 'Mori: I see. The meeting has already started.', 'Mori: Vậy à. Cuộc họp bắt đầu rồi đấy.')],
      [s('キム：あのう、会議の資料を家に忘れたんですが、森さんのを見てもいいですか。', 'Kim: Um, I left the meeting documents at home. May I look at yours?', 'Kim: À… tôi để quên tài liệu họp ở nhà, tôi xem của anh Mori được không?', 150), s('森：いいですよ。一緒に行きましょう。', 'Mori: Sure. Let’s go together.', 'Mori: Được chứ. Cùng đi nào.')],
    ],
    'キムさんはどうして遅れましたか。', ['資料を忘れたから', '電車が止まったから', '駅から歩いたから', '会議の時間を間違えたから'], 2,
    '電車が30分も止まったんです gives the reason. Forgetting the documents comes later and is a separate problem.',
    '電車が30分も止まったんです là lý do. Quên tài liệu là chuyện khác, được nói sau.'),

  p(18, 'Sunday at the market', 'Chủ nhật ở chợ',
    ['Diary', 'Nhật ký', 'The writer spends Sunday at a farmers’ market with a younger sister.', 'Người viết dành chủ nhật đi chợ nông sản cùng em gái.', 'Separate appearance guesses (そう) from facts.', 'Tách phỏng đoán qua vẻ ngoài (そう) và sự thật.'],
    [
      [s('日曜日、妹と駅の近くの市場へ行きました。', 'On Sunday I went to the market near the station with my younger sister.', 'Chủ nhật tôi cùng em gái đi chợ gần ga.'), s('トマトがとても赤くて、おいしそうでした。', 'The tomatoes were very red and looked delicious.', 'Cà chua rất đỏ, trông ngon lắm.', 155)],
      [s('空が暗くなって、雨が降りそうでしたから、早く帰りました。', 'The sky got dark and it looked like rain, so we went home early.', 'Trời tối lại, có vẻ sắp mưa nên chúng tôi về sớm.', 160, 156), s('でも、妹はまだ帰りたくなさそうでした。', 'But my sister didn’t look like she wanted to go home yet.', 'Nhưng em gái tôi có vẻ chưa muốn về.', 157)],
      [s('家で、そのトマトを小さく切って、サラダにしました。', 'At home I cut the tomatoes small and made them into a salad.', 'Về nhà, tôi cắt nhỏ cà chua và làm thành món salad.', 158, 159), s('妹は「おいしい！」と言って、元気になりました。', 'My sister said, “Delicious!” and cheered up.', 'Em gái nói “Ngon quá!” và vui vẻ trở lại.', 160)],
    ],
    'どうして早く帰りましたか。', ['トマトがなかったから', '妹が帰りたかったから', '雨が降りそうだったから', 'サラダを作りたかったから'], 3,
    '雨が降りそうだった is a guess from the dark sky, and it is the stated reason. The sister actually did not want to leave.',
    '雨が降りそうだった là phỏng đoán từ bầu trời tối, và là lý do được nêu. Em gái thực ra chưa muốn về.'),

  p(19, 'Ready for the party', 'Chuẩn bị cho bữa tiệc',
    ['Chat messages', 'Tin nhắn', 'Class leader Tuan checks with a classmate before tonight’s class party.', 'Lớp trưởng Tuấn hỏi bạn cùng lớp trước buổi tiệc tối nay.', 'Notice what is already done (てある) and what happened by itself.', 'Chú ý việc đã được làm sẵn (てある) và việc tự xảy ra.'],
    [
      [s('トゥアン：教室の準備はどうですか。', 'Tuan: How is the classroom preparation going?', 'Tuấn: Chuẩn bị phòng học thế nào rồi?'), s('さき：机はもう並べてあります。飲み物も買ってあります。', 'Saki: The desks are already arranged. I’ve bought the drinks too.', 'Saki: Bàn đã được xếp sẵn rồi. Đồ uống cũng mua sẵn rồi.', 164)],
      [s('さき：でも、さっき風で窓が開いて、ポスターが落ちました。', 'Saki: But a moment ago the wind opened the window and the poster fell down.', 'Saki: Nhưng lúc nãy gió làm cửa sổ mở ra và tấm áp phích rơi xuống.', 162), s('今、窓を閉めて、ポスターをもう一度はりました。', 'I’ve closed the window and put the poster up again.', 'Bây giờ mình đã đóng cửa sổ và dán lại áp phích.', 161)],
      [s('トゥアン：ありがとう。黒板に何か書いてありますか。', 'Tuan: Thanks. Is anything written on the blackboard?', 'Tuấn: Cảm ơn. Trên bảng có viết gì không?', 163), s('さき：はい、「先生、ありがとう」と大きく書いてあります。', 'Saki: Yes, “Thank you, teacher” is written in big letters.', 'Saki: Có, có viết to chữ “Cảm ơn thầy cô”.', 163, 158)],
    ],
    'もうしてあることはどれですか。', ['机を並べること', '飲み物を買うこと', '黒板に書くこと', '全部'], 4,
    'Desks, drinks and the blackboard message are all described with てあります, so everything is already done. The window and poster were fixed too.',
    'Bàn, đồ uống và dòng chữ trên bảng đều dùng てあります nên đã xong hết. Cửa sổ và áp phích cũng đã sửa lại.'),

  p(20, 'A room with a view', 'Căn phòng có cảnh đẹp',
    ['Hotel review', 'Đánh giá khách sạn', 'A traveller reviews a small hotel in the mountains.', 'Một du khách đánh giá khách sạn nhỏ trên núi.', 'Find the head noun of each long modifying clause.', 'Tìm danh từ chính của từng mệnh đề bổ nghĩa dài.'],
    [
      [s('先週泊まったホテルは、駅から車で30分の山の中にあります。', 'The hotel I stayed at last week is in the mountains, thirty minutes by car from the station.', 'Khách sạn tôi ở tuần trước nằm trong núi, cách ga 30 phút đi ô tô.', 165), s('私が泊まった部屋の窓から、富士山がよく見えました。', 'From the window of the room I stayed in, Mt Fuji could be seen clearly.', 'Từ cửa sổ phòng tôi ở có thể thấy rõ núi Phú Sĩ.', 167, 170)],
      [s('夜は、川の音が聞こえて、木のいいにおいがしました。', 'At night I could hear the river, and there was a nice smell of wood.', 'Ban đêm nghe được tiếng suối và có mùi gỗ thơm.', 170, 169), s('ホテルの人が作る朝ご飯は、地元の野菜を使った料理です。', 'The breakfast the hotel staff make uses local vegetables.', 'Bữa sáng nhân viên khách sạn nấu là món dùng rau địa phương.', 165, 168)],
      [s('英語がわかる人もいますから、外国人にもいいと思います。', 'Some staff understand English, so I think it is good for foreigners too.', 'Cũng có người hiểu tiếng Anh nên tôi nghĩ hợp cả với người nước ngoài.', 171, 147)],
    ],
    'このホテルについて、正しいものはどれですか。', ['駅から歩いて30分です', '部屋から富士山が見えます', '朝ご飯は外国の料理です', '英語がわかる人はいません'], 2,
    '私が泊まった部屋の窓から、富士山がよく見えました. The hotel is 30 minutes by car, breakfast uses local vegetables, and some staff understand English.',
    '私が泊まった部屋の窓から、富士山がよく見えました. Khách sạn cách 30 phút đi ô tô, bữa sáng dùng rau địa phương, và có người hiểu tiếng Anh.'),

  p(21, 'Why I cook', 'Vì sao tôi nấu ăn',
    ['Personal essay', 'Bài viết cá nhân', 'An exchange student explains a cooking hobby and one small failure.', 'Một du học sinh kể về sở thích nấu ăn và một thất bại nhỏ.', 'Use のは〜からです to find the real reason.', 'Dùng のは〜からです để tìm lý do thật.'],
    [
      [s('私は料理を作るのが得意です。', 'I am good at cooking.', 'Tôi giỏi nấu ăn.', 172), s('毎日自分で作るのは、外で食べるのが高いからではありません。', 'The reason I cook every day is not that eating out is expensive.', 'Tôi tự nấu mỗi ngày không phải vì ăn ngoài đắt.', 175), s('友達が「おいしい」と言うのを聞くのが好きだからです。', 'It is because I love hearing my friends say “It’s delicious.”', 'Mà là vì tôi thích nghe bạn bè nói “ngon quá”.', 177, 175)],
      [s('でも、先週、料理の途中で電話をして、火を消すのを忘れました。', 'But last week I took a phone call in the middle of cooking and forgot to turn off the stove.', 'Nhưng tuần trước tôi nghe điện thoại giữa lúc nấu và quên tắt bếp.', 178), s('一番困ったのは、ルームメイトが寝ていたことです。', 'What was most troubling was that my roommate was asleep.', 'Điều khổ nhất là lúc đó bạn cùng phòng đang ngủ.', 174)],
      [s('今は、料理をする前に、タイマーを使っています。', 'Now I set a timer before I cook.', 'Bây giờ trước khi nấu tôi đều dùng hẹn giờ.')],
    ],
    'この人が毎日料理をするのはどうしてですか。', ['外で食べるのが高いから', '友達の「おいしい」が聞きたいから', 'ルームメイトが作らないから', 'タイマーがあるから'], 2,
    'The text denies the price reason (〜からではありません) and gives the real one: 友達が「おいしい」と言うのを聞くのが好きだからです.',
    'Bài phủ nhận lý do giá cả (〜からではありません) và đưa ra lý do thật: 友達が「おいしい」と言うのを聞くのが好きだからです.'),

  p(22, 'Signs in the park', 'Biển báo trong công viên',
    ['Conversation', 'Hội thoại', 'A child and a father read signs at a park.', 'Một em bé và bố cùng đọc các biển báo trong công viên.', 'Read the quoted commands and what they mean.', 'Đọc các mệnh lệnh được trích dẫn và ý nghĩa của chúng.'],
    [
      [s('子供：お父さん、あの紙に何て書いてあるの？', 'Child: Dad, what does that paper say?', 'Con: Bố ơi, tờ giấy kia viết gì vậy?', 181), s('父：「池に入るな」と書いてあるよ。', 'Father: It says, “Do not enter the pond.”', 'Bố: Viết là “Không được xuống hồ” đấy.', 180, 181)],
      [s('子供：「芝生」って何？', 'Child: What’s a “lawn”?', 'Con: “Bãi cỏ” là gì ạ?', 184), s('父：草がたくさんあるところという意味だよ。「芝生に入らないでください」は、ここを歩くなということ。', 'Father: It means a place with lots of grass. “Please keep off the lawn” means don’t walk here.', 'Bố: Nghĩa là chỗ có nhiều cỏ. “Xin đừng vào bãi cỏ” tức là đừng đi ở đây.', 182, 180)],
      [s('父：あ、雨だ。早く走れ！', 'Father: Oh, it’s raining. Run, quick!', 'Bố: Ôi, mưa rồi. Chạy nhanh lên!', 179), s('子供：お父さん、「走るな」って書いてあるよ！', 'Child: Dad, it says “No running”!', 'Con: Bố ơi, có viết “Không được chạy” mà!', 180, 183, 181)],
    ],
    '「芝生に入らないでください」はどういう意味ですか。', ['池に入らないでください', '草の上を歩かないでください', '公園で走らないでください', '雨の日は入らないでください'], 2,
    'The father explains it as ここを歩くな: do not walk on the grass. The pond and running signs are different signs.',
    'Người bố giải thích là ここを歩くな: không được đi trên cỏ. Biển cấm xuống hồ và cấm chạy là những biển khác.'),

  p(23, 'My first week at the bakery', 'Tuần đầu ở tiệm bánh',
    ['Diary', 'Nhật ký', 'A student describes the first week of a part-time job.', 'Một sinh viên kể về tuần đầu tiên đi làm thêm.', 'Track giving/receiving (もらう, ていただく) and passive (られる).', 'Theo dõi cho/nhận (もらう, ていただく) và bị động (られる).'],
    [
      [s('先週から、パン屋でアルバイトを始めました。', 'Last week I started a part-time job at a bakery.', 'Từ tuần trước tôi bắt đầu làm thêm ở tiệm bánh mì.'), s('店長にパンの作り方を教えていただきました。', 'The manager kindly taught me how to make bread.', 'Tôi được cửa hàng trưởng dạy cách làm bánh mì.', 189), s('先輩からエプロンももらいました。', 'I also received an apron from a senior coworker.', 'Tôi còn được đàn anh tặng tạp dề.', 186)],
      [s('でも、金曜日、お客さんに「パンが冷たい」と言われました。', 'But on Friday a customer told me, “The bread is cold.”', 'Nhưng thứ Sáu tôi bị khách nói “bánh nguội”.', 194), s('それに、帰りに、雨の中で傘を盗まれました。', 'On top of that, when I went home, my umbrella was stolen in the rain.', 'Thêm nữa, lúc về tôi bị trộm mất ô giữa trời mưa.', 195)],
      [s('来週は、もっと上手になってほしいと店長に言われましたから、がんばります。', 'The manager told me they want me to improve next week, so I will do my best.', 'Cửa hàng trưởng nói muốn tôi giỏi hơn vào tuần sau nên tôi sẽ cố gắng.', 191, 194)],
    ],
    'この人がもらったものは何ですか。', ['パン', '傘', 'エプロン', 'お金'], 3,
    '先輩からエプロンももらいました. The umbrella was stolen (盗まれました), and the bread comment came from a customer.',
    '先輩からエプロンももらいました. Cái ô bị trộm (盗まれました), còn lời về bánh mì là của khách.'),

  p(24, 'Choosing a new phone', 'Chọn điện thoại mới',
    ['Blog post', 'Bài blog', 'The writer explains why they changed to a smaller phone.', 'Người viết giải thích vì sao đổi sang điện thoại nhỏ hơn.', 'Find causes (〜て), easy/hard (やすい/にくい) and too much (すぎる).', 'Tìm nguyên nhân (〜て), dễ/khó (やすい/にくい) và quá mức (すぎる).'],
    [
      [s('前の電話は大きすぎて、片手で使いにくかったです。', 'My old phone was too big and hard to use with one hand.', 'Điện thoại cũ to quá nên khó dùng bằng một tay.', 202, 197, 201), s('歩きながら使って、何度も落としました。', 'I used it while walking and dropped it many times.', 'Tôi vừa đi vừa dùng nên làm rơi nhiều lần.', 200)],
      [s('それで、今度は小さくて軽い電話にしました。', 'So this time I chose a small, light phone.', 'Vì vậy lần này tôi chọn điện thoại nhỏ và nhẹ.', 159), s('ポケットに入れやすいし、画面も見やすいです。', 'It is easy to put in a pocket, and the screen is easy to see.', 'Dễ bỏ vào túi, màn hình cũng dễ nhìn.', 201, 146)],
      [s('店の人に聞かないで、自分でネットで調べて買いました。', 'I bought it after researching online myself, without asking the shop staff.', 'Tôi không hỏi nhân viên cửa hàng mà tự tìm trên mạng rồi mua.', 199), s('ただ、ゲームをしすぎて、電池がすぐなくなります。', 'However, I play games too much, so the battery runs out quickly.', 'Có điều tôi chơi game quá nhiều nên pin hết nhanh.', 203, 197)],
    ],
    'どうして新しい電話にしましたか。', ['電池がすぐなくなったから', '前の電話が大きすぎたから', '店の人に勧められたから', 'ゲームがしたかったから'], 2,
    '前の電話は大きすぎて、片手で使いにくかった gives the cause. The battery problem is about the new phone, and the writer did not ask the staff.',
    '前の電話は大きすぎて、片手で使いにくかった là nguyên nhân. Vấn đề pin là của điện thoại mới, và người viết không hỏi nhân viên.'),

  p(25, 'This year’s plans', 'Kế hoạch năm nay',
    ['Speech', 'Bài phát biểu', 'A student talks about decisions and plans for the new year.', 'Một học sinh nói về các quyết định và kế hoạch năm mới.', 'Separate personal decisions (ことにする) from things decided for you (ことになる).', 'Phân biệt quyết định cá nhân (ことにする) và việc được quyết định (ことになる).'],
    [
      [s('今年、私は毎朝ジョギングをすることにしました。', 'This year I decided to go jogging every morning.', 'Năm nay tôi quyết định chạy bộ mỗi sáng.', 205), s('夜は早く寝るようにしています。', 'I try to go to bed early at night.', 'Buổi tối tôi cố gắng đi ngủ sớm.', 207)],
      [s('会社の命令で、4月から大阪で働くことになりました。', 'By company order, it has been decided that I will work in Osaka from April.', 'Theo lệnh công ty, tôi sẽ làm việc ở Osaka từ tháng 4.', 206), s('大阪の言葉がわかるようになりたいですから、テレビで練習するつもりです。', 'I want to become able to understand Osaka speech, so I intend to practise with TV.', 'Tôi muốn hiểu được tiếng Osaka nên định luyện qua tivi.', 209, 212)],
      [s('前はコーヒーを1日5杯飲んでいましたが、今は飲まなくなりました。', 'I used to drink five cups of coffee a day, but now I no longer drink it.', 'Trước đây tôi uống 5 cốc cà phê mỗi ngày nhưng giờ không uống nữa.', 210), s('夏休みには、ベトナムに帰ろうと思っています。', 'I’m thinking of going back to Vietnam during the summer holiday.', 'Kỳ nghỉ hè tôi đang định về Việt Nam.', 213)],
    ],
    'この人が自分で決めたことはどれですか。', ['大阪で働くこと', '毎朝ジョギングをすること', 'コーヒーをやめること', 'テレビに出ること'], 2,
    'ジョギングをすることにしました is the speaker’s own decision. Working in Osaka was decided by the company (ことになりました). The coffee change is a result, not described as a decision.',
    'ジョギングをすることにしました là quyết định của người nói. Làm ở Osaka là công ty quyết (ことになりました). Bỏ cà phê là kết quả, không được nói là quyết định.'),

  p(26, 'Moving day', 'Ngày chuyển nhà',
    ['Chat messages', 'Tin nhắn', 'Hana has just moved and messages a friend who offers advice.', 'Hana vừa chuyển nhà và nhắn tin với bạn, người cho lời khuyên.', 'Read where each action is: about to, in the middle of, just finished.', 'Xác định mỗi hành động đang ở đâu: sắp làm, đang làm, vừa xong.'],
    [
      [s('ハナ：今、新しいアパートに着いたところ！', 'Hana: I’ve just arrived at my new apartment!', 'Hana: Mình vừa đến căn hộ mới!', 219), s('箱を開けたら、お皿が割れていた。', 'When I opened the box, the plates were broken.', 'Mở thùng ra thì đĩa bị vỡ rồi.', 216)],
      [s('ケン：大変だね。引っ越し会社に電話したほうがいいよ。', 'Ken: That’s awful. You should call the moving company.', 'Ken: Khổ thật. Cậu nên gọi cho công ty chuyển nhà.', 214), s('ハナ：うん。でも、まだ隣の人にあいさつしていないんだ。', 'Hana: Yeah. But I haven’t greeted the neighbours yet.', 'Hana: Ừ. Nhưng mình vẫn chưa chào hỏi hàng xóm.', 217, 148)],
      [s('ハナ：今からお菓子を持って行くところ。', 'Hana: I’m just about to take them some sweets.', 'Hana: Bây giờ mình chuẩn bị mang bánh qua.', 218), s('ケン：週末は、部屋を掃除したり、買い物したりするの？手伝うよ。', 'Ken: This weekend will you be cleaning, shopping and so on? I’ll help.', 'Ken: Cuối tuần cậu dọn phòng, đi mua sắm các thứ à? Mình giúp cho.', 215)],
    ],
    'ハナさんはこれから何をしますか。', ['引っ越し会社に行く', '隣の人にあいさつに行く', 'お皿を買いに行く', '部屋を掃除する'], 2,
    'お菓子を持って行くところ (about to) follows まだあいさつしていない, so she is about to greet the neighbours. Calling the company is only advice; cleaning is for the weekend.',
    'お菓子を持って行くところ (sắp làm) đi sau まだあいさつしていない nên cô sắp đi chào hàng xóm. Gọi công ty chỉ là lời khuyên; dọn phòng là việc cuối tuần.'),

  p(27, 'Dormitory rules', 'Nội quy ký túc xá',
    ['Notice', 'Thông báo', 'A dormitory manager posts rules for new residents.', 'Quản lý ký túc xá dán nội quy cho người mới vào ở.', 'Sort “must” from “must not” and the actions to do in advance.', 'Phân loại “phải” và “không được”, và việc cần làm trước.'],
    [
      [s('新しく入った皆さんへ', 'To all new residents', 'Gửi các bạn mới vào ở')],
      [s('夜11時より後に、大きい音で音楽を聞いてはいけません。', 'You must not play loud music after 11 p.m.', 'Sau 11 giờ đêm không được nghe nhạc to.', 220), s('ごみは、月曜日と木曜日の朝8時前に出さなくてはいけません。', 'You must put out rubbish before 8 a.m. on Mondays and Thursdays.', 'Phải đổ rác trước 8 giờ sáng thứ Hai và thứ Năm.', 221)],
      [s('友達を呼びたい人は、前の日に管理人に言っておいてください。', 'If you want to invite friends, tell the manager in advance, on the day before.', 'Ai muốn mời bạn đến chơi thì hãy báo trước cho quản lý vào ngày hôm trước.', 224), s('鍵をなくしてしまった人は、すぐ事務所に来てください。', 'Anyone who has lost their key, come to the office immediately.', 'Ai lỡ làm mất chìa khóa hãy đến văn phòng ngay.', 222)],
      [s('これから寒くなっていきますから、窓を開けて出かけないでください。', 'It is going to get colder from now, so please don’t go out with the windows open.', 'Từ giờ trời sẽ lạnh dần nên xin đừng mở cửa sổ rồi ra ngoài.', 227)],
    ],
    '友達を部屋に呼びたいです。どうしますか。', ['当日、事務所に行く', '前の日に管理人に言う', '夜11時前に帰る', '鍵を友達に渡す'], 2,
    '前の日に管理人に言っておいてください: tell the manager the day before (ておく = in advance).',
    '前の日に管理人に言っておいてください: báo cho quản lý vào ngày hôm trước (ておく = làm trước).'),

  p(28, 'Piano lessons', 'Những buổi học piano',
    ['Memoir', 'Hồi ký', 'An adult remembers being made to take piano lessons as a child.', 'Một người lớn nhớ lại thời nhỏ bị bắt học piano.', 'Who made whom do what? Causative vs causative-passive.', 'Ai bắt ai làm gì? Sai khiến và bị động sai khiến.'],
    [
      [s('子供のころ、母は私を毎週ピアノ教室に通わせました。', 'As a child, my mother made me attend piano lessons every week.', 'Hồi nhỏ, mẹ cho tôi đi học piano mỗi tuần.', 229), s('先生には毎日1時間練習させられました。', 'I was made to practise for an hour every day by the teacher.', 'Tôi bị cô giáo bắt luyện tập một tiếng mỗi ngày.', 233)],
      [s('本当はサッカーがしたかったですから、とても嫌でした。', 'I really wanted to play football, so I hated it.', 'Thật ra tôi muốn đá bóng nên rất ghét.'), s('でも、母は土曜日だけ友達とサッカーをさせてくれました。', 'But my mother let me play football with friends on Saturdays only.', 'Nhưng mẹ cho phép tôi đá bóng với bạn chỉ vào thứ Bảy.', 231)],
      [s('今は、ピアノを弾いて、家族を喜ばせることができます。', 'Now I can play the piano and make my family happy.', 'Bây giờ tôi có thể chơi piano làm gia đình vui.', 229), s('来月、先生の教室で一曲弾かせてもらうことになりました。', 'Next month it’s been arranged that the teacher will let me play a piece at the school.', 'Tháng sau tôi được cô cho đàn một bản ở lớp của cô.', 234, 206)],
    ],
    '子供のころ、この人が自由にできたことは何ですか。', ['毎日ピアノを練習すること', '土曜日にサッカーをすること', 'ピアノ教室を休むこと', '先生の教室で弾くこと'], 2,
    'させてくれました is permission: the mother let the child play football on Saturdays. Practising was forced (させられました).',
    'させてくれました là cho phép: mẹ cho con đá bóng vào thứ Bảy. Việc luyện tập là bị bắt (させられました).'),

  p(29, 'At the hotel front desk', 'Tại quầy lễ tân khách sạn',
    ['Conversation', 'Hội thoại', 'A guest checks in; the receptionist uses honorific and humble Japanese.', 'Một vị khách nhận phòng; lễ tân dùng tôn kính ngữ và khiêm nhường ngữ.', 'Whose action is each verb? Honorific = guest, humble = staff.', 'Động từ là hành động của ai? Tôn kính = khách, khiêm nhường = nhân viên.'],
    [
      [s('受付：いらっしゃいませ。お名前をお書きください。', 'Receptionist: Welcome. Please write your name.', 'Lễ tân: Kính chào quý khách. Xin quý khách viết tên.', 239), s('客：はい。荷物を少しここに置かせてください。', 'Guest: OK. Please let me leave my bags here for a moment.', 'Khách: Vâng. Cho tôi để hành lý ở đây một chút.', 236)],
      [s('受付：どうぞ。お部屋までお荷物をお持ちします。', 'Receptionist: Of course. I will carry your bags to your room.', 'Lễ tân: Xin mời. Tôi sẽ mang hành lý lên phòng cho quý khách.', 235), s('お部屋でたばこをお吸いになりますか。', 'Will you be smoking in your room?', 'Quý khách có hút thuốc trong phòng không ạ?', 238)],
      [s('客：いいえ。あの、明日、少し遅く出させていただけませんか。', 'Guest: No. Um, could you possibly allow me to check out a little late tomorrow?', 'Khách: Không. À, ngày mai cho tôi trả phòng muộn một chút được không?', 237), s('受付：はい、12時まで大丈夫です。', 'Receptionist: Yes, until noon is fine.', 'Lễ tân: Vâng, đến 12 giờ thì được ạ.')],
    ],
    '荷物を部屋に運ぶのはだれですか。', ['客', '受付の人', '客の家族', 'だれも運ばない'], 2,
    'お荷物をお持ちします is humble (お + Vます + します): the receptionist will carry them. The guest only asked to leave bags briefly.',
    'お荷物をお持ちします là khiêm nhường ngữ (お + Vます + します): lễ tân sẽ mang. Khách chỉ xin để hành lý một lát.'),

  p(30, 'The lost wallet', 'Chiếc ví bị mất',
    ['Personal story', 'Chuyện cá nhân', 'The writer loses a wallet at the library and tries to find it.', 'Người viết làm mất ví ở thư viện và cố tìm lại.', 'Time expressions: とき, 間, 間に, まで, までに.', 'Biểu hiện thời gian: とき, 間, 間に, まで, までに.'],
    [
      [s('昨日、図書館で勉強している間に、財布がなくなりました。', 'Yesterday, at some point while I was studying in the library, my wallet disappeared.', 'Hôm qua, trong lúc tôi học ở thư viện, ví của tôi biến mất.', 247), s('図書館に来たときは、かばんに入っていました。', 'When I came to the library, it was in my bag.', 'Lúc đến thư viện, nó vẫn ở trong cặp.', 243)],
      [s('どこで落としたかわかりませんでしたから、カウンターで聞いてみました。', 'I didn’t know where I had dropped it, so I tried asking at the counter.', 'Tôi không biết đã đánh rơi ở đâu nên thử hỏi ở quầy.', 251, 252), s('係の人は「届いているかどうか調べます」と言いました。', 'The staff member said, “I’ll check whether it has been handed in.”', 'Nhân viên nói: “Tôi sẽ kiểm tra xem có ai mang đến không”.', 250)],
      [s('調べている間、私はずっと心配でした。', 'The whole time they were checking, I was worried.', 'Suốt lúc họ kiểm tra, tôi lo lắng mãi.', 246), s('財布は見つかりましたが、閉館の8時までに取りに来てくださいと言われました。', 'The wallet was found, but I was told to pick it up by 8, when the library closes.', 'Ví đã được tìm thấy nhưng tôi được dặn đến lấy trước 8 giờ, giờ thư viện đóng cửa.', 249, 194)],
    ],
    '財布はいつなくなりましたか。', ['図書館に来る前', '図書館で勉強していたとき', '家に帰った後', '8時の後'], 2,
    '勉強している間に marks a point during the study time. When the writer arrived (来たとき) the wallet was still in the bag.',
    '勉強している間に chỉ một thời điểm trong lúc học. Khi đến (来たとき) ví vẫn còn trong cặp.'),

  p(31, 'The rainy sports day', 'Ngày hội thể thao trời mưa',
    ['School newsletter', 'Bản tin trường', 'A teacher reports on the school sports day held in light rain.', 'Một giáo viên kể về ngày hội thể thao tổ chức dưới mưa nhỏ.', 'Contrast (のに, ても) versus reason (ので).', 'Đối lập (のに, ても) và lý do (ので).'],
    [
      [s('運動会の日は、朝から雨が降っていました。', 'On sports day it had been raining since morning.', 'Ngày hội thao trời mưa từ sáng.'), s('雨が降っても運動会をすると決めていたので、予定の時間に始めました。', 'We had decided to hold it even if it rained, so we started at the planned time.', 'Vì đã quyết định dù mưa vẫn tổ chức nên chúng tôi bắt đầu đúng giờ dự kiến.', 255, 253)],
      [s('寒かったのに、子供たちはみんな元気に走りました。', 'Even though it was cold, all the children ran energetically.', 'Trời lạnh vậy mà các em vẫn chạy rất hăng hái.', 254), s('3年生のゆうた君は、転んでも泣かないで、最後まで走りました。', 'Yuta, a third-grader, fell but didn’t cry and ran to the finish.', 'Em Yuta lớp 3 dù bị ngã vẫn không khóc và chạy đến cuối.', 256, 199)],
      [s('ダンスは雨が強くなったので、体育館でしました。', 'The rain got heavier, so the dance was held in the gym.', 'Vì mưa nặng hạt hơn nên phần múa được tổ chức trong nhà thể chất.', 253, 160), s('来年は、晴れてほしいですね。', 'I hope it’s sunny next year.', 'Mong năm sau trời nắng nhé.', 191)],
    ],
    '雨が降って、変わったことは何ですか。', ['運動会が中止になった', 'ダンスの場所', '運動会の日', '走る子供の数'], 2,
    'ダンスは雨が強くなったので、体育館でしました: only the dance moved indoors. The event started at the planned time (予定の時間に).',
    'ダンスは雨が強くなったので、体育館でしました: chỉ phần múa chuyển vào trong nhà. Ngày hội vẫn bắt đầu đúng giờ dự kiến (予定の時間に).'),

  p(32, 'Using the laundromat', 'Sử dụng tiệm giặt tự động',
    ['Instructions', 'Hướng dẫn', 'A laundromat posts instructions for first-time users.', 'Tiệm giặt tự động dán hướng dẫn cho người dùng lần đầu.', 'Follow conditions (たら, と, 場合) and purposes (ために, ように).', 'Theo dõi điều kiện (たら, と, 場合) và mục đích (ために, ように).'],
    [
      [s('初めて使う方は、下の説明のとおりにしてください。', 'First-time users, please follow the instructions below.', 'Người dùng lần đầu xin làm theo hướng dẫn dưới đây.', 262)],
      [s('洗濯物を入れて、お金を入れると、機械が動きます。', 'Put in your laundry, insert money, and the machine starts.', 'Cho đồ giặt vào, bỏ tiền vào thì máy sẽ chạy.', 259), s('洗濯が終わったら、すぐに出してください。次の人が使えるように、お願いします。', 'When the wash is done, take it out at once, so the next person can use it.', 'Giặt xong thì hãy lấy ra ngay để người sau có thể dùng.', 257, 266)],
      [s('セーターを洗うのには、Bの機械がいいです。', 'Machine B is good for washing sweaters.', 'Để giặt áo len thì nên dùng máy B.', 263), s('機械が止まった場合は、壁の番号に電話してください。', 'If a machine stops, call the number on the wall.', 'Trường hợp máy dừng, hãy gọi số trên tường.', 261)],
      [s('電気を節約するために、夜10時に電気を消します。', 'To save electricity, the lights go off at 10 p.m.', 'Để tiết kiệm điện, đèn sẽ tắt lúc 10 giờ tối.', 264), s('夜遅く来る場合は、ほかの店に行ったらどうですか。', 'If you come late at night, how about going to another shop?', 'Nếu đến muộn vào buổi tối, bạn thử đi tiệm khác xem sao?', 261, 258)],
    ],
    '機械が途中で止まりました。どうしますか。', ['Bの機械を使う', '壁の番号に電話する', 'もう一度お金を入れる', 'ほかの店に行く'], 2,
    '機械が止まった場合は、壁の番号に電話してください. Machine B is advice for sweaters, and another shop is advice for late arrivals.',
    '機械が止まった場合は、壁の番号に電話してください. Máy B là lời khuyên cho áo len, còn tiệm khác là lời khuyên khi đến muộn.'),

  p(33, 'A visitor at reception', 'Khách đến quầy lễ tân',
    ['Business conversation', 'Hội thoại công việc', 'A visitor from another company arrives; the receptionist and an employee handle it politely.', 'Một vị khách từ công ty khác đến; lễ tân và nhân viên tiếp đón lịch sự.', 'Honorific (いらっしゃる, 飲まれる) for the visitor; humble (参る, 申す) for staff — including their own president when talking to an outsider.', 'Tôn kính ngữ (いらっしゃる, 飲まれる) cho khách; khiêm nhường ngữ (参る, 申す) cho nhân viên — kể cả giám đốc công ty mình khi nói với người ngoài.'],
    [
      [s('受付：いらっしゃいませ。どちらからいらっしゃいましたか。', 'Reception: Welcome. Where have you come from?', 'Lễ tân: Kính chào quý khách. Quý khách đến từ đâu ạ?', 267), s('客：ABC社の田中と申します。営業部の木村さんとお約束があります。', 'Visitor: I am Tanaka from ABC. I have an appointment with Kimura in Sales.', 'Khách: Tôi là Tanaka của công ty ABC. Tôi có hẹn với anh Kimura phòng kinh doanh.', 269)],
      [s('受付：田中様でございますね。少々お待ちください。', 'Reception: Mr/Ms Tanaka, is it? Please wait a moment.', 'Lễ tân: Ông/bà Tanaka phải không ạ. Xin vui lòng chờ một chút.', 270, 239), s('木村は今会議中ですが、すぐに参ります。', 'Kimura is in a meeting now but will come right away.', 'Kimura đang họp nhưng sẽ đến ngay ạ.', 269)],
      [s('木村：お待たせしました。社長も田中様にお会いしたいと申しておりました。', 'Kimura: Sorry to keep you waiting. Our president also said they would like to meet you.', 'Kimura: Xin lỗi đã để anh/chị chờ. Giám đốc chúng tôi cũng nói muốn được gặp anh/chị.', 269, 235), s('社長は3時に戻りますので、それまで会議室でお休みください。何か飲まれますか。', 'The president will be back at three, so please rest in the meeting room until then. Would you like something to drink?', 'Giám đốc sẽ về lúc 3 giờ nên xin anh/chị nghỉ ở phòng họp đến lúc đó. Anh/chị dùng gì không ạ?', 253, 248, 239, 268)],
    ],
    '田中さんは3時まで何をしますか。', ['社長と会議をする', '会議室で待つ', '営業部へ行く', 'ABC社に戻る'], 2,
    'それまで会議室でお休みください asks the visitor to rest in the meeting room until the president returns at three. Note 戻ります and 申しておりました: staff do not use honorifics for their own president in front of an outside visitor.',
    'それまで会議室でお休みください mời khách nghỉ ở phòng họp đến khi giám đốc về lúc 3 giờ. Chú ý 戻ります và 申しておりました: nhân viên không dùng tôn kính ngữ cho giám đốc công ty mình khi nói với khách bên ngoài.'),
  ...reviewReadings(),
]

// Spiral review in JLPT N4 読解 formats: each text uses its chapter's grammar together with the
// one or two chapters before it, so earlier patterns keep coming back. A hoisted function (with
// its constants inside) so the array above can call it during module initialisation.
function reviewReadings(): PracticeReading[] {
  const SHORT: [string, string] = ['JLPT-style · short text (短文)', 'Kiểu JLPT · đoạn ngắn (短文)']
  const MID: [string, string] = ['JLPT-style · mid-length text (中文)', 'Kiểu JLPT · đoạn vừa (中文)']
  const INFO: [string, string] = ['JLPT-style · information search (情報検索)', 'Kiểu JLPT · tìm thông tin (情報検索)']
  return [
    r(16, 'The broken printer', 'Máy in bị hỏng',
      [...SHORT, 'A memo left on Kimura’s desk by coworker Tanaka.', 'Lời nhắn đồng nghiệp Tanaka để trên bàn Kimura.', 'Reviews N5 requests and invitations with Ch16 hearsay.', 'Ôn lời nhờ, lời mời N5 cùng cách truyền đạt tin nghe được (Bài 16).'],
      [
        [s('木村さんへ', 'To Kimura,', 'Gửi anh/chị Kimura,')],
        [s('3階のプリンターが壊れているみたいです。', 'The printer on the third floor seems to be broken.', 'Máy in tầng 3 hình như bị hỏng.', 143), s('新しいプリンターは来週の月曜日に来るらしいです。', 'Apparently the new printer arrives next Monday.', 'Nghe đâu máy in mới sẽ đến vào thứ Hai tuần sau.', 142), s('それまで、2階のプリンターを使ってもいいと課長が言っていました。', 'The section chief said we may use the second-floor printer until then.', 'Trưởng nhóm nói đến lúc đó có thể dùng máy in tầng 2.', 145), s('2階のプリンターは会議室の中にありますから、使う前に、会議室の人にあいさつしてください。', 'The second-floor printer is inside the meeting room, so please greet the people there before using it.', 'Máy in tầng 2 nằm trong phòng họp nên trước khi dùng hãy chào người trong phòng.', 99)],
        [s('明日の会議の資料は多いし、時間もかかると思いますから、今日の午後、一緒に印刷しませんか。', 'There are a lot of documents for tomorrow’s meeting and I think it will take time, so shall we print them together this afternoon?', 'Tài liệu họp ngày mai nhiều, mình nghĩ sẽ mất thời gian nên chiều nay cùng in nhé?', 146, 147, 56)],
        [s('田中', 'Tanaka', 'Tanaka')],
      ],
      ['新しいプリンターはいつ来ますか。', ['今日の午後', '明日', '来週の月曜日', 'まだわかりません'], 3, '来週の月曜日に来るらしいです: the information is hearsay (らしい), but the day is clear.', '来週の月曜日に来るらしいです: thông tin là nghe nói (らしい) nhưng ngày thì rõ ràng.'],
      ['2階のプリンターを使う前に、何をしますか。', ['課長に聞きます', '会議室の人にあいさつします', '新しいプリンターを待ちます', '資料を印刷します'], 2, '使う前に、会議室の人にあいさつしてください. The chief has already given permission.', '使う前に、会議室の人にあいさつしてください. Trưởng nhóm đã cho phép rồi.']),

    r(17, 'Noise next door', 'Tiếng ồn phòng bên',
      [...MID, 'Linh visits her neighbour Yamaguchi to talk about noise at night.', 'Linh sang gặp hàng xóm Yamaguchi để nói về tiếng ồn ban đêm.', 'んです for explanations and requests (Ch17) mixed with hearsay and opinion (Ch16).', 'んです để giải thích và nhờ vả (Bài 17) kết hợp với tin nghe được và ý kiến (Bài 16).'],
      [
        [s('リン：すみません。隣の部屋のリンですが、ちょっといいですか。', 'Linh: Excuse me. I’m Linh from next door. Do you have a moment?', 'Linh: Xin lỗi. Tôi là Linh ở phòng bên, anh/chị có rảnh một chút không?'), s('山口：はい。どうしたんですか。', 'Yamaguchi: Yes. What’s the matter?', 'Yamaguchi: Vâng. Có chuyện gì vậy?', 151)],
        [s('リン：実は、毎晩12時ごろ、音楽がうるさいんです。', 'Linh: Actually, the music is loud every night around midnight.', 'Linh: Thật ra, đêm nào khoảng 12 giờ nhạc cũng ồn.', 148), s('明日は朝6時からアルバイトがありますから、早く寝たいんですが……。', 'I have a part-time job from 6 tomorrow morning, so I’d like to sleep early, but…', 'Mai tôi làm thêm từ 6 giờ sáng nên muốn ngủ sớm, nhưng…', 150)],
        [s('山口：えっ、すみません。最近、弟が来ていて、夜ギターを練習しているんです。', 'Yamaguchi: Oh, I’m sorry. My younger brother has been staying lately, and he practises guitar at night.', 'Yamaguchi: Ôi, xin lỗi. Dạo này em trai tôi đến ở, tối nào cũng tập ghi-ta.', 148), s('来月のコンテストに出るらしいです。', 'Apparently he’s entering a contest next month.', 'Nghe nói tháng sau nó thi.', 142)],
        [s('リン：そうなんですか。じゃ、夜10時までならいいと思います。', 'Linh: I see. Then I think until 10 p.m. is fine.', 'Linh: Ra vậy. Vậy tôi nghĩ đến 10 giờ tối thì được.', 152, 147), s('山口：わかりました。弟に言います。', 'Yamaguchi: Understood. I’ll tell my brother.', 'Yamaguchi: Tôi hiểu rồi. Tôi sẽ nói với em trai.')],
      ],
      ['夜うるさいのはどうしてですか。', ['山口さんがギターを練習しているから', '山口さんの弟がギターを練習しているから', 'リンさんが音楽を聞いているから', 'コンテストが夜あるから'], 2, '弟が来ていて、夜ギターを練習しているんです: the brother, not Yamaguchi, is playing.', '弟が来ていて、夜ギターを練習しているんです: người chơi là em trai, không phải Yamaguchi.'],
      ['リンさんは、何時までならいいと言いましたか。', ['6時', '10時', '12時', '何時でもいい'], 2, '夜10時までならいいと思います. 6:00 is her work time and 12:00 is when the noise happens.', '夜10時までならいいと思います. 6 giờ là giờ đi làm, 12 giờ là lúc ồn.']),

    r(18, 'Balcony tomatoes', 'Cà chua ngoài ban công',
      [...MID, 'A short essay about growing tomatoes on a balcony two years running.', 'Bài viết ngắn về hai năm trồng cà chua ngoài ban công.', 'Appearance (〜そう) and change (〜くなる, 〜にする) from Ch18, with hearsay and んです.', 'Vẻ ngoài (〜そう) và thay đổi (〜くなる, 〜にする) của Bài 18, cùng tin nghe được và んです.'],
      [
        [s('去年の春、ベランダでトマトを育て始めました。', 'Last spring I started growing tomatoes on my balcony.', 'Mùa xuân năm ngoái tôi bắt đầu trồng cà chua ngoài ban công.'), s('トマトは毎日少しずつ大きくなりました。', 'The tomatoes grew a little bigger every day.', 'Cà chua lớn dần từng chút mỗi ngày.', 160)],
        [s('7月、実が赤くなって、とてもおいしそうでした。', 'In July the fruit turned red and looked delicious.', 'Tháng 7 quả chín đỏ, trông rất ngon.', 160, 155), s('でも、次の日の朝、ベランダに出ました。実は一つもありませんでした。', 'But the next morning I went out on the balcony. There wasn’t a single fruit.', 'Nhưng sáng hôm sau tôi ra ban công. Không còn quả nào.'), s('隣の人の話では、鳥が食べたらしいです。', 'According to my neighbour, apparently birds ate them.', 'Theo lời hàng xóm, nghe đâu chim đã ăn mất.', 142)],
        [s('それで、今年はベランダにネットをかけて、トマトを安全にしました。', 'So this year I put a net over the balcony to make the tomatoes safe.', 'Vì vậy năm nay tôi phủ lưới ban công để cà chua được an toàn.', 159), s('今年のトマトは去年より元気そうです。', 'This year’s tomatoes look healthier than last year’s.', 'Cà chua năm nay trông khỏe hơn năm ngoái.', 155), s('鳥はもう来なさそうですが、まだ少し心配なんです。', 'It doesn’t look like the birds will come any more, but I’m still a little worried.', 'Có vẻ chim sẽ không đến nữa, nhưng tôi vẫn hơi lo.', 157, 148)],
      ],
      ['去年のトマトはどうなりましたか。', ['赤くなりませんでした', '鳥が食べたらしいです', '隣の人が食べました', 'ネットの中で大きくなりました'], 2, '鳥が食べたらしいです, reported by the neighbour. The tomatoes did turn red first.', '鳥が食べたらしいです, theo lời hàng xóm. Cà chua đã chín đỏ trước đó.'],
      ['今年、この人は何をしましたか。', ['トマトを部屋の中で育てました', '鳥にえさをあげました', 'ベランダにネットをかけました', 'トマトを隣の人にあげました'], 3, 'ネットをかけて、トマトを安全にしました.', 'ネットをかけて、トマトを安全にしました.']),

    r(19, 'Guesthouse guide', 'Hướng dẫn nhà nghỉ',
      [...INFO, 'A guide card left in a guesthouse room.', 'Tấm thẻ hướng dẫn để trong phòng nhà nghỉ.', 'Transitive/intransitive pairs and 〜てある (Ch19), with Ch18 adverbs and change.', 'Cặp tha/tự động từ và 〜てある (Bài 19), cùng trạng từ và sự thay đổi của Bài 18.'],
      [
        [s('ゲストハウス「さくら」へようこそ', 'Welcome to Guesthouse Sakura', 'Chào mừng đến nhà nghỉ Sakura')],
        [s('部屋の電気は、ドアの横のスイッチでつけてください。', 'Turn on the room light with the switch beside the door.', 'Hãy bật đèn phòng bằng công tắc cạnh cửa.', 161, 99), s('エアコンのリモコンは机の上に置いてあります。', 'The air-conditioner remote has been left on the desk.', 'Điều khiển điều hòa đã được để sẵn trên bàn.', 163), s('タオルは棚に入れてあります。', 'Towels have been put on the shelf.', 'Khăn tắm đã được để sẵn trong kệ.', 163)],
        [s('夜11時に玄関のドアが閉まります。', 'The front door closes at 11 p.m.', 'Cửa chính đóng lúc 11 giờ đêm.', 162), s('11時より遅くなる人は、受付に言ってください。ドアの番号を教えます。', 'If you will be later than 11, tell reception. We will give you the door code.', 'Ai về muộn hơn 11 giờ hãy báo lễ tân. Chúng tôi sẽ cho mã cửa.', 160, 99)],
        [s('台所の冷蔵庫は自由に使ってもいいです。', 'You may use the kitchen fridge freely.', 'Có thể dùng tủ lạnh trong bếp thoải mái.', 158), s('でも、自分の食べ物には名前を書いてください。', 'But please write your name on your own food.', 'Nhưng hãy ghi tên lên đồ ăn của mình.', 99), s('朝ご飯のパンは、もう台所に用意してあります。', 'Breakfast bread has already been set out in the kitchen.', 'Bánh mì bữa sáng đã được chuẩn bị sẵn trong bếp.', 164)],
      ],
      ['夜12時に帰りたい人は、どうしますか。', ['ドアの横のスイッチを押します', '受付に言って、番号を聞きます', '台所で待ちます', '冷蔵庫に名前を書きます'], 2, 'The door closes at 11, so anyone later must tell reception and get the code.', 'Cửa đóng lúc 11 giờ nên ai về muộn phải báo lễ tân để lấy mã.'],
      ['このゲストハウスについて、正しいものはどれですか。', ['タオルは受付でもらいます', 'リモコンは机の上にあります', '冷蔵庫は使えません', '朝ご飯は自分で買います'], 2, 'リモコンは机の上に置いてあります. Towels are on the shelf, the fridge is free to use, and breakfast bread is provided.', 'リモコンは机の上に置いてあります. Khăn để trên kệ, tủ lạnh dùng tự do, bánh mì sáng có sẵn.']),

    r(20, 'Grandmother’s clock', 'Chiếc đồng hồ của bà',
      [...MID, 'The writer remembers an old clock in their grandmother’s house.', 'Người viết nhớ về chiếc đồng hồ cũ ở nhà bà.', 'Noun-modifying clauses, 音がする and 聞こえる (Ch20), with Ch19 intransitive verbs and Ch18 そう.', 'Mệnh đề bổ nghĩa danh từ, 音がする và 聞こえる (Bài 20), cùng tự động từ Bài 19 và そう Bài 18.'],
      [
        [s('祖母の家には、古い時計があります。', 'There is an old clock in my grandmother’s house.', 'Nhà bà tôi có một chiếc đồng hồ cũ.'), s('それは、祖母が若いころに町の店で買った時計です。', 'It is a clock my grandmother bought at a shop in town when she was young.', 'Đó là chiếc đồng hồ bà mua ở cửa hàng trong phố hồi còn trẻ.', 165), s('大きくて、とても重そうです。', 'It is big and looks very heavy.', 'Nó to và trông rất nặng.', 155), s('毎時間、きれいな音がします。', 'Every hour it makes a lovely sound.', 'Mỗi giờ nó lại phát ra tiếng rất hay.', 169)],
        [s('子供のころ、祖母の家に泊まった夜は、その音が聞こえて、なかなか寝られませんでした。', 'As a child, on nights I stayed at grandma’s, I could hear that sound and found it hard to sleep.', 'Hồi nhỏ, những đêm ngủ lại nhà bà, tôi nghe thấy tiếng đó nên mãi không ngủ được.', 165, 170), s('でも今は、その音がとても好きです。', 'But now I love that sound.', 'Nhưng bây giờ tôi rất thích tiếng đó.')],
        [s('先月、時計が止まりました。', 'Last month the clock stopped.', 'Tháng trước đồng hồ ngừng chạy.', 162), s('祖母は時計を直せる人を探しましたが、なかなか見つかりませんでした。', 'Grandma looked for someone who could fix it but couldn’t find anyone for a long time.', 'Bà tìm người sửa được đồng hồ nhưng mãi không tìm thấy.', 165), s('先週、駅の近くに、古い時計がわかる人がいる店を見つけました。', 'Last week she found a shop near the station with someone who understands old clocks.', 'Tuần trước bà tìm được một cửa hàng gần ga có người hiểu về đồng hồ cũ.', 171, 165), s('今、時計はまた動いていて、部屋は温かい感じがします。', 'Now the clock is running again, and the room feels warm.', 'Bây giờ đồng hồ chạy lại rồi, căn phòng có cảm giác ấm áp.', 169)],
      ],
      ['子供のころ、この人はどうしてよく寝られませんでしたか。', ['部屋が暑かったから', '時計の音が聞こえたから', '祖母が話していたから', '時計が止まったから'], 2, 'その音が聞こえて、なかなか寝られませんでした: hearing the clock kept them awake.', 'その音が聞こえて、なかなか寝られませんでした: nghe tiếng đồng hồ nên khó ngủ.'],
      ['時計は今、どうなっていますか。', ['まだ止まっています', '祖母が自分で直しました', '駅の近くの店で直りました', '新しい時計を買いました'], 3, 'Grandma found a shop near the station with an expert, and the clock is running again (また動いて).', 'Bà tìm được cửa hàng gần ga có người rành đồng hồ, và đồng hồ đã chạy lại (また動いて).']),

    r(21, 'Photo club wants you', 'Câu lạc bộ ảnh tuyển thành viên',
      [...SHORT, 'A university club poster recruiting new members.', 'Áp phích câu lạc bộ đại học tuyển thành viên mới.', 'の nominalisation (Ch21) with Ch20 noun clauses and 見える, and Ch19 てある.', 'Danh từ hóa bằng の (Bài 21) cùng mệnh đề bổ nghĩa và 見える (Bài 20), てある (Bài 19).'],
      [
        [s('写真部　新しいメンバー募集！', 'Photo club: new members wanted!', 'CLB nhiếp ảnh: tuyển thành viên mới!')],
        [s('写真を撮るのが好きな人、いませんか。', 'Is there anyone who likes taking photos?', 'Có ai thích chụp ảnh không?', 172), s('上手に撮れない人も大丈夫です。', 'People who can’t take good photos are welcome too.', 'Người chụp chưa đẹp cũng không sao.', 158, 165), s('私たちの部で一番楽しいのは、毎月の撮影旅行です。', 'The most fun part of our club is the monthly photo trip.', 'Điều vui nhất ở CLB chúng tôi là chuyến đi chụp ảnh hằng tháng.', 174)],
        [s('先月は山へ行って、星がよく見える場所で写真を撮りました。', 'Last month we went to the mountains and took photos at a place where the stars can be seen clearly.', 'Tháng trước chúng tôi lên núi và chụp ảnh ở nơi nhìn rõ sao.', 170, 165), s('カメラを持っていない人には、部のカメラを貸します。', 'We lend the club’s cameras to people who don’t have one.', 'Ai không có máy ảnh, CLB sẽ cho mượn.', 165), s('部室のドアに申し込みの紙がはってあります。', 'The application form is posted on the clubroom door.', 'Tờ đăng ký được dán ở cửa phòng CLB.', 163)],
        [s('申し込むのを忘れないでください。締め切りは金曜日です。', 'Don’t forget to apply. The deadline is Friday.', 'Đừng quên đăng ký. Hạn chót là thứ Sáu.', 178)],
      ],
      ['この部で一番楽しいことは何ですか。', ['星を見ること', '毎月の撮影旅行', 'カメラを借りること', '山で寝ること'], 2, '一番楽しいのは、毎月の撮影旅行です: the のは〜です frame gives the answer directly.', '一番楽しいのは、毎月の撮影旅行です: cấu trúc のは〜です cho đáp án trực tiếp.'],
      ['部に入りたい人は、何をしますか。', ['金曜日に山へ行きます', 'カメラを買います', '部室のドアの紙で申し込みます', '写真を部長に見せます'], 3, 'The form is posted on the clubroom door (はってあります), deadline Friday.', 'Tờ đăng ký dán ở cửa phòng CLB (はってあります), hạn thứ Sáu.']),

    r(22, 'Rules at the city pool', 'Nội quy hồ bơi thành phố',
      [...INFO, 'A notice explaining the signs at a public swimming pool.', 'Bảng thông báo giải thích các biển báo ở hồ bơi công cộng.', 'Commands, prohibitions and という意味 (Ch22), with Ch21 のは / のを忘れる.', 'Mệnh lệnh, cấm đoán và という意味 (Bài 22), cùng のは / のを忘れる của Bài 21.'],
      [
        [s('市民プールのご利用について', 'About using the city pool', 'Về việc sử dụng hồ bơi thành phố')],
        [s('プールの入り口に「走るな」と書いてあります。', 'At the pool entrance it says “No running.”', 'Ở lối vào hồ bơi có ghi “Không được chạy”.', 180, 181), s('床はいつもぬれていますから、危ないです。', 'The floor is always wet, so it is dangerous.', 'Sàn lúc nào cũng ướt nên nguy hiểm.'), s('「飛び込み禁止」は、プールに飛び込むなという意味です。', '“飛び込み禁止” means do not dive into the pool.', '“飛び込み禁止” có nghĩa là không được nhảy xuống hồ.', 182, 180)],
        [s('泳ぐ前に、シャワーを浴びるのを忘れないでください。', 'Don’t forget to shower before swimming.', 'Trước khi bơi đừng quên tắm tráng.', 178), s('子供だけでプールに入るのはだめです。小学生は大人と一緒に入ってください。', 'Children may not go into the pool on their own. Primary-school children must go in with an adult.', 'Trẻ em không được xuống hồ một mình. Học sinh tiểu học phải xuống cùng người lớn.', 173)],
        [s('毎時50分から10分間は「休憩」です。', 'From fifty minutes past each hour there is a ten-minute “break.”', 'Từ phút 50 mỗi giờ có 10 phút “nghỉ”.'), s('「休憩」って何？と思う人もいますが、プールから出て休むという意味です。', 'Some people may wonder what 休憩 is: it means getting out of the pool to rest.', 'Có người thắc mắc “休憩” là gì: nghĩa là lên khỏi hồ để nghỉ.', 184, 182)],
      ],
      ['「飛び込み禁止」はどういう意味ですか。', ['プールで走るな', 'プールに飛び込むな', '子供は入るな', 'シャワーを浴びろ'], 2, 'The notice explains it: プールに飛び込むなという意味です. 走るな is a different sign.', 'Thông báo giải thích: プールに飛び込むなという意味です. 走るな là biển khác.'],
      ['10時50分に何をしますか。', ['泳ぎ始めます', 'プールから出て休みます', 'シャワーを浴びます', '受付に行きます'], 2, 'At :50 every hour the 休憩 starts, meaning get out of the pool and rest.', 'Phút 50 mỗi giờ bắt đầu 休憩, tức là lên khỏi hồ để nghỉ.']),

    r(23, 'Thank you, host family', 'Cảm ơn gia đình chủ nhà',
      [...MID, 'After a homestay, a student emails thanks to the host family.', 'Sau thời gian homestay, một học sinh gửi email cảm ơn gia đình chủ nhà.', 'Giving/receiving and passive (Ch23), with Ch22 という意味 and Ch16 hearsay.', 'Cho – nhận và bị động (Bài 23), cùng という意味 (Bài 22) và tin nghe được (Bài 16).'],
      [
        [s('森さんご家族へ', 'To the Mori family,', 'Gửi gia đình Mori,')],
        [s('先週は本当にありがとうございました。', 'Thank you so much for last week.', 'Cảm ơn gia đình rất nhiều vì tuần trước.'), s('お母さんに日本料理の作り方を教えていただいて、とてもうれしかったです。', 'I was so happy that Mother kindly taught me how to make Japanese food.', 'Được mẹ dạy cách nấu món Nhật, con rất vui.', 189), s('特に、お母さんが作ってくれた肉じゃがの味が忘れられません。', 'I especially can’t forget the taste of the nikujaga Mother made for me.', 'Đặc biệt con không quên được vị món nikujaga mẹ nấu cho con.', 103, 165)],
        [s('最後の日、私は駅で財布を盗まれました。', 'On the last day, my wallet was stolen at the station.', 'Ngày cuối, con bị trộm ví ở ga.', 195), s('でも、お父さんに交番へ連れて行ってもらって、お金も貸していただきました。', 'But Father took me to the police box and kindly lent me money too.', 'Nhưng bố đã đưa con đến đồn cảnh sát và còn cho con mượn tiền.', 188, 189, 192), s('借りたお金は、今月中に銀行から送ります。', 'I will send the money I borrowed through the bank this month.', 'Số tiền đã mượn con sẽ gửi qua ngân hàng trong tháng này.', 192)],
        [s('「一期一会」という言葉を知っていますか。', 'Do you know the phrase “ichigo ichie”?', 'Gia đình có biết câu “ichigo ichie” không?', 182, 95), s('一生に一度の出会いを大切にするという意味だそうです。', 'Apparently it means treasuring a once-in-a-lifetime encounter.', 'Nghe nói nó có nghĩa là trân trọng cuộc gặp gỡ chỉ có một lần trong đời.', 182, 144), s('いつかベトナムにも来てほしいです。', 'I’d love you to come to Vietnam someday too.', 'Con mong một ngày nào đó gia đình sang Việt Nam.', 191)],
      ],
      ['財布を盗まれた後、だれが助けてくれましたか。', ['お母さん', 'お父さん', '駅の人', '友達'], 2, 'お父さんに交番へ連れて行ってもらって: Father took the writer to the police box and lent money.', 'お父さんに交番へ連れて行ってもらって: bố đưa đến đồn cảnh sát và cho mượn tiền.'],
      ['この人がこれからすることは何ですか。', ['肉じゃがを作ります', '交番へ行きます', '借りたお金を送ります', '森さんの家に泊まります'], 3, '今月中に銀行から送ります is the only future action; the rest already happened.', '今月中に銀行から送ります là việc duy nhất sẽ làm; còn lại đều đã xảy ra.']),

    r(24, 'Choosing a gym', 'Chọn phòng gym',
      [...INFO, 'Two gyms near a station are compared; office worker Han must choose.', 'So sánh hai phòng gym gần ga; nhân viên văn phòng Han phải chọn.', 'Cause て, ながら, やすい and すぎる (Ch24), with Ch23 てもらう and Ch21 のは.', 'て chỉ nguyên nhân, ながら, やすい và すぎる (Bài 24), cùng てもらう (Bài 23) và のは (Bài 21).'],
      [
        [s('駅前の二つのスポーツジム', 'Two gyms in front of the station', 'Hai phòng gym trước ga')],
        [s('【ジムA】月8,000円。朝7時から夜11時まで開いています。', 'Gym A: ¥8,000 a month. Open 7 a.m. to 11 p.m.', 'Gym A: 8.000 yên/tháng. Mở từ 7 giờ sáng đến 11 giờ đêm.'), s('機械が新しくて、使いやすいです。でも、夕方は人が多すぎて、なかなか機械が使えません。', 'The machines are new and easy to use. But in the evening there are too many people, and it’s hard to get a machine.', 'Máy mới, dễ dùng. Nhưng chiều tối đông quá nên khó có máy để dùng.', 197, 201, 202)],
        [s('【ジムB】月5,000円。朝10時から夜9時まで開いています。', 'Gym B: ¥5,000 a month. Open 10 a.m. to 9 p.m.', 'Gym B: 5.000 yên/tháng. Mở từ 10 giờ sáng đến 9 giờ tối.'), s('少し古いですが、いつも空いていて、トレーナーにやり方を教えてもらえます。', 'It’s a little old, but always quiet, and the trainers will show you how.', 'Hơi cũ nhưng lúc nào cũng vắng, lại được huấn luyện viên chỉ cách tập.', 188), s('プールで泳ぎながら音楽が聞けるのが人気です。', 'Being able to listen to music while swimming in the pool is popular.', 'Vừa bơi vừa nghe nhạc được là điểm được yêu thích.', 200, 173)],
        [s('会社員のハンさん：仕事が終わるのは夜9時です。', 'Han, an office worker: My work finishes at 9 p.m.', 'Anh Han, nhân viên văn phòng: Tôi tan làm lúc 9 giờ tối.', 173), s('高すぎるジムは困りますが、月1万円までなら大丈夫です。', 'A gym that’s too expensive is a problem, but up to ¥10,000 a month is fine.', 'Gym đắt quá thì không được, nhưng đến 10.000 yên/tháng thì ổn.', 202, 112)],
      ],
      ['ハンさんが行けるジムはどれですか。', ['ジムA', 'ジムB', 'どちらも', 'どちらも行けません'], 1, 'Han finishes at 9 p.m., when Gym B closes. Gym A is open until 11 and ¥8,000 is within his ¥10,000 limit.', 'Han tan làm lúc 9 giờ, đúng lúc Gym B đóng cửa. Gym A mở đến 11 giờ và 8.000 yên nằm trong mức 10.000 yên.'],
      ['ジムBについて、正しいものはどれですか。', ['機械が新しいです', '夕方は人が多すぎます', 'トレーナーに教えてもらえます', '夜11時まで開いています'], 3, 'トレーナーにやり方を教えてもらえます. The other choices describe Gym A.', 'トレーナーにやり方を教えてもらえます. Các lựa chọn khác là của Gym A.']),

    r(25, 'Learning to cook alone', 'Tập tự nấu ăn',
      [...MID, 'A university student describes learning to cook after moving out.', 'Một sinh viên kể chuyện học nấu ăn sau khi ra ở riêng.', 'Decisions and changes (ことにする, ことになる, ようになる, なくなる, つもり) from Ch25, with Ch24 cause and すぎる, Ch23 てもらう.', 'Quyết định và thay đổi (ことにする, ことになる, ようになる, なくなる, つもり) của Bài 25, cùng nguyên nhân, すぎる (Bài 24) và てもらう (Bài 23).'],
      [
        [s('大学に入ってから、一人で住むことになりました。', 'After entering university, it was decided that I would live alone.', 'Sau khi vào đại học, tôi phải sống một mình.', 206, 93), s('最初は料理ができなくて、毎日コンビニの弁当を食べていました。', 'At first I couldn’t cook, so I ate convenience-store bento every day.', 'Lúc đầu tôi không biết nấu nên ngày nào cũng ăn cơm hộp cửa hàng tiện lợi.', 197), s('でも、油が多すぎて、体の調子が悪くなりました。', 'But they were too oily and I started to feel unwell.', 'Nhưng nhiều dầu mỡ quá nên sức khỏe tôi kém đi.', 202, 197, 160)],
        [s('それで、自分で料理を作ることにしました。', 'So I decided to cook for myself.', 'Vì vậy tôi quyết định tự nấu ăn.', 205), s('母に電話で作り方を教えてもらいながら、少しずつ練習しました。', 'I practised little by little while my mother taught me over the phone.', 'Tôi vừa được mẹ chỉ cách nấu qua điện thoại vừa luyện tập dần dần.', 188, 200), s('今は、簡単な料理なら30分で作れるようになりました。', 'Now I’ve become able to make simple dishes in thirty minutes.', 'Bây giờ món đơn giản thì tôi nấu được trong 30 phút.', 209, 112)],
        [s('コンビニにはほとんど行かなくなりました。', 'I hardly go to convenience stores any more.', 'Tôi gần như không đi cửa hàng tiện lợi nữa.', 210), s('来月は友達を呼んで、ベトナム料理を作るつもりです。', 'Next month I plan to invite friends and cook Vietnamese food.', 'Tháng sau tôi định mời bạn bè đến và nấu món Việt.', 212)],
      ],
      ['この人はどうして自分で料理を作ることにしましたか。', ['母に言われたから', '体の調子が悪くなったから', 'コンビニが遠いから', '友達を呼びたかったから'], 2, 'Too much oil made the writer unwell (体の調子が悪くなりました); それで links this cause to the decision.', 'Nhiều dầu mỡ khiến sức khỏe kém (体の調子が悪くなりました); それで nối nguyên nhân này với quyết định.'],
      ['今のこの人について、正しいものはどれですか。', ['毎日コンビニに行きます', '簡単な料理なら30分で作れます', '母と一緒に住んでいます', '来月ベトナムへ帰ります'], 2, '30分で作れるようになりました. The writer now rarely goes to convenience stores and plans to cook for friends, not go home.', '30分で作れるようになりました. Giờ hầu như không đi cửa hàng tiện lợi và định nấu cho bạn, không phải về nước.']),

    r(26, 'The report deadline', 'Hạn nộp báo cáo',
      [...SHORT, 'Two classmates message each other about a report.', 'Hai bạn cùng lớp nhắn tin về bài báo cáo.', 'Stages of an action (ところ, まだ〜ていない), advice and たり (Ch26), with Ch25 ことにする and Ch24 すぎる.', 'Các giai đoạn hành động (ところ, まだ〜ていない), lời khuyên và たり (Bài 26), cùng ことにする (Bài 25) và すぎる (Bài 24).'],
      [
        [s('ユキ：もうレポート書いた？', 'Yuki: Have you written the report yet?', 'Yuki: Cậu viết báo cáo chưa?'), s('トム：ううん、まだ書いていない。今から書くところ。', 'Tom: No, not yet. I’m just about to start.', 'Tom: Chưa, vẫn chưa viết. Giờ mới chuẩn bị viết.', 217, 218)],
        [s('ユキ：私は今書き終わったところ。でも、ちょっと長すぎるかも。', 'Yuki: I’ve just finished. But it might be a bit too long.', 'Yuki: Mình vừa viết xong. Nhưng có lẽ hơi dài quá.', 219, 202), s('トム：先生は「3ページ以内にするようにしてください」と言っていたよ。短くしたほうがいいよ。', 'Tom: The teacher said, “Please keep it to three pages.” You should make it shorter.', 'Tom: Thầy nói “Hãy viết tối đa 3 trang”. Cậu nên viết ngắn lại.', 208, 145, 214, 159)],
        [s('ユキ：そうだね。じゃ、例を少し消したり、文を短くしたりする。', 'Yuki: True. Then I’ll cut some examples, shorten sentences and so on.', 'Yuki: Ừ nhỉ. Vậy mình sẽ bỏ bớt ví dụ, rút ngắn câu…', 215, 159), s('トム：昨日図書館に行ったら、先生がいたよ。月曜日まで待ってくれるって。', 'Tom: When I went to the library yesterday, the teacher was there. They said they’d wait until Monday.', 'Tom: Hôm qua mình đến thư viện thì gặp thầy. Thầy bảo sẽ đợi đến thứ Hai.', 216, 103), s('ユキ：本当？よかった。じゃ、週末にゆっくり直すことにする。', 'Yuki: Really? Great. Then I’ll fix it slowly over the weekend.', 'Yuki: Thật à? May quá. Vậy cuối tuần mình sẽ từ từ sửa.', 205)],
      ],
      ['トムさんはこれから何をしますか。', ['レポートを書き始めます', '図書館へ行きます', 'レポートを短くします', '先生に会います'], 1, '今から書くところ: Tom is about to start writing. The library visit was yesterday.', '今から書くところ: Tom sắp bắt đầu viết. Việc đi thư viện là hôm qua.'],
      ['ユキさんのレポートについて、正しいものはどれですか。', ['まだ書いていません', '3ページより短いです', '長すぎるかもしれません', '月曜日に出しました'], 3, 'Yuki has just finished (書き終わったところ) and worries it is ちょっと長すぎるかも.', 'Yuki vừa viết xong (書き終わったところ) và lo rằng ちょっと長すぎるかも.']),

    r(27, 'How to put out rubbish', 'Cách đổ rác',
      [...INFO, 'An apartment notice explaining rubbish rules.', 'Thông báo của khu căn hộ về quy định đổ rác.', 'Must / must not, てしまう, ておく and gradual change (Ch27), with Ch26 advice and Ch25 ことになっている.', 'Phải / không được, てしまう, ておく và thay đổi dần (Bài 27), cùng lời khuyên (Bài 26) và ことになっている (Bài 25).'],
      [
        [s('ごみの出し方', 'How to put out rubbish', 'Cách đổ rác')],
        [s('燃えるごみは月曜日と木曜日です。朝8時前に出さなくてはいけません。', 'Burnable rubbish goes out on Mondays and Thursdays. It must be out before 8 a.m.', 'Rác cháy được đổ vào thứ Hai và thứ Năm. Phải đổ trước 8 giờ sáng.', 221), s('前の日の夜に出してはいけません。カラスが袋を破ってしまうからです。', 'Don’t put it out the night before, because crows end up tearing the bags.', 'Không được đổ từ tối hôm trước, vì quạ sẽ xé rách túi.', 220, 222), s('びんと缶は、水で洗っておいてください。', 'Rinse bottles and cans with water beforehand.', 'Chai lọ và lon hãy rửa sạch bằng nước trước.', 224)],
        [s('大きいごみは、出す1週間前に電話で予約しておくことになっています。', 'For large items, the rule is to book by phone a week before putting them out.', 'Rác cỡ lớn theo quy định phải gọi điện đặt trước một tuần.', 224, 206), s('最近、ルールを守らない人が増えてきました。', 'Recently, people who don’t follow the rules have been increasing.', 'Gần đây số người không tuân thủ quy định ngày càng tăng.', 227, 165), s('わからない人は、管理人に聞いたほうがいいです。', 'If you’re unsure, you should ask the manager.', 'Ai không rõ thì nên hỏi quản lý.', 214)],
      ],
      ['ワンさんは古い机を捨てたいです。どうしますか。', ['月曜日の朝に出します', '木曜日の夜に出します', '1週間前に電話で予約します', '管理人にあげます'], 3, 'A desk is 大きいごみ, which must be booked by phone a week before.', 'Bàn là 大きいごみ, phải gọi điện đặt trước một tuần.'],
      ['前の日の夜にごみを出してはいけないのは、どうしてですか。', ['管理人が困るから', 'カラスが袋を破るから', '朝8時に集めるから', 'ルールを守らない人が増えたから'], 2, 'カラスが袋を破ってしまうからです: てしまう marks the unwanted result.', 'カラスが袋を破ってしまうからです: てしまう chỉ kết quả không mong muốn.']),

    r(28, 'My first manager', 'Người sếp đầu tiên',
      [...MID, 'The writer looks back on a first job and how they now train new staff.', 'Người viết nhìn lại công việc đầu tiên và cách mình đào tạo nhân viên mới bây giờ.', 'Causative and causative-passive (Ch28), with Ch27 てしまう, Ch25 ようになる / ようにする and Ch23 passive.', 'Sai khiến và bị động sai khiến (Bài 28), cùng てしまう (Bài 27), ようになる / ようにする (Bài 25) và bị động (Bài 23).'],
      [
        [s('最初の会社では、毎日遅くまで働かされました。', 'At my first company, I was made to work late every day.', 'Ở công ty đầu tiên, ngày nào tôi cũng bị bắt làm đến khuya.', 233), s('部長は新しい社員にコピーやお茶の準備をさせて、自分はすぐ帰ってしまうんです。', 'The manager made new staff do copying and make tea, and then just went home straight away.', 'Trưởng phòng bắt nhân viên mới photo, pha trà rồi mình thì về ngay.', 230, 222, 148)],
        [s('ある日、英語の会議に出させてもらえないか、部長に聞きました。', 'One day I asked the manager whether I could be allowed to attend an English meeting.', 'Một hôm tôi hỏi trưởng phòng xem có thể cho tôi dự cuộc họp tiếng Anh không.', 234), s('すると、部長は私を会議に出させてくれました。', 'Then the manager let me attend.', 'Thế là trưởng phòng cho tôi dự họp.', 231), s('その会議で話したことがきっかけで、海外の仕事を任されるようになりました。', 'Speaking at that meeting led to my being entrusted with overseas work.', 'Nhờ phát biểu ở cuộc họp đó mà tôi bắt đầu được giao việc ở nước ngoài.', 194, 209, 165)],
        [s('今は、新しい社員に自分で考えさせるようにしています。', 'Now I make a point of letting new staff think for themselves.', 'Bây giờ tôi luôn cố để nhân viên mới tự suy nghĩ.', 231, 207), s('仕事を楽しんでほしいですから。', 'Because I want them to enjoy their work.', 'Vì tôi muốn họ thấy vui với công việc.', 191)],
      ],
      ['最初の会社で、この人はどうでしたか。', ['毎日早く帰りました', '毎日遅くまで働かされました', '部長にお茶をいれてもらいました', '英語を教えました'], 2, '働かされました is causative-passive: the writer was made to work late.', '働かされました là bị động sai khiến: người viết bị bắt làm muộn.'],
      ['今、この人は新しい社員にどうしていますか。', ['コピーをさせています', '遅くまで働かせています', '自分で考えさせています', '会議に出させません'], 3, '自分で考えさせるようにしています: the writer lets new staff think for themselves, unlike the old manager.', '自分で考えさせるようにしています: người viết để nhân viên mới tự suy nghĩ, khác với sếp cũ.']),

    r(29, 'A late book order', 'Đơn sách bị trễ',
      [...SHORT, 'A bookshop emails a customer about a delayed order.', 'Nhà sách gửi email cho khách về đơn hàng bị trễ.', 'Humble and honorific forms (Ch29), with Ch27 てしまう and Ch23 いただく.', 'Khiêm nhường ngữ và tôn kính ngữ (Bài 29), cùng てしまう (Bài 27) và いただく (Bài 23).'],
      [
        [s('山田様', 'Dear Yamada,', 'Kính gửi ông/bà Yamada,')],
        [s('いつも「みどり書店」をご利用いただき、ありがとうございます。', 'Thank you for always using Midori Bookshop.', 'Cảm ơn quý khách đã luôn sử dụng nhà sách Midori.', 187), s('ご注文の本「日本の祭り」ですが、出版社の都合で、届くのが1週間遅れてしまいます。', 'Regarding the book you ordered, Festivals of Japan: for the publisher’s reasons, it will unfortunately arrive a week late.', 'Về cuốn “Lễ hội Nhật Bản” quý khách đặt, vì lý do từ nhà xuất bản nên sẽ đến trễ một tuần.', 222, 173), s('大変申し訳ありません。', 'We sincerely apologise.', 'Chúng tôi thành thật xin lỗi.')],
        [s('本が届きましたら、すぐにお知らせします。', 'As soon as the book arrives, we will let you know.', 'Khi sách đến, chúng tôi sẽ báo ngay.', 235, 81), s('キャンセルしたい方は、このメールにお返事ください。', 'If you wish to cancel, please reply to this email.', 'Quý khách muốn hủy, vui lòng trả lời email này.', 239), s('お店でお受け取りになる方は、レシートをお持ちください。', 'If you will collect it at the shop, please bring your receipt.', 'Quý khách nhận tại cửa hàng, vui lòng mang theo hóa đơn.', 238, 239)],
        [s('みどり書店　田中', 'Midori Bookshop, Tanaka', 'Nhà sách Midori, Tanaka')],
      ],
      ['注文した本はどうなりましたか。', ['もう届きました', '1週間遅れます', '売り切れました', 'キャンセルされました'], 2, '届くのが1週間遅れてしまいます: てしまう signals an unfortunate delay, not a cancellation.', '届くのが1週間遅れてしまいます: てしまう báo sự chậm trễ đáng tiếc, không phải hủy đơn.'],
      ['店で本を受け取りたい人は、何をしますか。', ['メールに返事をします', 'レシートを持って行きます', '電話をします', 'すぐに店へ行きます'], 2, 'お受け取りになる方は、レシートをお持ちください. Replying to the email is for cancelling.', 'お受け取りになる方は、レシートをお持ちください. Trả lời email là để hủy đơn.']),

    r(30, 'Library guide', 'Hướng dẫn thư viện',
      [...INFO, 'A city library’s guide to opening hours and borrowing rules.', 'Hướng dẫn giờ mở cửa và quy định mượn sách của thư viện thành phố.', 'Time expressions and かどうか / てみる (Ch30), with Ch29 polite requests and Ch28 causative.', 'Biểu hiện thời gian và かどうか / てみる (Bài 30), cùng lời đề nghị lịch sự (Bài 29) và sai khiến (Bài 28).'],
      [
        [s('みなと図書館のご案内', 'Minato Library information', 'Hướng dẫn thư viện Minato')],
        [s('開館時間：火〜金 9:00〜20:00／土・日 9:00〜17:00（月曜日は休み）', 'Hours: Tue–Fri 9:00–20:00 / Sat–Sun 9:00–17:00 (closed Mondays)', 'Giờ mở cửa: thứ Ba–thứ Sáu 9:00–20:00 / thứ Bảy, Chủ nhật 9:00–17:00 (nghỉ thứ Hai)'), s('本は一人10冊まで、2週間借りられます。', 'Each person can borrow up to ten books for two weeks.', 'Mỗi người được mượn tối đa 10 cuốn trong 2 tuần.', 192), s('借りた本は、返す日までに返してください。', 'Please return borrowed books by the due date.', 'Sách đã mượn hãy trả trước ngày hẹn.', 249, 99)],
        [s('図書館が閉まっている間は、入り口の横の返却ポストに入れてください。', 'While the library is closed, put books in the return box beside the entrance.', 'Trong lúc thư viện đóng cửa, hãy bỏ sách vào hộp trả sách cạnh lối vào.', 246), s('本を探すときは、受付でお聞きください。', 'When you’re looking for a book, please ask at the desk.', 'Khi tìm sách, vui lòng hỏi tại quầy.', 242, 239), s('読みたい本があるかどうか、パソコンで調べてみることもできます。', 'You can also try checking on the computer whether the book you want is here.', 'Bạn cũng có thể thử tra trên máy tính xem có cuốn mình muốn đọc không.', 250, 252)],
        [s('小さい子供を一人で遊ばせないでください。', 'Please do not let small children play on their own.', 'Xin đừng để trẻ nhỏ chơi một mình.', 231)],
      ],
      ['日曜日の夜7時に本を返したいです。どうしますか。', ['受付に持って行きます', '返却ポストに入れます', '月曜日に持って行きます', 'パソコンで調べます'], 2, 'On Sunday the library closes at 17:00, so at 19:00 it is closed: use the return box (閉まっている間は…). Monday is a closing day.', 'Chủ nhật thư viện đóng lúc 17:00 nên 19:00 đã đóng: bỏ vào hộp trả sách (閉まっている間は…). Thứ Hai nghỉ.'],
      ['一度に何冊借りられますか。', ['2冊', '10冊', '14冊', '何冊でも'], 2, '一人10冊まで. Two is the number of weeks; fourteen is the number of days.', '一人10冊まで. Số 2 là số tuần; 14 là số ngày.']),

    r(31, 'Rain on the mountain', 'Mưa trên núi',
      [...MID, 'A hiking trip goes ahead in good weather, then the rain comes.', 'Chuyến leo núi khởi hành khi trời đẹp, rồi mưa đến.', 'のに, ので and ても (Ch31), with Ch30 とき / まで and Ch29 polite requests.', 'のに, ので và ても (Bài 31), cùng とき / まで (Bài 30) và lời đề nghị lịch sự (Bài 29).'],
      [
        [s('先週の日曜日、友達と山に登る予定でした。', 'Last Sunday I was planning to climb a mountain with friends.', 'Chủ nhật tuần trước tôi có kế hoạch leo núi với bạn.', 211), s('天気予報では雨だったのに、朝起きたとき、空は晴れていました。', 'Even though the forecast said rain, the sky was clear when I got up.', 'Dự báo thời tiết nói có mưa vậy mà sáng thức dậy trời lại nắng.', 254, 243), s('それで、予定の時間に出かけました。', 'So we set off at the planned time.', 'Vì thế chúng tôi xuất phát đúng giờ dự kiến.')],
        [s('山の上に着いたとき、急に雨が降り始めました。', 'When we reached the top, it suddenly started to rain.', 'Khi lên tới đỉnh, trời bỗng đổ mưa.', 243), s('傘を持っていなかったので、みんなぬれてしまいました。', 'We had no umbrellas, so we all got soaked.', 'Vì không mang ô nên ai cũng bị ướt.', 253, 222), s('山小屋の人が「どうぞお入りください」と言って、温かいお茶を出してくれました。', 'The people at the mountain hut said, “Please come in,” and served us hot tea.', 'Người ở nhà nghỉ trên núi nói “Mời vào” và mời chúng tôi trà nóng.', 239, 103)],
        [s('雨がやむまで、小屋で1時間待ちました。', 'We waited an hour in the hut until the rain stopped.', 'Chúng tôi đợi một tiếng trong nhà nghỉ cho đến khi tạnh mưa.', 248), s('雨が降っても、山はきれいでした。また行きたいです。', 'Even in the rain, the mountain was beautiful. I want to go again.', 'Dù mưa, ngọn núi vẫn đẹp. Tôi muốn đi nữa.', 256)],
      ],
      ['朝、天気はどうでしたか。', ['雨が降っていました', '晴れていました', '雪が降っていました', '曇っていました'], 2, '雨だったのに…晴れていました: のに contrasts the forecast with the clear morning.', '雨だったのに…晴れていました: のに đối lập dự báo với buổi sáng nắng.'],
      ['小屋で何をしましたか。', ['傘を買いました', '雨がやむまで待ちました', '山に登りました', '寝ました'], 2, '雨がやむまで、小屋で1時間待ちました.', '雨がやむまで、小屋で1時間待ちました.']),

    r(32, 'Festival volunteers wanted', 'Tuyển tình nguyện viên lễ hội',
      [...INFO, 'A city notice recruiting volunteers for a cherry-blossom festival.', 'Thông báo của thành phố tuyển tình nguyện viên cho lễ hội hoa anh đào.', 'Purpose, conditions and 場合 (Ch32), with Ch31 ても and Ch30 までに / とき.', 'Mục đích, điều kiện và 場合 (Bài 32), cùng ても (Bài 31) và までに / とき (Bài 30).'],
      [
        [s('さくら祭り　ボランティア募集', 'Sakura Festival: volunteers wanted', 'Lễ hội Sakura: tuyển tình nguyện viên')],
        [s('4月6日（土）・7日（日）、中央公園でさくら祭りを行います。', 'The Sakura Festival will be held in Central Park on Saturday 6 and Sunday 7 April.', 'Lễ hội Sakura sẽ diễn ra ở công viên Trung tâm vào thứ Bảy 6 và Chủ nhật 7 tháng 4.'), s('みなさんに安全に楽しんでもらうために、ボランティアを探しています。', 'We are looking for volunteers so that everyone can enjoy it safely.', 'Để mọi người vui chơi an toàn, chúng tôi đang tìm tình nguyện viên.', 264, 188), s('日本語が上手じゃなくても大丈夫です。', 'It’s fine even if your Japanese isn’t good.', 'Tiếng Nhật chưa giỏi cũng không sao.', 255)],
        [s('参加したい人は、3月30日までに市役所のホームページから申し込んでください。', 'If you want to take part, apply on the City Hall website by 30 March.', 'Ai muốn tham gia hãy đăng ký trên trang web tòa thị chính trước ngày 30 tháng 3.', 249), s('雨の場合は、祭りは13日（土）・14日（日）になります。', 'In case of rain, the festival moves to Saturday 13 and Sunday 14.', 'Trường hợp mưa, lễ hội dời sang thứ Bảy 13 và Chủ nhật 14.', 261), s('1日だけ参加したい場合は、申し込みのときに書いてください。', 'If you only want to take part on one day, write that when you apply.', 'Nếu chỉ muốn tham gia một ngày, hãy ghi rõ khi đăng ký.', 261, 241)],
        [s('当日は、受付で名前を言うと、Tシャツがもらえます。', 'On the day, give your name at reception and you’ll get a T-shirt.', 'Hôm đó, nói tên ở quầy tiếp đón là được nhận áo phông.', 259), s('暑くなるかもしれませんから、水を持ってくるといいですよ。', 'It may get hot, so it’s a good idea to bring water.', 'Trời có thể nóng nên mang theo nước thì tốt.', 260, 225)],
      ],
      ['日本語があまり話せないジョンさんは、参加できますか。', ['参加できません', '参加できます', '日曜日だけ参加できます', '受付の仕事だけできます'], 2, '日本語が上手じゃなくても大丈夫です: ても means “even if”, so John can join.', '日本語が上手じゃなくても大丈夫です: ても nghĩa là “dù”, nên John tham gia được.'],
      ['雨が降った場合、祭りはいつになりますか。', ['4月7日', '4月6日と7日', '4月13日と14日', '3月30日'], 3, '雨の場合は、祭りは13日・14日になります. 30 March is the application deadline.', '雨の場合は、祭りは13日・14日になります. Ngày 30/3 là hạn đăng ký.']),

    r(33, 'A store announcement', 'Thông báo của trung tâm thương mại',
      [...SHORT, 'An in-store announcement at a department store.', 'Thông báo phát thanh trong trung tâm thương mại.', 'Respectful and humble keigo (Ch33), with Ch32 場合, Ch31 ので / ても and Ch29 お〜ください.', 'Tôn kính ngữ và khiêm nhường ngữ (Bài 33), cùng 場合 (Bài 32), ので / ても (Bài 31) và お〜ください (Bài 29).'],
      [
        [s('お客様にご案内申し上げます。', 'An announcement to our customers.', 'Xin thông báo đến quý khách.', 269), s('本日は「さくら百貨店」にお越しいただき、まことにありがとうございます。', 'Thank you very much for visiting Sakura Department Store today.', 'Cảm ơn quý khách đã đến trung tâm thương mại Sakura hôm nay.', 267, 187), s('ただいま、7階の催し物会場で、北海道フェアを行っております。', 'We are now holding a Hokkaido Fair in the seventh-floor event hall.', 'Hiện chúng tôi đang tổ chức hội chợ Hokkaido tại sảnh sự kiện tầng 7.', 269)],
        [s('北海道の有名なケーキやチーズなど、たくさんの商品がございます。', 'There are many products, including famous Hokkaido cakes and cheese.', 'Có rất nhiều sản phẩm như bánh ngọt và phô mai nổi tiếng của Hokkaido.', 270), s('数が少ないので、お早めにお越しください。', 'Quantities are limited, so please come early.', 'Vì số lượng có hạn, xin quý khách đến sớm.', 253, 267, 239), s('3,000円以上お買いになったお客様には、次回使える500円の券を差し上げます。', 'Customers who spend ¥3,000 or more will receive a ¥500 voucher for next time.', 'Quý khách mua từ 3.000 yên trở lên sẽ được tặng phiếu 500 yên dùng cho lần sau.', 238, 269, 165)],
        [s('また、地下の駐車場が込んでいる場合は、駅の駐車場をご利用ください。', 'Also, if the underground car park is full, please use the station car park.', 'Ngoài ra, trường hợp bãi đỗ xe tầng hầm đông, xin dùng bãi đỗ xe của ga.', 261, 239), s('雨が降っても、駅から地下の通路を通れば、ぬれないで来られます。', 'Even if it rains, you can come without getting wet through the underground passage from the station.', 'Dù trời mưa, đi theo lối ngầm từ ga thì có thể đến mà không bị ướt.', 255, 84, 199)],
      ],
      ['500円の券がもらえるのは、どんな人ですか。', ['7階に来た人', '3,000円以上買った人', '駅から来た人', '北海道から来た人'], 2, '3,000円以上お買いになったお客様には…差し上げます: 差し上げる is the humble “give”.', '3,000円以上お買いになったお客様には…差し上げます: 差し上げる là “tặng” dạng khiêm nhường.'],
      ['地下の駐車場が込んでいるとき、どうしますか。', ['空くまで待ちます', '駅の駐車場を使います', '7階に車を止めます', '雨の日は来ません'], 2, '込んでいる場合は、駅の駐車場をご利用ください.', '込んでいる場合は、駅の駐車場をご利用ください.']),
  ]
}
