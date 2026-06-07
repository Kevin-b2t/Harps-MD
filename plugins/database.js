const fetch = require('node-fetch')
const fs    = require('fs')
const path  = require('path')

const GITHUB_TOKEN  = process.env.GITHUB_TOKEN  || ''
const GITHUB_OWNER  = process.env.GITHUB_OWNER  || 'Kevin-b2t'
const GITHUB_REPO   = process.env.GITHUB_REPO   || 'DATABASE'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'
const DB_FILE       = './database.json'
const BASE_URL      = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`
const RAW_URL       = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`

async function getFileSHA(repoPath) {
  try {
    const res = await fetch(`${BASE_URL}/${repoPath}?ref=${GITHUB_BRANCH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
    })
    if (!res.ok) return null
    return (await res.json()).sha || null
  } catch { return null }
}

async function uploadDB() {
  if (!fs.existsSync(DB_FILE)) return { success: false, reason: 'File database.json tidak ditemukan' }
  const b64      = fs.readFileSync(DB_FILE).toString('base64')
  const repoPath = path.basename(DB_FILE)
  const sha      = await getFileSHA(repoPath)
  const waktu    = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  const res = await fetch(`${BASE_URL}/${repoPath}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `🔄 Backup: ${repoPath} [${waktu}]`,
      content: b64,
      branch: GITHUB_BRANCH,
      ...(sha ? { sha } : {})
    })
  })
  const data = await res.json()
  if (res.ok) return { success: true }
  return { success: false, reason: data.message || 'Unknown error' }
}

async function downloadDB() {
  try {
    const res = await fetch(`${RAW_URL}/${path.basename(DB_FILE)}`)
    if (!res.ok) return { success: false, reason: `Gagal ambil dari GitHub (${res.status})` }
    const text = await res.text()
    JSON.parse(text)
    fs.writeFileSync(DB_FILE, text)
    return { success: true }
  } catch (e) {
    return { success: false, reason: e.message || 'Unknown error' }
  }
}

// Auto upload setiap 1 jam
setInterval(async () => {
  console.log('🔄 [DB-Backup] Auto-upload database...')
  const res = await uploadDB()
  console.log(res.success ? '✅ [DB-Backup] Berhasil!' : `❌ [DB-Backup] Gagal: ${res.reason}`)
}, 60 * 60 * 1000)

// .uploaddb
let handler = async (m, { conn, isOwner, isROwner }) => {
  if (!isOwner && !isROwner) return m.reply('❌ Hanya owner!')

  let { key } = await conn.sendMessage(m.chat, {
    text: '📡 *[🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜] 10%*\n• _Menghubungkan ke GitHub..._'
  }, { quoted: m })

  const edit = async (text) => conn.sendMessage(m.chat, { text, edit: key }).catch(() => null)

  setTimeout(() => edit('📤 *[🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜] 40%*\n• _Membaca database.json..._'), 1000)
  setTimeout(() => edit('📤 *[🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜] 70%*\n• _Mengupload ke GitHub..._'), 2000)

  setTimeout(async () => {
    const result = await uploadDB()
    const waktu  = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    if (result.success) {
      await edit(
        `✅ *UPLOAD BERHASIL!*\n\n[🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩] *100%*\n\n` +
        `📦 *File:* database.json\n` +
        `🔗 *Repo:* github.com/${GITHUB_OWNER}/${GITHUB_REPO}\n` +
        `🕐 *Waktu:* ${waktu}`
      )
    } else {
      await edit(`❌ *UPLOAD GAGAL!*\n\n[🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥]\n\n*Error:*\n\`\`\`${result.reason}\`\`\``)
    }
  }, 3500)
}
handler.command = /^uploaddb$/i
handler.owner   = true

// .downloaddb
let handler2 = async (m, { conn, isOwner, isROwner }) => {
  if (!isOwner && !isROwner) return m.reply('❌ Hanya owner!')

  let { key } = await conn.sendMessage(m.chat, {
    text: '📡 *[🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜] 10%*\n• _Menghubungkan ke GitHub..._'
  }, { quoted: m })

  const edit = async (text) => conn.sendMessage(m.chat, { text, edit: key }).catch(() => null)

  setTimeout(() => edit('📥 *[🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜] 40%*\n• _Mengambil database dari GitHub..._'), 1000)
  setTimeout(() => edit('📥 *[🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜] 70%*\n• _Menyimpan ke server..._'), 2000)

  setTimeout(async () => {
    const result = await downloadDB()
    const waktu  = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    if (result.success) {
      await edit(
        `✅ *DOWNLOAD BERHASIL!*\n\n[🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩] *100%*\n\n` +
        `📦 *File:* database.json\n` +
        `🔗 *Sumber:* github.com/${GITHUB_OWNER}/${GITHUB_REPO}\n` +
        `🕐 *Waktu:* ${waktu}\n\n` +
        `⚠️ *Penting:* Restart bot agar database terbaru terbaca sempurna.`
      )
    } else {
      await edit(`❌ *DOWNLOAD GAGAL!*\n\n[🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥]\n\n*Error:*\n\`\`\`${result.reason}\`\`\``)
    }
  }, 3500)
}
handler2.command = /^downloaddb$/i
handler2.owner   = true

module.exports = [handler, handler2]
