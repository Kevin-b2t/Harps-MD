const cooldownMenanam = 600000; // Cooldown tanam 10 menit
const waktuPanenMin = 600000; // 10 menit
const waktuPanenMax = 900000; // 15 menit
const hargaDasarTanah = 7686000; // Harga dasar 1 Hektar

// Daftar item beserta harga dasar dan emotikon
const marketItems = {
    tanah: { base: hargaDasarTanah, icon: '🗺️', name: 'Tanah (Hektar)' },
    pisang: { base: 500, icon: '🍌', name: 'Pisang' },
    anggur: { base: 700, icon: '🍇', name: 'Anggur' },
    mangga: { base: 600, icon: '🥭', name: 'Mangga' },
    jeruk: { base: 650, icon: '🍊', name: 'Jeruk' },
    apel: { base: 800, icon: '🍎', name: 'Apel' },
    padi: { base: 300, icon: '🌾', name: 'Padi' },
    gandum: { base: 350, icon: '🌾', name: 'Gandum' },
    wortel: { base: 200, icon: '🥕', name: 'Wortel' },
    kentang: { base: 400, icon: '🥔', name: 'Kentang' },
    singkong: { base: 250, icon: '🍠', name: 'Singkong' },
    ubijalar: { base: 280, icon: '🍠', name: 'Ubi Jalar' },
    tebu: { base: 450, icon: '🎋', name: 'Tebu' }
};

