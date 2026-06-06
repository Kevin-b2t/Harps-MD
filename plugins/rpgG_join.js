const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn, args }) => {
    let user = global.db.data.users[m.sender];
    if (!user) {
        global.db.data.users[m.sender] = { guild: null, money: 0, exp: 0, guild_exp: 0 };
        user = global.db.data.users[m.sender];
    }

    if (user.guild) return conn.reply(m.chat, 'Anda sudah bergabung dalam suatu guild. Keluar terlebih dahulu jika ingin pindah.', m);

    let guildIndex = parseInt(args[0]) - 1; 
    if (!args[0] || isNaN(guildIndex)) return conn.reply(m.chat, 'Masukkan nomor guild yang valid.\nContoh: *.joinguild 1*', m);

    let guildEntries = Object.entries(global.db.data.guilds || {});
    if (guildIndex < 0 || guildIndex >= guildEntries.length) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    let [guildId, guildData] = guildEntries[guildIndex];

    // Mengajukan permintaan join (akan di-accept oleh owner/staff di rpgG_accept.js)
    user.guildRequest = guildId;

    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));

    conn.reply(m.chat, `Permintaan bergabung ke guild *${guildData.name}* telah dikirim!\nMohon tunggu Owner atau Staff guild tersebut menerima Anda menggunakan perintah *.guildaccept*`, m);
};

handler.help = ['joinguild <nomor_guild>'];
handler.tags = ['rpgG'];
handler.command = /^(joinguild)$/i;
handler.rpg = true;
module.exports = handler;
