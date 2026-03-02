require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { validateUserId, validateRoleId, validateChannelId, validateReason, sanitizeInput } = require('./utils/validation');
const { checkRateLimit } = require('./utils/rateLimit');
const { initDatabase } = require('./utils/database');
const { checkAntiSpam } = require('./utils/antiSpam');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites
    ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
function getAllCommandFiles(dir, files = []) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getAllCommandFiles(fullPath, files);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    });
    return files;
}
const commandFiles = getAllCommandFiles(commandsPath);
for (const file of commandFiles) {
    const command = require(file);
    client.commands.set(command.data.name, command);
}

const ayarlar = require('./ayarlar.json');
const { addWarn, getWarnCount, getKayit } = require('./utils/database');

const profanityList = [
    'amk', 'aq', 'orospu', 'sik', 'piç', 'yarrak', 'ananı', 'anan', 'amına', 'göt', 'mal', 'salak', 'gerizekalı', 'sikik', 'amcık', 'pezevenk', 'kahpe', 'ibne', 'döl', 'sürtük', 'oç', 'mk', 'sg', 'siktir', 'sikerim', 'amk', 'amq', 'amına koyim', 'amına koyayım', 'amk', 'amq', 'amına koyayım', 'amına koyim', 'ameka'
];

// Davet log sistemi
const invitesCache = new Map();

