require("dotenv").config();
const { Client, IntentsBitField, Message } = require("discord.js");
const messageHandler = require("./messageHandler");
const interactionHandler = require("./register-commands.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
});

client.on("messageCreate", messageHandler.handleMessage);

client.on("interactionCreate", interactionHandler.handleInteractions);

client.login(process.env.TOKEN);
