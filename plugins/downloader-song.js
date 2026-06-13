const fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} separuh aku`;
  
  // Menggunakan global wait dari bot kamu (pastikan variabel wait sudah terdefinisi di bot)
  m.reply(wait); 

  try {
    let spotifyUrl = text;
    let isUrl = text.match(/https:\/\/open\.spotify\.com/i);

    // Jika input BUKAN link, berarti user melakukan pencarian judul
    if (!isUrl) {
      const searchApi = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
      let searchJson = await searchApi.json();
      
      if (!searchJson.result.data || searchJson.result.data.length === 0) {
         throw 'Lagu tidak ditemukan, coba gunakan kata kunci lain.';
      }
      
      // Ambil URL dari hasil pencarian teratas (index 0)
      spotifyUrl = searchJson.result.data[0].url;
    }

    // Proses Download menggunakan URL (baik dari input langsung maupun hasil search)
    const dlApi = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${spotifyUrl}&apikey=${global.btc || btc}`);
    let dlJson = await dlApi.json();
    
    if (!dlJson.status || !dlJson.result) throw 'Gagal mengambil data dari API Spotify.';

    const { title, duration, url } = dlJson.result.data;
    const artistInfo = dlJson.result.data.artist || {};
    const artistId = artistInfo.id || '-';
    const artistType = artistInfo.type || '-';
    
    let captionText = `🎵 *Spotify Downloader*\n\n ∘ Title: ${title}\n ∘ Artist ID: ${artistId}\n ∘ Duration: ${duration}\n ∘ Type: ${artistType}`;
    
    // Kirim detail lagu
    await conn.reply(m.chat, captionText, m);
    // Kirim file audio
    await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });

  } catch (e) {
    // Menggunakan global error (pastikan variabel eror terdefinisi)
    throw `🚩 ${eror}`;
  }
};

handler.help = ['spotify <query/url>'];
handler.tags = ['downloader'];
handler.command = /^(spotify)$/i;

handler.limit = true;
handler.premium = false;

module.exports = handler;
