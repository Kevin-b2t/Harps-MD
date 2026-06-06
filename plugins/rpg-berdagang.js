let handler = async (m, { conn, args, usedPrefix }) => {
    // Membuat objek penampungan trade di database jika belum ada
    global.db.data.trades = global.db.data.trades || {}
    
    let who = m.mentionedJid[0]
    if (!who) return conn.reply(m.chat, `• *Format salah!*\nContoh penggunaan:\n${usedPrefix}berdagang @user [item_mu] [jumlah] [item_dia] [jumlah]\n\n*Contoh:*\n${usedPrefix}berdagang @user potion 5 money 10000\n\n_(Artinya kamu memberikan 5 potion milikmu untuk ditukar dengan 10000 money miliknya)_`, m)
    
    if (who === m.sender) return conn.reply(m.chat, '❌ Tidak bisa berdagang dengan diri sendiri!', m)
    if (typeof global.db.data.users[who] == 'undefined') return conn.reply(m.chat, '❌ Pengguna yang kamu tag tidak ada di dalam database.', m)

    let itemSender = args[1]?.toLowerCase()
    let countSender = parseInt(args[2])
    let itemReceiver = args[3]?.toLowerCase()
    let countReceiver = parseInt(args[4])

    if (!itemSender || isNaN(countSender) || !itemReceiver || isNaN(countReceiver)) {
        return conn.reply(m.chat, `• *Format salah!*\nContoh: ${usedPrefix}berdagang @user potion 5 money 10000`, m)
    }

    if (countSender < 1 || countReceiver < 1) return conn.reply(m.chat, '❌ Jumlah tidak boleh kurang dari 1!', m)

    // Daftar item/status yang dilarang untuk diperjualbelikan (Pencegahan Cheat)
    const unTradable = ['limit', 'exp', 'level', 'role', 'premium', 'banned', 'jail', 'armor', 'health', 'stamina', 'lastclaim', 'lastdagang', 'joinlimit', 'pet']
    if (unTradable.includes(itemSender) || unTradable.includes(itemReceiver)) return conn.reply(m.chat, '❌ Tipe item tersebut tidak bisa diperdagangkan!', m)

    // Memastikan item yang dimasukkan terdaftar di database pengguna
    if (typeof global.db.data.users[m.sender][itemSender] !== 'number') return conn.reply(m.chat, `❌ Item '${itemSender}' tidak valid atau tidak ada di inventory.`, m)
    if (typeof global.db.data.users[who][itemReceiver] !== 'number') return conn.reply(m.chat, `❌ Item '${itemReceiver}' tidak valid.`, m)

    // Memastikan modal orang yang mengajak trade cukup
    if (global.db.data.users[m.sender][itemSender] < countSender) return conn.reply(m.chat, `❌ Kamu tidak memiliki cukup *${itemSender}* untuk berdagang. (Kamu butuh ${countSender})`, m)

    // Jika target sudah punya tawaran barter dari orang lain yang belum dijawab
    if (global.db.data.trades[who]) return conn.reply(m.chat, `❌ @${who.split('@')[0]} sedang memiliki tawaran barter yang tertunda dengan orang lain. Tunggu sampai selesai atau hangus.`, m, { mentions: [who] })

    // Menyimpan data barter sementara
    global.db.data.trades[who] = {
        sender: m.sender,
        itemSender: itemSender,
        countSender: countSender,
        itemReceiver: itemReceiver,
        countReceiver: countReceiver,
        timeout: setTimeout(() => {
            if (global.db.data.trades[who]) {
                delete global.db.data.trades[who]
                conn.reply(m.chat, `⏳ Waktu tawaran barter dari @${m.sender.split('@')[0]} kepada @${who.split('@')[0]} telah habis karena tidak direspon.`, m, { mentions: [m.sender, who] })
            }
        }, 60000 * 5) // Tawaran akan hangus otomatis dalam 5 menit
    }

    let caption = `Menunggu konfirmasi dari @${who.split('@')[0]}...\n\n@${m.sender.split('@')[0]} menawarkan:\n🎁 *${countSender} ${itemSender}*\n\nSebagai ganti untuk:\n🤝 *${countReceiver} ${itemReceiver}*\n\nJika @${who.split('@')[0]} setuju, silakan ketik:\n*${usedPrefix}terimabarter @${m.sender.split('@')[0]}*\n\n_(Tawaran ini akan hangus otomatis dalam 5 menit)_`
    
    conn.reply(m.chat, caption, m, { mentions: [who, m.sender] })
}

handler.help = ['berdagang @user <item_mu> <jumlah> <item_dia> <jumlah>']
handler.tags = ['rpg']
handler.command = /^(berdagang|barter)$/i
handler.group = true
handler.rpg = true

module.exports = handler
