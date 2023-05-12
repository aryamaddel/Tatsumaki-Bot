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

  },
};
