const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

let handler = async (m, { conn }) => {
    if (!m.isGroup) throw 'Perintah ini hanya bisa digunakan di grup!';

    const data = global.db.data.totalchat || {};
    const chatData = data[m.chat] || {};
    
    const entries = Object.entries(chatData);
    if (entries.length === 0) return m.reply('📭 Belum ada data chat untuk grup ini.');

    m.reply('⏳ Finishing touch! Merapikan koordinat agar presisi 100%...');

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
        ctx.font = 'bold 20px "Courier New", monospace'; 
        ctx.textAlign = 'center'; 
        // Digeser ke kanan biar pas di atas garis '---'
        ctx.fillText(`${totalMembers}`, canvas.width - 225, 75); 

        // ==========================================
        // 2. EMPAT KOTAK STATISTIK (DITURUNIN BIAR PAS DI TENGAH PUTIH)
        // ==========================================
        let activePct = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
        let inactivePct = totalMembers > 0 ? Math.round((inactiveMembers / totalMembers) * 100) : 0;

        const boxes = [
            { centerX: 155, val: totalMembers.toString(), pct: 100, color: '#3498DB' },         // M
            { centerX: 385, val: activeMembers.toString(), pct: activePct, color: '#2ECC71' },  // C
            { centerX: 620, val: inactiveMembers.toString(), pct: inactivePct, color: '#F1948A'}, // X
            { centerX: 855, val: totalMessages.toLocaleString('en-US'), pct: 100, color: '#F4D03F' } // P
        ];

        // 🟢 PERUBAHAN UTAMA: Y-axis diturunin jauh ke bawah biar gak nabrak header kotak
        const boxY = 220;           // (Tadinya 175) Posisi teks angka diturunin 45px
        const circleRadius = 18;    
        const barWidth = 160;       

        for (let i = 0; i < boxes.length; i++) {
            let box = boxes[i];

            // A. Angka Utama
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 36px Arial'; 
            ctx.fillText(box.val, box.centerX - 15, boxY); // Digeser sikit ke kiri dari lingkaran

            // B. Lingkaran Dasar & Warna
            let cX = box.centerX + 65; 
            let cY = boxY - 10; // Posisi lingkaran ikutan turun

            ctx.beginPath();
            ctx.arc(cX, cY, circleRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#EAEAEA';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.beginPath();
            let startAngle = Math.PI * 1.5; 
            let endAngle = startAngle + (box.pct / 100) * (2 * Math.PI);
            ctx.arc(cX, cY, circleRadius, startAngle, endAngle);
            ctx.strokeStyle = box.color;
            ctx.stroke();

            // C. Teks Persen dalam Lingkaran
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(`${box.pct}%`, cX, cY);
            ctx.textBaseline = 'alphabetic';

            // D. Garis Progress Bawah (Diturunin ke dasar kotak putih)
            let bX = box.centerX - 85; 
            let bY = boxY + 35; // Turun ke area bawah kotak
            
            ctx.fillStyle = '#EAEAEA'; 
            ctx.fillRect(bX, bY, barWidth, 6);
            ctx.fillStyle = box.color; 
            ctx.fillRect(bX, bY, barWidth * (box.pct / 100), 6);
        }

        // ==========================================
        // 3. DAFTAR LEADERBOARD BAWAH
        // ==========================================
        // 🟢 PERUBAHAN UTAMA: Posisi Teks & Balok diturunin dan digeser biar gak nabrak
        const startY = 415;       // (Tadinya 405) Diturunin dikit biar persis sejajar avatar
        const gapY = 66.5;        // Spasi turun
        const nameX = 135;        // (Tadinya 110) Digeser ke kanan biar gak numbur kotak rank (01)
        const barStartX = 405;    // Posisi mulai balok (sudah pas)
        const countX = canvas.width - 50; 
        const maxBarWidth = 430;  // (Tadinya 400) Dipanjangin mentok menutupi abu-abu

        const barColors = ['#F4D03F', '#5DADE2', '#F1948A', '#48C9B0', '#AF7AC5', '#EB984E', '#5DADE2', '#F4D03F', '#F1948A', '#48C9B0'];

        for (let i = 0; i < users.length; i++) {
            const [jid, count] = users[i];
            const currentY = startY + (i * gapY);
            let noWa = jid.split('@')[0];
            
            // Teks Nomor WA 
            ctx.textAlign = 'left';
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 22px Arial'; 
            let displayWa = noWa.length > 15 ? noWa.substring(0, 15) + '...' : noWa;
            ctx.fillText(displayWa, nameX, currentY);

            // Sub-teks @nomor
            ctx.fillStyle = '#7F8C8D';
            ctx.font = '12px Arial';
            ctx.fillText(`@${displayWa}`, nameX, currentY + 16);

            // Balok Warna
            let barWidth = (count / maxMessages) * maxBarWidth; 
            ctx.fillStyle = barColors[i] || '#BDC3C7';
            // 🟢 PERUBAHAN UTAMA: Diturunin dari `currentY - 12` jadi `currentY - 6` biar nutupin bar abu-abu. Tingginya jadi 14.
            ctx.fillRect(barStartX, currentY - 6, barWidth, 14); 

            // Angka Jumlah Pesan
            ctx.textAlign = 'right'; 
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(count.toLocaleString('en-US'), countX, currentY);
        }

        const imageBuffer = canvas.toBuffer('image/png');
        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: '🏆 *LEADERBOARD TOTAL CHAT GRUP* 🏆\n\nTaraaa! Udah presisi tanpa cacat bos!' 
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
