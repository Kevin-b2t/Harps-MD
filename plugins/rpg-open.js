const pickRandom = (list) => list[Math.floor(Math.random() * list.length)]

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  try {
    let bruh = `╔════════════════════╗
║    🎁 CRATE SHOP 🎁    ║
╚════════════════════╝

📦 LIST CRATE

• 🎁 Common      → Hadiah umum, cocok untuk pemula.
• 🎁 Uncommon    → Hadiah lebih baik dari Common.
• 💎 Rare        → Berisi item langka dengan nilai tinggi.
• 🔥 Epic        → Peluang besar mendapatkan item kuat.
• 🌌 Mythic      → Berisi item sangat langka dan berharga.
• 👑 Legendary   → Salah satu crate terbaik dengan hadiah premium.
• 🗝️ Secret      → Crate misterius dengan hadiah tak terduga.
• 🌑 Dark        → Berisi item bertema gelap dan eksklusif.
• ⚡ Cheat       → Crate spesial dengan hadiah unik.
• 🐾 Pet         → Berisi pet untuk menemani petualanganmu.

━━━━━━━━━━━━━━━━━━━━

📖 TUTORIAL

1. Pilih crate yang ingin dibuka.
2. Pastikan memiliki crate tersebut di inventory.
3. Gunakan perintah *${usedPrefix}open <nama crate> <jumlah>*
4. Hadiah akan otomatis masuk ke inventory.

Contoh:
*${usedPrefix}open common 100*
*${usedPrefix}open legendary 500*
*${usedPrefix}open pet 10*

━━━━━━━━━━━━━━━━━━━━
🎉 Semoga Beruntung!`

    let listCrate = ['common', 'uncommon', 'rare', 'epic', 'mythic', 'legendary', 'secret', 'dark', 'cheat', 'pet']
    let type = (args[0] || '').toLowerCase()
    
    // Memastikan input jumlah benar (angka, minimal 1, maksimal 1.000.000)
    let jumlah = Math.max(1, Math.min(1000000, parseInt(args[1]) || 1))

    if (!listCrate.includes(type)) return conn.reply(m.chat, bruh, m)
    if (isNaN(jumlah)) return conn.reply(m.chat, `Jumlah harus berupa angka!\nContoh: *${usedPrefix}open ${type} 10*`, m)

    let user = global.db.data.users[m.sender]
    
    // Cek apakah crate cukup
    if ((user[type] || 0) < jumlah) return conn.reply(m.chat, `📦 Crate *${type}* kamu tidak cukup! Kamu hanya memiliki ${user[type] || 0} crate.`, m)

    // --- LOGIKA UNTUK CRATE BARANG ---
    if (type !== 'pet') {
        // Daftar hadiah dan pengalinya untuk masing-masing crate
        let baseRewards = {
            common: { money: 500, exp: 700, potion: 2, uncommon: 0.1 },
            uncommon: { money: 1000, exp: 1500, diamond: 1, potion: 3, rare: 0.1 },
            rare: { money: 2500, exp: 3000, diamond: 3, potion: 5, epic: 0.1 },
            epic: { money: 5000, exp: 7000, diamond: 5, potion: 10, mythic: 0.1 },
            mythic: { money: 10000, exp: 15000, diamond: 0.009, potion: 15, legendary: 0.1 },
            legendary: { money: 45000, exp: 60000, diamond: 0.010, potion: 25, epic: 1 },
            secret: { money: 75000, exp: 100000, diamond: 6.1, potion: 50, epic: 2 },
            dark: { money: 200000, exp: 300000, diamond: 11, potion: 100, mythic: 5 },
            cheat: { money: 1000000, exp: 1500000, diamond: 579, potion: 500, mythic: 10 }
        }

        let currentReward = baseRewards[type]
        let textGained = `Anda telah membuka *${jumlah.toLocaleString('id-ID')} 📦 ${type} crate* dan mendapatkan:\n`
        
        // Kurangi crate dari inventory
        user[type] -= jumlah

        // Kalkulasi hadiah
        for (let item in currentReward) {
            // Menggunakan Math.round agar perkalian desimal kecil (seperti 0.009) tidak selalu dibulatkan ke 0
            let randomMultiplier = Math.random() * currentReward[item] * jumlah
            let amount = Math.round(randomMultiplier) + (item === 'money' || item === 'exp' ? jumlah : 0)
            
            // Jaga-jaga jika pengali bawaan > 0 tapi hasil random bernilai 0, beri minimal 1 jika jumlah buka banyak (>= 100)
            if (currentReward[item] > 0 && amount === 0 && jumlah >= 100 && (item !== 'money' && item !== 'exp')) {
                amount = 1
            }
            
            if (amount > 0) {
                user[item] = (user[item] || 0) + amount
                let emoji = item === 'money' ? '💵' : item === 'exp' ? '⚜️' : item === 'diamond' ? '💎' : item === 'potion' ? '🥤' : '📦'
                textGained += `\n${emoji} *${item}:* ${amount.toLocaleString('id-ID')}`
            }
        }
        
        conn.reply(m.chat, textGained.trim(), m)

    } 
    // --- LOGIKA UNTUK PET CRATE ---
    else {
        user.pet -= jumlah
        let gainedPets = { kucing: 0, rubah: 0, kuda: 0, anjing: 0 }
        let gainedPotions = 0
        let gainedMakanan = 0
        
        for (let i = 0; i < jumlah; i++) {
            let mknp = pickRandom([1, 2, 1, 5, 3, 2, 1, 2, 4, 1, 3, 5, 2, 4, 3])
            let _pet = pickRandom(['kucing', 'rubah', 'anjing', 'kuda'])
            gainedMakanan += mknp
            
            // Jika sudah punya pet tersebut, dikonversi jadi potion
            if (user[_pet] > 0 || gainedPets[_pet] > 0) {
                gainedPotions += 2
            } else {
                gainedPets[_pet]++
                user[_pet] = (user[_pet] || 0) + 1
            }
        }
        
        user.potion = (user.potion || 0) + gainedPotions
        user.makananpet = (user.makananpet || 0) + gainedMakanan
        
        let petText = `Anda telah membuka *${jumlah.toLocaleString('id-ID')} 📦 Pet Crate* dan mendapatkan:\n\n🍖 *Makanan Pet:* ${gainedMakanan.toLocaleString('id-ID')}`
        if (gainedPotions > 0) petText += `\n🥤 *Potion:* ${gainedPotions.toLocaleString('id-ID')} (Sebagai ganti pet duplikat)`
        
        let newPets = Object.keys(gainedPets).filter(p => gainedPets[p] > 0)
        if (newPets.length > 0) {
            petText += `\n\n*🎉 SELAMAT! Anda mendapatkan pet baru:* ${newPets.join(', ')}`
        } else {
            petText += `\n\n_(Tidak ada pet baru yang didapatkan dari crate ini)_`
        }
        
        conn.reply(m.chat, petText.trim(), m)
    }
    
  } catch (e) {
      console.log(e)
      conn.reply(m.chat, `Terjadi error!\nSilakan ketik *${usedPrefix}open* untuk melihat cara penggunaan.`, m)
  }
}

handler.help = ['open <crate> <jumlah>']
handler.tags = ['rpg']
handler.command = /^(open|buka|gacha)$/i
handler.register = true
handler.rpg = true
handler.fail = null

module.exports = handler
