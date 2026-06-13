process.env.TZ = 'Asia/Jakarta'
let fs = require('fs')
let path = require('path')
let fetch = require('node-fetch')
let moment = require('moment-timezone')
let levelling = require('../lib/levelling')
const { generateWAMessageFromContent } = require('lily-baileys') // Menggunakan lily-baileys sesuai dependencymu

let arrayMenu = [
  'all', 'ai', 'main', 'downloader', 'database', 'rpg',
  'rpgG', 'sticker', 'advanced', 'xp', 'fun', 'game', 
  'github', 'group', 'image', 'nsfw', 'info', 'internet', 
  'islam', 'kerang', 'maker', 'news', 'owner', 'voice', 
  'quotes', 'store', 'stalk', 'shortlink', 'tools', 'anonymous', ''
];

const allTags = {
    'all': 'SEMUA MENU',
    'ai': 'MENU AI',
    'main': 'MENU UTAMA',
    'downloader': 'MENU DOWNLOADER',
    'database': 'MENU DATABASE',
    'rpg': 'MENU RPG',
    'rpgG': 'MENU RPG GUILD',
    'sticker': 'MENU CONVERT',
    'advanced': 'ADVANCED',
    'xp': 'MENU EXP',
    'fun': 'MENU FUN',
    'game': 'MENU GAME',
    'github': 'MENU GITHUB',
    'group': 'MENU GROUP',
    'image': 'MENU IMAGE',
    'nsfw': 'MENU NSFW',
    'info': 'MENU INFO',
    'internet': 'INTERNET',
    'islam': 'MENU ISLAMI',
    'kerang': 'MENU KERANG',
    'maker': 'MENU MAKER',
    'news': 'MENU NEWS',
    'owner': 'MENU OWNER',
    'voice': 'PENGUBAH SUARA',
    'quotes': 'MENU QUOTES',
    'store': 'MENU STORE',
    'stalk': 'MENU STALK',
    'shortlink': 'SHORT LINK',
    'tools': 'MENU TOOLS',
    'anonymous': 'ANONYMOUS CHAT',
    '': 'NO CATEGORY'
}

const defaultMenu = {
    before: `
┌─⊷ *HARPS BOT MD*
┃
┃ Hai %name 👋
┃
┃ 🤖 Bot Information
┃ • Status  : Online
┃ • Uptime  : %uptime
┃ • Version : %version
┃ • Prefix  : %p
┃
┃ 📅 Today
┃ • Date : %date
┃ • Time : %time
┃
┃ 📌 Pilih menu spesifik 
┃ melalui tombol di bawah.
└──────────────
`.trimStart(),
    header: '┌  ◦ *%category*',
    body: '│  ◦ %cmd %islimit %isPremium',
    footer: '└  ',
    after: `*Note:* Jika ingin kembali ke daftar utama silakan klik Kembali.`
}

