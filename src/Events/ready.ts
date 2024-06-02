import { Event } from "../structures/Event";
import { client } from "../index";
import { TextChannel, ActivityType } from "discord.js";
import { checkUser } from "../Timeval/checkuser";
import cron from "node-cron";
import logger from "../Logger/logger";
import { sendLogFile } from "../Logger/sendlogfile";

export default new Event("ready", () => {
  console.log("Bot is online");

  const channels = client.channels;
  const channel = channels.cache.get(process.env.logchannel) as TextChannel;

  console.log("Checking users");
  checkUser();

  cron.schedule('0 0 * * *', () => {
    logger.info('Running daily log file send task.');
    sendLogFile();
  });

  client.user.setPresence({
    activities: [
      {
        name: "your projects",
        type: ActivityType.Watching,
      },
      {
        name: "/help",
        type: ActivityType.Playing,
      },
      {
        name: "a 42",
        type: ActivityType.Listening,
      },
    ],
    status: "dnd",
  });

  if (channel?.isTextBased()) {
    channel.send("Restarted");
  }
});
