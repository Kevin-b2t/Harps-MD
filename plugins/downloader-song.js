const fetch = require("node-fetch");

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} payung teduh`;
  
  m.reply(wait);
  
  try {
    let targetUrl = args[0];

    // 1. Jika yang diinput BUKAN link Spotify, maka lakukan pencarian
    if (!args[0].match(/spotify\.com/i)) {
      const text = args.join(" ");
      // API Search persis seperti aslinya
      const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${text}&apikey=${btc}`);
      let json = await api.json();
      
      // Jika hasil kosong, hentikan
      if (!json.result || !json.result.data || json.result.data.length === 0) {
         throw `Lagu tidak ditemukan!`;
      }
      
      // Mengambil link dari hasil pencarian teratas (urutan ke-0)
      targetUrl = json.result.data[0].url; 
    }

    // 2. Lanjut ke proses Download menggunakan API aslinya
    const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${targetUrl}&apikey=${btc}`);
    let jsons = await res.json();
    
    // Destructuring persis seperti bawaan script
    const {
      thumbnail,
      title,
      artist,
      duration,
      url
    } = jsons.result.data;
    
    let captionvid = ` ∘ Title: ${title}\n∘ Artist: ${artist}\n\n∘ Duration: ${duration}\n`;
    
    await conn.sendFile(m.chat, thumbnail, "thumb.png", captionvid, m);
    await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
    
  } catch (e) {
    console.error(e); // Ini akan memunculkan detail error di log terminal panel kamu
    throw `🚩 ${eror}`;
  }
};

handler.help = ['spotify'];
handler.command = /^(spotify)$/i;
handler.tags = ['downloader'];
handler.limit = true;
module.exports = handler;
