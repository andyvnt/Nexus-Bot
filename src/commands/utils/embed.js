const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Envoie un embed de test'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Titre de l\'embed')
            .setDescription('Ceci est un embed de test.');
        await interaction.reply({ embeds: [embed] });
    }
};