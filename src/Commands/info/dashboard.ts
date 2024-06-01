import { Command } from "../../structures/Commands";

export default new Command({
  name: "dashboard",
  description: "Give a link to the dashboard",
  id: "1245780460425052181",
  run: async ({ interaction }) => {
    await interaction.reply({
      content: "https://www.marty42.xyz/",
    });
  },
});
