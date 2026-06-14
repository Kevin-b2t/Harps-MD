const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const dbPath = path.join(__dirname, 'database', 'chat_count.json');
const mediaPath = path.join(__dirname, 'media');
const templateImg = path.join(mediaPath, 'template_leaderboard.png'); 

if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

function addChatCount(groupId, userId, pushname) {
    let data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    if (!data[groupId]) data[groupId] = {};
    if (!data[groupId][userId]) {
        data[groupId][userId] = { name: pushname || 'Unknown', count: 0 };
    }
    
    data[groupId][userId].count += 1;
    if (pushname) data[groupId][userId].name = pushname;
    
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

async function generateLeaderboard(groupId) {
    let data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    if (!data[groupId] || Object.keys(data[groupId]).length === 0) {
        throw new Error('Belum ada data chat di grup ini.');
    }

    let users = Object.entries(data[groupId])
        .map(([id, info]) => ({ id, name: info.name, count: info.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    if (!fs.existsSync(templateImg)) throw new Error('Gambar template tidak ditemukan di folder media!');
    const background = await loadImage(templateImg);
    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 24px "Courier New"'; 
    ctx.fillStyle = '#000000'; 

    // Koordinat penempatan teks, sesuaikan dengan ukuran gambarmu
    const startY = 320; 
    const gapY = 60;    
    const nameX = 350;  
    const countX = 850; 

    users.forEach((user, index) => {
        const currentY = startY + (index * gapY);
        let displayName = user.name;
        if (displayName.length > 15) displayName = displayName.substring(0, 15) + '...';
        
        ctx.fillText(displayName, nameX, currentY);
        ctx.fillText(`${user.count} Msg`, countX, currentY);
    });

    return canvas.toBuffer('image/png');
}

module.exports = { addChatCount, generateLeaderboard };
