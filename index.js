import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const EventType = {
  READY: "ready",
  INTERACTION: "interactionCreate",
  MESSAGE: "messageCreate",
};

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

  /**
   * Load files from a directory and process them using a callback
   * @param {string} dir - Directory to load files from
   * @param {Function} callback - Function to process each file
   * @param {string} fileExtension - File extension to filter (default: '.js')
   */
  loadFiles(dir, callback, fileExtension = ".js") {
    try {
      const folderPath = join(__dirname, dir);
      const folders = readdirSync(folderPath);

      folders.forEach((folder) => {
        const filesPath = join(folderPath, folder);
        const files = readdirSync(filesPath).filter((file) =>
          file.endsWith(fileExtension)
        );

        files.forEach((file) => {
          try {
            const filePath = join(filesPath, file);
            const fileContent = require(filePath);
            callback(fileContent, filePath);
          } catch (error) {
            console.error(`Error loading file ${file}:`, error);
          }
        });
      });
    } catch (error) {
      console.error(`Error loading directory ${dir}:`, error);
    }
  }

  initializeCommands() {
    this.loadFiles("commands", (command, path) => {
      if ("data" in command && "execute" in command) {
        this.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else {
        console.warn(`⚠️ Command at ${path} missing required properties`);
      }
    });
  }

  initializeResponses() {
    this.loadFiles("responses", (response, path) => {
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

  /**
   * Handle command interactions
   * @param {Interaction} interaction
   */
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
          : "An error occurred while executing this command.";

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: errorMessage,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: errorMessage,
          ephemeral: true,
        });
      }
    }
  }

  /**
   * Handle message responses
   * @param {Message} message
   */
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
    // Initialize collections
    this.initializeCommands();
    this.initializeResponses();

    // Set up event handlers
    this.client.once(Events.ClientReady, (c) => {
      console.log(`✅ Logged in as ${c.user.tag}`);
    });

    this.client.on(Events.InteractionCreate, this.handleCommand.bind(this));
    this.client.on(Events.MessageCreate, this.handleMessage.bind(this));

    // Login
    try {
      await this.client.login(process.env.TOKEN);
    } catch (error) {
      console.error("Failed to login:", error);
      process.exit(1);
    }
  }
}

function setupKeepAlive() {
  const app = express();
  const port = process.env.PORT || 10000;

  app.get("/", (req, res) => {
    res.send("Bot is running!");
  });

  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });

  app.listen(port, () => {
    console.log(`✅ Keep-alive server running on port ${port}`);
  });
}

// Initialize bot and keep-alive server
const bot = new DiscordBot();
bot.initialize().catch(console.error);
setupKeepAlive();

// Handle process errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});
