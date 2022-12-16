const express = require("express");
const app = express();
const Controller = require("./apiController");
const path = require("path");

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

app.listen(4000, () => {
  console.log("server runing on 4000");
});

module.exports = app;
