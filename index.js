require("dotenv").config();
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";

// Helper function to load files from directory
const loadFiles = (dir, callback) => {
  const folderPath = join(__dirname, dir);
  const folders = readdirSync(folderPath);

  folders.forEach((folder) => {
    const filesPath = join(folderPath, folder);
    const files = readdirSync(filesPath).filter((file) => file.endsWith(".js"));

    files.forEach((file) => {
      const filePath = join(filesPath, file);
      callback(require(filePath), filePath);
    });
  });
};

// Initialize client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Load commands
client.commands = new Collection();
loadFiles("commands", (command, path) => {
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] Command at ${path} missing required properties`);
  }
});

// Load responses
client.responses = new Collection();
loadFiles("responses", (response, path) => {
  if ("trigger" in response && "response" in response) {
    const triggers = Array.isArray(response.trigger)
      ? response.trigger
      : [response.trigger];
    triggers.forEach((trigger) => {
      client.responses.set(trigger.toLowerCase(), response.response);
    });
  } else {
    console.warn(`[WARNING] Response at ${path} missing required properties`);
  }
});

// Event handlers
client.once(Events.ClientReady, (c) =>
  console.log(`✅ Logged in as ${c.user.tag}`)
);

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const command = client.commands.get(interaction.commandName);
    if (command) await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Command execution failed!",
      ephemeral: true,
    });
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const response = client.responses.get(message.content.toLowerCase());
  if (response) {
    const content =
      typeof response === "function" ? await response() : response;
    await message.reply(content);
  }
});

client.login(process.env.TOKEN);
