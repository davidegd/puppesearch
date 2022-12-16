const Services = {};

const puppeteer = require("puppeteer-core");
const { executablePath } = require("puppeteer");

const transformData = (data) => {
  const prices = data.map((e) => {
    return {
      ...e,
      price: Number(
        Number(e.price.substr(1, e.price.length)) +
          (Number(e.price.substr(1, e.price.length)) + 20) * 0.08 +
          Number(e.price.substr(1, e.price.length)) * 0.4
      ).toFixed(2),
    };
  });
  const used = prices
    .filter(({ title }) => title.includes("Used"))
    .sort((a, b) => Number(a.price) - Number(b.price));
  const news = prices.filter(({ title }) => !title.includes("Used"));

  return [used[0], news[0]];
};

Services.Search = (params) =>
  new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        executablePath: executablePath(),
      });

      const page = await browser.newPage();
      await page.goto("https://www.musiciansfriend.com/");
      await page.type("#searchTerm", params);
      await page.click("#searchSubmit");
      await page.waitForSelector(".plp-results-grid");

      setTimeout(async () => {
        try {
          const products = await page.evaluate(() => {
            const elements = document.querySelectorAll(".product-card");
            const links = [];
            for (let index = 0; index < elements.length; index++) {
              links.push({
                title: elements[index].querySelector(".product-card-title a")
                  .innerText,
                price: elements[index].querySelector(
                  ".product-card-price .sale-price"
                ).innerText,
                img: elements[index].querySelector(".product-card-image a img")
                  .src,
              });
            }

            return links;
          });
          await browser.close();

          const transformedData = transformData(products);

          return resolve({ data: transformedData, status: 200 });
        } catch (error) {
          console.error(error);
        }
      }, 400);
    } catch (error) {
      console.log(error);
      return reject(error);
    }
  });
module.exports = Services;
