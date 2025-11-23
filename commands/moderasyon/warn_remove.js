const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
const { getWarns, removeWarn, getWarnCount } = require(process.cwd() + '/utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn_remove')
        .setDescription('Remove the last warning from a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove last warning from')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const user = interaction.options.getUser('user');
        const guildId = interaction.guild.id;
        const userId = user.id;
        
        // Get user's warnings from database
        const warns = await getWarns(guildId, userId);
        
        if (warns.length === 0) {
            return interaction.reply({ content: `❌ ${user.tag} has no warnings.`, ephemeral: true });
        }
        
        // Remove the last warning
        const lastWarn = warns[warns.length - 1];
        try {
            await removeWarn(guildId, userId, lastWarn.id);
            await interaction.reply({ content: `✅ Last warning removed from ${user.tag}.`, ephemeral: true });
        } catch (error) {
            console.error('Warn removal error:', error);
            await interaction.reply({ content: `❌ Failed to remove warning from ${user.tag}.`, ephemeral: true });
        }
    },
};