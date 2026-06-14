const { generateLeaderboardImage } = require('../lib/group-totalchat');

let handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('Fitur ini hanya bisa digunakan di dalam grup!');

  m.reply('⏳ Memproses leaderboard...');

  try {
    // ========================
    // UBAH JADI true KALAU SUDAH ADA DATA REAL
    const hasRealData = false;
    // ========================

    if (hasRealData) {
      // Generate otomatis (nanti diisi data real)
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
      // Kirim gambar dari media
      await conn.sendMessage(m.chat, {
        image: { url: './media/totalchat.png' },
        caption: '📊 *TOP CHAT LEADERBOARD*\n\n_Saat ini masih menggunakan gambar statis._'
      }, { quoted: m });
    }
  } catch (e) {
    console.error(e);
    m.reply('❌ Gagal memproses leaderboard.');
  }
};

handler.help = ['totalchat'];
handler.tags = ['group'];
handler.command = /^(totalchat|leaderboard|topchat)$/i;
handler.group = true;

module.exports = handler;