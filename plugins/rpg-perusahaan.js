// ==========================================
// KONFIGURASI HARGA & BIAYA
// ==========================================
const biayaInduk = {
    'produksi':  50000000000,   // 50 Miliar
    'tambang':   75000000000,   // 75 Miliar
    'daurulang': 30000000000,   // 30 Miliar
    'minuman':   40000000000,   // 40 Miliar
    'senjata':   80000000000,   // 80 Miliar
    'listrik':   100000000000   // 100 Miliar
};

const biayaPabrikObj = {
    'daurulang': 10000000000,
    'minuman':   20000000000,
    'tambang':   50000000000,
    'senjata':   80000000000
};

const hargaListrikNegara  = 14400;   
const HARGA_UPGRADE_GUDANG = 4000000; 
const HARGA_UPGRADE_LISTRIK = 1000000; 
const MAX_LEVEL_GUDANG  = 26500;
const MAX_LEVEL_LISTRIK = 24650; 

const slotPerLevel    = 120;  
const wattPerLevel    = 1200; 

// Kapasitas Daya Refill (Dasar) per 30 Menit
const kapasitasPembangkit = {
    'PLTU':  4000,     'PLTS':  8000,    
    'PLTB':  10000,    'PLTP':  20000,    
    'PLTA':  120000,   'PLTN':  200000    
};

const hargaPembangkit = {
    'PLTU':  5000000000,    'PLTS':  10000000000,   
    'PLTB':  15000000000,   'PLTP':  30000000000,   
    'PLTA':  100000000000,  'PLTN':  250000000000   
};

