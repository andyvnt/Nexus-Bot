const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannir un membre du serveur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Utilisateur à bannir')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison du bannissement')
                .setRequired(false)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await interaction.reply({ content: "❌ Tu n'as pas la permission de bannir.", ephemeral: true });
        }

        const user = interaction.options.getMember('utilisateur');
        if (!user) return await interaction.reply({ content: '❌ Mentionne un membre à bannir.', ephemeral: true });

        const reason = interaction.options.getString('raison') || 'Aucune raison fournie';

        try {
            await user.ban({ reason });
            await interaction.reply({ content: `✅ ${user.user.tag} a été banni. Raison : ${reason}` });
        } catch (error) {
            await interaction.reply({ content: '❌ Impossible de bannir ce membre.', ephemeral: true });
            console.error(error);
        }
    }
};
