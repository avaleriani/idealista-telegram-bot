import { Telegraf } from "telegraf";

// LAUNCH BOT
const Bot = async () => {
  const bot = new Telegraf(process.env.BOT_TOKEN);

  // Control response to check if bot is running on chat
  bot.on("message", async ctx => {
    await ctx.telegram.sendMessage(ctx.chat.id, `Status: Running, date: ${new Date().toLocaleDateString()}`);
  });

  await bot.launch();

  // Bind stopping all scheduler tasks to the process exit event
  [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach(eventType => {
    process.on(eventType, () => {
      bot.telegram.sendMessage(process.env.CHAT_ID, "Bot stopped");
      bot.stop("SIGINT");
    });
  });

  return bot;
};

export default Bot;
