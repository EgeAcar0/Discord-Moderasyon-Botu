const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('List all server roles and member counts.'),
    async execute(interaction) {
        const roles = interaction.guild.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => `• <@&${role.id}> — ${role.members.size} üye`)
            .join('\n');
        const embed = new EmbedBuilder()
            .setTitle(`📜 Roles in ${interaction.guild.name}`)
            .setDescription(roles.length > 0 ? roles : 'No roles found.')
            .setColor(0xED4245);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
}; 