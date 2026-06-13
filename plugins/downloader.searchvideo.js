const fetch = require('node-fetch');
const yts = require('yt-search');
const { prepareWAMessageMedia, generateWAMessageFromContent } = require('@adiwajshing/baileys');

const wait = '⏳ _Sedang memproses permintaan Anda..._';
const eror = '❌ _Gagal mengambil data, silakan coba lagi nanti._';

// =========================================================================
// PINTEREST: Mengirim Gambar + Tombol
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
                        nativeFlowMessage: { buttons: dynamicButtons }
                    }
                }
            }
        };

        let msg = generateWAMessageFromContent(jid, messageContent, { quoted, userJid: conn.user?.id || conn.user?.jid });
        await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    } catch (e) {
        console.error("Gagal Native Flow Image:", e.message);
        await conn.sendMessage(jid, { 
            image: { url: imageUrl }, 
            caption: caption + '\n\n💡 _Ketik *next* untuk melihat foto selanjutnya._' 
        }, { quoted });
    }
}

// =========================================================================
// GLOBAL: Mengirim Teks + Tombol SAJA (Tanpa Media agar tidak error)
// =========================================================================
async function sendButtonText(conn, jid, text, footer, buttons, quoted) {
    try {
        let dynamicButtons = buttons.map(btn => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({ display_text: btn.text, id: btn.id })
        }));

        let messageContent = {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        body: { text: text },
                        footer: { text: footer },
                        nativeFlowMessage: { buttons: dynamicButtons }
                    }
                }
            }
        };

        let msg = generateWAMessageFromContent(jid, messageContent, { quoted, userJid: conn.user?.id || conn.user?.jid });
        await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    } catch (e) {
        console.error("Gagal Button Text:", e.message);
        let fallbackText = text + '\n\n💡 _Balas pesan ini dengan mengetik ID tombol jika tombol tidak muncul._';
        await conn.sendMessage(jid, { text: fallbackText }, { quoted });
    }
}

