import { Event } from "../structures/Event";

export default new Event("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.includes("42")) {
    message.react("👍");
  }
});
