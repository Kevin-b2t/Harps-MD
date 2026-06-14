const { generateLeaderboardImage } = require('../lib/group-totalchat');

let handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('Fitur ini hanya bisa digunakan di dalam grup!');

  m.reply('⏳ Memproses leaderboard...');

  try {
    // ========================
    // UBAH INI JADI true KALAU SUDAH ADA DATA REAL
    const hasRealData = false;
    // ========================

    if (hasRealData) {
      // Generate gambar baru otomatis
      const data = {
        totalMembers: participants.length,
        pernahChat: 180,
        belumChat: participants.length - 180,
        totalPesan: 12480,
        membersScanned: participants.length,
        topMembers: [
          { rank: 1, phone: '6281234567890', username: '@user1', messageCount: 2450 },
          // ... isi sampai rank 10
        ]
      };
      const buffer = await generateLeaderboardImage(data);
      await conn.sendMessage(m.chat, { image: buffer, caption: '📊 Top Chat Leaderboard (Update)' }, { quoted: m });
    } else {
      // Kirim gambar dari folder media
      await conn.sendMessage(m.chat, {
        image: { url: './media/totalchat.png' },   // ← GANTI NAMA FILE SESUAI YANG KAMU TARUH
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