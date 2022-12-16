const express = require("express");
const app = express();
const Controller = require("./apiController");
const path = require("path");
const puppeteer = require("puppeteer");

const PORT = process.env.PORT || 4000;
app.get("/api/search", Controller.Search);

app.get("/sc", async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  console.log(req.query);
  await page.goto(req.query.url); // URL is given by the "user" (your client-side application)
  const screenshotBuffer = await page.screenshot();

  // Respond with the image
  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": screenshotBuffer.length,
  });
  res.end(screenshotBuffer);

  await browser.close();
});

app.listen(PORT, () => {
  console.log("server runing on ", PORT);
});

module.exports = app;
