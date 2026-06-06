let handler = async (m, { conn }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];
    
    if (!user || !user.guild) return conn.reply(m.chat, 'Kamu belum bergabung ke dalam guild manapun.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Data guild kamu tidak ditemukan.', m);

    let membersList = guild.members.map((member, idx) => `  • ${idx + 1}. @${member.split('@')[0]}`).join('\n');
    let guildInfo = `🏰 *GUILD PROFILE SAYA* 🏰

• *Nama Guild:* ${guild.name}
• *Level Guild:* ${guild.level}
• *Owner:* @${guild.owner.split('@')[0]}

👥 *Daftar Anggota:*
${membersList}

• *Guild EXP:* ${guild.exp} / 1000
• *Elixir:* 💧 ${guild.elixir}
• *Treasure:* 👑 ${guild.treasure}
• *Guardian:* 🛡️ ${guild.guardian || '-'}
• *Attack Pwr:* ⚔️ ${guild.attack}

• *Staff:* ${guild.staff.length > 0 ? guild.staff.map(stf => `@${stf.split('@')[0]}`).join(', ') : '-'}
• *Dibuat Pada:* ${guild.createdAt.split('T')[0]}`;

    conn.reply(m.chat, guildInfo, m, { mentions: [guild.owner, ...guild.members] });
};

handler.help = ['myguild'];
handler.tags = ['rpgG'];
handler.command = /^(myguild)$/i;
handler.rpg = true;
module.exports = handler;
