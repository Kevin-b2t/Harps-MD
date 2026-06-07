let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    
    // Pastikan database market dan perusahaan tersedia
    if (!global.db.data.market) global.db.data.market = {};
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

    // Fungsi utilitas untuk menghitung total isi gudang
    function getGudangUsage(gudangObj) {
        let total = 0;
        for (let item in gudangObj) { total += (gudangObj[item] || 0); }
        return total;
    }

    // Fungsi menghitung valuasi perusahaan (Harga Saham)
    function getValuasi(pt) {
        let assetGudang = (pt.gudangLevel || 1) * hargaUpgradeGudang;
        let assetKaryawan = (pt.karyawan || 0) * hargaRekrut;
        let assetProduksi = (pt.totalProduksi || 0) * 50000; 
        let totalCash = (pt.saldo || 0) + (pt.investasi || 0);
        return biayaBuat + assetGudang + assetKaryawan + assetProduksi + totalCash;
    }

    // Pastikan data lama ter-update dengan fitur baru
    function initCorporateData(pt) {
        if (!pt.gudangLevel) pt.gudangLevel = 1;
        if (!pt.gudang) pt.gudang = {};
        if (typeof pt.saldo === 'undefined') pt.saldo = 0;
        if (typeof pt.investasi === 'undefined') pt.investasi = 0;
        if (typeof pt.sahamPlayer === 'undefined') pt.sahamPlayer = 100;
        return pt;
    }

    switch (action) {
        
        // --- BIKIN PERUSAHAAN BARU ---
        case 'buat':
        case 'create':
            if (user.perusahaan.length >= 2) return m.reply('❌ Kamu sudah mencapai batas maksimal! Hanya boleh memiliki 2 Perusahaan.');
            let ptType = args[1] ? args[1].toLowerCase() : '';
            let namaPT = args.slice(2).join(' ');
            
            if (!tipePerusahaan.includes(ptType) || !namaPT) return m.reply(`⚠️ Format salah!\nKetik: *${usedPrefix + command} buat [tipe] [Nama Perusahaan]*\nTipe tersedia: *${tipePerusahaan.join(', ')}*\nContoh: *${usedPrefix + command} buat minuman PT. Indofood*`);
            if (user.money < biayaBuat) return m.reply(`❌ Uang Pribadimu tidak cukup!\nButuh Modal: *Rp 85.000.000.000.000 (85T)*\nUangmu: *Rp ${user.money.toLocaleString()}*`);

            user.money -= biayaBuat;
            user.perusahaan.push({
                id: user.perusahaan.length + 1,
                name: namaPT,
                type: ptType, 
                karyawan: 10,
                totalProduksi: 0,
                gudangLevel: 1, 
                gudang: {},
                saldo: 0,
                investasi: 0,
                sahamPlayer: 100
            });

            m.reply(`🎉 *SELAMAT!* 🎉\nPerusahaan *${namaPT}* resmi didirikan!\n\n_Tip: Dompet perusahaanmu masih Rp 0. Gunakan *${usedPrefix + command} setordana* agar pabrik bisa mulai beroperasi._`);
            break;

        // --- CEK STATUS PERUSAHAAN ---
        case 'info':
        case 'status':
            if (user.perusahaan.length === 0) return m.reply(`⚠️ Kamu belum memiliki perusahaan.\nKetik *${usedPrefix + command} buat [tipe] [Nama]* untuk mendirikan perusahaan seharga 85 Triliun.`);
            
            let textInfo = `🏢 *ASET KORPORASI MILIKMU* 🏢\n\n`;
            user.perusahaan.forEach((pt, index) => {
                pt = initCorporateData(pt);
                let nama = pt.name || `Perusahaan ${index + 1}`;
                let tipe = pt.type ? pt.type.toUpperCase() : 'MINUMAN';
                let karyawan = pt.karyawan || 0;
                let maxBudget = karyawan * limitPerKaryawan;
                let kapasitasGudang = pt.gudangLevel * baseKapasitasGudang;
                let isiGudang = getGudangUsage(pt.gudang);
                let valuasi = getValuasi(pt);

                textInfo += `*${index + 1}. ${nama}*\n`;
                textInfo += `🏭 Tipe Pabrik: *${tipe}*\n`;
                textInfo += `👥 Karyawan: ${karyawan.toLocaleString()} Orang (Max Prod: Rp ${maxBudget.toLocaleString()})\n`;
                textInfo += `📦 Gudang (Lv.${pt.gudangLevel}): ${isiGudang.toLocaleString()} / ${kapasitasGudang.toLocaleString()} Slot\n`;
                textInfo += `\n*📊 LAPORAN KEUANGAN:*\n`;
                textInfo += `> 💎 Valuasi: Rp ${valuasi.toLocaleString()}\n`;
                textInfo += `> 💼 Saham Dimiliki: ${pt.sahamPlayer}%\n`;
                textInfo += `> 💳 Saldo Dompet: Rp ${pt.saldo.toLocaleString()}\n`;
                textInfo += `> 📈 Dana Investasi: Rp ${pt.investasi.toLocaleString()}\n\n`;
            });
            textInfo += `_Ketik *${usedPrefix + command} help* untuk melihat daftar perintah logistik & finansial._`;
            m.reply(textInfo);
            break;

        // --- MANAJEMEN DOMPET PERUSAHAAN ---
        case 'setordana':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let sJumlah = parseInt(args[1]);
            let sPtIdx = parseInt(args[2]) - 1;
            if (!sJumlah || isNaN(sPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} setordana <jumlah> <id_pt>*\nContoh: *${usedPrefix + command} setordana 50000000 1*`);
            
            let sPt = initCorporateData(user.perusahaan[sPtIdx]);
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
            
            let tPt = initCorporateData(user.perusahaan[tPtIdx]);
            if (!tPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (tPt.saldo < tJumlah) return m.reply(`❌ Saldo Perusahaan tidak cukup! (Sisa: Rp ${tPt.saldo.toLocaleString()})`);

            tPt.saldo -= tJumlah;
            user.money += tJumlah;
            m.reply(`💳 *PENARIKAN DANA SUKSES*\nRp ${tJumlah.toLocaleString()} ditarik dari *${tPt.name}* ke Dompet Pribadimu.`);
            break;

        // --- SISTEM INVESTASI PERUSAHAAN ---
        case 'investasi':
        case 'invest':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let iJumlah = parseInt(args[1]);
            let iPtIdx = parseInt(args[2]) - 1;
            if (!iJumlah || isNaN(iPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} investasi <jumlah> <id_pt>*\n_Dana ini akan menghasilkan yield saat pabrik menjual barang!_`);
            
            let iPt = initCorporateData(user.perusahaan[iPtIdx]);
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
            
            let tiPt = initCorporateData(user.perusahaan[tiPtIdx]);
            if (!tiPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (tiPt.investasi < tiJumlah) return m.reply(`❌ Dana investasi tidak cukup! (Ada: Rp ${tiPt.investasi.toLocaleString()})`);

            tiPt.investasi -= tiJumlah;
            tiPt.saldo += tiJumlah;
            m.reply(`📉 *PENARIKAN INVESTASI*\nRp ${tiJumlah.toLocaleString()} dikembalikan ke Dompet Perusahaan.`);
            break;

        // --- SISTEM SAHAM (IPO & BUYBACK) ---
        case 'jualsaham':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let jsPersen = parseInt(args[1]);
            let jsPtIdx = parseInt(args[2]) - 1;
            if (!jsPersen || isNaN(jsPtIdx) || jsPersen <= 0 || jsPersen > 100) return m.reply(`⚠️ Format: *${usedPrefix + command} jualsaham <persentase_1_sd_100> <id_pt>*\nContoh: *${usedPrefix + command} jualsaham 20 1*`);
            
            let jsPt = initCorporateData(user.perusahaan[jsPtIdx]);
            if (!jsPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (jsPt.sahamPlayer - jsPersen < 0) return m.reply(`❌ Gagal! Kamu hanya memiliki ${jsPt.sahamPlayer}% saham tersisa.`);

            let valuasiJual = getValuasi(jsPt);
            let suntikanDana = Math.floor(valuasiJual * (jsPersen / 100));

            jsPt.sahamPlayer -= jsPersen;
            jsPt.saldo += suntikanDana;
            m.reply(`🤝 *IPO / PENJUALAN SAHAM SUKSES*\n\nKamu menjual *${jsPersen}%* saham *${jsPt.name}* ke investor publik.\nSuntikan Dana Masuk: *+Rp ${suntikanDana.toLocaleString()}*\n\n_Catatan: Karena investor publik kini memiliki ${(100 - jsPt.sahamPlayer)}% saham, mereka akan memotong keuntungan setiap kali pabrik menjual produk!_`);
            break;

        case 'belisaham':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let bsPersen = parseInt(args[1]);
            let bsPtIdx = parseInt(args[2]) - 1;
            if (!bsPersen || isNaN(bsPtIdx) || bsPersen <= 0 || bsPersen > 100) return m.reply(`⚠️ Format: *${usedPrefix + command} belisaham <persentase> <id_pt>*`);
            
            let bsPt = initCorporateData(user.perusahaan[bsPtIdx]);
            if (!bsPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (bsPt.sahamPlayer + bsPersen > 100) return m.reply(`❌ Gagal! Kepemilikan tidak bisa melebihi 100%. (Saat ini: ${bsPt.sahamPlayer}%)`);

            let valuasiBeli = getValuasi(bsPt);
            let biayaBuyback = Math.floor(valuasiBeli * (bsPersen / 100));

            // Stock buyback menggunakan Dompet Perusahaan
            if (bsPt.saldo < biayaBuyback) return m.reply(`❌ Dompet Perusahaan tidak sanggup melakukan Buyback Saham!\nBiaya menebus ${bsPersen}% saham publik adalah *Rp ${biayaBuyback.toLocaleString()}*\nSaldo Dompet PT: Rp ${bsPt.saldo.toLocaleString()}`);

            bsPt.saldo -= biayaBuyback;
            bsPt.sahamPlayer += bsPersen;
            m.reply(`🤝 *BUYBACK SAHAM SUKSES*\n\nPerusahaan melakukan buyback *${bsPersen}%* saham dari publik menggunakan kas internal.\nBiaya Buyback: *-Rp ${biayaBuyback.toLocaleString()}*\nKepemilikanmu sekarang: *${bsPt.sahamPlayer}%*`);
            break;

        // --- UPGRADE GUDANG ---
        case 'upgradegudang':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let upPtIdx = parseInt(args[1]) - 1;
            if (isNaN(upPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} upgradegudang <id_pt>*`);
            
            let upPt = initCorporateData(user.perusahaan[upPtIdx]);
            if (!upPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (upPt.gudangLevel >= maxLevelGudang) return m.reply(`❌ Gudang sudah Level Maksimal!`);
            
            let biayaUpGudang = upPt.gudangLevel * hargaUpgradeGudang;
            if (upPt.saldo < biayaUpGudang) return m.reply(`❌ Saldo Dompet Perusahaan Kurang!\nBiaya: *Rp ${biayaUpGudang.toLocaleString()}*\n_Silakan *setordana* terlebih dahulu._`);

            upPt.saldo -= biayaUpGudang;
            upPt.gudangLevel += 1;
            let kapBaru = upPt.gudangLevel * baseKapasitasGudang;
            m.reply(`🏗️ *UPGRADE GUDANG SUKSES*\nLevel: *Lv.${upPt.gudangLevel}*\nKapasitas: *${kapBaru.toLocaleString()} Slot*\nBiaya: -Rp ${biayaUpGudang.toLocaleString()}`);
            break;

        // --- SETOR BAHAN KE GUDANG PABRIK ---
        case 'setor':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let setorJml = parseInt(args[1]);
            let setorItem = args[2] ? args[2].toLowerCase() : '';
            let ptSetorIdx = parseInt(args[3]) - 1;

            if (!setorJml || !setorItem || isNaN(ptSetorIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} setor <jumlah> <nama-item> <id_pt>*`);

            let ptSetor = initCorporateData(user.perusahaan[ptSetorIdx]);
            if (!ptSetor) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if ((user[setorItem] || 0) < setorJml) return m.reply(`❌ Kamu tidak memiliki cukup *${setorItem}* di inventory pribadimu!`);

            let sKapasitasG = ptSetor.gudangLevel * baseKapasitasGudang;
            let sSisaSlot = sKapasitasG - getGudangUsage(ptSetor.gudang);

            if (setorJml > sSisaSlot) return m.reply(`❌ Gudang Penuh! Sisa Slot: *${sSisaSlot.toLocaleString()}*`);

            user[setorItem] -= setorJml;
            ptSetor.gudang[setorItem] = (ptSetor.gudang[setorItem] || 0) + setorJml;
            m.reply(`📥 Berhasil setor ${setorJml.toLocaleString()} ${setorItem} ke Gudang *${ptSetor.name}*.`);
            break;

        // --- TARIK HASIL PRODUKSI DARI GUDANG PABRIK ---
        case 'tarik':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let tarikJml = parseInt(args[1]);
            let tarikItem = args[2] ? args[2].toLowerCase() : '';
            let ptTarikIdx = parseInt(args[3]) - 1;

            if (!tarikJml || !tarikItem || isNaN(ptTarikIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} tarik <jumlah> <nama-item> <id_pt>*`);

            let ptTarik = initCorporateData(user.perusahaan[ptTarikIdx]);
            if (!ptTarik) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if ((ptTarik.gudang[tarikItem] || 0) < tarikJml) return m.reply(`❌ Di gudang tidak ada cukup *${tarikItem}*!`);

            ptTarik.gudang[tarikItem] -= tarikJml;
            user[tarikItem] = (user[tarikItem] || 0) + tarikJml;
            m.reply(`📤 Berhasil tarik ${tarikJml.toLocaleString()} ${tarikItem} ke Inventory Pribadi.`);
            break;

        // --- REKRUT KARYAWAN ---
        case 'rekrut':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let jmlRekrut = parseInt(args[1]);
            let targetPT = parseInt(args[2]) - 1;

            if (!jmlRekrut || jmlRekrut < 1 || isNaN(targetPT)) return m.reply(`⚠️ Format: *${usedPrefix + command} rekrut <jumlah> <id_pt>*`);
            
            let rPt = initCorporateData(user.perusahaan[targetPT]);
            if (!rPt) return m.reply(`❌ ID Perusahaan tidak valid!`);

            let biayaRekrut = jmlRekrut * hargaRekrut;
            if (rPt.saldo < biayaRekrut) return m.reply(`❌ Saldo Dompet Perusahaan kurang!\nBiaya rekrut: *Rp ${biayaRekrut.toLocaleString()}*`);

            rPt.saldo -= biayaRekrut;
            rPt.karyawan += jmlRekrut;
            m.reply(`🤝 Berhasil merekrut ${jmlRekrut.toLocaleString()} Karyawan untuk *${rPt.name}*.\nBiaya Pabrik: -Rp ${biayaRekrut.toLocaleString()}`);
            break;

        // --- PRODUKSI BARANG ---
        case 'produksi':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            
            let jmlProd = parseInt(args[1]); 
            let namaItem = args[2] ? args[2].toLowerCase() : '';
            let ptIndex = parseInt(args[3]) - 1;

            if (!jmlProd || !namaItem || isNaN(ptIndex)) return m.reply(`⚠️ Format salah!\nContoh: *${usedPrefix + command} produksi 100 airmineral 1*`);

            let ptProd = initCorporateData(user.perusahaan[ptIndex]);
            if (!ptProd) return m.reply(`❌ ID Perusahaan tidak valid!`);
            
            let dataProduk = produkList[namaItem];
            if (!dataProduk) return m.reply(`❌ Item *${namaItem}* tidak valid.`);
            if (dataProduk.type !== (ptProd.type || 'minuman')) return m.reply(`❌ Pabrikmu tidak bisa memproduksi tipe ini!`);

            let maxBudgetPT = ptProd.karyawan * limitPerKaryawan;
            let totalBiayaPabrik = jmlProd * dataProduk.prodCost;
            if (totalBiayaPabrik > maxBudgetPT) return m.reply(`❌ Karyawan tidak sanggup mengelola skala produksi sebesar ini!\nMax Kapasitas Produksi: *Rp ${maxBudgetPT.toLocaleString()}*`);
            
            // Tagihan Operasional
            let wattListrik = jmlProd * 489; 
            let literAir = jmlProd * 1;      
            let tagihanListrik = jmlProd * 5000; 
            let tagihanAir = jmlProd * 11000;     
            let tagihanLogistik = Math.floor(Math.random() * (3789000 - 1165000 + 1)) + 1165000;

            let totalKeseluruhan = totalBiayaPabrik + tagihanListrik + tagihanAir + tagihanLogistik;
            if (ptProd.saldo < totalKeseluruhan) return m.reply(`❌ Saldo Dompet Perusahaan Kurang!\nTotal Tagihan Produksi: *Rp ${totalKeseluruhan.toLocaleString()}*\nSaldo PT: Rp ${ptProd.saldo.toLocaleString()}\n_Gunakan *setordana* untuk tambah kas pabrik._`);

            // Cek Bahan Baku di Gudang
            let kurangBahan = [];
            let totalBahanTerpakai = 0;
            for (let b in dataProduk.bahan) {
                let butuh = dataProduk.bahan[b] * jmlProd;
                let stokG = ptProd.gudang[b] || 0;
                totalBahanTerpakai += butuh;
                if (stokG < butuh) kurangBahan.push(`- ${b}: Butuh ${butuh.toLocaleString()}, Gudang Punya ${stokG.toLocaleString()}`);
            }
            if (kurangBahan.length > 0) return m.reply(`❌ *BAHAN BAKU DI GUDANG TIDAK CUKUP!*\n\n${kurangBahan.join('\n')}`);

            // Cek Ruang Gudang
            let kapasitasMaks = ptProd.gudangLevel * baseKapasitasGudang;
            let proyeksiIsiNanti = getGudangUsage(ptProd.gudang) - totalBahanTerpakai + jmlProd;
            if (proyeksiIsiNanti > kapasitasMaks) return m.reply(`❌ *GUDANG KEPENUHAN!* Silakan tarik barang atau *upgradegudang*.`);

            // Eksekusi Produksi (Potong Saldo Perusahaan)
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

        // --- DISTRIBUSI/JUAL KE SHOP GLOBAL (INVESTASI & DIVIDEN JALAN) ---
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

            // Jika jual dari GUDANG PABRIK (Uang masuk ke Dompet Perusahaan, dipotong investor & ditambah yield)
            if (optIdPt !== null && !isNaN(optIdPt)) {
                let ptJual = initCorporateData(user.perusahaan[optIdPt]);
                if (!ptJual) return m.reply(`❌ ID Perusahaan tidak valid!`);
                if ((ptJual.gudang[jualItem] || 0) < jualJml) return m.reply(`❌ Stok di Gudang Pabrik *${ptJual.name}* tidak cukup!`);

                ptJual.gudang[jualItem] -= jualJml;
                sumberBarang = `Gudang Pabrik (${ptJual.name})`;

                // Hitung Yield Investasi Langsung (1% - 5%)
                let yieldInvestasi = 0;
                if (ptJual.investasi > 0) {
                    let percentYield = (Math.random() * (0.05 - 0.01) + 0.01);
                    yieldInvestasi = Math.floor(ptJual.investasi * percentYield);
                }

                let totalMasuk = grossProfit + yieldInvestasi;

                // Hitung potongan Dividen untuk Publik (Jika saham player < 100%)
                let publicShare = 100 - ptJual.sahamPlayer;
                let publicCut = Math.floor(totalMasuk * (publicShare / 100));
                let netForCompany = totalMasuk - publicCut;

                ptJual.saldo += netForCompany;

                teksFinansial += `\n\n*📊 LAPORAN FINANSIAL PABRIK:*\n`;
                teksFinansial += `> Profit Penjualan: Rp ${grossProfit.toLocaleString()}\n`;
                if (yieldInvestasi > 0) teksFinansial += `> 📈 Yield Investasi Cair: +Rp ${yieldInvestasi.toLocaleString()}\n`;
                if (publicCut > 0) teksFinansial += `> 💼 Dividen Investor (${publicShare}%): -Rp ${publicCut.toLocaleString()}\n`;
                teksFinansial += `*Bersih ke Dompet PT: +Rp ${netForCompany.toLocaleString()}*`;

            } else {
                // Jual dari INVENTORY PRIBADI (Uang murni masuk ke Player)
                if ((user[prodData.db] || 0) < jualJml) return m.reply(`❌ Stok inventory tidak cukup!\n_Tip: Jika barang di pabrik, gunakan ID PT misal: *${usedPrefix + command} jual 100 tehbotol 1*_`);

                user[prodData.db] -= jualJml;
                user.money += grossProfit;
                sumberBarang = 'Inventory Pribadi';
                teksFinansial = `\n\n*Total Profit Pribadi: +Rp ${grossProfit.toLocaleString()}*`;
            }

            // RESTOCK GLOBAL MARKET
            if (!global.db.data.market[prodData.db]) global.db.data.market[prodData.db] = { stock: 100000 };
            global.db.data.market[prodData.db].stock += jualJml;

            m.reply(`🚚 *DISTRIBUSI LOGISTIK PASAR SUKSES* 🚚\n\nSumber Muatan: *${sumberBarang}*\nBarang: *${jualJml.toLocaleString()} ${prodData.name}*\nHarga Grosir: Rp ${hargaPerPcs.toLocaleString()} / pcs${teksFinansial}`);
            break;

        // --- MENU BANTUAN ---
        default:
            let help = `🏢 *SISTEM MEGA KORPORAT & FINANSIAL* 🏢\n\n`
            help += `*[ MANAJEMEN ASET ]*\n`
            help += `*${usedPrefix + command} buat <tipe> <nama>* - Bangun PT (Modal 85T)\n`
            help += `*${usedPrefix + command} info* - Cek Aset, Saham & Saldo\n`
            help += `*${usedPrefix + command} rekrut <jumlah> <id>* - Hire HRD (Pakai Saldo PT)\n`
            help += `*${usedPrefix + command} upgradegudang <id>* - Ekspansi Gudang\n\n`
            help += `*[ KEUANGAN & INVESTASI ]*\n`
            help += `*${usedPrefix + command} setordana / tarikdana <jumlah> <id>* - Transfer Pribadi ↔ PT\n`
            help += `*${usedPrefix + command} invest / tarikinvest <jumlah> <id>* - Putar saldo PT ke Reksadana\n`
            help += `*${usedPrefix + command} jualsaham / belisaham <%> <id>* - IPO / Buyback Saham\n\n`
            help += `*[ LOGISTIK PABRIK ]*\n`
            help += `*${usedPrefix + command} setor / tarik <jumlah> <item> <id>* - Bongkar muat Gudang\n`
            help += `*${usedPrefix + command} produksi <jumlah> <item> <id>* - Mulai produksi mesin pabrik\n`
            help += `*${usedPrefix + command} jual <jumlah> <item> [id_pt]* - Jual barang\n\n`
            help += `_Kendalikan kas perusahaan, putar investasi, dan jadilah taipan industri!_`
            m.reply(help);
    }
}

handler.help = ['perusahaan']
handler.tags = ['rpg']
handler.command = /^(perusahaan|company|pt)$/i

module.exports = handler;
