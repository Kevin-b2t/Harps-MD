const fs = require('fs')

let handler = async (m, { text, conn }) => {
    let user = global.db.data.users[m.sender]
    user.afk = + new Date
    user.afkReason = text
    
    let alasan = text ? text : 'Tanpa Alasan'
    let caption = `╭─〔 🍃 〕 *Afk Mode Active*
│ ⌁ Alasan : ${alasan}
│ ⌁ Status : 🔴 Lagi ngilang
╰──────────〔 🍃 〕

* ੈ✩‧₊˚mini nOtes ᗢ 💌 3
⑅ yang mention bakal dikasih tau kok
⑅ sabar ya, nanti juga balik~`

    let mediaGambar = fs.readFileSync('./image/afk.jpg')

    await conn.sendMessage(m.chat, { 
        document: mediaGambar,
        fileName: 'Vinz MD', // NAMA FILE SUDAH DIUBAH DI SINI
        mimetype: 'image/jpeg', 
        jpegThumbnail: mediaGambar, 
        caption: caption 
    }, { quoted: m })
}

handler.help = ['afk [alasan]']
handler.tags = ['main']
handler.command = /^afk$/i

module.exports = handler