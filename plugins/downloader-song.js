const fetch = require("node-fetch");

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT\n${usedPrefix + command} separuh aku`;
  
  m.reply(typeof wait !== 'undefined' ? wait : 'Tunggu sedang di proses...');
  
  let targetUrl = '';

  // 1. Cek apakah input berupa link Spotify
  if (args[0].match(/https:\/\/(open\.spotify\.com)/i)) {
    targetUrl = args[0];
  } else {
    // 2. Jika berupa pencarian, cari lagu dulu
    const text = args.join(" ");
    try {
      // Pencarian tetap butuh encodeURIComponent untuk menangani spasi
      const searchApi = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(text)}&apikey=${btc}`);
      let searchJson = await searchApi.json();
      
      if (!searchJson.status || !searchJson.result || !searchJson.result.data || searchJson.result.data.length === 0) {
          throw new Error('Lagu tidak ditemukan di pencarian!');
      }
      targetUrl = searchJson.result.data[0].url; 
      
    } catch (e) {
      console.error('[Spotify Search Error]', e);
      throw `🚩 Pencarian gagal: ${e.message || 'API error'}`;
    }
  }

  // 3. Proses Download
  try {
    // HAPUS encodeURIComponent di sini. API Botcahx butuh format link mentah (https://...)
    const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${targetUrl}&apikey=${btc}`);
    
    // Pengecekan Anti-Crash: Jika server API merespon dengan HTML (Error <!DOCTYPE>)
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") === -1) {
         throw new Error("Server API Botcahx sedang gangguan/down. Coba lagi nanti ya!");
    }

    let jsons = await res.json();
    
    if (!jsons.status || !jsons.result || !jsons.result.data) {
        throw new Error('Gagal mengambil data lagu dari server download!');
    }
    
    const { thumbnail, title, artist, duration, url } = jsons.result.data;
    
    let captionvid = `*Spotify Downloader*\n\n∘ *Title:* ${title}\n∘ *Artist:* ${artist}\n∘ *Duration:* ${duration}\n∘ *Source:* ${targetUrl}`;
    
    await conn.sendFile(m.chat, thumbnail, "thumb.png", captionvid, m);
    await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
    
  } catch (e) {
    console.error('[Spotify Download Error]', e);
    // Pesan error sekarang akan lebih rapi (misal: "Server API Botcahx sedang gangguan")
    throw `🚩 ${e.message || 'Gagal memproses lagu.'}`;
  }
};

handler.help = ['spotify'];
handler.command = /^(spotify)$/i;
handler.tags = ['downloader'];
handler.limit = true;
module.exports = handler;
