const { SlashCommandBuilder } = require('discord.js');
import('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('animequote')
		.setDescription('Fetches a random anime quote.'),

	async execute(interaction) {
		await interaction.deferReply();

		try {
			const apiUrl = 'https://animechan.vercel.app/api/random';
			const response = await fetch(apiUrl);
			const quote = await response.json();

			await interaction.editReply(`Quote: ${quote.quote}\n\nAnime: ${quote.anime}\nCharacter: ${quote.character}`);
		}
		catch (error) {
			await interaction.editReply('Sorry, I couldn\'t fetch the anime quote at the moment.');
			console.log(error);
		}
	},
};
