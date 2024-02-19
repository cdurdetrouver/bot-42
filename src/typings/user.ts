import { ObjectId } from "mongodb";

export type user = {
  _id: ObjectId;
  intra: string;
  lastProj: Date;
  discord_id: string;
};
