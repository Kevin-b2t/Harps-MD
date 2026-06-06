const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn, args }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];

    if (!user || !user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild mana pun.', m);

    // Kumpulkan semua ID guild dan objeknya
    let guildEntries = Object.entries(global.db.data.guilds);
    if (guildEntries.length === 0) return conn.reply(m.chat, 'Tidak ada guild yang tersedia untuk dihapus.', m);

    let guildList = guildEntries.map(( [id, g], index) => `${index + 1}. ${g.name} (Owner: @${g.owner.split('@')[0]})`).join('\n');
    let responseText = `Pilih guild yang ingin dihapus dengan mengetik nomor guild:\nContoh: *.delguild 1*\n\n${guildList}`;

    if (args.length < 1) return conn.reply(m.chat, responseText, m, { mentions: guildEntries.map(([_, g]) => g.owner) });

    let guildIndex = parseInt(args[0]) - 1;
    if (isNaN(guildIndex) || guildIndex < 0 || guildIndex >= guildEntries.length) {
        return conn.reply(m.chat, 'Nomor guild tidak valid.', m);
    }

    let [selectedId, selectedGuild] = guildEntries[guildIndex];

    if (selectedGuild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild tersebut yang bisa menghapusnya.', m);

    // Hapus referensi guild dari setiap anggota yang ada di dalam guild tersebut
    selectedGuild.members.forEach(memberId => {
        if (global.db.data.users[memberId]) {
            global.db.data.users[memberId].guild = null;
        }
    });

    // Hapus guild menggunakan ID Unik-nya
    delete global.db.data.guilds[selectedId];

    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
    conn.reply(m.chat, `Guild *${selectedGuild.name}* berhasil dibubarkan dan dihapus.`, m);
};

handler.help = ['delguild <nomor_guild>'];
handler.tags = ['rpgG'];
handler.command = /^(delguild)$/i;
handler.rpg = true;
module.exports = handler;
