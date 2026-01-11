const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 정적 파일 먼저 서빙 (images, css, js, json 등)
app.use(express.static(path.join(__dirname), { extensions: ["html"] }));

// ✅ "진짜 파일 요청(확장자 포함)"은 index로 보내지 말고 404로 끝내기
app.get("*", (req, res) => {
  // /something.jpg /something.json /something.css 같은 요청이면 여기서 끝
  if (path.extname(req.path)) {
    return res.status(404).end();
  }

  // 그 외는 SPA/페이지 라우팅으로 index.html 제공
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log("running on", PORT));