// =========================================================================
// Helper: Fungsi Menampilkan Info YTS Saat Ini
// =========================================================================
async function showYts(conn, m, jid) {
    let ytData = conn.ytsSearch[jid];
    if (!ytData) return;

    let videoData = ytData.videos[ytData.currentIndex];
    let total = ytData.videos.length;
    let index = ytData.currentIndex;

    let caption = `🍟 *YouTube Search*\n\n`;
    caption += `📌 *Judul:* ${videoData.title}\n`;
    caption += `👤 *Channel:* ${videoData.author.name}\n`;
    caption += `👁️ *Views:* ${videoData.views.toLocaleString()}x\n`;
    caption += `⏱️ *Durasi:* ${videoData.timestamp}\n`;
    caption += `🎬 *Pencarian ke:* ${index + 1} dari ${total}\n\n`;
    caption += `💡 _Pilih *DOWNLOAD* untuk mengunduh video ini, atau *NEXT VIDEO* untuk melihat hasil berikutnya._`;

    let buttons = [
        { text: "⬇️ DOWNLOAD", id: "dl-yts" }
    ];

    // Jika belum video terakhir, tambahkan tombol Next
    if (index < total - 1) {
        buttons.push({ text: "➡️ NEXT VIDEO", id: "nextvid" });
    }

    await sendButtonText(conn, jid, caption, "🍟 YouTube Downloader", buttons, m);
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

          let images = data.result.slice(0, 8); 
          
          conn.pinterestSearch = conn.pinterestSearch || {};
          if (conn.pinterestSearch[m.sender]?.timeout) clearTimeout(conn.pinterestSearch[m.sender].timeout);

          conn.pinterestSearch[m.sender] = {
            query: text,
            urls: images,
            currentIndex: 0,
            timeout: setTimeout(() => {
                if (conn.pinterestSearch[m.sender]) delete conn.pinterestSearch[m.sender];
            }, 300000) // Timeout 5 Menit
          };

          let firstImage = images[0];
          let captionText = `🍟 *Pinterest Search:* ${text}\n📷 *Foto:* 1/${images.length}`;

          await sendButtonWithImage(conn, m.chat, firstImage, captionText, [{ text: "➡️ Next Foto", id: "next" }], m);
          
        } catch (e) {
          m.reply(`❌ Gagal mengambil data: ${e.message}`);
        }
      }
      break;
    }

    // ================== YOUTUBE SEARCH ==================
    case 'yts':
    case 'ytsearch': {
      if (!text) throw 'Cari apa?';
      m.reply('🔍 _Mencari video, mohon tunggu sebentar..._');
      try {
        let results = await yts(text);
        let videos = results.videos; 
        
        if (!videos || videos.length === 0) return m.reply('❌ Video tidak ditemukan.');

        let topVideos = videos.slice(0, 5); // Ambil 5 video teratas

        conn.ytsSearch = conn.ytsSearch || {};
        if (conn.ytsSearch[m.sender]?.timeout) clearTimeout(conn.ytsSearch[m.sender].timeout);

        conn.ytsSearch[m.sender] = {
            query: text,
            videos: topVideos,
            currentIndex: 0,
            timeout: setTimeout(() => {
                if (conn.ytsSearch[m.sender]) delete conn.ytsSearch[m.sender];
            }, 300000) // Timeout 5 Menit
        };

        // Langsung panggil fungsi showYts untuk menampilkan text pertama kali
        await showYts(conn, m, m.sender);

      } catch (e) {
        m.reply(eror);
      }
      break;
    }

    // ================== SPOTIFY (LANGSUNG KIRIM LAGU) ==================
    case 'spotify': {
      if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} payung teduh`;
      
      if (args[0].match(/https:\/\/open\.spotify\.com/i)) {
        m.reply(wait);
        try {
          const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${args[0]}&apikey=${apiKey}`);
          let jsons = await res.json();
          const { title, duration, url } = jsons.result.data;
          
          await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
        } catch (e) {
          m.reply(eror);
        }
      } 
      else { 
        m.reply('🔍 _Mencari lagu di Spotify..._');
        const query = args.join(" ");
        try {
          // Cari lagu
          const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${apiKey}`);
          let json = await api.json();
          
          if (!json.status || !json.result.data || json.result.data.length === 0) return m.reply('❌ Lagu tidak ditemukan.');

          // Ambil hasil PERTAMA
          let firstSong = json.result.data[0];
          m.reply(`⏳ *Mendownload:* ${firstSong.title}...`);

          // Download lagu
          const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${firstSong.url}&apikey=${apiKey}`);
          let jsons = await res.json();
          const { url: audioUrl } = jsons.result.data;

          // Langsung kirim audio
          await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mpeg' }, { quoted: m });

        } catch (e) {
          m.reply(`❌ Gagal mengambil lagu dari Spotify.`);
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
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${apiKey}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp3) {
          await conn.sendMessage(m.chat, { audio: { url: result.result.mp3 }, mimetype: 'audio/mpeg' }, { quoted: m });
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
          await conn.sendMessage(m.chat, { video: { url: result.result.mp4 }, mimetype: 'video/mp4' }, { quoted: m });
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

  if (m.msg && m.msg.nativeFlowResponseMessage) {
    try {
      let params = JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson);
      if (params && params.id) teks = params.id;
    } catch (e) {}
  }

  teks = teks.toLowerCase();
  if (!teks) return;

  const apiKey = global.btc || global.APIKey || global.apikey || global.api_key || '';

  // --- LISTENER PINTEREST ---
  conn.pinterestSearch = conn.pinterestSearch || {};
  if (teks === 'next' && conn.pinterestSearch[m.sender]) {
    let pinData = conn.pinterestSearch[m.sender];
    
    clearTimeout(pinData.timeout); // Hapus waktu lama
    pinData.currentIndex += 1;

    if (pinData.currentIndex >= pinData.urls.length) {
      m.reply('✅ *Sudah mencapai foto terakhir dari pencarian ini.*');
      delete conn.pinterestSearch[m.sender]; 
      return true;
    }

    let nextImageUrl = pinData.urls[pinData.currentIndex];
    let isLast = pinData.currentIndex === pinData.urls.length - 1;
    let captionText = `🍟 *Pinterest Search:* ${pinData.query}\n📷 *Foto:* ${pinData.currentIndex + 1}/${pinData.urls.length}`;

    if (!isLast) {
      pinData.timeout = setTimeout(() => { // Reset 5 menit
          if (conn.pinterestSearch[m.sender]) delete conn.pinterestSearch[m.sender];
      }, 300000);
      
      await sendButtonWithImage(conn, m.chat, nextImageUrl, captionText, [{ text: "➡️ Next Foto", id: "next" }], m);
    } else {
      captionText += `\n\n✅ _Ini adalah foto terakhir._`;
      await conn.sendMessage(m.chat, { image: { url: nextImageUrl }, caption: captionText }, { quoted: m });
      delete conn.pinterestSearch[m.sender];
    }
    return true;
  }

  // --- LISTENER YTS (TOMBOL NEXT VIDEO) ---
  conn.ytsSearch = conn.ytsSearch || {};
  if (teks === 'nextvid' && conn.ytsSearch[m.sender]) {
    let ytData = conn.ytsSearch[m.sender];
    
    clearTimeout(ytData.timeout); // Hapus waktu lama
    ytData.currentIndex += 1;

    if (ytData.currentIndex >= ytData.videos.length) {
      m.reply('✅ *Sudah mencapai video terakhir.*');
      delete conn.ytsSearch[m.sender]; 
      return true;
    }

    // Reset 5 Menit dan Tampilkan Video Berikutnya
    ytData.timeout = setTimeout(() => { 
        if (conn.ytsSearch[m.sender]) delete conn.ytsSearch[m.sender];
    }, 300000);

    await showYts(conn, m, m.sender);
    return true;
  }

  // --- LISTENER YTS (TOMBOL DOWNLOAD) ---
  if (teks === 'dl-yts' && conn.ytsSearch[m.sender]) {
    let ytData = conn.ytsSearch[m.sender];
    let videoData = ytData.videos[ytData.currentIndex];

    // Reset timeout agar sesi tidak mati saat mendownload
    clearTimeout(ytData.timeout);
    ytData.timeout = setTimeout(() => { 
        if (conn.ytsSearch[m.sender]) delete conn.ytsSearch[m.sender];
    }, 300000);

    m.reply(`⏳ _Sedang mengunduh video: *${videoData.title}*, mohon tunggu..._`);
    
    try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(videoData.url)}&apikey=${apiKey}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp4) {
            await conn.sendMessage(m.chat, { 
                video: { url: result.result.mp4 }, 
                caption: `✅ *Berhasil diunduh:* ${videoData.title}` 
            }, { quoted: m });
        } else {
            m.reply('❌ Gagal mengunduh video dari API server.');
        }
    } catch (e) {
        m.reply('❌ Terjadi kesalahan saat memproses unduhan.');
    }
    return true;
  }

};

handler.help = ['pinterest', 'spotify', 'ytmp3', 'ytmp4', 'yts'];
handler.tags = ['downloader'];
handler.command = /^(pinterest|spotify|ytmp3|yta|yts(earch)?|ytmp4|ytv)$/i;

handler.limit = true;
module.exports = handler;
