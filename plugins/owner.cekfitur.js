let handler = async (m, { text, usedPrefix, command }) => {
    let plugins = global.plugins || {}

    // CEK SATU FITUR SPESIFIK
    if (text) {
        let cari = text.toLowerCase()
        let ditemukan = []

        for (let file in plugins) {
            let plugin = plugins[file]

            try {
                let cmds = []

                if (plugin.command instanceof RegExp) {
                    cmds.push(plugin.command.toString())
                } else if (Array.isArray(plugin.command)) {
                    cmds.push(...plugin.command.map(v => String(v)))
                } else if (plugin.command) {
                    cmds.push(String(plugin.command))
                }

                let help = Array.isArray(plugin.help) ? plugin.help : [plugin.help]

                let cocok =
                    cmds.some(v => v && v.toLowerCase().includes(cari)) ||
                    help.some(v => v && String(v).toLowerCase().includes(cari))

                if (cocok) {
                    ditemukan.push(
                        `✅ *FITUR DITEMUKAN*\n` +
                        `📂 File: ${file}\n` +
                        `📖 Help: ${help.join(', ') || '-'}`
                    )
                }
            } catch (e) {}
        }

        if (!ditemukan.length) {
            return m.reply(`❌ Fitur "${text}" tidak ditemukan di dalam sistem.`)
        }

        let replyText = ditemukan.join('\n\n');
        
        // Mencegah bot crash / blank karena teks terlalu panjang
        if (replyText.length > 10000) {
             return m.reply(`✅ Ditemukan *${ditemukan.length} kecocokan*, tapi pesannya terlalu panjang untuk dikirim!\n\n_Coba gunakan kata kunci yang lebih spesifik._`);
        }

        return m.reply(replyText)
    }

    // CEK REKAP SEMUA PLUGIN (TIDAK DILIST SATU-SATU AGAR TIDAK BLANK)
    let total = 0
    let aktif = 0
    let rusak = 0

    for (let file in plugins) {
        total++
        try {
            if (plugins[file]) aktif++
        } catch {
            rusak++
        }
    }

    m.reply(
`📊 *REKAP FITUR BOT* 📊

📁 Total Plugin : *${total} File*
✅ Berjalan Normal : *${aktif}*
❌ Error/Rusak : *${rusak}*

_Note: Untuk mencari file spesifik, ketik *${usedPrefix + command} <kata_kunci>*_`
    )
}

handler.help = ['cekfitur <teks>']
handler.tags = ['owner']
handler.command = /^(cekfitur|listplugin|cekplugin)$/i
handler.owner = true // Pastikan hanya Owner yang bisa pakai

module.exports = handler
