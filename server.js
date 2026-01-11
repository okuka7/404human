const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 정적파일 먼저 서빙 (중요)
app.use(express.static(__dirname));

// ✅ 파일 확장자가 있는 요청(.jpg/.png/.css/.js/.json)은 index로 보내지 말기
app.get("*", (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).end(); // 파일이 없으면 그냥 404
  }
  return res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => res.send("ok"));

app.listen(PORT, () => console.log("running:", PORT));
