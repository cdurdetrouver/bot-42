import { client, client42, clientdb } from "../index";
import { EmbedBuilder, TextChannel } from "discord.js";
import { user } from "../typings/user";
import { ObjectId } from "mongodb";
import axios from "axios";
import { guild } from "../typings/guild";
const image = require("../../dico/image.json");
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function checkUser() {
  setInterval(async () => {
    const db = clientdb.db("guild");
    const Guilds = db.collection("guild");
    const usersCollection = db.collection("user");
    const users: user[] = await usersCollection.find({}).toArray();

    for (const user of users) {
      const guild: guild[] = await Guilds.find({
        check: true,
        guildID: user.guildid,
      }).toArray();
      if (guild[0]) {
        await checkeachUser(user, guild[0]);
        await wait(500);
      }
    }
  }, 120000);
}

async function checkeachUser(user: user, guild: guild) {
  client42.credentials.getToken().then((token) => {
    return axios
      .get(`https://api.intra.42.fr/v2/users/${user.intra}`, {
        headers: {
          Authorization: `Bearer ${token.data.access_token}`,
        },
      })
      .then(async (response) => {
        let last = null;
        let date1 = new Date("2000-02-09T14:16:02.406Z");
        response.data.projects_users.forEach((elem) => {
          const date2 = new Date(elem.marked_at);
          if (
            (elem.status === "finished" ||
              (elem.status === "in_progress" && elem.marked_at)) &&
            date1 < date2 &&
            date1 < date2
          ) {
            last = elem;
            date1 = date2;
          }
        });

        if (!last) return;
        if (user.projectdate >= date1) return;

        const usersCollection = clientdb.db("guild").collection("user");
        usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              projectdate: date1,
              projectname: last.project.name,
            },
          }
        );

        let picture;
        Object.keys(image).forEach((key) => {
          const name = last.project.name
            .toLowerCase()
            .replace(" ", "")
            .replace("-", "");
          if (name.includes(key)) {
            picture = image[key];
          }
        });

        const validated = last["validated?"];

        const embed = new EmbedBuilder()
          .setTitle("New project finished")
          .setDescription(
            `User ${user.intra} has finished project ${last.project.name}`
          )
          .setURL(
            `https://profile.intra.42.fr/${last.project.slug}/${response.data.login}`
          )
          .addFields({
            name: "Mark",
            value: validated
              ? `Validated with mark of ${last.final_mark}`
              : `Miss the project with mark of ${last.final_mark}\nbetter luck next time !`,
          })
          .setThumbnail(`${response.data.image.versions.small}`)
          .setImage(
            `https://raw.githubusercontent.com/ayogun/42-project-badges/main/badges/${
              last.final_mark > 100 ? picture + "m" : picture + "e"
            }.png`
          )
          .setColor(validated ? 0x00ff00 : 0xff0000)
          .setTimestamp(date1)
          .setFooter({
            text: "Marty",
            iconURL:
              "https://cdn.discordapp.com/avatars/1208567625337151488/8a5b43b11d105e326a007074a7c5cff7.jpeg",
          });

        const channel = client.channels.cache.get(guild.chanID) as TextChannel;
        let check = user.discord_id;
        await channel.send({
          content: `@here ${
            check ? `<@${user.discord_id}>` : user.intra
          } vient de finir un projet !${validated ? " :tada:" : ""}`,
          embeds: [embed],
        });
      });
  });
}
