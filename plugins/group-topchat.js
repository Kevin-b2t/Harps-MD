const { generateLeaderboard } = require('../group-totalchat');

let handler = async (m, { conn }) => {
    if (!m.isGroup) throw 'Perintah ini hanya bisa digunakan di dalam grup!';
    
    m.reply('⏳ Sedang memproses leaderboard...');
    
    try {
        const imageBuffer = await generateLeaderboard(m.chat);
        
        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: '🏆 *LEADERBOARD TOTAL CHAT GRUP* 🏆\n\nTetap aktif dan jadilah yang teratas!' 
        }, { quoted: m });
        
    } catch (error) {
        m.reply(`❌ Gagal: ${error.message}`);
    }
}

handler.help = ['topchat'];
handler.tags = ['group'];
handler.command = /^(topchat|leaderboard)$/i;
handler.group = true;

module.exports = handler;
