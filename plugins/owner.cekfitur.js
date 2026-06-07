let handler = async (m, { text }) => {
    let plugins = global.plugins || {}

    // CEK SATU FITUR
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

                let help = plugin.help || []

                let cocok =
                    cmds.some(v => v.toLowerCase().includes(cari)) ||
                    help.some(v => String(v).toLowerCase().includes(cari))

                if (cocok) {
                    ditemukan.push(
                        `✅ FITUR DITEMUKAN\n` +
                        `📂 File: ${file}\n` +
                        `📖 Help: ${help.join(', ') || '-'}`
                    )
                }
            } catch (e) {}
        }

        if (!ditemukan.length) {
            return m.reply(`❌ Fitur "${text}" tidak ditemukan.`)
        }

        return m.reply(ditemukan.join('\n\n'))
    }

    // CEK SEMUA PLUGIN
    let total = 0
    let aktif = 0
    let rusak = 0

    let list = []

    for (let file in plugins) {
        total++

        try {
            let plugin = plugins[file]

            aktif++

            list.push(`✅ ${file}`)
        } catch {
            rusak++
            list.push(`❌ ${file}`)
        }
    }

    m.reply(
`📊 CEK FITUR BOT

📁 Total Plugin : ${total}
✅ Aktif : ${aktif}
❌ Error : ${rusak}

━━━━━━━━━━━━━━

${list.join('\n')}`
    )
}

handler.help = ['cekfitur', 'cekfitur <fitur>']
handler.tags = ['owner']
handler.command = /^cekfitur$/i
handler.owner = true

export default handler
