import { token } from './config.json';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
	],
});

const commandsCollection = new Collection();
const responsesCollection = new Collection();

const commandsFoldersPath = join(__dirname, 'commands');
const commandFolders = readdirSync(commandsFoldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(commandsFoldersPath, folder);
	const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commandsCollection.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.commands = commandsCollection;

const responsesFoldersPath = join(__dirname, 'responses');
const responseFolders = readdirSync(responsesFoldersPath);

for (const folder of responseFolders) {
	const responsesPath = join(responsesFoldersPath, folder);
	const responseFiles = readdirSync(responsesPath).filter((file) => file.endsWith('.js'));
	for (const file of responseFiles) {
		const filePath = join(responsesPath, file);
		const response = require(filePath);
		if ('trigger' in response && 'response' in response) {
			if (Array.isArray(response.trigger)) {
				for (const trigger of response.trigger) {
					responsesCollection.set(trigger.toLowerCase(), response.response);
				}
			}
			else {
				responsesCollection.set(response.trigger.toLowerCase(), response.response);
			}
		}
		else {
			console.log(`[WARNING] The response at ${filePath} is missing a required "trigger" or "response" property.`);
		}
	}
}

client.responses = responsesCollection;

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
