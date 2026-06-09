// ==========================================
// KONFIGURASI HARGA & BIAYA
// ==========================================
const biayaInduk = {
    'produksi':  50000000000,   // 50 Miliar
    'tambang':   75000000000,   // 75 Miliar
    'daurulang': 30000000000,   // 30 Miliar
    'minuman':   40000000000,   // 40 Miliar
    'senjata':   80000000000,   // 80 Miliar
    'listrik':   100000000000   // 100 Miliar
};

const biayaPabrikObj = {
    'daurulang': 10000000000,
    'minuman':   20000000000,
    'tambang':   50000000000,
    'senjata':   80000000000
};

const hargaListrikNegara  = 14400;   
const HARGA_UPGRADE_GUDANG = 4000000; 
const HARGA_UPGRADE_LISTRIK = 1000000; 
const MAX_LEVEL_GUDANG  = 20765;
const MAX_LEVEL_LISTRIK = 18665; 

const slotPerLevel    = 120;  
const wattPerLevel    = 1200; 

// Kapasitas Daya Refill (Dasar) per 30 Menit
const kapasitasPembangkit = {
    'PLTU':  4000,     'PLTS':  8000,    
    'PLTB':  10000,    'PLTP':  20000,    
    'PLTA':  120000,   'PLTN':  200000    
};

const hargaPembangkit = {
    'PLTU':  5000000000,    'PLTS':  10000000000,   
    'PLTB':  15000000000,   'PLTP':  30000000000,   
    'PLTA':  100000000000,  'PLTN':  250000000000   
};

// ==========================================
// DATABASE BARANG PRODUKSI & RESEP BAHAN BAKU
// ==========================================
const semuaProduk = {
    // Ringan
    'airmineral': { type: 'minuman',   name: 'Air Mineral', db: 'airmineral', prodCost: 1000, listrik: 2, bahan: {'aqua': 1, 'botol': 1} },
    'tehbotol':   { type: 'minuman',   name: 'Teh Botol',   db: 'tehbotol',   prodCost: 1500, listrik: 3, bahan: {'aqua': 1, 'botol': 1, 'daunteh': 2, 'tebu': 1} },
    'botol':      { type: 'daurulang', name: 'Botol',       db: 'botol',      prodCost: 500,  listrik: 2, bahan: {'sampah': 5, 'kardus': 1} },
    'kayu':       { type: 'daurulang', name: 'Kayu',        db: 'kayu',       prodCost: 1000, listrik: 3.5, bahan: {} },
    
    // Berat (TAMBANG - TANPA BAHAN BAKU LUAR)
    'pasir':      { type: 'tambang',   name: 'Pasir',       db: 'pasir',      prodCost: 1500, listrik: 3, bahan: {} },
    'iron':       { type: 'tambang',   name: 'Iron',        db: 'iron',       prodCost: 5000, listrik: 6, bahan: {} },
    'emasmentah': { type: 'tambang',   name: 'Emas Mentah', db: 'emasmentah', prodCost: 50000, listrik: 10, bahan: {} },
    
    // Kompleks
    'sword':      { type: 'senjata',   name: 'Sword',       db: 'sword',      prodCost: 20000, listrik: 8, bahan: {'iron': 5, 'kayu': 2} }
};

// Base harga pasar untuk Sync Global Market
const baseHargaPasar = {
    'aqua': 5000, 'daunteh': 1500, 'tebu': 550, 'sampah': 120, 'kardus': 400,
    'batu': 500, 'coal': 1500, 'botol': 300, 'kayu': 1000, 'pasir': 250000,
    'iron': 20000, 'airmineral': 9900, 'tehbotol': 9600, 'emasmentah': 866490, 'sword': 150000
};

// ==========================================
// HELPERS
// ==========================================
function formatRp(n) { return 'Rp' + (n || 0).toLocaleString('id-ID'); }
function formatSingkat(n) {
    n = n || 0;
    if (n >= 1e12) return (n / 1e12).toFixed(2) + ' T';
    if (n >= 1e9)  return (n / 1e9).toFixed(2)  + ' M';
    if (n >= 1e6)  return (n / 1e6).toFixed(2)  + ' Jt';
    return n.toLocaleString('id-ID');
}
function formatDaya(w, isRefill = false) {
    let unit = isRefill ? 'Wh' : 'W';
    if (w >= 1e9) return (w / 1e9).toLocaleString('id-ID', {maximumFractionDigits: 1}) + ' G' + unit;
    if (w >= 1e6) return (w / 1e6).toLocaleString('id-ID', {maximumFractionDigits: 1}) + ' M' + unit;
    if (w >= 1e3) return (w / 1e3).toLocaleString('id-ID', {maximumFractionDigits: 1}) + ' k' + unit;
    return w.toLocaleString('id-ID') + ' ' + unit;
}
function progressBar(val, max, len = 10) {
    let filled = Math.round((val / Math.max(1, max)) * len);
    filled = Math.min(len, Math.max(0, filled));
    return '█'.repeat(filled) + '░'.repeat(len - filled);
}
function getKapasitasGudang(pt) { return (pt.gudangLevel || 1) * slotPerLevel; }
function getKapasitasListrik(pt) { return (pt.listrikLevel || 1) * wattPerLevel; }
function getSlotTerpakai(gudang) { return Object.values(gudang || {}).reduce((s, v) => s + (v || 0), 0); }

// Fitur Pasar Global
function getMarketPriceSim(itemKey, isBeli = true) {
    let base = baseHargaPasar[itemKey] || 10000;
    if (!isBeli) base = Math.floor(base * 0.75);
    
    if (!global.db.data.market[itemKey]) return base;
    
    let currentStock = global.db.data.market[itemKey].stock || 50000;
    let baseStock = 100000; 
    let ratio = baseStock / Math.max(1, currentStock);
    
    if (ratio > 3.0) ratio = 3.0; 
    if (ratio < 0.2) ratio = 0.2;
    
    return Math.max(1, Math.floor(base * ratio));
}

function findPTListrikGlobal(ptIdTarget) {
    let allUsers = global.db.data.users;
    for (let uid in allUsers) {
        let u = allUsers[uid];
        if (u && Array.isArray(u.perusahaan)) {
            for (let i = 0; i < u.perusahaan.length; i++) {
                let pt = u.perusahaan[i];
                if (pt && pt.type === 'listrik' && pt.id === ptIdTarget) {
                    return { ownerId: uid, ownerName: u.name || uid.split('@')[0], pt: pt, index: i };
                }
            }
        }
    }
    return null;
}

function hitungAsetKotor(pt) {
    let val = pt.saldo || 0;
    if (pt.gudang) {
        for (let brg in pt.gudang) {
            let stok = pt.gudang[brg] || 0;
            if (stok > 0) val += stok * getMarketPriceSim(brg, false);
        }
    }
    if (Array.isArray(pt.pabrik)) pt.pabrik.forEach(f => { val += biayaPabrikObj[f.type] || 0; });
    val += biayaInduk[pt.type] || 0;
    if (pt.type !== 'listrik') val += ((pt.gudangLevel || 1) - 1) * HARGA_UPGRADE_GUDANG;
    if (pt.type === 'listrik') {
        val += ((pt.listrikLevel || 1) - 1) * HARGA_UPGRADE_LISTRIK;
        if (pt.ekstraPembangkit) pt.ekstraPembangkit.forEach(p => val += (hargaPembangkit[p] || 0));
    }
    return val;
}

function hitungValuasi(pt) {
    let val = hitungAsetKotor(pt);
    let totalInvest = pt.investors ? Object.values(pt.investors).reduce((a,b)=>a+b,0) : 0;
    val += totalInvest;
    val -= (pt.hutang || 0);
    return Math.max(0, val);
}

