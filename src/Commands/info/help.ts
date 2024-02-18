import { Command } from "../../structures/Commands";
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} from "discord.js";
import { promisify } from "util";
import glob from "glob";
const globPromise = promisify(glob);
import { CommandType } from "../../typings/Command";

export default new Command({
  name: "help",
  description: "affiche les commandes du bot",
  id: "1208587474788556850",
  run: async ({ interaction, client }) => {
    // return interaction.reply({
    //     content: "En cours de création",
    //     ephemeral: true
    // });

    const embed: {} = {
      description:
        "S'il te-plaît, sélectionne une commande pour plus d'informations",
      color: 7462261,
    };

    const directory: string[] = await globPromise(
      `${__dirname.replaceAll("\\", "/")}/../*`
    );

    const dico = {};

    let commandFiles: string[][] = [];

    let category: string = "";

    let command: CommandType = null;

    let dir: string = "";

    for (let i = 0; i < directory.length; i++) {
      dir = directory[i];

      category = dir.replace(`${__dirname.replaceAll("\\", "/")}/../`, "");

      dico[category] = [];

      commandFiles.push(await globPromise(`${dir}/*{.ts,.js}`));

      commandFiles[i].forEach(async (filePath) => {
        command = client.commands.get(
          filePath.replace(`${dir}/`, "").replace(".ts", "").replace(".js", "")
        );

        dico[category].push([
          `</${command.name}:${command.id ? command.id : 0}>`,
          command.description,
        ]);
      });
    }

    const component = new StringSelectMenuBuilder()
      .setCustomId("help-menu")
      .setPlaceholder("Séléctionne une commande");

    for (let i = 0; i < Object.keys(dico).length; i++) {
      component.addOptions({
        label: Object.keys(dico)[i],
        value: Object.keys(dico)[i],
        description: "Affiche les commandes de cette catégorie",
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
      title: "Menu indisponible",
      color: 7462261,
      description: "Le menu n'est plus disponible",
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

      categoryEmbed.title = `Commandes de ${directory}`;
      categoryEmbed.description = "Voici la liste des commandes :";
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
