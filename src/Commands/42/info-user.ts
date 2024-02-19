import { Command } from "../../structures/Commands";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import axios from "axios";
import { client42 } from "../../index";

export default new Command({
  name: "info-user",
  description: "get info of a user from 42API",
  id: "1208606899302305792",
  options: [
    {
      name: "login",
      description: "intra of user to get info from",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async ({ args, interaction, client }) => {
    const user = args.getString("login");

    let coalition = "No coalition";
    let color = 0x0099ff;
    let log = "Unaivalable";

    client42.credentials.getToken().then((token) => {
      return axios
        .get(`https://api.intra.42.fr/v2/users/${user}/coalitions`, {
          headers: {
            Authorization: `Bearer ${token.data.access_token}`,
          },
        })
        .then((response) => {
          response.data.forEach((element) => {
            coalition = element.name;
            color = element.color;
          });
        })
        .then(() => {
          client42.credentials
            .getToken()
            .then((token) => {
              return axios.get(`https://api.intra.42.fr/v2/users/${user}`, {
                headers: {
                  Authorization: `Bearer ${token.data.access_token}`,
                },
              });
            })
            .then((response) => {
              let level;
              response.data.cursus_users.forEach((element) => {
                if (element.cursus_id === 21 || element.cursus_id === 9)
                  level = element.level + "%";
              });
              let title = "No title";
              response.data.titles_users.forEach((element, idx) => {
                if (element.selected) {
                  title = response.data.titles[idx].name.replace(
                    "%login",
                    response.data.login
                  );
                }
              });
              const embed1 = new EmbedBuilder()
                .setColor(color)
                .setTitle(
                  `${response.data.usual_full_name} ${response.data.login}`
                )
                .setURL(
                  `https://profile.intra.42.fr/users/${response.data.login}`
                )
                .setDescription(title)
                .setThumbnail(`${response.data.image.versions.small}`)
                .addFields(
                  {
                    name: "Level",
                    value: level ? level : "No level",
                  },
                  {
                    name: "Groups :",
                    value:
                      response.data.groups.length > 0
                        ? response.data.groups
                            .map((group) => group.name)
                            .join(", ")
                        : "No groups",
                    inline: true,
                  },
                  {
                    name: "Coalition :",
                    value: coalition,
                    inline: true,
                  },
                  {
                    name: "Piscine date :",
                    value: `${response.data.pool_month} ${response.data.pool_year}`,
                    inline: true,
                  },
                  {
                    name: "Wallet :",
                    value: response.data.wallet
                      ? response.data.wallet.toString()
                      : "No wallet",
                    inline: true,
                  },
                  {
                    name: "Correction point :",
                    value: response.data.correction_point
                      ? response.data.correction_point.toString()
                      : "No correction point",
                    inline: true,
                  },
                  {
                    name: "Log :",
                    value: log,
                    inline: true,
                  }
                )
                .setTimestamp()
                .setFooter({
                  text: "Get from 42API",
                  iconURL:
                    "https://42.fr/wp-content/uploads/2021/07/cropped-42-favicon-acs-32x32.png",
                });

              const msg = interaction.reply({
                embeds: [embed1],
              });
            })
            .catch((error) => {
              return interaction.reply({
                content: "Wrong login for 42",
                ephemeral: true,
              });
            });
        })
        .catch((error) => {
          return interaction.reply({
            content: "Wrong login for 42",
            ephemeral: true,
          });
        });
    });
  },
});
