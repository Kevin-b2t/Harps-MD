let handler  = async (m, { conn, command, args, usedPrefix, owner }) => {
    
    if (!global.db.data.market) global.db.data.market = {};

    let d = new Date();
    let jamCounter = Math.floor(d.getTime() / (1000 * 60 * 60));
    let jamDalamHari = d.getHours(); 
    
    function seededRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

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

    function getMarketPrice(itemKey, baseBeli, baseJual, minStock, maxStock) {
        minStock = 16443;
        maxStock = 19653;
        if (!global.db.data.market[itemKey]) {
            let randomStock = Math.floor(Math.random() * (maxStock - minStock + 1)) + minStock;
            global.db.data.market[itemKey] = { stock: randomStock };
        }
        let currentStock = global.db.data.market[itemKey].stock;
        let baseStock = Math.floor((minStock + maxStock) / 2);
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

    // ================= DATA KEBUTUHAN =================
    let dataLimit = getMarketPrice('limit', 15, 10, 40000, 60000); let Blimit = dataLimit.beli; let Slimit = dataLimit.jual; let statusLimit = dataLimit.status;
    let dataPet = getMarketPrice('pet', 11, 5, 20000, 30000); let Bpet = dataPet.beli; let Spet = dataPet.jual; let statusPet = dataPet.status;
    let dataGarden = getMarketPrice('gardenboxs', 40000, 15000, 8000, 12000); let Bgardenboxs = dataGarden.beli; let Sgardenboxs = dataGarden.jual; let statusGarden = dataGarden.status;
    let dataBensin = getMarketPrice('bensin', 6000, 2000, 80000, 120000); let BBensin = dataBensin.beli; let SBensin = dataBensin.jual; let statusBensin = dataBensin.status;
    let dataWeap = getMarketPrice('weapon', 120000, 35000, 4000, 6000); let BWeap = dataWeap.beli; let SWeap = dataWeap.jual; let statusWeap = dataWeap.status;
    let dataObat = getMarketPrice('obat', 10000, 2500, 40000, 60000); let BObat = dataObat.beli; let SObat = dataObat.jual; let statusObat = dataObat.status;
    let dataTiketCoin = getMarketPrice('tiketcoin', 5, 1, 120000, 180000); let Btiketcoin = dataTiketCoin.beli; let Stiketcoin = dataTiketCoin.jual; let statusTiketCoin = dataTiketCoin.status;
    let dataHealtMonster = getMarketPrice('healtmonster', 25000, 6000, 15000, 25000); let Bhealtmonster = dataHealtMonster.beli; let Shealtmonster = dataHealtMonster.jual; let statusHealtMonster = dataHealtMonster.status;
    let dataPancingan = getMarketPrice('pancingan', 35000, 8000, 10000, 20000); let Bpancingan = dataPancingan.beli; let Spancingan = dataPancingan.jual; let statusPancingan = dataPancingan.status;

    // ================= DATA BIBIT =================
    let dataBibitPisang = getMarketPrice('bibitpisang', 550, 50, 80000, 120000); let Bbibitpisang = dataBibitPisang.beli; let Sbibitpisang = dataBibitPisang.jual; let statusBibitPisang = dataBibitPisang.status;
    let dataBibitAnggur = getMarketPrice('bibitanggur', 550, 50, 80000, 120000); let Bbibitanggur = dataBibitAnggur.beli; let Sbibitanggur = dataBibitAnggur.jual; let statusBibitAnggur = dataBibitAnggur.status;
    let dataBibitMangga = getMarketPrice('bibitmangga', 550, 50, 80000, 120000); let Bbibitmangga = dataBibitMangga.beli; let Sbibitmangga = dataBibitMangga.jual; let statusBibitMangga = dataBibitMangga.status;
    let dataBibitJeruk = getMarketPrice('bibitjeruk', 550, 50, 80000, 120000); let Bbibitjeruk = dataBibitJeruk.beli; let Sbibitjeruk = dataBibitJeruk.jual; let statusBibitJeruk = dataBibitJeruk.status;
    let dataBibitApel = getMarketPrice('bibitapel', 550, 50, 80000, 120000); let Bbibitapel = dataBibitApel.beli; let Sbibitapel = dataBibitApel.jual; let statusBibitApel = dataBibitApel.status;
    let dataPadi = getMarketPrice('bibitpadi', 400, 80, 80000, 120000); let Bpadi = dataPadi.beli; let Spadi = dataPadi.jual; let statusPadi = dataPadi.status;
    let dataGandum = getMarketPrice('bibitgandum', 450, 100, 80000, 120000); let Bgandum = dataGandum.beli; let Sgandum = dataGandum.jual; let statusGandum = dataGandum.status;
    let dataWortel = getMarketPrice('bibitwortel', 500, 120, 80000, 120000); let Bwortel = dataWortel.beli; let Swortel = dataWortel.jual; let statusWortel = dataWortel.status;
    let dataKentang = getMarketPrice('bibitkentang', 600, 140, 80000, 120000); let Bkentang = dataKentang.beli; let Skentang = dataKentang.jual; let statusKentang = dataKentang.status;
    let dataSingkong = getMarketPrice('bibitsingkong', 350, 70, 80000, 120000); let Bsingkong = dataSingkong.beli; let Ssingkong = dataSingkong.jual; let statusSingkong = dataSingkong.status;
    let dataUbiJalar = getMarketPrice('bibitubijalar', 375, 75, 80000, 120000); let Bubijalar = dataUbiJalar.beli; let Subijalar = dataUbiJalar.jual; let statusUbiJalar = dataUbiJalar.status;
    let dataTebu = getMarketPrice('bibittebu', 550, 130, 80000, 120000); let Btebu = dataTebu.beli; let Stebu = dataTebu.jual; let statusTebu = dataTebu.status;
    let dataBibitCabai = getMarketPrice('bibitcabai', 600, 120, 80000, 120000); let Bbibitcabai = dataBibitCabai.beli; let Sbibitcabai = dataBibitCabai.jual; let statusBibitCabai = dataBibitCabai.status;
    let dataBibitTomat = getMarketPrice('bibittomat', 550, 110, 80000, 120000); let Bbibittomat = dataBibitTomat.beli; let Sbibittomat = dataBibitTomat.jual; let statusBibitTomat = dataBibitTomat.status;
    let dataBibitBawang = getMarketPrice('bibitbawang', 500, 100, 80000, 120000); let Bbibitbawang = dataBibitBawang.beli; let Sbibitbawang = dataBibitBawang.jual; let statusBibitBawang = dataBibitBawang.status;
    let dataBibitTerong = getMarketPrice('bibitterong', 450, 90, 80000, 120000); let Bbibitterong = dataBibitTerong.beli; let Sbibitterong = dataBibitTerong.jual; let statusBibitTerong = dataBibitTerong.status;
    let dataBibitJagung = getMarketPrice('bibitjagung', 700, 140, 80000, 120000); let Bbibitjagung = dataBibitJagung.beli; let Sbibitjagung = dataBibitJagung.jual; let statusBibitJagung = dataBibitJagung.status;
    let dataBibitKedelai = getMarketPrice('bibitkedelai', 650, 130, 80000, 120000); let Bbibitkedelai = dataBibitKedelai.beli; let Sbibitkedelai = dataBibitKedelai.jual; let statusBibitKedelai = dataBibitKedelai.status;
    let dataBibitSemangka = getMarketPrice('bibitsemangka', 800, 160, 80000, 120000); let Bbibitsemangka = dataBibitSemangka.beli; let Sbibitsemangka = dataBibitSemangka.jual; let statusBibitSemangka = dataBibitSemangka.status;
    let dataBibitMelon = getMarketPrice('bibitmelon', 850, 170, 80000, 120000); let Bbibitmelon = dataBibitMelon.beli; let Sbibitmelon = dataBibitMelon.jual; let statusBibitMelon = dataBibitMelon.status;
    let dataBibitStroberi = getMarketPrice('bibitstroberi', 900, 180, 80000, 120000); let Bbibitstroberi = dataBibitStroberi.beli; let Sbibitstroberi = dataBibitStroberi.jual; let statusBibitStroberi = dataBibitStroberi.status;
    let dataBibitNanas = getMarketPrice('bibitnanas', 750, 150, 80000, 120000); let Bbibitnanas = dataBibitNanas.beli; let Sbibitnanas = dataBibitNanas.jual; let statusBibitNanas = dataBibitNanas.status;
    let dataBibitKelapa = getMarketPrice('bibitkelapa', 1000, 200, 80000, 120000); let Bbibitkelapa = dataBibitKelapa.beli; let Sbibitkelapa = dataBibitKelapa.jual; let statusBibitKelapa = dataBibitKelapa.status;
    let dataBibitDurian = getMarketPrice('bibitdurian', 1500, 300, 80000, 120000); let Bbibitdurian = dataBibitDurian.beli; let Sbibitdurian = dataBibitDurian.jual; let statusBibitDurian = dataBibitDurian.status;
    let dataBibitPepaya = getMarketPrice('bibitpepaya', 600, 120, 80000, 120000); let Bbibitpepaya = dataBibitPepaya.beli; let Sbibitpepaya = dataBibitPepaya.jual; let statusBibitPepaya = dataBibitPepaya.status;
    let dataBibitAlpukat = getMarketPrice('bibitalpukat', 800, 160, 80000, 120000); let Bbibitalpukat = dataBibitAlpukat.beli; let Sbibitalpukat = dataBibitAlpukat.jual; let statusBibitAlpukat = dataBibitAlpukat.status;
    let dataBibitKopi = getMarketPrice('bibitkopi', 700, 140, 80000, 120000); let Bbibitkopi = dataBibitKopi.beli; let Sbibitkopi = dataBibitKopi.jual; let statusBibitKopi = dataBibitKopi.status;
    let dataBibitKakao = getMarketPrice('bibitkakao', 750, 150, 80000, 120000); let Bbibitkakao = dataBibitKakao.beli; let Sbibitkakao = dataBibitKakao.jual; let statusBibitKakao = dataBibitKakao.status;
    let dataBibitVanili = getMarketPrice('bibitvanili', 2000, 400, 80000, 120000); let Bbibitvanili = dataBibitVanili.beli; let Sbibitvanili = dataBibitVanili.jual; let statusBibitVanili = dataBibitVanili.status;
    let dataBibitKangkung = getMarketPrice('bibitkangkung', 300, 60, 80000, 120000); let Bbibitkangkung = dataBibitKangkung.beli; let Sbibitkangkung = dataBibitKangkung.jual; let statusBibitKangkung = dataBibitKangkung.status;
    let dataBibitSawi = getMarketPrice('bibitsawi', 300, 60, 80000, 120000); let Bbibitsawi = dataBibitSawi.beli; let Sbibitsawi = dataBibitSawi.jual; let statusBibitSawi = dataBibitSawi.status;
    let dataBibitBayam = getMarketPrice('bibitbayam', 300, 60, 80000, 120000); let Bbibitbayam = dataBibitBayam.beli; let Sbibitbayam = dataBibitBayam.jual; let statusBibitBayam = dataBibitBayam.status;
    let dataBibitKol = getMarketPrice('bibitkol', 400, 80, 80000, 120000); let Bbibitkol = dataBibitKol.beli; let Sbibitkol = dataBibitKol.jual; let statusBibitKol = dataBibitKol.status;
    let dataBibitBrokoli = getMarketPrice('bibitbrokoli', 500, 100, 80000, 120000); let Bbibitbrokoli = dataBibitBrokoli.beli; let Sbibitbrokoli = dataBibitBrokoli.jual; let statusBibitBrokoli = dataBibitBrokoli.status;
    let dataBibitKetimun = getMarketPrice('bibitketimun', 450, 90, 80000, 120000); let Bbibitketimun = dataBibitKetimun.beli; let Sbibitketimun = dataBibitKetimun.jual; let statusBibitKetimun = dataBibitKetimun.status;
    let dataBibitLombok = getMarketPrice('bibitlombok', 600, 120, 80000, 120000); let Bbibitlombok = dataBibitLombok.beli; let Sbibitlombok = dataBibitLombok.jual; let statusBibitLombok = dataBibitLombok.status;
    let dataBibitKacangPanjang = getMarketPrice('bibitkacangpanjang', 450, 90, 80000, 120000); let Bbibitkacangpanjang = dataBibitKacangPanjang.beli; let Sbibitkacangpanjang = dataBibitKacangPanjang.jual; let statusBibitKacangPanjang = dataBibitKacangPanjang.status;

    // ================= DATA BARANG =================
    let dataPotion = getMarketPrice('potion', 20000, 100, 40000, 60000); let potion = dataPotion.beli; let Spotion = dataPotion.jual; let statusPotion = dataPotion.status;
    let dataSampah = getMarketPrice('sampah', 120, 5, 400000, 600000); let Bsampah = dataSampah.beli; let Ssampah = dataSampah.jual; let statusSampah = dataSampah.status;
    let dataString = getMarketPrice('string', 50000, 5000, 15000, 25000); let Bstring = dataString.beli; let Sstring = dataString.jual; let statusString = dataString.status;
    let dataBotol = getMarketPrice('botol', 300, 50, 120000, 180000); let Bbotol = dataBotol.beli; let Sbotol = dataBotol.jual; let statusBotol = dataBotol.status;
    let dataKaleng = getMarketPrice('kaleng', 400, 100, 120000, 180000); let Bkaleng = dataKaleng.beli; let Skaleng = dataKaleng.jual; let statusKaleng = dataKaleng.status;
    let dataKardus = getMarketPrice('kardus', 400, 50, 120000, 180000); let Bkardus = dataKardus.beli; let Skardus = dataKardus.jual; let statusKardus = dataKardus.status;
    let dataSword = getMarketPrice('sword', 150000, 15000, 4000, 6000); let Bsword = dataSword.beli; let Ssword = dataSword.jual; let statusSword = dataSword.status;
    let dataPlastik = getMarketPrice('plastik', 300, 50, 120000, 180000); let Bplastik = dataPlastik.beli; let Splastik = dataPlastik.jual; let statusPlastik = dataPlastik.status;
    let dataKain = getMarketPrice('kain', 400, 80, 120000, 180000); let Bkain = dataKain.beli; let Skain = dataKain.jual; let statusKain = dataKain.status;
    let dataPaku = getMarketPrice('paku', 150, 25, 120000, 180000); let Bpaku = dataPaku.beli; let Spaku = dataPaku.jual; let statusPaku = dataPaku.status;
    let dataBaterai = getMarketPrice('baterai', 1200, 250, 80000, 120000); let Bbaterai = dataBaterai.beli; let Sbaterai = dataBaterai.jual; let statusBaterai = dataBaterai.status;
    let dataBanBekas = getMarketPrice('banbekas', 900, 150, 80000, 120000); let Bbanbekas = dataBanBekas.beli; let Sbanbekas = dataBanBekas.jual; let statusBanBekas = dataBanBekas.status;
    let dataKaret = getMarketPrice('karet', 500, 100, 120000, 180000); let Bkaret = dataKaret.beli; let Skaret = dataKaret.jual; let statusKaret = dataKaret.status;
    let dataTembaga = getMarketPrice('tembaga', 3500, 700, 60000, 90000); let Btembaga = dataTembaga.beli; let Stembaga = dataTembaga.jual; let statusTembaga = dataTembaga.status;
    let dataAluminium = getMarketPrice('aluminium', 4500, 900, 60000, 90000); let Baluminium = dataAluminium.beli; let Saluminium = dataAluminium.jual; let statusAluminium = dataAluminium.status;
    let dataBaut = getMarketPrice('baut', 200, 40, 120000, 180000); let Bbaut = dataBaut.beli; let Sbaut = dataBaut.jual; let statusBaut = dataBaut.status;
    let dataMur = getMarketPrice('mur', 200, 40, 120000, 180000); let Bmur = dataMur.beli; let Smur = dataMur.jual; let statusMur = dataMur.status;
    let dataGear = getMarketPrice('gear', 1500, 300, 80000, 120000); let Bgear = dataGear.beli; let Sgear = dataGear.jual; let statusGear = dataGear.status;
    let dataRantai = getMarketPrice('rantai', 1200, 240, 80000, 120000); let Brantai = dataRantai.beli; let Srantai = dataRantai.jual; let statusRantai = dataRantai.status;
    let dataMesinBekas = getMarketPrice('mesinbekas', 5000, 1000, 40000, 60000); let Bmesinbekas = dataMesinBekas.beli; let Smesinbekas = dataMesinBekas.jual; let statusMesinBekas = dataMesinBekas.status;
    let dataOli = getMarketPrice('oli', 800, 150, 100000, 150000); let Boli = dataOli.beli; let Soli = dataOli.jual; let statusOli = dataOli.status;
    let dataPcb = getMarketPrice('pcb', 2000, 400, 60000, 90000); let Bpcb = dataPcb.beli; let Spcb = dataPcb.jual; let statusPcb = dataPcb.status;
    let dataKabel = getMarketPrice('kabel', 600, 120, 100000, 150000); let Bkabel = dataKabel.beli; let Skabel = dataKabel.jual; let statusKabel = dataKabel.status;
    let dataKaca = getMarketPrice('kaca', 1000, 200, 80000, 120000); let Bkaca = dataKaca.beli; let Skaca = dataKaca.jual; let statusKaca = dataKaca.status;
    let dataKeramik = getMarketPrice('keramik', 1200, 250, 80000, 120000); let Bkeramik = dataKeramik.beli; let Skeramik = dataKeramik.jual; let statusKeramik = dataKeramik.status;
    let dataSemen = getMarketPrice('semen', 2500, 500, 60000, 90000); let Bsemen = dataSemen.beli; let Ssemen = dataSemen.jual; let statusSemen = dataSemen.status;
    let dataCat = getMarketPrice('cat', 1500, 300, 80000, 120000); let Bcat = dataCat.beli; let Scat = dataCat.jual; let statusCat = dataCat.status;
    let dataKoinKuno = getMarketPrice('koinkuno', 10000, 2000, 20000, 40000); let Bkoinkuno = dataKoinKuno.beli; let Skoinkuno = dataKoinKuno.jual; let statusKoinKuno = dataKoinKuno.status;
    let dataJamRusak = getMarketPrice('jamrusak', 3000, 600, 40000, 60000); let Bjamrusak = dataJamRusak.beli; let Sjamrusak = dataJamRusak.jual; let statusJamRusak = dataJamRusak.status;
    let dataPegas = getMarketPrice('pegas', 400, 80, 100000, 150000); let Bpegas = dataPegas.beli; let Spegas = dataPegas.jual; let statusPegas = dataPegas.status;
    let dataBesiBekas = getMarketPrice('besibekas', 800, 150, 100000, 150000); let Bbesibekas = dataBesiBekas.beli; let Sbesibekas = dataBesiBekas.jual; let statusBesiBekas = dataBesiBekas.status;
    let dataLampu = getMarketPrice('lampu', 600, 120, 100000, 150000); let Blampu = dataLampu.beli; let Slampu = dataLampu.jual; let statusLampu = dataLampu.status;

    // ================= DATA ALAM =================
    // (Sumber daya alam & bahan mentah masih pakai sistem stock/getMarketPrice)
    let dataEmasMentah = getMarketPrice('emasmentah', 866490, 700000, 15000, 22000); let Bemasmentah = dataEmasMentah.beli; let Semasmentah = dataEmasMentah.jual; let statusEmasMentah = dataEmasMentah.status;
    let dataKayu = getMarketPrice('kayu', 1000, 400, 250000, 350000); let Bkayu = dataKayu.beli; let Skayu = dataKayu.jual; let statusKayu = dataKayu.status;
    let dataBatu = getMarketPrice('batu', 500, 100, 250000, 350000); let Bbatu = dataBatu.beli; let Sbatu = dataBatu.jual; let statusBatu = dataBatu.status;
    let dataCoal = getMarketPrice('coal', 1500, 1000, 120000, 180000); let Bcoal = dataCoal.beli; let Scoal = dataCoal.jual; let statusCoal = dataCoal.status;
    let dataIron = getMarketPrice('iron', 20000, 5000, 40000, 60000); let Biron = dataIron.beli; let Siron = dataIron.jual; let statusIron = dataIron.status;
    let dataPasir = getMarketPrice('pasir', 250000, 180000, 18000, 26000); let Bpasir = dataPasir.beli; let Spasir = dataPasir.jual; let statusPasir = dataPasir.status;
    let dataUranium = getMarketPrice('uranium', 35000, 25000, 13000, 20000); let Buranium = dataUranium.beli; let Suranium = dataUranium.jual; let statusUranium = dataUranium.status;
    let dataTembagaOre = getMarketPrice('tembagaore', 8000, 2000, 60000, 90000); let Btembagaore = dataTembagaOre.beli; let Stembagaore = dataTembagaOre.jual; let statusTembagaOre = dataTembagaOre.status;
    let dataPerakOre = getMarketPrice('perakore', 12000, 3000, 50000, 80000); let Bperakore = dataPerakOre.beli; let Sperakore = dataPerakOre.jual; let statusPerakOre = dataPerakOre.status;
    let dataTimah = getMarketPrice('timah', 6000, 1500, 70000, 100000); let Btimah = dataTimah.beli; let Stimah = dataTimah.jual; let statusTimah = dataTimah.status;
    let dataNikel = getMarketPrice('nikel', 15000, 4000, 40000, 70000); let Bnikel = dataNikel.beli; let Snikel = dataNikel.jual; let statusNikel = dataNikel.status;
    let dataKuarsa = getMarketPrice('kuarsa', 20000, 5000, 30000, 50000); let Bkuarsa = dataKuarsa.beli; let Skuarsa = dataKuarsa.jual; let statusKuarsa = dataKuarsa.status;
    let dataKristal = getMarketPrice('kristal', 50000, 15000, 10000, 30000); let Bkristal = dataKristal.beli; let Skristal = dataKristal.jual; let statusKristal = dataKristal.status;
    let dataObsidian = getMarketPrice('obsidian', 35000, 9000, 20000, 40000); let Bobsidian = dataObsidian.beli; let Sobsidian = dataObsidian.jual; let statusObsidian = dataObsidian.status;
    let dataBelerang = getMarketPrice('belerang', 5000, 1000, 60000, 90000); let Bbelerang = dataBelerang.beli; let Sbelerang = dataBelerang.jual; let statusBelerang = dataBelerang.status;
    let dataMarmer = getMarketPrice('marmer', 12000, 3000, 40000, 70000); let Bmarmer = dataMarmer.beli; let Smarmer = dataMarmer.jual; let statusMarmer = dataMarmer.status;
    let dataGranit = getMarketPrice('granit', 10000, 2500, 40000, 70000); let Bgranit = dataGranit.beli; let Sgranit = dataGranit.jual; let statusGranit = dataGranit.status;
    let dataGaram = getMarketPrice('garam', 2000, 500, 80000, 120000); let Bgaram = dataGaram.beli; let Sgaram = dataGaram.jual; let statusGaram = dataGaram.status;
    let dataTanahLiat = getMarketPrice('tanahliat', 1500, 300, 80000, 120000); let Btanahliat = dataTanahLiat.beli; let Stanahliat = dataTanahLiat.jual; let statusTanahLiat = dataTanahLiat.status;
    let dataBatuKapur = getMarketPrice('batukapur', 3000, 600, 60000, 90000); let Bbatukapur = dataBatuKapur.beli; let Sbatukapur = dataBatuKapur.jual; let statusBatuKapur = dataBatuKapur.status;
    let dataBatuPermata = getMarketPrice('batupermata', 80000, 20000, 8000, 15000); let Bbatupermata = dataBatuPermata.beli; let Sbatupermata = dataBatuPermata.jual; let statusBatuPermata = dataBatuPermata.status;
    let dataFosil = getMarketPrice('fosil', 45000, 10000, 15000, 25000); let Bfosil = dataFosil.beli; let Sfosil = dataFosil.jual; let statusFosil = dataFosil.status;
    let dataMutiara = getMarketPrice('mutiara', 60000, 15000, 10000, 20000); let Bmutiara = dataMutiara.beli; let Smutiara = dataMutiara.jual; let statusMutiara = dataMutiara.status;
    let dataKarang = getMarketPrice('karang', 5000, 1000, 50000, 80000); let Bkarang = dataKarang.beli; let Skarang = dataKarang.jual; let statusKarang = dataKarang.status;
    let dataGipsum = getMarketPrice('gipsum', 4000, 800, 60000, 90000); let Bgipsum = dataGipsum.beli; let Sgipsum = dataGipsum.jual; let statusGipsum = dataGipsum.status;
    let dataMagnetit = getMarketPrice('magnetit', 18000, 4500, 30000, 50000); let Bmagnetit = dataMagnetit.beli; let Smagnetit = dataMagnetit.jual; let statusMagnetit = dataMagnetit.status;
    let dataBauksit = getMarketPrice('bauksit', 14000, 3500, 40000, 60000); let Bbauksit = dataBauksit.beli; let Sbauksit = dataBauksit.jual; let statusBauksit = dataBauksit.status;
    let dataPlatinaOre = getMarketPrice('platinaore', 35000, 8000, 20000, 40000); let Bplatinaore = dataPlatinaOre.beli; let Splatinaore = dataPlatinaOre.jual; let statusPlatinaOre = dataPlatinaOre.status;
    let dataTitaniumOre = getMarketPrice('titaniumore', 40000, 10000, 15000, 30000); let Btitaniumore = dataTitaniumOre.beli; let Stitaniumore = dataTitaniumOre.jual; let statusTitaniumOre = dataTitaniumOre.status;
    let dataLitium = getMarketPrice('litium', 25000, 6000, 25000, 45000); let Blitium = dataLitium.beli; let Slitium = dataLitium.jual; let statusLitium = dataLitium.status;
    let dataZamrudMentah = getMarketPrice('zamrudmentah', 65000, 15000, 10000, 20000); let Bzamrudmentah = dataZamrudMentah.beli; let Szamrudmentah = dataZamrudMentah.jual; let statusZamrudMentah = dataZamrudMentah.status;
    let dataRubiMentah = getMarketPrice('rubimentah', 70000, 18000, 10000, 20000); let Brubimentah = dataRubiMentah.beli; let Srubimentah = dataRubiMentah.jual; let statusRubiMentah = dataRubiMentah.status;

    // ================= DATA PERLENGKAPAN =================
    // Catatan: Jika 'sword' sudah ada di DATA BARANG, kamu bisa menghapusnya di sana agar tidak dobel.
    let dataPickaxe = getMarketPrice('pickaxe', 15000, 5000, 10000, 20000); let Bpickaxe = dataPickaxe.beli; let Spickaxe = dataPickaxe.jual; let statusPickaxe = dataPickaxe.status;
    let dataKatana = getMarketPrice('katana', 200000, 25000, 3000, 5000); let Bkatana = dataKatana.beli; let Skatana = dataKatana.jual; let statusKatana = dataKatana.status;
    let dataAxe = getMarketPrice('axe', 15000, 5000, 10000, 20000); let Baxe = dataAxe.beli; let Saxe = dataAxe.jual; let statusAxe = dataAxe.status;
    let dataTrident = getMarketPrice('trident', 250000, 30000, 2000, 4000); let Btrident = dataTrident.beli; let Strident = dataTrident.jual; let statusTrident = dataTrident.status;
    let dataBow = getMarketPrice('bow', 50000, 10000, 5000, 10000); let Bbow = dataBow.beli; let Sbow = dataBow.jual; let statusBow = dataBow.status;
    let dataPisau = getMarketPrice('pisau', 10000, 2000, 15000, 25000); let Bpisau = dataPisau.beli; let Spisau = dataPisau.jual; let statusPisau = dataPisau.status;
    let dataFishingrod = getMarketPrice('fishingrod', 15000, 3000, 10000, 20000); let Bfishingrod = dataFishingrod.beli; let Sfishingrod = dataFishingrod.jual; let statusFishingrod = dataFishingrod.status;
    let dataArmor = getMarketPrice('armor', 350000, 50000, 1000, 3000); let Barmor = dataArmor.beli; let Sarmor = dataArmor.jual; let statusArmor = dataArmor.status;
    let dataShield = getMarketPrice('shield', 200000, 25000, 2000, 5000); let Bshield = dataShield.beli; let Sshield = dataShield.jual; let statusShield = dataShield.status;
    let dataHelmet = getMarketPrice('helmet', 150000, 20000, 3000, 6000); let Bhelmet = dataHelmet.beli; let Shelmet = dataHelmet.jual; let statusHelmet = dataHelmet.status;

    // ================= DATA SENJATA =================
    let dataTombak = getMarketPrice('tombak', 50000000, 2500000, 100, 500); let Btombak = dataTombak.beli; let Stombak = dataTombak.jual; let statusTombak = dataTombak.status;
    let dataBusurSenjata = getMarketPrice('busur', 10000000, 500000, 1000, 2000); let Bbusursenjata = dataBusurSenjata.beli; let Sbusursenjata = dataBusurSenjata.jual; let statusBusurSenjata = dataBusurSenjata.status;
    let dataAnakPanah = getMarketPrice('anakpanah', 8000000, 400000, 5000, 15000); let Banakpanah = dataAnakPanah.beli; let Sanakpanah = dataAnakPanah.jual; let statusAnakPanah = dataAnakPanah.status;
    let dataAmmo = getMarketPrice('ammo', 3500000, 1750000, 10000, 30000); let Bammo = dataAmmo.beli; let Sammo = dataAmmo.jual; let statusAmmo = dataAmmo.status;
    let dataGlock = getMarketPrice('glock', 3000000, 1500000, 500, 1000); let Bglock = dataGlock.beli; let Sglock = dataGlock.jual; let statusGlock = dataGlock.status;
    let dataBeretta = getMarketPrice('beretta', 3500000, 1750000, 500, 1000); let Bberetta = dataBeretta.beli; let Sberetta = dataBeretta.jual; let statusBeretta = dataBeretta.status;
    let dataRevolver = getMarketPrice('revolver', 4000000, 2000000, 500, 1000); let Brevolver = dataRevolver.beli; let Srevolver = dataRevolver.jual; let statusRevolver = dataRevolver.status;
    let dataDeagle = getMarketPrice('deagle', 4500000, 2250000, 400, 800); let Bdeagle = dataDeagle.beli; let Sdeagle = dataDeagle.jual; let statusDeagle = dataDeagle.status;
    let dataMac10 = getMarketPrice('mac10', 4000000, 2000000, 400, 800); let Bmac10 = dataMac10.beli; let Smac10 = dataMac10.jual; let statusMac10 = dataMac10.status;
    let dataVector = getMarketPrice('vector', 4200000, 2100000, 400, 800); let Bvector = dataVector.beli; let Svector = dataVector.jual; let statusVector = dataVector.status;
    let dataUmp45 = getMarketPrice('ump45', 4500000, 2250000, 400, 800); let Bump45 = dataUmp45.beli; let Sump45 = dataUmp45.jual; let statusUmp45 = dataUmp45.status;
    let dataPp19bizon = getMarketPrice('pp19bizon', 4800000, 2400000, 400, 800); let Bpp19bizon = dataPp19bizon.beli; let Spp19bizon = dataPp19bizon.jual; let statusPp19bizon = dataPp19bizon.status;
    let dataMp5 = getMarketPrice('mp5', 5000000, 2500000, 300, 700); let Bmp5 = dataMp5.beli; let Smp5 = dataMp5.jual; let statusMp5 = dataMp5.status;
    let dataUzi = getMarketPrice('uzi', 5500000, 2750000, 300, 700); let Buzi = dataUzi.beli; let Suzi = dataUzi.jual; let statusUzi = dataUzi.status;
    let dataP90 = getMarketPrice('p90', 6400000, 3200000, 200, 500); let Bp90 = dataP90.beli; let Sp90 = dataP90.jual; let statusP90 = dataP90.status;
    let dataAk47 = getMarketPrice('ak47', 6400000, 3200000, 200, 500); let Bak47 = dataAk47.beli; let Sak47 = dataAk47.jual; let statusAk47 = dataAk47.status;
    let dataM4 = getMarketPrice('m4', 6500000, 3250000, 200, 500); let Bm4 = dataM4.beli; let Sm4 = dataM4.jual; let statusM4 = dataM4.status;
    let dataQbz95 = getMarketPrice('qbz95', 7500000, 3750000, 200, 500); let Bqbz95 = dataQbz95.beli; let Sqbz95 = dataQbz95.jual; let statusQbz95 = dataQbz95.status;
    let dataAr15 = getMarketPrice('ar15', 7700000, 3850000, 150, 400); let Bar15 = dataAr15.beli; let Sar15 = dataAr15.jual; let statusAr15 = dataAr15.status;
    let dataG36c = getMarketPrice('g36c', 8000000, 4000000, 150, 400); let Bg36c = dataG36c.beli; let Sg36c = dataG36c.jual; let statusG36c = dataG36c.status;
    let dataAek971 = getMarketPrice('aek971', 8200000, 4100000, 150, 400); let Baek971 = dataAek971.beli; let Saek971 = dataAek971.jual; let statusAek971 = dataAek971.status;
    let dataM16 = getMarketPrice('m16', 8400000, 4200000, 150, 400); let Bm16 = dataM16.beli; let Sm16 = dataM16.jual; let statusM16 = dataM16.status;
    let dataHk416 = getMarketPrice('hk416', 8500000, 4250000, 150, 400); let Bhk416 = dataHk416.beli; let Shk416 = dataHk416.jual; let statusHk416 = dataHk416.status;
    let dataScar = getMarketPrice('scar', 9000000, 4500000, 100, 300); let Bscar = dataScar.beli; let Sscar = dataScar.jual; let statusScar = dataScar.status;
    let dataFamas = getMarketPrice('famas', 9000000, 4500000, 100, 300); let Bfamas = dataFamas.beli; let Sfamas = dataFamas.jual; let statusFamas = dataFamas.status;
    let dataAug = getMarketPrice('aug', 9400000, 4700000, 100, 300); let Baug = dataAug.beli; let Saug = dataAug.jual; let statusAug = dataAug.status;
    let dataFnfal = getMarketPrice('fnfal', 9500000, 4750000, 100, 300); let Bfnfal = dataFnfal.beli; let Sfnfal = dataFnfal.jual; let statusFnfal = dataFnfal.status;
    let dataSpas12 = getMarketPrice('spas12', 8500000, 4250000, 100, 300); let Bspas12 = dataSpas12.beli; let Sspas12 = dataSpas12.jual; let statusSpas12 = dataSpas12.status;
    let dataBenellim4 = getMarketPrice('benellim4', 10000000, 5000000, 100, 300); let Bbenellim4 = dataBenellim4.beli; let Sbenellim4 = dataBenellim4.jual; let statusBenellim4 = dataBenellim4.status;
    let dataSaiga12 = getMarketPrice('saiga12', 11000000, 5500000, 80, 250); let Bsaiga12 = dataSaiga12.beli; let Ssaiga12 = dataSaiga12.jual; let statusSaiga12 = dataSaiga12.status;
    let dataAa12 = getMarketPrice('aa12', 12000000, 6000000, 80, 200); let Baa12 = dataAa12.beli; let Saa12 = dataAa12.jual; let statusAa12 = dataAa12.status;
    let dataRemington700 = getMarketPrice('remington700', 25000000, 12500000, 50, 150); let Bremington700 = dataRemington700.beli; let Sremington700 = dataRemington700.jual; let statusRemington700 = dataRemington700.status;
    let dataM24 = getMarketPrice('m24', 40000000, 20000000, 50, 100); let Bm24 = dataM24.beli; let Sm24 = dataM24.jual; let statusM24 = dataM24.status;
    let dataM40 = getMarketPrice('m40', 40000000, 20000000, 50, 100); let Bm40 = dataM40.beli; let Sm40 = dataM40.jual; let statusM40 = dataM40.status;
    let dataL96 = getMarketPrice('l96', 45000000, 22500000, 40, 90); let Bl96 = dataL96.beli; let Sl96 = dataL96.jual; let statusL96 = dataL96.status;
    let dataDragunovsvd = getMarketPrice('dragunovsvd', 88000000, 44000000, 30, 80); let Bdragunovsvd = dataDragunovsvd.beli; let Sdragunovsvd = dataDragunovsvd.jual; let statusDragunovsvd = dataDragunovsvd.status;
    let dataBarrettm82 = getMarketPrice('barrettm82', 99000000, 49500000, 20, 60); let Bbarrettm82 = dataBarrettm82.beli; let Sbarrettm82 = dataBarrettm82.jual; let statusBarrettm82 = dataBarrettm82.status;
    let dataIntervention = getMarketPrice('intervention', 120000000, 60000000, 20, 50); let Bintervention = dataIntervention.beli; let Sintervention = dataIntervention.jual; let statusIntervention = dataIntervention.status;
    let dataCheytacm200 = getMarketPrice('cheytacm200', 130000000, 65000000, 15, 40); let Bcheytacm200 = dataCheytacm200.beli; let Scheytacm200 = dataCheytacm200.jual; let statusCheytacm200 = dataCheytacm200.status;
    let dataAwm = getMarketPrice('awm', 150000000, 75000000, 10, 30); let Bawm = dataAwm.beli; let Sawm = dataAwm.jual; let statusAwm = dataAwm.status;
    let dataPkm = getMarketPrice('pkm', 55000000, 27500000, 50, 100); let Bpkm = dataPkm.beli; let Spkm = dataPkm.jual; let statusPkm = dataPkm.status;
    let dataM249 = getMarketPrice('m249', 60000000, 30000000, 40, 90); let Bm249 = dataM249.beli; let Sm249 = dataM249.jual; let statusM249 = dataM249.status;
    let dataMg42 = getMarketPrice('mg42', 70000000, 35000000, 30, 80); let Bmg42 = dataMg42.beli; let Smg42 = dataMg42.jual; let statusMg42 = dataMg42.status;
    let dataRpg7 = getMarketPrice('rpg7', 85000000, 42500000, 20, 50); let Brpg7 = dataRpg7.beli; let Srpg7 = dataRpg7.jual; let statusRpg7 = dataRpg7.status;
    let dataMinigun = getMarketPrice('minigun', 150000000, 75000000, 10, 30); let Bminigun = dataMinigun.beli; let Sminigun = dataMinigun.jual; let statusMinigun = dataMinigun.status;
    let dataRubyrevolver = getMarketPrice('rubyrevolver', 300000000, 150000000, 5, 15); let Brubyrevolver = dataRubyrevolver.beli; let Srubyrevolver = dataRubyrevolver.jual; let statusRubyrevolver = dataRubyrevolver.status;
    let dataDiamondrifle = getMarketPrice('diamondrifle', 500000000, 250000000, 3, 10); let Bdiamondrifle = dataDiamondrifle.beli; let Sdiamondrifle = dataDiamondrifle.jual; let statusDiamondrifle = dataDiamondrifle.status;
    let dataEmeraldsniper = getMarketPrice('emeraldsniper', 750000000, 375000000, 2, 8); let Bemeraldsniper = dataEmeraldsniper.beli; let Semeraldsniper = dataEmeraldsniper.jual; let statusEmeraldsniper = dataEmeraldsniper.status;
    let dataSapphirecannon = getMarketPrice('sapphirecannon', 1000000000, 500000000, 1, 5); let Bsapphirecannon = dataSapphirecannon.beli; let Ssapphirecannon = dataSapphirecannon.jual; let statusSapphirecannon = dataSapphirecannon.status;

    // ================= DATA PERHIASAN =================
    // (Perhiasan sekarang full fluktuatif tanpa sistem Info Stock)
    let pEmas = getStatusPasarItem(1); let statusEmas = pEmas.statusPasar; let Bemasbiasa = Math.floor(1545000 + (1545000 * pEmas.persentase)); let Semasbiasa = Math.floor(1296000 + (1296000 * pEmas.persentase));
    let pDiamond = getStatusPasarItem(2); let statusDiamond = pDiamond.statusPasar; let Bdiamond = Math.floor(5810000 + (5810000 * pDiamond.persentase)); let Sdiamond = Math.floor(4081000 + (4081000 * pDiamond.persentase));
    let pPerak = getStatusPasarItem(3); let statusPerak = pPerak.statusPasar; let Bperak = Math.floor(1009000 + (1009000 * pPerak.persentase)); let Sperak = Math.floor(891000 + (891000 * pPerak.persentase));
    let pEmerald = getStatusPasarItem(4); let statusEmerald = pEmerald.statusPasar; let Bemerald = Math.floor(11000000 + (11000000 * pEmerald.persentase)); let Semerald = Math.floor(9000000 + (9000000 * pEmerald.persentase));
    
    let pBerlian = getStatusPasarItem(5); let statusBerlian = pBerlian.statusPasar; let Bberlian = Math.floor(150000 + (150000 * pBerlian.persentase)); let Sberlian = Math.max(1, Math.floor(10000 + (10000 * pBerlian.persentase)));
    let pEmasBatang = getStatusPasarItem(6); let statusEmasBatang = pEmasBatang.statusPasar; let Bemasbatang = Math.floor(250000 + (250000 * pEmasBatang.persentase)); let Semasbatang = Math.max(1, Math.floor(10000 + (10000 * pEmasBatang.persentase)));
    let pPerakBatang = getStatusPasarItem(7); let statusPerakBatang = pPerakBatang.statusPasar; let Bperakbatang = Math.floor(150000 + (150000 * pPerakBatang.persentase)); let Sperakbatang = Math.max(1, Math.floor(7000 + (7000 * pPerakBatang.persentase)));
    let pRuby = getStatusPasarItem(8); let statusRuby = pRuby.statusPasar; let Bruby = Math.floor(1800000 + (1800000 * pRuby.persentase)); let Sruby = Math.max(1, Math.floor(1200000 + (1200000 * pRuby.persentase)));
    let pSapphire = getStatusPasarItem(9); let statusSapphire = pSapphire.statusPasar; let Bsapphire = Math.floor(1900000 + (1900000 * pSapphire.persentase)); let Ssapphire = Math.max(1, Math.floor(1300000 + (1300000 * pSapphire.persentase)));
    let pTopaz = getStatusPasarItem(10); let statusTopaz = pTopaz.statusPasar; let Btopaz = Math.floor(1200000 + (1200000 * pTopaz.persentase)); let Stopaz = Math.max(1, Math.floor(800000 + (800000 * pTopaz.persentase)));
    let pAmethyst = getStatusPasarItem(11); let statusAmethyst = pAmethyst.statusPasar; let Bamethyst = Math.floor(1400000 + (1400000 * pAmethyst.persentase)); let Samethyst = Math.max(1, Math.floor(950000 + (950000 * pAmethyst.persentase)));
    let pOpal = getStatusPasarItem(12); let statusOpal = pOpal.statusPasar; let Bopal = Math.floor(1100000 + (1100000 * pOpal.persentase)); let Sopal = Math.max(1, Math.floor(750000 + (750000 * pOpal.persentase)));
    let pAquamarine = getStatusPasarItem(13); let statusAquamarine = pAquamarine.statusPasar; let Baquamarine = Math.floor(1600000 + (1600000 * pAquamarine.persentase)); let Saquamarine = Math.max(1, Math.floor(1100000 + (1100000 * pAquamarine.persentase)));
    let pGarnet = getStatusPasarItem(14); let statusGarnet = pGarnet.statusPasar; let Bgarnet = Math.floor(1300000 + (1300000 * pGarnet.persentase)); let Sgarnet = Math.max(1, Math.floor(900000 + (900000 * pGarnet.persentase)));
    let pJade = getStatusPasarItem(15); let statusJade = pJade.statusPasar; let Bjade = Math.floor(2500000 + (2500000 * pJade.persentase)); let Sjade = Math.max(1, Math.floor(1800000 + (1800000 * pJade.persentase)));
    let pOnyx = getStatusPasarItem(16); let statusOnyx = pOnyx.statusPasar; let Bonyx = Math.floor(1500000 + (1500000 * pOnyx.persentase)); let Sonyx = Math.max(1, Math.floor(1000000 + (1000000 * pOnyx.persentase)));
    let pTurquoise = getStatusPasarItem(17); let statusTurquoise = pTurquoise.statusPasar; let Bturquoise = Math.floor(900000 + (900000 * pTurquoise.persentase)); let Sturquoise = Math.max(1, Math.floor(600000 + (600000 * pTurquoise.persentase)));
    let pAlexandrite = getStatusPasarItem(18); let statusAlexandrite = pAlexandrite.statusPasar; let Balexandrite = Math.floor(4500000 + (4500000 * pAlexandrite.persentase)); let Salexandrite = Math.max(1, Math.floor(3200000 + (3200000 * pAlexandrite.persentase)));
    let pMoonstone = getStatusPasarItem(19); let statusMoonstone = pMoonstone.statusPasar; let Bmoonstone = Math.floor(1700000 + (1700000 * pMoonstone.persentase)); let Smoonstone = Math.max(1, Math.floor(1150000 + (1150000 * pMoonstone.persentase)));
    let pBlackDiamond = getStatusPasarItem(20); let statusBlackDiamond = pBlackDiamond.statusPasar; let Bblackdiamond = Math.floor(8500000 + (8500000 * pBlackDiamond.persentase)); let Sblackdiamond = Math.max(1, Math.floor(6000000 + (6000000 * pBlackDiamond.persentase)));
    let pRedDiamond = getStatusPasarItem(21); let statusRedDiamond = pRedDiamond.statusPasar; let Breddiamond = Math.floor(10000000 + (10000000 * pRedDiamond.persentase)); let Sreddiamond = Math.max(1, Math.floor(7500000 + (7500000 * pRedDiamond.persentase)));
    let pPlatinum = getStatusPasarItem(22); let statusPlatinum = pPlatinum.statusPasar; let Bplatinum = Math.floor(5000000 + (5000000 * pPlatinum.persentase)); let Splatinum = Math.max(1, Math.floor(3500000 + (3500000 * pPlatinum.persentase)));

    // ================= DATA MAKANAN =================
    let dataPisang = getMarketPrice('pisang', 5500, 100, 65000, 95000); let Bpisang = dataPisang.beli; let Spisang = dataPisang.jual; let statusPisang = dataPisang.status;
    let dataAnggur = getMarketPrice('anggur', 5500, 150, 65000, 95000); let Banggur = dataAnggur.beli; let Sanggur = dataAnggur.jual; let statusAnggur = dataAnggur.status;
    let dataMangga = getMarketPrice('mangga', 4600, 150, 65000, 95000); let Bmangga = dataMangga.beli; let Smangga = dataMangga.jual; let statusMangga = dataMangga.status;
    let dataJeruk = getMarketPrice('jeruk', 6000, 300, 65000, 95000); let Bjeruk = dataJeruk.beli; let Sjeruk = dataJeruk.jual; let statusJeruk = dataJeruk.status;
    let dataApel = getMarketPrice('apel', 5500, 400, 65000, 95000); let Bapel = dataApel.beli; let Sapel = dataApel.jual; let statusApel = dataApel.status;
    let dataMakananPet = getMarketPrice('makananpet', 50000, 500, 15000, 25000); let Bmakananpet = dataMakananPet.beli; let Smakananpet = dataMakananPet.jual; let statusMakananPet = dataMakananPet.status;
    let dataMakananNaga = getMarketPrice('makanannaga', 150000, 10000, 4000, 6000); let Bmakanannaga = dataMakananNaga.beli; let Smakanannaga = dataMakananNaga.jual; let statusMakananNaga = dataMakananNaga.status;
    let dataMakananKyubi = getMarketPrice('makanankyubi', 150000, 10000, 4000, 6000); let Bmakanankyubi = dataMakananKyubi.beli; let Smakanankyubi = dataMakananKyubi.jual; let statusMakananKyubi = dataMakananKyubi.status;
    let dataMakananGriffin = getMarketPrice('makanangriffin', 80000, 5000, 8000, 12000); let Bmakanangriffin = dataMakananGriffin.beli; let Smakanangriffin = dataMakananGriffin.jual; let statusMakananGriffin = dataMakananGriffin.status;
    let dataMakananPhonix = getMarketPrice('makananphonix', 80000, 5000, 8000, 12000); let Bmakananphonix = dataMakananPhonix.beli; let Smakananphonix = dataMakananPhonix.jual; let statusMakananPhonix = dataMakananPhonix.status;
    let dataMakananCentaur = getMarketPrice('makanancentaur', 150000, 10000, 4000, 6000); let Bmakanancentaur = dataMakananCentaur.beli; let Smakanancentaur = dataMakananCentaur.jual; let statusMakananCentaur = dataMakananCentaur.status;
    
    // ================= DATA MINUMAN =================
    let dataAqua = getMarketPrice('aqua', 5000, 1000, 80000, 120000); let Baqua = dataAqua.beli; let Saqua = dataAqua.jual; let statusAqua = dataAqua.status;
    let dataSusu = getMarketPrice('susu', 6000, 1200, 65000, 95000); let Bsusu = dataSusu.beli; let Ssusu = dataSusu.jual; let statusSusu = dataSusu.status;
    let dataMadu = getMarketPrice('madu', 64000, 50000, 17000, 25000); let Bmadu = dataMadu.beli; let Smadu = dataMadu.jual; let statusMadu = dataMadu.status;
    let dataUmpan = getMarketPrice('umpan', 1500, 100, 80000, 120000); let Bumpan = dataUmpan.beli; let Sumpan = dataUmpan.jual; let statusUmpan = dataUmpan.status;
    let dataAirMineral = getMarketPrice('airmineral', 9900, 7000, 16000, 24000); let Bairmineral = dataAirMineral.beli; let Sairmineral = dataAirMineral.jual; let statusAirMineral = dataAirMineral.status;
    let dataTehBotol = getMarketPrice('tehbotol', 9600, 7000, 20000, 28000); let Btehbotol = dataTehBotol.beli; let Stehbotol = dataTehBotol.jual; let statusTehBotol = dataTehBotol.status;
    let dataNescafe = getMarketPrice('nescafe', 14400, 10000, 14000, 21000); let Bnescafe = dataNescafe.beli; let Snescafe = dataNescafe.jual; let statusNescafe = dataNescafe.status;
    let dataUltraMilk = getMarketPrice('ultramilk', 10000, 7500, 17000, 25000); let Bultramilk = dataUltraMilk.beli; let Sultramilk = dataUltraMilk.jual; let statusUltraMilk = dataUltraMilk.status;
    let dataJusAnggur = getMarketPrice('jusanggur', 12000, 9000, 15000, 22000); let Bjusanggur = dataJusAnggur.beli; let Sjusanggur = dataJusAnggur.jual; let statusJusAnggur = dataJusAnggur.status;
    let dataJusApel = getMarketPrice('jusapel', 12300, 9200, 19000, 27000); let Bjusapel = dataJusApel.beli; let Sjusapel = dataJusApel.jual; let statusJusApel = dataJusApel.status;
    let dataJusJeruk = getMarketPrice('jusjeruk', 12600, 9400, 13000, 20000); let Bjusjeruk = dataJusJeruk.beli; let Sjusjeruk = dataJusJeruk.jual; let statusJusJeruk = dataJusJeruk.status;
    let dataJusMangga = getMarketPrice('jusmangga', 12900, 9600, 21000, 29000); let Bjusmangga = dataJusMangga.beli; let Sjusmangga = dataJusMangga.jual; let statusJusMangga = dataJusMangga.status;
    let dataJusPisang = getMarketPrice('juspisang', 13300, 10000, 18000, 25000); let Bjuspisang = dataJusPisang.beli; let Sjuspisang = dataJusPisang.jual; let statusJusPisang = dataJusPisang.status;
    let dataEsJeruk = getMarketPrice('esjeruk', 8000, 4000, 30000, 50000); let Besjeruk = dataEsJeruk.beli; let Sesjeruk = dataEsJeruk.jual; let statusEsJeruk = dataEsJeruk.status;
    let dataEsKelapa = getMarketPrice('eskelapa', 10000, 5000, 30000, 50000); let Beskelapa = dataEsKelapa.beli; let Seskelapa = dataEsKelapa.jual; let statusEsKelapa = dataEsKelapa.status;
    let dataKopiHitam = getMarketPrice('kopihitam', 7000, 3000, 40000, 60000); let Bkopihitam = dataKopiHitam.beli; let Skopihitam = dataKopiHitam.jual; let statusKopiHitam = dataKopiHitam.status;
    let dataKopiSusu = getMarketPrice('kopisusu', 9000, 4500, 35000, 55000); let Bkopisusu = dataKopiSusu.beli; let Skopisusu = dataKopiSusu.jual; let statusKopiSusu = dataKopiSusu.status;
    let dataCappuccino = getMarketPrice('cappuccino', 15000, 7500, 20000, 40000); let Bcappuccino = dataCappuccino.beli; let Scappuccino = dataCappuccino.jual; let statusCappuccino = dataCappuccino.status;
    let dataLatte = getMarketPrice('latte', 16000, 8000, 20000, 40000); let Blatte = dataLatte.beli; let Slatte = dataLatte.jual; let statusLatte = dataLatte.status;
    let dataMocha = getMarketPrice('mocha', 17000, 8500, 20000, 40000); let Bmocha = dataMocha.beli; let Smocha = dataMocha.jual; let statusMocha = dataMocha.status;
    let dataTehManis = getMarketPrice('tehmanis', 5000, 2500, 50000, 80000); let Btehmanis = dataTehManis.beli; let Stehmanis = dataTehManis.jual; let statusTehManis = dataTehManis.status;
    let dataTehHijau = getMarketPrice('tehhijau', 8000, 4000, 30000, 50000); let Btehhijau = dataTehHijau.beli; let Stehhijau = dataTehHijau.jual; let statusTehHijau = dataTehHijau.status;
    let dataTehTarik = getMarketPrice('tehtarik', 10000, 5000, 30000, 50000); let Btehtarik = dataTehTarik.beli; let Stehtarik = dataTehTarik.jual; let statusTehTarik = dataTehTarik.status;
    let dataJusStroberi = getMarketPrice('jusstroberi', 13500, 10200, 18000, 25000); let Bjusstroberi = dataJusStroberi.beli; let Sjusstroberi = dataJusStroberi.jual; let statusJusStroberi = dataJusStroberi.status;
    let dataJusMelon = getMarketPrice('jusmelon', 13000, 9800, 18000, 25000); let Bjusmelon = dataJusMelon.beli; let Sjusmelon = dataJusMelon.jual; let statusJusMelon = dataJusMelon.status;
    let dataJusSemangka = getMarketPrice('jussemangka', 12500, 9300, 18000, 25000); let Bjussemangka = dataJusSemangka.beli; let Sjussemangka = dataJusSemangka.jual; let statusJusSemangka = dataJusSemangka.status;
    let dataJusDurian = getMarketPrice('jusdurian', 18000, 13000, 10000, 20000); let Bjusdurian = dataJusDurian.beli; let Sjusdurian = dataJusDurian.jual; let statusJusDurian = dataJusDurian.status;
    let dataJusPepaya = getMarketPrice('juspepaya', 11000, 8000, 20000, 30000); let Bjuspepaya = dataJusPepaya.beli; let Sjuspepaya = dataJusPepaya.jual; let statusJusPepaya = dataJusPepaya.status;
    let dataJusAlpukat = getMarketPrice('jusalpukat', 14000, 10500, 15000, 25000); let Bjusalpukat = dataJusAlpukat.beli; let Sjusalpukat = dataJusAlpukat.jual; let statusJusAlpukat = dataJusAlpukat.status;
    let dataSusuCoklat = getMarketPrice('susucoklat', 8000, 4000, 40000, 60000); let Bsusucoklat = dataSusuCoklat.beli; let Ssusucoklat = dataSusuCoklat.jual; let statusSusuCoklat = dataSusuCoklat.status;
    let dataSusuStroberi = getMarketPrice('susustroberi', 8500, 4200, 40000, 60000); let Bsusustroberi = dataSusuStroberi.beli; let Ssusustroberi = dataSusuStroberi.jual; let statusSusuStroberi = dataSusuStroberi.status;
    let dataSodaGembira = getMarketPrice('sodagembira', 12000, 6000, 25000, 40000); let Bsodagembira = dataSodaGembira.beli; let Ssodagembira = dataSodaGembira.jual; let statusSodaGembira = dataSodaGembira.status;
    let dataWedangJahe = getMarketPrice('wedangjahe', 6000, 3000, 45000, 70000); let Bwedangjahe = dataWedangJahe.beli; let Swedangjahe = dataWedangJahe.jual; let statusWedangJahe = dataWedangJahe.status;
    let dataAirKelapa = getMarketPrice('airkelapa', 7000, 3500, 40000, 60000); let Bairkelapa = dataAirKelapa.beli; let Sairkelapa = dataAirKelapa.jual; let statusAirKelapa = dataAirKelapa.status;
    let dataSirupMelon = getMarketPrice('sirupmelon', 15000, 7000, 20000, 35000); let Bsirupmelon = dataSirupMelon.beli; let Ssirupmelon = dataSirupMelon.jual; let statusSirupMelon = dataSirupMelon.status;
    let dataSirupJeruk = getMarketPrice('sirupjeruk', 15000, 7000, 20000, 35000); let Bsirupjeruk = dataSirupJeruk.beli; let Ssirupjeruk = dataSirupJeruk.jual; let statusSirupJeruk = dataSirupJeruk.status;
    let dataSirupAnggur = getMarketPrice('sirupanggur', 16000, 7500, 20000, 35000); let Bsirupanggur = dataSirupAnggur.beli; let Ssirupanggur = dataSirupAnggur.jual; let statusSirupAnggur = dataSirupAnggur.status;
    let dataSirupStroberi = getMarketPrice('sirupstroberi', 16000, 7500, 20000, 35000); let Bsirupstroberi = dataSirupStroberi.beli; let Ssirupstroberi = dataSirupStroberi.jual; let statusSirupStroberi = dataSirupStroberi.status;

    // ================= DATA CRATE =================
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
    let tanggalHariIni = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
    if (user.lastTaxDate !== tanggalHariIni) {
        let uangSaatIni = user.money || 0;
        let potonganPajak = Math.floor(uangSaatIni * 0.01);
        if (potonganPajak > 0) {
            user.money -= potonganPajak;
            if (!global.db.data.negara) global.db.data.negara = { kas: 0 };
            if (typeof global.db.data.negara.kas !== 'number') global.db.data.negara.kas = 0;
            global.db.data.negara.kas += potonganPajak;
            conn.reply(m.chat, `🏛️ *INFO PAJAK HARIAN (1%)*\n\nPemerintah telah memotong uangmu sebesar *Rp ${potonganPajak.toLocaleString()}* dan langsung disetor ke Kas Negara.\nSisa uangmu sekarang: Rp ${user.money.toLocaleString()}`, m);
        }
        user.lastTaxDate = tanggalHariIni;
    }

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
        
        // BIBIT
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
        'bibitcabai': { costType: 'money', B: Bbibitcabai, S: Sbibitcabai, data: dataBibitCabai, db: 'bibitcabai', name: 'Bibit Cabai' },
        'bibittomat': { costType: 'money', B: Bbibittomat, S: Sbibittomat, data: dataBibitTomat, db: 'bibittomat', name: 'Bibit Tomat' },
        'bibitbawang': { costType: 'money', B: Bbibitbawang, S: Sbibitbawang, data: dataBibitBawang, db: 'bibitbawang', name: 'Bibit Bawang' },
        'bibitterong': { costType: 'money', B: Bbibitterong, S: Sbibitterong, data: dataBibitTerong, db: 'bibitterong', name: 'Bibit Terong' },
        'bibitjagung': { costType: 'money', B: Bbibitjagung, S: Sbibitjagung, data: dataBibitJagung, db: 'bibitjagung', name: 'Bibit Jagung' },
        'bibitkedelai': { costType: 'money', B: Bbibitkedelai, S: Sbibitkedelai, data: dataBibitKedelai, db: 'bibitkedelai', name: 'Bibit Kedelai' },
        'bibitsemangka': { costType: 'money', B: Bbibitsemangka, S: Sbibitsemangka, data: dataBibitSemangka, db: 'bibitsemangka', name: 'Bibit Semangka' },
        'bibitmelon': { costType: 'money', B: Bbibitmelon, S: Sbibitmelon, data: dataBibitMelon, db: 'bibitmelon', name: 'Bibit Melon' },
        'bibitstroberi': { costType: 'money', B: Bbibitstroberi, S: Sbibitstroberi, data: dataBibitStroberi, db: 'bibitstroberi', name: 'Bibit Stroberi' },
        'bibitnanas': { costType: 'money', B: Bbibitnanas, S: Sbibitnanas, data: dataBibitNanas, db: 'bibitnanas', name: 'Bibit Nanas' },
        'bibitkelapa': { costType: 'money', B: Bbibitkelapa, S: Sbibitkelapa, data: dataBibitKelapa, db: 'bibitkelapa', name: 'Bibit Kelapa' },
        'bibitdurian': { costType: 'money', B: Bbibitdurian, S: Sbibitdurian, data: dataBibitDurian, db: 'bibitdurian', name: 'Bibit Durian' },
        'bibitpepaya': { costType: 'money', B: Bbibitpepaya, S: Sbibitpepaya, data: dataBibitPepaya, db: 'bibitpepaya', name: 'Bibit Pepaya' },
        'bibitalpukat': { costType: 'money', B: Bbibitalpukat, S: Sbibitalpukat, data: dataBibitAlpukat, db: 'bibitalpukat', name: 'Bibit Alpukat' },
        'bibitkopi': { costType: 'money', B: Bbibitkopi, S: Sbibitkopi, data: dataBibitKopi, db: 'bibitkopi', name: 'Bibit Kopi' },
        'bibitkakao': { costType: 'money', B: Bbibitkakao, S: Sbibitkakao, data: dataBibitKakao, db: 'bibitkakao', name: 'Bibit Kakao' },
        'bibitvanili': { costType: 'money', B: Bbibitvanili, S: Sbibitvanili, data: dataBibitVanili, db: 'bibitvanili', name: 'Bibit Vanili' },
        'bibitkangkung': { costType: 'money', B: Bbibitkangkung, S: Sbibitkangkung, data: dataBibitKangkung, db: 'bibitkangkung', name: 'Bibit Kangkung' },
        'bibitsawi': { costType: 'money', B: Bbibitsawi, S: Sbibitsawi, data: dataBibitSawi, db: 'bibitsawi', name: 'Bibit Sawi' },
        'bibitbayam': { costType: 'money', B: Bbibitbayam, S: Sbibitbayam, data: dataBibitBayam, db: 'bibitbayam', name: 'Bibit Bayam' },
        'bibitkol': { costType: 'money', B: Bbibitkol, S: Sbibitkol, data: dataBibitKol, db: 'bibitkol', name: 'Bibit Kol' },
        'bibitbrokoli': { costType: 'money', B: Bbibitbrokoli, S: Sbibitbrokoli, data: dataBibitBrokoli, db: 'bibitbrokoli', name: 'Bibit Brokoli' },
        'bibitketimun': { costType: 'money', B: Bbibitketimun, S: Sbibitketimun, data: dataBibitKetimun, db: 'bibitketimun', name: 'Bibit Ketimun' },
        'bibitlombok': { costType: 'money', B: Bbibitlombok, S: Sbibitlombok, data: dataBibitLombok, db: 'bibitlombok', name: 'Bibit Lombok' },
        'bibitkacangpanjang': { costType: 'money', B: Bbibitkacangpanjang, S: Sbibitkacangpanjang, data: dataBibitKacangPanjang, db: 'bibitkacangpanjang', name: 'Bibit Kacang Panjang' },

        // BARANG
        'potion': { costType: 'money', B: potion, S: Spotion, data: dataPotion, db: 'potion', name: 'Potion' },
        'sampah': { costType: 'money', B: Bsampah, S: Ssampah, data: dataSampah, db: 'sampah', name: 'Sampah' },
        'string': { costType: 'money', B: Bstring, S: Sstring, data: dataString, db: 'string', name: 'String' },
        'botol': { costType: 'money', B: Bbotol, S: Sbotol, data: dataBotol, db: 'botol', name: 'Botol' },
        'kaleng': { costType: 'money', B: Bkaleng, S: Skaleng, data: dataKaleng, db: 'kaleng', name: 'Kaleng' },
        'kardus': { costType: 'money', B: Bkardus, S: Skardus, data: dataKardus, db: 'kardus', name: 'Kardus' },
        'sword': { costType: 'money', B: Bsword, S: Ssword, data: dataSword, db: 'sword', name: 'Sword' },
        'plastik': { costType: 'money', B: Bplastik, S: Splastik, data: dataPlastik, db: 'plastik', name: 'Plastik' },
        'kain': { costType: 'money', B: Bkain, S: Skain, data: dataKain, db: 'kain', name: 'Kain' },
        'paku': { costType: 'money', B: Bpaku, S: Spaku, data: dataPaku, db: 'paku', name: 'Paku' },
        'baterai': { costType: 'money', B: Bbaterai, S: Sbaterai, data: dataBaterai, db: 'baterai', name: 'Baterai' },
        'banbekas': { costType: 'money', B: Bbanbekas, S: Sbanbekas, data: dataBanBekas, db: 'banbekas', name: 'Ban Bekas' },
        'karet': { costType: 'money', B: Bkaret, S: Skaret, data: dataKaret, db: 'karet', name: 'Karet' },
        'tembaga': { costType: 'money', B: Btembaga, S: Stembaga, data: dataTembaga, db: 'tembaga', name: 'Tembaga' },
        'aluminium': { costType: 'money', B: Baluminium, S: Saluminium, data: dataAluminium, db: 'aluminium', name: 'Aluminium' },
        'baut': { costType: 'money', B: Bbaut, S: Sbaut, data: dataBaut, db: 'baut', name: 'Baut' },
        'mur': { costType: 'money', B: Bmur, S: Smur, data: dataMur, db: 'mur', name: 'Mur' },
        'gear': { costType: 'money', B: Bgear, S: Sgear, data: dataGear, db: 'gear', name: 'Gear' },
        'rantai': { costType: 'money', B: Brantai, S: Srantai, data: dataRantai, db: 'rantai', name: 'Rantai' },
        'mesinbekas': { costType: 'money', B: Bmesinbekas, S: Smesinbekas, data: dataMesinBekas, db: 'mesinbekas', name: 'Mesin Bekas' },
        'oli': { costType: 'money', B: Boli, S: Soli, data: dataOli, db: 'oli', name: 'Oli' },
        'pcb': { costType: 'money', B: Bpcb, S: Spcb, data: dataPcb, db: 'pcb', name: 'PCB' },
        'kabel': { costType: 'money', B: Bkabel, S: Skabel, data: dataKabel, db: 'kabel', name: 'Kabel' },
        'kaca': { costType: 'money', B: Bkaca, S: Skaca, data: dataKaca, db: 'kaca', name: 'Kaca' },
        'keramik': { costType: 'money', B: Bkeramik, S: Skeramik, data: dataKeramik, db: 'keramik', name: 'Keramik' },
        'semen': { costType: 'money', B: Bsemen, S: Ssemen, data: dataSemen, db: 'semen', name: 'Semen' },
        'cat': { costType: 'money', B: Bcat, S: Scat, data: dataCat, db: 'cat', name: 'Cat' },
        'koinkuno': { costType: 'money', B: Bkoinkuno, S: Skoinkuno, data: dataKoinKuno, db: 'koinkuno', name: 'Koin Kuno' },
        'jamrusak': { costType: 'money', B: Bjamrusak, S: Sjamrusak, data: dataJamRusak, db: 'jamrusak', name: 'Jam Rusak' },
        'pegas': { costType: 'money', B: Bpegas, S: Spegas, data: dataPegas, db: 'pegas', name: 'Pegas' },
        'besibekas': { costType: 'money', B: Bbesibekas, S: Sbesibekas, data: dataBesiBekas, db: 'besibekas', name: 'Besi Bekas' },
        'lampu': { costType: 'money', B: Blampu, S: Slampu, data: dataLampu, db: 'lampu', name: 'Lampu' },

        // ALAM
        'emasmentah': { costType: 'money', B: Bemasmentah, S: Semasmentah, data: dataEmasMentah, db: 'emasmentah', name: 'Emas Mentah' },
        'kayu': { costType: 'money', B: Bkayu, S: Skayu, data: dataKayu, db: 'kayu', name: 'Kayu' },
        'batu': { costType: 'money', B: Bbatu, S: Sbatu, data: dataBatu, db: 'batu', name: 'Batu' },
        'coal': { costType: 'money', B: Bcoal, S: Scoal, data: dataCoal, db: 'coal', name: 'Coal' },
        'iron': { costType: 'money', B: Biron, S: Siron, data: dataIron, db: 'iron', name: 'Iron' },
        'pasir': { costType: 'money', B: Bpasir, S: Spasir, data: dataPasir, db: 'pasir', name: 'Pasir' },
        'uranium': { costType: 'money', B: Buranium, S: Suranium, data: dataUranium, db: 'uranium', name: 'Uranium' },
        'tembagaore': { costType: 'money', B: Btembagaore, S: Stembagaore, data: dataTembagaOre, db: 'tembagaore', name: 'Tembaga Ore' },
        'perakore': { costType: 'money', B: Bperakore, S: Sperakore, data: dataPerakOre, db: 'perakore', name: 'Perak Ore' },
        'timah': { costType: 'money', B: Btimah, S: Stimah, data: dataTimah, db: 'timah', name: 'Timah' },
        'nikel': { costType: 'money', B: Bnikel, S: Snikel, data: dataNikel, db: 'nikel', name: 'Nikel' },
        'kuarsa': { costType: 'money', B: Bkuarsa, S: Skuarsa, data: dataKuarsa, db: 'kuarsa', name: 'Kuarsa' },
        'kristal': { costType: 'money', B: Bkristal, S: Skristal, data: dataKristal, db: 'kristal', name: 'Kristal' },
        'obsidian': { costType: 'money', B: Bobsidian, S: Sobsidian, data: dataObsidian, db: 'obsidian', name: 'Obsidian' },
        'belerang': { costType: 'money', B: Bbelerang, S: Sbelerang, data: dataBelerang, db: 'belerang', name: 'Belerang' },
        'marmer': { costType: 'money', B: Bmarmer, S: Smarmer, data: dataMarmer, db: 'marmer', name: 'Marmer' },
        'granit': { costType: 'money', B: Bgranit, S: Sgranit, data: dataGranit, db: 'granit', name: 'Granit' },
        'garam': { costType: 'money', B: Bgaram, S: Sgaram, data: dataGaram, db: 'garam', name: 'Garam' },
        'tanahliat': { costType: 'money', B: Btanahliat, S: Stanahliat, data: dataTanahLiat, db: 'tanahliat', name: 'Tanah Liat' },
        'batukapur': { costType: 'money', B: Bbatukapur, S: Sbatukapur, data: dataBatuKapur, db: 'batukapur', name: 'Batu Kapur' },
        'batupermata': { costType: 'money', B: Bbatupermata, S: Sbatupermata, data: dataBatuPermata, db: 'batupermata', name: 'Batu Permata' },
        'fosil': { costType: 'money', B: Bfosil, S: Sfosil, data: dataFosil, db: 'fosil', name: 'Fosil' },
        'mutiara': { costType: 'money', B: Bmutiara, S: Smutiara, data: dataMutiara, db: 'mutiara', name: 'Mutiara' },
        'karang': { costType: 'money', B: Bkarang, S: Skarang, data: dataKarang, db: 'karang', name: 'Karang' },
        'gipsum': { costType: 'money', B: Bgipsum, S: Sgipsum, data: dataGipsum, db: 'gipsum', name: 'Gipsum' },
        'magnetit': { costType: 'money', B: Bmagnetit, S: Smagnetit, data: dataMagnetit, db: 'magnetit', name: 'Magnetit' },
        'bauksit': { costType: 'money', B: Bbauksit, S: Sbauksit, data: dataBauksit, db: 'bauksit', name: 'Bauksit' },
        'platinaore': { costType: 'money', B: Bplatinaore, S: Splatinaore, data: dataPlatinaOre, db: 'platinaore', name: 'Platina Ore' },
        'titaniumore': { costType: 'money', B: Btitaniumore, S: Stitaniumore, data: dataTitaniumOre, db: 'titaniumore', name: 'Titanium Ore' },
        'litium': { costType: 'money', B: Blitium, S: Slitium, data: dataLitium, db: 'litium', name: 'Litium' },
        'zamrudmentah': { costType: 'money', B: Bzamrudmentah, S: Szamrudmentah, data: dataZamrudMentah, db: 'zamrudmentah', name: 'Zamrud Mentah' },
        'rubimentah': { costType: 'money', B: Brubimentah, S: Srubimentah, data: dataRubiMentah, db: 'rubimentah', name: 'Rubi Mentah' },

        // PERLENGKAPAN
        'pickaxe': { costType: 'money', B: Bpickaxe, S: Spickaxe, data: dataPickaxe, db: 'pickaxe', name: 'Pickaxe' },
        'katana': { costType: 'money', B: Bkatana, S: Skatana, data: dataKatana, db: 'katana', name: 'Katana' },
        'axe': { costType: 'money', B: Baxe, S: Saxe, data: dataAxe, db: 'axe', name: 'Axe' },
        'trident': { costType: 'money', B: Btrident, S: Strident, data: dataTrident, db: 'trident', name: 'Trident' },
        'bow': { costType: 'money', B: Bbow, S: Sbow, data: dataBow, db: 'bow', name: 'Bow' },
        'pisau': { costType: 'money', B: Bpisau, S: Spisau, data: dataPisau, db: 'pisau', name: 'Pisau' },
        'fishingrod': { costType: 'money', B: Bfishingrod, S: Sfishingrod, data: dataFishingrod, db: 'fishingrod', name: 'Fishing Rod' },
        'armor': { costType: 'money', B: Barmor, S: Sarmor, data: dataArmor, db: 'armor', name: 'Armor' },
        'shield': { costType: 'money', B: Bshield, S: Sshield, data: dataShield, db: 'shield', name: 'Shield' },
        'helmet': { costType: 'money', B: Bhelmet, S: Shelmet, data: dataHelmet, db: 'helmet', name: 'Helmet' },

        // SENJATA
        'tombak': { costType: 'money', B: Btombak, S: Stombak, data: dataTombak, db: 'tombak', name: 'Tombak' },
        'anakpanah': { costType: 'money', B: Banakpanah, S: Sanakpanah, data: dataAnakPanah, db: 'anakpanah', name: 'Anak Panah' },
        'ammo': { costType: 'money', B: Bammo, S: Sammo, data: dataAmmo, db: 'ammo', name: 'Ammo' },
        'glock': { costType: 'money', B: Bglock, S: Sglock, data: dataGlock, db: 'glock', name: 'Glock' },
        'beretta': { costType: 'money', B: Bberetta, S: Sberetta, data: dataBeretta, db: 'beretta', name: 'Beretta' },
        'revolver': { costType: 'money', B: Brevolver, S: Srevolver, data: dataRevolver, db: 'revolver', name: 'Revolver' },
        'deagle': { costType: 'money', B: Bdeagle, S: Sdeagle, data: dataDeagle, db: 'deagle', name: 'Deagle' },
        'mac10': { costType: 'money', B: Bmac10, S: Smac10, data: dataMac10, db: 'mac10', name: 'Mac10' },
        'vector': { costType: 'money', B: Bvector, S: Svector, data: dataVector, db: 'vector', name: 'Vector' },
        'ump45': { costType: 'money', B: Bump45, S: Sump45, data: dataUmp45, db: 'ump45', name: 'Ump45' },
        'pp19bizon': { costType: 'money', B: Bpp19bizon, S: Spp19bizon, data: dataPp19bizon, db: 'pp19bizon', name: 'Pp19 Bizon' },
        'mp5': { costType: 'money', B: Bmp5, S: Smp5, data: dataMp5, db: 'mp5', name: 'Mp5' },
        'uzi': { costType: 'money', B: Buzi, S: Suzi, data: dataUzi, db: 'uzi', name: 'Uzi' },
        'p90': { costType: 'money', B: Bp90, S: Sp90, data: dataP90, db: 'p90', name: 'P90' },
        'ak47': { costType: 'money', B: Bak47, S: Sak47, data: dataAk47, db: 'ak47', name: 'Ak47' },
        'm4': { costType: 'money', B: Bm4, S: Sm4, data: dataM4, db: 'm4', name: 'M4' },
        'qbz95': { costType: 'money', B: Bqbz95, S: Sqbz95, data: dataQbz95, db: 'qbz95', name: 'Qbz95' },
        'ar15': { costType: 'money', B: Bar15, S: Sar15, data: dataAr15, db: 'ar15', name: 'Ar15' },
        'g36c': { costType: 'money', B: Bg36c, S: Sg36c, data: dataG36c, db: 'g36c', name: 'G36c' },
        'aek971': { costType: 'money', B: Baek971, S: Saek971, data: dataAek971, db: 'aek971', name: 'Aek971' },
        'm16': { costType: 'money', B: Bm16, S: Sm16, data: dataM16, db: 'm16', name: 'M16' },
        'hk416': { costType: 'money', B: Bhk416, S: Shk416, data: dataHk416, db: 'hk416', name: 'Hk416' },
        'scar': { costType: 'money', B: Bscar, S: Sscar, data: dataScar, db: 'scar', name: 'Scar' },
        'famas': { costType: 'money', B: Bfamas, S: Sfamas, data: dataFamas, db: 'famas', name: 'Famas' },
        'aug': { costType: 'money', B: Baug, S: Saug, data: dataAug, db: 'aug', name: 'Aug' },
        'fnfal': { costType: 'money', B: Bfnfal, S: Sfnfal, data: dataFnfal, db: 'fnfal', name: 'Fnfal' },
        'spas12': { costType: 'money', B: Bspas12, S: Sspas12, data: dataSpas12, db: 'spas12', name: 'Spas12' },
        'benellim4': { costType: 'money', B: Bbenellim4, S: Sbenellim4, data: dataBenellim4, db: 'benellim4', name: 'Benelli M4' },
        'saiga12': { costType: 'money', B: Bsaiga12, S: Ssaiga12, data: dataSaiga12, db: 'saiga12', name: 'Saiga12' },
        'aa12': { costType: 'money', B: Baa12, S: Saa12, data: dataAa12, db: 'aa12', name: 'Aa12' },
        'remington700': { costType: 'money', B: Bremington700, S: Sremington700, data: dataRemington700, db: 'remington700', name: 'Remington 700' },
        'm24': { costType: 'money', B: Bm24, S: Sm24, data: dataM24, db: 'm24', name: 'M24' },
        'm40': { costType: 'money', B: Bm40, S: Sm40, data: dataM40, db: 'm40', name: 'M40' },
        'l96': { costType: 'money', B: Bl96, S: Sl96, data: dataL96, db: 'l96', name: 'L96' },
        'dragunovsvd': { costType: 'money', B: Bdragunovsvd, S: Sdragunovsvd, data: dataDragunovsvd, db: 'dragunovsvd', name: 'Dragunov SVD' },
        'barrettm82': { costType: 'money', B: Bbarrettm82, S: Sbarrettm82, data: dataBarrettm82, db: 'barrettm82', name: 'Barrett M82' },
        'intervention': { costType: 'money', B: Bintervention, S: Sintervention, data: dataIntervention, db: 'intervention', name: 'Intervention' },
        'cheytacm200': { costType: 'money', B: Bcheytacm200, S: Scheytacm200, data: dataCheytacm200, db: 'cheytacm200', name: 'Cheytac M200' },
        'awm': { costType: 'money', B: Bawm, S: Sawm, data: dataAwm, db: 'awm', name: 'AWM' },
        'pkm': { costType: 'money', B: Bpkm, S: Spkm, data: dataPkm, db: 'pkm', name: 'PKM' },
        'm249': { costType: 'money', B: Bm249, S: Sm249, data: dataM249, db: 'm249', name: 'M249' },
        'mg42': { costType: 'money', B: Bmg42, S: Smg42, data: dataMg42, db: 'mg42', name: 'Mg42' },
        'rpg7': { costType: 'money', B: Brpg7, S: Srpg7, data: dataRpg7, db: 'rpg7', name: 'RPG-7' },
        'minigun': { costType: 'money', B: Bminigun, S: Sminigun, data: dataMinigun, db: 'minigun', name: 'Minigun' },
        'rubyrevolver': { costType: 'money', B: Brubyrevolver, S: Srubyrevolver, data: dataRubyrevolver, db: 'rubyrevolver', name: 'Ruby Revolver' },
        'diamondrifle': { costType: 'money', B: Bdiamondrifle, S: Sdiamondrifle, data: dataDiamondrifle, db: 'diamondrifle', name: 'Diamond Rifle' },
        'emeraldsniper': { costType: 'money', B: Bemeraldsniper, S: Semeraldsniper, data: dataEmeraldsniper, db: 'emeraldsniper', name: 'Emerald Sniper' },
        'sapphirecannon': { costType: 'money', B: Bsapphirecannon, S: Ssapphirecannon, data: dataSapphirecannon, db: 'sapphirecannon', name: 'Sapphire Cannon' },

        // PERHIASAN (Semua data stock dinonaktifkan 'null')
        'diamond': { costType: 'money', B: Bdiamond, S: Sdiamond, data: null, db: 'diamond', name: 'Diamond' },
        'perak': { costType: 'money', B: Bperak, S: Sperak, data: null, db: 'perak', name: 'Perak' },
        'emas': { costType: 'money', B: Bemasbiasa, S: Semasbiasa, data: null, db: 'emas', name: 'Emas' },
        'emerald': { costType: 'money', B: Bemerald, S: Semerald, data: null, db: 'emerald', name: 'Emerald' },
        'berlian': { costType: 'money', B: Bberlian, S: Sberlian, data: null, db: 'berlian', name: 'Berlian' },
        'emasbatang': { costType: 'money', B: Bemasbatang, S: Semasbatang, data: null, db: 'emasbatang', name: 'Emas Batang' },
        'perakbatang': { costType: 'money', B: Bperakbatang, S: Sperakbatang, data: null, db: 'perakbatang', name: 'Perak Batang' },
        'ruby': { costType: 'money', B: Bruby, S: Sruby, data: null, db: 'ruby', name: 'Ruby' },
        'sapphire': { costType: 'money', B: Bsapphire, S: Ssapphire, data: null, db: 'sapphire', name: 'Sapphire' },
        'topaz': { costType: 'money', B: Btopaz, S: Stopaz, data: null, db: 'topaz', name: 'Topaz' },
        'amethyst': { costType: 'money', B: Bamethyst, S: Samethyst, data: null, db: 'amethyst', name: 'Amethyst' },
        'opal': { costType: 'money', B: Bopal, S: Sopal, data: null, db: 'opal', name: 'Opal' },
        'aquamarine': { costType: 'money', B: Baquamarine, S: Saquamarine, data: null, db: 'aquamarine', name: 'Aquamarine' },
        'garnet': { costType: 'money', B: Bgarnet, S: Sgarnet, data: null, db: 'garnet', name: 'Garnet' },
        'jade': { costType: 'money', B: Bjade, S: Sjade, data: null, db: 'jade', name: 'Jade' },
        'onyx': { costType: 'money', B: Bonyx, S: Sonyx, data: null, db: 'onyx', name: 'Onyx' },
        'turquoise': { costType: 'money', B: Bturquoise, S: Sturquoise, data: null, db: 'turquoise', name: 'Turquoise' },
        'alexandrite': { costType: 'money', B: Balexandrite, S: Salexandrite, data: null, db: 'alexandrite', name: 'Alexandrite' },
        'moonstone': { costType: 'money', B: Bmoonstone, S: Smoonstone, data: null, db: 'moonstone', name: 'Moonstone' },
        'blackdiamond': { costType: 'money', B: Bblackdiamond, S: Sblackdiamond, data: null, db: 'blackdiamond', name: 'Black Diamond' },
        'reddiamond': { costType: 'money', B: Breddiamond, S: Sreddiamond, data: null, db: 'reddiamond', name: 'Red Diamond' },
        'platinum': { costType: 'money', B: Bplatinum, S: Splatinum, data: null, db: 'platinum', name: 'Platinum' },

        // CRATE
        'common': { costType: 'money', B: Bcommon, S: Scommon, data: null, db: 'common', name: 'Common Crate' },
        'uncommon': { costType: 'money', B: Buncommon, S: Suncommon, data: null, db: 'uncommon', name: 'Uncommon Crate' },
        'rare': { costType: 'money', B: Brare, S: Srare, data: null, db: 'rare', name: 'Rare Crate' },
        'epic': { costType: 'money', B: Bepic, S: Sepic, data: null, db: 'epic', name: 'Epic Crate' },
        'mythic': { costType: 'money', B: Bmythic, S: Smythic, data: null, db: 'mythic', name: 'Mythic Crate' },
        'legendary': { costType: 'money', B: Blegendary, S: Slegendary, data: null, db: 'legendary', name: 'Legendary Crate' },
        'secret': { costType: 'money', B: Bsecret, S: Ssecret, data: null, db: 'secret', name: 'Secret Crate' },
        'dark': { costType: 'money', B: Bdark, S: Sdark, data: null, db: 'dark', name: 'Dark Crate' },
        'cheat': { costType: 'money', B: Bcheat, S: Scheat, data: null, db: 'cheat', name: 'Cheat Crate' },

        // MAKANAN
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

        // MINUMAN & JUS
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
        'juspisang': { costType: 'money', B: Bjuspisang, S: Sjuspisang, data: dataJusPisang, db: 'juspisang', name: 'Jus Pisang' },
        'esjeruk': { costType: 'money', B: Besjeruk, S: Sesjeruk, data: dataEsJeruk, db: 'esjeruk', name: 'Es Jeruk' },
        'eskelapa': { costType: 'money', B: Beskelapa, S: Seskelapa, data: dataEsKelapa, db: 'eskelapa', name: 'Es Kelapa' },
        'kopihitam': { costType: 'money', B: Bkopihitam, S: Skopihitam, data: dataKopiHitam, db: 'kopihitam', name: 'Kopi Hitam' },
        'kopisusu': { costType: 'money', B: Bkopisusu, S: Skopisusu, data: dataKopiSusu, db: 'kopisusu', name: 'Kopi Susu' },
        'cappuccino': { costType: 'money', B: Bcappuccino, S: Scappuccino, data: dataCappuccino, db: 'cappuccino', name: 'Cappuccino' },
        'latte': { costType: 'money', B: Blatte, S: Slatte, data: dataLatte, db: 'latte', name: 'Latte' },
        'mocha': { costType: 'money', B: Bmocha, S: Smocha, data: dataMocha, db: 'mocha', name: 'Mocha' },
        'tehmanis': { costType: 'money', B: Btehmanis, S: Stehmanis, data: dataTehManis, db: 'tehmanis', name: 'Teh Manis' },
        'tehhijau': { costType: 'money', B: Btehhijau, S: Stehhijau, data: dataTehHijau, db: 'tehhijau', name: 'Teh Hijau' },
        'tehtarik': { costType: 'money', B: Btehtarik, S: Stehtarik, data: dataTehTarik, db: 'tehtarik', name: 'Teh Tarik' },
        'jusstroberi': { costType: 'money', B: Bjusstroberi, S: Sjusstroberi, data: dataJusStroberi, db: 'jusstroberi', name: 'Jus Stroberi' },
        'jusmelon': { costType: 'money', B: Bjusmelon, S: Sjusmelon, data: dataJusMelon, db: 'jusmelon', name: 'Jus Melon' },
        'jussemangka': { costType: 'money', B: Bjussemangka, S: Sjussemangka, data: dataJusSemangka, db: 'jussemangka', name: 'Jus Semangka' },
        'jusdurian': { costType: 'money', B: Bjusdurian, S: Sjusdurian, data: dataJusDurian, db: 'jusdurian', name: 'Jus Durian' },
        'juspepaya': { costType: 'money', B: Bjuspepaya, S: Sjuspepaya, data: dataJusPepaya, db: 'juspepaya', name: 'Jus Pepaya' },
        'jusalpukat': { costType: 'money', B: Bjusalpukat, S: Sjusalpukat, data: dataJusAlpukat, db: 'jusalpukat', name: 'Jus Alpukat' },
        'susucoklat': { costType: 'money', B: Bsusucoklat, S: Ssusucoklat, data: dataSusuCoklat, db: 'susucoklat', name: 'Susu Coklat' },
        'susustroberi': { costType: 'money', B: Bsusustroberi, S: Ssusustroberi, data: dataSusuStroberi, db: 'susustroberi', name: 'Susu Stroberi' },
        'sodagembira': { costType: 'money', B: Bsodagembira, S: Ssodagembira, data: dataSodaGembira, db: 'sodagembira', name: 'Soda Gembira' },
        'wedangjahe': { costType: 'money', B: Bwedangjahe, S: Swedangjahe, data: dataWedangJahe, db: 'wedangjahe', name: 'Wedang Jahe' },
        'airkelapa': { costType: 'money', B: Bairkelapa, S: Sairkelapa, data: dataAirKelapa, db: 'airkelapa', name: 'Air Kelapa' },
        'sirupmelon': { costType: 'money', B: Bsirupmelon, S: Ssirupmelon, data: dataSirupMelon, db: 'sirupmelon', name: 'Sirup Melon' },
        'sirupjeruk': { costType: 'money', B: Bsirupjeruk, S: Ssirupjeruk, data: dataSirupJeruk, db: 'sirupjeruk', name: 'Sirup Jeruk' },
        'sirupanggur': { costType: 'money', B: Bsirupanggur, S: Ssirupanggur, data: dataSirupAnggur, db: 'sirupanggur', name: 'Sirup Anggur' },
        'sirupstroberi': { costType: 'money', B: Bsirupstroberi, S: Ssirupstroberi, data: dataSirupStroberi, db: 'sirupstroberi', name: 'Sirup Stroberi' }
    };

    // ================= DAFTAR MENU TEMPLATE =================
    const menuHelp = `┌─⊷ *TOKO RPG*
┃
┃ Hi @${m.sender.split('@')[0]} 👋
┃ Gunakan perintah di bawah untuk
┃ melihat list & harga tiap kategori:
┃
┃ 🛒 ${usedPrefix}shop kebutuhan
┃ 🌱 ${usedPrefix}shop bibit
┃ 📦 ${usedPrefix}shop barang
┃ 🌿 ${usedPrefix}shop alam
┃ 🛡️ ${usedPrefix}shop perlengkapan
┃ 🔫 ${usedPrefix}shop senjata
┃ 💎 ${usedPrefix}shop perhiasan
┃ 🎁 ${usedPrefix}shop crate
┃ 🍱 ${usedPrefix}shop makanan
┃ 🥤 ${usedPrefix}shop minuman
┃ 📋 ${usedPrefix}shop semua
┃
┃ 💡 Cara beli/jual:
┃ • ${usedPrefix}shop buy <item> <jml>
┃ • ${usedPrefix}shop sell <item> <jml>
┃
└──────────────`;

    const menuList = `┌─⊷ *List Kategori Toko*
┃
┃ 🛒 ${usedPrefix}shop kebutuhan
┃ 🌱 ${usedPrefix}shop bibit
┃ 📦 ${usedPrefix}shop barang
┃ 🌿 ${usedPrefix}shop alam
┃ 🛡️ ${usedPrefix}shop perlengkapan
┃ 🔫 ${usedPrefix}shop senjata
┃ 💎 ${usedPrefix}shop perhiasan
┃ 🎁 ${usedPrefix}shop crate
┃ 🍱 ${usedPrefix}shop makanan
┃ 🥤 ${usedPrefix}shop minuman
┃
└──────────────`;

    const menuKebutuhan = `┌─⊷ *List Kebutuhan*
┃
┃ 🏷️ *Limit*
┃ Beli : ${Blimit} Diamond
┃ Jual : ${Slimit} Money
┃ Status : ${statusLimit}
┃ Stock : ${dataLimit.stockStatus}
┃
┃ 🐉 *Pet*
┃ Beli : ${Bpet}
┃ Jual : ${Spet}
┃ Status : ${statusPet}
┃ Stock : ${dataPet.stockStatus}
┃
┃ 📦 *Gardenboxs*
┃ Beli : ${Bgardenboxs}
┃ Jual : ${Sgardenboxs}
┃ Status : ${statusGarden}
┃ Stock : ${dataGarden.stockStatus}
┃
┃ ⛽ *Bensin*
┃ Beli : ${BBensin}
┃ Jual : ${SBensin}
┃ Status : ${statusBensin}
┃ Stock : ${dataBensin.stockStatus}
┃
┃ ⚔️ *Weapon*
┃ Beli : ${BWeap}
┃ Jual : ${SWeap}
┃ Status : ${statusWeap}
┃ Stock : ${dataWeap.stockStatus}
┃
┃ 💊 *Obat*
┃ Beli : ${BObat}
┃ Jual : ${SObat}
┃ Status : ${statusObat}
┃ Stock : ${dataObat.stockStatus}
┃
┃ 🎟️ *TiketCoin*
┃ Beli : ${Btiketcoin} Tiketcoin
┃ Jual : ${Stiketcoin} Tiketcoin
┃ Status : ${statusTiketCoin}
┃ Stock : ${dataTiketCoin.stockStatus}
┃
┃ 👹 *TiketM*
┃ Beli : ${Bhealtmonster}
┃ Jual : ${Shealtmonster}
┃ Status : ${statusHealtMonster}
┃ Stock : ${dataHealtMonster.stockStatus}
┃
┃ 🎣 *Pancingan*
┃ Beli : ${Bpancingan}
┃ Jual : ${Spancingan}
┃ Status : ${statusPancingan}
┃ Stock : ${dataPancingan.stockStatus}
┃
└──────────────`;

    const menuBibit = `┌─⊷ *List Bibit & Tanaman*
┃
┃ *🍌Bibit Pisang*
┃ Beli : ${Bbibitpisang}
┃ Jual : ${Sbibitpisang}
┃ Status : ${statusBibitPisang}
┃ Stock : ${dataBibitPisang.stockStatus}
┃
┃ *🍇Bibit Anggur*
┃ Beli : ${Bbibitanggur}
┃ Jual : ${Sbibitanggur}
┃ Status : ${statusBibitAnggur}
┃ Stock : ${dataBibitAnggur.stockStatus}
┃
┃ *🥭Bibit Mangga*
┃ Beli : ${Bbibitmangga}
┃ Jual : ${Sbibitmangga}
┃ Status : ${statusBibitMangga}
┃ Stock : ${dataBibitMangga.stockStatus}
┃
┃ *🍊Bibit Jeruk*
┃ Beli : ${Bbibitjeruk}
┃ Jual : ${Sbibitjeruk}
┃ Status : ${statusBibitJeruk}
┃ Stock : ${dataBibitJeruk.stockStatus}
┃
┃ *🍎Bibit Apel*
┃ Beli : ${Bbibitapel}
┃ Jual : ${Sbibitapel}
┃ Status : ${statusBibitApel}
┃ Stock : ${dataBibitApel.stockStatus}
┃
┃ *🌾Bibit Padi*
┃ Beli : ${Bpadi}
┃ Jual : ${Spadi}
┃ Status : ${statusPadi}
┃ Stock : ${dataPadi.stockStatus}
┃
┃ *🌾Bibit Gandum*
┃ Beli : ${Bgandum}
┃ Jual : ${Sgandum}
┃ Status : ${statusGandum}
┃ Stock : ${dataGandum.stockStatus}
┃
┃ *🥕Bibit Wortel*
┃ Beli : ${Bwortel}
┃ Jual : ${Swortel}
┃ Status : ${statusWortel}
┃ Stock : ${dataWortel.stockStatus}
┃
┃ *🥔Bibit Kentang*
┃ Beli : ${Bkentang}
┃ Jual : ${Skentang}
┃ Status : ${statusKentang}
┃ Stock : ${dataKentang.stockStatus}
┃
┃ *🍠Bibit Singkong*
┃ Beli : ${Bsingkong}
┃ Jual : ${Ssingkong}
┃ Status : ${statusSingkong}
┃ Stock : ${dataSingkong.stockStatus}
┃
┃ *🍠Bibit Ubi Jalar*
┃ Beli : ${Bubijalar}
┃ Jual : ${Subijalar}
┃ Status : ${statusUbiJalar}
┃ Stock : ${dataUbiJalar.stockStatus}
┃
┃ *🎋Bibit Tebu*
┃ Beli : ${Btebu}
┃ Jual : ${Stebu}
┃ Status : ${statusTebu}
┃ Stock : ${dataTebu.stockStatus}
┃
┃ *🌶️Bibit Cabai*
┃ Beli : ${Bbibitcabai}
┃ Jual : ${Sbibitcabai}
┃ Status : ${statusBibitCabai}
┃ Stock : ${dataBibitCabai.stockStatus}
┃
┃ *🍅Bibit Tomat*
┃ Beli : ${Bbibittomat}
┃ Jual : ${Sbibittomat}
┃ Status : ${statusBibitTomat}
┃ Stock : ${dataBibitTomat.stockStatus}
┃
┃ *🧅Bibit Bawang*
┃ Beli : ${Bbibitbawang}
┃ Jual : ${Sbibitbawang}
┃ Status : ${statusBibitBawang}
┃ Stock : ${dataBibitBawang.stockStatus}
┃
┃ *🍆Bibit Terong*
┃ Beli : ${Bbibitterong}
┃ Jual : ${Sbibitterong}
┃ Status : ${statusBibitTerong}
┃ Stock : ${dataBibitTerong.stockStatus}
┃
┃ *🌽Bibit Jagung*
┃ Beli : ${Bbibitjagung}
┃ Jual : ${Sbibitjagung}
┃ Status : ${statusBibitJagung}
┃ Stock : ${dataBibitJagung.stockStatus}
┃
┃ *🫘Bibit Kedelai*
┃ Beli : ${Bbibitkedelai}
┃ Jual : ${Sbibitkedelai}
┃ Status : ${statusBibitKedelai}
┃ Stock : ${dataBibitKedelai.stockStatus}
┃
┃ *🍉Bibit Semangka*
┃ Beli : ${Bbibitsemangka}
┃ Jual : ${Sbibitsemangka}
┃ Status : ${statusBibitSemangka}
┃ Stock : ${dataBibitSemangka.stockStatus}
┃
┃ *🍈Bibit Melon*
┃ Beli : ${Bbibitmelon}
┃ Jual : ${Sbibitmelon}
┃ Status : ${statusBibitMelon}
┃ Stock : ${dataBibitMelon.stockStatus}
┃
┃ *🍓Bibit Stroberi*
┃ Beli : ${Bbibitstroberi}
┃ Jual : ${Sbibitstroberi}
┃ Status : ${statusBibitStroberi}
┃ Stock : ${dataBibitStroberi.stockStatus}
┃
┃ *🍍Bibit Nanas*
┃ Beli : ${Bbibitnanas}
┃ Jual : ${Sbibitnanas}
┃ Status : ${statusBibitNanas}
┃ Stock : ${dataBibitNanas.stockStatus}
┃
┃ *🥥Bibit Kelapa*
┃ Beli : ${Bbibitkelapa}
┃ Jual : ${Sbibitkelapa}
┃ Status : ${statusBibitKelapa}
┃ Stock : ${dataBibitKelapa.stockStatus}
┃
┃ *🍈Bibit Durian*
┃ Beli : ${Bbibitdurian}
┃ Jual : ${Sbibitdurian}
┃ Status : ${statusBibitDurian}
┃ Stock : ${dataBibitDurian.stockStatus}
┃
┃ *🥭Bibit Pepaya*
┃ Beli : ${Bbibitpepaya}
┃ Jual : ${Sbibitpepaya}
┃ Status : ${statusBibitPepaya}
┃ Stock : ${dataBibitPepaya.stockStatus}
┃
┃ *🥑Bibit Alpukat*
┃ Beli : ${Bbibitalpukat}
┃ Jual : ${Sbibitalpukat}
┃ Status : ${statusBibitAlpukat}
┃ Stock : ${dataBibitAlpukat.stockStatus}
┃
┃ *☕Bibit Kopi*
┃ Beli : ${Bbibitkopi}
┃ Jual : ${Sbibitkopi}
┃ Status : ${statusBibitKopi}
┃ Stock : ${dataBibitKopi.stockStatus}
┃
┃ *🍫Bibit Kakao*
┃ Beli : ${Bbibitkakao}
┃ Jual : ${Sbibitkakao}
┃ Status : ${statusBibitKakao}
┃ Stock : ${dataBibitKakao.stockStatus}
┃
┃ *🍦Bibit Vanili*
┃ Beli : ${Bbibitvanili}
┃ Jual : ${Sbibitvanili}
┃ Status : ${statusBibitVanili}
┃ Stock : ${dataBibitVanili.stockStatus}
┃
┃ *🥬Bibit Kangkung*
┃ Beli : ${Bbibitkangkung}
┃ Jual : ${Sbibitkangkung}
┃ Status : ${statusBibitKangkung}
┃ Stock : ${dataBibitKangkung.stockStatus}
┃
┃ *🥬Bibit Sawi*
┃ Beli : ${Bbibitsawi}
┃ Jual : ${Sbibitsawi}
┃ Status : ${statusBibitSawi}
┃ Stock : ${dataBibitSawi.stockStatus}
┃
┃ *🥬Bibit Bayam*
┃ Beli : ${Bbibitbayam}
┃ Jual : ${Sbibitbayam}
┃ Status : ${statusBibitBayam}
┃ Stock : ${dataBibitBayam.stockStatus}
┃
┃ *🥦Bibit Kol*
┃ Beli : ${Bbibitkol}
┃ Jual : ${Sbibitkol}
┃ Status : ${statusBibitKol}
┃ Stock : ${dataBibitKol.stockStatus}
┃
┃ *🥦Bibit Brokoli*
┃ Beli : ${Bbibitbrokoli}
┃ Jual : ${Sbibitbrokoli}
┃ Status : ${statusBibitBrokoli}
┃ Stock : ${dataBibitBrokoli.stockStatus}
┃
┃ *🥒Bibit Ketimun*
┃ Beli : ${Bbibitketimun}
┃ Jual : ${Sbibitketimun}
┃ Status : ${statusBibitKetimun}
┃ Stock : ${dataBibitKetimun.stockStatus}
┃
┃ *🌶️Bibit Lombok*
┃ Beli : ${Bbibitlombok}
┃ Jual : ${Sbibitlombok}
┃ Status : ${statusBibitLombok}
┃ Stock : ${dataBibitLombok.stockStatus}
┃
┃ *🫛Bibit Kacang Panjang*
┃ Beli : ${Bbibitkacangpanjang}
┃ Jual : ${Sbibitkacangpanjang}
┃ Status : ${statusBibitKacangPanjang}
┃ Stock : ${dataBibitKacangPanjang.stockStatus}
┃
└──────────────`;

    const menuBarang = `┌─⊷ *List Barang*
┃
┃ *🥤Potion*
┃ Beli : ${potion}
┃ Jual : ${Spotion}
┃ Status : ${statusPotion}
┃ Stock : ${dataPotion.stockStatus}
┃
┃ *🗑️Sampah*
┃ Beli : ${Bsampah}
┃ Jual : ${Ssampah}
┃ Status : ${statusSampah}
┃ Stock : ${dataSampah.stockStatus}
┃
┃ *🧵String*
┃ Beli : ${Bstring}
┃ Jual : ${Sstring}
┃ Status : ${statusString}
┃ Stock : ${dataString.stockStatus}
┃
┃ *🍾Botol*
┃ Beli : ${Bbotol}
┃ Jual : ${Sbotol}
┃ Status : ${statusBotol}
┃ Stock : ${dataBotol.stockStatus}
┃
┃ *🥫Kaleng*
┃ Beli : ${Bkaleng}
┃ Jual : ${Skaleng}
┃ Status : ${statusKaleng}
┃ Stock : ${dataKaleng.stockStatus}
┃
┃ *📦Kardus*
┃ Beli : ${Bkardus}
┃ Jual : ${Skardus}
┃ Status : ${statusKardus}
┃ Stock : ${dataKardus.stockStatus}
┃
┃ *⚔️Sword*
┃ Beli : ${Bsword}
┃ Jual : ${Ssword}
┃ Status : ${statusSword}
┃ Stock : ${dataSword.stockStatus}
┃
┃ *🛍️Plastik*
┃ Beli : ${Bplastik}
┃ Jual : ${Splastik}
┃ Status : ${statusPlastik}
┃ Stock : ${dataPlastik.stockStatus}
┃
┃ *🥻Kain*
┃ Beli : ${Bkain}
┃ Jual : ${Skain}
┃ Status : ${statusKain}
┃ Stock : ${dataKain.stockStatus}
┃
┃ *📍Paku*
┃ Beli : ${Bpaku}
┃ Jual : ${Spaku}
┃ Status : ${statusPaku}
┃ Stock : ${dataPaku.stockStatus}
┃
┃ *🔋Baterai*
┃ Beli : ${Bbaterai}
┃ Jual : ${Sbaterai}
┃ Status : ${statusBaterai}
┃ Stock : ${dataBaterai.stockStatus}
┃
┃ *🛞Ban Bekas*
┃ Beli : ${Bbanbekas}
┃ Jual : ${Sbanbekas}
┃ Status : ${statusBanBekas}
┃ Stock : ${dataBanBekas.stockStatus}
┃
┃ *🪀Karet*
┃ Beli : ${Bkaret}
┃ Jual : ${Skaret}
┃ Status : ${statusKaret}
┃ Stock : ${dataKaret.stockStatus}
┃
┃ *🥉Tembaga*
┃ Beli : ${Btembaga}
┃ Jual : ${Stembaga}
┃ Status : ${statusTembaga}
┃ Stock : ${dataTembaga.stockStatus}
┃
┃ *🌫️Aluminium*
┃ Beli : ${Baluminium}
┃ Jual : ${Saluminium}
┃ Status : ${statusAluminium}
┃ Stock : ${dataAluminium.stockStatus}
┃
┃ *🔩Baut*
┃ Beli : ${Bbaut}
┃ Jual : ${Sbaut}
┃ Status : ${statusBaut}
┃ Stock : ${dataBaut.stockStatus}
┃
┃ *🔩Mur*
┃ Beli : ${Bmur}
┃ Jual : ${Smur}
┃ Status : ${statusMur}
┃ Stock : ${dataMur.stockStatus}
┃
┃ *⚙️Gear*
┃ Beli : ${Bgear}
┃ Jual : ${Sgear}
┃ Status : ${statusGear}
┃ Stock : ${dataGear.stockStatus}
┃
┃ *⛓️Rantai*
┃ Beli : ${Brantai}
┃ Jual : ${Srantai}
┃ Status : ${statusRantai}
┃ Stock : ${dataRantai.stockStatus}
┃
┃ *🚂Mesin Bekas*
┃ Beli : ${Bmesinbekas}
┃ Jual : ${Smesinbekas}
┃ Status : ${statusMesinBekas}
┃ Stock : ${dataMesinBekas.stockStatus}
┃
┃ *🛢️Oli*
┃ Beli : ${Boli}
┃ Jual : ${Soli}
┃ Status : ${statusOli}
┃ Stock : ${dataOli.stockStatus}
┃
┃ *🖨️PCB*
┃ Beli : ${Bpcb}
┃ Jual : ${Spcb}
┃ Status : ${statusPcb}
┃ Stock : ${dataPcb.stockStatus}
┃
┃ *🔌Kabel*
┃ Beli : ${Bkabel}
┃ Jual : ${Skabel}
┃ Status : ${statusKabel}
┃ Stock : ${dataKabel.stockStatus}
┃
┃ *🪟Kaca*
┃ Beli : ${Bkaca}
┃ Jual : ${Skaca}
┃ Status : ${statusKaca}
┃ Stock : ${dataKaca.stockStatus}
┃
┃ *🏺Keramik*
┃ Beli : ${Bkeramik}
┃ Jual : ${Skeramik}
┃ Status : ${statusKeramik}
┃ Stock : ${dataKeramik.stockStatus}
┃
┃ *🧱Semen*
┃ Beli : ${Bsemen}
┃ Jual : ${Ssemen}
┃ Status : ${statusSemen}
┃ Stock : ${dataSemen.stockStatus}
┃
┃ *🎨Cat*
┃ Beli : ${Bcat}
┃ Jual : ${Scat}
┃ Status : ${statusCat}
┃ Stock : ${dataCat.stockStatus}
┃
┃ *🪙Koin Kuno*
┃ Beli : ${Bkoinkuno}
┃ Jual : ${Skoinkuno}
┃ Status : ${statusKoinKuno}
┃ Stock : ${dataKoinKuno.stockStatus}
┃
┃ *🕰️Jam Rusak*
┃ Beli : ${Bjamrusak}
┃ Jual : ${Sjamrusak}
┃ Status : ${statusJamRusak}
┃ Stock : ${dataJamRusak.stockStatus}
┃
┃ *🪝Pegas*
┃ Beli : ${Bpegas}
┃ Jual : ${Spegas}
┃ Status : ${statusPegas}
┃ Stock : ${dataPegas.stockStatus}
┃
┃ *🦾Besi Bekas*
┃ Beli : ${Bbesibekas}
┃ Jual : ${Sbesibekas}
┃ Status : ${statusBesiBekas}
┃ Stock : ${dataBesiBekas.stockStatus}
┃
┃ *💡Lampu*
┃ Beli : ${Blampu}
┃ Jual : ${Slampu}
┃ Status : ${statusLampu}
┃ Stock : ${dataLampu.stockStatus}
┃
└──────────────`;

    const menuAlam = `┌─⊷ *List Alam*
┃
┃ *🪙Emas Mentah*
┃ Beli : ${Bemasmentah}
┃ Jual : ${Semasmentah}
┃ Status : ${statusEmasMentah}
┃ Stock : ${dataEmasMentah.stockStatus}

┃
┃ *🪵 Kayu*
┃ Beli : ${Bkayu}
┃ Jual : ${Skayu}
┃ Status : ${statusKayu}
┃ Stock : ${dataKayu.stockStatus}
┃
┃ *🪨 Batu*
┃ Beli : ${Bbatu}
┃ Jual : ${Sbatu}
┃ Status : ${statusBatu}
┃ Stock : ${dataBatu.stockStatus}
┃
┃ *🪨 Coal*
┃ Beli : ${Bcoal}
┃ Jual : ${Scoal}
┃ Status : ${statusCoal}
┃ Stock : ${dataCoal.stockStatus}
┃
┃ *⛓️ Iron*
┃ Beli : ${Biron}
┃ Jual : ${Siron}
┃ Status : ${statusIron}
┃ Stock : ${dataIron.stockStatus}
┃
┃ *🏖️Pasir*
┃ Beli : ${Bpasir} /kg
┃ Jual : ${Spasir} /kg
┃ Status : ${statusPasir}
┃ Stock : ${dataPasir.stockStatus}
┃
┃ *☢️Uranium*
┃ Beli : ${Buranium} /gram
┃ Jual : ${Suranium} /gram
┃ Status : ${statusUranium}
┃ Stock : ${dataUranium.stockStatus}
┃
┃ *🪨Tembaga Ore*
┃ Beli : ${Btembagaore}
┃ Jual : ${Stembagaore}
┃ Status : ${statusTembagaOre}
┃ Stock : ${dataTembagaOre.stockStatus}
┃
┃ *🪨Perak Ore*
┃ Beli : ${Bperakore}
┃ Jual : ${Sperakore}
┃ Status : ${statusPerakOre}
┃ Stock : ${dataPerakOre.stockStatus}
┃
┃ *🪨Timah*
┃ Beli : ${Btimah}
┃ Jual : ${Stimah}
┃ Status : ${statusTimah}
┃ Stock : ${dataTimah.stockStatus}
┃
┃ *🪨Nikel*
┃ Beli : ${Bnikel}
┃ Jual : ${Snikel}
┃ Status : ${statusNikel}
┃ Stock : ${dataNikel.stockStatus}
┃
┃ *🔮Kuarsa*
┃ Beli : ${Bkuarsa}
┃ Jual : ${Skuarsa}
┃ Status : ${statusKuarsa}
┃ Stock : ${dataKuarsa.stockStatus}
┃
┃ *💠Kristal*
┃ Beli : ${Bkristal}
┃ Jual : ${Skristal}
┃ Status : ${statusKristal}
┃ Stock : ${dataKristal.stockStatus}
┃
┃ *⬛Obsidian*
┃ Beli : ${Bobsidian}
┃ Jual : ${Sobsidian}
┃ Status : ${statusObsidian}
┃ Stock : ${dataObsidian.stockStatus}
┃
┃ *🟨Belerang*
┃ Beli : ${Bbelerang}
┃ Jual : ${Sbelerang}
┃ Status : ${statusBelerang}
┃ Stock : ${dataBelerang.stockStatus}
┃
┃ *🏛️Marmer*
┃ Beli : ${Bmarmer}
┃ Jual : ${Smarmer}
┃ Status : ${statusMarmer}
┃ Stock : ${dataMarmer.stockStatus}
┃
┃ *🪨Granit*
┃ Beli : ${Bgranit}
┃ Jual : ${Sgranit}
┃ Status : ${statusGranit}
┃ Stock : ${dataGranit.stockStatus}
┃
┃ *🧂Garam*
┃ Beli : ${Bgaram}
┃ Jual : ${Sgaram}
┃ Status : ${statusGaram}
┃ Stock : ${dataGaram.stockStatus}
┃
┃ *🏺Tanah Liat*
┃ Beli : ${Btanahliat}
┃ Jual : ${Stanahliat}
┃ Status : ${statusTanahLiat}
┃ Stock : ${dataTanahLiat.stockStatus}
┃
┃ *🪨Batu Kapur*
┃ Beli : ${Bbatukapur}
┃ Jual : ${Sbatukapur}
┃ Status : ${statusBatuKapur}
┃ Stock : ${dataBatuKapur.stockStatus}
┃
┃ *💎Batu Permata*
┃ Beli : ${Bbatupermata}
┃ Jual : ${Sbatupermata}
┃ Status : ${statusBatuPermata}
┃ Stock : ${dataBatuPermata.stockStatus}
┃
┃ *🦴Fosil*
┃ Beli : ${Bfosil}
┃ Jual : ${Sfosil}
┃ Status : ${statusFosil}
┃ Stock : ${dataFosil.stockStatus}
┃
┃ *⚪Mutiara*
┃ Beli : ${Bmutiara}
┃ Jual : ${Smutiara}
┃ Status : ${statusMutiara}
┃ Stock : ${dataMutiara.stockStatus}
┃
┃ *🪸Karang*
┃ Beli : ${Bkarang}
┃ Jual : ${Skarang}
┃ Status : ${statusKarang}
┃ Stock : ${dataKarang.stockStatus}
┃
┃ *🧱Gipsum*
┃ Beli : ${Bgipsum}
┃ Jual : ${Sgipsum}
┃ Status : ${statusGipsum}
┃ Stock : ${dataGipsum.stockStatus}
┃
┃ *🧲Magnetit*
┃ Beli : ${Bmagnetit}
┃ Jual : ${Smagnetit}
┃ Status : ${statusMagnetit}
┃ Stock : ${dataMagnetit.stockStatus}
┃
┃ *🪨Bauksit*
┃ Beli : ${Bbauksit}
┃ Jual : ${Sbauksit}
┃ Status : ${statusBauksit}
┃ Stock : ${dataBauksit.stockStatus}
┃
┃ *🪨Platina Ore*
┃ Beli : ${Bplatinaore}
┃ Jual : ${Splatinaore}
┃ Status : ${statusPlatinaOre}
┃ Stock : ${dataPlatinaOre.stockStatus}
┃
┃ *🪨Titanium Ore*
┃ Beli : ${Btitaniumore}
┃ Jual : ${Stitaniumore}
┃ Status : ${statusTitaniumOre}
┃ Stock : ${dataTitaniumOre.stockStatus}
┃
┃ *🔋Litium*
┃ Beli : ${Blitium}
┃ Jual : ${Slitium}
┃ Status : ${statusLitium}
┃ Stock : ${dataLitium.stockStatus}
┃
┃ *🟩Zamrud Mentah*
┃ Beli : ${Bzamrudmentah}
┃ Jual : ${Szamrudmentah}
┃ Status : ${statusZamrudMentah}
┃ Stock : ${dataZamrudMentah.stockStatus}
┃
┃ *🟥Rubi Mentah*
┃ Beli : ${Brubimentah}
┃ Jual : ${Srubimentah}
┃ Status : ${statusRubiMentah}
┃ Stock : ${dataRubiMentah.stockStatus}
┃
└──────────────`;

    const menuPerlengkapan = `┌─⊷ *List Perlengkapan*
┃
┃ *⛏️ Pickaxe*
┃ Beli : ${Bpickaxe}
┃ Jual : ${Spickaxe}
┃ Status : ${statusPickaxe}
┃ Stock : ${dataPickaxe.stockStatus}
┃
┃ *⚔️ Sword*
┃ Beli : ${Bsword}
┃ Jual : ${Ssword}
┃ Status : ${statusSword}
┃ Stock : ${dataSword.stockStatus}
┃
┃ *🦯 Katana*
┃ Beli : ${Bkatana}
┃ Jual : ${Skatana}
┃ Status : ${statusKatana}
┃ Stock : ${dataKatana.stockStatus}
┃
┃ *🪓 Axe*
┃ Beli : ${Baxe}
┃ Jual : ${Saxe}
┃ Status : ${statusAxe}
┃ Stock : ${dataAxe.stockStatus}
┃
┃ *🔱 Trident*
┃ Beli : ${Btrident}
┃ Jual : ${Strident}
┃ Status : ${statusTrident}
┃ Stock : ${dataTrident.stockStatus}
┃
┃ *🏹 Bow*
┃ Beli : ${Bbow}
┃ Jual : ${Sbow}
┃ Status : ${statusBow}
┃ Stock : ${dataBow.stockStatus}
┃
┃ *🔪 Pisau*
┃ Beli : ${Bpisau}
┃ Jual : ${Spisau}
┃ Status : ${statusPisau}
┃ Stock : ${dataPisau.stockStatus}
┃
┃ *🎣 Fishingrod*
┃ Beli : ${Bfishingrod}
┃ Jual : ${Sfishingrod}
┃ Status : ${statusFishingrod}
┃ Stock : ${dataFishingrod.stockStatus}
┃
┃ *🥼 Armor*
┃ Beli : ${Barmor}
┃ Jual : ${Sarmor}
┃ Status : ${statusArmor}
┃ Stock : ${dataArmor.stockStatus}
┃
┃ *🛡️ Shield*
┃ Beli : ${Bshield}
┃ Jual : ${Sshield}
┃ Status : ${statusShield}
┃ Stock : ${dataShield.stockStatus}
┃
┃ *⛑️ Helmet*
┃ Beli : ${Bhelmet}
┃ Jual : ${Shelmet}
┃ Status : ${statusHelmet}
┃ Stock : ${dataHelmet.stockStatus}
┃
└──────────────`;

    const menuSenjata = `┌─⊷ *List Senjata*
┃
┃ *🪓 Tombak*
┃ Beli : ${Btombak}
┃ Jual : ${Stombak}
┃ Status : ${statusTombak}
┃ Stock : ${dataTombak.stockStatus}
┃
┃ *🏹 Busur*
┃ Beli : ${Bbusursenjata}
┃ Jual : ${Sbusursenjata}
┃ Status : ${statusBusurSenjata}
┃ Stock : ${dataBusurSenjata.stockStatus}
┃
┃ *🏹 Anak Panah*
┃ Beli : ${Banakpanah}
┃ Jual : ${Sanakpanah}
┃ Status : ${statusAnakPanah}
┃ Stock : ${dataAnakPanah.stockStatus}
┃
┃ *📦 Ammo*
┃ Beli : ${Bammo}
┃ Jual : ${Sammo}
┃ Status : ${statusAmmo}
┃ Stock : ${dataAmmo.stockStatus}
┃
┃ *🔫 Glock*
┃ Beli : ${Bglock}
┃ Jual : ${Sglock}
┃ Status : ${statusGlock}
┃ Stock : ${dataGlock.stockStatus}
┃
┃ *🔫 Beretta*
┃ Beli : ${Bberetta}
┃ Jual : ${Sberetta}
┃ Status : ${statusBeretta}
┃ Stock : ${dataBeretta.stockStatus}
┃
┃ *🔫 Revolver*
┃ Beli : ${Brevolver}
┃ Jual : ${Srevolver}
┃ Status : ${statusRevolver}
┃ Stock : ${dataRevolver.stockStatus}
┃
┃ *🔫 Deagle*
┃ Beli : ${Bdeagle}
┃ Jual : ${Sdeagle}
┃ Status : ${statusDeagle}
┃ Stock : ${dataDeagle.stockStatus}
┃
┃ *🔫 Mac10*
┃ Beli : ${Bmac10}
┃ Jual : ${Smac10}
┃ Status : ${statusMac10}
┃ Stock : ${dataMac10.stockStatus}
┃
┃ *🔫 Vector*
┃ Beli : ${Bvector}
┃ Jual : ${Svector}
┃ Status : ${statusVector}
┃ Stock : ${dataVector.stockStatus}
┃
┃ *🔫 Ump45*
┃ Beli : ${Bump45}
┃ Jual : ${Sump45}
┃ Status : ${statusUmp45}
┃ Stock : ${dataUmp45.stockStatus}
┃
┃ *🔫 Pp19bizon*
┃ Beli : ${Bpp19bizon}
┃ Jual : ${Spp19bizon}
┃ Status : ${statusPp19bizon}
┃ Stock : ${dataPp19bizon.stockStatus}
┃
┃ *🔫 Mp5*
┃ Beli : ${Bmp5}
┃ Jual : ${Smp5}
┃ Status : ${statusMp5}
┃ Stock : ${dataMp5.stockStatus}
┃
┃ *🔫 Uzi*
┃ Beli : ${Buzi}
┃ Jual : ${Suzi}
┃ Status : ${statusUzi}
┃ Stock : ${dataUzi.stockStatus}
┃
┃ *🔫 P90*
┃ Beli : ${Bp90}
┃ Jual : ${Sp90}
┃ Status : ${statusP90}
┃ Stock : ${dataP90.stockStatus}
┃
┃ *🔫 Ak47*
┃ Beli : ${Bak47}
┃ Jual : ${Sak47}
┃ Status : ${statusAk47}
┃ Stock : ${dataAk47.stockStatus}
┃
┃ *🔫 M4*
┃ Beli : ${Bm4}
┃ Jual : ${Sm4}
┃ Status : ${statusM4}
┃ Stock : ${dataM4.stockStatus}
┃
┃ *🔫 Qbz95*
┃ Beli : ${Bqbz95}
┃ Jual : ${Sqbz95}
┃ Status : ${statusQbz95}
┃ Stock : ${dataQbz95.stockStatus}
┃
┃ *🔫 Ar15*
┃ Beli : ${Bar15}
┃ Jual : ${Sar15}
┃ Status : ${statusAr15}
┃ Stock : ${dataAr15.stockStatus}
┃
┃ *🔫 G36c*
┃ Beli : ${Bg36c}
┃ Jual : ${Sg36c}
┃ Status : ${statusG36c}
┃ Stock : ${dataG36c.stockStatus}
┃
┃ *🔫 Aek971*
┃ Beli : ${Baek971}
┃ Jual : ${Saek971}
┃ Status : ${statusAek971}
┃ Stock : ${dataAek971.stockStatus}
┃
┃ *🔫 M16*
┃ Beli : ${Bm16}
┃ Jual : ${Sm16}
┃ Status : ${statusM16}
┃ Stock : ${dataM16.stockStatus}
┃
┃ *🔫 Hk416*
┃ Beli : ${Bhk416}
┃ Jual : ${Shk416}
┃ Status : ${statusHk416}
┃ Stock : ${dataHk416.stockStatus}
┃
┃ *🔫 Scar*
┃ Beli : ${Bscar}
┃ Jual : ${Sscar}
┃ Status : ${statusScar}
┃ Stock : ${dataScar.stockStatus}
┃
┃ *🔫 Famas*
┃ Beli : ${Bfamas}
┃ Jual : ${Sfamas}
┃ Status : ${statusFamas}
┃ Stock : ${dataFamas.stockStatus}
┃
┃ *🔫 Aug*
┃ Beli : ${Baug}
┃ Jual : ${Saug}
┃ Status : ${statusAug}
┃ Stock : ${dataAug.stockStatus}
┃
┃ *🔫 Fnfal*
┃ Beli : ${Bfnfal}
┃ Jual : ${Sfnfal}
┃ Status : ${statusFnfal}
┃ Stock : ${dataFnfal.stockStatus}
┃
┃ *💥 Spas12*
┃ Beli : ${Bspas12}
┃ Jual : ${Sspas12}
┃ Status : ${statusSpas12}
┃ Stock : ${dataSpas12.stockStatus}
┃
┃ *💥 Benellim4*
┃ Beli : ${Bbenellim4}
┃ Jual : ${Sbenellim4}
┃ Status : ${statusBenellim4}
┃ Stock : ${dataBenellim4.stockStatus}
┃
┃ *💥 Saiga12*
┃ Beli : ${Bsaiga12}
┃ Jual : ${Ssaiga12}
┃ Status : ${statusSaiga12}
┃ Stock : ${dataSaiga12.stockStatus}
┃
┃ *💥 Aa12*
┃ Beli : ${Baa12}
┃ Jual : ${Saa12}
┃ Status : ${statusAa12}
┃ Stock : ${dataAa12.stockStatus}
┃
┃ *🔫 Remington700*
┃ Beli : ${Bremington700}
┃ Jual : ${Sremington700}
┃ Status : ${statusRemington700}
┃ Stock : ${dataRemington700.stockStatus}
┃
┃ *🔫 M24*
┃ Beli : ${Bm24}
┃ Jual : ${Sm24}
┃ Status : ${statusM24}
┃ Stock : ${dataM24.stockStatus}
┃
┃ *🔫 M40*
┃ Beli : ${Bm40}
┃ Jual : ${Sm40}
┃ Status : ${statusM40}
┃ Stock : ${dataM40.stockStatus}
┃
┃ *🔫 L96*
┃ Beli : ${Bl96}
┃ Jual : ${Sl96}
┃ Status : ${statusL96}
┃ Stock : ${dataL96.stockStatus}
┃
┃ *🔫 Dragunovsvd*
┃ Beli : ${Bdragunovsvd}
┃ Jual : ${Sdragunovsvd}
┃ Status : ${statusDragunovsvd}
┃ Stock : ${dataDragunovsvd.stockStatus}
┃
┃ *🔫 Barrettm82*
┃ Beli : ${Bbarrettm82}
┃ Jual : ${Sbarrettm82}
┃ Status : ${statusBarrettm82}
┃ Stock : ${dataBarrettm82.stockStatus}
┃
┃ *🔫 Intervention*
┃ Beli : ${Bintervention}
┃ Jual : ${Sintervention}
┃ Status : ${statusIntervention}
┃ Stock : ${dataIntervention.stockStatus}
┃
┃ *🔫 Cheytacm200*
┃ Beli : ${Bcheytacm200}
┃ Jual : ${Scheytacm200}
┃ Status : ${statusCheytacm200}
┃ Stock : ${dataCheytacm200.stockStatus}
┃
┃ *🔫 Awm*
┃ Beli : ${Bawm}
┃ Jual : ${Sawm}
┃ Status : ${statusAwm}
┃ Stock : ${dataAwm.stockStatus}
┃
┃ *🔥 Pkm*
┃ Beli : ${Bpkm}
┃ Jual : ${Spkm}
┃ Status : ${statusPkm}
┃ Stock : ${dataPkm.stockStatus}
┃
┃ *🔥 M249*
┃ Beli : ${Bm249}
┃ Jual : ${Sm249}
┃ Status : ${statusM249}
┃ Stock : ${dataM249.stockStatus}
┃
┃ *🔥 Mg42*
┃ Beli : ${Bmg42}
┃ Jual : ${Smg42}
┃ Status : ${statusMg42}
┃ Stock : ${dataMg42.stockStatus}
┃
┃ *🚀 Rpg7*
┃ Beli : ${Brpg7}
┃ Jual : ${Srpg7}
┃ Status : ${statusRpg7}
┃ Stock : ${dataRpg7.stockStatus}
┃
┃ *🔥 Minigun*
┃ Beli : ${Bminigun}
┃ Jual : ${Sminigun}
┃ Status : ${statusMinigun}
┃ Stock : ${dataMinigun.stockStatus}
┃
┃ *🔫 Rubyrevolver*
┃ Beli : ${Brubyrevolver}
┃ Jual : ${Srubyrevolver}
┃ Status : ${statusRubyrevolver}
┃ Stock : ${dataRubyrevolver.stockStatus}
┃
┃ *🔫 Diamondrifle*
┃ Beli : ${Bdiamondrifle}
┃ Jual : ${Sdiamondrifle}
┃ Status : ${statusDiamondrifle}
┃ Stock : ${dataDiamondrifle.stockStatus}
┃
┃ *🔫 Emeraldsniper*
┃ Beli : ${Bemeraldsniper}
┃ Jual : ${Semeraldsniper}
┃ Status : ${statusEmeraldsniper}
┃ Stock : ${dataEmeraldsniper.stockStatus}
┃
┃ *🚀 Sapphirecannon*
┃ Beli : ${Bsapphirecannon}
┃ Jual : ${Ssapphirecannon}
┃ Status : ${statusSapphirecannon}
┃ Stock : ${dataSapphirecannon.stockStatus}
┃
└──────────────`;

    const menuPerhiasan = `┌─⊷ *List Perhiasan & Gemstone*
┃
┃ *💎 Diamond*
┃ Beli : ${Bdiamond}
┃ Jual : ${Sdiamond}
┃ Status : ${statusDiamond}
┃ Stock : ${dataDiamond.stockStatus}
┃
┃ *⬜ Perak*
┃ Beli : ${Bperak}
┃ Jual : ${Sperak}
┃ Status : ${statusPerak}
┃ Stock : ${dataPerak.stockStatus}
┃
┃ *🪙 Emas*
┃ Beli : ${Bemasbiasa}
┃ Jual : ${Semasbiasa}
┃ Status : ${statusEmas}
┃ Stock : ${dataEmasbiasa.stockStatus}
┃
┃ *❇️ Emerald*
┃ Beli : ${Bemerald}
┃ Jual : ${Semerald}
┃ Status : ${statusEmerald}
┃ Stock : ${dataEmerald.stockStatus}
┃
┃ *💎 Berlian*
┃ Beli : ${Bberlian}
┃ Jual : ${Sberlian}
┃ Status : ${statusBerlian}
┃ Stock : ${dataBerlian.stockStatus}
┃
┃ *🥇 Emas Batang*
┃ Beli : ${Bemasbatang}
┃ Jual : ${Semasbatang}
┃ Status : ${statusEmasBatang}
┃ Stock : ${dataEmasbatang.stockStatus}
┃
┃ *🥈 Perak Batang*
┃ Beli : ${Bperakbatang}
┃ Jual : ${Sperakbatang}
┃ Status : ${statusPerakBatang}
┃ Stock : ${dataPerakbatang.stockStatus}
┃
┃ *🔴 Ruby*
┃ Beli : ${Bruby}
┃ Jual : ${Sruby}
┃ Status : ${statusRuby}
┃ Stock : ${dataRuby.stockStatus}
┃
┃ *🔵 Sapphire*
┃ Beli : ${Bsapphire}
┃ Jual : ${Ssapphire}
┃ Status : ${statusSapphire}
┃ Stock : ${dataSapphire.stockStatus}
┃
┃ *🟡 Topaz*
┃ Beli : ${Btopaz}
┃ Jual : ${Stopaz}
┃ Status : ${statusTopaz}
┃ Stock : ${dataTopaz.stockStatus}
┃
┃ *🟣 Amethyst*
┃ Beli : ${Bamethyst}
┃ Jual : ${Samethyst}
┃ Status : ${statusAmethyst}
┃ Stock : ${dataAmethyst.stockStatus}
┃
┃ *🌈 Opal*
┃ Beli : ${Bopal}
┃ Jual : ${Sopal}
┃ Status : ${statusOpal}
┃ Stock : ${dataOpal.stockStatus}
┃
┃ *🧊 Aquamarine*
┃ Beli : ${Baquamarine}
┃ Jual : ${Saquamarine}
┃ Status : ${statusAquamarine}
┃ Stock : ${dataAquamarine.stockStatus}
┃
┃ *❤️ Garnet*
┃ Beli : ${Bgarnet}
┃ Jual : ${Sgarnet}
┃ Status : ${statusGarnet}
┃ Stock : ${dataGarnet.stockStatus}
┃
┃ *🟢 Jade*
┃ Beli : ${Bjade}
┃ Jual : ${Sjade}
┃ Status : ${statusJade}
┃ Stock : ${dataJade.stockStatus}
┃
┃ *⚫ Onyx*
┃ Beli : ${Bonyx}
┃ Jual : ${Sonyx}
┃ Status : ${statusOnyx}
┃ Stock : ${dataOnyx.stockStatus}
┃
┃ *🧿 Turquoise*
┃ Beli : ${Bturquoise}
┃ Jual : ${Sturquoise}
┃ Status : ${statusTurquoise}
┃ Stock : ${dataTurquoise.stockStatus}
┃
┃ *🔮 Alexandrite*
┃ Beli : ${Balexandrite}
┃ Jual : ${Salexandrite}
┃ Status : ${statusAlexandrite}
┃ Stock : ${dataAlexandrite.stockStatus}
┃
┃ *🌙 Moonstone*
┃ Beli : ${Bmoonstone}
┃ Jual : ${Smoonstone}
┃ Status : ${statusMoonstone}
┃ Stock : ${dataMoonstone.stockStatus}
┃
┃ *🖤 Black Diamond*
┃ Beli : ${Bblackdiamond}
┃ Jual : ${Sblackdiamond}
┃ Status : ${statusBlackDiamond}
┃ Stock : ${dataBlackdiamond.stockStatus}
┃
┃ *🩸 Red Diamond*
┃ Beli : ${Breddiamond}
┃ Jual : ${Sreddiamond}
┃ Status : ${statusRedDiamond}
┃ Stock : ${dataReddiamond.stockStatus}
┃
┃ *💿 Platinum*
┃ Beli : ${Bplatinum}
┃ Jual : ${Splatinum}
┃ Status : ${statusPlatinum}
┃ Stock : ${dataPlatinum.stockStatus}
┃
└──────────────`;

    const menuCrate = `┌─⊷ *List Crate*
┃
┃ *🎁 Common*
┃ Beli : ${Bcommon} Money
┃ Jual : ${Scommon} Money
┃ Status : ${statusCommon}
┃
┃ *🎁 Uncommon*
┃ Beli : ${Buncommon} Money
┃ Jual : ${Suncommon} Money
┃ Status : ${statusUncommon}
┃
┃ *💎 Rare*
┃ Beli : ${Brare} Money
┃ Jual : ${Srare} Money
┃ Status : ${statusRare}
┃
┃ *🔥 Epic*
┃ Beli : ${Bepic} Money
┃ Jual : ${Sepic} Money
┃ Status : ${statusEpic}
┃
┃ *🌌 Mythic*
┃ Beli : ${Bmythic} Money
┃ Jual : ${Smythic} Money
┃ Status : ${statusMythic}
┃
┃ *👑 Legendary*
┃ Beli : ${Blegendary} Money
┃ Jual : ${Slegendary} Money
┃ Status : ${statusLegendary}
┃
┃ *🗝️ Secret*
┃ Beli : ${Bsecret} Money
┃ Jual : ${Ssecret} Money
┃ Status : ${statusSecret}
┃
┃ *🌑 Dark*
┃ Beli : ${Bdark} Money
┃ Jual : ${Sdark} Money
┃ Status : ${statusDark}
┃
┃ *⚡ Cheat*
┃ Beli : ${Bcheat} Money
┃ Jual : ${Scheat} Money
┃ Status : ${statusCheat}
┃
└──────────────`;

    const menuMakanan = `┌─⊷ *List Makanan*
┃
┃ *🍌Pisang*
┃ Beli : ${Bpisang}
┃ Jual : ${Spisang}
┃ Status : ${statusPisang}
┃ Stock : ${dataPisang.stockStatus}
┃
┃ *🍇Anggur*
┃ Beli : ${Banggur}
┃ Jual : ${Sanggur}
┃ Status : ${statusAnggur}
┃ Stock : ${dataAnggur.stockStatus}
┃
┃ *🥭Mangga*
┃ Beli : ${Bmangga}
┃ Jual : ${Smangga}
┃ Status : ${statusMangga}
┃ Stock : ${dataMangga.stockStatus}
┃
┃ *🍊Jeruk*
┃ Beli : ${Bjeruk}
┃ Jual : ${Sjeruk}
┃ Status : ${statusJeruk}
┃ Stock : ${dataJeruk.stockStatus}
┃
┃ *🍎Apel*
┃ Beli : ${Bapel}
┃ Jual : ${Sapel}
┃ Status : ${statusApel}
┃ Stock : ${dataApel.stockStatus}
┃
┃ *🫔MakananPet*
┃ Beli : ${Bmakananpet}
┃ Jual : ${Smakananpet}
┃ Status : ${statusMakananPet}
┃ Stock : ${dataMakananPet.stockStatus}
┃
┃ *🥩MakananNaga*
┃ Beli : ${Bmakanannaga}
┃ Jual : ${Smakanannaga}
┃ Status : ${statusMakananNaga}
┃ Stock : ${dataMakananNaga.stockStatus}
┃
┃ *🥩MakananKyubi*
┃ Beli : ${Bmakanankyubi}
┃ Jual : ${Smakanankyubi}
┃ Status : ${statusMakananKyubi}
┃ Stock : ${dataMakananKyubi.stockStatus}
┃
┃ *🥩MakananGriffin*
┃ Beli : ${Bmakanangriffin}
┃ Jual : ${Smakanangriffin}
┃ Status : ${statusMakananGriffin}
┃ Stock : ${dataMakananGriffin.stockStatus}
┃
┃ *🥩MakananPhonix*
┃ Beli : ${Bmakananphonix}
┃ Jual : ${Smakananphonix}
┃ Status : ${statusMakananPhonix}
┃ Stock : ${dataMakananPhonix.stockStatus}
┃
┃ *🥩MakananCentaur*
┃ Beli : ${Bmakanancentaur}
┃ Jual : ${Smakanancentaur}
┃ Status : ${statusMakananCentaur}
┃ Stock : ${dataMakananCentaur.stockStatus}
┃
└──────────────`;

    const menuMinuman = `┌─⊷ *List Minuman & Jus*
┃
┃ *💧Air Mineral*
┃ Beli : ${Bairmineral}
┃ Jual : ${Sairmineral}
┃ Status : ${statusAirMineral}
┃ Stock : ${dataAirMineral.stockStatus}
┃
┃ *🍵Teh Botol*
┃ Beli : ${Btehbotol}
┃ Jual : ${Stehbotol}
┃ Status : ${statusTehBotol}
┃ Stock : ${dataTehBotol.stockStatus}
┃
┃ *☕Kopi Nescafe*
┃ Beli : ${Bnescafe}
┃ Jual : ${Snescafe}
┃ Status : ${statusNescafe}
┃ Stock : ${dataNescafe.stockStatus}
┃
┃ *🥛Ultra Milk*
┃ Beli : ${Bultramilk}
┃ Jual : ${Sultramilk}
┃ Status : ${statusUltraMilk}
┃ Stock : ${dataUltraMilk.stockStatus}
┃
┃ *🫗Aqua*
┃ Beli : ${Baqua}
┃ Jual : ${Saqua}
┃ Status : ${statusAqua}
┃ Stock : ${dataAqua.stockStatus}
┃
┃ *🥛Susu*
┃ Beli : ${Bsusu}
┃ Jual : ${Ssusu}
┃ Status : ${statusSusu}
┃ Stock : ${dataSusu.stockStatus}
┃
┃ *🍯Madu*
┃ Beli : ${Bmadu} /botol
┃ Jual : ${Smadu} /botol
┃ Status : ${statusMadu}
┃ Stock : ${dataMadu.stockStatus}
┃
┃ *🪤Umpan (Fishing)*
┃ Beli : ${Bumpan}
┃ Jual : ${Sumpan}
┃ Status : ${statusUmpan}
┃ Stock : ${dataUmpan.stockStatus}
┃
┃ *🍇Jus Anggur*
┃ Beli : ${Bjusanggur}
┃ Jual : ${Sjusanggur}
┃ Status : ${statusJusAnggur}
┃ Stock : ${dataJusAnggur.stockStatus}
┃
┃ *🍎Jus Apel*
┃ Beli : ${Bjusapel}
┃ Jual : ${Sjusapel}
┃ Status : ${statusJusApel}
┃ Stock : ${dataJusApel.stockStatus}
┃
┃ *🍊Jus Jeruk*
┃ Beli : ${Bjusjeruk}
┃ Jual : ${Sjusjeruk}
┃ Status : ${statusJusJeruk}
┃ Stock : ${dataJusJeruk.stockStatus}
┃
┃ *🥭Jus Mangga*
┃ Beli : ${Bjusmangga}
┃ Jual : ${Sjusmangga}
┃ Status : ${statusJusMangga}
┃ Stock : ${dataJusMangga.stockStatus}
┃
┃ *🍌Jus Pisang*
┃ Beli : ${Bjuspisang}
┃ Jual : ${Sjuspisang}
┃ Status : ${statusJusPisang}
┃ Stock : ${dataJusPisang.stockStatus}
┃
┃ *🍓Jus Stroberi*
┃ Beli : ${Bjusstroberi}
┃ Jual : ${Sjusstroberi}
┃ Status : ${statusJusStroberi}
┃ Stock : ${dataJusStroberi.stockStatus}
┃
┃ *🍈Jus Melon*
┃ Beli : ${Bjusmelon}
┃ Jual : ${Sjusmelon}
┃ Status : ${statusJusMelon}
┃ Stock : ${dataJusMelon.stockStatus}
┃
┃ *🍉Jus Semangka*
┃ Beli : ${Bjussemangka}
┃ Jual : ${Sjussemangka}
┃ Status : ${statusJusSemangka}
┃ Stock : ${dataJusSemangka.stockStatus}
┃
┃ *🍈Jus Durian*
┃ Beli : ${Bjusdurian}
┃ Jual : ${Sjusdurian}
┃ Status : ${statusJusDurian}
┃ Stock : ${dataJusDurian.stockStatus}
┃
┃ *🥭Jus Pepaya*
┃ Beli : ${Bjuspepaya}
┃ Jual : ${Sjuspepaya}
┃ Status : ${statusJusPepaya}
┃ Stock : ${dataJusPepaya.stockStatus}
┃
┃ *🥑Jus Alpukat*
┃ Beli : ${Bjusalpukat}
┃ Jual : ${Sjusalpukat}
┃ Status : ${statusJusAlpukat}
┃ Stock : ${dataJusAlpukat.stockStatus}
┃
┃ *🍊Es Jeruk*
┃ Beli : ${Besjeruk}
┃ Jual : ${Sesjeruk}
┃ Status : ${statusEsJeruk}
┃ Stock : ${dataEsJeruk.stockStatus}
┃
┃ *🥥Es Kelapa*
┃ Beli : ${Beskelapa}
┃ Jual : ${Seskelapa}
┃ Status : ${statusEsKelapa}
┃ Stock : ${dataEsKelapa.stockStatus}
┃
┃ *☕Kopi Hitam*
┃ Beli : ${Bkopihitam}
┃ Jual : ${Skopihitam}
┃ Status : ${statusKopiHitam}
┃ Stock : ${dataKopiHitam.stockStatus}
┃
┃ *☕Kopi Susu*
┃ Beli : ${Bkopisusu}
┃ Jual : ${Skopisusu}
┃ Status : ${statusKopiSusu}
┃ Stock : ${dataKopiSusu.stockStatus}
┃
┃ *☕Cappuccino*
┃ Beli : ${Bcappuccino}
┃ Jual : ${Scappuccino}
┃ Status : ${statusCappuccino}
┃ Stock : ${dataCappuccino.stockStatus}
┃
┃ *☕Latte*
┃ Beli : ${Blatte}
┃ Jual : ${Slatte}
┃ Status : ${statusLatte}
┃ Stock : ${dataLatte.stockStatus}
┃
┃ *☕Mocha*
┃ Beli : ${Bmocha}
┃ Jual : ${Smocha}
┃ Status : ${statusMocha}
┃ Stock : ${dataMocha.stockStatus}
┃
┃ *🫖Teh Manis*
┃ Beli : ${Btehmanis}
┃ Jual : ${Stehmanis}
┃ Status : ${statusTehManis}
┃ Stock : ${dataTehManis.stockStatus}
┃
┃ *🍵Teh Hijau*
┃ Beli : ${Btehhijau}
┃ Jual : ${Stehhijau}
┃ Status : ${statusTehHijau}
┃ Stock : ${dataTehHijau.stockStatus}
┃
┃ *🧋Teh Tarik*
┃ Beli : ${Btehtarik}
┃ Jual : ${Stehtarik}
┃ Status : ${statusTehTarik}
┃ Stock : ${dataTehTarik.stockStatus}
┃
┃ *🧋Susu Coklat*
┃ Beli : ${Bsusucoklat}
┃ Jual : ${Ssusucoklat}
┃ Status : ${statusSusuCoklat}
┃ Stock : ${dataSusuCoklat.stockStatus}
┃
┃ *🧋Susu Stroberi*
┃ Beli : ${Bsusustroberi}
┃ Jual : ${Ssusustroberi}
┃ Status : ${statusSusuStroberi}
┃ Stock : ${dataSusuStroberi.stockStatus}
┃
┃ *🥤Soda Gembira*
┃ Beli : ${Bsodagembira}
┃ Jual : ${Ssodagembira}
┃ Status : ${statusSodaGembira}
┃ Stock : ${dataSodaGembira.stockStatus}
┃
┃ *🍵Wedang Jahe*
┃ Beli : ${Bwedangjahe}
┃ Jual : ${Swedangjahe}
┃ Status : ${statusWedangJahe}
┃ Stock : ${dataWedangJahe.stockStatus}
┃
┃ *🥥Air Kelapa*
┃ Beli : ${Bairkelapa}
┃ Jual : ${Sairkelapa}
┃ Status : ${statusAirKelapa}
┃ Stock : ${dataAirKelapa.stockStatus}
┃
┃ *🍧Sirup Melon*
┃ Beli : ${Bsirupmelon}
┃ Jual : ${Ssirupmelon}
┃ Status : ${statusSirupMelon}
┃ Stock : ${dataSirupMelon.stockStatus}
┃
┃ *🍧Sirup Jeruk*
┃ Beli : ${Bsirupjeruk}
┃ Jual : ${Ssirupjeruk}
┃ Status : ${statusSirupJeruk}
┃ Stock : ${dataSirupJeruk.stockStatus}
┃
┃ *🍧Sirup Anggur*
┃ Beli : ${Bsirupanggur}
┃ Jual : ${Ssirupanggur}
┃ Status : ${statusSirupAnggur}
┃ Stock : ${dataSirupAnggur.stockStatus}
┃
┃ *🍧Sirup Stroberi*
┃ Beli : ${Bsirupstroberi}
┃ Jual : ${Ssirupstroberi}
┃ Status : ${statusSirupStroberi}
┃ Stock : ${dataSirupStroberi.stockStatus}
┃
└──────────────`;

    const menuSemua = `┌─⊷ *Semua Item Toko*\n┃\n└──────────────\n\n${menuKebutuhan}\n\n${menuBibit}\n\n${menuBarang}\n\n${menuAlam}\n\n${menuPerlengkapan}\n\n${menuSenjata}\n\n${menuPerhiasan}\n\n${menuCrate}\n\n${menuMakanan}\n\n${menuMinuman}\n\n┌─⊷ *Dompet Kamu*
• *Uang:* Rp ${user.money.toLocaleString()}
• *Emerald:* ${user.emerald}
• *Emas:* ${user.emas}
• *Diamond:* ${user.diamond}
• *Perak:* ${user.perak}`;

    let isShop = /^(shop|toko)$/i.test(command);
    let isBuy = /^(buy|beli)$/i.test(command);
    let isSell = /^(sell|jual)$/i.test(command);

    if (isShop) {
        let arg0 = (args[0] || '').toLowerCase();
        if (!arg0 || arg0 === 'help') return conn.reply(m.chat, menuHelp, m, { mentions: [m.sender] });
        if (arg0 === 'list') return conn.reply(m.chat, menuList, m);
        if (arg0 === 'semua' || arg0 === 'all') return conn.reply(m.chat, menuSemua, m);
        if (arg0 === 'kebutuhan') return conn.reply(m.chat, menuKebutuhan, m);
        if (arg0 === 'bibit' || arg0 === 'tanaman') return conn.reply(m.chat, menuBibit, m);
        if (arg0 === 'barang') return conn.reply(m.chat, menuBarang, m);
        if (arg0 === 'alam') return conn.reply(m.chat, menuAlam, m);
        if (arg0 === 'perlengkapan') return conn.reply(m.chat, menuPerlengkapan, m);
        if (arg0 === 'senjata' || arg0 === 'gun') return conn.reply(m.chat, menuSenjata, m);
        if (arg0 === 'perhiasan') return conn.reply(m.chat, menuPerhiasan, m);
        if (arg0 === 'crate') return conn.reply(m.chat, menuCrate, m);
        if (arg0 === 'makanan') return conn.reply(m.chat, menuMakanan, m);
        if (arg0 === 'minuman' || arg0 === 'jus') return conn.reply(m.chat, menuMinuman, m);
    }

    let action = isShop ? (args[0] || '').toLowerCase() : (isBuy ? 'buy' : (isSell ? 'sell' : ''));

    // ====== SUPPORT NAMA ITEM DENGAN/TANPA SPASI ======
    // Contoh: .buy black diamond 5  →  item='blackdiamond', count=5
    //         .buy blackdiamond 5   →  item='blackdiamond', count=5
    //         .shop buy black diamond 5 → item='blackdiamond', count=5
    function parseItemAndCount(rawArgs) {
        // Coba dari belakang: kalau arg terakhir adalah angka → itu count
        // sisanya join jadi nama item (tanpa spasi)
        if (!rawArgs || rawArgs.length === 0) return { item: '', count: 1 };
        let lastArg = rawArgs[rawArgs.length - 1];
        let parsed = parseInt(lastArg);
        if (!isNaN(parsed) && parsed > 0 && rawArgs.length > 1) {
            let itemName = rawArgs.slice(0, -1).join('').toLowerCase().replace(/\s+/g, '');
            return { item: itemName, count: parsed };
        }
        // Tidak ada angka di akhir → semua adalah nama item, count=1
        let itemName = rawArgs.join('').toLowerCase().replace(/\s+/g, '');
        return { item: itemName, count: 1 };
    }

    let parsed;
    if (isShop) {
        // .shop buy black diamond 5
        parsed = parseItemAndCount(args.slice(1));
    } else {
        // .buy black diamond 5 atau .sell blackdiamond 5
        parsed = parseItemAndCount(args);
    }
    let item = parsed.item;
    let count = parsed.count;

    try {
        if (!action) return conn.reply(m.chat, menuHelp, m, { mentions: [m.sender] });
        let curItem = shopItems[item];
        if (!curItem) {
            if (action !== 'buy' && action !== 'sell') return conn.reply(m.chat, menuHelp, m, { mentions: [m.sender] });
            return conn.reply(m.chat, `❌ Item *${item}* tidak ditemukan di toko. Ketik *${usedPrefix}shop semua* untuk melihat daftar item.`, m);
        }

        let isUnlimited = !curItem.data || curItem.data.stock === undefined;

        if (action === 'buy') {
            if (!isUnlimited && count > curItem.data.stock) {
                return conn.reply(m.chat, `❌ Stok Server tidak cukup! Sisa stok saat ini hanya: ${curItem.data.stock.toLocaleString()}`, m);
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

        } else if (action === 'sell') {
            let totalGain = curItem.S * count;
            let tax = Math.floor(totalGain * 0.05);
            let finalGain = totalGain - tax;
            if ((user[curItem.db] || 0) >= count) {
                user[curItem.db] -= count;
                user.money += finalGain;
                if (tax > 0) {
                    if (!global.db.data.negara) global.db.data.negara = { kas: 0 };
                    if (typeof global.db.data.negara.kas !== 'number') global.db.data.negara.kas = 0;
                    global.db.data.negara.kas += tax;
                }
                if (!isUnlimited && global.db.data.market[curItem.db]) {
                    global.db.data.market[curItem.db].stock += count;
                }
                conn.reply(m.chat, `⚖️ *TRANSAKSI SUKSES*\nKamu menjual ${count} ${curItem.name}.\nGross: +${totalGain.toLocaleString()} Money\nPajak Negara (5%): -${tax.toLocaleString()}\n*Diterima Bersih: ${finalGain.toLocaleString()} Money*`, m);
            } else {
                conn.reply(m.chat, `❌ Item ${curItem.name} kamu tidak cukup untuk dijual sebanyak itu.`, m);
            }
        }

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, 'Terjadi kesalahan di sistem Shop.', m);
    }
}

handler.help = ['shop', 'shop list', 'shop semua', 'shop <kategori>', 'shop buy <item> <jumlah>', 'buy <item> <jumlah>', 'sell <item> <jumlah>', 'beli <item> <jumlah>', 'jual <item> <jumlah>']
handler.tags = ['rpg']
handler.command = /^(shop|toko|buy|beli|sell|jual)$/i

module.exports = handler;
