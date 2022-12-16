import puppeteer from "puppeteer";

// https://hackernoon.com/tips-and-tricks-for-web-scraping-with-puppeteer-ed391a63d952
// Dont download all resources, we just need the HTML
// Also, this is huge performance/response time boost
const blockedResourceTypes = [
  "image",
  "media",
  "font",
  "texttrack",
  "object",
  "beacon",
  "csp_report",
  "imageset",
];

const skippedResources = [
  "quantserve",
  "adzerk",
  "doubleclick",
  "adition",
  "exelator",
  "sharethrough",
  "cdn.api.twitter",
  "google-analytics",
  "googletagmanager",
  "google",
  "fontawesome",
  "facebook",
  "analytics",
  "optimizely",
  "clicktale",
  "mixpanel",
  "zedo",
  "clicksor",
  "tiqcdn",
];

/**
 * https://developers.google.com/web/tools/puppeteer/articles/ssr#reuseinstance
 * @param {string} url URL to prerender.
 * @param {string} browserWSEndpoint Optional remote debugging URL. If
 *     provided, Puppeteer's reconnects to the browser instance. Otherwise,
 *     a new browser instance is launched.
 *
 *
 */

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
export async function ssr(param, browserWSEndpoint) {
  try {
    // const browser = await puppeteer.connect({
    //   browserWSEndpoint,
    //   ignoreHTTPSErrors: true,
    // });
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const url = "https://www.musiciansfriend.com/";
    const page = await browser.newPage();
    // await page.setRequestInterception(true);

    // page.on("request", (request) => {
    //   const requestUrl = request._url.split("?")[0].split("#")[0];
    //   if (
    //     blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
    //     skippedResources.some((resource) => requestUrl.indexOf(resource) !== -1)
    //   ) {
    //     request.abort();
    //   } else {
    //     request.continue();
    //   }
    // });

    const response = await page.goto(url, {
      timeout: 50000,
      waitUntil: "networkidle2",
    });

    await page.type("#searchTerm", param);
    await page.click("#searchSubmit");
    await page.waitForSelector(".plp-results-grid");
    // Inject <base> on page to relative resources load properly.
    // await page.evaluate((url) => {
    // 	const base = document.createElement("base");
    // 	base.href = url;
    // 	// Add to top of head, before all other resources.
    // 	document.head.prepend(base);
    // }, url);

    // await page.evaluate(() => {
    // 	const elements = document.querySelectorAll(
    // 		'script, link[rel="import"]'
    // 	);
    // 	elements.forEach((e) => e.remove());
    // });

    try {
      const products = await page.evaluate(() => {
        const elements = document.querySelectorAll(".product-card");
        const links = [];
        for (let index = 0; index < elements.length; index++) {
          if (elements[index])
            links.push({
              title:
                elements[index].querySelector(".product-card-title a")
                  .innerText || "",
              price:
                elements[index].querySelector(".product-card-price .sale-price")
                  .innerText || "",
              img:
                elements[index].querySelector(".product-card-image a img")
                  .src || "",
            });
        }

        return links;
      });

      const transformedData = transformData(products);

      return { products: transformedData, status: response.status() };
    } catch (error) {
      console.warn(error);
    } finally {
      await page.close();
      await browser.close();
    }
  } catch (e) {
    console.warn(e.message);
    return { status: 500 };
  }
}
