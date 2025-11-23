const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config.json');

function getConfig() {
    if (!fs.existsSync(configPath)) return {};
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modlog')
        .setDescription('Set the modlog channel for moderation logs.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to use for modlog')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const channel = interaction.options.getChannel('channel');
        if (channel.type !== 0) { // 0 = GUILD_TEXT
            return interaction.reply({ content: '❌ Please select a text channel.', ephemeral: true });
        }
        const config = getConfig();
        const guildId = interaction.guild.id;
        config[guildId] = config[guildId] || {};
        config[guildId].modlogChannelId = channel.id;
        saveConfig(config);
        await interaction.reply({ content: `📝 Modlog channel set to ${channel.name}.`, ephemeral: false });
    },
}; 