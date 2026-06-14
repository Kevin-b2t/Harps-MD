const fetch = require("node-fetch");

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} https://open.spotify.com/track/xyz...\n${usedPrefix + command} payung teduh`;
  
  m.reply(wait); // Pastikan variabel 'wait' sudah terdefinisi di bot kamu
  
  let targetUrl = '';

  // 1. Cek apakah input berupa link Spotify
  if (args[0].match(/https:\/\/open\.spotify\.com/i)) {
    targetUrl = args[0];
  } else {
    // 2. Jika berupa judul/pencarian, cari lagu dulu
    const text = args.join(" ");
    try {
      const searchApi = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${text}&apikey=${btc}`);
      let searchJson = await searchApi.json();
      
      // Ambil hasil pencarian teratas (index 0)
      if (!searchJson.result.data || searchJson.result.data.length === 0) throw 'Lagu tidak ditemukan!';
      targetUrl = searchJson.result.data[0].url; 
      
    } catch (e) {
      throw `🚩 Pencarian gagal atau API error.`;
    }
  }

  // 3. Proses Download menggunakan targetUrl (Bisa dari input langsung atau hasil pencarian pertama)
  try {
    const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${targetUrl}&apikey=${btc}`);
    let jsons = await res.json();
    
    if (!jsons.result || !jsons.result.data) throw 'Gagal mengambil data lagu dari server!';
    
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
    throw `🚩 ${eror}`; // Pastikan variabel 'eror' sudah terdefinisi
  }
};

handler.help = ['spotify'];
handler.command = /^(spotify)$/i;
handler.tags = ['downloader'];
handler.limit = true;
module.exports = handler;
