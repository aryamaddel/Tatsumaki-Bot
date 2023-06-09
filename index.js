const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');

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

const commandsFoldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsFoldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(commandsFoldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
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

const responsesFoldersPath = path.join(__dirname, 'responses');
const responseFolders = fs.readdirSync(responsesFoldersPath);

for (const folder of responseFolders) {
	const responsesPath = path.join(responsesFoldersPath, folder);
	const responseFiles = fs.readdirSync(responsesPath).filter((file) => file.endsWith('.js'));
	for (const file of responseFiles) {
		const filePath = path.join(responsesPath, file);
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

	if (message.content.toLowerCase() === 'tatsu join') {
		const connection = joinVoiceChannel({
			channelId: message.member.voice.channelId,
			guildId: message.guild.id,
			adapterCreator: message.guild.voiceAdapterCreator,
		});
		connection.on(VoiceConnectionStatus.Ready, () => {
			console.log('The connection has entered the Ready state - ready to play audio!');
		});
	}
	if (message.content.toLowerCase() === 'tatsu leave') {
		const connection = getVoiceConnection(message.guild.id);
		connection.on(VoiceConnectionStatus.Disconnected, () => {
			console.log('The connection has entered the Disconnected state - the connection has been destroyed.');
		});
		connection.destroy();
	}
});

client.login(token);
