import { Command } from "../../structures/Commands";
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} from "discord.js";
import { promisify } from "util";
import glob from "glob";
const globPromise = promisify(glob);

export default new Command({
  name: "help",
  description: "display the help menu",
  id: "1208639691725733899",
  run: async ({ interaction, client }) => {
    // return interaction.reply({
    //     content: "En cours de création",
    //     ephemeral: true
    // });

    const embed: {} = {
      description:
        "Hey, select a category to see the commands. If you need help, you can join the [support server](https://discord.gg/jmtk2qqHq2).",
      color: 7462261,
    };

    const dico = {};

    let commands = await globPromise("src/Commands/**/*.ts");
    const command2 = commands.map((value) => ({
      [value.split("/")[2]]: value.split("/")[3].split(".")[0],
    }));

    command2.forEach((value) => {
      const key = Object.keys(value)[0];
      const path = Object.values(value)[0];
      let command = client.commands.get(path);

      if (!dico[key]) {
        dico[key] = [];
      }

      dico[key].push([
        `</${command.name}:${command.id ? command.id : 0}>`,
        command.description,
      ]);
    });

    const component = new StringSelectMenuBuilder()
      .setCustomId("help-menu")
      .setPlaceholder("Select a category");

    for (let i = 0; i < Object.keys(dico).length; i++) {
      component.addOptions({
        label: Object.keys(dico)[i],
        value: Object.keys(dico)[i],
        description: "Select a category to see the commands",
      });
    }

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      component
    );

    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
    });

    let categoryEmbed = {
      title: "Menu unavailable",
      color: 7462261,
      description: "The Menu is unavailable for the moment. Please retry later.",
      fields: [],
      footer: {
        text: "prefix : /",
      },
    };

    const filter = (creator) => creator.user.id === interaction.member.user.id;
    const collector = msg.createMessageComponentCollector({
      filter,
      componentType: ComponentType.StringSelect,
      max: Object.keys(dico).length + 1,
      time: 120000,
    });

    collector.on("collect", async (result) => {
      result.deferUpdate();
      const directory: string = result.values[0];

      categoryEmbed.title = `Command of ${directory}`;
      categoryEmbed.description = "Here are the commands of the category you selected.";
      categoryEmbed.fields = [];

      for (let i = 0; i < dico[directory].length; i++) {
        categoryEmbed.fields.push({
          name: dico[directory][i][0],
          value: dico[directory][i][1],
          inline: true,
        });
      }

      await interaction.editReply({
        embeds: [categoryEmbed],
        components: [row],
      });
    });

    collector.on("end", async () => {
      await interaction.editReply({
        embeds: [categoryEmbed],
        components: [],
      });
    });
  },
});
