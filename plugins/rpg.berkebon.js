const cooldownMenanam = 600000; // 10 menit
const waktuPanenMin = 600000;   // 10 menit
const waktuPanenMax = 900000;   // 15 menit
const hargaDasarTanah = 7686000;

const marketItems = {
    tanah:    { base: hargaDasarTanah, icon: '🗺️', name: 'Tanah (Hektar)' },
    pisang:   { base: 500,  icon: '🍌', name: 'Pisang' },
    anggur:   { base: 700,  icon: '🍇', name: 'Anggur' },
    mangga:   { base: 600,  icon: '🥭', name: 'Mangga' },
    jeruk:    { base: 650,  icon: '🍊', name: 'Jeruk' },
    apel:     { base: 800,  icon: '🍎', name: 'Apel' },
    padi:     { base: 300,  icon: '🌾', name: 'Padi' },
    gandum:   { base: 350,  icon: '🌾', name: 'Gandum' },
    wortel:   { base: 200,  icon: '🥕', name: 'Wortel' },
    kentang:  { base: 400,  icon: '🥔', name: 'Kentang' },
    singkong: { base: 250,  icon: '🍠', name: 'Singkong' },
    ubijalar: { base: 280,  icon: '🍠', name: 'Ubi Jalar' },
    tebu:     { base: 450,  icon: '🎋', name: 'Tebu' }
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
        for (let item of plantables) text += `${marketItems[item].icon} ${marketItems[item].name}: ${user['bibit' + item] || 0}\n`;
        text += `\n*🧺 HASIL PANEN SIAP JUAL:*\n`;
        for (let item of plantables) text += `${marketItems[item].icon} ${marketItems[item].name}: ${user[item] || 0}\n`;
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
        text += `\n*Gunakan Perintah:*\n• \`${usedPrefix}pertanian jual <item> <jumlah>\`\n• \`${usedPrefix}pertanian belitanah <jumlah>\`\n• \`${usedPrefix}pertanian jualtanah <jumlah>\``;
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

    // ── JUAL HASIL PANEN ──
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
        return m.reply(`✅ *TERJUAL!*\nKamu berhasil menjual ${jumlah} ${marketItems[item].icon} seharga Rp ${totalPendapatan.toLocaleString('id-ID')}.`);
    }

    // ── TANAM (1 JENIS SAJA) ──
    // Format: .pertanian tanam <tanaman> <jumlah bibit>
    // Contoh: .pertanian tanam pisang 100
    if (action === 'tanam' || action === '') {
        if (user.tanah < 1) return m.reply(`❌ *Kamu tidak memiliki tanah!*\nBeli minimal 1 Hektar tanah untuk menanam.\nKetik *${usedPrefix}pertanian belitanah 1*`);

        let time = user.lastberkebon + cooldownMenanam;
        if (new Date() - user.lastberkebon < cooldownMenanam) {
            return m.reply(`⏳ *Lahan sedang dipulihkan!*\nMohon tunggu ${msToTime(time - new Date())} lagi untuk menanam kembali.`);
        }

        // Ambil jenis tanaman dan jumlah dari args
        let jenisTanaman = args[1] ? args[1].toLowerCase() : '';
        let jumlahBibit  = parseInt(args[2]);

        // Validasi tanaman
        if (!jenisTanaman || !marketItems[jenisTanaman] || jenisTanaman === 'tanah') {
            let daftar = plantables.map(p => `${marketItems[p].icon} ${p}`).join('\n');
            return m.reply(
                `🌾 *PILIH TANAMAN YANG INGIN DITANAM:*\n\n${daftar}\n\n` +
                `*Format:* \`${usedPrefix}pertanian tanam <tanaman> <jumlah bibit>\`\n` +
                `*Contoh:* \`${usedPrefix}pertanian tanam pisang 100\``
            );
        }

        // Validasi jumlah bibit
        if (!jumlahBibit || isNaN(jumlahBibit) || jumlahBibit < 1) {
            return m.reply(`Masukkan jumlah bibit yang ingin ditanam!\nContoh: *${usedPrefix}pertanian tanam ${jenisTanaman} 100*`);
        }

        // Cek stok bibit
        let bibitKey = 'bibit' + jenisTanaman;
        if ((user[bibitKey] || 0) < jumlahBibit) {
            return m.reply(
                `❌ *Bibit ${marketItems[jenisTanaman].name} tidak cukup!*\n` +
                `Kamu hanya punya *${user[bibitKey] || 0}* bibit ${marketItems[jenisTanaman].name}.\n\n` +
                `Beli bibit dulu dengan: *${usedPrefix}buy bibit${jenisTanaman} <jumlah>*`
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
            // Potong bibit
            user[bibitKey] -= jumlahBibit;
            user.lastberkebon = new Date() * 1;

            let waktuPanen = Math.floor(Math.random() * (waktuPanenMax - waktuPanenMin + 1)) + waktuPanenMin;
            let menitPanen = Math.floor(waktuPanen / 60000);

            await editProgress(
                `✅ *BERHASIL MENANAM ${marketItems[jenisTanaman].name.toUpperCase()}!*\n\n` +
                `${marketItems[jenisTanaman].icon} Ditanam: ${jumlahBibit} bibit\n` +
                `🗺️ Lahan: ${user.tanah} Hektar\n` +
                `⏳ Panen dalam: *${menitPanen} menit*`
            );

            // Panen otomatis
            setTimeout(() => {
                let pengali = user.tanah;
                let hasil   = Math.floor(jumlahBibit * (Math.random() * 1.5 + 1) * pengali / 10);
                user[jenisTanaman] += hasil;
                user.tiketcoin     += pengali;

                conn.reply(m.chat,
                    `🌾 *WAKTUNYA PANEN!* 🌾\n\n` +
                    `Dari ${jumlahBibit} bibit ${marketItems[jenisTanaman].icon} ${marketItems[jenisTanaman].name} kamu mendapatkan:\n` +
                    `${marketItems[jenisTanaman].icon} +${hasil} ${marketItems[jenisTanaman].name}\n` +
                    `🎟️ +${pengali} Tiketcoin\n\n` +
                    `Ketik *${usedPrefix}gudang* untuk melihat total panenmu!`,
                m);
            }, waktuPanen);

        }, 7500);
        return;
    }

    // Menu default
    m.reply(
        `*🌾 SISTEM PERTANIAN 🌾*\n\n` +
        `• \`${usedPrefix}pertanian tanam <tanaman> <jumlah>\` - Menanam\n` +
        `• \`${usedPrefix}gudang\` - Cek stok panen & bibit\n` +
        `• \`${usedPrefix}pertanian pasar\` - Cek harga saat ini\n` +
        `• \`${usedPrefix}pertanian jual <item> <jumlah>\` - Jual hasil panen\n` +
        `• \`${usedPrefix}pertanian belitanah <jumlah>\` - Beli tanah\n` +
        `• \`${usedPrefix}pertanian jualtanah <jumlah>\` - Jual tanah\n\n` +
        `*Contoh tanam:*\n\`${usedPrefix}pertanian tanam pisang 100\``
    );
};

handler.help    = ['pertanian', 'gudang'];
handler.tags    = ['rpg'];
handler.command = /^(berkebon|pertanian|gudang)$/i;
handler.rpg     = true;
handler.group   = true;

module.exports = handler;

function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours   = Math.floor((duration / (1000 * 60 * 60)) % 24);
    hours   = (hours < 10)   ? '0' + hours   : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;
    return hours + ' jam ' + minutes + ' menit ' + seconds + ' detik';
}
