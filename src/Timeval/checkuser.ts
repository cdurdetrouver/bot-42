import { client, client42, clientdb } from "../index";
import { EmbedBuilder, TextChannel } from "discord.js";
import { user } from "../typings/user";
import { ObjectId } from "mongodb";
import axios from "axios";
const image = require("../dico/image.json");

export async function checkUser() {
  const db = clientdb.db("guild");
  const guilds = db.collection("guild");

  const guild = await guilds
    .find({}, { limit: 100 })
    .toArray(function (err, docs) {
      return docs;
    });

  let intervalids = [];
  let intervalid;
  guild.forEach((guild) => {
    intervalid = setInterval(() => {
      startcheck(db, guild._id);
    }, 60000);
    intervalids.push(intervalid);
  });

  setTimeout(() => {
    intervalids.forEach((intervalid) => {
      clearInterval(intervalid);
    });
  }, 3600000);
}

async function getproject(id: string) {}

export async function startcheck(db, _id: ObjectId) {
  const Guilds = db.collection("guild");
  const guild = await Guilds.findOne({ _id: _id });
  if (!guild) return;
  const server = client.guilds.cache.get(guild.guildID);
  if (!server) return;

  const usersCollection = db.collection("user");

  const userIds = guild.users;

  const users: user[] = await usersCollection
    .find({ _id: { $in: userIds } })
    .toArray();
  const channel = server.channels.cache.get(guild.chanID) as TextChannel;
  client42.credentials.getToken().then((token) => {
    users.forEach((user) => {
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
            if (elem.status === "finished" && date1 < date2) {
              last = elem;
              date1 = date2;
            }
          });

          if (!last) return;
          if (user.lastProj >= date1) return;

          usersCollection.updateOne(
            { _id: user._id },
            {
              $set: {
                lastProj: date1,
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
              `https://raw.githubusercontent.com/ayogun/42-project-badges/main/badges/${picture}`
            )
            .setColor(validated ? 0x00ff00 : 0xff0000)
            .setTimestamp(date1)
            .setFooter({
              text: "Marty",
              iconURL:
                "https://cdn.discordapp.com/avatars/1208567625337151488/8a5b43b11d105e326a007074a7c5cff7.jpeg",
            });

          let check =
            user.discord_id && server.members.cache.get(user.discord_id);
          channel.send({
            content: `@here ${
              check ? `<@${user.discord_id}>` : user.intra
            } vient de finir un projet !${validated ? " :tada:" : ""}`,
            embeds: [embed],
          });
        })
        .catch((err) => {
          //   console.log(err);
          console.log("error in checkuser.ts line 139");
        });
    });
  });
}
