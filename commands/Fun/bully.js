const { SlashCommandBuilder } = require('discord.js');
import('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bully')
		.setDescription('Replies with a anime gif of bullying'),

	async execute(interaction) {
		await interaction.deferReply();

		try {
			const API_URL = 'https://kyoko.rei.my.id/api/bully.php';
			const response = await fetch(API_URL);
			const data = await response.json();

			const bully = data.apiResult.url[0];

			await interaction.editReply(bully);

		}
		catch (error) {
			console.log(error);
			await interaction.editReply('Sorry, I couldn\'t fetch a bully gif.');
		}
	},
};
