const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

// Ganti sesuai nama font lu di Pterodactyl
const fontFileName = '99HandWritting.ttf'; 
const customFontPath = path.join(__dirname, '../src/font', fontFileName);

if (fs.existsSync(customFontPath)) {
    registerFont(customFontPath, { family: 'CustomFont' });
} else {
    console.log(`⚠️ Font ${fontFileName} tidak ditemukan di folder src/font!`);
}

let handler = async (m, { conn }) => {
    if (!m.isGroup) throw 'Perintah ini hanya bisa digunakan di grup!';

    const data = global.db.data.totalchat || {};
    const chatData = data[m.chat] || {};
    
    const entries = Object.entries(chatData);
    if (entries.length === 0) return m.reply('📭 Belum ada data chat untuk grup ini.');

    m.reply('⏳ Memperbaiki posisi dan melukis leaderboard...');

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

        const templateImg = path.join(__dirname, '../media/template_leaderboard.png');
        if (!fs.existsSync(templateImg)) throw 'Gambar template_leaderboard.png tidak ditemukan!';
        
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
        // Ngepasin angka di atas tanda '---'
        ctx.fillText(`${totalMembers}`, canvas.width - 240, 83); 

        // ==========================================
        // 2. EMPAT KOTAK STATISTIK (M, C, X, P)
        // ==========================================
        ctx.fillStyle = '#000000';
        ctx.font = '32px "CustomFont"';
        // PENTING: Pakai center biar angka ada di tengah-tengah area putih
        ctx.textAlign = 'center'; 

        let boxY = 225; // Tingginya dinaikin dikit
        ctx.fillText(`${totalMembers}`, 175, boxY);                       
        ctx.fillText(`${activeMembers}`, 410, boxY);                      
        ctx.fillText(`${inactiveMembers}`, 645, boxY);                    
        ctx.fillText(`${totalMessages.toLocaleString('en-US')}`, 875, boxY); 

        // ==========================================
        // 3. DAFTAR LEADERBOARD & BALOK
        // ==========================================
        // Koordinat udah diukur ulang biar nggak nabrak
        const startY = 385;     // Baris pertama dinaikin dikit
        const gapY = 66.5;      // Jarak antar baris dilebarin dikit biar gak merosot
        const nameX = 110;      // Posisi teks nomor WA
        const barStartX = 425;  // Balok dimulai SETELAH avatar (nggak nabrak lagi)
        const countX = canvas.width - 50; // Posisi teks jumlah pesan ditarik ke paling kanan
        const maxBarWidth = 380; // Panjang maksimal balok

        const barColors = ['#F4D03F', '#5DADE2', '#F1948A', '#48C9B0', '#AF7AC5', '#EB984E', '#5DADE2', '#F4D03F', '#F1948A', '#48C9B0'];

        for (let i = 0; i < users.length; i++) {
            const [jid, count] = users[i];
            const currentY = startY + (i * gapY);
            let noWa = jid.split('@')[0];
            
            // A. Gambar Teks Nomor WA (Rata Kiri)
            ctx.textAlign = 'left';
            ctx.fillStyle = '#000000';
            ctx.font = '24px "CustomFont"'; // Ukuran dikecilin dikit biar gak kepanjangan
            // Limit panjang teks supaya nggak bablas ke avatar kalau ada nama yg panjang
            let displayWa = noWa.length > 13 ? noWa.substring(0, 13) + '...' : noWa;
            ctx.fillText(displayWa, nameX, currentY);

            // B. Gambar Balok (Diubah posisinya dan ditipisin)
            let barWidth = (count / maxMessages) * maxBarWidth; 
            ctx.fillStyle = barColors[i] || '#BDC3C7';
            // fillRect(X, Y, Lebar, Tinggi) -> Tingginya jadi 12 biar pas nutupin garis abu-abu
            ctx.fillRect(barStartX, currentY - 14, barWidth, 12); 

            // C. Gambar Angka Jumlah Pesan (Rata Kanan)
            ctx.textAlign = 'right'; // PENTING: Rata kanan biar teks numbuh ke kiri, bukan ke kanan
            ctx.fillStyle = '#000000';
            ctx.font = '26px "CustomFont"';
            ctx.fillText(count.toLocaleString('en-US'), countX, currentY);
        }

        const imageBuffer = canvas.toBuffer('image/png');
        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: '🏆 *LEADERBOARD TOTAL CHAT GRUP* 🏆\n\nSudah dirapikan, silakan cek bos!' 
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
