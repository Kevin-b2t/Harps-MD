const cooldown = 30000;

const items = {
    buygun: {
        tombak: { money: 50000000 },
        busur: { money: 10000000 },
        anakpanah: { money: 8000000 },
        ammo: { money: 3500000 },
        
        // Pistols
        glock: { money: 3000000 },
        beretta: { money: 3500000 },
        deagle: { money: 4500000 },
        revolver: { money: 4000000 },
        
        // SMGs
        uzi: { money: 5500000 },
        mp5: { money: 5000000 },
        p90: { money: 6400000 },
        mac10: { money: 4000000 },
        vector: { money: 4200000 },
        ump45: { money: 4500000 },
        pp19bizon: { money: 4800000 },
        
        // Assault Rifles
        ak47: { money: 6400000 },
        m4: { money: 6500000 },
        m16: { money: 8400000 },
        ar15: { money: 7700000 },
        scar: { money: 9000000 },
        famas: { money: 9000000 },
        aug: { money: 9400000 },
        hk416: { money: 8500000 },
        g36c: { money: 8000000 },
        fnfal: { money: 9500000 },
        qbz95: { money: 7500000 },
        aek971: { money: 8200000 },
        
        // Shotguns
        spas12: { money: 8500000 },
        aa12: { money: 12000000 },
        benellim4: { money: 10000000 },
        saiga12: { money: 11000000 },
        
        // Sniper Rifles
        m24: { money: 40000000 },
        m40: { money: 40000000 },
        remington700: { money: 25000000 },
        dragunovsvd: { money: 88000000 },
        barrettm82: { money: 99000000 },
        l96: { money: 45000000 },
        awm: { money: 150000000 },
        intervention: { money: 120000000 },
        cheytacm200: { money: 130000000 },
        
        // LMGs & Heavy Weapons
        m249: { money: 60000000 },
        pkm: { money: 55000000 },
        mg42: { money: 70000000 },
        rpg7: { money: 85000000 },
        minigun: { money: 150000000 },
        
        // Fantasy / Special Tiers
        diamondrifle: { money: 500000000 },
        emeraldsniper: { money: 750000000 },
        rubyrevolver: { money: 300000000 },
        sapphirecannon: { money: 1000000000 }
    },
    sellgun: {
        tombak: { money: 2500000 },
        busur: { money: 500000 },
        anakpanah: { money: 400000 },
        ammo: { money: 1750000 },
        
        // Pistols
        glock: { money: 1500000 },
        beretta: { money: 1750000 },
        deagle: { money: 2250000 },
        revolver: { money: 2000000 },
        
        // SMGs
        uzi: { money: 2750000 },
        mp5: { money: 2500000 },
        p90: { money: 3200000 },
        mac10: { money: 2000000 },
        vector: { money: 2100000 },
        ump45: { money: 2250000 },
        pp19bizon: { money: 2400000 },
        
        // Assault Rifles
        ak47: { money: 3200000 },
        m4: { money: 3250000 },
        m16: { money: 4200000 },
        ar15: { money: 3850000 },
        scar: { money: 4500000 },
        famas: { money: 4500000 },
        aug: { money: 4700000 },
        hk416: { money: 4250000 },
        g36c: { money: 4000000 },
        fnfal: { money: 4750000 },
        qbz95: { money: 3750000 },
        aek971: { money: 4100000 },
        
        // Shotguns
        spas12: { money: 4250000 },
        aa12: { money: 6000000 },
        benellim4: { money: 5000000 },
        saiga12: { money: 5500000 },
        
        // Sniper Rifles
        m24: { money: 20000000 },
        m40: { money: 20000000 },
        remington700: { money: 12500000 },
        dragunovsvd: { money: 44000000 },
        barrettm82: { money: 49500000 },
        l96: { money: 22500000 },
        awm: { money: 75000000 },
        intervention: { money: 60000000 },
        cheytacm200: { money: 65000000 },
        
        // LMGs & Heavy Weapons
        m249: { money: 30000000 },
        pkm: { money: 27500000 },
        mg42: { money: 35000000 },
        rpg7: { money: 42500000 },
        minigun: { money: 75000000 },
        
        // Fantasy / Special Tiers
        diamondrifle: { money: 250000000 },
        emeraldsniper: { money: 375000000 },
        rubyrevolver: { money: 150000000 },
        sapphirecannon: { money: 500000000 }
    }
};

