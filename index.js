const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

// new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath, { withFileTypes: true });

for (const folder of commandFolders) {
	if (folder.isDirectory()) {
		const commandsPath = path.join(foldersPath, folder.name);
		const commandFiles = fs
			.readdirSync(commandsPath, { withFileTypes: true })
			.filter((file) => file.isFile() && file.name.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file.name);
			const command = require(filePath);
			// Set a new item in the Collection with the key as the command name and the value as the exported module
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

client.once(Events.ClientReady, (c) => {
	console.log(`✅ Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
	console.log(`${interaction.user.tag} entered command ${interaction.commandName} at ${new Date().toISOString()}`);
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
		console.log(`${client.user.tag} executed command ${interaction.commandName} at ${new Date().toISOString()}`);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
		else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	}
});

client.login(token);
