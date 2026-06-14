const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

// ==========================================
// PENGATURAN FONT DI FOLDER MEDIA
// ==========================================
// Ganti nama font ini sesuai dengan yang lu upload ke folder media
const fontFileName = '99HandWritting.ttf'; 
const customFontPath = path.join(__dirname, '../media', fontFileName);

if (fs.existsSync(customFontPath)) {
    registerFont(customFontPath, { family: 'CustomFont' });
} else {
    console.log(`⚠️ Font ${fontFileName} tidak ditemukan di folder media!`);
}

let handler = async (m, { conn }) => {
    if (!m.isGroup) throw 'Perintah ini hanya bisa digunakan di grup!';

    const data = global.db.data.totalchat || {};
    const chatData = data[m.chat] || {};
    
    const entries = Object.entries(chatData);
    if (entries.length === 0) return m.reply('📭 Belum ada data chat untuk grup ini.');

    m.reply('⏳ Sedang melukis leaderboard dengan font dari folder media...');

    try {
        let groupMeta = await conn.groupMetadata(m.chat);
        let totalMembers = groupMeta.participants.length;
        let activeMembers = entries.length;
        let inactiveMembers = Math.max(0, totalMembers - activeMembers);
        
        let totalMessages = 0;
        for (let [jid, count] of entries) {
            totalMessages += count;
        }

        let users = entries.sort((a, b) => b[1] - a[1]).slice(0, 10);
        let maxMessages = users[0][1]; 

        // Load gambar template dari folder media
        const templateImg = path.join(__dirname, '../media/template_leaderboard.png');
        if (!fs.existsSync(templateImg)) throw 'Gambar template_leaderboard.png tidak ditemukan di folder media!';
        
        const background = await loadImage(templateImg);
        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // ==========================================
        // 1. STATISTIK KANAN ATAS (MEMBERS SCANNED)
        // ==========================================
        ctx.fillStyle = '#3498DB';
        ctx.font = '22px "CustomFont"'; 
        ctx.textAlign = 'center'; 
        ctx.fillText(`${totalMembers}`, canvas.width - 280, 83); 

        // ==========================================
        // 2. EMPAT KOTAK STATISTIK (M, C, X, P)
        // ==========================================
        ctx.fillStyle = '#000000';
        ctx.font = '32px "CustomFont"';
        ctx.textAlign = 'center'; 

        let boxY = 225; 
        ctx.fillText(`${totalMembers}`, 150, boxY);                       
        ctx.fillText(`${activeMembers}`, 400, boxY);                      
        ctx.fillText(`${inactiveMembers}`, 650, boxY);                    
        ctx.fillText(`${totalMessages.toLocaleString('en-US')}`, 900, boxY); 

        // ==========================================
        // 3. DAFTAR LEADERBOARD & BALOK
        // ==========================================
        const startY = 390;     
        const gapY = 66;        
        const nameX = 60;       
        const barStartX = 410;  
        const countX = canvas.width - 40; 
        const maxBarWidth = 350; 

        const barColors = ['#F4D03F', '#5DADE2', '#F1948A', '#48C9B0', '#AF7AC5', '#EB984E', '#5DADE2', '#F4D03F', '#F1948A', '#48C9B0'];

        for (let i = 0; i < users.length; i++) {
            const [jid, count] = users[i];
            const currentY = startY + (i * gapY);
            let noWa = jid.split('@')[0];
            
            // A. Teks Nomor WA (KIRI)
            ctx.textAlign = 'left';
            ctx.fillStyle = '#000000';
            ctx.font = '22px "CustomFont"'; 
            let displayWa = noWa.length > 12 ? noWa.substring(0, 12) + '...' : noWa;
            ctx.fillText(displayWa, nameX, currentY);

            // B. Balok Progress (TENGAH)
            let barWidth = (count / maxMessages) * maxBarWidth; 
            ctx.fillStyle = barColors[i] || '#BDC3C7';
            ctx.fillRect(barStartX, currentY - 14, barWidth, 12); 

            // C. Angka Jumlah Pesan (KANAN)
            ctx.textAlign = 'right'; 
            ctx.fillStyle = '#000000';
            ctx.font = '24px "CustomFont"';
            ctx.fillText(count.toLocaleString('en-US'), countX, currentY);
        }

        const imageBuffer = canvas.toBuffer('image/png');
        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: '🏆 *LEADERBOARD TOTAL CHAT GRUP* 🏆\n\nMantap, font dan gambar udah nyatu di folder media!' 
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