// Sistem Harga Pasar (Berubah setiap jam)
function getMarketPrice(basePrice, itemName) {
    let date = new Date();
    // Membuat seed berdasarkan Jam, Hari, dan nama item agar tiap item berbeda
    let seed = date.getDate() + date.getHours() + itemName.length + basePrice; 
    let rand = Math.abs(Math.sin(seed)); 
    
    // Peluang 30% harga turun, 70% harga naik
    let isDown = (Math.abs(Math.cos(seed)) < 0.3);
    
    if (isDown) {
        // Turun tipis: 4% sampai 8% (Harga menjadi 92% - 96% dari harga dasar)
        let dropMultiplier = 0.92 + (rand * 0.04); 
        return Math.floor(basePrice * dropMultiplier);
    } else {
        // Naik drastis: hingga 122% lonjakan (Harga menjadi 100% sampai 222% dari harga dasar)
        let riseMultiplier = 1.0 + (rand * 1.22);
        return Math.floor(basePrice * riseMultiplier);
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    
    // Inisialisasi Database
    if (!user.tanah) user.tanah = 0;
    if (!user.money) user.money = 0;
    for (let item in marketItems) {
        if (!user[item]) user[item] = 0;
    }

    let cmd = command.toLowerCase();
    let action = args[0] ? args[0].toLowerCase() : '';

    // ==========================================
    // MENU GUDANG (CEK PERSEDIAAN BIBIT & PANEN)
    // ==========================================
    if (cmd === 'gudang' || action === 'gudang') {
        let text = `📦 *GUDANG PERTANIAN KAMU* 📦\n\n`;
        text += `*🏢 PROPERTI & KEUANGAN:*\n`;
        text += `🗺️ Tanah: ${user.tanah} Hektar\n`;
        text += `💵 Uang: Rp ${user.money.toLocaleString('id-ID')}\n\n`;
        
        text += `*🌱 PERSEDIAAN BIBIT:*\n`;
        text += `🍎 Apel: ${user.bibitapel || 0}\n`;
        text += `🍇 Anggur: ${user.bibitanggur || 0}\n`;
        text += `🥭 Mangga: ${user.bibitmangga || 0}\n`;
        text += `🍌 Pisang: ${user.bibitpisang || 0}\n`;
        text += `🍊 Jeruk: ${user.bibitjeruk || 0}\n\n`;

        text += `*🧺 HASIL PANEN SIAP JUAL:*\n`;
        for (let item in marketItems) {
            if (item === 'tanah') continue;
            let amount = user[item] || 0;
            text += `${marketItems[item].icon} ${marketItems[item].name}: ${amount}\n`;
        }

        text += `\n_Ketik *${usedPrefix}pertanian pasar* untuk melihat harga jual hari ini._`;
        return conn.reply(m.chat, text, m);
    }

    // ==========================================
    // MENU PASAR & CEK HARGA
    // ==========================================
    if (action === 'pasar') {
        let text = `📈 *PASAR PERTANIAN GLOBAL* 📉\n_Harga berfluktuasi setiap jam!_\n\n*🏢 PROPERTI:*\n`;
        text += `🗺️ Tanah: Rp ${getMarketPrice(marketItems.tanah.base, 'tanah').toLocaleString('id-ID')} / Hektar\n\n*🧺 HARGA PANEN SAAT INI:*\n`;
        
        for (let item in marketItems) {
            if (item === 'tanah') continue;
            let currentPrice = getMarketPrice(marketItems[item].base, item);
            let trend = currentPrice > marketItems[item].base ? '📈' : '📉';
            text += `${marketItems[item].icon} ${marketItems[item].name}: Rp ${currentPrice.toLocaleString('id-ID')} ${trend}\n`;
        }
        
        text += `\n*Gunakan Perintah:*\n• \`${usedPrefix}pertanian jual <item> <jumlah>\`\n• \`${usedPrefix}pertanian belitanah <jumlah>\`\n• \`${usedPrefix}pertanian jualtanah <jumlah>\``;
        return conn.reply(m.chat, text, m);
    }

    // ==========================================
    // SISTEM JUAL BELI TANAH
    // ==========================================
    if (action === 'belitanah' || action === 'jualtanah') {
        let jumlah = parseInt(args[1]);
        if (!jumlah || isNaN(jumlah) || jumlah < 1) return m.reply(`Masukkan jumlah hektar yang valid!\nContoh: *${usedPrefix}pertanian ${action} 2*`);
        
        let hargaSekarang = getMarketPrice(marketItems.tanah.base, 'tanah');
        let totalHarga = hargaSekarang * jumlah;

        if (action === 'belitanah') {
            if (user.tanah + jumlah > 465) return m.reply(`❌ *Maksimal kepemilikan tanah adalah 465 Hektar!*\nTanahmu saat ini: ${user.tanah} Hektar.`);
            if (user.money < totalHarga) return m.reply(`❌ *Uangmu tidak cukup!*\nHarga ${jumlah} Hektar tanah saat ini adalah Rp ${totalHarga.toLocaleString('id-ID')}.`);
            
            user.money -= totalHarga;
            user.tanah += jumlah;
            return m.reply(`✅ *BERHASIL MEMBELI TANAH!*\nKamu membeli ${jumlah} Hektar tanah seharga Rp ${totalHarga.toLocaleString('id-ID')}.\nTotal tanahmu sekarang: ${user.tanah} Hektar.`);
        } 
        
        if (action === 'jualtanah') {
            if (user.tanah < jumlah) return m.reply(`❌ *Tanahmu tidak cukup!*\nKamu hanya memiliki ${user.tanah} Hektar tanah.`);
            
            user.money += totalHarga;
            user.tanah -= jumlah;
            return m.reply(`✅ *BERHASIL MENJUAL TANAH!*\nKamu menjual ${jumlah} Hektar tanah seharga Rp ${totalHarga.toLocaleString('id-ID')}.\nTotal uangmu sekarang: Rp ${user.money.toLocaleString('id-ID')}`);
        }
    }

    // ==========================================
    // SISTEM JUAL HASIL PANEN
    // ==========================================
    if (action === 'jual') {
        let item = args[1] ? args[1].toLowerCase() : '';
        let jumlah = parseInt(args[2]);

        if (!item || !marketItems[item] || item === 'tanah') return m.reply(`Barang apa yang ingin dijual?\nKetik *${usedPrefix}gudang* untuk melihat persediaanmu.`);
        if (!jumlah || isNaN(jumlah) || jumlah < 1) return m.reply(`Masukkan jumlah yang ingin dijual!\nContoh: *${usedPrefix}pertanian jual pisang 100*`);
        if (user[item] < jumlah) return m.reply(`❌ *Item tidak cukup!*\nKamu hanya memiliki ${user[item]} ${marketItems[item].name}.`);

        let hargaSekarang = getMarketPrice(marketItems[item].base, item);
        let totalPendapatan = hargaSekarang * jumlah;

        user[item] -= jumlah;
        user.money += totalPendapatan;

        return m.reply(`✅ *TERJUAL!*\nKamu berhasil menjual ${jumlah} ${marketItems[item].icon} seharga Rp ${totalPendapatan.toLocaleString('id-ID')}.`);
    }

    // ==========================================
    // SISTEM BERKEBUN / MENANAM (DENGAN ANIMASI)
    // ==========================================
    if (action === 'tanam' || (cmd !== 'gudang' && action === '')) {
        if (user.tanah < 1) return m.reply(`❌ *Kamu tidak memiliki tanah!*\nBeli minimal 1 Hektar tanah untuk menanam.\nKetik *${usedPrefix}pertanian belitanah 1*`);

        let time = user.lastberkebon + cooldownMenanam;
        if (new Date() - user.lastberkebon < cooldownMenanam) {
            return m.reply(`⏳ *Lahan sedang dipulihkan!*\nMohon tunggu ${msToTime(time - new Date())} lagi untuk menanam kembali.`);
        }

        // Kalkulasi Kebutuhan Bibit
        let totalBibitPerJenis = Math.floor((user.tanah * 77) / 5);
        let totalKapasitas = user.tanah * 77;

        let apelu = user.bibitapel || 0;
        let angguru = user.bibitanggur || 0;
        let manggau = user.bibitmangga || 0;
        let pisangu = user.bibitpisang || 0;
        let jeruku = user.bibitjeruk || 0;

        if (apelu < totalBibitPerJenis || angguru < totalBibitPerJenis || manggau < totalBibitPerJenis || pisangu < totalBibitPerJenis || jeruku < totalBibitPerJenis) {
            return m.reply(`❌ *Bibit Tidak Cukup!*\nKamu membutuhkan masing-masing *${totalBibitPerJenis} bibit* untuk mengisi penuh ${user.tanah} Hektar lahanmu.\n\nKetik *${usedPrefix}gudang* untuk melihat sisa bibitmu.`);
        }

        // --- MULAI ANIMASI MENANAM ---
        let { key } = await conn.sendMessage(m.chat, { 
            text: `🚜 *Mempersiapkan traktor untuk lahan seluas ${user.tanah} Hektar...*` 
        }, { quoted: m });

        const editProgress = async (text) => {
            await conn.sendMessage(m.chat, { text: text, edit: key }).catch(() => null);
        };

        setTimeout(() => editProgress('🌱 *[🚜💨.......] Membajak tanah dan membuat bedengan...*'), 1500);
        setTimeout(() => editProgress(`🌿 *[🌱🌱🌱.....] Menabur ${totalKapasitas} benih tanaman ke tanah...*`), 3500);
        setTimeout(() => editProgress('💦 *[💦💦💦💦💦] Menyiram bibit dan memberikan pupuk...*'), 5500);

        // --- PROSES POTONG BIBIT & MULAI WAKTU PANEN ---
        setTimeout(async () => {
            user.bibitpisang -= totalBibitPerJenis;
            user.bibitanggur -= totalBibitPerJenis;
            user.bibitmangga -= totalBibitPerJenis;
            user.bibitjeruk -= totalBibitPerJenis;
            user.bibitapel -= totalBibitPerJenis;
            user.lastberkebon = new Date() * 1;
            
            let waktuPanen = Math.floor(Math.random() * (waktuPanenMax - waktuPanenMin + 1)) + waktuPanenMin;
            let menitPanen = Math.floor(waktuPanen / 60000);

            await editProgress(`✅ *BERHASIL MENANAM DI ${user.tanah} HEKTAR TANAH!*\n\nSemua bibit berhasil ditanam. Tunggu sekitar *${menitPanen} menit* untuk masa panen otomatis. Kamu bisa menanam lagi di lahan lain dalam 10 menit.`);

            // --- PROSES PANEN OTOMATIS SAAT WAKTU HABIS ---
            setTimeout(() => {
                let pengaliPanen = user.tanah;
                
                let pisangpoin = (Math.floor(Math.random() * 30) + 10) * pengaliPanen;
                let anggurpoin = (Math.floor(Math.random() * 30) + 10) * pengaliPanen;
                let manggapoin = (Math.floor(Math.random() * 30) + 10) * pengaliPanen;
                let jerukpoin = (Math.floor(Math.random() * 30) + 10) * pengaliPanen;
                let apelpoin = (Math.floor(Math.random() * 30) + 10) * pengaliPanen;
                
                // Bonus Item
                let padipoin = Math.floor(Math.random() * 10) * pengaliPanen;
                let wortelpoin = Math.floor(Math.random() * 15) * pengaliPanen;

                user.pisang += pisangpoin;
                user.anggur += anggurpoin;
                user.mangga += manggapoin;
                user.jeruk += jerukpoin;
                user.apel += apelpoin;
                user.padi += padipoin;
                user.wortel += wortelpoin;
                user.tiketcoin += (1 * pengaliPanen);

                conn.reply(m.chat, `🌾 *WAKTUNYA PANEN!* 🌾\n\nSelamat, dari lahan seluas ${user.tanah} Hektar kamu mendapatkan:\n🍌 +${pisangpoin} Pisang\n🥭 +${manggapoin} Mangga\n🍇 +${anggurpoin} Anggur\n🍊 +${jerukpoin} Jeruk\n🍎 +${apelpoin} Apel\n🌾 +${padipoin} Padi\n🥕 +${wortelpoin} Wortel\n🎟️ +${(1 * pengaliPanen)} Tiketcoin\n\nKetik *${usedPrefix}gudang* untuk melihat total panenmu!`, m);
            }, waktuPanen);

        }, 7500);
        return;
    }

    // Tampilan Menu Default (Akan muncul jika perintah tidak dikenali)
    if (cmd !== 'gudang') {
        m.reply(`*🌾 SISTEM PERTANIAN 🌾*\n\n• \`${usedPrefix}pertanian tanam\` (Mulai menanam)\n• \`${usedPrefix}gudang\` (Cek stok panen & bibit)\n• \`${usedPrefix}pertanian pasar\` (Cek harga saat ini)\n• \`${usedPrefix}pertanian jual <item> <jumlah>\`\n• \`${usedPrefix}pertanian belitanah <jumlah>\`\n• \`${usedPrefix}pertanian jualtanah <jumlah>\``);
    }
};

handler.help = ['pertanian', 'gudang'];
handler.tags = ['rpg'];
// Menambahkan 'gudang' agar bot mendeteksi perintah langsung
handler.command = /^(berkebon|pertanian|gudang)$/i;
handler.rpg = true;
handler.group = true;

module.exports = handler;

function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  return hours + " jam " + minutes + " menit " + seconds + " detik";
}
