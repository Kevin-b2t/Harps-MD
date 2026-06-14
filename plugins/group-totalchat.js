const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Konfigurasi Path Folder & File
const dbFolder = path.join(__dirname, 'database');
const mediaFolder = path.join(__dirname, 'media');
const dbPath = path.join(dbFolder, 'chat_count.json');
const templateImg = path.join(mediaFolder, 'template_leaderboard.png');

// Auto-create folder & file jika belum ada
if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });
if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder, { recursive: true });
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

// Fungsi Menambah Jumlah Chat
function addChatCount(groupId, userId, pushname) {
    let data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    if (!data[groupId]) data[groupId] = {};
    if (!data[groupId][userId]) {
        data[groupId][userId] = { name: pushname || 'Unknown', count: 0 };
    }
    
    data[groupId][userId].count += 1;
    if (pushname) data[groupId][userId].name = pushname; // Update nama
    
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Fungsi Membuat Gambar Leaderboard
async function generateLeaderboard(groupId) {
    let data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    if (!data[groupId] || Object.keys(data[groupId]).length === 0) {
        throw new Error('Belum ada data chat di grup ini.');
    }

    // Ambil Top 10
    let users = Object.entries(data[groupId])
        .map(([id, info]) => ({ id, name: info.name, count: info.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Load Template Gambar
    if (!fs.existsSync(templateImg)) {
        throw new Error('File template_leaderboard.png tidak ditemukan di folder media!');
    }
    const background = await loadImage(templateImg);
    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext('2d');

    // Gambar Background
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Styling Teks
    ctx.font = 'bold 28px "Courier New"'; 
    ctx.fillStyle = '#000000'; 

    // Koordinat (Wajib disesuaikan dengan gambar template kamu)
    const startY = 320; // Posisi vertikal nama urutan 1
    const gapY = 60;    // Jarak vertikal antar nama
    const nameX = 350;  // Posisi horizontal nama
    const countX = 850; // Posisi horizontal jumlah pesan

    // Tulis data ke gambar
    users.forEach((user, index) => {
        const currentY = startY + (index * gapY);
        
        let displayName = user.name;
        if (displayName.length > 15) displayName = displayName.substring(0, 15) + '...';
        
        ctx.fillText(displayName, nameX, currentY);
        ctx.fillText(`${user.count} Msg`, countX, currentY);
    });

    return canvas.toBuffer('image/png');
}

module.exports = {
    addChatCount,
    generateLeaderboard
};
