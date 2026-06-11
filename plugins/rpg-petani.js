const cooldownMenanam = 600000; // 10 menit
const waktuPanenMin = 600000;   // 10 menit
const waktuPanenMax = 900000;   // 15 menit
const hargaDasarTanah = 7686000;

// ==========================================
// DATABASE SEMUA TANAMAN (Sinkron dengan Shop)
// Base price disesuaikan agar untung dari harga beli bibit
// ==========================================
const marketItems = {
    tanah:    { base: hargaDasarTanah, icon: '🗺️', name: 'Tanah (Hektar)' },
    // Buah-buahan Dasar
    pisang:   { base: 5500,  icon: '🍌', name: 'Pisang' },
    anggur:   { base: 5500,  icon: '🍇', name: 'Anggur' },
    mangga:   { base: 4600,  icon: '🥭', name: 'Mangga' },
    jeruk:    { base: 6000,  icon: '🍊', name: 'Jeruk' },
    apel:     { base: 5500,  icon: '🍎', name: 'Apel' },
    
    // Pertanian & Palawija
    padi:     { base: 3000,  icon: '🌾', name: 'Padi' },
    gandum:   { base: 3500,  icon: '🌾', name: 'Gandum' },
    wortel:   { base: 2000,  icon: '🥕', name: 'Wortel' },
    kentang:  { base: 4000,  icon: '🥔', name: 'Kentang' },
    singkong: { base: 2500,  icon: '🍠', name: 'Singkong' },
    ubijalar: { base: 2800,  icon: '🍠', name: 'Ubi Jalar' },
    tebu:     { base: 4500,  icon: '🎋', name: 'Tebu' },
    jagung:   { base: 7000,  icon: '🌽', name: 'Jagung' },
    kedelai:  { base: 6500,  icon: '🫘', name: 'Kedelai' },
    kacangpanjang: { base: 4500, icon: '🫛', name: 'Kacang Panjang' },

    // Sayuran & Bumbu
    cabai:    { base: 6000,  icon: '🌶️', name: 'Cabai' },
    tomat:    { base: 5500,  icon: '🍅', name: 'Tomat' },
    bawang:   { base: 5000,  icon: '🧅', name: 'Bawang' },
    terong:   { base: 4500,  icon: '🍆', name: 'Terong' },
    kangkung: { base: 3000,  icon: '🥬', name: 'Kangkung' },
    sawi:     { base: 3000,  icon: '🥬', name: 'Sawi' },
    bayam:    { base: 3000,  icon: '🥬', name: 'Bayam' },
    kol:      { base: 4000,  icon: '🥦', name: 'Kol' },
    brokoli:  { base: 5000,  icon: '🥦', name: 'Brokoli' },
    ketimun:  { base: 4500,  icon: '🥒', name: 'Ketimun' },
    lombok:   { base: 6000,  icon: '🌶️', name: 'Lombok' },

    // Buah Eksotis / Premium
    semangka: { base: 8000,  icon: '🍉', name: 'Semangka' },
    melon:    { base: 8500,  icon: '🍈', name: 'Melon' },
    stroberi: { base: 9000,  icon: '🍓', name: 'Stroberi' },
    nanas:    { base: 7500,  icon: '🍍', name: 'Nanas' },
    kelapa:   { base: 10000, icon: '🥥', name: 'Kelapa' },
    durian:   { base: 15000, icon: '🍈', name: 'Durian' },
    pepaya:   { base: 6000,  icon: '🍈', name: 'Pepaya' },
    alpukat:  { base: 8000,  icon: '🥑', name: 'Alpukat' },

    // Komoditas Bernilai Tinggi
    kopi:     { base: 7000,  icon: '☕', name: 'Biji Kopi' },
    kakao:    { base: 7500,  icon: '🍫', name: 'Kakao' },
    vanili:   { base: 20000, icon: '🍦', name: 'Vanili' }
};

function getMarketPrice(basePrice, itemName) {
    let date = new Date();
    let seed = date.getDate() + date.getHours() + itemName.length + basePrice;
    let rand = Math.abs(Math.sin(seed));
    let isDown = (Math.abs(Math.cos(seed)) < 0.3);
    if (isDown) return Math.floor(basePrice * (0.92 + rand * 0.04));
    return Math.floor(basePrice * (1.0 + rand * 1.22));
}

