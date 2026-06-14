const fetch = require("node-fetch");

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} https://open.spotify.com/track/12345...\n${usedPrefix + command} separuh aku`;
  
  // Pastikan variabel wait sudah ada di global, jika tidak gunakan teks manual
  m.reply(typeof wait !== 'undefined' ? wait : 'Tunggu sedang di proses...');
  
  let targetUrl = '';

  // 1. Cek apakah input berupa link Spotify
  if (args[0].match(/https:\/\/(open\.spotify\.com)/i)) {
    targetUrl = args[0];
  } else {
    // 2. Jika berupa judul/pencarian, cari lagu dulu
    const text = args.join(" ");
    try {
      // WAJIB menggunakan encodeURIComponent agar spasi menjadi %20 dan URL tidak rusak
      const searchApi = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(text)}&apikey=${btc}`);
      let searchJson = await searchApi.json();
      
      // Validasi struktur JSON dari API
      if (!searchJson.status || !searchJson.result || !searchJson.result.data || searchJson.result.data.length === 0) {
          throw 'Lagu tidak ditemukan di pencarian!';
      }
      // Ambil URL hasil pencarian teratas
      targetUrl = searchJson.result.data[0].url; 
      
    } catch (e) {
      console.error('[Spotify Search Error]', e); // Log error di terminal console-mu
      throw `🚩 Pencarian gagal: ${e.message || 'API error'}`;
    }
  }

  // 3. Proses Download menggunakan targetUrl
  try {
    // WAJIB encode URL target sebelum dimasukkan ke parameter fetch
    const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${encodeURIComponent(targetUrl)}&apikey=${btc}`);
    let jsons = await res.json();
    
    // Validasi struktur JSON dari API download
    if (!jsons.status || !jsons.result || !jsons.result.data) {
        throw 'Gagal mengambil data lagu dari server download!';
    }
    
    const {
      thumbnail,
      title,
      artist,
      duration,
      url // Link langsung ke file audio mp3
    } = jsons.result.data;
    
    let captionvid = `*Spotify Downloader*\n\n∘ *Title:* ${title}\n∘ *Artist:* ${artist}\n∘ *Duration:* ${duration}\n∘ *Source:* ${targetUrl}`;
    
    // Kirim cover lagu beserta info
    await conn.sendFile(m.chat, thumbnail, "thumb.png", captionvid, m);
    // Kirim lagu (audio)
    await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
    
  } catch (e) {
    console.error('[Spotify Download Error]', e); // Log error di terminal console-mu
    throw `🚩 ${typeof eror !== 'undefined' ? eror : 'Gagal memproses lagu.'}\nDetail: ${e.message || 'Server Error'}`;
  }
};

handler.help = ['spotify'];
handler.command = /^(spotify)$/i;
handler.tags = ['downloader'];
handler.limit = true;
module.exports = handler;
