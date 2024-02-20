import { clientdb } from "../../index";
import { Command } from "../../structures/Commands";
import { user } from "../../typings/user";
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionsBitField,
} from "discord.js";

export default new Command({
  name: "unset-user",
  description: "Unset a user to check projects for",
  id: "",
  options: [
    {
      name: "login",
      description: "intra login of the user",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async ({ args, interaction }) => {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageChannels
      )
    ) {
      await interaction.reply({
        content: "You are not authorized to use this command",
        ephemeral: true,
      });
      return;
    }

    const login = args.getString("login");
    const db = clientdb.db("guild");
    const usersCollection = db.collection("user");
    const user: user = await usersCollection.findOne({
      guildid: interaction.guild.id,
      intra: login,
    });

    if (!user) {
      await interaction.reply({
        content: "User not found",
        ephemeral: true,
      });
      return;
    }

    await usersCollection
      .deleteOne({
        guildid: interaction.guild.id,
        intra: login,
      })
      .catch((err) => {
        return interaction.reply({
          content: "Error while unsetting user",
          ephemeral: true,
        });
      });

    const embed = new EmbedBuilder()
      .setTitle("User unset")
      .setDescription(`User ${login} has been unset`)
      .setColor(0x0099ff)
      .setTimestamp()
      .setFooter({
        text: "Marty",
        iconURL:
          "https://cdn.discordapp.com/avatars/1208567625337151488/8a5b43b11d105e326a007074a7c5cff7.jpeg",
      });

    return interaction.reply({
      embeds: [embed],
    });
  },
});
