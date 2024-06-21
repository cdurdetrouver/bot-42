import { client, client42, clientdb } from "../index";
import { EmbedBuilder, TextChannel } from "discord.js";
import { user } from "../typings/user";
import axios from "axios";
import { guild } from "../typings/guild";
import { UserQueue } from "./UserQueue";
const image = require("../../dico/image.json");
import logger from "../Logger/logger";

function isToday(date) {
  if (!date) return false;
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function elementsInSecondNotInFirst(firstArray: user[], secondArray: user[]): user[] {
  return secondArray.filter(
    secondElem => !firstArray.find(
      firstElem => firstElem["_id"].equals(secondElem["_id"])
    )
  );
}

export async function checkUser() {
  const queue = new UserQueue();
  let last_users = [];
  let add_users = [];
  let remove_users = [];

  const userCheckInterval = async () => {
    try {
      logger.info("Running user check interval");
      const db = clientdb.db("guild");
      const usersCollection = db.collection("user");
      const Guilds = db.collection("guild");
      const users = await usersCollection.find({}).toArray();
      logger.info(`Fetched ${users.length} users from the database`);

      add_users = elementsInSecondNotInFirst(last_users, users);
      for (const user of add_users) {
        const guild = await Guilds.find({
          check: true,
          guildid: user.guildid,
        }).toArray();
        if (guild[0] && guild[0].chanid !== "" && !isToday(user.projectdate)) {
          logger.info(`Adding user ${user._id} to the queue`);
          await queue.addUser(user);
        }
      }

      remove_users = elementsInSecondNotInFirst(users, last_users);
      for (const user of last_users) {
        if (isToday(user.projectdate)) {
          logger.info(`Removing user ${user._id} intra ${user.intra} from the queue`);
          remove_users.push(user);
        }
      }
      for (const user of remove_users) {
        logger.info(`Removing user ${user._id} intra ${user.intra} from the queue`);
        await queue.removeUser(user);
      }
      last_users = users;
    } catch (err) {
      logger.error("Error in user check interval:", err);
    }
  };

  const queueProcessInterval = async () => {
    try {
      logger.info("Running queue process interval");
      if ((await queue.getSize()) === 0) return;
      const firstuser = await queue.getFirstUser();
      const db = clientdb.db("guild");
      const Guilds = db.collection("guild");
      const guild = await Guilds.find({
        check: true,
        guildid: firstuser.guildid,
      }).toArray();
      if (!guild[0] || guild[0].chanid === "" || isToday(firstuser.projectdate)) {
        logger.info(`Rotating queue for user ${firstuser._id}`);
        queue.rotateQueue();
        return;
      }
      let user = await checkeachUser(firstuser, guild[0]);
      if (user) {
        await queue.updateUser(user);
      }
      queue.rotateQueue();
    } catch (err) {
      logger.error("Error in queue process interval:", err);
    }
  };

  setInterval(userCheckInterval, 120000);
  setInterval(queueProcessInterval, 3600);
}

async function checkeachUser(user: user, guild: guild): Promise<user | null> {
  try {
    logger.info(`Checking user ${user._id}`);
    const token = await client42.credentials.getToken();
    const response = await axios.get(`https://api.intra.42.fr/v2/users/${user.intra}`, {
      headers: {
        Authorization: `Bearer ${token.data.access_token}`,
      },
    });

    if (!response) {
      logger.warn(`No response for user ${user._id}`);
      return null;
    }

    let last = null;
    let date1 = new Date("2000-02-09T14:16:02.406Z");
    response.data.projects_users.forEach((elem) => {
      const date2 = new Date(elem.marked_at);
      if (guild.check_failure === false && elem['validated?'] === false) return;
      if (elem.status === "finished" && date1 < date2) {
        last = elem;
        date1 = date2;
      } else if (
        elem.status === "in_progress" &&
        elem.marked &&
        date1 < date2 &&
        guild.check_failure
      ) {
        last = elem;
        date1 = date2;
      }
    });

    if (!last || user.projectdate >= date1) {
      logger.info(`No new project updates for user ${user._id} intra ${user.intra}`);
      return null;
    }

    const usersCollection = clientdb.db("guild").collection("user");
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          projectdate: date1,
          projectname: last.project.name,
        },
      }
    );
    logger.info(`Updated user ${user._id} with new project ${last.project.name}`);

    let new_user = await usersCollection.findOne({ _id: user._id });

    let picture: string;
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
        `https://projects.intra.42.fr/projects/${last.project.slug}/projects_users/${last.id}`
      )
      .addFields({
        name: "Mark",
        value: validated
          ? `Validated with mark of ${last.final_mark}`
          : `Missed the project with mark of ${last.final_mark}\nbetter luck next time!`,
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

    const channel = client.channels.cache.get(guild.chanid) as TextChannel;
    let check = user.discord_id;

    await channel.send({
      content: getMessage(check, guild, validated, last.final_mark, user),
      embeds: [embed],
    });

    logger.info(`Sent project update message for user ${user._id}`);

    return new_user;
  } catch (err) {
    logger.error("Error in checkeachUser function:", err);
    return null;
  }
}

function getMessage(
  check: string,
  guild: guild,
  validated: boolean,
  mark: number,
  user: user
) {
  let message: string;
  if (validated) {
    message = guild.message_success
      .replaceAll("{mention}", check !== "none" ? `<@${check}>` : "")
      .replaceAll("{intra}", user.intra)
      .replaceAll("{here}", "@here")
      .replaceAll("{mark}", mark.toString());
  } else {
    message = guild.message_failure
      .replaceAll("{mention}", check !== "none" ? `<@${check}>` : "")
      .replaceAll("{intra}", user.intra)
      .replaceAll("{here}", "@here")
      .replaceAll("{mark}", mark.toString());
  }
  return message;
}
