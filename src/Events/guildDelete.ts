import { clientdb } from "..";
import { Event } from "../structures/Event";
import logger from "../Logger/logger";

export default new Event("guildDelete", async (guild) => {
  const db = clientdb.db("guild");
  const guildsCollection = db.collection("guild");
  const usersCollection = db.collection("user");

  logger.info(`Left guild: ${guild.name}`);

    await usersCollection
      .deleteMany({
        guildid: guild.id
      })
      .catch((err) => {
        logger.error(err);
      });
  
    await guildsCollection
      .deleteMany({
        guildid: guild.id,
      })
      .catch((err) => {
        logger.error(err);
      });
});
