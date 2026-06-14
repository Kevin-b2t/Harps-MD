const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

let handler = async (m, { conn }) => {
    if (!m.isGroup) throw 'Perintah ini hanya bisa digunakan di grup!';

    const data = global.db.data.totalchat || {};
    const chatData = data[m.chat] || {};
    
    const entries = Object.entries(chatData);
    if (entries.length === 0) return m.reply('📭 Belum ada data chat untuk grup ini.');

    m.reply('⏳ Mengunci koordinat presisi dan melukis leaderboard...');

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
        // 1. STATISTIK KANAN ATAS (CUMA ANGKA)
        // ==========================================
        ctx.fillStyle = '#3498DB';
        ctx.font = 'bold 20px "Courier New", monospace'; 
        ctx.textAlign = 'center'; 
        // Hanya cetak angka, ditimpa pas di atas '---'
        ctx.fillText(`${totalMembers}`, canvas.width - 250, 72); 

        // ==========================================
        // 2. EMPAT KOTAK STATISTIK (KOORDINAT MANUAL KUNCI)
        // ==========================================
        let activePct = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
        let inactivePct = totalMembers > 0 ? Math.round((inactiveMembers / totalMembers) * 100) : 0;

        // Kita tentukan titik TENGAH (Center X) dari masing-masing kotak putih secara manual
        const boxes = [
            { centerX: 155, val: totalMembers.toString(), pct: 100, color: '#3498DB' },         // M
            { centerX: 385, val: activeMembers.toString(), pct: activePct, color: '#2ECC71' },  // C
            { centerX: 620, val: inactiveMembers.toString(), pct: inactivePct, color: '#F1948A'}, // X
            { centerX: 855, val: totalMessages.toLocaleString('en-US'), pct: 100, color: '#F4D03F' } // P
        ];

        const boxY = 175;           // Tinggi rata-rata untuk teks angka (diturunin biar gak nabrak atas)
        const circleRadius = 18;    // Lingkaran dikecilin dikit biar gak nabrak garis kotak
        const barWidth = 160;       // Panjang garis bawah dikecilin biar pas di dalam kotak

        for (let i = 0; i < boxes.length; i++) {
            let box = boxes[i];

            // A. Angka Utama (Rata Tengah)
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 34px Arial'; 
            ctx.fillText(box.val, box.centerX - 10, boxY); // Digeser 10px ke kiri dikit

            // Titik tengah untuk lingkaran
            let cX = box.centerX + 65; // Lingkaran ada di sebelah kanan angka
            let cY = boxY - 10;        // Lingkaran naik dikit dari garis bawah angka

            // B. Lingkaran Dasar (Abu-abu)
            ctx.beginPath();
            ctx.arc(cX, cY, circleRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#EAEAEA';
            ctx.lineWidth = 4;
            ctx.stroke();

            // C. Lingkaran Progress (Warna)
            ctx.beginPath();
            let startAngle = Math.PI * 1.5; 
            let endAngle = startAngle + (box.pct / 100) * (2 * Math.PI);
            ctx.arc(cX, cY, circleRadius, startAngle, endAngle);
            ctx.strokeStyle = box.color;
            ctx.stroke();

            // D. Teks Persen di Tengah Lingkaran
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(`${box.pct}%`, cX, cY);
            ctx.textBaseline = 'alphabetic';

            // E. Garis Progress Bawah
            let bX = box.centerX - 85; // Tarik ujungnya ke kiri
            let bY = boxY + 40;        // Turunin ke bagian bawah kotak putih
            
            ctx.fillStyle = '#EAEAEA'; // Background abu
            ctx.fillRect(bX, bY, barWidth, 6);
            ctx.fillStyle = box.color; // Progress warna
            ctx.fillRect(bX, bY, barWidth * (box.pct / 100), 6);
        }

        // ==========================================
        // 3. DAFTAR LEADERBOARD BAWAH
        // ==========================================
        const startY = 405;       // DITURUNIN JAUH biar sejajar sama karakter Avatar
        const gapY = 66;          // Jarak turun per baris
        const nameX = 110;        // Teks Nomor
        const barStartX = 405;    // DIMUNDURIN KE KANAN biar sejajar sama kotak abu-abu template
        const countX = canvas.width - 50; 
        const maxBarWidth = 400;  // Dipendekin biar gak nembus ke kanan

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
            // Tinggi dibikin 12px aja dan posisinya diturunin (currentY - 12) biar numpuk pas di kotak abu template
            ctx.fillRect(barStartX, currentY - 12, barWidth, 12); 

            // Angka Jumlah Pesan
            ctx.textAlign = 'right'; 
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(count.toLocaleString('en-US'), countX, currentY);
        }

        const imageBuffer = canvas.toBuffer('image/png');
        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: '🏆 *LEADERBOARD TOTAL CHAT GRUP* 🏆\n\nDesain sudah dirapikan dengan koordinat manual!' 
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