function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours   = Math.floor((duration / (1000 * 60 * 60)) % 24);
    hours   = (hours < 10)   ? '0' + hours   : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;
    return hours + ' jam ' + minutes + ' menit ' + seconds + ' detik';
}

function calculateYield(jumlahBibit, isPetani) {
    let hasilBuah = 0;
    let hasilBibitDrop = 0;
    
    // Jika bibit yang ditanam sangat banyak (>1000), gunakan formula probabilistik untuk performa
    if (jumlahBibit > 1000) {
        if (isPetani) {
            hasilBuah = Math.floor(jumlahBibit * (16 + Math.random() * 23)); // Rata-rata 16-38 buah
            let rataRataBibit = (0.05 * 10) + (0.15 * 9) + (0.30 * 8) + (0.30 * 7) + (0.20 * 6); // ~ 7.55 drop
            hasilBibitDrop = Math.floor(jumlahBibit * rataRataBibit);
        } else {
            hasilBuah = Math.floor(jumlahBibit * (6 + Math.random() * 9)); // Rata-rata 6-14 buah
            hasilBibitDrop = Math.floor(jumlahBibit * 1.1); // 90% dapat 1, 10% dapat 2 -> ~ 1.1 drop
        }
    } else {
        // Eksekusi presisi untuk menanam sedikit
        for (let i = 0; i < jumlahBibit; i++) {
            if (isPetani) {
                hasilBuah += Math.floor(16 + Math.random() * 23); // 16 s.d 38 buah
                let rng = Math.random();
                if (rng < 0.05) hasilBibitDrop += 10;
                else if (rng < 0.20) hasilBibitDrop += 9;
                else if (rng < 0.50) hasilBibitDrop += 8;
                else if (rng < 0.80) hasilBibitDrop += 7;
                else hasilBibitDrop += 6;
            } else {
                hasilBuah += Math.floor(6 + Math.random() * 9); // 6 s.d 14 buah
                hasilBibitDrop += (Math.random() < 0.1) ? 2 : 1;
            }
        }
    }
    return { hasilBuah, hasilBibitDrop };
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];

    if (!user.tanah)      user.tanah = 0;
    if (!user.money)      user.money = 0;
    if (!user.tiketcoin)  user.tiketcoin = 0;

    let plantables = Object.keys(marketItems).filter(i => i !== 'tanah');

    for (let item of plantables) {
        if (!user[item])              user[item] = 0;
        if (!user['bibit' + item])    user['bibit' + item] = 0;
    }

    let cmd    = command.toLowerCase();
    let action = args[0] ? args[0].toLowerCase() : '';

    // ── GUDANG ──
    if (cmd === 'gudang' || action === 'gudang') {
        let text = `📦 *GUDANG PERTANIAN KAMU* 📦\n\n`;
        text += `*🏢 PROPERTI & KEUANGAN:*\n`;
        text += `🗺️ Tanah: ${user.tanah} Hektar\n`;
        text += `💵 Uang: Rp ${user.money.toLocaleString('id-ID')}\n\n`;
        text += `*🌱 PERSEDIAAN BIBIT:*\n`;
        for (let item of plantables) {
            if (user['bibit' + item] > 0) text += `${marketItems[item].icon} Bibit ${marketItems[item].name}: ${user['bibit' + item].toLocaleString('id-ID')}\n`;
        }
        text += `\n*🧺 HASIL PANEN SIAP JUAL:*\n`;
        for (let item of plantables) {
            if (user[item] > 0) text += `${marketItems[item].icon} ${marketItems[item].name}: ${user[item].toLocaleString('id-ID')}\n`;
        }
        text += `\n_Ketik *${usedPrefix}pertanian pasar* untuk melihat harga jual hari ini._`;
        return conn.reply(m.chat, text, m);
    }

    // ── PASAR ──
    if (action === 'pasar') {
        let text = `📈 *PASAR PERTANIAN GLOBAL* 📉\n_Harga berfluktuasi setiap jam!_\n\n*🏢 PROPERTI:*\n`;
        text += `🗺️ Tanah: Rp ${getMarketPrice(marketItems.tanah.base, 'tanah').toLocaleString('id-ID')} / Hektar\n\n*🧺 HARGA PANEN SAAT INI:*\n`;
        for (let item of plantables) {
            let currentPrice = getMarketPrice(marketItems[item].base, item);
            let trend = currentPrice > marketItems[item].base ? '📈' : '📉';
            text += `${marketItems[item].icon} ${marketItems[item].name}: Rp ${currentPrice.toLocaleString('id-ID')} ${trend}\n`;
        }
        text += `\n*Gunakan Perintah:*\n• \`${usedPrefix}pertanian jual <item> <jumlah>\`\n• \`${usedPrefix}pertanian belitanah <jumlah>\`\n• \`${usedPrefix}pertanian setorpt <item> <jml> <id_pt> <@tag>\``;
        return conn.reply(m.chat, text, m);
    }

    // ── BELI / JUAL TANAH ──
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

    // ── JUAL HASIL PANEN (KE PASAR GLOBAL) ──
    if (action === 'jual') {
        let item   = args[1] ? args[1].toLowerCase() : '';
        let jumlah = parseInt(args[2]);
        if (!item || !marketItems[item] || item === 'tanah') return m.reply(`Barang apa yang ingin dijual?\nKetik *${usedPrefix}gudang* untuk melihat persediaanmu.`);
        if (!jumlah || isNaN(jumlah) || jumlah < 1) return m.reply(`Masukkan jumlah yang ingin dijual!\nContoh: *${usedPrefix}pertanian jual pisang 100*`);
        if (user[item] < jumlah) return m.reply(`❌ *Item tidak cukup!*\nKamu hanya memiliki ${user[item]} ${marketItems[item].name}.`);
        let hargaSekarang  = getMarketPrice(marketItems[item].base, item);
        let totalPendapatan = hargaSekarang * jumlah;
        user[item]  -= jumlah;
        user.money  += totalPendapatan;
        return m.reply(`✅ *TERJUAL!*\nKamu berhasil menjual ${jumlah.toLocaleString('id-ID')} ${marketItems[item].icon} seharga Rp ${totalPendapatan.toLocaleString('id-ID')}.`);
    }

    // ── B2B LOGISTIK (SETOR KE PT) ──
    if (action === 'setorpt') {
        let item = args[1] ? args[1].toLowerCase() : '';
        let jumlah = parseInt(args[2]);
        let idPtTujuan = parseInt(args[3]) - 1;
        let targetMention = args[4];

        if (!item || !jumlah || isNaN(idPtTujuan) || !targetMention) {
            return m.reply(
                `⚠️ *Format B2B Logistik Salah!*\n\n` +
                `*${usedPrefix}pertanian setorpt <item> <jumlah> <id_pt_tujuan> <@tag_pemilik_pt>*\n\n` +
                `_Contoh:_ *${usedPrefix}pertanian setorpt tebu 500 1 @62812xxx*\n\n` +
                `_Fitur ini akan memindahkan hasil panenmu langsung ke Gudang Perusahaan orang lain (untuk menyuplai PT Minuman/dll). Pastikan pemilik PT mentransfer bayaranmu melalui .pt kirim uang!_`
            );
        }
        
        if (!marketItems[item] || item === 'tanah') return m.reply(`❌ Item *${item}* tidak valid! Cek daftar panenmu di *${usedPrefix}gudang*`);
        if ((user[item] || 0) < jumlah) return m.reply(`❌ Stok *${marketItems[item].name}* kamu tidak cukup! Sisa: ${(user[item] || 0).toLocaleString('id-ID')}`);

        let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        let targetUser = global.db.data.users[target];

        if (!targetUser || !targetUser.perusahaan) return m.reply('❌ Partner (Penerima) tidak memiliki Perusahaan di database!');

        let ptReceiver = targetUser.perusahaan[idPtTujuan];
        if (!ptReceiver) return m.reply('❌ ID Perusahaan Penerima tidak valid!');
        if (ptReceiver.type === 'listrik') return m.reply(`❌ PT Listrik tidak memiliki gudang logistik fisik!`);

        // Cek Kapasitas Gudang Target PT
        let slotPerLevel = 120; // Default capacity increment per PT level
        let maxKapasitas = (ptReceiver.gudangLevel || 1) * slotPerLevel;
        let terpakai = Object.values(ptReceiver.gudang || {}).reduce((s, v) => s + (v || 0), 0);
        let sisaSlot = maxKapasitas - terpakai;

        if (jumlah > sisaSlot) return m.reply(`❌ Gudang PT *${ptReceiver.name}* tidak muat!\nSisa slot mereka hanya: ${sisaSlot.toLocaleString('id-ID')} unit.`);

        // Eksekusi Logistik
        user[item] -= jumlah;
        if (!ptReceiver.gudang) ptReceiver.gudang = {};
        ptReceiver.gudang[item] = (ptReceiver.gudang[item] || 0) + jumlah;

        return m.reply(
            `🤝 *B2B LOGISTIK SUKSES* 🚚\n\n` +
            `📦 Mengirimkan: *${jumlah.toLocaleString('id-ID')} ${marketItems[item].name}*\n` +
            `🏢 Ke Gudang PT: *${ptReceiver.name}*\n` +
            `👤 Pemilik: @${target.split('@')[0]}\n\n` +
            `_Item telah sukses mendarat di Gudang. Jangan lupa tagih uang bayarannya ke Bos PT tersebut!_`,
            null, { mentions: [target] }
        );
    }

    // ── TANAM ──
    if (action === 'tanam' || action === '') {
        if (user.tanah < 1) return m.reply(`❌ *Kamu tidak memiliki tanah!*\nBeli minimal 1 Hektar tanah untuk menanam.\nKetik *${usedPrefix}pertanian belitanah 1*`);

        let time = user.lastberkebon + cooldownMenanam;
        if (new Date() - user.lastberkebon < cooldownMenanam) {
            return m.reply(`⏳ *Lahan sedang dipulihkan!*\nMohon tunggu ${msToTime(time - new Date())} lagi untuk menanam kembali.`);
        }

        let jenisTanaman = args[1] ? args[1].toLowerCase() : '';
        let jumlahBibit  = parseInt(args[2]);

        if (!jenisTanaman || !marketItems[jenisTanaman] || jenisTanaman === 'tanah') {
            let daftar = plantables.map(p => `${marketItems[p].icon} ${p}`).join('\n');
            return m.reply(
                `🌾 *PILIH TANAMAN YANG INGIN DITANAM:*\n\n${daftar}\n\n` +
                `*Format:* \`${usedPrefix}pertanian tanam <tanaman> <jumlah bibit>\`\n` +
                `*Contoh:* \`${usedPrefix}pertanian tanam pisang 100\``
            );
        }

        if (!jumlahBibit || isNaN(jumlahBibit) || jumlahBibit < 1) {
            return m.reply(`Masukkan jumlah bibit yang ingin ditanam!\nContoh: *${usedPrefix}pertanian tanam ${jenisTanaman} 100*`);
        }

        let bibitKey = 'bibit' + jenisTanaman;
        if ((user[bibitKey] || 0) < jumlahBibit) {
            return m.reply(
                `❌ *Bibit ${marketItems[jenisTanaman].name} tidak cukup!*\n` +
                `Kamu hanya punya *${user[bibitKey] || 0}* bibit ${marketItems[jenisTanaman].name}.\n\n` +
                `Beli bibit dulu di *${usedPrefix}shop buy bibit${jenisTanaman} <jumlah>*`
            );
        }

        // Animasi tanam
        let { key } = await conn.sendMessage(m.chat, {
            text: `🚜 *Mempersiapkan traktor untuk lahan seluas ${user.tanah} Hektar...*`
        }, { quoted: m });

        const editProgress = async (text) => conn.sendMessage(m.chat, { text, edit: key }).catch(() => null);

        setTimeout(() => editProgress(`🌱 *[🚜💨.......] Membajak tanah dan membuat bedengan...*`), 1500);
        setTimeout(() => editProgress(`🌿 *[🌱🌱🌱.....] Menabur ${jumlahBibit} bibit ${marketItems[jenisTanaman].icon} ${marketItems[jenisTanaman].name}...*`), 3500);
        setTimeout(() => editProgress(`💦 *[💦💦💦💦💦] Menyiram bibit dan memberikan pupuk...*`), 5500);

        setTimeout(async () => {
            user[bibitKey] -= jumlahBibit;
            user.lastberkebon = new Date() * 1;

            let waktuPanen = Math.floor(Math.random() * (waktuPanenMax - waktuPanenMin + 1)) + waktuPanenMin;
            let menitPanen = Math.floor(waktuPanen / 60000);

            await editProgress(
                `✅ *BERHASIL MENANAM ${marketItems[jenisTanaman].name.toUpperCase()}!*\n\n` +
                `${marketItems[jenisTanaman].icon} Ditanam: ${jumlahBibit.toLocaleString('id-ID')} bibit\n` +
                `🗺️ Lahan Aktif: ${user.tanah} Hektar\n` +
                `⏳ Waktu Panen Otomatis: *${menitPanen} menit*`
            );

            // Eksekusi Panen Otomatis Saat Waktu Habis
            setTimeout(() => {
                let isPetani = (user.pekerjaan === 'petani' || user.job === 'petani' || user.role === 'petani');
                let res = calculateYield(jumlahBibit, isPetani);
                
                let hasilBuah = res.hasilBuah;
                let hasilBibitDrop = res.hasilBibitDrop;
                let pengaliTiket = user.tanah; // Tiketcoin diakumulasi dari luas lahan

                user[jenisTanaman] += hasilBuah;
                user[bibitKey] += hasilBibitDrop; 
                user.tiketcoin += pengaliTiket;

                let profesiTag = isPetani ? "👨‍🌾 (Petani Profesional)" : "🙍‍♂️ (Bukan Petani)";
                
                conn.reply(m.chat,
                    `🌾 *WAKTUNYA PANEN!* 🌾\n\n` +
                    `Status Pekerjaan: ${profesiTag}\n` +
                    `Dari ${jumlahBibit.toLocaleString('id-ID')} bibit ${marketItems[jenisTanaman].icon} ${marketItems[jenisTanaman].name} yang ditanam, kamu mendapat:\n\n` +
                    `📦 *+${hasilBuah.toLocaleString('id-ID')}* ${marketItems[jenisTanaman].name} (Hasil Panen)\n` +
                    `🌱 *+${hasilBibitDrop.toLocaleString('id-ID')}* Bibit (Drop Benih Sisa)\n` +
                    `🎟️ *+${pengaliTiket}* Tiketcoin\n\n` +
                    `Ketik *${usedPrefix}gudang* untuk melihat total panenmu!`,
                m);
            }, waktuPanen);

        }, 7500);
        return;
    }

    // Menu default
    m.reply(
        `*🌾 SISTEM PERTANIAN & LOGISTIK 🌾*\n\n` +
        `• \`${usedPrefix}pertanian tanam <tanaman> <jumlah>\` - Menanam\n` +
        `• \`${usedPrefix}gudang\` - Cek stok panen & bibit\n` +
        `• \`${usedPrefix}pertanian pasar\` - Cek harga pasar global\n` +
        `• \`${usedPrefix}pertanian jual <item> <jumlah>\` - Jual hasil panen (Global)\n` +
        `• \`${usedPrefix}pertanian setorpt <item> <jml> <id_pt> <@tag>\` - B2B Suplai PT\n` +
        `• \`${usedPrefix}pertanian belitanah <jumlah>\` - Beli hektar tanah\n` +
        `• \`${usedPrefix}pertanian jualtanah <jumlah>\` - Jual hektar tanah\n\n` +
        `*Tips:* Pekerjaan (Job) Petani menghasilkan panen berlipat ganda & drop bibit yang sangat melimpah dibanding player biasa!`
    );
};

handler.help    = ['pertanian', 'gudang'];
handler.tags    = ['rpg'];
handler.command = /^(berkebon|pertanian|gudang)$/i;
handler.rpg     = true;
handler.group   = true;

module.exports = handler;
