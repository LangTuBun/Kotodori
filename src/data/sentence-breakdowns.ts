export type Bilingual = { en: string; vi: string }
export interface SentenceWord { text: string; kana: string; meaning: Bilingual }
export interface SentenceChunk {
  text: string
  label: Bilingual
  detail: Bilingual
  grammarIds?: string[]
  words?: SentenceWord[]
}
export interface SentenceBreakdownData {
  sentence: string
  translation: Bilingual
  together: Bilingual
  chunks: SentenceChunk[]
}

const breakdowns: SentenceBreakdownData[] = [
  {
    sentence: "この件については、まだ誰にも言わないでおきます。",
    translation: { en: "As for this matter, I won't tell anyone yet.", vi: "Về việc này thì tôi sẽ chưa nói với ai cả." },
    together: { en: "The topic sets the scope. まだ and 誰にも work with the negative verb; 〜ないでおく adds a deliberate decision to leave it unsaid for now.", vi: "Chủ đề giới hạn điều đang nói tới. まだ và 誰にも đi với động từ phủ định; 〜ないでおく thêm ý chủ động tạm thời không nói." },
    chunks: [
      { text: "この件については、", label: { en: "As for this matter", vi: "Về việc này" }, detail: { en: "この modifies 件 (matter). について means ‘about’; は marks the phrase as the topic, with a possible contrast to other matters.", vi: "この bổ nghĩa cho 件 (việc). について nghĩa là ‘về’; は đánh dấu cụm này làm chủ đề, có thể đối lập với những việc khác." } },
      { text: "まだ", label: { en: "not yet", vi: "vẫn chưa" }, detail: { en: "With a negative predicate, まだ means ‘not yet’. Here it places the decision in the present: for now.", vi: "Đi với vị ngữ phủ định, まだ có nghĩa ‘chưa’. Ở đây nó đặt quyết định trong thời điểm hiện tại: tạm thời." } },
      { text: "誰にも", label: { en: "to anyone", vi: "với bất kỳ ai" }, detail: { en: "誰 (who) + に (recipient) + も, together with the negative predicate, means ‘to no one / to anyone’.", vi: "誰 (ai) + に (người nhận) + も, kết hợp với vị ngữ phủ định, có nghĩa ‘không với ai cả’." } },
      { text: "言わないでおきます。", label: { en: "will refrain from telling", vi: "sẽ tạm không nói" }, detail: { en: "言う → 言わない → 言わないでおく → 言わないでおきます. The negative + で joins おく; its polite form おきます expresses a deliberate choice to leave the action undone, not an inability to speak.", vi: "言う → 言わない → 言わないでおく → 言わないでおきます. Dạng phủ định + で nối với おく; dạng lịch sự おきます diễn đạt lựa chọn chủ động không làm, không phải không thể nói." } },
    ],
  },
  {
    sentence: "明日のために、資料を準備しておきます。",
    translation: { en: "I'll prepare the documents in advance for tomorrow.", vi: "Tôi sẽ chuẩn bị sẵn tài liệu cho ngày mai." },
    together: { en: "The first phrase gives the future purpose, and 〜ておく says the preparation will be done ahead of time.", vi: "Cụm đầu nêu mục đích trong tương lai; 〜ておく cho biết việc chuẩn bị được làm trước." },
    chunks: [
      { text: "明日のために、", label: { en: "for tomorrow", vi: "cho ngày mai" }, detail: { en: "明日 (tomorrow) + の + ために expresses the purpose or occasion being prepared for.", vi: "明日 (ngày mai) + の + ために nêu mục đích hoặc dịp cần chuẩn bị." } },
      { text: "資料を", label: { en: "the documents", vi: "tài liệu" }, detail: { en: "資料 is the material or documents; を marks what is prepared.", vi: "資料 là tài liệu; を đánh dấu đối tượng được chuẩn bị." } },
      { text: "準備しておきます。", label: { en: "prepare in advance", vi: "chuẩn bị sẵn" }, detail: { en: "準備する → 準備して → 準備しておく → 準備しておきます. 〜ておく describes an intentional action done ahead of a later need; おきます is polite.", vi: "準備する → 準備して → 準備しておく → 準備しておきます. 〜ておく diễn đạt hành động chủ động làm trước cho nhu cầu sau đó; おきます là dạng lịch sự." } },
    ],
  },
  {
    sentence: "マイさんから聞きました。",
    translation: { en: "I heard it from Mai.", vi: "Tôi nghe tin từ Mai." },
    together: { en: "The source comes first, followed by the polite past verb. What was heard is understood from the preceding sentence.", vi: "Nguồn tin đứng trước, tiếp theo là động từ quá khứ lịch sự. Nội dung đã nghe được hiểu từ câu trước." },
    chunks: [
      { text: "マイさんから", label: { en: "from Mai", vi: "từ Mai" }, detail: { en: "さん is a respectful title; から marks the source of the information.", vi: "さん là kính xưng; から đánh dấu nguồn thông tin." } },
      { text: "聞きました。", label: { en: "heard", vi: "đã nghe" }, detail: { en: "聞く → 聞きます → 聞きました: the polite past of ‘hear / ask’. In context it means ‘heard’.", vi: "聞く → 聞きます → 聞きました: dạng quá khứ lịch sự của ‘nghe / hỏi’. Trong ngữ cảnh này là ‘đã nghe’." } },
    ],
  },
  {
    sentence: "7月の終わりに、さよならパーティーをしませんか。",
    translation: { en: "Shall we have a farewell party at the end of July?", vi: "Cuối tháng 7 chúng ta tổ chức tiệc chia tay nhé?" },
    together: { en: "The time expression says when; the negative question form turns the suggested action into a polite invitation.", vi: "Cụm thời gian cho biết khi nào; dạng câu hỏi phủ định biến hành động được đề xuất thành lời mời lịch sự." },
    chunks: [
      { text: "7月の終わりに、", label: { en: "at the end of July", vi: "vào cuối tháng 7" }, detail: { en: "7月 + の + 終わり means ‘the end of July’; に marks when the party would take place.", vi: "7月 + の + 終わり nghĩa là ‘cuối tháng 7’; に đánh dấu thời điểm diễn ra bữa tiệc." } },
      { text: "さよならパーティーを", label: { en: "a farewell party", vi: "tiệc chia tay" }, detail: { en: "さよならパーティー is a farewell party; を marks it as the object of する.", vi: "さよならパーティー là tiệc chia tay; を đánh dấu đối tượng của する." } },
      { text: "しませんか。", label: { en: "shall we have?", vi: "tổ chức nhé?" }, detail: { en: "する → します → しませんか. This polite negative question suggests doing something together; it is an invitation, not a statement that the party will not happen.", vi: "する → します → しませんか. Câu hỏi phủ định lịch sự này đề nghị cùng làm một việc; đây là lời mời, không phải lời khẳng định rằng tiệc sẽ không diễn ra." } },
    ],
  },
]

