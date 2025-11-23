const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Show info about yourself or a specified user.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to show info for')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        const embed = new EmbedBuilder()
            .setTitle(`👤 User Info: ${user.tag}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'User ID', value: user.id, inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp/1000)}:F>`, inline: true },
                { name: 'Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp/1000)}:F>` : 'N/A', inline: true }
            )
            .setColor(0x5865F2);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
}; 