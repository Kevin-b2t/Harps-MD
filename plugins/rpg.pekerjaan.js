// ==========================================
// FITUR PEKERJAAN RPG (UPDATED & COMPLEX)
// ==========================================

function formatRp(n) { return 'Rp ' + (n || 0).toLocaleString('id-ID'); }
function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    let str = '';
    if (hours > 0) str += hours + " Jam ";
    if (minutes > 0) str += minutes + " Menit ";
    if (seconds > 0) str += seconds + " Detik";
    return str.trim() || "Kurang dari 1 detik";
}
function capitalizeFirstLetter(str) {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// Database Pekerjaan Terpusat
const jobs = {
    'petani': { level: 1, minPay: 8000, maxPay: 15000, exp: 500, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🌾' },
    'nelayan': { level: 1, minPay: 9000, maxPay: 16000, exp: 550, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🎣' },
    'peternak': { level: 1, minPay: 10000, maxPay: 18000, exp: 600, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🐄' },
    'gojek': { level: 10, minPay: 15000, maxPay: 30000, exp: 1000, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🛵' },
    'kurir': { level: 10, minPay: 14000, maxPay: 28000, exp: 900, thumb: 'https://telegra.ph/file/64d8e80ee172257f1b8ca.jpg', icon: '📦' },
    'sopir': { level: 10, minPay: 20000, maxPay: 35000, exp: 1100, thumb: 'https://telegra.ph/file/57f5f98cae56774fc398b.jpg', icon: '🚘' },
    'satpam': { level: 10, minPay: 18000, maxPay: 32000, exp: 1050, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '👮‍♂️' },
    'barista': { level: 10, minPay: 17000, maxPay: 30000, exp: 1000, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '☕' },
    'koki': { level: 10, minPay: 25000, maxPay: 40000, exp: 1200, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '👨‍🍳' },
    'penambang': { level: 10, minPay: 22000, maxPay: 45000, exp: 1300, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '⛏️' },
    'karyawan indomaret': { level: 20, minPay: 30000, maxPay: 50000, exp: 2000, thumb: 'https://telegra.ph/file/59ccf16e7d753698b674b.jpg', icon: '🏪' },
    'hunter': { level: 20, minPay: 35000, maxPay: 60000, exp: 2200, thumb: 'https://telegra.ph/file/2ba7ade78cbd36e3f35a4.jpg', icon: '🏹' },
    'mekanik': { level: 20, minPay: 32000, maxPay: 55000, exp: 2100, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🔧' },
    'streamer': { level: 20, minPay: 40000, maxPay: 70000, exp: 2500, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🎮' },
    'fotografer': { level: 20, minPay: 38000, maxPay: 65000, exp: 2300, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '📷' },
    'kantoran': { level: 30, minPay: 50000, maxPay: 90000, exp: 3000, thumb: 'https://telegra.ph/file/1b2398b334d1cc7a74cb0.jpg', icon: '💼' },
    'pemain sepak bola': { level: 30, minPay: 80000, maxPay: 150000, exp: 4000, thumb: 'https://telegra.ph/file/5a72645b7cd852b87493d.jpg', icon: '⚽' },
    'dj': { level: 30, minPay: 60000, maxPay: 110000, exp: 3500, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🎧' },
    'desainer': { level: 30, minPay: 55000, maxPay: 100000, exp: 3200, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🎨' },
    'guru': { level: 30, minPay: 45000, maxPay: 85000, exp: 3100, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '📚' },
    'youtuber': { level: 30, minPay: 70000, maxPay: 130000, exp: 3800, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '▶️' },
    'frontend developer': { level: 40, minPay: 100000, maxPay: 180000, exp: 5000, thumb: 'https://telegra.ph/file/3b28a547ba457c1681544.jpg', icon: '💻' },
    'web developer': { level: 40, minPay: 110000, maxPay: 190000, exp: 5200, thumb: 'https://telegra.ph/file/dae4c03250e6c43e92a72.jpg', icon: '🌐' },
    'backend developer': { level: 40, minPay: 130000, maxPay: 220000, exp: 5500, thumb: 'https://telegra.ph/file/ccc87e4468bf754d312cb.jpg', icon: '⚙️' },
    'game developer': { level: 40, minPay: 150000, maxPay: 250000, exp: 6000, thumb: 'https://telegra.ph/file/e621f007affe38df8e748.jpg', icon: '👾' },
    'trader': { level: 40, minPay: 50000, maxPay: 500000, exp: 4500, thumb: 'https://telegra.ph/file/ed5c581836d61c70298bd.jpg', icon: '📈' },
    'idol': { level: 40, minPay: 140000, maxPay: 240000, exp: 5800, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🎤' },
    'fullstack developer': { level: 50, minPay: 200000, maxPay: 350000, exp: 8000, thumb: 'https://telegra.ph/file/1c8111cef2063b9db5d66.jpg', icon: '🚀' },
    'dokter': { level: 50, minPay: 250000, maxPay: 400000, exp: 8500, thumb: 'https://telegra.ph/file/951334d75d222eb7fa1b3.jpg', icon: '🩺' },
    'pembunuh bayaran': { level: 50, minPay: 300000, maxPay: 500000, exp: 9000, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🗡️' },
    'pemburu manusia': { level: 50, minPay: 280000, maxPay: 480000, exp: 8800, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🕵️‍♂️' },
    'ksatria': { level: 50, minPay: 220000, maxPay: 380000, exp: 8200, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🛡️' },
    'astronot': { level: 70, minPay: 500000, maxPay: 800000, exp: 12000, thumb: 'https://telegra.ph/file/1bb2e5ff8e3b434b379dc.jpg', icon: '🚀' },
    'polisi': { level: 100, minPay: 800000, maxPay: 1200000, exp: 15000, thumb: 'https://telegra.ph/file/d34aa031a8035e13b5bbb.jpg', icon: '🚓' }
};

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    try {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply('❌ Data user tidak ditemukan!');
        
        // Inisialisasi Data Pekerjaan User
        if (user.job === undefined || user.job === '-') user.job = 'Pengangguran';
        if (user.jobexp === undefined) user.jobexp = 0;
        if (user.pekerjaansatu === undefined) user.pekerjaansatu = 0;

        // Inisialisasi Database Negara untuk Pajak
        if (!global.db.data.negara) {
            global.db.data.negara = { kas: 100000000000 };
        }
        let negara = global.db.data.negara;

        let action = command.toLowerCase();

        switch (action) {
            // ==============================
            // MELIHAT INFO PEKERJAAN (.job)
            // ==============================
            case 'job': {
                if (user.job === 'Pengangguran') return m.reply(`❌ Kamu belum bekerja. Ketik *${usedPrefix}lamarkerja* untuk mencari lowongan.`);
                
                let jobData = jobs[user.job];
                if (!jobData) return m.reply('❌ Pekerjaanmu tidak valid, silakan resign dan lamar ulang.');

                let cap = `🏢 *KARTU IDENTITAS PEKERJA* 🏢\n`;
                cap += `━━━━━━━━━━━━━━━━━━━━\n`;
                cap += `👤 *Pekerja:* @${m.sender.split('@')[0]}\n`;
                cap += `💼 *Profesi:* ${jobData.icon} ${capitalizeFirstLetter(user.job)}\n`;
                cap += `📊 *Level Profesi:* ${jobData.level}\n`;
                cap += `💵 *Estimasi Gaji:* ${formatRp(jobData.minPay)} - ${formatRp(jobData.maxPay)}\n`;
                cap += `⭐ *Tingkat Kinerja:* ${user.jobexp}% / 500%\n`;
                cap += `━━━━━━━━━━━━━━━━━━━━\n`;
                cap += `_Ketik *${usedPrefix}kerja* untuk mulai mencari uang._\n`;
                cap += `_Ketik *${usedPrefix}resign* jika ingin keluar dari pekerjaan ini._`;

                return conn.sendFile(m.chat, jobData.thumb, 'job.jpg', cap, m, false, { mentions: [m.sender] });
            }

            // ==============================
            // MELAMAR PEKERJAAN (.lamarkerja)
            // ==============================
            case 'lamarkerja': {
                if (user.job !== 'Pengangguran') return m.reply(`❌ Kamu sudah bekerja sebagai *${capitalizeFirstLetter(user.job)}*. Jika ingin ganti profesi, ketik *${usedPrefix}resign* terlebih dahulu.`);

                // Urutkan pekerjaan berdasarkan level (Terendah -> Tertinggi)
                let jobListSorted = Object.keys(jobs).sort((a, b) => jobs[a].level - jobs[b].level);

                if (!text || !jobs[text.toLowerCase()]) {
                    let txt = `乂 *L O W O N G A N  K E R J A*\n_Diurutkan dari level terendah ke tertinggi_\n\n`;
                    jobListSorted.forEach(j => {
                        let icon = jobs[j].icon;
                        let lvl = jobs[j].level;
                        let cap = capitalizeFirstLetter(j);
                        txt += `• ${icon} *${cap}* (Lv. ${lvl})\n`;
                    });
                    txt += `\n📌 *Cara Melamar:*\nKetik ${usedPrefix}lamarkerja <nama_pekerjaan>\nContoh: *${usedPrefix}lamarkerja gojek*`;
                    return m.reply(txt);
                }

                let jobName = text.toLowerCase();
                let jobTarget = jobs[jobName];

                if (user.level < jobTarget.level) {
                    return m.reply(`❌ Levelmu belum mencukupi!\nUntuk menjadi *${capitalizeFirstLetter(jobName)}*, kamu butuh minimal *Level ${jobTarget.level}*.\nLevelmu saat ini: *${user.level}*.`);
                }

                m.reply(`⏳ Mengirimkan CV dan berkas lamaran ke perusahaan *${capitalizeFirstLetter(jobName)}*...`);
                
                setTimeout(() => {
                    user.job = jobName;
                    user.jobexp = 0;
                    m.reply(`🎉 *SELAMAT!*\nLamaran kerjamu diterima! Mulai hari ini kamu resmi bekerja sebagai *${capitalizeFirstLetter(jobName)}*.\n\nKetik *${usedPrefix}kerja* untuk memulai shift pertamamu!`);
                }, 3000); // Simulasi delay 3 detik
                break;
            }

            // ==============================
            // BEKERJA (.kerja / .jobkerja)
            // ==============================
            case 'kerja':
            case 'jobkerja': {
                if (user.job === 'Pengangguran') return m.reply(`❌ Kamu belum mempunyai pekerjaan. Ketik *${usedPrefix}lamarkerja* untuk melamar.`);
                if (user.jail) return m.reply('❌ *Kamu masih di dalam penjara!* Tidak bisa bekerja.');
                if (user.culik) return m.reply('❌ *Kamu sedang diculik!* Tidak bisa bekerja.');

                let cooldown = 5 * 60 * 1000; // 5 Menit
                let now = new Date().getTime();
                if (now - user.pekerjaansatu < cooldown) {
                    let sisaM = Math.floor((cooldown - (now - user.pekerjaansatu)) / 60000);
                    let sisaS = Math.floor(((cooldown - (now - user.pekerjaansatu)) % 60000) / 1000);
                    return m.reply(`⏳ Kamu sudah kelelahan. Istirahatlah selama *${sisaM} Menit ${sisaS} Detik* sebelum bekerja lagi.`);
                }

                let jobData = jobs[user.job];
                if (!jobData) return m.reply('❌ Datamu error. Silakan resign lalu melamar kerja kembali.');

                // 1. Hitung Gaji Pokok (Random antara Min - Max)
                let gajiPokok = Math.floor(Math.random() * (jobData.maxPay - jobData.minPay + 1)) + jobData.minPay;
                
                // 2. Sistem Kompleks (Bonus / Denda)
                let eventChance = Math.random();
                let keteranganEvent = "Bekerja dengan lancar hari ini. 👍";
                let uangDidapat = gajiPokok;

                if (eventChance > 0.85) {
                    // 15% Chance Dapat Bonus Lembur
                    let bonus = Math.floor(gajiPokok * 0.3); // Bonus 30%
                    uangDidapat += bonus;
                    keteranganEvent = `✨ *KERJA BAGUS!* Atasan menyukai kinerjamu, kamu dapat bonus lembur sebesar ${formatRp(bonus)}!`;
                } else if (eventChance < 0.15) {
                    // 15% Chance Kena Denda (Telat/Kesalahan)
                    let denda = Math.floor(gajiPokok * 0.2); // Denda 20%
                    uangDidapat -= denda;
                    keteranganEvent = `⚠️ *KESALAHAN KERJA!* Kamu merusakkan alat kerja/telat, gajimu dipotong ${formatRp(denda)}.`;
                }

                // 3. Sistem Pajak Negara (4%)
                let pajakRate = 0.04;
                let potonganPajak = Math.floor(uangDidapat * pajakRate);
                let gajiBersih = uangDidapat - potonganPajak;

                // 4. Update Database User & Negara
                user.money += gajiBersih;
                user.exp += jobData.exp;
                if (user.jobexp < 500) user.jobexp += 1;
                user.pekerjaansatu = now;
                negara.kas += potonganPajak; // Uang masuk kas negara

                // 5. Cetak Slip Gaji
                let slip = `📜 *SLIP GAJI - ${jobData.icon} ${capitalizeFirstLetter(user.job)}* 📜\n`;
                slip += `━━━━━━━━━━━━━━━━━━━━\n`;
                slip += `📝 *Catatan:* ${keteranganEvent}\n\n`;
                slip += `💵 *Gaji Kotor:* ${formatRp(uangDidapat)}\n`;
                slip += `🏛️ *Pajak Negara (4%):* -${formatRp(potonganPajak)}\n`;
                slip += `💰 *Pendapatan Bersih:* *${formatRp(gajiBersih)}*\n`;
                slip += `⭐ *EXP Didapat:* +${jobData.exp} Exp\n`;
                slip += `📈 *Kinerja Naik:* +1%\n`;
                slip += `━━━━━━━━━━━━━━━━━━━━\n`;
                slip += `_Pajak penghasilan otomatis disetor ke Kas Negara untuk pembangunan RPG._`;

                m.reply(slip);
                break;
            }

            // ==============================
            // RESIGN (KELUAR KERJA)
            // ==============================
            case 'resign': {
                if (user.job === 'Pengangguran') return m.reply('❌ Kamu belum bekerja, bagaimana mau resign?');
                
                let jobLama = user.job;
                user.job = 'Pengangguran';
                user.jobexp = 0;
                
                m.reply(`💼 Kamu telah resmi *mengundurkan diri* dari pekerjaanmu sebagai *${capitalizeFirstLetter(jobLama)}*.\nSemua progres kerjamu di-reset.\n\nKetik *${usedPrefix}lamarkerja* untuk mencari profesi baru!`);
                break;
            }
        }
    } catch (e) {
        console.error('ERROR PEKERJAAN:', e);
        m.reply(`❌ Terjadi kesalahan pada sistem ketenagakerjaan: ${e.message}`);
    }
};

handler.help = ['job', 'kerja', 'lamarkerja', 'resign'];
handler.tags = ['rpg'];
handler.command = /^(job|kerja|jobkerja|lamarkerja|resign)$/i;

module.exports = handler;
