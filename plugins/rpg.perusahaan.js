// ==========================================
// KONFIGURASI HARGA & BIAYA
// ==========================================
const biayaInduk = {
    'produksi': 50000000000,   // 50 Miliar
    'listrik':  100000000000   // 100 Miliar
};

const biayaPabrikObj = {
    'daurulang': 10000000000,
    'minuman':   20000000000,
    'tambang':   50000000000,
    'senjata':   80000000000
};

const hargaListrikNegara  = 14400;   // Rp/W PLN
const HARGA_UPGRADE_GUDANG = 4000000; // Rp/level — maks 5000 level
const HARGA_UPGRADE_LISTRIK = 1000000; // Rp/level — maks 3500 level
const MAX_LEVEL_GUDANG  = 5000;
const MAX_LEVEL_LISTRIK = 3500;

// Slot gudang per level  : 125 slot × level
// Kapasitas listrik/level: 1200 W × level  (termasuk kapasitas jual & refill)
const slotPerLevel    = 125;   // PT Produksi: slot gudang per level
const wattPerLevel    = 1200;  // PT Listrik : kapasitas max W per level

// Refill listrik tiap 30 menit = generationRate W per periode
// generationRate ditentukan dari jenis pembangkit (diset lewat .pt setpembangkit)
const kapasitasPembangkit = {
    'PLTU':  4000,
    'PLTS':  8000,
    'PLTB':  10000,
    'PLTP':  20000,
    'PLTA':  120000,
    'PLTN':  200000
};

// ==========================================
// DATABASE BARANG PRODUKSI
// ==========================================
const semuaProduk = {
    'airmineral': { type: 'minuman',   name: 'Air Mineral', db: 'airmineral', prodCost: 5000,   baseHargaToko: 15000   },
    'tehbotol':   { type: 'minuman',   name: 'Teh Botol',   db: 'tehbotol',   prodCost: 8000,   baseHargaToko: 20000   },
    'botol':      { type: 'daurulang', name: 'Botol',       db: 'botol',      prodCost: 1000,   baseHargaToko: 5000    },
    'kayu':       { type: 'daurulang', name: 'Kayu',        db: 'kayu',       prodCost: 3000,   baseHargaToko: 10000   },
    'pasir':      { type: 'tambang',   name: 'Pasir',       db: 'pasir',      prodCost: 3000,   baseHargaToko: 220000  },
    'iron':       { type: 'tambang',   name: 'Iron',        db: 'iron',       prodCost: 15000,  baseHargaToko: 80000   },
    'emas':       { type: 'tambang',   name: 'Emas',        db: 'emas',       prodCost: 500000, baseHargaToko: 2675000 },
    'sword':      { type: 'senjata',   name: 'Sword',       db: 'sword',      prodCost: 50000,  baseHargaToko: 250000  }
};

// ==========================================
// HELPERS
// ==========================================
function formatRp(n) {
    return 'Rp ' + (n || 0).toLocaleString('id-ID');
}
function formatSingkat(n) {
    n = n || 0;
    if (n >= 1e12) return (n / 1e12).toFixed(2) + ' T';
    if (n >= 1e9)  return (n / 1e9).toFixed(2)  + ' M';
    if (n >= 1e6)  return (n / 1e6).toFixed(2)  + ' Jt';
    return n.toLocaleString('id-ID');
}
function progressBar(val, max, len = 10) {
    let filled = Math.round((val / Math.max(1, max)) * len);
    filled = Math.min(len, Math.max(0, filled));
    return '█'.repeat(filled) + '░'.repeat(len - filled);
}
function getHargaListrik(user, ptProduksi) {
    let src = ptProduksi.sumberListrik || 'negara';
    if (src === 'negara') return hargaListrikNegara;
    let ptL = user.perusahaan.find(p => p && p.type === 'listrik' && p.id == src);
    return ptL ? (ptL.hargaListrikCustom || 18600) : hargaListrikNegara;
}

// Kapasitas gudang maksimal (dalam slot/jenis item) berdasarkan level
function getKapasitasGudang(pt) {
    return (pt.gudangLevel || 1) * slotPerLevel;
}

// Kapasitas listrik maksimal (W) berdasarkan level
function getKapasitasListrik(pt) {
    return (pt.listrikLevel || 1) * wattPerLevel;
}

// Hitung total slot terpakai di gudang
function getSlotTerpakai(gudang) {
    if (!gudang) return 0;
    return Object.values(gudang).reduce((s, v) => s + (v || 0), 0);
}

