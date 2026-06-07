const fetch = require('node-fetch')
const fs    = require('fs')
const path  = require('path')

const GITHUB_OWNER  = process.env.GITHUB_OWNER  || 'Kevin-b2t'
const GITHUB_REPO   = process.env.GITHUB_REPO   || 'DATABASE'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'
const DB_FILE       = './database.json'
const RAW_URL       = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`

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
      edit(`✅ *DOWNLOAD BERHASIL!*\n\n[🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩] *100%*\n\n📦 *File:* database.json\n🔗 *Sumber:* github.com/${GITHUB_OWNER}/${GITHUB_REPO}\n🕐 *Waktu:* ${waktu}\n\n⚠️ *Penting:* Restart bot agar database terbaru terbaca sempurna.`)
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
