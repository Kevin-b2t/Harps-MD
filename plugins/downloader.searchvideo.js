const fetch = require('node-fetch');
const yts = require('yt-search');
const crypto = require('crypto');

// =========================================================================
// FUNGSI CUSTOM: Mengirim List Button V2 (Anti Server Error / Anti Banned)
// Menggunakan Native Flow Message seperti UI WhatsApp terbaru
// =========================================================================
const sendListInteractive = async (conn, jid, title, text, footer, btnText, sections, quoted) => {
    let contextInfo = {};
    if (quoted) {
        contextInfo = {
            stanzaId: quoted.key.id,
            participant: quoted.sender,
            quotedMessage: quoted.message
        };
    }
    
    const msg = {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2
                },
                interactiveMessage: {
                    contextInfo: contextInfo,
                    body: { text: text },
                    footer: { text: footer },
                    header: { title: title, hasMediaAttachment: false },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: btnText,
                                    sections: sections
                                })
                            }
                        ]
                    }
                }
            }
        }
    };
    
    await conn.relayMessage(jid, msg, { 
        messageId: crypto.randomBytes(16).toString('hex').toUpperCase() 
    });
};

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

          // Ambil maksimal 8 foto
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

          // Kirim Foto Pertama
          await conn.sendMessage(m.chat, { 
            image: { url: firstImage }, 
            caption: captionText 
          }, { quoted: m });

          // Kirim List Button V2
          let sections = [{
            title: 'Aksi Pinterest',
            rows: [{
              title: '➡️ Next Foto',
              description: 'Lihat foto selanjutnya dari pencarian ini',
              id: 'next' // ID ini akan dibaca oleh handler.before
            }]
          }];

          await sendListInteractive(conn, m.chat, '🍟 Pinterest Menu', 'Klik tombol di bawah untuk melihat foto selanjutnya.', 'Pinterest Downloader', 'Pilih Aksi', sections, m);
          
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
              title: v.title,
              description: `Durasi: ${v.duration} | Populer: ${v.popularity}`,
              id: `dl-spotify|${v.url}` // Menyisipkan link di dalam ID Tombol
            }))
          }];

          await sendListInteractive(conn, m.chat, '🎵 Spotify Search', `Hasil Pencarian untuk: *${query}*\n\nSilakan klik tombol di bawah untuk memilih lagu.`, 'Spotify Downloader', 'Daftar Lagu', sections, m);

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

  // Tangkap ID dari tombol Native Flow V2 jika ditekan oleh user
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

    // Kirim Foto Berikutnya
    await conn.sendMessage(m.chat, { 
      image: { url: nextImageUrl }, 
      caption: captionText 
    }, { quoted: m });

    // Jika Belum Habis, Munculkan Tombol List Lagi
    if (!isLast) {
      let sections = [{
        title: 'Aksi Pinterest',
        rows: [{ title: '➡️ Next Foto', description: 'Lihat foto selanjutnya dari pencarian ini', id: 'next' }]
      }];
      await sendListInteractive(conn, m.chat, '🍟 Pinterest Menu', 'Klik tombol di bawah untuk melihat foto selanjutnya.', 'Pinterest Downloader', 'Pilih Aksi', sections, m);
    } else {
      m.reply('✅ _Ini adalah foto terakhir dari pencarian._');
      delete conn.pinterestSearch[m.sender];
    }
    return true;
  }

  // --- LISTENER SPOTIFY ---
  // Menangkap ID Tombol dari Spotify (Format: dl-spotify|link_lagu)
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
