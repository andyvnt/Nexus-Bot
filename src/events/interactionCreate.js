const { REST, Routes } = require("discord.js");
const { CLIENT_ID, CLIENT_TOKEN } = process.env;
const fs = require("node:fs");
const path = require("node:path");

async function load(client) {
    // Load all event listeners
    const eventsPath = path.join(__dirname, "src/events");
    const eventFiles = fs
        .readdirSync(eventsPath)
        .filter((file) => file.endsWith(".js"));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) =>
                event.execute(client, ...args)
            );
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }
    }

    // Get all configured guild IDs from environment
    const GUILD_IDS = [process.env.GUILD_ID_1, process.env.GUILD_ID_2].filter(Boolean);
    const commands = [];

    // Load slash commands from folders
    const foldersPath = path.join(__dirname, "src/commands");
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter((file) => file.endsWith(".js"));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if ("data" in command && typeof command.execute === "function") {
                await client.commands.set(command.data.name, command);

                if (typeof command.data.toJSON === "function") {
                    commands.push(command.data.toJSON());
                } else {
                    const cmdName = command.data?.name || file;
                    console.warn(
                        `The command "${cmdName}" does not have a valid .toJSON method.`
                    );
                }

                if (typeof command.registerHandler === "function") {
                    command.registerHandler(client);
                }
            } else {
                console.log(
                    `[WARNING] The command ${filePath} is missing "data" or "execute".`
                );
            }
        }
    }

    // Deploy the commands to Discord via REST API
    const rest = new REST({ version: "10" }).setToken(CLIENT_TOKEN);

    try {
        console.log(
            "Slash commands to deploy:",
            commands.map((c) => c.name).join(", ")
        );
        console.log(`Deploying ${commands.length} slash commands...`);

        for (const guildId of GUILD_IDS) {
            console.log(`Deploying to guild ${guildId}...`);
            const data = await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, guildId),
                { body: commands }
            );
            console.log(
                `Successfully deployed ${data.length} commands to guild ${guildId}.`
            );
        }
    } catch (error) {
        console.error("Failed to deploy commands:", error);
    }
}

module.exports = { load };

