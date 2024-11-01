import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Provides a list of commands of the bot");

export async function execute(interaction) {
  const commandsDir = path.resolve(__dirname, "../"); // Path to the main commands folder
  const commands = [];

  // Recursively read all command files
  function loadCommands(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        loadCommands(filePath);
      } else if (file.endsWith(".js")) {
        const command = require(filePath);
        if (command.data && command.data.name && command.data.description) {
          commands.push({
            name: command.data.name,
            value: command.data.description,
          });
        }
      }
    }
  }

  loadCommands(commandsDir);

  // Create the embed
  const helpEmbed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Help - List of Commands")
    .setDescription("Here are the available commands for the bot:")
    .addFields(commands)

  await interaction.reply({ embeds: [helpEmbed] });
}
