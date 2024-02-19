import { Event } from "../structures/Event";
import { client } from "../index";
import { TextChannel } from "discord.js";
import { checkUser } from "../Timeval/checkuser";

export default new Event("ready", () => {
  console.log("Bot is online");

  const channels = client.channels;
  const channel = channels.cache.get(process.env.logchannel) as TextChannel;

  checkUser();
  // setInterval(() => {
  //   checkUser();
  // }, 3605000);

  if (channel?.isTextBased()) {
    channel.send("Restarted");
  }
});
