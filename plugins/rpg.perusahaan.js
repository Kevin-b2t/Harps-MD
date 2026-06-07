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

    // Daftar Tipe Perusahaan
    const tipePerusahaan = ['minuman', 'umum'];

    // Daftar barang pabrik lengkap dengan Tipe dan Bahan Baku (Sesuai ide di catatan)
    const produkList = {
        // --- TIPE: MINUMAN ---
        'airmineral': { type: 'minuman', name: 'Air Mineral', db: 'airmineral', prodCost: 5000, baseHargaToko: 15000, bahan: { botol: 1, air: 1 } },
        'tehbotol':   { type: 'minuman', name: 'Teh Botol', db: 'tehbotol', prodCost: 8000, baseHargaToko: 20000, bahan: { botol: 1, daunteh: 1, air: 1 } },
        'nescafe':    { type: 'minuman', name: 'Nescafe', db: 'nescafe', prodCost: 12000, baseHargaToko: 25000, bahan: { kaleng: 1, bijikopi: 1, air: 1 } },
        'ultramilk':  { type: 'minuman', name: 'Ultra Milk', db: 'ultramilk', prodCost: 15000, baseHargaToko: 30000, bahan: { botol: 1, susu: 1 } },
        'jusanggur':  { type: 'minuman', name: 'Jus Anggur', db: 'jusanggur', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, anggur: 2 } },
        'jusapel':    { type: 'minuman', name: 'Jus Apel', db: 'jusapel', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, apel: 2 } },
        'jusjeruk':   { type: 'minuman', name: 'Jus Jeruk', db: 'jusjeruk', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, jeruk: 2 } },
        'jusmangga':  { type: 'minuman', name: 'Jus Mangga', db: 'jusmangga', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, mangga: 2 } },
        'juspisang':  { type: 'minuman', name: 'Jus Pisang', db: 'juspisang', prodCost: 10000, baseHargaToko: 22000, bahan: { botol: 1, pisang: 2 } },
        
        // --- TIPE: UMUM ---
        'potion':     { type: 'umum', name: 'Potion', db: 'potion', prodCost: 15000, baseHargaToko: 25000, bahan: { herb: 2, air: 1 } },
        'bensin':     { type: 'umum', name: 'Bensin', db: 'bensin', prodCost: 35000, baseHargaToko: 60000, bahan: { minyak: 3 } },
        'obat':       { type: 'umum', name: 'Obat', db: 'obat', prodCost: 75000, baseHargaToko: 130000, bahan: { herb: 5, air: 2 } }
    };

    switch (action) {
        
        // --- BIKIN PERUSAHAAN BARU (Maks 2) ---
        case 'buat':
        case 'create':
            if (user.perusahaan.length >= 2) return m.reply('❌ Kamu sudah mencapai batas maksimal! Hanya boleh memiliki 2 Perusahaan.');
            
            let ptType = args[1] ? args[1].toLowerCase() : '';
            let namaPT = args.slice(2).join(' ');
            
            if (!tipePerusahaan.includes(ptType) || !namaPT) {
                return m.reply(`⚠️ Format salah!\nKetik: *${usedPrefix + command} buat [tipe] [Nama Perusahaan]*\nTipe tersedia: *${tipePerusahaan.join(', ')}*\nContoh: *${usedPrefix + command} buat minuman PT. Indofood*`);
            }
            
            if (user.money < biayaBuat) return m.reply(`❌ Uangmu tidak cukup!\nButuh Modal: *Rp 85.000.000.000.000 (85T)*\nUangmu: *Rp ${user.money.toLocaleString()}*`);

            user.money -= biayaBuat;
            user.perusahaan.push({
                id: user.perusahaan.length + 1,
                name: namaPT,
                type: ptType, // Tambahan Tipe Perusahaan
                karyawan: 10,
                totalProduksi: 0
            });

            m.reply(`🎉 *SELAMAT!* 🎉\nKamu telah resmi mendirikan perusahaan *${ptType.toUpperCase()}* bernama *${namaPT}* dengan modal 85 Triliun!\n\nKetik *${usedPrefix + command} info* untuk melihat detail perusahaanmu.`);
            break;

        // --- CEK STATUS PERUSAHAAN ---
        case 'info':
        case 'status':
            if (user.perusahaan.length === 0) return m.reply(`⚠️ Kamu belum memiliki perusahaan.\nKetik *${usedPrefix + command} buat [tipe] [Nama]* untuk mendirikan perusahaan seharga 85 Triliun.`);
            
            let textInfo = `🏢 *ASET KORPORASI MILIKMU* 🏢\n\n`;
            user.perusahaan.forEach((pt, index) => {
                let nama = pt.name || `Perusahaan ${index + 1}`;
                let tipe = pt.type ? pt.type.toUpperCase() : 'UMUM';
                let karyawan = pt.karyawan || 0;
                let totalProduksi = pt.totalProduksi || 0;
                let maxBudget = karyawan * limitPerKaryawan;

                textInfo += `*${index + 1}. ${nama}*\n`;
                textInfo += `🏭 Tipe Pabrik: *${tipe}*\n`;
                textInfo += `👥 Karyawan: ${karyawan.toLocaleString()} Orang\n`;
                textInfo += `💰 Max Kapasitas Biaya Produksi: Rp ${maxBudget.toLocaleString()}\n`;
                textInfo += `📦 Total Sukses Produksi: ${totalProduksi.toLocaleString()} Item\n\n`;
            });
            textInfo += `> Rekrut: *${usedPrefix + command} rekrut <jumlah> <id_pt>*\n`;
            textInfo += `> Produksi: *${usedPrefix + command} produksi <jumlah_item> <item> <id_pt>*`;
            m.reply(textInfo);
            break;

        // --- REKRUT KARYAWAN ---
        case 'rekrut':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            
            let jmlRekrut = parseInt(args[1]);
            let targetPT = parseInt(args[2]) - 1;

            if (!jmlRekrut || jmlRekrut < 1) return m.reply(`⚠️ Tentukan jumlah karyawan!\n*${usedPrefix + command} rekrut <jumlah> <id_pt>*\nContoh: *${usedPrefix + command} rekrut 100 1*`);
            if (isNaN(targetPT) || !user.perusahaan[targetPT]) return m.reply(`❌ ID Perusahaan tidak valid! Cek ID di *${usedPrefix + command} info*`);

            let biayaRekrut = jmlRekrut * hargaRekrut;
            if (user.money < biayaRekrut) return m.reply(`❌ Uang tidak cukup!\nBiaya rekrut ${jmlRekrut} karyawan adalah *Rp ${biayaRekrut.toLocaleString()}*`);

            if (!user.perusahaan[targetPT].karyawan) user.perusahaan[targetPT].karyawan = 0;

            user.money -= biayaRekrut;
            user.perusahaan[targetPT].karyawan += jmlRekrut;

            let namaPTBaru = user.perusahaan[targetPT].name || `Perusahaan ${targetPT + 1}`;
            m.reply(`🤝 *HRD REPORT*\nBerhasil merekrut ${jmlRekrut.toLocaleString()} Karyawan untuk *${namaPTBaru}*.\nTotal Karyawan sekarang: ${user.perusahaan[targetPT].karyawan.toLocaleString()} Orang.\nBiaya: -Rp ${biayaRekrut.toLocaleString()}`);
            break;

        // --- PRODUKSI BARANG (DENGAN BIAYA & BAHAN BAKU) ---
        case 'produksi':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            
            // Mengubah sistem input dari budget menjadi target jumlah item
            let jmlProd = parseInt(args[1]); 
            let namaItem = args[2] ? args[2].toLowerCase() : '';
            let ptIndex = parseInt(args[3]) - 1;

            if (!jmlProd || !namaItem || isNaN(ptIndex)) {
                let daftarProd = Object.keys(produkList).map(v => {
                    let resep = Object.entries(produkList[v].bahan).map(([b, n]) => `${n} ${b}`).join(', ');
                    return `- *${v}* [${produkList[v].type.toUpperCase()}]\n  Biaya: Rp ${produkList[v].prodCost.toLocaleString()}\n  Bahan: ${resep}`;
                }).join('\n\n');
                
                return m.reply(`⚠️ Format salah!\n*${usedPrefix + command} produksi <jumlah_item> <nama-item> <id_pt>*\nContoh: *${usedPrefix + command} produksi 1000 airmineral 1*\n\n*DAFTAR PRODUK & RESEP:*\n${daftarProd}`);
            }

            let ptProd = user.perusahaan[ptIndex];
            if (!ptProd) return m.reply(`❌ ID Perusahaan tidak valid!`);
            
            let dataProduk = produkList[namaItem];
            if (!dataProduk) return m.reply(`❌ Item *${namaItem}* tidak ada dalam list produk.`);

            // Cek kesesuaian Tipe Perusahaan dan Tipe Produk
            let ptTypeInfo = ptProd.type || 'umum';
            if (dataProduk.type !== ptTypeInfo) {
                return m.reply(`❌ Perusahaanmu bertipe *${ptTypeInfo.toUpperCase()}*, pabrik ini tidak memiliki mesin untuk memproduksi *${dataProduk.name}* (Tipe: ${dataProduk.type.toUpperCase()})!`);
            }

            let jmlKaryawanProd = ptProd.karyawan || 0;
            let maxBudgetPT = jmlKaryawanProd * limitPerKaryawan;
            let namaPTProd = ptProd.name || `Perusahaan ${ptIndex + 1}`;
            let totalBiayaPabrik = jmlProd * dataProduk.prodCost;

            if (totalBiayaPabrik > maxBudgetPT) return m.reply(`❌ Karyawanmu tidak sanggup mengelola skala produksi sebesar ini!\nMax kapasitas produksi (Budget) ${namaPTProd} saat ini: *Rp ${maxBudgetPT.toLocaleString()}*\nBiaya produksi ${jmlProd.toLocaleString()} pcs = *Rp ${totalBiayaPabrik.toLocaleString()}*\n_(Rekrut karyawan lagi untuk menaikkan limit)_`);
            
            if (user.money < totalBiayaPabrik) return m.reply(`❌ Uang Modal Kurang!\nButuh Biaya Pabrik: Rp ${totalBiayaPabrik.toLocaleString()}\nUangmu: Rp ${user.money.toLocaleString()}`);

            // Cek ketersediaan BAHAN BAKU di inventory
            let kurangBahan = [];
            for (let b in dataProduk.bahan) {
                let butuhBahan = dataProduk.bahan[b] * jmlProd;
                let stokBahan = user[b] || 0;
                if (stokBahan < butuhBahan) {
                    kurangBahan.push(`- ${b}: Butuh ${butuhBahan.toLocaleString()}, Punya ${stokBahan.toLocaleString()} (Kurang ${(butuhBahan - stokBahan).toLocaleString()})`);
                }
            }

            if (kurangBahan.length > 0) {
                return m.reply(`❌ *BAHAN BAKU TIDAK MENCUKUPI!*\nUntuk memproduksi ${jmlProd.toLocaleString()} ${dataProduk.name}, kamu kekurangan bahan:\n\n${kurangBahan.join('\n')}\n\n_Silakan cari atau beli bahan baku di market terlebih dahulu!_`);
            }

            // EKSEKUSI PRODUKSI: Potong Uang & Bahan Baku
            user.money -= totalBiayaPabrik;
            let logBahanTeks = '';
            for (let b in dataProduk.bahan) {
                let potong = dataProduk.bahan[b] * jmlProd;
                user[b] -= potong;
                logBahanTeks += `> ${b}: -${potong.toLocaleString()}\n`;
            }

            // Tambah hasil produksi ke Inventory
            user[dataProduk.db] = (user[dataProduk.db] || 0) + jmlProd;
            
            if (!ptProd.totalProduksi) ptProd.totalProduksi = 0;
            ptProd.totalProduksi += jmlProd;

            m.reply(`🏭 *PRODUKSI PABRIK SELESAI* 🏭\n\nPerusahaan: *${namaPTProd}*\nItem: *${dataProduk.name}*\nHasil Produksi: *+${jmlProd.toLocaleString()} Pcs*\n\n*PENGELUARAN PABRIK:*\n> Biaya Produksi: -Rp ${totalBiayaPabrik.toLocaleString()}\n${logBahanTeks}\n_Gudang pabrik telah menyimpan hasilnya ke inventory pribadimu._`);
            break;

        // --- DISTRIBUSI/JUAL KE SHOP GLOBAL (HARGA 75%) ---
        case 'jual':
        case 'distribusi':
            let jualJml = parseInt(args[1]);
            let jualItem = args[2] ? args[2].toLowerCase() : '';

            if (!jualJml || !jualItem) return m.reply(`⚠️ Format salah!\n*${usedPrefix + command} jual <jumlah> <jenis-item>*\nContoh: *${usedPrefix + command} jual 1000 tehbotol*`);

            let prodData = produkList[jualItem];
            if (!prodData) return m.reply(`❌ Item *${jualItem}* tidak ada dalam list kontrak perusahaan.`);
            
            if ((user[prodData.db] || 0) < jualJml) return m.reply(`❌ Stok di inventory-mu tidak cukup! Sisa ${prodData.name} kamu: ${(user[prodData.db] || 0)}`);

            let hargaPerPcs = Math.floor(prodData.baseHargaToko * 0.75);
            let totalKeuntungan = hargaPerPcs * jualJml;

            user[prodData.db] -= jualJml;
            user.money += totalKeuntungan;

            // RESTOCK GLOBAL MARKET
            if (!global.db.data.market[prodData.db]) global.db.data.market[prodData.db] = { stock: 100000 };
            global.db.data.market[prodData.db].stock += jualJml;

            m.reply(`🚚 *DISTRIBUSI LOGISTIK SUKSES* 🚚\n\nKamu menjual *${jualJml.toLocaleString()} ${prodData.name}* ke Toko Global.\nHarga Grosir (75%): Rp ${hargaPerPcs.toLocaleString()} / pcs\n\n*Total Profit: +Rp ${totalKeuntungan.toLocaleString()}*\n\n_📈 Stok ${prodData.name} di market global telah bertambah._`);
            break;

        // --- MENU BANTUAN ---
        default:
            let help = `🏢 *SISTEM MEGA KORPORAT* 🏢\n\n`
            help += `Sistem ini mengharuskanmu mengumpulkan bahan baku dan modal untuk memproduksi item massal.\n\n`
            help += `*${usedPrefix + command} buat <tipe> <nama>* - Bangun PT (Modal 85T)\n  └ _Tipe: minuman, umum_\n`
            help += `*${usedPrefix + command} info* - Cek Data Aset & Karyawan\n`
            help += `*${usedPrefix + command} rekrut <jumlah> <id_pt>* - Hire HRD (1.5 Jt/Org)\n`
            help += `*${usedPrefix + command} produksi <jumlah> <item> <id_pt>* - Mulai produksi & potong bahan baku inventory\n`
            help += `*${usedPrefix + command} jual <jumlah> <item>* - Jual ke Toko Global (Harga Grosir 75%)\n\n`
            help += `_Kumpulkan bahan, atur strategi pabrik, dan jadilah triliuner!_`
            m.reply(help);
    }
}

handler.help = ['perusahaan']
handler.tags = ['rpg']
handler.command = /^(perusahaan|company|pt)$/i

module.exports = handler;
