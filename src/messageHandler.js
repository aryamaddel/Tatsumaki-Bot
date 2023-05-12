module.exports = {
  handleMessage: function (message) {
    console.log("Message: " + message.content + " from " + message.author.tag);
    if (message.author.bot) return;

    if (message.content === "hi") {
      message.reply("Hello!");
    }
    if (message.content === "cat" || message.content === "meow") {
      const url = "https://api.thecatapi.com/v1/images/search";
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const image = data[0].url;
          message.reply(image);
        })
        .catch((error) =>
          message.reply("Sorry, I couldn't fetch a cat picture right now.")
        );
    }
    if (message.content === "meme") {
      const url = "https://meme-api.com/gimme";
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const title = data.title;
          const image = data.url;
          message.reply(`${title}\n${image}`);
        })
        .catch((error) =>
          message.reply("Sorry, I couldn't fetch a meme right now.")
        );
    }
  },
};
