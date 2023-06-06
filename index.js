const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

function loadFiles(botClient, collectionName, folderName) {
	const collection = new Collection();
	const foldersPath = path.join(__dirname, folderName);
	const commandFolders = fs.readdirSync(foldersPath);

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			if (collectionName === 'commands') {
				if ('data' in command && 'execute' in command) {
					collection.set(command.data.name, command);
				}
				else {
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
			else if (collectionName === 'responses') {
				if ('trigger' in command && 'response' in command) {
					collection.set(command.trigger.toLowerCase(), command.response);
				}
				else {
					console.log(`[WARNING] The response at ${filePath} is missing a required "trigger" or "response" property.`);
				}
			}
		}
	}

	botClient[collectionName] = collection;
}

loadFiles(client, 'commands', 'commands');
loadFiles(client, 'responses', 'responses');


client.once(Events.ClientReady, (c) => console.log(`✅ Logged in as ${c.user.tag}`));

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'There was an error while executing this command!',
			ephemeral: true,
		});
	}
});

client.on(Events.MessageCreate, async (message) => {

	if (message.author.bot) return;

	const response = client.responses.get(message.content.toLowerCase());
	if (response) {
		const content = typeof response === 'function' ? await response() : response;
		await message.reply(content);
	}
});

client.login(token);
