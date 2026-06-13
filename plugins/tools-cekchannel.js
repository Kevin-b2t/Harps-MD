let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Masukkan kode atau link channel')

    try {
        let data = await conn.newsletterMetadata('invite', text.trim())

        let teks = `
📢 *INFORMASI CHANNEL*

📛 Nama: ${data.name}
🆔 ID: ${data.id}
👥 Subscribers: ${data.subscribers || 0}
        `.trim()

        m.reply(teks)
    } catch (e) {
        console.error(e)
        m.reply('Gagal mengambil data channel.')
    }
}

handler.help = ['cekidchannel']
handler.tags = ['owner']
handler.command = /^cekidchannel$/i

handler.owner = true

module.exports = handler