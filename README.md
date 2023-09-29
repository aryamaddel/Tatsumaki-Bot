# Tatsumaki-Bot
<p align="center">
    <img src="assets\tatsumaki.jpg" width=150 >
</p>
This is a Discord bot that reads command and response files from the commands and responses folders respectively and stores them in collections. The bot listens for interactions and messages, and executes commands or sends responses based on the content of the interaction or message. It also has the ability to join and leave voice channels.

## Setup

1. Install Node.js and npm.
2. Clone this repository.
3. Run `npm install` to install the required dependencies.
4. Create a `config.json` file in the root directory and add your bot token like this:
    ```json
    {
        "token": "your-bot-token"
    }
    ```

## Commands

Commands for this bot are located in the `commands` directory. Each command should be a `.js` file with a `data` and `execute` property.

- The `data` property should be an object that describes the command.
- The `execute` property should be a function that runs when the command is called.

If a command file does not have these properties, a warning will be logged to the console.

## Responses

Responses for this bot are located in the `responses` directory. Each response should be a `.js` file with a `trigger` and `response` property.

- The `trigger` property should be a string or an array of strings that trigger the response when a message is sent in chat.
- The `response` property should be a string or function that returns the message to send in chat.

If a response file does not have these properties, a warning will be logged to the console.

## Running the Bot

Run `node index.js` to start the bot. Once it's ready, it will log its tag to the console.

## Additional Files

### Refreshing Application Commands

The bot includes a script for refreshing application commands. This script reads all command files, converts them to JSON, and sends them to Discord's API.

To run this script, use `node deploy-commands.js`.

### Deleting Application Commands

The bot includes scripts for deleting guild-based and global application commands. These scripts send a DELETE request to Discord's API.

To run these scripts, use `node delete-command.js`.