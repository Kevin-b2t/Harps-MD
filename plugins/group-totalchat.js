const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

// ==========================================
// 1. DAFTARKAN FONT CUSTOM DARI FOLDER /src/font
// ==========================================
// Ganti '99HandWritting.ttf' dengan nama file font yang mau kamu pakai dari Pterodactyl
const fontFileName = '99HandWritting.ttf'; 
const customFontPath = path.join(__dirname, '../src/font', fontFileName);

// Cek apakah file font ada, lalu daftarkan dengan nama 'CustomFont'
if (fs.existsSync(customFontPath)) {
    registerFont(customFontPath, { family: 'CustomFont' });
} else {
    console.log(`⚠️ Font ${fontFileName} tidak ditemukan di folder src/font!`);
}

let handler = async (m, { conn }) => {
    if (!m.isGroup) throw 'Perintah ini hanya bisa digunakan di grup!';

    // Ambil data dari database bot[span_1](start_span)[span_1](end_span)
    const data = global.db.data.totalchat || {};
    const chatData = data[m.chat] || {};
    
    const entries = Object.entries(chatData);
    if (entries.length === 0) {
        return m.reply('📭 Belum ada data chat untuk grup ini.');
    }

    m.reply('⏳ Sedang melukis leaderboard ke gambar, tunggu sebentar...');

    try {
        // Kalkulasi Data Statistik
        let groupMeta = await conn.groupMetadata(m.chat);
        let totalMembers = groupMeta.participants.length;
        let activeMembers = entries.length;
        let inactiveMembers = Math.max(0, totalMembers - activeMembers);
        
        let totalMessages = 0;
        for (let [jid, count] of entries) {
            totalMessages += count;
        }

        // Ambil Top 10 Member Paling Aktif[span_2](start_span)[span_2](end_span)
        let users = entries.sort((a, b) => b[1] - a[1]).slice(0, 10);
        let maxMessages = users[0][1]; 

        // Siapkan Template Kosongan
        const templateImg = path.join(__dirname, '../media/template_leaderboard.png');
        if (!fs.existsSync(templateImg)) {
            throw 'Gambar template_leaderboard.png tidak ditemukan di folder media!';
        }
        
        const background = await loadImage(templateImg);
        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');

        // Gambar background
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // ==========================================
        // 2. TERAPKAN FONT KE STATISTIK ATAS
        // ==========================================
        ctx.fillStyle = '#3498DB';
        // Format penggunaan font: 'ukuran "NamaFontYangDidaftarkan"'
        ctx.font = '24px "CustomFont"'; 
        ctx.textAlign = 'center';
        
        // Kanan Atas: Angka Members Scanned
        ctx.fillText(`${totalMembers}`, canvas.width - 200, 80); 

        // 4 Kotak Statistik (Ubah ukurannya sesuaikan dengan jenis font barumu)
        ctx.fillStyle = '#000000';
        ctx.font = '36px "CustomFont"';
        ctx.textAlign = 'left';

        let boxY = 220; 
        ctx.fillText(`${totalMembers}`, 150, boxY);                       
        ctx.fillText(`${activeMembers}`, 400, boxY);                      
        ctx.fillText(`${inactiveMembers}`, 650, boxY);                    
        ctx.fillText(`${totalMessages.toLocaleString('en-US')}`, 900, boxY); 

        // ==========================================
        // 3. TERAPKAN FONT KE NAMA DAN ANGKA
        // ==========================================
        ctx.textAlign = 'left';
        
        const startY = 400;     
        const gapY = 60;        
        const nameX = 100;      
        const barStartX = 350;  
        const countX = 900;     
        const maxBarWidth = 400; 

        const barColors = ['#F4D03F', '#5DADE2', '#F1948A', '#48C9B0', '#AF7AC5', '#EB984E', '#5DADE2', '#F4D03F', '#F1948A', '#48C9B0'];

        for (let i = 0; i < users.length; i++) {
            const [jid, count] = users[i];
            const currentY = startY + (i * gapY);
            let noWa = jid.split('@')[0];
            
            // Gambar Nomor WA pakai Font Custom
            ctx.fillStyle = '#000000';
            ctx.font = '28px "CustomFont"'; // Sesuaikan ukuran untuk nama
            ctx.fillText(noWa, nameX, currentY);

            // Gambar Balok
            let barWidth = (count / maxMessages) * maxBarWidth; 
            ctx.fillStyle = barColors[i] || '#BDC3C7';
            ctx.fillRect(barStartX, currentY - 20, barWidth, 20); 

            // Gambar Angka Pesan pakai Font Custom
            ctx.fillStyle = '#000000';
            ctx.font = '28px "CustomFont"'; // Sesuaikan ukuran untuk angka
            ctx.fillText(count.toLocaleString('en-US'), countX, currentY);
        }

        // Kirim
        const imageBuffer = canvas.toBuffer('image/png');
        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: '🏆 *LEADERBOARD TOTAL CHAT GRUP* 🏆\n\nStatistik grup dengan font custom!' 
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
