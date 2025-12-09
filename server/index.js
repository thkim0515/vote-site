const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { db } = require("./firebase");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

/* --------------------------
   1) Firestore: 투표 생성
--------------------------- */
app.post("/api/saveVote", async (req, res) => {
  try {
    const newVote = {
      ...req.body,
      results: { dates: {}, menus: {} }, // 기본 구조 보장
    };

    const docRef = await db.collection("votes").add(newVote);

    res.status(200).json({
      message: "저장 완료",
      id: docRef.id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "서버 에러" });
  }
});


/* --------------------------
   2) Firestore: 투표 결과 반영
--------------------------- */
app.post("/api/vote", async (req, res) => {
  const { id, dates, menu, voterId } = req.body;

  try {
    const ref = db.collection("votes").doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ error: "투표 없음" });
    }

    const vote = snap.data();
    const results = vote.results || { dates: {}, menus: {} };
    const voters = vote.voters || {};

    // 중복 투표 확인
    if (voters[voterId]) {
      return res.status(400).json({ error: "이미 투표한 사용자" });
    }

    // 날짜 반영
    if (Array.isArray(dates)) {
      dates.forEach((d) => {
        results.dates[d] = (results.dates[d] || 0) + 1;
      });
    }

    // 메뉴 반영
    if (menu) {
      results.menus[menu] = (results.menus[menu] || 0) + 1;
    }

    // voter 기록
    voters[voterId] = true;

    await ref.update({ results, voters });

    res.status(200).json({ message: "투표 성공" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "서버 에러" });
  }
});




/* --------------------------
   3) Firestore: 전체 목록 조회
--------------------------- */
app.get("/api/getVotes", async (req, res) => {
  try {
    const snap = await db.collection("votes").get();

    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(list);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "서버 에러" });
  }
});


/* --------------------------
   서버 실행
--------------------------- */
// app.listen(PORT, () => {
//   console.log(`Express 서버 실행 중: http://localhost:${PORT}`);
// });
app.listen(4000, "0.0.0.0", () => {
  console.log("Server open on all network interfaces");
});
