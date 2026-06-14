const { generateLeaderboardImage } = require('../lib/group-totalchat');

let handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('Fitur ini hanya bisa digunakan di dalam grup!');

  m.reply('⏳ Memproses leaderboard...');

  try {
    const hasRealData = false; // ubah jadi true kalau sudah ada data real

    if (hasRealData) {
      const data = {
        totalMembers: participants.length,
        pernahChat: 0,
        belumChat: participants.length,
        totalPesan: 0,
        membersScanned: participants.length,
        topMembers: Array.from({ length: 10 }, (_, i) => ({
          rank: i + 1,
          phone: '-',
          username: '-',
          messageCount: 0
        }))
      };
      const buffer = await generateLeaderboardImage(data);
      await conn.sendMessage(m.chat, { image: buffer, caption: '📊 Top Chat Leaderboard' }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: './media/totalchat.png' },
        caption: '📊 *TOP CHAT LEADERBOARD*'
      }, { quoted: m });
    }
  } catch (e) {
    console.error(e);
    m.reply('❌ Gagal memproses leaderboard.');
  }
};

handler.help = ['totalchatimg'];
handler.tags = ['group'];
handler.command = /^(totalchatimg|leaderboardimg)$/i;   // ← Command baru
handler.group = true;

module.exports = handler;