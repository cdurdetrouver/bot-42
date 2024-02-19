import { ObjectId } from "mongodb";

export type guild = {
  _id: ObjectId;
  guildID: string;
  users: [];
  chanID: string;
  check: boolean;
};
