import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
  GatewayIntentBits,
} from "discord.js";
import { CommandType } from "../typings/Command";
import { glob } from "glob";
import { promisify } from "util";
import { RegisterCommandsOptions } from "../typings/Client";
import { Event } from "./Event";
const globPromise = promisify(glob);

export class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();

  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds],
    });
  }

  start() {
    this.registerModules();
    this.login(process.env.botToken);
  }
  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands);
      console.log(`Registering commands to ${guildId}`);
    } else {
      this.application?.commands.set(commands);
      console.log("Registering global commands");
    }
  }

  async registerModules() {
    // Commands
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    const commandFiles = (await globPromise(
      `${__dirname.replaceAll("\\", "/")}/../Commands/*/*{.ts,.js}`
    )) as string[];
    commandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath);
      if (!command.name) return;

      this.commands.set(command.name, command);
      console.log(`Registering command ${command.name}`);
      slashCommands.push(command);
    });

    this.on("ready", () => {
      this.registerCommands({
        commands: slashCommands,
        guildId: null,
      });
    });

    // Event
    const eventFiles = (await globPromise(
      `${__dirname.replaceAll("\\", "/")}/../Events/*{.ts,.js}`
    )) as string[];
    eventFiles.forEach(async (filePath) => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath);
      this.on(event.event, event.run);
    });
  }
}