// ==========================================
// DATABASE BARANG PRODUKSI & RESEP BAHAN BAKU
// ==========================================
const semuaProduk = {
    // 🏭 TIPE: DAUR ULANG (Barang Baku & Kebutuhan)
    'botol':      { type: 'daurulang', name: 'Botol',       db: 'botol',      prodCost: 50,    listrik: 2,   bahan: {'sampah': 5, 'kardus': 1} },
    'kayu':       { type: 'daurulang', name: 'Kayu',        db: 'kayu',       prodCost: 200,   listrik: 3.5, bahan: {} },
    'sampah':     { type: 'daurulang', name: 'Sampah',      db: 'sampah',     prodCost: 20,    listrik: 1,   bahan: {} },
    'string':     { type: 'daurulang', name: 'String',      db: 'string',     prodCost: 10000, listrik: 5,   bahan: {} },
    'kaleng':     { type: 'daurulang', name: 'Kaleng',      db: 'kaleng',     prodCost: 80,    listrik: 2,   bahan: {} },
    'kardus':     { type: 'daurulang', name: 'Kardus',      db: 'kardus',     prodCost: 80,    listrik: 2,   bahan: {} },
    'plastik':    { type: 'daurulang', name: 'Plastik',     db: 'plastik',    prodCost: 60,    listrik: 2,   bahan: {} },
    'kain':       { type: 'daurulang', name: 'Kain',        db: 'kain',       prodCost: 80,    listrik: 2,   bahan: {} },
    'paku':       { type: 'daurulang', name: 'Paku',        db: 'paku',       prodCost: 30,    listrik: 1,   bahan: {} },
    'baterai':    { type: 'daurulang', name: 'Baterai',     db: 'baterai',    prodCost: 240,   listrik: 3,   bahan: {} },
    'banbekas':   { type: 'daurulang', name: 'Ban Bekas',   db: 'banbekas',   prodCost: 180,   listrik: 3,   bahan: {} },
    'karet':      { type: 'daurulang', name: 'Karet',       db: 'karet',      prodCost: 100,   listrik: 2,   bahan: {} },
    'tembaga':    { type: 'daurulang', name: 'Tembaga',     db: 'tembaga',    prodCost: 700,   listrik: 4,   bahan: {} },
    'aluminium':  { type: 'daurulang', name: 'Aluminium',   db: 'aluminium',  prodCost: 900,   listrik: 4,   bahan: {} },
    'baut':       { type: 'daurulang', name: 'Baut',        db: 'baut',       prodCost: 40,    listrik: 1,   bahan: {} },
    'mur':        { type: 'daurulang', name: 'Mur',         db: 'mur',        prodCost: 40,    listrik: 1,   bahan: {} },
    'gear':       { type: 'daurulang', name: 'Gear',        db: 'gear',       prodCost: 300,   listrik: 3,   bahan: {} },
    'rantai':     { type: 'daurulang', name: 'Rantai',      db: 'rantai',     prodCost: 240,   listrik: 3,   bahan: {} },
    'mesinbekas': { type: 'daurulang', name: 'Mesin Bekas', db: 'mesinbekas', prodCost: 1000,  listrik: 8,   bahan: {} },
    'oli':        { type: 'daurulang', name: 'Oli',         db: 'oli',        prodCost: 160,   listrik: 2,   bahan: {} },
    'pcb':        { type: 'daurulang', name: 'PCB',         db: 'pcb',        prodCost: 400,   listrik: 5,   bahan: {} },
    'kabel':      { type: 'daurulang', name: 'Kabel',       db: 'kabel',      prodCost: 120,   listrik: 2,   bahan: {} },
    'kaca':       { type: 'daurulang', name: 'Kaca',        db: 'kaca',       prodCost: 200,   listrik: 3,   bahan: {} },
    'keramik':    { type: 'daurulang', name: 'Keramik',     db: 'keramik',    prodCost: 240,   listrik: 3,   bahan: {} },
    'semen':      { type: 'daurulang', name: 'Semen',       db: 'semen',      prodCost: 500,   listrik: 4,   bahan: {} },
    'cat':        { type: 'daurulang', name: 'Cat',         db: 'cat',        prodCost: 300,   listrik: 3,   bahan: {} },
    'koinkuno':   { type: 'daurulang', name: 'Koin Kuno',   db: 'koinkuno',   prodCost: 2000,  listrik: 5,   bahan: {} },
    'jamrusak':   { type: 'daurulang', name: 'Jam Rusak',   db: 'jamrusak',   prodCost: 600,   listrik: 3,   bahan: {} },
    'pegas':      { type: 'daurulang', name: 'Pegas',       db: 'pegas',      prodCost: 80,    listrik: 2,   bahan: {} },
    'besibekas':  { type: 'daurulang', name: 'Besi Bekas',  db: 'besibekas',  prodCost: 160,   listrik: 4,   bahan: {} },
    'lampu':      { type: 'daurulang', name: 'Lampu',       db: 'lampu',      prodCost: 120,   listrik: 2,   bahan: {} },
    'potion':     { type: 'daurulang', name: 'Potion',      db: 'potion',     prodCost: 4000,  listrik: 5,   bahan: {} },
    'umpan':      { type: 'daurulang', name: 'Umpan',       db: 'umpan',      prodCost: 300,   listrik: 1,   bahan: {} },
    'pancingan':  { type: 'daurulang', name: 'Pancingan',   db: 'pancingan',  prodCost: 7000,  listrik: 6,   bahan: {} },

    // ⛏️ TIPE: TAMBANG (Material Alam Raya)
    'pasir':        { type: 'tambang', name: 'Pasir',         db: 'pasir',        prodCost: 50000,  listrik: 3,  bahan: {} },
    'iron':         { type: 'tambang', name: 'Iron',          db: 'iron',         prodCost: 4000,   listrik: 6,  bahan: {} },
    'emasmentah':   { type: 'tambang', name: 'Emas Mentah',   db: 'emasmentah',   prodCost: 173000, listrik: 10, bahan: {} },
    'batu':         { type: 'tambang', name: 'Batu',          db: 'batu',         prodCost: 100,    listrik: 4,  bahan: {} },
    'coal':         { type: 'tambang', name: 'Coal',          db: 'coal',         prodCost: 300,    listrik: 5,  bahan: {} },
    'uranium':      { type: 'tambang', name: 'Uranium',       db: 'uranium',      prodCost: 7000,   listrik: 15, bahan: {} },
    'tembagaore':   { type: 'tambang', name: 'Tembaga Ore',   db: 'tembagaore',   prodCost: 1600,   listrik: 6,  bahan: {} },
    'perakore':     { type: 'tambang', name: 'Perak Ore',     db: 'perakore',     prodCost: 2400,   listrik: 7,  bahan: {} },
    'timah':        { type: 'tambang', name: 'Timah',         db: 'timah',        prodCost: 1200,   listrik: 5,  bahan: {} },
    'nikel':        { type: 'tambang', name: 'Nikel',         db: 'nikel',        prodCost: 3000,   listrik: 6,  bahan: {} },
    'kuarsa':       { type: 'tambang', name: 'Kuarsa',        db: 'kuarsa',       prodCost: 4000,   listrik: 6,  bahan: {} },
    'kristal':      { type: 'tambang', name: 'Kristal',       db: 'kristal',      prodCost: 10000,  listrik: 8,  bahan: {} },
    'obsidian':     { type: 'tambang', name: 'Obsidian',      db: 'obsidian',     prodCost: 7000,   listrik: 8,  bahan: {} },
    'belerang':     { type: 'tambang', name: 'Belerang',      db: 'belerang',     prodCost: 1000,   listrik: 4,  bahan: {} },
    'marmer':       { type: 'tambang', name: 'Marmer',        db: 'marmer',       prodCost: 2400,   listrik: 5,  bahan: {} },
    'granit':       { type: 'tambang', name: 'Granit',        db: 'granit',       prodCost: 2000,   listrik: 5,  bahan: {} },
    'garam':        { type: 'tambang', name: 'Garam',         db: 'garam',        prodCost: 400,    listrik: 2,  bahan: {} },
    'tanahliat':    { type: 'tambang', name: 'Tanah Liat',    db: 'tanahliat',    prodCost: 300,    listrik: 2,  bahan: {} },
    'batukapur':    { type: 'tambang', name: 'Batu Kapur',    db: 'batukapur',    prodCost: 600,    listrik: 3,  bahan: {} },
    'batupermata':  { type: 'tambang', name: 'Batu Permata',  db: 'batupermata',  prodCost: 16000,  listrik: 12, bahan: {} },
    'fosil':        { type: 'tambang', name: 'Fosil',         db: 'fosil',        prodCost: 9000,   listrik: 8,  bahan: {} },
    'mutiara':      { type: 'tambang', name: 'Mutiara',       db: 'mutiara',      prodCost: 12000,  listrik: 10, bahan: {} },
    'karang':       { type: 'tambang', name: 'Karang',        db: 'karang',       prodCost: 1000,   listrik: 3,  bahan: {} },
    'gipsum':       { type: 'tambang', name: 'Gipsum',        db: 'gipsum',       prodCost: 800,    listrik: 3,  bahan: {} },
    'magnetit':     { type: 'tambang', name: 'Magnetit',      db: 'magnetit',     prodCost: 3600,   listrik: 6,  bahan: {} },
    'bauksit':      { type: 'tambang', name: 'Bauksit',       db: 'bauksit',      prodCost: 2800,   listrik: 5,  bahan: {} },
    'platinaore':   { type: 'tambang', name: 'Platina Ore',   db: 'platinaore',   prodCost: 7000,   listrik: 8,  bahan: {} },
    'titaniumore':  { type: 'tambang', name: 'Titanium Ore',  db: 'titaniumore',  prodCost: 8000,   listrik: 8,  bahan: {} },
    'litium':       { type: 'tambang', name: 'Litium',        db: 'litium',       prodCost: 5000,   listrik: 6,  bahan: {} },
    'zamrudmentah': { type: 'tambang', name: 'Zamrud Mentah', db: 'zamrudmentah', prodCost: 13000,  listrik: 12, bahan: {} },
    'rubimentah':   { type: 'tambang', name: 'Rubi Mentah',   db: 'rubimentah',   prodCost: 14000,  listrik: 12, bahan: {} },

    // 💧 TIPE: MINUMAN (Makanan & Minuman)
    'airmineral':   { type: 'minuman', name: 'Air Mineral',   db: 'airmineral',   prodCost: 2000, listrik: 2, bahan: {'aqua': 1, 'botol': 1} },
    'tehbotol':     { type: 'minuman', name: 'Teh Botol',     db: 'tehbotol',     prodCost: 1900, listrik: 3, bahan: {'aqua': 1, 'botol': 1} },
    'aqua':         { type: 'minuman', name: 'Aqua',          db: 'aqua',         prodCost: 1000, listrik: 2, bahan: {} },
    'susu':         { type: 'minuman', name: 'Susu',          db: 'susu',         prodCost: 1200, listrik: 2, bahan: {} },
    'madu':         { type: 'minuman', name: 'Madu',          db: 'madu',         prodCost: 12800, listrik: 4, bahan: {} },
    'nescafe':      { type: 'minuman', name: 'Kopi Nescafe',  db: 'nescafe',      prodCost: 2800, listrik: 3, bahan: {} },
    'ultramilk':    { type: 'minuman', name: 'Ultra Milk',    db: 'ultramilk',    prodCost: 2000, listrik: 3, bahan: {} },
    'jusanggur':    { type: 'minuman', name: 'Jus Anggur',    db: 'jusanggur',    prodCost: 2400, listrik: 3, bahan: {} },
    'jusapel':      { type: 'minuman', name: 'Jus Apel',      db: 'jusapel',      prodCost: 2400, listrik: 3, bahan: {} },
    'jusjeruk':     { type: 'minuman', name: 'Jus Jeruk',     db: 'jusjeruk',     prodCost: 2500, listrik: 3, bahan: {} },
    'jusmangga':    { type: 'minuman', name: 'Jus Mangga',    db: 'jusmangga',    prodCost: 2500, listrik: 3, bahan: {} },
    'juspisang':    { type: 'minuman', name: 'Jus Pisang',    db: 'juspisang',    prodCost: 2600, listrik: 3, bahan: {} },
    'pisang':       { type: 'minuman', name: 'Pisang',        db: 'pisang',       prodCost: 1100, listrik: 1, bahan: {} },
    'anggur':       { type: 'minuman', name: 'Anggur',        db: 'anggur',       prodCost: 1100, listrik: 1, bahan: {} },
    'mangga':       { type: 'minuman', name: 'Mangga',        db: 'mangga',       prodCost: 920,  listrik: 1, bahan: {} },
    'jeruk':        { type: 'minuman', name: 'Jeruk',         db: 'jeruk',        prodCost: 1200, listrik: 1, bahan: {} },
    'apel':         { type: 'minuman', name: 'Apel',          db: 'apel',         prodCost: 1100, listrik: 1, bahan: {} },
    'makananpet':     { type: 'minuman', name: 'Makanan Pet',     db: 'makananpet',     prodCost: 10000, listrik: 5, bahan: {} },
    'makanannaga':    { type: 'minuman', name: 'Makanan Naga',    db: 'makanannaga',    prodCost: 30000, listrik: 8, bahan: {} },
    'makanankyubi':   { type: 'minuman', name: 'Makanan Kyubi',   db: 'makanankyubi',   prodCost: 30000, listrik: 8, bahan: {} },
    'makanangriffin': { type: 'minuman', name: 'Makanan Griffin', db: 'makanangriffin', prodCost: 16000, listrik: 6, bahan: {} },
    'makananphonix':  { type: 'minuman', name: 'Makanan Phonix',  db: 'makananphonix',  prodCost: 16000, listrik: 6, bahan: {} },
    'makanancentaur': { type: 'minuman', name: 'Makanan Centaur', db: 'makanancentaur', prodCost: 30000, listrik: 8, bahan: {} },
    'esjeruk':        { type: 'minuman', name: 'Es Jeruk',        db: 'esjeruk',        prodCost: 1600,  listrik: 2, bahan: {} },
    'eskelapa':       { type: 'minuman', name: 'Es Kelapa',       db: 'eskelapa',       prodCost: 2000,  listrik: 2, bahan: {} },
    'kopihitam':      { type: 'minuman', name: 'Kopi Hitam',      db: 'kopihitam',      prodCost: 1400,  listrik: 2, bahan: {} },
    'kopisusu':       { type: 'minuman', name: 'Kopi Susu',       db: 'kopisusu',       prodCost: 1800,  listrik: 2, bahan: {} },
    'cappuccino':     { type: 'minuman', name: 'Cappuccino',      db: 'cappuccino',     prodCost: 3000,  listrik: 3, bahan: {} },
    'latte':          { type: 'minuman', name: 'Latte',           db: 'latte',          prodCost: 3200,  listrik: 3, bahan: {} },
    'mocha':          { type: 'minuman', name: 'Mocha',           db: 'mocha',          prodCost: 3400,  listrik: 3, bahan: {} },
    'tehmanis':       { type: 'minuman', name: 'Teh Manis',       db: 'tehmanis',       prodCost: 1000,  listrik: 2, bahan: {} },
    'tehhijau':       { type: 'minuman', name: 'Teh Hijau',       db: 'tehhijau',       prodCost: 1600,  listrik: 2, bahan: {} },
    'tehtarik':       { type: 'minuman', name: 'Teh Tarik',       db: 'tehtarik',       prodCost: 2000,  listrik: 2, bahan: {} },
    'jusstroberi':    { type: 'minuman', name: 'Jus Stroberi',    db: 'jusstroberi',    prodCost: 2700,  listrik: 3, bahan: {} },
    'jusmelon':       { type: 'minuman', name: 'Jus Melon',       db: 'jusmelon',       prodCost: 2600,  listrik: 3, bahan: {} },
    'jussemangka':    { type: 'minuman', name: 'Jus Semangka',    db: 'jussemangka',    prodCost: 2500,  listrik: 3, bahan: {} },
    'jusdurian':      { type: 'minuman', name: 'Jus Durian',      db: 'jusdurian',      prodCost: 3600,  listrik: 4, bahan: {} },
    'juspepaya':      { type: 'minuman', name: 'Jus Pepaya',      db: 'juspepaya',      prodCost: 2200,  listrik: 3, bahan: {} },
    'jusalpukat':     { type: 'minuman', name: 'Jus Alpukat',     db: 'jusalpukat',     prodCost: 2800,  listrik: 3, bahan: {} },
    'susucoklat':     { type: 'minuman', name: 'Susu Coklat',     db: 'susucoklat',     prodCost: 1600,  listrik: 2, bahan: {} },
    'susustroberi':   { type: 'minuman', name: 'Susu Stroberi',   db: 'susustroberi',   prodCost: 1700,  listrik: 2, bahan: {} },
    'sodagembira':    { type: 'minuman', name: 'Soda Gembira',    db: 'sodagembira',    prodCost: 2400,  listrik: 3, bahan: {} },
    'wedangjahe':     { type: 'minuman', name: 'Wedang Jahe',     db: 'wedangjahe',     prodCost: 1200,  listrik: 2, bahan: {} },
    'airkelapa':      { type: 'minuman', name: 'Air Kelapa',      db: 'airkelapa',      prodCost: 1400,  listrik: 2, bahan: {} },
    'sirupmelon':     { type: 'minuman', name: 'Sirup Melon',     db: 'sirupmelon',     prodCost: 3000,  listrik: 3, bahan: {} },
    'sirupjeruk':     { type: 'minuman', name: 'Sirup Jeruk',     db: 'sirupjeruk',     prodCost: 3000,  listrik: 3, bahan: {} },
    'sirupanggur':    { type: 'minuman', name: 'Sirup Anggur',    db: 'sirupanggur',    prodCost: 3200,  listrik: 3, bahan: {} },
    'sirupstroberi':  { type: 'minuman', name: 'Sirup Stroberi',  db: 'sirupstroberi',  prodCost: 3200,  listrik: 3, bahan: {} },

    // ⚔️ TIPE: SENJATA (Penggabungan Perlengkapan & Senjata)
    'sword':          { type: 'senjata', name: 'Sword',          db: 'sword',          prodCost: 30000,   listrik: 8,   bahan: {'iron': 5, 'kayu': 2} },
    'pickaxe':        { type: 'senjata', name: 'Pickaxe',        db: 'pickaxe',        prodCost: 3000,    listrik: 5,   bahan: {} },
    'katana':         { type: 'senjata', name: 'Katana',         db: 'katana',         prodCost: 40000,   listrik: 15,  bahan: {} },
    'axe':            { type: 'senjata', name: 'Axe',            db: 'axe',            prodCost: 3000,    listrik: 5,   bahan: {} },
    'trident':        { type: 'senjata', name: 'Trident',        db: 'trident',        prodCost: 50000,   listrik: 20,  bahan: {} },
    'bow':            { type: 'senjata', name: 'Bow',            db: 'bow',            prodCost: 10000,   listrik: 6,   bahan: {} },
    'pisau':          { type: 'senjata', name: 'Pisau',          db: 'pisau',          prodCost: 2000,    listrik: 4,   bahan: {} },
    'fishingrod':     { type: 'senjata', name: 'Fishing Rod',    db: 'fishingrod',     prodCost: 3000,    listrik: 4,   bahan: {} },
    'armor':          { type: 'senjata', name: 'Armor',          db: 'armor',          prodCost: 70000,   listrik: 25,  bahan: {} },
    'shield':         { type: 'senjata', name: 'Shield',         db: 'shield',         prodCost: 40000,   listrik: 15,  bahan: {} },
    'helmet':         { type: 'senjata', name: 'Helmet',         db: 'helmet',         prodCost: 30000,   listrik: 15,  bahan: {} },
    'tombak':         { type: 'senjata', name: 'Tombak',         db: 'tombak',         prodCost: 10000000,listrik: 50,  bahan: {} },
    'busur':          { type: 'senjata', name: 'Busur',          db: 'busur',          prodCost: 2000000, listrik: 30,  bahan: {} },
    'anakpanah':      { type: 'senjata', name: 'Anak Panah',     db: 'anakpanah',      prodCost: 1600000, listrik: 25,  bahan: {} },
    'ammo':           { type: 'senjata', name: 'Ammo',           db: 'ammo',           prodCost: 700000,  listrik: 20,  bahan: {} },
    'glock':          { type: 'senjata', name: 'Glock',          db: 'glock',          prodCost: 600000,  listrik: 25,  bahan: {} },
    'beretta':        { type: 'senjata', name: 'Beretta',        db: 'beretta',        prodCost: 700000,  listrik: 30,  bahan: {} },
    'revolver':       { type: 'senjata', name: 'Revolver',       db: 'revolver',       prodCost: 800000,  listrik: 35,  bahan: {} },
    'deagle':         { type: 'senjata', name: 'Deagle',         db: 'deagle',         prodCost: 900000,  listrik: 40,  bahan: {} },
    'mac10':          { type: 'senjata', name: 'Mac10',          db: 'mac10',          prodCost: 800000,  listrik: 35,  bahan: {} },
    'vector':         { type: 'senjata', name: 'Vector',         db: 'vector',         prodCost: 840000,  listrik: 40,  bahan: {} },
    'ump45':          { type: 'senjata', name: 'Ump45',          db: 'ump45',          prodCost: 900000,  listrik: 45,  bahan: {} },
    'pp19bizon':      { type: 'senjata', name: 'Pp19 Bizon',     db: 'pp19bizon',      prodCost: 960000,  listrik: 45,  bahan: {} },
    'mp5':            { type: 'senjata', name: 'Mp5',            db: 'mp5',            prodCost: 1000000, listrik: 50,  bahan: {} },
    'uzi':            { type: 'senjata', name: 'Uzi',            db: 'uzi',            prodCost: 1100000, listrik: 50,  bahan: {} },
    'p90':            { type: 'senjata', name: 'P90',            db: 'p90',            prodCost: 1280000, listrik: 55,  bahan: {} },
    'ak47':           { type: 'senjata', name: 'Ak47',           db: 'ak47',           prodCost: 1280000, listrik: 60,  bahan: {} },
    'm4':             { type: 'senjata', name: 'M4',             db: 'm4',             prodCost: 1300000, listrik: 60,  bahan: {} },
    'qbz95':          { type: 'senjata', name: 'Qbz95',          db: 'qbz95',          prodCost: 1500000, listrik: 65,  bahan: {} },
    'ar15':           { type: 'senjata', name: 'Ar15',           db: 'ar15',           prodCost: 1540000, listrik: 65,  bahan: {} },
    'g36c':           { type: 'senjata', name: 'G36c',           db: 'g36c',           prodCost: 1600000, listrik: 70,  bahan: {} },
    'aek971':         { type: 'senjata', name: 'Aek971',         db: 'aek971',         prodCost: 1640000, listrik: 70,  bahan: {} },
    'm16':            { type: 'senjata', name: 'M16',            db: 'm16',            prodCost: 1680000, listrik: 75,  bahan: {} },
    'hk416':          { type: 'senjata', name: 'Hk416',          db: 'hk416',          prodCost: 1700000, listrik: 75,  bahan: {} },
    'scar':           { type: 'senjata', name: 'Scar',           db: 'scar',           prodCost: 1800000, listrik: 80,  bahan: {} },
    'famas':          { type: 'senjata', name: 'Famas',          db: 'famas',          prodCost: 1800000, listrik: 80,  bahan: {} },
    'aug':            { type: 'senjata', name: 'Aug',            db: 'aug',            prodCost: 1880000, listrik: 85,  bahan: {} },
    'fnfal':          { type: 'senjata', name: 'Fnfal',          db: 'fnfal',          prodCost: 1900000, listrik: 85,  bahan: {} },
    'spas12':         { type: 'senjata', name: 'Spas12',         db: 'spas12',         prodCost: 1700000, listrik: 75,  bahan: {} },
    'benellim4':      { type: 'senjata', name: 'Benelli M4',     db: 'benellim4',      prodCost: 2000000, listrik: 90,  bahan: {} },
    'saiga12':        { type: 'senjata', name: 'Saiga12',        db: 'saiga12',        prodCost: 2200000, listrik: 95,  bahan: {} },
    'aa12':           { type: 'senjata', name: 'Aa12',           db: 'aa12',           prodCost: 2400000, listrik: 100, bahan: {} },
    'remington700':   { type: 'senjata', name: 'Remington 700',  db: 'remington700',   prodCost: 5000000, listrik: 120, bahan: {} },
    'm24':            { type: 'senjata', name: 'M24',            db: 'm24',            prodCost: 8000000, listrik: 150, bahan: {} },
    'm40':            { type: 'senjata', name: 'M40',            db: 'm40',            prodCost: 8000000, listrik: 150, bahan: {} },
    'l96':            { type: 'senjata', name: 'L96',            db: 'l96',            prodCost: 9000000, listrik: 160, bahan: {} },
    'dragunovsvd':    { type: 'senjata', name: 'Dragunov SVD',   db: 'dragunovsvd',    prodCost: 17600000,listrik: 200, bahan: {} },
    'barrettm82':     { type: 'senjata', name: 'Barrett M82',    db: 'barrettm82',     prodCost: 19800000,listrik: 220, bahan: {} },
    'intervention':   { type: 'senjata', name: 'Intervention',   db: 'intervention',   prodCost: 24000000,listrik: 250, bahan: {} },
    'cheytacm200':    { type: 'senjata', name: 'Cheytac M200',   db: 'cheytacm200',    prodCost: 26000000,listrik: 260, bahan: {} },
    'awm':            { type: 'senjata', name: 'AWM',            db: 'awm',            prodCost: 30000000,listrik: 300, bahan: {} },
    'pkm':            { type: 'senjata', name: 'PKM',            db: 'pkm',            prodCost: 11000000,listrik: 180, bahan: {} },
    'm249':           { type: 'senjata', name: 'M249',           db: 'm249',           prodCost: 12000000,listrik: 190, bahan: {} },
    'mg42':           { type: 'senjata', name: 'Mg42',           db: 'mg42',           prodCost: 14000000,listrik: 210, bahan: {} },
    'rpg7':           { type: 'senjata', name: 'RPG-7',          db: 'rpg7',           prodCost: 17000000,listrik: 240, bahan: {} },
    'minigun':        { type: 'senjata', name: 'Minigun',        db: 'minigun',        prodCost: 30000000,listrik: 350, bahan: {} },
    'rubyrevolver':   { type: 'senjata', name: 'Ruby Revolver',  db: 'rubyrevolver',   prodCost: 60000000,listrik: 500, bahan: {} },
    'diamondrifle':   { type: 'senjata', name: 'Diamond Rifle',  db: 'diamondrifle',   prodCost: 100000000,listrik: 700,bahan: {} },
    'emeraldsniper':  { type: 'senjata', name: 'Emerald Sniper', db: 'emeraldsniper',  prodCost: 150000000,listrik: 850,bahan: {} },
    'sapphirecannon': { type: 'senjata', name: 'Sapphire Cannon',db: 'sapphirecannon', prodCost: 200000000,listrik: 1000,bahan: {} }
};

