const fetch = require("node-fetch");

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} payung teduh`;
  
  m.reply(typeof wait !== 'undefined' ? wait : '⏳ Sedang diproses...');
  
  let targetUrl = '';

  // 1. CEK INPUT: Link atau Teks Pencarian?
  if (args[0].match(/https:\/\/open\.spotify\.com/i)) {
    targetUrl = args[0]; // Jika link, langsung gunakan
  } else {
    // 2. JIKA JUDUL: Lakukan pencarian persis seperti di downloader.searchvideo.js
    const query = args.join(" ");
    try {
      // Encode wajib untuk teks pencarian agar spasi terbaca API
      const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${global.btc || btc}`);
      let json = await api.json();
      
      if (!json.result || !json.result.data || json.result.data.length === 0) throw 'Lagu tidak ditemukan!';
      
      // Karena kamu minta LANGSUNG DOWNLOAD, kita ambil hasil urutan pertama (index 0)
      targetUrl = json.result.data[0].url; 
    } catch (e) {
      throw `🚩 Pencarian gagal. Lagu tidak ditemukan atau API bermasalah.`;
    }
  }

  // 3. EKSEKUSI DOWNLOAD
  try {
    // Tanpa encodeURIComponent untuk URL, persis seperti downloader.searchvideo.js
    const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${targetUrl}&apikey=${global.btc || btc}`);
    let jsons = await res.json();
    
    // Sesuaikan parameter data dengan API
    const { title, duration, url, thumbnail } = jsons.result.data;
    
    // Cegah error jika objek artist berbeda format
    let artistName = jsons.result.data.artist;
    if (typeof artistName === 'object' && artistName.name) {
      artistName = artistName.name;
    }
    
    let captionvid = `*Spotify Downloader*\n\n∘ *Title:* ${title}\n∘ *Artist:* ${artistName}\n∘ *Duration:* ${duration}\n∘ *Source:* ${targetUrl}`;
    
    // Kirim Thumbnail beserta Caption Info
    if (thumbnail) {
      await conn.sendFile(m.chat, thumbnail, "thumb.png", captionvid, m);
    } else {
      await conn.reply(m.chat, captionvid, m);
    }
    
    // Kirim Audio MP3
    await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
    
  } catch (e) {
    throw `🚩 Gagal mendownload lagu. API sedang bermasalah.`;
  }
};

handler.help = ['spotify'];
handler.command = /^(spotify)$/i;
handler.tags = ['downloader'];
handler.limit = true;
module.exports = handler;
