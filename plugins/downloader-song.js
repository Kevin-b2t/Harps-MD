const fetch = require("node-fetch");

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} https://open.spotify.com/track/1xxx\n${usedPrefix + command} payung teduh`;
  
  m.reply(wait);
  
  let targetUrl = "";

  // 1. Cek apakah yang dikirim itu link Spotify atau bukan
  if (/https:\/\/(open\.spotify\.com)/i.test(args[0])) {
    targetUrl = args[0]; // Jika link, langsung jadikan target
  } else { 
    // 2. Jika bukan link, berarti dia nyari judul lagu
    const text = args.join(" ");
    try {
      // Wajib di-encodeURIComponent agar spasi (contoh: "pun tak boleh") tidak error di API
      const searchApi = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(text)}&apikey=${btc}`);
      let searchJson = await searchApi.json();
      
      if (!searchJson.status || searchJson.result.data.length === 0) throw 'Lagu tidak ditemukan!';
      
      // Ambil hasil pencarian paling atas (nomor 1)
      targetUrl = searchJson.result.data[0].url; 
    } catch (e) {
      throw `🚩 Pencarian gagal. Lagu tidak ditemukan atau API error.`;
    }
  }

  // 3. Proses Download Lagu (dari link langsung ATAU hasil pencarian)
  try {
    // Di sini JANGAN di-encodeURIComponent karena API downloadnya bisa error (kasus invalid json sebelumnya)
    const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${targetUrl}&apikey=${btc}`);
    let jsons = await res.json();
    
    const {
      thumbnail,
      title,
      artist,
      duration,
      url
    } = jsons.result.data;
    
    let captionvid = `*Spotify Downloader*\n\n∘ *Title:* ${title}\n∘ *Artist:* ${artist}\n∘ *Duration:* ${duration}\n∘ *Source:* ${targetUrl}`;
    
    // Kirim Thumbnail & Info
    await conn.sendFile(m.chat, thumbnail, "thumb.png", captionvid, m);
    // Kirim Audio/Lagu
    await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
    
  } catch (e) {
    throw `🚩 ${eror} (Gagal mengunduh atau server sedang down)`;
  }
};

handler.help = ['spotify'];
handler.command = /^(spotify)$/i;
handler.tags = ['downloader'];
handler.limit = true;
module.exports = handler;
