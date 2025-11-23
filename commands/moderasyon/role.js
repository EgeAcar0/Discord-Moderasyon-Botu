const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Toggle a role for a user: add if missing, remove if present.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to toggle role for')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to toggle')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ User not found in the server.', ephemeral: true });
        }
        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            await interaction.reply({ content: `✅ ${role.name} removed from ${user.tag}.`, ephemeral: true });
        } else {
            await member.roles.add(role);
            await interaction.reply({ content: `✅ ${role.name} added to ${user.tag}.`, ephemeral: true });
        }
    },
}; 