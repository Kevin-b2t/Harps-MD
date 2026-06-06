let handler = async (m, { conn, args, usedPrefix }) => {
    global.db.data.trades = global.db.data.trades || {}
    
    let who = m.sender // Yang mengetik command ini adalah penerima tawaran
    let senderTrade = m.mentionedJid[0]
    
    if (!senderTrade) return conn.reply(m.chat, `• Tag orang yang mengajakmu berdagang!\nContoh: *${usedPrefix}terimabarter @user*`, m)
    
    let trade = global.db.data.trades[who]
    if (!trade) return conn.reply(m.chat, '❌ Tidak ada tawaran barter yang sedang berlangsung untukmu.', m)
    if (trade.sender !== senderTrade) return conn.reply(m.chat, `❌ Tawaran barter saat ini bukan dari @${senderTrade.split('@')[0]}.`, m, { mentions: [senderTrade] })
    
    let { itemSender, countSender, itemReceiver, countReceiver, timeout } = trade
    
    // Pengecekan ulang saldo untuk menghindari penipuan (uang/barang dipindah sebelum di acc)
    if (global.db.data.users[trade.sender][itemSender] < countSender) {
        clearTimeout(timeout)
        delete global.db.data.trades[who]
        return conn.reply(m.chat, `❌ Barter dibatalkan otomatis! @${trade.sender.split('@')[0]} ternyata tidak lagi memiliki cukup *${itemSender}*.`, m, { mentions: [trade.sender] })
    }
    if (global.db.data.users[who][itemReceiver] < countReceiver) {
        return conn.reply(m.chat, `❌ Kamu tidak memiliki cukup *${itemReceiver}* untuk menerima tawaran ini. Kamu harus punya minimal ${countReceiver} ${itemReceiver}.`, m)
    }
    
    // Proses Transaksi Perpindahan Barang dan Uang
    global.db.data.users[trade.sender][itemSender] -= countSender
    global.db.data.users[who][itemSender] = (global.db.data.users[who][itemSender] || 0) + countSender
    
    global.db.data.users[who][itemReceiver] -= countReceiver
    global.db.data.users[trade.sender][itemReceiver] = (global.db.data.users[trade.sender][itemReceiver] || 0) + countReceiver
    
    // Hapus sesi barter dan matikan hitungan mundur
    clearTimeout(timeout)
    delete global.db.data.trades[who] 
    
    conn.reply(m.chat, `🎉 *Barter Berhasil!*\n\nKamu telah menukarkan *${countReceiver} ${itemReceiver}* milikmu,\ndan menerima *${countSender} ${itemSender}* dari @${trade.sender.split('@')[0]}.`, m, { mentions: [trade.sender] })
}

handler.help = ['terimabarter @user']
handler.tags = ['rpg']
handler.command = /^(terimabarter|accbarter)$/i
handler.group = true
handler.rpg = true

module.exports = handler
