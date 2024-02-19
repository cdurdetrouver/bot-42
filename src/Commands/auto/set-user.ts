import { clientdb } from "../../index";
import { Command } from "../../structures/Commands";
import { user } from "../../typings/user";
import ClientOAuth2 from "client-oauth2";
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionsBitField,
} from "discord.js";
import axios from "axios";
import { guild } from "../../typings/guild";

export default new Command({
  name: "set-user",
  description: "Set a user to check projects for",
  id: "1208813421743706133",
  options: [
    {
      name: "login",
      description: "intra login of the user",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "user",
      description: "user to check projects for",
      type: ApplicationCommandOptionType.User,
      required: false,
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
    const client42 = new ClientOAuth2({
      clientId: process.env.uid42,
      clientSecret: process.env.secret42,
      accessTokenUri: "https://api.intra.42.fr/oauth/token",
    });

    const user = args.getUser("user");
    const login = args.getString("login");

    client42.credentials.getToken().then((token) => {
      return axios
        .get(`https://api.intra.42.fr/v2/users/${login}`, {
          headers: {
            Authorization: `Bearer ${token.data.access_token}`,
          },
        })
        .then(async (response) => {
          const db = clientdb.db("guild");
          const guilds = db.collection("guild");
          const usersCollection = db.collection("user");
          const guild: guild = await guilds.findOne({
            guildID: interaction.guild.id,
          });

          if (!guild) {
            await interaction.reply({
              content:
                "You need to set a channel first </start:1208813421743706134>",
              ephemeral: true,
            });
            return;
          }

          const userIds = guild.users;

          const users: user[] = await usersCollection
            .find({ _id: { $in: userIds } })
            .toArray();
          for (const element of users) {
            if (element.intra == login) {
              await interaction.reply({
                content: "User already added",
                ephemeral: true,
              });
              return;
            }
          }

          const allusers: user[] = await usersCollection.find({}).toArray();
          let exist = false;
          allusers.forEach((element) => {
            if (element.intra == login) exist = true;
          });
          if (!exist) {
            const result = await usersCollection.insertOne({
              intra: login,
              discord_id: user ? user.id : null,
              lastProj: new Date("2000-02-09T14:16:02.406Z"),
            });

            const newusers = guild.users;
            newusers.push(<never>result.insertedId);

            await guilds.updateOne(
              { guildID: interaction.guild.id },
              { $set: { users: newusers } }
            );
          } else {
            const user = await usersCollection.findOne({ intra: login });

            const newusers = guild.users;
            newusers.push(<never>user._id);

            await guilds.updateOne(
              { guildID: interaction.guild.id },
              { $set: { users: newusers } }
            );
          }

          const embed = new EmbedBuilder()
            .setTitle("New user added")
            .setURL(`https://profile.intra.42.fr/users/${response.data.login}`)
            .setThumbnail(`${response.data.image.versions.small}`)
            .setColor(0x0099ff)
            .setDescription(`User ${login} added to the list of users to check`)
            .setTimestamp()
            .setFooter({
              text: "Get from 42API",
              iconURL:
                "https://42.fr/wp-content/uploads/2021/07/cropped-42-favicon-acs-32x32.png",
            });

          return interaction.reply({
            embeds: [embed],
          });
        })
        .catch((err) => {
          interaction.reply({
            content: "User not found",
            ephemeral: true,
          });
        });
    });
  },
});