// Base harga pasar untuk Sync Global Market
const baseHargaPasar = {
    // Daur Ulang & Kebutuhan
    'botol': 300, 'kayu': 1000, 'sampah': 120, 'string': 50000, 'kaleng': 400, 'kardus': 400, 'plastik': 300,
    'kain': 400, 'paku': 150, 'baterai': 1200, 'banbekas': 900, 'karet': 500, 'tembaga': 3500, 'aluminium': 4500,
    'baut': 200, 'mur': 200, 'gear': 1500, 'rantai': 1200, 'mesinbekas': 5000, 'oli': 800, 'pcb': 2000, 'kabel': 600,
    'kaca': 1000, 'keramik': 1200, 'semen': 2500, 'cat': 1500, 'koinkuno': 10000, 'jamrusak': 3000, 'pegas': 400,
    'besibekas': 800, 'lampu': 600, 'potion': 20000, 'umpan': 1500, 'pancingan': 35000,

    // Tambang & Alam
    'pasir': 250000, 'iron': 20000, 'emasmentah': 866490, 'batu': 500, 'coal': 1500, 'uranium': 35000,
    'tembagaore': 8000, 'perakore': 12000, 'timah': 6000, 'nikel': 15000, 'kuarsa': 20000, 'kristal': 50000,
    'obsidian': 35000, 'belerang': 5000, 'marmer': 12000, 'granit': 10000, 'garam': 2000, 'tanahliat': 1500,
    'batukapur': 3000, 'batupermata': 80000, 'fosil': 45000, 'mutiara': 60000, 'karang': 5000, 'gipsum': 4000,
    'magnetit': 18000, 'bauksit': 14000, 'platinaore': 35000, 'titaniumore': 40000, 'litium': 25000,
    'zamrudmentah': 65000, 'rubimentah': 70000,

    // Minuman & Makanan (NO BIBIT)
    'airmineral': 9900, 'tehbotol': 9600, 'aqua': 5000, 'susu': 6000, 'madu': 64000, 'nescafe': 14400,
    'ultramilk': 10000, 'jusanggur': 12000, 'jusapel': 12300, 'jusjeruk': 12600, 'jusmangga': 12900, 'juspisang': 13300,
    'pisang': 5500, 'anggur': 5500, 'mangga': 4600, 'jeruk': 6000, 'apel': 5500,
    'makananpet': 50000, 'makanannaga': 150000, 'makanankyubi': 150000, 'makanangriffin': 80000, 'makananphonix': 80000, 'makanancentaur': 150000,
    'esjeruk': 8000, 'eskelapa': 10000, 'kopihitam': 7000, 'kopisusu': 9000, 'cappuccino': 15000, 'latte': 16000, 'mocha': 17000,
    'tehmanis': 5000, 'tehhijau': 8000, 'tehtarik': 10000, 'jusstroberi': 13500, 'jusmelon': 13000, 'jussemangka': 12500,
    'jusdurian': 18000, 'juspepaya': 11000, 'jusalpukat': 14000, 'susucoklat': 8000, 'susustroberi': 8500, 'sodagembira': 12000,
    'wedangjahe': 6000, 'airkelapa': 7000, 'sirupmelon': 15000, 'sirupjeruk': 15000, 'sirupanggur': 16000, 'sirupstroberi': 16000,

    // Senjata & Perlengkapan Tempur
    'sword': 150000, 'pickaxe': 15000, 'katana': 200000, 'axe': 15000, 'trident': 250000, 'bow': 50000,
    'pisau': 10000, 'fishingrod': 15000, 'armor': 350000, 'shield': 200000, 'helmet': 150000,
    'tombak': 50000000, 'busur': 10000000, 'anakpanah': 8000000, 'ammo': 3500000, 'glock': 3000000, 'beretta': 3500000,
    'revolver': 4000000, 'deagle': 4500000, 'mac10': 4000000, 'vector': 4200000, 'ump45': 4500000, 'pp19bizon': 4800000,
    'mp5': 5000000, 'uzi': 5500000, 'p90': 6400000, 'ak47': 6400000, 'm4': 6500000, 'qbz95': 7500000, 'ar15': 7700000,
    'g36c': 8000000, 'aek971': 8200000, 'm16': 8400000, 'hk416': 8500000, 'scar': 9000000, 'famas': 9000000,
    'aug': 9400000, 'fnfal': 9500000, 'spas12': 8500000, 'benellim4': 10000000, 'saiga12': 11000000, 'aa12': 12000000,
    'remington700': 25000000, 'm24': 40000000, 'm40': 40000000, 'l96': 45000000, 'dragunovsvd': 88000000,
    'barrettm82': 99000000, 'intervention': 120000000, 'cheytacm200': 130000000, 'awm': 150000000, 'pkm': 55000000,
    'm249': 60000000, 'mg42': 70000000, 'rpg7': 85000000, 'minigun': 150000000, 'rubyrevolver': 300000000,
    'diamondrifle': 500000000, 'emeraldsniper': 750000000, 'sapphirecannon': 1000000000
};

// ==========================================
// HELPERS
// ==========================================
function formatRp(n) { return 'Rp' + (n || 0).toLocaleString('id-ID'); }
function formatSingkat(n) {
    n = n || 0;
    if (n >= 1e12) return (n / 1e12).toFixed(2) + ' T';
    if (n >= 1e9)  return (n / 1e9).toFixed(2)  + ' M';
    if (n >= 1e6)  return (n / 1e6).toFixed(2)  + ' Jt';
    return n.toLocaleString('id-ID');
}
function formatDaya(w, isRefill = false) {
    let unit = isRefill ? 'Wh' : 'W';
    if (w >= 1e9) return (w / 1e9).toLocaleString('id-ID', {maximumFractionDigits: 1}) + ' G' + unit;
    if (w >= 1e6) return (w / 1e6).toLocaleString('id-ID', {maximumFractionDigits: 1}) + ' M' + unit;
    if (w >= 1e3) return (w / 1e3).toLocaleString('id-ID', {maximumFractionDigits: 1}) + ' k' + unit;
    return w.toLocaleString('id-ID') + ' ' + unit;
}
function progressBar(val, max, len = 10) {
    let filled = Math.round((val / Math.max(1, max)) * len);
    filled = Math.min(len, Math.max(0, filled));
    return '█'.repeat(filled) + '░'.repeat(len - filled);
}
function getKapasitasGudang(pt) { return (pt.gudangLevel || 1) * slotPerLevel; }
function getKapasitasListrik(pt) { return (pt.listrikLevel || 1) * wattPerLevel; }
function getSlotTerpakai(gudang) { return Object.values(gudang || {}).reduce((s, v) => s + (v || 0), 0); }

// Fitur Pasar Global
function getMarketPriceSim(itemKey, isBeli = true) {
    let base = baseHargaPasar[itemKey] || 10000;
    if (!isBeli) base = Math.floor(base * 0.75);
    
    if (!global.db.data.market[itemKey]) return base;
    
    let currentStock = global.db.data.market[itemKey].stock || 50000;
    let baseStock = 100000; 
    let ratio = baseStock / Math.max(1, currentStock);
    
    if (ratio > 3.0) ratio = 3.0; 
    if (ratio < 0.2) ratio = 0.2;
    
    return Math.max(1, Math.floor(base * ratio));
}

function findPTListrikGlobal(ptIdTarget) {
    let allUsers = global.db.data.users;
    for (let uid in allUsers) {
        let u = allUsers[uid];
        if (u && Array.isArray(u.perusahaan)) {
            for (let i = 0; i < u.perusahaan.length; i++) {
                let pt = u.perusahaan[i];
                if (pt && pt.type === 'listrik' && pt.id === ptIdTarget) {
                    return { ownerId: uid, ownerName: u.name || uid.split('@')[0], pt: pt, index: i };
                }
            }
        }
    }
    return null;
}

function hitungAsetKotor(pt) {
    let val = pt.saldo || 0;
    if (pt.gudang) {
        for (let brg in pt.gudang) {
            let stok = pt.gudang[brg] || 0;
            if (stok > 0) val += stok * getMarketPriceSim(brg, false);
        }
    }
    if (Array.isArray(pt.pabrik)) pt.pabrik.forEach(f => { val += biayaPabrikObj[f.type] || 0; });
    val += biayaInduk[pt.type] || 0;
    if (pt.type !== 'listrik') val += ((pt.gudangLevel || 1) - 1) * HARGA_UPGRADE_GUDANG;
    if (pt.type === 'listrik') {
        val += ((pt.listrikLevel || 1) - 1) * HARGA_UPGRADE_LISTRIK;
        if (pt.ekstraPembangkit) pt.ekstraPembangkit.forEach(p => val += (hargaPembangkit[p] || 0));
    }
    return val;
}

function hitungValuasi(pt) {
    let val = hitungAsetKotor(pt);
    let totalInvest = pt.investors ? Object.values(pt.investors).reduce((a,b)=>a+b,0) : 0;
    val += totalInvest;
    val -= (pt.hutang || 0);
    return Math.max(0, val);
}

