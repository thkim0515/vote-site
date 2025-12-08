const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const voteFilePath = path.join(__dirname, "..", "public", "data", "vote.json");

app.post("/api/saveVote", (req, res) => {
  const newVote = req.body;

  try {
    const fileData = fs.existsSync(voteFilePath)
      ? JSON.parse(fs.readFileSync(voteFilePath, "utf-8"))
      : [];

    fileData.push(newVote);

    fs.writeFileSync(voteFilePath, JSON.stringify(fileData, null, 2), "utf-8");

    res.status(200).json({ message: "저장 완료" });
  } catch (err) {
    console.error("저장 실패:", err);
    res.status(500).json({ error: "서버 에러" });
  }
});

app.post("/api/vote", (req, res) => {
  const { id, dates, menu } = req.body;

  try {
    const data = JSON.parse(fs.readFileSync(voteFilePath, "utf-8"));
    const vote = data.find((v) => String(v.id) === String(id));

    if (!vote) {
      return res.status(404).json({ error: "투표 없음" });
    }

    if (!vote.results || typeof vote.results !== "object") {
      vote.results = { dates: {}, menus: {} };
    } else {
      vote.results.dates = vote.results.dates || {};
      vote.results.menus = vote.results.menus || {};
    }

    if (Array.isArray(dates)) {
      dates.forEach((d) => {
        vote.results.dates[d] = (vote.results.dates[d] || 0) + 1;
      });
    }

    if (menu) {
      vote.results.menus[menu] = (vote.results.menus[menu] || 0) + 1;
    }

    fs.writeFileSync(voteFilePath, JSON.stringify(data, null, 2), "utf-8");

    res.status(200).json({ message: "투표 성공" });
  } catch (err) {
    console.error("투표 실패:", err);
    res.status(500).json({ error: "서버 에러" });
  }
});


app.get("/api/getVotes", (req, res) => {
  try {
    const data = fs.readFileSync(voteFilePath, "utf-8");
    res.status(200).json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "읽기 실패" });
  }
});

app.listen(PORT, () => {
  console.log(`Express 서버 실행 중: http://localhost:${PORT}`);
});
