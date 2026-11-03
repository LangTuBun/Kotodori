import { s, type ReadingParagraph } from './reading-passages.ts'
import type { Bilingual } from './sentence-breakdowns'
import type { ReadingContext } from './reading-contexts'

export interface PracticeReading {
  chapter: number
  title: Bilingual
  context: ReadingContext
  paragraphs: ReadingParagraph[]
  question: { jp: string; options: string[] }
  answer: number
  explanation: Bilingual
}

function p(chapter: number, en: string, vi: string, context: [string, string, string, string, string, string], paragraphs: ReadingParagraph[], q: string, options: string[], answer: number, whyEn: string, whyVi: string): PracticeReading {
  const [typeEn, typeVi, sitEn, sitVi, focusEn, focusVi] = context
  return { chapter, title: { en, vi }, context: { type: { en: typeEn, vi: typeVi }, situation: { en: sitEn, vi: sitVi }, focus: { en: focusEn, vi: focusVi } }, paragraphs, question: { jp: q, options }, answer, explanation: { en: whyEn, vi: whyVi } }
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
    'キムさんはどうして遅くなりましたか。', ['資料を忘れたから', '電車が止まったから', '駅から歩いたから', '会議の時間を間違えたから'], 2,
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
    'まだしていないことはどれですか。', ['机を並べること', '飲み物を買うこと', '黒板に書くこと', 'どれもしてある'], 4,
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
    '「芝生に入らないでください」はどういう意味ですか。', ['池に入ってはいけない', '草の上を歩いてはいけない', '公園で走ってはいけない', '雨の日は入ってはいけない'], 2,
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
    ['Business conversation', 'Hội thoại công việc', 'A visitor from another company arrives; the receptionist and an employee handle it politely.', 'Một vị khách từ công ty khác đến; lễ tân và nhân viên tiếp đón lịch sự.', 'Honorific (いらっしゃる, おっしゃる) for the visitor; humble (参る, 申す) for staff.', 'Tôn kính ngữ (いらっしゃる, おっしゃる) cho khách; khiêm nhường ngữ (参る, 申す) cho nhân viên.'],
    [
      [s('受付：いらっしゃいませ。どちらからいらっしゃいましたか。', 'Reception: Welcome. Where have you come from?', 'Lễ tân: Kính chào quý khách. Quý khách đến từ đâu ạ?', 267), s('客：ABC社の田中と申します。営業部の木村さんとお約束があります。', 'Visitor: I am Tanaka from ABC. I have an appointment with Kimura in Sales.', 'Khách: Tôi là Tanaka của công ty ABC. Tôi có hẹn với anh Kimura phòng kinh doanh.', 269)],
      [s('受付：田中様でございますね。少々お待ちください。', 'Reception: Mr/Ms Tanaka, is it? Please wait a moment.', 'Lễ tân: Ông/bà Tanaka phải không ạ. Xin vui lòng chờ một chút.', 270, 239), s('木村は今会議中ですが、すぐに参ります。', 'Kimura is in a meeting now but will come right away.', 'Kimura đang họp nhưng sẽ đến ngay ạ.', 269)],
      [s('木村：お待たせしました。社長も田中様にお会いしたいとおっしゃっていました。', 'Kimura: Sorry to keep you waiting. The president also said they would like to meet you.', 'Kimura: Xin lỗi đã để anh/chị chờ. Giám đốc cũng nói muốn gặp anh/chị.', 267, 235), s('社長は3時に戻られますので、それまで会議室でお休みください。', 'The president will be back at three, so please rest in the meeting room until then.', 'Giám đốc sẽ về lúc 3 giờ nên xin anh/chị nghỉ ở phòng họp đến lúc đó.', 268, 253, 248, 239)],
    ],
    '田中さんは3時まで何をしますか。', ['社長と会議をする', '会議室で待つ', '営業部へ行く', 'ABC社に戻る'], 2,
    'それまで会議室でお休みください asks the visitor to rest in the meeting room until the president returns at three.',
    'それまで会議室でお休みください mời khách nghỉ ở phòng họp đến khi giám đốc về lúc 3 giờ.'),
]
