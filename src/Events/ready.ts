import { Event } from "../structures/Event";
import { client } from "../index";
import { TextChannel } from "discord.js";

export default new Event("ready", () => {
  console.log("Bot is online");

  const channels = client.channels;
  const channel = channels.cache.get(process.env.logchannel) as TextChannel;

  if (channel?.isTextBased()) {
    channel.send("Restarted");
  }
});