// ==========================================
// CORE HANDLER
// ==========================================
let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply('❌ Data user tidak ditemukan di database.');
        if (!user.money) user.money = 0;
        if (!global.db.data.market) global.db.data.market = {};
        if (!global.db.data.ihsg) global.db.data.ihsg = { history: [], lastUpdate: 0 };
        if (!Array.isArray(user.perusahaan)) user.perusahaan = [];
        user.perusahaan = user.perusahaan.filter(pt => pt !== null && pt !== undefined);

        let now = Date.now();

        // AUTO: REFILL LISTRIK, PAJAK & PEMBAYARAN GAJI (REVISI: PEKERJA RESIGN & MESIN MATI)
        user.perusahaan.forEach(pt => {
            if (!pt) return;
            if (pt.type !== 'listrik' && !pt.gudangLevel) pt.gudangLevel = 1;
            if (pt.type === 'listrik' && !pt.listrikLevel) pt.listrikLevel = 1;
            if (!pt.investors) pt.investors = {}; 
            if (pt.type === 'listrik' && !pt.ekstraPembangkit) pt.ekstraPembangkit = [];
            if (pt.hutang === undefined) pt.hutang = 0;
            if (pt.investOpen === undefined) pt.investOpen = true; 
            if (pt.isProduksi === undefined) pt.isProduksi = false;
            if (!pt.karyawan) pt.karyawan = 10; 
            if (!pt.lastSalary) pt.lastSalary = now; 

            // Generate Listrik Otomatis
            if (pt.type === 'listrik') {
                let periods = Math.floor((now - (pt.lastGenerate || now)) / 1800000);
                if (periods >= 1) {
                    let kapMax = getKapasitasListrik(pt);
                    let totalGenRate = pt.generationRate || 4000;
                    
                    // MESIN MATI: Hitung hanya Pembangkit Ekstra yang "Aktif" sesuai karyawan
                    let maxBatasSlotAktif = 12 + Math.floor(pt.karyawan / 500);
                    if (pt.ekstraPembangkit && pt.ekstraPembangkit.length > 0) {
                        let aktifExtra = pt.ekstraPembangkit.slice(0, maxBatasSlotAktif);
                        aktifExtra.forEach(p => totalGenRate += (kapasitasPembangkit[p] || 0));
                    }
                    
                    let remaining = kapMax - (pt.kapasitasTersedia || 0);
                    if (remaining > 0) {
                        let gen = Math.min(remaining, totalGenRate * periods);
                        pt.kapasitasTersedia = (pt.kapasitasTersedia || 0) + gen;
                    }
                    pt.lastGenerate = now;
                }
            }

            // Pembayaran Pajak Harian
            if (!pt.lastTax) pt.lastTax = now;
            let daysPassed = Math.floor((now - pt.lastTax) / 86400000);
            if (daysPassed >= 1) {
                let tax = Math.floor((pt.saldo || 0) * 0.002 * daysPassed);
                pt.saldo = Math.max(0, (pt.saldo || 0) - tax);
                pt.lastTax += daysPassed * 86400000;
            }

            // Pembayaran Gaji Karyawan Setiap 3 Hari
            let salaryPeriods = Math.floor((now - pt.lastSalary) / (3 * 86400000));
            if (salaryPeriods >= 1) {
                let biayaGajiPerOrang = 365000 * salaryPeriods;
                let totalGajiDibutuhkan = pt.karyawan * biayaGajiPerOrang;
                
                if ((pt.saldo || 0) >= totalGajiDibutuhkan) {
                    pt.saldo -= totalGajiDibutuhkan; // Potong lunas
                } else {
                    // KAS PT TIDAK CUKUP -> Pekerja Resign Sesuai Kemampuan Bayar Kas
                    let mampuBayarBerapaPekerja = Math.floor((pt.saldo || 0) / biayaGajiPerOrang);
                    pt.saldo -= (mampuBayarBerapaPekerja * biayaGajiPerOrang); 
                    
                    // Sisa pekerja keluar, minimum menyisakan 10 pekerja setia
                    pt.karyawan = Math.max(10, mampuBayarBerapaPekerja);
                    if (mampuBayarBerapaPekerja < 10) pt.saldo = 0; 
                }
                pt.lastSalary += salaryPeriods * (3 * 86400000);
            }
        });

        let action = args[0] ? args[0].toLowerCase() : 'help';

        switch (action) {
            case 'buat': {
                let tipePT = args[1] ? args[1].toLowerCase() : '';
                let namaPT = args.slice(2).join(' ');
                let tipeValid = Object.keys(biayaInduk);

                if (!tipeValid.includes(tipePT) || !namaPT)
                    return m.reply(`⚠️ *Format Salah!*\n\n*${usedPrefix+command} buat <tipe> <Nama PT>*\nTipe: ${tipeValid.join(', ')}\n\nContoh: *${usedPrefix+command} buat tambang PT Emas*`);

                if (user.perusahaan.length >= 2) return m.reply('❌ Batas maksimal adalah *2 Perusahaan Induk*!');
                let hargaBuat = biayaInduk[tipePT];
                
                if (user.money < hargaBuat) return m.reply(`❌ Uang pribadimu kurang!\nButuh ${formatRp(hargaBuat)}.`);
                user.money -= hargaBuat;

                let newPT = {
                    id: now, name: namaPT, type: tipePT, saldo: 0, hutang: 0, lastTax: now,
                    pabrik: [], gudang: {}, investors: {}, investOpen: true, isProduksi: false, 
                    karyawan: 10, lastSalary: now
                };

                if (tipePT === 'listrik') {
                    newPT.listrikLevel = 1; newPT.kapasitasTersedia = wattPerLevel;
                    newPT.generationRate = 4000; newPT.pembangkit = 'PLTU';
                    newPT.ekstraPembangkit = [];
                    newPT.hargaListrikCustom = 18600; newPT.lastGenerate = now;
                } else {
                    newPT.gudangLevel = 1; newPT.sumberListrik = 'negara';
                }

                user.perusahaan.push(newPT);
                m.reply(`🎉 *PERUSAHAAN DIDIRIKAN!*\n🏢 *${namaPT}* (${tipePT.toUpperCase()})\nModal (dari Dompet): -${formatRp(hargaBuat)}`);
                break;
            }

            case 'info': {
                let targetId = m.sender;
                if (args[1]) {
                    if (m.mentionedJid && m.mentionedJid[0]) targetId = m.mentionedJid[0];
                    else if (args[1].startsWith('@')) targetId = args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                }

                let targetUser = global.db.data.users[targetId];
                if (!targetUser || !targetUser.perusahaan || !targetUser.perusahaan.length) return m.reply(`❌ Belum punya perusahaan.`);

                let isSelf = (targetId === m.sender);
                let txt = `🏢 *ASET KORPORASI ${isSelf ? 'MILIKMU' : 'MILIK @' + targetId.split('@')[0]}* 🏢\n\n`;

                if (isSelf) {
                    let swastaList = user.perusahaan.filter(p => p && p.type === 'listrik');
                    let avgSwasta = swastaList.length ? swastaList.reduce((acc, p) => acc + (p.hargaListrikCustom || 18600), 0) / swastaList.length : 0;
                    let swastaStr = avgSwasta > 0 ? `Rp${avgSwasta.toLocaleString('id-ID')}/W` : '-';
                    txt += `🌐 *Grid Listrik Negara:* 0 kW / 15 kW (0.0% terpakai)\n`;
                    txt += `💡 Tarif Negara: Rp${hargaListrikNegara.toLocaleString('id-ID')}/W | Swasta: ${swastaStr}\n\n`;
                }

                targetUser.perusahaan.forEach((pt, i) => {
                    let val = hitungValuasi(pt);
                    let ptHeader = pt.type === 'listrik' ? `*${i+1}. ${pt.name} (${pt.pembangkit || 'PLTU'})*` : `*${i+1}. ${pt.name}*`;
                    let pekerja = pt.karyawan || 10;
                    let gajiTigaHari = formatRp(pekerja * 365000);

                    txt += `${ptHeader}\n`;
                    txt += `🏭 Induk Pabrik: *${pt.type.toUpperCase()}*\n`;
                    
                    if (pt.pabrik && pt.pabrik.length > 0) {
                        txt += `🏢 Anak Pabrik:\n`;
                        pt.pabrik.forEach((p, idx) => {
                            txt += `   ${idx + 1}. *${p.name}* (${p.type.toUpperCase()})\n`;
                        });
                    }

                    if (pt.type === 'listrik') {
                        let totalRefill = pt.generationRate || 4000;
                        let maxBatasSlot = 12 + Math.floor(pekerja / 500);
                        
                        let aktifExtra = pt.ekstraPembangkit ? pt.ekstraPembangkit.slice(0, maxBatasSlot) : [];
                        let matiExtra  = pt.ekstraPembangkit ? Math.max(0, pt.ekstraPembangkit.length - maxBatasSlot) : 0;
                        
                        aktifExtra.forEach(p => totalRefill += (kapasitasPembangkit[p] || 0));
                        
                        let extraStr = aktifExtra.length > 0 ? aktifExtra.join(', ') : '-';
                        let strMati = matiExtra > 0 ? ` (+${matiExtra} Mesin Mati)` : '';

                        let kapMaksimum = getKapasitasListrik(pt);
                        let sedia       = pt.kapasitasTersedia || 0;

                        txt += `👥 Pekerja: ${pekerja.toLocaleString('id-ID')} Orang (Gaji: ${gajiTigaHari} / 3H)\n`;
                        txt += `⚡ Level Kapasitas : Level ${pt.listrikLevel || 1}\n`;
                        txt += `⚡ Listrik Tersedia: ${formatDaya(sedia)} / ${formatDaya(kapMaksimum)}\n`;
                        txt += `♻️ Total Refill: ${formatDaya(totalRefill, true)} / 30 Menit\n`;
                        txt += `💡 Harga Jual: ${formatRp(pt.hargaListrikCustom || 18600)}/W\n`;
                        txt += `🏗️ Ekstra Mesin: ${extraStr} (${aktifExtra.length}/${maxBatasSlot} Aktif)${strMati}\n`;
                    } else {
                        let statusProduksi = pt.isProduksi ? '⏳ Sedang Beroperasi' : '🟢 Idle';
                        // Limit Maksimal di 5.000 Pekerja (0.2 detik = 200ms)
                        let currentSpeedMs = Math.max(200, 4000 - Math.floor((Math.min(pekerja, 5000) / 5000) * 3800));
                        
                        txt += `👥 Pekerja: ${pekerja.toLocaleString('id-ID')} Orang (Gaji: ${gajiTigaHari} / 3H)\n`;
                        txt += `🚀 Kecepatan Produksi: ${currentSpeedMs/1000} Detik / Item\n`;
                        txt += `📦 Level Gudang : Level ${pt.gudangLevel || 1}\n`;
                        txt += `📦 Sisa Gudang: ${getSlotTerpakai(pt.gudang).toLocaleString('id-ID')} / ${getKapasitasGudang(pt).toLocaleString('id-ID')} Slot\n`;
                        txt += `⚙️ Status Pabrik: ${statusProduksi}\n`;
                        
                        let srcName = '🔵 Negara (PLN)';
                        if (pt.sumberListrik && pt.sumberListrik !== 'negara') {
                            let provider = findPTListrikGlobal(pt.sumberListrik);
                            if (provider) srcName = `🟡 ${provider.pt.name} (@${provider.ownerId.split('@')[0]})`;
                            else srcName = '🔵 Negara (PLN) [Otomatis dialihkan]';
                        }
                        txt += `🔌 Sumber Listrik: ${srcName}\n`;
                    }

                    let totalInvest = pt.investors ? Object.values(pt.investors).reduce((a,b)=>a+b, 0) : 0;
                    let detailInvestor = '';
                    if (pt.investors && Object.keys(pt.investors).length > 0) {
                        for (let inv in pt.investors) {
                            let p = ((pt.investors[inv] / totalInvest) * 100).toFixed(1);
                            detailInvestor += `\n>    • @${inv.split('@')[0]} (${p}% Pool)`;
                        }
                    }

                    let statusInv = (pt.investOpen !== false) ? '🟢 DIBUKA' : '🔴 DITUTUP';

                    txt += `\n*📊 LAPORAN KEUANGAN & SAHAM:*\n`;
                    txt += `> 💎 Valuasi Bersih: ~${formatSingkat(val)}\n`;
                    txt += `> 🏦 Hutang Bank: ${formatRp(pt.hutang || 0)}\n`;
                    txt += `> 💼 Status Investasi: ${statusInv}\n`;
                    txt += `> 👥 Total Modal Publik: ${formatRp(totalInvest)}${detailInvestor}\n`;
                    txt += `> 💳 Saldo Kas PT: ${formatRp(pt.saldo)}\n\n`;
                });

                return m.reply(txt.trim(), null, { mentions: [targetId, ...Object.keys(targetUser.perusahaan[0]?.investors || {})] });
            }

            // ==============================
            // REKRUT PEKERJA (SPEED & SLOT LISTRIK)
            // ==============================
            case 'rekrut':
            case 'pecat': {
                let jmlPekerja = parseInt(args[1]);
                let idPt = parseInt(args[2]) - 1;
                if (isNaN(jmlPekerja) || isNaN(idPt) || jmlPekerja < 1) return m.reply(`⚠️ Format: *${usedPrefix+command} ${action} <jumlah> <id_pt>*\n\n_5.000 Pekerja = Produksi Maksimal (0.2 detik / barang)._`);
                
                let pt = user.perusahaan[idPt];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

                if (!pt.karyawan) pt.karyawan = 10;
                let hargaRekrut = 1000000; 
                
                if (action === 'rekrut') {
                    let totalBiaya = jmlPekerja * hargaRekrut;
                    if ((pt.saldo || 0) < totalBiaya) return m.reply(`❌ Kas PT kurang untuk merekrut!\nButuh: ${formatRp(totalBiaya)}\nKas PT: ${formatRp(pt.saldo)}\n\n_Harga: Rp1 Juta / Pekerja_`);
                    
                    pt.saldo -= totalBiaya;
                    pt.karyawan += jmlPekerja;
                    
                    if (pt.type === 'listrik') {
                        let maxBatasSlot = 12 + Math.floor(pt.karyawan / 500);
                        m.reply(`👥 *REKRUTMEN SUKSES*\n\n🏢 PT: *${pt.name}*\n📈 Anda menambah pekerja sebanyak ${jmlPekerja.toLocaleString('id-ID')} orang. Jika ada mesin yang mati, slot pembangkit akan aktif kembali!\n💸 Kas PT: -${formatRp(totalBiaya)}\n\n*Total Pekerja:* ${pt.karyawan.toLocaleString('id-ID')} orang\n⚡ *Batas Slot Pembangkit Aktif:* ${maxBatasSlot} Slot`);
                    } else {
                        let newSpeed = Math.max(200, 4000 - Math.floor((Math.min(pt.karyawan, 5000) / 5000) * 3800));
                        m.reply(`👥 *REKRUTMEN SUKSES*\n\n🏢 PT: *${pt.name}*\n📈 Anda menambah pekerja sebanyak ${jmlPekerja.toLocaleString('id-ID')} orang dan produksi dipercepat menjadi ${newSpeed/1000} detik per barang.\n💸 Kas PT: -${formatRp(totalBiaya)}\n\n*Total Pekerja:* ${pt.karyawan.toLocaleString('id-ID')} orang`);
                    }
                } else {
                    if (pt.karyawan - jmlPekerja < 10) return m.reply(`❌ Perusahaan minimal harus memiliki 10 pekerja (Karyawan Dasar)!`);
                    pt.karyawan -= jmlPekerja;
                    
                    if (pt.type === 'listrik') {
                        let maxBatasSlot = 12 + Math.floor(pt.karyawan / 500);
                        m.reply(`📉 *PHK SUKSES*\n\n🏢 PT: *${pt.name}*\n📉 Diberhentikan: ${jmlPekerja.toLocaleString('id-ID')} orang\n\n*Total Pekerja:* ${pt.karyawan.toLocaleString('id-ID')} orang\n⚡ *Batas Slot Pembangkit Aktif:* ${maxBatasSlot} Slot (Jika jumlah mesin melebihi batas ini, sisanya akan dinonaktifkan)`);
                    } else {
                        let newSpeed = Math.max(200, 4000 - Math.floor((Math.min(pt.karyawan, 5000) / 5000) * 3800));
                        m.reply(`📉 *PHK SUKSES*\n\n🏢 PT: *${pt.name}*\n📉 Diberhentikan: ${jmlPekerja.toLocaleString('id-ID')} orang\n\n*Total Pekerja:* ${pt.karyawan.toLocaleString('id-ID')} orang\n🚀 *Kecepatan Produksi Saat Ini:* ${newSpeed/1000} Detik / Barang`);
                    }
                }
                break;
            }

            case 'kirim':
            case 'transfer': {
                let jumlah = parseInt(args[1]);
                let tipe = args[2] ? args[2].toLowerCase() : '';
                let idPengirim = parseInt(args[3]) - 1;
                let targetMention = args[4];
                let idTujuan = parseInt(args[5]) - 1;

                if (isNaN(jumlah) || !tipe || isNaN(idPengirim) || !targetMention || isNaN(idTujuan)) {
                    return m.reply(
                        `⚠️ *Format B2B Salah!*\n\n` +
                        `*${usedPrefix+command} kirim <jumlah> <uang/item> <id_pt_mu> <@tag_partner> <id_pt_partner>*\n\n` +
                        `_Contoh Kirim Dana:_ ${usedPrefix+command} kirim 5000000 uang 1 @62812xxx 2\n` +
                        `_Contoh Kirim Barang:_ ${usedPrefix+command} kirim 1000 botol 1 @62812xxx 1`
                    );
                }

                let ptSender = user.perusahaan[idPengirim];
                if (!ptSender) return m.reply('❌ ID PT Pengirim milikmu tidak valid!');

                let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                let targetUser = global.db.data.users[target];
                
                if (!targetUser || !targetUser.perusahaan) return m.reply('❌ Partner (Penerima) tidak memiliki perusahaan!');

                let ptReceiver = targetUser.perusahaan[idTujuan];
                if (!ptReceiver) return m.reply('❌ ID PT Penerima tidak valid!');

                if (tipe === 'uang' || tipe === 'money') {
                    if ((ptSender.saldo || 0) < jumlah) return m.reply(`❌ Saldo Kas PT Pengirim kurang!\nSaldo Kas: ${formatRp(ptSender.saldo)}`);
                    
                    ptSender.saldo -= jumlah;
                    ptReceiver.saldo = (ptReceiver.saldo || 0) + jumlah;
                    
                    m.reply(`🤝 *KERJASAMA B2B BERHASIL*\n\nBerhasil mengirim dana *${formatRp(jumlah)}*\nDari: 🏢 *${ptSender.name}*\nKe: 🏢 *${ptReceiver.name}* (Milik @${target.split('@')[0]})`, null, {mentions: [target]});
                } else {
                    if (ptSender.type === 'listrik' || ptReceiver.type === 'listrik') return m.reply(`❌ Transfer barang hanya bisa dilakukan antar PT Produksi (Non-Listrik)!`);
                    
                    if ((ptSender.gudang[tipe] || 0) < jumlah) return m.reply(`❌ Stok *${tipe}* di gudang PT Pengirim tidak cukup!\nSisa stok: ${(ptSender.gudang[tipe] || 0).toLocaleString('id-ID')}`);
                    
                    let slotSisa = getKapasitasGudang(ptReceiver) - getSlotTerpakai(ptReceiver.gudang);
                    if (jumlah > slotSisa) return m.reply(`❌ Gudang PT Penerima penuh!\nSisa slot mereka hanya: ${slotSisa.toLocaleString('id-ID')}`);

                    ptSender.gudang[tipe] -= jumlah;
                    if (!ptReceiver.gudang) ptReceiver.gudang = {};
                    ptReceiver.gudang[tipe] = (ptReceiver.gudang[tipe] || 0) + jumlah;

                    m.reply(`🤝 *KERJASAMA B2B BERHASIL (LOGISTIK)*\n\nBerhasil mengirim barang *${jumlah.toLocaleString('id-ID')} ${tipe}*\nDari: 🏢 *${ptSender.name}*\nKe: 🏢 *${ptReceiver.name}* (Milik @${target.split('@')[0]})`, null, {mentions: [target]});
                }
                break;
            }

            case 'produksi': {
                let jmlProd = parseInt(args[1]); let namaItem = args[2] ? args[2].toLowerCase() : ''; let idPt = parseInt(args[3]) - 1;
                if (!jmlProd || !namaItem || isNaN(idPt)) return m.reply(`⚠️ Format: *${usedPrefix+command} produksi <jml> <item> <id_pt>*`);
                
                let pt = user.perusahaan[idPt];
                if (!pt || pt.type === 'listrik') return m.reply('❌ ID PT tidak valid!');
                let dp = semuaProduk[namaItem];
                if (!dp) return m.reply(`❌ Produk *${namaItem}* tidak dikenali!`);

                let bisaProduksi = (pt.type === dp.type) || (pt.pabrik && pt.pabrik.some(f => f.type === dp.type));
                if (!bisaProduksi) return m.reply(`❌ Tidak ada pabrik *${dp.type.toUpperCase()}* di PT ini.`);

                if (pt.isProduksi) return m.reply(`❌ Mesin PT ini masih *bekerja* memproduksi pesanan sebelumnya! Harap tunggu sampai selesai.`);

                let slotSisa = getKapasitasGudang(pt) - getSlotTerpakai(pt.gudang);
                if (jmlProd > slotSisa) return m.reply(`❌ Gudang penuh! Tersedia: ${slotSisa.toLocaleString('id-ID')} Slot`);

                let bahanKurang = [];
                if (dp.bahan) {
                    for (let b in dp.bahan) {
                        let butuh = dp.bahan[b] * jmlProd;
                        let punya = pt.gudang[b] || 0;
                        if (punya < butuh) bahanKurang.push(`- ${b} (Butuh: ${butuh.toLocaleString('id-ID')}, Ada: ${punya.toLocaleString('id-ID')})`);
                    }
                }
                if (bahanKurang.length > 0) {
                    return m.reply(`❌ *Bahan Baku Tidak Cukup di Gudang PT!*\n\nKekurangan:\n${bahanKurang.join('\n')}\n\n_Beli bahan baku via: ${usedPrefix+command} buy <jml> <item> <id_pt>_`);
                }

                let voltase = dp.listrik || 3; 
                let totalWattDibutuhkan = jmlProd * voltase;

                let sumberL = pt.sumberListrik || 'negara';
                let provider = null; let hargaL = hargaListrikNegara;

                if (sumberL !== 'negara') {
                    provider = findPTListrikGlobal(sumberL);
                    if (!provider) {
                        sumberL = 'negara'; pt.sumberListrik = 'negara'; hargaL = hargaListrikNegara;
                    } else {
                        hargaL = provider.pt.hargaListrikCustom || 18600;
                        if ((provider.pt.kapasitasTersedia || 0) < totalWattDibutuhkan) {
                            return m.reply(`❌ *PRODUKSI GAGAL!*\nListrik langganan swasta kurang daya!\nDaya Dibutuhkan: ${formatDaya(totalWattDibutuhkan)}`);
                        }
                    }
                }

                let biayaProd = jmlProd * dp.prodCost;
                let biayaListrik = totalWattDibutuhkan * hargaL;
                let totalBiaya = biayaProd + biayaListrik;

                if ((pt.saldo || 0) < totalBiaya) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(totalBiaya)}\nKas PT: ${formatRp(pt.saldo)}`);

                // Potong Resource Di Awal Secara Tunai
                pt.saldo -= totalBiaya;
                if (dp.bahan) {
                    for (let b in dp.bahan) { pt.gudang[b] -= (dp.bahan[b] * jmlProd); }
                }
                
                if (provider) {
                    provider.pt.kapasitasTersedia -= totalWattDibutuhkan;
                    provider.pt.saldo += biayaListrik; 
                }

                // Kalkulasi Waktu Dinamis berdasarkan Jumlah Pekerja (Maksimal Limit 5000 Pekerja = 200ms)
                let pekerja = pt.karyawan || 10;
                let speedMs = Math.max(200, 4000 - Math.floor((Math.min(pekerja, 5000) / 5000) * 3800));
                
                let waktuTotalMs = jmlProd * speedMs;
                let waktuTotalDetik = Math.floor(waktuTotalMs / 1000);
                
                let menit = Math.floor(waktuTotalDetik / 60);
                let jam = Math.floor(menit / 60);
                let sisaDetik = waktuTotalDetik % 60;
                let sisaMenit = menit % 60;
                
                let waktuStr = '';
                if (jam > 0) waktuStr += `${jam} Jam `;
                if (sisaMenit > 0) waktuStr += `${sisaMenit} Menit `;
                if (sisaDetik > 0 || waktuStr === '') waktuStr += `${sisaDetik} Detik`;

                pt.isProduksi = true; // Kunci status produksi PT

                m.reply(
                    `⏳ *PROSES ${dp.type === 'tambang' ? 'PENAMBANGAN' : 'PRODUKSI'} DIMULAI*\n\n` +
                    `🏢 PT: *${pt.name}*\n` +
                    `📦 Mengeksekusi: ${jmlProd.toLocaleString('id-ID')} ${dp.name}\n` +
                    `🚀 Kecepatan: ${speedMs/1000}s / Barang (Didukung ${pekerja} pekerja)\n` +
                    `⏱️ Estimasi Selesai Total: *${waktuStr.trim()}*\n\n` +
                    `*RINCIAN BIAYA KAS (Dipotong Dimuka):*\n` +
                    `> 💸 Total Dipotong: -${formatRp(totalBiaya)}\n` +
                    `> 🛠️ Biaya Alat/Modal: ${formatRp(biayaProd)}\n` +
                    `> ⚡ Biaya Listrik: ${formatRp(biayaListrik)} (${formatDaya(totalWattDibutuhkan)})\n` +
                    `> 🔌 Suplai Listrik: ${provider ? provider.pt.name : 'Negara (PLN)'}\n\n` +
                    `_Barang akan otomatis dicicil masuk ke gudang (${speedMs/1000} detik per item) di latar belakang..._`
                );

                // ==============================
                // SISTEM PRODUKSI REAL-TIME BERTAHAP
                // ==============================
                let diproduksi = 0;
                let intervalId = setInterval(() => {
                    let currentUser = global.db.data.users[m.sender];
                    if (!currentUser || !currentUser.perusahaan || !currentUser.perusahaan[idPt]) {
                        clearInterval(intervalId);
                        return;
                    }
                    
                    let currentPt = currentUser.perusahaan[idPt];
                    
                    currentPt.gudang[dp.db] = (currentPt.gudang[dp.db] || 0) + 1;
                    diproduksi++;

                    if (diproduksi >= jmlProd) {
                        currentPt.isProduksi = false; 
                        clearInterval(intervalId); 
                        
                        conn.reply(m.chat, 
                            `✅ *PROSES ${dp.type === 'tambang' ? 'PENAMBANGAN' : 'PRODUKSI'} RAMPUNG!*\n\n` +
                            `🏢 PT: *${currentPt.name}*\n` +
                            `📦 Berhasil Eksekusi: +${jmlProd.toLocaleString('id-ID')} ${dp.name}\n` +
                            `_Seluruh hasil telah masuk ke Gudang!_`, m
                        );
                    }
                }, speedMs); 
                
                break;
            }

            case 'jual':
            case 'jualsemua':
            case 'sellall': {
                let targetPts = []; let isGlobal = false;
                if (action === 'jual') {
                    if (args[1] !== 'semua') return m.reply(`⚠️ Format: *${usedPrefix+command} jualsemua*`);
                    let id = parseInt(args[2]) - 1;
                    if (!isNaN(id) && user.perusahaan[id] && user.perusahaan[id].type !== 'listrik') targetPts.push(user.perusahaan[id]);
                } else {
                    let id = parseInt(args[1]) - 1;
                    if (!isNaN(id)) {
                        if (user.perusahaan[id] && user.perusahaan[id].type !== 'listrik') targetPts.push(user.perusahaan[id]);
                    } else {
                        isGlobal = true; targetPts = user.perusahaan.filter(p => p && p.type !== 'listrik');
                    }
                }

                if (targetPts.length === 0) return m.reply('❌ Tidak ada PT produksi yang valid.');

                let grandTotalPend = 0; let grandTotalPajak = 0; let grandTotalLogistik = 0;
                let replyMsg = `🛒 *PENJUALAN GROSIR SUKSES*\n\n`; let allMentions = [];

                for (let pt of targetPts) {
                    if (!pt.gudang || Object.keys(pt.gudang).every(k => !(pt.gudang[k] > 0))) {
                        if (!isGlobal) return m.reply(`📦 Gudang *${pt.name}* kosong!`); continue;
                    }

                    let totalPend = 0; let rincian = '';
                    for (let brg in pt.gudang) {
                        let stok = pt.gudang[brg]; if (!stok || stok <= 0) continue;
                        
                        let hargaJual = getMarketPriceSim(brg, false);
                        let profit = stok * hargaJual;
                        totalPend += profit;
                        rincian += `🔸 ${stok.toLocaleString('id-ID')}x ${brg} = ${formatRp(profit)}\n`;
                        
                        if (global.db.data.market[brg]) global.db.data.market[brg].stock += stok;
                        else global.db.data.market[brg] = { stock: 100000 + stok };

                        pt.gudang[brg] = 0; 
                    }

                    if (totalPend === 0) continue;

                    let pajak = Math.floor(totalPend * 0.002);
                    let logistik = Math.floor(totalPend * 0.05);
                    let netPend = totalPend - pajak - logistik;

                    grandTotalPajak += pajak; grandTotalLogistik += logistik; grandTotalPend += netPend;

                    let porsiPT = 0.75;
                    let profitPT = Math.floor(netPend * porsiPT);
                    let profitInvestorPool = netPend - profitPT;

                    let totalInvest = pt.investors ? Object.values(pt.investors).reduce((a,b)=>a+b, 0) : 0;

                    replyMsg += `🏢 *${pt.name}*\n${rincian}`;
                    replyMsg += `> 💰 Omset: ${formatRp(totalPend)}\n`;
                    replyMsg += `> 🚚 Logistik (5%) & Pajak: -${formatRp(logistik + pajak)}\n`;

                    if (totalInvest > 0) {
                        pt.saldo += profitPT;
                        replyMsg += `> 👑 Laba ke Kas PT (75%): +${formatRp(profitPT)}\n`;
                        
                        for (let inv in pt.investors) {
                            let share = pt.investors[inv] / totalInvest;
                            let profitInv = Math.floor(profitInvestorPool * share);
                            if (global.db.data.users[inv]) {
                                global.db.data.users[inv].money += profitInv;
                                replyMsg += `> 💼 @${inv.split('@')[0]}: +${formatRp(profitInv)} (Dividen)\n`;
                                if (!allMentions.includes(inv)) allMentions.push(inv);
                            }
                        }
                    } else {
                        pt.saldo += netPend;
                        replyMsg += `> 👑 Laba ke Kas PT (100%): +${formatRp(netPend)}\n`;
                    }
                    replyMsg += '\n';
                }
                if (grandTotalPend === 0) return m.reply('📦 Tidak ada barang untuk dijual.');
                replyMsg += `━━━━━━━━━━━━━━━━━━━━\n📈 *Total Pendapatan Bersih:* ${formatRp(grandTotalPend)}`;
                return m.reply(replyMsg.trim(), null, { mentions: allMentions });
            }

            case 'buy':
            case 'beli': {
                let jmlProd = parseInt(args[1]); let namaItem = args[2] ? args[2].toLowerCase() : ''; let idPt = parseInt(args[3]) - 1;
                if (!jmlProd || !namaItem || isNaN(idPt)) return m.reply(`⚠️ Format: *${usedPrefix+command} buy <jumlah> <item> <id_pt>*\nContoh: *${usedPrefix+command} buy 1000 aqua 1*`);
                
                let pt = user.perusahaan[idPt];
                if (!pt) return m.reply('❌ ID Perusahaan tidak valid!');
                
                if (!baseHargaPasar[namaItem] && !semuaProduk[namaItem]) return m.reply(`❌ Produk/Bahan Baku *${namaItem}* tidak ditemukan di database distributor!`);

                let hargaBeliSatuan = getMarketPriceSim(namaItem, true);
                let hargaBeliTotal = hargaBeliSatuan * jmlProd;
                let biayaLogistik = Math.floor(hargaBeliTotal * 0.05); 
                let grandTotal = hargaBeliTotal + biayaLogistik;

                if (pt.type !== 'listrik') {
                    let slotSisa = getKapasitasGudang(pt) - getSlotTerpakai(pt.gudang);
                    if (jmlProd > slotSisa) return m.reply(`❌ Gudang PT penuh!\nKapasitas tersisa: ${slotSisa.toLocaleString('id-ID')} slot`);
                }

                if ((pt.saldo || 0) < grandTotal) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(grandTotal)} (termasuk 5% logistik)\nKas PT saat ini: ${formatRp(pt.saldo)}`);

                if (global.db.data.market[namaItem]) {
                    global.db.data.market[namaItem].stock = Math.max(0, global.db.data.market[namaItem].stock - jmlProd);
                } else {
                    global.db.data.market[namaItem] = { stock: Math.max(0, 100000 - jmlProd) };
                }

                pt.saldo -= grandTotal;
                if (!pt.gudang) pt.gudang = {};
                pt.gudang[namaItem] = (pt.gudang[namaItem] || 0) + jmlProd;

                m.reply(`🛒 *PEMBELIAN INSTAN SUKSES*\n\n🏢 Masuk Gudang: *${pt.name}*\n📦 Barang: +${jmlProd.toLocaleString('id-ID')} ${namaItem}\n💸 Total Biaya (inc. Logistik): -${formatRp(grandTotal)}`);
                break;
            }

            case 'tutupinvest':
            case 'bukainvest': {
                let ptId = parseInt(args[1]) - 1;
                if (isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} ${action} <id_pt>*`);
                let pt = user.perusahaan[ptId];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');
                
                pt.investOpen = (action === 'bukainvest');
                m.reply(`✅ Jalur investasi publik untuk *${pt.name}* sekarang *${pt.investOpen ? 'DIBUKA 🟢' : 'DITUTUP 🔴'}*.`);
                break;
            }

            case 'bank': {
                let txt = `🏦 *BANK KORPORASI NEGARA*\n\n`;
                txt += `Bank menyediakan dana segar untuk ekspansi Perusahaan. Pinjaman akan masuk ke *Kas PT*.\n\n`;
                txt += `📊 *Tarif Bunga (Flat saat pinjam):*\n  • < Rp 10 Miliar    : *Bunga 5%*\n  • Rp 10M - Rp 100M  : *Bunga 8%*\n  • > Rp 100 Miliar   : *Bunga 12%*\n\n`;
                txt += `💳 *Limit Perusahaanmu (50% Valuasi Aset):*\n`;
                if (user.perusahaan.length === 0) txt += `  _Belum ada perusahaan._\n`;
                user.perusahaan.forEach((pt, i) => {
                    let asetKotor = hitungAsetKotor(pt);
                    let limit = Math.floor(asetKotor / 2);
                    txt += `  ${i+1}. *${pt.name}*\n     Limit: ${formatRp(limit)}\n     Hutang Aktif: ${formatRp(pt.hutang || 0)}\n`;
                });
                txt += `\n*Command:*\n• Pinjam : *${usedPrefix+command} pinjam <nominal> <id_pt>*\n• Bayar  : *${usedPrefix+command} bayarbank <nominal> <id_pt>*`;
                return m.reply(txt);
            }

            case 'pinjam': {
                let nominal = parseInt(args[1]); let ptId = parseInt(args[2]) - 1;
                if (isNaN(nominal) || isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} pinjam <nominal> <id_pt>*`);
                if (nominal < 1000000) return m.reply(`❌ Minimal pinjaman adalah Rp 1.000.000`);

                let pt = user.perusahaan[ptId];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

                let asetKotor = hitungAsetKotor(pt); let limitPinjaman = Math.floor(asetKotor / 2); let hutangSekarang = pt.hutang || 0;
                if (hutangSekarang + nominal > limitPinjaman) return m.reply(`❌ *Limit Kredit Tidak Cukup!*\n🏢 PT: *${pt.name}*\nBatas Hutang: ${formatRp(limitPinjaman)}\nHutang Aktif: ${formatRp(hutangSekarang)}`);

                let bungaPersen = 0.05; 
                if (nominal >= 100000000000) bungaPersen = 0.12;      
                else if (nominal >= 10000000000) bungaPersen = 0.08;  

                let bebanBunga = Math.floor(nominal * bungaPersen);
                let totalHutangBaru = nominal + bebanBunga;

                pt.saldo = (pt.saldo || 0) + nominal; pt.hutang = hutangSekarang + totalHutangBaru;
                m.reply(`✅ *PINJAMAN CAIR*\nDana ditransfer ke Kas PT *${pt.name}*.\n\n• Cair : *${formatRp(nominal)}*\n• Bunga (${bungaPersen*100}%) : *${formatRp(bebanBunga)}*\n🏦 Total Hutang PT Baru: *${formatRp(pt.hutang)}*`);
                break;
            }

            case 'bayarbank': {
                let nominal = parseInt(args[1]); let ptId = parseInt(args[2]) - 1;
                if (isNaN(nominal) || isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} bayarbank <nominal> <id_pt>*`);
                let pt = user.perusahaan[ptId];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

                let hutangSekarang = pt.hutang || 0;
                if (hutangSekarang <= 0) return m.reply(`✅ *${pt.name}* tidak punya hutang Bank!`);
                if (nominal > hutangSekarang) nominal = hutangSekarang; 
                if ((pt.saldo || 0) < nominal) return m.reply(`❌ Kas PT tidak cukup!\nNominal Bayar: ${formatRp(nominal)}\nKas PT: ${formatRp(pt.saldo)}`);

                pt.saldo -= nominal; pt.hutang -= nominal;
                m.reply(`✅ *PEMBAYARAN HUTANG SUKSES*\n🏢 PT: *${pt.name}*\n💳 Kas PT: -${formatRp(nominal)}\n🏦 Sisa Hutang: *${formatRp(pt.hutang)}*`);
                break;
            }

            case 'buatpembangkit': {
                let idPtL = parseInt(args[1]) - 1; let jenis = args[2] ? args[2].toUpperCase() : '';
                if (isNaN(idPtL) || !kapasitasPembangkit[jenis]) {
                    let listJenis = Object.keys(kapasitasPembangkit).map(k => `  • *${k}* — ${formatRp(hargaPembangkit[k])} (+${formatDaya(kapasitasPembangkit[k], true)}/30mnt)`).join('\n');
                    return m.reply(`⚠️ *Format:* *${usedPrefix+command} buatpembangkit <id_pt> <jenis>*\n\n*Katalog Ekstra Pembangkit:*\n${listJenis}`);
                }
                let pt = user.perusahaan[idPtL];
                if (!pt || pt.type !== 'listrik') return m.reply('❌ ID Perusahaan bukan tipe Listrik!');
                if (!pt.ekstraPembangkit) pt.ekstraPembangkit = [];
                
                let maxPembangkit = 12 + Math.floor((pt.karyawan || 10) / 500);
                if (pt.ekstraPembangkit.length >= maxPembangkit) return m.reply(`❌ Slot Ekstra Pembangkit Aktif penuh (Maksimal ${maxPembangkit})!\n_Tips: Tambah 500 pekerja per 1 slot untuk bisa menambah mesin lagi._`);

                let harga = hargaPembangkit[jenis];
                if ((pt.saldo || 0) < harga) return m.reply(`❌ Kas PT kurang! Butuh: ${formatRp(harga)}`);
                pt.saldo -= harga; pt.ekstraPembangkit.push(jenis);
                m.reply(`✅ *PEMBANGUNAN BERHASIL*\n🏭 *${pt.name}* memasang *${jenis}*.\n💳 Kas PT: -${formatRp(harga)}`);
                break;
            }

            case 'setpembangkit': {
                let idPtL = parseInt(args[1]) - 1; let jenis = args[2] ? args[2].toUpperCase() : '';
                if (isNaN(idPtL) || !kapasitasPembangkit[jenis]) return m.reply(`⚠️ Format: *${usedPrefix+command} setpembangkit <id_pt> <jenis>*`);
                let ptL = user.perusahaan[idPtL];
                if (!ptL || ptL.type !== 'listrik') return m.reply('❌ Bukan PT tipe Listrik!');
                ptL.pembangkit = jenis; ptL.generationRate = kapasitasPembangkit[jenis];
                m.reply(`⚡ Generator utama *${ptL.name}* diubah menjadi *${jenis}*!`);
                break;
            }

            case 'upgrade': {
                let tipeUpgrade = args[1] ? args[1].toLowerCase() : ''; let idPt = parseInt(args[2]) - 1; let jmlLevel = parseInt(args[3]) || 1;
                if (!['gudang', 'listrik'].includes(tipeUpgrade) || isNaN(idPt)) return m.reply(`⚠️ Format: *${usedPrefix+command} upgrade <gudang|listrik> <id_pt> [jml]*`);
                let pt = user.perusahaan[idPt]; if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

                if (tipeUpgrade === 'gudang') {
                    if (pt.type === 'listrik') return m.reply('❌ Hanya untuk PT Non-Listrik!');
                    let currentLevel = pt.gudangLevel || 1;
                    if (currentLevel >= MAX_LEVEL_GUDANG) return m.reply(`❌ Gudang sudah mencapai level maksimal (Lv ${MAX_LEVEL_GUDANG})!`);
                    
                    let allowedLevel = Math.min(jmlLevel, MAX_LEVEL_GUDANG - currentLevel);
                    let totalBiaya = allowedLevel * HARGA_UPGRADE_GUDANG;
                    
                    if ((pt.saldo || 0) < totalBiaya) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(totalBiaya)}\nKas PT: ${formatRp(pt.saldo)}`);
                    pt.saldo -= totalBiaya; pt.gudangLevel = currentLevel + allowedLevel;
                    m.reply(`📦 Gudang diupgrade ke Lv *${pt.gudangLevel}*\nKapasitas Baru: ${getKapasitasGudang(pt).toLocaleString('id-ID')} Slot\n💸 Kas PT Terpotong: -${formatRp(totalBiaya)}`);
                } else {
                    if (pt.type !== 'listrik') return m.reply('❌ Hanya untuk PT LISTRIK!');
                    let currentLevel = pt.listrikLevel || 1;
                    if (currentLevel >= MAX_LEVEL_LISTRIK) return m.reply(`❌ Kapasitas Listrik sudah mencapai level maksimal (Lv ${MAX_LEVEL_LISTRIK})!`);
                    
                    let allowedLevel = Math.min(jmlLevel, MAX_LEVEL_LISTRIK - currentLevel);
                    let totalBiaya = allowedLevel * HARGA_UPGRADE_LISTRIK;
                    
                    if ((pt.saldo || 0) < totalBiaya) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(totalBiaya)}\nKas PT: ${formatRp(pt.saldo)}`);
                    pt.saldo -= totalBiaya; pt.listrikLevel = currentLevel + allowedLevel;
                    m.reply(`⚡ Kapasitas Listrik diupgrade ke Lv *${pt.listrikLevel}*\nKapasitas Maksimal Baru: ${formatDaya(getKapasitasListrik(pt))}\n💸 Kas PT: -${formatRp(totalBiaya)}`);
                }
                break;
            }

            case 'pabrik': {
                let idPt = parseInt(args[1]) - 1; let tipePabrik = args[2] ? args[2].toLowerCase() : ''; let namaPabrik = args.slice(3).join(' ');
                
                if (isNaN(idPt) || !biayaPabrikObj[tipePabrik] || !namaPabrik) {
                    let tutPabrik = `🏭 *TUTORIAL BANGUN ANAK PABRIK*\n\n` +
                                    `Fungsi anak pabrik adalah membuat Perusahaanmu bisa memproduksi *lintas tipe barang*. (Batas maksimal 2 pabrik per PT).\n\n` +
                                    `*Format Pembangunan:*\n` +
                                    `*${usedPrefix+command} pabrik <id_pt_mu> <tipe_pabrik> <Nama Pabrik>*\n\n` +
                                    `*Katalog Tipe & Harga Pabrik:*\n` +
                                    `• *daurulang* — ${formatRp(biayaPabrikObj['daurulang'])}\n` +
                                    `• *minuman* — ${formatRp(biayaPabrikObj['minuman'])}\n` +
                                    `• *tambang* — ${formatRp(biayaPabrikObj['tambang'])}\n` +
                                    `• *senjata* — ${formatRp(biayaPabrikObj['senjata'])}\n\n` +
                                    `_Contoh: ${usedPrefix+command} pabrik 1 senjata Pabrik Besi Baja_`;
                    return m.reply(tutPabrik);
                }

                let pt = user.perusahaan[idPt]; if (!pt || pt.type === 'listrik') return m.reply('❌ Gagal! ID PT tidak valid.');
                if (pt.pabrik.length >= 2) return m.reply('❌ Perusahaanmu sudah mencapai batas maksimal 2 anak pabrik!');
                
                let hargaP = biayaPabrikObj[tipePabrik];
                if ((pt.saldo || 0) < hargaP) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(hargaP)}\nKas PT: ${formatRp(pt.saldo)}`);
                
                pt.saldo -= hargaP; pt.pabrik.push({ name: namaPabrik, type: tipePabrik, karyawan: 10 });
                m.reply(`🏭 Pabrik *${namaPabrik}* berhasil dibangun!\n💸 Kas PT Terpotong: -${formatRp(hargaP)}\n\n_Ketik *${usedPrefix+command} infopabrik* untuk panduan cara menjalankan produksi._`);
                break;
            }

            case 'infopabrik': {
                let txt = `🏭 *PANDUAN OPERASIONAL PABRIK & PRODUKSI*\n\n`;
                txt += `Setelah kamu memiliki Induk PT atau Anak Pabrik, ini langkah-langkah untuk menjalankan bisnis produksinya:\n\n`;
                
                txt += `*1. Persiapan Bahan Baku & Modal*\n`;
                txt += `Setiap produksi butuh bahan baku dan biaya operasi. Kamu bisa memborong bahan baku di pasar global menggunakan command:\n`;
                txt += `➡️ *${usedPrefix+command} buy <jml> <item> <id_pt>*\n`;
                txt += `_(Contoh: .pt buy 1000 aqua 1)_\n\n`;

                txt += `*2. Persediaan Listrik (Wajib)*\n`;
                txt += `Produksi menyedot banyak energi. Pastikan PT kamu terhubung ke PLN atau beli lisrik swasta yang lebih murah:\n`;
                txt += `➡️ *${usedPrefix+command} setlistrik <id_pt_mu> negara* (PLN)\n`;
                txt += `➡️ *${usedPrefix+command} ceklistrik* (Mencari tarif termurah)\n\n`;

                txt += `*3. Pekerja, Kecepatan & Gaji*\n`;
                txt += `Waktu standar produksi adalah 4 detik per barang. Kamu bisa mempercepat ini (sampai maksimal 0.2 detik/barang di 5000 Pekerja) dengan merekrut karyawan! Khusus PT Listrik, setiap 500 pekerja menambah 1 slot Ekstra Pembangkit (Jika pekerja turun, ekstra pembangkit akan nonaktif).\n`;
                txt += `⚠️ *PERHATIAN:* Pekerja wajib digaji Rp365.000 per orang setiap 3 Hari. Jika Kas PT tidak cukup untuk menggaji semua pekerja, maka pekerja yang tidak dibayar akan otomatis *RESIGN (Keluar)* dari Perusahaanmu!\n`;
                txt += `➡️ *${usedPrefix+command} rekrut <jml> <id_pt>*\n`;
                txt += `_(Contoh: .pt rekrut 5000 1)_\n\n`;

                txt += `*4. Proses Produksi*\n`;
                txt += `Jika bahan baku, modal, dan listrik sudah siap di gudang PT, mulai buat barang dengan:\n`;
                txt += `➡️ *${usedPrefix+command} produksi <jml> <item> <id_pt>*\n`;
                txt += `_(Contoh: .pt produksi 100 tehbotol 1)_\n\n`;

                txt += `*5. Distribusi & Penjualan (Gajian!)*\n`;
                txt += `Jual seluruh barang yang ada di gudang ke Pasar Global untuk mendapatkan Omset, membayar pajak, logistik, dan membagikan dividen ke investor:\n`;
                txt += `➡️ *${usedPrefix+command} jualsemua <id_pt>*\n\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n`;

                txt += `📚 *KATALOG RESEP BARANG BERDASARKAN TIPE PABRIK:*\n\n`;
                
                txt += `💧 *Tipe: MINUMAN*\n`;
                txt += `  • *Air Mineral* (Butuh: 1 aqua, 1 botol) - Daya: 2 W/item\n`;
                txt += `  • *Teh Botol* (Butuh: 1 aqua, 1 botol, 2 daunteh, 1 tebu) - Daya: 3 W/item\n\n`;
                
                txt += `♻️ *Tipe: DAUR ULANG*\n`;
                txt += `  • *Botol* (Butuh: 5 sampah, 1 kardus) - Daya: 2 W/item\n`;
                txt += `  • *Kayu* (Tanpa Bahan Baku, hanya butuh Listrik) - Daya: 3.5 W/item\n\n`;
                
                txt += `⛏️ *Tipe: TAMBANG*\n`;
                txt += `  • *Pasir* (Tanpa Bahan Baku, hanya butuh listrik & modal) - Daya: 3 W/item\n`;
                txt += `  • *Iron* (Tanpa Bahan Baku, hanya butuh listrik & modal) - Daya: 6 W/item\n`;
                txt += `  • *Emas Mentah* (Tanpa Bahan Baku, hanya butuh listrik & modal) - Daya: 10 W/item\n\n`;
                
                txt += `⚔️ *Tipe: SENJATA*\n`;
                txt += `  • *Sword* (Butuh: 5 iron, 2 kayu) - Daya: 8 W/item\n\n`;
                
                txt += `_Makin kompleks barang yang diproduksi, makin besar cuan-nya! Selamat berbisnis!_`;
                
                return m.reply(txt);
            }

            case 'settarif': {
                let idPtL = parseInt(args[1]) - 1; let tarif = parseInt(args[2]);
                if (isNaN(idPtL) || isNaN(tarif) || tarif < 1) return m.reply(`⚠️ Format: *${usedPrefix+command} settarif <id_pt_listrik> <harga_per_W>*`);
                let ptL = user.perusahaan[idPtL]; if (!ptL || ptL.type !== 'listrik') return m.reply('❌ Bukan PT tipe Listrik!');
                if (tarif < 1000) return m.reply(`❌ Tarif minimum ${formatRp(1000)}/W.`);
                ptL.hargaListrikCustom = tarif; m.reply(`✅ Tarif *${ptL.name}* diset ke *${formatRp(tarif)}/W*`);
                break;
            }

            case 'ceklistrik': {
                let allUsers = global.db.data.users;
                let globalListrik = [];

                for (let uid in allUsers) {
                    let u = allUsers[uid];
                    if (u && Array.isArray(u.perusahaan)) {
                        u.perusahaan.forEach((p, i) => {
                            if (p && p.type === 'listrik') globalListrik.push({ uid, ownerName: u.name || uid.split('@')[0], pt: p, localId: i + 1 });
                        });
                    }
                }

                globalListrik.sort((a, b) => (a.pt.hargaListrikCustom || 18600) - (b.pt.hargaListrikCustom || 18600));

                let txt = `⚡ *PASAR LISTRIK GLOBAL*\n_Hemat biaya operasional dengan langganan Listrik Swasta! (Pilih yang murah & stok banyak)_\n\n`;
                txt += `🔵 *Listrik Negara (PLN)*\n   Tarif : *${formatRp(hargaListrikNegara)} / Watt*\n   Stok  : ♾️ Tidak Terbatas\n   Set   : *${usedPrefix+command} setlistrik <id_pt_mu> negara*\n\n`;
                txt += `🟡 *Listrik Swasta (Pemain Lain)*\n`;
                
                if (globalListrik.length === 0) txt += `   _(Belum ada perusahaan listrik swasta yang terdaftar)_\n`;
                else {
                    globalListrik.forEach((gl) => {
                        let pt = gl.pt; let tarif = pt.hargaListrikCustom || 18600;
                        let kapMax = getKapasitasListrik(pt); let tersedia = pt.kapasitasTersedia || 0;
                        txt += `🏢 *${pt.name}* (Milik @${gl.uid.split('@')[0]})\n`;
                        txt += `   Tarif  : *${formatRp(tarif)} / Watt*\n`;
                        txt += `   Stok   : ${formatDaya(tersedia)} / ${formatDaya(kapMax)}\n`;
                        txt += `   [${progressBar(tersedia, kapMax, 8)}]\n`;
                        txt += `   Set    : *${usedPrefix+command} setlistrik <id_pt_mu> @${gl.uid.split('@')[0]} ${gl.localId}*\n\n`;
                    });
                }
                return m.reply(txt.trim());
            }

            case 'setlistrik': {
                let idPtTarget = parseInt(args[1]) - 1; let pt = user.perusahaan[idPtTarget];
                if (!pt || pt.type === 'listrik') return m.reply('❌ ID Perusahaan Produksi tidak valid!');

                let param2 = args[2] ? args[2].toLowerCase() : '';
                if (param2 === 'negara') { pt.sumberListrik = 'negara'; return m.reply(`✅ *${pt.name}* kini memakai listrik PLN (Negara).`); }

                let targetMention = args[2]; let idPtL = parseInt(args[3]) - 1;
                if (!targetMention || isNaN(idPtL)) return m.reply(`⚠️ *Format:* *${usedPrefix+command} setlistrik <id_pt_mu> <@tag_pemilik> <id_pt_listrik_mereka>*`);

                let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                let targetUser = global.db.data.users[target];

                if (!targetUser || !targetUser.perusahaan) return m.reply(`❌ Pemilik listrik swasta tidak ditemukan.`);
                let ptL = targetUser.perusahaan[idPtL];
                if (!ptL || ptL.type !== 'listrik') return m.reply(`❌ ID Perusahaan Listrik swasta target tidak valid!`);

                pt.sumberListrik = ptL.id; 
                m.reply(`✅ Berhasil! *${pt.name}* kini terhubung ke jaringan listrik swasta dari *${ptL.name}* milik @${target.split('@')[0]}`, null, {mentions: [target]});
                break;
            }

            case 'setor': case 'tarik': {
                let jumlah = parseInt(args[1]); let tipeAsset = args[2] ? args[2].toLowerCase() : ''; let ptId = parseInt(args[3]) - 1;
                if (isNaN(jumlah) || !tipeAsset || isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} ${action} <jumlah> <uang|item> <id_pt>*`);
                let pt = user.perusahaan[ptId]; if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');
                if (!pt.gudang) pt.gudang = {};

                if (action === 'setor') {
                    if (tipeAsset === 'uang' || tipeAsset === 'money') {
                        if (user.money < jumlah) return m.reply('❌ Uang di dompet pribadimu kurang!');
                        user.money -= jumlah; pt.saldo += jumlah;
                        m.reply(`✅ Setor ${formatRp(jumlah)} → Kas *${pt.name}*`);
                    } else {
                        if ((user[tipeAsset] || 0) < jumlah) return m.reply(`❌ Kamu tidak punya ${jumlah} *${tipeAsset}* di tas!`);
                        if (pt.type !== 'listrik') {
                            let slotSisa = getKapasitasGudang(pt) - getSlotTerpakai(pt.gudang);
                            if (jumlah > slotSisa) return m.reply(`❌ Gudang tidak cukup! Sisa slot: ${slotSisa}`);
                        }
                        user[tipeAsset] -= jumlah; pt.gudang[tipeAsset] = (pt.gudang[tipeAsset] || 0) + jumlah;
                        m.reply(`✅ Setor ${jumlah.toLocaleString('id-ID')} ${tipeAsset} → Gudang *${pt.name}*`);
                    }
                } else {
                    if (tipeAsset === 'uang' || tipeAsset === 'money') {
                        if ((pt.saldo || 0) < jumlah) return m.reply('❌ Saldo kas PT kurang!');
                        pt.saldo -= jumlah; user.money += jumlah;
                        m.reply(`✅ Tarik ${formatRp(jumlah)} ← Kas *${pt.name}*`);
                    } else {
                        if ((pt.gudang[tipeAsset] || 0) < jumlah) return m.reply('❌ Stok barang di gudang PT tidak cukup!');
                        pt.gudang[tipeAsset] -= jumlah; user[tipeAsset] = (user[tipeAsset] || 0) + jumlah;
                        m.reply(`✅ Tarik ${jumlah.toLocaleString('id-ID')} ${tipeAsset} ← Gudang *${pt.name}*`);
                    }
                }
                break;
            }

            case 'invest': {
                let nominal = parseInt(args[1]); let targetMention = args[2]; let ptId = parseInt(args[3]) - 1;
                if (isNaN(nominal) || !targetMention || isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} invest <nominal> <@tag/nomor> <id_pt>*`);
                if (nominal < 1000000) return m.reply(`❌ Minimal investasi Rp1.000.000`);

                let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                let targetUser = global.db.data.users[target];
                if (!targetUser || !targetUser.perusahaan) return m.reply(`❌ User tidak ditemukan.`);
                let pt = targetUser.perusahaan[ptId];
                if (!pt) return m.reply(`❌ ID Perusahaan target tidak ditemukan!`);

                if (pt.investOpen === false) return m.reply(`❌ Maaf, Perusahaan ini sedang *MENUTUP* jalur investasi publik!`);
                if (user.money < nominal) return m.reply(`❌ Uangmu kurang!`);

                user.money -= nominal;
                pt.saldo = (pt.saldo || 0) + nominal; 
                if (!pt.investors) pt.investors = {};
                pt.investors[m.sender] = (pt.investors[m.sender] || 0) + nominal;

                m.reply(`✅ *INVESTASI BERHASIL*\nMenyuntikkan dana *${formatRp(nominal)}* ke *${pt.name}* milik @${target.split('@')[0]}`, null, { mentions: [target] });
                break;
            }

            case 'tarikinvest': {
                let nominal = parseInt(args[1]); let targetMention = args[2]; let ptId = parseInt(args[3]) - 1;
                if (isNaN(nominal) || !targetMention || isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} tarikinvest <nominal> <@tag/nomor> <id_pt>*`);

                let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                let targetUser = global.db.data.users[target];
                if (!targetUser || !targetUser.perusahaan) return m.reply(`❌ User tidak valid.`);
                let pt = targetUser.perusahaan[ptId];
                if (!pt) return m.reply(`❌ ID Perusahaan target tidak ditemukan!`);

                if (!pt.investors || !pt.investors[m.sender] || pt.investors[m.sender] < nominal) return m.reply(`❌ Sahammu tidak cukup!`);
                if ((pt.saldo || 0) < nominal) return m.reply(`❌ Kas PT target kosong, tidak bisa menarik modal sekarang.`);

                pt.saldo -= nominal;
                pt.investors[m.sender] -= nominal;
                user.money += nominal;
                if (pt.investors[m.sender] <= 0) delete pt.investors[m.sender];

                m.reply(`✅ *PENARIKAN BERHASIL*\nMenarik *${formatRp(nominal)}* dari saham *${pt.name}*`);
                break;
            }

            case 'ihsg': case 'leaderboard': case 'lb': {
                let allUsers = global.db.data.users; let entries = [];
                for (let uid in allUsers) {
                    let u = allUsers[uid];
                    if (!Array.isArray(u.perusahaan)) continue;
                    u.perusahaan.forEach(pt => {
                        if (!pt) return;
                        entries.push({ owner: u.name || uid.split('@')[0], name: pt.name, type: pt.type, saldo: pt.saldo || 0, valuasi: hitungValuasi(pt) });
                    });
                }
                if (!entries.length) return m.reply('📊 Belum ada perusahaan.');
                entries.sort((a, b) => b.valuasi - a.valuasi);
                
                let top = entries.slice(0, 10); let total = entries.reduce((s, e) => s + e.valuasi, 0);
                let board = top.map((e, i) => `${i+1}. *${e.name}* (${e.type})\n👤 ${e.owner} | 💹 ~${formatSingkat(e.valuasi)}\n💰 Kas: ${formatRp(e.saldo)}`).join('\n\n');
                m.reply(`📊 *IHSG — LEADERBOARD*\n━━━━━━━━━━━━━━━━━━━━\n💼 Total Valuasi: ~${formatSingkat(total)}\n━━━━━━━━━━━━━━━━━━━━\n\n${board}`);
                break;
            }

            default: {
                m.reply(
                    `🏢 *MANAJEMEN PERUSAHAAN & SAHAM*\n\n` +
                    `🏛️ *PT & SAHAM*\n• *${usedPrefix+command} buat <tipe> <nama>*\n• *${usedPrefix+command} info [@tag]*\n• *${usedPrefix+command} tutup/bukainvest <id_pt>*\n\n` +
                    `🤝 *B2B KERJASAMA*\n• *${usedPrefix+command} kirim <jumlah> <uang|item> <id_pt_mu> <@tag_partner> <id_pt_partner>*\n\n` +
                    `🏦 *BANK KORPORASI*\n• *${usedPrefix+command} bank / pinjam / bayarbank*\n\n` +
                    `⚡ *LISTRIK & ENERGI*\n• *${usedPrefix+command} ceklistrik* _(Pasar Listrik Global)_\n• *${usedPrefix+command} setlistrik <id_pt> <negara|@tag_org> <id_pt_org>*\n• *${usedPrefix+command} buatpembangkit <id> <jenis>*\n• *${usedPrefix+command} upgrade listrik <id> <jml_lv>*\n• *${usedPrefix+command} settarif <id_listrik> <tarif>*\n\n` +
                    `🏭 *PRODUKSI & PABRIK*\n• *${usedPrefix+command} infopabrik* _(📖 Tutorial & Resep Barang)_\n• *${usedPrefix+command} pabrik <id_pt> <tipe> <nama>*\n• *${usedPrefix+command} upgrade gudang <id_pt> <jml_lv>*\n• *${usedPrefix+command} rekrut/pecat <jml> <id_pt>* _(Pekerja mempercepat produksi)_\n• *${usedPrefix+command} produksi <jml> <item> <id_pt>*\n\n` +
                    `⚙️ *OPERASIONAL*\n• *${usedPrefix+command} setor/tarik <jml> <uang|item> <id_pt>*\n• *${usedPrefix+command} buy <jml> <item> <id_pt>*\n• *${usedPrefix+command} jualsemua [id_pt]*\n\n` +
                    `📊 *BURSA*\n• *${usedPrefix+command} ihsg*`
                );
                break;
            }
        }
    } catch (e) { console.error('ERROR:', e); m.reply(`❌ *Terjadi Kesalahan Sistem!*\nError: ${e.message}`); }
};

handler.help    = ['perusahaan'];
handler.tags    = ['rpg'];
handler.command = /^(perusahaan|pt|company)$/i;

module.exports = handler;
