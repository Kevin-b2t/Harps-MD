let handler = async (m, { conn }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];

    if (!user || !user.guild) {
        return conn.reply(m.chat, 'Kamu belum tergabung dalam guild. Gunakan *.joinguild <nomor>* untuk bergabung ke guild atau buat guild baru dengan *.createguild <nama_guild>*.', m);
    }

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan di database.', m);

    let membersList = guild.members.map((member, idx) => `• ${idx + 1}. @${member.split('@')[0]}`).join('\n');
    let guildInfo = `亗 *STATUS PROFILE GUILD* 亗

亗 *Nama Guild:* ${guild.name}
亗 *Level:* ${guild.level}
亗 *Pemilik:* @${guild.owner.split('@')[0]}
亗 *Anggota:*
${membersList}

亗 *Guild EXP:* ${guild.exp} / 1000
亗 *Elixir:* 💧 ${guild.elixir}
亗 *Harta:* 👑 ${guild.treasure}
亗 *Guardian:* 🛡️ ${guild.guardian || '-'}
亗 *Attack Pwr:* ⚔️ ${guild.attack}
亗 *Staff:* ${guild.staff.length > 0 ? guild.staff.map(staff => `@${staff.split('@')[0]}`).join(', ') : '-'}
亗 *Waiting Room:* ${guild.waitingRoom.length > 0 ? guild.waitingRoom.map(room => `@${room.split('@')[0]}`).join(', ') : '-'}
亗 *Dibuat Pada:* ${guild.createdAt.split('T')[0]}`;

    conn.reply(m.chat, guildInfo, m, { mentions: [guild.owner, ...guild.members] });
};

handler.help = ['guild'];
handler.tags = ['rpgG'];
handler.command = /^(guild)$/i;
handler.rpg = true;
module.exports = handler;
