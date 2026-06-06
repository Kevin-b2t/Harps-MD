let handler = async (m, { conn, args }) => {
    let target = m.mentionedJid[0] || m.sender;

    let user = global.db.data.users[target];
    if (!user || !user.guild) return conn.reply(m.chat, 'Pengguna ini tidak tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    let membersList = guild.members.map((member, idx) => `• ${idx + 1}. @${member.split('@')[0]}`).join('\n');
    let guildInfo = `亗 *NAMA GUILD:* ${guild.name}
亗 *Level:* ${guild.level}
亗 *Pemilik:* @${guild.owner.split('@')[0]}
亗 *Anggota:*
${membersList}

亗 *Guild EXP:* ${guild.exp} / 1000
亗 *Elixir:* ${guild.elixir}
亗 *Harta:* ${guild.treasure}
亗 *Guardian:* ${guild.guardian || '-'}
亗 *Attack:* ${guild.attack}
亗 *Staff:* ${guild.staff.length > 0 ? guild.staff.map(stf => `• @${stf.split('@')[0]}`).join('\n') : '-'}
亗 *Waiting Room:* ${guild.waitingRoom.length > 0 ? guild.waitingRoom.map(rm => `• @${rm.split('@')[0]}`).join('\n') : '-'}
亗 *Dibuat Pada:* ${guild.createdAt}`;

    // Ambil semua jid untuk ditaruh di mentions agar tag biru aktif
    let allMentions = [guild.owner, ...guild.members, ...guild.staff, ...guild.waitingRoom];
    conn.reply(m.chat, guildInfo, m, { mentions: allMentions });
};

handler.help = ['guildinfo [@user]'];
handler.tags = ['rpgG'];
handler.command = /^(guildinfo)$/i;
handler.rpg = true;
module.exports = handler;
