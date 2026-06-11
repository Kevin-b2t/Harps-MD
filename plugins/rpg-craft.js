let handler = async (m, { conn, command, args, usedPrefix }) => {
    let type = (args[0] || '').toLowerCase();
    let _type = (args[0] || '').toLowerCase();
    let user = global.db.data.users[m.sender];

    let caption = `*B L A C K S M I T H*

> *L I S T - C R A F T*
*[ ⛏️ ]* • Pickaxe 
*[ ⚔️ ]* • Sword
*[ 🦯 ]* • Katana 
*[ 🪓 ]* • Axe 
*[ 🔱 ]* • Trident
*[ 🏹 ]* • Bow 
*[ 🔪 ]* • Pisau 
*[ 🎣 ]* • Fishingrod 
*[ 🥼 ]* • Armor 
*[ 🛡️ ]* • Shield
*[ ⛑️ ]* • Helmet

> *U P G R A D E  T I E R S*
*(Setiap barang di atas bisa di-upgrade ke tier berikut)*
*1.* Wooden _(Butuh: 20 Kayu)_
*2.* Stone _(Butuh: Tier Wooden + 20 Batu)_
*3.* Iron _(Butuh: Tier Stone + 20 Iron)_
*4.* Silver _(Butuh: Tier Iron + 15 Perak)_
*5.* Gold _(Butuh: Tier Silver + 15 Emas)_
*6.* Diamond _(Butuh: Tier Gold + 10 Diamond)_
*7.* Emerald _(Butuh: Tier Diamond + 10 Emerald)_
*8.* Ruby _(Butuh: Tier Emerald + 10 Ruby)_
*9.* Sapphire _(Butuh: Tier Ruby + 10 Sapphire)_
*10.* Amethyst _(Butuh: Tier Sapphire + 10 Amethyst)_
*11.* Ancient _(Butuh: Tier Amethyst + 3 Ancient)_
*12.* Red Diamond _(Butuh: Tier Ancient + 5 Red Diamond)_

> *S P E C I A L  (ONLY SWORD)*
*[ 💀 ]* • Blood Sword _(Butuh: Red Diamond Sword + 10 Blood)_

> *R E S E P  K L A S I K*
_(Ketik ${usedPrefix}craft <nama> untuk resep item standar)_
• pickaxe, sword, katana, axe, trident, bow, pisau, fishingrod, armor, shield, helmet

> *C A R A  C R A F T*
• _Contoh 1_: ${usedPrefix}craft woodenpickaxe
• _Contoh 2_: ${usedPrefix}craft ironshield
• _Contoh 3_: ${usedPrefix}craft bloodsword
`.trim();

    try {
        if (/craft|Crafting|blacksmith/i.test(command)) {
            const count = args[1] && args[1].length > 0 ? Math.min(99999999, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count);
            
            // Konfigurasi Tier System Dinamis (Semua list dimasukkan)
            const tools = ['pickaxe', 'sword', 'katana', 'axe', 'trident', 'bow', 'pisau', 'fishingrod', 'armor', 'shield', 'helmet'];
            const tiers = [
                { name: 'wooden', req: { kayu: 20 } },
                { name: 'stone', req: { batu: 20 } },
                { name: 'iron', req: { iron: 20 } },
                { name: 'silver', req: { perak: 15 } },
                { name: 'gold', req: { emas: 15 } },
                { name: 'diamond', req: { diamond: 10 } },
                { name: 'emerald', req: { emerald: 10 } },
                { name: 'ruby', req: { ruby: 10 } },
                { name: 'sapphire', req: { sapphire: 10 } },
                { name: 'amethyst', req: { amethyst: 10 } },
                { name: 'ancient', req: { ancient: 3 } },
                { name: 'reddiamond', req: { reddiamond: 5 } }
            ];

            // 1. Cek Spesial Khusus Blood Sword
            if (type === 'bloodsword') {
                if (user.bloodsword > 0) return m.reply('Kamu sudah memiliki Senjata Terkuat (Blood Sword)!');
                if (!user.reddiamondsword || user.reddiamondsword < 1 || user.blood < 10) return m.reply('Barang tidak cukup!\nButuh: 1 Red Diamond Sword 🗡️ & 10 Blood Orbs 💀');
                user.reddiamondsword -= 1;
                user.blood -= 10;
                user.bloodsword += 1;
                user.sworddurability = 1000;
                return m.reply("🔥 BERHASIL MENCIPTAKAN SENJATA IBLIS: BLOOD SWORD 🔥");
            }

            // 2. Mesin Cek Item Tier Dinamis
            let isDynamicCraft = false;
            let foundTool = tools.find(t => type.endsWith(t));
            let foundTierIndex = tiers.findIndex(t => type.startsWith(t.name));

            // Jika kata yang di ketik misal "stonepickaxe" atau "ironshield"
            if (foundTool && foundTierIndex !== -1 && type === tiers[foundTierIndex].name + foundTool) {
                isDynamicCraft = true;
                let currentTier = tiers[foundTierIndex];
                let currentItem = currentTier.name + foundTool;
                let pastTier = foundTierIndex > 0 ? tiers[foundTierIndex - 1] : null;
                let pastItem = pastTier ? pastTier.name + foundTool : null;

                // Cek apakah sudah punya item ini
                if (user[currentItem] > 0) return m.reply(`Kamu sudah memiliki ${currentItem}!`);

                // Cek apakah punya item tier sebelumnya (kecuali tier wooden)
                if (pastItem && (!user[pastItem] || user[pastItem] < 1)) {
                    return m.reply(`Barang tidak cukup!\nKamu butuh *1 ${pastItem}* untuk membuat *${currentItem}*.`);
                }

                // Cek material
                let missing = [];
                for (let mat in currentTier.req) {
                    if ((user[mat] || 0) < currentTier.req[mat]) {
                        missing.push(`${currentTier.req[mat] - (user[mat] || 0)} ${mat}`);
                    }
                }

                if (missing.length > 0) {
                    return m.reply(`Barang tidak cukup!\nUntuk membuat *${currentItem}*, kamu memerlukan:\n- ` + missing.join('\n- '));
                }

                // Jika bahan pas, kurangi material dan item tier sebelumnya
                if (pastItem) user[pastItem] -= 1;
                for (let mat in currentTier.req) {
                    user[mat] -= currentTier.req[mat];
                }

                // Tambahkan item tier baru ke database
                user[currentItem] = (user[currentItem] || 0) + 1;
                user[foundTool + 'durability'] = 40 + (foundTierIndex * 15); // Durability naik otomatis

                return m.reply(`🎉 Sukses ${pastItem ? 'upgrade' : 'membuat'} ke *${currentItem}*!`);
            }

            // 3. Fallback ke sistem craft resep klasik original (termasuk item tambahan)
            if (!isDynamicCraft) {
                switch (type) {
                    case 'pickaxe':
                        if (user.pickaxe > 0) return m.reply('Kamu sudah memilik ini');
                        if (user.batu < 5 || user.kayu < 10 || user.iron < 5 || user.string < 20) return m.reply(`Barang tidak cukup!\nUntuk membuat pickaxe. Kamu memerlukan : ${user.kayu < 10 ? `\n${10 - user.kayu} kayu🪵` : ''} ${user.iron < 5 ? `\n${5 - user.iron} iron⛓` : ''}${user.string < 20 ? `\n${20 - user.string} String🕸️` : ''}${user.batu < 5 ? `\n${5 - user.batu} Batu 🪨` : ''}`);
                        user.kayu -= 10;
                        user.iron -= 5;
                        user.batu -= 5;
                        user.string -= 20;
                        user.pickaxe += 1;
                        user.pickaxedurability = 40;
                        m.reply("Sukses membuat 1 pickaxe 🔨");
                        break;                  
                    case 'sword':
                        if (user.sword > 0) return m.reply('Kamu sudah memilik ini');
                        if (user.kayu < 10 || user.iron < 15) return m.reply(`Barang tidak cukup!\nUntuk membuat sword. Kamu memerlukan :${user.kayu < 10 ? `\n${10 - user.kayu} kayu🪵` : ''}${user.iron < 15 ? `\n${15 - user.iron} iron⛓️` : ''}`);
                        user.kayu -= 10;
                        user.iron -= 15;
                        user.sword += 1;
                        user.sworddurability = 40;
                        m.reply("Sukses membuat 1 sword 🗡️");
                        break;
                    case 'pisau':
                        if (user.pisau > 0) return m.reply('Kamu sudah memilik ini');
                        if (user.kayu < 15 || user.iron < 20) return m.reply(`Barang tidak cukup!\nUntuk membuat pisau. Kamu memerlukan :${user.kayu < 15 ? `\n${15 - user.kayu} kayu🪵` : ''}${user.iron < 20 ? `\n${20 - user.iron} iron⛓️` : ''}`);
                        user.kayu -= 15;
                        user.iron -= 20;
                        user.pisau += 1;
                        user.pisaudurability = 40;
                        m.reply("Sukses membuat 1 pisau 🔪");
                        break;
                    case 'axe':
                        if (user.axe > 0) return m.reply('Kamu sudah memilik ini');
                        if (user.batu < 10 || user.kayu < 15 || user.iron < 15 || user.string < 10) return m.reply(`Barang tidak cukup!\nUntuk membuat axe. Kamu memerlukan : ${user.kayu < 10 ? `\n${10 - user.kayu} kayu🪵` : ''} ${user.iron < 5 ? `\n${5 - user.iron} iron⛓` : ''}${user.string < 20 ? `\n${20 - user.string} String🕸️` : ''}${user.batu < 5 ? `\n${5 - user.batu} Batu 🪨` : ''}`);
                        user.kayu -= 15;
                        user.iron -= 15;
                        user.batu -= 10;
                        user.string -= 10;
                        user.axe += 1;
                        user.axedurability = 40;
                        m.reply("Sukses membuat 1 axe 🪓");
                        break;
                    case 'fishingrod':
                        if (user.fishingrod > 0) return m.reply('Kamu sudah memilik ini');
                        if (user.kayu < 20 || user.iron < 5 || user.string < 20) return m.reply(`Barang tidak cukup!\nUntuk membuat pancingan. Kamu memerlukan :${user.kayu < 20 ? `\n${20 - user.kayu} kayu🪵` : ''}${user.iron < 5 ? `\n${5 - user.iron} iron⛓` : ''}${user.string < 20 ? `\n${20 - user.string} String🕸️` : ''}`);
                        user.kayu -= 10;
                        user.iron -= 2;
                        user.string -= 20;
                        user.fishingrod += 1;
                        user.fishingroddurability = 40;
                        m.reply("Sukses membuat 1 Pancingan 🎣");
                        break;
                    case 'bow':
                        if (user.bow > 0) return m.reply('Kamu sudah memilik ini');
                        if (user.kayu < 10 || user.iron < 5 || user.string < 10) return m.reply(`Barang tidak cukup!\nUntuk membuat bow. Kamu memerlukan :${user.kayu < 20 ? `\n${20 - user.kayu} kayu🪵` : ''}${user.iron < 5 ? `\n${5 - user.iron} iron⛓` : ''}${user.string < 20 ? `\n${20 - user.string} String🕸️` : ''}`);
                        user.kayu -= 10;
                        user.iron -= 5;
                        user.string -= 10;
                        user.bow += 1;
                        user.bowdurability = 40;
                        m.reply("Sukses membuat 1 Bow 🏹");
                        break;
                    case 'katana':
                        if (user.katana > 0) return m.reply('Kamu sudah memilik ini');
                        if (user.kayu < 10 || user.iron < 15 || user.diamond < 5 || user.emerald < 3) return m.reply(`Barang tidak cukup!\nUntuk membuat katana. Kamu memerlukan :${user.kayu < 10 ? `\n${10 - user.kayu} kayu🪵` : ''}${user.iron < 15 ? `\n${15 - user.iron} iron⛓` : ''}${user.diamond < 5 ? `\n${5 - user.diamond} Diamond💎` : ''}${user.emerald < 3 ? `\n${3 - user.emerald} Emerald 🟩` : ''}`);
                        user.kayu -= 10;
                        user.iron -= 15;
                        user.diamond -= 5;
                        user.emerald -= 3;
                        user.katana += 1;
                        user.katanadurability = 40;
                        m.reply("Sukses membuat 1 Katana 🦯");
                        break;
                    case 'armor':
                        if (user.armor > 0) return m.reply('Kamu sudah memilik ini');
                        if (user.iron < 5 || user.diamond < 1) return m.reply(`Barang tidak cukup!\nUntuk membuat armor. Kamu memerlukan :${user.iron < 5 ? `\n${5 - user.iron} Iron ⛓️` : ''}${user.diamond < 1 ? `\n${1 - user.diamond} Diamond 💎` : ''}`);
                        user.iron -= 5;
                        user.diamond -= 1;
                        user.armor += 1;
                        user.armordurability = 50;
                        m.reply("Sukses membuat 1 Armor 🥼");
                        break;
                    case 'trident':
                        if (user.trident > 0) return m.reply('Kamu sudah memilik ini');
                        if (user.kayu < 15 || user.iron < 20 || user.string < 5) return m.reply(`Barang tidak cukup!\nUntuk membuat trident. Kamu memerlukan :${user.kayu < 15 ? `\n${15 - user.kayu} Kayu🪵` : ''}${user.iron < 20 ? `\n${20 - user.iron} Iron ⛓️` : ''}${user.string < 5 ? `\n${5 - user.string} String 🕸️` : ''}`);
                        user.kayu -= 15;
                        user.iron -= 20;
                        user.string -= 5;
                        user.trident += 1;
                        user.tridentdurability = 50;
                        m.reply("Sukses membuat 1 Trident 🔱");
                        break;
                    case 'shield':
                        if (user.shield > 0) return m.reply('Kamu sudah memilik ini');
                        if (user.kayu < 20 || user.iron < 10) return m.reply(`Barang tidak cukup!\nUntuk membuat shield. Kamu memerlukan :${user.kayu < 20 ? `\n${20 - user.kayu} Kayu🪵` : ''}${user.iron < 10 ? `\n${10 - user.iron} Iron ⛓️` : ''}`);
                        user.kayu -= 20;
                        user.iron -= 10;
                        user.shield += 1;
                        user.shielddurability = 50;
                        m.reply("Sukses membuat 1 Shield 🛡️");
                        break;
                    case 'helmet':
                        if (user.helmet > 0) return m.reply('Kamu sudah memilik ini');
                        if (user.iron < 5 || user.diamond < 1) return m.reply(`Barang tidak cukup!\nUntuk membuat helmet. Kamu memerlukan :${user.iron < 5 ? `\n${5 - user.iron} Iron ⛓️` : ''}${user.diamond < 1 ? `\n${1 - user.diamond} Diamond 💎` : ''}`);
                        user.iron -= 5;
                        user.diamond -= 1;
                        user.helmet += 1;
                        user.helmetdurability = 50;
                        m.reply("Sukses membuat 1 Helmet ⛑️");
                        break;
                    default:
                        await conn.sendMessage(m.chat, { image: { url: 'https://telegra.ph/file/ed878d04e7842407c2b89.jpg' }, caption: caption, mentions: [m.sender] }, { quoted: m });
                }
            }
        } else if (/enchant|enchan/i.test(command)) {
            const count = args[2] && args[2].length > 0 ? Math.min(99999999, Math.max(parseInt(args[2]), 1)) : !args[2] || args.length < 4 ? 1 : Math.min(1, count);
            switch (_type) {
                case 't':
                    break;
                case '':
                    break;
                default:
                    m.reply(caption);
            }
        }
    } catch (err) {
        m.reply("Error\n\n\n" + err.stack);
    }
};

handler.help = ['craft', 'blacksmith'];
handler.tags = ['rpg'];
handler.command = /^(craft|crafting|chant|blacksmith)/i;
handler.register = true;
handler.group = true;
handler.rpg = true

module.exports = handler;
