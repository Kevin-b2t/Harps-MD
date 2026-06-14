const fetch = require("node-fetch");

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} payung teduh`;
  
  // Ambil API Key langsung dari config.js lu
  let apikey = global.btc;

  // ================= 1. JIKA INPUT BERUPA LINK SPOTIFY LANGSUNG =================
  if (args[0].match(/https:\/\/open\.spotify\.com/i)) {
    m.reply(global.wait || '⏳ Sedang memproses link...');
    try {
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${args[0]}&apikey=${apikey}`);
      let jsons = await res.json();
      
      if (!jsons.status || !jsons.result) throw 'Gagal mengambil data lagu.';
      
      const { title, duration, url, thumbnail, artist } = jsons.result.data;
      let artistName = typeof artist === 'object' && artist.name ? artist.name : artist;
      
      let captionvid = `*Spotify Downloader*\n\n∘ *Title:* ${title}\n∘ *Artist:* ${artistName}\n∘ *Duration:* ${duration}\n∘ *Source:* ${args[0]}`;
      
      if (thumbnail) await conn.sendFile(m.chat, thumbnail, "thumb.png", captionvid, m);
      else await conn.reply(m.chat, captionvid, m);
      
      // Kirim Audio
      await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
    } catch (e) {
      throw `🚩 Gagal mendownload lagu. Pastikan link valid.\nDetail: ${e.message || e}`;
    }
  } 
  // ================= 2. JIKA INPUT BERUPA PENCARIAN (BUTTON) =================
  else { 
    m.reply(global.wait || '⏳ Sedang mencari lagu...');
    const query = args.join(" ");
    try {
      const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${apikey}`);
      let json = await api.json();
      
      if (!json.status || !json.result || !json.result.data || json.result.data.length === 0) {
          throw 'Lagu tidak ditemukan!';
      }

      let res = json.result.data.slice(0, 5); 
      
      // ==== SIMPAN DATA & LINK SPOTIFY ASLINYA ====
      conn.spotifySearch = conn.spotifySearch || {};
      conn.spotifySearch[m.sender] = res.map(v => ({
          title: v.title,
          url: v.url // Ini link asli spotify (https://open.spotify.com/track/...)
      }));

      let teks = `🎵 *Hasil Pencarian Spotify: ${query}*\n\n`;
      let buttonList = [];
      
      for (let i = 0; i < res.length; i++) {
        teks += `*${i + 1}.* ${res[i].title}\n`;
        teks += `   ∘ Duration: ${res[i].duration}\n`;
        teks += `   ∘ Link: ${res[i].url}\n\n`; // Gua tampilin linknya biar lu bisa liat langsung
        
        buttonList.push({
          buttonId: `lagu ${i + 1}`,
          buttonText: { displayText: `🎧 Lagu ${i + 1}` },
          type: 1
        });
      }
      teks += `💡 *Silakan klik tombol di bawah untuk mendownload.*`;
      
      // Kirim Button
      await conn.sendMessage(m.chat, {
        text: teks,
        footer: global.wm || 'Spotify Downloader',
        buttons: buttonList,
        headerType: 1
      }, { quoted: m });
      
    } catch (e) {
      throw `🚩 Pencarian gagal.\nDetail: ${e.message || e}`;
    }
  }
};

// ================== LISTENER BUTTON (EKSEKUSI DOWNLOAD) ==================
handler.before = async (m, { conn }) => {
  if (m.isBaileys || !m.text) return;
  
  let teks = m.text.toLowerCase();
  conn.spotifySearch = conn.spotifySearch || {};
  
  // Tangkap klik button "Lagu 1"
  let matchSpotify = teks.match(/lagu\s+([1-5])/i);
  
  if (matchSpotify && conn.spotifySearch[m.sender]) {
    let index = parseInt(matchSpotify[1]) - 1;
    let data = conn.spotifySearch[m.sender];
    
    if (!data[index]) {
       m.reply('🚩 Pilihan lagu tidak valid.');
       return true;
    }
    
    let targetUrl = data[index].url; // Ekstrak link spotify aslinya dari memori
    m.reply(`⏳ *Mendownload: ${data[index].title}...*\n_Mengambil audio dari link asli..._`);
    
    try {
      let apikey = global.btc;
      
      // Hit API Download Botcahx menggunakan targetUrl persis seperti jika input link langsung
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${targetUrl}&apikey=${apikey}`);
      let jsons = await res.json();
      
      // Proteksi jika data JSON dari API gagal dimuat/kosong
      if (!jsons.status || !jsons.result || !jsons.result.data) {
         throw new Error(`Respon API tidak valid/kosong.`);
      }

      // Ambil link file Mp3 dari server
      const { url: audioUrl } = jsons.result.data;
      
      // Kirim file audio Mp3 ke user
      await conn.sendMessage(m.chat, { 
        audio: { url: audioUrl }, 
        mimetype: 'audio/mpeg' 
      }, { quoted: m });
      
      // Hapus memori biar bersih
      delete conn.spotifySearch[m.sender];
      
    } catch (e) {
       // Kalo masih error, bakalan keliatan Link Spotify aslinya yang mana yang bikin error
       m.reply(`🚩 *Gagal mendownload!*\n\n*Link Spotify yg Diproses:* ${targetUrl}\n*Detail Error:* ${e.message || e}`);
    }
    return true; 
  }
};

handler.help = ['spotify'];
handler.command = /^(spotify)$/i;
handler.tags = ['downloader'];
handler.limit = true;
module.exports = handler;