const handler = async (m, { conn, command, usedPrefix, args, text, isPrems }) => {
    global.db.users = global.db.users || {};
    let user = global.db.users[m.sender] = global.db.users[m.sender] || {};

    if (user.jail === true) {
        throw '*Kamu tidak bisa melakukan aktivitas karena masih dalam penjara!*';
    }

    if (new Date() - user.pekerjaantiga < cooldown) {
        const remainingTime = new Date(user.pekerjaantiga + cooldown) - new Date();
        const formattedTime = new Date(remainingTime).toISOString().substr(11, 8);
        throw `Kamu baru saja pergi ke toko! Tunggu selama *${formattedTime}*`;
    }

    if (command.toLowerCase() == 'gunshop') {
        let text = `
*🏪 Gun Shop*

Ingin menggunakan *Toko Senjata*?
Ketik _.buygun_ bila ingin membeli senjata!
Ketik _.sellgun_ bila ingin menjual senjata!
        `.trim();
        conn.reply(m.chat, text, m);
        return;
    }

    // Bersihkan filter yang tidak pakai money
    const listItems = Object.fromEntries(Object.entries(items[command.toLowerCase()])
        .filter(([v, { money }]) => {
            if (money && user.money < money) return false;
            return v && v in user;
        }));

    const info = `
*Contoh penggunaan:* ${usedPrefix}${command} ak47 1
    
*Daftar Senjata:* 
${Object.keys(items[command.toLowerCase()]).map((v) => {
        let paymentMethod = Object.keys(items[command.toLowerCase()][v])[0];
        return `${emojis(v)} ${capitalizeFirstLetter(v)} | ${toSimple(items[command.toLowerCase()][v][paymentMethod])} ${emojis(paymentMethod)}${capitalizeFirstLetter(paymentMethod)}`.trim();
    }).join('\n')}
    `.trim();

    const item = (args[0] || '').toLowerCase();

    if (!items[command.toLowerCase()][item]) {
        return m.reply(info);
    }

    if (!args[1]) {
        m.reply(info);
        return;
    }

    let total = Math.floor(isNumber(args[1]) ? Math.min(Math.max(parseInt(args[1]), 1)) : 1) * ({"K": 1e3, "M": 1e6, "B": 1e9, "T": 1e12, "QA": 1e15, "QI": 1e18, "SX": 1e21, "SP": 1e24, "OC": 1e27, "N": 1e30, "DC": 1e33, "UD": 1e36, "DD": 1e39, "TD": 1e42, "QUA": 1e45, "QUI": 1e48, "SXD": 1e51, "SPD": 1e54, "OCD": 1e57, "NOD": 1e60, "VG": 1e63}[args[1].toUpperCase().replace(/[^KMBTQAISXONDCUP]/g, '')] || 1);

    if (command.toLowerCase() == 'buygun') {
        const requiredMethod = 'money'; // Sekarang fix hanya menggunakan money
        
        if (user[requiredMethod] < items[command.toLowerCase()][item][requiredMethod] * total) {
            return m.reply(`Kamu tidak memiliki cukup ${emojis(requiredMethod)}${requiredMethod} untuk membeli *${toSimple(total)}* ${emojis(item)}${capitalizeFirstLetter(item)}. Kamu memerlukan *${toSimple((items[command.toLowerCase()][item][requiredMethod] * total) - user[requiredMethod])}* ${requiredMethod} lagi untuk dapat membeli`);
        }

        user[requiredMethod] -= items[command.toLowerCase()][item][requiredMethod] * total;
        user[item] = (user[item] || 0) + total;
        user.pekerjaantiga = new Date() * 1;

        return m.reply(`Kamu telah membeli *${toSimple(total)}* ${emojis(item)}${capitalizeFirstLetter(item)} menggunakan ${emojis(requiredMethod)}${requiredMethod}`);
    } else if (command.toLowerCase() == 'sellgun') {
        if (isPrems && /all/i.test(args[1])) {
            total = user[item];
        }
        if (user[item] < total) {
            return m.reply(`Kamu tidak memiliki cukup *${emojis(item)}${capitalizeFirstLetter(item)}* untuk dijual. Anda hanya memiliki ${toSimple(user[item])} item`);
        }
        
        const rewardKey = 'money'; // Sekarang fix hanya menjadi money
        
        if (!(rewardKey in user)) {
            throw new Error(`Pengguna tidak memiliki ${rewardKey} dalam database mereka, tetapi hadiah memberikannya!`);
        }

        user[item] -= total;
        user[rewardKey] += items[command.toLowerCase()][item][rewardKey] * total;
        user.pekerjaantiga = new Date() * 1;

        return m.reply(`Kamu telah menjual *${toSimple(total)}* ${emojis(item)}${capitalizeFirstLetter(item)} dan mendapatkan *${toSimple(items[command.toLowerCase()][item][rewardKey] * total)}* ${emojis(rewardKey)}`);
    }
    return;
};

