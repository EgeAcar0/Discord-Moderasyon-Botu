const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move a user to a different voice channel.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to move')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Target voice channel')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const user = interaction.options.getUser('user');
        const channel = interaction.options.getChannel('channel');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ User not found in the server.', ephemeral: true });
        }
        if (!member.voice.channel) {
            return interaction.reply({ content: '❌ User is not in a voice channel.', ephemeral: true });
        }
        if (channel.type !== 2) { // 2 = GUILD_VOICE
            return interaction.reply({ content: '❌ The selected channel is not a voice channel.', ephemeral: true });
        }
        try {
            await member.voice.setChannel(channel);
            await interaction.reply({ content: `✅ ${user.tag} has been moved to ${channel.name}.`, ephemeral: true });
        } catch (err) {
            await interaction.reply({ content: '❌ Failed to move the user. Do I have the right permissions?', ephemeral: true });
        }
    },
}; 