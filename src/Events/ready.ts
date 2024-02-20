import { Event } from "../structures/Event";
import { client } from "../index";
import { TextChannel, ActivityType } from "discord.js";
import { checkUser } from "../Timeval/checkuser";

export default new Event("ready", () => {
  console.log("Bot is online");

  const channels = client.channels;
  const channel = channels.cache.get(process.env.logchannel) as TextChannel;

  console.log("Checking users");
  checkUser();

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
