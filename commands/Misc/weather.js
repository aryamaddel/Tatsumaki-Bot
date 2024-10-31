import { SlashCommandBuilder } from 'discord.js';
import('node-fetch');

export const data = new SlashCommandBuilder()
	.setName('weather')
	.setDescription('Replies with weather!')
	.addStringOption((option) => option
		.setName('place')
		.setDescription('Place to get weather')
		.setRequired(true)
	);
export async function execute(interaction) {
	await interaction.deferReply();

	try {
		const location = interaction.options.getString('place');
		const API_KEY = '9c783a0926f3350418ca9943aa31266f';
		const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;

		const response = await fetch(API_URL);
		const data = await response.json();

		const weather = data.weather[0].description;
		const temp = data.main.temp;

		await interaction.editReply(
			`Weather in ${location} is ${weather} and temperature is ${temp}°C`
		);
	}
	catch (error) {
		await interaction.editReply(
			'Sorry, I couldn\'t fetch the weather for that location.'
		);
		console.log(error);
	}
}
