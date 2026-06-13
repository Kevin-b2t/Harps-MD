const fetch = require('node-fetch');
const yts = require('yt-search');
const { prepareWAMessageMedia, generateWAMessageFromContent } = require('@adiwajshing/baileys');
const crypto = require('crypto');

const wait = '⏳ _Sedang memproses permintaan Anda..._';
const eror = '❌ _Gagal mengambil data, silakan coba lagi nanti._';

// =========================================================================
// RAW PAYLOAD: Mengirim Gambar + Tombol Biasa (Masih dipertahankan jika butuh)
// =========================================================================
async function sendButtonWithImage(conn, jid, imageUrl, caption, buttons, quoted) {
    try {
        let media = await conn.getFile(imageUrl);
        let mediaMsg = await prepareWAMessageMedia({ image: media.data }, { upload: conn.waUploadToServer });

        let dynamicButtons = buttons.map(btn => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({ display_text: btn.text, id: btn.id })
        }));

        let messageContent = {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        header: { hasMediaAttachment: true, imageMessage: mediaMsg.imageMessage },
                        body: { text: caption },
                        footer: { text: "🍟 Downloader Center" },
                        contextInfo: {
                            participant: quoted.sender,
                            quotedMessage: quoted.message || {},
                            isForwarded: true,
                            forwardingScore: 999,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363400911374213@newsletter",
                                newsletterName: "🍟 Downloader Center",
                                serverMessageId: 143
                            }
                        },
                        nativeFlowMessage: { buttons: dynamicButtons }
                    }
                }
            }
        };

        let msg = generateWAMessageFromContent(jid, messageContent, { quoted, userJid: conn.user?.id || conn.user?.jid });
        await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    } catch (e) {
        console.error("Gagal Native Flow:", e.message);
        await conn.sendMessage(jid, { 
            image: { url: imageUrl }, 
            caption: caption + '\n\n💡 _Ketik *next* untuk melihat foto selanjutnya._' 
        }, { quoted });
    }
}

