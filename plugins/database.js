// ============================================================
//  Plugin: Backup Database ke GitHub
//  Bot: Harps BotMD (RTXZY-MD / Baileys CommonJS)
// ============================================================

const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

const GITHUB_TOKEN  = process.env.GITHUB_TOKEN  || ''
const GITHUB_OWNER  = process.env.GITHUB_OWNER  || 'Kevin-b2t'
const GITHUB_REPO   = process.env.GITHUB_REPO   || 'DATABASE'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'
const DB_FILES      = ['./database.json']
const BASE_URL      = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`

async function getFileSHA(repoPath) {
  try {
    const res = await fetch(`${BASE_URL}/${repoPath}?ref=${GITHUB_BRANCH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.sha || null
  } catch { return null }
}

async function uploadFile(localPath) {
  if (!fs.existsSync(localPath)) return { success: false, file: path.basename(localPath), reason: 'File tidak ditemukan' }
  const b64      = fs.readFileSync(localPath).toString('base64')
  const repoPath = path.basename(localPath)
  const sha      = await getFileSHA(repoPath)
  const waktu    = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  const res = await fetch(`${BASE_URL}/${repoPath}`, {
    method: 'PUT',
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `🔄 Backup: ${repoPath} [${waktu}]`, content: b64, branch: GITHUB_BRANCH, ...(sha ? { sha } : {}) })
  })
  const data = await res.json()
  if (res.ok) return { success: true, file: repoPath }
  return { success: false, file: repoPath, reason: data.message || 'Unknown error' }
}

async function downloadFile(localPath) {
  const repoPath = path.basename(localPath)
  const res = await fetch(`${BASE_URL}/${repoPath}?ref=${GITHUB_BRANCH}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
  })
  if (!res.ok) return { success: false, file: repoPath, reason: 'File tidak ada di GitHub' }
  const data = await res.json()
  fs.writeFileSync(localPath, Buffer.from(data.content, 'base64'))
  return { success: true, file: repoPath }
}

function formatHasil(results, action) {
  const ok   = results.filter(r => r.success)
  const fail = results.filter(r => !r.success)
  const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  let msg = `*📦 Database ${action}*\n━━━━━━━━━━━━━━━━━\n`
  if (ok.length)   msg += ok.map(r   => `✅ ${r.file}`).join('\n') + '\n'
  if (fail.length) msg += fail.map(r => `❌ ${r.file}\n   └ ${r.reason}`).join('\n') + '\n'
  msg += `━━━━━━━━━━━━━━━━━\n📊 ${ok.length}/${results.length} berhasil\n🕐 ${waktu}`
  return msg
}

// Auto upload setiap 1 jam
setInterval(async () => {
  console.log('🔄 [DB-Backup] Auto-upload...')
  const results = []
  for (const f of DB_FILES) results.push(await uploadFile(f))
  console.log(`✅ [DB-Backup] ${results.filter(r=>r.success).length}/${results.length} berhasil`)
}, 60 * 60 * 1000)

// ── .upload database ──
let handler = async (m, { text, isOwner }) => {
  if (!isOwner) return m.reply('❌ Hanya owner!')
  if (!text || text.trim().toLowerCase() !== 'database') return
  await m.reply('⏳ Mengupload database ke GitHub...')
  const results = []
  for (const f of DB_FILES) results.push(await uploadFile(f))
  m.reply(formatHasil(results, 'Upload'))
}
handler.command = /^upload$/i
handler.owner   = true

// ── .download database ──
let handler2 = async (m, { text, isOwner }) => {
  if (!isOwner) return m.reply('❌ Hanya owner!')
  if (!text || text.trim().toLowerCase() !== 'database') return
  await m.reply('⏳ Mendownload database dari GitHub...')
  const results = []
  for (const f of DB_FILES) results.push(await downloadFile(f))
  m.reply(formatHasil(results, 'Download'))
}
handler2.command = /^download$/i
handler2.owner   = true

module.exports = [handler, handler2]
