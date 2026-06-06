let handler = async (m, { conn, args, participants }) => {
    // Ambil data users dari database, jika tidak ada set ke objek kosong
    let dbUsers = global.db.data.users || {}
    let users = Object.entries(dbUsers).map(([key, value]) => {
      return {...value, jid: key}
    })

    // Jika tidak ada user sama sekali di database, langsung infokan kosong
    if (users.length === 0) {
      return conn.reply(m.chat, '• *Leaderboard* •\n\nBelum ada data user di dalam database.', m)
    }

    let sortedExp = users.map(toNumber('exp')).sort(sort('exp'))
    let sortedLim = users.map(toNumber('limit')).sort(sort('limit'))
    let sortedLevel = users.map(toNumber('level')).sort(sort('level'))
    let sortedMoney = users.map(toNumber('money')).sort(sort('money'))
    let sortedDiamond = users.map(toNumber('diamond')).sort(sort('diamond')) 
    let sortedEmas = users.map(toNumber('emas')).sort(sort('emas')) 
    let sortedBank = users.map(toNumber('bank')).sort(sort('bank'))
    
    let usersExp = sortedExp.map(enumGetKey)
    let usersLim = sortedLim.map(enumGetKey)
    let usersLevel = sortedLevel.map(enumGetKey)
    let usersMoney = sortedMoney.map(enumGetKey)
    let usersDiamond = sortedDiamond.map(enumGetKey) 
    let usersEmas = sortedEmas.map(enumGetKey) 
    let usersBank = sortedBank.map(enumGetKey)
    
    let len = args[0] && args[0].length > 0 ? Math.min(10, Math.max(parseInt(args[0]), 10)) : Math.min(10, sortedExp.length)
    
    // Fungsi pembantu menggunakan async/await agar nama ter-resolve sempurna dan tidak memunculkan [object Promise]
    const getUserName = async (jid) => {
      let userDb = dbUsers[jid]
      if (userDb && userDb.name) return userDb.name
      try {
        let name = await conn.getName(jid)
        return name || jid.split('@')[0]
      } catch {
        return jid.split('@')[0]
      }
    }

    // Menggunakan Promise.all karena kita memproses fungsi async di dalam .map()
    let expList = await Promise.all(sortedExp.slice(0, len).map(async ({ jid, exp }, i) => `${i + 1}. *${await getUserName(jid)}* • _${exp} Exp_`))
    let limList = await Promise.all(sortedLim.slice(0, len).map(async ({ jid, limit }, i) => `${i + 1}. *${await getUserName(jid)}* • _${limit} Limit_`))
    let levelList = await Promise.all(sortedLevel.slice(0, len).map(async ({ jid, level }, i) => `${i + 1}. *${await getUserName(jid)}* • _Level ${level}_`))
    let moneyList = await Promise.all(sortedMoney.slice(0, len).map(async ({ jid, money }, i) => `${i + 1}. *${await getUserName(jid)}* • _Money ${money}_`))
    let diamondList = await Promise.all(sortedDiamond.slice(0, len).map(async ({ jid, diamond }, i) => `${i + 1}. *${await getUserName(jid)}* • _Diamond ${diamond}_`))
    let emasList = await Promise.all(sortedEmas.slice(0, len).map(async ({ jid, emas }, i) => `${i + 1}. *${await getUserName(jid)}* • _Emas ${emas}_`))
    let bankList = await Promise.all(sortedBank.slice(0, len).map(async ({ jid, bank }, i) => `${i + 1}. *${await getUserName(jid)}* • _Bank ${bank}_`))

    let text = `
  • *XP Leaderboard Top ${len}* •
  Kamu: *${usersExp.indexOf(m.sender) + 1}* dari *${usersExp.length}*
  
  ${expList.join('\n') || 'Tidak ada data'}
  
  • *Limit Leaderboard Top ${len}* •
  Kamu: *${usersLim.indexOf(m.sender) + 1}* dari *${usersLim.length}*
  
  ${limList.join('\n') || 'Tidak ada data'}
  
  • *Level Leaderboard Top ${len}* •
  Kamu: *${usersLevel.indexOf(m.sender) + 1}* dari *${usersLevel.length}*
  
  ${levelList.join('\n') || 'Tidak ada data'}
  
  • *Money Leaderboard Top ${len}* •
  Kamu: *${usersMoney.indexOf(m.sender) + 1}* dari *${usersMoney.length}*
  
    ${moneyList.join('\n') || 'Tidak ada data'}
  
    *Diamond Leaderboard Top ${len}*
  Kamu: *${usersDiamond.indexOf(m.sender) + 1}* dari *${usersDiamond.length}*
  
    ${diamondList.join('\n') || 'Tidak ada data'}
  
  • *Emas Leaderboard Top ${len}* •
  Kamu: *${usersEmas.indexOf(m.sender) + 1}* dari *${usersEmas.length}*
  
  ${emasList.join('\n') || 'Tidak ada data'}
  
  • *Bank Leaderboard Top ${len}* •
  Kamu: *${usersBank.indexOf(m.sender) + 1}* dari *${usersBank.length}*
  
  ${bankList.join('\n') || 'Tidak ada data'}
  `.trim()

    conn.reply(m.chat, text, m)
  }
  
  handler.help = ['leaderboard <jumlah user>']
  handler.tags = ['info']
  handler.command = /^(leaderboard|lb)$/i
  handler.owner = false
  handler.mods = false
  handler.premium = false
  handler.group = true
  handler.private = false
  
  handler.admin = false
  handler.botAdmin = false
  handler.rpg = true
  
  handler.fail = null
  handler.exp = 0
  
  module.exports = handler
  
  function sort(property, ascending = false) {
    if (property) return (...args) => args[ascending ? 0 : 1][property] - args[ascending ? 1 : 0][property]
    else return (...args) => args[ascending ? 0 : 1] - args[ascending ? 1 : 0]
  }
  
  function toNumber(property, _default = 0) {
    if (property) return (a, i, b) => {
      return {...b[i], [property]: a[property] === undefined ? _default : a[property]}
    }
    else return a => a === undefined ? _default : a
  }
  
  function enumGetKey(a) {
    return a.jid
  }