// ==========================================
// CORE HANDLER
// ==========================================
let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply('❌ Data user tidak ditemukan di database.');
        if (!user.money) user.money = 0;
        if (!global.db.data.market) global.db.data.market = {};
        if (!global.db.data.ihsg) global.db.data.ihsg = { history: [], lastUpdate: 0 };
        
        // --- INTEGRASI KAS NEGARA ---
        if (!global.db.data.negara) {
            global.db.data.negara = {
                presiden: null, waktuLantik: 0, kas: 100000000000, bank: false, bumn: [],
                kandidat: {}, isPemilu: false, waktuMulaiPemilu: 0, pln: null, pdam: null,
                investBankOpen: true, investPTOpen: true, danaBansos: 0,
                gudangLevel: 1, gudang: {}, b2b: {}, b2bCounter: 1
            };
        }
        let negara = global.db.data.negara;
        if (!negara.gudangLevel) negara.gudangLevel = 1;
        if (!negara.gudang) negara.gudang = {};
        if (!negara.b2b) negara.b2b = {};
        if (!negara.b2bCounter) negara.b2bCounter = 1;
        
        if (!Array.isArray(user.perusahaan)) user.perusahaan = [];
        user.perusahaan = user.perusahaan.filter(pt => pt !== null && pt !== undefined);

        let now = Date.now();

        // AUTO: REFILL LISTRIK, PAJAK HARIAN & PEMBAYARAN GAJI
        user.perusahaan.forEach(pt => {
            if (!pt) return;
            if (pt.type !== 'listrik' && !pt.gudangLevel) pt.gudangLevel = 1;
            if (pt.type === 'listrik' && !pt.listrikLevel) pt.listrikLevel = 1;
            if (!pt.investors) pt.investors = {}; 
            if (pt.type === 'listrik' && !pt.ekstraPembangkit) pt.ekstraPembangkit = [];
            if (pt.hutang === undefined) pt.hutang = 0;
            if (pt.investOpen === undefined) pt.investOpen = true; 
            if (pt.isProduksi === undefined) pt.isProduksi = false;
            if (!pt.karyawan) pt.karyawan = 10; 
            if (!pt.lastSalary) pt.lastSalary = now; 

            // Generate Listrik Otomatis
            if (pt.type === 'listrik') {
                let periods = Math.floor((now - (pt.lastGenerate || now)) / 1800000);
                if (periods >= 1) {
                    let kapMax = getKapasitasListrik(pt);
                    let totalGenRate = pt.generationRate || 4000;
                    
                    let maxBatasSlotAktif = 12 + Math.floor(pt.karyawan / 500);
                    if (pt.ekstraPembangkit && pt.ekstraPembangkit.length > 0) {
                        let aktifExtra = pt.ekstraPembangkit.slice(0, maxBatasSlotAktif);
                        aktifExtra.forEach(p => totalGenRate += (kapasitasPembangkit[p] || 0));
                    }
                    
                    let remaining = kapMax - (pt.kapasitasTersedia || 0);
                    if (remaining > 0) {
                        let gen = Math.min(remaining, totalGenRate * periods);
                        pt.kapasitasTersedia = (pt.kapasitasTersedia || 0) + gen;
                    }
                    pt.lastGenerate = now;
                }
            }

            // PAJAK HARIAN 0.2% TIAP 24 JAM -> MASUK KE KAS NEGARA
            if (!pt.lastTax) pt.lastTax = now;
            let daysPassed = Math.floor((now - pt.lastTax) / 86400000);
            if (daysPassed >= 1) {
                let tax  = Math.floor((pt.saldo || 0) * 0.002 * daysPassed);
                if (tax > 0) {
                    pt.saldo = Math.max(0, (pt.saldo || 0) - tax);
                    negara.kas += tax; // <- Dana disalurkan ke Kas Negara
                }
                pt.lastTax += daysPassed * 86400000;
            }

            // Pembayaran Gaji Karyawan Setiap 3 Hari
            let salaryPeriods = Math.floor((now - pt.lastSalary) / (3 * 86400000));
            if (salaryPeriods >= 1) {
                let biayaGajiPerOrang = 365000 * salaryPeriods;
                let totalGajiDibutuhkan = pt.karyawan * biayaGajiPerOrang;
                
                if ((pt.saldo || 0) >= totalGajiDibutuhkan) {
                    pt.saldo -= totalGajiDibutuhkan;
                } else {
                    let mampuBayarBerapaPekerja = Math.floor((pt.saldo || 0) / biayaGajiPerOrang);
                    pt.saldo -= (mampuBayarBerapaPekerja * biayaGajiPerOrang); 
                    pt.karyawan = Math.max(10, mampuBayarBerapaPekerja);
                    if (mampuBayarBerapaPekerja < 10) pt.saldo = 0; 
                }
                pt.lastSalary += salaryPeriods * (3 * 86400000);
            }
        });

        let action = args[0] ? args[0].toLowerCase() : 'help';

        switch (action) {
            case 'buat': {
                let tipePT = args[1] ? args[1].toLowerCase() : '';
                let namaPT = args.slice(2).join(' ');
                let tipeValid = Object.keys(biayaInduk);

                if (!tipeValid.includes(tipePT) || !namaPT)
                    return m.reply(`⚠️ *Format Salah!*\n\n*${usedPrefix+command} buat <tipe> <Nama PT>*\nTipe: ${tipeValid.join(', ')}\n\nContoh: *${usedPrefix+command} buat tambang PT Emas*`);

                if (user.perusahaan.length >= 2) return m.reply('❌ Batas maksimal adalah *2 Perusahaan Induk*!');
                let hargaBuat = biayaInduk[tipePT];
                
                if (user.money < hargaBuat) return m.reply(`❌ Uang pribadimu kurang!\nButuh ${formatRp(hargaBuat)}.`);
                user.money -= hargaBuat;

                let newPT = {
                    id: now, name: namaPT, type: tipePT, saldo: 0, hutang: 0, lastTax: now,
                    pabrik: [], gudang: {}, investors: {}, investOpen: true, isProduksi: false, 
                    karyawan: 10, lastSalary: now
                };

                if (tipePT === 'listrik') {
                    newPT.listrikLevel = 1; newPT.kapasitasTersedia = wattPerLevel;
                    newPT.generationRate = 4000; newPT.pembangkit = 'PLTU';
                    newPT.ekstraPembangkit = [];
                    newPT.hargaListrikCustom = 18600; newPT.lastGenerate = now;
                } else {
                    newPT.gudangLevel = 1; newPT.sumberListrik = 'negara';
                }

                user.perusahaan.push(newPT);
                m.reply(`🎉 *PERUSAHAAN DIDIRIKAN!*\n🏢 *${namaPT}* (${tipePT.toUpperCase()})\nModal (dari Dompet): -${formatRp(hargaBuat)}`);
                break;
            }

            case 'info': {
                let targetId = m.sender;
                if (args[1]) {
                    if (m.mentionedJid && m.mentionedJid[0]) targetId = m.mentionedJid[0];
                    else if (args[1].startsWith('@')) targetId = args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                }

                let targetUser = global.db.data.users[targetId];
                if (!targetUser || !targetUser.perusahaan || !targetUser.perusahaan.length) return m.reply(`❌ Belum punya perusahaan.`);

                let isSelf = (targetId === m.sender);
                let txt = `🏢 *ASET KORPORASI ${isSelf ? 'MILIKMU' : 'MILIK @' + targetId.split('@')[0]}* 🏢\n\n`;

                if (isSelf) {
                    let swastaList = user.perusahaan.filter(p => p && p.type === 'listrik');
                    let avgSwasta = swastaList.length ? swastaList.reduce((acc, p) => acc + (p.hargaListrikCustom || 18600), 0) / swastaList.length : 0;
                    let swastaStr = avgSwasta > 0 ? `Rp${avgSwasta.toLocaleString('id-ID')}/W` : '-';
                    txt += `🌐 *Grid Listrik Negara:* 0 kW / 15 kW (0.0% terpakai)\n`;
                    txt += `💡 Tarif Negara: Rp${hargaListrikNegara.toLocaleString('id-ID')}/W | Swasta: ${swastaStr}\n\n`;
                }

                targetUser.perusahaan.forEach((pt, i) => {
                    let val = hitungValuasi(pt);
                    let ptHeader = pt.type === 'listrik' ? `*${i+1}. ${pt.name} (${pt.pembangkit || 'PLTU'})*` : `*${i+1}. ${pt.name}*`;
                    let pekerja = pt.karyawan || 10;
                    let gajiTigaHari = formatRp(pekerja * 365000);

                    txt += `${ptHeader}\n`;
                    txt += `🏭 Induk Pabrik: *${pt.type.toUpperCase()}*\n`;
                    
                    if (pt.pabrik && pt.pabrik.length > 0) {
                        txt += `🏢 Anak Pabrik:\n`;
                        pt.pabrik.forEach((p, idx) => {
                            txt += `   ${idx + 1}. *${p.name}* (${p.type.toUpperCase()})\n`;
                        });
                    }

                    if (pt.type === 'listrik') {
                        let totalRefill = pt.generationRate || 4000;
                        let maxBatasSlot = 12 + Math.floor(pekerja / 500);
                        
                        let aktifExtra = pt.ekstraPembangkit ? pt.ekstraPembangkit.slice(0, maxBatasSlot) : [];
                        let matiExtra  = pt.ekstraPembangkit ? Math.max(0, pt.ekstraPembangkit.length - maxBatasSlot) : 0;
                        
                        aktifExtra.forEach(p => totalRefill += (kapasitasPembangkit[p] || 0));
                        
                        let extraStr = aktifExtra.length > 0 ? aktifExtra.join(', ') : '-';
                        let strMati = matiExtra > 0 ? ` (+${matiExtra} Mesin Mati)` : '';

                        let kapMaksimum = getKapasitasListrik(pt);
                        let sedia       = pt.kapasitasTersedia || 0;

                        txt += `👥 Pekerja: ${pekerja.toLocaleString('id-ID')} Orang (Gaji: ${gajiTigaHari} / 3H)\n`;
                        txt += `⚡ Level Kapasitas : Level ${pt.listrikLevel || 1}\n`;
                        txt += `⚡ Listrik Tersedia: ${formatDaya(sedia)} / ${formatDaya(kapMaksimum)}\n`;
                        txt += `♻️ Total Refill: ${formatDaya(totalRefill, true)} / 30 Menit\n`;
                        txt += `💡 Harga Jual: ${formatRp(pt.hargaListrikCustom || 18600)}/W\n`;
                        txt += `🏗️ Ekstra Mesin: ${extraStr} (${aktifExtra.length}/${maxBatasSlot} Aktif)${strMati}\n`;
                    } else {
                        let statusProduksi = pt.isProduksi ? '⏳ Sedang Beroperasi' : '🟢 Idle';
                        let currentSpeedMs = Math.max(200, 4000 - Math.floor((Math.min(pekerja, 5000) / 5000) * 3800));
                        
                        txt += `👥 Pekerja: ${pekerja.toLocaleString('id-ID')} Orang (Gaji: ${gajiTigaHari} / 3H)\n`;
                        txt += `🚀 Kecepatan Produksi: ${currentSpeedMs/1000} Detik / Item\n`;
                        txt += `📦 Level Gudang : Level ${pt.gudangLevel || 1}\n`;
                        txt += `📦 Sisa Gudang: ${getSlotTerpakai(pt.gudang).toLocaleString('id-ID')} / ${getKapasitasGudang(pt).toLocaleString('id-ID')} Slot\n`;
                        txt += `⚙️ Status Pabrik: ${statusProduksi}\n`;
                        
                        let srcName = '🔵 Negara (PLN)';
                        if (pt.sumberListrik && pt.sumberListrik !== 'negara') {
                            let provider = findPTListrikGlobal(pt.sumberListrik);
                            if (provider) srcName = `🟡 ${provider.pt.name} (@${provider.ownerId.split('@')[0]})`;
                            else srcName = '🔵 Negara (PLN) [Otomatis dialihkan]';
                        }
                        txt += `🔌 Sumber Listrik: ${srcName}\n`;
                    }

                    let totalInvest = pt.investors ? Object.values(pt.investors).reduce((a,b)=>a+b, 0) : 0;
                    let detailInvestor = '';
                    if (pt.investors && Object.keys(pt.investors).length > 0) {
                        for (let inv in pt.investors) {
                            let p = ((pt.investors[inv] / totalInvest) * 100).toFixed(1);
                            detailInvestor += `\n>    • @${inv.split('@')[0]} (${p}% Pool)`;
                        }
                    }

                    let statusInv = (pt.investOpen !== false) ? '🟢 DIBUKA' : '🔴 DITUTUP';

                    txt += `\n*📊 LAPORAN KEUANGAN & SAHAM:*\n`;
                    txt += `> 💎 Valuasi Bersih: ~${formatSingkat(val)}\n`;
                    txt += `> 🏦 Hutang Bank: ${formatRp(pt.hutang || 0)}\n`;
                    txt += `> 💼 Status Investasi: ${statusInv}\n`;
                    txt += `> 👥 Total Modal Publik: ${formatRp(totalInvest)}${detailInvestor}\n`;
                    txt += `> 💳 Saldo Kas PT: ${formatRp(pt.saldo)}\n\n`;
                });

                return m.reply(txt.trim(), null, { mentions: [targetId, ...Object.keys(targetUser.perusahaan[0]?.investors || {})] });
            }

            case 'rekrut':
            case 'pecat': {
                let jmlPekerja = parseInt(args[1]);
                let idPt = parseInt(args[2]) - 1;
                if (isNaN(jmlPekerja) || isNaN(idPt) || jmlPekerja < 1) return m.reply(`⚠️ Format: *${usedPrefix+command} ${action} <jumlah> <id_pt>*\n\n_5.000 Pekerja = Produksi Maksimal (0.2 detik / barang)._`);
                
                let pt = user.perusahaan[idPt];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

                if (!pt.karyawan) pt.karyawan = 10;
                let hargaRekrut = 1000000; 
                
                if (action === 'rekrut') {
                    let totalBiaya = jmlPekerja * hargaRekrut;
                    if ((pt.saldo || 0) < totalBiaya) return m.reply(`❌ Kas PT kurang untuk merekrut!\nButuh: ${formatRp(totalBiaya)}\nKas PT: ${formatRp(pt.saldo)}\n\n_Harga: Rp1 Juta / Pekerja_`);
                    
                    pt.saldo -= totalBiaya;
                    pt.karyawan += jmlPekerja;
                    
                    if (pt.type === 'listrik') {
                        let maxBatasSlot = 12 + Math.floor(pt.karyawan / 500);
                        m.reply(`👥 *REKRUTMEN SUKSES*\n\n🏢 PT: *${pt.name}*\n📈 Anda menambah pekerja sebanyak ${jmlPekerja.toLocaleString('id-ID')} orang. Jika ada mesin yang mati, slot pembangkit akan aktif kembali!\n💸 Kas PT: -${formatRp(totalBiaya)}\n\n*Total Pekerja:* ${pt.karyawan.toLocaleString('id-ID')} orang\n⚡ *Batas Slot Pembangkit Aktif:* ${maxBatasSlot} Slot`);
                    } else {
                        let newSpeed = Math.max(200, 4000 - Math.floor((Math.min(pt.karyawan, 5000) / 5000) * 3800));
                        m.reply(`👥 *REKRUTMEN SUKSES*\n\n🏢 PT: *${pt.name}*\n📈 Anda menambah pekerja sebanyak ${jmlPekerja.toLocaleString('id-ID')} orang dan produksi dipercepat menjadi ${newSpeed/1000} detik per barang.\n💸 Kas PT: -${formatRp(totalBiaya)}\n\n*Total Pekerja:* ${pt.karyawan.toLocaleString('id-ID')} orang`);
                    }
                } else {
                    if (pt.karyawan - jmlPekerja < 10) return m.reply(`❌ Perusahaan minimal harus memiliki 10 pekerja (Karyawan Dasar)!`);
                    pt.karyawan -= jmlPekerja;
                    
                    if (pt.type === 'listrik') {
                        let maxBatasSlot = 12 + Math.floor(pt.karyawan / 500);
                        m.reply(`📉 *PHK SUKSES*\n\n🏢 PT: *${pt.name}*\n📉 Diberhentikan: ${jmlPekerja.toLocaleString('id-ID')} orang\n\n*Total Pekerja:* ${pt.karyawan.toLocaleString('id-ID')} orang\n⚡ *Batas Slot Pembangkit Aktif:* ${maxBatasSlot} Slot (Jika jumlah mesin melebihi batas ini, sisanya akan dinonaktifkan)`);
                    } else {
                        let newSpeed = Math.max(200, 4000 - Math.floor((Math.min(pt.karyawan, 5000) / 5000) * 3800));
                        m.reply(`📉 *PHK SUKSES*\n\n🏢 PT: *${pt.name}*\n📉 Diberhentikan: ${jmlPekerja.toLocaleString('id-ID')} orang\n\n*Total Pekerja:* ${pt.karyawan.toLocaleString('id-ID')} orang\n🚀 *Kecepatan Produksi Saat Ini:* ${newSpeed/1000} Detik / Barang`);
                    }
                }
                break;
            }

            // ==========================================
            // B2B PERUSAHAAN (VIA REKBER NEGARA)
            // ==========================================
            case 'b2b': {
                let subAction = args[1] ? args[1].toLowerCase() : 'list';
                
                // Logika Auto-Refund PHP 10 Menit saat menu b2b diakses
                for (let id in negara.b2b) {
                    let k = negara.b2b[id];
                    if (now - k.timestamp > 600000) { 
                        let sellerUser = global.db.data.users[k.seller];
                        if (sellerUser) {
                            if (k.ptSource !== null && k.ptSource !== undefined) {
                                let ptId = k.ptSource - 1;
                                if (sellerUser.perusahaan && sellerUser.perusahaan[ptId]) {
                                    let pt = sellerUser.perusahaan[ptId];
                                    if (!pt.gudang) pt.gudang = {};
                                    pt.gudang[k.item] = (pt.gudang[k.item] || 0) + k.qty;
                                } else {
                                    sellerUser[k.item] = (sellerUser[k.item] || 0) + k.qty;
                                }
                            } else {
                                sellerUser[k.item] = (sellerUser[k.item] || 0) + k.qty;
                            }
                            conn.sendMessage(k.seller, { text: `🚫 *KONTRAK B2B (ID: ${id}) DIBATALKAN OTOMATIS*\n\nPembeli PHP (melewati batas 10 menit). Barang sejumlah ${k.qty.toLocaleString('id-ID')} ${k.item} telah ditarik dari Gudang Negara dan dikembalikan utuh ke Gudang/Tas Anda.` }).catch(() => {});
                        }
                        negara.gudang[k.item] = Math.max(0, (negara.gudang[k.item] || 0) - k.qty);
                        delete negara.b2b[id];
                    }
                }

                if (subAction === 'list') {
                    let txt = `🤝 *BURSA B2B KORPORASI & REKBER NEGARA* 🤝\n\n`;
                    let hasContract = false;
                    for (let id in negara.b2b) {
                        let k = negara.b2b[id];
                        if (k.seller === sender || k.buyer === sender) {
                            hasContract = true;
                            let sisaWaktu = Math.floor((600000 - (now - k.timestamp)) / 1000);
                            let menit = Math.floor(sisaWaktu / 60);
                            let detik = sisaWaktu % 60;
                            txt += `📝 *ID Kontrak: ${id}*\n`
                                + `📦 Item: ${k.qty.toLocaleString('id-ID')} ${k.item}\n`
                                + `💰 Harga Total: ${formatRp(k.price)}\n`
                                + `📤 Penjual: @${k.seller.split('@')[0]} ${k.ptSource !== null ? '(PT)' : '(Sipil/Petani)'}\n`
                                + `📥 Pembeli: @${k.buyer.split('@')[0]}\n`
                                + `⏳ Sisa Waktu Bayar: ${menit}m ${detik}s\n\n`;
                        }
                    }
                    if (!hasContract) txt += `_Belum ada transaksi B2B yang melibatkan Anda._\n`;
                    txt += `\n*Akses Menu PT:* \n• ${usedPrefix}pt b2b buat <@pembeli> <item> <jml> <harga> <id_pt_sumber>\n• ${usedPrefix}pt b2b bayar <id_kontrak> <id_pt_tujuan>\n• ${usedPrefix}pt b2b batal <id_kontrak>`;
                    return m.reply(txt, null, { mentions: [sender, ...Object.values(negara.b2b).flatMap(k => [k.seller, k.buyer])]});
                }

                if (subAction === 'buat') {
                    let targetMention = args[2];
                    let item = args[3] ? args[3].toLowerCase() : '';
                    let qty = parseInt(args[4]);
                    let price = parseInt(args[5]);
                    let ptSumber = parseInt(args[6]);
                    
                    if (!targetMention || !item || isNaN(qty) || isNaN(price) || isNaN(ptSumber)) {
                        return m.reply(`⚠️ *Format B2B Perusahaan Salah!*\n\n*${usedPrefix}pt b2b buat <@tag_pembeli> <item> <jumlah> <harga_total> <id_pt_sumber>*\n\n_Contoh:_ ${usedPrefix}pt b2b buat @628... botol 1000 50000 1`);
                    }
                    
                    let buyer = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                    if (buyer === sender) return m.reply(`❌ Tidak bisa membuat kontrak B2B dengan diri sendiri.`);
                    if (!global.db.data.users[buyer]) return m.reply(`❌ Pembeli tidak terdaftar di sistem.`);
                    if (qty < 1 || price < 1) return m.reply(`❌ Jumlah dan Harga minimal adalah 1.`);
                    
                    let capNegara = negara.gudangLevel * 180;
                    let usedNegara = Object.values(negara.gudang).reduce((a, b) => a + b, 0);
                    if (usedNegara + qty > capNegara) return m.reply(`❌ *Gudang Negara Penuh!*\nSisa kapasitas: ${(capNegara - usedNegara).toLocaleString('id-ID')} Slot.\n_Minta Presiden upgrade Gudang Negara._`);
                    
                    let ptId = ptSumber - 1;
                    let pt = user.perusahaan[ptId];
                    if (!pt) return m.reply(`❌ ID PT Anda tidak valid!`);
                    if (pt.type === 'listrik') return m.reply(`❌ PT Listrik tidak memiliki logistik fisik.`);
                    if ((pt.gudang[item] || 0) < qty) return m.reply(`❌ Stok *${item}* di gudang PT *${pt.name}* tidak cukup! Sisa: ${(pt.gudang[item] || 0).toLocaleString('id-ID')}`);
                    
                    pt.gudang[item] -= qty;
                    negara.gudang[item] = (negara.gudang[item] || 0) + qty;
                    
                    let contractId = negara.b2bCounter++;
                    negara.b2b[contractId] = {
                        id: contractId,
                        seller: sender,
                        buyer: buyer,
                        item: item,
                        qty: qty,
                        price: price,
                        ptSource: ptSumber,
                        timestamp: now
                    };
                    
                    let txt = `🤝 *KONTRAK B2B BERHASIL DIBUAT (ID: ${contractId})* 🤝\n\n`
                        + `Barang sebesar *${qty.toLocaleString('id-ID')} ${item}* telah ditarik dari Gudang 🏢 *${pt.name}* dan diamankan ke dalam *Gudang Negara* (Rekber).\n\n`
                        + `Silakan @${buyer.split('@')[0]} untuk melunasi pembayaran sebesar *${formatRp(price)}* menggunakan perintah:\n`
                        + `*${usedPrefix}pt b2b bayar ${contractId} <id_pt_tujuan>*\n`
                        + `Atau (Bila Pembeli bukan PT): *${usedPrefix}negara b2b bayar ${contractId}*\n\n`
                        + `_⏳ Batas Waktu Bayar: 10 Menit sebelum dibatalkan otomatis._`;
                        
                    return m.reply(txt, null, { mentions: [buyer] });
                }

                if (subAction === 'bayar') {
                    let contractId = parseInt(args[2]);
                    let ptTujuan = parseInt(args[3]);
                    
                    if (isNaN(contractId) || isNaN(ptTujuan)) return m.reply(`⚠️ Gunakan format: *${usedPrefix}pt b2b bayar <id_kontrak> <id_pt_mu>*`);
                    let k = negara.b2b[contractId];
                    if (!k) return m.reply(`❌ Kontrak B2B dengan ID ${contractId} tidak ditemukan.`);
                    if (k.buyer !== sender) return m.reply(`❌ Anda bukan pembeli pada kontrak ini.`);
                    
                    let ptId = ptTujuan - 1;
                    let pt = user.perusahaan[ptId];
                    if (!pt) return m.reply(`❌ ID PT Anda tidak valid!`);
                    if (pt.type === 'listrik') return m.reply(`❌ PT Listrik tidak memiliki gudang penerima barang.`);
                    
                    if ((pt.saldo || 0) < k.price) return m.reply(`❌ Kas PT *${pt.name}* tidak cukup untuk membayar tagihan sebesar *${formatRp(k.price)}*. Saldo Kas PT: ${formatRp(pt.saldo)}`);
                    
                    let sisaSlot = ((pt.gudangLevel || 1) * 120) - Object.values(pt.gudang || {}).reduce((s, v) => s + (v || 0), 0);
                    if (k.qty > sisaSlot) return m.reply(`❌ Gudang PT *${pt.name}* penuh! Hanya muat ${sisaSlot.toLocaleString('id-ID')} slot lagi.`);
                    
                    // Proses Pembayaran dan Masuk Barang
                    pt.saldo -= k.price;
                    if (!pt.gudang) pt.gudang = {};
                    pt.gudang[k.item] = (pt.gudang[k.item] || 0) + k.qty;
                    
                    // Tarik barang dari Negara
                    negara.gudang[k.item] = Math.max(0, (negara.gudang[k.item] || 0) - k.qty);
                    delete negara.b2b[contractId];
                    
                    // Distribusi Uang (Pajak Rekber 1%)
                    let taxB2B = Math.floor(k.price * 0.01);
                    let bersihMasuk = k.price - taxB2B;
                    negara.kas += taxB2B;
                    
                    let sellerUser = global.db.data.users[k.seller];
                    if (sellerUser) {
                        if (k.ptSource !== null && k.ptSource !== undefined) {
                            let ptSellerId = k.ptSource - 1;
                            if (sellerUser.perusahaan && sellerUser.perusahaan[ptSellerId]) {
                                sellerUser.perusahaan[ptSellerId].saldo += bersihMasuk;
                            } else {
                                sellerUser.money += bersihMasuk; // Fallback jika PT dihapus
                            }
                        } else {
                            sellerUser.money += bersihMasuk;
                        }
                    }
                    
                    let txt = `✅ *PEMBAYARAN KONTRAK B2B (ID: ${contractId}) SUKSES* ✅\n\n`
                        + `📥 *${k.qty.toLocaleString('id-ID')} ${k.item}* telah mendarat di Gudang 🏢 *${pt.name}*.\n`
                        + `💸 Kas PT Anda dipotong sebesar *${formatRp(k.price)}*.\n`
                        + `💰 Penjual (@${k.seller.split('@')[0]}) menerima pembayaran *${formatRp(bersihMasuk)}* ke rekening (Telah dipotong Pajak 1%).\n`
                        + `🏛️ Pajak Rekber (1%): *${formatRp(taxB2B)}* disetor ke Kas Utama Negara.`;
                        
                    return m.reply(txt, null, { mentions: [k.seller] });
                }

                if (subAction === 'batal') {
                    let contractId = parseInt(args[2]);
                    if (isNaN(contractId)) return m.reply(`⚠️ Gunakan format: *${usedPrefix}pt b2b batal <id_kontrak>*`);
                    let k = negara.b2b[contractId];
                    if (!k) return m.reply(`❌ Kontrak B2B dengan ID ${contractId} tidak ditemukan.`);
                    if (k.seller !== sender && negara.presiden !== sender) return m.reply(`❌ Hanya penjual atau Presiden yang dapat membatalkan kontrak secara sepihak.`);
                    
                    let sellerUser = global.db.data.users[k.seller];
                    if (!sellerUser) return m.reply(`❌ Data penjual tidak ditemukan.`);
                    
                    if (k.ptSource !== null && k.ptSource !== undefined) {
                        let ptSellerId = k.ptSource - 1;
                        if (sellerUser.perusahaan && sellerUser.perusahaan[ptSellerId]) {
                            let pt = sellerUser.perusahaan[ptSellerId];
                            if (!pt.gudang) pt.gudang = {};
                            pt.gudang[k.item] = (pt.gudang[k.item] || 0) + k.qty;
                        } else {
                            sellerUser[k.item] = (sellerUser[k.item] || 0) + k.qty;
                        }
                    } else {
                        sellerUser[k.item] = (sellerUser[k.item] || 0) + k.qty;
                    }
                    
                    negara.gudang[k.item] = Math.max(0, (negara.gudang[k.item] || 0) - k.qty);
                    delete negara.b2b[contractId];
                    
                    return m.reply(`🚫 *KONTRAK B2B (ID: ${contractId}) DIBATALKAN*\n\nSeluruh barang sejumlah *${k.qty.toLocaleString('id-ID')} ${k.item}* telah ditarik dari Gudang Negara dan dikembalikan utuh ke Gudang PT / Tas Pribadi Penjual (@${k.seller.split('@')[0]}).`, null, {mentions: [k.seller]});
                }
                
                return m.reply(`❌ Sub-perintah B2B tidak valid. Gunakan: *buat, bayar, batal, list*.`);
            }

            // ==========================================
            // AKHIR FITUR B2B PERUSAHAAN
            // ==========================================

            case 'kirim':
            case 'transfer': {
                let jumlah = parseInt(args[1]);
                let tipe = args[2] ? args[2].toLowerCase() : '';
                let idPengirim = parseInt(args[3]) - 1;
                let targetMention = args[4];
                let idTujuan = parseInt(args[5]) - 1;

                if (isNaN(jumlah) || !tipe || isNaN(idPengirim) || !targetMention || isNaN(idTujuan)) {
                    return m.reply(
                        `⚠️ *Format Transfer Instan Salah!*\n\n` +
                        `*${usedPrefix+command} kirim <jumlah> <uang/item> <id_pt_mu> <@tag_partner> <id_pt_partner>*\n\n` +
                        `_Catatan: Jika transfer beda entitas, disarankan pakai sistem *${usedPrefix}pt b2b* demi keamanan bersama._`
                    );
                }

                let ptSender = user.perusahaan[idPengirim];
                if (!ptSender) return m.reply('❌ ID PT Pengirim milikmu tidak valid!');

                let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                let targetUser = global.db.data.users[target];
                
                if (!targetUser || !targetUser.perusahaan) return m.reply('❌ Partner (Penerima) tidak memiliki perusahaan!');

                let ptReceiver = targetUser.perusahaan[idTujuan];
                if (!ptReceiver) return m.reply('❌ ID PT Penerima tidak valid!');

                if (tipe === 'uang' || tipe === 'money') {
                    if ((ptSender.saldo || 0) < jumlah) return m.reply(`❌ Saldo Kas PT Pengirim kurang!\nSaldo Kas: ${formatRp(ptSender.saldo)}`);
                    
                    ptSender.saldo -= jumlah;
                    ptReceiver.saldo = (ptReceiver.saldo || 0) + jumlah;
                    
                    m.reply(`🤝 *TRANSFER DANA INSTAN BERHASIL*\n\nBerhasil mengirim dana *${formatRp(jumlah)}*\nDari: 🏢 *${ptSender.name}*\nKe: 🏢 *${ptReceiver.name}* (Milik @${target.split('@')[0]})`, null, {mentions: [target]});
                } else {
                    if (ptSender.type === 'listrik' || ptReceiver.type === 'listrik') return m.reply(`❌ Transfer barang hanya bisa dilakukan antar PT Produksi (Non-Listrik)!`);
                    
                    if ((ptSender.gudang[tipe] || 0) < jumlah) return m.reply(`❌ Stok *${tipe}* di gudang PT Pengirim tidak cukup!\nSisa stok: ${(ptSender.gudang[tipe] || 0).toLocaleString('id-ID')}`);
                    
                    let slotSisa = getKapasitasGudang(ptReceiver) - getSlotTerpakai(ptReceiver.gudang);
                    if (jumlah > slotSisa) return m.reply(`❌ Gudang PT Penerima penuh!\nSisa slot mereka hanya: ${slotSisa.toLocaleString('id-ID')}`);

                    ptSender.gudang[tipe] -= jumlah;
                    if (!ptReceiver.gudang) ptReceiver.gudang = {};
                    ptReceiver.gudang[tipe] = (ptReceiver.gudang[tipe] || 0) + jumlah;

                    m.reply(`🤝 *LOGISTIK INSTAN BERHASIL*\n\nBerhasil mengirim barang *${jumlah.toLocaleString('id-ID')} ${tipe}*\nDari: 🏢 *${ptSender.name}*\nKe: 🏢 *${ptReceiver.name}* (Milik @${target.split('@')[0]})`, null, {mentions: [target]});
                }
                break;
            }

            case 'produksi': {
                let jmlProd = parseInt(args[1]); let namaItem = args[2] ? args[2].toLowerCase() : ''; let idPt = parseInt(args[3]) - 1;
                if (!jmlProd || !namaItem || isNaN(idPt)) return m.reply(`⚠️ Format: *${usedPrefix+command} produksi <jml> <item> <id_pt>*`);
                
                let pt = user.perusahaan[idPt];
                if (!pt || pt.type === 'listrik') return m.reply('❌ ID PT tidak valid!');
                let dp = semuaProduk[namaItem];
                if (!dp) return m.reply(`❌ Produk *${namaItem}* tidak dikenali!`);

                let bisaProduksi = (pt.type === dp.type) || (pt.pabrik && pt.pabrik.some(f => f.type === dp.type));
                if (!bisaProduksi) return m.reply(`❌ Tidak ada pabrik *${dp.type.toUpperCase()}* di PT ini.`);

                if (pt.isProduksi) return m.reply(`❌ Mesin PT ini masih *bekerja* memproduksi pesanan sebelumnya! Harap tunggu sampai selesai.`);

                let slotSisa = getKapasitasGudang(pt) - getSlotTerpakai(pt.gudang);
                if (jmlProd > slotSisa) return m.reply(`❌ Gudang penuh! Tersedia: ${slotSisa.toLocaleString('id-ID')} Slot`);

                let bahanKurang = [];
                if (dp.bahan) {
                    for (let b in dp.bahan) {
                        let butuh = dp.bahan[b] * jmlProd;
                        let punya = pt.gudang[b] || 0;
                        if (punya < butuh) bahanKurang.push(`- ${b} (Butuh: ${butuh.toLocaleString('id-ID')}, Ada: ${punya.toLocaleString('id-ID')})`);
                    }
                }
                if (bahanKurang.length > 0) {
                    return m.reply(`❌ *Bahan Baku Tidak Cukup di Gudang PT!*\n\nKekurangan:\n${bahanKurang.join('\n')}\n\n_Beli bahan baku via: ${usedPrefix+command} buy <jml> <item> <id_pt>_`);
                }

                let voltase = dp.listrik || 3; 
                let totalWattDibutuhkan = jmlProd * voltase;

                let sumberL = pt.sumberListrik || 'negara';
                let provider = null; let hargaL = hargaListrikNegara;

                if (sumberL !== 'negara') {
                    provider = findPTListrikGlobal(sumberL);
                    if (!provider) {
                        sumberL = 'negara'; pt.sumberListrik = 'negara'; hargaL = hargaListrikNegara;
                    } else {
                        hargaL = provider.pt.hargaListrikCustom || 18600;
                        if ((provider.pt.kapasitasTersedia || 0) < totalWattDibutuhkan) {
                            return m.reply(`❌ *PRODUKSI GAGAL!*\nListrik langganan swasta kurang daya!\nDaya Dibutuhkan: ${formatDaya(totalWattDibutuhkan)}`);
                        }
                    }
                }

                let biayaProd = jmlProd * dp.prodCost;
                let biayaListrik = totalWattDibutuhkan * hargaL;
                let totalBiaya = biayaProd + biayaListrik;

                if ((pt.saldo || 0) < totalBiaya) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(totalBiaya)}\nKas PT: ${formatRp(pt.saldo)}`);

                pt.saldo -= totalBiaya;
                if (dp.bahan) {
                    for (let b in dp.bahan) { pt.gudang[b] -= (dp.bahan[b] * jmlProd); }
                }
                
                if (provider) {
                    provider.pt.kapasitasTersedia -= totalWattDibutuhkan;
                    provider.pt.saldo += biayaListrik; 
                }

                let pekerja = pt.karyawan || 10;
                let speedMs = Math.max(200, 4000 - Math.floor((Math.min(pekerja, 5000) / 5000) * 3800));
                
                let waktuTotalMs = jmlProd * speedMs;
                let waktuTotalDetik = Math.floor(waktuTotalMs / 1000);
                
                let menit = Math.floor(waktuTotalDetik / 60);
                let jam = Math.floor(menit / 60);
                let sisaDetik = waktuTotalDetik % 60;
                let sisaMenit = menit % 60;
                
                let waktuStr = '';
                if (jam > 0) waktuStr += `${jam} Jam `;
                if (sisaMenit > 0) waktuStr += `${sisaMenit} Menit `;
                if (sisaDetik > 0 || waktuStr === '') waktuStr += `${sisaDetik} Detik`;

                pt.isProduksi = true; 

                m.reply(
                    `⏳ *PROSES ${dp.type === 'tambang' ? 'PENAMBANGAN' : 'PRODUKSI'} DIMULAI*\n\n` +
                    `🏢 PT: *${pt.name}*\n` +
                    `📦 Mengeksekusi: ${jmlProd.toLocaleString('id-ID')} ${dp.name}\n` +
                    `🚀 Kecepatan: ${speedMs/1000}s / Barang (Didukung ${pekerja} pekerja)\n` +
                    `⏱️ Estimasi Selesai Total: *${waktuStr.trim()}*\n\n` +
                    `*RINCIAN BIAYA KAS (Dipotong Dimuka):*\n` +
                    `> 💸 Total Dipotong: -${formatRp(totalBiaya)}\n` +
                    `> 🛠️ Biaya Alat/Modal: ${formatRp(biayaProd)}\n` +
                    `> ⚡ Biaya Listrik: ${formatRp(biayaListrik)} (${formatDaya(totalWattDibutuhkan)})\n` +
                    `> 🔌 Suplai Listrik: ${provider ? provider.pt.name : 'Negara (PLN)'}\n\n` +
                    `_Barang akan otomatis dicicil masuk ke gudang (${speedMs/1000} detik per item) di latar belakang..._`
                );

                let diproduksi = 0;
                let intervalId = setInterval(() => {
                    let currentUser = global.db.data.users[m.sender];
                    if (!currentUser || !currentUser.perusahaan || !currentUser.perusahaan[idPt]) {
                        clearInterval(intervalId);
                        return;
                    }
                    
                    let currentPt = currentUser.perusahaan[idPt];
                    
                    currentPt.gudang[dp.db] = (currentPt.gudang[dp.db] || 0) + 1;
                    diproduksi++;

                    if (diproduksi >= jmlProd) {
                        currentPt.isProduksi = false; 
                        clearInterval(intervalId); 
                        
                        conn.reply(m.chat, 
                            `✅ *PROSES ${dp.type === 'tambang' ? 'PENAMBANGAN' : 'PRODUKSI'} RAMPUNG!*\n\n` +
                            `🏢 PT: *${currentPt.name}*\n` +
                            `📦 Berhasil Eksekusi: +${jmlProd.toLocaleString('id-ID')} ${dp.name}\n` +
                            `_Seluruh hasil telah masuk ke Gudang!_`, m
                        );
                    }
                }, speedMs); 
                
                break;
            }

            // ==============================
            // PAJAK PENJUALAN (PPN) 5% KE KAS NEGARA
            // ==============================
            case 'jual':
            case 'jualsemua':
            case 'sellall': {
                let targetPts = []; let isGlobal = false;
                if (action === 'jual') {
                    if (args[1] !== 'semua') return m.reply(`⚠️ Format: *${usedPrefix+command} jualsemua*`);
                    let id = parseInt(args[2]) - 1;
                    if (!isNaN(id) && user.perusahaan[id] && user.perusahaan[id].type !== 'listrik') targetPts.push(user.perusahaan[id]);
                } else {
                    let id = parseInt(args[1]) - 1;
                    if (!isNaN(id)) {
                        if (user.perusahaan[id] && user.perusahaan[id].type !== 'listrik') targetPts.push(user.perusahaan[id]);
                    } else {
                        isGlobal = true; targetPts = user.perusahaan.filter(p => p && p.type !== 'listrik');
                    }
                }

                if (targetPts.length === 0) return m.reply('❌ Tidak ada PT produksi yang valid.');

                let grandTotalPend = 0; let grandTotalPajak = 0; let grandTotalLogistik = 0;
                let replyMsg = `🛒 *PENJUALAN GROSIR SUKSES*\n\n`; let allMentions = [];

                for (let pt of targetPts) {
                    if (!pt.gudang || Object.keys(pt.gudang).every(k => !(pt.gudang[k] > 0))) {
                        if (!isGlobal) return m.reply(`📦 Gudang *${pt.name}* kosong!`); continue;
                    }

                    let totalPend = 0; let rincian = '';
                    for (let brg in pt.gudang) {
                        let stok = pt.gudang[brg]; if (!stok || stok <= 0) continue;
                        
                        let hargaJual = getMarketPriceSim(brg, false);
                        let profit = stok * hargaJual;
                        totalPend += profit;
                        rincian += `🔸 ${stok.toLocaleString('id-ID')}x ${brg} = ${formatRp(profit)}\n`;
                        
                        if (global.db.data.market[brg]) global.db.data.market[brg].stock += stok;
                        else global.db.data.market[brg] = { stock: 100000 + stok };

                        pt.gudang[brg] = 0; 
                    }

                    if (totalPend === 0) continue;

                    // PERHITUNGAN PAJAK PPN (5%) & LOGISTIK (5%)
                    let pajak = Math.floor(totalPend * 0.05); // Pajak Penjualan PPN
                    let logistik = Math.floor(totalPend * 0.05);
                    let netPend = totalPend - pajak - logistik;

                    // MENGALIRKAN PAJAK PPN KE KAS NEGARA
                    negara.kas += pajak;

                    grandTotalPajak += pajak; grandTotalLogistik += logistik; grandTotalPend += netPend;

                    let porsiPT = 0.75;
                    let profitPT = Math.floor(netPend * porsiPT);
                    let profitInvestorPool = netPend - profitPT;

                    let totalInvest = pt.investors ? Object.values(pt.investors).reduce((a,b)=>a+b, 0) : 0;

                    replyMsg += `🏢 *${pt.name}*\n${rincian}`;
                    replyMsg += `> 💰 Omset Kotor: ${formatRp(totalPend)}\n`;
                    replyMsg += `> 🏛️ Pajak Negara (5%): -${formatRp(pajak)}\n`;
                    replyMsg += `> 🚚 Biaya Logistik (5%): -${formatRp(logistik)}\n`;

                    if (totalInvest > 0) {
                        pt.saldo += profitPT;
                        replyMsg += `> 👑 Laba ke Kas PT (75%): +${formatRp(profitPT)}\n`;
                        
                        for (let inv in pt.investors) {
                            let share = pt.investors[inv] / totalInvest;
                            let profitInv = Math.floor(profitInvestorPool * share);
                            if (global.db.data.users[inv]) {
                                global.db.data.users[inv].money += profitInv;
                                replyMsg += `> 💼 @${inv.split('@')[0]}: +${formatRp(profitInv)} (Dividen)\n`;
                                if (!allMentions.includes(inv)) allMentions.push(inv);
                            }
                        }
                    } else {
                        pt.saldo += netPend;
                        replyMsg += `> 👑 Laba Bersih ke Kas PT (100%): +${formatRp(netPend)}\n`;
                    }
                    replyMsg += '\n';
                }
                if (grandTotalPend === 0) return m.reply('📦 Tidak ada barang untuk dijual.');
                replyMsg += `━━━━━━━━━━━━━━━━━━━━\n📈 *Total Pendapatan Bersih:* ${formatRp(grandTotalPend)}`;
                return m.reply(replyMsg.trim(), null, { mentions: allMentions });
            }

            case 'buy':
            case 'beli': {
                let jmlProd = parseInt(args[1]); let namaItem = args[2] ? args[2].toLowerCase() : ''; let idPt = parseInt(args[3]) - 1;
                if (!jmlProd || !namaItem || isNaN(idPt)) return m.reply(`⚠️ Format: *${usedPrefix+command} buy <jumlah> <item> <id_pt>*\nContoh: *${usedPrefix+command} buy 1000 aqua 1*`);
                
                let pt = user.perusahaan[idPt];
                if (!pt) return m.reply('❌ ID Perusahaan tidak valid!');
                
                if (!baseHargaPasar[namaItem] && !semuaProduk[namaItem]) return m.reply(`❌ Produk/Bahan Baku *${namaItem}* tidak ditemukan di database distributor!`);

                let hargaBeliSatuan = getMarketPriceSim(namaItem, true);
                let hargaBeliTotal = hargaBeliSatuan * jmlProd;
                let biayaLogistik = Math.floor(hargaBeliTotal * 0.05); 
                let grandTotal = hargaBeliTotal + biayaLogistik;

                if (pt.type !== 'listrik') {
                    let slotSisa = getKapasitasGudang(pt) - getSlotTerpakai(pt.gudang);
                    if (jmlProd > slotSisa) return m.reply(`❌ Gudang PT penuh!\nKapasitas tersisa: ${slotSisa.toLocaleString('id-ID')} slot`);
                }

                if ((pt.saldo || 0) < grandTotal) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(grandTotal)} (termasuk 5% logistik)\nKas PT saat ini: ${formatRp(pt.saldo)}`);

                if (global.db.data.market[namaItem]) {
                    global.db.data.market[namaItem].stock = Math.max(0, global.db.data.market[namaItem].stock - jmlProd);
                } else {
                    global.db.data.market[namaItem] = { stock: Math.max(0, 100000 - jmlProd) };
                }

                pt.saldo -= grandTotal;
                if (!pt.gudang) pt.gudang = {};
                pt.gudang[namaItem] = (pt.gudang[namaItem] || 0) + jmlProd;

                m.reply(`🛒 *PEMBELIAN INSTAN SUKSES*\n\n🏢 Masuk Gudang: *${pt.name}*\n📦 Barang: +${jmlProd.toLocaleString('id-ID')} ${namaItem}\n💸 Total Biaya (inc. Logistik): -${formatRp(grandTotal)}`);
                break;
            }

            case 'tutupinvest':
            case 'bukainvest': {
                let ptId = parseInt(args[1]) - 1;
                if (isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} ${action} <id_pt>*`);
                let pt = user.perusahaan[ptId];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');
                
                pt.investOpen = (action === 'bukainvest');
                m.reply(`✅ Jalur investasi publik untuk *${pt.name}* sekarang *${pt.investOpen ? 'DIBUKA 🟢' : 'DITUTUP 🔴'}*.`);
                break;
            }

            case 'bank': {
                let txt = `🏦 *BANK KORPORASI NEGARA*\n\n`;
                txt += `Bank menyediakan dana segar untuk ekspansi Perusahaan. Pinjaman akan masuk ke *Kas PT*.\n\n`;
                txt += `📊 *Tarif Bunga (Flat saat pinjam):*\n  • < Rp 10 Miliar    : *Bunga 5%*\n  • Rp 10M - Rp 100M  : *Bunga 8%*\n  • > Rp 100 Miliar   : *Bunga 12%*\n\n`;
                txt += `💳 *Limit Perusahaanmu (50% Valuasi Aset):*\n`;
                if (user.perusahaan.length === 0) txt += `  _Belum ada perusahaan._\n`;
                user.perusahaan.forEach((pt, i) => {
                    let asetKotor = hitungAsetKotor(pt);
                    let limit = Math.floor(asetKotor / 2);
                    txt += `  ${i+1}. *${pt.name}*\n     Limit: ${formatRp(limit)}\n     Hutang Aktif: ${formatRp(pt.hutang || 0)}\n`;
                });
                txt += `\n*Command:*\n• Pinjam : *${usedPrefix+command} pinjam <nominal> <id_pt>*\n• Bayar  : *${usedPrefix+command} bayarbank <nominal> <id_pt>*`;
                return m.reply(txt);
            }

            case 'pinjam': {
                let nominal = parseInt(args[1]); let ptId = parseInt(args[2]) - 1;
                if (isNaN(nominal) || isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} pinjam <nominal> <id_pt>*`);
                if (nominal < 1000000) return m.reply(`❌ Minimal pinjaman adalah Rp 1.000.000`);

                let pt = user.perusahaan[ptId];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

                let asetKotor = hitungAsetKotor(pt); let limitPinjaman = Math.floor(asetKotor / 2); let hutangSekarang = pt.hutang || 0;
                if (hutangSekarang + nominal > limitPinjaman) return m.reply(`❌ *Limit Kredit Tidak Cukup!*\n🏢 PT: *${pt.name}*\nBatas Hutang: ${formatRp(limitPinjaman)}\nHutang Aktif: ${formatRp(hutangSekarang)}`);

                let bungaPersen = 0.05; 
                if (nominal >= 100000000000) bungaPersen = 0.12;      
                else if (nominal >= 10000000000) bungaPersen = 0.08;  

                let bebanBunga = Math.floor(nominal * bungaPersen);
                let totalHutangBaru = nominal + bebanBunga;

                pt.saldo = (pt.saldo || 0) + nominal; pt.hutang = hutangSekarang + totalHutangBaru;
                m.reply(`✅ *PINJAMAN CAIR*\nDana ditransfer ke Kas PT *${pt.name}*.\n\n• Cair : *${formatRp(nominal)}*\n• Bunga (${bungaPersen*100}%) : *${formatRp(bebanBunga)}*\n🏦 Total Hutang PT Baru: *${formatRp(pt.hutang)}*`);
                break;
            }

            case 'bayarbank': {
                let nominal = parseInt(args[1]); let ptId = parseInt(args[2]) - 1;
                if (isNaN(nominal) || isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} bayarbank <nominal> <id_pt>*`);
                let pt = user.perusahaan[ptId];
                if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

                let hutangSekarang = pt.hutang || 0;
                if (hutangSekarang <= 0) return m.reply(`✅ *${pt.name}* tidak punya hutang Bank!`);
                if (nominal > hutangSekarang) nominal = hutangSekarang; 
                if ((pt.saldo || 0) < nominal) return m.reply(`❌ Kas PT tidak cukup!\nNominal Bayar: ${formatRp(nominal)}\nKas PT: ${formatRp(pt.saldo)}`);

                pt.saldo -= nominal; pt.hutang -= nominal;
                m.reply(`✅ *PEMBAYARAN HUTANG SUKSES*\n🏢 PT: *${pt.name}*\n💳 Kas PT: -${formatRp(nominal)}\n🏦 Sisa Hutang: *${formatRp(pt.hutang)}*`);
                break;
            }

            case 'buatpembangkit': {
                let idPtL = parseInt(args[1]) - 1; let jenis = args[2] ? args[2].toUpperCase() : '';
                if (isNaN(idPtL) || !kapasitasPembangkit[jenis]) {
                    let listJenis = Object.keys(kapasitasPembangkit).map(k => `  • *${k}* — ${formatRp(hargaPembangkit[k])} (+${formatDaya(kapasitasPembangkit[k], true)}/30mnt)`).join('\n');
                    return m.reply(`⚠️ *Format:* *${usedPrefix+command} buatpembangkit <id_pt> <jenis>*\n\n*Katalog Ekstra Pembangkit:*\n${listJenis}`);
                }
                let pt = user.perusahaan[idPtL];
                if (!pt || pt.type !== 'listrik') return m.reply('❌ ID Perusahaan bukan tipe Listrik!');
                if (!pt.ekstraPembangkit) pt.ekstraPembangkit = [];
                
                let maxPembangkit = 12 + Math.floor((pt.karyawan || 10) / 500);
                if (pt.ekstraPembangkit.length >= maxPembangkit) return m.reply(`❌ Slot Ekstra Pembangkit Aktif penuh (Maksimal ${maxPembangkit})!\n_Tips: Tambah 500 pekerja per 1 slot untuk bisa menambah mesin lagi._`);

                let harga = hargaPembangkit[jenis];
                if ((pt.saldo || 0) < harga) return m.reply(`❌ Kas PT kurang! Butuh: ${formatRp(harga)}`);
                pt.saldo -= harga; pt.ekstraPembangkit.push(jenis);
                m.reply(`✅ *PEMBANGUNAN BERHASIL*\n🏭 *${pt.name}* memasang *${jenis}*.\n💳 Kas PT: -${formatRp(harga)}`);
                break;
            }

            case 'setpembangkit': {
                let idPtL = parseInt(args[1]) - 1; let jenis = args[2] ? args[2].toUpperCase() : '';
                if (isNaN(idPtL) || !kapasitasPembangkit[jenis]) return m.reply(`⚠️ Format: *${usedPrefix+command} setpembangkit <id_pt> <jenis>*`);
                let ptL = user.perusahaan[idPtL];
                if (!ptL || ptL.type !== 'listrik') return m.reply('❌ Bukan PT tipe Listrik!');
                ptL.pembangkit = jenis; ptL.generationRate = kapasitasPembangkit[jenis];
                m.reply(`⚡ Generator utama *${ptL.name}* diubah menjadi *${jenis}*!`);
                break;
            }

            case 'upgrade': {
                let tipeUpgrade = args[1] ? args[1].toLowerCase() : ''; let idPt = parseInt(args[2]) - 1; let jmlLevel = parseInt(args[3]) || 1;
                if (!['gudang', 'listrik'].includes(tipeUpgrade) || isNaN(idPt)) return m.reply(`⚠️ Format: *${usedPrefix+command} upgrade <gudang|listrik> <id_pt> [jml]*`);
                let pt = user.perusahaan[idPt]; if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');

                if (tipeUpgrade === 'gudang') {
                    if (pt.type === 'listrik') return m.reply('❌ Hanya untuk PT Non-Listrik!');
                    let currentLevel = pt.gudangLevel || 1;
                    if (currentLevel >= MAX_LEVEL_GUDANG) return m.reply(`❌ Gudang sudah mencapai level maksimal (Lv ${MAX_LEVEL_GUDANG})!`);
                    
                    let allowedLevel = Math.min(jmlLevel, MAX_LEVEL_GUDANG - currentLevel);
                    let totalBiaya = allowedLevel * HARGA_UPGRADE_GUDANG;
                    
                    if ((pt.saldo || 0) < totalBiaya) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(totalBiaya)}\nKas PT: ${formatRp(pt.saldo)}`);
                    pt.saldo -= totalBiaya; pt.gudangLevel = currentLevel + allowedLevel;
                    m.reply(`📦 Gudang diupgrade ke Lv *${pt.gudangLevel}*\nKapasitas Baru: ${getKapasitasGudang(pt).toLocaleString('id-ID')} Slot\n💸 Kas PT Terpotong: -${formatRp(totalBiaya)}`);
                } else {
                    if (pt.type !== 'listrik') return m.reply('❌ Hanya untuk PT LISTRIK!');
                    let currentLevel = pt.listrikLevel || 1;
                    if (currentLevel >= MAX_LEVEL_LISTRIK) return m.reply(`❌ Kapasitas Listrik sudah mencapai level maksimal (Lv ${MAX_LEVEL_LISTRIK})!`);
                    
                    let allowedLevel = Math.min(jmlLevel, MAX_LEVEL_LISTRIK - currentLevel);
                    let totalBiaya = allowedLevel * HARGA_UPGRADE_LISTRIK;
                    
                    if ((pt.saldo || 0) < totalBiaya) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(totalBiaya)}\nKas PT: ${formatRp(pt.saldo)}`);
                    pt.saldo -= totalBiaya; pt.listrikLevel = currentLevel + allowedLevel;
                    m.reply(`⚡ Kapasitas Listrik diupgrade ke Lv *${pt.listrikLevel}*\nKapasitas Maksimal Baru: ${formatDaya(getKapasitasListrik(pt))}\n💸 Kas PT: -${formatRp(totalBiaya)}`);
                }
                break;
            }

            case 'pabrik': {
                let idPt = parseInt(args[1]) - 1; let tipePabrik = args[2] ? args[2].toLowerCase() : ''; let namaPabrik = args.slice(3).join(' ');
                
                if (isNaN(idPt) || !biayaPabrikObj[tipePabrik] || !namaPabrik) {
                    let tutPabrik = `🏭 *TUTORIAL BANGUN ANAK PABRIK*\n\n` +
                                    `Fungsi anak pabrik adalah membuat Perusahaanmu bisa memproduksi *lintas tipe barang*. (Batas maksimal 2 pabrik per PT).\n\n` +
                                    `*Format Pembangunan:*\n` +
                                    `*${usedPrefix+command} pabrik <id_pt_mu> <tipe_pabrik> <Nama Pabrik>*\n\n` +
                                    `*Katalog Tipe & Harga Pabrik:*\n` +
                                    `• *daurulang* — ${formatRp(biayaPabrikObj['daurulang'])}\n` +
                                    `• *minuman* — ${formatRp(biayaPabrikObj['minuman'])}\n` +
                                    `• *tambang* — ${formatRp(biayaPabrikObj['tambang'])}\n` +
                                    `• *senjata* — ${formatRp(biayaPabrikObj['senjata'])}\n\n` +
                                    `_Contoh: ${usedPrefix+command} pabrik 1 senjata Pabrik Besi Baja_`;
                    return m.reply(tutPabrik);
                }

                let pt = user.perusahaan[idPt]; if (!pt || pt.type === 'listrik') return m.reply('❌ Gagal! ID PT tidak valid.');
                if (pt.pabrik.length >= 2) return m.reply('❌ Perusahaanmu sudah mencapai batas maksimal 2 anak pabrik!');
                
                let hargaP = biayaPabrikObj[tipePabrik];
                if ((pt.saldo || 0) < hargaP) return m.reply(`❌ Kas PT kurang!\nButuh: ${formatRp(hargaP)}\nKas PT: ${formatRp(pt.saldo)}`);
                
                pt.saldo -= hargaP; pt.pabrik.push({ name: namaPabrik, type: tipePabrik, karyawan: 10 });
                m.reply(`🏭 Pabrik *${namaPabrik}* berhasil dibangun!\n💸 Kas PT Terpotong: -${formatRp(hargaP)}\n\n_Ketik *${usedPrefix+command} infopabrik* untuk panduan cara menjalankan produksi._`);
                break;
            }

            case 'infopabrik': {
                let txt = `🏭 *PANDUAN OPERASIONAL PABRIK & PRODUKSI*\n\n`;
                txt += `Setelah kamu memiliki Induk PT atau Anak Pabrik, ini langkah-langkah untuk menjalankan bisnis produksinya:\n\n`;
                
                txt += `*1. Persiapan Bahan Baku & Modal*\n`;
                txt += `Setiap produksi butuh bahan baku dan biaya operasi. Kamu bisa memborong bahan baku di pasar global menggunakan command:\n`;
                txt += `➡️ *${usedPrefix+command} buy <jml> <item> <id_pt>*\n`;
                txt += `_(Contoh: .pt buy 1000 aqua 1)_\n\n`;

                txt += `*2. Persediaan Listrik (Wajib)*\n`;
                txt += `Produksi menyedot banyak energi. Pastikan PT kamu terhubung ke PLN atau beli lisrik swasta yang lebih murah:\n`;
                txt += `➡️ *${usedPrefix+command} setlistrik <id_pt_mu> negara* (PLN)\n`;
                txt += `➡️ *${usedPrefix+command} ceklistrik* (Mencari tarif termurah)\n\n`;

                txt += `*3. Pekerja, Kecepatan & Gaji*\n`;
                txt += `Waktu standar produksi adalah 4 detik per barang. Kamu bisa mempercepat ini (sampai maksimal 0.2 detik/barang di 5000 Pekerja) dengan merekrut karyawan! Khusus PT Listrik, setiap 500 pekerja menambah 1 slot Ekstra Pembangkit (Jika pekerja turun, ekstra pembangkit akan nonaktif).\n`;
                txt += `⚠️ *PERHATIAN:* Pekerja wajib digaji Rp365.000 per orang setiap 3 Hari. Jika Kas PT tidak cukup untuk menggaji semua pekerja, maka pekerja yang tidak dibayar akan otomatis *RESIGN (Keluar)* dari Perusahaanmu!\n`;
                txt += `➡️ *${usedPrefix+command} rekrut <jml> <id_pt>*\n`;
                txt += `_(Contoh: .pt rekrut 5000 1)_\n\n`;

                txt += `*4. Proses Produksi*\n`;
                txt += `Jika bahan baku, modal, dan listrik sudah siap di gudang PT, mulai buat barang dengan:\n`;
                txt += `➡️ *${usedPrefix+command} produksi <jml> <item> <id_pt>*\n`;
                txt += `_(Contoh: .pt produksi 100 tehbotol 1)_\n\n`;

                txt += `*5. Distribusi & Penjualan (Gajian!)*\n`;
                txt += `Jual seluruh barang yang ada di gudang ke Pasar Global untuk mendapatkan Omset, membayar pajak, logistik, dan membagikan dividen ke investor:\n`;
                txt += `➡️ *${usedPrefix+command} jualsemua <id_pt>*\n\n`;
                txt += `━━━━━━━━━━━━━━━━━━━━\n`;

                txt += `📚 *KATALOG RESEP BARANG BERDASARKAN TIPE PABRIK:*\n\n`;
                
                txt += `💧 *Tipe: MINUMAN*\n`;
                txt += `  • *Air Mineral* (Butuh: 1 aqua, 1 botol) - Daya: 2 W/item\n`;
                txt += `  • *Teh Botol* (Butuh: 1 aqua, 1 botol) - Daya: 3 W/item\n\n`;
                
                txt += `♻️ *Tipe: DAUR ULANG*\n`;
                txt += `  • *Botol* (Butuh: 5 sampah, 1 kardus) - Daya: 2 W/item\n`;
                txt += `  • *Kayu* (Tanpa Bahan Baku, hanya butuh Listrik) - Daya: 3.5 W/item\n\n`;
                
                txt += `⛏️ *Tipe: TAMBANG*\n`;
                txt += `  • *Pasir* (Tanpa Bahan Baku, hanya butuh listrik & modal) - Daya: 3 W/item\n`;
                txt += `  • *Iron* (Tanpa Bahan Baku, hanya butuh listrik & modal) - Daya: 6 W/item\n`;
                txt += `  • *Emas Mentah* (Tanpa Bahan Baku, hanya butuh listrik & modal) - Daya: 10 W/item\n\n`;
                
                txt += `⚔️ *Tipe: SENJATA*\n`;
                txt += `  • *Sword* (Butuh: 5 iron, 2 kayu) - Daya: 8 W/item\n\n`;
                
                txt += `_Makin kompleks barang yang diproduksi, makin besar cuan-nya! Selamat berbisnis!_`;
                
                return m.reply(txt);
            }

            case 'settarif': {
                let idPtL = parseInt(args[1]) - 1; let tarif = parseInt(args[2]);
                if (isNaN(idPtL) || isNaN(tarif) || tarif < 1) return m.reply(`⚠️ Format: *${usedPrefix+command} settarif <id_pt_listrik> <harga_per_W>*`);
                let ptL = user.perusahaan[idPtL]; if (!ptL || ptL.type !== 'listrik') return m.reply('❌ Bukan PT tipe Listrik!');
                if (tarif < 1000) return m.reply(`❌ Tarif minimum ${formatRp(1000)}/W.`);
                ptL.hargaListrikCustom = tarif; m.reply(`✅ Tarif *${ptL.name}* diset ke *${formatRp(tarif)}/W*`);
                break;
            }

            case 'ceklistrik': {
            let allUsers = global.db.data.users;
                let globalListrik = [];

                // Kumpulkan semua perusahaan listrik global
                for (let uid in allUsers) {
                    let u = allUsers[uid];
                    if (u && Array.isArray(u.perusahaan)) {
                        u.perusahaan.forEach((p) => {
                            if (p && p.type === 'listrik') globalListrik.push({ uid, pt: p });
                        });
                    }
                }

                // Urutkan berdasarkan harga termurah
                globalListrik.sort((a, b) => (a.pt.hargaListrikCustom || 18600) - (b.pt.hargaListrikCustom || 18600));

                let txt = `⚡ *PASAR LISTRIK GLOBAL*\n_Hemat biaya operasional dengan langganan Listrik Swasta! (Pilih nomor yang murah & stok banyak)_\n\n`;
                txt += `🔵 *0. Negara (PLN)*\n   Tarif : *${formatRp(hargaListrikNegara)} / Watt*\n   Stok  : ♾️ Tidak Terbatas\n   Set   : *${usedPrefix+command} setlistrik <id_pt_mu> negara*\n\n`;
                txt += `🟡 *Listrik Swasta (Pemain Lain)*\n`;
                
                if (globalListrik.length === 0) txt += `   _(Belum ada perusahaan listrik swasta yang terdaftar)_\n`;
                else {
                    globalListrik.forEach((gl, index) => {
                        let pt = gl.pt; let tarif = pt.hargaListrikCustom || 18600;
                        let kapMax = getKapasitasListrik(pt); let tersedia = pt.kapasitasTersedia || 0;
                        
                        txt += `*${index + 1}.* 🏢 *${pt.name}* (Milik @${gl.uid.split('@')[0]})\n`;
                        txt += `   Tarif  : *${formatRp(tarif)} / Watt*\n`;
                        txt += `   Stok   : ${formatDaya(tersedia)} / ${formatDaya(kapMax)}\n`;
                        txt += `   [${progressBar(tersedia, kapMax, 8)}]\n`;
                        txt += `   Set    : *${usedPrefix+command} setlistrik <id_pt_mu> ${index + 1}*\n\n`;
                    });
                }
                return m.reply(txt.trim());
            }

            case 'setlistrik': {
            let idPtTarget = parseInt(args[1]) - 1; 
                let param2 = args[2] ? args[2].toLowerCase() : '';
                
                if (isNaN(idPtTarget) || !param2) return m.reply(`⚠️ Format: *${usedPrefix+command} setlistrik <id_pt_mu> <negara / nomor_ceklistrik>*\nContoh: *${usedPrefix+command} setlistrik 1 1*`);
                
                let pt = user.perusahaan[idPtTarget];
                if (!pt || pt.type === 'listrik') return m.reply('❌ ID Perusahaan Produksi milikmu tidak valid!');

                if (param2 === 'negara' || param2 === '0') { 
                    pt.sumberListrik = 'negara'; 
                    return m.reply(`✅ *${pt.name}* kini memakai listrik PLN (Negara).`); 
                }

                let globalIndex = parseInt(param2) - 1;
                if (isNaN(globalIndex)) return m.reply(`❌ Masukkan nomor urut yang valid dari *${usedPrefix+command} ceklistrik*!`);

                // Rekonstruksi urutan listrik yang sama dengan ceklistrik
                let allUsers = global.db.data.users;
                let globalListrik = [];
                for (let uid in allUsers) {
                    let u = allUsers[uid];
                    if (u && Array.isArray(u.perusahaan)) {
                        u.perusahaan.forEach((p) => {
                            if (p && p.type === 'listrik') globalListrik.push({ uid, pt: p });
                        });
                    }
                }
                globalListrik.sort((a, b) => (a.pt.hargaListrikCustom || 18600) - (b.pt.hargaListrikCustom || 18600));

                let selectedProvider = globalListrik[globalIndex];
                if (!selectedProvider) return m.reply(`❌ Nomor urut *${param2}* tidak ditemukan di bursa listrik! Cek lagi dengan *${usedPrefix+command} ceklistrik*`);

                let ptL = selectedProvider.pt;
                let targetUid = selectedProvider.uid;

                // Simpan ID Unik perusahaan listrik target
                pt.sumberListrik = ptL.id; 
                m.reply(`✅ *KONTRAK LISTRIK DEAL!*\n\n🏢 *${pt.name}* kini mengambil suplai energi dari *${ptL.name}*\n👤 Pemilik: @${targetUid.split('@')[0]}\n💡 Tarif: *${formatRp(ptL.hargaListrikCustom || 18600)}/W*`, null, {mentions: [targetUid]});
                break;
            }

            case 'setor': case 'tarik': {
                let jumlah = parseInt(args[1]); let tipeAsset = args[2] ? args[2].toLowerCase() : ''; let ptId = parseInt(args[3]) - 1;
                if (isNaN(jumlah) || !tipeAsset || isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} ${action} <jumlah> <uang|item> <id_pt>*`);
                let pt = user.perusahaan[ptId]; if (!pt) return m.reply('❌ ID Perusahaan tidak ditemukan!');
                if (!pt.gudang) pt.gudang = {};

                if (action === 'setor') {
                    if (tipeAsset === 'uang' || tipeAsset === 'money') {
                        if (user.money < jumlah) return m.reply('❌ Uang di dompet pribadimu kurang!');
                        user.money -= jumlah; pt.saldo += jumlah;
                        m.reply(`✅ Setor ${formatRp(jumlah)} → Kas *${pt.name}*`);
                    } else {
                        if ((user[tipeAsset] || 0) < jumlah) return m.reply(`❌ Kamu tidak punya ${jumlah} *${tipeAsset}* di tas!`);
                        if (pt.type !== 'listrik') {
                            let slotSisa = getKapasitasGudang(pt) - getSlotTerpakai(pt.gudang);
                            if (jumlah > slotSisa) return m.reply(`❌ Gudang tidak cukup! Sisa slot: ${slotSisa}`);
                        }
                        user[tipeAsset] -= jumlah; pt.gudang[tipeAsset] = (pt.gudang[tipeAsset] || 0) + jumlah;
                        m.reply(`✅ Setor ${jumlah.toLocaleString('id-ID')} ${tipeAsset} → Gudang *${pt.name}*`);
                    }
                } else {
                    if (tipeAsset === 'uang' || tipeAsset === 'money') {
                        if ((pt.saldo || 0) < jumlah) return m.reply('❌ Saldo kas PT kurang!');
                        pt.saldo -= jumlah; user.money += jumlah;
                        m.reply(`✅ Tarik ${formatRp(jumlah)} ← Kas *${pt.name}*`);
                    } else {
                        if ((pt.gudang[tipeAsset] || 0) < jumlah) return m.reply('❌ Stok barang di gudang PT tidak cukup!');
                        pt.gudang[tipeAsset] -= jumlah; user[tipeAsset] = (user[tipeAsset] || 0) + jumlah;
                        m.reply(`✅ Tarik ${jumlah.toLocaleString('id-ID')} ${tipeAsset} ← Gudang *${pt.name}*`);
                    }
                }
                break;
            }

            case 'invest': {
                let nominal = parseInt(args[1]); let targetMention = args[2]; let ptId = parseInt(args[3]) - 1;
                if (isNaN(nominal) || !targetMention || isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} invest <nominal> <@tag/nomor> <id_pt>*`);
                if (nominal < 1000000) return m.reply(`❌ Minimal investasi Rp1.000.000`);

                let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                let targetUser = global.db.data.users[target];
                if (!targetUser || !targetUser.perusahaan) return m.reply(`❌ User tidak ditemukan.`);
                let pt = targetUser.perusahaan[ptId];
                if (!pt) return m.reply(`❌ ID Perusahaan target tidak ditemukan!`);

                if (pt.investOpen === false) return m.reply(`❌ Maaf, Perusahaan ini sedang *MENUTUP* jalur investasi publik!`);
                if (user.money < nominal) return m.reply(`❌ Uangmu kurang!`);

                user.money -= nominal;
                pt.saldo = (pt.saldo || 0) + nominal; 
                if (!pt.investors) pt.investors = {};
                pt.investors[m.sender] = (pt.investors[m.sender] || 0) + nominal;

                m.reply(`✅ *INVESTASI BERHASIL*\nMenyuntikkan dana *${formatRp(nominal)}* ke *${pt.name}* milik @${target.split('@')[0]}`, null, { mentions: [target] });
                break;
            }

            case 'tarikinvest': {
                let nominal = parseInt(args[1]); let targetMention = args[2]; let ptId = parseInt(args[3]) - 1;
                if (isNaN(nominal) || !targetMention || isNaN(ptId)) return m.reply(`⚠️ Format: *${usedPrefix+command} tarikinvest <nominal> <@tag/nomor> <id_pt>*`);

                let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : targetMention.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                let targetUser = global.db.data.users[target];
                if (!targetUser || !targetUser.perusahaan) return m.reply(`❌ User tidak valid.`);
                let pt = targetUser.perusahaan[ptId];
                if (!pt) return m.reply(`❌ ID Perusahaan target tidak ditemukan!`);

                if (!pt.investors || !pt.investors[m.sender] || pt.investors[m.sender] < nominal) return m.reply(`❌ Sahammu tidak cukup!`);
                if ((pt.saldo || 0) < nominal) return m.reply(`❌ Kas PT target kosong, tidak bisa menarik modal sekarang.`);

                pt.saldo -= nominal;
                pt.investors[m.sender] -= nominal;
                user.money += nominal;
                if (pt.investors[m.sender] <= 0) delete pt.investors[m.sender];

                m.reply(`✅ *PENARIKAN BERHASIL*\nMenarik *${formatRp(nominal)}* dari saham *${pt.name}*`);
                break;
            }

            case 'ihsg': case 'leaderboard': case 'lb': {
                let allUsers = global.db.data.users; let entries = [];
                for (let uid in allUsers) {
                    let u = allUsers[uid];
                    if (!Array.isArray(u.perusahaan)) continue;
                    u.perusahaan.forEach(pt => {
                        if (!pt) return;
                        entries.push({ owner: u.name || uid.split('@')[0], name: pt.name, type: pt.type, saldo: pt.saldo || 0, valuasi: hitungValuasi(pt) });
                    });
                }
                if (!entries.length) return m.reply('📊 Belum ada perusahaan.');
                entries.sort((a, b) => b.valuasi - a.valuasi);
                
                let top = entries.slice(0, 10); let total = entries.reduce((s, e) => s + e.valuasi, 0);
                let board = top.map((e, i) => `${i+1}. *${e.name}* (${e.type})\n👤 ${e.owner} | 💹 ~${formatSingkat(e.valuasi)}\n💰 Kas: ${formatRp(e.saldo)}`).join('\n\n');
                m.reply(`📊 *IHSG — LEADERBOARD*\n━━━━━━━━━━━━━━━━━━━━\n💼 Total Valuasi: ~${formatSingkat(total)}\n━━━━━━━━━━━━━━━━━━━━\n\n${board}`);
                break;
            }

            default: {
                m.reply(
                    `🏢 *MANAJEMEN PERUSAHAAN & SAHAM*\n\n` +
                    `🏛️ *PT & SAHAM*\n• *${usedPrefix+command} buat <tipe> <nama>*\n• *${usedPrefix+command} info [@tag]*\n• *${usedPrefix+command} tutup/bukainvest <id_pt>*\n\n` +
                    `🤝 *B2B KORPORASI (VIA REKBER NEGARA)*\n• *${usedPrefix+command} b2b buat <@pembeli> <item> <jml> <harga> <id_pt_sumber>*\n• *${usedPrefix+command} b2b bayar <id_kontrak> <id_pt_tujuan>*\n• *${usedPrefix+command} b2b batal <id_kontrak>*\n• *${usedPrefix+command} b2b list*\n\n` +
                    `🏦 *BANK KORPORASI*\n• *${usedPrefix+command} bank / pinjam / bayarbank*\n\n` +
                    `⚡ *LISTRIK & ENERGI*\n• *${usedPrefix+command} ceklistrik* _(Pasar Listrik Global)_\n• *${usedPrefix+command} setlistrik <id_pt> <negara|@tag_org> <id_pt_org>*\n• *${usedPrefix+command} buatpembangkit <id> <jenis>*\n• *${usedPrefix+command} upgrade listrik <id> <jml_lv>*\n• *${usedPrefix+command} settarif <id_listrik> <tarif>*\n\n` +
                    `🏭 *PRODUKSI & PABRIK*\n• *${usedPrefix+command} infopabrik* _(📖 Tutorial & Resep Barang)_\n• *${usedPrefix+command} pabrik <id_pt> <tipe> <nama>*\n• *${usedPrefix+command} upgrade gudang <id_pt> <jml_lv>*\n• *${usedPrefix+command} rekrut/pecat <jml> <id_pt>* _(Pekerja mempercepat produksi)_\n• *${usedPrefix+command} produksi <jml> <item> <id_pt>*\n\n` +
                    `⚙️ *OPERASIONAL*\n• *${usedPrefix+command} setor/tarik <jml> <uang|item> <id_pt>*\n• *${usedPrefix+command} buy <jml> <item> <id_pt>*\n• *${usedPrefix+command} jualsemua [id_pt]*\n\n` +
                    `📊 *BURSA*\n• *${usedPrefix+command} ihsg*`
                );
                break;
            }
        }
    } catch (e) { console.error('ERROR:', e); m.reply(`❌ *Terjadi Kesalahan Sistem!*\nError: ${e.message}`); }
};

handler.help    = ['perusahaan'];
handler.tags    = ['rpg'];
handler.command = /^(perusahaan|pt|company)$/i;

module.exports = handler;
