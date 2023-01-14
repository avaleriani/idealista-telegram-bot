import * as fs from "fs";
import path from "path";
import "dotenv/config";
import Bot from "./services/bot.js";

const URL =
  "https://www.idealista.com/areas/alquiler-viviendas/con-precio-hasta_950,de-un-dormitorio,de-dos-dormitorios,de-tres-dormitorios,de-cuatro-cinco-habitaciones-o-mas,ultimas-plantas,plantas-intermedias/?shape=%28%28wgm%7EExgoZsMgB%7DNoFoNaGiF%7CD%7DNr%40eMoM%7DQiCkLwQiFaGwFhBcZwI%7BKcOoQiKeDaVeJgQi_%40%7DSvCst%40yw%40c%7C%40_d%40qp%40%7DxAyo%40y%5EjKyLjq%40ka%40lEkX_UkUgC%7DW_UuSyv%40dAyJjXa%7B%40hkEhjB%7CkEz%7EBhgDhsEuMjZ%29%29&ordenado-por=fecha-publicacion-desc";

import { PlaywrightCrawler } from "crawlee";

const crawler = new PlaywrightCrawler({
  launchContext: {
    // Here you can set options that are passed to the playwright .launch() function.
    launchOptions: {
      headless: true,
    },
  },

  // Stop crawling after several pages
  maxRequestsPerCrawl: 1,
  maxConcurrency: 1,


  async requestHandler({ request, page, enqueueLinks, log }) {
    log.info(`Processing ${request.url}...`);
    const bot = await Bot();

    // A function to be evaluated by Playwright within the browser context.
    const __dirname = path.resolve("src");
    const amountOfPropsString = await page.innerHTML("#h1-container");
    //get number from string
    const currentProps = amountOfPropsString.match(/\d+/g).map(Number)[0];

    // get data from saved file
    const data = fs.readFileSync(path.resolve(__dirname, "data.json"), "utf8");
    const parsedData = JSON.parse(data);
    const previousProps = parsedData.amountOfProps;

    console.log(previousProps, currentProps);

    if (previousProps < currentProps) {
      // send telegram message with link
      const link = request.loadedUrl;
      await bot.telegram.sendMessage(process.env.CHAT_ID, `New properties available: ${link}`);
    }

    fs.writeFileSync(
      path.resolve(__dirname, "data.json"),
      JSON.stringify({
        amountOfProps: currentProps,
      }),
    );
  },

  // This function is called if the page processing failed more than maxRequestRetries+1 times.
  failedRequestHandler({ request, log }) {
    log.info(`Request ${request.url} failed too many times.`);
  },
});

await crawler.addRequests([URL]);

const main = async () => {
  await crawler.run();
};

try {
  main();
} catch (e) {
  throw Error(e);
}
