const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove timeout from a user.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to remove timeout from')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const user = interaction.options.getUser('target');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ User not found in the server.', ephemeral: true });
        }
        try {
            await member.timeout(null);
            await interaction.reply({ content: `✅ Timeout removed from ${user.tag}.`, ephemeral: true });
        } catch (err) {
            await interaction.reply({ content: '❌ Failed to remove timeout. Do I have the right permissions?', ephemeral: true });
        }
    },
}; 