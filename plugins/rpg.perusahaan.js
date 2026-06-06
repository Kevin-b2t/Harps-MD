let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    
    // Pastikan database market dan perusahaan tersedia
    if (!global.db.data.market) global.db.data.market = {};
    if (!Array.isArray(user.perusahaan)) user.perusahaan = [];

    // [PERBAIKAN] Bersihkan array dari elemen undefined/null akibat error database
    user.perusahaan = user.perusahaan.filter(pt => pt !== null && pt !== undefined);

    let action = args[0] ? args[0].toLowerCase() : 'help';

    // ==========================================
    // PENGATURAN HARGA & DATA PRODUK
    // ==========================================
    const biayaBuat = 85000000000000; // 85 Triliun
    const hargaRekrut = 1500000;      // 1.5 Juta per Karyawan
    const limitPerKaryawan = 5000000; // 1 Karyawan bisa kelola budget produksi 5 Juta

    // Daftar barang pabrik (Biaya produksi 15k - 165k)
    // baseHargaToko adalah acuan harga asli di shop untuk dihitung 75% saat dijual
    const produkList = {
        'potion': { prodCost: 15000, baseHargaToko: 25000, db: 'potion', name: 'Potion' },
        'bensin': { prodCost: 35000, baseHargaToko: 60000, db: 'bensin', name: 'Bensin' },
        'gardenboxs': { prodCost: 50000, baseHargaToko: 85000, db: 'gardenboxs', name: 'Gardenboxs' },
        'obat': { prodCost: 75000, baseHargaToko: 130000, db: 'obat', name: 'Obat' },
        'weap': { prodCost: 150000, baseHargaToko: 250000, db: 'weapon', name: 'Weapon' },
        'pancingan': { prodCost: 165000, baseHargaToko: 275000, db: 'pancingan', name: 'Pancingan' }
    };

    switch (action) {
        
        // --- BIKIN PERUSAHAAN BARU (Maks 2) ---
        case 'buat':
        case 'create':
            if (user.perusahaan.length >= 2) return m.reply('❌ Kamu sudah mencapai batas maksimal! Hanya boleh memiliki 2 Perusahaan.');
            
            let namaPT = args.slice(1).join(' ');
            if (!namaPT) return m.reply(`⚠️ Format salah!\nKetik: *${usedPrefix + command} buat [Nama Perusahaan]*\nContoh: *${usedPrefix + command} buat PT. Indofood*`);
            
            if (user.money < biayaBuat) return m.reply(`❌ Uangmu tidak cukup!\nButuh Modal: *Rp 85.000.000.000.000 (85T)*\nUangmu: *Rp ${user.money.toLocaleString()}*`);

            user.money -= biayaBuat;
            user.perusahaan.push({
                id: user.perusahaan.length + 1,
                name: namaPT,
                karyawan: 10, // Karyawan awal
                totalProduksi: 0
            });

            m.reply(`🎉 *SELAMAT!* 🎉\nKamu telah resmi mendirikan perusahaan raksasa bernama *${namaPT}* dengan modal 85 Triliun!\n\nKetik *${usedPrefix + command} info* untuk melihat detail perusahaanmu.`);
            break;

        // --- CEK STATUS PERUSAHAAN ---
        case 'info':
        case 'status':
            if (user.perusahaan.length === 0) return m.reply(`⚠️ Kamu belum memiliki perusahaan.\nKetik *${usedPrefix + command} buat [Nama]* untuk mendirikan perusahaan seharga 85 Triliun.`);
            
            let textInfo = `🏢 *ASET KORPORASI MILIKMU* 🏢\n\n`;
            user.perusahaan.forEach((pt, index) => {
                // [PERBAIKAN] Fallback jika ada key object database yang terhapus atau corrupt
                let nama = pt.name || `Perusahaan ${index + 1}`;
                let karyawan = pt.karyawan || 0;
                let totalProduksi = pt.totalProduksi || 0;
                let maxBudget = karyawan * limitPerKaryawan;

                textInfo += `*${index + 1}. ${nama}*\n`;
                textInfo += `👥 Karyawan: ${karyawan.toLocaleString()} Orang\n`;
                textInfo += `🏭 Max Budget Produksi: Rp ${maxBudget.toLocaleString()}\n`;
                textInfo += `📦 Total Sukses Produksi: ${totalProduksi.toLocaleString()} Item\n\n`;
            });
            textInfo += `> Rekrut karyawan: *${usedPrefix + command} rekrut <jumlah> <id_pt>*\n`;
            textInfo += `> Produksi barang: *${usedPrefix + command} produksi <biaya> <item> <id_pt>*`;
            m.reply(textInfo);
            break;

        // --- REKRUT KARYAWAN ---
        case 'rekrut':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            
            let jmlRekrut = parseInt(args[1]);
            let targetPT = parseInt(args[2]) - 1; // Index array

            if (!jmlRekrut || jmlRekrut < 1) return m.reply(`⚠️ Tentukan jumlah karyawan!\n*${usedPrefix + command} rekrut <jumlah> <id_pt>*\nContoh: *${usedPrefix + command} rekrut 100 1*`);
            if (isNaN(targetPT) || !user.perusahaan[targetPT]) return m.reply(`❌ ID Perusahaan tidak valid! Cek ID di *${usedPrefix + command} info*`);

            let biayaRekrut = jmlRekrut * hargaRekrut;
            if (user.money < biayaRekrut) return m.reply(`❌ Uang tidak cukup!\nBiaya rekrut ${jmlRekrut} karyawan adalah *Rp ${biayaRekrut.toLocaleString()}*`);

            // [PERBAIKAN] Pastikan key karyawan ada agar kalkulasi penjumlahan tidak NaN
            if (!user.perusahaan[targetPT].karyawan) user.perusahaan[targetPT].karyawan = 0;

            user.money -= biayaRekrut;
            user.perusahaan[targetPT].karyawan += jmlRekrut;

            let namaPTBaru = user.perusahaan[targetPT].name || `Perusahaan ${targetPT + 1}`;
            m.reply(`🤝 *HRD REPORT*\nBerhasil merekrut ${jmlRekrut.toLocaleString()} Karyawan untuk *${namaPTBaru}*.\nTotal Karyawan sekarang: ${user.perusahaan[targetPT].karyawan.toLocaleString()} Orang.\nBiaya: -Rp ${biayaRekrut.toLocaleString()}`);
            break;

        // --- PRODUKSI BARANG (DENGAN BIAYA BUDGET) ---
        case 'produksi':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            
            let budgetInput = parseInt(args[1]);
            let namaItem = args[2] ? args[2].toLowerCase() : '';
            let ptIndex = parseInt(args[3]) - 1;

            if (!budgetInput || !namaItem || isNaN(ptIndex)) {
                let daftarProd = Object.keys(produkList).map(v => `- ${v} (Cost: ${produkList[v].prodCost.toLocaleString()}/pcs)`).join('\n');
                return m.reply(`⚠️ Format salah!\n*${usedPrefix + command} produksi <biaya> <jenis-item> <id_pt>*\nContoh: *${usedPrefix + command} produksi 50000000 potion 1*\n\n*DAFTAR PRODUK BISA DIPRODUKSI:*\n${daftarProd}`);
            }

            let ptProd = user.perusahaan[ptIndex];
            if (!ptProd) return m.reply(`❌ ID Perusahaan tidak valid!`);
            if (!produkList[namaItem]) return m.reply(`❌ Pabrikmu belum memiliki mesin untuk memproduksi *${namaItem}*. Lihat daftar di menu produksi.`);

            // [PERBAIKAN] Hindari error perhitungan bila jumlah karyawan null/hilang
            let jmlKaryawanProd = ptProd.karyawan || 0;
            let maxBudgetPT = jmlKaryawanProd * limitPerKaryawan;
            let namaPTProd = ptProd.name || `Perusahaan ${ptIndex + 1}`;

            if (budgetInput > maxBudgetPT) return m.reply(`❌ Karyawanmu tidak sanggup mengelola budget sebesar itu dalam satu waktu!\nMax Budget ${namaPTProd} saat ini: *Rp ${maxBudgetPT.toLocaleString()}*\n_(Rekrut karyawan lagi untuk menaikkan limit)_`);
            
            if (user.money < budgetInput) return m.reply(`❌ Uangmu kurang!\nBudget Produksi: Rp ${budgetInput.toLocaleString()}\nUangmu: Rp ${user.money.toLocaleString()}`);

            let dataProduk = produkList[namaItem];
            let hasilPcs = Math.floor(budgetInput / dataProduk.prodCost);
            let sisaBudget = budgetInput % dataProduk.prodCost; // Jika ada kembalian
            let uangTerpakai = budgetInput - sisaBudget;

            if (hasilPcs < 1) return m.reply(`❌ Budget terlalu kecil! Biaya produksi 1 ${dataProduk.name} adalah Rp ${dataProduk.prodCost.toLocaleString()}`);

            // Eksekusi potong uang dan tambah barang ke inventory CEO (Player)
            user.money -= uangTerpakai;
            user[dataProduk.db] = (user[dataProduk.db] || 0) + hasilPcs;
            
            // [PERBAIKAN] Pastikan record log total produksi di database ada
            if (!ptProd.totalProduksi) ptProd.totalProduksi = 0;
            ptProd.totalProduksi += hasilPcs;

            m.reply(`🏭 *PRODUKSI PABRIK SELESAI* 🏭\n\nPerusahaan: *${namaPTProd}*\nItem: *${dataProduk.name}*\nBudget Terpakai: -Rp ${uangTerpakai.toLocaleString()}\nHasil Produksi: *+${hasilPcs.toLocaleString()} Pcs*\n\n_Barang telah disimpan di Gudang/Inventory pribadimu._\n_Gunakan *${usedPrefix + command} jual* untuk mendistribusikan barang ke Shop Global!_`);
            break;

        // --- DISTRIBUSI/JUAL KE SHOP GLOBAL (HARGA 75%) ---
        case 'jual':
        case 'distribusi':
            let jualJml = parseInt(args[1]);
            let jualItem = args[2] ? args[2].toLowerCase() : '';

            if (!jualJml || !jualItem) return m.reply(`⚠️ Format salah!\n*${usedPrefix + command} jual <jumlah> <jenis-item>*\nContoh: *${usedPrefix + command} jual 1000 potion*`);

            let prodData = produkList[jualItem];
            if (!prodData) return m.reply(`❌ Item *${jualItem}* tidak ada dalam list kontrak perusahaan.`);
            
            if ((user[prodData.db] || 0) < jualJml) return m.reply(`❌ Stok di inventory-mu tidak cukup! Sisa ${prodData.name} kamu: ${(user[prodData.db] || 0)}`);

            // Harga jual B2B (Business to Business) ke Shop adalah 75% dari harga dasar toko
            let hargaPerPcs = Math.floor(prodData.baseHargaToko * 0.75);
            let totalKeuntungan = hargaPerPcs * jualJml;

            // Potong item & tambah uang
            user[prodData.db] -= jualJml;
            user.money += totalKeuntungan;

            // RESTOCK GLOBAL MARKET DI RPG.SHOP.JS
            if (!global.db.data.market[prodData.db]) global.db.data.market[prodData.db] = { stock: 100000 };
            global.db.data.market[prodData.db].stock += jualJml;

            m.reply(`🚚 *DISTRIBUSI LOGISTIK SUKSES* 🚚\n\nKamu menjual *${jualJml.toLocaleString()} ${prodData.name}* ke Toko Global.\nHarga Grosir (75%): Rp ${hargaPerPcs.toLocaleString()} / pcs\n\n*Total Profit: +Rp ${totalKeuntungan.toLocaleString()}*\n\n_📈 Stok ${prodData.name} di .shop server telah bertambah, sehingga harga pasarannya perlahan akan turun/stabil kembali!_`);
            break;

        // --- MENU BANTUAN ---
        default:
            let help = `🏢 *SISTEM MEGA KORPORAT* 🏢\n\n`
            help += `Sistem ini memungkinkan kamu menjadi CEO, merekrut karyawan, memproduksi barang massal, dan menyuplai Toko Global server!\n\n`
            help += `*${usedPrefix + command} buat <nama>* - Bangun PT (Modal 85T)\n`
            help += `*${usedPrefix + command} info* - Cek Data Aset & Karyawan\n`
            help += `*${usedPrefix + command} rekrut <jumlah> <id_pt>* - Hire HRD (1.5 Jt/Org)\n`
            help += `*${usedPrefix + command} produksi <biaya> <item> <id_pt>* - Mulai produksi mesin pabrik berdasarkan budget\n`
            help += `*${usedPrefix + command} jual <jumlah> <item>* - Jual ke Toko Global (Harga Grosir 75% & Mengisi stok Server)\n\n`
            help += `_Kendalikan supply barang di Shop, jadilah triliuner!_`
            m.reply(help);
    }
}

handler.help = ['perusahaan']
handler.tags = ['rpg']
handler.command = /^(perusahaan|company|pt)$/i

module.exports = handler;
