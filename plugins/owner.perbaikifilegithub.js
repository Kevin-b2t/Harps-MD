import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

let handler = async (m, { conn }) => {
    m.reply('⏳ Sedang memindai file ganda di folder plugins...');

    // Tentukan folder target yang ingin di-scan (bisa disesuaikan)
    const targetDir = './plugins'; 
    let hashes = {};
    let deletedFiles = [];

    // Fungsi membaca semua file dalam direktori (termasuk sub-folder)
    const getAllFiles = (dir) => {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach((file) => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                results = results.concat(getAllFiles(filePath));
            } else {
                results.push({ path: filePath, time: stat.mtimeMs }); // mtimeMs = waktu modifikasi terakhir
            }
        });
        return results;
    };

    try {
        const allFiles = getAllFiles(targetDir);

        for (let fileObj of allFiles) {
            // Opsional: Hanya cek ekstensi file .js agar aman
            if (!fileObj.path.endsWith('.js')) continue;

            // Baca isi file dan buat hash MD5
            const content = fs.readFileSync(fileObj.path);
            const hash = crypto.createHash('md5').update(content).digest('hex');

            if (!hashes[hash]) hashes[hash] = [];
            hashes[hash].push(fileObj);
        }

        for (let hash in hashes) {
            let fileGroup = hashes[hash];
            
            // Jika ada lebih dari 1 file dengan isi persis sama (ganda)
            if (fileGroup.length > 1) {
                // Urutkan dari yang PALING BARU (angka waktu terbesar) ke terlama
                fileGroup.sort((a, b) => b.time - a.time);

                // File di index 0 adalah yang paling baru (Dipertahankan)
                // Hapus sisanya (index 1 dst) karena itu file lama
                for (let i = 1; i < fileGroup.length; i++) {
                    fs.unlinkSync(fileGroup[i].path);
                    deletedFiles.push(fileGroup[i].path);
                }
            }
        }

        // Laporan hasil eksekusi
        if (deletedFiles.length === 0) {
            m.reply('✅ Folder bersih! Tidak ada file duplikat yang ditemukan.');
        } else {
            let report = `✅ Selesai! Berhasil menghapus **${deletedFiles.length}** file ganda yang lebih lama.\n\n`;
            report += `*File yang dihapus:*\n- ` + deletedFiles.join('\n- ');
            m.reply(report);
        }
        
    } catch (e) {
        console.error(e);
        m.reply('❌ Terjadi kesalahan saat memindai atau menghapus file.');
    }
};

handler.help = ['perbaikifilegithub'];
handler.tags = ['owner'];
handler.command = /^(perbaikifilegithub)$/i;

// Pastikan hanya owner yang bisa menjalankan ini demi keamanan
handler.rowner = true; 

export default handler;
