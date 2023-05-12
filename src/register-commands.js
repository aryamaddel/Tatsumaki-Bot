require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
  {
    name: "roll",
    description: "Rolls a dice",
  },
  {
    name: "flip",
    description: "Flips a coin",
  },
  {
    name: "weather",
    description: "Gets the weather for a location",
    options: [
      {
        name: "location",
        description: "The location to get the weather for",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
];

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🔃 Registering slash commands");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log("✅ Successfully registered slash commands");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
})();
