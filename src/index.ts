require("dotenv").config();
import { ExtendedClient } from "./structures/Client";
import ClientOAuth2 from "client-oauth2";

export const client = new ExtendedClient();

import { MongoClient, ServerApiVersion } from "mongodb";
const uri = `mongodb+srv://${process.env.mdbuser}:${process.env.mdbmdp}@bot-42.qxgaebq.mongodb.net/?retryWrites=true&w=majority`;

export const clientdb:MongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const client42:ClientOAuth2 = new ClientOAuth2({
  clientId: process.env.uid42,
  clientSecret: process.env.secret42,
  accessTokenUri: "https://api.intra.42.fr/oauth/token",
});

clientdb.connect();

client.start();

clientdb.close();
