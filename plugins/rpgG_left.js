const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    
    if (!user || !user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    // Filter keluar dari daftar member dan staff
    guild.members = guild.members.filter(member => member !== userId);
    guild.staff = guild.staff.filter(staff => staff !== userId);
    user.guild = null;

    let extraMsg = '';
    // Jika owner yang keluar, oper jabatan ke staff/member lain, atau bubarkan jika sendirian
    if (guild.owner === userId) {
        if (guild.members.length > 0) {
            let nextOwner = guild.staff[0] || guild.members[0];
            guild.owner = nextOwner;
            extraMsg = `\n\n⚠️ Karena Owner keluar, kepemilikan guild *${guild.name}* otomatis dialihkan kepada @${nextOwner.split('@')[0]}.`;
        } else {
            delete global.db.data.guilds[guildId];
            extraMsg = `\n\nℹ️ Guild *${guild.name}* otomatis dibubarkan karena tidak memiliki anggota tersisa.`;
        }
    }

    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
    conn.reply(m.chat, `Kamu telah berhasil keluar dari guild *${guild.name}*.${extraMsg}`, m, { mentions: guild.members });
};

handler.help = ['guildleave'];
handler.tags = ['rpgG'];
handler.command = /^(guildleave)$/i;
handler.rpg = true;
module.exports = handler;
