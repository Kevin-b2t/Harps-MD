const fs = require('fs');
const path = require('path');

const sellPrices = {
    // 🔫 Senjata
    tombak: 2500000, busur: 500000, anakpanah: 400000, ammo: 1750000,
    glock: 1500000, beretta: 1750000, deagle: 2250000, revolver: 2000000,
    uzi: 2750000, mp5: 2500000, p90: 3200000, mac10: 2000000, vector: 2100000, ump45: 2250000, pp19bizon: 2400000,
    ak47: 3200000, m4: 3250000, m16: 4200000, ar15: 3850000, scar: 4500000, famas: 4500000, aug: 4700000, hk416: 4250000, g36c: 4000000, fnfal: 4750000, qbz95: 3750000, aek971: 4100000,
    spas12: 4250000, aa12: 6000000, benellim4: 5000000, saiga12: 5500000,
    m24: 20000000, m40: 20000000, remington700: 12500000, dragunovsvd: 44000000, barrettm82: 49500000, l96: 22500000, awm: 75000000, intervention: 60000000, cheytacm200: 65000000,
    m249: 30000000, pkm: 27500000, mg42: 35000000, rpg7: 42500000, minigun: 75000000,
    diamondrifle: 250000000, emeraldsniper: 375000000, rubyrevolver: 150000000, sapphirecannon: 500000000,

    // 🏭 Barang Perusahaan & Pertanian
    botol: 225, kayu: 750, sampah: 90, string: 37500, kaleng: 300, kardus: 300, plastik: 225, kain: 300, paku: 112, baterai: 900, banbekas: 675, karet: 375, tembaga: 2625, aluminium: 3375, baut: 150, mur: 150, gear: 1125, rantai: 900, mesinbekas: 3750, oli: 600, pcb: 1500, kabel: 450, kaca: 750, keramik: 900, semen: 1875, cat: 1125, koinkuno: 7500, jamrusak: 2250, pegas: 300, besibekas: 600, lampu: 450, potion: 15000, umpan: 1125, pancingan: 26250,
    pasir: 187500, iron: 15000, emasmentah: 649867, batu: 375, coal: 1125, uranium: 26250, tembagaore: 6000, perakore: 9000, timah: 4500, nikel: 11250, kuarsa: 15000, kristal: 37500, obsidian: 26250, belerang: 3750, marmer: 9000, granit: 7500, garam: 1500, tanahliat: 1125, batukapur: 2250, batupermata: 60000, fosil: 33750, mutiara: 45000, karang: 3750, gipsum: 3000, magnetit: 13500, bauksit: 10500, platinaore: 26250, titaniumore: 30000, litium: 18750, zamrudmentah: 48750, rubimentah: 52500,
    airmineral: 7425, tehbotol: 7200, aqua: 3750, susu: 4500, madu: 48000, nescafe: 10800, ultramilk: 7500, jusanggur: 9000, jusapel: 9225, jusjeruk: 9450, jusmangga: 9675, juspisang: 9975, pisang: 4125, anggur: 4125, mangga: 3450, jeruk: 4500, apel: 4125, makananpet: 37500, makanannaga: 112500, makanankyubi: 112500, makanangriffin: 60000, makananphonix: 60000, makanancentaur: 112500, esjeruk: 6000, eskelapa: 7500, kopihitam: 5250, kopisusu: 6750, cappuccino: 11250, latte: 12000, mocha: 12750, tehmanis: 3750, tehhijau: 6000, tehtarik: 7500, jusstroberi: 10125, jusmelon: 9750, jussemangka: 9375, jusdurian: 13500, juspepaya: 8250, jusalpukat: 10500, susucoklat: 6000, susustroberi: 6375, sodagembira: 9000, wedangjahe: 4500, airkelapa: 5250, sirupmelon: 11250, sirupjeruk: 11250, sirupanggur: 12000, sirupstroberi: 12000,
    
    // ⚔️ Perlengkapan & Equipment
    sword: 112500, pickaxe: 11250, katana: 150000, axe: 11250, trident: 187500, bow: 37500, pisau: 7500, fishingrod: 11250, armor: 262500, shield: 150000, helmet: 112500,
    
    // 🎁 Crates 
    common: 195000, uncommon: 285000, rare: 300000, epic: 756000, mythic: 915000, legendary: 2865000, secret: 4650000, dark: 10000000, cheat: 14670000,
    
    // 💎 Gems & Metals 
    diamond: 4081000, perak: 891000, emas: 1296000, emerald: 9000000, berlian: 10000, emasbatang: 10000, perakbatang: 7000, ruby: 1200000, sapphire: 1300000, topaz: 800000, amethyst: 950000, opal: 750000, aquamarine: 1100000, garnet: 900000, jade: 1800000, onyx: 1000000, turquoise: 600000, alexandrite: 3200000, moonstone: 1150000, blackdiamond: 6000000, reddiamond: 7500000, platinum: 3500000
};

