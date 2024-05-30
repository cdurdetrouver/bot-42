import { Command } from "../../structures/Commands";
import { EmbedBuilder } from "discord.js";

export default new Command({
  name: "dashboard",
  description: "Give a link to the dashboard",
  id: "",
  run: async ({ interaction, client }) => {
    const embed = new EmbedBuilder()
		.setTitle('Go to the dashboard')
		.setURL('https://marty42.xyz/')
		.setDescription("With the dashboard you can manage the users to check and the channel to send the message and change them easily.")
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
