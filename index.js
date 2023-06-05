const { token } = require('./config.json');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');

async function loadCommands() {
	const commandFolders = await fs.readdir(foldersPath, { withFileTypes: true });

	for (const folder of commandFolders) {
		if (folder.isDirectory()) {
			const commandsPath = path.join(foldersPath, folder.name);
			const commandFiles = (await fs.readdir(commandsPath, { withFileTypes: true }))
				.filter((file) => file.isFile() && file.name.endsWith('.js'));
			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file.name);
				let command;
				try {
					command = require(filePath);
				}
				catch (error) {
					console.error(`[ERROR] Failed to load command at ${filePath}: ${error.message}`);
					continue;
				}
				if ('data' in command && 'execute' in command) {
					client.commands.set(command.data.name, command);
				}
				else {
					console.log(
						`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
					);
				}
			}
		}
	}
}

client.once(Events.ClientReady, (c) => {
	console.log(`✅ Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

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

loadCommands().then(() => client.login(token));
