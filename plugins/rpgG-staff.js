const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn, args }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    
    if (!user || !user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild (Owner) yang bisa mengatur staff.', m);

    if (!args[0]) return conn.reply(m.chat, 'Format salah. Contoh penggunaan:\n*.guildstaff tambah @user*\n*.guildstaff hapus @user*', m);

    let action = args[0].toLowerCase();
    let target = m.mentionedJid[0] || args[1];

    if (!target) return conn.reply(m.chat, 'Tag/Sebutkan user yang ingin diatur status staff-nya.', m);

    if (action === 'tambah') {
        if (!guild.members.includes(target)) return conn.reply(m.chat, 'User tersebut bukan bagian dari anggota guild Anda.', m);
        if (guild.staff.includes(target)) return conn.reply(m.chat, 'User tersebut sudah menjabat sebagai staff.', m);

        guild.staff.push(target);
        conn.reply(m.chat, `🎉 @${target.split('@')[0]} telah berhasil ditambahkan sebagai *Staff Guild* di ${guild.name}.`, m, { mentions: [target] });
    } else if (action === 'hapus') {
        if (!guild.staff.includes(target)) return conn.reply(m.chat, 'User tersebut tidak ada di dalam jajaran staff guild.', m);

        guild.staff = guild.staff.filter(staff => staff !== target);
        conn.reply(m.chat, `🛡️ @${target.split('@')[0]} telah dicopot jabatannya dari staff guild ${guild.name}.`, m, { mentions: [target] });
    } else {
        return conn.reply(m.chat, 'Aksi tidak valid. Pilih antara *tambah* atau *hapus*.\nContoh: *.guildstaff tambah @user*', m);
    }

    // Menyimpan perubahan ke database agar permanen
    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
};

handler.help = ['guildstaff tambah/hapus @user'];
handler.tags = ['rpgG'];
handler.command = /^(guildstaff)$/i;
handler.rpg = true;
module.exports = handler;
