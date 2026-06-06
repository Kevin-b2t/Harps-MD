const pets = ['kucing', 'anjing', 'serigala', 'phonix', 'rubah', 'naga', 'kyubi', 'griffin', 'beruang', 'lion', 'rhinoceros', 'centaur', 'horse', 'ular', 'godzilla']

let handler = async (m, { conn, command, args, usedPrefix }) => {
    // Inisialisasi object untuk menyimpan data tantangan
    conn.battlepet_request = conn.battlepet_request || {}
    
    let cmd = command.toLowerCase()
    let user = global.db.data.users[m.sender]

    // ─── FITUR TANTANG (BATTLEPET) ───
    if (cmd === 'battlepet') {
        let petName = (args[0] || '').toLowerCase()
        let betAmount = parseInt(args[1]) // FITUR BARU: Ambil jumlah taruhan
        let target = m.mentionedJid[0]

        if (!petName || !pets.includes(petName)) return m.reply(`Pilih pet yang valid!\n\nList Pet:\n${pets.map(v => `• ${v}`).join('\n')}\n\n*Contoh:* ${usedPrefix}battlepet kucing 10000000 @628xxx`)
        if (user[petName] == 0 || !user[petName]) return m.reply(`Kamu tidak memiliki pet ${petName}!`)
        
        // FITUR BARU: Validasi Taruhan 10jt hingga 1M
        if (isNaN(betAmount) || betAmount < 10000000 || betAmount > 1000000000) return m.reply('Minimal taruhan adalah Rp 10.000.000 (10jt) dan maksimal Rp 1.000.000.000 (1M)!')
        if (user.money < betAmount) return m.reply('Uang kamu tidak cukup untuk melakukan taruhan sebesar ini!')

        if (!target) return m.reply(`Tag orang yang ingin kamu tantang!\n\n*Contoh:* ${usedPrefix}battlepet ${petName} 10000000 @628xxx`)
        if (target === m.sender) return m.reply('Tidak bisa menantang diri sendiri, cari lawan lain!')
        if (typeof global.db.data.users[target] == "undefined") return m.reply('Pengguna yang ditag tidak terdaftar di database.')

        // FITUR BARU: Cek apakah uang musuh cukup untuk meladeni
        if (global.db.data.users[target].money < betAmount) return m.reply('Uang lawan tidak cukup untuk meladeni nominal taruhanmu!')

        // Cek apakah target sedang ditantang orang lain
        if (conn.battlepet_request[target]) return m.reply('Orang tersebut sedang mendapat tantangan dari orang lain. Tunggu dia merespon atau cari target lain!')
        
        // Buat request tantangan
        conn.battlepet_request[target] = {
            challenger: m.sender,
            challengerPet: petName,
            betAmount: betAmount, // Simpan taruhan di memory
            timeout: setTimeout(() => {
                if (conn.battlepet_request[target]) {
                    delete conn.battlepet_request[target]
                    // FITUR BARU: Beritahu saat kadaluarsa
                    conn.sendMessage(m.chat, { text: `⏳ *PERTARUNGAN KADALUARSA*\n\nWaktu habis (60 detik), @${target.split('@')[0]} tidak merespon.\nTantangan dari @${m.sender.split('@')[0]} dibatalkan otomatis!`, mentions: [target, m.sender] })
                }
            }, 60000) // Waktu 60 detik untuk menerima
        }

        return m.reply(`⚔️ *TANTANGAN BATTLE PET* ⚔️\n\n@${m.sender.split('@')[0]} menantang @${target.split('@')[0]}!\n\n🐾 *Pet Penantang:* ${petName} (Lv. ${user[petName]})\n💰 *Taruhan:* Rp ${betAmount.toLocaleString()}\n\nKetik *${usedPrefix}terimapet [nama_pet]* untuk menerima tantangan, atau *${usedPrefix}tolakpet* untuk menolak. Waktu kalian 60 detik!`, null, { mentions: [m.sender, target] })
    }

    // ─── FITUR TERIMA TANTANGAN ───
    if (cmd === 'terimapet') {
        let request = conn.battlepet_request[m.sender]
        if (!request) return m.reply('Tidak ada tantangan untukmu saat ini (atau sudah kadaluarsa).')

        let petName = (args[0] || '').toLowerCase()
        if (!petName || !pets.includes(petName)) return m.reply(`Pilih pet yang ingin kamu gunakan!\n\nList Pet:\n${pets.map(v => `• ${v}`).join('\n')}\n\n*Contoh:* ${usedPrefix}terimapet anjing`)
        if (user[petName] == 0 || !user[petName]) return m.reply(`Kamu tidak memiliki pet ${petName}!`)

        let challenger = request.challenger
        let challengerPet = request.challengerPet
        let betAmount = request.betAmount

        // Double check sebelum bertarung
        if (user.money < betAmount) return m.reply('Uang kamu sudah tidak cukup untuk menerima taruhan ini!')

        // Clear timeout & hapus request karena sudah direspon
        clearTimeout(request.timeout)
        delete conn.battlepet_request[m.sender]

        // FITUR BARU: Animasi Pertarungan Gonta Ganti
        let msg = await conn.sendMessage(m.chat, { text: `⚔️ @${m.sender.split('@')[0]} menerima tantangan dari @${challenger.split('@')[0]} menggunakan ${petName}!\n\nPertarungan sedang berlangsung... 🔥`, mentions: [m.sender, challenger] }, { quoted: m })
        
        let animFrames = [
            `[ 🐾 ] ${petName.toUpperCase()} dan ${challengerPet.toUpperCase()} melangkah masuk ke arena...`,
            `[ 💥 ] Serangan pertama dilancarkan secara brutal!`,
            `[ 🛡️ ] Pertukaran damage yang sangat sengit terjadi!`,
            `[ ⚡ ] Menyiapkan serangan pamungkas...`,
            `[ 🏁 ] Asap mereda, menghitung hasil pertarungan...`
        ]
        
        for (let frame of animFrames) {
            await delay(1500)
            await conn.sendMessage(m.chat, { text: frame, edit: msg.key, mentions: [m.sender, challenger] })
        }

        // --- LOGIKA PERTARUNGAN STATUS (TIDAK ADA YANG DIHAPUS) ---
        let myStats = getPetStats(petName, user[petName]) // Yang ditantang (m.sender)
        let enemyStats = getPetStats(challengerPet, global.db.data.users[challenger][challengerPet]) // Penantang (challenger)

        let pointPemain = 0 // Point m.sender (yang ditantang)
        let pointLawan = 0 // Point Penantang

        for (let i = 0; i < 10; i++) {
            let myPower = (myStats.attack + myStats.strength) * (myStats.speed / 100) - enemyStats.defense + getRandom(1, 15)
            let enemyPower = (enemyStats.attack + enemyStats.strength) * (enemyStats.speed / 100) - myStats.defense + getRandom(1, 15)

            if (myPower > enemyPower) pointPemain += 1
            else pointLawan += 1
        }

        let statText = `
📊 *HASIL PERTARUNGAN* 📊

🐾 *Penantang (@${challenger.split('@')[0]})*
▶ ${challengerPet} (Lv. ${global.db.data.users[challenger][challengerPet]})
❤️ HP: ${enemyStats.health} | ⚡ Stam: ${enemyStats.stamina}
⚔️ Atk: ${enemyStats.attack} | 🛡️ Def: ${enemyStats.defense}
Score Akhir: ${pointLawan * 10}

*VS*

🐾 *Kamu (@${m.sender.split('@')[0]})*
▶ ${petName} (Lv. ${user[petName]})
❤️ HP: ${myStats.health} | ⚡ Stam: ${myStats.stamina}
⚔️ Atk: ${myStats.attack} | 🛡️ Def: ${myStats.defense}
Score Akhir: ${pointPemain * 10}
───────────────\n\n`

        let expGot = getRandom(143, 865) // FITUR BARU: Generator Acak EXP

        // Penentuan Pemenang dengan Integrasi Uang Taruhan & EXP
        if (pointPemain > pointLawan) {
            // Yang ditantang menang
            user.money += betAmount
            global.db.data.users[challenger].money -= betAmount
            user.exp += expGot

            let finalMsg = `${statText}🏆 *Pemenang: @${m.sender.split('@')[0]}!*\n\nKamu menang karena pet kamu ${alasanMenang[getRandom(0, alasanMenang.length - 1)]}\n\n💰 Kamu mendapatkan: Rp ${betAmount.toLocaleString()}\n💸 Uang penantang berkurang: Rp ${betAmount.toLocaleString()}\n✨ EXP Didapat: +${expGot}`
            await conn.sendMessage(m.chat, { text: finalMsg, edit: msg.key, mentions: [m.sender, challenger] })
            
        } else if (pointPemain < pointLawan) {
            // Penantang Menang
            global.db.data.users[challenger].money += betAmount
            global.db.data.users[challenger].exp += expGot
            user.money -= betAmount
            
            let finalMsg = `${statText}🏆 *Pemenang: @${challenger.split('@')[0]}!*\n\nPenantang menang karena pet miliknya ${alasanMenang[getRandom(0, alasanMenang.length - 1)]}\n\n💰 Penantang merampas: Rp ${betAmount.toLocaleString()}\n💸 Uang kamu berkurang: Rp ${betAmount.toLocaleString()}\n✨ EXP Penantang: +${expGot}`
            await conn.sendMessage(m.chat, { text: finalMsg, edit: msg.key, mentions: [m.sender, challenger] })
            
        } else {
            // Imbang
            let finalMsg = `${statText}*Hasil Imbang!*\nPertarungan sangat sengit, kekuatan kalian setara. Tidak ada uang yang berpindah tangan. Modal aman.`
            await conn.sendMessage(m.chat, { text: finalMsg, edit: msg.key, mentions: [m.sender, challenger] })
        }
        return
    }

    // ─── FITUR TOLAK TANTANGAN ───
    if (cmd === 'tolakpet') {
        let request = conn.battlepet_request[m.sender]
        if (!request) return m.reply('Tidak ada tantangan untukmu saat ini.')

        clearTimeout(request.timeout)
        let challenger = request.challenger
        delete conn.battlepet_request[m.sender]

        m.reply(`❌ @${m.sender.split('@')[0]} telah menolak tantangan dari @${challenger.split('@')[0]} karena takut kalah.`, null, { mentions: [m.sender, challenger] })
        return
    }
}