handler.help = ['gunshop'].map(v => v + '');
handler.tags = ['rpg'];
handler.command = /^(gunshop|buygun|sellgun)$/i;
handler.cooldown = cooldown;
handler.rpg = true;
module.exports = handler;

function isNumber(number) {
    if (!number) return number;
    number = parseInt(number);
    return typeof number == 'number' && !isNaN(number);
}

function toSimple(number) {
    if (isNaN(parseFloat(number))) return number;
    if (parseFloat(number) === 0) return '0';
    number = parseFloat(number).toFixed(0);
    const suffixes = ['', 'K', 'JT', 'M', 'T'];
    const base = 1000;
    const exponent = Math.floor(Math.log10(Math.abs(number)) / 3);
    const suffix = suffixes[exponent] || '';
    const simplified = number / Math.pow(base, exponent);
    const formatter = Intl.NumberFormat('en', { maximumFractionDigits: 1 });
    return formatter.format(simplified) + suffix;
}

function emojis(item) {
    switch (item.toLowerCase()) {
        case 'tombak': return '🪓';
        case 'busur': return '🏹';
        case 'anakpanah': return '🏹';
        case 'ammo': return '📦';
        
        // Pistols, SMGs, ARs, Snipers, & Fantasy Guns
        case 'glock': case 'beretta': case 'deagle': case 'revolver':
        case 'uzi': case 'mp5': case 'p90': case 'mac10': case 'vector': case 'ump45': case 'pp19bizon':
        case 'ak47': case 'm4': case 'm16': case 'ar15': case 'scar': case 'famas': case 'aug':
        case 'hk416': case 'g36c': case 'fnfal': case 'qbz95': case 'aek971':
        case 'm24': case 'm40': case 'remington700': case 'dragunovsvd': case 'barrettm82':
        case 'l96': case 'awm': case 'intervention': case 'cheytacm200':
        case 'diamondrifle': case 'emeraldsniper': case 'rubyrevolver':
            return '🔫';

        // Shotguns
        case 'spas12': case 'aa12': case 'benellim4': case 'saiga12':
            return '💥';

        // LMGs & Minigun
        case 'm249': case 'pkm': case 'mg42': case 'minigun':
            return '🔥';

        // Launchers & Cannons
        case 'rpg7': case 'sapphirecannon':
            return '🚀';

        // Currency
        case 'money': return '💵';
        
        default: return '';
    }
}

function capitalizeFirstLetter(str) {
    let words = str.split(" ");
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    }
    return words.join(" ");
}
