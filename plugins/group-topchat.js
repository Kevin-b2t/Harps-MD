const { generateLeaderboard } = require('../group-totalchat');

let handler = async (m, { conn }) => {
    if (!m.isGroup) throw 'Perintah ini hanya bisa digunakan di dalam grup!';
    
    m.reply('⏳ Sedang memproses leaderboard...');
    
    try {
        // Generate gambar dari file group-totalchat.js
        const imageBuffer = await generateLeaderboard(m.chat);
        
        // Kirim gambar ke grup
        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: '🏆 *LEADERBOARD TOTAL CHAT GRUP* 🏆\n\nTetap aktif dan jadilah yang teratas!' 
        }, { quoted: m });
        
    } catch (error) {
        console.error(error);
        m.reply(`❌ Gagal menampilkan leaderboard: ${error.message}`);
    }
}

handler.help = ['topchat'];
handler.tags = ['group'];
handler.command = /^(topchat|leaderboard)$/i;
handler.group = true;

module.exports = handler;
