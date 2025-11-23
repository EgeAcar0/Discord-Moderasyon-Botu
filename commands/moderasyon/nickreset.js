const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nickreset')
        .setDescription('Reset a user\'s nickname to their username.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to reset nickname for')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ User not found in the server.', ephemeral: true });
        }
        await member.setNickname(null).catch(() => {
            return interaction.reply({ content: '❌ Failed to reset nickname. Do I have the right permissions?', ephemeral: true });
        });
        await interaction.reply({ content: `✅ ${user.tag}'s nickname has been reset.`, ephemeral: true });
    },
}; 