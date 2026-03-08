const { SlashCommandBuilder, Options, EmbedBuilder, MessageFlags } = require('discord.js');
const { isAuthorized } = require(process.cwd() + '/utils/permissions');
const ayarlar = require(process.cwd() + '/ayarlar.json');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('paraonay')
        .setDescription('Para alındığını onayla.')
        .addUserOption(option =>
            option.setName('kullanıcı')
            .setDescription('Para Alınan Kullanıcı')
            .setRequired(true))
    
    
        .addUserOption(option =>
            option.setName('alan')
            .setDescription('Parayı alan yetkili')
            .setRequired(true))

    
        .addChannelOption(option =>
            option.setName('kanal')
            .setDescription('Para Onay Kanalı')
            .setRequired(false)),
    async execute(interaction){
        if (!isAuthorized(interaction.member)){
            return interaction.reply({ content: '❌ Yetkin Yok.', flags: [MessageFlags.Ephemeral] });
        }
        const kullanici = interaction.options.getUser('kullanıcı');
        const alan = interaction.options.getUser('alan');
        const kanal = interaction.options.getChannel('kanal') || interaction.guild.channels.cache.get(ayarlar[interaction.guild.id].paraOnayKanalId);
        if(!kanal) return interaction.reply({ content: '❌ Para onay kanalı ayarlanmamış.', flags: [MessageFlags.Ephemeral] });
        let embed = new EmbedBuilder()
            .setTitle('Para Onay')
            .setDescription(`Para onaylandı.
            Kullanıcı: ${kullanici}
            Alan: ${alan}`)
            .setColor('Green')
            .setTimestamp();
        await kanal.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Para onaylandı.', flags: [MessageFlags.Ephemeral] });

    
    }
    
}