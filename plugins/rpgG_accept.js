const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user || !user.guild) return conn.reply(m.chat, 'Anda tidak berada dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    // Cek apakah penginput adalah owner atau staff guild
    if (guild.owner !== m.sender && !guild.staff.includes(m.sender)) {
        return conn.reply(m.chat, 'Anda tidak memiliki izin (harus Owner/Staff) untuk melakukan ini.', m);
    }

    let target = m.mentionedJid[0];
    if (!target) return conn.reply(m.chat, 'Tag user yang ingin Anda terima di guild.', m);

    let targetUser = global.db.data.users[target];
    if (!targetUser || targetUser.guildRequest !== guildId) {
        return conn.reply(m.chat, 'Tidak ada permintaan bergabung yang tertunda dari pengguna ini ke guild Anda.', m);
    }

    if (targetUser.guild) return conn.reply(m.chat, 'Pengguna tersebut sudah bergabung dengan guild lain.', m);

    guild.members.push(target);
    targetUser.guild = guildId;
    delete targetUser.guildRequest;

    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
    conn.reply(m.chat, `Permintaan bergabung dari @${target.split('@')[0]} telah diterima.`, m, { mentions: [target] });
};

handler.help = ['guildaccept @user'];
handler.tags = ['rpgG'];
handler.command = /^(guildaccept)$/i;
handler.rpg = true;
module.exports = handler;
