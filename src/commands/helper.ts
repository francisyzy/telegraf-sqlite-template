import bot from "../lib/bot";
import { PrismaClient } from "@prisma/client";
import { toEscapeMsg } from "../utils/messageHandler";
import { Scenes, session, Markup } from "telegraf";

const prisma = new PrismaClient();
//General helper commands
const helper = () => {
  //Start Command to request user phone number
  bot.start(async (ctx) => {
    await prisma.user.upsert({
      where: { telegramId: ctx.from.id },
      update: {},
      create: {
        telegramId: ctx.from.id,
        name: ctx.from.first_name,
      },
    });
    ctx.reply(
      "Welcome to the template bot. Please register by providing your contact no.",
      {
        reply_markup: {
          keyboard: [
            [{ text: "📲 Send phone number", request_contact: true }],
          ],
          one_time_keyboard: true,
        },
      },
    );
  });
  //Handle contact information
  bot.on("contact", async (ctx) => {
    const senderId = ctx.from.id;
    if (!senderId) return;

    // Checks if sender is impersonating someone else
    const { user_id, phone_number } = ctx.message.contact;
    if (senderId !== user_id) {
      return ctx.reply("Please send your own contact");
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
    //Check if the user's name is correct
    return ctx.reply(`Your name is ${ctx.from.first_name}?`, {
      ...Markup.inlineKeyboard([
        Markup.button.callback("YES✔️", "YES✔️"),
        Markup.button.callback("NO❌", "NO❌"),
      ]),
    });
  });
  bot.command("inline", (ctx) => {});
  bot.action("YES✔️", (ctx) => {
    return ctx.editMessageText(
      `Great\\! Your name is set as __${ctx.callbackQuery.from.first_name}__`,
      {
        parse_mode: "MarkdownV2",
      },
    );
  });

  //Scene to update name
  // Handler factories
  const { enter, leave } = Scenes.Stage;

  const updateNameScene = new Scenes.BaseScene<Scenes.SceneContext>(
    "updateName",
  );
  updateNameScene.enter((ctx) =>
    ctx.reply("Update your name /back to cancel"),
  );
  updateNameScene.command("back", leave<Scenes.SceneContext>());
  updateNameScene.on("text", async (ctx) => {
    await prisma.user.upsert({
      where: { telegramId: ctx.from.id },
      update: { name: ctx.message.text },
      create: {
        telegramId: ctx.from.id,
        name: ctx.message.text,
      },
    });
    ctx.scene.leave();
    ctx.reply(
      `Great\\! Your name is now set as __${ctx.message.text}__`,
      {
        parse_mode: "MarkdownV2",
      },
    );
  });
  updateNameScene.on("message", (ctx) =>
    ctx.reply("Only text messages please"),
  );
  const stage = new Scenes.Stage<Scenes.SceneContext>(
    [updateNameScene],
    {
      ttl: 10,
    },
  );
  bot.use(session());
  bot.use(stage.middleware());

  //Calls the above scene
  bot.action("NO❌", (ctx) => {
    ctx.deleteMessage();
    return ctx.scene.enter("updateName");
  });

  bot.command("account", async (ctx) => {
    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.from.id },
    });
    return ctx.reply(
      toEscapeMsg(
        `*Name*: ${user?.name} \n*PhoneNo.*: ${user?.phone_number}`,
      ),
      {
        parse_mode: "MarkdownV2",
      },
    );
  });
  bot.help((ctx) => ctx.reply("Help message"));
};

export default helper;
