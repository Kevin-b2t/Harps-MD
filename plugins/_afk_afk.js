const fs = require('fs')

let handler = m => m
handler.before = async function (m) {
  let conn = this 
  
  // Skip pesan dari bot sendiri (lebih reliable)
  if (m.key.fromMe) return true

  // === ANTI DOUBLE MESSAGE (FIX UTAMA) ===
  if (!global.afkProcessedMessages) global.afkProcessedMessages = new Set()
  const msgId = m.key.id
  if (global.afkProcessedMessages.has(msgId)) return true
  global.afkProcessedMessages.add(msgId)

  // Bersihkan Set kalau terlalu besar (optional)
  if (global.afkProcessedMessages.size > 1500) global.afkProcessedMessages.clear()

  let user = global.db.data.users[m.sender]
  
  // 1. FITUR BERHENTI AFK 
  if (user && user.afk > -1 && (Date.now() - user.afk > 3000)) {
    let captionKembali = `╭─〔 🍃 〕 Welcome Back,\n@${m.sender.split('@')[0]}\n│ ⌁ Durasi : ${clockString(Date.now() - user.afk)}\n│ ⌁ Status : 🟢 Online lagi\n╰──────────〔 🍃 〕`
    
    let mediaGambar
    try {
      mediaGambar = fs.readFileSync('./image/afk.jpg')
    } catch (e) {
      console.error('[AFK] Gambar ./image/afk.jpg tidak ditemukan')
      return true
    }

    await conn.sendMessage(m.chat, { 
        document: mediaGambar,
        fileName: 'Vinz MD', 
        mimetype: 'image/jpeg', 
        jpegThumbnail: mediaGambar,
        caption: captionKembali,
        mentions: [m.sender] 
    }, { quoted: m }).catch(console.error)
    
    user.afk = -1
    user.afkReason = ''
    user.afkSpam = 0 
  }
  
  // 2. FITUR PERINGATAN AFK (Saat di-tag / di-reply)
  let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
  
  for (let jid of jids) {
    let userAFK = global.db.data.users[jid]
    if (!userAFK) continue
    
    let afkTime = userAFK.afk
    if (!afkTime || afkTime < 0) continue
    
    // Anti Spam 5 detik (diperbaiki)
    userAFK.afkSpam = userAFK.afkSpam || 0
    const now = Date.now()
    if (now - userAFK.afkSpam < 5000) continue 
    userAFK.afkSpam = now 

    let reason = userAFK.afkReason || 'Tanpa alasan'
    
    let captionPeringatan = `Sssttt! sedang afk, jangan reply pesan / tag dlu ya...\n\n╭─〔 🍃 〕 *Sedang Afk*\n│ ⌁ Durasi : ${clockString(now - afkTime)}\n│ ⌁ Alasan : ${reason}\n│ ⌁ Status : 🔴 Sedang afk\n╰──────────〔 🍃 〕`
    
    let mediaGambar
    try {
      mediaGambar = fs.readFileSync('.image/afk.jpg')
    } catch (e) {
      console.error('[AFK] Gambar ./image/afk.jpg tidak ditemukan')
      continue
    }

    await conn.sendMessage(m.chat, { 
        document: mediaGambar,
        fileName: 'Vinz MD', 
        mimetype: 'image/jpeg', 
        jpegThumbnail: mediaGambar,
        caption: captionPeringatan 
    }, { quoted: m }).catch(console.error)
  }
  
  return true
}

module.exports = handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}