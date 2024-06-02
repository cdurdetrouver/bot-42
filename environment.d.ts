declare global {
  namespace NodeJS {
    interface ProcessEnv {
      botToken: string;
      logchannel: string;
      secret42: string;
      uid42: string;
      mdbmdp: string;
      mdbuser: string;
    }
  }
}

export {};
