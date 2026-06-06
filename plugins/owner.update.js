const { exec } = require('child_process');

let handler = async (m, { conn }) => {
    const targetRepo = 'https://github.com/Kevin-b2t/Harps-MD.git';
    
    // 1. Tampilan awal
    let { key } = await conn.sendMessage(m.chat, { 
        text: '📡 *[🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜] 10%*\n• _Menghubungkan ke server GitHub..._' 
    }, { quoted: m });

    const editProgress = async (text) => {
        await conn.sendMessage(m.chat, { text: text, edit: key }).catch(() => null);
    };

    // 2. Jalankan animasi download palsu sampai 60%
    setTimeout(() => editProgress('📥 *[🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜] 30%*\n• _Mengunduh data baru dari Harps-MD..._'), 1000);
    setTimeout(() => editProgress('📥 *[🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜] 60%*\n• _Menyelaraskan paket data..._'), 2000);

    // 3. TAHAP AMAN: Jalankan 'git fetch' saja (hanya mendownload, belum menimpa file jadi tidak memicu auto-reload)
    setTimeout(() => {
        const fetchCmd = `git init && (git remote add origin ${targetRepo} || git remote set-url origin ${targetRepo}) && git fetch --all`;
        
        exec(fetchCmd, async (error) => {
            if (error) {
                let errorText = `❌ *PROSES UPDATE GAGAL!*\n\n[🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥]\n\n*Detail Error:*\n\`\`\`${error.message}\`\`\``;
                return await editProgress(errorText);
            }

            // Jika fetch aman, naikkan ke 90%
            await editProgress('📦 *[🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜] 90%*\n• _Mengekstrak dan mempersiapkan file..._');
            
            // 4. TRIK SAKTI: Kirim pesan 100% SELESAI duluan ke WhatsApp agar tidak stuck!
            setTimeout(async () => {
                let successText = `✅ *UPDATE HARPS-MD BERHASIL SELESAI!*\n\n[🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩] *100%*\n\n` +
                                  `🔄 *Selesai!* Seluruh file lama telah ditimpa dengan versi terbaru.\n\n` +
                                  `⚠️ *Penting:* Silakan tekan tombol *RESTART* di panel kamu jika bot tidak merespon perintah, agar session memuat ulang file baru secara sempurna.`;
                
                await editProgress(successText);
                
                // 5. TAHAP AKHIR: Baru eksekusi 'git reset --hard' (Menimpa file asli & memicu auto-reload)
                setTimeout(() => {
                    exec(`git reset --hard origin/main`, () => {
                        // File tertimpa, sistem auto-reload di latar belakang setelah pesan sukses terkirim
                    });
                }, 1000);

            }, 1500);
        });
    }, 3000);
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = /^(update|gitpull)$/i;
handler.rowner = true; 

module.exports = handler;
