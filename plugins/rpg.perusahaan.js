let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    
    // Inisialisasi Database
    if (!global.db.data.market) global.db.data.market = {};
    if (!global.db.data.bursa) global.db.data.bursa = [];
    if (!global.db.data.sahamGlobal) initSahamGlobal();
    if (!Array.isArray(user.perusahaan)) user.perusahaan = [];
    
    // Bersihkan data PT yang korup
    user.perusahaan = user.perusahaan.filter(pt => pt !== null && pt !== undefined);

    let now = Date.now();

    // ==========================================
    // SISTEM PAJAK HARIAN 0.2% & AUTO REFILL LISTRIK
    // ==========================================
    user.perusahaan.forEach(pt => {
        if (!pt) return;

        // 1. Refill Listrik (Tiap 30 Menit)
        if (pt.type === 'listrik') {
            autoGenerateListrik(pt, now); 
        }

        // 2. Pajak Harian 0.2% dari Saldo PT (Tiap 24 Jam)
        if (!pt.lastTax) pt.lastTax = now;
        let daysPassed = Math.floor((now - pt.lastTax) / 86400000); // 1 Hari = 86400000 ms
        if (daysPassed >= 1) {
            let taxAmount = Math.floor((pt.saldo || 0) * 0.002 * daysPassed); // 0.2%
            if (taxAmount > 0 && pt.saldo >= taxAmount) {
                pt.saldo -= taxAmount;
            } else if (pt.saldo > 0) {
                pt.saldo = 0; // Jika pajak lebih besar dari saldo, kuras habis
            }
            pt.lastTax += daysPassed * 86400000; 
        }
    });

    let action = args[0] ? args[0].toLowerCase() : 'help';

    // ==========================================
    // PENGATURAN HARGA, KAPASITAS & DATA
    // ==========================================
    const hargaRekrut = 1500000, limitPerKaryawan = 5000000, baseKapasitasGudang = 65;
    const kapasitasPembangkit = { 'PLTU': 4000, 'PLTS': 8000, 'PLTB': 10000, 'PLTP': 20000, 'PLTA': 120000, 'PLTN': 200000 };
    const hargaListrikNegara = 14400, hargaListrikSwasta = 18600;

    const biayaInduk = 75000000; // Modal awal Perusahaan Induk: 75 Juta
    const biayaPabrik = {
        'daurulang': 30000000000000,  // 30T
        'minuman':   50000000000000,  // 50T
        'farmasi':   60000000000000,  // 60T
        'tambang':  120000000000000,  // 120T
        'senjata':  150000000000000,  // 150T
        'listrik':  165000000000000   // 165T
    };
    const tipePerusahaan = Object.keys(biayaPabrik);

    // Database Produk Pabrik
    const semuaProduk = {
        'airmineral': { type: 'minuman', name: 'Air Mineral', db: 'airmineral', prodCost: 5000, baseHargaToko: 15000 },
        'tehbotol':   { type: 'minuman', name: 'Teh Botol', db: 'tehbotol', prodCost: 8000, baseHargaToko: 20000 },
        'nescafe':    { type: 'minuman', name: 'Nescafe', db: 'nescafe', prodCost: 12000, baseHargaToko: 25000 },
        'ultramilk':  { type: 'minuman', name: 'Ultra Milk', db: 'ultramilk', prodCost: 15000, baseHargaToko: 30000 },
        'jusanggur':  { type: 'minuman', name: 'Jus Anggur', db: 'jusanggur', prodCost: 10000, baseHargaToko: 22000 },
        'jusapel':    { type: 'minuman', name: 'Jus Apel', db: 'jusapel', prodCost: 10000, baseHargaToko: 22000 },
        'jusjeruk':   { type: 'minuman', name: 'Jus Jeruk', db: 'jusjeruk', prodCost: 10000, baseHargaToko: 22000 },
        'jusmangga':  { type: 'minuman', name: 'Jus Mangga', db: 'jusmangga', prodCost: 10000, baseHargaToko: 22000 },
        'juspisang':  { type: 'minuman', name: 'Jus Pisang', db: 'juspisang', prodCost: 10000, baseHargaToko: 22000 },
        'botol':  { type: 'daurulang', name: 'Botol', db: 'botol', prodCost: 1000, baseHargaToko: 5000 },
        'kaleng': { type: 'daurulang', name: 'Kaleng', db: 'kaleng', prodCost: 1500, baseHargaToko: 6000 },
        'kardus': { type: 'daurulang', name: 'Kardus', db: 'kardus', prodCost: 800, baseHargaToko: 4000 },
        'string': { type: 'daurulang', name: 'String', db: 'string', prodCost: 500, baseHargaToko: 2000 },
        'kayu':   { type: 'daurulang', name: 'Kayu', db: 'kayu', prodCost: 3000, baseHargaToko: 10000 },
        'pasir':    { type: 'tambang', name: 'Pasir', db: 'pasir', prodCost: 3000, baseHargaToko: 220000 },
        'batu':     { type: 'tambang', name: 'Batu', db: 'batu', prodCost: 5000, baseHargaToko: 76080 },
        'coal':     { type: 'tambang', name: 'Coal', db: 'coal', prodCost: 10000, baseHargaToko: 50000 },
        'iron':     { type: 'tambang', name: 'Iron', db: 'iron', prodCost: 15000, baseHargaToko: 80000 },
        'emas':     { type: 'tambang', name: 'Emas', db: 'emas', prodCost: 500000, baseHargaToko: 2675000 },
        'uranium':  { type: 'tambang', name: 'Uranium', db: 'uranium', prodCost: 300000, baseHargaToko: 15660 },
        'berlian':  { type: 'tambang', name: 'Berlian', db: 'berlian', prodCost: 800000, baseHargaToko: 5000000 },
        'potion': { type: 'farmasi', name: 'Potion', db: 'potion', prodCost: 5000, baseHargaToko: 25000 },
        'obat':   { type: 'farmasi', name: 'Obat', db: 'obat', prodCost: 8000, baseHargaToko: 35000 },
        'sword':  { type: 'senjata', name: 'Sword', db: 'sword', prodCost: 50000, baseHargaToko: 250000 },
        'weapon': { type: 'senjata', name: 'Weapon', db: 'weapon', prodCost: 100000, baseHargaToko: 500000 }
    };

    fluktuasiHargaPasar(now); // Update market lokal dinamis

    // ==========================================
    // ROUTER AKSI (.pt <aksi>)
    // ==========================================
    switch (action) {

        case 'induk':
        case 'banguninduk': {
            if (user.holding) return m.reply(`❌ Kamu sudah memiliki Perusahaan Induk bernama *${user.holding.name}*!`);
            let namaInduk = args.slice(1).join(' ');
            if (!namaInduk) return m.reply(`⚠️ Format: *${usedPrefix + command} banguninduk <Nama Induk PT>*`);
            
            if (user.money < biayaInduk) return m.reply(`❌ Uang pribadimu kurang!\nButuh Rp ${biayaInduk.toLocaleString()} untuk membangun Perusahaan Induk.`);

            user.money -= biayaInduk;
            user.holding = { name: namaInduk, created: Date.now() };
            m.reply(`🎉 *PERUSAHAAN INDUK BERHASIL DIDIRIKAN!*\n\n🏢 Nama: *${namaInduk}*\n💰 Modal: Rp ${biayaInduk.toLocaleString()}\n\nSekarang kamu bisa mulai membangun cabang pabrik di bawah induk ini menggunakan command *${usedPrefix + command} buat*`);
            break;
        }

        case 'buat': {
            if (!user.holding) return m.reply(`❌ Kamu harus membangun Perusahaan Induk terlebih dahulu!\nKetik: *${usedPrefix + command} banguninduk <Nama PT>* (Modal: 75 Juta)`);

            let ptType = args[1] ? args[1].toLowerCase() : '';
            if (!tipePerusahaan.includes(ptType) || !args[2]) {
                let listTipe = '';
                for (let t in biayaPabrik) listTipe += `- *${t}* (Modal: ${biayaPabrik[t] / 1000000000000} T)\n`;
                return m.reply(`⚠️ *Format Salah!*\n\nTipe pabrik cabang tersedia:\n${listTipe}\nContoh: *${usedPrefix + command} buat minuman Cabang Segar*`);
            }

            let countPabrik = user.perusahaan.filter(p => p.type !== 'listrik').length;
            let countListrik = user.perusahaan.filter(p => p.type === 'listrik').length;

            if (ptType === 'listrik' && countListrik >= 1) return m.reply('❌ Perusahaan Indukmu sudah mencapai batas maksimal (1 Pembangkit Listrik)!');
            if (ptType !== 'listrik' && countPabrik >= 2) return m.reply('❌ Perusahaan Indukmu sudah mencapai batas maksimal (2 Pabrik Produksi)!');

            let namaPT, maxKapasitasListrik = 15000;
            let hargaListrikBuat = biayaPabrik[ptType];

            if (ptType === 'listrik') {
                let jenisPembangkit = args[3] ? args[3].toUpperCase() : 'PLTU';
                if (!kapasitasPembangkit[jenisPembangkit]) return m.reply(`⚠️ Pembangkit tidak valid! (Pilih: PLTU/PLTS/PLTB/PLTP/PLTA/PLTN)`);
                namaPT = args.slice(4).join(' ') + ` (${jenisPembangkit})`;
                maxKapasitasListrik = kapasitasPembangkit[jenisPembangkit];
            } else {
                namaPT = args.slice(2).join(' ');
            }

            if (user.money < hargaListrikBuat) return m.reply(`❌ Uang Pribadimu tidak cukup!\nButuh: *Rp ${hargaListrikBuat.toLocaleString()}*`);
            user.money -= hargaListrikBuat;

            let newPT = {
                id: user.perusahaan.length + 1, name: namaPT, type: ptType, 
                karyawan: 10, totalProduksi: 0, gudangLevel: 1, gudang: {}, 
                saldo: 0, lastTax: Date.now(), pemegangSaham: { [m.sender]: 100 }
            };

            if (ptType === 'listrik') {
                newPT.listrikLevel = 1; newPT.kapasitasTersedia = 900;
                newPT.generationRate = maxKapasitasListrik; newPT.sumberListrik = 'swasta';
                newPT.hargaListrikCustom = hargaListrikSwasta;
            }

            user.perusahaan.push(newPT);
            m.reply(`🎉 *CABANG PABRIK BERHASIL DIBANGUN!*\n🏭 *${namaPT}* (Tipe: ${ptType.toUpperCase()}) telah bergabung dengan Induk *${user.holding.name}*.`);
            break;
        }

        case 'info': {
            if (!args[1]) {
                if (!user.holding) return m.reply(`❌ Kamu belum memiliki Perusahaan Induk.\nKetik: *${usedPrefix + command} banguninduk <Nama PT>*`);
                let listPT = user.perusahaan.map((p, i) => `*${i + 1}.* ${p.name} (${p.type.toUpperCase()})`).join('\n') || '_Belum ada cabang pabrik_';
                return m.reply(`🏢 *PERUSAHAAN INDUK: ${user.holding.name}*\n\n*Daftar Pabrik & Pembangkit:*\n${listPT}\n\n_Ketik *${usedPrefix + command} info <id_pt>* untuk detail pabrik._`);
            }
            
            let ptId = parseInt(args[1]) - 1;
            if (isNaN(ptId) || !user.perusahaan[ptId]) return m.reply(`❌ Masukkan ID Perusahaan yang valid!`);
            
            let pt = user.perusahaan[ptId];
            let teksGudang = '';
            for (let brg in pt.gudang) { if (pt.gudang[brg] > 0) teksGudang += `🔸 ${brg}: ${pt.gudang[brg].toLocaleString()}\n`; }
            
            let pajakEsok = Math.floor((pt.saldo || 0) * 0.002);
            let infoText = `🏭 *INFO PABRIK (ID: ${ptId + 1})*\nInduk: ${user.holding ? user.holding.name : 'Unknown'}\n\n`;
            infoText += `Nama : *${pt.name}*\nTipe : *${pt.type.toUpperCase()}*\nKas PT : *Rp ${pt.saldo.toLocaleString()}*\nKaryawan : ${pt.karyawan}\n`;
            infoText += `Pajak Harian (0.2%) : -Rp ${pajakEsok.toLocaleString()}\n\n`;
            if (pt.type === 'listrik') {
                infoText += `⚡ Kapasitas Listrik: ${pt.kapasitasTersedia.toLocaleString()} W\n⚡ Tarif Jual Listrik: Rp ${pt.hargaListrikCustom || hargaListrikSwasta}/W\n\n`;
            }
            infoText += `📦 *Isi Gudang:*\n${teksGudang || '_(Kosong)_'}`;
            m.reply(infoText);
            break;
        }

        case 'beli':
        case 'buy': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki cabang pabrik sama sekali!');
            let itemBeli = args[1] ? args[1].toLowerCase() : '';
            let jmlBeli = parseInt(args[2]);
            let idPt = parseInt(args[3]) - 1;

            if (!itemBeli || isNaN(jmlBeli) || isNaN(idPt)) return m.reply(`⚠️ Format: *${usedPrefix + command} buy <item> <jumlah> <id_pt>*\nContoh: *${usedPrefix + command} buy botol 100 1*`);

            let pt = user.perusahaan[idPt];
            if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

            // Database Harga Bahan Baku & Dasar untuk .pt buy
            const hargaBahan = {
                'sampah': 1000, 'botol': 5000, 'kaleng': 6000, 'kardus': 4000, 'string': 2000, 'kayu': 10000, 
                'iron': 80000, 'susu': 15000, 'anggur': 10000, 'apel': 10000, 'jeruk': 10000, 'mangga': 10000, 
                'pisang': 10000, 'bijikopi': 12000, 'daunteh': 8000
            };

            let hargaSatuan = hargaBahan[itemBeli];
            if (!hargaSatuan) {
                if (semuaProduk[itemBeli]) hargaSatuan = semuaProduk[itemBeli].baseHargaToko;
                else return m.reply(`❌ Item *${itemBeli}* tidak tersedia atau tidak bisa dibeli untuk pabrik.`);
            }

            let totalHarga = hargaSatuan * jmlBeli;
            if (user.money < totalHarga) return m.reply(`❌ Uang pribadimu tidak cukup!\nTotal Biaya Pembelian: Rp ${totalHarga.toLocaleString()}`);

            user.money -= totalHarga;
            pt.gudang[itemBeli] = (pt.gudang[itemBeli] || 0) + jmlBeli;

            m.reply(`🛒 *PEMBELIAN BAHAN BAKU SUKSES*\nBarang: ${jmlBeli.toLocaleString()}x ${itemBeli}\nTotal Biaya: -Rp ${totalHarga.toLocaleString()}\n\n_(Barang telah langsung dimasukkan ke dalam Gudang Pabrik *${pt.name}*)_`);
            break;
        }

        case 'setor':
        case 'tarik': {
            let jumlah = parseInt(args[1]);
            let tipeAsset = args[2] ? args[2].toLowerCase() : '';
            let ptId = parseInt(args[3]) - 1;

            if (isNaN(jumlah) || !tipeAsset || isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix + command} ${action} <jumlah> <uang|item> <id_pt>*\nContoh: *${usedPrefix + command} ${action} 50 botol 1*`);
            
            let pt = user.perusahaan[ptId];
            if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

            if (action === 'setor') {
                if (tipeAsset === 'uang' || tipeAsset === 'money') {
                    if (user.money < jumlah) return m.reply('❌ Uang di dompet pribadimu kurang!');
                    user.money -= jumlah;
                    pt.saldo += jumlah;
                    m.reply(`✅ Berhasil menyetor Rp ${jumlah.toLocaleString()} ke Kas ${pt.name}.`);
                } else {
                    if ((user[tipeAsset] || 0) < jumlah) return m.reply(`❌ Kamu tidak punya ${jumlah} ${tipeAsset} di tas!`);
                    user[tipeAsset] -= jumlah;
                    pt.gudang[tipeAsset] = (pt.gudang[tipeAsset] || 0) + jumlah;
                    m.reply(`✅ Berhasil menyetor ${jumlah} ${tipeAsset} dari tas ke gudang ${pt.name}.`);
                }
            } else if (action === 'tarik') {
                if (tipeAsset === 'uang' || tipeAsset === 'money') {
                    if (pt.saldo < jumlah) return m.reply('❌ Saldo kas PT kurang untuk ditarik!');
                    pt.saldo -= jumlah;
                    user.money += jumlah;
                    m.reply(`✅ Berhasil menarik Rp ${jumlah.toLocaleString()} dari Kas ${pt.name}.`);
                } else {
                    if ((pt.gudang[tipeAsset] || 0) < jumlah) return m.reply(`❌ Barang di gudang PT tidak cukup!`);
                    pt.gudang[tipeAsset] -= jumlah;
                    user[tipeAsset] = (user[tipeAsset] || 0) + jumlah;
                    m.reply(`✅ Berhasil menarik ${jumlah} ${tipeAsset} dari gudang ${pt.name} ke tasmu.`);
                }
            }
            break;
        }

        case 'sethargalistrik': {
            let newPrice = parseInt(args[1]);
            let ptId = parseInt(args[2]) - 1;
            if (!newPrice || isNaN(newPrice) || isNaN(ptId)) return m.reply(`❌ Format: *${usedPrefix + command} sethargalistrik <harga_per_W> <id_pt>*`);
            
            let pt = user.perusahaan[ptId];
            if (!pt || pt.type !== 'listrik') return m.reply('❌ ID Perusahaan Listrik tidak valid!');
            
            pt.hargaListrikCustom = newPrice;
            m.reply(`⚡ Harga listrik untuk PT *${pt.name}* sukses diubah menjadi *Rp ${newPrice.toLocaleString()}/W*.`);
            break;
        }

        case 'produksi': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki cabang pabrik!');
            let jmlProd = parseInt(args[1]); let namaItem = args[2] ? args[2].toLowerCase() : ''; let ptIndex = parseInt(args[3]) - 1;
            if (!jmlProd || !namaItem || isNaN(ptIndex)) return m.reply(`⚠️ Format: *${usedPrefix + command} produksi <jumlah> <item> <id_pt>*`);

            let ptProd = user.perusahaan[ptIndex];
            if (!ptProd) return m.reply(`❌ ID Perusahaan tidak valid!`);

            let cdTime = ptProd.type === 'tambang' ? 13000 : 5000; 
            if (ptProd.lastProduksi && (now - ptProd.lastProduksi < cdTime)) {
                let timeLeft = ((cdTime - (now - ptProd.lastProduksi)) / 1000).toFixed(1);
                return m.reply(`⏳ *Mesin Pabrik Sedang Beroperasi!*\nTunggu ${timeLeft} detik lagi.`);
            }

            let dataProduk = semuaProduk[namaItem];
            if (!dataProduk || dataProduk.type !== ptProd.type) return m.reply(`❌ Produk tidak valid untuk tipe pabrik ini!`);

            let biayaPabrik = jmlProd * dataProduk.prodCost;
            let tagihanListrik = ptProd.type === 'tambang' ? jmlProd * 8 * hargaListrikNegara : jmlProd * 5 * hargaListrikNegara; 
            let totalBiaya = biayaPabrik + tagihanListrik;

            if (ptProd.saldo < totalBiaya) return m.reply(`❌ Saldo kas PT kurang! Butuh Rp ${totalBiaya.toLocaleString()}`);

            ptProd.saldo -= totalBiaya;
            ptProd.gudang[dataProduk.db] = (ptProd.gudang[dataProduk.db] || 0) + jmlProd;
            ptProd.lastProduksi = now; 

            m.reply(`🏭 *PRODUKSI BERHASIL*\nItem: ${dataProduk.name} (+${jmlProd})\nBiaya Operasional & Listrik: -Rp ${totalBiaya.toLocaleString()}`);
            break;
        }

        case 'jual': {
            let jumlahJual = args[1] ? args[1].toLowerCase() : '';
            if (jumlahJual === 'semua') {
                let idPt = parseInt(args[2]) - 1; 
                let pt = user.perusahaan[idPt];
                if (!pt || pt.type === 'listrik') return m.reply('❌ Gudang pabrik tidak valid!');
                
                let totalPendapatan = 0; let rincian = '';

                for (let brg in pt.gudang) {
                    let stok = pt.gudang[brg];
                    if (stok > 0) {
                        let hPasar = global.db.data.hargaPasar[brg] ? global.db.data.hargaPasar[brg].harga : semuaProduk[brg].baseHargaToko;
                        let hargaGrosir = Math.floor(hPasar * 0.75); // Mendapat 75% dari harga asli shop
                        let profit = stok * hargaGrosir;
                        
                        totalPendapatan += profit;
                        rincian += `🔸 ${stok} ${brg} (Harga Pabrik: Rp${hargaGrosir.toLocaleString()}) = Rp${profit.toLocaleString()}\n`;
                        pt.gudang[brg] = 0; 
                    }
                }
                
                if (totalPendapatan === 0) return m.reply('📦 Gudang sudah kosong!');
                pt.saldo += totalPendapatan;
                return m.reply(`🛒 *PENJUALAN GROSIR PABRIK SUKSES*\n\n🏢 *Pabrik:* ${pt.name}\n\n*Rincian:*\n${rincian}\n💰 *Kas Masuk:* Rp ${totalPendapatan.toLocaleString()}\n_(Pabrik menerima 75% dari harga pasar)_`);
            }
            break;
        }

        case 'bursa': {
            initSahamGlobal(now);
            let teksBursa = `📊 *BURSA EFEK & SAHAM GLOBAL* 📊\n\n🏢 *SAHAM P2P (Pemain)*\n`;
            if (global.db.data.bursa.length > 0) {
                global.db.data.bursa.forEach((b) => {
                    teksBursa += `*${b.id}. ${b.ptName}* | Saham: ${b.persen}%\n └ Owner: @${b.seller.split('@')[0]}\n └ Total: *Rp ${b.totalHarga.toLocaleString()}*\n ➔ *${usedPrefix + command} belisaham ${b.id}*\n\n`;
                });
            } else teksBursa += `_Belum ada player yang melisting saham._\n\n`;

            teksBursa += `📈 *SAHAM GLOBAL (Real Market)*\n`;
            for (let ticker in global.db.data.sahamGlobal) {
                let s = global.db.data.sahamGlobal[ticker];
                let ikon = s.tren > 0 ? '🟩' : (s.tren < 0 ? '🟥' : '⬛');
                teksBursa += `*${ticker}* (${s.name})\n └ Harga: Rp ${s.harga.toLocaleString()}/Lembar\n └ Tren: ${ikon} ${s.tren}%\n ➔ *${usedPrefix + command} belisaham ${ticker} <jumlah>*\n\n`;
            }
            conn.reply(m.chat, teksBursa, m, { mentions: global.db.data.bursa.map(b => b.seller) });
            break;
        }

        case 'belisaham': {
            let bsArg = args[1] ? args[1].toUpperCase() : '';
            let jmlBeli = parseInt(args[2]) || 1;
            if (!bsArg) return m.reply(`⚠️ Format P2P: *${usedPrefix + command} belisaham <id_bursa>*\n⚠️ Format Global: *${usedPrefix + command} belisaham <KODE> <jumlah>*`);
            
            initSahamGlobal(now);
            if (global.db.data.sahamGlobal[bsArg]) {
                let saham = global.db.data.sahamGlobal[bsArg];
                let biaya = saham.harga * jmlBeli;
                if (user.money < biaya) return m.reply(`❌ Uang tidak cukup! Butuh Rp ${biaya.toLocaleString()}`);
                
                user.money -= biaya;
                if (!user.portofolio) user.portofolio = {};
                user.portofolio[bsArg] = (user.portofolio[bsArg] || 0) + jmlBeli;
                return m.reply(`✅ *TRANSAKSI BERHASIL*\nBeli ${jmlBeli.toLocaleString()} saham *${bsArg}*\nTotal Biaya: Rp ${biaya.toLocaleString()}\n_(Cek via ${usedPrefix + command} porto)_`);
            }

            let bIdx = global.db.data.bursa.findIndex(v => v.id === parseInt(bsArg));
            if (bIdx === -1) return m.reply(`❌ Kode saham atau ID Bursa tidak ditemukan!`);
            
            let listingObj = global.db.data.bursa[bIdx];
            if (user.money < listingObj.totalHarga) return m.reply(`❌ Uang tidak cukup!`);
            
            let targetPtSaham = global.db.data.users[listingObj.seller].perusahaan.find(p => p.id === listingObj.ptId);
            if (!targetPtSaham) return m.reply(`❌ Perusahaan bangkrut/tidak ditemukan.`);
            
            user.money -= listingObj.totalHarga; 
            targetPtSaham.saldo += listingObj.totalHarga; 
            
            if (!targetPtSaham.pemegangSaham) targetPtSaham.pemegangSaham = {};
            targetPtSaham.pemegangSaham[m.sender] = (targetPtSaham.pemegangSaham[m.sender] || 0) + listingObj.persen;
            global.db.data.bursa.splice(bIdx, 1);
            
            m.reply(`🔔 Sukses beli ${listingObj.persen}% saham ${targetPtSaham.name} dari P2P Market!`);
            break;
        }

        case 'porto':
        case 'portofolio': {
            if (!user.portofolio) return m.reply(`💼 Kamu belum memiliki aset saham global.`);
            let teksPorto = `💼 *PORTOFOLIO SAHAM GLOBAL*\n\n`; let totalValuasi = 0;
            for (let ticker in user.portofolio) {
                let lembar = user.portofolio[ticker];
                if (lembar > 0) {
                    let hargaSkrg = global.db.data.sahamGlobal[ticker].harga;
                    totalValuasi += (lembar * hargaSkrg);
                    teksPorto += `*${ticker}*: ${lembar.toLocaleString()} lembar (Valuasi: Rp${(lembar * hargaSkrg).toLocaleString()})\n\n`;
                }
            }
            teksPorto += `💰 *Total Valuasi Aset:* Rp ${totalValuasi.toLocaleString()}`;
            m.reply(teksPorto);
            break;
        }

        default: {
            let help = `🏢 *M A N A J E M E N  P E R U S A H A A N* 🏢\n\n`;
            help += `🏛️ *PERUSAHAAN INDUK (HOLDING)*\n`;
            help += `* ${usedPrefix + command} banguninduk <nama>* - Buat Induk (Rp 75M)\n`;
            help += `* ${usedPrefix + command} info* - Cek status Perusahaan Induk\n\n`;
            
            help += `🛠️ *MANAJEMEN PABRIK CABANG*\n`;
            help += `* ${usedPrefix + command} buat <tipe> <nama>* - Bangun pabrik baru\n`;
            help += `* ${usedPrefix + command} info <id>* - Cek Detail Pabrik & Pajak\n`;
            help += `* ${usedPrefix + command} setor/tarik <jml> <uang/item> <id>*\n`;
            help += `* ${usedPrefix + command} buy <item> <jml> <id_pt>* - Beli bahan baku\n\n`;
            
            help += `⚙️ *PRODUKSI & PASAR*\n`;
            help += `* ${usedPrefix + command} produksi <jml> <item> <id_pt>*\n`;
            help += `* ${usedPrefix + command} jual semua <id_pt>* - Grosir isi gudang (Rate 75%)\n\n`;

            help += `⚡ *LISTRIK*\n`;
            help += `* ${usedPrefix + command} sethargalistrik <harga> <id_pt>*\n\n`;

            help += `📈 *SAHAM & INVESTASI*\n`;
            help += `* ${usedPrefix + command} bursa* - Cek Bursa P2P & Global Market\n`;
            help += `* ${usedPrefix + command} belisaham <id_bursa/KodeSaham> <jml>*\n`;
            help += `* ${usedPrefix + command} porto* - Cek dompet saham globalmu`;
            m.reply(help);
            break;
        }
    }

    // ==========================================
    // FUNGSI PENDUKUNG LOKAL
    // ==========================================
    function autoGenerateListrik(pt, currentTime) {
        let periods = Math.floor((currentTime - (pt.lastGenerate || currentTime)) / 1800000); // 30 Menit
        if (periods < 1) return 0;

        let maxSellable = (pt.listrikLevel || 1) * 900;
        let remaining = maxSellable - (pt.kapasitasTersedia || 0);

        if (remaining <= 0) {
            pt.lastGenerate = currentTime; return 0;
        }

        let totalGenerate = Math.min(remaining, (pt.generationRate || 15000) * periods);
        pt.kapasitasTersedia = (pt.kapasitasTersedia || 0) + totalGenerate;
        pt.lastGenerate = currentTime;
    }

    function initSahamGlobal(currentTime) {
        if (!global.db.data.sahamGlobal) {
            global.db.data.sahamGlobal = {
                'BBCA': { name: 'Bank Central Asia', harga: 8500, tren: 0, lastUpdate: currentTime || Date.now() },
                'GOTO': { name: 'GoTo Gojek Tokopedia', harga: 120, tren: 0, lastUpdate: currentTime || Date.now() },
                'AAPL': { name: 'Apple Inc.', harga: 250000, tren: 0, lastUpdate: currentTime || Date.now() },
                'TSLA': { name: 'Tesla Inc.', harga: 300000, tren: 0, lastUpdate: currentTime || Date.now() }
            };
        }
        for (let ticker in global.db.data.sahamGlobal) {
            let s = global.db.data.sahamGlobal[ticker];
            if ((currentTime || Date.now()) - s.lastUpdate > 3600000) { 
                let persentase = (Math.random() * 10 - 4.5);
                s.harga = Math.max(50, Math.floor(s.harga * (1 + (persentase / 100))));
                s.tren = parseFloat(persentase.toFixed(2));
                s.lastUpdate = currentTime || Date.now();
            }
        }
    }

    function fluktuasiHargaPasar(currentTime) {
        if (!global.db.data.hargaPasar) global.db.data.hargaPasar = {};
        for (let key in semuaProduk) {
            if (!global.db.data.hargaPasar[key]) {
                global.db.data.hargaPasar[key] = { harga: semuaProduk[key].baseHargaToko, tren: 0, lastUpdate: currentTime };
            }
            let p = global.db.data.hargaPasar[key];
            if (currentTime - (p.lastUpdate || 0) >= 3600000) { 
                let persen = (Math.random() * 0.30) - 0.15;
                p.harga = Math.floor(semuaProduk[key].baseHargaToko * (1 + persen));
                p.lastUpdate = currentTime;
            }
        }
    }
}

handler.help = ['perusahaan'];
handler.tags = ['rpg'];
handler.command = /^(perusahaan|pt)$/i;

export default handler;
