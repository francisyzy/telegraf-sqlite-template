require("dotenv").config();

const { Telegraf } = require("telegraf");

const API_TOKEN = process.env.API_TOKEN;
const PORT = process.env.PORT || 3000;
const URL = process.env.URL;
const LOG_GROUPID = process.env.LOG_GROUPID;

const bot = new Telegraf(API_TOKEN);

//Production Settings
if (process.env.NODE_ENV === "production") {
  //Webhooks
  bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
  bot.startWebhook(`/bot${API_TOKEN}`, null, PORT);
  //Production Logging
  if (LOG_GROUPID) {
  }
} else {
  //Development logging
  bot.use(Telegraf.log());
}

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

module.exports = bot;
