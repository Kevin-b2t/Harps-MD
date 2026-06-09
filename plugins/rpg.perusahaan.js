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
const MAX_LEVEL_GUDANG  = 5000;
const MAX_LEVEL_LISTRIK = 3500;

const slotPerLevel    = 120;  
const wattPerLevel    = 1200; 

// Kapasitas Daya Refill (Dasar) per 30 Menit
const kapasitasPembangkit = {
    'PLTU':  4000,     // 4 kWh
    'PLTS':  8000,     // 8 kWh
    'PLTB':  10000,    // 10 kWh
    'PLTP':  20000,    // 20 kWh
    'PLTA':  120000,   // 120 kWh
    'PLTN':  200000    // 200 kWh
};

// Harga Beli Ekstra Pembangkit
const hargaPembangkit = {
    'PLTU':  5000000000,    // 5 Miliar
    'PLTS':  10000000000,   // 10 Miliar
    'PLTB':  15000000000,   // 15 Miliar
    'PLTP':  30000000000,   // 30 Miliar
    'PLTA':  100000000000,  // 100 Miliar
    'PLTN':  250000000000   // 250 Miliar
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
function getHargaListrik(user, pt) {
    let src = pt.sumberListrik || 'negara';
    if (src === 'negara') return hargaListrikNegara;
    let ptL = user.perusahaan.find(p => p && p.type === 'listrik' && p.id == src);
    return ptL ? (ptL.hargaListrikCustom || 18600) : hargaListrikNegara;
}
function getKapasitasGudang(pt) { return (pt.gudangLevel || 1) * slotPerLevel; }
function getKapasitasListrik(pt) { return (pt.listrikLevel || 1) * wattPerLevel; }
function getSlotTerpakai(gudang) { return Object.values(gudang || {}).reduce((s, v) => s + (v || 0), 0); }

// Perhitungan Valuasi sekarang memotong Hutang Bank
function hitungValuasi(pt) {
    let val = pt.saldo || 0;
    if (pt.gudang) {
        for (let brg in pt.gudang) {
            let stok = pt.gudang[brg] || 0;
            if (stok > 0) val += stok * (semuaProduk[brg] ? semuaProduk[brg].baseHargaToko : 0);
        }
    }
    if (Array.isArray(pt.pabrik)) pt.pabrik.forEach(f => { val += biayaPabrikObj[f.type] || 0; });
    val += biayaInduk[pt.type] || 0;
    if (pt.type !== 'listrik') val += ((pt.gudangLevel || 1) - 1) * HARGA_UPGRADE_GUDANG;
    if (pt.type === 'listrik') {
        val += ((pt.listrikLevel || 1) - 1) * HARGA_UPGRADE_LISTRIK;
        if (pt.ekstraPembangkit) pt.ekstraPembangkit.forEach(p => val += (hargaPembangkit[p] || 0));
    }
    
    let totalInvest = pt.investors ? Object.values(pt.investors).reduce((a,b)=>a+b,0) : 0;
    val += totalInvest;
    
    // Kurangi hutang bank
    val -= (pt.hutang || 0);
    return Math.max(0, val); // Jangan sampai minus valuasinya
}

// Helper untuk menghitung aset mentah (sebelum dikurangi hutang) untuk limit kredit
function hitungAsetKotor(pt) {
    let val = pt.saldo || 0;
    if (pt.gudang) {
        for (let brg in pt.gudang) {
            let stok = pt.gudang[brg] || 0;
            if (stok > 0) val += stok * (semuaProduk[brg] ? semuaProduk[brg].baseHargaToko : 0);
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

        // AUTO: REFILL LISTRIK & PAJAK HARIAN
        user.perusahaan.forEach(pt => {
            if (!pt) return;
            if (pt.type !== 'listrik' && !pt.gudangLevel) pt.gudangLevel = 1;
            if (pt.type === 'listrik' && !pt.listrikLevel) pt.listrikLevel = 1;
            if (!pt.investors) pt.investors = {}; 
            if (pt.type === 'listrik' && !pt.ekstraPembangkit) pt.ekstraPembangkit = [];
            if (pt.hutang === undefined) pt.hutang = 0;

            if (pt.type === 'listrik') {
                let periods = Math.floor((now - (pt.lastGenerate || now)) / 1800000);
                if (periods >= 1) {
                    let kapMax = getKapasitasListrik(pt);
                    let totalGenRate = pt.generationRate || 4000;
                    if (pt.ekstraPembangkit) {
                        pt.ekstraPembangkit.forEach(p => totalGenRate += (kapasitasPembangkit[p] || 0));
                    }
                    let remaining = kapMax - (pt.kapasitasTersedia || 0);
                    if (remaining > 0) {
                        let gen = Math.min(remaining, totalGenRate * periods);
                        pt.kapasitasTersedia = (pt.kapasitasTersedia || 0) + gen;
                    }
                    pt.lastGenerate = now;
                }
            }
            if (!pt.lastTax) pt.lastTax = now;
            let daysPassed = Math.floor((now - pt.lastTax) / 86400000);
            if (daysPassed >= 1) {
                // Pajak simpanan kas PT: 0.2% / hari
                let tax = Math.floor((pt.saldo || 0) * 0.002 * daysPassed);
                pt.saldo = Math.max(0, (pt.saldo || 0) - tax);
                pt.lastTax += daysPassed * 86400000;
            }
        });

        let action = args[0] ? args[0].toLowerCase() : 'help';

        switch (action) {
            // ==============================
            // 1. BUAT & BANGUN
            // ==============================
            case 'buat': {
                let tipePT = args[1] ? args[1].toLowerCase() : '';
                let namaPT = args.slice(2).join(' ');
                let tipeValid = Object.keys(biayaInduk);

                if (!tipeValid.includes(tipePT) || !namaPT)
                    return m.reply(`⚠️ *Format Salah!*\n\n*${usedPrefix+command} buat <tipe> <Nama PT>*\nTipe: ${tipeValid.join(', ')}\n\nContoh: *${usedPrefix+command} buat tambang PT Emas*`);

                if (user.perusahaan.length >= 2) return m.reply('❌ Batas maksimal adalah *2 Perusahaan Induk*!');
                let hargaBuat = biayaInduk[tipePT];
                
                // Buat perusahaan baru TETAP memotong uang probadi user.money (karena PT belum ada kas-nya)
                if (user.money < hargaBuat) return m.reply(`❌ Uang pribadimu kurang!\nButuh ${formatRp(hargaBuat)}.`);

                user.money -= hargaBuat;

                let newPT = {
                    id: now, name: namaPT, type: tipePT, saldo: 0, hutang: 0, lastTax: now,
                    pabrik: [], gudang: {}, investors: {}
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

            case 'buatpembangkit': {
                let idPtL = parseInt(args[1]) - 1;
                let jenis = args[2] ? args[2].toUpperCase() : '';

                if (isNaN(idPtL) || !kapasitasPembangkit[jenis]) {
                    let listJenis = Object.keys(kapasitasPembangkit).map(k => `  • *${k}* — ${formatRp(hargaPembangkit[k])} (+${formatDaya(kapasitasPembangkit[k], true)}/30mnt)`).join('\n');
                    return m.reply(
                        `⚠️ *Format:* *${usedPrefix+command} buatpembangkit <id_pt> <jenis>*\n\n` +
                        `*Katalog Ekstra Pembangkit:*\n${listJenis}\n\n` +
                        `_Mempercepat refill energi kapasitas listrikmu setiap 30 menit! (Maks 5 Ekstra)_`
                    );
                }

                let pt = user.perusahaan[idPtL];
                if (!pt || pt.type !== 'listrik') return m.reply('❌ ID Perusahaan tidak ditemukan atau bukan tipe Listrik!');
                
                if (!pt.ekstraPembangkit) pt.ekstraPembangkit = [];
                if (pt.ekstraPembangkit.length >= 5) return m.reply('❌ Slot Ekstra Pembangkit sudah penuh (Maksimal 5)!');

                let harga = hargaPembangkit[jenis];
                // BAYAR PAKAI KAS PT
                if ((pt.saldo || 0) < harga) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(harga)}\nKas PT saat ini: ${formatRp(pt.saldo)}\n\n_Setor uang/pinjam bank dulu untuk menambah kas PT!_`);

                pt.saldo -= harga;
                pt.ekstraPembangkit.push(jenis);
                
                m.reply(
                    `✅ *PEMBANGUNAN BERHASIL!*\n\n` +
                    `🏭 *${pt.name}* telah memasang ekstra *${jenis}*.\n` +
                    `💳 Kas PT Terpotong: -${formatRp(harga)}\n` +
                    `♻️ Daya Refill Bertambah: *+${formatDaya(kapasitasPembangkit[jenis], true)}* / 30 Menit!\n\n` +
                    `_Cek total daya refill dengan *${usedPrefix+command} info*_`
                );
                break;
            }

            // ==============================
            // 2. SISTEM BANK (PINJAMAN)
            // ==============================
            case 'bank': {
                let txt = `🏦 *BANK KORPORASI NEGARA*\n\n`;
                txt += `Bank menyediakan dana segar untuk membantu operasional & ekspansi Perusahaan milikmu. Pinjaman akan masuk ke *Kas PT*.\n\n`;
                txt += `📊 *Tarif Bunga (Flat):*\n`;
                txt += `  • < Rp 10 Miliar    : *Bunga 5%*\n`;
                txt += `  • Rp 10M - Rp 100M  : *Bunga 8%*\n`;
                txt += `  • > Rp 100 Miliar   : *Bunga 12%*\n\n`;
                
                txt += `💳 *Limit Perusahaanmu (50% Valuasi Aset):*\n`;
                if (user.perusahaan.length === 0) txt += `  _Belum ada perusahaan._\n`;
                user.perusahaan.forEach((pt, i) => {
                    let asetKotor = hitungAsetKotor(pt);
                    let limit = Math.floor(asetKotor / 2);
                    txt += `  ${i+1}. *${pt.name}*\n`;
                    txt += `     Limit: ${formatRp(limit)}\n`;
                    txt += `     Hutang Aktif: ${formatRp(pt.hutang || 0)}\n`;
                });

                txt += `\n*Command:*\n`;
                txt += `• Pinjam : *${usedPrefix+command} pinjam <nominal> <id_pt>*\n`;
                txt += `• Bayar  : *${usedPrefix+command} bayarbank <nominal> <id_pt>*`;
                return m.reply(txt);
            }

            case 'pinjam': {
                let nominal = parseInt(args[1]); 
                let ptId = parseInt(args[2]) - 1;

                if (isNaN(nominal) || isNaN(ptId)) 
                    return m.reply(`⚠️ Format: *${usedPrefix+command} pinjam <nominal> <id_pt>*\nContoh: *${usedPrefix+command} pinjam 5000000000 1*`);

                if (nominal < 1000000) return m.reply(`❌ Minimal pinjaman adalah Rp 1.000.000`);

                let pt = user.perusahaan[ptId];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

                let asetKotor = hitungAsetKotor(pt);
                let limitPinjaman = Math.floor(asetKotor / 2);
                let hutangSekarang = pt.hutang || 0;

                // Cek Limit
                if (hutangSekarang + nominal > limitPinjaman) {
                    return m.reply(
                        `❌ *Limit Kredit Tidak Mencukupi!*\n\n` +
                        `🏢 PT: *${pt.name}*\n` +
                        `Batas Maksimal Hutang: ${formatRp(limitPinjaman)}\n` +
                        `Hutang Saat Ini: ${formatRp(hutangSekarang)}\n` +
                        `Sisa Limit Anda: ${formatRp(Math.max(0, limitPinjaman - hutangSekarang))}`
                    );
                }

                // Hitung Bunga
                let bungaPersen = 0.05; // 5%
                if (nominal >= 100000000000) bungaPersen = 0.12;      // > 100M = 12%
                else if (nominal >= 10000000000) bungaPersen = 0.08;  // >= 10M = 8%

                let bebanBunga = Math.floor(nominal * bungaPersen);
                let totalHutangBaru = nominal + bebanBunga;

                pt.saldo = (pt.saldo || 0) + nominal;
                pt.hutang = hutangSekarang + totalHutangBaru;

                m.reply(
                    `✅ *PINJAMAN BANK DISETUJUI*\n\n` +
                    `Dana telah ditransfer ke Kas PT *${pt.name}*.\n\n` +
                    `• Pinjaman Cair : *${formatRp(nominal)}*\n` +
                    `• Bunga (${bungaPersen*100}%) : *${formatRp(bebanBunga)}*\n` +
                    `• Total Tagihan : *${formatRp(totalHutangBaru)}*\n\n` +
                    `💳 Kas PT Saat Ini: ${formatRp(pt.saldo)}\n` +
                    `🏦 Total Hutang PT: ${formatRp(pt.hutang)}`
                );
                break;
            }

            case 'bayarbank': {
                let nominal = parseInt(args[1]); 
                let ptId = parseInt(args[2]) - 1;

                if (isNaN(nominal) || isNaN(ptId)) 
                    return m.reply(`⚠️ Format: *${usedPrefix+command} bayarbank <nominal> <id_pt>*\n_Bayar otomatis memotong saldo Kas PT_`);

                let pt = user.perusahaan[ptId];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

                let hutangSekarang = pt.hutang || 0;
                if (hutangSekarang <= 0) return m.reply(`✅ Perusahaan *${pt.name}* tidak memiliki hutang Bank!`);

                if (nominal > hutangSekarang) nominal = hutangSekarang; // Cegah bayar lebih

                if ((pt.saldo || 0) < nominal) {
                    return m.reply(
                        `❌ Kas PT tidak cukup untuk membayar tagihan ini!\n\n` +
                        `Nominal Bayar: ${formatRp(nominal)}\n` +
                        `Kas PT: ${formatRp(pt.saldo)}`
                    );
                }

                pt.saldo -= nominal;
                pt.hutang -= nominal;

                m.reply(
                    `✅ *PEMBAYARAN HUTANG SUKSES*\n\n` +
                    `🏢 PT: *${pt.name}*\n` +
                    `💳 Kas PT Terpotong: -${formatRp(nominal)}\n` +
                    `🏦 Sisa Hutang: *${formatRp(pt.hutang)}*`
                );
                break;
            }

            // ==============================
            // 3. MENU INFO PT
            // ==============================
            case 'info': {
                let targetId = m.sender;
                if (args[1]) {
                    if (m.mentionedJid && m.mentionedJid[0]) targetId = m.mentionedJid[0];
                    else if (args[1].startsWith('@')) targetId = args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                }

                let targetUser = global.db.data.users[targetId];
                if (!targetUser || !targetUser.perusahaan || !targetUser.perusahaan.length) {
                    return m.reply(targetId === m.sender ? `❌ Kamu belum punya Perusahaan.` : `❌ User tersebut belum punya perusahaan.`);
                }

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
                    let karyawanTotal = 10 + (pt.pabrik ? pt.pabrik.length * 10 : 0);

                    txt += `${ptHeader}\n`;
                    txt += `🏭 Tipe Pabrik: *${pt.type.toUpperCase()}*\n`;
                    txt += `👥 Karyawan: ${karyawanTotal} Orang\n`;

                    if (pt.type === 'listrik') {
                        let totalRefill = pt.generationRate || 4000;
                        let extraStr = '-';
                        if (pt.ekstraPembangkit && pt.ekstraPembangkit.length > 0) {
                            pt.ekstraPembangkit.forEach(p => totalRefill += (kapasitasPembangkit[p] || 0));
                            extraStr = pt.ekstraPembangkit.join(', ');
                        }

                        let kapMaksimum = getKapasitasListrik(pt);
                        let sedia       = pt.kapasitasTersedia || 0;

                        txt += `⚡ Level Kapasitas Listrik : Level ${pt.listrikLevel || 1}\n`;
                        txt += `⚡ Kapasitas Listrik: ${formatDaya(sedia)} / ${formatDaya(kapMaksimum)}\n`;
                        txt += `♻️ Total Refill: ${formatDaya(totalRefill, true)} / 30 Menit\n`;
                        txt += `💡 Harga Jual: ${formatRp(pt.hargaListrikCustom || 18600)}/W\n`;
                        txt += `🏗️ Ekstra Pembangkit: ${extraStr}\n`;
                    } else {
                        txt += `📦 Level Gudang : Level ${pt.gudangLevel || 1}\n`;
                        txt += `📦 Gudang ${getSlotTerpakai(pt.gudang).toLocaleString('id-ID')}/${getKapasitasGudang(pt).toLocaleString('id-ID')} Slot\n`;
                    }

                    let modalAwal = biayaInduk[pt.type] || 50000000000;
                    let totalInvest = pt.investors ? Object.values(pt.investors).reduce((a,b)=>a+b, 0) : 0;
                    let totalKapital = modalAwal + totalInvest;
                    let pctOwner = ((modalAwal / totalKapital) * 100).toFixed(1);
                    let pctInvest = ((totalInvest / totalKapital) * 100).toFixed(1);

                    let detailInvestor = '';
                    if (pt.investors && Object.keys(pt.investors).length > 0) {
                        for (let inv in pt.investors) {
                            let p = ((pt.investors[inv] / totalKapital) * 100).toFixed(1);
                            detailInvestor += `\n>    • @${inv.split('@')[0]} (${p}%)`;
                        }
                    }

                    txt += `\n*📊 LAPORAN KEUANGAN & SAHAM:*\n`;
                    txt += `> 💎 Valuasi Bersih: ~${formatSingkat(val)}\n`;
                    txt += `> 🏦 Hutang Bank: ${formatRp(pt.hutang || 0)}\n`;
                    txt += `> 💼 Saham: [ Owner: ${pctOwner}% | Publik: ${pctInvest}% ]${detailInvestor}\n`;
                    txt += `> 💳 Saldo Kas PT: ${formatRp(pt.saldo)}\n`;
                    txt += `> 📈 Dana Investasi: ${formatRp(totalInvest)}\n\n`;
                });

                return m.reply(txt.trim(), null, { mentions: [targetId, ...Object.keys(targetUser.perusahaan[0]?.investors || {})] });
            }

            // ==============================
            // LAIN-LAIN (INVEST, UPGRADE, DLL)
            // ==============================
            case 'invest': {
                let nominal = parseInt(args[1]); let targetMention = args[2]; let ptId = parseInt(args[3]) - 1;
                if (isNaN(nominal) || !targetMention || isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} invest <nominal> <@tag/nomor> <id_pt>*`);
                if (nominal < 1000000) return m.reply(`❌ Minimal investasi Rp1.000.000`);

                let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                let targetUser = global.db.data.users[target];
                if (!targetUser || !targetUser.perusahaan) return m.reply(`❌ User tidak ditemukan.`);
                let pt = targetUser.perusahaan[ptId];
                if (!pt) return m.reply(`❌ ID Perusahaan target tidak ditemukan!`);

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

            case 'jual':
            case 'jualsemua':
            case 'sellall': {
                let targetPts = [];
                let isGlobal = false;

                if (action === 'jual') {
                    if (args[1] !== 'semua') return m.reply(`⚠️ Format: *${usedPrefix+command} jualsemua* (Semua PT) atau *${usedPrefix+command} jualsemua <id_pt>* (Spesifik PT)`);
                    let id = parseInt(args[2]) - 1;
                    if (!isNaN(id) && user.perusahaan[id] && user.perusahaan[id].type !== 'listrik') targetPts.push(user.perusahaan[id]);
                } else {
                    let id = parseInt(args[1]) - 1;
                    if (!isNaN(id)) {
                        if (user.perusahaan[id] && user.perusahaan[id].type !== 'listrik') targetPts.push(user.perusahaan[id]);
                    } else {
                        isGlobal = true;
                        targetPts = user.perusahaan.filter(p => p && p.type !== 'listrik');
                    }
                }

                if (targetPts.length === 0) return m.reply('❌ Tidak ada PT produksi yang valid untuk dijual barangnya.');

                let grandTotalPend = 0;
                let grandTotalPajak = 0;
                let replyMsg = `🛒 *PENJUALAN GROSIR SUKSES*\n\n`;
                let allMentions = [];

                for (let pt of targetPts) {
                    if (!pt.gudang || Object.keys(pt.gudang).every(k => !(pt.gudang[k] > 0))) {
                        if (!isGlobal) return m.reply(`📦 Gudang *${pt.name}* sudah kosong!`);
                        continue;
                    }

                    let totalPend = 0; let rincian = '';
                    for (let brg in pt.gudang) {
                        let stok = pt.gudang[brg];
                        if (!stok || stok <= 0) continue;
                        let pd = semuaProduk[brg];
                        let profit = stok * Math.floor((pd ? pd.baseHargaToko : 10000) * 0.75);
                        totalPend += profit;
                        rincian += `🔸 ${stok.toLocaleString('id-ID')}x ${brg} = ${formatRp(profit)}\n`;
                        pt.gudang[brg] = 0; 
                    }

                    if (totalPend === 0) continue;

                    let pajak = Math.floor(totalPend * 0.002);
                    let netPend = totalPend - pajak;

                    grandTotalPajak += pajak;
                    grandTotalPend += netPend;

                    let modalAwal = biayaInduk[pt.type] || 50000000000;
                    let totalInvest = pt.investors ? Object.values(pt.investors).reduce((a,b)=>a+b, 0) : 0;
                    let totalKapital = modalAwal + totalInvest;

                    let porsiOwner = modalAwal / totalKapital;
                    let profitOwner = Math.floor(netPend * porsiOwner);
                    pt.saldo += profitOwner;

                    replyMsg += `🏢 *${pt.name}*\n${rincian}`;
                    replyMsg += `> 💰 Omset: ${formatRp(totalPend)} | 🏛️ Pajak 0.2%: -${formatRp(pajak)}\n`;
                    replyMsg += `> 👑 Kas PT (Owner): +${formatRp(profitOwner)} (${(porsiOwner*100).toFixed(1)}%)\n`;

                    if (pt.investors) {
                        for (let inv in pt.investors) {
                            let porsi = pt.investors[inv] / totalKapital;
                            let profitInv = Math.floor(netPend * porsi);
                            if (global.db.data.users[inv]) {
                                global.db.data.users[inv].money += profitInv;
                                replyMsg += `> 💼 @${inv.split('@')[0]}: +${formatRp(profitInv)} (${(porsi*100).toFixed(1)}%)\n`;
                                if (!allMentions.includes(inv)) allMentions.push(inv);
                            }
                        }
                    }
                    replyMsg += '\n';
                }

                if (grandTotalPend === 0) return m.reply('📦 Tidak ada barang yang bisa dijual dari gudang saat ini.');

                replyMsg += `━━━━━━━━━━━━━━━━━━━━\n📈 *Total Pendapatan Bersih:* ${formatRp(grandTotalPend)}`;
                return m.reply(replyMsg.trim(), null, { mentions: allMentions });
            }

            case 'buy':
            case 'beli': {
                let jmlProd = parseInt(args[1]); 
                let namaItem = args[2] ? args[2].toLowerCase() : ''; 
                let idPt = parseInt(args[3]) - 1;
                
                if (!jmlProd || !namaItem || isNaN(idPt)) 
                    return m.reply(`⚠️ Format: *${usedPrefix+command} buy <jumlah> <item> <id_pt>*\nContoh: *${usedPrefix+command} buy 100 iron 1*`);
                
                let pt = user.perusahaan[idPt];
                if (!pt) return m.reply('❌ ID Perusahaan tidak valid!');
                
                let dp = semuaProduk[namaItem];
                if (!dp) return m.reply(`❌ Produk/Item *${namaItem}* tidak dikenali di sistem pasar Korporasi!`);

                if (pt.type !== 'listrik') {
                    let slotSisa = getKapasitasGudang(pt) - getSlotTerpakai(pt.gudang);
                    if (jmlProd > slotSisa) return m.reply(`❌ Gudang PT penuh!\nKapasitas tersisa: ${slotSisa.toLocaleString('id-ID')} slot`);
                }

                let hargaBeli = dp.baseHargaToko * jmlProd;
                // BAYAR PAKAI KAS PT
                if ((pt.saldo || 0) < hargaBeli) 
                    return m.reply(`❌ Kas PT kurang untuk membeli ${jmlProd.toLocaleString('id-ID')} ${dp.name}!\nButuh: ${formatRp(hargaBeli)}\nKas PT saat ini: ${formatRp(pt.saldo)}\n\n_Setor uang dulu pakai command: ${usedPrefix+command} setor <jumlah> uang ${idPt + 1}_`);

                pt.saldo -= hargaBeli;
                if (!pt.gudang) pt.gudang = {};
                pt.gudang[dp.db] = (pt.gudang[dp.db] || 0) + jmlProd;

                m.reply(
                    `🛒 *PEMBELIAN INSTAN SUKSES*\n\n` +
                    `🏢 Masuk Gudang: *${pt.name}*\n` +
                    `📦 Item: +${jmlProd.toLocaleString('id-ID')} ${dp.name}\n` +
                    `💸 Kas PT Terpotong: -${formatRp(hargaBeli)}`
                );
                break;
            }

            case 'upgrade': {
                let tipeUpgrade = args[1] ? args[1].toLowerCase() : '';
                let idPt = parseInt(args[2]) - 1; let jmlLevel = parseInt(args[3]) || 1;
                if (!['gudang', 'listrik'].includes(tipeUpgrade) || isNaN(idPt)) return m.reply(`⚠️ Format: *${usedPrefix+command} upgrade <gudang|listrik> <id_pt> [jml]*`);
                let pt = user.perusahaan[idPt];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

                if (tipeUpgrade === 'gudang') {
                    if (pt.type === 'listrik') return m.reply('❌ Hanya untuk PT Non-Listrik!');
                    let totalBiaya = Math.min(jmlLevel, MAX_LEVEL_GUDANG - (pt.gudangLevel || 1)) * HARGA_UPGRADE_GUDANG;
                    
                    // BAYAR PAKAI KAS PT
                    if ((pt.saldo || 0) < totalBiaya) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(totalBiaya)}\nKas PT saat ini: ${formatRp(pt.saldo)}\n\n_Setor uang dulu pakai command: ${usedPrefix+command} setor <jumlah> uang ${idPt + 1}_`);
                    
                    pt.saldo -= totalBiaya; pt.gudangLevel = (pt.gudangLevel || 1) + jmlLevel;
                    m.reply(`📦 Gudang diupgrade ke Lv *${pt.gudangLevel}*\nKapasitas Baru: ${getKapasitasGudang(pt).toLocaleString('id-ID')} Slot\n💸 Kas PT Terpotong: -${formatRp(totalBiaya)}`);
                } else {
                    if (pt.type !== 'listrik') return m.reply('❌ Hanya untuk PT LISTRIK!');
                    let totalBiaya = Math.min(jmlLevel, MAX_LEVEL_LISTRIK - (pt.listrikLevel || 1)) * HARGA_UPGRADE_LISTRIK;
                    
                    // BAYAR PAKAI KAS PT
                    if ((pt.saldo || 0) < totalBiaya) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(totalBiaya)}\nKas PT saat ini: ${formatRp(pt.saldo)}\n\n_Setor uang dulu pakai command: ${usedPrefix+command} setor <jumlah> uang ${idPt + 1}_`);
                    
                    pt.saldo -= totalBiaya; pt.listrikLevel = (pt.listrikLevel || 1) + jmlLevel;
                    m.reply(`⚡ Kapasitas Listrik diupgrade ke Lv *${pt.listrikLevel}*\nKapasitas Maksimal Baru: ${formatDaya(getKapasitasListrik(pt))}\n💸 Kas PT Terpotong: -${formatRp(totalBiaya)}`);
                }
                break;
            }

            case 'pabrik': {
                let idPt = parseInt(args[1]) - 1; let tipePabrik = args[2] ? args[2].toLowerCase() : ''; let namaPabrik = args.slice(3).join(' ');
                if (isNaN(idPt) || !biayaPabrikObj[tipePabrik] || !namaPabrik) return m.reply(`⚠️ Format: *${usedPrefix+command} pabrik <id> <tipe> <nama>*`);
                let pt = user.perusahaan[idPt];
                if (!pt || pt.type === 'listrik') return m.reply('❌ Gagal! ID tidak valid.');
                if (pt.pabrik.length >= 2) return m.reply('❌ Maks 2 anak pabrik per PT!');
                let hargaP = biayaPabrikObj[tipePabrik];
                
                // BAYAR PAKAI KAS PT
                if ((pt.saldo || 0) < hargaP) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(hargaP)}\nKas PT saat ini: ${formatRp(pt.saldo)}\n\n_Setor uang dulu pakai command: ${usedPrefix+command} setor <jumlah> uang ${idPt + 1}_`);
                
                pt.saldo -= hargaP; pt.pabrik.push({ name: namaPabrik, type: tipePabrik, karyawan: 10 });
                m.reply(`🏭 Pabrik *${namaPabrik}* berhasil dibangun!\n💸 Kas PT Terpotong: -${formatRp(hargaP)}`);
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

                let slotSisa = getKapasitasGudang(pt) - getSlotTerpakai(pt.gudang);
                if (jmlProd > slotSisa) return m.reply(`❌ Gudang penuh! Tersedia: ${slotSisa}`);

                let hargaL = getHargaListrik(user, pt);
                let totalBiaya = (jmlProd * dp.prodCost) + (jmlProd * 5 * hargaL);
                
                // BAYAR PAKAI KAS PT
                if ((pt.saldo || 0) < totalBiaya) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(totalBiaya)}\nKas PT: ${formatRp(pt.saldo)}\n\n_Silakan setor modal ke PT dulu!_`);

                pt.saldo -= totalBiaya;
                pt.gudang[dp.db] = (pt.gudang[dp.db] || 0) + jmlProd;
                m.reply(`🏭 *PRODUKSI BERHASIL*\n📦 ${dp.name} +${jmlProd.toLocaleString('id-ID')}\n💸 Kas PT Terpotong: -${formatRp(totalBiaya)}`);
                break;
            }

            case 'setlistrik': {
                let idPtTarget = parseInt(args[1]) - 1; let sumber = args[2] ? args[2].toLowerCase() : '';
                let pt = user.perusahaan[idPtTarget];
                if (!pt || pt.type === 'listrik') return m.reply('❌ ID invalid!');
                if (sumber === 'negara') { pt.sumberListrik = 'negara'; return m.reply(`✅ *${pt.name}* memakai listrik PLN`); }
                let idPtL = parseInt(sumber) - 1; let ptL = user.perusahaan[idPtL];
                if (!ptL || ptL.type !== 'listrik') return m.reply('❌ PT Listrik tidak valid!');
                pt.sumberListrik = ptL.id;
                m.reply(`✅ *${pt.name}* memakai listrik *${ptL.name}*`);
                break;
            }

            case 'settarif': {
                let idPtL = parseInt(args[1]) - 1; let tarif = parseInt(args[2]);
                if (isNaN(idPtL) || isNaN(tarif) || tarif < 1) return m.reply(`⚠️ Format: *${usedPrefix+command} settarif <id_pt_listrik> <harga_per_W>*`);
                let ptL = user.perusahaan[idPtL];
                if (!ptL || ptL.type !== 'listrik') return m.reply('❌ Bukan PT tipe Listrik!');
                if (tarif < 1000) return m.reply(`❌ Tarif minimum ${formatRp(1000)}/W.`);
                ptL.hargaListrikCustom = tarif;
                m.reply(`✅ Tarif *${ptL.name}* diset ke *${formatRp(tarif)}/W*`);
                break;
            }

            case 'ceklistrik': {
                let ptListrikList  = user.perusahaan.map((p,i) => ({idx:i+1,pt:p})).filter(({pt}) => pt && pt.type === 'listrik');
                
                let txt = `⚡ *CEK HARGA LISTRIK*\n\n`;
                txt += `🔵 *Listrik Negara (PLN)*\n`;
                txt += `   Tarif : *${formatRp(hargaListrikNegara)}/W*\n`;
                txt += `   Stok  : ♾️ Tidak terbatas\n`;
                txt += `   Set   : *${usedPrefix+command} setlistrik <id_pt> negara*\n\n`;

                if (ptListrikList.length) {
                    txt += `🟡 *PT Listrik Milikmu*\n`;
                    ptListrikList.forEach(({idx, pt}) => {
                        let tarif    = pt.hargaListrikCustom || 18600;
                        let kapMax   = getKapasitasListrik(pt);
                        let tersedia = pt.kapasitasTersedia || 0;
                        let bar      = progressBar(tersedia, kapMax, 8);

                        txt += `\n   *[ID ${idx}] ${pt.name}* — Lv ${pt.listrikLevel || 1}\n`;
                        txt += `   Tarif  : *${formatRp(tarif)}/W*\n`;
                        txt += `   Stok   : ${formatDaya(tersedia)} / ${formatDaya(kapMax)}\n`;
                        txt += `   [${bar}]\n`;
                        txt += `   Set    : *${usedPrefix+command} setlistrik <id_pt> ${idx}*\n`;
                    });
                } else {
                    txt += `🟡 *PT Listrik Milikmu*\n   _(Belum punya PT Listrik)_\n`;
                }

                m.reply(txt);
                break;
            }

            case 'setor':
            case 'tarik': {
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

            case 'ihsg':
            case 'leaderboard':
            case 'lb': {
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
                
                let top = entries.slice(0, 10);
                let total = entries.reduce((s, e) => s + e.valuasi, 0);
                let board = top.map((e, i) => `${i+1}. *${e.name}* (${e.type})\n👤 ${e.owner} | 💹 ~${formatSingkat(e.valuasi)}\n💰 Kas: ${formatRp(e.saldo)}`).join('\n\n');

                m.reply(`📊 *IHSG — LEADERBOARD*\n━━━━━━━━━━━━━━━━━━━━\n💼 Total Valuasi: ~${formatSingkat(total)}\n━━━━━━━━━━━━━━━━━━━━\n\n${board}`);
                break;
            }

            default: {
                m.reply(
                    `🏢 *MANAJEMEN PERUSAHAAN & SAHAM*\n\n` +
                    `🏛️ *PT & SAHAM*\n` +
                    `• *${usedPrefix+command} buat <tipe> <nama>*\n` +
                    `• *${usedPrefix+command} info [@tag]*\n` +
                    `• *${usedPrefix+command} invest <nom> <@tag> <id_pt>*\n` +
                    `• *${usedPrefix+command} tarikinvest <nom> <@tag> <id_pt>*\n\n` +
                    `🏦 *BANK KORPORASI*\n` +
                    `• *${usedPrefix+command} bank*\n` +
                    `• *${usedPrefix+command} pinjam <nom> <id_pt>*\n` +
                    `• *${usedPrefix+command} bayarbank <nom> <id_pt>*\n\n` +
                    `⚡ *LISTRIK & REFILL*\n` +
                    `• *${usedPrefix+command} buatpembangkit <id> <jenis>*\n` +
                    `• *${usedPrefix+command} upgrade listrik <id> <jml_lv>*\n` +
                    `• *${usedPrefix+command} setlistrik <id_pt> <negara|id_listrik>*\n` +
                    `• *${usedPrefix+command} settarif <id_listrik> <tarif>*\n` +
                    `• *${usedPrefix+command} ceklistrik*\n\n` +
                    `🏭 *PRODUKSI & UPGRADE*\n` +
                    `• *${usedPrefix+command} pabrik <id_pt> <tipe> <nama>*\n` +
                    `• *${usedPrefix+command} upgrade gudang <id_pt> <jml_lv>*\n` +
                    `• *${usedPrefix+command} produksi <jml> <item> <id_pt>*\n\n` +
                    `⚙️ *OPERASIONAL*\n` +
                    `• *${usedPrefix+command} setor/tarik <jml> <uang|item> <id_pt>*\n` +
                    `• *${usedPrefix+command} buy <jml> <item> <id_pt>*\n` +
                    `• *${usedPrefix+command} jualsemua [id_pt]*\n\n` +
                    `📊 *BURSA*\n` +
                    `• *${usedPrefix+command} ihsg*`
                );
                break;
            }
        }
    } catch (e) {
        console.error('ERROR:', e);
        m.reply(`❌ *Terjadi Kesalahan Sistem!*\nError: ${e.message}`);
    }
};

handler.help    = ['perusahaan'];
handler.tags    = ['rpg'];
handler.command = /^(perusahaan|pt|company)$/i;

module.exports = handler;