handler.help = ['battlepet', 'terimapet', 'tolakpet']
handler.tags = ['rpg']
handler.command = /^(battlepet|terimapet|tolakpet)$/i

handler.register = true
handler.group = true
handler.rpg = true

module.exports = handler

// Function Generate Random Number
function getRandom(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// Function Generator Status Pet
function getPetStats(pet, level) {
    let base = {
        'kucing': { hp: 100, stam: 80, atk: 15, spd: 110, mspd: 120, str: 10, def: 8 },
        'anjing': { hp: 120, stam: 100, atk: 12, spd: 100, mspd: 105, str: 12, def: 12 },
        'serigala': { hp: 130, stam: 110, atk: 18, spd: 115, mspd: 115, str: 15, def: 10 },
        'rubah': { hp: 105, stam: 120, atk: 16, spd: 125, mspd: 130, str: 11, def: 9 },
        'ular': { hp: 90, stam: 90, atk: 20, spd: 130, mspd: 110, str: 10, def: 5 },
        'horse': { hp: 150, stam: 150, atk: 10, spd: 140, mspd: 150, str: 12, def: 10 },
        'centaur': { hp: 200, stam: 180, atk: 25, spd: 110, mspd: 120, str: 20, def: 15 },
        'rhinoceros': { hp: 300, stam: 120, atk: 15, spd: 60, mspd: 70, str: 30, def: 35 },
        'lion': { hp: 180, stam: 160, atk: 28, spd: 115, mspd: 120, str: 25, def: 18 },
        'beruang': { hp: 250, stam: 140, atk: 22, spd: 80, mspd: 90, str: 28, def: 25 },
        'griffin': { hp: 220, stam: 200, atk: 35, spd: 160, mspd: 170, str: 22, def: 18 },
        'phonix': { hp: 180, stam: 250, atk: 45, spd: 150, mspd: 160, str: 20, def: 15 },
        'kyubi': { hp: 350, stam: 300, atk: 60, spd: 180, mspd: 190, str: 40, def: 30 },
        'naga': { hp: 450, stam: 350, atk: 80, spd: 140, mspd: 150, str: 55, def: 45 },
        'godzilla': { hp: 1000, stam: 500, atk: 150, spd: 40, mspd: 50, str: 100, def: 100 }
    }[pet] || { hp: 100, stam: 100, atk: 15, spd: 100, mspd: 100, str: 10, def: 10 }

    return {
        health: Math.floor(base.hp + (level * 15)),
        stamina: Math.floor(base.stam + (level * 5)),
        attack: Math.floor(base.atk + (level * 3)),
        speed: Math.floor(base.spd + (level * 2)),
        movementSpeed: Math.floor(base.mspd + (level * 2)),
        strength: Math.floor(base.str + (level * 2.5)),
        defense: Math.floor(base.def + (level * 2))
    }
}

const alasanKalah = ['Statistik kalah jauh', 'Kalah kecepatan gerak', 'Kurang damage', 'Armor / Defense gampang tembus', 'Stamina terkuras habis', 'Pet terlalu lemah']
const alasanMenang = ['Serangan yang sangat mematikan', 'Sangat lincah di arena', 'Pertahanan (Defense) sekuat baja', 'Strategi pertarungan luar biasa', 'Stamina tiada batas']

const delay = time => new Promise(res => setTimeout(res, time));