client.once("ready", async () => {
    console.log(`✅ Bot çalışıyor: ${client.user.tag}`);
    
    // Initialize database
    try {
        await initDatabase();
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    }
    
    // Fetch invites
    (async () => {
        for (const [guildId, guild] of client.guilds.cache) {
            const invites = await guild.invites.fetch().catch(() => null);
            if (invites) invitesCache.set(guildId, invites);
        }
    })();
});
client.on('inviteCreate', async invite => {
    const invites = await invite.guild.invites.fetch().catch(() => null);
    if (invites) invitesCache.set(invite.guild.id, invites);
});
client.on('inviteDelete', async invite => {
    const invites = await invite.guild.invites.fetch().catch(() => null);
    if (invites) invitesCache.set(invite.guild.id, invites);
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // Rate limiting kontrolü
    const rateLimit = checkRateLimit(interaction.user.id, interaction.commandName, 5, 60000);
    if (!rateLimit.allowed) {
        const timeRemaining = Math.ceil(rateLimit.timeRemaining / 1000);
        await interaction.reply({ 
            content: `⏱️ Bu komutu çok sık kullanıyorsunuz. ${timeRemaining} saniye bekleyin.`, 
            ephemeral: true 
        });
        return;
    }

    // Komut kullanımını logla
    try {
        const ayarlar = require('./ayarlar.json');
        const config = ayarlar[interaction.guildId] || {};
        if (config.olayLogKanalId) {
            const logChannel = interaction.guild.channels.cache.get(config.olayLogKanalId);
            if (logChannel) {
                logChannel.send({ content: `📝 ${interaction.user.tag} (${interaction.user.id}) komut kullandı: /${interaction.commandName}` });
            }
        }
    } catch (e) { /* ignore */ }

    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        // Detaylı error loglama
        const errorInfo = {
            command: interaction.commandName,
            user: `${interaction.user.tag} (${interaction.user.id})`,
            guild: `${interaction.guild.name} (${interaction.guild.id})`,
            channel: `${interaction.channel.name} (${interaction.channel.id})`,
            time: new Date().toISOString(),
            error: error.message,
            stack: error.stack
        };
        
        // Console'a detaylı log
        console.error('=== KOMUT HATASI ===');
        console.error(JSON.stringify(errorInfo, null, 2));
        console.error('===================');
        
        // Log kanalına bildir
        try {
            const ayarlar = require('./ayarlar.json');
            const config = ayarlar[interaction.guildId] || {};
            if (config.olayLogKanalId) {
                const logChannel = interaction.guild.channels.cache.get(config.olayLogKanalId);
                if (logChannel) {
                    const logMessage = `🚨 **Komut Hatası**\n**Komut:** /${interaction.commandName}\n**Kullanıcı:** ${interaction.user.tag}\n**Hata:** ${error.message}\n**Zaman:** ${new Date().toLocaleString('tr-TR')}`;
                    await logChannel.send({ content: logMessage });
                }
            }
        } catch (logError) {
            console.error('Log kanalına bildirim gönderilemedi:', logError.message);
        }
        
        // User-friendly mesaj
        const userMessages = {
            'Missing Permissions': '❌ Bu komutu kullanmak için yetkiniz yok.',
            'Unknown Guild': '❌ Sunucu bilgisi alınamadı.',
            'Unknown Member': '❌ Kullanıcı bilgisi alınamadı.',
            'Unknown Channel': '❌ Kanal bilgisi alınamadı.',
            'Timeout': '❌ İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.',
            'default': '❌ Komut çalıştırılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
        };
        
        const errorMessage = userMessages[error.message] || userMessages['default'];
        
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        } catch (replyError) {
            console.error('Kullanıcıya hata mesajı gönderilemedi:', replyError.message);
        }
    }
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;
    
    const guildId = message.guild.id;
    const config = ayarlar[guildId] || {};
    
    // Check if user has mute role
    if (config.susturulmusRolId && message.member.roles.cache.has(config.susturulmusRolId)) {
        await message.delete().catch(() => {});
        
        // Send DM to user (like warnings.js ephemeral)
        try {
            await message.author.send(`🔇 Susturuldun! Mesaj gönderemezsin.`);
        } catch (error) {
            console.error('Mute DM gönderilemedi:', error.message);
        }
        return;
    }
    
    // Rate limiting for messages
    const rateLimit = checkRateLimit(message.author.id, "message", 10, 60000);
    if (!rateLimit.allowed) {
        await message.delete().catch(() => {});
        try {
            await message.author.send('⏱️ Çok fazla mesaj atıyorsunuz. Lütfen yavaşlayın.');
        } catch {}
        return;
    }
    
    // Anti-spam and content filtering
    const antiSpamResult = await checkAntiSpam(message, config);
    if (!antiSpamResult.allowed) {
        // Handle different actions
        if (antiSpamResult.action === 'delete') {
            await message.delete().catch(() => {});
        }
        
        // Send warning message
        try {
            await message.channel.send(`${message.author}, ${antiSpamResult.message}`);
        } catch (error) {
            console.error('Anti-spam warning failed:', error.message);
        }
        
        // Log to event log channel
        if (config.olayLogKanalId) {
            const logChannel = message.guild.channels.cache.get(config.olayLogKanalId);
            if (logChannel) {
                logChannel.send({ 
                    content: `🚨 ${message.author.tag} (${message.author.id}) ${antiSpamResult.reason} tespit edildi. Mesaj: "${message.content.substring(0, 50)}..."` 
                });
            }
        }
        return;
    }
    
    const lower = message.content.toLowerCase();
    if (profanityList.some(word => lower.includes(word))) {
        await message.delete().catch(() => {});
        
        // Kanala uyarı mesajı
        
        
        // Warn escalation with database
        const userId = message.author.id;
        const warnCount = await getWarnCount(guildId, userId);
        
        // Add warn to database
        
        
        // Uyarı rolleri sistemi
        const newWarnCount = await getWarnCount(guildId, userId);
        const member = await message.guild.members.fetch(userId).catch(() => null);
        
        if (member) {
            // Önceki tüm uyarı rollerini kaldır
            const warnRoles = [config.uyariRol1Id, config.uyariRol2Id, config.uyariRol3Id];
            for (const roleId of warnRoles) {
                if (roleId && member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId).catch(() => {});
                }
            }
            
            // Yeni uyarı seviyesine göre rol ver
            
        }
        // Log to event log channel
        
    }
});

// Olay log fonksiyonu
function sendEventLog(guild, content) {
    const config = ayarlar[guild.id] || {};
    if (config.olayLogKanalId) {
        const logChannel = guild.channels.cache.get(config.olayLogKanalId);
        if (logChannel) {
            logChannel.send({ content });
        }
    }
}

