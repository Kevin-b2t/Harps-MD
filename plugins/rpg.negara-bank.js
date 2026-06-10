// ==========================================
// FITUR NEGARA, BANK, BUMN & KORUPSI RPG (PREMIUM UI)
// Coded/Merged with Enhanced Visuals by: Gemini AI
// ==========================================

function formatRp(n) { return 'Rp ' + (n || 0).toLocaleString('id-ID'); }
function formatSingkat(n) {
    n = n || 0;
    if (n >= 1e12) return (n / 1e12).toFixed(2) + ' T';
    if (n >= 1e9)  return (n / 1e9).toFixed(2)  + ' M';
    if (n >= 1e6)  return (n / 1e6).toFixed(2)  + ' Jt';
    return n.toLocaleString('id-ID');
}
function msToTime(duration) {
    if (duration <= 0) return "0 Detik";
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
        days = Math.floor(duration / (1000 * 60 * 60 * 24));
    
    let str = '';
    if (days > 0) str += days + " Hari ";
    if (hours > 0) str += hours + " Jam ";
    if (minutes > 0) str += minutes + " Menit ";
    if (seconds > 0) str += seconds + " Detik";
    return str.trim();
}
function hitungAset(pt) {
    let val = pt.saldo || 0;
    val += (pt.gudangLevel || 1) * 4000000;
    val += (pt.listrikLevel || 1) * 1000000;
    return val;
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        let users = global.db.data.users;
        let sender = m.sender;
        let user = users[sender];
        if (!user) return m.reply('❌ Data user tidak ditemukan!');
        
        let now = Date.now();

        // Inisialisasi Data Default User
        if (user.money === undefined) user.money = 0;
        if (user.bank === undefined) user.bank = 0;
        if (user.hutangNegara === undefined) user.hutangNegara = 0;
        if (user.lastBansos === undefined) user.lastBansos = 0;
        if (user.lastKorupsi === undefined) user.lastKorupsi = 0;
        if (user.lastBankTax === undefined) user.lastBankTax = now; 

        // Inisialisasi Database Negara
        if (!global.db.data.negara) {
            global.db.data.negara = {
                presiden: null, waktuLantik: 0, kas: 100000000000, bank: false, bumn: [],
                kandidat: {}, isPemilu: false, waktuMulaiPemilu: 0, voters: [], pln: null, pdam: null,
                investBankOpen: true, investPTOpen: true, danaBansos: 0         
            };
        }
        let negara = global.db.data.negara;
        
        if (negara.investBankOpen === undefined) negara.investBankOpen = true;
        if (negara.investPTOpen === undefined) negara.investPTOpen = true;
        if (negara.danaBansos === undefined) negara.danaBansos = 0;
        if (!negara.voters) negara.voters = [];
        if (!negara.pln && negara.pln !== null) negara.pln = null;
        if (!negara.pdam && negara.pdam !== null) negara.pdam = null;
        
        let cmd = command.toLowerCase();

        // ==========================================
        // AUTO PAJAK HARIAN BANK (0.2% PER HARI) 
        // ==========================================
        if (negara.bank && user.bank > 0) {
            let intervalHari = 24 * 60 * 60 * 1000;
            let daysPassed = Math.floor((now - user.lastBankTax) / intervalHari);
            if (daysPassed >= 1) {
                let pajakHarian = Math.floor(user.bank * 0.002 * daysPassed);
                if (pajakHarian > user.bank) pajakHarian = user.bank;
                
                user.bank -= pajakHarian;
                negara.kas += pajakHarian; 
                user.lastBankTax += (daysPassed * intervalHari); 
            }
        } else if (!negara.bank || user.bank === 0) {
            user.lastBankTax = now; 
        }

                // ==========================================
        // FIXED AUTO COLLECT BUMN (AKUMULASI CUAN)
        // ==========================================
        function prosesAutoBUMN(perusahaan) {
            if (!perusahaan) return;
            let karyawan = perusahaan.karyawan || 0;
            if (karyawan <= 0) return;
            if (perusahaan.pelanggan >= 5000000) {
                // Jika pelanggan sudah maksimal (5jt), kas tetap bertambah dari pelanggan yang ada
                let interval = 15 * 60 * 1000;
                if (!perusahaan.lastAuto || perusahaan.lastAuto === 0) { perusahaan.lastAuto = now; return; }
                let siklusLewat = Math.floor((now - perusahaan.lastAuto) / interval);
                if (siklusLewat <= 0) return;

                let harga = perusahaan.hargaPerWatt || perusahaan.hargaPerLiter || 0;
                let cuanPerSiklus = perusahaan.pelanggan * harga;
                
                perusahaan.saldo += cuanPerSiklus * siklusLewat; // Uang nambah terus!
                perusahaan.lastAuto = perusahaan.lastAuto + siklusLewat * interval;
                return;
            }

            let interval = 15 * 60 * 1000; 
            if (!perusahaan.lastAuto || perusahaan.lastAuto === 0) {
                perusahaan.lastAuto = now;
                return;
            }
            let lastAuto = perusahaan.lastAuto;
            let siklusLewat = Math.floor((now - lastAuto) / interval);
            if (siklusLewat <= 0) return;

            let totalPelangganBaru = 0;
            let totalCuanAkumulasi = 0;
            let harga = perusahaan.hargaPerWatt || perusahaan.hargaPerLiter || 0;
            let pelangganBerjalan = perusahaan.pelanggan || 0;

            for (let s = 0; s < siklusLewat; s++) {
                if (pelangganBerjalan >= 5000000) {
                    // Jika di tengah siklus pelanggan penuh, hitung cuan maksimal
                    totalCuanAkumulasi += 5000000 * harga;
                    continue;
                }
                
                let dapat;
                if (karyawan >= 500000) dapat = Math.floor(Math.random() * 50000) + 50000;  
                else if (karyawan >= 100000) dapat = Math.floor(Math.random() * 10000) + 10000;  
                else if (karyawan >= 10000) dapat = Math.floor(Math.random() * 1000) + 1000;    
                else if (karyawan >= 6000) dapat = Math.floor(Math.random() * 101) + 500;
                else if (karyawan >= 5000) dapat = Math.floor(Math.random() * 51) + 50;
                else if (karyawan >= 5) dapat = Math.floor(Math.random() * 4) + 6;
                else dapat = Math.floor(Math.random() * 4) + 2;
                
                pelangganBerjalan = Math.min(5000000, pelangganBerjalan + dapat);
                totalPelangganBaru += dapat;
                
                // FIXED: Setiap siklus 15 menit, uang pelanggan langsung ditambahkan ke total akumulasi
                totalCuanAkumulasi += pelangganBerjalan * harga;
            }

            perusahaan.pelanggan = Math.min(5000000, (perusahaan.pelanggan || 0) + totalPelangganBaru);
            perusahaan.saldo += totalCuanAkumulasi; // SEKARANG UANG AKAN BERTAUT / NAMBAH TERUS!
            perusahaan.lastAuto = lastAuto + siklusLewat * interval;
        }

        if (negara.pln) prosesAutoBUMN(negara.pln);
        if (negara.pdam) prosesAutoBUMN(negara.pdam);

        // AUTO-CHECK PRESIDEN TERMINATED
        if (negara.presiden && negara.waktuLantik && (now - negara.waktuLantik >= 7 * 24 * 60 * 60 * 1000)) {
            let mantan = negara.presiden;
            negara.presiden = null; negara.waktuLantik = 0;
            conn.reply(m.chat, `🚨 *MAKLUMAT KONSTITUSI* 🚨\n\nMasa bakti @${mantan.split('@')[0]} sebagai Presiden resmi berakhir harian ini.\nSilakan buka pendaftaran pemilu baru: *${usedPrefix}negara pemilu*`, m, { mentions: [mantan] });
        }

        // AUTO-CHECK PEMILU EXPIRATION
        if (negara.isPemilu && negara.waktuMulaiPemilu && (now - negara.waktuMulaiPemilu >= 60 * 60 * 1000)) {
            negara.isPemilu = false;
            let kandidatList = Object.keys(negara.kandidat);
            if (kandidatList.length > 0) {
                let pemenang = kandidatList[0], maxSuara = negara.kandidat[pemenang];
                for (let k of kandidatList) { if (negara.kandidat[k] > maxSuara) { pemenang = k; maxSuara = negara.kandidat[k]; } }
                negara.presiden = pemenang; negara.waktuLantik = now; negara.kandidat = {}; negara.voters = [];
                conn.reply(m.chat, `👑 *PEMILU BERAKHIR (OTOMATIS)* 👑\n\nSelamat! Berdasarkan hasil voting terbanyak (${maxSuara} suara), @${pemenang.split('@')[0]} resmi naik takhta sebagai *PRESIDEN BARU*!`, m, { mentions: [pemenang] });
            } else {
                negara.kandidat = {}; negara.voters = [];
                conn.reply(m.chat, `🗳️ *PEMILU KADALUARSA*\nTidak ada warga yang mendaftar menjadi kandidat. Kursi pemerintahan tetap kosong.`, m);
            }
        }

        let isPresiden = (negara.presiden === sender);

        // ==========================================
        // 1. SISTEM PERBANKAN & TRANSFER
        // ==========================================
        if (/^(bank|tf|transfer|atm|atmall|pull|pullall)$/i.test(cmd)) {
            let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;

            if (cmd === 'bank') {
                let u = users[target || sender];
                let statusBank = negara.bank ? '🟢 OPERASIONAL' : '🔴 LOCK (Belum Dibangun)';
                let capt = `╭━━━ • 🏦 *BANK CENTRAL PROFILE* 🏦 • ━━━╮\n`
                    + `┃\n`
                    + `┃ 👤 *Nasabah:* ${u.name || 'Warga Sipil'}\n`
                    + `┃ 💵 *Dompet:* ${formatRp(u.money)}\n`
                    + `┃ 🏧 *Saldo Bank:* ${formatRp(u.bank)}\n`
                    + `┃ 📉 *Tanggungan Utang:* ${formatRp(u.hutangNegara)}\n`
                    + `┃ 🏛️ *Status Layanan:* ${statusBank}\n`
                    + `┃\n`
                    + `┣━━━ • 📊 *INFORMASI TARIF* • ━━━┫\n`
                    + `┃\n`
                    + `┃ ◦ Pajak Setor: *0.5%*\n`
                    + `┃ ◦ Pajak Simpanan: *0.2% / Hari*\n`
                    + `┃\n`
                    + `┣━━━ • 🕹️ *AKSES QUICK-CMD* • ━━━┫\n`
                    + `┃\n`
                    + `┃ ◦ *${usedPrefix}atm <jumlah>* (Simpan)\n`
                    + `┃ ◦ *${usedPrefix}pull <jumlah>* (Tarik)\n`
                    + `┃ ◦ *${usedPrefix}tf money <jml> <@tag>* (Transfer)\n`
                    + `┃\n`
                    + `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
                return m.reply(capt);
            }

            if (cmd === 'tf' || cmd === 'transfer') {
                if (args.length < 3) return m.reply(`⚠️ *PANDUAN TRANSFER*\nGunakan format: *${usedPrefix}tf <item> <jumlah> <@tag>*\nContoh: *${usedPrefix}tf money 50000 @tag*`);
                let type = args[0].toLowerCase();
                
                const validItems = ['money', 'limit', 'potion', 'iron', 'wood', 'gold', 'diamond', 'emerald'];
                if (!validItems.includes(type)) return m.reply(`❌ *DITOLAK:* Aset jenis *${type}* ilegal atau dilarang dipindahkan.`);

                let count = Math.min(1000000000000, Math.max(parseInt(args[1]) || 1, 1));
                let who = target || (args[2].replace(/[@ .+-]/g, '') + '@s.whatsapp.net');
                
                if (!users[who]) return m.reply('❌ Target tidak terdaftar di database server.');
                if (who === sender) return m.reply('❌ Sistem mendeteksi anomali: Tidak bisa mentransfer ke diri sendiri.');
                if (!users[sender][type] || users[sender][type] < count) return m.reply(`❌ Saldo atau jumlah *${type}* Anda tidak mencukupi.`);
                
                users[sender][type] -= count;
                users[who][type] += count;
                
                let txtTf = `╭━━━ • 💸 *STRUK TRANSFER DIGITAL* • ━━━╮\n`
                    + `┃\n`
                    + `┃ ✅ *STATUS:* BERHASIL\n`
                    + `┃ 📤 *Pengirim:* @${sender.split('@')[0]}\n`
                    + `┃ 📥 *Penerima:* @${who.split('@')[0]}\n`
                    + `┃ 📦 *Nominal:* ${count.toLocaleString('id-ID')} ${type}\n`
                    + `┃\n`
                    + `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
                return conn.reply(m.chat, txtTf, m, { mentions: [sender, who] });
            }

            if (cmd.startsWith('atm') || cmd.startsWith('pull')) {
                if (!negara.bank) return m.reply(`🚫 *AKSES DITOLAK*\n\nSistem Keuangan lumpuh karena *Bank Central belum didirikan oleh Presiden*. Harap tunggu pemerintah mengeksekusi perintah *${usedPrefix}negara bangunbank*`);
                
                let isPull = cmd.startsWith('pull');
                let count = args[0] ? (args[0].toLowerCase() === 'all' ? Math.floor(isPull ? user.bank : user.money) : parseInt(args[0])) : 1;
                count = Math.max(1, count);

                if (isPull) {
                    if (user.bank < count) return m.reply(`❌ Saldo ATM tidak memadai! Total simpanan: ${formatRp(user.bank)}`);
                    user.bank -= count;
                    user.money += count;
                    m.reply(`💳 *PULL FINISHED*\n\n💵 *Ditarik:* ${formatRp(count)}\n💼 *Dompet Tunai:* ${formatRp(user.money)}`);
                } else {
                    if (user.money < count) return m.reply(`❌ Uang di dompet tidak cukup! Tunai Anda: ${formatRp(user.money)}`);
                    if (count < 1000) return m.reply('⚠️ Batas minimum transaksi setoran adalah Rp 1.000');
                    
                    let pajak = Math.floor(count * 0.005);
                    let bersihMasuk = count - pajak;

                    user.money -= count;
                    user.bank += bersihMasuk;
                    negara.kas += pajak; 

                    let txt = `╭━━━ • 🏧 *NOTA DEPOSIT BANK* • ━━━╮\n`
                        + `┃\n`
                        + `┃ 📥 *Setoran:* ${formatRp(count)}\n`
                        + `┃ 📉 *Pajak Admin (0.5%):* -${formatRp(pajak)}\n`
                        + `┃ 💰 *Kas Negara:* +${formatRp(pajak)}\n`
                        + `┃ 💳 *Netto Masuk ATM:* ${formatRp(bersihMasuk)}\n`
                        + `┃ 🏦 *Total Saldo Saat Ini:* ${formatRp(user.bank)}\n`
                        + `┃\n`
                        + `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
                    m.reply(txt);
                }
            }
            return;
        }

        // ==========================================
        // 2. SISTEM KORUPSI 
        // ==========================================
        if (cmd === 'korupsi') {
            if (now - user.lastKorupsi < 12 * 60 * 60 * 1000) {
                let sisa = (12 * 60 * 60 * 1000) - (now - user.lastKorupsi);
                return m.reply(`🚓 *DRAFT RADAR KPK:* Pergerakan Anda sedang diintai Agen Intelijen! Menepilah selama *${msToTime(sisa)}*`);
            }

            user.lastKorupsi = now;
            let peluangSukses = Math.random() * 100;

            if (isPresiden) {
                if (negara.kas < 500000000) return m.reply('❌ Anggaran Kas Negara terlalu kritis untuk dikorupsi.');
                let hasilKorupsi = Math.floor(Math.random() * (negara.kas * 0.1)) + 50000000; 
                
                if (peluangSukses > 40) { 
                    negara.kas -= hasilKorupsi;
                    user.money += hasilKorupsi;
                    m.reply(`🕵️‍♂️ *OPERASI GELAP BERHASIL!*\n\nSebagai Presiden Anda memalsukan nota APBN dan sukses mencuci uang sebesar *${formatRp(hasilKorupsi)}* langsung ke rekening pribadi!`);
                } else { 
                    let denda = Math.floor((user.money + user.bank) * 0.5); 
                    if (user.money >= denda) user.money -= denda;
                    else { let sisa = denda - user.money; user.money = 0; user.bank -= sisa; }
                    
                    negara.kas += denda;
                    negara.presiden = null; negara.waktuLantik = 0;
                    
                    let txt = `🚨 *BREAKING NEWS: IMPEACHMENT!* 🚨\n\nPresiden @${sender.split('@')[0]} tertangkap tangan oleh Satgas KPK dalam mega skandal pencucian anggaran!\n\n`
                        + `💥 *EKSEKUSI HUKUM:* \n`
                        + `◦ Diturunkan secara paksa dari takhta kepresidenan.\n`
                        + `◦ Denda sita aset 50% kekayaan sebesar *${formatRp(denda)}* disetorkan kembali ke Kas Negara.\n\n`
                        + `🏛️ Tampuk kekuasaan tertinggi kini *KOSONG*.`;
                    conn.reply(m.chat, txt, m, { mentions: [sender] });
                }
            } else {
                let sumberTarget = negara.danaBansos > 10000000 ? 'Bansos' : 'Kas';
                let maksimal = sumberTarget === 'Bansos' ? negara.danaBansos * 0.2 : 50000000;
                let hasilKorupsi = Math.floor(Math.random() * maksimal) + 1000000;

                if (peluangSukses > 60) { 
                    if (sumberTarget === 'Bansos') negara.danaBansos -= hasilKorupsi;
                    else negara.kas -= hasilKorupsi;
                    user.money += hasilKorupsi;
                    m.reply(`🥷 *MARK-UP SUKSES!*\n\nAnda berhasil memanipulasi dana birokrasi ${sumberTarget} tingkat daerah dan mengantongi keuntungan haram sebesar *${formatRp(hasilKorupsi)}*!`);
                } else { 
                    let denda = Math.floor(hasilKorupsi * 2); 
                    let totalKekayaan = user.money + user.bank;
                    
                    if (totalKekayaan < denda) {
                        let sisaDenda = denda - totalKekayaan;
                        user.money = 0; user.bank = 0;
                        user.hutangNegara += sisaDenda; 
                        negara.kas += totalKekayaan;
                        m.reply(`🚨 *OPERASI TANGKAP TANGAN!*\n\nAnda terciduk mencuri dana publik. Seluruh uang di dompet dan tabungan ATM disita sampai Rp 0, sisa denda dikonversi menjadi *Hutang Negara:* ${formatRp(user.hutangNegara)}`);
                    } else {
                        if (user.money >= denda) user.money -= denda;
                        else { let sisa = denda - user.money; user.money = 0; user.bank -= sisa; }
                        negara.kas += denda;
                        m.reply(`🚨 *TUNTUTAN HAKIM:* Anda kalah di Pengadilan Tipikor atas pencurian dana ${sumberTarget}. Anda dipaksa membayar denda ganti rugi sebesar *${formatRp(denda)}* ke Kas Negara.`);
                    }
                }
            }
            return;
        }

        // ==========================================
        // 3. PEMERINTAHAN NEGARA & BUMN LENGKAP
        // ==========================================
        if (/^(negara|gov|pemerintah)$/i.test(cmd)) {
            let action = args[0] ? args[0].toLowerCase() : 'info';

            switch (action) {
                // ==============================
                // COMMAND BARU: PREMIUN HELP MENU
                // ==============================
                case 'help': {
                    let txtHelp = `╭━━━• 🏛️ *GOVERNMENT HELP INTERFACE* 🏛️ •━━━╮\n`
                        + `┃\n`
                        + `┃ Berikut panduan regulasi kode administrasi negara\n`
                        + `┃ Gunakan prefix: *${usedPrefix}negara <sub-command>*\n`
                        + `┃\n`
                        + `┣━━━ • 👤 *REGULASI WARGA SIPIL* • ━━━┫\n`
                        + `┃\n`
                        + `┃ ◦ *info* ➔ Info status & kondisi finansial negara\n`
                        + `┃ ◦ *infobumn* ➔ Pantau kinerja & aset kas BUMN\n`
                        + `┃ ◦ *bansos* ➔ Klaim jaminan bantuan sosial harian\n`
                        + `┃ ◦ *setorbansos <jml>* ➔ Donasi mengisi kas bansos\n`
                        + `┃ ◦ *daftarcalon* ➔ Registrasi capres (Biaya: 10M)\n`
                        + `┃ ◦ *vote @tag* ➔ Coblos hak suara kandidat di TPS\n`
                        + `┃ ◦ *pinjam <jml>* ➔ Ajukan utang kredit ke Kas Negara\n`
                        + `┃ ◦ *bayarbank <jml>* ➔ Setor angsuran pelunasan utang\n`
                        + `┃\n`
                        + `┣━━━ • 💼 *BURSA MODAL & KORPORASI* • ━━━┫\n`
                        + `┃\n`
                        + `┃ ◦ *investasi <pln/pdam> <nom>* ➔ Suntik dana saham\n`
                        + `┃ ◦ *investasiku* ➔ Cek portofolio & estimasi dividen\n`
                        + `┃ ◦ *leaderboard* ➔ Papan peringkat valuasi korporasi\n`
                        + `┃\n`
                        + `┣━━━ • 👑 *HAK EKSKLUSIF PRESIDEN* • ━━━┫\n`
                        + `┃\n`
                        + `┃ ◦ *pemilu* ➔ Aktivasi / tutup gerbang pendaftaran\n`
                        + `┃ ◦ *sahkan* ➔ Resmikan pelantikan pemenang capres\n`
                        + `┃ ◦ *bangunbank* ➔ Dirikan prasarana Bank Central (50M)\n`
                        + `┃ ◦ *bangunpln* / *bangunpdam* ➔ Konstruksi BUMN (865M)\n`
                        + `┃ ◦ *rekrut <pln/pdam> <jml>* ➔ Tambah tenaga kerja\n`
                        + `┃ ◦ *tagihpln* / *tagihpdam* ➔ Tarik dividen ke Kas Utama\n`
                        + `┃ ◦ *setinvestbank* / *setinvestpt* ➔ Switch regulasi gerbang\n`
                        + `┃ ◦ *razia* ➔ Sidak penertiban pajak & sita PT nunggak\n`
                        + `┃\n`
                        + `┣━━━ • ⚙️ *SISTEM KRIMINALITAS* • ━━━┫\n`
                        + `┃\n`
                        + `┃ ◦ *${usedPrefix}korupsi* ➔ Operasi gelap pencurian anggaran\n`
                        + `┃\n`
                        + `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
                    return m.reply(txtHelp);
                }

                case 'info': {
                    let namaPresiden = negara.presiden ? (global.db.data.users[negara.presiden]?.name || negara.presiden.split('@')[0]) : 'Kosong (Anarki)';
                    let statusJabatan = negara.presiden ? `\n┃ ⏳ *Sisa Jabatan:* ${msToTime((7 * 24 * 60 * 60 * 1000) - (now - negara.waktuLantik))}` : '';
                    let statusBank = negara.bank ? `🟢 Aktif | [Invest/Pinjam: ${negara.investBankOpen ? 'OPEN' : 'CLOSED'}]` : '🔴 Belum Dibangun';
                    let statusPemilu = negara.isPemilu ? '🟢 Berlangsung' : '🔴 Ditutup';
                    if (negara.isPemilu && negara.waktuMulaiPemilu) {
                        statusPemilu += ` (${msToTime((60 * 60 * 1000) - (now - negara.waktuMulaiPemilu))})`;
                    }

                    let statusPLN = negara.pln ? `🟢 Aktif | ${negara.pln.pelanggan.toLocaleString('id-ID')} User` : '🔴 Belum Dibangun';
                    let statusPDAM = negara.pdam ? `🟢 Aktif | ${negara.pdam.pelanggan.toLocaleString('id-ID')} User` : '🔴 Belum Dibangun';

                    let txt = `╭━━━• 🏛️ *MAJLIS ISTANA KENEGARAAN* 🏛️ •━━━╮\n`
                        + `┃\n`
                        + `┃ 👑 *Presiden RI:* @${namaPresiden.split('@')[0]}${statusJabatan}\n`
                        + `┃ 💰 *Kas Utama Negara:* ${formatRp(negara.kas)}\n`
                        + `┃ 🎁 *Kas Dana Bansos:* ${formatRp(negara.danaBansos)}\n`
                        + `┃ 🏦 *Bank Central:* ${statusBank}\n`
                        + `┃ ⚡ *Sektor BUMN PLN:* ${statusPLN}\n`
                        + `┃ 💧 *Sektor BUMN PDAM:* ${statusPDAM}\n`
                        + `┃ 🗳️ *Gerbang Pemilu:* ${statusPemilu}\n`
                        + `┃ 💼 *Holding Aset Sitaan:* ${negara.bumn.length} Perusahaan Swasta\n`
                        + `┃\n`
                        + `┣━━━ • 📢 *INFO SISTEM* • ━━━┫\n`
                        + `┃\n`
                        + `┃ Ketik *${usedPrefix+command} help* untuk panduan lengkap\n`
                        + `┃\n`
                        + `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
                    return conn.reply(m.chat, txt, m, { mentions: [negara.presiden].filter(Boolean) });
                }

                                // ==============================
                // INFO PERUSAHAAN NEGARA (BUMN)
                // ==============================
                case 'infobumn':
                case 'info-bumn': {
                    let txt = `╭━━━• 🏢 *FINANCIAL REPORT BUMN* 🏢 •━━━╮\n┃\n`;
                    
                    // 1. DATA PLN
                    if (negara.pln) {
                        let p = meta = negara.pln;
                        let pelangganPLN = p.pelanggan || 0;
                        let persenPLN = ((pelangganPLN / 5000000) * 100).toFixed(2);
                        // Rumus: Total pelanggan x Harga PLN (Rp 6.500)
                        let pendapatanPLN = pelangganPLN * 6500;
                        
                        txt += `┣ ⚡ *Perusahaan Listrik Negara (PLN)*\n`
                            + `┃   ◦ Saldo Kas PT: *${formatRp(p.saldo)}*\n`
                            + `┃   ◦ Tenaga Kerja: ${p.karyawan ? p.karyawan.toLocaleString('id-ID') : 0} / 1jt Orang\n`
                            + `┃   ◦ Total Pelanggan: ${pelangganPLN.toLocaleString('id-ID')} (${persenPLN}%)\n`
                            + `┃   ◦ Pendapatan: *${formatRp(pendapatanPLN)} / 15 Menit* _(Pelanggan × Rp 6.500)_\n`
                            + `┃   ◦ Total Kapital Investor: ${formatRp(p.totalInvestasi || 0)}\n┃\n`;
                    } else {
                        txt += `┣ ⚡ *PLN Negara:* 🔴 Belum Ada Infrastruktur\n┃\n`;
                    }

                    // 2. DATA PDAM
                    if (negara.pdam) {
                        let p = negara.pdam;
                        let pelangganPDAM = p.pelanggan || 0;
                        let persenPDAM = ((pelangganPDAM / 5000000) * 100).toFixed(2);
                        // Rumus: Total pelanggan x Harga PDAM (Rp 16.000)
                        let pendapatanPDAM = pelangganPDAM * 16000;
                        
                        txt += `┣ 💧 *Perusahaan Daerah Air Minum (PDAM)*\n`
                            + `┃   ◦ Saldo Kas PT: *${formatRp(p.saldo)}*\n`
                            + `┃   ◦ Tenaga Kerja: ${p.karyawan ? p.karyawan.toLocaleString('id-ID') : 0} / 1jt Orang\n`
                            + `┃   ◦ Total Pelanggan: ${pelangganPDAM.toLocaleString('id-ID')} (${persenPDAM}%)\n`
                            + `┃   ◦ Pendapatan: *${formatRp(pendapatanPDAM)} / 15 Menit* _(Pelanggan × Rp 16.000)_\n`
                            + `┃   ◦ Total Kapital Investor: ${formatRp(p.totalInvestasi || 0)}\n┃\n`;
                    } else {
                        txt += `┣ 💧 *PDAM Negara:* 🔴 Belum Beroperasi\n┃\n`;
                    }

                    // 3. DATA PT SITAAN
                    let totalSitaan = negara.bumn ? negara.bumn.reduce((sum, pt) => sum + (pt.saldo || 0), 0) : 0;
                    let jumlahSitaan = negara.bumn ? negara.bumn.length : 0;
                    
                    txt += `┣ 💼 *Holding Portofolio Sitaan Pajak*\n`
                        + `┃   ◦ Total Entitas Disita: ${jumlahSitaan} PT\n`
                        + `┃   ◦ Akumulasi Likuiditas Sitaan: *${formatRp(totalSitaan)}*\n`
                        + `┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

                    return m.reply(txt);
                }

                case 'setinvestbank': {
                    if (!isPresiden) return m.reply('❌ Hak eksklusif ini hanya dimiliki oleh Presiden aktif!');
                    negara.investBankOpen = !negara.investBankOpen;
                    m.reply(`🏦 *REGULASI PRESIDEN:* Fitur pengajuan pinjaman bank resmi *${negara.investBankOpen ? 'DIBUKA' : 'DITUTUP'}*!`);
                    break;
                }
                case 'setinvestpt': {
                    if (!isPresiden) return m.reply('❌ Hak eksklusif ini hanya dimiliki oleh Presiden aktif!');
                    negara.investPTOpen = !negara.investPTOpen;
                    m.reply(`🏢 *REGULASI PRESIDEN:* Kran penanaman modal investor ke BUMN resmi *${negara.investPTOpen ? 'DIBUKA' : 'DITUTUP'}*!`);
                    break;
                }

                case 'bansos': {
                    if (now - user.lastBansos < 24 * 60 * 60 * 1000) return m.reply(`⏳ Subsidi jaminan sosial Anda sudah diklaim untuk hari ini.`);
                    if (negara.danaBansos <= 0) return m.reply('❌ Anggaran Dana Bansos Negara kosong.');

                    let isMiskin = user.money < 500000000;
                    let nominalDapat = isMiskin ? Math.floor(Math.random() * 35000000) + 25000000 : Math.floor(Math.random() * 5000000) + 2000000;
                    if (nominalDapat > negara.danaBansos) nominalDapat = negara.danaBansos;

                    negara.danaBansos -= nominalDapat; user.money += nominalDapat; user.lastBansos = now;
                    m.reply(`🎁 *SUBSIDI DIKIRIM* 🎁\n\nAnda menerima dana bantuan *${formatRp(nominalDapat)}* karena berstatus *${isMiskin ? 'Golongan Prasejahtera' : 'Golongan Mampu'}*.`);
                    break;
                }
                case 'setorbansos': {
                    let nominal = parseInt(args[1]);
                    if (isNaN(nominal) || nominal < 1000000) return m.reply('⚠️ Minimum sumbangan adalah Rp 1.000.000');
                    if (user.money < nominal) return m.reply(`❌ Uang Anda tidak mencukupi untuk mendonasikan sejumlah itu.`);

                    user.money -= nominal; negara.danaBansos += nominal;
                    m.reply(`✅ *DONASI DISAHKAN*\n\nAnda menyuntik dana bantuan sosial sebesar *${formatRp(nominal)}*. Terima kasih atas partisipasi Anda!`);
                    break;
                }

                case 'pemilu': {
                    if (!m.isGroup) return m.reply('❌ Protokol Pemilu hanya dapat dijalankan di dalam area grup!');
                    if (!isPresiden && !m.isGroup) return m.reply('❌ Otoritas ditolak. Hanya untuk kepala negara atau jajaran administrasi.');
                    if (negara.isPemilu) {
                        negara.isPemilu = false;
                        m.reply(`🗳️ *TPS DITUTUP!* Gunakan perintah *${usedPrefix+command} sahkan* untuk pelantikan.`);
                    } else {
                        negara.isPemilu = true; negara.waktuMulaiPemilu = now; negara.kandidat = {}; negara.voters = [];
                        m.reply(`🗳️ *TPS DIBUKA (Masa Aktif 1 Jam)*\nDaftarkan diri Anda lewat perintah *${usedPrefix+command} daftarcalon*`);
                    }
                    break;
                }
                case 'daftarcalon': {
                    if (!negara.isPemilu) return m.reply('❌ Gerbang pendaftaran pemilu belum dibuka oleh pemerintah.');
                    if (negara.kandidat[sender] !== undefined) return m.reply('❌ Anda sudah tercatat sebagai kontestan capres.');
                    if (user.money < 10000000000) return m.reply('❌ Biaya jaminan pendaftaran capres sebesar Rp 10 Miliar.');
                    
                    user.money -= 10000000000; negara.kas += 10000000000; negara.kandidat[sender] = 0;
                    m.reply(`✅ *VERIFIKASI KPUD SUKSES*\n\nKandidat @${sender.split('@')[0]} resmi masuk ke dalam kertas suara pemilihan umum.`, null, { mentions: [sender] });
                    break;
                }
                case 'vote': {
                    if (!negara.isPemilu) return m.reply('❌ Bilik suara belum dibuka.');
                    let targetMention = args[1];
                    if (!targetMention) return m.reply(`⚠️ Gunakan format: *${usedPrefix+command} vote @tag_calon*`);
                    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                    
                    if (negara.kandidat[target] === undefined) return m.reply('❌ Target tidak terdaftar dalam bursa capres.');
                    if (negara.voters.includes(sender)) return m.reply('❌ Hak suara Anda hangus karena sudah menyoblos sebelumnya.');
                    
                    negara.voters.push(sender); negara.kandidat[target] += 1;
                    m.reply(`🗳️ Surat suara Anda sah masuk untuk @${target.split('@')[0]}!`, null, { mentions: [target] });
                    break;
                }
                case 'sahkan': {
                    if (negara.isPemilu) return m.reply('❌ Tidak bisa mensahkan jabatan sewaktu pemilu masih berjalan.');
                    let kandidatList = Object.keys(negara.kandidat);
                    if (kandidatList.length === 0) return m.reply('❌ Dokumen kosong. Tidak ada capres yang mendaftar.');
                    
                    let pemenang = kandidatList[0], maxSuara = negara.kandidat[pemenang];
                    for (let k of kandidatList) { if (negara.kandidat[k] > maxSuara) { pemenang = k; maxSuara = negara.kandidat[k]; } }
                    
                    negara.presiden = pemenang; negara.waktuLantik = now; negara.kandidat = {}; negara.voters = [];
                    m.reply(`🎉 👑 *MAKLUMAT NEGARA:* @${pemenang.split('@')[0]} resmi disumpah dan dilantik menjadi PRESIDEN RI yang baru!`, null, { mentions: [pemenang] });
                    break;
                }

                case 'bangunbank': {
                    if (!isPresiden) return m.reply('❌ Hak pembangunan prasarana vital hanya dipegang oleh Presiden!');
                    if (negara.bank) return m.reply('❌ Bank Central sudah berdiri kokoh.');
                    if (negara.kas < 50000000000) return m.reply(`❌ Alokasi kas negara kurang untuk biaya konstruksi (Butuh Rp 50M).`);
                    
                    negara.kas -= 50000000000; negara.bank = true;
                    m.reply(`🎉 🏦 *PROYEK RAMPUNG:* Bank Central Negara resmi didirikan dan siap melayani transaksi warga.`);
                    break;
                }
                case 'pinjam': {
                    if (!negara.bank) return m.reply('❌ Bank Central belum terdaftar di kementerian infrastruktur.');
                    if (!negara.investBankOpen) return m.reply('❌ Regulasi pinjaman sedang dibekukan sementara oleh Presiden.');
                    let nominal = parseInt(args[1]);
                    if (isNaN(nominal) || nominal < 1000000) return m.reply(`⚠️ Batas pengajuan pinjaman minimal Rp 1.000.000`);
                    if (negara.kas < nominal) return m.reply(`❌ Likuiditas Kas Negara sedang defisit/tidak mencukupi.`);
                    if (user.hutangNegara > 5000000000) return m.reply(`❌ Pengajuan ditolak! Tunggakan kredit Anda melebihi ambang batas aman.`);
                    
                    let totalHutangBaru = nominal + Math.floor(nominal * 0.1); 
                    negara.kas -= nominal; user.money += nominal; user.hutangNegara += totalHutangBaru;
                    m.reply(`🏦 *KREDIT DISETUJUI:* Dana dicairkan ke dompet. Total tanggungan wajib dibayar (Bunga 10%): *${formatRp(user.hutangNegara)}*`);
                    break;
                }
                case 'bayarbank': {
                    if (user.hutangNegara <= 0) return m.reply('✅ Anda tidak memiliki riwayat tunggakan di Bank Central.');
                    let nominal = parseInt(args[1]);
                    if (isNaN(nominal)) return m.reply(`⚠️ Gunakan format: *${usedPrefix+command} bayarbank <nominal>*`);
                    if (nominal > user.hutangNegara) nominal = user.hutangNegara;
                    if (user.money < nominal) return m.reply(`❌ Jumlah uang tunai Anda tidak memadai.`);
                    
                    user.money -= nominal; user.hutangNegara -= nominal; negara.kas += nominal;
                    m.reply(`✅ *SETORAN ANGSURAN BERHASIL:* Sisa utang Anda: *${formatRp(user.hutangNegara)}*`);
                    break;
                }

                case 'razia': {
                    if (!isPresiden) return m.reply('❌ Operasi razia gabungan hanya bisa diperintahkan oleh Presiden!');
                    let totalPajakDitarik = 0, ptTerkunci = 0, ptDisita = 0;
                    let nowTs = Date.now(), allUsers = global.db.data.users;
                    
                    for (let uid in allUsers) {
                        let u = allUsers[uid]; if (!Array.isArray(u.perusahaan)) continue;
                        for (let i = u.perusahaan.length - 1; i >= 0; i--) {
                            let pt = u.perusahaan[i]; if (!pt) continue;
                            if (!pt.lastTaxCheck) pt.lastTaxCheck = nowTs;
                            
                            let daysPassed = Math.floor((nowTs - pt.lastTaxCheck) / 86400000); 
                            if (daysPassed >= 1) {
                                let tagihanPajak = Math.floor(hitungAset(pt) * 0.002 * daysPassed);
                                if ((pt.saldo || 0) >= tagihanPajak) {
                                    pt.saldo -= tagihanPajak; totalPajakDitarik += tagihanPajak;
                                    pt.lastTaxCheck = nowTs; pt.hariNunggak = 0; pt.isLocked = false;
                                } else {
                                    pt.hariNunggak = (pt.hariNunggak || 0) + daysPassed; pt.lastTaxCheck = nowTs;
                                    if (pt.hariNunggak >= 4) {
                                        pt.name = `[BUMN SITAAN] ${pt.name}`; pt.isLocked = true; pt.ownerLama = uid;
                                        negara.bumn.push(pt); u.perusahaan.splice(i, 1); ptDisita++;
                                    } else if (pt.hariNunggak >= 3) { pt.isLocked = true; ptTerkunci++; }
                                }
                            }
                        }
                    }
                    negara.kas += totalPajakDitarik;
                    m.reply(`🚨 *OPERASI PENERTIBAN PAJAK SELESAI*\n\n💸 *Total Pendapatan Pajak:* +${formatRp(totalPajakDitarik)}\n🔒 *PT Dibekukan:* ${ptTerkunci}\n🏢 *PT Disita Jadi BUMN:* ${ptDisita}`);
                    break;
                }

                case 'bangunpln': {
                    if (!isPresiden) return m.reply('❌ Khusus Presiden!');
                    if (negara.pln) return m.reply('❌ Komoditas infrastruktur PLN sudah aktif.');
                    if (negara.kas < 865000000000) return m.reply(`❌ Anggaran Kas Negara tidak mencukupi (Butuh Rp 865M).`);
                    negara.kas -= 865000000000;
                    negara.pln = { pelanggan: 0, saldo: 0, hargaPerWatt: 6500, karyawan: 0, lastAuto: now, investasi: {}, totalInvestasi: 0 };
                    m.reply(`⚡ *PROYEK STRATEGIS NASIONAL:* Sektor energi PLN resmi diaktifkan.`);
                    break;
                }
                case 'bangunpdam': {
                    if (!isPresiden) return m.reply('❌ Khusus Presiden!');
                    if (negara.pdam) return m.reply('❌ Infrastruktur suplai air PDAM sudah ada.');
                    if (negara.kas < 865000000000) return m.reply(`❌ Anggaran Kas Negara tidak mencukupi (Butuh Rp 865M).`);
                    negara.kas -= 865000000000;
                    negara.pdam = { pelanggan: 0, saldo: 0, hargaPerLiter: 16000, karyawan: 0, lastAuto: now, investasi: {}, totalInvestasi: 0 };
                    m.reply(`💧 *PROYEK STRATEGIS NASIONAL:* Infrastruktur air bersih PDAM resmi beroperasi.`);
                    break;
                }
                case 'rekrut': {
                    if (!isPresiden) return m.reply('❌ Hanya Kepala Negara yang berhak menambah kuota aparatur BUMN.');
                    let jenis = args[1] ? args[1].toLowerCase() : '';
                    let jumlah = parseInt(args[2]) || 1;
                    if (jenis !== 'pln' && jenis !== 'pdam') return m.reply(`⚠️ Format salah: *${usedPrefix+command} rekrut <pln/pdam> <jumlah>*`);

                    let perusahaan = negara[jenis];
                    if (!perusahaan) return m.reply(`❌ Entitas BUMN ${jenis.toUpperCase()} belum terwujud di negara ini.`);
                    if (jumlah < 1) return m.reply('⚠️ Angka perekrutan tidak valid.');
                    if ((perusahaan.karyawan || 0) + jumlah > 1000000) return m.reply(`⚠️ Rekrutmen gagal: Kuota karyawan maksimal industri BUMN adalah 1.000.000 buruh.`);

                    let totalBiaya = 5000000000 * jumlah;
                    if (negara.kas < totalBiaya) return m.reply(`❌ Saldo anggaran negara tidak cukup untuk membiayai kontrak kerja.`);

                    negara.kas -= totalBiaya; perusahaan.karyawan = (perusahaan.karyawan || 0) + jumlah;
                    m.reply(`👷 *KONTRAK KERJA DISAHKAN:* Berhasil merekrut +${jumlah.toLocaleString('id-ID')} karyawan baru ke ${jenis.toUpperCase()}.`);
                    break;
                }

                case 'investasi': {
                    if (!negara.investPTOpen) return m.reply('❌ Bursa investasi BUMN sedang di-suspend oleh otoritas keuangan negara.');
                    let jenis = args[1] ? args[1].toLowerCase() : '';
                    let nominal = parseInt(args[2]);
                    if (jenis !== 'pln' && jenis !== 'pdam') return m.reply(`⚠️ Format salah: *${usedPrefix+command} investasi <pln/pdam> <nominal>*`);
                    if (isNaN(nominal) || nominal < 1000000000) return m.reply('⚠️ Batas investasi bursa minimal Rp 1 Miliar.');

                    let perusahaan = $.perusahaan = negara[jenis];
                    if (!perusahaan) return m.reply(`❌ Perusahaan target belum dibangun.`);
                    if (user.money < nominal) return m.reply(`❌ Modal pribadi Anda di dompet kurang.`);

                    user.money -= nominal;
                    if (!perusahaan.investasi) perusahaan.investasi = {};
                    perusahaan.investasi[sender] = (perusahaan.investasi[sender] || 0) + nominal;
                    perusahaan.totalInvestasi = (perusahaan.totalInvestasi || 0) + nominal;
                    perusahaan.saldo += nominal;

                    m.reply(`📊 *SUNTIK MODAL SUKSES:* Anda resmi memegang aset obligasi ${jenis.toUpperCase()} sebesar *${formatRp(nominal)}*.`);
                    break;
                }
                case 'investasiku': {
                    let hasInvestasi = false;
                    let txt = `╭━━━• 📈 *PORTOFOLIO EMISI SAHAM* 📈 •━━━╮\n┃\n`;
                    for (let jenis of ['pln', 'pdam']) {
                        let p = negara[jenis];
                        if (!p || !p.investasi || !p.investasi[sender]) continue;
                        hasInvestasi = true;
                        let nominal = p.investasi[sender], totalInv = p.totalInvestasi || 1;
                        let porsi = ((nominal / totalInv) * 100).toFixed(2);
                        let estimasiBagiHasil = Math.floor(p.saldo * 0.05 * (nominal / totalInv));
                        txt += `┣ 🏢 *${jenis.toUpperCase()} Holdings*\n┃   ◦ Nilai Saham: ${formatRp(nominal)}\n┃   ◦ Kepemilikan: *${porsi}% Share*\n┃   ◦ Est. Dividen Berjalan: ~${formatRp(estimasiBagiHasil)}\n┃\n`;
                    }
                    if (!hasInvestasi) return m.reply('📊 Rekening bursa Anda kosong. Anda belum menanam saham di BUMN manapun.');
                    txt += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
                    m.reply(txt);
                    break;
                }
                case 'tagihpln': {
                    if (!isPresiden) return m.reply('❌ Khusus Presiden!');
                    if (!negara.pln) return m.reply('❌ PLN belum dibangun!');
                    if (negara.pln.saldo <= 0) return m.reply('⚠️ Kas internal PLN kosong.');
                    
                    let saldoTotal = negara.pln.saldo, totalInv = negara.pln.totalInvestasi || 0;
                    let poolBagiHasil = totalInv > 0 ? Math.floor(saldoTotal * 0.05) : 0; 
                    let masukKas = saldoTotal - poolBagiHasil;
                    
                    if (poolBagiHasil > 0 && negara.pln.investasi) {
                        for (let jid in negara.pln.investasi) {
                            let porsi = negara.pln.investasi[jid] / totalInv, hasilnya = Math.floor(poolBagiHasil * porsi);
                            if (hasilnya > 0 && users[jid]) { users[jid].money = (users[jid].money || 0) + hasilnya; }
                        }
                    }
                    negara.kas += masukKas; negara.pln.saldo = 0;
                    m.reply(`⚡ *CAIR:* Hasil usaha PLN masuk ke Kas Negara sebesar *${formatRp(masukKas)}*.\n🎁 Dividen Investor dibagikan: ${formatRp(poolBagiHasil)}`);
                    break;
                }
                case 'tagihpdam': {
                    if (!isPresiden) return m.reply('❌ Khusus Presiden!');
                    if (!negara.pdam) return m.reply('❌ PDAM belum dibangun!');
                    if (negara.pdam.saldo <= 0) return m.reply('⚠️ Kas internal PDAM kosong.');
                    
                    let saldoTotal = negara.pdam.saldo, totalInv = negara.pdam.totalInvestasi || 0;
                    let poolBagiHasil = totalInv > 0 ? Math.floor(saldoTotal * 0.05) : 0;
                    let masukKas = saldoTotal - poolBagiHasil;
                    
                    if (poolBagiHasil > 0 && negara.pdam.investasi) {
                        for (let jid in negara.pdam.investasi) {
                            let porsi = negara.pdam.investasi[jid] / totalInv, hasilnya = Math.floor(poolBagiHasil * porsi);
                            if (hasilnya > 0 && users[jid]) { users[jid].money = (users[jid].money || 0) + hasilnya; }
                        }
                    }
                    negara.kas += masukKas; negara.pdam.saldo = 0;
                    m.reply(`💧 *CAIR:* Dividen usaha PDAM masuk ke Kas Negara sebesar *${formatRp(masukKas)}*.\n🎁 Dividen Investor dibagikan: ${formatRp(poolBagiHasil)}`);
                    break;
                }

                case 'lb':
                case 'leaderboard': {
                    let entries = [];
                    for (let uid in users) {
                        let u = users[uid]; if (!Array.isArray(u.perusahaan)) continue;
                        u.perusahaan.forEach(pt => { if (pt) entries.push({ nama: pt.name, pemilik: u.name || uid.split('@')[0], kategori: 'Private', valuasi: hitungAset(pt), saldo: pt.saldo || 0 }); });
                    }
                    if (negara.pln) entries.push({ nama: 'PLN (Persero)', pemilik: 'Negara', kategori: 'BUMN', valuasi: ((negara.pln.saldo || 0) + (negara.pln.pelanggan || 0) * 6500 + (negara.pln.karyawan || 0) * 5000000000), saldo: negara.pln.saldo || 0 });
                    if (negara.pdam) entries.push({ nama: 'PDAM (Persero)', pemilik: 'Negara', kategori: 'BUMN', valuasi: ((negara.pdam.saldo || 0) + (negara.pdam.pelanggan || 0) * 16000 + (negara.pdam.karyawan || 0) * 5000000000), saldo: negara.pdam.saldo || 0 });
                    
                    if (!entries.length) return m.reply('📊 Belum ada korporasi yang terdaftar di kementerian bursa.');
                    entries.sort((a, b) => b.valuasi - a.valuasi);
                    
                    let board = entries.slice(0, 10).map((e, i) => {
                        let badge = e.kategori === 'BUMN' ? '🏛️' : '💼';
                        return `${i+1}. *${e.nama}* [${e.kategori} ${badge}]\n   👤 Founder: ${e.pemilik}\n   💹 Valuasi: ~${formatSingkat(e.valuasi)} | Kas PT: ${formatRp(e.saldo)}`;
                    }).join('\n\n');
                    
                    m.reply(`╭━━━• 📊 *LEADERBOARD KORPORASI NASIONAL* •━━━╮\n\n${board}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`);
                    break;
                }

                default: m.reply(`❌ Sub-perintah salah. Ketik *${usedPrefix+command} help* untuk melihat daftar kode kendali.`);
            }
        }

    } catch (e) {
        console.error('ERROR SYSTEM EXECUTIVE:', e);
        m.reply(`❌ Gangguan Sistem Birokrasi: ${e.message}`);
    }
};

handler.help    = ['bank', 'atm', 'pull', 'tf', 'negara', 'korupsi'];
handler.tags    = ['rpg'];
handler.command = /^(negara|gov|pemerintah|bank|tf|transfer|atm|atmall|pull|pullall|korupsi)$/i;
handler.rpg     = true;
handler.group   = true;

module.exports = handler;
