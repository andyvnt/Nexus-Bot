// Import the Events enum from discord.js
const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate, // This event triggers on every new message
    // Main function executed when a message is created
    async execute(client, message) {
        // Prefix commands handler
        // Define the prefix for commands (e.g., !help)
        const prefix = "!";

        // Check if the message starts with the prefix and is not sent by a bot
        if (message.content.startsWith(prefix) && !message.author.bot) {
            // Split the message into arguments (words), removing the prefix
            const args = message.content.slice(prefix.length).split(/ +/);
            // The first argument is the command name
            const commandName = args[0];
            // Retrieve the command from the client's prefixCommands collection
            const command = client.prefixCommands.get(commandName);

            if (command) {
                try {
                    // Execute the command, passing client, message, and arguments
                    await command.execute(client, message, args);
                } catch (error) {
                    // Log any errors and reply to the user with an error message
                    console.error(error);
                    await message.reply({
                        content:
                            "Une erreur a été __detectée__ lors de l'exécution de cette commande",
                        ephemeral: true,
                    });
                }
            }
        }
    },
};