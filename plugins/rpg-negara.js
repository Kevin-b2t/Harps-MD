const { generateWAMessageFromContent, prepareWAMessageMedia } = require('lily-baileys');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// ==========================================
// FITUR NEGARA, BANK, BUMN, GUDANG NEGARA & KORUPSI RPG
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
        if (!Array.isArray(user.perusahaan)) user.perusahaan = [];

        // Inisialisasi Database Negara
        if (!global.db.data.negara) global.db.data.negara = {};
        let negara = global.db.data.negara;
        
        if (!negara.bumn) negara.bumn = [];
        if (!negara.kandidat) negara.kandidat = {};
        if (negara.isPemilu === undefined) negara.isPemilu = false;
        if (!negara.waktuMulaiPemilu) negara.waktuMulaiPemilu = 0;
        if (!negara.kas) negara.kas = 100000000000;
        if (negara.bank === undefined) negara.bank = false;
        if (negara.investBankOpen === undefined) negara.investBankOpen = true;
        if (negara.investPTOpen === undefined) negara.investPTOpen = true;
        if (negara.danaBansos === undefined) negara.danaBansos = 0;
        if (!negara.voters) negara.voters = [];
        if (!negara.pln && negara.pln !== null) negara.pln = null;
        if (!negara.pdam && negara.pdam !== null) negara.pdam = null;
        if (!negara.gudangLevel) negara.gudangLevel = 1;
        if (!negara.gudang) negara.gudang = {};
        if (!negara.b2b) negara.b2b = {};
        if (!negara.b2bCounter) negara.b2bCounter = 1;
        
        let cmd = command.toLowerCase();

        // ==========================================
        // KONFIGURASI GAMBAR DOKUMEN VINZ MD
        // ==========================================
        let imgPath = path.join(process.cwd(), 'image', 'foto.jpg');
        let docBuffer, thumbBuffer;
        try {
            docBuffer = fs.readFileSync(imgPath);
            thumbBuffer = fs.readFileSync(imgPath);
        } catch (e) {
            let res = await fetch('https://telegra.ph/file/0b32e0a0bb025d5173167.jpg');
            docBuffer = await res.buffer();
            thumbBuffer = docBuffer;
        }

        // ==========================================
        // FUNGSI HELPER: KIRIM NATIVE FLOW V2 (ANTI-BUG WA)
        // ==========================================
        async function sendV2Message(teks, buttonArray) {
            let media = await prepareWAMessageMedia({
                document: docBuffer,
                mimetype: 'image/jpeg',
                fileName: 'Vinz MD',
                jpegThumbnail: thumbBuffer
            }, { upload: conn.waUploadToServer });

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                        interactiveMessage: {
                            body: { text: teks },
                            footer: { text: "🏛️ Sistem Pemerintahan RPG" },
                            header: {
                                hasMediaAttachment: true,
                                documentMessage: media.documentMessage
                            },
                            nativeFlowMessage: {
                                buttons: buttonArray
                            }
                        }
                    }
                }
            }, { quoted: m });
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        }

        // ==========================================
        // FUNGSI MENU UTAMA (LIST BUTTON V2)
        // ==========================================
        async function sendInfoMenu() {
            let txtMenu = `╭─〔 🏛️ 〕 *PEMERINTAHAN*\n│\n│ ⌁ Silakan tekan tombol *Pilih*\n│ ⌁ *Menu* di bawah untuk melihat\n│ ⌁ daftar informasi negara.\n╰──────────〔 🍃 〕`;

            // Judul-judul di bawah sengaja disingkat agar lolos dari limit 24 karakter WhatsApp
            let listButton = [{
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "📋 Pilih Menu",
                    sections: [{
                        title: "Menu Pemerintahan", 
                        highlight_label: "Lengkap",
                        rows: [
                            { title: "🏛️ Info Negara", description: "Status kas, presiden, & kabinet", id: `${usedPrefix}negara info` },
                            { title: "🏢 Info BUMN", description: "Kinerja operasional PLN & PDAM", id: `${usedPrefix}negara infobumn` },
                            { title: "📈 Investasiku", description: "Portofolio saham & estimasi dividen", id: `${usedPrefix}negara investasiku` },
                            { title: "📊 Leaderboard", description: "Papan peringkat valuasi korporasi", id: `${usedPrefix}negara leaderboard` },
                            { title: "🏦 Layanan Bank", description: "Informasi profil & tarif perbankan", id: `${usedPrefix}bank` },
                            { title: "🎁 Klaim Bansos", description: "Ambil bantuan subsidi tunai harian", id: `${usedPrefix}negara bansos` },
                            { title: "📋 Bantuan Lengkap", description: "Kumpulan semua perintah negara", id: `${usedPrefix}negara help` }
                        ]
                    }]
                })
            }];
            await sendV2Message(txtMenu, listButton);
        }

        // FUNGSI: PENGIRIM INFO BIASA DENGAN TOMBOL QUICK REPLY "KEMBALI KE MENU"
        async function sendInfoMsg(text) {
            let backButton = [{
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🔙 Kembali ke Menu",
                    id: `${usedPrefix}negara menu`
                })
            }];
            await sendV2Message(text, backButton);
        }

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
        // AUTO COLLECT BUMN
        // ==========================================
        function prosesAutoBUMN(perusahaan) {
            if (!perusahaan) return;
            let karyawan = perusahaan.karyawan || 0;
            if (karyawan <= 0) return;

            let interval = 15 * 60 * 1000; 
            if (!perusahaan.lastAuto || perusahaan.lastAuto === 0) { perusahaan.lastAuto = now; return; }
            let lastAuto = perusahaan.lastAuto;
            let siklusLewat = Math.floor((now - lastAuto) / interval);
            if (siklusLewat <= 0) return;

            let harga = perusahaan.hargaPerWatt || perusahaan.hargaPerLiter || 0;

            if (perusahaan.pelanggan >= 5000000) {
                let cuanPerSiklus = 5000000 * harga;
                perusahaan.saldo += cuanPerSiklus * siklusLewat; 
                perusahaan.lastAuto = lastAuto + siklusLewat * interval;
                return;
            }

            let totalPelangganBaru = 0;
            let totalCuanAkumulasi = 0;
            let pelangganBerjalan = perusahaan.pelanggan || 0;

            for (let s = 0; s < siklusLewat; s++) {
                if (pelangganBerjalan >= 5000000) {
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
                
                totalCuanAkumulasi += pelangganBerjalan * harga;
            }

            perusahaan.pelanggan = Math.min(5000000, (perusahaan.pelanggan || 0) + totalPelangganBaru);
            perusahaan.saldo += totalCuanAkumulasi; 
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
                let capt = `╭─〔 🏦 〕 *BANK CENTRAL PROFILE*
│
│ ⌁ 👤 *Nasabah:* ${u.name || 'Warga Sipil'}
│ ⌁ 💵 *Dompet:* ${formatRp(u.money)}
│ ⌁ 🏧 *Saldo Bank:* ${formatRp(u.bank)}
│ ⌁ 📉 *Tanggungan Utang:* ${formatRp(u.hutangNegara)}
│ ⌁ 🏛️ *Status Layanan:* ${statusBank}
╰──────────〔 🏦 〕

╭─〔 📊 〕 *INFORMASI TARIF*
│
│ ⌁ Pajak Setor: *0.5%*
│ ⌁ Pajak Simpanan: *0.2% / Hari*
╰──────────〔 🏦 〕

╭─〔 🕹️ 〕 *AKSES QUICK-CMD*
│
│ ⌁ *${usedPrefix}atm <jumlah>* (Simpan)
│ ⌁ *${usedPrefix}pull <jumlah>* (Tarik)
│ ⌁ *${usedPrefix}tf money <jml> <@tag>* (Transfer)
╰──────────〔 🏦 〕`;
                
                return await sendInfoMsg(capt);
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
                        + `┃ 🏦 *Total Saldo Saat Saat Ini:* ${formatRp(user.bank)}\n`
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
            let action = args[0] ? args[0].toLowerCase() : 'menu';

            switch (action) {
                case 'menu':
                case '':
                    return await sendInfoMenu();

                case 'help': {
                    let txtHelp = 
`╭─〔 🍃 〕 *List Help Negara*
│
│ ⌁ 👤 *REGULASI WARGA SIPIL*
│ ⌁ *info* ➔ Info status negara
│ ⌁ *infobumn* ➔ Kinerja & aset BUMN
│ ⌁ *bansos* ➔ Klaim bantuan sosial harian
│ ⌁ *daftarcalon* ➔ Registrasi capres (10M)
│ ⌁ *vote @tag* ➔ Coblos kandidat di TPS
│ ⌁ *pinjam <jml>* ➔ Ajukan utang ke Kas Negara
│ ⌁ *bayarbank <jml>* ➔ Setor pelunasan utang
│ ⌁ *b2b* ➔ Menu Rekber Negara
│
│ ⌁ 💼 *BURSA MODAL & KORPORASI*
│ ⌁ *investasi <pln/pdam> <nom>* ➔ Suntik saham
│ ⌁ *investasiku* ➔ Portofolio & estimasi dividen
│ ⌁ *leaderboard* ➔ Papan peringkat korporasi
│
│ ⌁ 👑 *HAK EKSKLUSIF PRESIDEN*
│ ⌁ *pemilu* ➔ Aktivasi / tutup pendaftaran
│ ⌁ *sahkan* ➔ Resmikan pelantikan pemenang
│ ⌁ *bangunbank* ➔ Dirikan Bank Central (50M)
│ ⌁ *upgradegudang <lv>* ➔ Ekspansi Gudang
│ ⌁ *suntikbansos <jml>* ➔ Tambah kas Bansos
│ ⌁ *bangunpln / bangunpdam* ➔ Konstruksi BUMN
│ ⌁ *rekrut <pln/pdam> <jml>* ➔ Tambah karyawan
│ ⌁ *tagihpln / tagihpdam* ➔ Tarik dividen ke Kas
│ ⌁ *setinvestbank / setinvestpt* ➔ Switch gerbang
│ ⌁ *razia* ➔ Sidak pajak & sita PT nunggak
│
│ ⌁ ⚙️ *SISTEM KRIMINALITAS*
│ ⌁ *${usedPrefix}korupsi* ➔ Operasi gelap pencurian
╰──────────〔 🍃 〕`;
                    return await sendInfoMsg(txtHelp);
                }

                case 'info': {
                    let namaPresiden = negara.presiden ? (global.db.data.users[negara.presiden]?.name || negara.presiden.split('@')[0]) : 'Kosong (Anarki)';
                    let statusJabatan = negara.presiden ? `\n│ ⌁ ⏳ *Sisa Jabatan:* ${msToTime((7 * 24 * 60 * 60 * 1000) - (now - negara.waktuLantik))}` : '';
                    let statusBank = negara.bank ? `🟢 Aktif | [Invest: ${negara.investBankOpen ? 'OPEN' : 'CLOSED'}]` : '🔴 Belum Dibangun';
                    let statusPemilu = negara.isPemilu ? '🟢 Berlangsung' : '🔴 Ditutup';
                    if (negara.isPemilu && negara.waktuMulaiPemilu) {
                        statusPemilu += ` (${msToTime((60 * 60 * 1000) - (now - negara.waktuMulaiPemilu))})`;
                    }
                    let statusPLN = negara.pln ? `🟢 Aktif | ${negara.pln.pelanggan.toLocaleString('id-ID')} User` : '🔴 Belum Dibangun';
                    let statusPDAM = negara.pdam ? `🟢 Aktif | ${negara.pdam.pelanggan.toLocaleString('id-ID')} User` : '🔴 Belum Dibangun';
                    let capNegara = (negara.gudangLevel || 1) * 180;
                    let usedNegara = Object.values(negara.gudang || {}).reduce((a, b) => a + b, 0);

                    let txt =
`╭─〔 🍃 〕 *Info Negara*
│
│ ⌁ 👑 *Presiden RI:* ${namaPresiden}${statusJabatan}
│ ⌁ 💰 *Kas Utama:* ${formatRp(negara.kas)}
│ ⌁ 🎁 *Kas Bansos:* ${formatRp(negara.danaBansos)}
│ ⌁ 🏦 *Bank Central:* ${statusBank}
│ ⌁ 📦 *Gudang Negara:* Lv ${negara.gudangLevel} (${usedNegara.toLocaleString('id-ID')} / ${capNegara.toLocaleString('id-ID')} Slot)
│ ⌁ ⚡ *BUMN PLN:* ${statusPLN}
│ ⌁ 💧 *BUMN PDAM:* ${statusPDAM}
│ ⌁ 🗳️ *Pemilu:* ${statusPemilu}
│ ⌁ 💼 *Aset Sitaan:* ${negara.bumn.length} Perusahaan
╰──────────〔 🍃 〕`;
                    return await sendInfoMsg(txt);
                }

                // ==========================================
                // SISTEM GUDANG NEGARA & B2B ESCROW (REKBER)
                // ==========================================
                case 'upgradegudang': {
                    if (!isPresiden) return m.reply('❌ Hanya Presiden yang dapat mengesahkan proyek Gudang Negara!');
                    let jmlLevel = parseInt(args[1]) || 1;
                    if (jmlLevel < 1) return m.reply('⚠️ Jumlah level tidak valid.');
                    
                    let currentLevel = negara.gudangLevel || 1;
                    if (currentLevel >= 9000) return m.reply('❌ Gudang Negara sudah mencapai level maksimal (Lv 9000).');
                    
                    let allowedLevel = Math.min(jmlLevel, 9000 - currentLevel);
                    let biaya = allowedLevel * 10000000; 
                    
                    if (negara.kas < biaya) return m.reply(`❌ Kas Negara tidak cukup! Butuh ${formatRp(biaya)} untuk upgrade ${allowedLevel} level.`);
                    
                    negara.kas -= biaya;
                    negara.gudangLevel += allowedLevel;
                    m.reply(`✅ *PROYEK GUDANG NEGARA RAMPUNG*\n\nGudang Negara berhasil ditingkatkan sebanyak ${allowedLevel} Level.\nLevel Saat Ini: *Lv ${negara.gudangLevel}*\nKapasitas Total: ${(negara.gudangLevel * 180).toLocaleString('id-ID')} Slot\nBiaya Proyek: -${formatRp(biaya)}`);
                    break;
                }

                case 'b2b': {
                    let subAction = args[1] ? args[1].toLowerCase() : 'list';
                    
                    for (let id in negara.b2b) {
                        let k = negara.b2b[id];
                        if (now - k.timestamp > 600000) { 
                            let sellerUser = users[k.seller];
                            if (sellerUser) {
                                sellerUser[k.item] = (sellerUser[k.item] || 0) + k.qty;
                                conn.sendMessage(k.seller, { text: `🚫 *KONTRAK B2B (ID: ${id}) DIBATALKAN OTOMATIS*\n\nPembeli PHP (melewati batas 10 menit). Barang sejumlah ${k.qty.toLocaleString('id-ID')} ${k.item} telah ditarik dari Gudang Negara dan dikembalikan utuh ke tas Anda.` }).catch(() => {});
                            }
                            negara.gudang[k.item] = Math.max(0, (negara.gudang[k.item] || 0) - k.qty);
                            delete negara.b2b[id];
                        }
                    }

                    if (subAction === 'list') {
                        let txt = `🤝 *KONTRAK B2B NEGARA (REKBER)* 🤝\n\n`;
                        let hasContract = false;
                        for (let id in negara.b2b) {
                            let k = negara.b2b[id];
                            let isMe = k.seller === sender || k.buyer === sender;
                            if (isMe) {
                                hasContract = true;
                                let sisaWaktu = Math.floor((600000 - (now - k.timestamp)) / 1000);
                                let menit = Math.floor(sisaWaktu / 60);
                                let detik = sisaWaktu % 60;
                                txt += `📝 *ID Kontrak: ${id}*\n`
                                    + `📦 Item: ${k.qty.toLocaleString('id-ID')} ${k.item}\n`
                                    + `💰 Harga Total: ${formatRp(k.price)}\n`
                                    + `📤 Penjual: @${k.seller.split('@')[0]}\n`
                                    + `📥 Pembeli: @${k.buyer.split('@')[0]}\n`
                                    + `⏳ Sisa Waktu Bayar: ${menit}m ${detik}s\n\n`;
                            }
                        }
                        if (!hasContract) txt += `_Tidak ada kontrak aktif yang melibatkan Anda di Gudang Negara._`;
                        txt += `\n*Gunakan Perintah:*\n• ${usedPrefix}negara b2b buat <@pembeli> <item> <jml> <harga> [id_pt_sumber]\n• ${usedPrefix}negara b2b bayar <id_kontrak> [id_pt_tujuan]\n• ${usedPrefix}negara b2b batal <id_kontrak>`;
                        return m.reply(txt, null, { mentions: [sender, ...Object.values(negara.b2b).flatMap(k => [k.seller, k.buyer])]});
                    }
                    
                    if (subAction === 'buat') {
                        let targetMention = args[2];
                        let item = args[3] ? args[3].toLowerCase() : '';
                        let qty = parseInt(args[4]);
                        let price = parseInt(args[5]);
                        let ptSumber = parseInt(args[6]); 
                        
                        if (!targetMention || !item || isNaN(qty) || isNaN(price)) {
                            return m.reply(`⚠️ *Format Salah!*\n\n*${usedPrefix}negara b2b buat <@tag_pembeli> <item> <jumlah> <harga_total> [id_pt_sumber]*\n\n_Catatan: Jika item diambil dari tas pribadi (Petani), kosongkan id_pt_sumber._`);
                        }
                        
                        let buyer = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                        if (buyer === sender) return m.reply(`❌ Tidak bisa membuat kontrak dengan diri sendiri.`);
                        if (!users[buyer]) return m.reply(`❌ Pembeli tidak terdaftar di sistem.`);
                        if (qty < 1 || price < 1) return m.reply(`❌ Jumlah dan Harga minimal adalah 1.`);
                        
                        let capNegara = negara.gudangLevel * 180;
                        let usedNegara = Object.values(negara.gudang).reduce((a, b) => a + b, 0);
                        if (usedNegara + qty > capNegara) return m.reply(`❌ *Gudang Negara Penuh!*\nKapasitas tersisa: ${(capNegara - usedNegara).toLocaleString('id-ID')} Slot.\n_Minta Presiden untuk upgrade Gudang Negara agar bisa bertransaksi B2B._`);
                        
                        let isFromPT = !isNaN(ptSumber);
                        if (isFromPT) {
                            let ptId = ptSumber - 1;
                            let pt = user.perusahaan[ptId];
                            if (!pt) return m.reply(`❌ ID PT (Sumber) Anda tidak valid!`);
                            if (pt.type === 'listrik') return m.reply(`❌ PT Listrik tidak memiliki logistik fisik.`);
                            if ((pt.gudang[item] || 0) < qty) return m.reply(`❌ Stok *${item}* di gudang PT *${pt.name}* tidak cukup! Sisa: ${(pt.gudang[item] || 0).toLocaleString('id-ID')}`);
                            
                            pt.gudang[item] -= qty;
                        } else {
                            if ((user[item] || 0) < qty) return m.reply(`❌ Stok *${item}* di tas pribadimu tidak cukup! Sisa: ${(user[item] || 0).toLocaleString('id-ID')}`);
                            user[item] -= qty;
                        }
                        
                        negara.gudang[item] = (negara.gudang[item] || 0) + qty;
                        
                        let contractId = negara.b2bCounter++;
                        negara.b2b[contractId] = {
                            id: contractId,
                            seller: sender,
                            buyer: buyer,
                            item: item,
                            qty: qty,
                            price: price,
                            ptSource: isFromPT ? ptSumber : null,
                            timestamp: now
                        };
                        
                        let txt = `🤝 *KONTRAK B2B BERHASIL DIBUAT (ID: ${contractId})* 🤝\n\n`
                            + `Barang sebesar *${qty.toLocaleString('id-ID')} ${item}* telah ditarik dan diamankan ke dalam *Gudang Negara* (Rekber).\n\n`
                            + `Silakan @${buyer.split('@')[0]} untuk melunasi pembayaran sebesar *${formatRp(price)}* menggunakan perintah:\n`
                            + `*${usedPrefix}negara b2b bayar ${contractId} [id_pt_tujuan_opsional]*\n\n`
                            + `_⏳ Batas Waktu Bayar: 10 Menit sebelum dibatalkan otomatis._`;
                            
                        return m.reply(txt, null, { mentions: [buyer] });
                    }
                    
                    if (subAction === 'bayar') {
                        let contractId = parseInt(args[2]);
                        let ptTujuan = parseInt(args[3]); 
                        
                        if (isNaN(contractId)) return m.reply(`⚠️ Gunakan format: *${usedPrefix}negara b2b bayar <id_kontrak> [id_pt_tujuan]*`);
                        let k = negara.b2b[contractId];
                        if (!k) return m.reply(`❌ Kontrak B2B dengan ID ${contractId} tidak ditemukan atau sudah dibatalkan.`);
                        if (k.buyer !== sender) return m.reply(`❌ Kontrak ini tidak ditujukan untuk Anda! Anda bukan pembeli pada kontrak ini.`);
                        
                        if (user.money < k.price) return m.reply(`❌ Uang Anda tidak cukup untuk membayar tagihan sebesar *${formatRp(k.price)}*. Uang Anda: ${formatRp(user.money)}`);
                        
                        let isToPT = !isNaN(ptTujuan);
                        if (isToPT) {
                            let ptId = ptTujuan - 1;
                            let pt = user.perusahaan[ptId];
                            if (!pt) return m.reply(`❌ ID PT (Tujuan) Anda tidak valid!`);
                            if (pt.type === 'listrik') return m.reply(`❌ PT Listrik tidak memiliki logistik fisik.`);
                            
                            let sisaSlot = ((pt.gudangLevel || 1) * 120) - Object.values(pt.gudang || {}).reduce((s, v) => s + (v || 0), 0);
                            if (k.qty > sisaSlot) return m.reply(`❌ Gudang PT *${pt.name}* penuh! Hanya muat ${sisaSlot.toLocaleString('id-ID')} slot lagi.`);
                            
                            if (!pt.gudang) pt.gudang = {};
                            pt.gudang[k.item] = (pt.gudang[k.item] || 0) + k.qty;
                        } else {
                            user[k.item] = (user[k.item] || 0) + k.qty;
                        }
                        
                        user.money -= k.price;
                        let sellerUser = users[k.seller];
                        
                        negara.gudang[k.item] = Math.max(0, (negara.gudang[k.item] || 0) - k.qty);
                        delete negara.b2b[contractId];
                        
                        let taxB2B = Math.floor(k.price * 0.01);
                        let bersihMasuk = k.price - taxB2B;
                        
                        if (sellerUser) sellerUser.money += bersihMasuk;
                        negara.kas += taxB2B;
                        
                        let txt = `✅ *PEMBAYARAN KONTRAK B2B (ID: ${contractId}) BERHASIL* ✅\n\n`
                            + `📥 *${k.qty.toLocaleString('id-ID')} ${k.item}* telah ditarik dari Gudang Negara ke ${isToPT ? 'Gudang PT' : 'Tas Pribadi'} Anda.\n`
                            + `💸 *${formatRp(bersihMasuk)}* telah diteruskan ke @${k.seller.split('@')[0]}.\n`
                            + `🏛️ Pajak Rekber (1%): *${formatRp(taxB2B)}* masuk ke Kas Negara.`;
                            
                        return m.reply(txt, null, { mentions: [k.seller] });
                    }
                    
                    if (subAction === 'batal') {
                        let contractId = parseInt(args[2]);
                        if (isNaN(contractId)) return m.reply(`⚠️ Gunakan format: *${usedPrefix}negara b2b batal <id_kontrak>*`);
                        let k = negara.b2b[contractId];
                        if (!k) return m.reply(`❌ Kontrak B2B dengan ID ${contractId} tidak ditemukan.`);
                        
                        if (k.seller !== sender && !isPresiden) return m.reply(`❌ Hanya penjual atau Presiden yang dapat membatalkan kontrak secara sepihak!`);
                        
                        let sellerUser = users[k.seller];
                        if (!sellerUser) return m.reply(`❌ Data penjual hilang dari database, pembatalan diblokir.`);
                        
                        sellerUser[k.item] = (sellerUser[k.item] || 0) + k.qty;
                        negara.gudang[k.item] = Math.max(0, (negara.gudang[k.item] || 0) - k.qty);
                        delete negara.b2b[contractId];
                        
                        return m.reply(`🚫 *KONTRAK B2B (ID: ${contractId}) DIBATALKAN*\n\nSeluruh barang sejumlah *${k.qty.toLocaleString('id-ID')} ${k.item}* telah ditarik dari Gudang Negara dan dikembalikan utuh ke Tas Pribadi Penjual (@${k.seller.split('@')[0]}).`, null, {mentions: [k.seller]});
                    }

                    return m.reply(`❌ Sub-perintah B2B tidak valid. Gunakan: *buat, bayar, batal, list*.`);
                }

                // ==========================================
                // FITUR NEGARA LAINNYA
                // ==========================================
                case 'infobumn':
                case 'info-bumn': {
                    let txt = `╭─〔 🍃 〕 *Info BUMN*\n│\n`;
                    
                    if (negara.pln) {
                        let p = negara.pln;
                        let pelangganPLN = p.pelanggan || 0;
                        let persenPLN = ((pelangganPLN / 5000000) * 100).toFixed(2);
                        let pendapatanPLN = pelangganPLN * 6500;
                        txt += `│ ⌁ ⚡ *PLN (Persero)*\n`
                            + `│ ⌁ Kas PT: *${formatRp(p.saldo)}*\n`
                            + `│ ⌁ Karyawan: ${(p.karyawan || 0).toLocaleString('id-ID')} / 1jt\n`
                            + `│ ⌁ Pelanggan: ${pelangganPLN.toLocaleString('id-ID')} (${persenPLN}%)\n`
                            + `│ ⌁ Pendapatan: *${formatRp(pendapatanPLN)} / 15 Mnt*\n`
                            + `│ ⌁ Kapital Investor: ${formatRp(p.totalInvestasi || 0)}\n│\n`;
                    } else {
                        txt += `│ ⌁ ⚡ *PLN:* 🔴 Belum Dibangun\n│\n`;
                    }

                    if (negara.pdam) {
                        let p = negara.pdam;
                        let pelangganPDAM = p.pelanggan || 0;
                        let persenPDAM = ((pelangganPDAM / 5000000) * 100).toFixed(2);
                        let pendapatanPDAM = pelangganPDAM * 16000;
                        txt += `│ ⌁ 💧 *PDAM (Persero)*\n`
                            + `│ ⌁ Kas PT: *${formatRp(p.saldo)}*\n`
                            + `│ ⌁ Karyawan: ${(p.karyawan || 0).toLocaleString('id-ID')} / 1jt\n`
                            + `│ ⌁ Pelanggan: ${pelangganPDAM.toLocaleString('id-ID')} (${persenPDAM}%)\n`
                            + `│ ⌁ Pendapatan: *${formatRp(pendapatanPDAM)} / 15 Mnt*\n`
                            + `│ ⌁ Kapital Investor: ${formatRp(p.totalInvestasi || 0)}\n│\n`;
                    } else {
                        txt += `│ ⌁ 💧 *PDAM:* 🔴 Belum Beroperasi\n│\n`;
                    }

                    let totalSitaan = negara.bumn ? negara.bumn.reduce((sum, pt) => sum + (pt.saldo || 0), 0) : 0;
                    let jumlahSitaan = negara.bumn ? negara.bumn.length : 0;
                    txt += `│ ⌁ 💼 *Holding Sitaan Pajak*\n`
                        + `│ ⌁ Total PT Disita: ${jumlahSitaan}\n`
                        + `│ ⌁ Likuiditas: *${formatRp(totalSitaan)}*\n`
                        + `╰──────────〔 🍃 〕`;

                    return await sendInfoMsg(txt);
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

                // ==========================================
                // BANSOS BARU (Hanya Presiden yg Suntik Dana)
                // ==========================================
                case 'bansos': {
                    if (now - user.lastBansos < 24 * 60 * 60 * 1000) return m.reply(`⏳ Subsidi Anda sudah diklaim untuk hari ini.`);
                    if (negara.danaBansos <= 0) return m.reply('❌ Kas Bansos Negara kosong. Minta Presiden untuk mengisi anggaran.');

                    let isMiskin = user.money < 500000000;
                    let nominalDapat = isMiskin ? Math.floor(Math.random() * 35000000) + 25000000 : Math.floor(Math.random() * 5000000) + 2000000;
                    if (nominalDapat > negara.danaBansos) nominalDapat = negara.danaBansos;

                    negara.danaBansos -= nominalDapat; user.money += nominalDapat; user.lastBansos = now;
                    m.reply(`🎁 *SUBSIDI DIKIRIM* 🎁\n\nAnda menerima dana bantuan *${formatRp(nominalDapat)}*.`);
                    break;
                }

                case 'suntikbansos': {
                    if (!isPresiden) return m.reply('❌ Hanya Presiden yang berhak mengatur anggaran Bansos.');
                    let nominal = parseInt(args[1]);
                    if (isNaN(nominal) || nominal < 1000000) return m.reply('⚠️ Minimum suntik anggaran Rp 1.000.000');
                    if (negara.kas < nominal) return m.reply(`❌ Kas Negara tidak cukup! Kas saat ini: ${formatRp(negara.kas)}`);

                    negara.kas -= nominal;
                    negara.danaBansos += nominal;
                    m.reply(`✅ *ANGGARAN BANSOS DITAMBAH*\n\nPresiden telah menyetujui penambahan dana sebesar ${formatRp(nominal)} ke kas Bansos.`);
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
                    if (!negara.investPTOpen) return m.reply('❌ Gerbang investasi BUMN ditutup sementara.');
                    let jenis = args[1] ? args[1].toLowerCase() : '';
                    let nominal = parseInt(args[2]);
                    if (jenis !== 'pln' && jenis !== 'pdam') return m.reply(`⚠️ Format salah: *${usedPrefix+command} investasi <pln/pdam> <nominal>*`);
                    if (isNaN(nominal) || nominal < 1000000000) return m.reply('⚠️ Batas investasi bursa minimal Rp 1 Miliar.');

                    let perusahaan = negara[jenis];
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
                    let txt = `╭─〔 🍃 〕 *Portofolio Saham*\n│\n`;
                    for (let jenis of ['pln', 'pdam']) {
                        let p = negara[jenis];
                        if (!p || !p.investasi || !p.investasi[sender]) continue;
                        hasInvestasi = true;
                        let nominal = p.investasi[sender], totalInv = p.totalInvestasi || 1;
                        let porsi = ((nominal / totalInv) * 100).toFixed(2);
                        let estimasiBagiHasil = Math.floor(p.saldo * 0.05 * (nominal / totalInv));
                        txt += `│ ⌁ 🏢 *${jenis.toUpperCase()} Holdings*\n│ ⌁ Nilai Saham: ${formatRp(nominal)}\n│ ⌁ Kepemilikan: *${porsi}% Share*\n│ ⌁ Est. Dividen: ~${formatRp(estimasiBagiHasil)}\n│\n`;
                    }
                    if (!hasInvestasi) return m.reply('📊 Rekening bursa Anda kosong. Anda belum menanam saham di BUMN manapun.');
                    txt += `╰──────────〔 🍃 〕`;
                    return await sendInfoMsg(txt);
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
                        return `│ ⌁ ${i+1}. *${e.nama}* [${badge}]\n│ ⌁    👤 ${e.pemilik}\n│ ⌁    💹 ~${formatSingkat(e.valuasi)} | Kas: ${formatRp(e.saldo)}`;
                    }).join('\n│\n');
                    
                    let txtLb = `╭─〔 🍃 〕 *Leaderboard Korporasi*\n│\n${board}\n╰──────────〔 🍃 〕`;
                    return await sendInfoMsg(txtLb);
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

                default: m.reply(`❌ Sub-perintah salah. Ketik *${usedPrefix+command} help* untuk panduan lengkap.`);
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
