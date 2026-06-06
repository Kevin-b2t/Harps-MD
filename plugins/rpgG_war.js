const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn, args, usedPrefix }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    
    if (!user || !user.guild) return conn.reply(m.chat, 'Kamu belum bergabung dengan guild manapun.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild Anda tidak ditemukan.', m);

    if (guild.owner !== userId && !guild.staff.includes(userId)) {
        return conn.reply(m.chat, 'Hanya Owner atau Staff yang bisa memulai perang antar guild.', m);
    }

    if (!args[0]) return conn.reply(m.chat, `Masukkan nama guild lawan yang ingin ditantang.\nContoh: *${usedPrefix}guildwar NamaLawan*`, m);

    let enemyGuildName = args.join(' ');
    let enemyEntries = Object.entries(global.db.data.guilds).find(([id, g]) => g.name.toLowerCase() === enemyGuildName.toLowerCase() && id !== guildId);

    if (!enemyEntries) return conn.reply(m.chat, 'Guild lawan tidak ditemukan atau Anda mencoba menantang guild sendiri.', m);
    let [enemyGuildId, enemyGuild] = enemyEntries;

    conn.reply(m.chat, `⚔️ *GUILD WAR DECLARED!* ⚔️\n\nGuild *${guild.name}* secara resmi menantang *${enemyGuild.name}*!\n\nPertempuran sengit akan segera dikalkulasi...`, m);

    setTimeout(() => {
        // Kalkulasi kekuatan berbasis status upgrade level + attack
        let powerMyGuild = (guild.level * 10) + (guild.attack * 5) + Math.floor(Math.random() * 20);
        let powerEnemyGuild = (enemyGuild.level * 10) + (enemyGuild.attack * 5) + Math.floor(Math.random() * 20);

        if (powerMyGuild > powerEnemyGuild) {
            let winExp = 150;
            guild.exp += winExp;
            guild.treasure += 10;
            enemyGuild.treasure = Math.max(0, enemyGuild.treasure - 10);

            conn.reply(m.chat, `🏆 *PERANG SELESAI!* 🏆\n\nGuild *${guild.name}* Menang telak melawan *${enemyGuild.name}*!\n\nHadiah diperoleh:\n✨ +${winExp} Guild EXP\n👑 +10 Treasure dari kas lawan.`, m);
        } else if (powerMyGuild < powerEnemyGuild) {
            let loseExp = 30;
            guild.exp = (guild.exp || 0) + loseExp;
            enemyGuild.treasure += 5;
            guild.treasure = Math.max(0, guild.treasure - 5);

            conn.reply(m.chat, `❌ *PERANG SELESAI!* ❌\n\nGuild *${guild.name}* mengalami kekalahan melawan *${enemyGuild.name}*.\n\nKerugian:\n👑 -5 Treasure dirampas oleh pihak lawan.`, m);
        } else {
            conn.reply(m.chat, `🤝 *HASIL SERI!* 🤝\nPertempuran antar kedua guild berakhir imbang tanpa ada kerugian harta.`, m);
        }

        fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
    }, 5000);
};

handler.help = ['guildwar <nama_guild>', 'guildwaracc <nama_guild>'];
handler.tags = ['rpgG'];
handler.command = /^(guildwar|guildwaracc)$/i;
handler.rpg = true;
module.exports = handler;