function hitungValuasi(pt) {
    let val = pt.saldo || 0;
    if (pt.gudang) {
        for (let brg in pt.gudang) {
            let stok = pt.gudang[brg] || 0;
            if (stok <= 0) continue;
            let pd = semuaProduk[brg];
            val += stok * (pd ? pd.baseHargaToko : 0);
        }
    }
    if (Array.isArray(pt.pabrik)) {
        pt.pabrik.forEach(f => { val += biayaPabrikObj[f.type] || 0; });
    }
    val += biayaInduk[pt.type] || 0;
    // Tambah nilai upgrade
    if (pt.type === 'produksi') val += ((pt.gudangLevel || 1) - 1) * HARGA_UPGRADE_GUDANG;
    if (pt.type === 'listrik')  val += ((pt.listrikLevel || 1) - 1) * HARGA_UPGRADE_LISTRIK;
    return val;
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
        if (!global.db.data.ihsg)   global.db.data.ihsg   = { history: [], lastUpdate: 0 };

        if (!Array.isArray(user.perusahaan)) user.perusahaan = [];
        user.perusahaan = user.perusahaan.filter(pt => pt !== null && pt !== undefined);

        let now = Date.now();

        // ==========================================
        // AUTO: REFILL LISTRIK & POTONG PAJAK
        // ==========================================
        user.perusahaan.forEach(pt => {
            if (!pt) return;

            // Inisialisasi field yang mungkin belum ada (untuk data lama)
            if (pt.type === 'produksi' && !pt.gudangLevel)  pt.gudangLevel  = 1;
            if (pt.type === 'listrik'  && !pt.listrikLevel) pt.listrikLevel = 1;

            // Refill listrik tiap 30 menit
            if (pt.type === 'listrik') {
                let periods = Math.floor((now - (pt.lastGenerate || now)) / 1800000);
                if (periods >= 1) {
                    let kapMax    = getKapasitasListrik(pt);
                    let genRate   = pt.generationRate || 4000;
                    let remaining = kapMax - (pt.kapasitasTersedia || 0);
                    if (remaining > 0) {
                        let gen = Math.min(remaining, genRate * periods);
                        pt.kapasitasTersedia = (pt.kapasitasTersedia || 0) + gen;
                    }
                    pt.lastGenerate = now;
                }
            }

            // Pajak 0.2% tiap 24 jam
            if (!pt.lastTax) pt.lastTax = now;
            let daysPassed = Math.floor((now - pt.lastTax) / 86400000);
            if (daysPassed >= 1) {
                let tax  = Math.floor((pt.saldo || 0) * 0.002 * daysPassed);
                pt.saldo = Math.max(0, (pt.saldo || 0) - tax);
                pt.lastTax += daysPassed * 86400000;
            }
        });

        let action = args[0] ? args[0].toLowerCase() : 'help';

        switch (action) {

            // ==============================
            // 1. BUAT PERUSAHAAN
            // ==============================
            case 'buat': {
                let tipePT = args[1] ? args[1].toLowerCase() : '';
                let namaPT = args.slice(2).join(' ');

                if (!['produksi', 'listrik'].includes(tipePT) || !namaPT)
                    return m.reply(
                        `⚠️ *Format Salah!*\n\n` +
                        `*${usedPrefix+command} buat <produksi/listrik> <Nama PT>*\n\n` +
                        `Contoh:\n` +
                        `• *${usedPrefix+command} buat produksi PT Maju Jaya*\n` +
                        `• *${usedPrefix+command} buat listrik PT Energi Nusantara*\n\n` +
                        `💰 Modal:\n` +
                        `• Produksi : ${formatRp(biayaInduk.produksi)}\n` +
                        `• Listrik  : ${formatRp(biayaInduk.listrik)}\n\n` +
                        `_(Maksimal 2 PT per orang)_`
                    );

                if (user.perusahaan.length >= 2)
                    return m.reply('❌ Batas kepemilikan maksimal adalah *2 Perusahaan Induk*!');

                let hargaBuat = biayaInduk[tipePT];
                if (user.money < hargaBuat)
                    return m.reply(`❌ Uangmu kurang!\nButuh ${formatRp(hargaBuat)} untuk mendirikan PT *${tipePT.toUpperCase()}*.`);

                user.money -= hargaBuat;

                let newPT = {
                    id:      now,
                    name:    namaPT,
                    type:    tipePT,
                    saldo:   0,
                    lastTax: now,
                    pabrik:  [],
                    gudang:  {}
                };

                if (tipePT === 'listrik') {
                    newPT.listrikLevel       = 1;
                    newPT.kapasitasTersedia  = wattPerLevel; // level 1 = 1200 W
                    newPT.generationRate     = 4000;         // Default PLTU
                    newPT.pembangkit         = 'PLTU';
                    newPT.hargaListrikCustom = 18600;
                    newPT.lastGenerate       = now;
                }
                if (tipePT === 'produksi') {
                    newPT.gudangLevel   = 1;
                    newPT.sumberListrik = 'negara';
                }

                user.perusahaan.push(newPT);
                m.reply(
                    `🎉 *PERUSAHAAN BERHASIL DIDIRIKAN!*\n` +
                    `🏢 *${namaPT}*\n` +
                    `Tipe : ${tipePT.toUpperCase()}\n` +
                    `Modal: -${formatRp(hargaBuat)}\n\n` +
                    (tipePT === 'produksi'
                        ? `📦 Gudang Level 1 — ${slotPerLevel} slot\n\n` +
                          `_Selanjutnya:\n• *${usedPrefix+command} pabrik* — bangun anak pabrik\n• *${usedPrefix+command} setlistrik* — pilih sumber listrik\n• *${usedPrefix+command} upgrade gudang* — perluas gudang_`
                        : `⚡ Kapasitas Level 1 — ${wattPerLevel.toLocaleString('id-ID')} W\n\n` +
                          `_Selanjutnya:\n• *${usedPrefix+command} settarif* — atur harga jual listrik\n• *${usedPrefix+command} setpembangkit* — ganti jenis pembangkit\n• *${usedPrefix+command} upgrade listrik* — tingkatkan kapasitas_`)
                );
                break;
            }

            // ==============================
            // 2. UPGRADE (GUDANG / LISTRIK)
            // ==============================
            case 'upgrade': {
                // .pt upgrade <gudang|listrik> <id_pt> [jumlah_level]
                let tipeUpgrade = args[1] ? args[1].toLowerCase() : '';
                let idPt        = parseInt(args[2]) - 1;
                let jmlLevel    = parseInt(args[3]) || 1;

                if (!['gudang', 'listrik'].includes(tipeUpgrade) || isNaN(idPt))
                    return m.reply(
                        `⚠️ Format: *${usedPrefix+command} upgrade <gudang|listrik> <id_pt> [jumlah_level]*\n\n` +
                        `Contoh:\n` +
                        `• *${usedPrefix+command} upgrade gudang 1 10*  _(naik 10 level)_\n` +
                        `• *${usedPrefix+command} upgrade listrik 2 5*  _(naik 5 level)_\n\n` +
                        `💰 Harga:\n` +
                        `• Gudang  : ${formatRp(HARGA_UPGRADE_GUDANG)}/level (maks Lv ${MAX_LEVEL_GUDANG.toLocaleString()})\n` +
                        `• Listrik : ${formatRp(HARGA_UPGRADE_LISTRIK)}/level (maks Lv ${MAX_LEVEL_LISTRIK.toLocaleString()})`
                    );

                let pt = user.perusahaan[idPt];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

                if (tipeUpgrade === 'gudang') {
                    if (pt.type !== 'produksi')
                        return m.reply('❌ Upgrade *Gudang* hanya untuk PT tipe PRODUKSI!');

                    let lvNow = pt.gudangLevel || 1;
                    if (lvNow >= MAX_LEVEL_GUDANG)
                        return m.reply(`❌ Gudang sudah di level maksimal (${MAX_LEVEL_GUDANG.toLocaleString()})!`);

                    jmlLevel = Math.min(jmlLevel, MAX_LEVEL_GUDANG - lvNow);
                    let totalBiaya = jmlLevel * HARGA_UPGRADE_GUDANG;

                    if (user.money < totalBiaya)
                        return m.reply(
                            `❌ Uangmu kurang!\n` +
                            `Butuh   : ${formatRp(totalBiaya)}\n` +
                            `Dimiliki: ${formatRp(user.money)}`
                        );

                    user.money    -= totalBiaya;
                    pt.gudangLevel = lvNow + jmlLevel;
                    let kapBaru    = getKapasitasGudang(pt);

                    m.reply(
                        `📦 *UPGRADE GUDANG BERHASIL!*\n` +
                        `🏢 ${pt.name}\n` +
                        `Level  : ${lvNow} → *${pt.gudangLevel}*\n` +
                        `Kapasitas: *${kapBaru.toLocaleString('id-ID')} slot*\n` +
                        `Biaya  : -${formatRp(totalBiaya)}\n\n` +
                        `_Upgrade lagi: *${usedPrefix+command} upgrade gudang ${idPt+1} <level>*_`
                    );

                } else { // listrik
                    if (pt.type !== 'listrik')
                        return m.reply('❌ Upgrade *Listrik* hanya untuk PT tipe LISTRIK!');

                    let lvNow = pt.listrikLevel || 1;
                    if (lvNow >= MAX_LEVEL_LISTRIK)
                        return m.reply(`❌ PT Listrik sudah di level maksimal (${MAX_LEVEL_LISTRIK.toLocaleString()})!`);

                    jmlLevel = Math.min(jmlLevel, MAX_LEVEL_LISTRIK - lvNow);
                    let totalBiaya = jmlLevel * HARGA_UPGRADE_LISTRIK;

                    if (user.money < totalBiaya)
                        return m.reply(
                            `❌ Uangmu kurang!\n` +
                            `Butuh   : ${formatRp(totalBiaya)}\n` +
                            `Dimiliki: ${formatRp(user.money)}`
                        );

                    user.money     -= totalBiaya;
                    pt.listrikLevel = lvNow + jmlLevel;
                    let kapBaru     = getKapasitasListrik(pt);

                    m.reply(
                        `⚡ *UPGRADE PT LISTRIK BERHASIL!*\n` +
                        `🏭 ${pt.name}\n` +
                        `Level    : ${lvNow} → *${pt.listrikLevel}*\n` +
                        `Kapasitas: *${kapBaru.toLocaleString('id-ID')} W*\n` +
                        `Biaya    : -${formatRp(totalBiaya)}\n\n` +
                        `_Refill otomatis tiap 30 menit sesuai pembangkit._`
                    );
                }
                break;
            }

            // ==============================
            // 3. SET PEMBANGKIT LISTRIK
            // ==============================
            case 'setpembangkit': {
                // .pt setpembangkit <id_pt_listrik> <PLTU|PLTS|PLTB|PLTP|PLTA|PLTN>
                let idPtL = parseInt(args[1]) - 1;
                let jenis = args[2] ? args[2].toUpperCase() : '';

                if (isNaN(idPtL) || !kapasitasPembangkit[jenis]) {
                    let listJenis = Object.entries(kapasitasPembangkit)
                        .map(([k, v]) => `  • *${k}* — ${v.toLocaleString('id-ID')} W/periode`)
                        .join('\n');
                    return m.reply(
                        `⚠️ Format: *${usedPrefix+command} setpembangkit <id_pt_listrik> <jenis>*\n\n` +
                        `Jenis Pembangkit (Refill tiap 30 menit):\n${listJenis}\n\n` +
                        `Contoh: *${usedPrefix+command} setpembangkit 2 PLTA*`
                    );
                }

                let ptL = user.perusahaan[idPtL];
                if (!ptL || ptL.type !== 'listrik')
                    return m.reply('❌ ID tidak valid atau bukan PT tipe Listrik!');

                ptL.pembangkit    = jenis;
                ptL.generationRate = kapasitasPembangkit[jenis];

                m.reply(
                    `⚡ *PEMBANGKIT DIPERBARUI!*\n` +
                    `🏭 ${ptL.name}\n` +
                    `Jenis     : *${jenis}*\n` +
                    `Refill    : *${ptL.generationRate.toLocaleString('id-ID')} W* tiap 30 menit\n` +
                    `Kapasitas : *${getKapasitasListrik(ptL).toLocaleString('id-ID')} W* (Level ${ptL.listrikLevel})`
                );
                break;
            }

            // ==============================
            // 4. BANGUN PABRIK ANAKAN
            // ==============================
            case 'pabrik':
            case 'bangunpabrik': {
                let idPt       = parseInt(args[1]) - 1;
                let tipePabrik = args[2] ? args[2].toLowerCase() : '';
                let namaPabrik = args.slice(3).join(' ');

                if (isNaN(idPt) || !biayaPabrikObj[tipePabrik] || !namaPabrik) {
                    let listP = Object.keys(biayaPabrikObj)
                        .map(k => `  • *${k}* — ${formatRp(biayaPabrikObj[k])}`)
                        .join('\n');
                    return m.reply(
                        `⚠️ Format: *${usedPrefix+command} pabrik <id_pt> <tipe> <nama>*\n\n` +
                        `Tipe Tersedia:\n${listP}\n\n` +
                        `Contoh: *${usedPrefix+command} pabrik 1 minuman Pabrik Segar*`
                    );
                }

                let pt = user.perusahaan[idPt];
                if (!pt)                    return m.reply('❌ ID Perusahaan tidak ditemukan!');
                if (pt.type !== 'produksi') return m.reply('❌ Hanya PT tipe *PRODUKSI* yang bisa punya anak pabrik!');
                if (pt.pabrik.length >= 2)  return m.reply('❌ Batas maksimal anak pabrik adalah *2* per PT!');

                let hargaP = biayaPabrikObj[tipePabrik];
                if (user.money < hargaP)
                    return m.reply(`❌ Uangmu kurang!\nButuh ${formatRp(hargaP)} untuk pabrik *${tipePabrik}*.`);

                user.money -= hargaP;
                pt.pabrik.push({ name: namaPabrik, type: tipePabrik, karyawan: 10 });
                m.reply(
                    `🏭 *PABRIK BERHASIL DIBANGUN!*\n` +
                    `Nama : *${namaPabrik}*\n` +
                    `Tipe : ${tipePabrik.toUpperCase()}\n` +
                    `Induk: *${pt.name}*`
                );
                break;
            }

            // ==============================
            // 5. PRODUKSI BARANG
            // ==============================
            case 'produksi': {
                let jmlProd  = parseInt(args[1]);
                let namaItem = args[2] ? args[2].toLowerCase() : '';
                let idPt     = parseInt(args[3]) - 1;

                if (!jmlProd || !namaItem || isNaN(idPt))
                    return m.reply(`⚠️ Format: *${usedPrefix+command} produksi <jumlah> <item> <id_pt>*`);

                let pt = user.perusahaan[idPt];
                if (!pt || pt.type !== 'produksi')
                    return m.reply('❌ ID PT tidak valid atau bukan tipe Produksi!');

                let dp = semuaProduk[namaItem];
                if (!dp)
                    return m.reply(`❌ Produk *${namaItem}* tidak dikenali!\nProduk: ${Object.keys(semuaProduk).join(', ')}`);

                if (!pt.pabrik.some(f => f.type === dp.type))
                    return m.reply(
                        `❌ *PRODUKSI GAGAL!*\nTidak ada pabrik *${dp.type.toUpperCase()}* di PT ini.\n` +
                        `Bangun: *${usedPrefix+command} pabrik ${idPt+1} ${dp.type} <nama>*`
                    );

                // Cek kapasitas gudang
                if (!pt.gudang) pt.gudang = {};
                let slotMax     = getKapasitasGudang(pt);
                let slotPakai   = getSlotTerpakai(pt.gudang);
                let slotSisa    = slotMax - slotPakai;

                if (jmlProd > slotSisa)
                    return m.reply(
                        `❌ *GUDANG PENUH!*\n` +
                        `Slot tersedia : ${slotSisa.toLocaleString('id-ID')}\n` +
                        `Diminta       : ${jmlProd.toLocaleString('id-ID')}\n\n` +
                        `_Jual dulu stok atau upgrade gudang: *${usedPrefix+command} upgrade gudang ${idPt+1} <level>*_`
                    );

                let hargaL      = getHargaListrik(user, pt);
                let sumberLabel = (pt.sumberListrik === 'negara' || !pt.sumberListrik)
                    ? 'Negara (PLN)'
                    : (() => { let l = user.perusahaan.find(p => p && p.id == pt.sumberListrik); return l ? l.name : 'PT Listrik'; })();

                let biayaProd  = jmlProd * dp.prodCost;
                let biayaL     = jmlProd * 5 * hargaL;
                let totalBiaya = biayaProd + biayaL;

                if ((pt.saldo || 0) < totalBiaya)
                    return m.reply(
                        `❌ Kas PT kurang!\n` +
                        `Butuh   : ${formatRp(totalBiaya)}\n` +
                        `Kas PT  : ${formatRp(pt.saldo)}\n` +
                        `• Produksi : ${formatRp(biayaProd)}\n` +
                        `• Listrik  : ${formatRp(biayaL)} (${sumberLabel})`
                    );

                pt.saldo -= totalBiaya;
                pt.gudang[dp.db] = (pt.gudang[dp.db] || 0) + jmlProd;

                let slotPakaiBaru = getSlotTerpakai(pt.gudang);
                m.reply(
                    `🏭 *PRODUKSI BERHASIL*\n` +
                    `📦 ${dp.name} +${jmlProd.toLocaleString('id-ID')}\n` +
                    `⚡ Listrik  : ${sumberLabel} (${formatRp(hargaL)}/W)\n` +
                    `💸 Biaya    : -${formatRp(totalBiaya)}\n` +
                    `💰 Sisa Kas : ${formatRp(pt.saldo)}\n` +
                    `📦 Gudang   : ${slotPakaiBaru}/${slotMax} slot`
                );
                break;
            }

            // ==============================
            // 6. JUAL GROSIR
            // ==============================
            case 'jual': {
                if (args[1] !== 'semua')
                    return m.reply(`⚠️ Format: *${usedPrefix+command} jual semua <id_pt>*`);

                let idPt = parseInt(args[2]) - 1;
                let pt   = user.perusahaan[idPt];
                if (!pt || pt.type !== 'produksi')
                    return m.reply('❌ ID PT Produksi tidak valid!');

                if (!pt.gudang || Object.keys(pt.gudang).every(k => !(pt.gudang[k] > 0)))
                    return m.reply('📦 Gudang Perusahaan sudah kosong!');

                let totalPend = 0;
                let rincian   = '';

                for (let brg in pt.gudang) {
                    let stok = pt.gudang[brg];
                    if (!stok || stok <= 0) continue;

                    let pd         = semuaProduk[brg];
                    let baseJual   = pd ? pd.baseHargaToko : 10000;
                    let mktStk     = (global.db.data.market[brg] && global.db.data.market[brg].stock)
                                     ? global.db.data.market[brg].stock : 18000;
                    let ratio      = Math.min(3.0, Math.max(0.2, 18000 / Math.max(1, mktStk)));
                    let hargaPasar = Math.max(1, Math.floor(baseJual * ratio));
                    let hargaGros  = Math.floor(hargaPasar * 0.75);
                    let profit     = stok * hargaGros;

                    totalPend += profit;
                    rincian   += `🔸 ${stok.toLocaleString('id-ID')}x ${brg} @ ${formatRp(hargaGros)} = ${formatRp(profit)}\n`;
                    pt.gudang[brg] = 0;
                }

                if (totalPend === 0) return m.reply('📦 Tidak ada barang yang bisa dijual!');
                pt.saldo += totalPend;

                return m.reply(
                    `🛒 *PENJUALAN GROSIR SUKSES*\n` +
                    `🏢 *${pt.name}*\n\n` +
                    `Rincian:\n${rincian}\n` +
                    `💰 Kas Masuk : *${formatRp(totalPend)}*\n` +
                    `💼 Total Kas : *${formatRp(pt.saldo)}*\n` +
                    `_(Harga mengikuti fluktuasi Shop)_`
                );
            }

            // ==============================
            // 7. INFO PERUSAHAAN
            // ==============================
            case 'info': {
                if (!args[1]) {
                    if (!user.perusahaan.length)
                        return m.reply(`❌ Kamu belum punya Perusahaan.\nBuat: *${usedPrefix+command} buat*`);

                    let list = user.perusahaan.map((p, i) => {
                        let val = hitungValuasi(p);
                        let lvInfo = p.type === 'produksi'
                            ? `Gudang Lv ${p.gudangLevel || 1}`
                            : `Listrik Lv ${p.listrikLevel || 1}`;
                        return `*${i+1}.* ${p.name} (${p.type.toUpperCase()})\n    Kas: ${formatRp(p.saldo)} | ${lvInfo}\n    Valuasi: ~${formatSingkat(val)}`;
                    }).join('\n\n');

                    return m.reply(
                        `🏢 *DAFTAR PERUSAHAANMU*\n\n${list}\n\n` +
                        `_*${usedPrefix+command} info <id>* untuk detail._`
                    );
                }

                let ptId = parseInt(args[1]) - 1;
                let pt   = user.perusahaan[ptId];
                if (!pt) return m.reply('❌ ID Perusahaan tidak valid!');

                let pajEsok = Math.floor((pt.saldo || 0) * 0.002);
                let val     = hitungValuasi(pt);

                let txt =
                    `🏢 *INFO PERUSAHAAN [ID: ${ptId+1}]*\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `Nama     : *${pt.name}*\n` +
                    `Tipe     : *${pt.type.toUpperCase()}*\n` +
                    `Kas PT   : *${formatRp(pt.saldo)}*\n` +
                    `Valuasi  : ~${formatSingkat(val)}\n` +
                    `Pajak/Hr : -${formatRp(pajEsok)}\n`;

                if (pt.type === 'produksi') {
                    // === GUDANG ===
                    if (!pt.gudang)        pt.gudang     = {};
                    if (!pt.gudangLevel)   pt.gudangLevel = 1;

                    let kapMax    = getKapasitasGudang(pt);
                    let slotPakai = getSlotTerpakai(pt.gudang);
                    let slotSisa  = kapMax - slotPakai;
                    let pct       = kapMax > 0 ? Math.round((slotPakai / kapMax) * 100) : 0;
                    let bar       = progressBar(slotPakai, kapMax, 12);
                    let lvMax     = MAX_LEVEL_GUDANG;
                    let hargaUpG  = formatRp(HARGA_UPGRADE_GUDANG);

                    // === LISTRIK ===
                    let sLabel = (pt.sumberListrik === 'negara' || !pt.sumberListrik)
                        ? `Negara (PLN) — ${formatRp(hargaListrikNegara)}/W`
                        : (() => {
                            let l = user.perusahaan.find(p => p && p.id == pt.sumberListrik);
                            return l ? `${l.name} — ${formatRp(l.hargaListrikCustom || 18600)}/W` : `PT Listrik (tidak ditemukan)`;
                          })();

                    txt += `\n⚡ *Sumber Listrik*\n   ${sLabel}\n`;

                    txt += `\n🏭 *Anak Pabrik* (${pt.pabrik.length}/2)\n`;
                    if (pt.pabrik.length) {
                        pt.pabrik.forEach((f, i) => {
                            txt += `   ${i+1}. ${f.name} (${f.type.toUpperCase()})\n`;
                        });
                    } else {
                        txt += `   _(Belum ada — bangun: *${usedPrefix+command} pabrik ${ptId+1} <tipe> <nama>*)_\n`;
                    }

                    txt += `\n📦 *Gudang*\n`;
                    txt += `   Level    : *${pt.gudangLevel}* / ${lvMax.toLocaleString('id-ID')}\n`;
                    txt += `   Kapasitas: *${kapMax.toLocaleString('id-ID')} slot*\n`;
                    txt += `   Terpakai : ${slotPakai.toLocaleString('id-ID')} slot (${pct}%)\n`;
                    txt += `   Sisa     : ${slotSisa.toLocaleString('id-ID')} slot\n`;
                    txt += `   [${bar}] ${pct}%\n`;

                    if (pt.gudangLevel < lvMax) {
                        txt += `   Upgrade  : ${hargaUpG}/level → *${usedPrefix+command} upgrade gudang ${ptId+1} <jml>*\n`;
                    } else {
                        txt += `   ✅ Level Maksimal!\n`;
                    }

                    txt += `\n   *Isi Gudang:*\n`;
                    let isiArr = Object.keys(pt.gudang).filter(k => pt.gudang[k] > 0);
                    if (isiArr.length) {
                        isiArr.forEach(k => { txt += `   🔸 ${k}: ${pt.gudang[k].toLocaleString('id-ID')}\n`; });
                    } else {
                        txt += `   _(Kosong)_\n`;
                    }

                } else if (pt.type === 'listrik') {
                    if (!pt.listrikLevel) pt.listrikLevel = 1;

                    let kapMax    = getKapasitasListrik(pt);
                    let tersedia  = pt.kapasitasTersedia || 0;
                    let pct       = kapMax > 0 ? Math.round((tersedia / kapMax) * 100) : 0;
                    let bar       = progressBar(tersedia, kapMax, 12);
                    let genRate   = pt.generationRate || 4000;
                    let jenisPemb = pt.pembangkit || 'PLTU';
                    let tarif     = pt.hargaListrikCustom || 18600;
                    let lvMax     = MAX_LEVEL_LISTRIK;
                    let hargaUpL  = formatRp(HARGA_UPGRADE_LISTRIK);

                    // Estimasi waktu refill penuh
                    let waktuPenuh = tersedia >= kapMax ? 0
                        : Math.ceil(((kapMax - tersedia) / genRate) * 30); // dalam menit

                    // Cek siapa yang pakai listrik ini
                    let konsumen = user.perusahaan.filter(p => p && p.type === 'produksi' && p.sumberListrik == pt.id);

                    txt += `\n⚡ *PT Listrik — Detail*\n`;
                    txt += `   Level      : *${pt.listrikLevel}* / ${lvMax.toLocaleString('id-ID')}\n`;
                    txt += `   Kapasitas  : *${kapMax.toLocaleString('id-ID')} W*\n`;
                    txt += `   Tersedia   : ${tersedia.toLocaleString('id-ID')} W (${pct}%)\n`;
                    txt += `   [${bar}] ${pct}%\n`;
                    txt += `   Pembangkit : *${jenisPemb}*\n`;
                    txt += `   Refill     : +${genRate.toLocaleString('id-ID')} W/30 menit\n`;

                    if (tersedia < kapMax) {
                        txt += `   Penuh dlm  : ~${waktuPenuh} menit\n`;
                    } else {
                        txt += `   Status     : ✅ Kapasitas Penuh\n`;
                    }

                    txt += `   Tarif Jual : *${formatRp(tarif)}/W*\n`;
                    let badge = tarif < hargaListrikNegara
                        ? `✅ Lebih murah ${((1 - tarif/hargaListrikNegara)*100).toFixed(1)}% dari PLN`
                        : `❗ Lebih mahal dari PLN`;
                    txt += `   vs PLN     : ${badge}\n`;

                    if (pt.listrikLevel < lvMax) {
                        txt += `\n   Upgrade: ${hargaUpL}/level → *${usedPrefix+command} upgrade listrik ${ptId+1} <jml>*\n`;
                    } else {
                        txt += `\n   ✅ Level Maksimal!\n`;
                    }

                    if (konsumen.length) {
                        txt += `\n   🔌 *Konsumen:*\n`;
                        konsumen.forEach(k => { txt += `   • ${k.name}\n`; });
                    } else {
                        txt += `\n   🔌 Belum ada PT yang pakai listrik ini.\n`;
                        txt += `   Set: *${usedPrefix+command} setlistrik <id_prod> ${ptId+1}*\n`;
                    }

                    if (pt.listrikLevel < lvMax) {
                        let biayaMaxUpgrade = (lvMax - pt.listrikLevel) * HARGA_UPGRADE_LISTRIK;
                        txt += `\n   💡 Butuh ${formatRp(biayaMaxUpgrade)} untuk upgrade ke Lv Max\n`;
                    }
                }

                m.reply(txt);
                break;
            }

            // ==============================
            // 8. SETOR & TARIK
            // ==============================
            case 'setor':
            case 'tarik': {
                let jumlah    = parseInt(args[1]);
                let tipeAsset = args[2] ? args[2].toLowerCase() : '';
                let ptId      = parseInt(args[3]) - 1;

                if (isNaN(jumlah) || !tipeAsset || isNaN(ptId))
                    return m.reply(`⚠️ Format: *${usedPrefix+command} ${action} <jumlah> <uang|item> <id_pt>*`);

                let pt = user.perusahaan[ptId];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');
                if (!pt.gudang) pt.gudang = {};

                if (action === 'setor') {
                    if (tipeAsset === 'uang' || tipeAsset === 'money') {
                        if (user.money < jumlah) return m.reply('❌ Uang di dompet pribadimu kurang!');
                        user.money -= jumlah;
                        pt.saldo   += jumlah;
                        m.reply(`✅ Setor ${formatRp(jumlah)} → Kas *${pt.name}*`);
                    } else {
                        if ((user[tipeAsset] || 0) < jumlah)
                            return m.reply(`❌ Kamu tidak punya ${jumlah} *${tipeAsset}* di tas!`);
                        // Cek kapasitas gudang saat setor barang
                        if (pt.type === 'produksi') {
                            let slotMax   = getKapasitasGudang(pt);
                            let slotPakai = getSlotTerpakai(pt.gudang);
                            if (slotPakai + jumlah > slotMax)
                                return m.reply(
                                    `❌ Gudang tidak cukup!\n` +
                                    `Slot tersedia: ${slotMax - slotPakai}\n` +
                                    `Diminta      : ${jumlah}`
                                );
                        }
                        user[tipeAsset]      -= jumlah;
                        pt.gudang[tipeAsset]  = (pt.gudang[tipeAsset] || 0) + jumlah;
                        m.reply(`✅ Setor ${jumlah} ${tipeAsset} → Gudang *${pt.name}*`);
                    }
                } else {
                    if (tipeAsset === 'uang' || tipeAsset === 'money') {
                        if ((pt.saldo || 0) < jumlah) return m.reply('❌ Saldo kas PT kurang!');
                        pt.saldo   -= jumlah;
                        user.money += jumlah;
                        m.reply(`✅ Tarik ${formatRp(jumlah)} ← Kas *${pt.name}*`);
                    } else {
                        if ((pt.gudang[tipeAsset] || 0) < jumlah)
                            return m.reply('❌ Stok barang di gudang PT tidak cukup!');
                        pt.gudang[tipeAsset] -= jumlah;
                        user[tipeAsset]       = (user[tipeAsset] || 0) + jumlah;
                        m.reply(`✅ Tarik ${jumlah} ${tipeAsset} ← Gudang *${pt.name}*`);
                    }
                }
                break;
            }

            // ==============================
            // 9. SET SUMBER LISTRIK
            // ==============================
            case 'setlistrik': {
                let idPtProd = parseInt(args[1]) - 1;
                let sumber   = args[2] ? args[2].toLowerCase() : '';

                if (isNaN(idPtProd) || !sumber)
                    return m.reply(
                        `⚠️ Format: *${usedPrefix+command} setlistrik <id_pt_produksi> <negara|id_pt_listrik>*\n\n` +
                        `Contoh:\n` +
                        `• PLN    : *${usedPrefix+command} setlistrik 1 negara*\n` +
                        `• Swasta : *${usedPrefix+command} setlistrik 1 2*\n\n` +
                        `_Gunakan *${usedPrefix+command} ceklistrik* untuk bandingkan harga!_`
                    );

                let pt = user.perusahaan[idPtProd];
                if (!pt || pt.type !== 'produksi')
                    return m.reply('❌ ID tidak valid atau bukan PT tipe Produksi!');

                if (sumber === 'negara') {
                    pt.sumberListrik = 'negara';
                    return m.reply(
                        `✅ *${pt.name}* kini pakai listrik *Negara (PLN)*\n` +
                        `⚡ Tarif: ${formatRp(hargaListrikNegara)}/W`
                    );
                }

                let idPtL = parseInt(sumber) - 1;
                let ptL   = user.perusahaan[idPtL];
                if (!ptL || ptL.type !== 'listrik')
                    return m.reply('❌ ID PT Listrik tidak ditemukan atau bukan tipe Listrik!');

                pt.sumberListrik = ptL.id;
                return m.reply(
                    `✅ *${pt.name}* kini pakai listrik dari *${ptL.name}*\n` +
                    `⚡ Tarif: ${formatRp(ptL.hargaListrikCustom || 18600)}/W`
                );
            }

            // ==============================
            // 10. SET TARIF LISTRIK
            // ==============================
            case 'settarif': {
                let idPtL = parseInt(args[1]) - 1;
                let tarif = parseInt(args[2]);

                if (isNaN(idPtL) || isNaN(tarif) || tarif < 1)
                    return m.reply(`⚠️ Format: *${usedPrefix+command} settarif <id_pt_listrik> <harga_per_W>*`);

                let ptL = user.perusahaan[idPtL];
                if (!ptL || ptL.type !== 'listrik')
                    return m.reply('❌ ID tidak valid atau bukan PT tipe Listrik!');

                if (tarif < 1000)
                    return m.reply(`❌ Tarif minimum ${formatRp(1000)}/W.`);

                ptL.hargaListrikCustom = tarif;
                let badge = tarif < hargaListrikNegara
                    ? `✅ Lebih murah ${((1 - tarif/hargaListrikNegara)*100).toFixed(1)}% dari PLN`
                    : `❗ Lebih mahal dari PLN (${formatRp(hargaListrikNegara)}/W)`;

                m.reply(`✅ Tarif *${ptL.name}* → *${formatRp(tarif)}/W*\n${badge}`);
                break;
            }

            // ==============================
            // 11. CEK LISTRIK
            // ==============================
            case 'ceklistrik': {
                let ptListrikList  = user.perusahaan.map((p,i) => ({idx:i+1,pt:p})).filter(({pt}) => pt && pt.type === 'listrik');
                let ptProduksiList = user.perusahaan.map((p,i) => ({idx:i+1,pt:p})).filter(({pt}) => pt && pt.type === 'produksi');

                let txt = `⚡ *CEK HARGA LISTRIK*\n_Bandingkan tarif untuk produksi hemat._\n\n`;

                txt += `🔵 *Listrik Negara (PLN)*\n`;
                txt += `   Tarif : *${formatRp(hargaListrikNegara)}/W*\n`;
                txt += `   Stok  : ♾️ Tidak terbatas\n`;
                txt += `   Set   : *${usedPrefix+command} setlistrik <id_prod> negara*\n\n`;

                if (ptListrikList.length) {
                    txt += `🟡 *PT Listrik Milikmu*\n`;
                    ptListrikList.forEach(({idx, pt}) => {
                        let tarif    = pt.hargaListrikCustom || 18600;
                        let selisih  = tarif - hargaListrikNegara;
                        let badge    = tarif < hargaListrikNegara
                            ? `✅ Hemat ${((1 - tarif/hargaListrikNegara)*100).toFixed(1)}%`
                            : `❗ +${formatRp(selisih)} dari PLN`;
                        let kapMax   = getKapasitasListrik(pt);
                        let tersedia = pt.kapasitasTersedia || 0;
                        let bar      = progressBar(tersedia, kapMax, 8);

                        txt += `\n   *[ID ${idx}] ${pt.name}* — Lv ${pt.listrikLevel || 1}\n`;
                        txt += `   Tarif  : *${formatRp(tarif)}/W*  ${badge}\n`;
                        txt += `   Stok   : ${tersedia.toLocaleString('id-ID')} / ${kapMax.toLocaleString('id-ID')} W\n`;
                        txt += `   [${bar}]\n`;
                        txt += `   Refill : +${(pt.generationRate||4000).toLocaleString('id-ID')} W/30mnt (${pt.pembangkit||'PLTU'})\n`;
                        txt += `   Set    : *${usedPrefix+command} setlistrik <id_prod> ${idx}*\n`;
                    });
                } else {
                    txt += `🟡 *PT Listrik Milikmu*\n   _(Belum punya PT Listrik)_\n`;
                    txt += `   Buat: *${usedPrefix+command} buat listrik <nama>*\n`;
                }

                if (ptProduksiList.length) {
                    txt += `\n\n📋 *Status Produksimu*\n`;
                    ptProduksiList.forEach(({idx, pt}) => {
                        let src = pt.sumberListrik || 'negara';
                        let label, tarif;
                        if (src === 'negara') {
                            label = 'Negara (PLN)'; tarif = hargaListrikNegara;
                        } else {
                            let l = user.perusahaan.find(p => p && p.id == src);
                            label = l ? l.name : 'PT Listrik (?)';
                            tarif = l ? (l.hargaListrikCustom || 18600) : hargaListrikNegara;
                        }
                        txt += `   *[ID ${idx}] ${pt.name}*\n`;
                        txt += `   ⚡ ${label} — ${formatRp(tarif)}/W\n`;
                    });
                }

                txt += `\n\n💡 *Tips:* PT Listrik sendiri < ${formatRp(hargaListrikNegara)}/W bisa hemat biaya produksi!`;
                m.reply(txt);
                break;
            }

            // ==============================
            // 12. IHSG — LEADERBOARD VALUASI
            // ==============================
            case 'ihsg':
            case 'leaderboard':
            case 'lb': {
                let allUsers = global.db.data.users;
                let entries  = [];

                for (let uid in allUsers) {
                    let u = allUsers[uid];
                    if (!Array.isArray(u.perusahaan)) continue;
                    u.perusahaan.forEach(pt => {
                        if (!pt) return;
                        let val = hitungValuasi(pt);
                        entries.push({
                            owner:   u.name || uid.split('@')[0],
                            name:    pt.name,
                            type:    pt.type,
                            saldo:   pt.saldo || 0,
                            valuasi: val,
                            level:   pt.type === 'produksi' ? (pt.gudangLevel || 1) : (pt.listrikLevel || 1)
                        });
                    });
                }

                if (!entries.length)
                    return m.reply('📊 Belum ada perusahaan yang terdaftar di bursa.');

                entries.sort((a, b) => b.valuasi - a.valuasi);

                let top   = entries.slice(0, 10);
                let total = entries.reduce((s, e) => s + e.valuasi, 0);
                let avgVal    = total / entries.length;
                let ihsgScore = Math.min(99999, Math.max(1000, Math.floor(avgVal / 1e9)));

                let ihsgDb = global.db.data.ihsg;
                if (!Array.isArray(ihsgDb.history)) ihsgDb.history = [];
                let lastScore  = ihsgDb.history.length ? ihsgDb.history[ihsgDb.history.length-1].score : ihsgScore;
                let selisihIdx = ihsgScore - lastScore;
                let trendEmoji = selisihIdx > 0 ? '📈' : selisihIdx < 0 ? '📉' : '➡️';

                if ((now - (ihsgDb.lastUpdate || 0)) > 3600000) {
                    ihsgDb.history.push({ score: ihsgScore, ts: now });
                    if (ihsgDb.history.length > 30) ihsgDb.history.shift();
                    ihsgDb.lastUpdate = now;
                }

                let board = top.map((e, i) => {
                    let medal  = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
                    let persen = ((e.valuasi / total) * 100).toFixed(1);
                    let lvLabel = e.type === 'produksi' ? `Gudang Lv ${e.level}` : `Listrik Lv ${e.level}`;
                    return (
                        `${medal} *${e.name}* (${e.type.toUpperCase()})\n` +
                        `    👤 ${e.owner} | ${lvLabel}\n` +
                        `    💹 ~${formatSingkat(e.valuasi)}  (${persen}% pasar)\n` +
                        `    💰 Kas: ${formatRp(e.saldo)}`
                    );
                }).join('\n\n');

                m.reply(
                    `📊 *IHSG — BURSA EFEK PERUSAHAAN*\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `${trendEmoji} *Indeks IHSG* : *${ihsgScore.toLocaleString('id-ID')}*  (${selisihIdx >= 0 ? '+' : ''}${selisihIdx})\n` +
                    `🏭 Total Emiten: ${entries.length} PT\n` +
                    `💼 Total Valuasi: ~${formatSingkat(total)}\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `🏆 *TOP 10 EMITEN*\n\n${board}\n\n` +
                    `_Valuasi = Kas + Gudang + Aset Pabrik + Modal + Upgrade_`
                );
                break;
            }

            // ==============================
            // HELP
            // ==============================
            default: {
                m.reply(
                    `🏢 *MANAJEMEN PERUSAHAAN*\n\n` +

                    `🏛️ *INDUK* _(maks. 2)_\n` +
                    `• *${usedPrefix+command} buat <produksi/listrik> <nama>*\n` +
                    `• *${usedPrefix+command} info [id]*\n\n` +

                    `🏭 *ANAK PABRIK* _(maks. 2 per PT Prod)_\n` +
                    `• *${usedPrefix+command} pabrik <id_pt> <tipe> <nama>*\n` +
                    `  _(daurulang / minuman / tambang / senjata)_\n\n` +

                    `📦 *GUDANG* _(PT Produksi, Lv1=125 slot)_\n` +
                    `• *${usedPrefix+command} upgrade gudang <id_pt> <jml_lv>*\n` +
                    `  _(${formatRp(HARGA_UPGRADE_GUDANG)}/lv, maks Lv ${MAX_LEVEL_GUDANG.toLocaleString()})_\n\n` +

                    `⚡ *LISTRIK* _(PT Listrik, Lv1=1200 W)_\n` +
                    `• *${usedPrefix+command} upgrade listrik <id_pt> <jml_lv>*\n` +
                    `  _(${formatRp(HARGA_UPGRADE_LISTRIK)}/lv, maks Lv ${MAX_LEVEL_LISTRIK.toLocaleString()})_\n` +
                    `• *${usedPrefix+command} setpembangkit <id_pt> <jenis>*\n` +
                    `• *${usedPrefix+command} setlistrik <id_prod> <negara|id_listrik>*\n` +
                    `• *${usedPrefix+command} settarif <id_listrik> <tarif/W>*\n` +
                    `• *${usedPrefix+command} ceklistrik*\n\n` +

                    `⚙️ *OPERASIONAL*\n` +
                    `• *${usedPrefix+command} setor/tarik <jml> <uang|item> <id_pt>*\n` +
                    `• *${usedPrefix+command} produksi <jml> <item> <id_pt>*\n` +
                    `• *${usedPrefix+command} jual semua <id_pt>*\n\n` +

                    `📊 *BURSA*\n` +
                    `• *${usedPrefix+command} ihsg* — Leaderboard & Indeks IHSG`
                );
                break;
            }
        }
    } catch (e) {
        console.error('ERROR PERUSAHAAN:', e);
        m.reply(`❌ *Terjadi Kesalahan Sistem!*\nError: ${e.message}\n\nSilakan lapor ke Owner Bot.`);
    }
};

handler.help    = ['perusahaan'];
handler.tags    = ['rpg'];
handler.command = /^(perusahaan|pt|company)$/i;

module.exports = handler;
