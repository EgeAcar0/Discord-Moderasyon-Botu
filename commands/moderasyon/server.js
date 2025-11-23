const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Show info about the server.'),
    async execute(interaction) {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner();
        const embed = new EmbedBuilder()
            .setTitle(`🌐 Server Info: ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Owner', value: `${owner.user.tag} (${owner.id})`, inline: true },
                { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp/1000)}:F>`, inline: true },
                { name: 'Members', value: `${guild.memberCount}`, inline: true },
                { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true }
            )
            .setColor(0x57F287);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
}; 