breakdowns.push(
  {
    sentence: "お疲れ様です。もう聞きましたか。高木さん、会社をやめるそうですね。",
    translation: { en: "Hello. Have you heard? Apparently Takagi is leaving the company.", vi: "Chào anh/chị. Anh/chị nghe tin chưa? Nghe nói anh Takagi sẽ nghỉ việc ở công ty." },
    together: { en: "After a workplace greeting, the writer asks whether Yamada has heard the news. Takagi is the understood subject of やめる; そうです reports news, rather than an impression based on appearance.", vi: "Sau lời chào nơi công sở, người viết hỏi Yamada đã nghe tin chưa. Takagi là chủ thể được hiểu của やめる; そうです thuật lại tin, không phải phán đoán qua vẻ ngoài." },
    chunks: [
      { text: "お疲れ様です。", label: { en: "workplace greeting", vi: "lời chào công sở" }, detail: { en: "A conventional greeting acknowledging someone's work. In this email, a natural translation is ‘Hello’, rather than ‘You are tired’.", vi: "Lời chào quen dùng để ghi nhận công sức của người khác. Trong email này, dịch tự nhiên là ‘Chào anh/chị’, không phải ‘Anh/chị mệt’." } },
      { text: "もう聞きましたか。", label: { en: "have you heard?", vi: "đã nghe tin chưa?" }, detail: { en: "もう asks whether something has already happened. 聞く → 聞きます → 聞きました; か makes it a question.", vi: "もう hỏi việc đã xảy ra chưa. 聞く → 聞きます → 聞きました; か tạo câu hỏi." } },
      { text: "高木さん、", label: { en: "Takagi", vi: "anh/chị Takagi" }, detail: { en: "Introduces the person the following news concerns. さん is a polite name suffix.", vi: "Nêu người mà thông tin phía sau nói đến. さん là hậu tố lịch sự sau tên." } },
      { text: "会社を", label: { en: "the company", vi: "công ty" }, detail: { en: "を marks the organization one leaves in 会社をやめる.", vi: "を đánh dấu tổ chức mà người đó nghỉ trong cụm 会社をやめる." } },
      { text: "やめるそうですね。", label: { en: "apparently leaving", vi: "nghe nói sẽ nghỉ" }, grammarIds: ["g_144"], detail: { en: "Dictionary-form やめる + hearsay そうです. The writer reports information received from someone else; ね invites shared recognition.", vi: "Thể từ điển やめる + そうです truyền đạt tin nghe được. Người viết thuật lại thông tin từ người khác; ね gợi sự đồng tình/xác nhận." } },
    ],
  },
  {
    sentence: "7月まで働いて、その後すぐに北海道に引っ越すらしいと部長が言っていました。",
    translation: { en: "The manager said Takagi would apparently work until July and move to Hokkaido straight afterwards.", vi: "Trưởng phòng nói rằng anh ấy nghe đâu sẽ làm việc đến tháng 7 rồi chuyển ngay đến Hokkaido." },
    together: { en: "The manager is the source of a report about Takagi. と closes the quoted content; the manager is not the person moving.", vi: "Trưởng phòng là nguồn tin về Takagi. と kết thúc nội dung được dẫn; người chuyển nhà không phải trưởng phòng." },
    chunks: [
      { text: "7月まで働いて、", label: { en: "work until July", vi: "làm đến tháng 7" }, detail: { en: "まで marks the endpoint. 働く → 働いて connects working to the next event.", vi: "まで đánh dấu mốc kết thúc. 働く → 働いて nối việc làm với sự việc tiếp theo." } },
      { text: "その後すぐに", label: { en: "right afterwards", vi: "ngay sau đó" }, detail: { en: "その後 refers back to the end of work; すぐに means immediately afterwards.", vi: "その後 chỉ thời điểm sau khi kết thúc công việc; すぐに nghĩa là ngay sau đó." } },
      { text: "北海道に", label: { en: "to Hokkaido", vi: "đến Hokkaido" }, detail: { en: "に marks the destination of the move.", vi: "に đánh dấu đích đến của việc chuyển nhà." } },
      { text: "引っ越すらしいと", label: { en: "apparently moving", vi: "nghe đâu sẽ chuyển" }, grammarIds: ["g_142"], detail: { en: "引っ越す + らしい reports indirect information. と marks the content of what the manager said, including the earlier clauses.", vi: "引っ越す + らしい thuật lại thông tin gián tiếp. と đánh dấu nội dung trưởng phòng đã nói, gồm cả các vế phía trước." } },
      { text: "部長が言っていました。", label: { en: "the manager said", vi: "trưởng phòng đã nói" }, grammarIds: ["g_145"], detail: { en: "が marks who said it. 言う → 言っていました reports a prior statement; it does not imply the manager is still speaking now.", vi: "が đánh dấu người đã nói. 言う → 言っていました thuật lại lời nói trước đó; không có nghĩa trưởng phòng vẫn đang nói lúc này." } },
    ],
  },
  {
    sentence: "みなさん忙しいと思いますから、仕事の後、会社の近くの店でやりたいです。",
    translation: { en: "I think everyone is busy, so I'd like to hold it after work at a place near the office.", vi: "Vì tôi nghĩ mọi người bận nên tôi muốn tổ chức sau giờ làm tại một quán gần công ty." },
    together: { en: "The writer's thought explains the choice of time and place. やる refers to holding the farewell party mentioned earlier.", vi: "Suy nghĩ của người viết giải thích lựa chọn thời gian và địa điểm. やる chỉ việc tổ chức tiệc chia tay đã nhắc trước đó." },
    chunks: [
      { text: "みなさん忙しいと思いますから、", label: { en: "because I think everyone is busy", vi: "vì tôi nghĩ mọi người bận" }, grammarIds: ["g_147"], detail: { en: "忙しい is the thought quoted by と. 思います expresses the writer's opinion, and から gives it as the reason for the suggestion.", vi: "忙しい là nội dung suy nghĩ được dẫn bằng と. 思います nêu ý kiến người viết; から dùng ý kiến đó làm lý do đề xuất." } },
      { text: "仕事の後、", label: { en: "after work", vi: "sau giờ làm" }, detail: { en: "Noun + の後 expresses ‘after’ that event. A time phrase can appear here without に.", vi: "Danh từ + の後 diễn đạt ‘sau’ sự việc đó. Cụm thời gian này có thể xuất hiện mà không cần に." } },
      { text: "会社の近くの店で", label: { en: "at a place near the office", vi: "tại quán gần công ty" }, detail: { en: "会社の近く modifies 店 through の. で marks where the party will be held.", vi: "会社の近く bổ nghĩa cho 店 qua の. で đánh dấu nơi tổ chức tiệc." } },
      { text: "やりたいです。", label: { en: "I'd like to hold it", vi: "tôi muốn tổ chức" }, grammarIds: ["g_059"], detail: { en: "やる → やります → やりたいです. Remove ます and add たい to express the speaker's wish.", vi: "やる → やります → やりたいです. Bỏ ます và thêm たい để diễn đạt mong muốn của người nói." } },
    ],
  },
  {
    sentence: "今、みなさんに暇な日を聞いています。山田さんが参加できる日を教えてください。",
    translation: { en: "I'm asking everyone when they are free. Please tell me which day you can attend.", vi: "Tôi đang hỏi ngày rảnh của mọi người. Hãy cho tôi biết ngày anh/chị Yamada có thể tham gia." },
    together: { en: "The first sentence describes the ongoing scheduling. In the second, 山田さんが参加できる modifies 日: the day when Yamada can attend.", vi: "Câu đầu mô tả việc sắp xếp đang diễn ra. Trong câu sau, 山田さんが参加できる bổ nghĩa cho 日: ngày mà Yamada có thể tham gia." },
    chunks: [
      { text: "今、", label: { en: "now", vi: "bây giờ" }, detail: { en: "Sets the time for the ongoing action.", vi: "Nêu thời điểm hành động đang diễn ra." } },
      { text: "みなさんに", label: { en: "everyone", vi: "mọi người" }, detail: { en: "に marks the people being asked with 聞く.", vi: "に đánh dấu những người được hỏi với 聞く." } },
      { text: "暇な日を", label: { en: "days they are free", vi: "ngày rảnh" }, detail: { en: "暇 is a な-adjective, so it takes な before 日. を marks the information being asked for.", vi: "暇 là tính từ な nên dùng な trước 日. を đánh dấu thông tin được hỏi." } },
      { text: "聞いています。", label: { en: "am asking", vi: "đang hỏi" }, detail: { en: "聞く → 聞いて + います describes the ongoing process of asking people. Here 聞く means ‘ask’, rather than ‘hear’.", vi: "聞く → 聞いて + います mô tả quá trình hỏi mọi người. Ở đây 聞く nghĩa là ‘hỏi’, không phải ‘nghe’." } },
      { text: "山田さんが参加できる日を", label: { en: "the day Yamada can attend", vi: "ngày Yamada có thể tham gia" }, grammarIds: ["g_061_1"], detail: { en: "参加する → 参加できる is potential. The whole clause 山田さんが参加できる modifies 日, and を marks that day as the information requested.", vi: "参加する → 参加できる là thể khả năng. Cả mệnh đề 山田さんが参加できる bổ nghĩa cho 日; を đánh dấu ngày được yêu cầu cho biết." } },
      { text: "教えてください。", label: { en: "please tell me", vi: "hãy cho tôi biết" }, detail: { en: "教える → 教えて + ください makes a polite request. In context 教える means ‘tell’, rather than ‘teach’.", vi: "教える → 教えて + ください tạo lời yêu cầu lịch sự. Trong ngữ cảnh này 教える là ‘cho biết’, không phải ‘dạy’." } },
    ],
  },
  {
    sentence: "田中さんとマイさんはいつでもいいそうです。",
    translation: { en: "Apparently any day is fine for Tanaka and Mai.", vi: "Nghe nói ngày nào anh/chị Tanaka và Mai cũng được." },
    together: { en: "The two people form the topic. The writer reports their availability without specifying a particular day.", vi: "Hai người là chủ đề. Người viết thuật lại thời gian rảnh của họ mà không nêu ngày cụ thể." },
    chunks: [
      { text: "田中さんとマイさんは", label: { en: "as for Tanaka and Mai", vi: "về Tanaka và Mai" }, detail: { en: "と joins the names; は marks them together as the topic.", vi: "と nối hai tên; は đánh dấu cả hai làm chủ đề." } },
      { text: "いつでも", label: { en: "any time", vi: "lúc nào cũng" }, detail: { en: "いつ + でも expresses unrestricted choice of time: any time or day.", vi: "いつ + でも diễn đạt không giới hạn thời điểm: bất kỳ lúc nào hay ngày nào." } },
      { text: "いいそうです。", label: { en: "they say is fine", vi: "nghe nói là được" }, grammarIds: ["g_144"], detail: { en: "いい + hearsay そうです reports what the two people said. This is distinct from appearance よさそうです (‘looks good’).", vi: "いい + そうです truyền đạt điều hai người đã nói. Khác với よさそうです chỉ vẻ ngoài (‘trông có vẻ tốt’)." } },
    ],
  },
)