// Mesaj silme
client.on('messageDelete', async message => {
    if (!message.guild || message.partial) return;
    sendEventLog(message.guild, `🗑️ Message deleted in <#${message.channel.id}> by ${message.author ? message.author.tag : 'unknown'}: ${message.content || '[embed/attachment]'} (ID: ${message.id})`);
});

// Kullanıcı adı veya takma ad değişikliği
client.on('userUpdate', async (oldUser, newUser) => {
    if (oldUser.username !== newUser.username) {
        client.guilds.cache.forEach(guild => {
            const member = guild.members.cache.get(newUser.id);
            if (member) {
                sendEventLog(guild, `✏️ Username changed: ${oldUser.tag} → ${newUser.tag}`);
            }
        });
    }
});
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.nickname !== newMember.nickname) {
        sendEventLog(newMember.guild, `✏️ Nickname changed: ${oldMember.user.tag} (${oldMember.nickname || oldMember.user.username}) → ${newMember.nickname || newMember.user.username}`);
    }
    // Rol değişimi
    const oldRoles = oldMember.roles.cache.map(r => r.id);
    const newRoles = newMember.roles.cache.map(r => r.id);
    if (oldRoles.length !== newRoles.length || !oldRoles.every(r => newRoles.includes(r))) {
        const added = newRoles.filter(r => !oldRoles.includes(r));
        const removed = oldRoles.filter(r => !newRoles.includes(r));
        if (added.length > 0) {
            sendEventLog(
                newMember.guild,
                `➕ Role(s) added to ${newMember.user.tag}: ${added
                    .map(rid => newMember.guild.roles.cache.get(rid)?.name || rid)
                    .join(', ')}`
            );
        }
        
        if (removed.length > 0) {
            sendEventLog(
                newMember.guild,
                `➖ Role(s) removed from ${newMember.user.tag}: ${removed
                    .map(rid => newMember.guild.roles.cache.get(rid)?.name || rid)
                    .join(', ')}`
            );
        }
        
    }
});
// Sunucuya giriş/çıkış
client.on('guildMemberAdd', async member => {
    // Olay log (mevcut)
    sendEventLog(member.guild, `✅ ${member.user.tag} joined the server.`);
    
    // Davet log (mevcut)
    const config = ayarlar[member.guild.id] || {};
    if (config.davetLogKanalId) {
        const prevInvites = invitesCache.get(member.guild.id) || new Map();
        const newInvites = await member.guild.invites.fetch().catch(() => null);
        if (newInvites) invitesCache.set(member.guild.id, newInvites);
        let usedInvite = null;
        for (const [code, invite] of newInvites) {
            const prevInvite = prevInvites.get(code);
            if (!prevInvite || invite.uses > prevInvite.uses) {
                usedInvite = invite;
                break;
            }
        }
        const logChannel = member.guild.channels.cache.get(config.davetLogKanalId);
        if (logChannel) {
            if (usedInvite) {
                logChannel.send({ content: `📨 ${member.user.tag} joined using invite code \`${usedInvite.code}\` (created by ${usedInvite.inviter ? usedInvite.inviter.tag : 'unknown'}). Uses: ${usedInvite.uses}` });
            } else {
                logChannel.send({ content: `📨 ${member.user.tag} joined, but the invite code could not be determined.` });
            }
        }
    }
    
    // Otomatik rol sistemi (yeni)
    if (config.ilkRolId) {
        const role = member.guild.roles.cache.get(config.ilkRolId);
        if (role) {
            await member.roles.add(role).catch(() => {});
        } else {
            console.log(`⚠️ ilkRolId bulunamadı: ${config.ilkRolId}`);
        }
    }
    
    // Kayıtsız rolü ver (mevcut)
    const kayitAyar = await getKayit(member.guild.id);
    if (kayitAyar && kayitAyar.giris_rol_id) {
        const role = member.guild.roles.cache.get(kayitAyar.giris_rol_id);
        if (role) {
            await member.roles.add(role).catch(() => {});
        }
    }
});
client.on('guildMemberRemove', member => {
    sendEventLog(member.guild, `❌ ${member.user.tag} left the server.`);
});

client.login(process.env.TOKEN);