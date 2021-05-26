require("dotenv").config();

const bot = require("./lib/bot");
const helper = require("./commands/helper");
const echo = require("./commands/echo");

helper();
echo();

bot.launch();
