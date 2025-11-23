const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user for a specified duration.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration (minutes)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for timeout')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const user = interaction.options.getUser('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ User not found in the server.', ephemeral: true });
        }
        const ms = duration * 60 * 1000;
        try {
            await member.timeout(ms, reason);
            await interaction.reply({ content: `✅ ${user.tag} has been timed out for ${duration} minutes. Reason: ${reason}`, ephemeral: true });
        } catch (err) {
            await interaction.reply({ content: '❌ Failed to timeout the user. Do I have the right permissions?', ephemeral: true });
        }
    },
}; 