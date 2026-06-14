const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

let handler = async (m, { conn }) => {
    if (!m.isGroup) throw 'Perintah ini hanya bisa digunakan di grup!';

    // 1. Ambil data dari database bot yang sudah terbukti jalan
    const data = global.db.data.totalchat || {};
    const chatData = data[m.chat] || {};
    
    const entries = Object.entries(chatData);
    if (entries.length === 0) {
        return m.reply('📭 Belum ada data chat untuk grup ini.');
    }

    m.reply('⏳ Sedang melukis leaderboard ke gambar, tunggu sebentar...');

    try {
        // 2. Ambil Top 10 Member Paling Aktif
        let users = entries.sort((a, b) => b[1] - a[1]).slice(0, 10);

        // 3. Siapkan Template Gambar (Pastikan foldernya benar)
        // Ini akan mencari folder 'media' yang ada di luar folder 'plugins'
        const templateImg = path.join(__dirname, '../media/template_leaderboard.png');
        if (!fs.existsSync(templateImg)) {
            throw 'Gambar template_leaderboard.png tidak ditemukan di folder media!';
        }
        
        const background = await loadImage(templateImg);
        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');

        // 4. Mulai Menggambar
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 28px "Courier New", Courier, monospace'; 
        ctx.fillStyle = '#000000'; // Warna teks hitam

        // Koordinat (Sesuaikan jika teksnya kurang pas di kotak)
        const startY = 320; 
        const gapY = 60;    
        const nameX = 350;  
        const countX = 850; 

        // 5. Tulis Nama dan Jumlah Pesan
        for (let i = 0; i < users.length; i++) {
            const [jid, count] = users[i];
            const currentY = startY + (i * gapY);
            
            // Ambil nama kontak dari bot, jika tidak ada pakai nomor WA
            let displayName = await conn.getName(jid) || jid.split('@')[0];
            if (displayName.length > 15) displayName = displayName.substring(0, 15) + '...';
            
            ctx.fillText(displayName, nameX, currentY);
            ctx.fillText(`${count} Msg`, countX, currentY);
        }

        // 6. Kirim Gambar ke WhatsApp
        const imageBuffer = canvas.toBuffer('image/png');
        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: '🏆 *LEADERBOARD TOTAL CHAT GRUP* 🏆\n\nVersi gambar nih bos!' 
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`❌ Gagal membuat gambar:\n\n${e.message}`);
    }
};

handler.help = ['topgambar'];
handler.tags = ['group'];
handler.command = /^(topgambar)$/i;
handler.group = true;

module.exports = handler;
