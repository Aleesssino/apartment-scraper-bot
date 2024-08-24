console.log("give me some sweet scrapes");

import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_TOKEN as string;
const chatId = process.env.TELEGRAM_CHAT_ID as string;

const bot = new TelegramBot(token);

const sendMessage = async (message: string) => {
  try {
    await bot.sendMessage(chatId, message);
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

sendMessage("We rollin!");
