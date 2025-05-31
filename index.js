// Load environment variables from .env file
require("dotenv").config();

const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
} = require("discord.js");

const { load } = require("./src/events/interactionCreate");

// Create a new Discord client with required intents and partials
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // Guild events
        GatewayIntentBits.GuildMembers, // Member events
        GatewayIntentBits.GuildIntegrations, // Integrations
        GatewayIntentBits.GuildWebhooks, // Webhooks
        GatewayIntentBits.GuildInvites, // Invites
        GatewayIntentBits.GuildVoiceStates, // Voice states
        GatewayIntentBits.GuildPresences, // Presence update
        GatewayIntentBits.GuildMessages, // Message events
        GatewayIntentBits.GuildMessageReactions, // Message reactions
        GatewayIntentBits.GuildMessageTyping, // Typing in guild
        GatewayIntentBits.DirectMessages, // DM events
        GatewayIntentBits.DirectMessageReactions, // DM reactions
        GatewayIntentBits.DirectMessageTyping, // Typing in DM
        GatewayIntentBits.MessageContent, // Message content
        GatewayIntentBits.GuildScheduledEvents, // Scheduled events
        GatewayIntentBits.AutoModerationConfiguration, // AutoMod config
        GatewayIntentBits.AutoModerationExecution, // AutoMod actions
    ],
    partials: [
        Partials.Message, // Partial message
        Partials.Channel, // Partial channel
        Partials.Reaction, // Partial reaction
        Partials.GuildMember, // Partial member
    ],
});

// Initialize the command collection for slash commands
client.commands = new Collection();

// Temporary status while restarting (useful for bot restarts)
client.once("shardCreate", () => {
    // This triggers early while the bot is connecting
    client.user?.setPresence?.({
        activities: [{ name: ":gear: Restarting...", type: 0 }],
        status: "dnd",
    });
});

// Async function to load the bot and log in
(async () => {
    try {
        await load(client); // Load commands and event handlers

        console.log(":mag_right: DEBUG ENV");
        console.log("CLIENT_ID:", process.env.CLIENT_ID);
        console.log(
            "CLIENT_TOKEN:",
            process.env.CLIENT_TOKEN ? ":white_check_mark: OK" : ":x: MISSING"
        );

        await client.login(process.env.CLIENT_TOKEN); // Log into Discord
    } catch (error) {
        // Log any errors that occur during startup
        console.error(":x: Failed to start the bot:", error);
    }
})();
