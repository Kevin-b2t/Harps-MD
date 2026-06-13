const fetch = require('node-fetch');
const yts = require('yt-search');
const { prepareWAMessageMedia, generateWAMessageFromContent } = require('lily-baileys');

const wait = '⏳ _Sedang memproses permintaan Anda..._';
const eror = '❌ _Gagal mengambil data, silakan coba lagi nanti._';

// =========================================================================
// HELPER: Manajemen Sesi (5 Menit Timeout)
// =========================================================================
function startSession(conn, sender, type, query, results) {
    conn.searchSessions = conn.searchSessions || {};
    
    if (conn.searchSessions[sender]?.timeout) {
        clearTimeout(conn.searchSessions[sender].timeout);
    }
    
    conn.searchSessions[sender] = {
        type: type,
        query: query,
        results: results,
        currentIndex: 0,
        timeout: setTimeout(() => {
            if (conn.searchSessions[sender]) {
                delete conn.searchSessions[sender];
            }
        }, 5 * 60 * 1000)
    };
    
    return conn.searchSessions[sender];
}

// =========================================================================
// RAW PAYLOAD: Mengirim Item Tunggal + Tombol Next (Tanpa Forward Info)
// =========================================================================
async function sendInteractiveItem(conn, jid, sessionData, quoted) {
    try {
        let { type, query, results, currentIndex } = sessionData;
        let item = results[currentIndex];
        let isLast = currentIndex >= results.length - 1;

        let imageUrl, caption, buttons;

        // --- Susun Konten Berdasarkan Tipe ---
        if (type === 'pinterest') {
            imageUrl = item; 
            caption = `🍟 *Pinterest Search:* ${query}\n📷 *Foto:* ${currentIndex + 1}/${results.length}`;
            buttons = isLast ? [] : [{ text: "➡️ Next Foto", id: "next_item" }];
        } 
        else if (type === 'spotify') {
            imageUrl = 'https://i.ibb.co/GFVf3h3/spotify.png'; 
            caption = `🎵 *Spotify Search:* ${query}\n📌 *Judul:* ${item.title}\n⏱️ *Durasi:* ${item.duration}\n📈 *Populer:* ${item.popularity}\n🎧 *Lagu:* ${currentIndex + 1}/${results.length}`;
            buttons = [{ text: "⬇️ Download Audio", id: `dl-spotify|${item.url}` }];
            if (!isLast) buttons.push({ text: "➡️ Next Lagu", id: "next_item" });
        } 
        else if (type === 'yts') {
            imageUrl = item.thumbnail;
            caption = `📺 *YouTube Search:* ${query}\n📌 *Judul:* ${item.title}\n👁️ *Views:* ${item.views.toLocaleString()}\n👤 *Oleh:* ${item.author.name}\n⏱️ *Durasi:* ${item.timestamp}\n🎬 *Video:* ${currentIndex + 1}/${results.length}`;
            buttons = [{ text: "⬇️ Download Video", id: `dl-ytv|${item.url}` }];
            if (!isLast) buttons.push({ text: "➡️ Next Video", id: "next_item" });
        }

        // --- Konversi ke Format Native Flow ---
        let dynamicButtons = buttons.map(btn => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({ display_text: btn.text, id: btn.id })
        }));

        let media = await conn.getFile(imageUrl);
        let mediaMsg = await prepareWAMessageMedia({ image: media.data }, { upload: conn.waUploadToServer });

        let messageContent = {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        header: { hasMediaAttachment: true, imageMessage: mediaMsg.imageMessage },
                        body: { text: caption },
                        footer: { text: `⏳ Sesi berlaku 5 menit • Item ${currentIndex + 1}/${results.length}` },
                        contextInfo: {
                            // Forward dihapus karena sudah di-handle oleh simple.js secara global
                            participant: quoted.sender,
                            quotedMessage: quoted.message || {}
                        },
                        nativeFlowMessage: { buttons: dynamicButtons }
                    }
                }
            }
        };

        let msg = generateWAMessageFromContent(jid, messageContent, { quoted, userJid: conn.user?.id || conn.user?.jid });
        await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });

    } catch (e) {
        console.error("Gagal Native Send Item:", e.message);
        await conn.sendMessage(jid, { text: `❌ _Gagal memuat item ke-${sessionData.currentIndex + 1}._` }, { quoted });
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

          let images = data.result.slice(0, 10); 
          let session = startSession(conn, m.sender, 'pinterest', text, images);
          
          await sendInteractiveItem(conn, m.chat, session, m);
        } catch (e) {
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
          let res = json.result.data.slice(0, 5); 

          conn.spotifySearch = conn.spotifySearch || {};
          conn.spotifySearch[m.sender] = res;
          
          let sections = [{
            title: `Hasil Pencarian Spotify`,
            rows: res.map((v) => ({
              title: v.title.slice(0, 24), 
              description: `Durasi: ${v.duration} | Populer: ${v.popularity}`,
              id: `dl-spotify|${v.url}` 
            }))
          }];

          let spotifyThumb = 'https://i.ibb.co/GFVf3h3/spotify.png';
          let caption = `🎵 *Hasil Pencarian: ${query}*\n\nSilakan klik tombol di bawah untuk memilih lagu.`;
          
          await sendListWithImage(conn, m.chat, spotifyThumb, caption, '🎶 Pilih Lagu', sections, m);

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
        let videos = results.videos.slice(0, 10); 
        if (!videos || videos.length === 0) return m.reply('❌ Video tidak ditemukan.');

        let session = startSession(conn, m.sender, 'yts', text, videos);
        await sendInteractiveItem(conn, m.chat, session, m);
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

  if (!teks) return;
  teks = teks.toLowerCase();
  const apiKey = global.btc || global.APIKey || global.apikey || global.api_key || '';

  // --- LISTENER TOMBOL "NEXT" ---
  if (teks === 'next' || teks === 'next_item') {
    if (!conn.searchSessions || !conn.searchSessions[m.sender]) {
        return m.reply('⏳ _Sesi pencarian Anda sudah habis (melewati 5 menit) atau tidak ditemukan. Silakan cari ulang._');
    }

    let session = conn.searchSessions[m.sender];
    session.currentIndex += 1;

    if (session.currentIndex >= session.results.length) {
        delete conn.searchSessions[m.sender];
        return m.reply('✅ *Sudah mencapai hasil terakhir dari pencarian ini.*');
    }

    clearTimeout(session.timeout);
    session.timeout = setTimeout(() => {
        if (conn.searchSessions[m.sender]) {
            delete conn.searchSessions[m.sender];
        }
    }, 5 * 60 * 1000);

    await sendInteractiveItem(conn, m.chat, session, m);
    return true;
  }

  // --- LISTENER DOWNLOAD SPOTIFY ---
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

  // --- LISTENER DOWNLOAD YTS (VIDEO YOUTUBE) ---
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
