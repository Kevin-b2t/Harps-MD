let handler = m => m

handler.before = async function (m) {
    // 1. Abaikan kalau pesannya dari bot itu sendiri (m.isBaileys / m.fromMe), bukan di grup, atau pengirimnya tidak terbaca
    if (m.isBaileys || m.fromMe || !m.isGroup || !m.sender) return;

    // 2. Pastikan database utama untuk 'totalchat' sudah dibuat
    global.db.data.totalchat = global.db.data.totalchat || {};

    // ==========================================
    // FITUR AUTO-RESET 4 HARI
    // ==========================================
    let now = new Date() * 1;
    let limitDays = 4 * 24 * 60 * 60 * 1000; // 4 hari = 345.600.000 milidetik

    // Jika belum ada data waktu reset, buat catatan waktu sekarang
    if (!global.db.data.totalchat.lastReset) {
        global.db.data.totalchat.lastReset = now;
    }

    // Cek apakah waktu sekarang sudah lewat 4 hari dari catatan terakhir
    if (now - global.db.data.totalchat.lastReset >= limitDays) {
        // Reset/hapus semua data chat grup, tapi tetep simpan waktu reset yang baru
        global.db.data.totalchat = {
            lastReset: now
        };
    }
    // ==========================================
    
    // 3. Pastikan database khusus untuk grup tempat chat ini berada sudah dibuat
    global.db.data.totalchat[m.chat] = global.db.data.totalchat[m.chat] || {};
    
    // 4. Cek apakah member ini sudah ada datanya. Kalau belum, mulai dari 0
    let chatData = global.db.data.totalchat[m.chat];
    chatData[m.sender] = chatData[m.sender] || 0;
    
    // 5. Tambahkan +1 setiap kali member tersebut ngirim chat
    chatData[m.sender] += 1;

    // 6. Return true itu wajib, biar bot nggak berhenti di sini dan tetep bisa ngerespon command lain
    return true;
}

module.exports = handler;
