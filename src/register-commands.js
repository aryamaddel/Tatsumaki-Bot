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
  {
    name: "truth",
    description: "Gets a random truth question",
    options: [
      {
        name: "above-18",
        description: "The rating of the truth question",
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
  {
    name: "dare",
    description: "Gets a random dare",
    options: [
      {
        name: "above-18",
        description: "The rating of the dare",
        type: ApplicationCommandOptionType.Boolean,
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

module.exports = {
  handleInteractions: function (interaction) {
    if (!interaction.isChatInputCommand()) return;
    console.log(interaction.commandName);
    if (interaction.commandName === "roll") {
      const result = Math.floor(Math.random() * 6) + 1;
      interaction.reply(`You rolled a ${result}`);
    }
    if (interaction.commandName === "flip") {
      const options = ["heads", "tails"];
      const result = options[Math.floor(Math.random() * options.length)];
      interaction.reply(result);
    }
    if (interaction.commandName === "weather") {
      const location = interaction.options.get("location").value;
      console.log(location);
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=9c783a0926f3350418ca9943aa31266f&units=metric`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const weather = data.weather[0].description;
          const temp = data.main.temp;
          interaction.reply(
            `The weather in ${location} has ${weather} with an average temperature of ${temp}°C.`
          );
        })
        .catch((error) =>
          interaction.reply(
            "Sorry, I couldn't fetch the weather for that location."
          )
        );
    }
    if (interaction.commandName === "truth") {
      if (interaction.options.get("above-18")?.value) {
        fetch("https://api.truthordarebot.xyz/v1/truth?rating=r")
          .then((response) => response.json())
          .then((data) => {
            interaction.reply(data.question);
          });
      } else {
        fetch("https://api.truthordarebot.xyz/v1/truth")
          .then((response) => response.json())
          .then((data) => {
            interaction.reply(data.question);
          });
      }
    }
    if (interaction.commandName === "dare") {
      if (interaction.options.get("above-18")?.value) {
        fetch("https://api.truthordarebot.xyz/v1/dare?rating=r")
          .then((response) => response.json())
          .then((data) => {
            interaction.reply(data.question);
          });
      } else {
        fetch("https://api.truthordarebot.xyz/v1/dare")
          .then((response) => response.json())
          .then((data) => {
            interaction.reply(data.question);
          });
      }
    }
  },
};
