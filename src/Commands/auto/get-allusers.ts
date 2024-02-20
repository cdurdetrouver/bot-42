import { clientdb } from "../../index";
import { Command } from "../../structures/Commands";
import { user } from "../../typings/user";
import { EmbedBuilder } from "discord.js";
import { guild } from "../../typings/guild";

export default new Command({
  name: "get-allusers",
  description: "Get all users to check",
  id: "1209313886293991454",
  run: async ({ interaction, client }) => {
    const db = clientdb.db("guild");
    const guilds = db.collection("guild");
    const usersCollection = db.collection("user");
    const guild: guild = await guilds.findOne({
      guildID: interaction.guild.id,
      check: true,
    });

    if (!guild) {
      await interaction.reply({
        content: "You don't get the requirement </start:1208813421743706134>",
        ephemeral: true,
      });
      return;
    }

    const userget: user[] = await usersCollection
      .find({ guildid: interaction.guild.id })
      .toArray();
    if (!userget.length) {
      await interaction.reply({
        content: "No User has been set </set-user:1208813421743706133>",
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("List of all users to check")
      .setColor(0x0099ff)
      .setTimestamp()
      .setFooter({
        text: "Marty",
        iconURL:
          "https://cdn.discordapp.com/avatars/1208567625337151488/8a5b43b11d105e326a007074a7c5cff7.jpeg",
      });

    userget.forEach((user) => {
      embed.addFields({
        name: user.intra,
        value: `Last project: ${user.projectname}`,
      });
    });

    return interaction.reply({
      embeds: [embed],
    });
  },
});
