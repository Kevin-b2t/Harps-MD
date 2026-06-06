const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn }) => {
    let userId = m.sender;
    
    // Cari guild yang memiliki user ini di waitingRoom-nya
    let guilds = Object.keys(global.db.data.guilds);
    let found = false;

    for (let id of guilds) {
        let guild = global.db.data.guilds[id];
        if (guild.waitingRoom.includes(userId)) {
            guild.waitingRoom = guild.waitingRoom.filter(room => room !== userId);
            found = true;
        }
    }

    if (!found) return conn.reply(m.chat, 'Kamu tidak ada di daftar antrean/undangan guild manapun.', m);

    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
    conn.reply(m.chat, 'Kamu telah keluar/menolak antrean dari daftar waiting room guild.', m);
};

handler.help = ['guilddecline'];
handler.tags = ['rpgG'];
handler.command = /^(guilddecline)$/i;
handler.rpg = true;
module.exports = handler;
