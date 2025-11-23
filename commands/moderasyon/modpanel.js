const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modpanel')
        .setDescription('Show the moderation panel (buttons and user select).'),
    async execute(interaction) {
        if (!isAuthorized(interaction.member)) {
            return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
        }
        // Fetch up to 25 members for the select menu
        const members = await interaction.guild.members.fetch({ limit: 25 });
        const userOptions = members.map(m => ({
            label: m.user.tag,
            value: m.user.id,
            description: m.nickname || m.user.username,
            emoji: '👤'
        })).slice(0, 25);
        const userSelect = new StringSelectMenuBuilder()
            .setCustomId('modpanel_user')
            .setPlaceholder('Select a user')
            .addOptions(userOptions);
        const actionsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('modpanel_ban').setLabel('Ban').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('modpanel_kick').setLabel('Kick').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('modpanel_timeout').setLabel('Timeout').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('modpanel_warn').setLabel('Warn').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('modpanel_mute').setLabel('Yazılı Sustur').setStyle(ButtonStyle.Secondary)
        );
        const actionsRow2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('modpanel_nickreset').setLabel('Nick Reset').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('modpanel_temizle').setLabel('Temizle').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('modpanel_lock').setLabel('Lock').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('modpanel_unlock').setLabel('Unlock').setStyle(ButtonStyle.Primary)
        );
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Moderasyon Paneli')
            .setDescription('Önce kullanıcıyı seç, sonra bir işlem butonuna tıkla.')
            .setColor(0x5865F2);
        await interaction.reply({ embeds: [embed], components: [
            new ActionRowBuilder().addComponents(userSelect),
            actionsRow,
            actionsRow2
        ], ephemeral: true });
    },
}; 