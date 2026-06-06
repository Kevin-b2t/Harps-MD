// ============================================================
//  Plugin: Database Auto-Backup ke GitHub
//  Bot: RTXZY-MD (Baileys)
//  Repo: https://github.com/Kevin-b2t/DATABASE
//  Fitur:
//    - Auto upload database setiap 1 jam
//    - Command .upload database   → upload manual
//    - Command .download database → download dari GitHub
// ============================================================

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

// ─── KONFIGURASI ─────────────────────────────────────────────
// Isi di file .env atau langsung di sini
const GITHUB_TOKEN  = process.env.GITHUB_TOKEN  || "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"; // Personal Access Token
const GITHUB_OWNER  = process.env.GITHUB_OWNER  || "Kevin-b2t";
const GITHUB_REPO   = process.env.GITHUB_REPO   || "DATABASE";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

// File database yang akan di-backup (sesuaikan dengan bot kamu)
const DB_FILES = [
  "./database.json",
  // Tambahkan file lain jika perlu
];
// ─────────────────────────────────────────────────────────────

const BASE_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;

// ── Ambil SHA file dari GitHub (diperlukan untuk update) ──
async function getFileSHA(filePath) {
  try {
    const res = await fetch(`${BASE_URL}/${filePath}?ref=${GITHUB_BRANCH}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha || null;
  } catch {
    return null;
  }
}

// ── Upload satu file ke GitHub ──
async function uploadFileToGitHub(localPath) {
  if (!fs.existsSync(localPath)) return { success: false, reason: "File tidak ditemukan: " + localPath };

  const content  = fs.readFileSync(localPath);
  const b64      = content.toString("base64");
  const repoPath = path.basename(localPath); // simpan di root repo
  const sha      = await getFileSHA(repoPath);

  const body = {
    message: `🔄 Auto-backup: ${repoPath} [${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}]`,
    content: b64,
    branch: GITHUB_BRANCH,
    ...(sha ? { sha } : {}),
  };

  const res = await fetch(`${BASE_URL}/${repoPath}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (res.ok) return { success: true, file: repoPath };
  return { success: false, reason: data.message || "Unknown error", file: repoPath };
}

// ── Download satu file dari GitHub ──
async function downloadFileFromGitHub(repoPath, saveTo) {
  const res = await fetch(`${BASE_URL}/${repoPath}?ref=${GITHUB_BRANCH}`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!res.ok) return { success: false, reason: `File tidak ditemukan di GitHub: ${repoPath}` };

  const data    = await res.json();
  const decoded = Buffer.from(data.content, "base64");
  fs.mkdirSync(path.dirname(saveTo), { recursive: true });
  fs.writeFileSync(saveTo, decoded);
  return { success: true, file: repoPath };
}

// ── Upload semua file database ──
async function uploadAllDatabases() {
  const results = [];
  for (const file of DB_FILES) {
    const result = await uploadFileToGitHub(file);
    results.push(result);
  }
  return results;
}

// ── Download semua file database ──
async function downloadAllDatabases() {
  const results = [];
  for (const file of DB_FILES) {
    const repoPath = path.basename(file);
    const result   = await downloadFileFromGitHub(repoPath, file);
    results.push(result);
  }
  return results;
}

// ── Format hasil untuk pesan WhatsApp ──
function formatResults(results, action) {
  const ok   = results.filter((r) => r.success);
  const fail = results.filter((r) => !r.success);
  let msg = `*📦 Database ${action}*\n`;
  msg += `━━━━━━━━━━━━━━━━━\n`;
  if (ok.length)   msg += ok.map((r)   => `✅ ${r.file}`).join("\n") + "\n";
  if (fail.length) msg += fail.map((r) => `❌ ${r.file}\n   └ ${r.reason}`).join("\n") + "\n";
  msg += `━━━━━━━━━━━━━━━━━\n`;
  msg += `📊 ${ok.length}/${results.length} berhasil\n`;
  msg += `🕐 ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`;
  return msg;
}

// ════════════════════════════════════════════════════════════
//  AUTO UPLOAD SETIAP 1 JAM
// ════════════════════════════════════════════════════════════
let autoUploadInterval = null;

export function startAutoUpload(conn) {
  if (autoUploadInterval) clearInterval(autoUploadInterval);

  console.log("✅ [DB-Backup] Auto-upload aktif setiap 1 jam");

  autoUploadInterval = setInterval(async () => {
    console.log("🔄 [DB-Backup] Menjalankan auto-upload database...");
    const results = await uploadAllDatabases();
    const ok      = results.filter((r) => r.success).length;
    console.log(`✅ [DB-Backup] Auto-upload selesai: ${ok}/${results.length} file berhasil`);
    // Opsional: kirim notif ke nomor owner
    // const ownerJid = "628xxxxxxxxx@s.whatsapp.net";
    // conn.sendMessage(ownerJid, { text: formatResults(results, "Auto-Upload") });
  }, 60 * 60 * 1000); // 1 jam = 3.600.000 ms
}

export function stopAutoUpload() {
  if (autoUploadInterval) {
    clearInterval(autoUploadInterval);
    autoUploadInterval = null;
    console.log("⛔ [DB-Backup] Auto-upload dihentikan");
  }
}

// ════════════════════════════════════════════════════════════
//  PLUGIN HANDLER PERINTAH
// ════════════════════════════════════════════════════════════
let handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) return m.reply("❌ Hanya owner yang bisa menggunakan perintah ini!");

  const cmd = text?.trim().toLowerCase();

  // ── .upload database ──
  if (cmd === "database") {
    await m.reply("⏳ Mengupload database ke GitHub...");
    const results = await uploadAllDatabases();
    await m.reply(formatResults(results, "Upload"));
    return;
  }
};

// ════════════════════════════════════════════════════════════
//  PLUGIN HANDLER DOWNLOAD
// ════════════════════════════════════════════════════════════
let handlerDownload = async (m, { conn, text, isOwner }) => {
  if (!isOwner) return m.reply("❌ Hanya owner yang bisa menggunakan perintah ini!");

  const cmd = text?.trim().toLowerCase();

  if (cmd === "database") {
    await m.reply("⏳ Mendownload database dari GitHub...");
    const results = await downloadAllDatabases();
    await m.reply(formatResults(results, "Download"));
    return;
  }
};

handler.command      = /^upload$/i;
handlerDownload.command = /^download$/i;

handler.owner        = true;
handlerDownload.owner = true;

export { handler, handlerDownload };
export default handler;
