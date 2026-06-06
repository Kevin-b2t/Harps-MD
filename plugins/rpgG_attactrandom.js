const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user || !user.guild) return conn.reply(m.chat, 'Anda harus bergabung dengan sebuah guild untuk menyerang.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild Anda tidak ditemukan di database.', m);

    if (guild.owner !== m.sender && !guild.staff.includes(m.sender)) {
        return conn.reply(m.chat, 'Anda tidak memiliki izin (bukan Owner/Staff) untuk menyerang guild lawan.', m);
    }

    let attackedGuildId = getRandomGuildId(guildId); 
    if (!attackedGuildId) {
        return conn.reply(m.chat, 'Tidak ada guild lawan yang dapat diserang saat ini (butuh minimal 2 guild di database).', m);
    }

    let attackedGuild = global.db.data.guilds[attackedGuildId];

    conn.reply(m.chat, '🔎 Mencari Guild Aktif...', m);

    setTimeout(async () => {
        conn.reply(m.chat, `⚔️ Menemukan Guild Lawan: *${attackedGuild.name}*`, m);
        await sleep(2000); 

        let itemName = getRandomItemName(); 
        conn.reply(m.chat, `🚀 Memulai Penyerangan Menggunakan *${itemName}*!`, m);
        await sleep(3000); 

        conn.reply(m.chat, `🔥 *${guild.name}* VS *${attackedGuild.name}* 🔥\n\nPertempuran sedang berlangsung, mohon tunggu hasilnya...`, m);
        
        // Waktu tunggu disimulasikan singkat (10-20 detik) agar user tidak mengira bot macet/hang.
        // Jika ingin merubah ke menit silakan ubah angka di bawah ini.
        await sleep(getRandomInt(10000, 20000)); 

        // Penentuan Pemenang secara Acak (50:50) atau berdasarkan kalkulasi status
        let winChance = Math.random() > 0.5;
        let result = '';
        let elixirStolen = 0;
        let treasureStolen = 0;

        if (winChance) {
            result = `🏆 *${guild.name} WIN!*`;
            elixirStolen = Math.floor(attackedGuild.elixir / 2) || 10; // default dapet minimal 10 jika 0
            treasureStolen = Math.floor(attackedGuild.treasure / 2) || 5;

            attackedGuild.elixir -= Math.min(attackedGuild.elixir, elixirStolen);
            attackedGuild.treasure -= Math.min(attackedGuild.treasure, treasureStolen);
            
            guild.elixir += elixirStolen;
            guild.treasure += treasureStolen;
            guild.exp += 50; 
        } else {
            result = `❌ *${guild.name} LOSE!*`;
            elixirStolen = Math.floor(guild.elixir / 4) || 0;
            treasureStolen = Math.floor(guild.treasure / 4) || 0;

            guild.elixir -= Math.min(guild.elixir, elixirStolen);
            guild.treasure -= Math.min(guild.treasure, treasureStolen);

            attackedGuild.elixir += elixirStolen;
            attackedGuild.treasure += treasureStolen;
        }

        fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));

        conn.reply(m.chat, `${result}\n\n${winChance ? `🎉 Berhasil merampas:\n💧 +${elixirStolen} Elixir\n👑 +${treasureStolen} Harta dari ${attackedGuild.name}` : `😭 Kamu kalah dan kehilangan:\n💧 -${elixirStolen} Elixir\n👑 -${treasureStolen} Harta`}`, m);
    }, 3000); 
};

function getRandomGuildId(currentGuildId) {
    let guildIds = Object.keys(global.db.data.guilds || {});
    let filteredGuildIds = guildIds.filter(id => id !== currentGuildId);
    if (filteredGuildIds.length === 0) return null;
    let randomIndex = getRandomInt(0, filteredGuildIds.length - 1);
    return filteredGuildIds[randomIndex];
}

function getRandomItemName() {
    let items = ['Excalibur Sword', 'Ancient Dragon Spell', 'Catapult Artillery', 'Shadow Knight Elixir'];
    return items[getRandomInt(0, items.length - 1)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

handler.help = ['attackguild'];
handler.tags = ['rpgG'];
handler.command = /^attackguild$/i;
handler.rpg = true;
module.exports = handler;
