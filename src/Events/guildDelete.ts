import { clientdb } from "..";
import { Event } from "../structures/Event";

export default new Event("guildDelete", async (guild) => {
  const db = clientdb.db("guild");
  const guildsCollection = db.collection("guild");
  const usersCollection = db.collection("user");

  console.log(`Left guild: ${guild.name}`);

  await usersCollection.deleteMany({ guildid: guild.id }).catch((err) => {
    console.error(err);
  });

  await guildsCollection
    .deleteMany({
      guildid: guild.id,
    })
    .catch((err) => {
      console.error(err);
    });
});
