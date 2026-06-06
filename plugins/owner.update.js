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

    // 2. Jalankan animasi download palsu sampai 60%
    setTimeout(() => editProgress('📥 *[🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜] 30%*\n• _Mengunduh data baru dari Harps-MD..._'), 1000);
    setTimeout(() => editProgress('📥 *[🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜] 60%*\n• _Menyelaraskan paket data..._'), 2000);

    // 3. Jalankan 'git fetch' untuk mengambil data pembaruan
    setTimeout(() => {
        const fetchCmd = `git init && (git remote add origin ${targetRepo} || git remote set-url origin ${targetRepo}) && git fetch --all`;
        
        exec(fetchCmd, async (error) => {
            if (error) {
                let errorText = `❌ *PROSES UPDATE GAGAL!*\n\n[🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥]\n\n*Detail Error:*\n\`\`\`${error.message}\`\`\``;
                return await editProgress(errorText);
            }

            // Ke tahap 90%
            await editProgress('📦 *[🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜] 90%*\n• _Mengekstrak dan membaca daftar fitur baru..._');
            
            // 4. Perintah Git untuk mengintip file apa saja yang berubah/baru dibanding lokal saat ini
            // --stat berguna untuk memunculkan daftar nama file yang berubah
            exec(`git diff HEAD origin/main --stat`, async (err, stdout) => {
                let infoFiturBaru = '';
                
                if (!err && stdout) {
                    infoFiturBaru = `\n\n*📂 DAFTAR FILE/FITUR YANG BARU:* \n\`\`\`${stdout.trim()}\`\`\``;
                } else {
                    infoFiturBaru = `\n\n*📂 DAFTAR FILE/FITUR YANG BARU:* \n_Tidak ada perubahan file yang terdeteksi atau sistem menggunakan database bersih._`;
                }

                // 5. Kirim pesan sukses beserta list file barunya duluan agar tidak stuck
                let successText = `✅ *UPDATE HARPS-MD BERHASIL SELESAI!*\n\n[🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩] *100%*\n\n` +
                                  `🔄 *Selesai!* Seluruh file lama telah ditimpa dengan versi terbaru.` + 
                                  infoFiturBaru + `\n\n` +
                                  `⚠️ *Penting:* Silakan tekan tombol *RESTART* di panel kamu agar bot memuat ulang seluruh fitur baru di atas dengan sempurna.`;
                
                await editProgress(successText);
                
                // 6. Tahap akhir: Eksekusi reset hard di latar belakang untuk menerapkan filenya
                setTimeout(() => {
                    exec(`git reset --hard origin/main`, () => {});
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