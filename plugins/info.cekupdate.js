const { exec } = require('child_process');

let handler = async (m, { conn }) => {
    const targetRepo = 'https://github.com/Kevin-b2t/Harps-MD.git';

    let { key } = await conn.sendMessage(m.chat, {
        text: '📡 *[🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜] 10%*\n• _Menghubungkan ke server GitHub..._'
    }, { quoted: m });

    const edit = async (text) => conn.sendMessage(m.chat, { text, edit: key }).catch(() => null);

    setTimeout(() => edit('🔍 *[🟩🟩🟩⬜⬜⬜⬜⬜⬜⬜] 30%*\n• _Mengambil data terbaru dari GitHub..._'), 1000);
    setTimeout(() => edit('🔍 *[🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜] 60%*\n• _Membandingkan dengan versi lokal..._'), 2000);

    setTimeout(() => {
        const fetchCmd = `git init && (git remote add origin ${targetRepo} || git remote set-url origin ${targetRepo}) && git fetch --all`;

        exec(fetchCmd, async (error) => {
            if (error) {
                return await edit(`❌ *CEK UPDATE GAGAL!*\n\n[🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥]\n\n*Detail Error:*\n\`\`\`${error.message}\`\`\``);
            }

            await edit('🔍 *[🟩🟩🟩🟩🟩🟩🟩🟩🟩⬜] 90%*\n• _Menganalisis perubahan..._');

            exec(`git diff HEAD origin/main --name-status`, async (err, stdout) => {
                if (err || !stdout.trim()) {
                    return await edit(
                        `✅ *BOT SUDAH VERSI TERBARU!*\n\n[🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩] *100%*\n\n` +
                        `• _Tidak ada perubahan dari GitHub._`
                    );
                }

                const lines = stdout.trim().split('\n');
                let added = [], modified = [], deleted = [];

                for (const line of lines) {
                    const [status, file] = line.split('\t');
                    if (status === 'A') added.push(file);
                    else if (status === 'M') modified.push(file);
                    else if (status === 'D') deleted.push(file);
                }

                let info = '';
                if (added.length)    info += `\n*🆕 File Baru (${added.length}):*\n` + added.map(f => `   • ${f}`).join('\n');
                if (modified.length) info += `\n*✏️ File Diubah (${modified.length}):*\n` + modified.map(f => `   • ${f}`).join('\n');
                if (deleted.length)  info += `\n*🗑️ File Dihapus (${deleted.length}):*\n` + deleted.map(f => `   • ${f}`).join('\n');

                await edit(
                    `🔔 *ADA UPDATE TERSEDIA!*\n\n[🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩] *100%*\n` +
                    `━━━━━━━━━━━━━━━━━` +
                    info +
                    `\n━━━━━━━━━━━━━━━━━\n` +
                    `📊 *Total:* ${lines.length} perubahan`
                );
            });
        });
    }, 3000);
};

handler.help    = ['cekupdate'];
handler.tags    = ['info'];
handler.command = /^cekupdate$/i;

module.exports = handler;
