import { ObjectId } from "mongodb";

export type user = {
  _id: ObjectId;
  intra: string;
  projectdate: Date;
  projectname: string;
  discord_id: string;
  guildid: string;
};
