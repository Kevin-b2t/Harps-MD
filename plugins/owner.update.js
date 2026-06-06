const { exec } = require('child_process');

let handler = async (m, { conn }) => {
    const targetRepo = 'https://github.com/Kevin-b2t/Harps-MD.git';
    
    // 1. Tampilan awal animasi
    let { key } = await conn.sendMessage(m.chat, { 
        text: '📡 *[🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜] 10%*\n• _Menghubungkan ke server GitHub..._' 
    }, { quoted: m });

    const editProgress = async (text) => {
        await conn.sendMessage(m.chat, { text: text, edit: key }).catch(() => null);
    };

    // 2. Jalankan animasi download
    setTimeout(() => editProgress('📥 *[🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜] 30%*\n• _Mengunduh data baru dari Harps-MD..._'), 1000);
    setTimeout(() => editProgress('📥 *[🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜] 60%*\n• _Menyelaraskan paket data..._'), 2000);

    // 3. Ambil data pembaruan (fetch)
    setTimeout(() => {
        const fetchCmd = `git init && (git remote add origin ${targetRepo} || git remote set-url origin ${targetRepo}) && git fetch --all`;
        
        exec(fetchCmd, async (error) => {
            if (error) {
                let errorText = `❌ *PROSES UPDATE GAGAL!*\n\n[🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥]\n\n*Detail Error:*\n\`\`\`${error.message}\`\`\``;
                return await editProgress(errorText);
            }

            await editProgress('📦 *[🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜] 90%*\n• _Mengekstrak dan membaca daftar fitur baru..._');
            
            // 4. Cek file apa saja yang baru
            exec(`git diff HEAD origin/main --stat`, async (err, stdout) => {
                let infoFiturBaru = '';
                
                if (!err && stdout) {
                    infoFiturBaru = `\n\n*📂 DAFTAR FILE/FITUR YANG BARU:* \n\`\`\`${stdout.trim()}\`\`\``;
                } else {
                    infoFiturBaru = `\n\n*📂 DAFTAR FILE/FITUR YANG BARU:* \n_Tidak ada perubahan file yang signifikan._`;
                }

                // 5. Kirim pesan sukses
                let successText = `✅ *UPDATE HARPS-MD BERHASIL SELESAI!*\n\n[🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩] *100%*\n\n` +
                                  `🔄 *Selesai!* Seluruh file lama telah ditimpa dengan versi terbaru.` + 
                                  infoFiturBaru + `\n\n` +
                                  `⚠️ *Sistem bot akan melakukan Auto-Restart dalam 3 detik untuk menerapkan fitur baru...*`;
                
                await editProgress(successText);
                
                // 6. TAHAP AKHIR: Timpa file (reset hard) lalu lakukan AUTO RESTART
                setTimeout(() => {
                    exec(`git reset --hard origin/main`, () => {
                        // Jeda 3 detik agar pesan di WhatsApp terkirim dengan sempurna
                        setTimeout(() => {
                            process.exit(); // Mematikan bot (Pterodactyl akan otomatis menghidupkannya lagi)
                        }, 3000);
                    });
                }, 1000);
            });

        });
    }, 3000);
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = /^(update|gitpull)$/i;
handler.rowner = true; 

module.exports = handler;
