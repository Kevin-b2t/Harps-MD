let handler  = async (m, { conn, command, args, usedPrefix, DevMode }) => {
  let type = (args[0] || '').toLowerCase()
  let _type = (args[0] || '').toLowerCase()
  let user = global.db.data.users[m.sender]
  global.db.data.users[m.sender].pickaxe = global.db.data.users[m.sender].pickaxe || 0
  global.db.data.users[m.sender].pedang = global.db.data.users[m.sender].pedang || 0
  global.db.data.users[m.sender].fishingrod = global.db.data.users[m.sender].fishingrod || 0
  
  //----------HARGA
  let hkucing = 10
  let hanjing = 10
  let hular = 100
  let hserigala = 25
  let hrubah = 50
  let hhorse = 90
  let hcentaur = 90
  let hrhinoceros = 90
  let hlion = 850000
  let hberuang = 900000
  let hgriffin = 1450000
  let hphonix = 1500000
  let hkyubi = 500000000
  let hnaga = 1000000000
  let hgodzilla = 100000000000

let logo = `— *P E T   S T O R E* —
▮▧▧▧▧▧▧▧▧▧▧▧▧▮`
let caption = `
🐈 *kucing:* ${hkucing} pet
🐕 *anjing:* ${hanjing} pet
🐺 *serigala:* ${hserigala} pet
🦊 *rubah:* ${hrubah} pet
🐍 *ular:* ${hular} pet
🐎 *horse:* ${hhorse} pet
🐴 *centaur:* ${hcentaur} pet
🦏 *rhinoceros:* ${hrhinoceros} pet
🦁 *lion:* ${hlion} pet
🐻 *beruang:* ${hberuang} pet
🦅 *griffin:* ${hgriffin} pet
🐦‍🔥 *phonix:* ${hphonix} pet
🦊🔥 *kyubi:* ${hkyubi} pet
🐉 *naga:* ${hnaga} pet
🦖 *godzilla:* ${hgodzilla} pet

〉 *ABILITY*
Coming soon..

〉 *Example*
${usedPrefix}adopt kucing`.trim()

  try {
    if (/pet(store|shop)?|adopt/i.test(command)) {
      const count = args[1] && args[1].length > 0 ? Math.min(1000000000, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count)
        switch (type) {
          case 'kucing':
            if (user.kucing > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hkucing) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hkucing
            global.db.data.users[m.sender].kucing += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'anjing':
            if (user.anjing > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hanjing) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hanjing
            global.db.data.users[m.sender].anjing += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'ular':
            if (user.ular > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hular) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hular
            global.db.data.users[m.sender].ular += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'serigala':
            if (user.serigala > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hserigala) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hserigala
            global.db.data.users[m.sender].serigala += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'rubah':
            if (user.rubah > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hrubah) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hrubah
            global.db.data.users[m.sender].rubah += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'horse':
            if (user.horse > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hhorse) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hhorse
            global.db.data.users[m.sender].horse += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'centaur':
            if (user.centaur > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hcentaur) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hcentaur
            global.db.data.users[m.sender].centaur += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'rhinoceros':
            if (user.rhinoceros > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hrhinoceros) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hrhinoceros
            global.db.data.users[m.sender].rhinoceros += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'lion':
            if (user.lion > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hlion) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hlion
            global.db.data.users[m.sender].lion += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'beruang':
            if (user.beruang > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hberuang) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hberuang
            global.db.data.users[m.sender].beruang += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'griffin':
            if (user.griffin > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hgriffin) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hgriffin
            global.db.data.users[m.sender].griffin += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'phonix':
            if (user.phonix > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hphonix) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hphonix
            global.db.data.users[m.sender].phonix += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'kyubi':
            if (user.kyubi > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hkyubi) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hkyubi
            global.db.data.users[m.sender].kyubi += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'naga': // Mengganti dragon menjadi naga
            if (user.naga > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hnaga) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hnaga
            global.db.data.users[m.sender].naga += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
          case 'godzilla':
            if (user.godzilla > 0) return m.reply('Kamu sudah memilik ini')
            if(user.pet < hgodzilla) return m.reply(`Pet Token anda kurang`)
            global.db.data.users[m.sender].pet -= hgodzilla
            global.db.data.users[m.sender].godzilla += 1
            m.reply("Selamat anda mempunyai pet Baru ! 🎉")
            break
            
          default:
              return await m.reply(`${logo}\n${caption}`)
        }
    } 
  } catch (err) {
    m.reply("Error\n\n\n" + err.stack)
  }
}

handler.help = ['petshop']
handler.tags = ['rpg']
handler.command = /^(pet(shop|store)?|adopt)/i
handler.register = true
handler.rpg = true
module.exports = handler
