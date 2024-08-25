console.log("give me some sweet scrapes");

import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import puppeteer, { Browser, Page } from "puppeteer";

const token = process.env.TELEGRAM_TOKEN as string;
const chatId = process.env.TELEGRAM_CHAT_ID as string;

const bot = new TelegramBot(token);

//sendMessage("We rollin!");
const sendMessage = async (message: string) => {
  try {
    await bot.sendMessage(chatId, message);
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// agree with terms&conditions
const agreeWithTermsandConditions = async (page: Page) => {
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  console.log("Button clicked successfully.");
};

//

async function extractAndLogArticles(page: Page) {
  // Define the XPath for the articles using Puppeteer's built-in XPath selector
  const XpS =
    "::-p-xpath(//html/body/div[2]/div[1]/div[2]/div[3]/div[3]/div/div/div/div/div[3]/div/div/div/div/span/h2/a)";

  // Wait for the article elements to be present in the DOM
  await page.waitForSelector(XpS);

  // Extract the title and link of the articles
  const SrealityArticles = await page.evaluate((XpS) => {
    const xpathResult = document.evaluate(
      "//html/body/div[2]/div[1]/div[2]/div[3]/div[3]/div/div/div/div/div[3]/div/div/div/div/span/h2/a",
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null,
    );
    const articleData: { title: string; link: string }[] = [];
    for (let i = 0; i < xpathResult.snapshotLength; i++) {
      const item = xpathResult.snapshotItem(i) as HTMLAnchorElement;
      articleData.push({
        title: item.textContent?.trim() || "",
        link: item.href,
      });
    }
    return articleData;
  }, XpS);

  // Log the array of articles with titles and links
  console.log("Array of Articles:", SrealityArticles);
}

async function extractIDnesArticles(page: Page) {
  // Define the XPath for the articles using Puppeteer's built-in XPath selector
  const XpId = "::-p-xpath(//*/article/div/a/div/h2)";

  // Wait for the article elements to be present in the DOM
  await page.waitForSelector(XpId);

  // Extract the title and link of the articles
  const idnesArticles = await page.evaluate((XpId) => {
    const xpathResult = document.evaluate(
      "//*/article/div/a",
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null,
    );
    const articleData: { title: string; link: string }[] = [];
    for (let i = 0; i < xpathResult.snapshotLength; i++) {
      const item = xpathResult.snapshotItem(i) as HTMLAnchorElement;
      const titleElement = item.querySelector("div > h2") as HTMLElement;
      articleData.push({
        title: titleElement?.textContent?.trim() || "",
        link: item.href,
      });
    }
    return articleData;
  }, XpId);

  // Log the array of articles with titles and links
  console.log("Array of Articles from Idnes:", idnesArticles);
}

// scrape data
const scrapeNewOffers = async () => {
  const sreality =
    "https://www.sreality.cz/hledani/pronajem/byty/brno?velikost=3%20kk,4%20kk,4%201,5%20kk&stari=mesic&cena-od=0&cena-do=40000";
  try {
    const browser: Browser = await puppeteer.launch({
  TODO change
      // change to true in prod !!
      headless: false,
      defaultViewport: null,
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1950, height: 1591, deviceScaleFactor: 1 });
    await page.goto(sreality, { waitUntil: "networkidle2" });

    agreeWithTermsandConditions(page);
    setTimeout(() => {
      10000;
    });
    //ss
    await extractAndLogArticles(page);

    const idnes =
      "https://reality.idnes.cz/s/pronajem/byty/do-40000-za-mesic/brno-mesto/?s-qc%5BsubtypeFlat%5D%5B0%5D=3k&s-qc%5BsubtypeFlat%5D%5B1%5D=31&s-qc%5BsubtypeFlat%5D%5B2%5D=4k&s-qc%5BsubtypeFlat%5D%5B3%5D=41&s-qc%5BsubtypeFlat%5D%5B4%5D=5k&s-qc%5BsubtypeFlat%5D%5B5%5D=51&s-qc%5BsubtypeFlat%5D%5B6%5D=6k&s-qc%5BarticleAge%5D=7";

    await page.goto(idnes, { waitUntil: "networkidle2" });

    setTimeout(() => {
      10000;
    });
    extractIDnesArticles(page);
  } catch {
    console.log("error");
  }
};

scrapeNewOffers();
