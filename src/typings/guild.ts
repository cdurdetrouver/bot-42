import { ObjectId } from "mongodb";

export type guild = {
  _id: ObjectId;
  guildID: string;
  chanID: string;
  check: boolean;
};
