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
        for (let [jid, count] of entries) {
            totalMessages += count;
        }

        let users = entries.sort((a, b) => b[1] - a[1]).slice(0, 10);
        let maxMessages = users[0] ? users[0][1] : 1; 

        const templateImg = path.join(__dirname, '../image/template_leaderboard.png');
        if (!fs.existsSync(templateImg)) throw 'Template tidak ditemukan!';

        const background = await loadImage(templateImg);
        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // ==================== HEADER MEMBER ====================
        const HEADER = {
            x: canvas.width - 180, 
            y: 79,
            font: 'bold 22px "Courier New", monospace', 
            color: '#3498DB',
            text: `[ ${totalMembers} MEMBERS SCANNED ]` 
        };

        // ==================== 4 KOTAK STATISTIK ====================
        const topStatsSlots = {
            box1: { 
                val:        { x: 90, y: 210, text: totalMembers.toString() },
                showCircle: true, 
                pct:        { x: 225, y: 235, text: `100%`, color: '#000000' },
                circle:     { x: 225, y: 235, radius: 18, percentage: 100, color: '#3498DB' },
                bar:        { x: 54,  y: 263, width: 186, height: 10, percentage: 100, color: '#3498DB' }
            },
            box2: { 
                val:        { x: 315, y: 210, text: activeMembers.toString() },
                showCircle: true,
                pct:        { x: 450, y: 235, text: `${Math.round((activeMembers / totalMembers) * 100)}%`, color: '#000000' },
                circle:     { x: 450, y: 235, radius: 18, percentage: Math.round((activeMembers / totalMembers) * 100), color: '#2ECC71' },
                bar:        { x: 280, y: 263, width: 186, height: 10, percentage: Math.round((activeMembers / totalMembers) * 100), color: '#2ECC71' }
            },
            box3: { 
                val:        { x: 540, y: 210, text: inactiveMembers.toString() },
                showCircle: true,
                pct:        { x: 675, y: 235, text: `${Math.round((inactiveMembers / totalMembers) * 100)}%`, color: '#000000' },
                circle:     { x: 675, y: 235, radius: 18, percentage: Math.round((inactiveMembers / totalMembers) * 100), color: '#F1948A' },
                bar:        { x: 505, y: 263, width: 186, height: 10, percentage: Math.round((inactiveMembers / totalMembers) * 100), color: '#F1948A' }
            },
            box4: { 
                val:        { x: 775, y: 210, text: totalMessages.toLocaleString('en-US') },
                showCircle: true,
                pct:        { x: 900, y: 235, text: `100%`, color: '#000000' },
                circle:     { x: 900, y: 235, radius: 18, percentage: 100, color: '#F4D03F' },
                bar:        { x: 732, y: 263, width: 186, height: 10, percentage: 100, color: '#F4D03F' }
            }
        };

        // ==================== LEADERBOARD TOP 10 ====================
        const countBaseX = canvas.width - 50;
        const maxBarWidth = 430;

        const leaderboardSlots = [
            { name: { x: 80, y: 410 }, sub: { x: 80, y: 428 }, count: { x: countBaseX, y: 415 }, bar: { x: 393, y: 392, height: 14, color: '#F4D03F' } },
            { name: { x: 80, y: 472.5 }, sub: { x: 80, y: 490.5 }, count: { x: countBaseX, y: 475.5 }, bar: { x: 393, y: 456.5, height: 14, color: '#5DADE2' } },
            { name: { x: 80, y: 535 }, sub: { x: 80, y: 552 }, count: { x: countBaseX, y: 536 }, bar: { x: 393, y: 521, height: 14, color: '#F1948A' } },
            { name: { x: 80, y: 594.5 }, sub: { x: 80, y: 614.5 }, count: { x: countBaseX, y: 596.5 }, bar: { x: 393, y: 585.5, height: 14, color: '#48C9B0' } },
            { name: { x: 80, y: 662 }, sub: { x: 80, y: 680 }, count: { x: countBaseX, y: 657 }, bar: { x: 395, y: 651, height: 14, color: '#AF7AC5' } },
            { name: { x: 80, y: 721.5 }, sub: { x: 80, y: 741.5 }, count: { x: countBaseX, y: 717.5 }, bar: { x: 393, y: 715.5, height: 14, color: '#EB984E' } },
            { name: { x: 80, y: 789 }, sub: { x: 80, y: 809 }, count: { x: countBaseX, y: 778 }, bar: { x: 393, y: 780, height: 14, color: '#5DADE2' } },
            { name: { x: 80, y: 852.5 }, sub: { x: 80, y: 869.5 }, count: { x: countBaseX, y: 838.5 }, bar: { x: 393, y: 844.5, height: 14, color: '#F4D03F' } },
            { name: { x: 80, y: 914 }, sub: { x: 80, y: 931 }, count: { x: countBaseX, y: 899 }, bar: { x: 393, y: 909, height: 14, color: '#F1948A' } },
            { name: { x: 80, y: 976.5 }, sub: { x: 80, y: 995.5 }, count: { x: countBaseX, y: 959.5 }, bar: { x: 393, y: 973.5, height: 14, color: '#48C9B0' } }
        ];

        // ==================== RENDER HEADER ====================
        ctx.fillStyle = HEADER.color;
        ctx.font = HEADER.font;
        ctx.textAlign = 'center';
        ctx.fillText(HEADER.text, HEADER.x, HEADER.y);

        // ==================== RENDER 4 KOTAK STATISTIK ====================
        Object.values(topStatsSlots).forEach(box => {
            ctx.textAlign = 'left';
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 36px Arial';
            ctx.fillText(box.val.text, box.val.x, box.val.y);

            if (box.showCircle) {
                ctx.beginPath();
                ctx.arc(box.circle.x, box.circle.y, box.circle.radius, 0, 2 * Math.PI);
                ctx.strokeStyle = '#EAEAEA';
                ctx.lineWidth = 4;
                ctx.stroke();

                ctx.beginPath();
                const startAngle = Math.PI * 1.5;
                const endAngle = startAngle + (box.circle.percentage / 100) * (2 * Math.PI);
                ctx.arc(box.circle.x, box.circle.y, box.circle.radius, startAngle, endAngle);
                ctx.strokeStyle = box.circle.color;
                ctx.stroke();

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = box.pct.color;
                ctx.font = 'bold 10px Arial';
                ctx.fillText(box.pct.text, box.pct.x, box.pct.y);
                ctx.textBaseline = 'alphabetic'; 
            }

            ctx.fillStyle = '#EAEAEA';
            ctx.fillRect(box.bar.x, box.bar.y, box.bar.width, box.bar.height);
            
            ctx.fillStyle = box.bar.color;
            ctx.fillRect(box.bar.x, box.bar.y, box.bar.width * (box.bar.percentage / 100), box.bar.height);
        });

        // ==================== PREPARE CAPTION MENTIONS ====================
        let captionText = '🏆 *LEADERBOARD TOTAL CHAT GRUP* 🏆\n\n';
        let mentionedJid = [];

        // ==================== RENDER LEADERBOARD & CAPTION ====================
        for (let i = 0; i < users.length; i++) {
            if (i >= leaderboardSlots.length) break; 
            
            const [jid, count] = users[i];
            let noWa = jid.split('@')[0];
            const displayWa = noWa.length > 15 ? noWa.substring(0, 15) + '...' : noWa;
            const slot = leaderboardSlots[i]; 

            // HANYA MENTION & MASUKIN KE CAPTION UNTUK TOP 5 SAJA
            if (i < 5) {
                mentionedJid.push(jid);
                let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹';
                captionText += `${medal} @${noWa} : ${count.toLocaleString('en-US')} pesan\n`;
            }

            // Canvas Render (Tetap render top 10 di gambar)
            ctx.textAlign = 'left';
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(displayWa, slot.name.x, slot.name.y);

            ctx.fillStyle = '#7F8C8D';
            ctx.font = '12px Arial';
            ctx.fillText(`@${displayWa}`, slot.sub.x, slot.sub.y);

            ctx.fillStyle = '#EAEAEA';
            ctx.fillRect(slot.bar.x, slot.bar.y, maxBarWidth, slot.bar.height);

            const barWidth = (count / maxMessages) * maxBarWidth;
            ctx.fillStyle = slot.bar.color;
            ctx.fillRect(slot.bar.x, slot.bar.y, barWidth, slot.bar.height);

            ctx.textAlign = 'right';
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(count.toLocaleString('en-US'), slot.count.x, slot.count.y);
        }

        const imageBuffer = canvas.toBuffer('image/png');
        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: captionText.trim(),
            mentions: mentionedJid
        }, { quoted: m });

    } catch (e) {
        console.error('[totalchat/top]', e);
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['totalchat', 'top'];
handler.tags = ['group'];
handler.command = /^(totalchat|topchat)$/i;
handler.group = true;

module.exports = handler;
