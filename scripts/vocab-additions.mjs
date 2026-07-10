// Hand-curated vocabulary additions for sparse kanji groups (<=2 words).
// Word/reading pairs are grounded in real Jisho dictionary entries
// (scripts/candidates.json); Han Viet + Vietnamese meaning + on/kun
// classification are supplied by hand and marked `curated: true` so the
// UI can visually distinguish them from the original textbook-sourced
// words. Keyed by kanji.json group id (chapter+anchor can repeat, id
// cannot).
export default {
  // Chapter 1
  k1_g13: [
    { kanji: "万年筆", kana: "まんねんひつ", hanviet: "Vạn Niên Bút", meaning: "Bút máy", onkun: "On--On--On" },
    { kanji: "万一", kana: "まんいち", hanviet: "Vạn Nhất", meaning: "Trường hợp vạn nhất, lỡ như", onkun: "On--On" },
  ],
  k1_g14: [
    { kanji: "円満", kana: "えんまん", hanviet: "Viên Mãn", meaning: "Viên mãn, hòa thuận", onkun: "On--On" },
    { kanji: "円高", kana: "えんだか", hanviet: "Viên Cao", meaning: "Đồng yên tăng giá", onkun: "On--Kun" },
    { kanji: "円滑", kana: "えんかつ", hanviet: "Viên Hoạt", meaning: "Trôi chảy, suôn sẻ", onkun: "On--On" },
  ],

  // Chapter 2
  k2_g2: [
    { kanji: "田畑", kana: "たはた", hanviet: "Điền Điền", meaning: "Ruộng đồng", onkun: "Kun--Kun" },
    { kanji: "花畑", kana: "はなばたけ", hanviet: "Hoa Điền", meaning: "Vườn hoa", onkun: "Kun--Kun" },
  ],
  k2_g3: [
    { kanji: "秋風", kana: "あきかぜ", hanviet: "Thu Phong", meaning: "Gió thu", onkun: "Kun--Kun" },
    { kanji: "秋分", kana: "しゅうぶん", hanviet: "Thu Phân", meaning: "Tiết thu phân", onkun: "On--On" },
    { kanji: "晩秋", kana: "ばんしゅう", hanviet: "Vãn Thu", meaning: "Cuối thu", onkun: "On--On" },
  ],
  k2_g4: [
    { kanji: "氷山", kana: "ひょうざん", hanviet: "Băng Sơn", meaning: "Núi băng", onkun: "On--On" },
    { kanji: "氷河", kana: "ひょうが", hanviet: "Băng Hà", meaning: "Sông băng", onkun: "On--On" },
    { kanji: "氷点", kana: "ひょうてん", hanviet: "Băng Điểm", meaning: "Điểm đóng băng", onkun: "On--On" },
  ],
  k2_g5: [
    { kanji: "泳ぎ方", kana: "およぎかた", hanviet: "Vịnh Phương", meaning: "Cách bơi", onkun: "Kun--Kun" },
    { kanji: "泳ぎ", kana: "およぎ", hanviet: "Vịnh", meaning: "Việc bơi lội", onkun: "Kun" },
  ],
  k2_g7: [
    { kanji: "雨具", kana: "あまぐ", hanviet: "Vũ Cụ", meaning: "Đồ dùng đi mưa", onkun: "Kun--On" },
    { kanji: "大雨", kana: "おおあめ", hanviet: "Đại Vũ", meaning: "Mưa to", onkun: "Kun--Kun" },
    { kanji: "梅雨", kana: "つゆ", hanviet: "Mai Vũ", meaning: "Mùa mưa (Nhật Bản)", onkun: "Ate" },
  ],
  k2_g9: [
    { kanji: "大雪", kana: "おおゆき", hanviet: "Đại Tuyết", meaning: "Tuyết lớn", onkun: "Kun--Kun" },
    { kanji: "雪国", kana: "ゆきぐに", hanviet: "Tuyết Quốc", meaning: "Xứ tuyết", onkun: "Kun--Kun" },
    { kanji: "初雪", kana: "はつゆき", hanviet: "Sơ Tuyết", meaning: "Tuyết đầu mùa", onkun: "Kun--Kun" },
  ],
  k2_g10: [
    { kanji: "雨雲", kana: "あまぐも", hanviet: "Vũ Vân", meaning: "Mây mưa", onkun: "Kun--Kun" },
    { kanji: "星雲", kana: "せいうん", hanviet: "Tinh Vân", meaning: "Tinh vân", onkun: "On--On" },
    { kanji: "雲海", kana: "うんかい", hanviet: "Vân Hải", meaning: "Biển mây", onkun: "On--On" },
  ],

  // Chapter 3
  k3_g2: [
    { kanji: "白", kana: "しろ", hanviet: "Bạch", meaning: "Màu trắng", onkun: "Kun" },
    { kanji: "白鳥", kana: "はくちょう", hanviet: "Bạch Điểu", meaning: "Thiên nga", onkun: "On--On" },
    { kanji: "白紙", kana: "はくし", hanviet: "Bạch Chỉ", meaning: "Giấy trắng, trắng tay", onkun: "On--On" },
  ],
  k3_g3: [
    { kanji: "早く", kana: "はやく", hanviet: "Tảo", meaning: "Sớm, nhanh", onkun: "Kun" },
    { kanji: "早朝", kana: "そうちょう", hanviet: "Tảo Triêu", meaning: "Sáng sớm", onkun: "On--On" },
    { kanji: "早退", kana: "そうたい", hanviet: "Tảo Thoái", meaning: "Về sớm (khỏi trường, công ty)", onkun: "On--On" },
  ],
  k3_g8: [
    { kanji: "子犬", kana: "こいぬ", hanviet: "Tử Khuyển", meaning: "Chó con", onkun: "Kun--Kun" },
    { kanji: "犬小屋", kana: "いぬごや", hanviet: "Khuyển Tiểu Ốc", meaning: "Chuồng chó", onkun: "Kun--Kun--Kun" },
    { kanji: "番犬", kana: "ばんけん", hanviet: "Phiên Khuyển", meaning: "Chó canh gác", onkun: "On--On" },
  ],
  k3_g11: [
    { kanji: "少々", kana: "しょうしょう", hanviet: "Thiểu Thiểu", meaning: "Một chút, hơi", onkun: "On--On" },
    { kanji: "少なくとも", kana: "すくなくとも", hanviet: "Thiểu", meaning: "Ít nhất", onkun: "Kun" },
  ],
  k3_g12: [
    { kanji: "京", kana: "きょう", hanviet: "Kinh", meaning: "Kinh đô (thường chỉ Kyoto)", onkun: "On" },
    { kanji: "上京する", kana: "じょうきょうします", hanviet: "Thượng Kinh", meaning: "Lên Tokyo / lên kinh đô", onkun: "On--On" },
  ],
  k3_g13: [
    { kanji: "少年", kana: "しょうねん", hanviet: "Thiếu Niên", meaning: "Thiếu niên (con trai)", onkun: "On--On" },
    { kanji: "少女", kana: "しょうじょ", hanviet: "Thiếu Nữ", meaning: "Thiếu nữ (con gái)", onkun: "On--On" },
    { kanji: "少数", kana: "しょうすう", hanviet: "Thiểu Số", meaning: "Số ít, thiểu số", onkun: "On--On" },
  ],
  k3_g14: [
    { kanji: "東", kana: "ひがし", hanviet: "Đông", meaning: "Phía đông", onkun: "Kun" },
    { kanji: "東北", kana: "とうほく", hanviet: "Đông Bắc", meaning: "Đông Bắc", onkun: "On--On" },
    { kanji: "東洋", kana: "とうよう", hanviet: "Đông Dương", meaning: "Phương Đông, châu Á", onkun: "On--On" },
  ],

  // Chapter 4
  k4_g1: [
    { kanji: "木材", kana: "もくざい", hanviet: "Mộc Tài", meaning: "Gỗ, vật liệu gỗ", onkun: "On--On" },
    { kanji: "木曜", kana: "もくよう", hanviet: "Mộc Diệu", meaning: "Thứ 5", onkun: "On--On" },
    { kanji: "植木", kana: "うえき", hanviet: "Thực Mộc", meaning: "Cây cảnh trồng chậu", onkun: "Kun--Kun" },
  ],
  k4_g2: [
    { kanji: "林業", kana: "りんぎょう", hanviet: "Lâm Nghiệp", meaning: "Ngành lâm nghiệp", onkun: "On--On" },
    { kanji: "山林", kana: "さんりん", hanviet: "Sơn Lâm", meaning: "Rừng núi", onkun: "On--On" },
  ],
  k4_g3: [
    { kanji: "森林浴", kana: "しんりんよく", hanviet: "Sâm Lâm Dục", meaning: "Tắm rừng", onkun: "On--On--On" },
  ],

  // Chapter 5
  k5_g1: [
    { kanji: "土", kana: "つち", hanviet: "Thổ", meaning: "Đất", onkun: "Kun" },
    { kanji: "土地", kana: "とち", hanviet: "Thổ Địa", meaning: "Đất đai, lô đất", onkun: "On--On" },
    { kanji: "土曜", kana: "どよう", hanviet: "Thổ Diệu", meaning: "Thứ bảy", onkun: "On--On" },
  ],
  k5_g4: [
    { kanji: "不安", kana: "ふあん", hanviet: "Bất An", meaning: "Bất an, lo lắng", onkun: "On--On" },
    { kanji: "不満", kana: "ふまん", hanviet: "Bất Mãn", meaning: "Bất mãn, không hài lòng", onkun: "On--On" },
    { kanji: "不足", kana: "ふそく", hanviet: "Bất Túc", meaning: "Thiếu hụt", onkun: "On--On" },
  ],
  k5_g5: [
    { kanji: "石炭", kana: "せきたん", hanviet: "Thạch Thán", meaning: "Than đá", onkun: "On--On" },
    { kanji: "宝石", kana: "ほうせき", hanviet: "Bảo Thạch", meaning: "Đá quý, trang sức", onkun: "On--On" },
  ],
  k5_g6: [
    { kanji: "右手", kana: "みぎて", hanviet: "Hữu Thủ", meaning: "Tay phải", onkun: "Kun--Kun" },
    { kanji: "右側", kana: "みぎがわ", hanviet: "Hữu Trắc", meaning: "Bên phải", onkun: "Kun--Kun" },
    { kanji: "右折", kana: "うせつ", hanviet: "Hữu Chiết", meaning: "Rẽ phải", onkun: "On--On" },
  ],
  k5_g7: [
    { kanji: "左手", kana: "ひだりて", hanviet: "Tả Thủ", meaning: "Tay trái", onkun: "Kun--Kun" },
    { kanji: "左側", kana: "ひだりがわ", hanviet: "Tả Trắc", meaning: "Bên trái", onkun: "Kun--Kun" },
  ],
  k5_g8: [
    { kanji: "友", kana: "とも", hanviet: "Hữu", meaning: "Bạn", onkun: "Kun" },
    { kanji: "友情", kana: "ゆうじょう", hanviet: "Hữu Tình", meaning: "Tình bạn", onkun: "On--On" },
    { kanji: "友人", kana: "ゆうじん", hanviet: "Hữu Nhân", meaning: "Bạn bè", onkun: "On--On" },
  ],
  k5_g9: [
    { kanji: "夕日", kana: "ゆうひ", hanviet: "Tịch Nhật", meaning: "Mặt trời lặn, nắng chiều", onkun: "Kun--Kun" },
    { kanji: "夕食", kana: "ゆうしょく", hanviet: "Tịch Thực", meaning: "Bữa tối", onkun: "Kun--On" },
    { kanji: "夕飯", kana: "ゆうはん", hanviet: "Tịch Phạn", meaning: "Bữa cơm tối", onkun: "Kun--On" },
  ],
  k5_g10: [
    { kanji: "親", kana: "おや", hanviet: "Thân", meaning: "Cha mẹ, bố mẹ", onkun: "Kun" },
    { kanji: "親切", kana: "しんせつ", hanviet: "Thân Thiết", meaning: "Tử tế, tốt bụng", onkun: "On--On" },
    { kanji: "親しい", kana: "したしい", hanviet: "Thân", meaning: "Thân thiết, gần gũi", onkun: "Kun" },
  ],
  k5_g11: [
    { kanji: "多様", kana: "たよう", hanviet: "Đa Dạng", meaning: "Đa dạng", onkun: "On--On" },
    { kanji: "多数", kana: "たすう", hanviet: "Đa Số", meaning: "Đa số", onkun: "On--On" },
  ],

  // Chapter 6
  k6_g3: [
    { kanji: "半", kana: "はん", hanviet: "Bán", meaning: "Nửa", onkun: "On" },
    { kanji: "半島", kana: "はんとう", hanviet: "Bán Đảo", meaning: "Bán đảo", onkun: "On--On" },
    { kanji: "前半", kana: "ぜんはん", hanviet: "Tiền Bán", meaning: "Nửa đầu, hiệp một", onkun: "On--On" },
  ],
  k6_g4: [
    { kanji: "米国", kana: "べいこく", hanviet: "Mễ Quốc", meaning: "Nước Mỹ", onkun: "On--On" },
    { kanji: "お米", kana: "おこめ", hanviet: "Mễ", meaning: "Gạo", onkun: "Kun" },
  ],
  k6_g8: [
    { kanji: "良く", kana: "よく", hanviet: "Lương", meaning: "Tốt, kỹ", onkun: "Kun" },
    { kanji: "良心", kana: "りょうしん", hanviet: "Lương Tâm", meaning: "Lương tâm", onkun: "On--On" },
    { kanji: "改良", kana: "かいりょう", hanviet: "Cải Lương", meaning: "Cải tiến, cải lương", onkun: "On--On" },
  ],
  k6_g10: [
    { kanji: "飲む", kana: "のむ", hanviet: "Ẩm", meaning: "Uống", onkun: "Kun" },
    { kanji: "飲料水", kana: "いんりょうすい", hanviet: "Ẩm Liệu Thủy", meaning: "Nước uống", onkun: "On--On--On" },
    { kanji: "飲み会", kana: "のみかい", hanviet: "Ẩm Hội", meaning: "Buổi tiệc rượu, liên hoan", onkun: "Kun--On" },
  ],

  // Chapter 7
  k7_g6: [
    { kanji: "古代", kana: "こだい", hanviet: "Cổ Đại", meaning: "Cổ đại", onkun: "On--On" },
    { kanji: "古典", kana: "こてん", hanviet: "Cổ Điển", meaning: "Cổ điển", onkun: "On--On" },
    { kanji: "中古", kana: "ちゅうこ", hanviet: "Trung Cổ", meaning: "Đồ cũ, hàng secondhand", onkun: "On--On" },
  ],
  k7_g9: [
    { kanji: "年", kana: "とし", hanviet: "Niên", meaning: "Năm, tuổi", onkun: "Kun" },
    { kanji: "年間", kana: "ねんかん", hanviet: "Niên Gian", meaning: "Hàng năm, trong vòng một năm", onkun: "On--On" },
    { kanji: "年中", kana: "ねんじゅう", hanviet: "Niên Trung", meaning: "Quanh năm, suốt năm", onkun: "On--On" },
  ],
  k7_g10: [
    { kanji: "午前", kana: "ごぜん", hanviet: "Ngọ Tiền", meaning: "Buổi sáng (AM)", onkun: "On--On" },
    { kanji: "正午", kana: "しょうご", hanviet: "Chính Ngọ", meaning: "Giữa trưa", onkun: "On--On" },
  ],
  k7_g11: [
    { kanji: "来年", kana: "らいねん", hanviet: "Lai Niên", meaning: "Năm sau", onkun: "On--On" },
    { kanji: "今年", kana: "ことし", hanviet: "Kim Niên", meaning: "Năm nay", onkun: "Ate" },
    { kanji: "毎年", kana: "まいとし", hanviet: "Mỗi Niên", meaning: "Hàng năm", onkun: "On--Kun" },
  ],
  k7_g15: [
    { kanji: "漢文", kana: "かんぶん", hanviet: "Hán Văn", meaning: "Văn cổ Trung Quốc, Hán văn", onkun: "On--On" },
    { kanji: "漢方", kana: "かんぽう", hanviet: "Hán Phương", meaning: "Đông y (thuốc Hán)", onkun: "On--On" },
  ],

  // Chapter 8
  k8_g5: [
    { kanji: "高い", kana: "たかい", hanviet: "Cao", meaning: "Cao, đắt", onkun: "Kun" },
    { kanji: "高校生", kana: "こうこうせい", hanviet: "Cao Hiệu Sinh", meaning: "Học sinh cấp 3", onkun: "On--On--On" },
    { kanji: "高速", kana: "こうそく", hanviet: "Cao Tốc", meaning: "Tốc độ cao, cao tốc", onkun: "On--On" },
  ],
  k8_g8: [
    { kanji: "海外", kana: "かいがい", hanviet: "Hải Ngoại", meaning: "Nước ngoài, hải ngoại", onkun: "On--On" },
    { kanji: "海水浴", kana: "かいすいよく", hanviet: "Hải Thủy Dục", meaning: "Tắm biển", onkun: "On--On--On" },
  ],
  k8_g9: [
    { kanji: "元", kana: "もと", hanviet: "Nguyên", meaning: "Gốc, nguồn gốc", onkun: "Kun" },
    { kanji: "元々", kana: "もともと", hanviet: "Nguyên Nguyên", meaning: "Vốn dĩ, ban đầu", onkun: "Kun--Kun" },
    { kanji: "元日", kana: "がんじつ", hanviet: "Nguyên Nhật", meaning: "Ngày mùng một Tết", onkun: "On--On" },
  ],
  k8_g10: [
    { kanji: "お兄さん", kana: "おにいさん", hanviet: "Huynh", meaning: "Anh trai (người khác)", onkun: "Kun" },
    { kanji: "兄貴", kana: "あにき", hanviet: "Huynh Quý", meaning: "Anh trai (thân mật)", onkun: "Kun--On" },
  ],
  k8_g11: [
    { kanji: "先", kana: "さき", hanviet: "Tiên", meaning: "Trước, phía trước, điểm đến", onkun: "Kun" },
    { kanji: "先週", kana: "せんしゅう", hanviet: "Tiên Chu", meaning: "Tuần trước", onkun: "On--On" },
    { kanji: "先月", kana: "せんげつ", hanviet: "Tiên Nguyệt", meaning: "Tháng trước", onkun: "On--On" },
  ],
  k8_g12: [
    { kanji: "光る", kana: "ひかる", hanviet: "Quang", meaning: "Tỏa sáng, lấp lánh", onkun: "Kun" },
    { kanji: "光線", kana: "こうせん", hanviet: "Quang Tuyến", meaning: "Tia sáng", onkun: "On--On" },
    { kanji: "観光", kana: "かんこう", hanviet: "Quan Quang", meaning: "Du lịch, tham quan", onkun: "On--On" },
  ],

  // Chapter 9
  k9_g3: [
    { kanji: "暗記", kana: "あんき", hanviet: "Ám Ký", meaning: "Học thuộc lòng", onkun: "On--On" },
    { kanji: "真っ暗", kana: "まっくら", hanviet: "Ám", meaning: "Tối om", onkun: "Ate" },
    { kanji: "暗号", kana: "あんごう", hanviet: "Ám Hiệu", meaning: "Mật mã", onkun: "On--On" },
  ],
  k9_g6: [
    { kanji: "耳鼻科", kana: "じびか", hanviet: "Nhĩ Tị Khoa", meaning: "Khoa tai mũi họng", onkun: "On--On--On" },
  ],
  k9_g7: [
    { kanji: "門", kana: "もん", hanviet: "Môn", meaning: "Cổng", onkun: "On" },
    { kanji: "校門", kana: "こうもん", hanviet: "Hiệu Môn", meaning: "Cổng trường", onkun: "On--On" },
  ],
  k9_g8: [
    { kanji: "聞く", kana: "きく", hanviet: "Văn", meaning: "Nghe, hỏi", onkun: "Kun" },
    { kanji: "聞き取り", kana: "ききとり", hanviet: "Văn Thủ", meaning: "Nghe hiểu, khả năng nghe", onkun: "Kun--Kun" },
  ],
  k9_g12: [
    { kanji: "軽食", kana: "けいしょく", hanviet: "Khinh Thực", meaning: "Đồ ăn nhẹ", onkun: "On--On" },
    { kanji: "軽々と", kana: "かるがると", hanviet: "Khinh Khinh", meaning: "Nhẹ nhàng, dễ dàng", onkun: "Kun--Kun" },
  ],
  k9_g13: [
    { kanji: "重要", kana: "じゅうよう", hanviet: "Trọng Yếu", meaning: "Quan trọng", onkun: "On--On" },
    { kanji: "体重", kana: "たいじゅう", hanviet: "Thể Trọng", meaning: "Cân nặng cơ thể", onkun: "On--On" },
  ],

  // Chapter 10
  k10_g1: [
    { kanji: "寺", kana: "てら", hanviet: "Tự", meaning: "Ngôi chùa", onkun: "Kun" },
    { kanji: "寺院", kana: "じいん", hanviet: "Tự Viện", meaning: "Chùa chiền, tự viện", onkun: "On--On" },
  ],
  k10_g3: [
    { kanji: "待つ", kana: "まつ", hanviet: "Đãi", meaning: "Chờ đợi", onkun: "Kun" },
    { kanji: "待ち合わせ", kana: "まちあわせ", hanviet: "Đãi Hợp", meaning: "Hẹn gặp", onkun: "Kun--Kun" },
  ],
  k10_g5: [
    { kanji: "荷", kana: "に", hanviet: "Hà", meaning: "Hành lý, gánh nặng", onkun: "Kun" },
    { kanji: "出荷", kana: "しゅっか", hanviet: "Xuất Hà", meaning: "Xuất hàng, giao hàng", onkun: "On--On" },
  ],
  k10_g6: [
    { kanji: "歌手", kana: "かしゅ", hanviet: "Ca Thủ", meaning: "Ca sĩ", onkun: "On--On" },
    { kanji: "歌詞", kana: "かし", hanviet: "Ca Từ", meaning: "Lời bài hát", onkun: "On--On" },
  ],
  k10_g10: [
    { kanji: "買い物", kana: "かいもの", hanviet: "Mãi Vật", meaning: "Mua sắm", onkun: "Kun--Kun" },
    { kanji: "買う", kana: "かう", hanviet: "Mãi", meaning: "Mua", onkun: "Kun" },
  ],
  k10_g11: [
    { kanji: "具体的", kana: "ぐたいてき", hanviet: "Cụ Thể Đích", meaning: "Cụ thể", onkun: "On--On--On" },
    { kanji: "家具", kana: "かぐ", hanviet: "Gia Cụ", meaning: "Đồ nội thất", onkun: "On--On" },
  ],

  // Chapter 11
  k11_g3: [
    { kanji: "内科", kana: "ないか", hanviet: "Nội Khoa", meaning: "Khoa nội", onkun: "On--On" },
    { kanji: "案内", kana: "あんない", hanviet: "Án Nội", meaning: "Hướng dẫn", onkun: "On--On" },
  ],
  k11_g4: [
    { kanji: "肉", kana: "にく", hanviet: "Nhục", meaning: "Thịt", onkun: "On" },
    { kanji: "牛肉", kana: "ぎゅうにく", hanviet: "Ngưu Nhục", meaning: "Thịt bò", onkun: "On--On" },
    { kanji: "焼肉", kana: "やきにく", hanviet: "Nhục", meaning: "Thịt nướng", onkun: "Kun--On" },
  ],
  k11_g5: [
    { kanji: "山登り", kana: "やまのぼり", hanviet: "Sơn", meaning: "Leo núi", onkun: "Kun--Kun" },
    { kanji: "火山", kana: "かざん", hanviet: "Hỏa Sơn", meaning: "Núi lửa", onkun: "On--On" },
  ],
  k11_g7: [
    { kanji: "言葉", kana: "ことば", hanviet: "Ngôn Diệp", meaning: "Từ ngữ, ngôn ngữ", onkun: "Kun--Kun" },
    { kanji: "言語", kana: "げんご", hanviet: "Ngôn Ngữ", meaning: "Ngôn ngữ", onkun: "On--On" },
  ],
  k11_g9: [
    { kanji: "英会話", kana: "えいかいわ", hanviet: "Anh Hội Thoại", meaning: "Hội thoại tiếng Anh", onkun: "On--On--On" },
    { kanji: "英国", kana: "えいこく", hanviet: "Anh Quốc", meaning: "Nước Anh", onkun: "On--On" },
  ],

  // Chapter 12
  k12_g1: [
    { kanji: "田舎", kana: "いなか", hanviet: "Điền Xá", meaning: "Nông thôn, quê", onkun: "Ate" },
    { kanji: "水田", kana: "すいでん", hanviet: "Thủy Điền", meaning: "Ruộng nước", onkun: "On--On" },
  ],
  k12_g3: [
    { kanji: "町長", kana: "ちょうちょう", hanviet: "Đinh Trưởng", meaning: "Thị trưởng, trưởng thị trấn", onkun: "On--On" },
    { kanji: "下町", kana: "したまち", hanviet: "Hạ Đinh", meaning: "Phố cổ, khu bình dân", onkun: "Kun--Kun" },
  ],
  k12_g4: [
    { kanji: "魚屋", kana: "さかなや", hanviet: "Ngư", meaning: "Tiệm cá, người bán cá", onkun: "Kun--Kun" },
    { kanji: "金魚", kana: "きんぎょ", hanviet: "Kim Ngư", meaning: "Cá vàng", onkun: "On--On" },
  ],
  k12_g6: [
    { kanji: "好み", kana: "このみ", hanviet: "Hảo", meaning: "Sở thích, khẩu vị", onkun: "Kun" },
    { kanji: "好奇心", kana: "こうきしん", hanviet: "Hảo Kỳ Tâm", meaning: "Tính tò mò", onkun: "On--On--On" },
  ],
  k12_g7: [
    { kanji: "安易", kana: "あんい", hanviet: "An Dị", meaning: "Dễ dàng, hời hợt", onkun: "On--On" },
    { kanji: "目安", kana: "めやす", hanviet: "Mục An", meaning: "Chuẩn mực, ước chừng", onkun: "Kun--Kun" },
  ],
  k12_g8: [
    { kanji: "大きい", kana: "おおきい", hanviet: "Đại", meaning: "To, lớn", onkun: "Kun" },
    { kanji: "大学", kana: "だいがく", hanviet: "Đại Học", meaning: "Đại học", onkun: "On--On" },
    { kanji: "大切", kana: "たいせつ", hanviet: "Đại Thiết", meaning: "Quan trọng", onkun: "On--On" },
  ],
  k12_g9: [
    { kanji: "安定", kana: "あんてい", hanviet: "An Định", meaning: "Ổn định", onkun: "On--On" },
    { kanji: "安静", kana: "あんせい", hanviet: "An Tĩnh", meaning: "Nghỉ ngơi yên tĩnh", onkun: "On--On" },
  ],
  k12_g10: [
    { kanji: "売る", kana: "うる", hanviet: "Mại", meaning: "Bán", onkun: "Kun" },
    { kanji: "商売", kana: "しょうばい", hanviet: "Thương Mại", meaning: "Buôn bán, kinh doanh", onkun: "On--On" },
  ],
  k12_g11: [
    { kanji: "読む", kana: "よむ", hanviet: "Đọc", meaning: "Đọc", onkun: "Kun" },
    { kanji: "読書", kana: "どくしょ", hanviet: "Độc Thư", meaning: "Đọc sách", onkun: "On--On" },
  ],
  k12_g12: [
    { kanji: "売店", kana: "ばいてん", hanviet: "Mại Điếm", meaning: "Quầy bán hàng, kiosk", onkun: "On--On" },
    { kanji: "売買", kana: "ばいばい", hanviet: "Mại Mại", meaning: "Mua bán", onkun: "On--On" },
  ],
  k12_g13: [
    { kanji: "読者", kana: "どくしゃ", hanviet: "Độc Giả", meaning: "Độc giả", onkun: "On--On" },
    { kanji: "音読", kana: "おんどく", hanviet: "Âm Độc", meaning: "Đọc thành tiếng", onkun: "On--On" },
  ],

  // Chapter 13
  k13_g1: [
    { kanji: "世紀", kana: "せいき", hanviet: "Thế Kỷ", meaning: "Thế kỷ", onkun: "On--On" },
    { kanji: "世話", kana: "せわ", hanviet: "Thế Thoại", meaning: "Sự chăm sóc", onkun: "On--On" },
    { kanji: "出世", kana: "しゅっせ", hanviet: "Xuất Thế", meaning: "Thăng tiến, thành đạt", onkun: "On--On" },
  ],
  k13_g2: [
    { kanji: "電話", kana: "でんわ", hanviet: "Điện Thoại", meaning: "Điện thoại", onkun: "On--On" },
    { kanji: "電車", kana: "でんしゃ", hanviet: "Điện Xa", meaning: "Tàu điện", onkun: "On--On" },
    { kanji: "電気", kana: "でんき", hanviet: "Điện Khí", meaning: "Điện", onkun: "On--On" },
  ],
  k13_g3: [
    { kanji: "東部", kana: "とうぶ", hanviet: "Đông Bộ", meaning: "Miền Đông", onkun: "On--On" },
    { kanji: "東洋", kana: "とうよう", hanviet: "Đông Dương", meaning: "Phương Đông, châu Á", onkun: "On--On" },
  ],
  k13_g4: [
    { kanji: "映る", kana: "うつる", hanviet: "Ảnh", meaning: "Được phản chiếu, chiếu lên", onkun: "Kun" },
    { kanji: "映画館", kana: "えいがかん", hanviet: "Ảnh Họa Quán", meaning: "Rạp chiếu phim", onkun: "On--On--On" },
  ],
  k13_g5: [
    { kanji: "北海道", kana: "ほっかいどう", hanviet: "Bắc Hải Đạo", meaning: "Hokkaido", onkun: "On--On--On" },
    { kanji: "北極", kana: "ほっきょく", hanviet: "Bắc Cực", meaning: "Bắc Cực", onkun: "On--On" },
  ],
  k13_g6: [
    { kanji: "花火", kana: "はなび", hanviet: "Hoa Hỏa", meaning: "Pháo hoa", onkun: "Kun--Kun" },
    { kanji: "花瓶", kana: "かびん", hanviet: "Hoa Bình", meaning: "Bình hoa", onkun: "On--On" },
  ],
  k13_g8: [
    { kanji: "草原", kana: "そうげん", hanviet: "Thảo Nguyên", meaning: "Đồng cỏ, thảo nguyên", onkun: "On--On" },
    { kanji: "草花", kana: "くさばな", hanviet: "Thảo Hoa", meaning: "Hoa cỏ", onkun: "Kun--Kun" },
  ],
  k13_g9: [
    { kanji: "西洋", kana: "せいよう", hanviet: "Tây Dương", meaning: "Phương Tây", onkun: "On--On" },
    { kanji: "西部", kana: "せいぶ", hanviet: "Tây Bộ", meaning: "Miền Tây", onkun: "On--On" },
  ],
  k13_g10: [
    { kanji: "酒場", kana: "さかば", hanviet: "Tửu Trường", meaning: "Quán rượu", onkun: "Kun--Kun" },
    { kanji: "居酒屋", kana: "いざかや", hanviet: "Cư Tửu Ốc", meaning: "Quán nhậu kiểu Nhật", onkun: "Kun--Kun--Kun" },
  ],
  k13_g11: [
    { kanji: "書く", kana: "かく", hanviet: "Thư", meaning: "Viết", onkun: "Kun" },
    { kanji: "書類", kana: "しょるい", hanviet: "Thư Loại", meaning: "Tài liệu, giấy tờ", onkun: "On--On" },
  ],
  k13_g12: [
    { kanji: "梅", kana: "うめ", hanviet: "Mai", meaning: "Quả mơ Nhật", onkun: "Kun" },
    { kanji: "梅干し", kana: "うめぼし", hanviet: "Mai Can", meaning: "Mơ muối", onkun: "Kun--Kun" },
  ],
  k13_g13: [
    { kanji: "書店", kana: "しょてん", hanviet: "Thư Điếm", meaning: "Hiệu sách", onkun: "On--On" },
    { kanji: "教科書", kana: "きょうかしょ", hanviet: "Giáo Khoa Thư", meaning: "Sách giáo khoa", onkun: "On--On--On" },
  ],
  k13_g14: [
    { kanji: "川岸", kana: "かわぎし", hanviet: "Xuyên Ngạn", meaning: "Bờ sông", onkun: "Kun--Kun" },
    { kanji: "小川", kana: "おがわ", hanviet: "Tiểu Xuyên", meaning: "Con suối, sông nhỏ", onkun: "Kun--Kun" },
  ],
  k13_g15: [
    { kanji: "南極", kana: "なんきょく", hanviet: "Nam Cực", meaning: "Nam Cực", onkun: "On--On" },
    { kanji: "南米", kana: "なんべい", hanviet: "Nam Mễ", meaning: "Nam Mỹ", onkun: "On--On" },
  ],

  // Chapter 14
  k14_g1: [
    { kanji: "方", kana: "かた", hanviet: "Phương", meaning: "Người (kính ngữ), cách thức", onkun: "Kun" },
    { kanji: "方向", kana: "ほうこう", hanviet: "Phương Hướng", meaning: "Phương hướng", onkun: "On--On" },
  ],
  k14_g3: [
    { kanji: "家", kana: "いえ", hanviet: "Gia", meaning: "Nhà, ngôi nhà", onkun: "Kun" },
    { kanji: "家庭", kana: "かてい", hanviet: "Gia Đình", meaning: "Gia đình", onkun: "On--On" },
    { kanji: "作家", kana: "さっか", hanviet: "Tác Gia", meaning: "Nhà văn, tác giả", onkun: "On--On" },
  ],
  k14_g6: [
    { kanji: "気", kana: "き", hanviet: "Khí", meaning: "Tinh thần, khí", onkun: "On" },
    { kanji: "天気", kana: "てんき", hanviet: "Thiên Khí", meaning: "Thời tiết", onkun: "On--On" },
    { kanji: "元気", kana: "げんき", hanviet: "Nguyên Khí", meaning: "Khỏe mạnh", onkun: "On--On" },
  ],
  k14_g7: [
    { kanji: "同時に", kana: "どうじに", hanviet: "Đồng Thời", meaning: "Đồng thời", onkun: "On--On" },
    { kanji: "同僚", kana: "どうりょう", hanviet: "Đồng Liêu", meaning: "Đồng nghiệp", onkun: "On--On" },
  ],
  k14_g8: [
    { kanji: "病人", kana: "びょうにん", hanviet: "Bệnh Nhân", meaning: "Người bệnh", onkun: "On--On" },
    { kanji: "病状", kana: "びょうじょう", hanviet: "Bệnh Trạng", meaning: "Tình trạng bệnh", onkun: "On--On" },
  ],
  k14_g9: [
    { kanji: "後で", kana: "あとで", hanviet: "Hậu", meaning: "Sau này, lát nữa", onkun: "Kun" },
    { kanji: "最後", kana: "さいご", hanviet: "Tối Hậu", meaning: "Cuối cùng", onkun: "On--On" },
  ],
  k14_g10: [
    { kanji: "足りる", kana: "たりる", hanviet: "Túc", meaning: "Đủ, đầy đủ", onkun: "Kun" },
    { kanji: "満足", kana: "まんぞく", hanviet: "Mãn Túc", meaning: "Mãn nguyện, hài lòng", onkun: "On--On" },
  ],
  k14_g11: [
    { kanji: "高価", kana: "こうか", hanviet: "Cao Giá", meaning: "Đắt tiền, giá cao", onkun: "On--On" },
    { kanji: "高める", kana: "たかめる", hanviet: "Cao", meaning: "Nâng cao", onkun: "Kun" },
  ],
}
