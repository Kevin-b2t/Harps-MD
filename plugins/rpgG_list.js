let handler = async (m, { conn }) => {
    if (!global.db.data.guilds || Object.keys(global.db.data.guilds).length === 0) {
        return conn.reply(m.chat, 'Belum ada guild yang terdaftar di database.', m);
    }

    let guilds = Object.values(global.db.data.guilds);
    let guildList = guilds.map((guild, idx) => `👑 ${idx + 1}. *${guild.name}* [Lv.${guild.level}] (${guild.members.length} Member)`).join('\n');

    conn.reply(m.chat, `亗 *PUBLIC GUILD LIST* 亗\n\n${guildList}\n\nKetik *.joinguild <nomor>* untuk mendaftar masuk.`, m);
};

handler.help = ['guildlist', 'guildlistacc'];
handler.tags = ['rpgG'];
handler.command = /^(guildlist|guildlistacc)$/i;
handler.rpg = true;
module.exports = handler;
