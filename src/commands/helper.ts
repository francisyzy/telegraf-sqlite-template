import bot from "../lib/bot";
import { PrismaClient } from "@prisma/client";
import { toEscapeMsg } from "../utils/messageHandler";
import { Scenes, session, Markup, Composer } from "telegraf";
import { getBotCommands } from "../utils/botCommands";

const prisma = new PrismaClient();
//General helper commands
const helper = () => {
  const contactHandler = new Composer<Scenes.WizardContext>();
  contactHandler.on("contact", async (ctx) => {
    const senderId = ctx.from.id;
    if (!senderId) return;

    // Checks if sender is impersonating someone else
    const { user_id, phone_number } = ctx.message.contact;
    if (senderId !== user_id) {
      return ctx.reply("Please send your own contact", {
        reply_markup: {
          keyboard: [
            [
              {
                text: "📲 Send phone number",
                request_contact: true,
              },
            ],
          ],
          one_time_keyboard: true,
        },
      });
    }
    await prisma.user.upsert({
      where: { telegramId: senderId },
      update: { phone_number: phone_number },
      create: {
        telegramId: senderId,
        phone_number: phone_number,
        name: ctx.from.first_name,
      },
    });
    await ctx.reply("Thanks!", { ...Markup.removeKeyboard() });
    //Check if the user's name is correct
    await ctx.reply(`Your name is ${ctx.from.first_name}?`, {
      ...Markup.inlineKeyboard([
        Markup.button.callback("YES✔️", "YES✔️"),
        Markup.button.callback("NO❌", "NO❌"),
      ]),
    });
    return ctx.wizard.next();
  });
  contactHandler.use((ctx) =>
    ctx.reply(
      "Please send your contact by clicking the button on the keyboard",
    ),
  );

  const nameHandler = new Composer<Scenes.WizardContext>();
  nameHandler.action("NO❌", async (ctx) => {
    await ctx.editMessageText(
      `Send me your name\n_/cancel to set as ${ctx.callbackQuery.from.first_name}_`,
      {
        parse_mode: "MarkdownV2",
      },
    );
    return ctx.wizard.next();
  });
  nameHandler.action("YES✔️", async (ctx) => {
    await ctx.editMessageText(
      `Great\\! Your name is set as __${ctx.callbackQuery.from.first_name}__`,
      {
        parse_mode: "MarkdownV2",
      },
    );
    return await ctx.scene.leave();
  });
  nameHandler.use((ctx) => ctx.reply("Please select yes or no"));

  const renameHandler = new Composer<Scenes.WizardContext>();
  renameHandler.command("/cancel", async (ctx) => {
    await ctx.replyWithMarkdownV2(
      `Great\\! Your name is set as __${ctx.from.first_name}__`,
    );
    return await ctx.scene.leave();
  });
  renameHandler.on("text", async (ctx) => {
    await prisma.user.upsert({
      where: { telegramId: ctx.from.id },
      update: { name: ctx.message.text },
      create: {
        telegramId: ctx.from.id,
        name: ctx.message.text,
      },
    });
    await ctx.replyWithMarkdownV2(
      `Great\\! Your name is now set as __${ctx.message.text}__`,
    );
    return await ctx.scene.leave();
  });
  renameHandler.on("message", (ctx) =>
    ctx.reply("Only text messages please"),
  );

  const startWizard = new Scenes.WizardScene<Scenes.WizardContext>(
    "starterWizard",
    async (ctx) => {
      ctx.setMyCommands(getBotCommands());
      if (ctx.from) {
        await prisma.user.upsert({
          where: { telegramId: ctx.from.id },
          update: { name: ctx.from.first_name },
          create: {
            telegramId: ctx.from.id,
            name: ctx.from.first_name,
          },
        });
      }
      if (ctx.message && ctx.message.chat.type === "private") {
        await ctx.reply(
          "Welcome to the template bot. Please register by providing your contact by pressing the keyboard button",
          {
            reply_markup: {
              keyboard: [
                [
                  {
                    text: "📲 Send phone number",
                    request_contact: true,
                  },
                ],
              ],
              one_time_keyboard: true,
            },
          },
        );
        return ctx.wizard.next();
      } else {
        await ctx.reply("Please start the bot in a private chat");
        return await ctx.scene.leave();
      }
    },
    contactHandler,
    nameHandler,
    renameHandler,
  );

  const stage = new Scenes.Stage<Scenes.WizardContext>([startWizard]);
  bot.use(session());
  bot.use(stage.middleware());

  //All bots start with /start
  bot.start((ctx) => {
    ctx.setMyCommands(getBotCommands());
    return ctx.scene.enter("starterWizard");
  });

  bot.command("account", async (ctx) => {
    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.from.id },
    });
    if (user) {
      return ctx.replyWithMarkdownV2(
        toEscapeMsg(
          `*Name*: ${user.name} \n*PhoneNo.*: ${user.phone_number}`,
        ),
      );
    } else {
      return ctx.reply("Please /start to create an account");
    }
  });
  bot.help((ctx) => ctx.reply("Help message"));
};

export default helper;
