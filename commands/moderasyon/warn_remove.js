const { SlashCommandBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
const fs = require('fs');
const path = require('path');
const warnsPath = path.join(__dirname, '../../warns.json');

function getWarns() {
    if (!fs.existsSync(warnsPath)) return {};
    return JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
}
function saveWarns(warns) {
    fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn_remove')
        .setDescription('Remove the last warning from a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove last warning from')
                .setRequired(true)),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        const user = interaction.options.getUser('user');
        const warns = getWarns();
        const guildId = interaction.guild.id;
        const userId = user.id;
        warns[guildId] = warns[guildId] || {};
        warns[guildId][userId] = warns[guildId][userId] || [];
        if (warns[guildId][userId].length === 0) {
            return interaction.reply({ content: `❌ ${user.tag} has no warnings.`, ephemeral: true });
        }
        const removed = warns[guildId][userId].pop();
        saveWarns(warns);
        await interaction.reply({ content: `✅ Last warning removed from ${user.tag}.`, ephemeral: true });
    },
}; 