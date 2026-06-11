const fetch = require('node-fetch');
const yts = require('yt-search');
const { prepareWAMessageMedia, generateWAMessageFromContent } = require('@adiwajshing/baileys');

// =========================================================================
// HELPER: Mengirim Gambar + Tombol Biasa (Anti-Blokir WA)
// =========================================================================
async function sendButtonWithImage(conn, jid, imageUrl, caption, buttons, quoted) {
    let media = await conn.getFile(imageUrl);
    let mediaMsg = await prepareWAMessageMedia({ image: media.data }, { upload: conn.waUploadToServer });

    let dynamicButtons = buttons.map(btn => ({
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({ display_text: btn.text, id: btn.id })
    }));

    let msg = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
            message: {
                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                interactiveMessage: {
                    body: { text: caption },
                    footer: { text: "🍟 Pinterest Downloader" },
                    header: { hasMediaAttachment: true, imageMessage: mediaMsg.imageMessage },
                    nativeFlowMessage: { buttons: dynamicButtons }
                }
            }
        }
    }, { quoted: quoted, userJid: conn.user?.id || conn.user?.jid });

    await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
}

// =========================================================================
// HELPER: Mengirim Gambar + List Menu (Anti-Blokir WA)
// =========================================================================
async function sendListWithImage(conn, jid, imageUrl, caption, listTitle, sections, quoted) {
    let media = await conn.getFile(imageUrl);
    let mediaMsg = await prepareWAMessageMedia({ image: media.data }, { upload: conn.waUploadToServer });

    let msg = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
            message: {
                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                interactiveMessage: {
                    body: { text: caption },
                    footer: { text: "🎵 Spotify Downloader" },
                    header: { hasMediaAttachment: true, imageMessage: mediaMsg.imageMessage },
                    nativeFlowMessage: {
                        buttons: [{
                            name: "single_select",
                            buttonParamsJson: JSON.stringify({ title: listTitle, sections: sections })
                        }]
                    }
                }
            }
        }
    }, { quoted: quoted, userJid: conn.user?.id || conn.user?.jid });

    await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
}

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  switch (command) {

    // ================== PINTEREST ==================
    case 'pinterest': {
      if (!text) throw `*🚩 Example Pencarian:* ${usedPrefix}${command} Zhao Lusi\n*🚩 Example Download:* ${usedPrefix}${command} https://id.pinterest.com/pin/1234567890/`;
      
      if (text.match(/pin(?:terest)?(?:\.it|\.com)/i)) {
        m.reply(wait);
        try {
          let response = await fetch(`https://api.botcahx.eu.org/api/download/pinterest?url=${args[0]}&apikey=${global.btc || btc}`);
          let json = await response.json();
          
          if (json.status && json.result) {
            let mediaUrl = json.result.url || json.result.result || json.result;
            await conn.sendFile(m.chat, mediaUrl, 'pinterest.jpg', '🍟 *Pinterest Downloader*', m);
          } else {
            throw 'Gagal mengambil data dari URL Pinterest.';
          }
        } catch (e) {
          throw `🚩 ${eror}`;
        }
      } 
      else {
        m.reply(wait);
        try {
          let response = await fetch(`https://api.botcahx.eu.org/api/search/pinterest?text1=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
          let data = await response.json();   
          
          if (!data.result || data.result.length === 0) throw 'Gambar tidak ditemukan.';

          let images = data.result.slice(0, 8); 
          
          // Simpan sesi pencarian di memori bot
          conn.pinterestSearch = conn.pinterestSearch || {};
          conn.pinterestSearch[m.sender] = {
            query: text,
            urls: images,
            currentIndex: 0
          };

          let firstImage = images[0];
          let captionText = `🍟 *Pinterest Search:* ${text}\n📷 *Foto:* 1/${images.length}`;

          // MENGIRIM GAMBAR & TOMBOL SEKALIGUS DALAM 1 PESAN!
          await sendButtonWithImage(
              conn, 
              m.chat, 
              firstImage, 
              captionText, 
              [{ text: "➡️ Next Foto", id: "next" }], 
              m
          );
          
        } catch (e) {
          throw eror;
        }
      }
      break;
    }

    // ================== SPOTIFY ==================
    case 'spotify': {
      if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} payung teduh`;
      
      // Jika Link Langsung
      if (args[0].match(/https:\/\/open\.spotify\.com/i)) {
        m.reply(wait);
        try {
          const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${args[0]}&apikey=${global.btc || btc}`);
          let jsons = await res.json();
          const { title, duration, url } = jsons.result.data;
          const { id, type } = jsons.result.data.artist;
          
          let captionvid = ` ∘ Title: ${title}\n∘ Id: ${id}\n∘ Duration: ${duration}\n∘ Type: ${type}`;
          await conn.reply(m.chat, captionvid, m);
          await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
        } catch (e) {
          throw `🚩 ${eror}`;
        }
      } 
      // Jika Mencari Judul Lagu
      else { 
        m.reply(wait);
        const query = args.join(" ");
        try {
          const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${global.btc || btc}`);
          let json = await api.json();
          let res = json.result.data.slice(0, 5); 
          
          // Struktur Menu List
          let sections = [{
            title: `Hasil Pencarian Spotify`,
            rows: res.map((v) => ({
              title: v.title.slice(0, 24), // Potong judul agak pendek agar tak error di WA
              description: `Durasi: ${v.duration} | Populer: ${v.popularity}`,
              id: `dl-spotify|${v.url}` 
            }))
          }];

          // MENGIRIM DUMMY GAMBAR SPOTIFY BERSAMAAN DENGAN LIST MENU
          let spotifyThumb = 'https://i.ibb.co/GFVf3h3/spotify.png';
          let caption = `🎵 *Hasil Pencarian: ${query}*\n\nSilakan klik tombol di bawah untuk memilih lagu.`;
          
          await sendListWithImage(conn, m.chat, spotifyThumb, caption, 'Pilih Lagu', sections, m);

        } catch (e) {
          throw `🚩 ${eror}`;
        }
      }
      break;
    }

    // ================== YOUTUBE AUDIO (MP3) ==================
    case 'ytmp3':
    case 'yta': {
      if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
      m.reply(wait);
      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp3) {
          await conn.sendMessage(m.chat, { 
            audio: { url: result.result.mp3 }, 
            mimetype: 'audio/mpeg' 
          }, { quoted: m });
        } else {
          throw 'Error: Unable to fetch audio';
        }
      } catch (error) {
        throw eror;
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
        let videos = results.videos; 
        
        if (!videos || videos.length === 0) throw 'Video tidak ditemukan.';

        let topVideo = videos.reduce((max, video) => video.views > max.views ? video : max, videos[0]);

        let infoTeks = `🔥 *Video Terpopuler Ditemukan!*\n\n` +
                       `📌 *Judul:* ${topVideo.title}\n` +
                       `👁️ *Views:* ${topVideo.views.toLocaleString()}x ditonton\n` +
                       `⏱️ *Durasi:* ${topVideo.timestamp}\n` +
                       `🔗 *Link:* ${topVideo.url}\n\n` +
                       `⏳ _Sedang mengunduh video, mohon tunggu..._`;
        
        await conn.reply(m.chat, infoTeks, m);

        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(topVideo.url)}&apikey=${global.btc || btc}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp4) {
          await conn.sendMessage(m.chat, { 
            video: { url: result.result.mp4 }, 
            mimetype: 'video/mp4',
            caption: `🍟 *YT Search Downloader*\n🎬 ${topVideo.title}`
          }, { quoted: m });
        } else {
          throw 'Gagal mengunduh file media dari server API.';
        }
      } catch (e) {
        throw eror;
      }
      break;
    }

    // ================== YOUTUBE VIDEO (MP4) ==================
    case 'ytmp4':
    case 'ytv': {
      if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
      m.reply(wait);
      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp4) {
          await conn.sendMessage(m.chat, { 
            video: { url: result.result.mp4 }, 
            mimetype: 'video/mp4' 
          }, { quoted: m });
        } else {
          throw 'Error: Unable to fetch video';
        }
      } catch (error) {
        throw eror;
      }
      break;
    }

  }
};

