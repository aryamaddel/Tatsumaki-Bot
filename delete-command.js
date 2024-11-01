import { REST, Routes } from 'discord.js';
require('dotenv').config();

const rest = new REST().setToken(process.env.TOKEN);

// for guild-based commands
rest.delete(Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, 'COMMAND_ID'))
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);

// for global commands
rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, 'COMMAND_ID'))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);