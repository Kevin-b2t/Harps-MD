const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn, args }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    
    if (!user || !user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild (Owner) yang bisa mempromosikan anggota.', m);

    let target = m.mentionedJid[0] || args[0];
    if (!target) return conn.reply(m.chat, 'Tag anggota yang ingin kamu promosikan menjadi staff.', m);

    if (!guild.members.includes(target)) return conn.reply(m.chat, 'User tersebut bukan bagian dari anggota guild kamu.', m);
    if (guild.staff.includes(target)) return conn.reply(m.chat, 'User tersebut sudah menjabat sebagai staff.', m);

    guild.staff.push(target);
    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));

    conn.reply(m.chat, `🎉 Selamat, @${target.split('@')[0]} telah dipromosikan menjadi *Staff Guild* di ${guild.name}!`, m, { mentions: [target] });
};

handler.help = ['guildpromote <@user>'];
handler.tags = ['rpgG'];
handler.command = /^(guildpromote)$/i;
handler.rpg = true;
module.exports = handler;