const annotations: Record<string, Pick<SentenceChunk, "grammarIds" | "words">> = {
  "言わないでおきます。": { grammarIds: ["g_224"], words: [{ text: "言う", kana: "いう", meaning: { en: "to say, tell", vi: "nói, kể" } }] },
  "準備しておきます。": { grammarIds: ["g_224"], words: [{ text: "準備する", kana: "じゅんびする", meaning: { en: "to prepare", vi: "chuẩn bị" } }] },
  "資料を": { words: [{ text: "資料", kana: "しりょう", meaning: { en: "documents, materials", vi: "tài liệu" } }] },
  "しませんか。": { grammarIds: ["g_056"] },
  "会社を": { words: [{ text: "会社", kana: "かいしゃ", meaning: { en: "company", vi: "công ty" } }] },
  "引っ越すらしいと": { words: [{ text: "引っ越す", kana: "ひっこす", meaning: { en: "to move house", vi: "chuyển nhà" } }] },
  "部長が言っていました。": { words: [{ text: "部長", kana: "ぶちょう", meaning: { en: "department manager", vi: "trưởng phòng" } }, { text: "言う", kana: "いう", meaning: { en: "to say", vi: "nói" } }] },
  "聞きました。": { words: [{ text: "聞く", kana: "きく", meaning: { en: "to hear / ask; here: hear", vi: "nghe / hỏi; ở đây: nghe" } }] },
  "聞いています。": { words: [{ text: "聞く", kana: "きく", meaning: { en: "to hear / ask; here: ask", vi: "nghe / hỏi; ở đây: hỏi" } }] },
  "暇な日を": { words: [{ text: "暇", kana: "ひま", meaning: { en: "free, not busy", vi: "rảnh rỗi" } }] },
  "山田さんが参加できる日を": { words: [{ text: "参加する", kana: "さんかする", meaning: { en: "to participate, attend", vi: "tham gia" } }] },
  "みなさん忙しいと思いますから、": { words: [{ text: "忙しい", kana: "いそがしい", meaning: { en: "busy", vi: "bận" } }] },
  "仕事の後、": { words: [{ text: "仕事", kana: "しごと", meaning: { en: "work", vi: "công việc" } }] },
  "会社の近くの店で": { words: [{ text: "会社", kana: "かいしゃ", meaning: { en: "company", vi: "công ty" } }, { text: "近く", kana: "ちかく", meaning: { en: "nearby", vi: "gần" } }, { text: "店", kana: "みせ", meaning: { en: "shop; here: a venue for the party", vi: "cửa hàng; ở đây: quán để tổ chức tiệc" } }] },
  "教えてください。": { words: [{ text: "教える", kana: "おしえる", meaning: { en: "to teach / tell; here: tell", vi: "dạy / cho biết; ở đây: cho biết" } }] },
  "7月の終わりに、": { words: [{ text: "終わり", kana: "おわり", meaning: { en: "end", vi: "cuối, kết thúc" } }] },
  "やめるそうですね。": { words: [{ text: "やめる", kana: "やめる", meaning: { en: "to quit, stop", vi: "nghỉ, thôi" } }] },
}
for (const data of breakdowns) for (const chunk of data.chunks) {
  const annotation = annotations[chunk.text]
  if (annotation) { chunk.grammarIds ??= annotation.grammarIds; chunk.words ??= annotation.words }
}
export const sentenceBreakdowns = Object.fromEntries(breakdowns.map(b => [b.sentence, b])) as Record<string, SentenceBreakdownData | undefined>
