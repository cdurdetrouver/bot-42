declare global {
  namespace NodeJS {
    interface ProcessEnv {
      botToken: string;
      guildId: string;
      logchannel: string;
      secret42: string;
      uid42: string;
      environment: "prod" | "debug" | "dev";
    }
  }
}

export {};
