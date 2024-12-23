import { SlashCommandBuilder } from 'discord.js';
import('node-fetch');

export const data = new SlashCommandBuilder()
	.setName('truth')
	.setDescription('Replies with a random truth question');
export async function execute(interaction) {
	await interaction.deferReply();

	try {
		const API_URL = 'https://api.truthordarebot.xyz/v1/truth';
		const response = await fetch(API_URL);
		const data = await response.json();

		const truth = data.question;

		await interaction.editReply(`Truth question for ${interaction.user.username}:\n${truth}`);
	}
	catch (error) {
		console.log(error);
		await interaction.editReply('Sorry, I couldn\'t fetch a truth.');
	}
}
