const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    
    if (!global.db.data.market) global.db.data.market = {};
    if (!Array.isArray(user.perusahaan)) user.perusahaan = [];

    let action = args[0] ? args[0].toLowerCase() : 'help';

    const biayaBuat = 85000000000000; // 85 Triliun
    const hargaRekrut = 1500000;      // 1.5 Juta per Karyawan
    const limitPerKaryawan = 5000000; // 5 Juta budget per karyawan

    // 6 Jenis Perusahaan & Produk Spesifikasinya
    const jenisIndustri = {
        '1': { namaTipe: 'Farmasi', item: 'potion', prodCost: 15000, baseHargaToko: 25000, db: 'potion', name: 'Potion' },
        '2': { namaTipe: 'Energi', item: 'bensin', prodCost: 35000, baseHargaToko: 60000, db: 'bensin', name: 'Bensin' },
        '3': { namaTipe: 'Agrikultur', item: 'gardenboxs', prodCost: 50000, baseHargaToko: 85000, db: 'gardenboxs', name: 'Gardenboxs' },
        '4': { namaTipe: 'Medis', item: 'obat', prodCost: 75000, baseHargaToko: 130000, db: 'obat', name: 'Obat' },
        '5': { namaTipe: 'Militer', item: 'weap', prodCost: 150000, baseHargaToko: 250000, db: 'weapon', name: 'Weapon' },
        '6': { namaTipe: 'Maritim', item: 'pancingan', prodCost: 165000, baseHargaToko: 275000, db: 'pancingan', name: 'Pancingan' }
    };

    switch (action) {
        
        // --- BIKIN PERUSAHAAN BARU (MAKS 2 & PILIH JENIS) ---
        case 'buat':
        case 'create':
            if (user.perusahaan.length >= 2) return m.reply('❌ Batas maksimal tercapai! Kamu hanya boleh memiliki 2 Perusahaan.');
            
            let tipeDipilih = args[1];
            let namaPT = args.slice(2).join(' ');

            if (!tipeDipilih || !jenisIndustri[tipeDipilih] || !namaPT) {
                let listTipe = Object.keys(jenisIndustri).map(k => `*${k}. Sektor ${jenisIndustri[k].namaTipe}* (Membuat: ${jenisIndustri[k].name})`).join('\n');
                return m.reply(`⚠️ *Format Salah!*\n\nKetik: *${usedPrefix + command} buat [Nomor_Jenis] [Nama PT]*\nContoh: *${usedPrefix + command} buat 5 PT. Stark Industries*\n\n*SILAHKAN PILIH 1 DARI 6 JENIS INDUSTRI INI:*\n${listTipe}`);
            }
            
            if (user.money < biayaBuat) return m.reply(`❌ Modal tidak cukup!\nButuh Dana: *Rp 85T*\nUangmu: *Rp ${user.money.toLocaleString()}*`);

            user.money -= biayaBuat;
            user.perusahaan.push({
                id: user.perusahaan.length + 1,
                name: namaPT,
                tipe: tipeDipilih,
                karyawan: 10, 
                totalProduksi: 0
            });

            m.reply(`🎉 *CORP FOUNDED!* 🎉\n\nSelamat Boss! Kamu mendirikan perusahaan berlisensi resmi:\n🏢 *Nama:* ${namaPT}\n⚙️ *Sektor:* Perusahaan ${jenisIndustri[tipeDipilih].namaTipe}\n📦 *Produk Utama:* ${jenisIndustri[tipeDipilih].name}\n\nKetik *${usedPrefix + command} info* untuk memantau dewan direksi.`);
            break;

        // --- CEK STATUS PERUSAHAAN ---
        case 'info':
        case 'status':
            if (user.perusahaan.length === 0) return m.reply(`⚠️ Kamu belum punya aset korporasi. Ketik *${usedPrefix + command} buat*`);
            
            let textInfo = `🏢 *BOARD OF DIRECTORS REPORT* 🏢\n\n`;
            user.perusahaan.forEach((pt, index) => {
                let ind = jenisIndustri[pt.tipe];
                let maxBudget = pt.karyawan * limitPerKaryawan;
                textInfo += `*#ID ${index + 1}: ${pt.name}*\n`;
                textInfo += `⚙️ Jenis Industri: Sektor ${ind.namaTipe}\n`;
                textInfo += `👥 Staf/Karyawan: ${pt.karyawan.toLocaleString()} Orang\n`;
                textInfo += `💰 Limit Dana Produksi: Rp ${maxBudget.toLocaleString()}\n`;
                textInfo += `🏭 Total Output Pabrik: ${pt.totalProduksi.toLocaleString()} Pcs ${ind.name}\n\n`;
            });
            textInfo += `> Rekrut staf: *${usedPrefix + command} rekrut <jumlah> <id_pt>*\n`;
            textInfo += `> Produksi: *${usedPrefix + command} produksi <biaya> <id_pt>*`;
            m.reply(textInfo);
            break;

        // --- INTERAKSI BOSS KEPADA HRD (REKRUT) ---
        case 'rekrut':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum punya perusahaan!');
            
            let jmlRekrut = parseInt(args[1]);
            let targetPT = parseInt(args[2]) - 1;

            if (!jmlRekrut || jmlRekrut < 1 || isNaN(targetPT) || !user.perusahaan[targetPT]) {
                return m.reply(`⚠️ Format rekrutmen staf:\n*${usedPrefix + command} rekrut <jumlah> <id_pt>*\nContoh: *${usedPrefix + command} rekrut 20 1*`);
            }

            let biayaRekrut = jmlRekrut * hargaRekrut;
            if (user.money < biayaRekrut) return m.reply(`❌ Kas pribadi tidak cukup untuk membayar biaya agensi HRD sebesar Rp ${biayaRekrut.toLocaleString()}`);

            user.money -= biayaRekrut;
            user.perusahaan[targetPT].karyawan += jmlRekrut;

            let dialogs = [
                `👨‍💼 *HRD:* "Baik Pak CEO, berkas pelamar sudah saya seleksi ketat. ${jmlRekrut} orang kompeten siap masuk meja kerja besok pagi!"`,
                `👨‍💼 *HRD:* "Siap Pak! Posisi kosong langsung kami isi dengan ${jmlRekrut} orang profesional. Kontrak kerja sudah ditandatangani."`,
                `👨‍💼 *HRD:* "Permintaan diterima Boss! Tim rekrutmen berhasil mengamankan ${jmlRekrut} kandidat terbaik dari universitas top."`
            ];
            let randomDialog = dialogs[Math.floor(Math.random() * dialogs.length)];

            m.reply(`💼 *INTERAKSI HRD & CEO* 💼\n\n*CEO:* "Saya butuh tambahan ${jmlRekrut} tenaga ahli baru di divisi ${user.perusahaan[targetPT].name}, lakukan segera!"\n\n${randomDialog}\n\n💸 *Pengeluaran:* -Rp ${biayaRekrut.toLocaleString()}\n👥 *Total Staf:* ${user.perusahaan[targetPT].karyawan.toLocaleString()} Orang`);
            break;

        // --- ANIMASI SAAT PRODUK DIBUAT ---
        case 'produksi':
            if (user.perusahaan.length === 0) return m.reply('⚠️ Kamu belum memiliki perusahaan!');
            
            let budgetInput = parseInt(args[1]);
            let ptIndex = parseInt(args[2]) - 1;

            if (!budgetInput || isNaN(ptIndex) || !user.perusahaan[ptIndex]) {
                return m.reply(`⚠️ Format salah!\n*${usedPrefix + command} produksi <biaya> <id_pt>*\nContoh: *${usedPrefix + command} produksi 50000000 1*`);
            }

            let ptProd = user.perusahaan[ptIndex];
            let indData = jenisIndustri[ptProd.tipe];

            let maxBudgetPT = ptProd.karyawan * limitPerKaryawan;
            if (budgetInput > maxBudgetPT) return m.reply(`❌ Struktur operasional karyawan tidak sanggup mengelola budget sebesar itu!\nMax budget ${ptProd.name}: *Rp ${maxBudgetPT.toLocaleString()}*`);
            
            if (user.money < budgetInput) return m.reply(`❌ Saldo rekening perusahaan tidak cukup untuk dana produksi.`);

            let hasilPcs = Math.floor(budgetInput / indData.prodCost);
            let sisaBudget = budgetInput % indData.prodCost;
            let uangTerpakai = budgetInput - sisaBudget;

            if (hasilPcs < 1) return m.reply(`❌ Dana operasional terlalu kecil untuk memproses minimal 1 unit barang.`);

            user.money -= uangTerpakai;

            // --- ANIMASI PRODUKSI (MANUFAKTUR) ---
            let { key } = await conn.reply(m.chat, `⚙️ *[MANUFAKTUR DIMULAI]*\nPabrik *${ptProd.name}* sedang memproses pesanan...`, m);
            await delay(1500);
            await conn.sendMessage(m.chat, { text: `⚡ *[PROCESSING]*\n█▒▒▒▒▒▒▒▒▒ 15% \nMesin menyala, staf merakit komponen *${indData.name}*...`, edit: key });
            await delay(1500);
            await conn.sendMessage(m.chat, { text: `🔥 *[PROCESSING]*\n█████▒▒▒▒▒ 55% \nQuality Control sedang memverifikasi standar kelayakan produk...`, edit: key });
            await delay(1500);
            await conn.sendMessage(m.chat, { text: `📦 *[PACKAGING]*\n█████████▒ 90% \nBarang selesai dibuat, proses packing ke dalam palet logistik...`, edit: key });
            await delay(1000);

            // Selesai, tambahkan item ke inventory
            user[indData.db] = (user[indData.db] || 0) + hasilPcs;
            ptProd.totalProduksi += hasilPcs;

            await conn.sendMessage(m.chat, { text: `✅ *PABRIK SELESAI BEROPERASI* ✅\n\n🏭 Perusahaan: *${ptProd.name}*\n⚙️ Sektor: *${indData.namaTipe}*\n📦 Output: *+${hasilPcs.toLocaleString()} Pcs ${indData.name}*\n💸 Anggaran: -Rp ${uangTerpakai.toLocaleString()}\n\n_Semua barang telah dikirim masuk ke Gudang/Inventory pribadimu._`, edit: key });
            break;

        // --- JUAL HASIL PRODUKSI KE SHOP GLOBAL ---
        case 'jual':
        case 'distribusi':
            let jualJml = parseInt(args[1]);
            let jualItem = args[2] ? args[2].toLowerCase() : '';

            if (!jualJml || !jualItem) return m.reply(`⚠️ Format salah!\n*${usedPrefix + command} jual <jumlah> <jenis-item>*\nContoh: *${usedPrefix + command} jual 1000 bensin*`);

            // Cari data produk berdasarkan input string name
            let prodData = Object.values(jenisIndustri).find(v => v.item === jualItem);
            if (!prodData) return m.reply(`❌ Komoditas *${jualItem}* tidak dikenali oleh pasar grosir.`);
            
            if ((user[prodData.db] || 0) < jualJml) return m.reply(`❌ Gudang pribadimu kekurangan pasokan! Sisa ${prodData.name} kamu: ${(user[prodData.db] || 0)}`);

            let hargaPerPcs = Math.floor(prodData.baseHargaToko * 0.75);
            let totalKeuntungan = hargaPerPcs * jualJml;

            user[prodData.db] -= jualJml;
            user.money += totalKeuntungan;

            if (!global.db.data.market[prodData.db]) global.db.data.market[prodData.db] = { stock: 100000 };
            global.db.data.market[prodData.db].stock += jualJml;

            m.reply(`🚚 *LOGISTIK KORPORASI SUKSES* 🚚\n\nKamu mendistribusikan *${jualJml.toLocaleString()} Pcs ${prodData.name}* langsung ke pasar umum.\nHarga Kontrak Grosir (75%): Rp ${hargaPerPcs.toLocaleString()} / pcs\n\n*💰 Dana Segar Masuk: +Rp ${totalKeuntungan.toLocaleString()}*\n\n_📈 Stok ${prodData.name} di .shop server telah diperbarui. Harga di pasar ritel akan berangsur turun._`);
            break;

        default:
            let help = `🏢 *DASHBOARD KORPORASI* 🏢\n\n`
            help += `*${usedPrefix + command} buat [no_tipe] [nama]* - Bangun PT Industri (Modal 85T)\n`
            help += `*${usedPrefix + command} info* - Monitoring Aset Operasional\n`
            help += `*${usedPrefix + command} rekrut <jumlah> <id_pt>* - Beri instruksi ke HRD\n`
            help += `*${usedPrefix + command} produksi <biaya> <id_pt>* - Mulai jalankan pabrik\n`
            help += `*${usedPrefix + command} jual <jumlah> <nama_item>* - Suplai produk ke .shop global\n\n`
            help += `_Kuasai rantai pasok server dan jadilah penguasa pasar monopoli!_`;
            m.reply(help);
    }
}

handler.help = ['perusahaan']
handler.tags = ['rpg']
handler.command = /^(perusahaan|company|pt)$/i

module.exports = handler;
