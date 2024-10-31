import { REST, Routes } from 'discord.js';
import { clientId, guildId, token } from './config.json';

const rest = new REST().setToken(token);

// for guild-based commands
rest.delete(Routes.applicationGuildCommand(clientId, guildId, 'COMMAND_ID'))
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);

// for global commands
rest.delete(Routes.applicationCommand(clientId, 'COMMAND_ID'))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);