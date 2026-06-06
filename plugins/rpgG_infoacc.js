let handler = async (m, { conn, args }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];

    if (!user || !user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    let membersList = guild.members.map((member, idx) => `• ${idx + 1}. @${member.split('@')[0]}`).join('\n');
    let guildInfo = `Nama Guild: ${guild.name}
Level: ${guild.level}
Pemilik: @${guild.owner.split('@')[0]}
Anggota:
${membersList}

Eksperience Guild: ${guild.exp} / 1000
Elixir: ${guild.elixir}
Harta: ${guild.treasure}
Guardian: ${guild.guardian || '-'}
Attack: ${guild.attack}
Staff: ${guild.staff.length > 0 ? guild.staff.map(stf => `• @${stf.split('@')[0]}`).join('\n') : '-'}
Waiting Room: ${guild.waitingRoom.length > 0 ? guild.waitingRoom.map(rm => `• @${rm.split('@')[0]}`).join('\n') : '-'}
Dibuat Pada: ${guild.createdAt}`;

    conn.reply(m.chat, guildInfo, m, { mentions: [guild.owner, ...guild.members] });
};

handler.help = ['guildinfoacc'];
handler.tags = ['rpgG'];
handler.command = /^(guildinfoacc)$/i;
handler.rpg = true;
module.exports = handler;
