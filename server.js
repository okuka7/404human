const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ images 같은 정적 파일 서빙 (중요)
app.use(express.static(path.join(__dirname)));

// ✅ SPA 라우팅(새로고침해도 페이지 유지)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
