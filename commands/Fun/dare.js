const { SlashCommandBuilder } = require('discord.js');
import('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dare')
		.setDescription('Replies with a random dare'),

	async execute(interaction) {
		await interaction.deferReply();

		try {
			const API_URL = 'https://api.truthordarebot.xyz/v1/dare';
			const response = await fetch(API_URL);
			const data = await response.json();

			const dare = data.question;

			await interaction.editReply(`Dare for ${interaction.user.username}:\n${dare}`);
		}
		catch (error) {
			console.log(error);
			await interaction.editReply('Sorry, I couldn\'t fetch a dare.');
		}
	},
};
