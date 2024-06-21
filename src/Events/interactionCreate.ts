import { CommandInteractionOptionResolver, DMChannel } from "discord.js";
import { client } from "..";
import { Event } from "../structures/Event";
import { ExtendedInteraction } from "../typings/Command";

export default new Event("interactionCreate", async (interaction) => {
  // Chat Input Commands

  if (interaction.isCommand()) {
    if (!interaction.channel) {
      return interaction.reply({
        content: "You can't use interaction here",
        ephemeral: true,
      });
    }
    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        content: "You have used a non existent command",
        ephemeral: true,
      });
    try {
      command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client,
        interaction: interaction as ExtendedInteraction,
      });
    }
    catch (error) {
      console.error(error);
      return interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});