const nonItemKeys = [
    'name', 'role', 'level', 'exp', 'limit', 'money', 'bank', 'healt', 'energi', 'stamina', 'speed', 
    'strenght', 'attack', 'defense', 'lastberkebon', 'lastTax', 'lastSalary', 'pekerjaantiga', 'lastTaxDate', 
    'lastKorupsi', 'lastBankTax', 'lastBansos', 'hutangNegara', 'perusahaan', 'kucing', 'anjing', 'rubah', 
    'serigala', 'ular', 'horse', 'centaur', 'rhinoceros', 'lion', 'beruang', 'griffin', 'phonix', 'kyubi', 
    'naga', 'godzilla', 'pet', 'makananpet', 'premium', 'premiumTime', 'registered', 'age', 'job', 'banned', 
    'warn', 'afk', 'afkReason', 'autolevelup', 'pasangan', 'misi', 'titlein', 'skill'
];

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

let handler = async (m, { conn, command, args, usedPrefix }) => {
    let cmd = command.toLowerCase()
    let target = m.mentionedJid[0] || m.sender 
    let user = global.db.data.users[target]
    
    if (!user) return m.reply('❌ Data pengguna tidak ditemukan di sistem database.')

    if (user.money === undefined) user.money = 0
    if (user.bank === undefined) user.bank = 0
    if (user.hutangNegara === undefined) user.hutangNegara = 0

    // Filter Items Lebih Ketat (Membersihkan data kotor seperti Pekerjaansatu dll)
    let backpackItems = [];
    for (let key in user) {
        if (typeof user[key] === 'number' && 
            user[key] > 0 && 
            !nonItemKeys.includes(key) && 
            !key.includes('durability') && 
            !key.includes('last') && 
            !key.includes('kerja') && 
            !key.toLowerCase().includes('time')
        ) {
            backpackItems.push(key);
        }
    }

    // MEMAKSA MEMBACA FOTO DARI DIREKTORI UTAMA BOT
    let imgPath = path.join(process.cwd(), 'image', 'foto.jpg');
    let docBuffer;
    try {
        docBuffer = fs.readFileSync(imgPath);
    } catch (e) {
        // Jika file lokal gagal terbaca, bot akan memberikan peringatan dan menggunakan URL dummy agar sistem tidak error
        console.log("⚠️ PERINGATAN: File 'image/foto.jpg' tidak ditemukan! Pastikan nama dan folder sudah benar.");
        docBuffer = { url: 'https://telegra.ph/file/0b32e0a0bb025d5173167.jpg' };
    }

    // ==========================================
    // 1. FITUR : .INVENTORY
    // ==========================================
    if (cmd === 'inv' || cmd === 'inventory') {
        let armor = user.armor || 0
        let sword = user.sword || 0
        let fishingrod = user.fishingrod || 0
        let pickaxe = user.pickaxe || 0
        let katana = user.katana || 0
        let bow = user.bow || 0
        let axe = user.axe || 0
        let shield = user.shield || 0
        let helmet = user.helmet || 0

        let capt = `╭─〔 🫧 〕 *INVENTORY*
│ ⌁ 👤 *Username* : ${user.name || 'Warga'}
│ ⌁ 🎭 *Role* : ${user.role || 'Beginner'}
│ ⌁ 🧬 *Level* : ${user.level || 0}
│ ⌁ 💡 *Exp* : ${user.exp || 0}
│ ⌁ 🎫 *Limit* : ${user.limit || 0}
│ ⌁ 🏷️ *Title* : ${user.titlein || 'Tidak Ada'}
│ ⌁ 🪄 *Skill* : ${user.skill ? user.skill : 'Tidak Ada'}
╰──────────〔 🫧 〕

╭─〔 💳 〕 *FINANSIAL & ASET*
│ ⌁ 💵 *Money* : Rp ${(user.money || 0).toLocaleString('id-ID')}
│ ⌁ 💳 *Bank ATM* : Rp ${(user.bank || 0).toLocaleString('id-ID')}
│ ⌁ 📉 *Hutang* : ${user.hutangNegara > 0 ? `-Rp ${user.hutangNegara.toLocaleString('id-ID')}` : 'Lunas'}
│ ⌁ 🗺️ *Luas Lahan* : ${user.tanah || 0} Hektar
╰──────────〔 🫧 〕

╭─〔 💊 〕 *STATUS TUBUH*
│ ⌁ ❤️ *Health* : ${user.healt || 0}
│ ⌁ ⚡ *Energi* : ${user.energi || 0}
│ ⌁ 🏃 *Stamina* : ${user.stamina || 0}
│ ⌁ 💨 *Speed* : ${user.speed || 0}
│ ⌁ 💪 *Strength* : ${user.strenght || 0}
│ ⌁ 🗡️ *Attack* : ${user.attack || 0}
│ ⌁ 🛡️ *Defense* : ${user.defense || 0}
╰──────────〔 🫧 〕

╭─〔 ⚔️ 〕 *SENJATA & ARMOR*
│ ⌁ 👕 *Armor* : ${armor == 0 ? 'Tidak Punya' : '' || armor == 1 ? 'Leather Armor' : '' || armor == 2 ? 'Iron Armor' : '' || armor == 3 ? 'Gold Armor' : '' || armor == 4 ? 'Diamond Armor' : '' || armor == 5 ? 'Emerald Armor' : '' || armor == 6 ? 'Crystal Armor' : '' || armor == 7 ? 'Obsidian Armor' : '' || armor == 8 ? 'Netherite Armor' : '' || armor == 9 ? 'Wither Armor' : '' || armor == 10 ? 'Dragon Armor' : '' || armor == 11 ? 'Hacker Armor' : '' || armor == 12 ? 'GOD Armor' : ''}
│ ⌁ 🛡️ *Shield* : ${shield > 0 ? 'Punya ('+shield+')' : 'Tidak Punya'}
│ ⌁ 🪖 *Helmet* : ${helmet > 0 ? 'Punya ('+helmet+')' : 'Tidak Punya'}
│ ⌁ ⚔️ *Sword* : ${sword == 0 ? 'Tidak Punya' : '' || sword == 1 ? 'Wooden Sword' : '' || sword == 2 ? 'Iron Sword' : '' || sword == 3 ? 'Gold Sword' : '' || sword == 4 ? 'Diamond Sword' : '' || sword == 5 ? 'Netherite Sword' : '' || sword == 6 ? 'Crystal Sword' : '' || sword == 7 ? 'Obsidian Sword' : '' || sword == 8 ? 'Netherite Sword' : '' || sword == 9 ? 'Wither Sword' : '' || sword == 10 ? 'Dragon Sword' : '' || sword == 11 ? 'Hacker Sword' : '' || sword == 12 ? 'GOD Sword' : ''}
│ ⌁ 🎣 *FishingRod* : ${fishingrod > 0 ? 'Punya ('+fishingrod+')' : 'Tidak Punya'}
│ ⌁ ⛏️ *Pickaxe* : ${pickaxe > 0 ? 'Punya ('+pickaxe+')' : 'Tidak Punya'}
╰──────────〔 🫧 〕

╭─〔 📦 〕 *USER BOX*
│ ⌁ 📦 *Total Box* : ${(user.common||0) + (user.uncommon||0) + (user.rare||0) + (user.epic||0) + (user.mythic||0) + (user.legendary||0) + (user.secret||0) + (user.dark||0) + (user.cheat||0)}
╰──────────〔 🫧 〕`

        let buttons = [
            { buttonId: `${usedPrefix}backpack`, buttonText: { displayText: '🎒 BackPack' }, type: 1 },
            { buttonId: `${usedPrefix}infopet`, buttonText: { displayText: '🐱 INFO PET' }, type: 1 }
        ];

        return await conn.sendMessage(m.chat, {
            document: docBuffer,
            jpegThumbnail: fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null,
            mimetype: 'image/jpeg',
            fileName: 'Vinz MD', // Ekstensi .jpg dipaksa agar nama override tembus
            caption: capt.trim(),
            footer: 'Status Profile & Inventory',
            buttons: buttons,
            headerType: 3
        }, { quoted: m });
    }

    // ==========================================
    // 2. FITUR : .BACKPACK 
    // ==========================================
    if (cmd === 'backpack') {
        let txt = `╭─〔 🎒 〕 *BACKPACK*\n`;
        
        if (backpackItems.length === 0) {
            txt += `│ ⌁ _Tas mu saat ini kosong_\n`;
        } else {
            backpackItems.sort((a, b) => user[b] - user[a]);
            backpackItems.forEach((item, index) => {
                txt += `│ ⌁ *${index + 1}.* ${capitalize(item)} : ${user[item].toLocaleString('id-ID')}\n`;
            });
        }
        txt += `╰──────────〔 🫧 〕\n_Hanya menampilkan barang yang kamu miliki._`

        return await conn.sendMessage(m.chat, {
            document: docBuffer,
            jpegThumbnail: fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null,
            mimetype: 'image/jpeg',
            fileName: 'Vinz MD',
            caption: txt.trim(),
            headerType: 3
        }, { quoted: m });
    }

    // ==========================================
    // 3. FITUR : .INFOPET / .MYPET
    // ==========================================
    if (cmd === 'infopet' || cmd === 'mypet') {
        let txt = `╭─〔 🐱 〕 *INFO PET*\n`;
        txt += `│ ⌁ 👤 *Pemilik:* ${user.name || 'Warga'}\n│\n`;
        txt += `│ ⌁ 🎫 *Pet Token:* ${user.pet || 0}\n`;
        txt += `│ ⌁ 🍖 *Makanan Pet:* ${user.makananpet || 0}\n│\n`;

        const petsList = [
            { name: 'Kucing 🐈', id: 'kucing' }, { name: 'Anjing 🐕', id: 'anjing' },
            { name: 'Rubah 🦊', id: 'rubah' }, { name: 'Serigala 🐺', id: 'serigala' },
            { name: 'Ular 🐍', id: 'ular' }, { name: 'Horse 🐎', id: 'horse' },
            { name: 'Centaur 🐴', id: 'centaur' }, { name: 'Rhinoceros 🦏', id: 'rhinoceros' },
            { name: 'Lion 🦁', id: 'lion' }, { name: 'Beruang 🐻', id: 'beruang' },
            { name: 'Griffin 🦅', id: 'griffin' }, { name: 'Phonix 🐦‍🔥', id: 'phonix' },
            { name: 'Kyubi 🦊🔥', id: 'kyubi' }, { name: 'Naga 🐉', id: 'naga' },
            { name: 'Godzilla 🦖', id: 'godzilla' }
        ];

        let hasPet = false;
        petsList.forEach(p => {
            if (user[p.id] > 0) {
                hasPet = true;
                txt += `│ ⌁ ${p.name} : Level ${user[p.id]}\n`;
            }
        });

        if (!hasPet) {
            txt += `│ ⌁ _(Kamu belum memiliki peliharaan)_\n`;
            txt += `│ ⌁ _Beli hewan pertamamu di toko pet!_\n`;
        }
        txt += `╰──────────〔 🫧 〕`;
        
        let buttons = [ { buttonId: `${usedPrefix}petshop`, buttonText: { displayText: '🏪 Pet Store' }, type: 1 } ];

        return await conn.sendMessage(m.chat, {
            document: docBuffer,
            jpegThumbnail: fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null,
            mimetype: 'image/jpeg',
            fileName: 'Vinz MD',
            caption: txt,
            footer: 'Status Peliharaan',
            buttons: buttons,
            headerType: 3
        }, { quoted: m });
    }

    // ==========================================
    // 4. FITUR : .TOTALASSETS 
    // ==========================================
    if (cmd === 'totalassets' || cmd === 'assets') {
        let money = user.money || 0;
        let bank = user.bank || 0;
        let hutang = user.hutangNegara || 0;
        
        let ptCash = 0;
        if (Array.isArray(user.perusahaan)) {
            user.perusahaan.forEach(pt => { if (pt && pt.saldo > 0) ptCash += pt.saldo; });
        }

        let itemsValue = 0;
        let totalItems = 0;
        backpackItems.forEach(item => {
            let qty = user[item] || 0;
            if (qty > 0 && sellPrices[item]) itemsValue += qty * sellPrices[item];
            totalItems += qty;
        });

        let nettWorth = money + bank + ptCash + itemsValue - hutang;
        let isBankrupt = nettWorth < 0;

        let txt = `╭─〔 💰 〕 *TOTAL KEKAYAAN*\n`;
        txt += `│ ⌁ 👤 *Pengguna:* ${user.name || 'Warga'}\n│\n`;
        txt += `│ ⌁ *📊 LIKUIDITAS (TUNAI):*\n`;
        txt += `│ ⌁ 💵 *Dompet:* Rp ${money.toLocaleString('id-ID')}\n`;
        txt += `│ ⌁ 💳 *Saldo ATM:* Rp ${bank.toLocaleString('id-ID')}\n`;
        if (ptCash > 0) txt += `│ ⌁ 🏢 *Kas Perusahaan:* Rp ${ptCash.toLocaleString('id-ID')}\n`;
        if (hutang > 0) txt += `│ ⌁ 📉 *Hutang Negara:* -Rp ${hutang.toLocaleString('id-ID')}\n`;

        txt += `│\n│ ⌁ *📦 LOGISTIK & VALUASI:*\n`;
        txt += `│ ⌁ 🎒 *Total Barang:* ${totalItems.toLocaleString('id-ID')} Pcs\n`;
        txt += `│ ⌁ 💎 *Valuasi:* Rp ${itemsValue.toLocaleString('id-ID')}\n`;

        txt += `│\n│ ⌁ ⚖️ *NETT WORTH BERSIH:*\n`;
        txt += `│ ⌁ *${isBankrupt ? '-' : ''}Rp ${Math.abs(nettWorth).toLocaleString('id-ID')}*\n`;
        txt += `╰──────────〔 🫧 〕\n\n`;
        
        if (isBankrupt) txt += `_⚠️ Status: Bangkrut / Terlilit Hutang Parah_`;
        else if (nettWorth > 1000000000000) txt += `_👑 Status: Triliuner (Sangat Kaya Raya)_`;
        else if (nettWorth > 1000000000) txt += `_👔 Status: Miliarder (Konglomerat)_`;
        else txt += `_🚶‍♂️ Status: Menengah Ke Bawah_`;

        return await conn.sendMessage(m.chat, {
            document: docBuffer,
            jpegThumbnail: fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null,
            mimetype: 'image/jpeg',
            fileName: 'Vinz MD',
            caption: txt.trim(),
            headerType: 3
        }, { quoted: m });
    }
}

handler.help = ['inventory *@user*', 'backpack *@user*', 'infopet *@user*', 'totalassets *@user*']
handler.tags = ['rpg']
handler.command = /^(inv|inventory|backpack|totalassets|assets|infopet|mypet)$/i
handler.rpg = true

module.exports = handler
