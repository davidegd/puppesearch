const express = require("express");
const app = express();
const Controller = require("./apiController");
const path = require("path");

const PORT = process.env.PORT || 4000;
app.get("/api/search", Controller.Search);

// app.get("/*", function (req, res) {
//   res.sendFile(path.resolve(__dirname, "../build", "index.html"));
// });

// app.get("*", function (_, res) {
//   res.sendFile(path.join(__dirname, "../build/index.html"), function (err) {
//     if (err) {
//       res.status(500).send(err);
//     }
//   });
// });

// app.use(express.static(path.join(__dirname, "../build")));

app.listen(PORT, () => {
  console.log("server runing on ", PORT);
});

module.exports = app;
