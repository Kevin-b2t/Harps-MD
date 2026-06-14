const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

let handler = async (m, { conn }) => {
    if (!m.isGroup) throw 'Perintah ini hanya bisa digunakan di grup!';

    const data = global.db.data.totalchat || {};
    const chatData = data[m.chat] || {};
    
    const entries = Object.entries(chatData);
    if (entries.length === 0) return m.reply('📭 Belum ada data chat untuk grup ini.');

    m.reply('⏳ Sedang membuat leaderboard...');

    try {
        let groupMeta = await conn.groupMetadata(m.chat);
        let totalMembers = groupMeta.participants.length;
        let activeMembers = entries.length;
        let inactiveMembers = Math.max(0, totalMembers - activeMembers);
        
        let totalMessages = 0;
        for (let [jid, count] of entries) totalMessages += count;

        let users = entries.sort((a, b) => b[1] - a[1]).slice(0, 10);
        let maxMessages = users[0][1];

        // Load background template
        const templateImg = path.join(__dirname, '../media/template_leaderboard.png');
        if (!fs.existsSync(templateImg)) throw 'Gambar template_leaderboard.png tidak ditemukan!';
        
        const background = await loadImage(templateImg);
        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // ==========================================
        // 1. MEMBERS SCANNED (kanan atas)
        // ==========================================
        ctx.fillStyle = '#3498DB';
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`[ ${totalMembers} MEMBERS SCANNED ]`, canvas.width - 50, 75);

        // ==========================================
        // 2. EMPAT KOTAK STATISTIK
        // ==========================================
        let activePct   = totalMembers > 0 ? Math.round((activeMembers   / totalMembers) * 100) : 0;
        let inactivePct = totalMembers > 0 ? Math.round((inactiveMembers / totalMembers) * 100) : 0;

        const stats = [
            { val: totalMembers.toString(),              pct: 100,        color: '#3498DB' }, // TOTAL MEMBER  (Biru)
            { val: activeMembers.toString(),             pct: activePct,  color: '#2ECC71' }, // PERKAN CHAT   (Hijau)
            { val: inactiveMembers.toString(),           pct: inactivePct,color: '#F1948A' }, // BELUR CNAT    (Pink)
            { val: totalMessages.toLocaleString('en-US'),pct: 100,        color: '#F4D03F' }, // TOTAL PESAB   (Kuning)
        ];

        // --- KOORDINAT KOTAK ATAS ---
        // Setiap kotak punya area ~246px lebar, mulai dari X=55
        // Di dalam kotak: angka besar di kiri, lingkaran persen di sebelah kanan angka
        const boxStartX  = 55;    // Ujung kiri kotak pertama
        const boxGap     = 246;   // Lebar per kotak
        const boxY       = 195;   // Baseline teks angka besar

        const circleR    = 22;    // Radius lingkaran
        const circleGapFromText = 10; // Gap antara angka dan lingkaran

        const barY       = boxY + 38; // Posisi Y garis bawah
        const barH       = 6;
        const barWidth   = 165;

        for (let i = 0; i < 4; i++) {
            const stat     = stats[i];
            const boxLeft  = boxStartX + (i * boxGap);

            // --- Ukur lebar teks angka agar lingkaran ikut rapat ---
            ctx.font       = 'bold 36px Arial';
            ctx.textAlign  = 'left';
            ctx.textBaseline = 'alphabetic';
            const textW    = ctx.measureText(stat.val).width;

            // A. Teks angka besar
            ctx.fillStyle  = '#000000';
            ctx.fillText(stat.val, boxLeft, boxY);

            // B. Pusat lingkaran (di sebelah kanan angka, tengah-tengah tinggi angka ~36px)
            const cX = boxLeft + textW + circleGapFromText + circleR;
            const cY = boxY - 14; // ~setengah tinggi font 36px ke atas

            // Lingkaran abu-abu (background)
            ctx.beginPath();
            ctx.arc(cX, cY, circleR, 0, 2 * Math.PI);
            ctx.strokeStyle = '#DCDCDC';
            ctx.lineWidth   = 4;
            ctx.stroke();

            // Lingkaran progress (warna)
            ctx.beginPath();
            const startAngle = -Math.PI / 2; // Jam 12
            const endAngle   = startAngle + (stat.pct / 100) * (2 * Math.PI);
            ctx.arc(cX, cY, circleR, startAngle, endAngle);
            ctx.strokeStyle = stat.color;
            ctx.lineWidth   = 4;
            ctx.stroke();

            // Teks persen di tengah lingkaran
            ctx.font         = 'bold 11px Arial';
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle    = '#222222';
            ctx.fillText(`${stat.pct}%`, cX, cY);

            // Reset baseline
            ctx.textBaseline = 'alphabetic';

            // C. Garis bawah (abu-abu)
            ctx.fillStyle = '#E0E0E0';
            ctx.fillRect(boxLeft, barY, barWidth, barH);

            // Garis bawah progress (warna)
            ctx.fillStyle = stat.color;
            ctx.fillRect(boxLeft, barY, barWidth * (stat.pct / 100), barH);
        }

        // ==========================================
        // 3. LEADERBOARD BAWAH
        // ==========================================
        const rankBadgeX = 48;      // Tengah badge rank (#01 dst)
        const rankBadgeW = 30;      // Lebar badge
        const rankBadgeH = 18;      // Tinggi badge

        const nameX      = 100;     // Mulai teks nama/nomor WA
        const subNameX   = nameX;   // Sub-teks @nomor
        const barStartX  = 320;     // Mulai balok warna
        const maxBarW    = canvas.width - barStartX - 90; // Batas kanan balok
        const countX     = canvas.width - 50; // Posisi angka count (rata kanan)

        const startY     = 370;     // Y baris pertama (tengah-tengah teks nama)
        const gapY       = 66.5;    // Jarak antar baris

        // Warna balok sesuai referensi gambar
        const barColors  = ['#F4D03F', '#5DADE2', '#F1948A', '#48C9B0', '#AF7AC5', '#EB984E', '#5DADE2', '#F4D03F', '#F1948A', '#48C9B0'];

        // Warna badge rank
        const badgeColors = [
            '#E74C3C', // 01 – merah
            '#E67E22', // 02 – oranye
            '#E74C3C', // 03 – merah muda
            '#2ECC71', // 04 – hijau
            '#3498DB', // 05 – biru
            '#8E44AD', // 06 – ungu
            '#2980B9', // 07 – biru tua
            '#F39C12', // 08 – kuning
            '#C0392B', // 09 – merah tua
            '#7F8C8D', // 10 – abu
        ];

        for (let i = 0; i < users.length; i++) {
            const [jid, count] = users[i];
            const y = startY + (i * gapY);

            const noWa      = jid.split('@')[0];
            const displayWa = noWa.length > 16 ? noWa.substring(0, 16) + '...' : noWa;
            const barW      = (count / maxMessages) * maxBarW;
            const rankNum   = String(i + 1).padStart(2, '0');

            // --- Badge rank (#01 dst) ---
            const badgeX = rankBadgeX - rankBadgeW / 2;
            const badgeY = y - rankBadgeH + 2;
            ctx.fillStyle    = badgeColors[i] || '#7F8C8D';
            roundRect(ctx, badgeX, badgeY, rankBadgeW, rankBadgeH, 4);

            ctx.font         = 'bold 11px Arial';
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle    = '#FFFFFF';
            ctx.fillText(rankNum, rankBadgeX, badgeY + rankBadgeH / 2);
            ctx.textBaseline = 'alphabetic';

            // --- Teks nomor WA (besar) ---
            ctx.textAlign    = 'left';
            ctx.fillStyle    = '#000000';
            ctx.font         = 'bold 22px Arial';
            ctx.fillText(displayWa, nameX, y);

            // --- Sub-teks @nomor ---
            ctx.fillStyle    = '#7F8C8D';
            ctx.font         = '12px Arial';
            ctx.fillText(`@${displayWa}`, subNameX, y + 17);

            // --- Balok progress ---
            ctx.fillStyle    = barColors[i] || '#BDC3C7';
            ctx.fillRect(barStartX, y - 12, barW, 14);

            // --- Angka jumlah pesan ---
            ctx.textAlign    = 'right';
            ctx.fillStyle    = '#000000';
            ctx.font         = 'bold 24px Arial';
            ctx.fillText(count.toLocaleString('en-US'), countX, y);
        }

        // ==========================================
        // HELPER: roundRect (rounded rectangle fill)
        // ==========================================
        function roundRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
        }

        const imageBuffer = canvas.toBuffer('image/png');
        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: '🏆 *LEADERBOARD TOTAL CHAT GRUP* 🏆'
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`❌ Gagal membuat gambar:\n\n${e.message || e}`);
    }
};

handler.help    = ['topgambar'];
handler.tags    = ['group'];
handler.command = /^(topgambar)$/i;
handler.group   = true;

module.exports = handler;
