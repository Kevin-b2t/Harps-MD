let handler = async (m, { conn, command, args, usedPrefix, owner }) => {
    
    if (!global.db.data.market) global.db.data.market = {};

    let d = new Date();
    let jamCounter = Math.floor(d.getTime() / (1000 * 60 * 60));
    let jamDalamHari = d.getHours(); 
    
    function seededRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    // ==========================================
    // FUNGSI HARGA DINAMIS (SEMUA ITEM NAIK TURUN OTOMATIS)
    // ==========================================
    function getDynamicPrice(itemKey, baseBeli, baseJual, baseStock) {
        if (!global.db.data.market[itemKey]) {
            global.db.data.market[itemKey] = { stock: baseStock };
        }
        let currentStock = global.db.data.market[itemKey].stock;
        let ratio = baseStock / Math.max(1, currentStock);
        ratio = Math.max(0.2, Math.min(3.0, ratio));

        let stockBeli = Math.floor(baseBeli * ratio);
        let stockJual = Math.floor(baseJual * ratio);

        // Fluktuasi waktu ±20% setiap jam
        let fluctuationSeed = jamCounter + itemKey.length;
        let rng = seededRandom(fluctuationSeed);
        let fluctuation = (rng - 0.5) * 0.4;

        let finalBeli = Math.max(1, Math.floor(stockBeli * (1 + fluctuation)));
        let finalJual = Math.max(1, Math.floor(stockJual * (1 + fluctuation)));

        let status = '➖ Stabil';
        if (fluctuation > 0.1) status = '📈 Naik';
        else if (fluctuation < -0.1) status = '📉 Turun';

        return { 
            beli: finalBeli, 
            jual: finalJual, 
            stock: currentStock, 
            status: status,
            stockStatus: currentStock.toLocaleString() 
        };
    }

    // ==========================================
    // FUNGSI PERHIASAN & CRATE (TETAP)
    // ==========================================
    function getStatusPasarItem(seedOffset) { 
        let rng = seededRandom(jamCounter + seedOffset); 
        let persentase = 0; let statusPasar = '➖ Stabil';
        if (jamCounter % 72 === 0) { persentase = 2.0; statusPasar = '🚀 (SUPER JACKPOT!)';
        } else if (jamDalamHari % 8 === 0) { persentase = (41 + (rng * 79)) / 100; statusPasar = '📈 (Naik Tinggi)';
        } else if (jamDalamHari === 23) { persentase = -0.60; statusPasar = '📉 (Anjlok)';
        } else {
            if (rng > 0.5) { persentase = (10 + (rng * 30)) / 100; statusPasar = '📈 (Naik)'; } 
            else { persentase = -((20 + (rng * 20)) / 100); statusPasar = '📉 (Turun)'; }
        }
        return { persentase, statusPasar };
    }

    function getStatusPasarCrate(seedOffset) {
        let rng = seededRandom(jamCounter + seedOffset); 
        let persentase = 0; let statusPasar = '➖ Stabil';
        if (rng > 0.5) { let pengaliNaik = (rng - 0.5) * 2; persentase = (pengaliNaik * 166) / 100; statusPasar = '📈 (Naik)';
            if (persentase >= 1.0) statusPasar = '🚀 (SUPER NAIK!)';
        } else { let pengaliTurun = rng * 2; persentase = -((pengaliTurun * 48) / 100); statusPasar = '📉 (Turun)'; }
        return { persentase, statusPasar, stockStatus: '♾️ Tidak Terbatas' };
    }

    // ==========================================
    // DEKLARASI SEMUA DATA
    // ==========================================
    let dataLimit = getDynamicPrice('limit', 15, 10, 50000); let Blimit = dataLimit.beli; let Slimit = dataLimit.jual; let statusLimit = dataLimit.status;
    let dataPet = getDynamicPrice('pet', 11, 5, 25000); let Bpet = dataPet.beli; let Spet = dataPet.jual; let statusPet = dataPet.status;
    let dataGarden = getDynamicPrice('gardenboxs', 40000, 15000, 10000); let Bgardenboxs = dataGarden.beli; let Sgardenboxs = dataGarden.jual; let statusGarden = dataGarden.status;
    let dataBensin = getDynamicPrice('bensin', 6000, 2000, 100000); let BBensin = dataBensin.beli; let SBensin = dataBensin.jual; let statusBensin = dataBensin.status;
    let dataWeap = getDynamicPrice('weapon', 120000, 35000, 5000); let BWeap = dataWeap.beli; let SWeap = dataWeap.jual; let statusWeap = dataWeap.status;
    let dataObat = getDynamicPrice('obat', 10000, 2500, 50000); let BObat = dataObat.beli; let SObat = dataObat.jual; let statusObat = dataObat.status;
    let dataTiketCoin = getDynamicPrice('tiketcoin', 5, 1, 150000); let Btiketcoin = dataTiketCoin.beli; let Stiketcoin = dataTiketCoin.jual; let statusTiketCoin = dataTiketCoin.status;
    let dataHealtMonster = getDynamicPrice('healtmonster', 25000, 6000, 20000); let Bhealtmonster = dataHealtMonster.beli; let Shealtmonster = dataHealtMonster.jual; let statusHealtMonster = dataHealtMonster.status;
    let dataPancingan = getDynamicPrice('pancingan', 35000, 8000, 15000); let Bpancingan = dataPancingan.beli; let Spancingan = dataPancingan.jual; let statusPancingan = dataPancingan.status;

    // Bibit
    let dataBibitPisang = getDynamicPrice('bibitpisang', 550, 50, 100000); let Bbibitpisang = dataBibitPisang.beli; let Sbibitpisang = dataBibitPisang.jual; let statusBibitPisang = dataBibitPisang.status;
    let dataBibitAnggur = getDynamicPrice('bibitanggur', 550, 50, 100000); let Bbibitanggur = dataBibitAnggur.beli; let Sbibitanggur = dataBibitAnggur.jual; let statusBibitAnggur = dataBibitAnggur.status;
    let dataBibitMangga = getDynamicPrice('bibitmangga', 550, 50, 100000); let Bbibitmangga = dataBibitMangga.beli; let Sbibitmangga = dataBibitMangga.jual; let statusBibitMangga = dataBibitMangga.status;
    let dataBibitJeruk = getDynamicPrice('bibitjeruk', 550, 50, 100000); let Bbibitjeruk = dataBibitJeruk.beli; let Sbibitjeruk = dataBibitJeruk.jual; let statusBibitJeruk = dataBibitJeruk.status;
    let dataBibitApel = getDynamicPrice('bibitapel', 550, 50, 100000); let Bbibitapel = dataBibitApel.beli; let Sbibitapel = dataBibitApel.jual; let statusBibitApel = dataBibitApel.status;
    let dataPadi = getDynamicPrice('bibitpadi', 400, 80, 100000); let Bpadi = dataPadi.beli; let Spadi = dataPadi.jual; let statusPadi = dataPadi.status;
    let dataGandum = getDynamicPrice('bibitgandum', 450, 100, 100000); let Bgandum = dataGandum.beli; let Sgandum = dataGandum.jual; let statusGandum = dataGandum.status;
    let dataWortel = getDynamicPrice('bibitwortel', 500, 120, 100000); let Bwortel = dataWortel.beli; let Swortel = dataWortel.jual; let statusWortel = dataWortel.status;
    let dataKentang = getDynamicPrice('bibitkentang', 600, 140, 100000); let Bkentang = dataKentang.beli; let Skentang = dataKentang.jual; let statusKentang = dataKentang.status;
    let dataSingkong = getDynamicPrice('bibitsingkong', 350, 70, 100000); let Bsingkong = dataSingkong.beli; let Ssingkong = dataSingkong.jual; let statusSingkong = dataSingkong.status;
    let dataUbiJalar = getDynamicPrice('bibitubijalar', 375, 75, 100000); let Bubijalar = dataUbiJalar.beli; let Subijalar = dataUbiJalar.jual; let statusUbiJalar = dataUbiJalar.status;
    let dataTebu = getDynamicPrice('bibittebu', 550, 130, 100000); let Btebu = dataTebu.beli; let Stebu = dataTebu.jual; let statusTebu = dataTebu.status;

    // Barang & Alam
    let dataPotion = getDynamicPrice('potion', 20000, 100, 50000); let potion = dataPotion.beli; let Spotion = dataPotion.jual; let statusPotion = dataPotion.status;
    let dataSampah = getDynamicPrice('sampah', 120, 5, 500000); let Bsampah = dataSampah.beli; let Ssampah = dataSampah.jual; let statusSampah = dataSampah.status;
    let dataString = getDynamicPrice('string', 50000, 5000, 20000); let Bstring = dataString.beli; let Sstring = dataString.jual; let statusString = dataString.status;
    let dataBotol = getDynamicPrice('botol', 300, 50, 150000); let Bbotol = dataBotol.beli; let Sbotol = dataBotol.jual; let statusBotol = dataBotol.status;
    let dataKaleng = getDynamicPrice('kaleng', 400, 100, 150000); let Bkaleng = dataKaleng.beli; let Skaleng = dataKaleng.jual; let statusKaleng = dataKaleng.status;
    let dataKardus = getDynamicPrice('kardus', 400, 50, 150000); let Bkardus = dataKardus.beli; let Skardus = dataKardus.jual; let statusKardus = dataKardus.status;
    let dataSword = getDynamicPrice('sword', 150000, 15000, 5000); let Bsword = dataSword.beli; let Ssword = dataSword.jual; let statusSword = dataSword.status;

    let dataKayu = getDynamicPrice('kayu', 1000, 400, 300000); let Bkayu = dataKayu.beli; let Skayu = dataKayu.jual; let statusKayu = dataKayu.status;
    let dataBatu = getDynamicPrice('batu', 500, 100, 300000); let Bbatu = dataBatu.beli; let Sbatu = dataBatu.jual; let statusBatu = dataBatu.status;
    let dataCoal = getDynamicPrice('coal', 1500, 1000, 150000); let Bcoal = dataCoal.beli; let Scoal = dataCoal.jual; let statusCoal = dataCoal.status;
    let dataIron = getDynamicPrice('iron', 20000, 5000, 50000); let Biron = dataIron.beli; let Siron = dataIron.jual; let statusIron = dataIron.status;
    let dataBerlian = getDynamicPrice('berlian', 150000, 10000, 10000); let Bberlian = dataBerlian.beli; let Sberlian = dataBerlian.jual; let statusBerlian = dataBerlian.status;
    let dataEmasBatang = getDynamicPrice('emasbatang', 250000, 10000, 5000); let Bemasbatang = dataEmasBatang.beli; let Semasbatang = dataEmasBatang.jual; let statusEmasBatang = dataEmasBatang.status;

    // Makanan
    let dataPisang = getDynamicPrice('pisang', 5500, 100, 80000); let Bpisang = dataPisang.beli; let Spisang = dataPisang.jual; let statusPisang = dataPisang.status;
    let dataAnggur = getDynamicPrice('anggur', 5500, 150, 80000); let Banggur = dataAnggur.beli; let Sanggur = dataAnggur.jual; let statusAnggur = dataAnggur.status;
    let dataMangga = getDynamicPrice('mangga', 4600, 150, 80000); let Bmangga = dataMangga.beli; let Smangga = dataMangga.jual; let statusMangga = dataMangga.status;
    let dataJeruk = getDynamicPrice('jeruk', 6000, 300, 80000); let Bjeruk = dataJeruk.beli; let Sjeruk = dataJeruk.jual; let statusJeruk = dataJeruk.status;
    let dataApel = getDynamicPrice('apel', 5500, 400, 80000); let Bapel = dataApel.beli; let Sapel = dataApel.jual; let statusApel = dataApel.status;
    let dataMakananPet = getDynamicPrice('makananpet', 50000, 500, 20000); let Bmakananpet = dataMakananPet.beli; let Smakananpet = dataMakananPet.jual; let statusMakananPet = dataMakananPet.status;
    let dataMakananNaga = getDynamicPrice('makanannaga', 150000, 10000, 5000); let Bmakanannaga = dataMakananNaga.beli; let Smakanannaga = dataMakananNaga.jual; let statusMakananNaga = dataMakananNaga.status;
    let dataMakananKyubi = getDynamicPrice('makanankyubi', 150000, 10000, 5000); let Bmakanankyubi = dataMakananKyubi.beli; let Smakanankyubi = dataMakananKyubi.jual; let statusMakananKyubi = dataMakananKyubi.status;
    let dataMakananGriffin = getDynamicPrice('makanangriffin', 80000, 5000, 10000); let Bmakanangriffin = dataMakananGriffin.beli; let Smakanangriffin = dataMakananGriffin.jual; let statusMakananGriffin = dataMakananGriffin.status;
    let dataMakananPhonix = getDynamicPrice('makananphonix', 80000, 5000, 10000); let Bmakananphonix = dataMakananPhonix.beli; let Smakananphonix = dataMakananPhonix.jual; let statusMakananPhonix = dataMakananPhonix.status;
    let dataMakananCentaur = getDynamicPrice('makanancentaur', 150000, 10000, 5000); let Bmakanancentaur = dataMakananCentaur.beli; let Smakanancentaur = dataMakananCentaur.jual; let statusMakananCentaur = dataMakananCentaur.status;

    // Minuman
    let dataAqua = getDynamicPrice('aqua', 5000, 1000, 100000); let Baqua = dataAqua.beli; let Saqua = dataAqua.jual; let statusAqua = dataAqua.status;
    let dataSusu = getDynamicPrice('susu', 6000, 1200, 80000); let Bsusu = dataSusu.beli; let Ssusu = dataSusu.jual; let statusSusu = dataSusu.status;
    let dataMadu = getDynamicPrice('madu', 12000, 2500, 50000); let Bmadu = dataMadu.beli; let Smadu = dataMadu.jual; let statusMadu = dataMadu.status;
    let dataUmpan = getDynamicPrice('umpan', 1500, 100, 100000); let Bumpan = dataUmpan.beli; let Sumpan = dataUmpan.jual; let statusUmpan = dataUmpan.status;

    // ==================== JUS BUAH ====================
    let baseStockJusAnggur = Math.floor(Math.random() * (25625 - 15768 + 1)) + 15768;
    let baseStockJusApel   = Math.floor(Math.random() * (25625 - 15768 + 1)) + 15768;
    let baseStockJusJeruk  = Math.floor(Math.random() * (25625 - 15768 + 1)) + 15768;
    let baseStockJusMangga = Math.floor(Math.random() * (25625 - 15768 + 1)) + 15768;
    let baseStockJusPisang = Math.floor(Math.random() * (25625 - 15768 + 1)) + 15768;

    let dataJusAnggur = getDynamicPrice('jusanggur', 12000, 2800, baseStockJusAnggur); 
    let Bjusanggur = dataJusAnggur.beli; let Sjusanggur = dataJusAnggur.jual; let statusJusAnggur = dataJusAnggur.status;

    let dataJusApel = getDynamicPrice('jusapel', 12300, 2900, baseStockJusApel); 
    let Bjusapel = dataJusApel.beli; let Sjusapel = dataJusApel.jual; let statusJusApel = dataJusApel.status;

    let dataJusJeruk = getDynamicPrice('jusjeruk', 12600, 3000, baseStockJusJeruk); 
    let Bjusjeruk = dataJusJeruk.beli; let Sjusjeruk = dataJusJeruk.jual; let statusJusJeruk = dataJusJeruk.status;

    let dataJusMangga = getDynamicPrice('jusmangga', 12900, 3100, baseStockJusMangga); 
    let Bjusmangga = dataJusMangga.beli; let Sjusmangga = dataJusMangga.jual; let statusJusMangga = dataJusMangga.status;

    let dataJusPisang = getDynamicPrice('juspisang', 13300, 3200, baseStockJusPisang); 
    let Bjuspisang = dataJusPisang.beli; let Sjuspisang = dataJusPisang.jual; let statusJusPisang = dataJusPisang.status;

    // Perhiasan & Crate
    let pEmas = getStatusPasarItem(1); let statusEmas = pEmas.statusPasar; let Bemasbiasa = Math.floor(1545000 + (1545000 * pEmas.persentase)); let Semasbiasa = Math.floor(1296000 + (1296000 * pEmas.persentase));
    let pDiamond = getStatusPasarItem(2); let statusDiamond = pDiamond.statusPasar; let Bdiamond = Math.floor(5810000 + (5810000 * pDiamond.persentase)); let Sdiamond = Math.floor(4081000 + (4081000 * pDiamond.persentase));
    let pPerak = getStatusPasarItem(3); let statusPerak = pPerak.statusPasar; let Bperak = Math.floor(1009000 + (1009000 * pPerak.persentase)); let Sperak = Math.floor(891000 + (891000 * pPerak.persentase));
    let pEmerald = getStatusPasarItem(4); let statusEmerald = pEmerald.statusPasar; let Bemerald = Math.floor(11000000 + (11000000 * pEmerald.persentase)); let Semerald = Math.floor(9000000 + (9000000 * pEmerald.persentase));

    let dCommon = getStatusPasarCrate(10); let statusCommon = dCommon.statusPasar; let Bcommon = Math.floor(265000 + (265000 * dCommon.persentase)); let Scommon = Math.max(1, Math.floor(195000 + (195000 * dCommon.persentase)));
    let dUncommon = getStatusPasarCrate(11); let statusUncommon = dUncommon.statusPasar; let Buncommon = Math.floor(315000 + (315000 * dUncommon.persentase)); let Suncommon = Math.max(1, Math.floor(285000 + (285000 * dUncommon.persentase)));
    let dRare = getStatusPasarCrate(12); let statusRare = dRare.statusPasar; let Brare = Math.floor(455000 + (455000 * dRare.persentase)); let Srare = Math.max(1, Math.floor(300000 + (300000 * dRare.persentase)));
    let dEpic = getStatusPasarCrate(13); let statusEpic = dEpic.statusPasar; let Bepic = Math.floor(816000 + (816000 * dEpic.persentase)); let Sepic = Math.max(1, Math.floor(756000 + (756000 * dEpic.persentase)));
    let dMythic = getStatusPasarCrate(14); let statusMythic = dMythic.statusPasar; let Bmythic = Math.floor(1060000 + (1060000 * dMythic.persentase)); let Smythic = Math.max(1, Math.floor(915000 + (915000 * dMythic.persentase)));
    let dLegendary = getStatusPasarCrate(15); let statusLegendary = dLegendary.statusPasar; let Blegendary = Math.floor(3155000 + (3155000 * dLegendary.persentase)); let Slegendary = Math.max(1, Math.floor(2865000 + (2865000 * dLegendary.persentase)));
    let dSecret = getStatusPasarCrate(16); let statusSecret = dSecret.statusPasar; let Bsecret = Math.floor(6120000 + (6120000 * dSecret.persentase)); let Ssecret = Math.max(1, Math.floor(4650000 + (4650000 * dSecret.persentase)));
    let dDark = getStatusPasarCrate(17); let statusDark = dDark.statusPasar; let Bdark = Math.floor(12000000 + (12000000 * dDark.persentase)); let Sdark = Math.max(1, Math.floor(10000000 + (10000000 * dDark.persentase)));
    let dCheat = getStatusPasarCrate(18); let statusCheat = dCheat.statusPasar; let Bcheat = Math.floor(15670000 + (15670000 * dCheat.persentase)); let Scheat = Math.max(1, Math.floor(14670000 + (14670000 * dCheat.persentase)));

    let user = global.db.data.users[m.sender];

    // Pajak Harian
    let tanggalHariIni = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
    if (user.lastTaxDate !== tanggalHariIni) {
        let uangSaatIni = user.money || 0;
        let potonganPajak = Math.floor(uangSaatIni * 0.01);
        if (potonganPajak > 0) {
            user.money -= potonganPajak;
            conn.reply(m.chat, `🏛️ *INFO PAJAK HARIAN (1%)*\nDipotong Rp ${potonganPajak.toLocaleString()}`, m);
        }
        user.lastTaxDate = tanggalHariIni;
    }

    // ==========================================
    // MENU LENGKAP (GANTI DENGAN MENU LAMA KAMU)
    // ==========================================
    const Kchat = `
━━━「 *HARGA BELI/JUAL* 」━━━
> Kebutuhan
🏷️Limit: 
Harga Beli : ${Blimit} Diamond
Harga Jual : ${Slimit} Money
Status Harga : ${statusLimit}
Info Stock : ${dataLimit.stockStatus}

🐉 Pet:  
Harga Beli : ${Bpet}
Harga Jual : ${Spet}
Status Harga : ${statusPet}
Info Stock : ${dataPet.stockStatus}

📦 Gardenboxs:
Harga Beli : ${Bgardenboxs}
Harga Jual : ${Sgardenboxs}
Status Harga : ${statusGarden}
Info Stock : ${dataGarden.stockStatus}

⛽ Bensin:
Harga Beli : ${BBensin}
Harga Jual : ${SBensin}
Status Harga : ${statusBensin}
Info Stock : ${dataBensin.stockStatus}

⚔️ Weapon:
Harga Beli : ${BWeap}
Harga Jual : ${SWeap}
Status Harga : ${statusWeap}
Info Stock : ${dataWeap.stockStatus}

💊 Obat:
Harga Beli : ${BObat}
Harga Jual : ${SObat}
Status Harga : ${statusObat}
Info Stock : ${dataObat.stockStatus}

🎟️ Cupon:
Harga Beli : ${Btiketcoin} Tiketcoin
Harga Jual : ${Stiketcoin} Tiketcoin
Status Harga : ${statusTiketCoin}
Info Stock : ${dataTiketCoin.stockStatus}

👹 TiketM:
Harga Beli : ${Bhealtmonster}
Harga Jual : ${Shealtmonster}
Status Harga : ${statusHealtMonster}
Info Stock : ${dataHealtMonster.stockStatus}

🎣 Pancingan:
Harga Beli : ${Bpancingan}
Harga Jual : ${Spancingan}
Status Harga : ${statusPancingan}
Info Stock : ${dataPancingan.stockStatus}

━━━「 *BIBIT & TANAMAN* 」━━━

🍌Bibit Pisang:
HARGA BELI : ${Bbibitpisang}
HARGA JUAL : ${Sbibitpisang}
Status Harga : ${statusBibitPisang}
Info Stock : ${dataBibitPisang.stockStatus}

🍇Bibit Anggur:
HARGA BELI : ${Bbibitanggur}
HARGA JUAL : ${Sbibitanggur}
Status Harga : ${statusBibitAnggur}
Info Stock : ${dataBibitAnggur.stockStatus}

🥭Bibit Mangga:
HARGA BELI : ${Bbibitmangga}
HARGA JUAL : ${Sbibitmangga}
Status Harga : ${statusBibitMangga}
Info Stock : ${dataBibitMangga.stockStatus}

🍊Bibit Jeruk:
HARGA BELI : ${Bbibitjeruk}
HARGA JUAL : ${Sbibitjeruk}
Status Harga : ${statusBibitJeruk}
Info Stock : ${dataBibitJeruk.stockStatus}

🍎Bibit Apel:
HARGA BELI : ${Bbibitapel}
HARGA JUAL : ${Sbibitapel}
Status Harga : ${statusBibitApel}
Info Stock : ${dataBibitApel.stockStatus}

🌾Bibit Padi:
HARGA BELI : ${Bpadi}
HARGA JUAL : ${Spadi}
Status Harga : ${statusPadi}
Info Stock : ${dataPadi.stockStatus}

🌾Bibit Gandum:
HARGA BELI : ${Bgandum}
HARGA JUAL : ${Sgandum}
Status Harga : ${statusGandum}
Info Stock : ${dataGandum.stockStatus}

🥕Bibit Wortel:
HARGA BELI : ${Bwortel}
HARGA JUAL : ${Swortel}
Status Harga : ${statusWortel}
Info Stock : ${dataWortel.stockStatus}

🥔Bibit Kentang:
HARGA BELI : ${Bkentang}
HARGA JUAL : ${Skentang}
Status Harga : ${statusKentang}
Info Stock : ${dataKentang.stockStatus}

🍠Bibit Singkong:
HARGA BELI : ${Bsingkong}
HARGA JUAL : ${Ssingkong}
Status Harga : ${statusSingkong}
Info Stock : ${dataSingkong.stockStatus}

🍠Bibit Ubi Jalar:
HARGA BELI : ${Bubijalar}
HARGA JUAL : ${Subijalar}
Status Harga : ${statusUbiJalar}
Info Stock : ${dataUbiJalar.stockStatus}

🎋Bibit Tebu:
HARGA BELI : ${Btebu}
HARGA JUAL : ${Stebu}
Status Harga : ${statusTebu}
Info Stock : ${dataTebu.stockStatus}

╸╸━━━「 *BARANG* 」━━━╺╺

🗑️Sampah:
HARGA BELI : ${Bsampah}
HARGA JUAL : ${Ssampah}
Status Harga : ${statusSampah}
Info Stock : ${dataSampah.stockStatus}

🧵String:
HARGA BELI : ${Bstring}
HARGA JUAL : ${Sstring}
Status Harga : ${statusString}
Info Stock : ${dataString.stockStatus}

🍾Botol:
HARGA BELI : ${Bbotol}
HARGA JUAL : ${Sbotol}
Status Harga : ${statusBotol}
Info Stock : ${dataBotol.stockStatus}

🥫Kaleng:
HARGA BELI : ${Bkaleng}
HARGA JUAL : ${Skaleng}
Status Harga : ${statusKaleng}
Info Stock : ${dataKaleng.stockStatus}

📦Kardus:
HARGA BELI : ${Bkardus}
HARGA JUAL : ${Skardus}
Status Harga : ${statusKardus}
Info Stock : ${dataKardus.stockStatus}

⚔️Sword:
HARGA BELI : ${Bsword}
HARGA JUAL : ${Ssword}
Status Harga : ${statusSword}
Info Stock : ${dataSword.stockStatus}

🪤Umpan:
HARGA BELI : ${Bumpan}
HARGA JUAL : ${Sumpan}
Status Harga : ${statusUmpan}
Info Stock : ${dataUmpan.stockStatus}

╸╸━━━「 *ALAM* 」━━━╺╺

🪵Kayu:        
HARGA BELI : ${Bkayu}
HARGA JUAL : ${Skayu}
Status Harga : ${statusKayu}
Info Stock : ${dataKayu.stockStatus}

🪨Batu:        
HARGA BELI : ${Bbatu}
HARGA JUAL : ${Sbatu}
Status Harga : ${statusBatu}
Info Stock : ${dataBatu.stockStatus}

🪨Coal:        
HARGA BELI : ${Bcoal}
HARGA JUAL : ${Scoal}
Status Harga : ${statusCoal}
Info Stock : ${dataCoal.stockStatus}

⛓️Iron:        
HARGA BELI : ${Biron}
HARGA JUAL : ${Siron}
Status Harga : ${statusIron}
Info Stock : ${dataIron.stockStatus}

💎Berlian:
HARGA BELI : ${Bberlian}
HARGA JUAL : ${Sberlian}
Status Harga : ${statusBerlian}
Info Stock : ${dataBerlian.stockStatus}

🥇Emas Batang:
HARGA BELI : ${Bemasbatang}
HARGA JUAL : ${Semasbatang}
Status Harga : ${statusEmasBatang}
Info Stock : ${dataEmasBatang.stockStatus}

╸╸━━━「 *PERHIASAN* 」━━━╺╺

💎Diamond :
Harga Beli : ${Bdiamond}
Harga Jual : ${Sdiamond}
Status Harga : ${statusDiamond}
               
⬜Perak : 
Harga Beli : ${Bperak}
Harga Jual : ${Sperak}         
Status Harga : ${statusPerak}      
               
🪙Emas :       
Harga Beli : ${Bemasbiasa}
Harga Jual : ${Semasbiasa}
Status Harga : ${statusEmas}
               
❇️Emerald :     
Harga Beli : ${Bemerald}
Harga Jual : ${Semerald}
Status Harga : ${statusEmerald}

╸╸━━━「 *LIST CRATE* 」━━━╺╺

🎁 Common :
HARGA BELI : ${Bcommon} Money
HARGA JUAL : ${Scommon} Money
Status Harga : ${statusCommon}
Info Stock : ${dCommon.stockStatus}
             
🎁 Uncommon: 
HARGA BELI : ${Buncommon} Money
HARGA JUAL : ${Suncommon} Money
Status Harga : ${statusUncommon}
Info Stock : ${dUncommon.stockStatus}

💎 Rare :
HARGA BELI : ${Brare} Money
HARGA JUAL : ${Srare} Money
Status Harga : ${statusRare}
Info Stock : ${dRare.stockStatus}
               
🔥 Epic :
HARGA BELI : ${Bepic} Money
HARGA JUAL : ${Sepic} Money
Status Harga : ${statusEpic}
Info Stock : ${dEpic.stockStatus}
        
🌌 Mythic : 
HARGA BELI : ${Bmythic} Money
HARGA JUAL : ${Smythic} Money
Status Harga : ${statusMythic}
Info Stock : ${dMythic.stockStatus}
           
👑 Legendary : 
HARGA BELI : ${Blegendary} Money
HARGA JUAL : ${Slegendary} Money
Status Harga : ${statusLegendary}
Info Stock : ${dLegendary.stockStatus}
               
🗝️ Secret : 
HARGA BELI : ${Bsecret} Money
HARGA JUAL : ${Ssecret} Money
Status Harga : ${statusSecret}
Info Stock : ${dSecret.stockStatus}
            
🌑 Dark : 
HARGA BELI : ${Bdark} Money
HARGA JUAL : ${Sdark} Money
Status Harga : ${statusDark}
Info Stock : ${dDark.stockStatus}
          
⚡ Cheat : 
HARGA BELI : ${Bcheat} Money
HARGA JUAL : ${Scheat} Money
Status Harga : ${statusCheat}
Info Stock : ${dCheat.stockStatus}

╸╸━━━「 *MAKANAN* 」━━━╺╺

🍌Pisang:
HARGA BELI : ${Bpisang}
HARGA JUAL : ${Spisang}
Status Harga : ${statusPisang}
Info Stock : ${dataPisang.stockStatus}

🍇Anggur:
HARGA BELI : ${Banggur}
HARGA JUAL : ${Sanggur}
Status Harga : ${statusAnggur}
Info Stock : ${dataAnggur.stockStatus}

🥭Mangga:
HARGA BELI : ${Bmangga}
HARGA JUAL : ${Smangga}
Status Harga : ${statusMangga}
Info Stock : ${dataMangga.stockStatus}

🍊Jeruk:
HARGA BELI : ${Bjeruk}
HARGA JUAL : ${Sjeruk}
Status Harga : ${statusJeruk}
Info Stock : ${dataJeruk.stockStatus}

🍎Apel:
HARGA BELI : ${Bapel}
HARGA JUAL : ${Sapel}
Status Harga : ${statusApel}
Info Stock : ${dataApel.stockStatus}

🫔MakananPet:
HARGA BELI : ${Bmakananpet}
HARGA JUAL : ${Smakananpet}
Status Harga : ${statusMakananPet}
Info Stock : ${dataMakananPet.stockStatus}

🥩MakananNaga:
HARGA BELI : ${Bmakanannaga}
HARGA JUAL : ${Smakanannaga}
Status Harga : ${statusMakananNaga}
Info Stock : ${dataMakananNaga.stockStatus}

🥩MakananKyubi:
HARGA BELI : ${Bmakanankyubi}
HARGA JUAL : ${Smakanankyubi}
Status Harga : ${statusMakananKyubi}
Info Stock : ${dataMakananKyubi.stockStatus}

🥩MakananGriffin:
HARGA BELI : ${Bmakanangriffin}
HARGA JUAL : ${Smakanangriffin}
Status Harga : ${statusMakananGriffin}
Info Stock : ${dataMakananGriffin.stockStatus}

🥩MakananPhonix:
HARGA BELI : ${Bmakananphonix}
HARGA JUAL : ${Smakananphonix}
Status Harga : ${statusMakananPhonix}
Info Stock : ${dataMakananPhonix.stockStatus}

🥩MakananCentaur:
HARGA BELI : ${Bmakanancentaur}
HARGA JUAL : ${Smakanancentaur}
Status Harga : ${statusMakananCentaur}
Info Stock : ${dataMakananCentaur.stockStatus}

╸╸━━━「 *MINUMAN* 」━━━╺╺

🥤Potion:
HARGA BELI : ${potion}
HARGA JUAL : ${Spotion}
Status Harga : ${statusPotion}
Info Stock : ${dataPotion.stockStatus}

🫗Aqua:
HARGA BELI : ${Baqua}
HARGA JUAL : ${Saqua}
Status Harga : ${statusAqua}
Info Stock : ${dataAqua.stockStatus}

🥛Susu:
HARGA BELI : ${Bsusu}
HARGA JUAL : ${Ssusu}
Status Harga : ${statusSusu}
Info Stock : ${dataSusu.stockStatus}

🍯Madu:
HARGA BELI : ${Bmadu}
HARGA JUAL : ${Smadu}
Status Harga : ${statusMadu}
Info Stock : ${dataMadu.stockStatus}

> Fishing
🪤Umpan:
HARGA BELI : ${Bumpan}
HARGA JUAL : ${Sumpan}
Status Harga : ${statusUmpan}
Info Stock : ${dataUmpan.stockStatus}

> Ketik *.shop jusbuah* untuk melihat daftar Jus Buah saja

━━━「 *DOMPET KAMU* 」━━━
• *Uang:* Rp ${user.money.toLocaleString()}
• *Emerald:* ${user.emerald}
• *Emas:* ${user.emas} gram
• *Diamond:* ${user.diamond}
• *Perak:* ${user.perak}
`.trim();

    // ==========================================
    // MENU KATEGORI
    // ==========================================
    
    const BarangMenu = `
━━━「 *Barang* 」━━━
🗑️Sampah:
HARGA BELI : ${Bsampah}
HARGA JUAL : ${Ssampah}
Status Harga : ${statusSampah}
Info Stock : ${dataSampah.stockStatus}

🧵String:
HARGA BELI : ${Bstring}
HARGA JUAL : ${Sstring}
Status Harga : ${statusString}
Info Stock : ${dataString.stockStatus}

🍾Botol:
HARGA BELI : ${Bbotol}
HARGA JUAL : ${Sbotol}
Status Harga : ${statusBotol}
Info Stock : ${dataBotol.stockStatus}

🥫Kaleng:
HARGA BELI : ${Bkaleng}
HARGA JUAL : ${Skaleng}
Status Harga : ${statusKaleng}
Info Stock : ${dataKaleng.stockStatus}

📦Kardus:
HARGA BELI : ${Bkardus}
HARGA JUAL : ${Skardus}
Status Harga : ${statusKardus}
Info Stock : ${dataKardus.stockStatus}

⚔️Sword:
HARGA BELI : ${Bsword}
HARGA JUAL : ${Ssword}
Status Harga : ${statusSword}
Info Stock : ${dataSword.stockStatus}

🪤Umpan:
HARGA BELI : ${Bumpan}
HARGA JUAL : ${Sumpan}
Status Harga : ${statusUmpan}
Info Stock : ${dataUmpan.stockStatus}

━━━「 *DOMPET KAMU* 」━━━
• Uang    : Rp ${user.money.toLocaleString()}
• Emerald : ${user.emerald}
• Emas    : ${user.emas} gram
• Diamond : ${user.diamond}
• Perak   : ${user.perak}

Ketik: .shop buy <nama item> <jumlah>
`.trim();
   
    const MinumanMenu = `
━━━「 *MINUMAN* 」━━━

🥤Potion:
HARGA BELI : ${potion}
HARGA JUAL : ${Spotion}
Status Harga : ${statusPotion}
Info Stock : ${dataPotion.stockStatus}

🫗Aqua:
HARGA BELI : ${Baqua}
HARGA JUAL : ${Saqua}
Status Harga : ${statusAqua}
Info Stock : ${dataAqua.stockStatus}

🥛Susu:
HARGA BELI : ${Bsusu}
HARGA JUAL : ${Ssusu}
Status Harga : ${statusSusu}
Info Stock : ${dataSusu.stockStatus}

🍯Madu:
HARGA BELI : ${Bmadu}
HARGA JUAL : ${Smadu}
Status Harga : ${statusMadu}
Info Stock : ${dataMadu.stockStatus}

🍇 Jus Anggur
HARGA BELI : ${Bjusanggur}
HARGA JUAL : ${Sjusanggur}
Status     : ${statusJusAnggur}
Stock      : ${dataJusAnggur.stockStatus}

🍎 Jus Apel
HARGA BELI : ${Bjusapel}
HARGA JUAL : ${Sjusapel}
Status     : ${statusJusApel}
Stock      : ${dataJusApel.stockStatus}

🍊 Jus Jeruk
HARGA BELI : ${Bjusjeruk}
HARGA JUAL : ${Sjusjeruk}
Status     : ${statusJusJeruk}
Stock      : ${dataJusJeruk.stockStatus}

🥭 Jus Mangga
HARGA BELI : ${Bjusmangga}
HARGA JUAL : ${Sjusmangga}
Status     : ${statusJusMangga}
Stock      : ${dataJusMangga.stockStatus}

🍌 Jus Pisang
HARGA BELI : ${Bjuspisang}
HARGA JUAL : ${Sjuspisang}
Status     : ${statusJusPisang}
Stock      : ${dataJusPisang.stockStatus}

━━━「 *DOMPET KAMU* 」━━━
• Uang    : Rp ${user.money.toLocaleString()}
• Emerald : ${user.emerald}
• Emas    : ${user.emas} gram
• Diamond : ${user.diamond}
• Perak   : ${user.perak}

Ketik: .shop buy <nama item> <jumlah>
`.trim();

    const MakananMenu = `
━━━「 *MAKANAN* 」━━━
🍌 Pisang | 🍇 Anggur | 🥭 Mangga | 🍊 Jeruk | 🍎 Apel
MakananPet | MakananNaga | MakananKyubi | MakananGriffin | dll

Ketik: .shop buy <nama item> <jumlah>
`.trim();

    const AlamMenu = `
━━━「 *ALAM* 」━━━
🪵 Kayu | 🪨 Batu | 🪨 Coal | ⛓️ Iron | 💎 Berlian | 🥇 Emas Batang

Ketik: .shop buy <nama item> <jumlah>
`.trim();

    const BibitMenu = `
━━━「 *BIBIT TANAMAN* 」━━━
🍌 Bibit Pisang | 🍇 Bibit Anggur | 🥭 Bibit Mangga | 🍊 Bibit Jeruk | 🍎 Bibit Apel
🌾 Bibit Padi | Gandum | Wortel | Kentang | Singkong | Ubi Jalar | Tebu

Ketik: .shop buy <nama item> <jumlah>
`.trim();

    const PerhiasanMenu = `
╸╸━━━「 *PERHIASAN* 」━━━╺╺

💎Diamond :
Harga Beli : ${Bdiamond}
Harga Jual : ${Sdiamond}
Status Harga : ${statusDiamond}
               
⬜Perak : 
Harga Beli : ${Bperak}
Harga Jual : ${Sperak}         
Status Harga : ${statusPerak}      
               
🪙Emas :       
Harga Beli : ${Bemasbiasa}
Harga Jual : ${Semasbiasa}
Status Harga : ${statusEmas}
               
❇️Emerald :     
Harga Beli : ${Bemerald}
Harga Jual : ${Semerald}
Status Harga : ${statusEmerald}

━━━「 *DOMPET KAMU* 」━━━
• Uang    : Rp ${user.money.toLocaleString()}
• Emerald : ${user.emerald}
• Emas    : ${user.emas} gram
• Diamond : ${user.diamond}
• Perak   : ${user.perak}

Ketik: .shop buy <nama item> <jumlah>
`.trim();

    // ==========================================
    // LOGIKA COMMAND
    // ==========================================
    let isShop = /^(shop|toko)$/i.test(command);
    let isBuy = /^(buy|beli)$/i.test(command);
    let isSell = /^(sell|jual)$/i.test(command);

    let action = isShop ? (args[0] || '').toLowerCase() : (isBuy ? 'buy' : (isSell ? 'sell' : ''));
    let item = isShop ? (args[1] || '').toLowerCase() : (args[0] || '').toLowerCase();
    let countRaw = isShop ? args[2] : args[1];
    let count = countRaw && countRaw.length > 0 ? Math.max(parseInt(countRaw), 1) : 1;

    if (!action) {
        const first = (args[0] || '').toLowerCase();

        if (first === 'barang') return conn.reply(m.chat, BarangMenu, m);
        if (first === 'jusbuah') return conn.reply(m.chat, JusBuahMenu, m);
        if (first === 'minuman') return conn.reply(m.chat, MinumanMenu, m);
        if (first === 'makanan') return conn.reply(m.chat, MakananMenu, m);
        if (first === 'alam') return conn.reply(m.chat, AlamMenu, m);
        if (first === 'bibit') return conn.reply(m.chat, BibitMenu, m);
        if (first === 'perhiasan') return conn.reply(m.chat, PerhiasanMenu, m);

        return conn.reply(m.chat, Kchat, m);
    }

    const shopItems = {
        'jusanggur': { costType: 'money', B: Bjusanggur, S: Sjusanggur, data: dataJusAnggur, db: 'jusanggur', name: 'Jus Anggur' },
        'jusapel': { costType: 'money', B: Bjusapel, S: Sjusapel, data: dataJusApel, db: 'jusapel', name: 'Jus Apel' },
        'jusjeruk': { costType: 'money', B: Bjusjeruk, S: Sjusjeruk, data: dataJusJeruk, db: 'jusjeruk', name: 'Jus Jeruk' },
        'jusmangga': { costType: 'money', B: Bjusmangga, S: Sjusmangga, data: dataJusMangga, db: 'jusmangga', name: 'Jus Mangga' },
        'juspisang': { costType: 'money', B: Bjuspisang, S: Sjuspisang, data: dataJusPisang, db: 'juspisang', name: 'Jus Pisang' }
    };

    try {
        if (!action) return conn.reply(m.chat, Kchat, m);
        let curItem = shopItems[item];
        if (!curItem) return conn.reply(m.chat, Kchat, m);

        let isUnlimited = !curItem.data || !curItem.data.stock;

        if (action === 'buy') {
            if (!isUnlimited && count > curItem.data.stock) {
                return conn.reply(m.chat, `Stok tidak cukup!`, m);
            }
            let totalCost = curItem.B * count;
            if (user[curItem.costType] >= totalCost) {
                user[curItem.costType] -= totalCost;
                user[curItem.db] = (user[curItem.db] || 0) + count;
                if (!isUnlimited && global.db.data.market[curItem.db]) {
                    global.db.data.market[curItem.db].stock -= count;
                }
                conn.reply(m.chat, `🛒 Berhasil membeli ${count} ${curItem.name}`, m);
            } else {
                conn.reply(m.chat, `❌ ${curItem.costType} tidak cukup.`, m);
            }
        } else if (action === 'sell') {
            let totalGain = curItem.S * count;
            let tax = Math.floor(totalGain * 0.05);
            let finalGain = totalGain - tax;

            if ((user[curItem.db] || 0) >= count) {
                user[curItem.db] -= count;
                user.money += finalGain;
                if (!isUnlimited && global.db.data.market[curItem.db]) {
                    global.db.data.market[curItem.db].stock += count;
                }
                conn.reply(m.chat, `✅ Berhasil menjual ${count} ${curItem.name}\nBersih: ${finalGain.toLocaleString()} Money`, m);
            } else {
                conn.reply(m.chat, `❌ Item tidak cukup.`, m);
            }
        }
    } catch (e) {
        console.error(e);
        conn.reply(m.chat, 'Terjadi kesalahan di sistem Shop.', m);
    }
}

handler.help = ['shop <buy|sell> <item> <jumlah>']
handler.tags = ['rpg']
handler.command = /^(shop|toko|buy|beli|sell|jual)$/i

module.exports = handler;