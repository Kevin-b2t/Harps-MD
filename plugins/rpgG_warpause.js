const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    
    if (!user || !user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    if (guild.owner !== userId && !guild.staff.includes(userId)) {
        return conn.reply(m.chat, 'Hanya Owner atau Staff yang bisa membatalkan aksi pertempuran.', m);
    }

    // Menghentikan simulasi perang secara aman
    conn.reply(m.chat, `🛡️ *BATTLE CANCELLED* 🛡️\n\nGuild *${guild.name}* telah membatalkan seluruh rencana pertempuran dan menarik mundur pasukan ke markas.`, m);
};

handler.help = ['guildwarpause'];
handler.tags = ['rpgG'];
handler.command = /^(guildwarpause)$/i;
handler.rpg = true;
module.exports = handler;
