import { ObjectId } from "mongodb";

export type guild = {
  _id: ObjectId;
  guildid: string;
  chanid: string;
  check: boolean;
  check_failure: boolean;
  message_success: string;
  message_failure: string;
};