// =========================================================================
// RAW PAYLOAD: Mengirim Gambar + List Menu (Native Flow)
// =========================================================================
async function sendListWithImage(conn, jid, imageUrl, caption, footerText, listTitle, sections, quoted) {
    try {
        let media = await conn.getFile(imageUrl);
        let mediaMsg = await prepareWAMessageMedia({ image: media.data }, { upload: conn.waUploadToServer });

        let messageContent = {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        header: { hasMediaAttachment: true, imageMessage: mediaMsg.imageMessage },
                        body: { text: caption },
                        footer: { text: footerText },
                        contextInfo: {
                            participant: quoted.sender,
                            quotedMessage: quoted.message || {},
                            isForwarded: true,
                            forwardingScore: 999,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363400911374213@newsletter",
                                newsletterName: "🍟 Downloader Center",
                                serverMessageId: 143
                            }
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({ title: listTitle, sections: sections })
                            }]
                        }
                    }
                }
            }
        };

        let msg = generateWAMessageFromContent(jid, messageContent, { quoted, userJid: conn.user?.id || conn.user?.jid });
        await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    } catch (e) {
        console.error("Gagal Native List:", e.message);
        await conn.sendMessage(jid, { 
            image: { url: imageUrl }, 
            caption: caption + '\n\n💡 _Sistem list tidak didukung di device Anda._' 
        }, { quoted });
    }
}

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  const apiKey = global.btc || global.APIKey || global.apikey || global.api_key || '';
  
  if (!apiKey) return m.reply('❌ *API Key belum diset!*\nSilakan set `global.btc` di config bot kamu.');

  switch (command) {

    // ================== PINTEREST ==================
    case 'pinterest': {
      if (!text) throw `*🚩 Example Pencarian:* ${usedPrefix}${command} shiroko\n*🚩 Example Download:* ${usedPrefix}${command} https://id.pinterest.com/pin/1234567890/`;
      
      if (text.match(/pin(?:terest)?(?:\.it|\.com)/i)) {
        m.reply(wait);
        try {
          let response = await fetch(`https://api.botcahx.eu.org/api/download/pinterest?url=${args[0]}&apikey=${apiKey}`);
          let json = await response.json();
          
          if (json.status && json.result) {
            let mediaUrl = json.result.url || json.result.result || json.result;
            await conn.sendFile(m.chat, mediaUrl, 'pinterest.jpg', '🍟 *Pinterest Downloader*', m);
          } else {
            m.reply('❌ Gagal mengambil data dari URL Pinterest.');
          }
        } catch (e) {
          m.reply(eror);
        }
      } 
      else {
        m.reply(wait);
        try {
          let response = await fetch(`https://api.botcahx.eu.org/api/search/pinterest?text1=${encodeURIComponent(text)}&apikey=${apiKey}`);
          let data = await response.json();   
          
          if (!data.result || data.result.length === 0) return m.reply('❌ Gambar tidak ditemukan dari API.');

          let images = data.result.slice(0, 10); // Mengambil 10 Pencarian
          
          let sections = [{
            title: `Hasil Pencarian Pinterest`,
            rows: images.map((url, i) => ({
              title: `🖼️ Gambar ke-${i + 1}`,
              description: `Klik untuk melihat & mendownload gambar ini`,
              id: `dl-pinterest|${url}` 
            }))
          }];

          let firstImage = images[0];
          let captionText = `🍟 *Pinterest Search:* ${text}\n\nSilakan pilih salah satu dari 10 gambar di bawah.`;

          await sendListWithImage(
              conn, 
              m.chat, 
              firstImage, 
              captionText, 
              '📌 Pinterest Downloader',
              '🖼️ Pilih Gambar', 
              sections, 
              m
          );
          
        } catch (e) {
          console.error("Pinterest Error:", e);
          m.reply(`❌ Gagal mengambil data: ${e.message}`);
        }
      }
      break;
    }

    // ================== SPOTIFY ==================
    case 'spotify': {
      if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} payung teduh`;
      
      if (args[0].match(/https:\/\/open\.spotify\.com/i)) {
        m.reply(wait);
        try {
          const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${args[0]}&apikey=${apiKey}`);
          let jsons = await res.json();
          const { title, duration, url } = jsons.result.data;
          const { id, type } = jsons.result.data.artist;
          
          let captionvid = ` ∘ Title: ${title}\n∘ Id: ${id}\n∘ Duration: ${duration}\n∘ Type: ${type}`;
          await conn.reply(m.chat, captionvid, m);
          await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
        } catch (e) {
          m.reply(eror);
        }
      } 
      else { 
        m.reply(wait);
        const query = args.join(" ");
        try {
          const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${apiKey}`);
          let json = await api.json();
          let res = json.result.data.slice(0, 10); // Mengambil 10 Pencarian

          let sections = [{
            title: `Hasil Pencarian Spotify`,
            rows: res.map((v) => ({
              title: v.title.slice(0, 24), // Max 24 char agar list native flow tidak error
              description: `Durasi: ${v.duration} | Populer: ${v.popularity}`,
              id: `dl-spotify|${v.url}` 
            }))
          }];

          let spotifyThumb = 'https://i.ibb.co/GFVf3h3/spotify.png';
          let caption = `🎵 *Hasil Pencarian: ${query}*\n\nSilakan klik tombol di bawah untuk memilih 10 lagu teratas.`;
          
          await sendListWithImage(conn, m.chat, spotifyThumb, caption, '🎵 Spotify Downloader', '🎶 Pilih Lagu', sections, m);

        } catch (e) {
          console.error("Spotify Error:", e);
          m.reply(`❌ Gagal mengambil data: ${e.message}`);
        }
      }
      break;
    }

    // ================== YOUTUBE SEARCH ==================
    case 'yts':
    case 'ytsearch': {
      if (!text) throw 'Cari apa?';
      m.reply(wait);
      try {
        let results = await yts(text);
        let videos = results.videos.slice(0, 10); // Mengambil 10 Pencarian
        
        if (!videos || videos.length === 0) return m.reply('❌ Video tidak ditemukan.');

        let sections = [{
            title: `Hasil Pencarian YouTube`,
            rows: videos.map((v) => ({
              title: v.title.slice(0, 24), // Max char judul agar list tidak error
              description: `👁️ Views: ${v.views.toLocaleString()} | 👤 Oleh: ${v.author.name}`,
              id: `dl-ytv|${v.url}` 
            }))
        }];

        let topVideoThumb = videos[0].thumbnail;
        let caption = `🍟 *Hasil Pencarian YouTube: ${text}*\n\nSilakan pilih salah satu video dari 10 hasil pencarian di bawah untuk mendownload (MP4).`;

        await sendListWithImage(conn, m.chat, topVideoThumb, caption, '📺 YouTube Downloader', '🎬 Pilih Video', sections, m);

      } catch (e) {
        m.reply(eror);
      }
      break;
    }

    // ================== YOUTUBE AUDIO (MP3) ==================
    case 'ytmp3':
    case 'yta': {
      if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
      m.reply(wait);
      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${apiKey}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp3) {
          await conn.sendMessage(m.chat, { 
            audio: { url: result.result.mp3 }, 
            mimetype: 'audio/mpeg' 
          }, { quoted: m });
        } else {
          m.reply('❌ Gagal mengunduh audio dari API.');
        }
      } catch (error) {
        m.reply(eror);
      }
      break;
    }

    // ================== YOUTUBE VIDEO (MP4) ==================
    case 'ytmp4':
    case 'ytv': {
      if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
      m.reply(wait);
      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${apiKey}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp4) {
          await conn.sendMessage(m.chat, { 
            video: { url: result.result.mp4 }, 
            mimetype: 'video/mp4' 
          }, { quoted: m });
        } else {
          m.reply('❌ Gagal mengunduh video dari API.');
        }
      } catch (error) {
        m.reply(eror);
      }
      break;
    }

  }
};

// ================== LISTENER (TANGKAP RESPONSE TOMBOL) ==================
handler.before = async (m, { conn }) => {
  if (m.isBaileys) return;
  
  let teks = m.text || '';

  // Tangkap param dari Native Flow
  if (m.msg && m.msg.nativeFlowResponseMessage) {
    try {
      let params = JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson);
      if (params && params.id) teks = params.id;
    } catch (e) {}
  }

  if (!teks) return;
  const apiKey = global.btc || global.APIKey || global.apikey || global.api_key || '';

  // --- LISTENER PINTEREST ---
  if (teks.startsWith('dl-pinterest|')) {
    let url = teks.split('|')[1];
    m.reply('⏳ *Mendownload gambar, harap tunggu...*');
    try {
      await conn.sendMessage(m.chat, { image: { url: url }, caption: '🍟 *Pinterest Downloader*' }, { quoted: m });
    } catch (e) {
      m.reply('❌ Gagal mengirim gambar.');
    }
    return true;
  }

  // --- LISTENER SPOTIFY ---
  if (teks.startsWith('dl-spotify|')) {
    let url = teks.split('|')[1];
    m.reply('⏳ *Mendownload lagu, harap tunggu...*');
    
    try {
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${url}&apikey=${apiKey}`);
      let jsons = await res.json();
      const { title, url: audioUrl } = jsons.result.data;
      
      await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mpeg' }, { quoted: m });
    } catch (e) {
       m.reply('❌ Gagal mendownload lagu. API sedang bermasalah.');
    }
    return true; 
  }

  // --- LISTENER YTS (DOWNLOAD VIDEO YOUTUBE) ---
  if (teks.startsWith('dl-ytv|')) {
    let url = teks.split('|')[1];
    m.reply('⏳ *Mendownload video, harap tunggu...*');
    
    try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(url)}&apikey=${apiKey}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp4) {
          await conn.sendMessage(m.chat, { 
            video: { url: result.result.mp4 }, 
            mimetype: 'video/mp4',
            caption: `🍟 *YT Downloader*`
          }, { quoted: m });
        } else {
          m.reply('❌ Gagal mengunduh video dari server.');
        }
    } catch (e) {
        m.reply('❌ Terjadi kesalahan saat mengunduh.');
    }
    return true;
  }
};

handler.help = ['pinterest', 'spotify', 'ytmp3', 'ytmp4', 'yts'];
handler.tags = ['downloader'];
handler.command = /^(pinterest|spotify|ytmp3|yta|yts(earch)?|ytmp4|ytv)$/i;

handler.limit = true;
module.exports = handler;
