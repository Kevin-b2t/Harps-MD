const fetch = require("node-fetch");

// Opsi buat jaga-jaga kalau server API ngeblokir, biar dikira browser beneran
const fetchOptions = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json'
  }
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} payung teduh`;
  
  let apikey = global.btc; // Ambil apikey dari config.js

  // ================= 1. SAAT PLAYER MASUKIN LINK SPOTIFY =================
  if (args[0].match(/https:\/\/(open\.spotify\.com)/i)) {
    m.reply(global.wait || 'Tunggu sedang di proses...');
    try {
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${args[0]}&apikey=${apikey}`, fetchOptions);
      let jsons = await res.json();
      
      const { thumbnail, title, artist, duration, url } = jsons.result.data;
      
      let captionvid = ` ∘ Title: ${title}\n∘ Artist: ${artist}\n\n∘ Duration: ${duration}\n`;
      await conn.sendFile(m.chat, thumbnail, "thumb.png", captionvid, m);
      await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
    } catch (e) {
      throw `🚩 ${global.eror || 'Server Error'}`;
    }
  } 
  // ================= 2. SAAT PLAYER MASUKIN JUDUL (MUNCULIN LIST & TOMBOL) =================
  else { 
    m.reply(global.wait || 'Tunggu sedang di proses...');
    const text = args.join(" ");
    try {
      // EncodeURIComponent biar spasi berubah jadi format yang bisa dibaca API
      const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(text)}&apikey=${apikey}`, fetchOptions);
      let json = await api.json();
      let res = json.result.data.slice(0, 5); // Batasi 5 lagu aja biar tombol WA gak error
      
      // Simpan link-nya ke memori bot, biar nanti pas tombol ditekan bisa langsung diambil
      conn.spotifyDataBtn = conn.spotifyDataBtn || {};
      conn.spotifyDataBtn[m.sender] = res;

      let teks = "";
      let buttonList = [];
      
      for (let i in res) {
        teks += `*${parseInt(i) + 1}.* *Title:* ${res[i].title}\n`;
        teks += `*Duration:* ${res[i].duration}\n`;
        teks += `*Popularity:* ${res[i].popularity}\n`;
        teks += `*Link:* ${res[i].url}\n\n`;
        
        // Bikin tombolnya sekalian
        buttonList.push({
          buttonId: `lagu ${parseInt(i) + 1}`,
          buttonText: { displayText: `🎧 Lagu ${parseInt(i) + 1}` },
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
      throw `🚩 Pencarian gagal. Server Error.`;
    }
  }
};

// ================= 3. EKSEKUSI LINK SAAT PLAYER TEKAN TOMBOL "LAGU 1" =================
handler.before = async (m, { conn }) => {
  if (m.isBaileys || !m.text) return;
  
  let teks = m.text.toLowerCase();
  conn.spotifyDataBtn = conn.spotifyDataBtn || {};
  
  // Kalau player nekan tombol "Lagu 1"
  let matchSpotify = teks.match(/lagu\s+([1-5])/i);
  
  if (matchSpotify && conn.spotifyDataBtn[m.sender]) {
    let index = parseInt(matchSpotify[1]) - 1;
    let data = conn.spotifyDataBtn[m.sender];
    
    if (!data[index]) return true;
    
    let targetUrl = data[index].url; // Ambil eksekusi link-nya dari memori bot
    m.reply(`⏳ *Mendownload lagu:* ${data[index].title}...`);
    
    try {
      let apikey = global.btc;
      
      // BOT MELAKUKAN FETCH LINK DOWNLOAD (Persis seperti fungsi nomor 1 di atas)
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${targetUrl}&apikey=${apikey}`, fetchOptions);
      let jsons = await res.json();
      
      const { url: audioUrl } = jsons.result.data;
      
      // Langsung kirim audio MP3 ke chat
      await conn.sendMessage(m.chat, { 
        audio: { url: audioUrl }, 
        mimetype: 'audio/mpeg' 
      }, { quoted: m });
      
      // Hapus data dari memori biar gak bentrok
      delete conn.spotifyDataBtn[m.sender];
      
    } catch (e) {
       m.reply(`🚩 *Gagal mendownload!*\nAPI Downloader sedang bermasalah.`);
    }
    return true; 
  }
};

handler.help = ['spotify'];
handler.command = /^(spotify)$/i;
handler.tags = ['downloader'];
handler.limit = true;
module.exports = handler;
