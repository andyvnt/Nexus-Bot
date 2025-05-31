const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprime un nombre de messages dans le salon.')
    .addIntegerOption(option =>
      option.setName('nombre')
        .setDescription('Nombre de messages à supprimer (1-100)')
        .setRequired(true)
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger('nombre');

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: 'Merci de choisir un nombre entre 1 et 100.', ephemeral: true });
    }

    // Vérifie les permissions
    if (!interaction.member.permissions.has('ManageMessages')) {
      return interaction.reply({ content: "Vous n'avez pas la permission de gérer les messages.", ephemeral: true });
    }

    await interaction.channel.bulkDelete(amount, true)
      .then(messages => {
        interaction.reply({ content: `🧹 ${messages.size} messages supprimés !`, ephemeral: true });
      })
      .catch(err => {
        console.error(err);
        interaction.reply({ content: "Une erreur est survenue lors de la suppression des messages.", ephemeral: true });
      });
  }
};