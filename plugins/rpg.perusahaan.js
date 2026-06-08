let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    
    // Pastikan database market, perusahaan, dan bursa tersedia
    if (!global.db.data.market) global.db.data.market = {};
    if (!global.db.data.bursa) global.db.data.bursa = [];
    if (!Array.isArray(user.perusahaan)) user.perusahaan = [];

    // Bersihkan array dari elemen undefined/null
    user.perusahaan = user.perusahaan.filter(pt => pt !== null && pt !== undefined);

    // Auto generate listrik untuk PT yang hidupin on (setiap command .pt)
    user.perusahaan.forEach(pt => {
        if (pt && pt.type === 'listrik') {
            initCorporateData(pt, m.sender);
            let generated = autoGenerateListrik(pt);
            if (generated > 0) {
                // Optional: kasih notif kecil kalau generate banyak
                // conn.reply(m.chat, `⚡ *${pt.name}* menghasilkan +${generated.toLocaleString()} W listrik secara otomatis!`, m).catch(() => {});
            }
        }
    });

    let action = args[0] ? args[0].toLowerCase() : 'help';

        // ==========================================
    // PENGATURAN HARGA, KAPASITAS & DATA PRODUK
    // ==========================================
    const biayaBuatMinuman = 50000000000000;  // 50 Triliun
    const biayaBuatTambang = 120000000000000; // 120 Triliun
    const biayaBuatListrik = 165000000000000; // 165 Triliun
    
    const hargaRekrut = 1500000;      
    const limitPerKaryawan = 5000000; 
    const maxLevelGudang = 2000;
    const baseKapasitasGudang = 65;
    const hargaUpgradeGudang = 1000000000;

    // === SISTEM LISTRIK & KAPASITAS (Buku) ===
    const kapasitasPembangkit = {
        'PLTU': 4000,
        'PLTS': 8000,
        'PLTB': 10000,
        'PLTP': 20000,
        'PLTA': 120000,
        'PLTN': 200000
    };
    const kapasitasListrikNegara = 15;    
    const hargaListrikNegara = 14400;     
    const hargaListrikSwasta = 18600;     
    const kapasitasListrikPerPT = 15000;  

    const tipePerusahaan = ['minuman', 'tambang', 'listrik'];

    const produkList = {
        'airmineral': { type: 'minuman', name: 'Air Mineral', db: 'airmineral', prodCost: 5000, baseHargaToko: 15000, bahan: { botol: 1 } },
        'tehbotol':   { type: 'minuman', name: 'Teh Botol', db: 'tehbotol', prodCost: 8000, baseHargaToko: 20000, bahan: { botol: 1, daunteh: 1 } },
        'nescafe':    { type: 'minuman', name: 'Nescafe', db: 'nescafe', prodCost: 12000, baseHargaToko: 25000, bahan: { kaleng: 1, bijikopi: 1 } },
        'ultramilk':  { type: 'minuman', name: 'Ultra Milk', db: 'ultramilk', prodCost: 15000, baseHargaToko: 30000, bahan: { botol: 1, susu: 1 } },
        'jusanggur':  { type: 'minuman', name: 'Jus Anggur', db: 'jusanggur', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, anggur: 2 } },
        'jusapel':    { type: 'minuman', name: 'Jus Apel', db: 'jusapel', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, apel: 2 } },
        'jusjeruk':   { type: 'minuman', name: 'Jus Jeruk', db: 'jusjeruk', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, jeruk: 2 } },
        'jusmangga':  { type: 'minuman', name: 'Jus Mangga', db: 'jusmangga', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, mangga: 2 } },
        'juspisang':  { type: 'minuman', name: 'Jus Pisang', db: 'juspisang', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, pisang: 2 } }
    };

    const produkTambang = {
        'pasir':   { type: 'tambang', name: 'Pasir', db: 'pasir', prodCost: 3000, baseHargaToko: 220000, bahan: {}, satuanProd: 'kg' },
        'batu':    { type: 'tambang', name: 'Batu', db: 'batu', prodCost: 5000, baseHargaToko: 76080, bahan: {}, satuanProd: 'kg' },
        'bijihbesi':   { type: 'tambang', name: 'Bijih Besi', db: 'bijihbesi', prodCost: 8000, baseHargaToko: 41000, bahan: {}, satuanProd: 'kg' },
        'emas':    { type: 'tambang', name: 'Emas', db: 'emas', prodCost: 500000, baseHargaToko: 2675000, bahan: {}, satuanProd: 'g' },
        'uranium': { type: 'tambang', name: 'Uranium', db: 'uranium', prodCost: 300000, baseHargaToko: 15660, bahan: {}, satuanProd: 'g' }
    };

    const semuaProduk = { ...produkList, ...produkTambang };

    // ==========================================
    // SISTEM HARGA PASAR FLUKTUATIF
    // ==========================================
    function initHargaPasar() {
        if (!global.db.data.hargaPasar) global.db.data.hargaPasar = {};
        let semua = { ...produkList, ...produkTambang };
        for (let key in semua) {
            if (!global.db.data.hargaPasar[key]) {
                global.db.data.hargaPasar[key] = {
                    harga: semua[key].baseHargaToko,
                    tren: 0,
                    lastUpdate: Date.now()
                };
            }
        }
    }

    function fluktuasiHargaPasar() {
        initHargaPasar();
        let semua = { ...produkList, ...produkTambang };
        let now = Date.now();
        for (let key in semua) {
            let p = global.db.data.hargaPasar[key];
            if (now - (p.lastUpdate || 0) < 3600000) continue;
            let baseH = semua[key].baseHargaToko;
            let persen = (Math.random() * 0.30) - 0.15;
            let hargaBaru = Math.floor(baseH * (1 + persen));
            hargaBaru = Math.max(Math.floor(baseH * 0.6), Math.min(Math.floor(baseH * 2), hargaBaru));
            p.tren = hargaBaru > p.harga ? 1 : (hargaBaru < p.harga ? -1 : 0);
            p.harga = hargaBaru;
            p.lastUpdate = now;
        }
    }

    function getHargaPasar(key) {
        fluktuasiHargaPasar();
        if (global.db.data.hargaPasar && global.db.data.hargaPasar[key]) {
            return global.db.data.hargaPasar[key].harga;
        }
        let semua = { ...produkList, ...produkTambang };
        return semua[key] ? semua[key].baseHargaToko : 0;
    }

    function getTrenIcon(key) {
        if (!global.db.data.hargaPasar || !global.db.data.hargaPasar[key]) return '➡️';
        let t = global.db.data.hargaPasar[key].tren;
        return t === 1 ? '📈' : (t === -1 ? '📉' : '➡️');
    }

    // ==========================================
    // SISTEM LISTRIK GLOBAL
    // ==========================================
    function initGridListrik() {
        if (!global.db.data.gridListrik) {
            global.db.data.gridListrik = {
                kapasitasTerpakai: 0,
                kapasitasMaks: kapasitasListrikNegara
            };
        }
    }

    function getDaftarListrikSwasta() {
        let list = [];
        for (let jid in global.db.data.users) {
            let u = global.db.data.users[jid];
            if (!Array.isArray(u.perusahaan)) continue;
            for (let pt of u.perusahaan) {
                if (pt && pt.type === 'listrik' && (pt.kapasitasTersedia || 0) > 0) {
                    list.push({ owner: jid, pt });
                }
            }
        }
        return list;
    }

    function bayarTagihanListrik(ptKonsumen, kebutuhanWatt, sumberPilihan) {
        initGridListrik();
        let grid = global.db.data.gridListrik;
        let totalBiaya = 0;
        let log = '';
        let sisaWatt = kebutuhanWatt;

        if (!sumberPilihan || sumberPilihan === 'negara') {
            let tersediaNegara = (grid.kapasitasMaks - grid.kapasitasTerpakai) * 1000;
            if (tersediaNegara > 0) {
                let ambilDariNegara = Math.min(sisaWatt, tersediaNegara);
                let biayaNegara = ambilDariNegara * hargaListrikNegara;
                totalBiaya += biayaNegara;
                grid.kapasitasTerpakai += ambilDariNegara / 1000;
                sisaWatt -= ambilDariNegara;
                log += `⚡ Listrik Negara: ${ambilDariNegara}W × Rp${hargaListrikNegara.toLocaleString()} = Rp${biayaNegara.toLocaleString()}\n`;
            } else {
                log += `⚠️ *Kapasitas listrik negara penuh!* Dialihkan ke swasta.\n`;
            }
        }

        if (sisaWatt > 0 || sumberPilihan === 'swasta') {
            if (sumberPilihan === 'swasta') sisaWatt = kebutuhanWatt;
            let listSwasta = getDaftarListrikSwasta();
            if (listSwasta.length === 0 && sisaWatt > 0) {
                return { ok: false, log: log + `❌ Tidak ada perusahaan listrik swasta tersedia!`, biaya: 0 };
            }
            for (let ls of listSwasta) {
                if (sisaWatt <= 0) break;
                let ambil = Math.min(sisaWatt, ls.pt.kapasitasTersedia);
                let biayaSwasta = ambil * hargaListrikSwasta;
                totalBiaya += biayaSwasta;
                ls.pt.kapasitasTersedia -= ambil;
                if (global.db.data.users[ls.owner]) {
                    ls.pt.saldo = (ls.pt.saldo || 0) + biayaSwasta;
                }
                sisaWatt -= ambil;
                log += `⚡ Listrik Swasta (${ls.pt.name}): ${ambil}W × Rp${hargaListrikSwasta.toLocaleString()} = Rp${biayaSwasta.toLocaleString()}\n`;
            }
            if (sisaWatt > 0) {
                return { ok: false, log: log + `❌ Kapasitas listrik tidak mencukupi! Kurang: ${sisaWatt}W`, biaya: 0 };
            }
        }

        return { ok: true, log, biaya: totalBiaya };
    }

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
        
        let modalAwal = pt.hargaAwal || (pt.type === 'listrik' ? 165000000000000 : (pt.type === 'tambang' ? 120000000000000 : 50000000000000));
        
        let baseValuasi = modalAwal + assetGudang + assetKaryawan + assetProduksi + totalCash;
        let trenMulti = pt.momentumSaham || 1.0;
        
        return Math.floor(baseValuasi * trenMulti);
    }

    function initCorporateData(pt, sender) {
        if (!pt.gudangLevel) pt.gudangLevel = 1;
        if (!pt.gudang) pt.gudang = {};
        if (typeof pt.saldo === 'undefined') pt.saldo = 0;
        if (typeof pt.investasi === 'undefined') pt.investasi = 0;
        if (typeof pt.momentumSaham === 'undefined') pt.momentumSaham = 1.0;
        if (!pt.pemegangSaham) {
            pt.pemegangSaham = {};
            let ownerSaham = typeof pt.sahamPlayer !== 'undefined' ? pt.sahamPlayer : 100;
            pt.pemegangSaham[sender] = ownerSaham;
            if (ownerSaham < 100) pt.pemegangSaham['publik'] = 100 - ownerSaham;
        }
        // Default preferensi listrik untuk PT konsumen
        if (pt.type !== 'listrik' && typeof pt.preferensiListrik === 'undefined') {
            pt.preferensiListrik = 'negara';
        }
        // Untuk PT listrik (Simple Mode):
        // - listrikLevel menentukan kapasitas jual (Level × 900 W)
        // - generationRate dari pembangkit untuk ngisi ulang setiap 1 jam
        if (pt.type === 'listrik') {
            if (typeof pt.listrikLevel === 'undefined') pt.listrikLevel = 1;
            if (typeof pt.autoGenerate === 'undefined') pt.autoGenerate = false;
            if (!pt.lastGenerate) pt.lastGenerate = Date.now();
            if (typeof pt.generationRate === 'undefined') pt.generationRate = 15000; // default kecil
        }
        return pt;
    }

    // ==========================================
    // AUTO GENERATE LISTRIK (Passive setiap 1 jam)
    // ==========================================
    function autoGenerateListrik(pt) {
        if (!pt || pt.type !== 'listrik' || !pt.autoGenerate) return 0;

        let now = Date.now();
        let hoursPassed = Math.floor((now - (pt.lastGenerate || now)) / 3600000);

        if (hoursPassed < 1) return 0;

        // Simple Mode: Kapasitas jual = Level × 900 W
        let maxSellable = (pt.listrikLevel || 1) * 900;
        let genRate = pt.generationRate || 15000; // dari pembangkit
        let currentCap = pt.kapasitasTersedia || 0;
        let remaining = maxSellable - currentCap;

        if (remaining <= 0) {
            pt.lastGenerate = now;
            return 0;
        }

        let totalGenerate = Math.min(remaining, genRate * hoursPassed);

        pt.kapasitasTersedia = currentCap + totalGenerate;
        pt.lastGenerate = now;

        return totalGenerate;
    }

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    switch (action) {
        
        case 'buat':
        case 'create': {
            if (user.perusahaan.length >= 2) return m.reply('❌ Kamu sudah mencapai batas maksimal! Hanya boleh memiliki 2 Perusahaan.');
            let ptType = args[1] ? args[1].toLowerCase() : '';
            let namaPT, sumberListrikBuat, hargaListrikBuat, maxKapasitasListrik = 15000;
            
            if (!tipePerusahaan.includes(ptType) || !args[2]) return m.reply(`⚠️ Format salah!\nTipe tersedia:\n- *minuman* (Modal: 50T)\n- *tambang* (Modal: 120T)\n- *listrik* (Modal: 165T)`);

            if (ptType === 'listrik') {
                let sumberArg = args[2] ? args[2].toLowerCase() : '';
                let jenisPembangkit = args[3] ? args[3].toUpperCase() : '';
                const listPembangkit = Object.keys(kapasitasPembangkit);

                if (sumberArg === 'negara') {
                    const batasPTNegara = 10;
                    let totalPTNegara = 0;
                    for (let jid in global.db.data.users) {
                        let u = global.db.data.users[jid];
                        if (u.perusahaan) {
                            totalPTNegara += u.perusahaan.filter(pt => pt.type === 'listrik' && pt.sumberListrik === 'negara').length;
                        }
                    }
                    if (totalPTNegara >= batasPTNegara) {
                        return m.reply(`❌ *(Kapasitas Listrik Negara Penuh)*\nSudah banyak perusahaan listrik negara terdaftar. Pilih sumber swasta!`);
                    }
                }

                if ((sumberArg === 'negara' || sumberArg === 'swasta') && listPembangkit.includes(jenisPembangkit)) {
                    sumberListrikBuat = sumberArg;
                    namaPT = args.slice(4).join(' ') + ` (${jenisPembangkit})`;
                    maxKapasitasListrik = kapasitasPembangkit[jenisPembangkit]; 
                } else {
                    return m.reply(`⚠️ Format: *${usedPrefix + command} buat listrik [negara/swasta] [PLTU/PLTS/PLTB/PLTP/PLTA/PLTN] [Nama PT]*`);
                }
                hargaListrikBuat = biayaBuatListrik;
            } else {
                namaPT = args.slice(2).join(' ');
                hargaListrikBuat = ptType === 'minuman' ? biayaBuatMinuman : biayaBuatTambang;
            }

            if (user.money < hargaListrikBuat) return m.reply(`❌ Uang Pribadimu tidak cukup!\nButuh: *Rp ${hargaListrikBuat.toLocaleString()}*`);

            user.money -= hargaListrikBuat;

            let newPT = {
                id: user.perusahaan.length + 1,
                name: namaPT,
                type: ptType, 
                karyawan: 10,
                totalProduksi: 0,
                gudangLevel: 1, 
                gudang: {},
                saldo: 0,
                investasi: 0,
                momentumSaham: 1.0,
                pemegangSaham: {},
                hargaAwal: hargaListrikBuat,
                hariNunggak: 0,
                isLocked: false 
            };

            if (ptType === 'listrik') {
                newPT.listrikLevel = 1;
                newPT.kapasitasTersedia = 900; // Kapasitas jual awal (Level 1 × 900W)
                newPT.generationRate = maxKapasitasListrik; // Besar dari pembangkit (untuk ngisi ulang)
                newPT.sumberListrik = sumberListrikBuat;
                newPT.hargaJual = hargaListrikSwasta;
            } else {
                newPT.preferensiListrik = 'negara'; // Default untuk konsumen
            }

            newPT.pemegangSaham[m.sender] = 100; 
            user.perusahaan.push(newPT);

            m.reply(`🎉 *SELAMAT!* Perusahaan *${namaPT}* resmi didirikan!\n🏭 Tipe: *${ptType.toUpperCase()}*\n💰 Modal: Rp ${hargaListrikBuat.toLocaleString()}\n\n⚡ Kapasitas Jual awal: 900 W (Level 1)\n⚡ Generation Rate: ${maxKapasitasListrik.toLocaleString()} W/jam (dari pembangkit)`);
            break;
        }
        
        case 'tambahpembangkit':
        case 'bangunpembangkit': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let jenisPembangkit = args[1] ? args[1].toUpperCase() : '';
            let targetPT = parseInt(args[2]) - 1;

            const listPembangkit = Object.keys(kapasitasPembangkit);
            
            if (!listPembangkit.includes(jenisPembangkit) || isNaN(targetPT)) {
                return m.reply(`⚠️ Format: *${usedPrefix + command} tambahpembangkit [PLTU/PLTS/PLTB/PLTP/PLTA/PLTN] [id_pt]*\n\n🏢 *Harga Pembangkit Baru:*\n- PLTU (+4k W): Rp 20 Triliun\n- PLTS (+8k W): Rp 40 Triliun\n- PLTB (+10k W): Rp 50 Triliun\n- PLTP (+20k W): Rp 100 Triliun\n- PLTA (+120k W): Rp 600 Triliun\n- PLTN (+200k W): Rp 1 Kuadriliun`);
            }

            let tPt = initCorporateData(user.perusahaan[targetPT], m.sender);
            if (!tPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (tPt.type !== 'listrik') return m.reply(`❌ Perusahaan ini bukan perusahaan listrik!`);

            let hargaBangun = kapasitasPembangkit[jenisPembangkit] * 5000000000; 

            if (user.money < hargaBangun) return m.reply(`❌ Uang Pribadimu tidak cukup untuk membangun ${jenisPembangkit}!\nButuh: *Rp ${hargaBangun.toLocaleString()}*`);

            user.money -= hargaBangun;
            // Hanya nambah generation rate (kekuatan ngisi), bukan kapasitas jual
            tPt.generationRate = (tPt.generationRate || 0) + kapasitasPembangkit[jenisPembangkit];

            if (!tPt.asetPembangkit) tPt.asetPembangkit = [];
            tPt.asetPembangkit.push(jenisPembangkit);

            m.reply(`🏗️ *PEMBANGUNAN SELESAI!*\nKamu berhasil membangun unit **${jenisPembangkit}** baru di perusahaan *${tPt.name}*!\n\n⚡ Kapasitas Maksimal Bertambah: +${kapasitasPembangkit[jenisPembangkit].toLocaleString()} W\n💰 Biaya Pembangunan: -Rp ${hargaBangun.toLocaleString()}\n\n✅ Sekarang kamu bisa jual listrik sendiri tanpa harus beli dari negara/swasta terus!`);
            break;
        }

        case 'info':
        case 'status': {
            if (user.perusahaan.length === 0) return m.reply(`⚠️ Kamu belum memiliki perusahaan.\nKetik *${usedPrefix + command} buat [tipe] [Nama]* seharga 50T/120T/165T.`);

            initGridListrik();
            let grid = global.db.data.gridListrik;
            let gridPersen = ((grid.kapasitasTerpakai / grid.kapasitasMaks) * 100).toFixed(1);
            
            let textInfo = `🏢 *ASET KORPORASI MILIKMU* 🏢\n\n`;
            textInfo += `🌐 *Grid Listrik Negara:* ${grid.kapasitasTerpakai.toFixed(2)}/${grid.kapasitasMaks} kW (${gridPersen}% terpakai)\n`;
            textInfo += `💡 Tarif Negara: Rp${hargaListrikNegara.toLocaleString()}/W | Swasta: Rp${hargaListrikSwasta.toLocaleString()}/W\n\n`;
            
            let mentionsInfo = [];
            user.perusahaan.forEach((pt, index) => {
                pt = initCorporateData(pt, m.sender);
                let nama = pt.name || `Perusahaan ${index + 1}`;
                let tipe = pt.type ? pt.type.toUpperCase() : 'MINUMAN';
                let karyawan = pt.karyawan || 0;
                let isiGudang = getGudangUsage(pt.gudang);
                let maxGudangSlot = pt.gudangLevel * baseKapasitasGudang;
                let valuasi = getValuasi(pt);
                let trenStr = pt.momentumSaham >= 1.0 ? `📈 Naik (${pt.momentumSaham.toFixed(2)}x)` : `📉 Turun (${pt.momentumSaham.toFixed(2)}x)`;

                let listSaham = [];
                for (let holder in pt.pemegangSaham) {
                    let p = pt.pemegangSaham[holder];
                    if (holder === m.sender) listSaham.push(`Owner: ${p}%`);
                    else if (holder === 'publik') listSaham.push(`Publik: ${p}%`);
                    else {
                        listSaham.push(`@${holder.split('@')[0]}: ${p}%`);
                        if (!mentionsInfo.includes(holder)) mentionsInfo.push(holder);
                    }
                }

                textInfo += `*${index + 1}. ${nama}*\n`;
                textInfo += `🏭 Tipe Pabrik: *${tipe}*\n`;
                textInfo += `👥 Karyawan: ${karyawan.toLocaleString()} Orang\n`;
                textInfo += `📦 Gudang (Lv.${pt.gudangLevel}): ${isiGudang.toLocaleString()}/${maxGudangSlot.toLocaleString()} Slot\n`;

                if (pt.type === 'listrik') {
                    let lvListrik = pt.listrikLevel || 1;
                    let sellCap = lvListrik * 900;
                    let currentCap = pt.kapasitasTersedia || 0;
                    let autoStatus = pt.autoGenerate ? '🟢 ON (auto setiap 1jam)' : '🔴 OFF';
                    let genRate = (pt.generationRate || 0).toLocaleString();
                    textInfo += `⚡ Level Listrik: ${lvListrik} (Max 2000)\n`;
                    textInfo += `⚡ Kapasitas Jual: ${currentCap.toLocaleString()} / ${sellCap.toLocaleString()} W\n`;
                    textInfo += `⚡ Generation (Refill): ${genRate} W/jam\n`;
                    textInfo += `⚡ Auto Generate: ${autoStatus}\n`;
                    textInfo += `💡 Harga Jual: Rp${(pt.hargaJual || hargaListrikSwasta).toLocaleString()}/W\n`;
                    if (pt.asetPembangkit && pt.asetPembangkit.length > 0) {
                        textInfo += `🏗️ Pembangkit: ${pt.asetPembangkit.join(', ')}\n`;
                    }
                } else {
                    textInfo += `⚡ Preferensi Listrik: *${pt.preferensiListrik || 'negara'}*\n`;
                }

                textInfo += `\n*📊 LAPORAN KEUANGAN & SAHAM:*\n`;
                textInfo += `> 💎 Valuasi PT: Rp ${valuasi.toLocaleString()}\n`;
                textInfo += `> 📊 Tren Pasar: ${trenStr}\n`;
                textInfo += `> 💼 Saham: [ ${listSaham.join(', ')} ]\n`;
                textInfo += `> 💳 Saldo Dompet: Rp ${pt.saldo.toLocaleString()}\n`;
                textInfo += `> 📈 Dana Investasi: Rp ${pt.investasi.toLocaleString()}\n\n`;
            });
            conn.reply(m.chat, textInfo, m, { mentions: mentionsInfo });
            break;
        }

        case 'resep':
        case 'produk':
        case 'list': {
            fluktuasiHargaPasar();
            let daftarProd = Object.keys(produkList).map(v => {
                let resep = Object.entries(produkList[v].bahan).map(([b, n]) => `${n} ${b}`).join(', ');
                let hp = getHargaPasar(v);
                let trenI = getTrenIcon(v);
                return `📦 *${produkList[v].name}* (ID: ${v})\n ⚙️ Biaya Prod: Rp ${produkList[v].prodCost.toLocaleString()}\n 💰 Harga Jual: ${trenI} Rp ${hp.toLocaleString()}\n 🧪 Bahan: ${resep || 'Tidak ada'}`;
            }).join('\n\n');

            let daftarTambang = Object.keys(produkTambang).map(v => {
                let hp = getHargaPasar(v);
                let trenI = getTrenIcon(v);
                return `⛏️ *${produkTambang[v].name}* (ID: ${v})\n ⚙️ Biaya Tambang: Rp ${produkTambang[v].prodCost.toLocaleString()}\n 💰 Harga Pasar: ${trenI} Rp ${hp.toLocaleString()}/${produkTambang[v].satuanProd}`;
            }).join('\n\n');

            initGridListrik();
            let grid = global.db.data.gridListrik;
            let infoListrik = `\n\n⚡ *INFO LISTRIK*\n`;
            infoListrik += `> Grid Negara: ${grid.kapasitasTerpakai.toFixed(2)}/${grid.kapasitasMaks} kW\n`;
            infoListrik += `> Tarif Negara: Rp${hargaListrikNegara.toLocaleString()}/W\n`;
            infoListrik += `> Tarif Swasta: Rp${hargaListrikSwasta.toLocaleString()}/W\n`;
            infoListrik += `> Kapasitas PT Listrik: ${kapasitasListrikPerPT.toLocaleString()} W per perusahaan`;

            m.reply(`📋 *BUKU HARGA PASAR* 📋\n_Note: Harga berubah setiap jam mengikuti kondisi pasar!_\n\n🥤 *PRODUK MINUMAN:*\n${daftarProd}\n\n⛏️ *PRODUK TAMBANG:*\n${daftarTambang}${infoListrik}`);
            break;
        }

        case 'setordana': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let sJumlah = parseInt(args[1]);
            let sPtIdx = parseInt(args[2]) - 1;
            if (!sJumlah || isNaN(sPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} setordana <jumlah> <id_pt>*`);
            
            let sPt = initCorporateData(user.perusahaan[sPtIdx], m.sender);
            if (!sPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (user.money < sJumlah) return m.reply(`❌ Uang Pribadimu kurang!`);

            user.money -= sJumlah;
            sPt.saldo += sJumlah;
            m.reply(`💳 Rp ${sJumlah.toLocaleString()} disetor ke Dompet Perusahaan *${sPt.name}*.`);
            break;
        }

        case 'tarikdana': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let tJumlah = parseInt(args[1]);
            let tPtIdx = parseInt(args[2]) - 1;
            if (!tJumlah || isNaN(tPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} tarikdana <jumlah> <id_pt>*`);
            
            let tPt = initCorporateData(user.perusahaan[tPtIdx], m.sender);
            if (!tPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (tPt.saldo < tJumlah) return m.reply(`❌ Saldo Perusahaan tidak cukup!`);

            tPt.saldo -= tJumlah;
            user.money += tJumlah;
            m.reply(`💳 Rp ${tJumlah.toLocaleString()} ditarik dari *${tPt.name}*.`);
            break;
        }
        
        case 'setharga': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let hargaBaru = parseInt(args[1]);
            let ptIdx = parseInt(args[2]) - 1;
            
            if (!hargaBaru || isNaN(ptIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} setharga <harga> <id_pt>*\nContoh: *${usedPrefix + command} setharga 19000 1*`);
            
            let targetPt = user.perusahaan[ptIdx];
            if (!targetPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (targetPt.type !== 'listrik' || targetPt.sumberListrik !== 'swasta') {
                return m.reply(`❌ Hanya untuk Perusahaan Listrik Swasta!`);
            }
            if (hargaBaru > 20700) return m.reply(`❌ Harga maksimal listrik swasta adalah *Rp 20,700 / Watt*.`);
            if (hargaBaru < 1000) return m.reply(`❌ Harga minimal Rp 1,000 / Watt agar tidak merugi.`);

            targetPt.hargaJual = hargaBaru;
            m.reply(`✅ Harga listrik perusahaan *${targetPt.name}* menjadi *Rp ${hargaBaru.toLocaleString()} / Watt*.`);
            break;
        }

        case 'pajak': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let teksPajak = `🏛️ *LAPORAN PAJAK PERUSAHAAN (0.1%)* 🏛️\n\n`;
            user.perusahaan.forEach((pt, index) => {
                let pajakPT = Math.floor(pt.saldo * 0.001);
                teksPajak += `🏢 *${index + 1}. ${pt.name}*\n ├ Saldo Kas: Rp ${pt.saldo.toLocaleString()}\n ├ 💸 Estimasi Pajak Harian: Rp ${pajakPT.toLocaleString()}\n`;
                teksPajak += ` └ 📊 Status: ${pt.isLocked ? `🔒 *DIKUNCI (Nunggak ${pt.hariNunggak} hari)*` : '✅ Aktif Beroperasi'}\n\n`;
            });
            m.reply(teksPajak);
            break;
        }

        case 'investasi':
        case 'invest': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let iJumlah = parseInt(args[1]);
            let iPtIdx = parseInt(args[2]) - 1;
            if (!iJumlah || isNaN(iPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} investasi <jumlah> <id_pt>*`);
            
            let iPt = initCorporateData(user.perusahaan[iPtIdx], m.sender);
            if (!iPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (iPt.saldo < iJumlah) return m.reply(`❌ Saldo Dompet kurang!`);

            iPt.saldo -= iJumlah;
            iPt.investasi += iJumlah;
            m.reply(`📈 Total Investasi PT sekarang: Rp ${iPt.investasi.toLocaleString()}`);
            break;
        }

        case 'tarikinvest':
        case 'tarikinvestasi': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let tiJumlah = parseInt(args[1]);
            let tiPtIdx = parseInt(args[2]) - 1;
            if (!tiJumlah || isNaN(tiPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} tarikinvest <jumlah> <id_pt>*`);
            
            let tiPt = initCorporateData(user.perusahaan[tiPtIdx], m.sender);
            if (!tiPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (tiPt.investasi < tiJumlah) return m.reply(`❌ Dana investasi tidak cukup!`);

            tiPt.investasi -= tiJumlah;
            tiPt.saldo += tiJumlah;
            m.reply(`📉 Rp ${tiJumlah.toLocaleString()} ditarik dari investasi ke Dompet PT.`);
            break;
        }

        case 'jualsaham': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let jsPersen = parseInt(args[1]);
            let jsPtIdx = parseInt(args[2]) - 1;
            if (!jsPersen || isNaN(jsPtIdx) || jsPersen <= 0 || jsPersen > 100) return m.reply(`⚠️ Format: *${usedPrefix + command} jualsaham <persentase_lembar> <id_pt>*`);
            
            let jsPt = initCorporateData(user.perusahaan[jsPtIdx], m.sender);
            if (!jsPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            
            let currentOwned = jsPt.pemegangSaham[m.sender] || 0;
            if (currentOwned < jsPersen) return m.reply(`❌ Kamu hanya memiliki ${currentOwned}% saham.`);

            let valuasiSekarang = getValuasi(jsPt);
            let hargaPerPersen = Math.floor(valuasiSekarang / 100);
            let totalHargaListing = hargaPerPersen * jsPersen;

            jsPt.pemegangSaham[m.sender] -= jsPersen;
            if (jsPt.pemegangSaham[m.sender] === 0) delete jsPt.pemegangSaham[m.sender];

            global.db.data.bursa.push({
                id: global.db.data.bursa.length + 1,
                seller: m.sender,
                ptId: jsPt.id,
                ptName: jsPt.name,
                persen: jsPersen,
                hargaPerPersen: hargaPerPersen,
                totalHarga: totalHargaListing
            });

            m.reply(`📊 *LISTING SAHAM BERHASIL*\nSaham ${jsPersen}% dipajang di bursa seharga Rp ${totalHargaListing.toLocaleString()}!`);
            break;
        }

        case 'bursa': {
            if (global.db.data.bursa.length === 0) return m.reply('📊 Saat ini belum ada saham di bursa.');
            let teksBursa = `📊 *BURSA EFEK GLOBAL P2P* 📊\n\n`;
            let bursaMentions = [];
            global.db.data.bursa.forEach((b) => {
                if (!bursaMentions.includes(b.seller)) bursaMentions.push(b.seller);
                teksBursa += `*${b.id}. ${b.ptName}*\n └ Owner: @${b.seller.split('@')[0]}\n └ Saham: ${b.persen}%\n └ Total: *Rp ${b.totalHarga.toLocaleString()}*\n ➔ *${usedPrefix + command} belisaham ${b.id}*\n\n`;
            });
            conn.reply(m.chat, teksBursa, m, { mentions: bursaMentions });
            break;
        }

        case 'belisaham': {
            let bsId = parseInt(args[1]);
            if (!bsId) return m.reply(`⚠️ Format: *${usedPrefix + command} belisaham <id_bursa>*`);
            
            let bIdx = global.db.data.bursa.findIndex(v => v.id === bsId);
            if (bIdx === -1) return m.reply(`❌ ID Bursa tidak ditemukan!`);
            let listingObj = global.db.data.bursa[bIdx];
            
            if (user.money < listingObj.totalHarga) return m.reply(`❌ Uang tidak cukup! Butuh Rp ${listingObj.totalHarga.toLocaleString()}`);
            
            let sellerData = global.db.data.users[listingObj.seller];
            let targetPtSaham = sellerData.perusahaan.find(p => p.id === listingObj.ptId);
            if (!targetPtSaham) return m.reply(`❌ Perusahaan bangkrut/tidak ditemukan.`);
            
            user.money -= listingObj.totalHarga; 
            targetPtSaham.saldo += listingObj.totalHarga; 
            
            if (!targetPtSaham.pemegangSaham) targetPtSaham.pemegangSaham = {};
            targetPtSaham.pemegangSaham[m.sender] = (targetPtSaham.pemegangSaham[m.sender] || 0) + listingObj.persen;
            global.db.data.bursa.splice(bIdx, 1);
            
            conn.reply(m.chat, `🔔 @${m.sender.split('@')[0]} sukses beli ${listingObj.persen}% saham ${targetPtSaham.name}!`, m, { mentions: [m.sender] });
            break;
        }

        case 'batalsaham':
        case 'tariklisting': {
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
        }

        case 'buyback': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let bbPersen = parseInt(args[1]);
            let bbPtIdx = parseInt(args[2]) - 1;
            let targetJid = args[3]; 
            
            if (!bbPersen || isNaN(bbPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} buyback <%> <id_pt> [tag]*`);
            
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
            if (availSaham < bbPersen) return m.reply(`❌ Saham milik target tidak cukup!`);
            
            let valuasiBb = getValuasi(bbPt);
            let biayaBuyback = Math.floor(valuasiBb * (bbPersen / 100));

            if (bbPt.saldo < biayaBuyback) return m.reply(`❌ Saldo PT tidak cukup untuk Buyback!`);

            bbPt.saldo -= biayaBuyback;
            bbPt.pemegangSaham[bTarget] -= bbPersen;
            if (bbPt.pemegangSaham[bTarget] === 0) delete bbPt.pemegangSaham[bTarget];
            
            bbPt.pemegangSaham[m.sender] = (bbPt.pemegangSaham[m.sender] || 0) + bbPersen;
            
            if (bTarget !== 'publik' && global.db.data.users[bTarget]) {
                global.db.data.users[bTarget].money += biayaBuyback;
                conn.reply(bTarget, `💸 *BUYBACK!* Sahammu dibeli owner seharga Rp ${biayaBuyback.toLocaleString()}`, null);
            }
            m.reply(`🤝 *BUYBACK SUKSES* Biaya: -Rp ${biayaBuyback.toLocaleString()}`);
            break;
        }

        case 'upgradegudang': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let upPtIdx = parseInt(args[1]) - 1;
            if (isNaN(upPtIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} upgradegudang <id_pt>*`);
            
            let upPt = initCorporateData(user.perusahaan[upPtIdx], m.sender);
            if (!upPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (upPt.gudangLevel >= maxLevelGudang) return m.reply(`❌ Gudang sudah Maksimal!`);
            
            let biayaUpGudang = upPt.gudangLevel * hargaUpgradeGudang;
            if (upPt.saldo < biayaUpGudang) return m.reply(`❌ Saldo PT Kurang!`);

            upPt.saldo -= biayaUpGudang;
            upPt.gudangLevel += 1;
            m.reply(`🏗️ Gudang naik ke Lv.${upPt.gudangLevel}! Biaya: -Rp ${biayaUpGudang.toLocaleString()}`);
            break;
        }

        // === UPGRADE KAPASITAS LISTRIK UNTUK PT LISTRIK ===
        case 'upgradelistrik':
        case 'upgradecapacity': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let upIdx = parseInt(args[1]) - 1;
            if (isNaN(upIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} upgradelistrik <id_pt>*`);

            let upPt = initCorporateData(user.perusahaan[upIdx], m.sender);
            if (!upPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (upPt.type !== 'listrik') return m.reply(`❌ Hanya untuk Perusahaan Listrik!`);

            let currentLevel = upPt.listrikLevel || 1;
            if (currentLevel >= 2000) return m.reply(`❌ Level Listrik sudah maksimal (2000)!`);

            let biayaUpgrade = currentLevel * 1000000; // Rp 1 juta per level
            if (upPt.saldo < biayaUpgrade) return m.reply(`❌ Saldo PT tidak cukup!\nButuh: Rp ${biayaUpgrade.toLocaleString()}`);

            upPt.saldo -= biayaUpgrade;
            upPt.listrikLevel = currentLevel + 1;

            // Upgrade nambah kapasitas jual (+900W per level)
            // Kapasitas jual = Level × 900 W
            let newCap = upPt.listrikLevel * 900;
            upPt.kapasitasTersedia = Math.min(upPt.kapasitasTersedia || 0, newCap);

            m.reply(`⚡ *UPGRADE LISTRIK BERHASIL!*\nPerusahaan *${upPt.name}* naik ke Level Listrik **${upPt.listrikLevel}**\n\nKapasitas Jual: ${newCap.toLocaleString()} W\nBiaya: -Rp ${biayaUpgrade.toLocaleString()}\n\n✅ Pembangkit tetap ngisi ulang setiap 1 jam sesuai generation ratenya.`);
            break;
        }

        // === GANTI PREFERENSI LISTRIK ===
        case 'gantilistrik':
        case 'ganti': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let glPtIdx = parseInt(args[1]) - 1;
            let glSumber = args[2] ? args[2].toLowerCase() : '';

            if (isNaN(glPtIdx) || !['negara', 'swasta'].includes(glSumber)) {
                return m.reply(`⚠️ Format: *${usedPrefix + command} gantilistrik <id_pt> <negara|swasta>*\nContoh: *.pt gantilistrik 1 swasta*`);
            }

            let glPt = initCorporateData(user.perusahaan[glPtIdx], m.sender);
            if (!glPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (glPt.type === 'listrik') return m.reply(`❌ Perusahaan Listrik tidak perlu ganti preferensi (mereka produsen).`);

            glPt.preferensiListrik = glSumber;
            m.reply(`✅ Preferensi listrik untuk PT *${glPt.name}* berhasil diubah ke **${glSumber.toUpperCase()}**!\n\nSekarang saat produksi, akan otomatis pakai sumber ini (kecuali kamu override di command).`);
            break;
        }

        // === HIDUPIN AUTO GENERATE LISTRIK ===
        case 'hidupin': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let onoff = args[1] ? args[1].toLowerCase() : '';
            let ptIdx = parseInt(args[2]) - 1;

            if (!['on', 'off'].includes(onoff) || isNaN(ptIdx)) {
                return m.reply(`⚠️ Format: *${usedPrefix + command} hidupin <on|off> <id_pt>*\nContoh: *.pt hidupin on 1*`);
            }

            let hPt = initCorporateData(user.perusahaan[ptIdx], m.sender);
            if (!hPt) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (hPt.type !== 'listrik') return m.reply(`❌ Hanya untuk Perusahaan Listrik!`);

            if (onoff === 'on') {
                hPt.autoGenerate = true;
                m.reply(`✅ *AUTO GENERATE LISTRIK DIHIDUPKAN!*\nPerusahaan *${hPt.name}* sekarang akan otomatis menghasilkan listrik setiap 1 jam (sesuai kapasitas pembangkit).\n\nGunakan *.pt info* untuk cek.`);
            } else {
                hPt.autoGenerate = false;
                m.reply(`🔴 *AUTO GENERATE LISTRIK DIMATIKAN.*\nPerusahaan *${hPt.name}* tidak lagi generate otomatis.`);
            }
            break;
        }

        case 'setor': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let setorJml = parseInt(args[1]);
            let setorItem = args[2] ? args[2].toLowerCase() : '';
            let ptSetorIdx = parseInt(args[3]) - 1;

            if (!setorJml || !setorItem || isNaN(ptSetorIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} setor <jumlah> <item> <id_pt>*`);

            let ptSetor = initCorporateData(user.perusahaan[ptSetorIdx], m.sender);
            if (!ptSetor) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if ((user[setorItem] || 0) < setorJml) return m.reply(`❌ Inventory pribadimu tidak cukup!`);

            let sSisaSlot = (ptSetor.gudangLevel * baseKapasitasGudang) - getGudangUsage(ptSetor.gudang);
            if (setorJml > sSisaSlot) return m.reply(`❌ Gudang Penuh! Sisa: ${sSisaSlot}`);

            user[setorItem] -= setorJml;
            ptSetor.gudang[setorItem] = (ptSetor.gudang[setorItem] || 0) + setorJml;
            m.reply(`📥 Berhasil setor ${setorJml.toLocaleString()} ${setorItem}`);
            break;
        }

        case 'tarik': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let tarikJml = parseInt(args[1]);
            let tarikItem = args[2] ? args[2].toLowerCase() : '';
            let ptTarikIdx = parseInt(args[3]) - 1;

            if (!tarikJml || !tarikItem || isNaN(ptTarikIdx)) return m.reply(`⚠️ Format: *${usedPrefix + command} tarik <jumlah> <item> <id_pt>*`);

            let ptTarik = initCorporateData(user.perusahaan[ptTarikIdx], m.sender);
            if (!ptTarik) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if ((ptTarik.gudang[tarikItem] || 0) < tarikJml) return m.reply(`❌ Stok di gudang tidak cukup!`);

            ptTarik.gudang[tarikItem] -= tarikJml;
            user[tarikItem] = (user[tarikItem] || 0) + tarikJml;
            m.reply(`📤 Berhasil tarik ${tarikJml.toLocaleString()} ${tarikItem}`);
            break;
        }

        case 'rekrut': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let jmlRekrut = parseInt(args[1]);
            let targetPT = parseInt(args[2]) - 1;

            if (!jmlRekrut || isNaN(targetPT)) return m.reply(`⚠️ Format: *${usedPrefix + command} rekrut <jumlah> <id_pt>*`);
            
            let rPt = initCorporateData(user.perusahaan[targetPT], m.sender);
            if (!rPt) return m.reply(`❌ ID Perusahaan tidak valid!`);

            let biayaRekrut = jmlRekrut * hargaRekrut;
            if (rPt.saldo < biayaRekrut) return m.reply(`❌ Saldo PT kurang!`);

            rPt.saldo -= biayaRekrut;
            rPt.karyawan += jmlRekrut;
            m.reply(`🤝 Berhasil rekrut ${jmlRekrut} Karyawan. Biaya: -Rp ${biayaRekrut.toLocaleString()}`);
            break;
        }

        // --- PRODUKSI ---
        case 'produksi': {
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            let jmlProd = parseInt(args[1]); 
            let namaItem = args[2] ? args[2].toLowerCase() : '';
            let ptIndex = parseInt(args[3]) - 1;
            let sumberListrikProd = args[4] ? args[4].toLowerCase() : null;

            if (!jmlProd || !namaItem || isNaN(ptIndex)) return m.reply(`⚠️ Format salah!\nContoh: *${usedPrefix + command} produksi 100 airmineral 1 [negara/swasta]*`);

            let ptProd = initCorporateData(user.perusahaan[ptIndex], m.sender);
            if (!ptProd) return m.reply(`❌ ID Perusahaan tidak valid!`);
            
            if (ptProd.type === 'listrik') {
                let kapMaks = ptProd.kapasitasMaks || kapasitasListrikPerPT;
                let kapSaatIni = ptProd.kapasitasTersedia || 0;
                let sisaKap = kapMaks - kapSaatIni;
                if (sisaKap <= 0) return m.reply(`❌ Kapasitas listrik sudah penuh! (${kapMaks.toLocaleString()} W)`);
                let isiWatt = Math.min(jmlProd, sisaKap);
                let biayaIsi = isiWatt * 1000;
                if (ptProd.saldo < biayaIsi) return m.reply(`❌ Saldo PT kurang!\nBiaya isi ${isiWatt}W: Rp${biayaIsi.toLocaleString()}`);
                ptProd.saldo -= biayaIsi;
                ptProd.kapasitasTersedia = kapSaatIni + isiWatt;
                return m.reply(`⚡ *KAPASITAS LISTRIK DIISI*\n+${isiWatt.toLocaleString()} W\nKapasitas: ${ptProd.kapasitasTersedia.toLocaleString()}/${kapMaks.toLocaleString()} W\nBiaya Maintenance: -Rp${biayaIsi.toLocaleString()}`);
            }

            let dataProduk = semuaProduk[namaItem];
            if (!dataProduk) return m.reply(`❌ Item tidak valid. Cek *${usedPrefix + command} resep*`);
            if (dataProduk.type !== (ptProd.type || 'minuman')) return m.reply(`❌ Pabrikmu (${ptProd.type}) tidak bisa memproduksi item tipe ${dataProduk.type}!`);

            let maxBudgetPT = ptProd.karyawan * limitPerKaryawan;
            let totalBiayaPabrik = jmlProd * dataProduk.prodCost;
            if (totalBiayaPabrik > maxBudgetPT) return m.reply(`❌ Karyawan tidak sanggup mengelola produksi sebesar ini!`);
            
            let kebutuhanWattProd = ptProd.type === 'tambang' ? jmlProd * 8 : jmlProd * 5;
            initGridListrik();
            let grid = global.db.data.gridListrik;
            let tersediaNegara = (grid.kapasitasMaks - grid.kapasitasTerpakai) * 1000;
            
            // Gunakan preferensi PT jika tidak di-override di command
            if (!sumberListrikProd) {
                sumberListrikProd = ptProd.preferensiListrik || (tersediaNegara >= kebutuhanWattProd ? 'negara' : 'swasta');
            }

            let hasilListrik = bayarTagihanListrik(ptProd, kebutuhanWattProd, sumberListrikProd);
            if (!hasilListrik.ok) return m.reply(`❌ *Produksi Gagal!*\n${hasilListrik.log}`);

            let tagihanListrik = hasilListrik.biaya;
            let tagihanAir = ptProd.type === 'tambang' ? 0 : jmlProd * 11000;

            let totalKeseluruhan = totalBiayaPabrik + tagihanListrik + tagihanAir;
            if (ptProd.saldo < totalKeseluruhan) return m.reply(`❌ Saldo PT Kurang! Butuh: Rp ${totalKeseluruhan.toLocaleString()}`);

            if (dataProduk.bahan && Object.keys(dataProduk.bahan).length > 0) {
                let kurangBahan = [];
                for (let b in dataProduk.bahan) {
                    let butuh = dataProduk.bahan[b] * jmlProd;
                    let stokG = ptProd.gudang[b] || 0;
                    if (stokG < butuh) kurangBahan.push(`- ${b}: Butuh ${butuh}, Punya ${stokG}`);
                }
                if (kurangBahan.length > 0) return m.reply(`❌ *BAHAN BAKU DI GUDANG KURANG!*\n${kurangBahan.join('\n')}`);

                let proyeksiIsi = getGudangUsage(ptProd.gudang) - Object.keys(dataProduk.bahan).reduce((a, b) => a + dataProduk.bahan[b] * jmlProd, 0) + jmlProd;
                if (proyeksiIsi > (ptProd.gudangLevel * baseKapasitasGudang)) return m.reply(`❌ *GUDANG KEPENUHAN!*`);
            } else {
                let proyeksiIsi = getGudangUsage(ptProd.gudang) + jmlProd;
                if (proyeksiIsi > (ptProd.gudangLevel * baseKapasitasGudang)) return m.reply(`❌ *GUDANG KEPENUHAN!*`);
            }

            ptProd.saldo -= totalKeseluruhan;
            let logBahanTeks = '';
            if (dataProduk.bahan) {
                for (let b in dataProduk.bahan) {
                    let potong = dataProduk.bahan[b] * jmlProd;
                    ptProd.gudang[b] -= potong;
                    logBahanTeks += `> ${b}: -${potong.toLocaleString()} (Gudang)\n`;
                }
            }

            ptProd.gudang[dataProduk.db] = (ptProd.gudang[dataProduk.db] || 0) + jmlProd;
            ptProd.totalProduksi += jmlProd;

            if (global.db.data.hargaPasar && global.db.data.hargaPasar[namaItem]) {
                let hp = global.db.data.hargaPasar[namaItem];
                let basH = dataProduk.baseHargaToko;
                if (jmlProd > 500) {
                    hp.harga = Math.max(Math.floor(basH * 0.6), Math.floor(hp.harga * 0.97));
                    hp.tren = -1;
                }
            }

            let ikonTipe = ptProd.type === 'tambang' ? '⛏️' : '🏭';
            let strukProduksi = `${ikonTipe} *PRODUKSI SELESAI* ${ikonTipe}\n\nItem: *${dataProduk.name}*\nHasil: *+${jmlProd.toLocaleString()} ${dataProduk.satuanProd || 'Pcs'}*\n\n*🧾 KAS PABRIK KELUAR:*\n`;
            strukProduksi += `> ⚙️ Biaya Produksi: -Rp ${totalBiayaPabrik.toLocaleString()}\n`;
            strukProduksi += `> ⚡ Listrik (${sumberListrikProd}): -Rp ${tagihanListrik.toLocaleString()}\n`;
            if (tagihanAir > 0) strukProduksi += `> 💧 Air PDAM: -Rp ${tagihanAir.toLocaleString()}\n`;
            strukProduksi += `*Total Kas Terpotong: -Rp ${totalKeseluruhan.toLocaleString()}*\n`;
            if (logBahanTeks) strukProduksi += `\n*📦 PEMAKAIAN BAHAN BAKU:*\n${logBahanTeks}`;
            strukProduksi += `\n💡 *Detail Listrik:*\n${hasilListrik.log}`;
            m.reply(strukProduksi);
            break;
        }

        // --- JUAL / DISTRIBUSI ---
        case 'jual':
        case 'distribusi': {
            let jualJml = parseInt(args[1]);
            let jualItem = args[2] ? args[2].toLowerCase() : '';
            let optIdPt = args[3] ? parseInt(args[3]) - 1 : null; 

            // JUAL SEMUA
            if (jualItem === 'semua' && optIdPt !== null && !isNaN(optIdPt)) {
                let ptJualAll = initCorporateData(user.perusahaan[optIdPt], m.sender);
                if (!ptJualAll) return m.reply(`❌ ID Perusahaan tidak valid!`);
                if (ptJualAll.isLocked) {
                    return m.reply(`🔒 *PERUSAHAAN DIKUNCI!*\nPerusahaan *${ptJualAll.name}* sedang dibekukan oleh negara karena menunggak pajak selama 3 hari berturut-turut. Segera isi saldo kas PT lewat *.perusahaan setordana* agar sistem bisa memotong pajak kembali!`);
                }

                let gudangItems = Object.keys(ptJualAll.gudang).filter(k => (ptJualAll.gudang[k] || 0) > 0 && semuaProduk[k]);
                if (gudangItems.length === 0) return m.reply(`❌ Tidak ada produk di gudang perusahaan ini untuk dijual.`);

                let totalProfitAll = 0;
                let totalLogistikAll = 0;
                let detailJual = '';
                let mentionsAll = [];

                for (let itemKey of gudangItems) {
                    let prodData = semuaProduk[itemKey];
                    let stockItem = ptJualAll.gudang[itemKey];
                    let hargaPasarSaatIni = getHargaPasar(itemKey);
                    let hargaPerPcs = Math.floor(hargaPasarSaatIni * 0.85);
                    let gross = hargaPerPcs * stockItem;
                    let trenIcon = getTrenIcon(itemKey);

                    let tagihanLogistikItem = Math.floor(Math.random() * (3789000 - 1165000 + 1)) + 1165000;
                    if (ptJualAll.saldo < tagihanLogistikItem) {
                        detailJual += `⚠️ Skip ${prodData.name}: Saldo tidak cukup untuk logistik.\n`;
                        continue;
                    }
                    ptJualAll.saldo -= tagihanLogistikItem;
                    totalLogistikAll += tagihanLogistikItem;

                    ptJualAll.gudang[itemKey] = 0;

                    let yieldInvestasi = 0;
                    if (ptJualAll.investasi > 0) {
                        let percentYield = (Math.random() * (0.05 - 0.01) + 0.01);
                        yieldInvestasi = Math.floor(ptJualAll.investasi * percentYield);
                    }

                    let totalMasukItem = gross + yieldInvestasi;
                    totalProfitAll += totalMasukItem;

                    let batasProfitIdeal = ptJualAll.karyawan * 15000; 
                    if (totalMasukItem >= batasProfitIdeal) {
                        ptJualAll.momentumSaham = Math.min(5.0, ptJualAll.momentumSaham + 0.01);
                    } else {
                        ptJualAll.momentumSaham = Math.max(0.2, ptJualAll.momentumSaham - 0.005);
                    }

                    if (global.db.data.hargaPasar && global.db.data.hargaPasar[itemKey]) {
                        let hp = global.db.data.hargaPasar[itemKey];
                        if (stockItem > 200) {
                            hp.harga = Math.max(Math.floor(prodData.baseHargaToko * 0.6), Math.floor(hp.harga * 0.98));
                            hp.tren = -1;
                        }
                    }

                    detailJual += `• ${prodData.name} x${stockItem.toLocaleString()}: ${trenIcon} Rp${hargaPerPcs.toLocaleString()}/pcs → +Rp ${gross.toLocaleString()}\n`;
                }

                let totalDividenKeluarAll = 0;
                let teksDividenLogAll = '';
                for (let shareholder in ptJualAll.pemegangSaham) {
                    let persenSaham = ptJualAll.pemegangSaham[shareholder];
                    if (shareholder === m.sender) continue;
                    else if (shareholder === 'publik') {
                        let bagianPublik = Math.floor(totalProfitAll * (persenSaham / 100));
                        totalDividenKeluarAll += bagianPublik;
                        teksDividenLogAll += `> 🏛️ Publik (${persenSaham}%): -Rp ${bagianPublik.toLocaleString()}\n`;
                    } else {
                        let profitAktifPersen = persenSaham * 0.8; 
                        let bagianDividen = Math.floor(totalProfitAll * (profitAktifPersen / 100));
                        if (global.db.data.users[shareholder]) {
                            global.db.data.users[shareholder].money += bagianDividen;
                            totalDividenKeluarAll += bagianDividen;
                            teksDividenLogAll += `> 👤 @${shareholder.split('@')[0]}: +Rp ${bagianDividen.toLocaleString()}\n`;
                            if (!mentionsAll.includes(shareholder)) mentionsAll.push(shareholder);
                        }
                    }
                }

                let bagianOwnerAll = totalProfitAll - totalDividenKeluarAll;
                ptJualAll.saldo += bagianOwnerAll;

                let finalReply = `🚚 *JUAL SEMUA SUKSES* 🚚\n\nDari Gudang: *${ptJualAll.name}*\n\n${detailJual}\n`;
                finalReply += `> Total Gross Profit: Rp ${totalProfitAll.toLocaleString()}\n`;
                finalReply += `> Total Biaya Logistik: -Rp ${totalLogistikAll.toLocaleString()}\n`;
                finalReply += `> Kas Masuk Owner: +Rp ${bagianOwnerAll.toLocaleString()}\n`;
                if (teksDividenLogAll) finalReply += `\n*Dividen:*\n${teksDividenLogAll}`;

                conn.reply(m.chat, finalReply, m, { mentions: mentionsAll });
                return;
            }

            if (!jualJml || !jualItem) return m.reply(`⚠️ Format: *${usedPrefix + command} jual <jumlah> <jenis-item> [id_pt]* atau *${usedPrefix + command} jual semua <id_pt>*`);

            let prodData = semuaProduk[jualItem];
            if (!prodData) return m.reply(`❌ Item bukan produk perusahaan.`);

            let hargaPasarSaatIni = getHargaPasar(jualItem);
            let hargaPerPcs = Math.floor(hargaPasarSaatIni * 0.85);
            let trenIcon = getTrenIcon(jualItem);
            let grossProfit = hargaPerPcs * jualJml;
            let sumberBarang = '';
            let teksFinansial = '';

            if (optIdPt !== null && !isNaN(optIdPt)) {
                let ptJual = initCorporateData(user.perusahaan[optIdPt], m.sender);
                
                if (ptJual.isLocked) {
                    return m.reply(`🔒 *PERUSAHAAN DIKUNCI!*\nPerusahaan *${ptJual.name}* sedang dibekukan oleh negara karena menunggak pajak selama 3 hari berturut-turut. Segera isi saldo kas PT lewat *.perusahaan setordana* agar sistem bisa memotong pajak kembali!`);
                }

                if (!ptJual) return m.reply(`❌ ID Perusahaan tidak valid!`);
                if ((ptJual.gudang[jualItem] || 0) < jualJml) return m.reply(`❌ Stok di Gudang Pabrik *${ptJual.name}* tidak cukup!`);

                let tagihanLogistik = Math.floor(Math.random() * (3789000 - 1165000 + 1)) + 1165000;
                if (ptJual.saldo < tagihanLogistik) return m.reply(`❌ Saldo PT tidak cukup untuk menyewa Truk Logistik (Butuh: Rp ${tagihanLogistik.toLocaleString()})!`);
                
                ptJual.saldo -= tagihanLogistik;
                ptJual.gudang[jualItem] -= jualJml;
                sumberBarang = `Gudang Pabrik (${ptJual.name})`;

                let yieldInvestasi = 0;
                if (ptJual.investasi > 0) {
                    let percentYield = (Math.random() * (0.05 - 0.01) + 0.01);
                    yieldInvestasi = Math.floor(ptJual.investasi * percentYield);
                }

                let totalMasuk = grossProfit + yieldInvestasi;
                
                let batasProfitIdeal = ptJual.karyawan * 15000; 
                if (totalMasuk >= batasProfitIdeal) {
                    ptJual.momentumSaham += 0.02;
                    teksFinansial += `\n📈 *Tren Saham:* NAIK (+2%) karena profit memenuhi target!`;
                } else {
                    ptJual.momentumSaham -= 0.01;
                    teksFinansial += `\n📉 *Tren Saham:* TURUN (-1%) karena profit lesu.`;
                }

                if (global.db.data.hargaPasar && global.db.data.hargaPasar[jualItem]) {
                    let hp = global.db.data.hargaPasar[jualItem];
                    if (jualJml > 200) {
                        hp.harga = Math.max(Math.floor(prodData.baseHargaToko * 0.6), Math.floor(hp.harga * 0.98));
                        hp.tren = -1;
                        teksFinansial += `\n📉 *Harga Pasar ${prodData.name}* turun karena supply besar!`;
                    } else if (jualJml < 50) {
                        hp.harga = Math.min(Math.floor(prodData.baseHargaToko * 2), Math.floor(hp.harga * 1.01));
                        hp.tren = 1;
                    }
                }
                
                if (ptJual.momentumSaham > 5.0) ptJual.momentumSaham = 5.0; 
                if (ptJual.momentumSaham < 0.2) ptJual.momentumSaham = 0.2; 

                let teksDividenLog = '';
                let mentionsDividen = [];
                let totalDividenKeluar = 0;

                for (let shareholder in ptJual.pemegangSaham) {
                    let persenSaham = ptJual.pemegangSaham[shareholder];
                    if (shareholder === m.sender) continue; 
                    else if (shareholder === 'publik') {
                        let bagianPublik = Math.floor(totalMasuk * (persenSaham / 100));
                        totalDividenKeluar += bagianPublik;
                        teksDividenLog += `> 🏛️ Pajak/Publik Sistem (${persenSaham}%): -Rp ${bagianPublik.toLocaleString()}\n`;
                    } else {
                        let profitAktifPersen = persenSaham * 0.8; 
                        let bagianDividen = Math.floor(totalMasuk * (profitAktifPersen / 100));
                        if (global.db.data.users[shareholder]) {
                            global.db.data.users[shareholder].money += bagianDividen;
                            totalDividenKeluar += bagianDividen;
                            teksDividenLog += `> 👤 Investor @${shareholder.split('@')[0]} (Profit ${profitAktifPersen.toFixed(1)}%): +Rp ${bagianDividen.toLocaleString()}\n`;
                            if (!mentionsDividen.includes(shareholder)) mentionsDividen.push(shareholder);
                            conn.reply(shareholder, `💸 *PASSIVE INCOME INCOMING* 💸\nKamu menerima Rp ${bagianDividen.toLocaleString()} dari dividen saham perusahaan *${ptJual.name}*!`, null);
                        }
                    }
                }

                let bagianOwnerPT = totalMasuk - totalDividenKeluar;
                ptJual.saldo += bagianOwnerPT;
                
                teksDividenLog = `> 🏢 Kas Dompet PT (Saham Owner + Fee): +Rp ${bagianOwnerPT.toLocaleString()}\n` + teksDividenLog;

                teksFinansial += `\n\n*📊 LAPORAN FINANSIAL PABRIK:*\n`;
                teksFinansial += `> 🚚 Biaya Ekspor Logistik: -Rp ${tagihanLogistik.toLocaleString()}\n`;
                teksFinansial += `> ${trenIcon} Harga Pasar: Rp ${hargaPasarSaatIni.toLocaleString()} → Grosir: Rp ${hargaPerPcs.toLocaleString()}\n`;
                teksFinansial += `> Gross Profit Penjualan: Rp ${grossProfit.toLocaleString()}\n`;
                if (yieldInvestasi > 0) teksFinansial += `> 📈 Yield Reksadana: +Rp ${yieldInvestasi.toLocaleString()}\n`;
                teksFinansial += `\n*🧾 BAGI HASIL DIVIDEN:*\n${teksDividenLog}`;
                
                conn.reply(m.chat, `🚚 *DISTRIBUSI PASAR SUKSES* 🚚\n\nMuatan: *${sumberBarang}*\nBarang: *${jualJml.toLocaleString()} ${prodData.name}*\nHarga Grosir: Rp ${hargaPerPcs.toLocaleString()} / pcs${teksFinansial}`, m, { mentions: mentionsDividen });

            } else {
                if ((user[prodData.db] || 0) < jualJml) return m.reply(`❌ Stok tidak cukup!`);
                user[prodData.db] -= jualJml;
                user.money += grossProfit;
                m.reply(`🚚 *DISTRIBUSI PASAR SUKSES* 🚚\n\nMuatan: *Inventory Pribadi*\nBarang: *${jualJml.toLocaleString()} ${prodData.name}*\n${trenIcon} Harga Pasar: Rp${hargaPasarSaatIni.toLocaleString()}\n*Total Profit: +Rp ${grossProfit.toLocaleString()}*`);
            }

            if (!global.db.data.market[prodData.db]) global.db.data.market[prodData.db] = { stock: 100000 };
            global.db.data.market[prodData.db].stock += jualJml;
            break;
        }

        case 'ceklistrik': {
            initGridListrik();
            let grid = global.db.data.gridListrik;
            let gridPersen = ((grid.kapasitasTerpakai / grid.kapasitasMaks) * 100).toFixed(1);

            let teks = `⚡ *STATUS LISTRIK GLOBAL* ⚡\n\n`;
            teks += `🌐 *Listrik Negara*\n`;
            teks += `   Kapasitas: ${grid.kapasitasTerpakai.toFixed(2)} / ${grid.kapasitasMaks} kW\n`;
            teks += `   Pemakaian: ${gridPersen}%\n`;
            teks += `   Tarif: Rp${hargaListrikNegara.toLocaleString()}/W\n\n`;

            let listSwasta = getDaftarListrikSwasta();
            if (listSwasta.length === 0) {
                teks += `🏢 *Perusahaan Listrik Swasta:* Tidak ada yang aktif.\n`;
            } else {
                teks += `🏢 *Perusahaan Listrik Swasta:*\n`;
                let mentionsCek = [];
                listSwasta.forEach((ls, idx) => {
                    let ownerName = ls.owner.split('@')[0];
                    if (!mentionsCek.includes(ls.owner)) mentionsCek.push(ls.owner);
                    let pt = ls.pt;
                    let capTersedia = (pt.kapasitasTersedia || 0).toLocaleString();
                    let capMaks = (pt.kapasitasMaks || kapasitasListrikPerPT).toLocaleString();
                    let persenSwasta = pt.kapasitasMaks > 0 ? ((pt.kapasitasTersedia / pt.kapasitasMaks) * 100).toFixed(1) : 0;
                    teks += `   ${idx + 1}. *${pt.name}* (@${ownerName})\n`;
                    teks += `      ⚡ ${capTersedia} / ${capMaks} W (${persenSwasta}% tersedia)\n`;
                    teks += `      💰 Harga Jual: Rp${(pt.hargaJual || hargaListrikSwasta).toLocaleString()}/W\n\n`;
                });
                conn.reply(m.chat, teks, m, { mentions: mentionsCek });
                return;
            }
            m.reply(teks);
            break;
        }

        default:
            let help = `🏢 *SISTEM MEGA KORPORAT & BURSA SAHAM v2* 🏢\n\n`
            help += `*TIPE PERUSAHAAN:*\n`
            help += `> minuman - Modal 50T\n`
            help += `> tambang - Modal 120T (pasir, batu, bijihbesi, emas, uranium)\n`
            help += `> listrik  - Modal 165T (jual listrik ke player lain)\n\n`
            help += `*PERINTAH UTAMA:*\n`
            help += `*${usedPrefix + command} buat <tipe> [negara/swasta] <nama>* - Bangun PT\n`
            help += `*${usedPrefix + command} tambahpembangkit <jenis> <id_pt>* - Tambah unit listrik (+kapasitas permanen)\n`
            help += `*${usedPrefix + command} upgradelistrik <id_pt>* - Naikkan kapasitas jual (+900W per level). Kapasitas jual = Level × 900W\n`
            help += `*${usedPrefix + command} gantilistrik <id_pt> <negara|swasta>* - Ganti preferensi sumber listrik produksi\n`
            help += `*${usedPrefix + command} hidupin <on|off> <id_pt>* - Nyalakan/matiin auto generate listrik setiap 1 jam\n`
            help += `*${usedPrefix + command} info* - Cek Aset + Gudang (0/65) + Preferensi Listrik\n`
            help += `*${usedPrefix + command} resep* - Cek harga pasar (fluktuatif!)\n`
            help += `*${usedPrefix + command} rekrut <jumlah> <id>* - Hire Karyawan\n`
            help += `*${usedPrefix + command} setordana / tarikdana <jumlah> <id>*\n`
            help += `*${usedPrefix + command} invest / tarikinvest <jumlah> <id>*\n`
            help += `*${usedPrefix + command} bursa* - Lihat emiten pasar saham\n`
            help += `*${usedPrefix + command} jualsaham <%> <id_pt>*\n`
            help += `*${usedPrefix + command} belisaham <id_bursa>*\n`
            help += `*${usedPrefix + command} buyback <%> <id_pt> [tag/publik]*\n`
            help += `*${usedPrefix + command} setor / tarik <jumlah> <item> <id>*\n`
            help += `*${usedPrefix + command} produksi <jumlah> <item> <id> [negara/swasta]*\n`
            help += `*${usedPrefix + command} jual <jumlah> <item> [id_pt]* - Jual & sebar dividen\n`
            help += `*${usedPrefix + command} jual semua <id_pt>* - Jual SEMUA produk di gudang PT\n`
            help += `*${usedPrefix + command} ceklistrik* - Cek status listrik negara & semua swasta\n\n`
            help += `⚡ *LISTRIK:* Negara Rp${hargaListrikNegara.toLocaleString()}/W | Swasta Rp${hargaListrikSwasta.toLocaleString()}/W\n`
            help += `📊 *Harga pasar naik/turun tiap jam otomatis!*\n`
            help += `⏱️ *Produksi:* Minuman ~4d/produk | Tambang ~12d/produk (bisa diatur preferensi)\n`
            help += `💡 *Tips:* Bangun banyak pembangkit di PT Listrikmu → kapasitas permanen naik → jual listrik tanpa beli terus!`
            m.reply(help);
    }
}

handler.help = ['perusahaan']
handler.tags = ['rpg']
handler.command = /^(perusahaan|company|pt)$/i

module.exports = handler;
