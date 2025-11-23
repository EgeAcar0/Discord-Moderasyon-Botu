const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode for a text channel.')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Slowmode duration in seconds (0 to disable)')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to set slowmode (default: current channel)')
                .setRequired(false)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const seconds = interaction.options.getInteger('seconds');
        if (channel.type !== 0) { // 0 = GUILD_TEXT
            return interaction.reply({ content: '❌ This command can only be used on text channels.', ephemeral: true });
        }
        if (seconds < 0 || seconds > 21600) {
            return interaction.reply({ content: '❌ Slowmode must be between 0 and 21600 seconds.', ephemeral: true });
        }
        await channel.setRateLimitPerUser(seconds);
        await interaction.reply({ content: `🐢 Slowmode for ${channel.name} set to ${seconds} seconds.`, ephemeral: false });
    },
}; 