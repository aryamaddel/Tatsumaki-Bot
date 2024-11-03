import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { loadFiles } from "./utils/fileLoader.js";
import setupKeepAlive from "./keepAlive.js";

dotenv.config();

class DiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });
    this.commands = new Collection();
    this.responses = new Collection();
  }

  initializeCommands() {
    loadFiles("commands", (command, path) => {
      if ("data" in command && "execute" in command) {
        this.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else {
        console.warn(`⚠️ Command at ${path} missing required properties`);
      }
    });
  }

  initializeResponses() {
    loadFiles("responses", (response, path) => {
      if ("trigger" in response && "response" in response) {
        const triggers = Array.isArray(response.trigger)
          ? response.trigger
          : [response.trigger];

        triggers.forEach((trigger) => {
          this.responses.set(trigger.toLowerCase(), response.response);
          console.log(`✅ Loaded response trigger: ${trigger}`);
        });
      } else {
        console.warn(`⚠️ Response at ${path} missing required properties`);
      }
    });
  }

  async handleCommand(interaction) {
    if (!interaction.isChatInputCommand()) return;

    try {
      const command = this.commands.get(interaction.commandName);
      if (!command) {
        await interaction.reply({
          content: "Command not found!",
          ephemeral: true,
        });
        return;
      }

      await command.execute(interaction);
    } catch (error) {
      console.error(
        `Error executing command ${interaction.commandName}:`,
        error
      );
      const errorMessage =
        process.env.NODE_ENV === "development"
          ? `Error: ${error.message}`
          : "An error occurred.";
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }

  async handleMessage(message) {
    if (message.author.bot) return;

    try {
      const response = this.responses.get(message.content.toLowerCase());
      if (response) {
        const content =
          typeof response === "function" ? await response() : response;
        await message.reply(content);
      }
    } catch (error) {
      console.error("Error handling message response:", error);
    }
  }

  async initialize() {
    this.initializeCommands();
    this.initializeResponses();

    this.client.once(Events.ClientReady, (c) => {
      console.log(`✅ Logged in as ${c.user.tag}`);
    });

    this.client.on(Events.InteractionCreate, this.handleCommand.bind(this));
    this.client.on(Events.MessageCreate, this.handleMessage.bind(this));

    try {
      await this.client.login(process.env.TOKEN);
    } catch (error) {
      console.error("Failed to login:", error);
      process.exit(1);
    }
  }
}

// Initialize bot and keep-alive server
const bot = new DiscordBot();
bot.initialize().catch(console.error);
setupKeepAlive();

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});
