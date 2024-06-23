import { clientdb } from "../../index";
import { Command } from "../../structures/Commands";
import { PermissionsBitField } from "discord.js";
import { guild } from "../../typings/guild";

export default new Command({
	name: "init",
	description: "Init the bot for this server",
	id: "1245780460425052180",
	run: async ({ args, interaction, client }) => {
		if (
		!interaction.member.permissions.has(
			PermissionsBitField.Flags.Administrator
		)
		) {
			await interaction.reply({
				content: "You are not authorized to use this command",
				ephemeral: true,
			});
			return;
		}

		const db = clientdb.db("guild");
		const guilds = db.collection("guild");
		const guild: guild = await guilds.findOne({
		guildid: interaction.guild.id,
		}) as guild;

		if (guild === null) {
			await guilds.insertOne({
				guildid: interaction.guild.id,
				chanid: "",
				check: true,
				check_failure: true,
				message_success:
				"{here} {mention} {intra} vient de finir un projet ! :tada:",
				message_failure: "{intra} vient de finir un projet !",
			});

			return interaction.reply({
				content: "The bot has been initialized",
				ephemeral: true,
			});
		} else {
			return interaction.reply({
				content: "The bot is already initialized",
				ephemeral: true,
			});
		}
	},
});
