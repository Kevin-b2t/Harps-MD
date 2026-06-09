// ==========================================
// FITUR NEGARA & PEMERINTAHAN RPG
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

// Simulasi hitung aset kotor untuk keperluan razia pajak
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

        // Inisialisasi Database Negara jika belum ada
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
            };
        }

        let negara = global.db.data.negara;

        // Patch field baru untuk data lama
        if (!negara.pln && negara.pln !== null) negara.pln = null;
        if (!negara.pdam && negara.pdam !== null) negara.pdam = null;
        let now = Date.now();

        // ==========================================
        // HELPER: HITUNG PELANGGAN OTOMATIS BUMN
        // Setiap 20 menit, karyawan otomatis cari pelanggan
        // Karyawan 0: tidak aktif | 1-4: dapat 2-5 | 5+: dapat 6-9
        // Max pelanggan: 6000
        // ==========================================
        function prosesAutoBUMN(perusahaan) {
            if (!perusahaan || !perusahaan.karyawan) return;
            if (perusahaan.pelanggan >= 6000) return;
            let interval = 20 * 60 * 1000; // 20 menit
            let lastAuto = perusahaan.lastAuto || 0;
            let siklusLewat = Math.floor((now - lastAuto) / interval);
            if (siklusLewat <= 0) return;

            // Tentukan range pelanggan per siklus berdasarkan jumlah karyawan
            let karyawan = perusahaan.karyawan || 0;
            if (karyawan <= 0) return;

            let totalDapat = 0;
            for (let s = 0; s < siklusLewat; s++) {
                if (perusahaan.pelanggan + totalDapat >= 6000) break;
                let dapat;
                if (karyawan >= 5) {
                    dapat = Math.floor(Math.random() * 4) + 6; // 6–9
                } else {
                    dapat = Math.floor(Math.random() * 4) + 2; // 2–5
                }
                totalDapat += dapat;
            }
            // Clamp ke max 6000
            let sebelum = perusahaan.pelanggan;
            perusahaan.pelanggan = Math.min(6000, perusahaan.pelanggan + totalDapat);
            let aktualDapat = perusahaan.pelanggan - sebelum;
            perusahaan.lastAuto = lastAuto + siklusLewat * interval;

            // Hitung pendapatan dari pelanggan baru
            let harga = perusahaan.hargaPerWatt || perusahaan.hargaPerLiter || 0;
            perusahaan.saldo += aktualDapat * harga;
        }

        // Jalankan auto-collect untuk PLN dan PDAM setiap request masuk
        if (negara.pln) prosesAutoBUMN(negara.pln);
        if (negara.pdam) prosesAutoBUMN(negara.pdam);

        // ==========================================
        // SISTEM AUTO-CHECK 1: JABATAN PRESIDEN (7 HARI)
        // ==========================================
        if (negara.presiden && negara.waktuLantik) {
            if (now - negara.waktuLantik >= 7 * 24 * 60 * 60 * 1000) {
                let mantanPresiden = negara.presiden;
                negara.presiden = null; 
                negara.waktuLantik = 0;
                conn.reply(m.chat, `📢 *PENGUMUMAN NEGARA* 📢\nMasa jabatan @${mantanPresiden.split('@')[0]} sebagai Presiden selama 7 Hari telah habis secara konstitusi. Kursi Kepresidenan saat ini KOSONG!\n\nSilakan buka pendaftaran baru menggunakan perintah: *${usedPrefix+command} pemilu*`, m, { mentions: [mantanPresiden] });
            }
        }

        // ==========================================
        // SISTEM AUTO-CHECK 2: TIME LIMIT PEMILU (1 JAM)
        // ==========================================
        if (negara.isPemilu && negara.waktuMulaiPemilu) {
            if (now - negara.waktuMulaiPemilu >= 60 * 60 * 1000) { // Selesai dalam 1 jam
                negara.isPemilu = false;
                let kandidatList = Object.keys(negara.kandidat);
                
                if (kandidatList.length > 0) {
                    // Cari pemenang berdasarkan vote terbanyak
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
                    
                    // Reset flag warga agar bisa memilih di pemilu berikutnya
                    for (let uid in global.db.data.users) {
                        global.db.data.users[uid].hasVoted = false;
                    }
                    
                    conn.reply(m.chat, `🎉 *PEMILU BERAKHIR OTOMATIS (1 JAM)* 🎉\n\nMasa pemungutan suara telah habis. Berdasarkan suara rakyat terbanyak (${maxSuara} vote), @${pemenang.split('@')[0]} resmi dilantik menjadi *PRESIDEN BARU* untuk masa jabatan 7 hari ke depan! 👑\n\nHidup Pak Presiden!`, m, { mentions: [pemenang] });
                } else {
                    negara.kandidat = {};
                    conn.reply(m.chat, `🗳️ *PEMILU BERAKHIR OTOMATIS (1 JAM)*\n\nMasa pemilu telah habis tetapi tidak ada warga yang mendaftar sebagai calon legislatif. Kursi kepresidenan tetap kosong!`, m);
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
                let namaPresiden = negara.presiden ? (global.db.data.users[negara.presiden]?.name || negara.presiden.split('@')[0]) : 'Kosong (Belum ada)';
                let statusJabatan = '';
                if (negara.presiden && negara.waktuLantik) {
                    let sisaJabatan = (7 * 24 * 60 * 60 * 1000) - (now - negara.waktuLantik);
                    statusJabatan = `\n⏳ *Sisa Jabatan:* ${msToTime(sisaJabatan)}`;
                }

                let statusBank = negara.bank ? '🟢 Aktif (Siap Pinjam)' : '🔴 Belum Dibangun';
                let statusPemilu = negara.isPemilu ? '🟢 Sedang Berlangsung' : '🔴 Ditutup';
                if (negara.isPemilu && negara.waktuMulaiPemilu) {
                    let sisaPemilu = (60 * 60 * 1000) - (now - negara.waktuMulaiPemilu);
                    statusPemilu += `\n⏳ *Sisa Waktu Vote:* ${msToTime(sisaPemilu)}`;
                }

                let statusPLN = negara.pln ? `🟢 Aktif | ${negara.pln.pelanggan} Pelanggan | Saldo: ${formatRp(negara.pln.saldo)}` : '🔴 Belum Dibangun';
                let statusPDAM = negara.pdam ? `🟢 Aktif | ${negara.pdam.pelanggan} Pelanggan | Saldo: ${formatRp(negara.pdam.saldo)}` : '🔴 Belum Dibangun';

                let txt = ` Republic of WhatsApp - Pemerintahan RPG 🏛️\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n`;
                txt += `👑 *Presiden:* ${namaPresiden}${statusJabatan}\n`;
                txt += `💰 *Kas Negara:* ${formatRp(negara.kas)}\n`;
                txt += `🏦 *Bank Negara:* ${statusBank}\n`;
                txt += `⚡ *PLN Negara:* ${statusPLN}\n`;
                txt += `💧 *PDAM Negara:* ${statusPDAM}\n`;
                txt += `🗳️ *Status Pemilu:* ${statusPemilu}\n`;
                txt += `🏢 *Aset BUMN (Sitaan):* ${negara.bumn.length} Perusahaan\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n\n`;
                
                txt += `*📜 PERINTAH UMUM KENEGARAAN:*\n`;
                txt += `• *${usedPrefix+command} daftarcalon* — Pendaftaran capres (Biaya 10M)\n`;
                txt += `• *${usedPrefix+command} vote @tag* — Berikan hak suaramu ke calon\n`;
                txt += `• *${usedPrefix+command} pinjam <nominal>* — Pinjam dana ke Bank Negara\n`;
                txt += `• *${usedPrefix+command} bayarbank <nominal>* — Cicil/lunasi utang negara\n\n`;
                
                txt += `*👑 PERINTAH KHUSUS PRESIDEN:*\n`;
                txt += `• *${usedPrefix+command} pemilu* — Buka masa pendaftaran capres (1 Jam)\n`;
                txt += `• *${usedPrefix+command} bangunbank* — Dirikan Bank Negara (Biaya 50M dari Kas)\n`;
                txt += `• *${usedPrefix+command} bansos <nominal> @tag* — Kirim BLT dari Kas Negara\n`;
                txt += `• *${usedPrefix+command} razia* — Tarik pajak paksa & sita PT nunggak\n`;
                txt += `• *${usedPrefix+command} bangunpln* — Dirikan PLN Negara (Biaya 865M)\n`;
                txt += `• *${usedPrefix+command} bangunpdam* — Dirikan PDAM Negara (Biaya 865M)\n`;
                txt += `• *${usedPrefix+command} rekrut pln/pdam <jml>* — Rekrut karyawan (5M/org)\n\n`;

                txt += `*⚡ PERINTAH BUMN NEGARA:*\n`;
                txt += `• *${usedPrefix+command} investasi pln/pdam <nominal>* — Investasi ke BUMN\n`;
                txt += `• *${usedPrefix+command} investasiku* — Cek portofolio investasi kamu\n`;
                txt += `• *${usedPrefix+command} tagihpln* — Tarik pendapatan PLN ke Kas Negara\n`;
                txt += `• *${usedPrefix+command} tagihpdam* — Tarik pendapatan PDAM ke Kas Negara\n`;
                txt += `• *${usedPrefix+command} statuspln* — Lihat detail perusahaan PLN\n`;
                txt += `• *${usedPrefix+command} statuspdam* — Lihat detail perusahaan PDAM`;

                return m.reply(txt);
            }

            // ==============================
            // CORE PEMILU: PENGATURAN & REGISTRASI
            // ==============================
            case 'pemilu': {
                if (!m.isGroup) return m.reply('❌ Aktivitas politik pemilu hanya bisa dijalankan di dalam grup!');
                if (!isPresiden && !m.isGroup) return m.reply('❌ Hanya Presiden aktif atau Admin grup yang bisa membuka pesta pemilu.');
                
                if (negara.isPemilu) {
                    // Penutupan manual paksa
                    negara.isPemilu = false;
                    m.reply(`🗳️ *MASA PEMILU DITUTUP MANUAL!*\nSilakan sahkan pemenang sekarang dengan perintah: *${usedPrefix+command} sahkan*`);
                } else {
                    negara.isPemilu = true;
                    negara.waktuMulaiPemilu = Date.now();
                    negara.kandidat = {}; 
                    m.reply(`🗳️ *GERBANG PEMILU RESMI DIBUKA!*\nBagi para sultan yang berminat memimpin negara, silakan gunakan perintah *${usedPrefix+command} daftarcalon*.\n\n_Masa pemungutan suara akan ditutup otomatis oleh sistem dalam 1 Jam!_`);
                }
                break;
            }

            case 'daftarcalon': {
                if (!negara.isPemilu) return m.reply('❌ Pendaftaran belum dibuka! Silakan tunggu masa pemilu dimulai.');
                if (negara.kandidat[m.sender] !== undefined) return m.reply('❌ Anda sudah terdaftar di lembar bursa calon presiden!');
                if (user.money < 10000000000) return m.reply('❌ Uang pribadi Anda kurang! Butuh dana kampanye sebesar Rp 10.000.000.000 (10 Miliar).');
                
                user.money -= 10000000000;
                negara.kas += 10000000000; // Pajak pendaftaran masuk ke kas negara
                negara.kandidat[m.sender] = 0; // Inisialisasi 0 suara
                
                m.reply(`✅ *PENDAFTARAN CAPRES DITERIMA!*\n@${m.sender.split('@')[0]} resmi menjadi kandidat pemimpin. Uang pendaftaran 10M masuk ke Kas Negara.\n\nAjak rakyat untuk memberikan suara dengan cara:\n*${usedPrefix+command} vote @${m.sender.split('@')[0]}*`, null, { mentions: [m.sender] });
                break;
            }

            case 'vote': {
                if (!negara.isPemilu) return m.reply('❌ TPS belum dibuka! Tidak sedang ada agenda pemilu.');
                let targetMention = args[1];
                if (!targetMention) return m.reply(`⚠️ Format salah! Gunakan: *${usedPrefix+command} vote @tag_calon*`);
                
                let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                if (negara.kandidat[target] === undefined) return m.reply('❌ Orang tersebut tidak terdaftar di lembar kandidat pemilu!');
                if (user.hasVoted) return m.reply('❌ Anda sudah menyoblos suara pada periode pemilu kali ini!');

                user.hasVoted = true;
                negara.kandidat[target] += 1;
                m.reply(`🗳️ Satu suara sah berhasil diberikan kepada calon pemimpin kita @${target.split('@')[0]}!`, null, { mentions: [target] });
                break;
            }

            case 'sahkan': {
                if (negara.isPemilu) return m.reply('❌ Masa pemilu masih berjalan aktif. Harap tunggu hingga waktu 1 jam habis atau tutup manual lewat perintah pemilu.');
                let kandidatList = Object.keys(negara.kandidat);
                if (kandidatList.length === 0) return m.reply('❌ Tidak ada kandidat yang terdaftar untuk disahkan.');

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
                
                for (let uid in global.db.data.users) {
                    global.db.data.users[uid].hasVoted = false;
                }

                m.reply(`🎉 *PENGESAHAN MAJELIS SELESAI* 🎉\n\nDengan kemenangan mutlak ${maxSuara} suara, @${pemenang.split('@')[0]} resmi menduduki kursi *PRESIDEN BARU*!\nHidup pemimpin baru kita!`, null, { mentions: [pemenang] });
                break;
            }

            // ==============================
            // OPERASIONAL KEUANGAN & BANSOS
            // ==============================
            case 'bangunbank': {
                if (!isPresiden) return m.reply('❌ Hak eksklusif ini hanya dimiliki oleh Presiden aktif!');
                if (negara.bank) return m.reply('❌ Infrastruktur Bank Negara sudah berdiri megah!');
                
                let biayaBank = 50000000000; // 50 Miliar
                if (negara.kas < biayaBank) return m.reply(`❌ Kas Negara menipis! Butuh dana ${formatRp(biayaBank)} dari kas untuk pembangunan.\nTarik pajak paksa terlebih dahulu dengan perintah *${usedPrefix+command} razia*.`);

                negara.kas -= biayaBank;
                negara.bank = true;
                m.reply(`🏦 *BANK SENTRAL NEGARA RESMI DIBANGUN!*\nRakyat sekarang dibolehkan mengajukan pinjaman modal usaha via perintah *${usedPrefix+command} pinjam <nominal>*\n\nBiaya konstruksi: -${formatRp(biayaBank)} dari Kas Negara.`);
                break;
            }

            case 'bansos': {
                if (!isPresiden) return m.reply('❌ Distribusi dana anggaran sosial hanya bisa dicairkan oleh Presiden!');
                let nominal = parseInt(args[1]);
                let targetMention = args[2];
                if (isNaN(nominal) || !targetMention) return m.reply(`⚠️ Format salah! Gunakan: *${usedPrefix+command} bansos <nominal> <@tag>*`);
                if (negara.kas < nominal) return m.reply(`❌ Kas Negara defisit! Dana saat ini tidak mencukupi untuk membagi BLT sebesar ${formatRp(nominal)}.`);

                let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                let targetUser = global.db.data.users[target];
                if (!targetUser) return m.reply('❌ Data warga tersebut tidak ditemukan di sensus database!');

                negara.kas -= nominal;
                if (targetUser.money === undefined) targetUser.money = 0;
                targetUser.money += nominal;

                m.reply(`🎁 *BANSOS PEMERINTAH CAIR!*\n\nPresiden telah mendistribusikan Bantuan Langsung Tunai sebesar *${formatRp(nominal)}* kepada @${target.split('@')[0]}!\nDana sukses ditarik dari rekening Kas Negara.`, null, { mentions: [target] });
                break;
            }

            case 'pinjam': {
                if (!negara.bank) return m.reply('❌ Akses diblokir! Bank Negara belum didirikan oleh Presiden.');
                let nominal = parseInt(args[1]);
                if (isNaN(nominal) || nominal < 1000000) return m.reply(`⚠️ Format salah! Minimal nominal pengajuan pinjaman adalah Rp 1.000.000`);
                if (negara.kas < nominal) return m.reply(`❌ Brankas Bank Negara kosong! Likuiditas kas tidak cukup untuk meminjamkan ${formatRp(nominal)}.`);
                if (user.hutangNegara > 5000000000) return m.reply(`❌ Pengajuan ditolak! Anda memiliki tunggakan hutang kenegaraan terlalu besar. Harap cicil terlebih dahulu.`);

                // Beban bunga pinjaman 10%
                let totalHutangBaru = nominal + Math.floor(nominal * 0.1);
                
                negara.kas -= nominal;
                user.money += nominal;
                user.hutangNegara += totalHutangBaru;

                m.reply(`🏦 *DANA PINJAMAN KENEGARAAN CAIR*\n\nUang sebesar ${formatRp(nominal)} ditransfer ke dompet Anda (Bunga Flat 10%).\nTotal tanggungan hutang Anda ke Negara menjadi: *${formatRp(user.hutangNegara)}*.\n\nLunasi berkala melalui: *${usedPrefix+command} bayarbank <nominal>*`);
                break;
            }

            case 'bayarbank': {
                if (user.hutangNegara <= 0) return m.reply('✅ Catatan bersih! Anda tidak terdaftar memiliki hutang ke Bank Negara.');
                let nominal = parseInt(args[1]);
                if (isNaN(nominal)) return m.reply(`⚠️ Format salah! Gunakan: *${usedPrefix+command} bayarbank <nominal>*`);
                
                if (nominal > user.hutangNegara) nominal = user.hutangNegara;
                if (user.money < nominal) return m.reply(`❌ Transaksi gagal! Dompet pribadi Anda tidak cukup uang.`);

                user.money -= nominal;
                user.hutangNegara -= nominal;
                negara.kas += nominal;

                m.reply(`✅ *SETORAN HUTANG NEGARA BERHASIL*\n\nAnda membayar cicilan sebesar ${formatRp(nominal)}.\nSisa tanggungan hutang Anda: *${formatRp(user.hutangNegara)}*.\nDana sukses dialokasikan kembali ke Kas Negara.`);
                break;
            }

            // ==============================
            // SISTEM PAJAK EKSTREM & PENYITAAN PERUSAHAAN
            // ==============================
            case 'razia': {
                if (!isPresiden) return m.reply('❌ Eksekusi razia kepatuhan pajak korporasi mutlak hanya wewenang Presiden!');
                let totalPajakDitarik = 0;
                let ptTerkunci = 0;
                let ptDisita = 0;
                let nowTs = Date.now();

                let allUsers = global.db.data.users;
                for (let uid in allUsers) {
                    let u = allUsers[uid];
                    if (!Array.isArray(u.perusahaan)) continue;

                    // Menggunakan reverse loop untuk menghindari masalah indeks array tergeser saat proses splice (penyitaan)
                    for (let i = u.perusahaan.length - 1; i >= 0; i--) {
                        let pt = u.perusahaan[i];
                        if (!pt) continue;

                        if (!pt.lastTaxCheck) pt.lastTaxCheck = pt.lastTax || nowTs;
                        if (!pt.hariNunggak) pt.hariNunggak = 0;

                        let daysPassed = Math.floor((nowTs - pt.lastTaxCheck) / 86400000); 
                        if (daysPassed >= 1) {
                            // Besaran tarif pajak harian = 0.2% dari taksiran aset kotor
                            let tagihanPajak = Math.floor(hitungAset(pt) * 0.002 * daysPassed);
                            
                            if ((pt.saldo || 0) >= tagihanPajak) {
                                // SKENARIO A: Pembayaran Pajak Lancar (Saldo PT mencukupi)
                                pt.saldo -= tagihanPajak;
                                totalPajakDitarik += tagihanPajak;
                                pt.lastTaxCheck = nowTs;
                                pt.hariNunggak = 0;
                                pt.isLocked = false;
                            } else {
                                // SKENARIO B: Kas PT Kosong / Nunggak Pajak
                                pt.hariNunggak += daysPassed;
                                pt.lastTaxCheck = nowTs;

                                // EKSEKUSI HUKUMAN NEGARA
                                if (pt.hariNunggak >= 4) {
                                    // SITA PERUSAHAAN (4 Hari Nunggak)
                                    pt.name = `[BUMN] ${pt.name}`; 
                                    pt.isLocked = true;
                                    pt.ownerLama = uid;
                                    
                                    negara.bumn.push(pt); // Masuk ke aset negara
                                    u.perusahaan.splice(i, 1); // Cabut paksa hak milik dari user
                                    ptDisita++;
                                } else if (pt.hariNunggak >= 3) {
                                    // KUNCI PERUSAHAAN (3 Hari Nunggak)
                                    pt.isLocked = true;
                                    ptTerkunci++;
                                }
                            }
                        }
                    }
                }

                negara.kas += totalPajakDitarik;

                let txt = `🚨 *RAZIA PAJAK NASIONAL RAMBUNG* 🚨\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n`;
                txt += `💸 *Total Setoran Pajak Masuk:* ${formatRp(totalPajakDitarik)}\n`;
                txt += `🔒 *PT Dibekukan/Dikunci (Nunggak 3 Hari):* ${ptTerkunci} Perusahaan\n`;
                txt += `🏢 *PT Disita Hak Milik (Nunggak 4 Hari):* ${ptDisita} Perusahaan (Disita BUMN)\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n\n`;
                txt += `_Himbauan bagi para pelaku usaha yang perusahaannya terkunci, harap segera lakukan penyetoran modal ke Kas PT agar bisa diproses normal kembali pada siklus razia pajak berikutnya!_`;

                m.reply(txt);
                break;
            }

            // ==============================
            // BUMN: BANGUN PLN & PDAM
            // ==============================
            case 'bangunpln': {
                if (!isPresiden) return m.reply('❌ Hanya Presiden yang berhak mendirikan perusahaan negara!');
                if (negara.pln) return m.reply('❌ PLN Negara sudah berdiri! Tidak perlu dibangun ulang.');
                let biaya = 865000000000; // 865 Miliar
                if (negara.kas < biaya) return m.reply(`❌ Kas Negara tidak cukup! Butuh *${formatRp(biaya)}* untuk membangun PLN.\nKas saat ini: ${formatRp(negara.kas)}`);

                negara.kas -= biaya;
                negara.pln = {
                    pelanggan: 0,
                    saldo: 0,
                    hargaPerWatt: 6500,
                    karyawan: 0,
                    lastAuto: Date.now(),
                    investasi: {}, // { jid: nominalInvestasi }
                    totalInvestasi: 0,
                };
                m.reply(`⚡ *PLN NEGARA RESMI BERDIRI!*\n━━━━━━━━━━━━━━━━━━━━\n🏗️ Biaya Pembangunan: -${formatRp(biaya)}\n💡 Harga Listrik: Rp 6.500/watt\n👷 Karyawan: 0\n👥 Pelanggan: 0\n\nRekrut karyawan dulu agar pelanggan otomatis bertambah:\n*${usedPrefix+command} rekrut pln <jumlah>*`);
                break;
            }

            case 'bangunpdam': {
                if (!isPresiden) return m.reply('❌ Hanya Presiden yang berhak mendirikan perusahaan negara!');
                if (negara.pdam) return m.reply('❌ PDAM Negara sudah berdiri! Tidak perlu dibangun ulang.');
                let biaya = 865000000000; // 865 Miliar
                if (negara.kas < biaya) return m.reply(`❌ Kas Negara tidak cukup! Butuh *${formatRp(biaya)}* untuk membangun PDAM.\nKas saat ini: ${formatRp(negara.kas)}`);

                negara.kas -= biaya;
                negara.pdam = {
                    pelanggan: 0,
                    saldo: 0,
                    hargaPerLiter: 16000,
                    karyawan: 0,
                    lastAuto: Date.now(),
                    investasi: {},
                    totalInvestasi: 0,
                };
                m.reply(`💧 *PDAM NEGARA RESMI BERDIRI!*\n━━━━━━━━━━━━━━━━━━━━\n🏗️ Biaya Pembangunan: -${formatRp(biaya)}\n🚰 Harga Air: Rp 16.000/liter\n👷 Karyawan: 0\n👥 Pelanggan: 0\n\nRekrut karyawan dulu agar pelanggan otomatis bertambah:\n*${usedPrefix+command} rekrut pdam <jumlah>*`);
                break;
            }

            // ==============================
            // BUMN: REKRUT KARYAWAN (Presiden)
            // Biaya 5M/karyawan dari Kas Negara
            // ==============================
            case 'rekrut': {
                if (!isPresiden) return m.reply('❌ Hanya Presiden yang berhak merekrut karyawan BUMN!');
                let jenis = args[1] ? args[1].toLowerCase() : '';
                let jumlah = parseInt(args[2]) || 1;
                if (jenis !== 'pln' && jenis !== 'pdam') return m.reply(`⚠️ Format: *${usedPrefix+command} rekrut pln <jumlah>* atau *rekrut pdam <jumlah>*`);

                let perusahaan = negara[jenis];
                if (!perusahaan) return m.reply(`❌ ${jenis.toUpperCase()} belum dibangun!`);
                if (jumlah < 1 || jumlah > 100) return m.reply('⚠️ Jumlah rekrut harus antara 1–100 orang.');

                let biayaPerOrang = 5000000000; // 5 Miliar/karyawan
                let totalBiaya = biayaPerOrang * jumlah;
                if (negara.kas < totalBiaya) return m.reply(`❌ Kas Negara tidak cukup!\nButuh: *${formatRp(totalBiaya)}*\nKas saat ini: ${formatRp(negara.kas)}`);

                negara.kas -= totalBiaya;
                perusahaan.karyawan = (perusahaan.karyawan || 0) + jumlah;

                let rangeInfo = perusahaan.karyawan >= 5 ? '6–9 pelanggan/20 menit' : '2–5 pelanggan/20 menit';
                let emoji = jenis === 'pln' ? '⚡' : '💧';
                m.reply(`${emoji} *REKRUTMEN ${jenis.toUpperCase()} BERHASIL!*\n━━━━━━━━━━━━━━━━━━━━\n👷 Karyawan Baru: +${jumlah} orang\n👷 Total Karyawan: *${perusahaan.karyawan} orang*\n💸 Biaya: -${formatRp(totalBiaya)}\n📈 Produktivitas: *${rangeInfo}*\n\n_Karyawan langsung bekerja otomatis setiap 20 menit!_`);
                break;
            }

            // ==============================
            // BUMN: INVESTASI WARGA (Siapapun bisa)
            // Investasi ke PLN/PDAM, dapat bagi hasil 5% saldo saat tagih
            // ==============================
            case 'investasi': {
                let jenis = args[1] ? args[1].toLowerCase() : '';
                let nominal = parseInt(args[2]);
                if (jenis !== 'pln' && jenis !== 'pdam') return m.reply(`⚠️ Format: *${usedPrefix+command} investasi pln <nominal>* atau *investasi pdam <nominal>*`);
                if (isNaN(nominal) || nominal < 1000000000) return m.reply('⚠️ Minimal investasi Rp 1.000.000.000 (1 Miliar).');

                let perusahaan = negara[jenis];
                if (!perusahaan) return m.reply(`❌ ${jenis.toUpperCase()} Negara belum dibangun! Belum bisa menerima investasi.`);
                if (user.money < nominal) return m.reply(`❌ Uang Anda tidak cukup! Saldo: ${formatRp(user.money)}`);

                user.money -= nominal;
                if (!perusahaan.investasi) perusahaan.investasi = {};
                perusahaan.investasi[m.sender] = (perusahaan.investasi[m.sender] || 0) + nominal;
                perusahaan.totalInvestasi = (perusahaan.totalInvestasi || 0) + nominal;
                // Investasi langsung masuk saldo BUMN sebagai modal
                perusahaan.saldo += nominal;

                let emoji = jenis === 'pln' ? '⚡' : '💧';
                let namaP = jenis === 'pln' ? 'PLN' : 'PDAM';
                m.reply(`${emoji} *INVESTASI ${namaP} BERHASIL!*\n━━━━━━━━━━━━━━━━━━━━\n💰 Nominal Investasi: *${formatRp(nominal)}*\n📊 Total Investasi Anda: *${formatRp(perusahaan.investasi[m.sender])}*\n🏦 Total Investasi Masuk: *${formatRp(perusahaan.totalInvestasi)}*\n\n_Saat Presiden menagih, investor mendapat bagi hasil 5% dari saldo ${namaP}!_\n_Cek portofolio: *${usedPrefix+command} investasiku*_`);
                break;
            }

            // ==============================
            // BUMN: CEK INVESTASI MILIK SENDIRI
            // ==============================
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
                    let emoji = jenis === 'pln' ? '⚡' : '💧';
                    let estimasiBagiHasil = Math.floor(p.saldo * 0.05 * (nominal / totalInv));
                    txt += `${emoji} *${jenis.toUpperCase()}*\n`;
                    txt += `   💵 Investasi Anda: ${formatRp(nominal)}\n`;
                    txt += `   📈 Porsi Kepemilikan: ${porsi}%\n`;
                    txt += `   🎁 Est. Bagi Hasil: ~${formatRp(estimasiBagiHasil)}\n\n`;
                }
                if (!hasInvestasi) return m.reply('📊 Anda belum memiliki investasi di BUMN Negara manapun.');
                txt += `_Bagi hasil diterima otomatis saat Presiden menjalankan tagihpln/tagihpdam_`;
                m.reply(txt);
                break;
            }

            // ==============================
            // BUMN: TARIK PENDAPATAN KE KAS NEGARA
            // ==============================
            case 'tagihpln': {
                if (!isPresiden) return m.reply('❌ Hanya Presiden yang berhak menarik pendapatan BUMN ke Kas Negara!');
                if (!negara.pln) return m.reply('❌ PLN Negara belum dibangun!');
                if (negara.pln.saldo <= 0) return m.reply('⚠️ Saldo PLN masih kosong. Tunggu karyawan bekerja atau tambah investasi dulu.');

                let saldoTotal = negara.pln.saldo;
                let totalInv = negara.pln.totalInvestasi || 0;
                let poolBagiHasil = totalInv > 0 ? Math.floor(saldoTotal * 0.05) : 0; // 5% untuk investor
                let masukKas = saldoTotal - poolBagiHasil;
                let jumlahInvestor = 0;

                // Distribusi bagi hasil ke investor
                if (poolBagiHasil > 0 && negara.pln.investasi) {
                    for (let jid in negara.pln.investasi) {
                        let porsi = negara.pln.investasi[jid] / totalInv;
                        let hasilnya = Math.floor(poolBagiHasil * porsi);
                        if (hasilnya > 0 && global.db.data.users[jid]) {
                            global.db.data.users[jid].money = (global.db.data.users[jid].money || 0) + hasilnya;
                            jumlahInvestor++;
                        }
                    }
                }

                negara.kas += masukKas;
                negara.pln.saldo = 0;
                m.reply(`⚡ *SETORAN PLN KE KAS NEGARA*\n━━━━━━━━━━━━━━━━━━━━\n💰 Total Saldo PLN: *${formatRp(saldoTotal)}*\n🎁 Bagi Hasil Investor (5%): *${formatRp(poolBagiHasil)}* → ${jumlahInvestor} investor\n💸 Masuk Kas Negara: *${formatRp(masukKas)}*\n👥 Total Pelanggan: ${negara.pln.pelanggan} orang\n💰 Kas Negara Sekarang: *${formatRp(negara.kas)}*`);
                break;
            }

            case 'tagihpdam': {
                if (!isPresiden) return m.reply('❌ Hanya Presiden yang berhak menarik pendapatan BUMN ke Kas Negara!');
                if (!negara.pdam) return m.reply('❌ PDAM Negara belum dibangun!');
                if (negara.pdam.saldo <= 0) return m.reply('⚠️ Saldo PDAM masih kosong. Tunggu karyawan bekerja atau tambah investasi dulu.');

                let saldoTotal = negara.pdam.saldo;
                let totalInv = negara.pdam.totalInvestasi || 0;
                let poolBagiHasil = totalInv > 0 ? Math.floor(saldoTotal * 0.05) : 0;
                let masukKas = saldoTotal - poolBagiHasil;
                let jumlahInvestor = 0;

                if (poolBagiHasil > 0 && negara.pdam.investasi) {
                    for (let jid in negara.pdam.investasi) {
                        let porsi = negara.pdam.investasi[jid] / totalInv;
                        let hasilnya = Math.floor(poolBagiHasil * porsi);
                        if (hasilnya > 0 && global.db.data.users[jid]) {
                            global.db.data.users[jid].money = (global.db.data.users[jid].money || 0) + hasilnya;
                            jumlahInvestor++;
                        }
                    }
                }

                negara.kas += masukKas;
                negara.pdam.saldo = 0;
                m.reply(`💧 *SETORAN PDAM KE KAS NEGARA*\n━━━━━━━━━━━━━━━━━━━━\n💰 Total Saldo PDAM: *${formatRp(saldoTotal)}*\n🎁 Bagi Hasil Investor (5%): *${formatRp(poolBagiHasil)}* → ${jumlahInvestor} investor\n💸 Masuk Kas Negara: *${formatRp(masukKas)}*\n👥 Total Pelanggan: ${negara.pdam.pelanggan} orang\n💰 Kas Negara Sekarang: *${formatRp(negara.kas)}*`);
                break;
            }

            // ==============================
            // BUMN: STATUS DETAIL
            // ==============================
            case 'statuspln': {
                if (!negara.pln) return m.reply('❌ PLN Negara belum dibangun. Presiden bisa mendirikannya dengan *' + usedPrefix + command + ' bangunpln*');
                let p = negara.pln;
                let karyawan = p.karyawan || 0;
                let rangeInfo = karyawan === 0 ? 'Tidak aktif (0 karyawan)' : karyawan >= 5 ? '6–9 pelanggan/20 menit' : '2–5 pelanggan/20 menit';
                let nextAuto = p.lastAuto ? Math.max(0, (p.lastAuto + 20*60*1000) - now) : 0;
                let nextTxt = karyawan > 0 ? (nextAuto > 0 ? msToTime(nextAuto) : 'Sebentar lagi!') : 'Rekrut karyawan dulu';
                let persenPenuh = ((p.pelanggan / 6000) * 100).toFixed(1);
                let txt = `⚡ *STATUS PLN NEGARA*\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n`;
                txt += `🏢 Perusahaan Listrik Negara (PLN)\n`;
                txt += `👷 Karyawan: *${karyawan} orang*\n`;
                txt += `👥 Pelanggan: *${p.pelanggan}/6.000* (${persenPenuh}% penuh)\n`;
                txt += `📈 Produktivitas: *${rangeInfo}*\n`;
                txt += `⏱️ Auto-collect berikutnya: *${nextTxt}*\n`;
                txt += `💡 Tarif: *${formatRp(p.hargaPerWatt)}/watt*\n`;
                txt += `💰 Saldo Terkumpul: *${formatRp(p.saldo)}*\n`;
                txt += `🏦 Total Investasi Masuk: *${formatRp(p.totalInvestasi || 0)}*\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n`;
                txt += `• *${usedPrefix+command} rekrut pln <jml>* — Tambah karyawan (5M/org)\n`;
                txt += `• *${usedPrefix+command} investasi pln <nominal>* — Investasikan uang\n`;
                txt += `• *${usedPrefix+command} tagihpln* — Setor pendapatan ke Kas`;
                m.reply(txt);
                break;
            }

            case 'statuspdam': {
                if (!negara.pdam) return m.reply('❌ PDAM Negara belum dibangun. Presiden bisa mendirikannya dengan *' + usedPrefix + command + ' bangunpdam*');
                let p = negara.pdam;
                let karyawan = p.karyawan || 0;
                let rangeInfo = karyawan === 0 ? 'Tidak aktif (0 karyawan)' : karyawan >= 5 ? '6–9 pelanggan/20 menit' : '2–5 pelanggan/20 menit';
                let nextAuto = p.lastAuto ? Math.max(0, (p.lastAuto + 20*60*1000) - now) : 0;
                let nextTxt = karyawan > 0 ? (nextAuto > 0 ? msToTime(nextAuto) : 'Sebentar lagi!') : 'Rekrut karyawan dulu';
                let persenPenuh = ((p.pelanggan / 6000) * 100).toFixed(1);
                let txt = `💧 *STATUS PDAM NEGARA*\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n`;
                txt += `🏢 Perusahaan Daerah Air Minum (PDAM)\n`;
                txt += `👷 Karyawan: *${karyawan} orang*\n`;
                txt += `👥 Pelanggan: *${p.pelanggan}/6.000* (${persenPenuh}% penuh)\n`;
                txt += `📈 Produktivitas: *${rangeInfo}*\n`;
                txt += `⏱️ Auto-collect berikutnya: *${nextTxt}*\n`;
                txt += `🚰 Tarif: *${formatRp(p.hargaPerLiter)}/liter*\n`;
                txt += `💰 Saldo Terkumpul: *${formatRp(p.saldo)}*\n`;
                txt += `🏦 Total Investasi Masuk: *${formatRp(p.totalInvestasi || 0)}*\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n`;
                txt += `• *${usedPrefix+command} rekrut pdam <jml>* — Tambah karyawan (5M/org)\n`;
                txt += `• *${usedPrefix+command} investasi pdam <nominal>* — Investasikan uang\n`;
                txt += `• *${usedPrefix+command} tagihpdam* — Setor pendapatan ke Kas`;
                m.reply(txt);
                break;
            }

            default: {
                m.reply(`❌ Perintah tidak valid. Silakan ketik *${usedPrefix+command} info* untuk membuka lembar informasi kenegaraan.`);
            }
        }

    } catch (e) {
        console.error('ERROR KENEGARAAN:', e);
        m.reply(`❌ *Terjadi kegagalan sistem administrasi negara!* \nLog Error: ${e.message}`);
    }
};

handler.help    = ['negara'];
handler.tags    = ['rpg'];
handler.command = /^(negara|gov|pemerintah)$/i;

module.exports = handler;
