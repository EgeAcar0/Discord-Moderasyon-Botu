const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a text channel for everyone.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to lock (default: current channel)')
                .setRequired(false)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        if (channel.type !== 0) { // 0 = GUILD_TEXT
            return interaction.reply({ content: '❌ This command can only be used on text channels.', ephemeral: true });
        }
        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: false });
        await interaction.reply({ content: `🔒 ${channel.name} has been locked.`, ephemeral: false });
    },
}; 