const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

const ticketCategoryName = "TICKETS";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Créer un ticket de support'),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: "Cette commande ne peut être utilisée qu'en serveur.", ephemeral: true });
    }

    const guild = interaction.guild;
    let category = guild.channels.cache.find(
      c => c.name === ticketCategoryName && c.type === ChannelType.GuildCategory
    );

    if (!category) {
      category = await guild.channels.create({
        name: ticketCategoryName,
        type: ChannelType.GuildCategory
      });
    }

    const channelName = `ticket-${interaction.user.username.toLowerCase()}`;
    const existingChannel = guild.channels.cache.find(
      c => c.name === channelName && c.parentId === category.id
    );
    if (existingChannel) {
      return interaction.reply({ content: `🛑 Tu as déjà un ticket ouvert: <#${existingChannel.id}>`, ephemeral: true });
    }

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        }
      ]
    });

    await interaction.reply({ content: `✅ Ticket créé: <#${channel.id}>`, ephemeral: true });
  }
};
