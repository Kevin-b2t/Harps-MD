const fetch = require("node-fetch");

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} https://open.spotify.com/track/...\n${usedPrefix + command} payung teduh`;
  
  m.reply(wait);
  
  try {
    let targetUrl = '';

    // 1. Cek apakah input berupa link Spotify
    if (args[0].match(/https:\/\/open\.spotify\.com/i)) {
      targetUrl = args[0];
    } else {
      // 2. Jika input berupa teks (judul lagu), lakukan pencarian
      const text = args.join(" ");
      const searchApi = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(text)}&apikey=${btc}`);
      let searchJson = await searchApi.json();
      let searchRes = searchJson.result?.data;
      
      // Jika hasil pencarian kosong, hentikan proses
      if (!searchRes || searchRes.length === 0) throw `🚩 Lagu tidak ditemukan!`;
      
      // Ambil URL dari hasil pencarian pertama
      targetUrl = searchRes[0].url; 
    }

    // 3. Proses eksekusi download menggunakan targetUrl (berlaku untuk link langsung maupun hasil pencarian)
    const dlRes = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${targetUrl}&apikey=${btc}`);
    let dlJson = await dlRes.json();
    
    if (!dlJson.result || !dlJson.result.data) throw `🚩 Gagal mengambil data lagu dari API.`;
    
    const { thumbnail, title, artist, duration, url } = dlJson.result.data;
    
    let captionvid = ` ∘ *Title:* ${title}\n∘ *Artist:* ${artist}\n∘ *Duration:* ${duration}\n`;
    
    // Kirim gambar thumbnail beserta detail
    await conn.sendFile(m.chat, thumbnail, "thumb.png", captionvid, m);
    // Kirim file audionya
    await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
    
  } catch (e) {
    console.error(e);
    throw `🚩 ${eror}`; // Pastikan variabel 'eror' dan 'wait' sudah ada di handler/global bot kamu
  }
};

handler.help = ['spotify'];
handler.command = /^(spotify)$/i;
handler.tags = ['downloader'];
handler.limit = true;
module.exports = handler;