let handler = async (m, { conn, usedPrefix: _p, args = [], command }) => {
    try {
        let package = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../package.json')).catch(_ => '{}'))
        let version = package.version || '1.0.0'

        let { exp, limit, level, role } = global.db.data.users[m.sender] || {}
        let name = `@${m.sender.split`@`[0]}`
        let teks = args[0] || ''
        
        let d = new Date(new Date + 3600000)
        let locale = 'id'
        let date = d.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        
        let time = d.toLocaleTimeString(locale, {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        })

        let _uptime = process.uptime() * 1000
        let uptime = clockString(_uptime)
        
        let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
            return {
                help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
                tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
                prefix: 'customPrefix' in plugin,
                limit: plugin.limit,
                premium: plugin.premium,
                enabled: !plugin.disabled,
            }
        })

        // ==========================================
        // JIKA KETIK ".menu" (LIST UTAMA + TOMBOL LINK)
        // ==========================================
        if (!teks) {
            let replace = { '%': '%', p: _p, uptime, name, date, time, version }
            let textData = defaultMenu.before.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])

            let sections = [{
                title: "Daftar Kategori Menu",
                rows: []
            }];

            for (let tag of arrayMenu) {
                if (tag && allTags[tag]) {
                    sections[0].rows.push({
                        title: allTags[tag],
                        description: `Menampilkan daftar command ${allTags[tag]}`,
                        id: `${_p}menu ${tag}` // Diubah menjadi 'id' untuk Native Flow
                    });
                }
            }

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: {
                            body: { text: textData },
                            footer: { text: "© HARPS BOT MD" },
                            header: { hasMediaAttachment: false },
                            contextInfo: {
                                mentionedJid: [m.sender] // Agar tag nama/mention bekerja
                            },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: "PILIH MENU DISINI ⎙",
                                            sections: sections
                                        })
                                    },
                                    {
                                        name: "cta_url",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "📄 Channel",
                                            url: global.channel || "https://whatsapp.com/channel/0029Vaeovqk1noyyUalf9z16"
                                        })
                                    }
                                ]
                            }
                        }
                    }
                }
            }, { quoted: m })

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
            return
        }

        // ==========================================
        // JIKA BUKA SUB-MENU KATEGORI (MUNCUL BUTTONS + LINK)
        // ==========================================
        if (!allTags[teks]) {
            return m.reply(`Menu "${teks}" tidak tersedia.\nSilakan ketik ${_p}menu untuk melihat daftar menu.`)
        }

        let menuCategory = defaultMenu.before + '\n\n'
        
        if (teks === 'all') {
            for (let tag of arrayMenu) {
                if (tag !== 'all' && allTags[tag]) {
                    menuCategory += defaultMenu.header.replace(/%category/g, allTags[tag]) + '\n'
                    let categoryCommands = help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help)
                    for (let menu of categoryCommands) {
                        for (let help of menu.help) {
                            menuCategory += defaultMenu.body
                                .replace(/%cmd/g, menu.prefix ? help : _p + help)
                                .replace(/%islimit/g, menu.limit ? '(Ⓛ)' : '')
                                .replace(/%isPremium/g, menu.premium ? '(Ⓟ)' : '') + '\n'
                        }
                    }
                    menuCategory += defaultMenu.footer + '\n'
                }
            }
        } else {
            menuCategory += defaultMenu.header.replace(/%category/g, allTags[teks]) + '\n'
            let categoryCommands = help.filter(menu => menu.tags && menu.tags.includes(teks) && menu.help)
            for (let menu of categoryCommands) {
                for (let help of menu.help) {
                    menuCategory += defaultMenu.body
                        .replace(/%cmd/g, menu.prefix ? help : _p + help)
                        .replace(/%islimit/g, menu.limit ? '(Ⓛ)' : '')
                        .replace(/%isPremium/g, menu.premium ? '(Ⓟ)' : '') + '\n'
                }
            }
            menuCategory += defaultMenu.footer + '\n'
        }

        menuCategory += '\n' + defaultMenu.after
        
        let replace = { '%': '%', p: _p, uptime, name, date, time, version }
        let textCategory = menuCategory.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: { text: textCategory },
                        footer: { text: "© HARPS BOT MD" },
                        header: { hasMediaAttachment: false },
                        contextInfo: {
                            mentionedJid: [m.sender] // Agar tag nama/mention bekerja
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "Kembali Ke Menu 🔙",
                                        id: `${_p}menu`
                                    })
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "📄 Channel",
                                        url: global.channel || "https://whatsapp.com/channel/0029Vaeovqk1noyyUalf9z16"
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        }, { quoted: m })

        // Mengirim pesan menggunakan relayMessage untuk Native Flow
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

    } catch (e) {
        conn.reply(m.chat, 'Maaf, menu sedang error', m)
        console.error(e)
    }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help)$/i
handler.exp = 3

module.exports = handler

function clockString(ms) {
    if (isNaN(ms)) return '--'
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
