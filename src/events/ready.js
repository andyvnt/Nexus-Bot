const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // Set the bot's status
    client.user.setPresence({
      activities: [{ name: "⚡️ Nexus.dev", type: 3 }],
      status: "online",
    });
  },
};
