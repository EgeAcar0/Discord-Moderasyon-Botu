const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Send an announcement to a channel.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Announcement message')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send the announcement (default: current channel)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('everyone')
                .setDescription('Mention @everyone?')
                .setRequired(false)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const message = interaction.options.getString('message');
        const everyone = interaction.options.getBoolean('everyone');
        let content = message;
        if (everyone) content = '@everyone\n' + content;
        await channel.send({ content });
        await interaction.reply({ content: `📢 Announcement sent to ${channel.name}.`, ephemeral: true });
    },
}; 