const fetch = require("node-fetch");

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} payung teduh`;
  
  // ================= 1. JIKA INPUT BERUPA LINK SPOTIFY =================
  if (args[0].match(/https:\/\/open\.spotify\.com/i)) {
    m.reply(typeof wait !== 'undefined' ? wait : '⏳ Sedang memproses link...');
    try {
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${args[0]}&apikey=${global.btc || btc}`);
      let jsons = await res.json();
      if (!jsons.status || !jsons.result) throw 'Gagal mengambil data lagu dari API.';
      
      const { title, duration, url, thumbnail } = jsons.result.data;
      
      let artistName = jsons.result.data.artist;
      if (typeof artistName === 'object' && artistName.name) {
        artistName = artistName.name;
      }

      let captionvid = `*Spotify Downloader*\n\n∘ *Title:* ${title}\n∘ *Artist:* ${artistName}\n∘ *Duration:* ${duration}\n∘ *Source:* ${args[0]}`;
      
      if (thumbnail) {
        await conn.sendFile(m.chat, thumbnail, "thumb.png", captionvid, m);
      } else {
        await conn.reply(m.chat, captionvid, m);
      }
      await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
    } catch (e) {
      throw `🚩 Gagal mendownload lagu. Pastikan link valid atau API sedang gangguan.`;
    }
  } 
  // ================= 2. JIKA INPUT BERUPA PENCARIAN (BUTTONS) =================
  else { 
    m.reply(typeof wait !== 'undefined' ? wait : '⏳ Sedang mencari lagu...');
    const query = args.join(" ");
    try {
      const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${global.btc || btc}`);
      let json = await api.json();
      
      if (!json.status || !json.result || !json.result.data || json.result.data.length === 0) {
          throw 'Lagu tidak ditemukan!';
      }

      // Ambil 5 lagu teratas
      let res = json.result.data.slice(0, 5); 
      
      // Simpan hasil pencarian di memori bot untuk di-download nanti
      conn.spotifySearch = conn.spotifySearch || {};
      conn.spotifySearch[m.sender] = res; 

      let teks = `🎵 *Hasil Pencarian Spotify: ${query}*\n\n`;
      let buttonList = [];
      
      for (let i = 0; i < res.length; i++) {
        teks += `*${i + 1}.* ${res[i].title}\n`;
        teks += `   ∘ Duration: ${res[i].duration}\n`;
        teks += `   ∘ Popularity: ${res[i].popularity}\n\n`;
        
        // Memasukkan pilihan ke dalam Button
        buttonList.push({
          buttonId: `lagu ${i + 1}`,
          buttonText: { displayText: `🎧 Lagu ${i + 1}` },
          type: 1
        });
      }
      teks += `💡 *Silakan klik tombol di bawah untuk mendownload audionya.*`;
      
      // Konfigurasi pesan Button
      let buttonMessage = {
        text: teks,
        footer: 'Spotify Downloader by Bot',
        buttons: buttonList,
        headerType: 1
      };

      // Kirim pesan ke WhatsApp
      await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
      
    } catch (e) {
      throw `🚩 Pencarian gagal. API sedang bermasalah.`;
    }
  }
};

// ================== LISTENER (EKSEKUSI KLIK BUTTON) ==================
handler.before = async (m, { conn }) => {
  if (m.isBaileys || !m.text) return;
  
  let teks = m.text.toLowerCase();
  conn.spotifySearch = conn.spotifySearch || {};
  
  // Deteksi cerdas: Bakal nangkap jika user klik tombol "🎧 Lagu 1" atau cuma ngetik "lagu 1"
  let matchSpotify = teks.match(/lagu\s+([1-5])/i);
  
  if (matchSpotify && conn.spotifySearch[m.sender]) {
    let index = parseInt(matchSpotify[1]) - 1;
    let data = conn.spotifySearch[m.sender];
    
    if (!data[index]) {
       m.reply('🚩 Pilihan lagu tidak ada di daftar. Silakan cari ulang.');
       return true;
    }
    
    let url = data[index].url;
    m.reply(`⏳ *Mendownload: ${data[index].title}...*\n_Mohon tunggu sebentar..._`);
    
    try {
      // Fetch data audio tanpa encodeURIComponent (sesuai API yg lu pakai)
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${url}&apikey=${global.btc || btc}`);
      let jsons = await res.json();
      
      if (!jsons.status || !jsons.result || !jsons.result.data) {
         throw 'Gagal mengambil audio.';
      }

      const { url: audioUrl } = jsons.result.data;
      
      // Kirim Audio Mp3 ke Chat
      await conn.sendMessage(m.chat, { 
        audio: { url: audioUrl }, 
        mimetype: 'audio/mpeg' 
      }, { quoted: m });
      
      // Hapus memori pencarian agar tidak bertumpuk
      delete conn.spotifySearch[m.sender];
    } catch (e) {
       m.reply('🚩 Gagal mendownload lagu. Server API sedang bermasalah/down.');
    }
    return true; 
  }
};

handler.help = ['spotify'];
handler.command = /^(spotify)$/i;
handler.tags = ['downloader'];
handler.limit = true;
module.exports = handler;
