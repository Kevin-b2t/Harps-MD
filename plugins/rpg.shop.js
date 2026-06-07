let handler  = async (m, { conn, command, args, usedPrefix, owner }) => {
    
    // Inisialisasi Market Server (Database Global)
    if (!global.db.data.market) global.db.data.market = {};

    let d = new Date();
    let jamCounter = Math.floor(d.getTime() / (1000 * 60 * 60));
    let jamDalamHari = d.getHours(); 
    
    function seededRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    // ==========================================
    // FUNGSI HARGA PERHIASAN & CRATE (TETAP SAMA/UNLIMITED)
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
    // FUNGSI EKONOMI GLOBAL (REAL SUPPLY & DEMAND)
    // ==========================================
    function getMarketPrice(itemKey, baseBeli, baseJual, baseStock) {
        if (!global.db.data.market[itemKey]) {
            global.db.data.market[itemKey] = { stock: baseStock };
        }
        let currentStock = global.db.data.market[itemKey].stock;
        let ratio = baseStock / Math.max(1, currentStock);
        
        if (ratio > 3.0) ratio = 3.0; 
        if (ratio < 0.2) ratio = 0.2;

        let beli = Math.max(1, Math.floor(baseBeli * ratio));
        let jual = Math.max(1, Math.floor(baseJual * ratio));
        
        let status = '➖ Stabil';
        if (ratio > 1.3) status = '📈 Langka (Mahal)';
        else if (ratio < 0.8) status = '📉 Melimpah (Murah)';

        return { beli, jual, stock: currentStock, status, stockStatus: currentStock.toLocaleString() };
    }

    // ==========================================
    // DEKLARASI DATA & STOK DARI DATABASE GLOBAL
    // ==========================================
    let dataLimit = getMarketPrice('limit', 15, 10, 50000); let Blimit = dataLimit.beli; let Slimit = dataLimit.jual; let statusLimit = dataLimit.status;
    let dataPet = getMarketPrice('pet', 11, 5, 25000); let Bpet = dataPet.beli; let Spet = dataPet.jual; let statusPet = dataPet.status;
    let dataGarden = getMarketPrice('gardenboxs', 40000, 15000, 10000); let Bgardenboxs = dataGarden.beli; let Sgardenboxs = dataGarden.jual; let statusGarden = dataGarden.status;
    let dataBensin = getMarketPrice('bensin', 6000, 2000, 100000); let BBensin = dataBensin.beli; let SBensin = dataBensin.jual; let statusBensin = dataBensin.status;
    let dataWeap = getMarketPrice('weapon', 120000, 35000, 5000); let BWeap = dataWeap.beli; let SWeap = dataWeap.jual; let statusWeap = dataWeap.status;
    let dataObat = getMarketPrice('obat', 10000, 2500, 50000); let BObat = dataObat.beli; let SObat = dataObat.jual; let statusObat = dataObat.status;
    let dataTiketCoin = getMarketPrice('tiketcoin', 5, 1, 150000); let Btiketcoin = dataTiketCoin.beli; let Stiketcoin = dataTiketCoin.jual; let statusTiketCoin = dataTiketCoin.status;
    let dataHealtMonster = getMarketPrice('healtmonster', 25000, 6000, 20000); let Bhealtmonster = dataHealtMonster.beli; let Shealtmonster = dataHealtMonster.jual; let statusHealtMonster = dataHealtMonster.status;
    let dataPancingan = getMarketPrice('pancingan', 35000, 8000, 15000); let Bpancingan = dataPancingan.beli; let Spancingan = dataPancingan.jual; let statusPancingan = dataPancingan.status;

    let dataBibitPisang = getMarketPrice('bibitpisang', 550, 50, 100000); let Bbibitpisang = dataBibitPisang.beli; let Sbibitpisang = dataBibitPisang.jual; let statusBibitPisang = dataBibitPisang.status;
    let dataBibitAnggur = getMarketPrice('bibitanggur', 550, 50, 100000); let Bbibitanggur = dataBibitAnggur.beli; let Sbibitanggur = dataBibitAnggur.jual; let statusBibitAnggur = dataBibitAnggur.status;
    let dataBibitMangga = getMarketPrice('bibitmangga', 550, 50, 100000); let Bbibitmangga = dataBibitMangga.beli; let Sbibitmangga = dataBibitMangga.jual; let statusBibitMangga = dataBibitMangga.status;
    let dataBibitJeruk = getMarketPrice('bibitjeruk', 550, 50, 100000); let Bbibitjeruk = dataBibitJeruk.beli; let Sbibitjeruk = dataBibitJeruk.jual; let statusBibitJeruk = dataBibitJeruk.status;
    let dataBibitApel = getMarketPrice('bibitapel', 550, 50, 100000); let Bbibitapel = dataBibitApel.beli; let Sbibitapel = dataBibitApel.jual; let statusBibitApel = dataBibitApel.status;
    let dataPadi = getMarketPrice('bibitpadi', 400, 80, 100000); let Bpadi = dataPadi.beli; let Spadi = dataPadi.jual; let statusPadi = dataPadi.status;
    let dataGandum = getMarketPrice('bibitgandum', 450, 100, 100000); let Bgandum = dataGandum.beli; let Sgandum = dataGandum.jual; let statusGandum = dataGandum.status;
    let dataWortel = getMarketPrice('bibitwortel', 500, 120, 100000); let Bwortel = dataWortel.beli; let Swortel = dataWortel.jual; let statusWortel = dataWortel.status;
    let dataKentang = getMarketPrice('bibitkentang', 600, 140, 100000); let Bkentang = dataKentang.beli; let Skentang = dataKentang.jual; let statusKentang = dataKentang.status;
    let dataSingkong = getMarketPrice('bibitsingkong', 350, 70, 100000); let Bsingkong = dataSingkong.beli; let Ssingkong = dataSingkong.jual; let statusSingkong = dataSingkong.status;
    let dataUbiJalar = getMarketPrice('bibitubijalar', 375, 75, 100000); let Bubijalar = dataUbiJalar.beli; let Subijalar = dataUbiJalar.jual; let statusUbiJalar = dataUbiJalar.status;
    let dataTebu = getMarketPrice('bibittebu', 550, 130, 100000); let Btebu = dataTebu.beli; let Stebu = dataTebu.jual; let statusTebu = dataTebu.status;

    let dataPotion = getMarketPrice('potion', 20000, 100, 50000); let potion = dataPotion.beli; let Spotion = dataPotion.jual; let statusPotion = dataPotion.status;
    let dataSampah = getMarketPrice('sampah', 120, 5, 500000); let Bsampah = dataSampah.beli; let Ssampah = dataSampah.jual; let statusSampah = dataSampah.status;
    let dataString = getMarketPrice('string', 50000, 5000, 20000); let Bstring = dataString.beli; let Sstring = dataString.jual; let statusString = dataString.status;
    let dataBotol = getMarketPrice('botol', 300, 50, 150000); let Bbotol = dataBotol.beli; let Sbotol = dataBotol.jual; let statusBotol = dataBotol.status;
    let dataKaleng = getMarketPrice('kaleng', 400, 100, 150000); let Bkaleng = dataKaleng.beli; let Skaleng = dataKaleng.jual; let statusKaleng = dataKaleng.status;
    let dataKardus = getMarketPrice('kardus', 400, 50, 150000); let Bkardus = dataKardus.beli; let Skardus = dataKardus.jual; let statusKardus = dataKardus.status;
    let dataSword = getMarketPrice('sword', 150000, 15000, 5000); let Bsword = dataSword.beli; let Ssword = dataSword.jual; let statusSword = dataSword.status;

    let dataKayu = getMarketPrice('kayu', 1000, 400, 300000); let Bkayu = dataKayu.beli; let Skayu = dataKayu.jual; let statusKayu = dataKayu.status;
    let dataBatu = getMarketPrice('batu', 500, 100, 300000); let Bbatu = dataBatu.beli; let Sbatu = dataBatu.jual; let statusBatu = dataBatu.status;
    let dataCoal = getMarketPrice('coal', 1500, 1000, 150000); let Bcoal = dataCoal.beli; let Scoal = dataCoal.jual; let statusCoal = dataCoal.status;
    let dataIron = getMarketPrice('iron', 20000, 5000, 50000); let Biron = dataIron.beli; let Siron = dataIron.jual; let statusIron = dataIron.status;
    let dataBerlian = getMarketPrice('berlian', 150000, 10000, 10000); let Bberlian = dataBerlian.beli; let Sberlian = dataBerlian.jual; let statusBerlian = dataBerlian.status;
    let dataEmasBatang = getMarketPrice('emasbatang', 250000, 10000, 5000); let Bemasbatang = dataEmasBatang.beli; let Semasbatang = dataEmasBatang.jual; let statusEmasBatang = dataEmasBatang.status;
    let dataEmasMentah = getMarketPrice('emasmentah', 866490, 700000, 18432); let Bemasmentah = dataEmasMentah.beli; let Semasmentah = dataEmasMentah.jual; let statusEmasMentah = dataEmasMentah.status;
    let dataPasir = getMarketPrice('pasir', 250000, 180000, 22150); let Bpasir = dataPasir.beli; let Spasir = dataPasir.jual; let statusPasir = dataPasir.status;
    let dataUranium = getMarketPrice('uranium', 35000, 25000, 16874); let Buranium = dataUranium.beli; let Suranium = dataUranium.jual; let statusUranium = dataUranium.status;

    let dataPisang = getMarketPrice('pisang', 5500, 100, 80000); let Bpisang = dataPisang.beli; let Spisang = dataPisang.jual; let statusPisang = dataPisang.status;
    let dataAnggur = getMarketPrice('anggur', 5500, 150, 80000); let Banggur = dataAnggur.beli; let Sanggur = dataAnggur.jual; let statusAnggur = dataAnggur.status;
    let dataMangga = getMarketPrice('mangga', 4600, 150, 80000); let Bmangga = dataMangga.beli; let Smangga = dataMangga.jual; let statusMangga = dataMangga.status;
    let dataJeruk = getMarketPrice('jeruk', 6000, 300, 80000); let Bjeruk = dataJeruk.beli; let Sjeruk = dataJeruk.jual; let statusJeruk = dataJeruk.status;
    let dataApel = getMarketPrice('apel', 5500, 400, 80000); let Bapel = dataApel.beli; let Sapel = dataApel.jual; let statusApel = dataApel.status;
    let dataMakananPet = getMarketPrice('makananpet', 50000, 500, 20000); let Bmakananpet = dataMakananPet.beli; let Smakananpet = dataMakananPet.jual; let statusMakananPet = dataMakananPet.status;
    let dataMakananNaga = getMarketPrice('makanannaga', 150000, 10000, 5000); let Bmakanannaga = dataMakananNaga.beli; let Smakanannaga = dataMakananNaga.jual; let statusMakananNaga = dataMakananNaga.status;
    let dataMakananKyubi = getMarketPrice('makanankyubi', 150000, 10000, 5000); let Bmakanankyubi = dataMakananKyubi.beli; let Smakanankyubi = dataMakananKyubi.jual; let statusMakananKyubi = dataMakananKyubi.status;
    let dataMakananGriffin = getMarketPrice('makanangriffin', 80000, 5000, 10000); let Bmakanangriffin = dataMakananGriffin.beli; let Smakanangriffin = dataMakananGriffin.jual; let statusMakananGriffin = dataMakananGriffin.status;
    let dataMakananPhonix = getMarketPrice('makananphonix', 80000, 5000, 10000); let Bmakananphonix = dataMakananPhonix.beli; let Smakananphonix = dataMakananPhonix.jual; let statusMakananPhonix = dataMakananPhonix.status;
    let dataMakananCentaur = getMarketPrice('makanancentaur', 150000, 10000, 5000); let Bmakanancentaur = dataMakananCentaur.beli; let Smakanancentaur = dataMakananCentaur.jual; let statusMakananCentaur = dataMakananCentaur.status;

    let dataAqua = getMarketPrice('aqua', 5000, 1000, 100000); let Baqua = dataAqua.beli; let Saqua = dataAqua.jual; let statusAqua = dataAqua.status;
    let dataSusu = getMarketPrice('susu', 6000, 1200, 80000); let Bsusu = dataSusu.beli; let Ssusu = dataSusu.jual; let statusSusu = dataSusu.status;
    let dataMadu = getMarketPrice('madu', 64000, 50000, 21389); let Bmadu = dataMadu.beli; let Smadu = dataMadu.jual; let statusMadu = dataMadu.status;
    let dataUmpan = getMarketPrice('umpan', 1500, 100, 100000); let Bumpan = dataUmpan.beli; let Sumpan = dataUmpan.jual; let statusUmpan = dataUmpan.status;
    let dataAirMineral = getMarketPrice('airmineral', 9900, 7000, 19856); let Bairmineral = dataAirMineral.beli; let Sairmineral = dataAirMineral.jual; let statusAirMineral = dataAirMineral.status;
    let dataTehBotol = getMarketPrice('tehbotol', 9600, 7000, 24301); let Btehbotol = dataTehBotol.beli; let Stehbotol = dataTehBotol.jual; let statusTehBotol = dataTehBotol.status;
    let dataNescafe = getMarketPrice('nescafe', 14400, 10000, 17543); let Bnescafe = dataNescafe.beli; let Snescafe = dataNescafe.jual; let statusNescafe = dataNescafe.status;
    let dataUltraMilk = getMarketPrice('ultramilk', 10000, 7500, 20917); let Bultramilk = dataUltraMilk.beli; let Sultramilk = dataUltraMilk.jual; let statusUltraMilk = dataUltraMilk.status;
    let dataJusAnggur = getMarketPrice('jusanggur', 12000, 9000, 18642); let Bjusanggur = dataJusAnggur.beli; let Sjusanggur = dataJusAnggur.jual; let statusJusAnggur = dataJusAnggur.status;
    let dataJusApel = getMarketPrice('jusapel', 12300, 9200, 23175); let Bjusapel = dataJusApel.beli; let Sjusapel = dataJusApel.jual; let statusJusApel = dataJusApel.status;
    let dataJusJeruk = getMarketPrice('jusjeruk', 12600, 9400, 16089); let Bjusjeruk = dataJusJeruk.beli; let Sjusjeruk = dataJusJeruk.jual; let statusJusJeruk = dataJusJeruk.status;
    let dataJusMangga = getMarketPrice('jusmangga', 12900, 9600, 25421); let Bjusmangga = dataJusMangga.beli; let Sjusmangga = dataJusMangga.jual; let statusJusMangga = dataJusMangga.status;
    let dataJusPisang = getMarketPrice('juspisang', 13300, 10000, 21768); let Bjuspisang = dataJusPisang.beli; let Sjuspisang = dataJusPisang.jual; let statusJusPisang = dataJusPisang.status;

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

    // ==========================================
    // SISTEM PAJAK HARIAN (DAILY TAX 12%)
    // ==========================================
    let tanggalHariIni = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
    if (user.lastTaxDate !== tanggalHariIni) {
        let uangSaatIni = user.money || 0;
        let potonganPajak = Math.floor(uangSaatIni * 0.01); // Pajak 12% dari total uang
        
        if (potonganPajak > 0) {
            user.money -= potonganPajak;
            // Bot akan mengirim pesan peringatan ke player bahwa pajaknya sudah ditarik
            conn.reply(m.chat, `🏛️ *INFO PAJAK HARIAN (1%)*\n\nPemerintah server telah memotong uangmu sebesar *Rp ${potonganPajak.toLocaleString()}* untuk pajak harian.\nSisa uangmu sekarang: Rp ${user.money.toLocaleString()}`, m);
        }
        // Menandai player agar tidak kena pajak lagi di hari yang sama
        user.lastTaxDate = tanggalHariIni;
    }

    // ==========================================
    // MENU KCHAT
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

🥤Potion:
HARGA BELI : ${potion}
HARGA JUAL : ${Spotion}
Status Harga : ${statusPotion}
Info Stock : ${dataPotion.stockStatus}

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

🪙Emas Mentah:
HARGA BELI : ${Bemasmentah}
HARGA JUAL : ${Semasmentah}
Status Harga : ${statusEmasMentah}
Info Stock : ${dataEmasMentah.stockStatus}

🏖️Pasir:
HARGA BELI : ${Bpasir} /kg
HARGA JUAL : ${Spasir} /kg
Status Harga : ${statusPasir}
Info Stock : ${dataPasir.stockStatus}

☢️Uranium:
HARGA BELI : ${Buranium} /gram
HARGA JUAL : ${Suranium} /gram
Status Harga : ${statusUranium}
Info Stock : ${dataUranium.stockStatus}

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
             
🎁 Uncommon: 
HARGA BELI : ${Buncommon} Money
HARGA JUAL : ${Suncommon} Money
Status Harga : ${statusUncommon}

💎 Rare :
HARGA BELI : ${Brare} Money
HARGA JUAL : ${Srare} Money
Status Harga : ${statusRare}
               
🔥 Epic :
HARGA BELI : ${Bepic} Money
HARGA JUAL : ${Sepic} Money
Status Harga : ${statusEpic}
        
🌌 Mythic : 
HARGA BELI : ${Bmythic} Money
HARGA JUAL : ${Smythic} Money
Status Harga : ${statusMythic}
           
👑 Legendary : 
HARGA BELI : ${Blegendary} Money
HARGA JUAL : ${Slegendary} Money
Status Harga : ${statusLegendary}
               
🗝️ Secret : 
HARGA BELI : ${Bsecret} Money
HARGA JUAL : ${Ssecret} Money
Status Harga : ${statusSecret}
            
🌑 Dark : 
HARGA BELI : ${Bdark} Money
HARGA JUAL : ${Sdark} Money
Status Harga : ${statusDark}
          
⚡ Cheat : 
HARGA BELI : ${Bcheat} Money
HARGA JUAL : ${Scheat} Money
Status Harga : ${statusCheat}

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

💧Air Mineral:
HARGA BELI : ${Bairmineral}
HARGA JUAL : ${Sairmineral}
Status Harga : ${statusAirMineral}
Info Stock : ${dataAirMineral.stockStatus}

🍵Teh Botol:
HARGA BELI : ${Btehbotol}
HARGA JUAL : ${Stehbotol}
Status Harga : ${statusTehBotol}
Info Stock : ${dataTehBotol.stockStatus}

☕Kopi Nescafe:
HARGA BELI : ${Bnescafe}
HARGA JUAL : ${Snescafe}
Status Harga : ${statusNescafe}
Info Stock : ${dataNescafe.stockStatus}

🥛Ultra Milk:
HARGA BELI : ${Bultramilk}
HARGA JUAL : ${Sultramilk}
Status Harga : ${statusUltraMilk}
Info Stock : ${dataUltraMilk.stockStatus}

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
HARGA BELI : ${Bmadu} /botol
HARGA JUAL : ${Smadu} /botol
Status Harga : ${statusMadu}
Info Stock : ${dataMadu.stockStatus}

╸╸━━━「 *JUS BUAH* 」━━━╺╺

🍇Jus Anggur:
HARGA BELI : ${Bjusanggur}
HARGA JUAL : ${Sjusanggur}
Status Harga : ${statusJusAnggur}
Info Stock : ${dataJusAnggur.stockStatus}

🍎Jus Apel:
HARGA BELI : ${Bjusapel}
HARGA JUAL : ${Sjusapel}
Status Harga : ${statusJusApel}
Info Stock : ${dataJusApel.stockStatus}

🍊Jus Jeruk:
HARGA BELI : ${Bjusjeruk}
HARGA JUAL : ${Sjusjeruk}
Status Harga : ${statusJusJeruk}
Info Stock : ${dataJusJeruk.stockStatus}

🥭Jus Mangga:
HARGA BELI : ${Bjusmangga}
HARGA JUAL : ${Sjusmangga}
Status Harga : ${statusJusMangga}
Info Stock : ${dataJusMangga.stockStatus}

🍌Jus Pisang:
HARGA BELI : ${Bjuspisang}
HARGA JUAL : ${Sjuspisang}
Status Harga : ${statusJusPisang}
Info Stock : ${dataJusPisang.stockStatus}

> Fishing
🪤Umpan:
HARGA BELI : ${Bumpan}
HARGA JUAL : ${Sumpan}
Status Harga : ${statusUmpan}
Info Stock : ${dataUmpan.stockStatus}

━━━「 *DOMPET KAMU* 」━━━

• *Uang:* Rp ${user.money.toLocaleString()}
• *Emerald:* ${user.emerald}
• *Emas:* ${user.emas} gram
• *Diamond:* ${user.diamond}
• *Perak:* ${user.perak}

=======================
Penggunaan ${usedPrefix}shop <Buy|sell> <item> <jumlah>
Contoh penggunaan: *${usedPrefix}shop buy susu 1*
`.trim()

    // ==========================================
    // LOGIKA TRANSAKSI SMART ROUTER
    // ==========================================
    let isShop = /^(shop|toko)$/i.test(command);
    let isBuy = /^(buy|beli)$/i.test(command);
    let isSell = /^(sell|jual)$/i.test(command);

    let action = isShop ? (args[0] || '').toLowerCase() : (isBuy ? 'buy' : (isSell ? 'sell' : ''));
    let item = isShop ? (args[1] || '').toLowerCase() : (args[0] || '').toLowerCase();
    let countRaw = isShop ? args[2] : args[1];
    let count = countRaw && countRaw.length > 0 ? Math.max(parseInt(countRaw), 1) : 1;

    const shopItems = {
        'limit': { costType: 'diamond', B: Blimit, S: Slimit, data: dataLimit, db: 'limit', name: 'Limit' },
        'pet': { costType: 'money', B: Bpet, S: Spet, data: dataPet, db: 'pet', name: 'Pet' },
        'gardenboxs': { costType: 'money', B: Bgardenboxs, S: Sgardenboxs, data: dataGarden, db: 'gardenboxs', name: 'Gardenboxs' },
        'bensin': { costType: 'money', B: BBensin, S: SBensin, data: dataBensin, db: 'bensin', name: 'Bensin' },
        'weapon': { costType: 'money', B: BWeap, S: SWeap, data: dataWeap, db: 'weapon', name: 'Weapon' },
        'obat': { costType: 'money', B: BObat, S: SObat, data: dataObat, db: 'obat', name: 'Obat' },
        'tiketcoin': { costType: 'money', B: Btiketcoin, S: Stiketcoin, data: dataTiketCoin, db: 'tiketcoin', name: 'Tiket Coin' },
        'healtmonster': { costType: 'money', B: Bhealtmonster, S: Shealtmonster, data: dataHealtMonster, db: 'healtmonster', name: 'Healt Monster' },
        'pancingan': { costType: 'money', B: Bpancingan, S: Spancingan, data: dataPancingan, db: 'pancingan', name: 'Pancingan' },
        
        'bibitpisang': { costType: 'money', B: Bbibitpisang, S: Sbibitpisang, data: dataBibitPisang, db: 'bibitpisang', name: 'Bibit Pisang' },
        'bibitanggur': { costType: 'money', B: Bbibitanggur, S: Sbibitanggur, data: dataBibitAnggur, db: 'bibitanggur', name: 'Bibit Anggur' },
        'bibitmangga': { costType: 'money', B: Bbibitmangga, S: Sbibitmangga, data: dataBibitMangga, db: 'bibitmangga', name: 'Bibit Mangga' },
        'bibitjeruk': { costType: 'money', B: Bbibitjeruk, S: Sbibitjeruk, data: dataBibitJeruk, db: 'bibitjeruk', name: 'Bibit Jeruk' },
        'bibitapel': { costType: 'money', B: Bbibitapel, S: Sbibitapel, data: dataBibitApel, db: 'bibitapel', name: 'Bibit Apel' },
        'bibitpadi': { costType: 'money', B: Bpadi, S: Spadi, data: dataPadi, db: 'bibitpadi', name: 'Bibit Padi' },
        'bibitgandum': { costType: 'money', B: Bgandum, S: Sgandum, data: dataGandum, db: 'bibitgandum', name: 'Bibit Gandum' },
        'bibitwortel': { costType: 'money', B: Bwortel, S: Swortel, data: dataWortel, db: 'bibitwortel', name: 'Bibit Wortel' },
        'bibitkentang': { costType: 'money', B: Bkentang, S: Skentang, data: dataKentang, db: 'bibitkentang', name: 'Bibit Kentang' },
        'bibitsingkong': { costType: 'money', B: Bsingkong, S: Ssingkong, data: dataSingkong, db: 'bibitsingkong', name: 'Bibit Singkong' },
        'bibitubijalar': { costType: 'money', B: Bubijalar, S: Subijalar, data: dataUbiJalar, db: 'bibitubijalar', name: 'Bibit Ubi Jalar' },
        'bibittebu': { costType: 'money', B: Btebu, S: Stebu, data: dataTebu, db: 'bibittebu', name: 'Bibit Tebu' },

        'potion': { costType: 'money', B: potion, S: Spotion, data: dataPotion, db: 'potion', name: 'Potion' },
        'sampah': { costType: 'money', B: Bsampah, S: Ssampah, data: dataSampah, db: 'sampah', name: 'Sampah' },
        'string': { costType: 'money', B: Bstring, S: Sstring, data: dataString, db: 'string', name: 'String' },
        'botol': { costType: 'money', B: Bbotol, S: Sbotol, data: dataBotol, db: 'botol', name: 'Botol' },
        'kaleng': { costType: 'money', B: Bkaleng, S: Skaleng, data: dataKaleng, db: 'kaleng', name: 'Kaleng' },
        'kardus': { costType: 'money', B: Bkardus, S: Skardus, data: dataKardus, db: 'kardus', name: 'Kardus' },
        'sword': { costType: 'money', B: Bsword, S: Ssword, data: dataSword, db: 'sword', name: 'Sword' },

        'kayu': { costType: 'money', B: Bkayu, S: Skayu, data: dataKayu, db: 'kayu', name: 'Kayu' },
        'batu': { costType: 'money', B: Bbatu, S: Sbatu, data: dataBatu, db: 'batu', name: 'Batu' },
        'coal': { costType: 'money', B: Bcoal, S: Scoal, data: dataCoal, db: 'coal', name: 'Coal' },
        'iron': { costType: 'money', B: Biron, S: Siron, data: dataIron, db: 'iron', name: 'Iron' },
        'berlian': { costType: 'money', B: Bberlian, S: Sberlian, data: dataBerlian, db: 'berlian', name: 'Berlian' },
        'emasbatang': { costType: 'money', B: Bemasbatang, S: Semasbatang, data: dataEmasBatang, db: 'emasbatang', name: 'Emas Batang' },
        'emasmentah': { costType: 'money', B: Bemasmentah, S: Semasmentah, data: dataEmasMentah, db: 'emasmentah', name: 'Emas Mentah' },
        'pasir': { costType: 'money', B: Bpasir, S: Spasir, data: dataPasir, db: 'pasir', name: 'Pasir' },
        'uranium': { costType: 'money', B: Buranium, S: Suranium, data: dataUranium, db: 'uranium', name: 'Uranium' },

        'diamond': { costType: 'money', B: Bdiamond, S: Sdiamond, data: null, db: 'diamond', name: 'Diamond' },
        'perak': { costType: 'money', B: Bperak, S: Sperak, data: null, db: 'perak', name: 'Perak' },
        'emas': { costType: 'money', B: Bemasbiasa, S: Semasbiasa, data: null, db: 'emas', name: 'Emas' },
        'emerald': { costType: 'money', B: Bemerald, S: Semerald, data: null, db: 'emerald', name: 'Emerald' },

        'common': { costType: 'money', B: Bcommon, S: Scommon, data: dCommon, db: 'common', name: 'Common Crate' },
        'uncommon': { costType: 'money', B: Buncommon, S: Suncommon, data: dUncommon, db: 'uncommon', name: 'Uncommon Crate' },
        'rare': { costType: 'money', B: Brare, S: Srare, data: dRare, db: 'rare', name: 'Rare Crate' },
        'epic': { costType: 'money', B: Bepic, S: Sepic, data: dEpic, db: 'epic', name: 'Epic Crate' },
        'mythic': { costType: 'money', B: Bmythic, S: Smythic, data: dMythic, db: 'mythic', name: 'Mythic Crate' },
        'legendary': { costType: 'money', B: Blegendary, S: Slegendary, data: dLegendary, db: 'legendary', name: 'Legendary Crate' },
        'secret': { costType: 'money', B: Bsecret, S: Ssecret, data: dSecret, db: 'secret', name: 'Secret Crate' },
        'dark': { costType: 'money', B: Bdark, S: Sdark, data: dDark, db: 'dark', name: 'Dark Crate' },
        'cheat': { costType: 'money', B: Bcheat, S: Scheat, data: dCheat, db: 'cheat', name: 'Cheat Crate' },

        'pisang': { costType: 'money', B: Bpisang, S: Spisang, data: dataPisang, db: 'pisang', name: 'Pisang' },
        'anggur': { costType: 'money', B: Banggur, S: Sanggur, data: dataAnggur, db: 'anggur', name: 'Anggur' },
        'mangga': { costType: 'money', B: Bmangga, S: Smangga, data: dataMangga, db: 'mangga', name: 'Mangga' },
        'jeruk': { costType: 'money', B: Bjeruk, S: Sjeruk, data: dataJeruk, db: 'jeruk', name: 'Jeruk' },
        'apel': { costType: 'money', B: Bapel, S: Sapel, data: dataApel, db: 'apel', name: 'Apel' },
        'makananpet': { costType: 'money', B: Bmakananpet, S: Smakananpet, data: dataMakananPet, db: 'makananpet', name: 'Makanan Pet' },
        'makanannaga': { costType: 'money', B: Bmakanannaga, S: Smakanannaga, data: dataMakananNaga, db: 'makanannaga', name: 'Makanan Naga' },
        'makanankyubi': { costType: 'money', B: Bmakanankyubi, S: Smakanankyubi, data: dataMakananKyubi, db: 'makanankyubi', name: 'Makanan Kyubi' },
        'makanangriffin': { costType: 'money', B: Bmakanangriffin, S: Smakanangriffin, data: dataMakananGriffin, db: 'makanangriffin', name: 'Makanan Griffin' },
        'makananphonix': { costType: 'money', B: Bmakananphonix, S: Smakananphonix, data: dataMakananPhonix, db: 'makananphonix', name: 'Makanan Phonix' },
        'makanancentaur': { costType: 'money', B: Bmakanancentaur, S: Smakanancentaur, data: dataMakananCentaur, db: 'makanancentaur', name: 'Makanan Centaur' },

        'aqua': { costType: 'money', B: Baqua, S: Saqua, data: dataAqua, db: 'aqua', name: 'Aqua' },
        'susu': { costType: 'money', B: Bsusu, S: Ssusu, data: dataSusu, db: 'susu', name: 'Susu' },
        'madu': { costType: 'money', B: Bmadu, S: Smadu, data: dataMadu, db: 'madu', name: 'Madu' },
        'umpan': { costType: 'money', B: Bumpan, S: Sumpan, data: dataUmpan, db: 'umpan', name: 'Umpan' },
        'airmineral': { costType: 'money', B: Bairmineral, S: Sairmineral, data: dataAirMineral, db: 'airmineral', name: 'Air Mineral' },
        'tehbotol': { costType: 'money', B: Btehbotol, S: Stehbotol, data: dataTehBotol, db: 'tehbotol', name: 'Teh Botol' },
        'nescafe': { costType: 'money', B: Bnescafe, S: Snescafe, data: dataNescafe, db: 'nescafe', name: 'Kopi Nescafe' },
        'ultramilk': { costType: 'money', B: Bultramilk, S: Sultramilk, data: dataUltraMilk, db: 'ultramilk', name: 'Ultra Milk' },
        'jusanggur': { costType: 'money', B: Bjusanggur, S: Sjusanggur, data: dataJusAnggur, db: 'jusanggur', name: 'Jus Anggur' },
        'jusapel': { costType: 'money', B: Bjusapel, S: Sjusapel, data: dataJusApel, db: 'jusapel', name: 'Jus Apel' },
        'jusjeruk': { costType: 'money', B: Bjusjeruk, S: Sjusjeruk, data: dataJusJeruk, db: 'jusjeruk', name: 'Jus Jeruk' },
        'jusmangga': { costType: 'money', B: Bjusmangga, S: Sjusmangga, data: dataJusMangga, db: 'jusmangga', name: 'Jus Mangga' },
        'juspisang': { costType: 'money', B: Bjuspisang, S: Sjuspisang, data: dataJusPisang, db: 'juspisang', name: 'Jus Pisang' }
    };

    // ==========================================
    // MENU PER KATEGORI (helper strings)
    // ==========================================
    const menuKebutuhan = `╸╸━━━「 *KEBUTUHAN* 」━━━╺╺
🏷️ Limit        | Beli: ${Blimit} 💎 | Jual: ${Slimit}
🐉 Pet           | Beli: ${Bpet} | Jual: ${Spet} | ${statusPet}
📦 Gardenboxs   | Beli: ${Bgardenboxs} | Jual: ${Sgardenboxs} | ${statusGarden}
⛽ Bensin        | Beli: ${BBensin} | Jual: ${SBensin} | ${statusBensin}
⚔️ Weapon        | Beli: ${BWeap} | Jual: ${SWeap} | ${statusWeap}
💊 Obat          | Beli: ${BObat} | Jual: ${SObat} | ${statusObat}
🎟️ Cupon         | Beli: ${Btiketcoin} 🎫 | Jual: ${Stiketcoin} 🎫
👹 TiketM        | Beli: ${Bhealtmonster} | Jual: ${Shealtmonster} | ${statusHealtMonster}
🎣 Pancingan     | Beli: ${Bpancingan} | Jual: ${Spancingan} | ${statusPancingan}
=======================
Beli: ${usedPrefix}shop buy <item> <jumlah>`;

    const menuBibit = `╸╸━━━「 *BIBIT & TANAMAN* 」━━━╺╺
🍌 Bibit Pisang   | Beli: ${Bbibitpisang} | Jual: ${Sbibitpisang} | ${statusBibitPisang}
🍇 Bibit Anggur   | Beli: ${Bbibitanggur} | Jual: ${Sbibitanggur} | ${statusBibitAnggur}
🥭 Bibit Mangga   | Beli: ${Bbibitmangga} | Jual: ${Sbibitmangga} | ${statusBibitMangga}
🍊 Bibit Jeruk    | Beli: ${Bbibitjeruk} | Jual: ${Sbibitjeruk} | ${statusBibitJeruk}
🍎 Bibit Apel     | Beli: ${Bbibitapel} | Jual: ${Sbibitapel} | ${statusBibitApel}
🌾 Bibit Padi     | Beli: ${Bpadi} | Jual: ${Spadi} | ${statusPadi}
🌾 Bibit Gandum   | Beli: ${Bgandum} | Jual: ${Sgandum} | ${statusGandum}
🥕 Bibit Wortel   | Beli: ${Bwortel} | Jual: ${Swortel} | ${statusWortel}
🥔 Bibit Kentang  | Beli: ${Bkentang} | Jual: ${Skentang} | ${statusKentang}
🍠 Bibit Singkong | Beli: ${Bsingkong} | Jual: ${Ssingkong} | ${statusSingkong}
🍠 Bibit Ubi Jalar| Beli: ${Bubijalar} | Jual: ${Subijalar} | ${statusUbiJalar}
🎋 Bibit Tebu     | Beli: ${Btebu} | Jual: ${Stebu} | ${statusTebu}
=======================
Beli: ${usedPrefix}shop buy bibitpisang 1`;

    const menuBarang = `╸╸━━━「 *BARANG* 」━━━╺╺
🥤 Potion  | Beli: ${potion} | Jual: ${Spotion} | ${statusPotion}
🗑️ Sampah  | Beli: ${Bsampah} | Jual: ${Ssampah} | ${statusSampah}
🧵 String  | Beli: ${Bstring} | Jual: ${Sstring} | ${statusString}
🍾 Botol   | Beli: ${Bbotol} | Jual: ${Sbotol} | ${statusBotol}
🥫 Kaleng  | Beli: ${Bkaleng} | Jual: ${Skaleng} | ${statusKaleng}
📦 Kardus  | Beli: ${Bkardus} | Jual: ${Skardus} | ${statusKardus}
⚔️ Sword   | Beli: ${Bsword} | Jual: ${Ssword} | ${statusSword}
=======================
Beli: ${usedPrefix}shop buy botol 1`;

    const menuAlam = `╸╸━━━「 *ALAM* 」━━━╺╺
🪵 Kayu        | Beli: ${Bkayu} | Jual: ${Skayu} | ${statusKayu}
🪨 Batu        | Beli: ${Bbatu} | Jual: ${Sbatu} | ${statusBatu}
🪨 Coal        | Beli: ${Bcoal} | Jual: ${Scoal} | ${statusCoal}
⛓️ Iron        | Beli: ${Biron} | Jual: ${Siron} | ${statusIron}
💎 Berlian     | Beli: ${Bberlian} | Jual: ${Sberlian} | ${statusBerlian}
🥇 Emas Batang | Beli: ${Bemasbatang} | Jual: ${Semasbatang} | ${statusEmasBatang}
🪙 Emas Mentah | Beli: ${Bemasmentah} | Jual: ${Semasmentah} | ${statusEmasMentah}
🏖️ Pasir       | Beli: ${Bpasir}/kg | Jual: ${Spasir}/kg | ${statusPasir}
☢️ Uranium     | Beli: ${Buranium}/gram | Jual: ${Suranium}/gram | ${statusUranium}
=======================
Beli: ${usedPrefix}shop buy kayu 1`;

    const menuPerhiasan = `╸╸━━━「 *PERHIASAN* 」━━━╺╺
💎 Diamond  | Beli: ${Bdiamond} | Jual: ${Sdiamond} | ${statusDiamond}
⬜ Perak    | Beli: ${Bperak} | Jual: ${Sperak} | ${statusPerak}
🪙 Emas     | Beli: ${Bemasbiasa} | Jual: ${Semasbiasa} | ${statusEmas}
❇️ Emerald  | Beli: ${Bemerald} | Jual: ${Semerald} | ${statusEmerald}
=======================
Beli: ${usedPrefix}shop buy emas 1`;

    const menuCrate = `╸╸━━━「 *LIST CRATE* 」━━━╺╺
🎁 Common    | Beli: ${Bcommon} | Jual: ${Scommon} | ${statusCommon}
🎁 Uncommon  | Beli: ${Buncommon} | Jual: ${Suncommon} | ${statusUncommon}
💎 Rare      | Beli: ${Brare} | Jual: ${Srare} | ${statusRare}
🔥 Epic      | Beli: ${Bepic} | Jual: ${Sepic} | ${statusEpic}
🌌 Mythic    | Beli: ${Bmythic} | Jual: ${Smythic} | ${statusMythic}
👑 Legendary | Beli: ${Blegendary} | Jual: ${Slegendary} | ${statusLegendary}
🗝️ Secret    | Beli: ${Bsecret} | Jual: ${Ssecret} | ${statusSecret}
🌑 Dark      | Beli: ${Bdark} | Jual: ${Sdark} | ${statusDark}
⚡ Cheat     | Beli: ${Bcheat} | Jual: ${Scheat} | ${statusCheat}
=======================
Beli: ${usedPrefix}shop buy common 1`;

    const menuMakanan = `╸╸━━━「 *MAKANAN* 」━━━╺╺
🍌 Pisang          | Beli: ${Bpisang} | Jual: ${Spisang} | ${statusPisang}
🍇 Anggur          | Beli: ${Banggur} | Jual: ${Sanggur} | ${statusAnggur}
🥭 Mangga          | Beli: ${Bmangga} | Jual: ${Smangga} | ${statusMangga}
🍊 Jeruk           | Beli: ${Bjeruk} | Jual: ${Sjeruk} | ${statusJeruk}
🍎 Apel            | Beli: ${Bapel} | Jual: ${Sapel} | ${statusApel}
🫔 MakananPet      | Beli: ${Bmakananpet} | Jual: ${Smakananpet} | ${statusMakananPet}
🥩 MakananNaga     | Beli: ${Bmakanannaga} | Jual: ${Smakanannaga} | ${statusMakananNaga}
🥩 MakananKyubi    | Beli: ${Bmakanankyubi} | Jual: ${Smakanankyubi} | ${statusMakananKyubi}
🥩 MakananGriffin  | Beli: ${Bmakanangriffin} | Jual: ${Smakanangriffin} | ${statusMakananGriffin}
🥩 MakananPhonix   | Beli: ${Bmakananphonix} | Jual: ${Smakananphonix} | ${statusMakananPhonix}
🥩 MakananCentaur  | Beli: ${Bmakanancentaur} | Jual: ${Smakanancentaur} | ${statusMakananCentaur}
=======================
Beli: ${usedPrefix}shop buy pisang 1`;

    const menuMinuman = `╸╸━━━「 *MINUMAN* 」━━━╺╺
💧 Air Mineral  | Beli: ${Bairmineral} | Jual: ${Sairmineral} | ${statusAirMineral}
🍵 Teh Botol    | Beli: ${Btehbotol} | Jual: ${Stehbotol} | ${statusTehBotol}
☕ Kopi Nescafe | Beli: ${Bnescafe} | Jual: ${Snescafe} | ${statusNescafe}
🥛 Ultra Milk   | Beli: ${Bultramilk} | Jual: ${Sultramilk} | ${statusUltraMilk}
🫗 Aqua         | Beli: ${Baqua} | Jual: ${Saqua} | ${statusAqua}
🥛 Susu         | Beli: ${Bsusu} | Jual: ${Ssusu} | ${statusSusu}
🍯 Madu         | Beli: ${Bmadu}/botol | Jual: ${Smadu}/botol | ${statusMadu}
=======================
Beli: ${usedPrefix}shop buy airmineral 1`;

    const menuJus = `╸╸━━━「 *JUS BUAH* 」━━━╺╺
🍇 Jus Anggur | Beli: ${Bjusanggur} | Jual: ${Sjusanggur} | ${statusJusAnggur}
🍎 Jus Apel   | Beli: ${Bjusapel} | Jual: ${Sjusapel} | ${statusJusApel}
🍊 Jus Jeruk  | Beli: ${Bjusjeruk} | Jual: ${Sjusjeruk} | ${statusJusJeruk}
🥭 Jus Mangga | Beli: ${Bjusmangga} | Jual: ${Sjusmangga} | ${statusJusMangga}
🍌 Jus Pisang | Beli: ${Bjuspisang} | Jual: ${Sjuspisang} | ${statusJusPisang}
=======================
Beli: ${usedPrefix}shop buy jusanggur 1`;

    const menuSemua = `━━━「 *DAFTAR SEMUA ITEM TOKO* 」━━━

${menuKebutuhan}

${menuBibit}

${menuBarang}

${menuAlam}

${menuPerhiasan}

${menuCrate}

${menuMakanan}

${menuMinuman}

${menuJus}

> Fishing
🪤 Umpan | Beli: ${Bumpan} | Jual: ${Sumpan} | ${statusUmpan}

━━━「 *DOMPET KAMU* 」━━━
• *Uang:* Rp ${user.money.toLocaleString()}
• *Emerald:* ${user.emerald}
• *Emas:* ${user.emas} gram
• *Diamond:* ${user.diamond}
• *Perak:* ${user.perak}
=======================
Ketik ${usedPrefix}shop <type> untuk lihat per kategori
Contoh: ${usedPrefix}shop alam | ${usedPrefix}shop minuman | ${usedPrefix}shop crate`;

    // ==========================================
    // SPECIAL COMMANDS: .shop <type> / .shop semua / .shop jus buah
    // ==========================================
    if (isShop) {
        let arg0 = (args[0] || '').toLowerCase();
        let arg1 = (args[1] || '').toLowerCase();

        if (arg0 === 'semua' || arg0 === 'all') return conn.reply(m.chat, menuSemua, m);
        if (arg0 === 'kebutuhan') return conn.reply(m.chat, menuKebutuhan, m);
        if (arg0 === 'bibit' || arg0 === 'tanaman') return conn.reply(m.chat, menuBibit, m);
        if (arg0 === 'barang') return conn.reply(m.chat, menuBarang, m);
        if (arg0 === 'alam') return conn.reply(m.chat, menuAlam, m);
        if (arg0 === 'perhiasan') return conn.reply(m.chat, menuPerhiasan, m);
        if (arg0 === 'crate') return conn.reply(m.chat, menuCrate, m);
        if (arg0 === 'makanan') return conn.reply(m.chat, menuMakanan, m);
        if (arg0 === 'minuman') return conn.reply(m.chat, menuMinuman, m);
        if (arg0 === 'jus' && arg1 === 'buah') return conn.reply(m.chat, menuJus, m);
        if (arg0 === 'jus') return conn.reply(m.chat, menuJus, m);
    }

    try {
        if (!action) return conn.reply(m.chat, Kchat, m);
        let curItem = shopItems[item];
        
        if (!curItem) return conn.reply(m.chat, Kchat, m);

        let isUnlimited = !curItem.data || !curItem.data.stock;

        // EKSEKUSI PEMBELIAN
        if (action === 'buy') {
            if (!isUnlimited && count > curItem.data.stock) {
                return conn.reply(m.chat, `Stok Server tidak cukup! Sisa stok saat ini hanya: ${curItem.data.stock.toLocaleString()}`, m);
            }

            let totalCost = curItem.B * count;
            if (user[curItem.costType] >= totalCost) {
                user[curItem.costType] -= totalCost;
                user[curItem.db] = (user[curItem.db] || 0) + count;
                
                if (!isUnlimited && global.db.data.market[curItem.db]) {
                    global.db.data.market[curItem.db].stock -= count;
                }

                conn.reply(m.chat, `🛒 *TRANSAKSI SUKSES*\nKamu membeli ${count} ${curItem.name} seharga ${totalCost.toLocaleString()} ${curItem.costType}.`, m);
            } else {
                conn.reply(m.chat, `❌ Maaf, ${curItem.costType} kamu tidak cukup untuk membeli item ini.`, m);
            }

        // EKSEKUSI PENJUALAN + PAJAK TRANSAKSI (5%)
        } else if (action === 'sell') {
            let totalGain = curItem.S * count;
            let tax = Math.floor(totalGain * 0.05); // Pajak Penjualan tetap 5%
            let finalGain = totalGain - tax;

            if ((user[curItem.db] || 0) >= count) {
                user[curItem.db] -= count;
                user.money += finalGain; 
                
                if (!isUnlimited && global.db.data.market[curItem.db]) {
                    global.db.data.market[curItem.db].stock += count;
                }

                conn.reply(m.chat, `⚖️ *TRANSAKSI SUKSES*\nKamu menjual ${count} ${curItem.name}.\nGross: +${totalGain.toLocaleString()} Money\nPajak Admin (5%): -${tax.toLocaleString()}\n*Diterima Bersih: ${finalGain.toLocaleString()} Money*`, m);
            } else {
                conn.reply(m.chat, `❌ Item ${curItem.name} kamu tidak cukup untuk dijual sebanyak itu.`, m);
            }
        }

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, 'Terjadi kesalahan di sistem Shop.', m);
    }
}

handler.help = ['shop <buy|sell> <item> <jumlah>', 'shop semua', 'shop <kebutuhan|bibit|barang|alam|perhiasan|crate|makanan|minuman|jus>']
handler.tags = ['rpg']
handler.command = /^(shop|toko|buy|beli|sell|jual)$/i

module.exports = handler;
