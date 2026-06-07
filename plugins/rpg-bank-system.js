/* * Gabungan fitur RPG Bank (Transfer, Nabung, Tarik, Cek)
 * TQ: hafizdexe
 */

let handler = async (m, { conn, args, usedPrefix, command, DevMode }) => {
    let users = global.db.data.users;
    let sender = m.sender;
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
    let action = command.toLowerCase();

    // 1. Fitur Cek Bank
    if (action === 'bank') {
        let user = users[target || sender];
        let capt = `乂  *🏦 B A N K - U S E R 🏦* 乂\n\n`
            + `  ◦  *👤 Nama* : ${user.name}\n`
            + `  ◦  *⭐ Role* : ${user.role}\n`
            + `  ◦  *💰 Saldo* : ${user.money}\n`
            + `  ◦  *📈 Level* : ${user.level}\n`
            + `  ◦  *🏧 ATM* : ${user.bank}\n\n`
            + `> *${usedPrefix} atm <jumlah>* untuk menabung\n`
            + `> *${usedPrefix} pull <jumlah>* untuk menarik uang\n`
            + `> *${usedPrefix} tf <type> <jumlah> <@tag>* untuk transfer`;
        return conn.sendMessage(m.chat, { image: { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIiXrZfzbrdryj4p1M69g0gLTVE7RR00k6kXSu4vPz12R5MhFQ-vhHjKE&s' }, caption: capt, mentions: [sender] }, { quoted: m });
    }

    // 2. Fitur Transfer
    if (action === 'tf' || action === 'transfer') {
        if (args.length < 3) return conn.reply(m.chat, `Gunakan format: ${usedPrefix}tf <type> <jumlah> <@tag>`, m);
        let type = args[0].toLowerCase();
        let count = Math.min(1000000000, Math.max(parseInt(args[1]) || 1, 1));
        let who = target || (args[2].replace(/[@ .+-]/g, '') + '@s.whatsapp.net');
        
        if (!users[who]) return m.reply('Target tidak ditemukan di database.');
        if (!users[sender][type] || users[sender][type] < count) return m.reply(`Data ${type} tidak mencukupi.`);
        
        users[sender][type] -= count;
        users[who][type] += count;
        return m.reply(`Berhasil mentransfer ${type} sebesar ${count}`);
    }

    // 3. Fitur Nabung (ATM) & Tarik (Pull)
    if (action.startsWith('atm') || action.startsWith('pull')) {
        let isPull = action.startsWith('pull');
        let count = args[0] ? (args[0] === 'all' ? Math.floor(isPull ? users[sender].bank : users[sender].money) : parseInt(args[0])) : 1;
        count = Math.max(1, count);

        if (isPull) {
            if (users[sender].bank < count) return m.reply(`ATM tidak cukup! Sisa: ${users[sender].bank}`);
            users[sender].bank -= count;
            users[sender].money += count;
            m.reply(`🚩 Berhasil menarik ${count} ke dompet.`);
        } else {
            if (users[sender].money < count) return m.reply(`Uang tidak cukup! Sisa: ${users[sender].money}`);
            users[sender].money -= count;
            users[sender].bank += count;
            m.reply(`🚩 Berhasil menabung ${count} ke ATM.`);
        }
    }
}

handler.help = ['bank', 'transfer', 'atm', 'pull']
handler.tags = ['rpg']
handler.command = /^(bank|tf|transfer|atm|atmall|pull|pullall)$/i
handler.rpg = true
handler.group = true

module.exports = handler
