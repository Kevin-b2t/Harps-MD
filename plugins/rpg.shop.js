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
    const menuHelp = `━━━「 *CARA PENGGUNAAN TOKO* 」━━━
Penggunaan: ${usedPrefix}shop <aksi> <item> <jumlah>

*Aksi yang tersedia:*
- *${usedPrefix}shop list* (Melihat daftar kategori)
- *${usedPrefix}shop semua* (Melihat semua item toko)
- *${usedPrefix}shop <kategori>* (Melihat per kategori, cth: ${usedPrefix}shop alam)
- *${usedPrefix}shop buy <item> <jumlah>* (Membeli item)
- *${usedPrefix}shop sell <item> <jumlah>* (Menjual item)

Contoh: *${usedPrefix}shop buy potion 5*
=======================`;

    const menuList = `━━━「 *KATEGORI TOKO* 」━━━
Ketik perintah di bawah untuk melihat isi tiap kategori:
- ${usedPrefix}shop kebutuhan
- ${usedPrefix}shop bibit
- ${usedPrefix}shop barang
- ${usedPrefix}shop alam
- ${usedPrefix}shop perhiasan
- ${usedPrefix}shop crate
- ${usedPrefix}shop makanan
- ${usedPrefix}shop minuman
=======================`;

    const menuKebutuhan = `━━━「 *HARGA BELI/JUAL* 」━━━
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

🎟️ TiketCoin:
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
Info Stock : ${dataPancingan.stockStatus}`;

    const menuBibit = `━━━「 *BIBIT & TANAMAN* 」━━━

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

🌶️Bibit Cabai:
HARGA BELI : ${Bbibitcabai}
HARGA JUAL : ${Sbibitcabai}
Status Harga : ${statusBibitCabai}
Info Stock : ${dataBibitCabai.stockStatus}

🍅Bibit Tomat:
HARGA BELI : ${Bbibittomat}
HARGA JUAL : ${Sbibittomat}
Status Harga : ${statusBibitTomat}
Info Stock : ${dataBibitTomat.stockStatus}

🧅Bibit Bawang:
HARGA BELI : ${Bbibitbawang}
HARGA JUAL : ${Sbibitbawang}
Status Harga : ${statusBibitBawang}
Info Stock : ${dataBibitBawang.stockStatus}

🍆Bibit Terong:
HARGA BELI : ${Bbibitterong}
HARGA JUAL : ${Sbibitterong}
Status Harga : ${statusBibitTerong}
Info Stock : ${dataBibitTerong.stockStatus}

🌽Bibit Jagung:
HARGA BELI : ${Bbibitjagung}
HARGA JUAL : ${Sbibitjagung}
Status Harga : ${statusBibitJagung}
Info Stock : ${dataBibitJagung.stockStatus}

🫘Bibit Kedelai:
HARGA BELI : ${Bbibitkedelai}
HARGA JUAL : ${Sbibitkedelai}
Status Harga : ${statusBibitKedelai}
Info Stock : ${dataBibitKedelai.stockStatus}

🍉Bibit Semangka:
HARGA BELI : ${Bbibitsemangka}
HARGA JUAL : ${Sbibitsemangka}
Status Harga : ${statusBibitSemangka}
Info Stock : ${dataBibitSemangka.stockStatus}

🍈Bibit Melon:
HARGA BELI : ${Bbibitmelon}
HARGA JUAL : ${Sbibitmelon}
Status Harga : ${statusBibitMelon}
Info Stock : ${dataBibitMelon.stockStatus}

🍓Bibit Stroberi:
HARGA BELI : ${Bbibitstroberi}
HARGA JUAL : ${Sbibitstroberi}
Status Harga : ${statusBibitStroberi}
Info Stock : ${dataBibitStroberi.stockStatus}

🍍Bibit Nanas:
HARGA BELI : ${Bbibitnanas}
HARGA JUAL : ${Sbibitnanas}
Status Harga : ${statusBibitNanas}
Info Stock : ${dataBibitNanas.stockStatus}

🥥Bibit Kelapa:
HARGA BELI : ${Bbibitkelapa}
HARGA JUAL : ${Sbibitkelapa}
Status Harga : ${statusBibitKelapa}
Info Stock : ${dataBibitKelapa.stockStatus}

🍈Bibit Durian:
HARGA BELI : ${Bbibitdurian}
HARGA JUAL : ${Sbibitdurian}
Status Harga : ${statusBibitDurian}
Info Stock : ${dataBibitDurian.stockStatus}

🥭Bibit Pepaya:
HARGA BELI : ${Bbibitpepaya}
HARGA JUAL : ${Sbibitpepaya}
Status Harga : ${statusBibitPepaya}
Info Stock : ${dataBibitPepaya.stockStatus}

🥑Bibit Alpukat:
HARGA BELI : ${Bbibitalpukat}
HARGA JUAL : ${Sbibitalpukat}
Status Harga : ${statusBibitAlpukat}
Info Stock : ${dataBibitAlpukat.stockStatus}

☕Bibit Kopi:
HARGA BELI : ${Bbibitkopi}
HARGA JUAL : ${Sbibitkopi}
Status Harga : ${statusBibitKopi}
Info Stock : ${dataBibitKopi.stockStatus}

🍫Bibit Kakao:
HARGA BELI : ${Bbibitkakao}
HARGA JUAL : ${Sbibitkakao}
Status Harga : ${statusBibitKakao}
Info Stock : ${dataBibitKakao.stockStatus}

🍦Bibit Vanili:
HARGA BELI : ${Bbibitvanili}
HARGA JUAL : ${Sbibitvanili}
Status Harga : ${statusBibitVanili}
Info Stock : ${dataBibitVanili.stockStatus}

🥬Bibit Kangkung:
HARGA BELI : ${Bbibitkangkung}
HARGA JUAL : ${Sbibitkangkung}
Status Harga : ${statusBibitKangkung}
Info Stock : ${dataBibitKangkung.stockStatus}

🥬Bibit Sawi:
HARGA BELI : ${Bbibitsawi}
HARGA JUAL : ${Sbibitsawi}
Status Harga : ${statusBibitSawi}
Info Stock : ${dataBibitSawi.stockStatus}

🥬Bibit Bayam:
HARGA BELI : ${Bbibitbayam}
HARGA JUAL : ${Sbibitbayam}
Status Harga : ${statusBibitBayam}
Info Stock : ${dataBibitBayam.stockStatus}

🥦Bibit Kol:
HARGA BELI : ${Bbibitkol}
HARGA JUAL : ${Sbibitkol}
Status Harga : ${statusBibitKol}
Info Stock : ${dataBibitKol.stockStatus}

🥦Bibit Brokoli:
HARGA BELI : ${Bbibitbrokoli}
HARGA JUAL : ${Sbibitbrokoli}
Status Harga : ${statusBibitBrokoli}
Info Stock : ${dataBibitBrokoli.stockStatus}

🥒Bibit Ketimun:
HARGA BELI : ${Bbibitketimun}
HARGA JUAL : ${Sbibitketimun}
Status Harga : ${statusBibitKetimun}
Info Stock : ${dataBibitKetimun.stockStatus}

🌶️Bibit Lombok:
HARGA BELI : ${Bbibitlombok}
HARGA JUAL : ${Sbibitlombok}
Status Harga : ${statusBibitLombok}
Info Stock : ${dataBibitLombok.stockStatus}

🫛Bibit Kacang Panjang:
HARGA BELI : ${Bbibitkacangpanjang}
HARGA JUAL : ${Sbibitkacangpanjang}
Status Harga : ${statusBibitKacangPanjang}
Info Stock : ${dataBibitKacangPanjang.stockStatus}`;

    const menuBarang = `╸╸━━━「 *BARANG* 」━━━╺╺

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

🛍️Plastik:
HARGA BELI : ${Bplastik}
HARGA JUAL : ${Splastik}
Status Harga : ${statusPlastik}
Info Stock : ${dataPlastik.stockStatus}

🥻Kain:
HARGA BELI : ${Bkain}
HARGA JUAL : ${Skain}
Status Harga : ${statusKain}
Info Stock : ${dataKain.stockStatus}

📍Paku:
HARGA BELI : ${Bpaku}
HARGA JUAL : ${Spaku}
Status Harga : ${statusPaku}
Info Stock : ${dataPaku.stockStatus}

🔋Baterai:
HARGA BELI : ${Bbaterai}
HARGA JUAL : ${Sbaterai}
Status Harga : ${statusBaterai}
Info Stock : ${dataBaterai.stockStatus}

🛞Ban Bekas:
HARGA BELI : ${Bbanbekas}
HARGA JUAL : ${Sbanbekas}
Status Harga : ${statusBanBekas}
Info Stock : ${dataBanBekas.stockStatus}

🪀Karet:
HARGA BELI : ${Bkaret}
HARGA JUAL : ${Skaret}
Status Harga : ${statusKaret}
Info Stock : ${dataKaret.stockStatus}

🥉Tembaga:
HARGA BELI : ${Btembaga}
HARGA JUAL : ${Stembaga}
Status Harga : ${statusTembaga}
Info Stock : ${dataTembaga.stockStatus}

🌫️Aluminium:
HARGA BELI : ${Baluminium}
HARGA JUAL : ${Saluminium}
Status Harga : ${statusAluminium}
Info Stock : ${dataAluminium.stockStatus}

🔩Baut:
HARGA BELI : ${Bbaut}
HARGA JUAL : ${Sbaut}
Status Harga : ${statusBaut}
Info Stock : ${dataBaut.stockStatus}

🔩Mur:
HARGA BELI : ${Bmur}
HARGA JUAL : ${Smur}
Status Harga : ${statusMur}
Info Stock : ${dataMur.stockStatus}

⚙️Gear:
HARGA BELI : ${Bgear}
HARGA JUAL : ${Sgear}
Status Harga : ${statusGear}
Info Stock : ${dataGear.stockStatus}

⛓️Rantai:
HARGA BELI : ${Brantai}
HARGA JUAL : ${Srantai}
Status Harga : ${statusRantai}
Info Stock : ${dataRantai.stockStatus}

🚂Mesin Bekas:
HARGA BELI : ${Bmesinbekas}
HARGA JUAL : ${Smesinbekas}
Status Harga : ${statusMesinBekas}
Info Stock : ${dataMesinBekas.stockStatus}

🛢️Oli:
HARGA BELI : ${Boli}
HARGA JUAL : ${Soli}
Status Harga : ${statusOli}
Info Stock : ${dataOli.stockStatus}

🖨️PCB:
HARGA BELI : ${Bpcb}
HARGA JUAL : ${Spcb}
Status Harga : ${statusPcb}
Info Stock : ${dataPcb.stockStatus}

🔌Kabel:
HARGA BELI : ${Bkabel}
HARGA JUAL : ${Skabel}
Status Harga : ${statusKabel}
Info Stock : ${dataKabel.stockStatus}

🪟Kaca:
HARGA BELI : ${Bkaca}
HARGA JUAL : ${Skaca}
Status Harga : ${statusKaca}
Info Stock : ${dataKaca.stockStatus}

🏺Keramik:
HARGA BELI : ${Bkeramik}
HARGA JUAL : ${Skeramik}
Status Harga : ${statusKeramik}
Info Stock : ${dataKeramik.stockStatus}

🧱Semen:
HARGA BELI : ${Bsemen}
HARGA JUAL : ${Ssemen}
Status Harga : ${statusSemen}
Info Stock : ${dataSemen.stockStatus}

🎨Cat:
HARGA BELI : ${Bcat}
HARGA JUAL : ${Scat}
Status Harga : ${statusCat}
Info Stock : ${dataCat.stockStatus}

🪙Koin Kuno:
HARGA BELI : ${Bkoinkuno}
HARGA JUAL : ${Skoinkuno}
Status Harga : ${statusKoinKuno}
Info Stock : ${dataKoinKuno.stockStatus}

🕰️Jam Rusak:
HARGA BELI : ${Bjamrusak}
HARGA JUAL : ${Sjamrusak}
Status Harga : ${statusJamRusak}
Info Stock : ${dataJamRusak.stockStatus}

🪝Pegas:
HARGA BELI : ${Bpegas}
HARGA JUAL : ${Spegas}
Status Harga : ${statusPegas}
Info Stock : ${dataPegas.stockStatus}

🦾Besi Bekas:
HARGA BELI : ${Bbesibekas}
HARGA JUAL : ${Sbesibekas}
Status Harga : ${statusBesiBekas}
Info Stock : ${dataBesiBekas.stockStatus}

💡Lampu:
HARGA BELI : ${Blampu}
HARGA JUAL : ${Slampu}
Status Harga : ${statusLampu}
Info Stock : ${dataLampu.stockStatus}`;

    const menuAlam = `╸╸━━━「 *ALAM* 」━━━╺╺

🪙Emas Mentah:
HARGA BELI : ${Bemasmentah}
HARGA JUAL : ${Semasmentah}
Status Harga : ${statusEmasMentah}
Info Stock : ${dataEmasMentah.stockStatus}

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

🪨Tembaga Ore:
HARGA BELI : ${Btembagaore}
HARGA JUAL : ${Stembagaore}
Status Harga : ${statusTembagaOre}
Info Stock : ${dataTembagaOre.stockStatus}

🪨Perak Ore:
HARGA BELI : ${Bperakore}
HARGA JUAL : ${Sperakore}
Status Harga : ${statusPerakOre}
Info Stock : ${dataPerakOre.stockStatus}

🪨Timah:
HARGA BELI : ${Btimah}
HARGA JUAL : ${Stimah}
Status Harga : ${statusTimah}
Info Stock : ${dataTimah.stockStatus}

🪨Nikel:
HARGA BELI : ${Bnikel}
HARGA JUAL : ${Snikel}
Status Harga : ${statusNikel}
Info Stock : ${dataNikel.stockStatus}

🔮Kuarsa:
HARGA BELI : ${Bkuarsa}
HARGA JUAL : ${Skuarsa}
Status Harga : ${statusKuarsa}
Info Stock : ${dataKuarsa.stockStatus}

💠Kristal:
HARGA BELI : ${Bkristal}
HARGA JUAL : ${Skristal}
Status Harga : ${statusKristal}
Info Stock : ${dataKristal.stockStatus}

⬛Obsidian:
HARGA BELI : ${Bobsidian}
HARGA JUAL : ${Sobsidian}
Status Harga : ${statusObsidian}
Info Stock : ${dataObsidian.stockStatus}

🟨Belerang:
HARGA BELI : ${Bbelerang}
HARGA JUAL : ${Sbelerang}
Status Harga : ${statusBelerang}
Info Stock : ${dataBelerang.stockStatus}

🏛️Marmer:
HARGA BELI : ${Bmarmer}
HARGA JUAL : ${Smarmer}
Status Harga : ${statusMarmer}
Info Stock : ${dataMarmer.stockStatus}

🪨Granit:
HARGA BELI : ${Bgranit}
HARGA JUAL : ${Sgranit}
Status Harga : ${statusGranit}
Info Stock : ${dataGranit.stockStatus}

🧂Garam:
HARGA BELI : ${Bgaram}
HARGA JUAL : ${Sgaram}
Status Harga : ${statusGaram}
Info Stock : ${dataGaram.stockStatus}

🏺Tanah Liat:
HARGA BELI : ${Btanahliat}
HARGA JUAL : ${Stanahliat}
Status Harga : ${statusTanahLiat}
Info Stock : ${dataTanahLiat.stockStatus}

🪨Batu Kapur:
HARGA BELI : ${Bbatukapur}
HARGA JUAL : ${Sbatukapur}
Status Harga : ${statusBatuKapur}
Info Stock : ${dataBatuKapur.stockStatus}

💎Batu Permata:
HARGA BELI : ${Bbatupermata}
HARGA JUAL : ${Sbatupermata}
Status Harga : ${statusBatuPermata}
Info Stock : ${dataBatuPermata.stockStatus}

🦴Fosil:
HARGA BELI : ${Bfosil}
HARGA JUAL : ${Sfosil}
Status Harga : ${statusFosil}
Info Stock : ${dataFosil.stockStatus}

⚪Mutiara:
HARGA BELI : ${Bmutiara}
HARGA JUAL : ${Smutiara}
Status Harga : ${statusMutiara}
Info Stock : ${dataMutiara.stockStatus}

🪸Karang:
HARGA BELI : ${Bkarang}
HARGA JUAL : ${Skarang}
Status Harga : ${statusKarang}
Info Stock : ${dataKarang.stockStatus}

🧱Gipsum:
HARGA BELI : ${Bgipsum}
HARGA JUAL : ${Sgipsum}
Status Harga : ${statusGipsum}
Info Stock : ${dataGipsum.stockStatus}

🧲Magnetit:
HARGA BELI : ${Bmagnetit}
HARGA JUAL : ${Smagnetit}
Status Harga : ${statusMagnetit}
Info Stock : ${dataMagnetit.stockStatus}

🪨Bauksit:
HARGA BELI : ${Bbauksit}
HARGA JUAL : ${Sbauksit}
Status Harga : ${statusBauksit}
Info Stock : ${dataBauksit.stockStatus}

🪨Platina Ore:
HARGA BELI : ${Bplatinaore}
HARGA JUAL : ${Splatinaore}
Status Harga : ${statusPlatinaOre}
Info Stock : ${dataPlatinaOre.stockStatus}

🪨Titanium Ore:
HARGA BELI : ${Btitaniumore}
HARGA JUAL : ${Stitaniumore}
Status Harga : ${statusTitaniumOre}
Info Stock : ${dataTitaniumOre.stockStatus}

🔋Litium:
HARGA BELI : ${Blitium}
HARGA JUAL : ${Slitium}
Status Harga : ${statusLitium}
Info Stock : ${dataLitium.stockStatus}

🟩Zamrud Mentah:
HARGA BELI : ${Bzamrudmentah}
HARGA JUAL : ${Szamrudmentah}
Status Harga : ${statusZamrudMentah}
Info Stock : ${dataZamrudMentah.stockStatus}

🟥Rubi Mentah:
HARGA BELI : ${Brubimentah}
HARGA JUAL : ${Srubimentah}
Status Harga : ${statusRubiMentah}
Info Stock : ${dataRubiMentah.stockStatus}`;

    const menuPerhiasan = `╸╸━━━「 *PERHIASAN & GEMSTONE* 」━━━╺╺

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

💎Berlian:
Harga Beli : ${Bberlian}
Harga Jual : ${Sberlian}
Status Harga : ${statusBerlian}

🥇Emas Batang:
Harga Beli : ${Bemasbatang}
Harga Jual : ${Semasbatang}
Status Harga : ${statusEmasBatang}

🥈Perak Batang:
Harga Beli : ${Bperakbatang}
Harga Jual : ${Sperakbatang}
Status Harga : ${statusPerakBatang}

🔴Ruby:
Harga Beli : ${Bruby}
Harga Jual : ${Sruby}
Status Harga : ${statusRuby}

🔵Sapphire:
Harga Beli : ${Bsapphire}
Harga Jual : ${Ssapphire}
Status Harga : ${statusSapphire}

🟡Topaz:
Harga Beli : ${Btopaz}
Harga Jual : ${Stopaz}
Status Harga : ${statusTopaz}

🟣Amethyst:
Harga Beli : ${Bamethyst}
Harga Jual : ${Samethyst}
Status Harga : ${statusAmethyst}

🌈Opal:
Harga Beli : ${Bopal}
Harga Jual : ${Sopal}
Status Harga : ${statusOpal}

🧊Aquamarine:
Harga Beli : ${Baquamarine}
Harga Jual : ${Saquamarine}
Status Harga : ${statusAquamarine}

❤️Garnet:
Harga Beli : ${Bgarnet}
Harga Jual : ${Sgarnet}
Status Harga : ${statusGarnet}

🟢Jade:
Harga Beli : ${Bjade}
Harga Jual : ${Sjade}
Status Harga : ${statusJade}

⚫Onyx:
Harga Beli : ${Bonyx}
Harga Jual : ${Sonyx}
Status Harga : ${statusOnyx}

🧿Turquoise:
Harga Beli : ${Bturquoise}
Harga Jual : ${Sturquoise}
Status Harga : ${statusTurquoise}

🔮Alexandrite:
Harga Beli : ${Balexandrite}
Harga Jual : ${Salexandrite}
Status Harga : ${statusAlexandrite}

🌙Moonstone:
Harga Beli : ${Bmoonstone}
Harga Jual : ${Smoonstone}
Status Harga : ${statusMoonstone}

🖤Black Diamond:
Harga Beli : ${Bblackdiamond}
Harga Jual : ${Sblackdiamond}
Status Harga : ${statusBlackDiamond}

🩸Red Diamond:
Harga Beli : ${Breddiamond}
Harga Jual : ${Sreddiamond}
Status Harga : ${statusRedDiamond}

💿Platinum:
Harga Beli : ${Bplatinum}
Harga Jual : ${Splatinum}
Status Harga : ${statusPlatinum}`;

    const menuCrate = `╸╸━━━「 *LIST CRATE* 」━━━╺╺

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
Status Harga : ${statusCheat}`;

    const menuMakanan = `╸╸━━━「 *MAKANAN* 」━━━╺╺

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
Info Stock : ${dataMakananCentaur.stockStatus}`;

    const menuMinuman = `╸╸━━━「 *MINUMAN & JUS* 」━━━╺╺

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

🪤Umpan (Fishing):
HARGA BELI : ${Bumpan}
HARGA JUAL : ${Sumpan}
Status Harga : ${statusUmpan}
Info Stock : ${dataUmpan.stockStatus}

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

🍓Jus Stroberi:
HARGA BELI : ${Bjusstroberi}
HARGA JUAL : ${Sjusstroberi}
Status Harga : ${statusJusStroberi}
Info Stock : ${dataJusStroberi.stockStatus}

🍈Jus Melon:
HARGA BELI : ${Bjusmelon}
HARGA JUAL : ${Sjusmelon}
Status Harga : ${statusJusMelon}
Info Stock : ${dataJusMelon.stockStatus}

🍉Jus Semangka:
HARGA BELI : ${Bjussemangka}
HARGA JUAL : ${Sjussemangka}
Status Harga : ${statusJusSemangka}
Info Stock : ${dataJusSemangka.stockStatus}

🍈Jus Durian:
HARGA BELI : ${Bjusdurian}
HARGA JUAL : ${Sjusdurian}
Status Harga : ${statusJusDurian}
Info Stock : ${dataJusDurian.stockStatus}

🥭Jus Pepaya:
HARGA BELI : ${Bjuspepaya}
HARGA JUAL : ${Sjuspepaya}
Status Harga : ${statusJusPepaya}
Info Stock : ${dataJusPepaya.stockStatus}

🥑Jus Alpukat:
HARGA BELI : ${Bjusalpukat}
HARGA JUAL : ${Sjusalpukat}
Status Harga : ${statusJusAlpukat}
Info Stock : ${dataJusAlpukat.stockStatus}

🍊Es Jeruk:
HARGA BELI : ${Besjeruk}
HARGA JUAL : ${Sesjeruk}
Status Harga : ${statusEsJeruk}
Info Stock : ${dataEsJeruk.stockStatus}

🥥Es Kelapa:
HARGA BELI : ${Beskelapa}
HARGA JUAL : ${Seskelapa}
Status Harga : ${statusEsKelapa}
Info Stock : ${dataEsKelapa.stockStatus}

☕Kopi Hitam:
HARGA BELI : ${Bkopihitam}
HARGA JUAL : ${Skopihitam}
Status Harga : ${statusKopiHitam}
Info Stock : ${dataKopiHitam.stockStatus}

☕Kopi Susu:
HARGA BELI : ${Bkopisusu}
HARGA JUAL : ${Skopisusu}
Status Harga : ${statusKopiSusu}
Info Stock : ${dataKopiSusu.stockStatus}

☕Cappuccino:
HARGA BELI : ${Bcappuccino}
HARGA JUAL : ${Scappuccino}
Status Harga : ${statusCappuccino}
Info Stock : ${dataCappuccino.stockStatus}

☕Latte:
HARGA BELI : ${Blatte}
HARGA JUAL : ${Slatte}
Status Harga : ${statusLatte}
Info Stock : ${dataLatte.stockStatus}

☕Mocha:
HARGA BELI : ${Bmocha}
HARGA JUAL : ${Smocha}
Status Harga : ${statusMocha}
Info Stock : ${dataMocha.stockStatus}

🫖Teh Manis:
HARGA BELI : ${Btehmanis}
HARGA JUAL : ${Stehmanis}
Status Harga : ${statusTehManis}
Info Stock : ${dataTehManis.stockStatus}

🍵Teh Hijau:
HARGA BELI : ${Btehhijau}
HARGA JUAL : ${Stehhijau}
Status Harga : ${statusTehHijau}
Info Stock : ${dataTehHijau.stockStatus}

🧋Teh Tarik:
HARGA BELI : ${Btehtarik}
HARGA JUAL : ${Stehtarik}
Status Harga : ${statusTehTarik}
Info Stock : ${dataTehTarik.stockStatus}

🧋Susu Coklat:
HARGA BELI : ${Bsusucoklat}
HARGA JUAL : ${Ssusucoklat}
Status Harga : ${statusSusuCoklat}
Info Stock : ${dataSusuCoklat.stockStatus}

🧋Susu Stroberi:
HARGA BELI : ${Bsusustroberi}
HARGA JUAL : ${Ssusustroberi}
Status Harga : ${statusSusuStroberi}
Info Stock : ${dataSusuStroberi.stockStatus}

🥤Soda Gembira:
HARGA BELI : ${Bsodagembira}
HARGA JUAL : ${Ssodagembira}
Status Harga : ${statusSodaGembira}
Info Stock : ${dataSodaGembira.stockStatus}

🍵Wedang Jahe:
HARGA BELI : ${Bwedangjahe}
HARGA JUAL : ${Swedangjahe}
Status Harga : ${statusWedangJahe}
Info Stock : ${dataWedangJahe.stockStatus}

🥥Air Kelapa:
HARGA BELI : ${Bairkelapa}
HARGA JUAL : ${Sairkelapa}
Status Harga : ${statusAirKelapa}
Info Stock : ${dataAirKelapa.stockStatus}

🍧Sirup Melon:
HARGA BELI : ${Bsirupmelon}
HARGA JUAL : ${Ssirupmelon}
Status Harga : ${statusSirupMelon}
Info Stock : ${dataSirupMelon.stockStatus}

🍧Sirup Jeruk:
HARGA BELI : ${Bsirupjeruk}
HARGA JUAL : ${Ssirupjeruk}
Status Harga : ${statusSirupJeruk}
Info Stock : ${dataSirupJeruk.stockStatus}

🍧Sirup Anggur:
HARGA BELI : ${Bsirupanggur}
HARGA JUAL : ${Ssirupanggur}
Status Harga : ${statusSirupAnggur}
Info Stock : ${dataSirupAnggur.stockStatus}

🍧Sirup Stroberi:
HARGA BELI : ${Bsirupstroberi}
HARGA JUAL : ${Ssirupstroberi}
Status Harga : ${statusSirupStroberi}
Info Stock : ${dataSirupStroberi.stockStatus}`;

    const menuSemua = `━━━「 *DAFTAR SEMUA ITEM TOKO* 」━━━\n\n${menuKebutuhan}\n\n${menuBibit}\n\n${menuBarang}\n\n${menuAlam}\n\n${menuPerhiasan}\n\n${menuCrate}\n\n${menuMakanan}\n\n${menuMinuman}\n\n━━━「 *DOMPET KAMU* 」━━━
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
        if (!arg0 || arg0 === 'help') return conn.reply(m.chat, menuHelp, m);
        if (arg0 === 'list') return conn.reply(m.chat, menuList, m);
        if (arg0 === 'semua' || arg0 === 'all') return conn.reply(m.chat, menuSemua, m);
        if (arg0 === 'kebutuhan') return conn.reply(m.chat, menuKebutuhan, m);
        if (arg0 === 'bibit' || arg0 === 'tanaman') return conn.reply(m.chat, menuBibit, m);
        if (arg0 === 'barang') return conn.reply(m.chat, menuBarang, m);
        if (arg0 === 'alam') return conn.reply(m.chat, menuAlam, m);
        if (arg0 === 'perhiasan') return conn.reply(m.chat, menuPerhiasan, m);
        if (arg0 === 'crate') return conn.reply(m.chat, menuCrate, m);
        if (arg0 === 'makanan') return conn.reply(m.chat, menuMakanan, m);
        if (arg0 === 'minuman' || arg0 === 'jus') return conn.reply(m.chat, menuMinuman, m);
    }

    let action = isShop ? (args[0] || '').toLowerCase() : (isBuy ? 'buy' : (isSell ? 'sell' : ''));
    let item = isShop ? (args[1] || '').toLowerCase() : (args[0] || '').toLowerCase();
    let countRaw = isShop ? args[2] : args[1];
    let count = countRaw && countRaw.length > 0 ? Math.max(parseInt(countRaw), 1) : 1;

    try {
        if (!action) return conn.reply(m.chat, menuHelp, m); 
        let curItem = shopItems[item];
        if (!curItem) {
            if (action !== 'buy' && action !== 'sell') return conn.reply(m.chat, menuHelp, m);
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

handler.help = ['shop', 'shop list', 'shop semua', 'shop <kategori>', 'shop <buy|sell> <item> <jumlah>']
handler.tags = ['rpg']
handler.command = /^(shop|toko|buy|beli|sell|jual)$/i

module.exports = handler;
