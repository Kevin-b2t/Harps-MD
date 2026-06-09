// ==========================================
// FITUR NEGARA & PEMERINTAHAN RPG (UPDATED)
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
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply('❌ Data user tidak ditemukan!');
        if (user.money === undefined) user.money = 0;
        if (user.hutangNegara === undefined) user.hutangNegara = 0;
        if (user.lastBansos === undefined) user.lastBansos = 0;

        // Inisialisasi Database Negara
        if (!global.db.data.negara) {
            global.db.data.negara = {
                presiden: null,
                waktuLantik: 0,
                kas: 100000000000,
                bank: false,
                bumn: [],
                kandidat: {},
                isPemilu: false,
                waktuMulaiPemilu: 0,
                pln: null,
                pdam: null,
                investBankOpen: true, 
                investPTOpen: true,   
                danaBansos: 0         
            };
        }

        let negara = global.db.data.negara;

        // Patch field baru untuk database lama agar tidak error
        if (negara.investBankOpen === undefined) negara.investBankOpen = true;
        if (negara.investPTOpen === undefined) negara.investPTOpen = true;
        if (negara.danaBansos === undefined) negara.danaBansos = 0;
        if (!negara.pln && negara.pln !== null) negara.pln = null;
        if (!negara.pdam && negara.pdam !== null) negara.pdam = null;
        let now = Date.now();

        // ==========================================
        // AUTO COLLECT BUMN (15 Menit | Max 5 Jt Pelanggan)
        // ==========================================
        function prosesAutoBUMN(perusahaan) {
            if (!perusahaan) return;
            let karyawan = perusahaan.karyawan || 0;
            if (karyawan <= 0) return;
            if (perusahaan.pelanggan >= 5000000) return;

            let interval = 15 * 60 * 1000; 
            if (!perusahaan.lastAuto || perusahaan.lastAuto === 0) {
                perusahaan.lastAuto = now;
                return;
            }
            let lastAuto = perusahaan.lastAuto;
            let siklusLewat = Math.floor((now - lastAuto) / interval);
            if (siklusLewat <= 0) return;

            let totalDapat = 0;
            for (let s = 0; s < siklusLewat; s++) {
                if (perusahaan.pelanggan + totalDapat >= 5000000) break;
                let dapat;
                if (karyawan >= 500000) {
                    dapat = Math.floor(Math.random() * 50000) + 50000;  
                } else if (karyawan >= 100000) {
                    dapat = Math.floor(Math.random() * 10000) + 10000;  
                } else if (karyawan >= 10000) {
                    dapat = Math.floor(Math.random() * 1000) + 1000;    
                } else if (karyawan >= 6000) {
                    dapat = Math.floor(Math.random() * 101) + 500;
                } else if (karyawan >= 5000) {
                    dapat = Math.floor(Math.random() * 51) + 50;
                } else if (karyawan >= 5) {
                    dapat = Math.floor(Math.random() * 4) + 6;
                } else {
                    dapat = Math.floor(Math.random() * 4) + 2;
                }
                totalDapat += dapat;
            }
            let sebelum = perusahaan.pelanggan;
            perusahaan.pelanggan = Math.min(5000000, perusahaan.pelanggan + totalDapat);
            let aktualDapat = perusahaan.pelanggan - sebelum;
            perusahaan.lastAuto = lastAuto + siklusLewat * interval;

            let harga = perusahaan.hargaPerWatt || perusahaan.hargaPerLiter || 0;
            perusahaan.saldo += aktualDapat * harga;
        }

        if (negara.pln) prosesAutoBUMN(negara.pln);
        if (negara.pdam) prosesAutoBUMN(negara.pdam);

        // AUTO-CHECK PRESIDEN
        if (negara.presiden && negara.waktuLantik) {
            if (now - negara.waktuLantik >= 7 * 24 * 60 * 60 * 1000) {
                let mantanPresiden = negara.presiden;
                negara.presiden = null; 
                negara.waktuLantik = 0;
                conn.reply(m.chat, `📢 *PENGUMUMAN NEGARA* 📢\nMasa jabatan @${mantanPresiden.split('@')[0]} sebagai Presiden telah habis secara konstitusi. Kursi Kepresidenan KOSONG!\n\nSilakan buka pendaftaran baru: *${usedPrefix+command} pemilu*`, m, { mentions: [mantanPresiden] });
            }
        }

        // AUTO-CHECK PEMILU
        if (negara.isPemilu && negara.waktuMulaiPemilu) {
            if (now - negara.waktuMulaiPemilu >= 60 * 60 * 1000) {
                negara.isPemilu = false;
                let kandidatList = Object.keys(negara.kandidat);
                if (kandidatList.length > 0) {
                    let pemenang = kandidatList[0];
                    let maxSuara = negara.kandidat[pemenang];
                    for (let k of kandidatList) {
                        if (negara.kandidat[k] > maxSuara) {
                            pemenang = k;
                            maxSuara = negara.kandidat[k];
                        }
                    }
                    negara.presiden = pemenang;
                    negara.waktuLantik = now; 
                    negara.kandidat = {}; 
                    for (let uid in global.db.data.users) { global.db.data.users[uid].hasVoted = false; }
                    conn.reply(m.chat, `🎉 *PEMILU BERAKHIR OTOMATIS* 🎉\n\nSelamat! Berdasarkan suara rakyat (${maxSuara} vote), @${pemenang.split('@')[0]} resmi dilantik menjadi *PRESIDEN BARU*! 👑`, m, { mentions: [pemenang] });
                } else {
                    negara.kandidat = {};
                    conn.reply(m.chat, `🗳️ *PEMILU BERAKHIR OTOMATIS*\nTidak ada warga yang mendaftar. Kursi kepresidenan tetap kosong!`, m);
                }
            }
        }

        let action = args[0] ? args[0].toLowerCase() : 'info';
        let isPresiden = (negara.presiden === m.sender);

        switch (action) {
            // ==============================
            // MENU UTAMA ISTANA NEGARA
            // ==============================
            case 'info': {
                let namaPresiden = negara.presiden ? (global.db.data.users[negara.presiden]?.name || negara.presiden.split('@')[0]) : 'Kosong';
                let statusJabatan = '';
                if (negara.presiden && negara.waktuLantik) {
                    let sisaJabatan = (7 * 24 * 60 * 60 * 1000) - (now - negara.waktuLantik);
                    statusJabatan = `\n⏳ *Sisa Jabatan:* ${msToTime(sisaJabatan)}`;
                }

                let statusBank = negara.bank ? `🟢 Aktif | [Invest/Pinjam: ${negara.investBankOpen ? 'BUKA' : 'TUTUP'}]` : '🔴 Belum Dibangun';
                let statusPemilu = negara.isPemilu ? '🟢 Sedang Berlangsung' : '🔴 Ditutup';
                if (negara.isPemilu && negara.waktuMulaiPemilu) {
                    let sisaPemilu = (60 * 60 * 1000) - (now - negara.waktuMulaiPemilu);
                    statusPemilu += `\n⏳ *Sisa Waktu Vote:* ${msToTime(sisaPemilu)}`;
                }

                let statusPLN = negara.pln ? `🟢 Aktif | ${negara.pln.pelanggan.toLocaleString('id-ID')} Pelanggan` : '🔴 Belum Dibangun';
                let statusPDAM = negara.pdam ? `🟢 Aktif | ${negara.pdam.pelanggan.toLocaleString('id-ID')} Pelanggan` : '🔴 Belum Dibangun';
                let statusInvestPT = negara.investPTOpen ? '🟢 Terbuka untuk Umum' : '🔴 Ditutup oleh Negara';

                let txt = `🏛️ *Republic of WhatsApp - Pemerintahan RPG* 🏛️\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n`;
                txt += `👑 *Presiden:* ${namaPresiden}${statusJabatan}\n`;
                txt += `💰 *Kas Negara:* ${formatRp(negara.kas)}\n`;
                txt += `🎁 *Dana Bansos Rakyat:* ${formatRp(negara.danaBansos)}\n`;
                txt += `🏦 *Bank Negara:* ${statusBank}\n`;
                txt += `⚡ *PLN Negara:* ${statusPLN}\n`;
                txt += `💧 *PDAM Negara:* ${statusPDAM}\n`;
                txt += `🏢 *Akses Invest BUMN:* ${statusInvestPT}\n`;
                txt += `🗳️ *Status Pemilu:* ${statusPemilu}\n`;
                txt += `💼 *Aset BUMN Sitaan:* ${negara.bumn.length} Perusahaan\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n\n`;
                
                txt += `*📜 PERINTAH UMUM WARGA:*\n`;
                txt += `• *${usedPrefix+command} infobumn* — Cek detail finansial & kas semua BUMN 🆕\n`;
                txt += `• *${usedPrefix+command} bansos* — Ambil bantuan sosial harian rakyat\n`;
                txt += `• *${usedPrefix+command} setorbansos <nominal>* — Donasi/setor dana bansos\n`;
                txt += `• *${usedPrefix+command} daftarcalon* — Daftar capres (Biaya 10M)\n`;
                txt += `• *${usedPrefix+command} vote @tag* — Berikan hak suara ke capres\n`;
                txt += `• *${usedPrefix+command} pinjam <nominal>* — Pinjam dana ke Bank Negara\n`;
                txt += `• *${usedPrefix+command} bayarbank <nominal>* — Lunasi utang bank negara\n\n`;
                
                txt += `*👑 PERINTAH KHUSUS PRESIDEN:*\n`;
                txt += `• *${usedPrefix+command} setinvestbank* — Buka/Tutup Investasi & Pinjaman Bank\n`;
                txt += `• *${usedPrefix+command} setinvestpt* — Buka/Tutup Investasi Perusahaan BUMN\n`;
                txt += `• *${usedPrefix+command} pemilu* — Buka masa pendaftaran capres (1 Jam)\n`;
                txt += `• *${usedPrefix+command} bangunbank* — Dirikan Bank Negara (Biaya 50M)\n`;
                txt += `• *${usedPrefix+command} razia* — Tarik pajak paksa & sita PT nunggak\n`;
                txt += `• *${usedPrefix+command} bangunpln* — Dirikan PLN Negara (Biaya 865M)\n`;
                txt += `• *${usedPrefix+command} bangunpdam* — Dirikan PDAM Negara (Biaya 865M)\n`;
                txt += `• *${usedPrefix+command} rekrut pln/pdam <jml>* — Rekrut karyawan (5M/org, Max 1jt)\n\n`;

                txt += `*⚡ PERINTAH BUMN NEGARA:*\n`;
                txt += `• *${usedPrefix+command} investasi pln/pdam <nominal>* — Investasi modal warga\n`;
                txt += `• *${usedPrefix+command} investasiku* — Cek aset portofolio investasimu\n`;
                txt += `• *${usedPrefix+command} tagihpln* / *tagihpdam* — Tarik pendapatan ke kas negara\n`;
                txt += `• *${usedPrefix+command} leaderboard* — Peringkat valuasi korporasi`;

                return m.reply(txt);
            }

            // ==============================
            // PERINTAH BARU: INFO PERUSAHAAN NEGARA (BUMN)
            // ==============================
            case 'infobumn':
            case 'info-bumn': {
                let txt = `🏢 *LAPORAN FINANSIAL & KAS BUMN NEGARA* 🏢\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n\n`;

                // 1. DATA PLN
                if (negara.pln) {
                    let p = negara.pln;
                    let persenPenuh = ((p.pelanggan / 5000000) * 100).toFixed(2);
                    txt += `⚡ *1. Perusahaan Listrik Negara (PLN)*\n`;
                    txt += `   💰 Kas/Saldo Internal PT: *${formatRp(p.saldo)}*\n`;
                    txt += `   👷 Karyawan Aktif: ${p.karyawan ? p.karyawan.toLocaleString('id-ID') : 0} / 1.000.000 Orang\n`;
                    txt += `   👥 Jumlah Pelanggan: ${p.pelanggan.toLocaleString('id-ID')} / 5.000.000 (${persenPenuh}%)\n`;
                    txt += `   🏦 Total Dana Investasi: ${formatRp(p.totalInvestasi || 0)}\n\n`;
                } else {
                    txt += `⚡ *1. PLN Negara:* 🔴 Belum Dibangun Presiden\n\n`;
                }

                // 2. DATA PDAM
                if (negara.pdam) {
                    let p = negara.pdam;
                    let persenPenuh = ((p.pelanggan / 5000000) * 100).toFixed(2);
                    txt += `💧 *2. Perusahaan Daerah Air Minum (PDAM)*\n`;
                    txt += `   💰 Kas/Saldo Internal PT: *${formatRp(p.saldo)}*\n`;
                    txt += `   👷 Karyawan Aktif: ${p.karyawan ? p.karyawan.toLocaleString('id-ID') : 0} / 1.000.000 Orang\n`;
                    txt += `   👥 Jumlah Pelanggan: ${p.pelanggan.toLocaleString('id-ID')} / 5.000.000 (${persenPenuh}%)\n`;
                    txt += `   🏦 Total Dana Investasi: ${formatRp(p.totalInvestasi || 0)}\n\n`;
                } else {
                    txt += `💧 *2. PDAM Negara:* 🔴 Belum Dibangun Presiden\n\n`;
                }

                // 3. DATA PT SITAAN
                txt += `💼 *3. Holding Korporasi Sitaan Pajak*\n`;
                txt += `   🏢 Total Perusahaan Disita: ${negara.bumn.length} PT\n`;
                let totalSaldoSitaan = negara.bumn.reduce((sum, pt) => sum + (pt.saldo || 0), 0);
                txt += `   💰 Total Gabungan Kas PT Sitaan: *${formatRp(totalSaldoSitaan)}*\n`;
                
                if (negara.bumn.length > 0) {
                    txt += `   📋 Cetak 5 Berkas PT Sitaan Teratas:\n`;
                    negara.bumn.slice(0, 5).forEach((pt, i) => {
                        txt += `     - [${i+1}] ${pt.name} | Kas PT: ${formatRp(pt.saldo)}\n`;
                    });
                    if (negara.bumn.length > 5) txt += `     - _dan ${negara.bumn.length - 5} Perusahaan sitaan lainnya..._\n`;
                }
                
                txt += `\n━━━━━━━━━━━━━━━━━━━━\n`;
                txt += `_Catatan: Kas internal PT baru akan mencair masuk ke Kas Utama Negara setelah Presiden mengeksekusi perintah *tagihpln* atau *tagihpdam*._`;

                return m.reply(txt);
            }

            // ==============================
            // KONTROL INVESTASI (BUKA/TUTUP)
            // ==============================
            case 'setinvestbank': {
                if (!isPresiden) return m.reply('❌ Hak eksklusif ini hanya dimiliki oleh Presiden aktif!');
                negara.investBankOpen = !negara.investBankOpen;
                m.reply(`🏦 *KEBIJAKAN PRESIDEN:* Transaksi & Pinjaman Bank Sentral resmi *${negara.investBankOpen ? 'DIBUKA' : 'DITUTUP'}*!`);
                break;
            }

            case 'setinvestpt': {
                if (!isPresiden) return m.reply('❌ Hak eksklusif ini hanya dimiliki oleh Presiden aktif!');
                negara.investPTOpen = !negara.investPTOpen;
                m.reply(`🏢 *KEBIJAKAN PRESIDEN:* Akses gerbang investasi modal ke BUMN (PLN/PDAM) resmi *${negara.investPTOpen ? 'DIBUKA' : 'DITUTUP'}*!`);
                break;
            }

            // ==============================
            // SISTEM BANSOS MANDIRI & SETOR
            // ==============================
            case 'bansos': {
                if (now - user.lastBansos < 24 * 60 * 60 * 1000) {
                    let sisa = (24 * 60 * 60 * 1000) - (now - user.lastBansos);
                    return m.reply(`⏳ Anda sudah mengklaim bansos hari ini. Silakan ambil lagi dalam waktu *${msToTime(sisa)}*.`);
                }
                if (negara.danaBansos <= 0) {
                    return m.reply('❌ Dana Bansos Negara sedang kosong! Silakan minta warga patungan lewat perintah *setorbansos*.');
                }

                let isMiskin = user.money < 500000000;
                let nominalDapat = 0;

                if (isMiskin) {
                    nominalDapat = Math.floor(Math.random() * 35000000) + 25000000;
                } else {
                    nominalDapat = Math.floor(Math.random() * 5000000) + 2000000;
                }

                if (nominalDapat > negara.danaBansos) nominalDapat = negara.danaBansos;

                negara.danaBansos -= nominalDapat;
                user.money += nominalDapat;
                user.lastBansos = now;

                let statusEkonomi = isMiskin ? '🔴 Golongan Miskin (Dapat Banyak)' : '🟢 Golongan Mampu (Dapat Sedang)';
                
                let txtBansos = `🎁 *KLAIM BANSOS CAIR* 🎁\n━━━━━━━━━━━━━━━━━━━━\n`;
                txtBansos += `👤 *Penerima:* @${m.sender.split('@')[0]}\n`;
                txtBansos += `📊 *Status Ekonomi:* ${statusEkonomi}\n`;
                txtBansos += `💰 *Dana Dicairkan:* ${formatRp(nominalDapat)}\n`;
                txtBansos += `🏛️ *Sisa Saldo Bansos Negara:* ${formatRp(negara.danaBansos)}\n`;
                txtBansos += `━━━━━━━━━━━━━━━━━━━━`;
                
                m.reply(txtBansos, null, { mentions: [m.sender] });
                break;
            }

            case 'setorbansos': {
                let nominal = parseInt(args[1]);
                if (isNaN(nominal) || nominal < 1000000) return m.reply('⚠️ Minimal menyetor dana bansos adalah Rp 1.000.000');
                if (user.money < nominal) return m.reply(`❌ Uang pribadi tidak cukup untuk menyumbang ${formatRp(nominal)}`);

                user.money -= nominal;
                negara.danaBansos += nominal;

                let txtSetor = `✅ *DONASI BANSOS BERHASIL* ✅\n━━━━━━━━━━━━━━━━━━━━\n`;
                txtSetor += `👤 *Donatur:* @${m.sender.split('@')[0]}\n`;
                txtSetor += `💵 *Jumlah Setoran:* ${formatRp(nominal)}\n`;
                txtSetor += `🏛️ *Brankas Bansos Sekarang:* ${formatRp(negara.danaBansos)}\n`;
                txtSetor += `━━━━━━━━━━━━━━━━━━━━`;

                m.reply(txtSetor, null, { mentions: [m.sender] });
                break;
            }

            // ==============================
            // SISTEM PEMILU
            // ==============================
            case 'pemilu': {
                if (!m.isGroup) return m.reply('❌ Hanya di dalam grup!');
                if (!isPresiden && !m.isGroup) return m.reply('❌ Hanya Presiden atau Admin grup.');
                if (negara.isPemilu) {
                    negara.isPemilu = false;
                    m.reply(`🗳️ *MASA PEMILU DITUTUP!* Sahkan pemenang: *${usedPrefix+command} sahkan*`);
                } else {
                    negara.isPemilu = true;
                    negara.waktuMulaiPemilu = Date.now();
                    negara.kandidat = {}; 
                    m.reply(`🗳️ *PEMILU DIBUKA!* Silakan mendaftar Capres lewat: *${usedPrefix+command} daftarcalon*`);
                }
                break;
            }

            case 'daftarcalon': {
                if (!negara.isPemilu) return m.reply('❌ Pendaftaran belum dibuka!');
                if (negara.kandidat[m.sender] !== undefined) return m.reply('❌ Anda sudah terdaftar!');
                if (user.money < 10000000000) return m.reply('❌ Butuh dana kampanye sebesar Rp 10 Miliar.');
                user.money -= 10000000000;
                negara.kas += 10000000000;
                negara.kandidat[m.sender] = 0;
                m.reply(`✅ *PENDAFTARAN CAPRES DITERIMA!*\n@${m.sender.split('@')[0]} resmi jadi kandidat.`, null, { mentions: [m.sender] });
                break;
            }

            case 'vote': {
                if (!negara.isPemilu) return m.reply('❌ TPS belum dibuka!');
                let targetMention = args[1];
                if (!targetMention) return m.reply(`⚠️ Gunakan: *${usedPrefix+command} vote @tag_calon*`);
                let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                if (negara.kandidat[target] === undefined) return m.reply('❌ Calon tidak terdaftar!');
                if (user.hasVoted) return m.reply('❌ Anda sudah menyoblos!');
                user.hasVoted = true;
                negara.kandidat[target] += 1;
                m.reply(`🗳️ Satu suara berhasil masuk untuk @${target.split('@')[0]}!`, null, { mentions: [target] });
                break;
            }

            case 'sahkan': {
                if (negara.isPemilu) return m.reply('❌ Masa pemilu masih berjalan.');
                let kandidatList = Object.keys(negara.kandidat);
                if (kandidatList.length === 0) return m.reply('❌ Tidak ada kandidat.');
                let pemenang = kandidatList[0];
                let maxSuara = negara.kandidat[pemenang];
                for (let k of kandidatList) {
                    if (negara.kandidat[k] > maxSuara) {
                        pemenang = k;
                        maxSuara = negara.kandidat[k];
                    }
                }
                negara.presiden = pemenang;
                negara.waktuLantik = Date.now(); 
                negara.kandidat = {}; 
                for (let uid in global.db.data.users) { global.db.data.users[uid].hasVoted = false; }
                m.reply(`🎉 @${pemenang.split('@')[0]} resmi disahkan menjadi *PRESIDEN BARU*!`, null, { mentions: [pemenang] });
                break;
            }

            // ==============================
            // OPERASIONAL BANK
            // ==============================
            case 'bangunbank': {
                if (!isPresiden) return m.reply('❌ Khusus Presiden!');
                if (negara.bank) return m.reply('❌ Bank Negara sudah berdiri!');
                let biayaBank = 50000000000;
                if (negara.kas < biayaBank) return m.reply(`❌ Kas Negara tidak cukup dana.`);
                negara.kas -= biayaBank;
                negara.bank = true;
                m.reply(`🏦 *BANK NEGARA BERDIRI!*`);
                break;
            }

            case 'pinjam': {
                if (!negara.bank) return m.reply('❌ Bank Negara belum didirikan!');
                if (!negara.investBankOpen) return m.reply('❌ Fitur bank ditutup sementara oleh Presiden.');
                let nominal = parseInt(args[1]);
                if (isNaN(nominal) || nominal < 1000000) return m.reply(`⚠️ Minimal pinjam Rp 1.000.000`);
                if (negara.kas < nominal) return m.reply(`❌ Likuiditas kas bank tidak cukup.`);
                if (user.hutangNegara > 5000000000) return m.reply(`❌ Hutangmu menumpuk!`);
                let totalHutangBaru = nominal + Math.floor(nominal * 0.1);
                negara.kas -= nominal;
                user.money += nominal;
                user.hutangNegara += totalHutangBaru;
                m.reply(`🏦 Pinjaman cair, total tanggungan hutang: *${formatRp(user.hutangNegara)}*`);
                break;
            }

            case 'bayarbank': {
                if (user.hutangNegara <= 0) return m.reply('✅ Anda bersih dari hutang.');
                let nominal = parseInt(args[1]);
                if (isNaN(nominal)) return m.reply(`⚠️ Gunakan: *${usedPrefix+command} bayarbank <nominal>*`);
                if (nominal > user.hutangNegara) nominal = user.hutangNegara;
                if (user.money < nominal) return m.reply(`❌ Uangmu kurang.`);
                user.money -= nominal;
                user.hutangNegara -= nominal;
                negara.kas += nominal;
                m.reply(`✅ Sisa hutang: *${formatRp(user.hutangNegara)}*`);
                break;
            }

            case 'razia': {
                if (!isPresiden) return m.reply('❌ Khusus Presiden!');
                let totalPajakDitarik = 0, ptTerkunci = 0, ptDisita = 0;
                let nowTs = Date.now();
                let allUsers = global.db.data.users;
                for (let uid in allUsers) {
                    let u = allUsers[uid];
                    if (!Array.isArray(u.perusahaan)) continue;
                    for (let i = u.perusahaan.length - 1; i >= 0; i--) {
                        let pt = u.perusahaan[i];
                        if (!pt) continue;
                        if (!pt.lastTaxCheck) pt.lastTaxCheck = pt.lastTax || nowTs;
                        if (!pt.hariNunggak) pt.hariNunggak = 0;
                        let daysPassed = Math.floor((nowTs - pt.lastTaxCheck) / 86400000); 
                        if (daysPassed >= 1) {
                            let tagihanPajak = Math.floor(hitungAset(pt) * 0.002 * daysPassed);
                            if ((pt.saldo || 0) >= tagihanPajak) {
                                pt.saldo -= tagihanPajak;
                                totalPajakDitarik += tagihanPajak;
                                pt.lastTaxCheck = nowTs;
                                pt.hariNunggak = 0;
                                pt.isLocked = false;
                            } else {
                                pt.hariNunggak += daysPassed;
                                pt.lastTaxCheck = nowTs;
                                if (pt.hariNunggak >= 4) {
                                    pt.name = `[BUMN] ${pt.name}`; 
                                    pt.isLocked = true;
                                    pt.ownerLama = uid;
                                    negara.bumn.push(pt);
                                    u.perusahaan.splice(i, 1);
                                    ptDisita++;
                                } else if (pt.hariNunggak >= 3) {
                                    pt.isLocked = true;
                                    ptTerkunci++;
                                }
                            }
                        }
                    }
                }
                negara.kas += totalPajakDitarik;
                m.reply(`🚨 *RAZIA SELESAI*\n💸 Kas Masuk: +${formatRp(totalPajakDitarik)}\n🔒 Kunci: ${ptTerkunci} | 🏢 Sita BUMN: ${ptDisita}`);
                break;
            }

            // ==============================
            // BUMN PERUSAHAAN NEGARA (CONSTRUCTION)
            // ==============================
            case 'bangunpln': {
                if (!isPresiden) return m.reply('❌ Khusus Presiden!');
                if (negara.pln) return m.reply('❌ PLN sudah berdiri!');
                let biaya = 865000000000;
                if (negara.kas < biaya) return m.reply(`❌ Kas tidak cukup.`);
                negara.kas -= biaya;
                negara.pln = { pelanggan: 0, saldo: 0, hargaPerWatt: 6500, karyawan: 0, lastAuto: Date.now(), investasi: {}, totalInvestasi: 0 };
                m.reply(`⚡ *PLN NEGARA BERDIRI!*`);
                break;
            }

            case 'bangunpdam': {
                if (!isPresiden) return m.reply('❌ Khusus Presiden!');
                if (negara.pdam) return m.reply('❌ PDAM sudah berdiri!');
                let biaya = 865000000000;
                if (negara.kas < biaya) return m.reply(`❌ Kas tidak cukup.`);
                negara.kas -= biaya;
                negara.pdam = { pelanggan: 0, saldo: 0, hargaPerLiter: 16000, karyawan: 0, lastAuto: Date.now(), investasi: {}, totalInvestasi: 0 };
                m.reply(`💧 *PDAM NEGARA BERDIRI!*`);
                break;
            }

            // ==============================
            // REKRUT KARYAWAN (Max 1jt)
            // ==============================
            case 'rekrut': {
                if (!isPresiden) return m.reply('❌ Hanya Presiden!');
                let jenis = args[1] ? args[1].toLowerCase() : '';
                let jumlah = parseInt(args[2]) || 1;
                if (jenis !== 'pln' && jenis !== 'pdam') return m.reply(`⚠️ Format: *${usedPrefix+command} rekrut pln/pdam <jumlah>*`);

                let perusahaan = negara[jenis];
                if (!perusahaan) return m.reply(`❌ BUMN ${jenis.toUpperCase()} belum dibangun!`);
                if (jumlah < 1) return m.reply('⚠️ Minimal rekrut 1 orang.');
                if ((perusahaan.karyawan || 0) + jumlah > 1000000) {
                    return m.reply(`⚠️ Kuota penuh! Maksimal karyawan BUMN hanya bisa 1.000.000 orang.`);
                }

                let biayaPerOrang = 5000000000; 
                let totalBiaya = biayaPerOrang * jumlah;
                if (negara.kas < totalBiaya) return m.reply(`❌ Kas Negara tidak mencukupi.`);

                negara.kas -= totalBiaya;
                perusahaan.karyawan = (perusahaan.karyawan || 0) + jumlah;

                m.reply(`👷 *REKRUTMEN BERHASIL:* +${jumlah.toLocaleString('id-ID')} Karyawan baru dimasukkan ke ${jenis.toUpperCase()} Negara.`);
                break;
            }

            // ==============================
            // INVESTASI WARGA
            // ==============================
            case 'investasi': {
                if (!negara.investPTOpen) return m.reply('❌ Gerbang investasi BUMN ditutup sementara.');
                let jenis = args[1] ? args[1].toLowerCase() : '';
                let nominal = parseInt(args[2]);
                if (jenis !== 'pln' && jenis !== 'pdam') return m.reply(`⚠️ Format: *${usedPrefix+command} investasi pln/pdam <nominal>*`);
                if (isNaN(nominal) || nominal < 1000000000) return m.reply('⚠️ Minimal investasi 1 Miliar.');

                let perusahaan = negara[jenis];
                if (!perusahaan) return m.reply(`❌ BUMN belum dibangun!`);
                if (user.money < nominal) return m.reply(`❌ Uang tidak cukup!`);

                user.money -= nominal;
                if (!perusahaan.investasi) perusahaan.investasi = {};
                perusahaan.investasi[m.sender] = (perusahaan.investasi[m.sender] || 0) + nominal;
                perusahaan.totalInvestasi = (perusahaan.totalInvestasi || 0) + nominal;
                perusahaan.saldo += nominal;

                m.reply(`✅ Berhasil investasi ${formatRp(nominal)} ke ${jenis.toUpperCase()} Negara.`);
                break;
            }

            case 'investasiku': {
                let hasInvestasi = false;
                let txt = `📊 *PORTOFOLIO INVESTASI BUMN ANDA*\n━━━━━━━━━━━━━━━━━━━━\n`;
                for (let jenis of ['pln', 'pdam']) {
                    let p = negara[jenis];
                    if (!p || !p.investasi || !p.investasi[m.sender]) continue;
                    hasInvestasi = true;
                    let nominal = p.investasi[m.sender];
                    let totalInv = p.totalInvestasi || 1;
                    let porsi = ((nominal / totalInv) * 100).toFixed(2);
                    let estimasiBagiHasil = Math.floor(p.saldo * 0.05 * (nominal / totalInv));
                    txt += `*${jenis.toUpperCase()}* | Investasi: ${formatRp(nominal)} (${porsi}% share)\n   🎁 Est. Dividen: ~${formatRp(estimasiBagiHasil)}\n\n`;
                }
                if (!hasInvestasi) return m.reply('📊 Anda belum punya investasi BUMN.');
                m.reply(txt);
                break;
            }

            case 'tagihpln': {
                if (!isPresiden) return m.reply('❌ Khusus Presiden!');
                if (!negara.pln) return m.reply('❌ PLN belum dibangun!');
                if (negara.pln.saldo <= 0) return m.reply('⚠️ Saldo PLN kosong.');
                let saldoTotal = negara.pln.saldo;
                let totalInv = negara.pln.totalInvestasi || 0;
                let poolBagiHasil = totalInv > 0 ? Math.floor(saldoTotal * 0.05) : 0; 
                let masukKas = saldoTotal - poolBagiHasil;
                if (poolBagiHasil > 0 && negara.pln.investasi) {
                    for (let jid in negara.pln.investasi) {
                        let porsi = negara.pln.investasi[jid] / totalInv;
                        let hasilnya = Math.floor(poolBagiHasil * porsi);
                        if (hasilnya > 0 && global.db.data.users[jid]) { global.db.data.users[jid].money = (global.db.data.users[jid].money || 0) + hasilnya; }
                    }
                }
                negara.kas += masukKas;
                negara.pln.saldo = 0;
                m.reply(`⚡ Setoran PLN masuk Kas Negara: *${formatRp(masukKas)}*`);
                break;
            }

            case 'tagihpdam': {
                if (!isPresiden) return m.reply('❌ Khusus Presiden!');
                if (!negara.pdam) return m.reply('❌ PDAM belum dibangun!');
                if (negara.pdam.saldo <= 0) return m.reply('⚠️ Saldo PDAM kosong.');
                let saldoTotal = negara.pdam.saldo;
                let totalInv = negara.pdam.totalInvestasi || 0;
                let poolBagiHasil = totalInv > 0 ? Math.floor(saldoTotal * 0.05) : 0;
                let masukKas = saldoTotal - poolBagiHasil;
                if (poolBagiHasil > 0 && negara.pdam.investasi) {
                    for (let jid in negara.pdam.investasi) {
                        let porsi = negara.pdam.investasi[jid] / totalInv;
                        let hasilnya = Math.floor(poolBagiHasil * porsi);
                        if (hasilnya > 0 && global.db.data.users[jid]) { global.db.data.users[jid].money = (global.db.data.users[jid].money || 0) + hasilnya; }
                    }
                }
                negara.kas += masukKas;
                negara.pdam.saldo = 0;
                m.reply(`💧 Setoran PDAM masuk Kas Negara: *${formatRp(masukKas)}*`);
                break;
            }

            // ==============================
            // LEADERBOARD KORPORASI
            // ==============================
            case 'lb':
            case 'leaderboard': {
                let entries = [];
                for (let uid in global.db.data.users) {
                    let u = global.db.data.users[uid];
                    if (!Array.isArray(u.perusahaan)) continue;
                    u.perusahaan.forEach(pt => {
                        if (!pt) return;
                        entries.push({ nama: pt.name, pemilik: u.name || uid.split('@')[0], tipe: pt.type === 'listrik' ? '⚡ Listrik' : '🏭 Produksi', kategori: 'swasta', valuasi: hitungAset(pt), saldo: pt.saldo || 0 });
                    });
                }
                if (negara.pln) {
                    let valPln = (negara.pln.saldo || 0) + (negara.pln.pelanggan || 0) * 6500 + (negara.pln.karyawan || 0) * 5000000000;
                    entries.push({ nama: 'PLN (Negara)', pemilik: 'Negara', tipe: '⚡ Listrik Negara', kategori: 'negara', valuasi: valPln, saldo: negara.pln.saldo || 0 });
                }
                if (negara.pdam) {
                    let valPdam = (negara.pdam.saldo || 0) + (negara.pdam.pelanggan || 0) * 16000 + (negara.pdam.karyawan || 0) * 5000000000;
                    entries.push({ nama: 'PDAM (Negara)', pemilik: 'Negara', tipe: '💧 Air Negara', kategori: 'negara', valuasi: valPdam, saldo: negara.pdam.saldo || 0 });
                }
                if (!entries.length) return m.reply('📊 Belum ada perusahaan.');
                entries.sort((a, b) => b.valuasi - a.valuasi);
                let top = entries.slice(0, 10);
                let board = top.map((e, i) => `${i+1}. *${e.nama}*${e.kategori === 'negara' ? ' 🏛️' : ''}\n    👤 Owner: ${e.pemilik} | 💹 Valuasi: ~${formatSingkat(e.valuasi)}\n    💰 Kas PT: ${formatRp(e.saldo)}`).join('\n\n');
                m.reply(`📊 *LEADERBOARD PERUSAHAAN NASIONAL*\n━━━━━━━━━━━━━━━━━━━━\n${board}`);
                break;
            }

            default: {
                m.reply(`❌ Sub-perintah tidak valid. Ketik *${usedPrefix+command} info* untuk melihat daftar perintah.`);
            }
        }

    } catch (e) {
        console.error('ERROR KENEGARAAN:', e);
        m.reply(`❌ Terjadi kegagalan administrasi: ${e.message}`);
    }
};

handler.help    = ['negara'];
handler.tags    = ['rpg'];
handler.command = /^(negara|gov|pemerintah)$/i;

module.exports = handler;
