import * as fs from "fs";
import path from "path";

const URL =
  "https://www.idealista.com/venta-viviendas/cordoba/centro-casco-historico/centro/";

import playwright from "playwright";

const crawler = async url => {
  const browser = await playwright.chromium.launch({
    headless: false,
  });
  const __dirname = path.resolve("src");
  const page = await browser.newPage();
  await page.goto(url);
  const amountOfPropsString = await page.innerHTML("#h1-container");
  //get number from string
  const currentProps = amountOfPropsString.match(/\d+/g).map(Number);

  // get data from saved file
  const data = fs.readFileSync(path.resolve(__dirname, "data.json"), "utf8");
  const parsedData = JSON.parse(data);
  const previousProps = parsedData.amountOfProps;

  console.log(amountOfPropsString, previousProps);

  if (previousProps < currentProps) {
    // send telegram message with link
    const link = request.loadedUrl;
  } else {
    fs.writeFileSync(path.resolve(__dirname, "data.json"), JSON.stringify({ amountOfProps: currentProps }));
  }

  await page.close();
};

const login = async () => {
  await page.fill('input[name="login"]', "MyUsername");
  await page.fill('input[name="password"]', "Secrectpass");
  await page.click('input[type="submit"]');
};

const main = async () => {
  // Add first URL to the queue and start the crawl.
  await crawler(URL);
};

try {
  main();
} catch (e) {
  throw Error(e);
}
