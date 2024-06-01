import { client, client42, clientdb } from "../index";
import { EmbedBuilder, ReactionUserManager, TextChannel } from "discord.js";
import { user } from "../typings/user";
import axios from "axios";
import { guild } from "../typings/guild";
import { UserQueue } from "./UserQueue";
const image = require("../../dico/image.json");

function isToday(date) {
	const today = new Date();
	return date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear();
}

function elementsInSecondNotInFirst(firstArray: user[], secondArray: user[]): user[] {
	return secondArray.filter(
		secondElem => !firstArray.find(
			firstElem => firstElem["_id"].equals(secondElem["_id"])
		)
	);
}

export async function checkUser() {
	const queue = new UserQueue();
	let last_users:user[] = [];
	let add_users:user[] = [];
	let remove_users:user[] = [];
	setInterval(async () => {
		const db = clientdb.db("guild");
		const usersCollection = db.collection("user");
		const Guilds = db.collection("guild");
		const users: user[] = await usersCollection.find({}).toArray();
		add_users = elementsInSecondNotInFirst(last_users, users);
		for (const user of add_users) {
			const guild: guild[] = await Guilds.find({
				check: true,
				guildid: user.guildid,
			}).toArray();
			if (guild[0] && guild[0].chanid !== "" && !isToday(user.projectdate))
			{
				await queue.addUser(user);
			}
		}
		remove_users = elementsInSecondNotInFirst(users, last_users);
		for (const user of remove_users) {
			await queue.removeUser(user);
		}
		last_users = users;
	}, 1000);

	setInterval(async () => {
		const firstuser = await queue.getFirstUser();
		if (!firstuser) return;
		console.log("check", firstuser);
		const db = clientdb.db("guild");
		const Guilds = db.collection("guild");
		const guild: guild[] = await Guilds.find({
			check: true,
			guildid: firstuser.guildid,
		}).toArray();
		if (!guild[0] || guild[0].chanid === "" || isToday(firstuser.projectdate) )
		{
			queue.rotateQueue();
			return;
		}
		let user = await checkeachUser(firstuser, guild[0]).catch((err) => {
			console.log(err);
			return null;
		});
		queue.updateUser(user);
		queue.rotateQueue();
	}, 3600);
}

async function checkeachUser(user: user, guild: guild):Promise<user> {
	const token = await client42.credentials.getToken();
	const response = await axios
		.get(`https://api.intra.42.fr/v2/users/${user.intra}`, {
			headers: {
				Authorization: `Bearer ${token.data.access_token}`,
			},
		})
		.catch((err) => {
			console.log(err);
		});

	if (!response) return null;
				
	let last = null;
	let date1 = new Date("2000-02-09T14:16:02.406Z");
	response.data.projects_users.forEach((elem) => {
		const date2 = new Date(elem.marked_at);
		if (guild.check_failure === false && elem['validated?'] === false)
			return;
		else if (elem.status === "finished" && date1 < date2) {
			last = elem;
			date1 = date2;
		} else if (
			elem.status === "in_progress" &&
			elem.marked &&
			date1 < date2 &&
			guild.check_failure
		) {
			last = elem;
			date1 = date2;
		}
	});

	if (!last) return null;
	if (user.projectdate >= date1) return null;

	const usersCollection = clientdb.db("guild").collection("user");
	await usersCollection.updateOne(
		{ _id: user._id },
		{
			$set: {
				projectdate: date1,
				projectname: last.project.name,
			},
		}
	);

	let new_user = await usersCollection.findOne({ _id: user._id });

	let picture: string;
	Object.keys(image).forEach((key) => {
		const name = last.project.name
			.toLowerCase()
			.replace(" ", "")
			.replace("-", "");
		if (name.includes(key)) {
			picture = image[key];
		}
	});

	const validated = last["validated?"];

	const embed = new EmbedBuilder()
		.setTitle("New project finished")
		.setDescription(
			`User ${user.intra} has finished project ${last.project.name}`
		)
		.setURL(
			`https://projects.intra.42.fr/projects/${last.project.slug}/projects_users/${last.id}`
		)
		.addFields({
			name: "Mark",
			value: validated
					? `Validated with mark of ${last.final_mark}`
					: `Miss the project with mark of ${last.final_mark}\nbetter luck next time !`,
		})
		.setThumbnail(`${response.data.image.versions.small}`)
		.setImage(
			`https://raw.githubusercontent.com/ayogun/42-project-badges/main/badges/${
				last.final_mark > 100 ? picture + "m" : picture + "e"
				}.png`
		)
		.setColor(validated ? 0x00ff00 : 0xff0000)
		.setTimestamp(date1)
		.setFooter({
			text: "Marty",
			iconURL:
			"https://cdn.discordapp.com/avatars/1208567625337151488/8a5b43b11d105e326a007074a7c5cff7.jpeg",
		});

	const channel = client.channels.cache.get(guild.chanid) as TextChannel;
	let check = user.discord_id;

	await channel.send({
		content: getMessage(check, guild, validated, last.final_mark, user),
		embeds: [embed],
	});

	console.log("new_user", new_user);

	return new_user;
}

function getMessage(
	check: string,
	guild: guild,
	validated: boolean,
	mark: number,
	user: user
) {
	let message: string;
	if (validated) {
		message = guild.message_success
			.replaceAll("{mention}", check ? `<@${check}>` : "")
			.replaceAll("{intra}", user.intra)
			.replaceAll("{here}", "@here")
			.replaceAll("{mark}", mark.toString());
	} else {
		message = guild.message_failure
			.replaceAll("{mention}", check ? `<@${check}>` : "")
			.replaceAll("{intra}", user.intra)
			.replaceAll("{here}", "@here")
			.replaceAll("{mark}", mark.toString());
	}
	return message;
}
