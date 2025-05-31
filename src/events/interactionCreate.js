const { REST, Routes, Events } = require("discord.js");
const { CLIENT_ID, CLIENT_TOKEN } = process.env;
const fs = require("node:fs");
const path = require("node:path");

async function load(client) {
    // Charger tous les events
    const eventsPath = __dirname;
    const eventFiles = fs
        .readdirSync(eventsPath)
        .filter((file) => file.endsWith(".js") && file !== "interactionCreate.js");

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

    // Charger les commandes slash
    const commands = [];
    const commandsPath = path.join(__dirname, "../commands");
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs
            .readdirSync(folderPath)
            .filter((file) => file.endsWith(".js"));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath);

            if ("data" in command && typeof command.execute === "function") {
                client.commands.set(command.data.name, command);
                if (typeof command.data.toJSON === "function") {
                    commands.push(command.data.toJSON());
                } else {
                    commands.push(command.data);
                }
            } else {
                console.log(
                    `[WARNING] The command ${filePath} is missing "data" or "execute".`
                );
            }
        }
    }

    // Déployer les commandes sur Discord
    const rest = new REST({ version: "10" }).setToken(CLIENT_TOKEN);
    const GUILD_IDS = [process.env.GUILD_ID_1, process.env.GUILD_ID_2].filter(Boolean);

    try {
        for (const guildId of GUILD_IDS) {
            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, guildId),
                { body: commands }
            );
            console.log(`✅ Slash commands deployed to guild ${guildId}`);
        }
    } catch (error) {
        console.error("Failed to deploy commands:", error);
    }

    // Gestion de l'exécution des commandes slash
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: "❌ Erreur lors de l'exécution de la commande.", ephemeral: true });
            } else {
                await interaction.reply({ content: "❌ Erreur lors de l'exécution de la commande.", ephemeral: true });
            }
        }
    });
}

module.exports = { load };

