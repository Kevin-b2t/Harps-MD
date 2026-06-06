const timeout = 2700000 // Jeda 45 menit dalam milidetik

let handler = async (m, { conn, usedPrefix, text, command }) => {
    let user = global.db.data.users[m.sender]
    
    // --- INITIALIZATION DATABASE ANTI-BUG ---
    if (user.tanah === undefined) user.tanah = 1 
    if (user.lastberkebon === undefined) user.lastberkebon = 0
    
    const cropList = ['apel', 'anggur', 'mangga', 'pisang', 'jeruk', 'padi', 'gandum', 'wortel', 'kentang', 'singkong', 'ubijalar', 'tebu']
    cropList.forEach(crop => {
        if (user['bibit' + crop] === undefined) user['bibit' + crop] = 0
        if (user[crop] === undefined) user[crop] = 0
    })

    // --- FORMULA KAPASITAS TANAH ---
    // Luas Maksimal: 165 Hektar -> Kapasitas Maksimal: 2650 Tanaman
    let maxTanaman = Math.floor(user.tanah * (2650 / 165))
    
    // --- SISTEM PASAR TANAH (Dinamis per 1 Jam) ---
    // Inisialisasi data market global agar tersimpan di database
    if (!global.db.data.market) global.db.data.market = {}
    if (!global.db.data.market.tanah) {
        global.db.data.market.tanah = {
            hargaSaatIni: 6400000,
            lastUpdate: 0,
            lastPeak: 0
        }
    }
    
    let marketTanah = global.db.data.market.tanah
    let now = new Date() * 1
    let basePrice = 6400000 // Harga dasar tetap 6.4 Juta
    
    // Update harga tanah setiap 1 jam (3600000 ms)
    if (now - marketTanah.lastUpdate > 3600000) {
        let dateNow = new Date(now).getDate()
        let lastPeakDate = new Date(marketTanah.lastPeak).getDate()
        
        let peluang = Math.random()
        
        // Peluang 10% untuk harga melambung tinggi hingga 400% (Maksimal 1x Sehari)
        if (peluang < 0.10 && dateNow !== lastPeakDate) {
            let multiplier = Math.random() * 4.0 // Kenaikan 0% - 400%
            marketTanah.hargaSaatIni = Math.floor(basePrice + (basePrice * multiplier))
            marketTanah.lastPeak = now
        } 
        // Peluang 45% untuk harga turun hingga 35%
        else if (peluang < 0.55) {
            let drop = Math.random() * 0.35 // Penurunan 0% - 35%
            marketTanah.hargaSaatIni = Math.floor(basePrice - (basePrice * drop))
        } 
        // Peluang 45% untuk harga naik normal hingga 60%
        else {
            let rise = Math.random() * 0.60 // Kenaikan 0% - 60%
            marketTanah.hargaSaatIni = Math.floor(basePrice + (basePrice * rise))
        }
        
        marketTanah.lastUpdate = now
    }
    
    let hargaTanahPerHektar = marketTanah.hargaSaatIni

    // --- HARGA JUAL HASIL PANEN (Harga per 1 biji/potongan) ---
    const hargaJual = {
        pisang: 120, anggur: 150, mangga: 140, jeruk: 130, apel: 160,
        padi: 80, gandum: 90, wortel: 110, kentang: 100, singkong: 95,
        ubijalar: 105, tebu: 180 
    }

    // --- MAPPING EMOJI ---
    const emoji = {
        pisang: '🍌', anggur: '🍇', mangga: '🥭', jeruk: '🍊', apel: '🍎',
        padi: '🌾', gandum: '🌾', wortel: '🥕', kentang: '🥔', singkong: '🍠',
        ubijalar: '🍠', tebu: '🎋'
    }

    let args = text.trim().split(/ +/)
    let action = args[0] ? args[0].toLowerCase() : ''

    // ==========================================
    // SUBCOMMAND: BELI TANAH
    // ==========================================
    if (action === 'belitanah' || action === 'beli-tanah') {
        let jumlahBeli = parseInt(args[1])
        if (isNaN(jumlahBeli) || jumlahBeli <= 0) return m.reply(`Gunakan format: *${usedPrefix}${command} belitanah <jumlah_hektar>*`)
        
        if (user.tanah + jumlahBeli > 165) {
            return m.reply(`❌ Batas maksimal kepemilikan tanah hanya *165 Hektar*! Tanahmu saat ini: *${user.tanah} Hektar*.`)
        }
        
        let totalBiaya = jumlahBeli * hargaTanahPerHektar
        if (user.money < totalBiaya) {
            return m.reply(`❌ Uang kamu tidak cukup. Membutuhkan *Rp ${totalBiaya.toLocaleString()}* untuk membeli ${jumlahBeli} Hektar.\n_Harga pasar tanah saat ini: Rp ${hargaTanahPerHektar.toLocaleString()}/Hektar_.`)
        }
        
        user.money -= totalBiaya
        user.tanah += jumlahBeli
        return m.reply(`🎉 Sukses membeli *${jumlahBeli} Hektar* tanah seharga *Rp ${totalBiaya.toLocaleString()}*.\nSekarang total tanahmu: *${user.tanah} Hektar* (Kapasitas Tanam: *${Math.floor(user.tanah * (2650 / 165))}* tanaman).`)
    }
    
        // ==========================================
    // SUBCOMMAND: JUAL TANAH
    // ==========================================
    if (action === 'jualtanah' || action === 'jual-tanah') {
        let jumlahJual = parseInt(args[1])
        if (isNaN(jumlahJual) || jumlahJual <= 0) return m.reply(`Gunakan format: *${usedPrefix}${command} jualtanah <jumlah_hektar>*\n\n_Harga beli saat ini: Rp ${hargaTanahPerHektar.toLocaleString()}/Hektar. Kami membeli kembali tanahmu seharga 70% dari harga pasar._`)
        
        if (user.tanah <= 1) {
            return m.reply(`❌ Kamu tidak bisa menjual tanah lagi! Kamu minimal harus memiliki *1 Hektar* tanah.`)
        }
        
        if (jumlahJual > user.tanah - 1) {
            return m.reply(`❌ Kamu hanya bisa menjual maksimal *${user.tanah - 1} Hektar* (Minimal harus sisa 1 Hektar).`)
        }
        
        // Harga jual kembali tanah = 70% dari harga pasar saat ini
        let hargaJualKembali = Math.floor(hargaTanahPerHektar * 0.7)
        let totalUang = jumlahJual * hargaJualKembali
        
        user.tanah -= jumlahJual
        user.money += totalUang
        
        return m.reply(`✅ Berhasil menjual *${jumlahJual} Hektar* tanah seharga *Rp ${totalUang.toLocaleString()}* (70% dari harga pasar).\nSisa tanahmu saat ini: *${user.tanah} Hektar*.`)
    }

    // ==========================================
    // SUBCOMMAND: JUAL HASIL PANEN
    // ==========================================
    if (action === 'jual') {
        let jenisBuah = args[1] ? args[1].toLowerCase() : ''
        let jumlahJual = args[2]
        
        if (!jenisBuah || !cropList.includes(jenisBuah)) {
            return m.reply(`Gunakan format: *${usedPrefix}${command} jual <jenis_tanaman> <jumlah|all>*\n\n*Pilihan:* ${cropList.join(', ')}`)
        }
        
        let totalBuah = user[jenisBuah]
        let itemJual = (jumlahJual === 'all' || !jumlahJual) ? totalBuah : parseInt(jumlahJual)
        
        if (isNaN(itemJual) || itemJual <= 0) return m.reply(`Jumlah yang dimasukkan salah!`)
        if (totalBuah < itemJual) return m.reply(`Gudang kamu tidak memiliki cukup ${jenisBuah}. Kamu hanya punya *${totalBuah}* buah.`)
        
        let pendapatan = itemJual * hargaJual[jenisBuah]
        user[jenisBuah] -= itemJual
        user.money += pendapatan
        
        return m.reply(`💰 Sukses menjual *${itemJual} ${emoji[jenisBuah]} ${jenisBuah}* seharga *Rp ${pendapatan.toLocaleString()} Money*!`)
    }

    // ==========================================
    // SUBCOMMAND: TANAM (BERKEBON)
    // ==========================================
    if (action === 'tanam') {
        let jenisBibit = args[1] ? args[1].toLowerCase() : ''
        let jumlahTanam = parseInt(args[2])

        if (!jenisBibit || (!cropList.includes(jenisBibit) && jenisBibit !== 'all')) {
            return m.reply(`Gunakan format: *${usedPrefix}${command} tanam <jenis_bibit|all> <jumlah>*\n\nContoh: *${usedPrefix}${command} tanam tebu 10*`)
        }

        if (isNaN(jumlahTanam) || jumlahTanam <= 0) return m.reply(`Masukkan jumlah tanaman yang valid.`)

        // Pengecekan Waktu Jeda (45 Menit)
        let time = user.lastberkebon + timeout
        if (new Date() - user.lastberkebon < timeout) {
            return m.reply(`⏳ Tanamanmu masih butuh waktu untuk tumbuh.\nSilakan panen dalam *${msToTime(time - new Date())}* lagi.`)
        }

        let totalTanamAkanDatang = jenisBibit === 'all' ? jumlahTanam * cropList.length : jumlahTanam
        if (totalTanamAkanDatang > maxTanaman) {
            return m.reply(`❌ Lahanmu tidak muat! Tanah kamu (*${user.tanah} Hektar*) hanya mampu menampung maksimal *${maxTanaman}* tanaman sekaligus.\nSilakan beli tanah lagi via *${usedPrefix}${command} belitanah*.`)
        }

        if (jenisBibit === 'all') {
            for (let crop of cropList) {
                if (user['bibit' + crop] < jumlahTanam) {
                    return m.reply(`❌ Bibit kamu kurang! Pastikan kamu memiliki minimal *${jumlahTanam}* untuk *semua jenis bibit*.`)
                }
            }
            cropList.forEach(crop => user['bibit' + crop] -= jumlahTanam)
        } else {
            if (user['bibit' + jenisBibit] < jumlahTanam) {
                return m.reply(`❌ Kamu tidak memiliki cukup bibit ${jenisBibit}. Sisa bibitmu: *${user['bibit' + jenisBibit]}*.`)
            }
            user['bibit' + jenisBibit] -= jumlahTanam
        }

        // --- SISTEM ANIMASI PANEL ---
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
        let { key } = await conn.reply(m.chat, `🧑‍🌾 *[PANEL PERKEBUNAN]*\nMembajak lahan seluas *${user.tanah} Hektar*...`, m)
        
        await delay(2000)
        await conn.sendMessage(m.chat, { text: `🌱 *[PANEL PERKEBUNAN]*\nMenyebar dan menanam ${totalTanamAkanDatang} benih...`, edit: key })
        
        await delay(2000)
        await conn.sendMessage(m.chat, { text: `💧 *[PANEL PERKEBUNAN]*\nMenyiram dan memberikan pupuk booster...`, edit: key })
        
        await delay(2000)
        await conn.sendMessage(m.chat, { text: `✨ *[PANEL PERKEBUNAN]*\nTanaman masuk masa pertumbuhan! Memulai proses pemanenan...`, edit: key })
        
        await delay(1500)

        // --- PROSES PANEN (LOGIK YIELD BARU) ---
        let hasilPanenTxt = `🎉 *BERHASIL PANEN!* 🎉\n\n`
        let daftarPanen = jenisBibit === 'all' ? cropList : [jenisBibit]
        
        daftarPanen.forEach(crop => {
            let poinPanen = 0
            if (crop === 'tebu') {
                // Tebu menghasilkan 6 - 16 potongan per 1 tanaman
                for (let i = 0; i < jumlahTanam; i++) {
                    poinPanen += Math.floor(Math.random() * (16 - 6 + 1)) + 6
                }
            } else {
                // Buah dan sayur normal menghasilkan 19 - 30 buah per 1 tanaman
                for (let i = 0; i < jumlahTanam; i++) {
                    poinPanen += Math.floor(Math.random() * (30 - 19 + 1)) + 19
                }
            }
            
            user[crop] += poinPanen
            hasilPanenTxt += `*+${poinPanen.toLocaleString()}* ${emoji[crop]} ${crop.toUpperCase()} (Di Gudang: ${user[crop].toLocaleString()})\n`
        })

        user.tiketcoin += 1
        user.lastberkebon = new Date() * 1
        
        hasilPanenTxt += `\n🎁 *Bonus:* +1 Tiketcoin\n\n_Tanaman baru bisa ditanam lagi dalam 45 Menit._`
        
        await conn.sendMessage(m.chat, { text: hasilPanenTxt, edit: key })
        
        setTimeout(() => {
            conn.reply(m.chat, `🔔 *Notifikasi Perkebunan:* Waktunya menanam lagi kak! Lahanmu sudah siap ditanami kembali.`, m)
        }, timeout)
        
        return
    }

    // ==========================================
    // DASHBOARD UTAMA
    // ==========================================
    let percentageChange = ((hargaTanahPerHektar - basePrice) / basePrice) * 100
    let trendIcon = percentageChange > 0 ? '📈' : percentageChange < 0 ? '📉' : '➖'
    
    let statusKebun = `
🏡 *STATISTIK PERKEBUNAN KAMU* 🏡
🗺️ *Luas Tanah:* ${user.tanah} Hektar _(Maks: 165 Hektar)_
📦 *Kapasitas Tanam:* ${maxTanaman} Tanaman

🏢 *BURSA PROPERTI TANAH:*
💵 *Harga Tanah Saat Ini:* Rp ${hargaTanahPerHektar.toLocaleString()} / Hektar ${trendIcon} _(${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%)_
⏳ _Harga berfluktuasi setiap 1 Jam._

🍎 *GUDANG HASIL PANEN & HARGA PASAR:*
${cropList.map(c => `• ${emoji[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}: *${user[c].toLocaleString()}* (Jual: Rp ${hargaJual[c]}/pcs)`).join('\n')}

📝 *CARA MAIN:*
1. *${usedPrefix}${command} belitanah <jumlah>* -> Beli tanah tambahan
2. *${usedPrefix}${command} tanam <jenis|all> <jumlah_bibit>* -> Mulai menanam
3. *${usedPrefix}${command} jual <jenis> <jumlah|all>* -> Jual hasil panen
`.trim()

    return conn.reply(m.chat, statusKebun, m)
}

handler.help = ['berkebon']
handler.tags = ['rpg']
handler.command = /^(berkebon|kebon|berkebun)$/i
handler.group = true
handler.rpg = true
handler.limit = true

module.exports = handler

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
      
    hours = (hours < 10) ? "0" + hours : hours
    minutes = (minutes < 10) ? "0" + minutes : minutes
    seconds = (seconds < 10) ? "0" + seconds : seconds
  
    return hours + " jam " + minutes + " menit " + seconds + " detik"
}
