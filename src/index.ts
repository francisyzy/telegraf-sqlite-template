import { Message } from "typegram";
import { Telegraf } from "telegraf";

import config from "./config";

import bot from "./lib/bot";
import helper from "./commands/helper";
import echo from "./commands/echo";

//Production Settings
if (process.env.NODE_ENV === "production") {
  //Webhooks
  bot.telegram.setWebhook(`${config.URL}/bot${config.API_TOKEN}`);
  //Production Logging
  bot.use((ctx, next) => {
    if (ctx.message && config.LOG_GROUPID) {
      const message = `name: [${
        ctx.message.from.first_name
      }](tg://user?id=${ctx.message.from.id}) \\(@${
        ctx.message.from.username
      }\\)\ntext: ${(ctx.message as Message.TextMessage).text}`;
      bot.telegram.sendMessage(config.LOG_GROUPID, message, {
        parse_mode: "MarkdownV2",
      });
    }
    return next();
  });
  bot.launch({
    webhook: {
      domain: config.URL,
      port: Number(config.PORT),
    },
  });
} else {
  //Development logging
  bot.use(Telegraf.log());
  bot.launch();
}

helper();
echo();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
