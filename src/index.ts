import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import puppeteer, { Browser, Page } from "puppeteer";
import { promises as fsPromises } from "fs";

const jsonFilePath = "data.json";

const token = process.env.TELEGRAM_TOKEN as string;
const chatId = process.env.TELEGRAM_CHAT_ID as string;

const bot = new TelegramBot(token, { polling: true });
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

interface Article {
  title: string;
  link: string;
  sent: boolean;
}

// send JSON data
const sendJsonData = async (
  bot: TelegramBot,
  data: Article[],
): Promise<void> => {
  try {
    const message = `SReality && IDnes data:\n\n${JSON.stringify(data, null, 2)}`;
    const messages = splitMessage(message);

    for (const msg of messages) {
      await bot.sendMessage(chatId, msg);
    }

    console.log(`JSON data sent to chat ID ${chatId} successfully.`);
  } catch (error) {
    console.error("Error sending JSON data:", error);
  }
};

const splitMessage = (message: string): string[] => {
  const MAX_MESSAGE_LENGTH = 4096;
  const messages: string[] = [];

  while (message.length > MAX_MESSAGE_LENGTH) {
    let splitIndex = message.lastIndexOf(" ", MAX_MESSAGE_LENGTH);
    if (splitIndex === -1) splitIndex = MAX_MESSAGE_LENGTH;
    messages.push(message.substring(0, splitIndex));
    message = message.substring(splitIndex).trim();
  }

  if (message) messages.push(message);
  return messages;
};

// agree with terms&conditions
const agreeWithTermsandConditions = async (page: Page) => {
  console.log("Waiting for 10 seconds...");
  await sleep(10000);
  console.log("Pressing Tab...");
  await page.keyboard.press("Tab");
  console.log("Pressing Enter...");
  await page.keyboard.press("Enter");
  console.log("Button clicked successfully.");
  await sleep(5000);
  // If there is another Preferences pop-up
  // await sleep(180000);
  //
  // console.log("Preferences -> gimmick");
  // for (let i = 0; i < 2; i++) {
  //   await page.keyboard.down("Shift");
  //   await page.keyboard.press("Tab");
  //   await page.keyboard.up("Shift");
  //   await sleep(1000);
  //   console.log(`Pressing Shift + Tab... (i: ${i + 1})`);
  // }
  //
  // console.log("Pressing Enter...");
  // await page.keyboard.press("Enter");
};

// scrape SReality
async function extractSRealityArticles(page: Page) {
  // Define the XPath for the articles using Puppeteer's built-in XPath selector
  const XpS = "::-p-xpath(//*/div[1]/div/div[2]/div[1]/div[4]/ul/li/a)";
  // Wait for the article elements to be present in the DOM
  await page.waitForSelector(XpS);

  // Extract the title and link of the articles
  const SrealityArticles = await page.evaluate((XpS) => {
    const xpathResult = document.evaluate(
      "//*/div[1]/div/div[2]/div[1]/div[4]/ul/li/a",
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null,
    );
    const articleData: Article[] = [];
    for (let i = 0; i < xpathResult.snapshotLength; i++) {
      const item = xpathResult.snapshotItem(i) as HTMLAnchorElement;
      articleData.push({
        title: item.textContent?.trim() || "",
        link: item.href,
        sent: false,
      });
    }
    return articleData;
  }, XpS);

  console.log("Array of S-Articles:", SrealityArticles);
  return SrealityArticles;
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
    const articleData: Article[] = [];
    for (let i = 0; i < xpathResult.snapshotLength; i++) {
      const item = xpathResult.snapshotItem(i) as HTMLAnchorElement;
      const titleElement = item.querySelector("div > h2") as HTMLElement;
      articleData.push({
        title: titleElement?.textContent?.trim() || "",
        link: item.href,
        sent: false,
      });
    }
    return articleData;
  }, XpId);

  console.log("Array of Articles from Idnes:", idnesArticles);
  return idnesArticles;
}

// Function to read JSON data from file
const readJsonFile = async (filePath: string): Promise<Article[]> => {
  try {
    const data = await fsPromises.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    return [];
  }
};

// Function to write JSON data to file
const writeJsonFile = async (
  filePath: string,
  data: Article[],
): Promise<void> => {
  try {
    await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log("Successfully saved JSON");
  } catch (error) {
    console.error("Error saving JSON file:", error);
  }
};

const main = async () => {
  const sreality =
    "https://www.sreality.cz/hledani/pronajem/byty/brno?velikost=3%2Bkk,4%2Bkk,4%2B1,5%2Bkk,3%2B1,5%2B1&stari=tyden&plocha-od=70&plocha-do=10000000000&cena-od=0&cena-do=40000";
  try {
    const browser: Browser = await puppeteer.launch({
      headless: true, // false in testing&debugging
      defaultViewport: null,
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1950, height: 1591, deviceScaleFactor: 1 });
    await page.goto(sreality, { waitUntil: "networkidle2" });

    agreeWithTermsandConditions(page);

    const srealityArticles = await extractSRealityArticles(page);

    sleep(3000);

    const idnes =
      "https://reality.idnes.cz/s/pronajem/byty/do-40000-za-mesic/brno/?s-qc%5BsubtypeFlat%5D%5B0%5D=3k&s-qc%5BsubtypeFlat%5D%5B1%5D=31&s-qc%5BsubtypeFlat%5D%5B2%5D=4k&s-qc%5BsubtypeFlat%5D%5B3%5D=41&s-qc%5BsubtypeFlat%5D%5B4%5D=5k&s-qc%5BsubtypeFlat%5D%5B5%5D=51&s-qc%5BarticleAge%5D=7";

    await page.goto(idnes, { waitUntil: "networkidle2" });

    const idnesArticles = await extractIDnesArticles(page);

    await browser.close();

    // Combine the data into one array
    const newData = [...srealityArticles, ...idnesArticles];

    const currentData = await readJsonFile(jsonFilePath);

    // Find new items that haven't been sent yet
    const newItems = newData.filter(
      (item) =>
        !currentData.some(
          (existingItem) =>
            existingItem.link === item.link && existingItem.sent,
        ),
    );

    if (newItems.length > 0) {
      await sendJsonData(bot, newItems);

      // Mark items as sent and update JSON file
      const updatedData = [
        ...currentData,
        ...newItems.map((item) => ({ ...item, sent: true })),
      ];
      await writeJsonFile(jsonFilePath, updatedData);
    }

    setTimeout(() => {
      console.log("Exiting program...");
      process.exit(0);
    }, 150000);
    console.log("Combined Data:", newData);
  } catch {
    console.log(Error);
    return;
  }
};

main();
