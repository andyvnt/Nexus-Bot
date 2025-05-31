const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulser un membre du serveur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Utilisateur à expulser')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison de l\'expulsion')
                .setRequired(false)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return await interaction.reply({ content: "❌ Tu n'as pas la permission d'expulser.", ephemeral: true });
        }

        const user = interaction.options.getMember('utilisateur');
        if (!user) return await interaction.reply({ content: '❌ Mentionne un membre à expulser.', ephemeral: true });

        const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

        try {
            await user.kick(reason);
            await interaction.reply({ content: `✅ ${user.user.tag} a été expulsé. Raison : ${reason}` });
        } catch (error) {
            await interaction.reply({ content: '❌ Impossible d\'expulser ce membre.', ephemeral: true });
            console.error(error);
        }
    }
};
