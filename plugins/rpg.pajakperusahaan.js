let handler = m => m

handler.before = async function (m, { conn }) {
    let now = new Date();
    // Berjalan otomatis hanya pas jam 4 pagi
    if (now.getHours() === 4) {
        let todayStr = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
        if (global.db.data.lastTaxDate !== todayStr) {
            global.db.data.lastTaxDate = todayStr; // Tandai sudah narik pajak hari ini
            let users = global.db.data.users;
            
            for (let jid in users) {
                let user = users[jid];
                if (!user.perusahaan || user.perusahaan.length === 0) continue;
                
                let adaNotif = false;
                let teksNotif = `🏛️ *PAJAK OTOMATIS (0.1%)* 🏛️\n_Dipotong jam 4 pagi_\n\n`;

                for (let i = user.perusahaan.length - 1; i >= 0; i--) {
                    let pt = user.perusahaan[i];
                    if (!pt) continue;
                    
                    let pajakPT = Math.floor((pt.saldo || 0) * 0.001); 
                    
                    if (pajakPT > 0 && pt.saldo >= pajakPT) {
                        pt.saldo -= pajakPT;
                        pt.hariNunggak = 0;
                        pt.isLocked = false; // Buka kunci otomatis jika saldo sudah terisi dan terbayar
                    } else if (pajakPT > 0 || pt.saldo <= 0) {
                        pt.hariNunggak = (pt.hariNunggak || 0) + 1;
                        adaNotif = true;
                        
                        if (pt.hariNunggak >= 3 && pt.hariNunggak <= 7) {
                            pt.isLocked = true;
                            teksNotif += `🔒 *${pt.name}* - *DIKUNCI*\nNunggak ${pt.hariNunggak} hari! Segera setor dana.\n\n`;
                        } else if (pt.hariNunggak > 7) {
                            // Lelang 90% saham dengan harga diskon 50%
                            let hargaLelang = Math.floor((pt.hargaAwal || 85000000000000) * 0.5); 
                            
                            if (!global.db.data.bursa) global.db.data.bursa = [];
                            global.db.data.bursa.push({
                                id: global.db.data.bursa.length + 1,
                                seller: 'SYSTEM (Sita Pajak)',
                                ptId: pt.id,
                                ptName: pt.name,
                                persen: 90, // Lelang 90% saham
                                hargaPerPersen: Math.floor(hargaLelang / 90),
                                totalHarga: hargaLelang
                            });
                            
                            teksNotif += `⚖️ *${pt.name}* - *DILELANG*\nNunggak >7 hari. 90% Saham disita dan dilelang seharga Rp ${hargaLelang.toLocaleString()} (Diskon 50%).\n\n`;
                            user.perusahaan.splice(i, 1); // Cabut PT dari player
                        } else {
                            teksNotif += `⚠️ *${pt.name}* - Gagal bayar pajak. (Nunggak hari ke-${pt.hariNunggak})\n\n`;
                        }
                    }
                }
                
                // Kirim pesan laporan otomatis ke privat chat player yang nunggak/kena lelang
                if (adaNotif) {
                    conn.sendMessage(jid, { text: teksNotif }).catch(() => {});
                }
            }
        }
    }
}

module.exports = handler
