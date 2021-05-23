require("dotenv").config();

const API_TOKEN = process.env.API_TOKEN;
const PORT = process.env.PORT || 3000;
const URL = process.env.URL;
const LOG_GROUPID = process.env.LOG_GROUPID;

const bot = new Telegraf(API_TOKEN);

if (process.env.NODE_ENV === "production") {
  bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
  bot.startWebhook(`/bot${API_TOKEN}`, null, PORT);
  if(LOG_GROUPID){
      
  }
} else {
  bot.use(Telegraf.log());
}
