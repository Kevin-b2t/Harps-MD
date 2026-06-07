const fetch = require('node-fetch')
const fs    = require('fs')
const path  = require('path')

const GITHUB_TOKEN  = process.env.GITHUB_TOKEN  || ''
const GITHUB_OWNER  = process.env.GITHUB_OWNER  || 'Kevin-b2t'
const GITHUB_REPO   = process.env.GITHUB_REPO   || 'DATABASE'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'
const DB_FILE       = './database.json'
const BASE_URL      = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`

async function downloadDB() {
  try {
    const repoPath = path.basename(DB_FILE)
    const res = await fetch(`${BASE_URL}/${repoPath}?ref=${GITHUB_BRANCH}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })
    if (!res.ok) return { success: false, reason: `Gagal ambil dari GitHub (${res.status})` }
    const data = await res.json()
    const text = Buffer.from(data.content, 'base64').toString('utf8')
    JSON.parse(text)
    fs.writeFileSync(DB_FILE, text)
    return { success: true }
  } catch (e) {
    return { success: false, reason: e.message || 'Unknown error' }
  }
}

let handler = async (m, { conn }) => {
  let { key } = await conn.sendMessage(m.chat, {
    text: '📡 *[🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜] 10%*\n• _Menghubungkan ke GitHub..._'
  }, { quoted: m })

  const edit = async (t) => conn.sendMessage(m.chat, { text: t, edit: key }).catch(() => null)

  setTimeout(() => edit('📥 *[🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜] 40%*\n• _Mengambil database dari GitHub..._'), 1000)
  setTimeout(() => edit('📥 *[🟩🟩🟩🟩🟩🟩🟩⬜⬜⬜] 70%*\n• _Menyimpan ke server..._'), 2000)

  setTimeout(async () => {
    const result = await downloadDB()
    const waktu  = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    if (result.success) {
      edit(`✅ *DOWNLOAD BERHASIL!*\n\n[🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩] *100%*\n\n📦 *File:* database.json\n🕐 *Waktu:* ${waktu}\n\n⚠️ *Penting:* Restart bot agar database terbaru terbaca sempurna.`)
    } else {
      edit(`❌ *DOWNLOAD GAGAL!*\n\n[🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥]\n\n*Error:*\n\`\`\`${result.reason}\`\`\``)
    }
  }, 3500)
}

handler.help    = ['downloaddb']
handler.tags    = ['owner']
handler.command = /^downloaddb$/i
handler.owner   = true

module.exports = handler
