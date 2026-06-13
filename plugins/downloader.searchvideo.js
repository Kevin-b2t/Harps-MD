const fetch = require('node-fetch');
const yts = require('yt-search');

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  const timeoutMs = 5 * 60 * 1000; // 5 Menit

  switch (command) {

    // ================== PINTEREST ==================
    case 'pinterest': {
      if (!text) throw `*🚩 Example Pencarian:* ${usedPrefix}${command} Zhao Lusi\n*🚩 Example Download:* ${usedPrefix}${command} https://id.pinterest.com/pin/1234567890/`;
      
      if (text.match(/pin(?:terest)?(?:\.it|\.com)/i)) {
        m.reply(wait);
        try {
          let response = await fetch(`https://api.botcahx.eu.org/api/download/pinterest?url=${args[0]}&apikey=${global.btc || btc}`);
          let json = await response.json();
          
          if (json.status && json.result) {
            let mediaUrl = json.result.url || json.result.result || json.result;
            await conn.sendFile(m.chat, mediaUrl, 'pinterest.jpg', '🍟 *Pinterest Downloader*', m);
          } else {
            throw 'Gagal mengambil data dari URL Pinterest.';
          }
        } catch (e) {
          throw `🚩 ${eror}`;
        }
      } 
      else {
        m.reply(wait);
        try {
          let response = await fetch(`https://api.botcahx.eu.org/api/search/pinterest?text1=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
          let data = await response.json();   
          
          if (!data.result || data.result.length === 0) throw 'Gambar tidak ditemukan.';

          // Ambil maksimal 10 foto
          let images = data.result.slice(0, 10); 
          
          conn.pinterestSearch = conn.pinterestSearch || {};
          
          // Bersihkan timer lama jika ada
          if (conn.pinterestSearch[m.sender]) clearTimeout(conn.pinterestSearch[m.sender].timer);

          // Buat Sesi Baru
          conn.pinterestSearch[m.sender] = {
            query: text,
            urls: images,
            currentIndex: 0,
            timer: setTimeout(() => {
              if (conn.pinterestSearch && conn.pinterestSearch[m.sender]) {
                delete conn.pinterestSearch[m.sender];
              }
            }, timeoutMs)
          };

          let firstImage = images[0];
          let captionText = `🍟 *Pinterest Search:* ${text}\n📷 *Foto:* 1/${images.length}\n⏳ Sesi berlaku 5 menit\n\n💡 *Ketik "Next Foto" untuk melihat foto selanjutnya.*`;

          await conn.sendMessage(m.chat, { 
            image: { url: firstImage }, 
            caption: captionText 
          }, { quoted: m });
          
        } catch (e) {
          throw eror;
        }
      }
      break;
    }

    // ================== SPOTIFY ==================
    case 'spotify': {
      // [Kode Spotify Tetap Sama seperti original kamu]
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
          let res = json.result.data.slice(0, 5); 
          
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

    // ================== YOUTUBE AUDIO (MP3) ==================
    case 'ytmp3':
    case 'yta': {
      // [Kode YT MP3 Tetap Sama]
      if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
      m.reply(wait);
      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp3) {
          await conn.sendMessage(m.chat, { 
            audio: { url: result.result.mp3 }, 
            mimetype: 'audio/mpeg' 
          }, { quoted: m });
        } else {
          throw 'Error: Unable to fetch audio';
        }
      } catch (error) {
        throw eror;
      }
      break;
    }

    // ================== YOUTUBE SEARCH & SLIDESHOW ==================
    case 'yts':
    case 'ytsearch': {
      if (!text) throw 'Cari apa?';
      m.reply(wait);
      try {
        let results = await yts(text);
        let videos = results.videos; 
        
        if (!videos || videos.length === 0) throw 'Video tidak ditemukan.';

        // Ambil maksimal 10 video
        let topVideos = videos.slice(0, 10);
        
        conn.ytsSearch = conn.ytsSearch || {};
        
        // Bersihkan timer lama jika ada
        if (conn.ytsSearch[m.sender]) clearTimeout(conn.ytsSearch[m.sender].timer);

        conn.ytsSearch[m.sender] = {
          query: text,
          videos: topVideos,
          currentIndex: 0,
          downloaded: false, // Menandai apakah player sudah download
          timer: setTimeout(() => {
            if (conn.ytsSearch && conn.ytsSearch[m.sender]) {
              delete conn.ytsSearch[m.sender];
            }
          }, timeoutMs)
        };

        let v = topVideos[0];
        let infoTeks = `📺 YouTube Search: ${text}\n` +
                       `📌 Judul: ${v.title}\n` +
                       `👁️ Views: ${v.views.toLocaleString()}\n` +
                       `👤 Oleh: ${v.author.name}\n` +
                       `⏱️ Durasi: ${v.timestamp}\n` +
                       `🎬 Video: 1/${topVideos.length}\n` +
                       `⏳ Sesi berlaku 5 menit • Item 1/${topVideos.length}\n\n` +
                       `💡 *Balas/Ketik perintah berikut:*\n` +
                       `> *Next Video* (Melihat video selanjutnya)\n` +
                       `> *Download* (Mengunduh video ini)`;
        
        await conn.sendMessage(m.chat, { 
          image: { url: v.thumbnail }, 
          caption: infoTeks 
        }, { quoted: m });

      } catch (e) {
        throw eror;
      }
      break;
    }

    // ================== YOUTUBE VIDEO (MP4) ==================
    case 'ytmp4':
    case 'ytv': {
      // [Kode YT MP4 Tetap Sama]
      if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
      m.reply(wait);
      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp4) {
          await conn.sendMessage(m.chat, { 
            video: { url: result.result.mp4 }, 
            mimetype: 'video/mp4' 
          }, { quoted: m });
        } else {
          throw 'Error: Unable to fetch video';
        }
      } catch (error) {
        throw eror;
      }
      break;
    }

  }
};

// ================== LISTENER (HANDLER.BEFORE) ==================
handler.before = async (m, { conn }) => {
  if (m.isBaileys || !m.text) return;
  
  let teks = m.text.toLowerCase().trim();
  const timeoutMs = 5 * 60 * 1000; // 5 Menit

  // --- LISTENER PINTEREST ("next foto") ---
  conn.pinterestSearch = conn.pinterestSearch || {};
  if (teks === 'next foto' && conn.pinterestSearch[m.sender]) {
    let pinData = conn.pinterestSearch[m.sender];
    pinData.currentIndex += 1;

    // Reset Timer
    clearTimeout(pinData.timer);
    pinData.timer = setTimeout(() => {
      if (conn.pinterestSearch && conn.pinterestSearch[m.sender]) delete conn.pinterestSearch[m.sender];
    }, timeoutMs);

    if (pinData.currentIndex >= pinData.urls.length) {
      m.reply('✅ *Sudah mencapai foto terakhir dari pencarian ini.*');
      delete conn.pinterestSearch[m.sender]; 
      return true;
    }

    let nextImageUrl = pinData.urls[pinData.currentIndex];
    let isLast = pinData.currentIndex === pinData.urls.length - 1;
    let captionText = `🍟 *Pinterest Search:* ${pinData.query}\n📷 *Foto:* ${pinData.currentIndex + 1}/${pinData.urls.length}\n⏳ Sesi berlaku 5 menit`;
    
    if (!isLast) {
      captionText += `\n\n💡 *Ketik "Next Foto" untuk melihat foto selanjutnya.*`;
    } else {
      captionText += `\n\n✅ _Ini adalah foto terakhir._`;
      delete conn.pinterestSearch[m.sender]; 
    }

    await conn.sendMessage(m.chat, { 
      image: { url: nextImageUrl }, 
      caption: captionText 
    }, { quoted: m });

    return true;
  }

  // --- LISTENER YTS ("next video" & "download") ---
  conn.ytsSearch = conn.ytsSearch || {};
  if ((teks === 'next video' || teks === 'download') && conn.ytsSearch[m.sender]) {
    let ytData = conn.ytsSearch[m.sender];

    // Jika sudah download sebelumnya
    if (ytData.downloaded) {
      m.reply('⚠️ *Ketik Perintah Lagi Untuk Mencari Pencarian Lainnya*');
      return true;
    }

    if (teks === 'next video') {
      ytData.currentIndex += 1;

      // Reset Timer
      clearTimeout(ytData.timer);
      ytData.timer = setTimeout(() => {
        if (conn.ytsSearch && conn.ytsSearch[m.sender]) delete conn.ytsSearch[m.sender];
      }, timeoutMs);

      if (ytData.currentIndex >= ytData.videos.length) {
        m.reply('✅ *Sudah mencapai video terakhir dari pencarian ini.*');
        delete conn.ytsSearch[m.sender];
        return true;
      }

      let v = ytData.videos[ytData.currentIndex];
      let infoTeks = `📺 YouTube Search: ${ytData.query}\n` +
                     `📌 Judul: ${v.title}\n` +
                     `👁️ Views: ${v.views.toLocaleString()}\n` +
                     `👤 Oleh: ${v.author.name}\n` +
                     `⏱️ Durasi: ${v.timestamp}\n` +
                     `🎬 Video: ${ytData.currentIndex + 1}/${ytData.videos.length}\n` +
                     `⏳ Sesi berlaku 5 menit • Item ${ytData.currentIndex + 1}/${ytData.videos.length}\n\n` +
                     `💡 *Balas/Ketik perintah berikut:*\n` +
                     `> *Next Video* (Melihat video selanjutnya)\n` +
                     `> *Download* (Mengunduh video ini)`;

      await conn.sendMessage(m.chat, { 
        image: { url: v.thumbnail }, 
        caption: infoTeks 
      }, { quoted: m });

      return true;
    }

    if (teks === 'download') {
      let v = ytData.videos[ytData.currentIndex];
      m.reply(`⏳ _Sedang mengunduh video: *${v.title}*, mohon tunggu..._`);
      
      // Kunci sesi agar tidak bisa digunakan lagi
      ytData.downloaded = true;
      clearTimeout(ytData.timer); 

      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(v.url)}&apikey=${global.btc || btc}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp4) {
          await conn.sendMessage(m.chat, { 
            video: { url: result.result.mp4 }, 
            mimetype: 'video/mp4',
            caption: `🍟 *YT Search Downloader*\n🎬 ${v.title}`
          }, { quoted: m });
        } else {
          m.reply('❌ Gagal mengunduh file media dari server API.');
        }
      } catch (e) {
        m.reply('❌ Terjadi kesalahan saat mengunduh video.');
      }
      return true;
    }
  }

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
      
      delete conn.spotifySearch[m.sender];
    } catch (e) {
       m.reply('Gagal mendownload lagu. API sedang bermasalah.');
    }
    return true; 
  }
};

// ================== KONFIGURASI PLUGIN ==================
handler.help = [
  'pinterest <keyword/url>', 
  'spotify <query/url>', 
  'ytmp3 <url>', 
  'ytmp4 <url>', 
  'yts <query>'
];
handler.tags = ['downloader', 'internet', 'tools'];
handler.command = /^(pinterest|spotify|ytmp3|yta|yts(earch)?|ytmp4|ytv)$/i;

handler.limit = true;
handler.exp = 0;
handler.premium = false;

module.exports = handler;
