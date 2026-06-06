const fs = require('fs');
const dbPath = './database.json';

let handler = async (m, { conn, args }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    let upgradeType = args[0];

    if (!user || !user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    if (!upgradeType) {
        return conn.reply(m.chat, 'Pilih jenis upgrade yang ingin dilakukan:\nContoh: *.guildupgrade level*\n\n pilihan: *level, elixir, treasure, guardian, attack*', m);
    }

    if (!guild.staff.includes(userId) && guild.owner !== userId) {
        return conn.reply(m.chat, 'Hanya Owner atau Staff yang boleh meng-upgrade fasilitas guild.', m);
    }

    switch (upgradeType.toLowerCase()) {
        case 'level':
            if (user.money < 5000000000) return conn.reply(m.chat, 'Kamu tidak memiliki cukup money. Butuh 5.000.000.000 money.', m);
            guild.level++;
            user.money -= 5000000000;
            conn.reply(m.chat, `Level guild *${guild.name}* telah ditingkatkan menjadi *Level ${guild.level}*.`, m);
            break;
        case 'elixir':
            if (user.money < 1000000000) return conn.reply(m.chat, 'Kamu tidak memiliki cukup money. Butuh 1.000.000.000 money.', m);
            guild.elixir++;
            user.money -= 1000000000;
            conn.reply(m.chat, `Kapasitas Elixir guild *${guild.name}* naik menjadi *${guild.elixir}*.`, m);
            break;
        case 'treasure':
            if (user.money < 2000000000) return conn.reply(m.chat, 'Kamu tidak memiliki cukup money. Butuh 2.000.000.000 money.', m);
            guild.treasure++;
            user.money -= 2000000000;
            conn.reply(m.chat, `Kapasitas Harta/Treasure guild *${guild.name}* naik menjadi *${guild.treasure}*.`, m);
            break;
        case 'guardian':
            if (user.money < 3000000000) return conn.reply(m.chat, 'Kamu tidak memiliki cukup money. Butuh 3.000.000.000 money.', m);
            guild.guardian = (guild.guardian || 0) + 1;
            user.money -= 3000000000;
            conn.reply(m.chat, `Pertahanan Guardian guild *${guild.name}* naik menjadi *Level ${guild.guardian}*.`, m);
            break;
        case 'attack':
            if (user.money < 4000000000) return conn.reply(m.chat, 'Kamu tidak memiliki cukup money. Butuh 4.000.000.000 money.', m);
            guild.attack++;
            user.money -= 4000000000;
            conn.reply(m.chat, `Kekuatan Attack guild *${guild.name}* dinaikkan menjadi *+${guild.attack}*.`, m);
            break;
        default:
            conn.reply(m.chat, 'Jenis upgrade tidak valid. Pilih antara: *level, elixir, treasure, guardian, attack*', m);
            return;
    }

    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2));
};

handler.help = ['guildupgrade <jenis>'];
handler.tags = ['rpgG'];
handler.command = /^(guildupgrade)$/i;
handler.rpg = true;
module.exports = handler;
