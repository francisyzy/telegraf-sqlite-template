const { Markup } = require("telegraf");

const bot = require("../lib/bot");

const keyboard = Markup.inlineKeyboard([
  Markup.button.url("❤️", "http://telegraf.js.org"),
  Markup.button.callback("Delete", "delete"),
]);

const echo = () => {
  try {
    bot.on("message", (ctx) =>
      ctx.telegram.sendCopy(
        ctx.message.chat.id,
        ctx.message,
        keyboard,
      ),
    );
  } catch (error) {
    console.log(error);
  }
  bot.action("delete", (ctx) => ctx.deleteMessage());
};

module.exports = echo;
