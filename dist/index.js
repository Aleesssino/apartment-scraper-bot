"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = require("fs");
const jsonFilePath = "data.json";
const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const bot = new node_telegram_bot_api_1.default(token, { polling: true });
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
// send JSON data
const sendJsonData = (bot, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = `SReality && IDnes data:\n\n${JSON.stringify(data, null, 2)}`;
        const messages = splitMessage(message);
        for (const msg of messages) {
            yield bot.sendMessage(chatId, msg);
        }
        console.log(`JSON data sent to chat ID ${chatId} successfully.`);
    }
    catch (error) {
        console.error("Error sending JSON data:", error);
    }
});
const splitMessage = (message) => {
    const MAX_MESSAGE_LENGTH = 4096;
    const messages = [];
    while (message.length > MAX_MESSAGE_LENGTH) {
        let splitIndex = message.lastIndexOf(" ", MAX_MESSAGE_LENGTH);
        if (splitIndex === -1)
            splitIndex = MAX_MESSAGE_LENGTH;
        messages.push(message.substring(0, splitIndex));
        message = message.substring(splitIndex).trim();
    }
    if (message)
        messages.push(message);
    return messages;
};
// agree with terms&conditions
const agreeWithTermsandConditions = (page) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Waiting for 10 seconds...");
    yield sleep(10000); // Increase sleep time to ensure everything is loaded
    console.log("Pressing Tab...");
    yield page.keyboard.press("Tab");
    console.log("Pressing Enter...");
    yield page.keyboard.press("Enter");
    console.log("Button clicked successfully.");
});
// scrape SReality
function extractSRealityArticles(page) {
    return __awaiter(this, void 0, void 0, function* () {
        // Define the XPath for the articles using Puppeteer's built-in XPath selector
        const XpS = "::-p-xpath(//html/body/div[2]/div[1]/div[2]/div[3]/div[3]/div/div/div/div/div[3]/div/div/div/div/span/h2/a)";
        // Wait for the article elements to be present in the DOM
        yield page.waitForSelector(XpS);
        // Extract the title and link of the articles
        const SrealityArticles = yield page.evaluate((XpS) => {
            var _a;
            const xpathResult = document.evaluate("//html/body/div[2]/div[1]/div[2]/div[3]/div[3]/div/div/div/div/div[3]/div/div/div/div/span/h2/a", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            const articleData = [];
            for (let i = 0; i < xpathResult.snapshotLength; i++) {
                const item = xpathResult.snapshotItem(i);
                articleData.push({
                    title: ((_a = item.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "",
                    link: item.href,
                    sent: false,
                });
            }
            return articleData;
        }, XpS);
        console.log("Array of S-Articles:", SrealityArticles);
        return SrealityArticles;
    });
}
function extractIDnesArticles(page) {
    return __awaiter(this, void 0, void 0, function* () {
        // Define the XPath for the articles using Puppeteer's built-in XPath selector
        const XpId = "::-p-xpath(//*/article/div/a/div/h2)";
        // Wait for the article elements to be present in the DOM
        yield page.waitForSelector(XpId);
        // Extract the title and link of the articles
        const idnesArticles = yield page.evaluate((XpId) => {
            var _a;
            const xpathResult = document.evaluate("//*/article/div/a", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            const articleData = [];
            for (let i = 0; i < xpathResult.snapshotLength; i++) {
                const item = xpathResult.snapshotItem(i);
                const titleElement = item.querySelector("div > h2");
                articleData.push({
                    title: ((_a = titleElement === null || titleElement === void 0 ? void 0 : titleElement.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || "",
                    link: item.href,
                    sent: false,
                });
            }
            return articleData;
        }, XpId);
        console.log("Array of Articles from Idnes:", idnesArticles);
        return idnesArticles;
    });
}
// Function to read JSON data from file
const readJsonFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield fs_1.promises.readFile(filePath, "utf-8");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error reading JSON file:", error);
        return [];
    }
});
// Function to write JSON data to file
const writeJsonFile = (filePath, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fs_1.promises.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log("Successfully saved JSON");
    }
    catch (error) {
        console.error("Error saving JSON file:", error);
    }
});
//
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const sreality = "https://www.sreality.cz/hledani/pronajem/byty/brno?velikost=3%2Bkk,4%2Bkk,4%2B1,5%2Bkk,3%2B1,5%2B1&stari=tyden&plocha-od=70&plocha-do=10000000000&cena-od=0&cena-do=40000";
    try {
        const browser = yield puppeteer_1.default.launch({
            headless: false,
            defaultViewport: null,
        });
        const page = yield browser.newPage();
        yield page.setViewport({ width: 1950, height: 1591, deviceScaleFactor: 1 });
        yield page.goto(sreality, { waitUntil: "networkidle2" });
        agreeWithTermsandConditions(page);
        const srealityArticles = yield extractSRealityArticles(page);
        sleep(3000);
        const idnes = "https://reality.idnes.cz/s/pronajem/byty/do-40000-za-mesic/brno/?s-qc%5BsubtypeFlat%5D%5B0%5D=3k&s-qc%5BsubtypeFlat%5D%5B1%5D=31&s-qc%5BsubtypeFlat%5D%5B2%5D=4k&s-qc%5BsubtypeFlat%5D%5B3%5D=41&s-qc%5BsubtypeFlat%5D%5B4%5D=5k&s-qc%5BsubtypeFlat%5D%5B5%5D=51&s-qc%5BarticleAge%5D=7";
        yield page.goto(idnes, { waitUntil: "networkidle2" });
        const idnesArticles = yield extractIDnesArticles(page);
        yield browser.close();
        // Combine the data into one array
        const newData = [...srealityArticles, ...idnesArticles];
        const currentData = yield readJsonFile(jsonFilePath);
        // Find new items that haven't been sent yet
        const newItems = newData.filter((item) => !currentData.some((existingItem) => existingItem.link === item.link && existingItem.sent));
        if (newItems.length > 0) {
            yield sendJsonData(bot, newItems);
            // Mark items as sent and update JSON file
            const updatedData = [
                ...currentData,
                ...newItems.map((item) => (Object.assign(Object.assign({}, item), { sent: true }))),
            ];
            yield writeJsonFile(jsonFilePath, updatedData);
        }
        setTimeout(() => {
            console.log("Exiting program...");
            process.exit(0);
        }, 150000);
        console.log("Combined Data:", newData);
    }
    catch (_a) {
        console.log(Error);
        return;
    }
});
main();
