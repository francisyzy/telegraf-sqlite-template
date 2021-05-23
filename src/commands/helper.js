const bot = require("../lib/bot");

//General helper commands
const helper = () => {
  bot.start((ctx) => ctx.reply("Hello"));
  bot.help((ctx) => ctx.reply("Help message"));
};

module.exports = helper;
