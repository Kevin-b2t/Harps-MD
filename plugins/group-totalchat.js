const { generateLeaderboard } = require('../group-totalchat');

let handler = async (m, { conn }) => {
    if (!m.isGroup) throw 'Perintah ini hanya bisa digunakan di dalam grup!';
    
    m.reply('⏳ Sedang menggambar leaderboard, mohon tunggu sebentar...');
    
    try {
        // Proses generate gambar dari Canvas
        const imageBuffer = await generateLeaderboard(m.chat);
        
        // Mengirimkan hasil gambar ke WhatsApp (Format Baileys MD)
        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: '🏆 *LEADERBOARD TOTAL CHAT GRUP* 🏆\n\nSiapa yang paling aktif di grup ini?' 
        }, { quoted: m });
        
    } catch (error) {
        console.error(error);
        m.reply(`❌ Gagal menampilkan gambar leaderboard:\n\n${error.message}`);
    }
}

handler.help = ['topgambar'];
handler.tags = ['group'];
// COMMAND KITA UBAH JADI topgambar AGAR TIDAK BENTROK
handler.command = /^(topgambar|leaderboardgambar)$/i; 
handler.group = true;

module.exports = handler;
