// ============================================================
//  Plugin: Backup Database ke GitHub (Versi Animasi)
//  Bot: Harps BotMD (RTXZY-MD / Baileys CommonJS)
// ============================================================

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// ⚠️ PASTIKAN MENGGUNAKAN TOKEN BARU (Token lama yang tadi kamu kirim sudah tidak aman)
const GITHUB_TOKEN  = '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'; 
const GITHUB_OWNER  = 'Kevin-b2t';
const GITHUB_REPO   = 'DATABASE';
const GITHUB_BRANCH = 'main';
const DB_FILES      = ['./database.json'];
const BASE_URL      = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;

// ── Fungsi Interaksi API GitHub ──
async function getFileSHA(repoPath) {
  try {
    const res = await fetch(`${BASE_URL}/${repoPath}?ref=${GITHUB_BRANCH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha || null;
  } catch { return null; }
}

async function uploadFile(localPath) {
  if (!fs.existsSync(localPath)) return { success: false, file: path.basename(localPath), reason: 'File lokal tidak ditemukan' };
  try {
      const b64 = fs.readFileSync(localPath).toString('base64');
      const repoPath = path.basename(localPath);
      const sha = await getFileSHA(repoPath);
      const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      
      const res = await fetch(`${BASE_URL}/${repoPath}`, {
        method: 'PUT',
        headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `🔄 Backup: ${repoPath} [${waktu}]`, content: b64, branch: GITHUB_BRANCH, ...(sha ? { sha } : {}) })
      });
      
      const data = await res.json();
      if (res.ok) return { success: true, file: repoPath };
      return { success: false, file: repoPath, reason: data.message || 'Error API GitHub' };
  } catch (e) {
      return { success: false, file: path.basename(localPath), reason: e.message };
  }
}

async function downloadFile(localPath) {
  const repoPath = path.basename(localPath);
  try {
      const res = await fetch(`${BASE_URL}/${repoPath}?ref=${GITHUB_BRANCH}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
      });
      if (!res.ok) return { success: false, file: repoPath, reason: 'File tidak ada atau Token salah/expired' };
      
      const data = await res.json();
      const cleanBase64 = data.content.replace(/\n/g, '');
      fs.writeFileSync(localPath, Buffer.from(cleanBase64, 'base64'));
      
      return { success: true, file: repoPath };
  } catch (e) {
      return { success: false, file: repoPath, reason: e.message };
  }
}

// ── Auto Upload (Setiap 1 Jam) ──
setInterval(async () => {
  if (GITHUB_TOKEN.includes('MASUKKAN_TOKEN_BARU')) return; 
  console.log('🔄 [DB-Backup] Auto-upload berjalan di latar belakang...');
  for (const f of DB_FILES) await uploadFile(f);
}, 60 * 60 * 1000);

// ── Handler untuk Command Animasi ──
let handler = async (m, { conn, command, isOwner }) => {
    if (!isOwner) return m.reply('❌ Perintah ini hanya untuk Owner bot!');
    if (GITHUB_TOKEN.includes('MASUKKAN_TOKEN_BARU')) return m.reply('❌ GITHUB_TOKEN belum diatur dengan benar di dalam script!');

    // 1. Tampilan Awal Animasi
    let { key } = await conn.sendMessage(m.chat, { 
        text: '📡 *[🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜] 10%*\n• _Menghubungkan ke server GitHub..._' 
    }, { quoted: m });

    // Fungsi pembantu untuk mengedit pesan (seperti di update.js)
    const editProgress = async (text) => {
        await conn.sendMessage(m.chat, { text: text, edit: key }).catch(() => null);
    };

    // ── PROSES UPLOAD ──
    if (/^uploaddb$/i.test(command)) {
        setTimeout(() => editProgress('📤 *[🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜] 40%*\n• _Membaca file database lokal..._'), 1000);
        setTimeout(() => editProgress('📤 *[🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜] 70%*\n• _Mengunggah data ke GitHub..._'), 2000);

        setTimeout(async () => {
            const results = [];
            for (const f of DB_FILES) results.push(await uploadFile(f));
            
            const ok = results.filter(r => r.success);
            const fail = results.filter(r => !r.success);
            const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
            
            let finalMsg = `✅ *UPLOAD DATABASE SELESAI!*\n\n[🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩] *100%*\n\n`;
            if (fail.length > 0) finalMsg = `❌ *UPLOAD GAGAL / SEBAGIAN!*\n\n[🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥] *Error*\n\n`;

            if (ok.length) finalMsg += ok.map(r => `✅ ${r.file}`).join('\n') + '\n';
            if (fail.length) finalMsg += fail.map(r => `❌ ${r.file}\n   └ ${r.reason}`).join('\n') + '\n';
            
            finalMsg += `\n🕐 ${waktu}`;
            await editProgress(finalMsg);
        }, 3000);

    // ── PROSES DOWNLOAD ──
    } else if (/^downloaddb$/i.test(command)) {
        setTimeout(() => editProgress('📥 *[🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜] 40%*\n• _Mengambil data dari GitHub..._'), 1000);
        setTimeout(() => editProgress('📥 *[🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜] 70%*\n• _Menimpa database lokal..._'), 2000);

        setTimeout(async () => {
            const results = [];
            for (const f of DB_FILES) results.push(await downloadFile(f));
            
            const ok = results.filter(r => r.success);
            const fail = results.filter(r => !r.success);
            const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
            
            let finalMsg = `✅ *DOWNLOAD DATABASE SELESAI!*\n\n[🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩] *100%*\n\n`;
            if (fail.length > 0) finalMsg = `❌ *DOWNLOAD GAGAL / SEBAGIAN!*\n\n[🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥] *Error*\n\n`;

            if (ok.length) finalMsg += ok.map(r => `✅ ${r.file}`).join('\n') + '\n';
            if (fail.length) finalMsg += fail.map(r => `❌ ${r.file}\n   └ ${r.reason}`).join('\n') + '\n';
            
            finalMsg += `\n🕐 ${waktu}\n\n⚠️ *Penting:* Silakan Restart panel/bot kamu agar data terbaru terbaca sempurna.`;
            await editProgress(finalMsg);
        }, 3000);
    }
};

handler.command = /^(uploaddb|downloaddb)$/i;
handler.owner = true;

module.exports = handler;
