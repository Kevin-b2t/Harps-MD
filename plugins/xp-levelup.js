let levelling = require('../lib/levelling')

let handler = m => {
  let user = global.db.data.users[m.sender]
  
  if (!levelling.canLevelUp(user.level, user.exp, global.multiplier)) {
    let { min, xp, max } = levelling.xpRange(user.level, global.multiplier)
    throw `
Level *${user.level} (${user.exp - min}/${xp})*
Kurang *${max - user.exp}* lagi!
`.trim()
  }
  
  let before = user.level * 1
  let loopCount = 0 // Variabel untuk menghitung jumlah looping
  
  while (levelling.canLevelUp(user.level, user.exp, global.multiplier)) {
      user.level++
      loopCount++
      // Batasi maksimal naik 1000 level per satu kali ketik agar bot tidak mati
      if (loopCount >= 500) break;
  }
  
  if (before !== user.level) {
        m.reply(`
Selamat, anda telah naik level!
*${before}* -> *${user.level}*
gunakan *.profile* untuk mengecek
${loopCount >= 500 ? '\n_(Wah EXP kamu kebanyakan! Ketik *.level* lagi untuk lanjut naik level)_' : ''}
	`.trim())
  }
}

handler.help = ['levelup']
handler.tags = ['xp']

handler.command = /^level(|up)$/i

module.exports = handler
