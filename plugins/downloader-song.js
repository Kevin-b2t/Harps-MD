const fetch = require('node-fetch');
const yts = require('yt-search');

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  switch (command) {

case 'spotify': {
      if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} payung teduh`;
      
      if (args[0].match(/https:\/\/open\.spotify\.com/i)) {
        m.reply(wait);
        try {
          const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${args[0]}&apikey=${global.btc || btc}`);
          let jsons = await res.json();
          const { title, duration, url } = jsons.result.data;
          const { id, type } = jsons.result.data.artist;
          
          let captionvid = ` ∘ Title: ${title}\n∘ Id: ${id}\n∘ Duration: ${duration}\n∘ Type: ${type}`;
          await conn.reply(m.chat, captionvid, m);
          await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
        } catch (e) {
          throw `🚩 ${eror}`;
        }
      } 
      else { 
        m.reply(wait);
        const query = args.join(" ");
        try {
          const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${global.btc || btc}`);
          let json = await api.json();
          let res = json.result.data.slice(0, 5); // Tetap 5 untuk lagu agar tidak terlalu panjang daftarnya
          
          // Simpan hasil pencarian di memori bot untuk user ini
          conn.spotifySearch = conn.spotifySearch || {};
          conn.spotifySearch[m.sender] = res; 

          let teks = `🎵 *Hasil Pencarian Spotify: ${query}*\n\n`;
          for (let i = 0; i < res.length; i++) {
            teks += `*${i + 1}.* ${res[i].title}\n`;
            teks += `   ∘ Duration: ${res[i].duration}\n`;
            teks += `   ∘ Popularity: ${res[i].popularity}\n\n`;
          }
          teks += `💡 *Silakan ketik "lagu 1" sampai "lagu ${res.length}" untuk mendownload audionya.*`;
          await conn.reply(m.chat, teks, m);
        } catch (e) {
          throw `🚩 ${eror}`;
        }
      }
      break;
    }

  }
};

// --- LISTENER SPOTIFY ("lagu 1", "lagu 2", dst) ---
  conn.spotifySearch = conn.spotifySearch || {};
  let matchSpotify = teks.match(/^lagu\s+([1-5])$/);
  
  if (matchSpotify && conn.spotifySearch[m.sender]) {
    let index = parseInt(matchSpotify[1]) - 1;
    let data = conn.spotifySearch[m.sender];
    
    if (!data[index]) {
       m.reply('Pilihan lagu tidak ada di daftar. Silakan cari ulang.');
       return true;
    }
    
    let url = data[index].url;
    m.reply(`⏳ *Mendownload ${data[index].title}...*`);
    
    try {
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${url}&apikey=${global.btc || btc}`);
      let jsons = await res.json();
      const { title, url: audioUrl } = jsons.result.data;
      
      await conn.sendMessage(m.chat, { 
        audio: { url: audioUrl }, 
        mimetype: 'audio/mpeg' 
      }, { quoted: m });
      
      // Hapus sesi spotify setelah lagu berhasil dikirim
      delete conn.spotifySearch[m.sender];
    } catch (e) {
       m.reply('Gagal mendownload lagu. API sedang bermasalah.');
    }
    return true; 
  }
};

// ================== KONFIGURASI PLUGIN ==================
handler.help = [
  'spotify <query/url>', 
];
handler.tags = ['downloader', 'internet', 'tools'];
handler.command = /^(pinterest|spotify|ytmp3|yta|yts(earch)?|ytmp4|ytv)$/i;

handler.limit = true;
handler.exp = 0;
handler.premium = false;

module.exports = handler;
