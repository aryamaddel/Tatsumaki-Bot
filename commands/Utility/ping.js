import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Ping!');
export async function execute(interaction) {
	const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
	interaction.editReply(`✅ Bot latency is ${sent.createdTimestamp - interaction.createdTimestamp}ms.`);
}
