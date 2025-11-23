require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const commands = [];
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
    if (!command.data) {
        console.warn(`${file} komutunda data alanı yok, atlanıyor.`);
        continue;
    }
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🔁 Slash komutlar yükleniyor...");

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log("✅ Slash komutlar başarıyla yüklendi.");
    } catch (error) {
        console.error("❌ Slash komut yüklenemedi:", error);
    }
})();
