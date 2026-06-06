const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn, args }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    let target = m.mentionedJid[0] || args[0];

    if (!user || !user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    if (!target) return conn.reply(m.chat, `Tag user yang ingin kamu undang ke guild ${guild.name}.`, m);

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild yang bisa mengundang.', m);

    if (!global.db.data.users[target]) global.db.data.users[target] = { guild: null, money: 0, exp: 0, guild_exp: 0 };
    if (global.db.data.users[target].guild) return conn.reply(m.chat, 'User sudah tergabung dalam guild lain.', m);

    if (guild.waitingRoom.includes(target)) return conn.reply(m.chat, 'User sudah ada di dalam daftar undangan.', m);

    guild.waitingRoom.push(target);
    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
    
    conn.reply(m.chat, `@${target.split('@')[0]} kamu telah diundang ke guild *${guild.name}*. Silakan tunggu konfirmasi atau gunakan perintah terima undangan.`, m, { mentions: [target] });
};

handler.help = ['guildinvite <@user>'];
handler.tags = ['rpgG'];
handler.command = /^(guildinvite)$/i;
handler.rpg = true;
module.exports = handler;
