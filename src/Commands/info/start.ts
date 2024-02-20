import { Command } from "../../structures/Commands";
import { EmbedBuilder } from "discord.js";

export default new Command({
  name: "start",
  description: "display a tutorial on how to use the bot",
  id: "1208813421743706134",
  run: async ({ interaction, client }) => {
    const embed = new EmbedBuilder()
      .setTitle("Welcome to the 42 bot")
      .setDescription(
        "To set the automatic check project you should : \n" +
          `1. Use the command </set-channel:1208813421743706132> to set a channel for log\n` +
          "2. Use the command </set-user:1208813421743706133> to add a user to check\n" +
          "3. The bot will automatically check your projects and send you a message when someone validate a project\n"
      )
      .setColor(0x0099ff)
      .setFooter({
        text: "Marty",
        iconURL:
          "https://cdn.discordapp.com/avatars/1208567625337151488/8a5b43b11d105e326a007074a7c5cff7.jpeg",
      });

    await interaction.reply({
      embeds: [embed],
    });
  },
});
