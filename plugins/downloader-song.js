const fetch = require("node-fetch");

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} payung teduh`;
  
  // ================= 1. JIKA INPUT LINK SPOTIFY =================
  if (args[0].match(/https:\/\/(open\.spotify\.com)/i)) {
    m.reply(global.wait || 'Tunggu sedang di proses...');
    try {
      // Menggunakan fallback API key persis seperti script lama lu
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${args[0]}&apikey=${global.btc || btc}`);
      let jsons = await res.json();
      
      const { thumbnail, title, artist, duration, url } = jsons.result.data;
      let captionvid = ` ∘ Title: ${title}\n∘ Artist: ${artist}\n\n∘ Duration: ${duration}\n`;
      
      await conn.sendFile(m.chat, thumbnail, "thumb.png", captionvid, m);
      await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
    } catch (e) {
      throw `🚩 ${global.eror || 'Server Error'}`;
    }
  } 
  // ================= 2. JIKA INPUT JUDUL (MUNCULIN TOMBOL) =================
  else { 
    m.reply(global.wait || 'Tunggu sedang di proses...');
    const text = args.join(" ");
    try {
      const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
      let json = await api.json();
      let res = json.result.data.slice(0, 5); 
      
      // Simpan data pakai variabel beda biar gak bentrok sama script sebelah
      conn.spotifySearchBtn = conn.spotifySearchBtn || {};
      conn.spotifySearchBtn[m.sender] = res;

      let teks = "";
      let buttonList = [];
      
      for (let i = 0; i < res.length; i++) {
        teks += `*${i + 1}.* *Title:* ${res[i].title}\n`;
        teks += `*Duration:* ${res[i].duration}\n`;
        teks += `*Popularity:* ${res[i].popularity}\n`;
        teks += `*Link:* ${res[i].url}\n\n`;
        
        // Tombol dibikin polos tanpa emoji "lagu 1" biar 100% persis kayak ngetik manual
        buttonList.push({
          buttonId: `lagu ${i + 1}`,
          buttonText: { displayText: `lagu ${i + 1}` },
          type: 1
        });
      }
      
      teks += `_Silakan tekan tombol di bawah untuk langsung mendownload lagu!_`;
      
      await conn.sendMessage(m.chat, {
        text: teks,
        footer: global.wm || 'Spotify Downloader',
        buttons: buttonList,
        headerType: 1
      }, { quoted: m });
      
    } catch (e) {
      throw `🚩 Pencarian gagal.`;
    }
  }
};

// ================= 3. EKSEKUSI KLIK TOMBOL =================
handler.before = async (m, { conn }) => {
  if (m.isBaileys || !m.text) return;
  
  let teks = m.text.toLowerCase();
  conn.spotifySearchBtn = conn.spotifySearchBtn || {};
  
  let matchSpotify = teks.match(/lagu\s+([1-5])/i);
  
  if (matchSpotify && conn.spotifySearchBtn[m.sender]) {
    let index = parseInt(matchSpotify[1]) - 1;
    let data = conn.spotifySearchBtn[m.sender];
    
    if (!data[index]) return true;
    
    let url = data[index].url;
    m.reply(`⏳ *Mendownload lagu:* ${data[index].title}...`);
    
    try {
      // API request persis 100% kayak script lama lu tanpa embel-embel
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${url}&apikey=${global.btc || btc}`);
      let jsons = await res.json();
      
      const { url: audioUrl } = jsons.result.data;
      
      await conn.sendMessage(m.chat, { 
        audio: { url: audioUrl }, 
        mimetype: 'audio/mpeg' 
      }, { quoted: m });
      
      delete conn.spotifySearchBtn[m.sender];
    } catch (e) {
       m.reply(`🚩 Gagal mendownload! API Downloader sedang bermasalah.`);
    }
    return true; 
  }
};

handler.help = ['spotify'];
handler.command = /^(spotify)$/i;
handler.tags = ['downloader'];
handler.limit = true;
module.exports = handler;
