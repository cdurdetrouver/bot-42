import { clientdb } from "../../index";
import { Command } from "../../structures/Commands";
import {
  EmbedBuilder,
  ChannelType,
  ApplicationCommandOptionType,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import { guild } from "../../typings/guild";
import { checkPrime } from "crypto";

export default new Command({
  name: "set-channel",
  description: "Set Channel for the bot to send messages to",
  id: "1208813421743706132",
  options: [
    {
      name: "channel",
      description: "channel to send messages to",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  run: async ({ args, interaction, client }) => {
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

    const channel = args.getChannel("channel");

    if (channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: "Channel must be a text channel",
        ephemeral: true,
      });
      return;
    }

    const textChannel = channel as TextChannel;

    const permissions = textChannel.permissionsFor(client.user);

    if (!permissions?.has(PermissionsBitField.Flags.ViewChannel)) {
      await interaction.reply({
        content: "I don't have access to this channel",
        ephemeral: true,
      });
      return;
    }

    const db = clientdb.db("guild");
    const guilds = db.collection("guild");
    const guild: guild = await guilds.findOne({
      guildid: interaction.guild.id,
    });

    if (guild === null) {
      await guilds.insertOne({
        guildid: interaction.guild.id,
        chanid: textChannel.id,
        check: true,
        checkfailure: true,
        message_success:
          "{here} {mention} {intra} vient de finir un projet ! :tada:",
        message_failure: "{intra} vient de finir un projet !",
      });
    } else {
      await guilds.updateOne(
        { guildid: interaction.guild.id },
        {
          $set: {
            chanid: textChannel.id,
          },
        }
      );
    }

    const embed = new EmbedBuilder()
      .setTitle("Channel set")
      .setDescription(
        `Channel has been set for announcements to <#${textChannel.id}>`
      )
      .setColor(0x0099ff)
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