// ================== LISTENER (TANGKAP RESPONSE TOMBOL) ==================
handler.before = async (m, { conn }) => {
  if (m.isBaileys) return;
  
  let teks = m.text || '';

  // Menangkap ID Tombol dari WhatsApp terbaru
  if (m.msg && m.msg.nativeFlowResponseMessage) {
    try {
      let params = JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson);
      if (params && params.id) teks = params.id;
    } catch (e) {}
  }

  teks = teks.toLowerCase();
  if (!teks) return;

  // --- LISTENER PINTEREST ("next") ---
  conn.pinterestSearch = conn.pinterestSearch || {};
  if (teks === 'next' && conn.pinterestSearch[m.sender]) {
    let pinData = conn.pinterestSearch[m.sender];
    pinData.currentIndex += 1;

    if (pinData.currentIndex >= pinData.urls.length) {
      m.reply('✅ *Sudah mencapai foto terakhir dari pencarian ini.*');
      delete conn.pinterestSearch[m.sender]; 
      return true;
    }

    let nextImageUrl = pinData.urls[pinData.currentIndex];
    let isLast = pinData.currentIndex === pinData.urls.length - 1;
    let captionText = `🍟 *Pinterest Search:* ${pinData.query}\n📷 *Foto:* ${pinData.currentIndex + 1}/${pinData.urls.length}`;

    // Jika Belum Habis, Munculkan Tombol + Gambar Lagi
    if (!isLast) {
      await sendButtonWithImage(
          conn, 
          m.chat, 
          nextImageUrl, 
          captionText, 
          [{ text: "➡️ Next Foto", id: "next" }], 
          m
      );
    } else {
      // Jika Habis, kirim gambar biasa tanpa tombol
      captionText += `\n\n✅ _Ini adalah foto terakhir dari pencarian._`;
      await conn.sendMessage(m.chat, { image: { url: nextImageUrl }, caption: captionText }, { quoted: m });
      delete conn.pinterestSearch[m.sender];
    }
    return true;
  }

  // --- LISTENER SPOTIFY ---
  if (teks.startsWith('dl-spotify|')) {
    let url = teks.split('|')[1];
    m.reply('⏳ *Mendownload lagu, harap tunggu...*');
    
    try {
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${url}&apikey=${global.btc || btc}`);
      let jsons = await res.json();
      const { title, url: audioUrl } = jsons.result.data;
      
      await conn.sendMessage(m.chat, { 
        audio: { url: audioUrl }, 
        mimetype: 'audio/mpeg' 
      }, { quoted: m });
      
    } catch (e) {
       m.reply('❌ Gagal mendownload lagu. API sedang bermasalah.');
    }
    return true; 
  }
};

// ================== KONFIGURASI PLUGIN ==================
handler.help = [
  'pinterest <keyword/url>', 
  'spotify <query/url>', 
  'ytmp3 <url>', 
  'ytmp4 <url>', 
  'yts <query>'
];
handler.tags = ['downloader', 'internet', 'tools'];
handler.command = /^(pinterest|spotify|ytmp3|yta|yts(earch)?|ytmp4|ytv)$/i;

handler.limit = true;
handler.exp = 0;
handler.premium = false;

module.exports = handler;
