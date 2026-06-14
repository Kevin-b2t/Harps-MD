const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

let handler = async (m, { conn }) => {
    if (!m.isGroup) throw 'Perintah ini hanya bisa digunakan di grup!';

    const data = global.db.data.totalchat || {};
    const chatData = data[m.chat] || {};
    
    const entries = Object.entries(chatData);
    if (entries.length === 0) return m.reply('📭 Belum ada data chat untuk grup ini.');

    m.reply('⏳ Sedang melukis lingkaran persen dan bar statistik...');

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

        // Load gambar background dari folder media
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
        ctx.font = 'bold 18px "Courier New", monospace'; 
        ctx.textAlign = 'right'; 
        ctx.fillText(`[ ${totalMembers} MEMBERS SCANNED ]`, canvas.width - 50, 75); 

        // ==========================================
        // 2. EMPAT KOTAK STATISTIK (DIBIKIN DETAIL BANGET)
        // ==========================================
        // Hitung persentase
        let activePct = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
        let inactivePct = totalMembers > 0 ? Math.round((inactiveMembers / totalMembers) * 100) : 0;

        // Data Array 4 Kotak (Warna disesuaikan persis gambar)
        const stats = [
            { val: totalMembers.toString(), pct: 100, color: '#3498DB' },         // M (Biru)
            { val: activeMembers.toString(), pct: activePct, color: '#2ECC71' },  // C (Hijau)
            { val: inactiveMembers.toString(), pct: inactivePct, color: '#F1948A'}, // X (Pink)
            { val: totalMessages.toLocaleString('en-US'), pct: 100, color: '#F4D03F' } // P (Kuning)
        ];

        // KOORDINAT MASTER UNTUK 4 KOTAK (Ubah di sini untuk geser semua)
        const startBoxX = 135;      // Posisi X untuk Teks Angka kotak PERTAMA
        const boxGap = 246;         // Jarak / spasi antar kotak ke kanan
        const boxY = 195;           // Posisi Y (tinggi) untuk Teks Angka
        
        const circleOffsetX = 90;   // Jarak lingkaran di sebelah kanan angka
        const circleOffsetY = -8;   // Naik-turunnya lingkaran (relatif ke angka)
        const circleRadius = 22;    // Ukuran lingkaran
        
        const barOffsetX = -50;     // Tarik ujung kiri baris ke arah kiri angka
        const barOffsetY = 38;      // Turunnya baris di bawah angka
        const barWidth = 165;       // Panjang total baris abu-abu di bawah

        for (let i = 0; i < 4; i++) {
            let stat = stats[i];
            let currentX = startBoxX + (i * boxGap);

            // A. Gambar Teks Angka Utama (Rata Kiri)
            ctx.textAlign = 'left';
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 36px Arial'; 
            ctx.fillText(stat.val, currentX, boxY);

            // Koordinat pusat lingkaran
            let cX = currentX + circleOffsetX;
            let cY = boxY + circleOffsetY;

            // B. Gambar Lingkaran Dasar (Abu-abu muda)
            ctx.beginPath();
            ctx.arc(cX, cY, circleRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#EAEAEA';
            ctx.lineWidth = 4;
            ctx.stroke();

            // C. Gambar Lingkaran Progress (Warna)
            ctx.beginPath();
            let startAngle = Math.PI * 1.5; // Mulai dari atas (jam 12)
            let endAngle = startAngle + (stat.pct / 100) * (2 * Math.PI);
            ctx.arc(cX, cY, circleRadius, startAngle, endAngle);
            ctx.strokeStyle = stat.color;
            ctx.stroke();

            // D. Gambar Teks Persen di Tengah Lingkaran
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle'; // Penting biar teks pas di tengah vertikal
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(`${stat.pct}%`, cX, cY);
            ctx.textBaseline = 'alphabetic'; // Balikin ke normal

            // E. Gambar Baris Dasar Bawah (Abu-abu muda)
            let bX = currentX + barOffsetX;
            let bY = boxY + barOffsetY;
            ctx.fillStyle = '#EAEAEA';
            ctx.fillRect(bX, bY, barWidth, 6);

            // F. Gambar Baris Progress Bawah (Warna)
            ctx.fillStyle = stat.color;
            ctx.fillRect(bX, bY, barWidth * (stat.pct / 100), 6);
        }

        // ==========================================
        // 3. DAFTAR LEADERBOARD BAWAH
        // ==========================================
        const startY = 370;     
        const gapY = 66.5;        
        const nameX = 100;      // Posisi teks
        const barStartX = 320;  // Posisi mulai balok warna warni
        const countX = canvas.width - 50; 
        const maxBarWidth = 420; 

        const barColors = ['#F4D03F', '#5DADE2', '#F1948A', '#48C9B0', '#AF7AC5', '#EB984E', '#5DADE2', '#F4D03F', '#F1948A', '#48C9B0'];

        for (let i = 0; i < users.length; i++) {
            const [jid, count] = users[i];
            const currentY = startY + (i * gapY);
            let noWa = jid.split('@')[0];
            
            // Teks Nomor WA (Besar)
            ctx.textAlign = 'left';
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 22px Arial'; 
            let displayWa = noWa.length > 15 ? noWa.substring(0, 15) + '...' : noWa;
            ctx.fillText(displayWa, nameX, currentY);

            // Sub-teks @nomor (Kecil di bawahnya, sesuai referensi gambar)
            ctx.fillStyle = '#7F8C8D';
            ctx.font = '12px Arial';
            ctx.fillText(`@${displayWa}`, nameX, currentY + 16);

            // Gambar Balok
            let barWidth = (count / maxMessages) * maxBarWidth; 
            ctx.fillStyle = barColors[i] || '#BDC3C7';
            ctx.fillRect(barStartX, currentY - 10, barWidth, 14); 

            // Angka Jumlah Pesan
            ctx.textAlign = 'right'; 
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(count.toLocaleString('en-US'), countX, currentY);
        }

        const imageBuffer = canvas.toBuffer('image/png');
        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: '🏆 *LEADERBOARD TOTAL CHAT GRUP* 🏆\n\nDesain presisi tinggi sudah siap bos!' 
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
