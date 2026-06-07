let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    
    // Pastikan database market, perusahaan, dan bursa tersedia
    if (!global.db.data.market) global.db.data.market = {};
    if (!global.db.data.bursa) global.db.data.bursa = [];
    if (!Array.isArray(user.perusahaan)) user.perusahaan = [];

    // Bersihkan array dari elemen undefined/null akibat error database
    user.perusahaan = user.perusahaan.filter(pt => pt !== null && pt !== undefined);

    let action = args[0] ? args[0].toLowerCase() : 'help';

    // ==========================================
    // PENGATURAN HARGA & DATA PRODUK
    // ==========================================
    const biayaBuat = 85000000000000; // 85 Triliun
    const hargaRekrut = 1500000;      // 1.5 Juta per Karyawan
    const limitPerKaryawan = 5000000; // 1 Karyawan bisa kelola budget produksi 5 Juta
    const maxLevelGudang = 2000;
    const baseKapasitasGudang = 65;
    const hargaUpgradeGudang = 1000000000;

    const tipePerusahaan = ['minuman'];

    const produkList = {
        'airmineral': { type: 'minuman', name: 'Air Mineral', db: 'airmineral', prodCost: 5000, baseHargaToko: 15000, bahan: { botol: 1, air: 1 } },
        'tehbotol':   { type: 'minuman', name: 'Teh Botol', db: 'tehbotol', prodCost: 8000, baseHargaToko: 20000, bahan: { botol: 1, daunteh: 1, air: 1 } },
        'nescafe':    { type: 'minuman', name: 'Nescafe', db: 'nescafe', prodCost: 12000, baseHargaToko: 25000, bahan: { kaleng: 1, bijikopi: 1, air: 1 } },
        'ultramilk':  { type: 'minuman', name: 'Ultra Milk', db: 'ultramilk', prodCost: 15000, baseHargaToko: 30000, bahan: { botol: 1, susu: 1 } },
        'jusanggur':  { type: 'minuman', name: 'Jus Anggur', db: 'jusanggur', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, anggur: 2 } },
        'jusapel':    { type: 'minuman', name: 'Jus Apel', db: 'jusapel', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, apel: 2 } },
        'jusjeruk':   { type: 'minuman', name: 'Jus Jeruk', db: 'jusjeruk', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, jeruk: 2 } },
        'jusmangga':  { type: 'minuman', name: 'Jus Mangga', db: 'jusmangga', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, mangga: 2 } },
        'juspisang':  { type: 'minuman', name: 'Jus Pisang', db: 'juspisang', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, pisang: 2 } }
    };

    function getGudangUsage(gudangObj) {
        let total = 0;
        for (let item in gudangObj) { total += (gudangObj[item] || 0); }
        return total;
    }

    function getValuasi(pt) {
        let assetGudang = (pt.gudangLevel || 1) * hargaUpgradeGudang;
        let assetKaryawan = (pt.karyawan || 0) * hargaRekrut;
        let assetProduksi = (pt.totalProduksi || 0) * 50000; 
        let totalCash = (pt.saldo || 0) + (pt.investasi || 0);
        return biayaBuat + assetGudang + assetKaryawan + assetProduksi + totalCash;
    }

    function initCorporateData(pt, sender) {
        if (!pt.gudangLevel) pt.gudangLevel = 1;
        if (!pt.gudang) pt.gudang = {};
        if (typeof pt.saldo === 'undefined') pt.saldo = 0;
        if (typeof pt.investasi === 'undefined') pt.investasi = 0;
        if (!pt.pemegangSaham) {
            pt.pemegangSaham = {};
            let ownerSaham = typeof pt.sahamPlayer !== 'undefined' ? pt.sahamPlayer : 100;
            pt.pemegangSaham[sender] = ownerSaham;
            if (ownerSaham < 100) {
                pt.pemegangSaham['publik'] = 100 - ownerSaham;
            }
        }
        return pt;
    }

    switch (action) {
        
        case 'buat':
        case 'create':
            if (user.perusahaan.length >= 2) return m.reply('❌ Kamu sudah mencapai batas maksimal! Hanya boleh memiliki 2 Perusahaan.');
            let ptType = args[1] ? args[1].toLowerCase() : '';
            let namaPT = args.slice(2).join(' ');
            
            if (!tipePerusahaan.includes(ptType) || !namaPT) return m.reply(`⚠️ Format salah!\nKetik: *${usedPrefix + command} buat [tipe] [Nama Perusahaan]*\nTipe tersedia: *${tipePerusahaan.join(', ')}*\nContoh: *${usedPrefix + command} buat minuman PT. Indofood*`);
            if (user.money < biayaBuat) return m.reply(`❌ Uang Pribadimu tidak cukup!\nButuh Modal: *Rp 85.000.000.000.000 (85T)*\nUangmu: *Rp ${user.money.toLocaleString()}*`);

            user.money -= biayaBuat;
            let currentId = user.perusahaan.length + 1;
            let newPT = {
                id: currentId,
                name: namaPT,
                type: ptType, 
                karyawan: 10,
                totalProduksi: 0,
                gudangLevel: 1, 
                gudang: {},
                saldo: 0,
                investasi: 0,
                pemegangSaham: {}
            };
            newPT.pemegangSaham[m.sender] = 100; // 100% milik founder di awal
            user.perusahaan.push(newPT);

            m.reply(`🎉 *SELAMAT!* 🎉\nPerusahaan *${namaPT}* resmi didirikan!\n\n_Tip: Dompet perusahaanmu masih Rp 0. Gunakan *${usedPrefix + command} setordana* agar pabrik bisa mulai beroperasi._`);
            break;

        case 'info':
        case 'status':
            if (user.perusahaan.length === 0) return m.reply(`⚠️ Kamu belum memiliki perusahaan.\nKetik *${usedPrefix + command} buat [tipe] [Nama]* untuk mendirikan perusahaan seharga 85 Triliun.`);
            
            let textInfo = `🏢 *ASET KORPORASI MILIKMU* 🏢\n\n`;
            let mentionsInfo = [];
            user.perusahaan.forEach((pt, index) => {
                pt = initCorporateData(pt, m.sender);
                let nama = pt.name || `Perusahaan ${index + 1}`;
                let tipe = pt.type ? pt.type.toUpperCase() : 'MINUMAN';
                let karyawan = pt.karyawan || 0;
                let maxBudget = karyawan * limitPerKaryawan;
                let kapasitasGudang = pt.gudangLevel * baseKapasitasGudang;
                let isiGudang = getGudangUsage(pt.gudang);
                let valuasi = getValuasi(pt);

                let listSaham = [];
                for (let holder in pt.pemegangSaham) {
                    let p = pt.pemegangSaham[holder];
                    if (holder === m.sender) listSaham.push(`Owner: ${p}%`);
                    else if (holder === 'publik') listSaham.push(`Publik Lama: ${p}%`);
                    else {
                        listSaham.push(`@${holder.split('@')[0]}: ${p}%`);
                        if (!mentionsInfo.includes(holder)) mentionsInfo.push(holder);
                    }
                }

                textInfo += `*${index + 1}. ${nama}*\n`;
                textInfo += `🏭 Tipe Pabrik: *${tipe}*\n`;
                textInfo += `👥 Karyawan: ${karyawan.toLocaleString()} Orang (Max Prod: Rp ${maxBudget.toLocaleString()})\n`;
                textInfo += `📦 Gudang (Lv.${pt.gudangLevel}): ${isiGudang.toLocaleString()} / ${kapasitasGudang.toLocaleString()} Slot\n`;
                textInfo += `\n*📊 LAPORAN KEUANGAN & SAHAM:*\n`;
                textInfo += `> 💎 Valuasi PT: Rp ${valuasi.toLocaleString()}\n`;
                textInfo += `> 💼 Saham: [ ${listSaham.join(', ')} ]\n`;
                textInfo += `> 💳 Saldo Dompet: Rp ${pt.saldo.toLocaleString()}\n`;
                textInfo += `> 📈 Dana Investasi: Rp ${pt.investasi.toLocaleString()}\n\n`;
            });
            textInfo += `_Ketik *${usedPrefix + command} help* untuk melihat daftar perintah logistik & bursa saham._`;
            conn.reply(m.chat, textInfo, m, { mentions: mentionsInfo });
            break;

        case 'setordana':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let sJumlah = parseInt(args[1]);
            let sPtIdx = parseInt(args[2]) - 1;
            if (!sJumlah || isNaN(sPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} setordana <jumlah> <id_pt>*\nContoh: *${usedPrefix + command} setordana 50000000 1*`);
            
            let sPt = initCorporateData(user.perusahaan[sPtIdx], m.sender);
            if (!sPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (user.money < sJumlah) return m.reply(`❌ Uang Pribadimu kurang! (Punya: Rp ${user.money.toLocaleString()})`);

            user.money -= sJumlah;
            sPt.saldo += sJumlah;
            m.reply(`💳 *SETORAN MODAL SUKSES*\nRp ${sJumlah.toLocaleString()} telah masuk ke Dompet Perusahaan *${sPt.name}*.\nSaldo Pabrik Sekarang: Rp ${sPt.saldo.toLocaleString()}`);
            break;

        case 'tarikdana':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let tJumlah = parseInt(args[1]);
            let tPtIdx = parseInt(args[2]) - 1;
            if (!tJumlah || isNaN(tPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} tarikdana <jumlah> <id_pt>*`);
            
            let tPt = initCorporateData(user.perusahaan[tPtIdx], m.sender);
            if (!tPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (tPt.saldo < tJumlah) return m.reply(`❌ Saldo Perusahaan tidak cukup! (Sisa: Rp ${tPt.saldo.toLocaleString()})`);

            tPt.saldo -= tJumlah;
            user.money += tJumlah;
            m.reply(`💳 *PENARIKAN DANA SUKSES*\nRp ${tJumlah.toLocaleString()} ditarik dari *${tPt.name}* ke Dompet Pribadimu.`);
            break;

        case 'investasi':
        case 'invest':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let iJumlah = parseInt(args[1]);
            let iPtIdx = parseInt(args[2]) - 1;
            if (!iJumlah || isNaN(iPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} investasi <jumlah> <id_pt>*\n_Dana ini akan menghasilkan yield otomatis saat pabrik menjual barang!_`);
            
            let iPt = initCorporateData(user.perusahaan[iPtIdx], m.sender);
            if (!iPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (iPt.saldo < iJumlah) return m.reply(`❌ Saldo Dompet Perusahaan kurang! (Sisa: Rp ${iPt.saldo.toLocaleString()})`);

            iPt.saldo -= iJumlah;
            iPt.investasi += iJumlah;
            m.reply(`📈 *INVESTASI DISETOR*\nPerusahaan *${iPt.name}* mengalokasikan Rp ${iJumlah.toLocaleString()} ke pasar saham eksternal.\nTotal Investasi: Rp ${iPt.investasi.toLocaleString()}`);
            break;

        case 'tarikinvest':
        case 'tarikinvestasi':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let tiJumlah = parseInt(args[1]);
            let tiPtIdx = parseInt(args[2]) - 1;
            if (!tiJumlah || isNaN(tiPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} tarikinvest <jumlah> <id_pt>*`);
            
            let tiPt = initCorporateData(user.perusahaan[tiPtIdx], m.sender);
            if (!tiPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (tiPt.investasi < tiJumlah) return m.reply(`❌ Dana investasi tidak cukup! (Ada: Rp ${tiPt.investasi.toLocaleString()})`);

            tiPt.investasi -= tiJumlah;
            tiPt.saldo += tiJumlah;
            m.reply(`📉 *PENARIKAN INVESTASI*\nRp ${tiJumlah.toLocaleString()} dikembalikan ke Dompet Perusahaan.`);
            break;

        case 'jualsaham':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let jsPersen = parseInt(args[1]);
            let jsPtIdx = parseInt(args[2]) - 1;
            if (!jsPersen || isNaN(jsPtIdx) || jsPersen <= 0 || jsPersen > 100) return m.reply(`⚠️ Format: *${usedPrefix + command} jualsaham <persentase_lembar> <id_pt>*\nContoh: *${usedPrefix + command} jualsaham 10 1*`);
            
            let jsPt = initCorporateData(user.perusahaan[jsPtIdx], m.sender);
            if (!jsPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            
            let currentOwned = jsPt.pemegangSaham[m.sender] || 0;
            if (currentOwned < jsPersen) return m.reply(`❌ Gagal! Kamu hanya memiliki ${currentOwned}% saham di perusahaan ini.`);

            let valuasiSekarang = getValuasi(jsPt);
            let hargaPerPersen = Math.floor(valuasiSekarang / 100);
            let totalHargaListing = hargaPerPersen * jsPersen;

            jsPt.pemegangSaham[m.sender] -= jsPersen;
            if (jsPt.pemegangSaham[m.sender] === 0) delete jsPt.pemegangSaham[m.sender];

            let listingId = global.db.data.bursa.length + 1;
            global.db.data.bursa.push({
                id: listingId,
                seller: m.sender,
                ptId: jsPt.id,
                ptName: jsPt.name,
                persen: jsPersen,
                hargaPerPersen: hargaPerPersen,
                totalHarga: totalHargaListing
            });

            m.reply(`📊 *LISTING SAHAM BERHASIL*\n\nPerusahaan: *${jsPt.name}*\nSaham Dilisting: *${jsPersen}%*\nHarga per 1%: *Rp ${hargaPerPersen.toLocaleString()}*\nTotal Nilai Paket: *Rp ${totalHargaListing.toLocaleString()}*\n\n_Saham dipajang di bursa efek global! Ketik *${usedPrefix + command} bursa*._`);
            break;

        case 'bursa':
            if (global.db.data.bursa.length === 0) return m.reply('📊 *BURSA EFEK GLOBAL P2P*\n\nSaat ini belum ada perusahaan yang melisting sahamnya di bursa.');
            
            let teksBursa = `📊 *BURSA EFEK GLOBAL P2P* 📊\n_Tempat investasi & beli saham perusahaan milik player lain_\n\n`;
            let bursaMentions = [];
            global.db.data.bursa.forEach((b) => {
                let ownerTag = `@${b.seller.split('@')[0]}`;
                if (!bursaMentions.includes(b.seller)) bursaMentions.push(b.seller);
                
                teksBursa += `*${b.id}. ${b.ptName}*\n`;
                teksBursa += `   └ Owner: ${ownerTag}\n`;
                teksBursa += `   └ Lembar Saham: ${b.persen}%\n`;
                teksBursa += `   └ Profit Ratio: ${(b.persen * 0.8).toFixed(1)}% (Fee PT: ${(b.persen * 0.2).toFixed(1)}%)\n`;
                teksBursa += `   └ Total Harga: *Rp ${b.totalHarga.toLocaleString()}*\n`;
                teksBursa += `   ➔ Ketik: *${usedPrefix + command} belisaham ${b.id}*\n\n`;
            });
            
            conn.reply(m.chat, teksBursa, m, { mentions: bursaMentions });
            break;

        case 'belisaham':
            let bsId = parseInt(args[1]);
            if (!bsId || isNaN(bsId)) return m.reply(`⚠️ Format salah!\nKetik: *${usedPrefix + command} belisaham <id_bursa>*`);
            
            let bIdx = global.db.data.bursa.findIndex(v => v.id === bsId);
            if (bIdx === -1) return m.reply(`❌ ID Bursa tidak ditemukan atau saham sudah laku terjual!`);
            
            let listingObj = global.db.data.bursa[bIdx];
            if (user.money < listingObj.totalHarga) return m.reply(`❌ Uang pribadimu tidak cukup!\nButuh: *Rp ${listingObj.totalHarga.toLocaleString()}*\nUangmu: Rp ${user.money.toLocaleString()}`);
            
            let sellerData = global.db.data.users[listingObj.seller];
            if (!sellerData) return m.reply(`❌ Data pemilik perusahaan tidak valid.`);
            let targetPtSaham = sellerData.perusahaan.find(p => p.id === listingObj.ptId);
            if (!targetPtSaham) return m.reply(`❌ Perusahaan tersebut sudah bangkrut/tidak ditemukan.`);
            
            user.money -= listingObj.totalHarga; 
            targetPtSaham.saldo += listingObj.totalHarga; 
            
            if (!targetPtSaham.pemegangSaham) targetPtSaham.pemegangSaham = {};
            targetPtSaham.pemegangSaham[m.sender] = (targetPtSaham.pemegangSaham[m.sender] || 0) + listingObj.persen;
            
            global.db.data.bursa.splice(bIdx, 1);
            
            let sTag = `@${listingObj.seller.split('@')[0]}`;
            let bTag = `@${m.sender.split('@')[0]}`;
            
            let teksSuksesBeli = `🔔 *NOTIFIKASI INVESTASI SAHAM* 🔔\n\n`;
            teksSuksesBeli += `${bTag} telah sukses membeli *${listingObj.persen}%* saham dari perusahaan *${targetPtSaham.name}* milik ${sTag}!\n\n`;
            teksSuksesBeli += `💰 Dana investasi sebesar *Rp ${listingObj.totalHarga.toLocaleString()}* telah disuntikkan masuk ke **Dompet Perusahaan**.\n`;
            teksSuksesBeli += `📈 Pembeli kini resmi menjadi Investor dan akan otomatis menerima passive income sebesar *${(listingObj.persen * 0.8).toFixed(1)}%* setiap pabrik ini menjual produk!`;
            
            conn.reply(m.chat, teksSuksesBeli, m, { mentions: [listingObj.seller, m.sender] });
            break;

        case 'batalsaham':
        case 'tariklisting':
            let batalId = parseInt(args[1]);
            if (!batalId || isNaN(batalId)) return m.reply(`⚠️ Format: *${usedPrefix + command} batalsaham <id_bursa>*`);
            
            let batIdx = global.db.data.bursa.findIndex(v => v.id === batalId);
            if (batIdx === -1) return m.reply(`❌ ID Bursa tidak ditemukan!`);
            
            let batListing = global.db.data.bursa[batIdx];
            if (batListing.seller !== m.sender) return m.reply(`❌ Kamu bukan pemilik dari listing saham ini!`);
            
            let ownerPt = user.perusahaan.find(p => p.id === batListing.ptId);
            if (ownerPt) {
                if (!ownerPt.pemegangSaham) ownerPt.pemegangSaham = {};
                ownerPt.pemegangSaham[m.sender] = (ownerPt.pemegangSaham[m.sender] || 0) + batListing.persen;
            }
            
            global.db.data.bursa.splice(batIdx, 1);
            m.reply(`✅ *LISTING SAHAM DICANCEL*\nLembar saham sebesar ${batListing.persen}% sukses ditarik kembali ke kepemilikan utamamu.`);
            break;

        case 'buyback':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let bbPersen = parseInt(args[1]);
            let bbPtIdx = parseInt(args[2]) - 1;
            let targetJid = args[3]; 
            
            if (!bbPersen || isNaN(bbPtIdx) || bbPersen <= 0) return m.reply(`⚠️ Format: *${usedPrefix + command} buyback <persentase> <id_pt> [tag_target]*`);
            
            let bbPt = initCorporateData(user.perusahaan[bbPtIdx], m.sender);
            if (!bbPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            
            let bTarget = 'publik';
            if (targetJid) {
                bTarget = targetJid.replace(/[@ \t\r\n]/g, '');
                if (!bTarget.includes('@s.whatsapp.net') && bTarget !== 'publik') bTarget += '@s.whatsapp.net';
            } else {
                let holders = Object.keys(bbPt.pemegangSaham).filter(k => k !== m.sender);
                if (holders.length > 0) bTarget = holders[0];
            }
            
            let availSaham = bbPt.pemegangSaham[bTarget] || 0;
            if (availSaham < bbPersen) return m.reply(`❌ Saham milik target tidak cukup! Hanya ada ${availSaham}% tersisa.`);
            
            let valuasiBb = getValuasi(bbPt);
            let biayaBuyback = Math.floor(valuasiBb * (bbPersen / 100));

            if (bbPt.saldo < biayaBuyback) return m.reply(`❌ Dompet Perusahaan tidak mencukupi untuk Buyback!\nButuh Kas: *Rp ${biayaBuyback.toLocaleString()}*\nSaldo Dompet PT: Rp ${bbPt.saldo.toLocaleString()}`);

            bbPt.saldo -= biayaBuyback;
            bbPt.pemegangSaham[bTarget] -= bbPersen;
            if (bbPt.pemegangSaham[bTarget] === 0) delete bbPt.pemegangSaham[bTarget];
            
            bbPt.pemegangSaham[m.sender] = (bbPt.pemegangSaham[m.sender] || 0) + bbPersen;
            
            if (bTarget !== 'publik' && global.db.data.users[bTarget]) {
                global.db.data.users[bTarget].money += biayaBuyback;
                let buybackNotif = `💸 *SAHAM DIBELI BALIK (BUYBACK)* 💸\n\nSaham milikmu sebesar *${bbPersen}%* di perusahaan *${bbPt.name}* telah dibeli kembali (buyback) oleh owner utama seharga *Rp ${biayaBuyback.toLocaleString()}*.\nDana tunai langsung cair ke dompet pribadi kamu!`;
                conn.reply(bTarget, buybackNotif, null);
            }

            m.reply(`🤝 *BUYBACK SAHAM SUKSES*\n\nPerusahaan melakukan buyback *${bbPersen}%* saham dari ${bTarget === 'publik' ? 'Publik' : '@' + bTarget.split('@')[0]} menggunakan kas internal.\nBiaya: *-Rp ${biayaBuyback.toLocaleString()}*\nTotal Kepemilikanmu sekarang: *${bbPt.pemegangSaham[m.sender]}%*`);
            break;

        case 'upgradegudang':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let upPtIdx = parseInt(args[1]) - 1;
            if (isNaN(upPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} upgradegudang <id_pt>*`);
            
            let upPt = initCorporateData(user.perusahaan[upPtIdx], m.sender);
            if (!upPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (upPt.gudangLevel >= maxLevelGudang) return m.reply(`❌ Gudang sudah Level Maksimal!`);
            
            let biayaUpGudang = upPt.gudangLevel * hargaUpgradeGudang;
            if (upPt.saldo < biayaUpGudang) return m.reply(`❌ Saldo PT Kurang! Biaya: *Rp ${biayaUpGudang.toLocaleString()}*`);

            upPt.saldo -= biayaUpGudang;
            upPt.gudangLevel += 1;
            let kapBaru = upPt.gudangLevel * baseKapasitasGudang;
            m.reply(`🏗️ *UPGRADE GUDANG SUKSES*\nLevel: *Lv.${upPt.gudangLevel}*\nKapasitas: *${kapBaru.toLocaleString()} Slot*\nBiaya: -Rp ${biayaUpGudang.toLocaleString()}`);
            break;

        case 'setor':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let setorJml = parseInt(args[1]);
            let setorItem = args[2] ? args[2].toLowerCase() : '';
            let ptSetorIdx = parseInt(args[3]) - 1;

            if (!setorJml || !setorItem || isNaN(ptSetorIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} setor <jumlah> <item> <id_pt>*`);

            let ptSetor = initCorporateData(user.perusahaan[ptSetorIdx], m.sender);
            if (!ptSetor) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if ((user[setorItem] || 0) < setorJml) return m.reply(`❌ Kamu tidak memiliki cukup *${setorItem}* di inventory pribadimu!`);

            let sKapasitasG = ptSetor.gudangLevel * baseKapasitasGudang;
            let sSisaSlot = sKapasitasG - getGudangUsage(ptSetor.gudang);

            if (setorJml > sSisaSlot) return m.reply(`❌ Gudang Penuh! Sisa Slot: *${sSisaSlot.toLocaleString()}*`);

            user[setorItem] -= setorJml;
            ptSetor.gudang[setorItem] = (ptSetor.gudang[setorItem] || 0) + setorJml;
            m.reply(`📥 Berhasil setor ${setorJml.toLocaleString()} ${setorItem} ke Gudang *${ptSetor.name}*.`);
            break;

        case 'tarik':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let tarikJml = parseInt(args[1]);
            let tarikItem = args[2] ? args[2].toLowerCase() : '';
            let ptTarikIdx = parseInt(args[3]) - 1;

            if (!tarikJml || !tarikItem || isNaN(ptTarikIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} tarik <jumlah> <item> <id_pt>*`);

            let ptTarik = initCorporateData(user.perusahaan[ptTarikIdx], m.sender);
            if (!ptTarik) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if ((ptTarik.gudang[tarikItem] || 0) < tarikJml) return m.reply(`❌ Di gudang tidak ada cukup *${tarikItem}*!`);

            ptTarik.gudang[tarikItem] -= tarikJml;
            user[tarikItem] = (user[tarikItem] || 0) + tarikJml;
            m.reply(`📤 Berhasil tarik ${tarikJml.toLocaleString()} ${tarikItem} ke Inventory Pribadi.`);
            break;

        case 'rekrut':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let jmlRekrut = parseInt(args[1]);
            let targetPT = parseInt(args[2]) - 1;

            if (!jmlRekrut || jmlRekrut < 1 || isNaN(targetPT)) return m.reply(`⚠️ Format: *${usedPrefix + command} rekrut <jumlah> <id_pt>*`);
            
            let rPt = initCorporateData(user.perusahaan[targetPT], m.sender);
            if (!rPt) return m.reply(`❌ ID Perusahaan tidak valid!`);

            let biayaRekrut = jmlRekrut * hargaRekrut;
            if (rPt.saldo < biayaRekrut) return m.reply(`❌ Saldo PT kurang!\nBiaya rekrut: *Rp ${biayaRekrut.toLocaleString()}*`);

            rPt.saldo -= biayaRekrut;
            rPt.karyawan += jmlRekrut;
            m.reply(`🤝 Berhasil merekrut ${jmlRekrut.toLocaleString()} Karyawan untuk *${rPt.name}*.\nBiaya Pabrik: -Rp ${biayaRekrut.toLocaleString()}`);
            break;

        case 'produksi':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let jmlProd = parseInt(args[1]); 
            let namaItem = args[2] ? args[2].toLowerCase() : '';
            let ptIndex = parseInt(args[3]) - 1;

            if (!jmlProd || !namaItem || isNaN(ptIndex)) return m.reply(`⚠️ Format salah!\nContoh: *${usedPrefix + command} produksi 100 airmineral 1*`);

            let ptProd = initCorporateData(user.perusahaan[ptIndex], m.sender);
            if (!ptProd) return m.reply(`❌ ID Perusahaan tidak valid!`);
            
            let dataProduk = produkList[namaItem];
            if (!dataProduk) return m.reply(`❌ Item *${namaItem}* tidak valid.`);
            if (dataProduk.type !== (ptProd.type || 'minuman')) return m.reply(`❌ Pabrikmu tidak bisa memproduksi tipe ini!`);

            let maxBudgetPT = ptProd.karyawan * limitPerKaryawan;
            let totalBiayaPabrik = jmlProd * dataProduk.prodCost;
            if (totalBiayaPabrik > maxBudgetPT) return m.reply(`❌ Karyawan tidak sanggup mengelola skala produksi sebesar ini!\nMax Kapasitas Produksi: *Rp ${maxBudgetPT.toLocaleString()}*`);
            
            let wattListrik = jmlProd * 489; 
            let literAir = jmlProd * 1;      
            let tagihanListrik = jmlProd * 5000; 
            let tagihanAir = jmlProd * 11000;     
            let tagihanLogistik = Math.floor(Math.random() * (3789000 - 1165000 + 1)) + 1165000;

            let totalKeseluruhan = totalBiayaPabrik + tagihanListrik + tagihanAir + tagihanLogistik;
            if (ptProd.saldo < totalKeseluruhan) return m.reply(`❌ Saldo PT Kurang!\nTotal Tagihan Produksi: *Rp ${totalKeseluruhan.toLocaleString()}*\nSaldo PT: Rp ${ptProd.saldo.toLocaleString()}`);

            let kurangBahan = [];
            let totalBahanTerpakai = 0;
            for (let b in dataProduk.bahan) {
                let butuh = dataProduk.bahan[b] * jmlProd;
                let stokG = ptProd.gudang[b] || 0;
                totalBahanTerpakai += butuh;
                if (stokG < butuh) kurangBahan.push(`- ${b}: Butuh ${butuh.toLocaleString()}, Gudang Punya ${stokG.toLocaleString()}`);
            }
            if (kurangBahan.length > 0) return m.reply(`❌ *BAHAN BAKU DI GUDANG TIDAK CUKUP!*\n\n${kurangBahan.join('\n')}`);

            let kapasitasMaks = ptProd.gudangLevel * baseKapasitasGudang;
            let proyeksiIsiNanti = getGudangUsage(ptProd.gudang) - totalBahanTerpakai + jmlProd;
            if (proyeksiIsiNanti > kapasitasMaks) return m.reply(`❌ *GUDANG KEPENUHAN!* Silakan tarik barang atau *upgradegudang*.`);

            ptProd.saldo -= totalKeseluruhan;
            let logBahanTeks = '';
            for (let b in dataProduk.bahan) {
                let potong = dataProduk.bahan[b] * jmlProd;
                ptProd.gudang[b] -= potong;
                logBahanTeks += `> ${b}: -${potong.toLocaleString()} (Gudang)\n`;
            }

            ptProd.gudang[dataProduk.db] = (ptProd.gudang[dataProduk.db] || 0) + jmlProd;
            ptProd.totalProduksi += jmlProd;

            let strukProduksi = `🏭 *PRODUKSI PABRIK SELESAI* 🏭\n\nItem: *${dataProduk.name}*\nHasil: *+${jmlProd.toLocaleString()} Pcs*\n\n*🧾 KAS PABRIK KELUAR:*\n`;
            strukProduksi += `> ⚙️ Biaya Pabrik: -Rp ${totalBiayaPabrik.toLocaleString()}\n`;
            strukProduksi += `> 🚚 Tagihan Logistik: -Rp ${tagihanLogistik.toLocaleString()}\n`;
            strukProduksi += `> ⚡ Listrik & Air: -Rp ${(tagihanListrik + tagihanAir).toLocaleString()}\n`;
            strukProduksi += `*Total Kas Terpotong: -Rp ${totalKeseluruhan.toLocaleString()}*\n\n`;
            strukProduksi += `*📦 PEMAKAIAN BAHAN BAKU:*\n${logBahanTeks}`;
            m.reply(strukProduksi);
            break;

        // --- DISTRIBUSI/JUAL DENGAN POTONGAN DIVIDEN (80% PROFIT INVESTOR, 20% MANAGEMENT FEE) ---
        case 'jual':
        case 'distribusi':
            let jualJml = parseInt(args[1]);
            let jualItem = args[2] ? args[2].toLowerCase() : '';
            let optIdPt = args[3] ? parseInt(args[3]) - 1 : null; 

            if (!jualJml || !jualItem) return m.reply(`⚠️ Format: *${usedPrefix + command} jual <jumlah> <jenis-item> [id_pt]*\n_Beri ID PT di akhir untuk jual langsung dari pabrik._`);

            let prodData = produkList[jualItem];
            if (!prodData) return m.reply(`❌ Item bukan produk perusahaan.`);
            
            let hargaPerPcs = Math.floor(prodData.baseHargaToko * 0.85);
            let grossProfit = hargaPerPcs * jualJml;
            let sumberBarang = '';
            let teksFinansial = '';

            if (optIdPt !== null && !isNaN(optIdPt)) {
                let ptJual = initCorporateData(user.perusahaan[optIdPt], m.sender);
                if (!ptJual) return m.reply(`❌ ID Perusahaan tidak valid!`);
                if ((ptJual.gudang[jualItem] || 0) < jualJml) return m.reply(`❌ Stok di Gudang Pabrik *${ptJual.name}* tidak cukup!`);

                ptJual.gudang[jualItem] -= jualJml;
                sumberBarang = `Gudang Pabrik (${ptJual.name})`;

                // Yield investasi internal pabrik
                let yieldInvestasi = 0;
                if (ptJual.investasi > 0) {
                    let percentYield = (Math.random() * (0.05 - 0.01) + 0.01);
                    yieldInvestasi = Math.floor(ptJual.investasi * percentYield);
                }

                let totalMasuk = grossProfit + yieldInvestasi;
                let teksDividenLog = '';
                let mentionsDividen = [];
                let totalDividenKeluar = 0;

                // Hitung jatah dividen untuk investor
                for (let shareholder in ptJual.pemegangSaham) {
                    let persenSaham = ptJual.pemegangSaham[shareholder];
                    
                    if (shareholder === m.sender) {
                        continue; // Owner diproses terakhir setelah dapat sisa/management fee
                    } else if (shareholder === 'publik') {
                        // Publik tidak kena management fee (dibakar sistem)
                        let bagianPublik = Math.floor(totalMasuk * (persenSaham / 100));
                        totalDividenKeluar += bagianPublik;
                        teksDividenLog += `> 🏛️ Pajak/Publik Sistem (${persenSaham}%): -Rp ${bagianPublik.toLocaleString()}\n`;
                    } else {
                        // INVESTOR LUAR (Dapat 80% dari persentase saham aslinya)
                        // Contoh: Punya 10% saham, profit dihitung 8% (2% nya balik ke owner)
                        let profitAktifPersen = persenSaham * 0.8; 
                        let bagianDividen = Math.floor(totalMasuk * (profitAktifPersen / 100));
                        
                        if (global.db.data.users[shareholder]) {
                            global.db.data.users[shareholder].money += bagianDividen;
                            totalDividenKeluar += bagianDividen;
                            teksDividenLog += `> 👤 Investor @${shareholder.split('@')[0]} (Profit ${profitAktifPersen.toFixed(1)}%): +Rp ${bagianDividen.toLocaleString()}\n`;
                            if (!mentionsDividen.includes(shareholder)) mentionsDividen.push(shareholder);
                            
                            // Kirim pesan passive income ke investor
                            let notifPasif = `💸 *PASSIVE INCOME INCOMING* 💸\n\nKamu menerima dividen pasif sebesar *Rp ${bagianDividen.toLocaleString()}* hasil penjualan dari perusahaan *${ptJual.name}*.\n_(*Note: Sebagai investor publik, kamu menerima ${profitAktifPersen.toFixed(1)}% profit dari total ${persenSaham}% saham yang kamu miliki, sisanya ditarik owner sebagai fee manajemen*)_.\nDana sukses cair ke dompet pribadimu!`;
                            conn.reply(shareholder, notifPasif, null);
                        }
                    }
                }

                // Sisa profit semua otomatis masuk ke dompet PT (termasuk jatah owner & management fee dari investor)
                let bagianOwnerPT = totalMasuk - totalDividenKeluar;
                ptJual.saldo += bagianOwnerPT;
                
                let persenOwnerAsli = ptJual.pemegangSaham[m.sender] || 0;
                teksDividenLog = `> 🏢 Kas Dompet PT (Saham ${persenOwnerAsli}% + Mngmt Fee): +Rp ${bagianOwnerPT.toLocaleString()}\n` + teksDividenLog;

                teksFinansial += `\n\n*📊 LAPORAN FINANSIAL PABRIK:*\n`;
                teksFinansial += `> Gross Profit Penjualan: Rp ${grossProfit.toLocaleString()}\n`;
                if (yieldInvestasi > 0) teksFinansial += `> 📈 Yield Reksadana Pabrik: +Rp ${yieldInvestasi.toLocaleString()}\n`;
                teksFinansial += `\n*🧾 BAGI HASIL DIVIDEN BURSA SAHAM:*\n${teksDividenLog}`;
                
                conn.reply(m.chat, `🚚 *DISTRIBUSI LOGISTIK PASAR SUKSES* 🚚\n\nSumber Muatan: *${sumberBarang}*\nBarang: *${jualJml.toLocaleString()} ${prodData.name}*\nHarga Grosir: Rp ${hargaPerPcs.toLocaleString()} / pcs${teksFinansial}`, m, { mentions: mentionsDividen });

            } else {
                if ((user[prodData.db] || 0) < jualJml) return m.reply(`❌ Stok tidak cukup!\n_Tip: Jika barang di pabrik, gunakan ID PT misal: *${usedPrefix + command} jual 100 tehbotol 1*_`);

                user[prodData.db] -= jualJml;
                user.money += grossProfit;
                sumberBarang = 'Inventory Pribadi';
                teksFinansial = `\n\n*Total Profit Pribadi: +Rp ${grossProfit.toLocaleString()}*`;
                m.reply(`🚚 *DISTRIBUSI LOGISTIK PASAR SUKSES* 🚚\n\nSumber Muatan: *${sumberBarang}*\nBarang: *${jualJml.toLocaleString()} ${prodData.name}*\nHarga Grosir: Rp ${hargaPerPcs.toLocaleString()} / pcs${teksFinansial}`);
            }

            if (!global.db.data.market[prodData.db]) global.db.data.market[prodData.db] = { stock: 100000 };
            global.db.data.market[prodData.db].stock += jualJml;
            break;

        default:
            let help = `🏢 *SISTEM MEGA KORPORAT & BURSA SAHAM* 🏢\n\n`
            help += `*[ MANAJEMEN ASET ]*\n`
            help += `*${usedPrefix + command} buat <tipe> <nama>* - Bangun PT (Modal 85T)\n`
            help += `*${usedPrefix + command} info* - Cek Aset, Saham & Saldo PT\n`
            help += `*${usedPrefix + command} rekrut <jumlah> <id>* - Hire HRD (Pakai Saldo PT)\n`
            help += `*${usedPrefix + command} upgradegudang <id>* - Ekspansi Gudang\n\n`
            help += `*[ KEUANGAN & REKSADANA INTERNAL ]*\n`
            help += `*${usedPrefix + command} setordana / tarikdana <jumlah> <id>* - Transfer Pribadi ↔ PT\n`
            help += `*${usedPrefix + command} invest / tarikinvest <jumlah> <id>* - Putar kas PT ke Reksadana\n\n`
            help += `*[ BURSA SAHAM GLOBAL P2P ]*\n`
            help += `*${usedPrefix + command} bursa* - Lihat emiten pasar saham global\n`
            help += `*${usedPrefix + command} jualsaham <%> <id_pt>* - Jual saham ke bursa P2P\n`
            help += `*${usedPrefix + command} belisaham <id_bursa>* - Beli saham PT milik player lain\n`
            help += `*${usedPrefix + command} batalsaham <id_bursa>* - Cancel/Tarik kembali listing sahammu\n`
            help += `*${usedPrefix + command} buyback <%> <id_pt> [tag/publik]* - Tebus/Beli balik saham\n\n`
            help += `*[ LOGISTIK PABRIK ]*\n`
            help += `*${usedPrefix + command} setor / tarik <jumlah> <item> <id>* - Bongkar muat Gudang\n`
            help += `*${usedPrefix + command} produksi <jumlah> <item> <id>* - Mulai produksi pabrik\n`
            help += `*${usedPrefix + command} jual <jumlah> <item> [id_pt]* - Jual barang & sebar dividen\n\n`
            help += `_Kendalikan pasar, kuasai bursa saham, dan jadilah konglomerat terbesar server!_`
            m.reply(help);
    }
}

handler.help = ['perusahaan']
handler.tags = ['rpg']
handler.command = /^(perusahaan|company|pt)$/i

module.exports = handler;
