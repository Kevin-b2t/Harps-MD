const fetch = require('node-fetch');
const yts = require('yt-search');

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
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

          // Ambil maksimal 8 foto sesuai permintaan
          let images = data.result.slice(0, 8); 
          
          // Simpan data pencarian di memori bot untuk user ini
          conn.pinterestSearch = conn.pinterestSearch || {};
          conn.pinterestSearch[m.sender] = {
            query: text,
            urls: images,
            currentIndex: 0,
            timeout: Date.now() + 300000 
          };

          let firstImage = images[0];
          let captionText = `🍟 *Pinterest Search:* ${text}\n📷 *Foto:* 1/${images.length}\n\n💡 _Ketik "next" atau klik tombol untuk melihat foto selanjutnya._`;

          let buttons = [
            { buttonId: 'next_foto', buttonText: { displayText: 'Next Foto' }, type: 1 }
          ];

          await conn.sendMessage(m.chat, { 
            image: { url: firstImage }, 
            caption: captionText,
            footer: "Batas waktu 5 Menit",
            buttons: buttons,
            headerType: 4
          }, { quoted: m });
          
        } catch (e) {
          throw eror;
        }
      }
      break;
    }

    // ================== SPOTIFY ==================
    case 'spotify': {
      if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} payung teduh`;
      
      // Jika yang dimasukkan adalah URL / Link langsung
      if (args[0].match(/https:\/\/open\.spotify\.com/i)) {
        m.reply(wait);
        try {
          const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${args[0]}&apikey=${global.btc || btc}`);
          let jsons = await res.json();
          const { title, duration, url } = jsons.result.data;
          const { id, type } = jsons.result.data.artist || { id: '-', type: '-' };
          
          let captionvid = `🎵 *Spotify Downloader*\n\n∘ Title: ${title}\n∘ Id: ${id}\n∘ Duration: ${duration}\n∘ Type: ${type}`;
          await conn.reply(m.chat, captionvid, m);
          await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
        } catch (e) {
          throw `🚩 ${eror}`;
        }
      } 
      // Jika yang dimasukkan adalah Teks Pencarian (contoh: "separuh aku")
      else { 
        m.reply(wait);
        const query = args.join(" ");
        try {
          // Cari lagunya terlebih dahulu
          const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${global.btc || btc}`);
          let json = await api.json();
          
          if (!json.status || !json.result || !json.result.data || json.result.data.length === 0) {
             throw 'Lagu tidak ditemukan.';
          }
          
          // Langsung ambil hasil urutan pertama (paling atas)
          let firstSong = json.result.data[0]; 
          
          m.reply(`⏳ _Menemukan *${firstSong.title}*, sedang mengunduh audio..._`);
          
          // Langsung melakukan download otomatis ke url lagu pertama
          const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${firstSong.url}&apikey=${global.btc || btc}`);
          let jsons = await res.json();
          
          if (!jsons.status || !jsons.result || !jsons.result.data) {
             throw 'Gagal mengambil audio dari server.';
          }
          
          const { title, duration, url: audioUrl } = jsons.result.data;
          const { id, type } = jsons.result.data.artist || { id: '-', type: '-' };
          
          // Kirim caption/info lagunya
          let captionvid = `🎵 *Spotify Search & Download*\n\n∘ Title: ${title}\n∘ Id: ${id}\n∘ Duration: ${duration}\n∘ Type: ${type}`;
          await conn.reply(m.chat, captionvid, m);
          
          // Kirim lagu audionya
          await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mpeg' }, { quoted: m });

        } catch (e) {
          throw `🚩 Gagal mencari/mendownload lagu. API sedang bermasalah.`;
        }
      }
      break;
    }

    // ================== YOUTUBE AUDIO (MP3) ==================
    case 'ytmp3':
    case 'yta': {
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

    // ================== YOUTUBE SEARCH ==================
    case 'yts':
    case 'ytsearch': {
      if (!text) throw 'Cari apa?';
      m.reply(wait);
      try {
        let results = await yts(text);
        let videos = results.videos; 
        
        if (!videos || videos.length === 0) throw 'Video tidak ditemukan.';

        let searchResults = videos.slice(0, 10);
        conn.ytsSearch = conn.ytsSearch || {};
        conn.ytsSearch[m.sender] = {
          query: text,
          videos: searchResults,
          currentIndex: 0,
          timeout: Date.now() + 300000, 
          hasDownloaded: false 
        };

        let currentVideo = searchResults[0];
        
        let captionTeks = `📺 YouTube Search: ${text}\n` + 
                          `📌 Judul: ${currentVideo.title}\n` + 
                          `👁️ Views: ${currentVideo.views.toLocaleString()}\n` + 
                          `👤 Oleh: ${currentVideo.author.name}\n` + 
                          `⏱️ Durasi: ${currentVideo.timestamp}\n` + 
                          `🎬 Video: 1/${searchResults.length}`; 
        
        let footerTeks = `⏳ Sesi berlaku 5 menit • Item 1/${searchResults.length}`; 

        let buttons = [
          { buttonId: 'next_video', buttonText: { displayText: 'Next Video' }, type: 1 },
          { buttonId: 'download_video', buttonText: { displayText: 'Download' }, type: 1 }
        ];

        await conn.sendMessage(m.chat, { 
          image: { url: currentVideo.thumbnail }, 
          caption: captionTeks,
          footer: footerTeks,
          buttons: buttons,
          headerType: 4 
        }, { quoted: m });

      } catch (e) {
        throw eror;
      }
      break;
    }

    // ================== YOUTUBE VIDEO (MP4) ==================
    case 'ytmp4':
    case 'ytv': {
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

  // --- LISTENER PINTEREST ---
  conn.pinterestSearch = conn.pinterestSearch || {};
  if (/^(next|next foto|next_foto)$/i.test(teks) && conn.pinterestSearch[m.sender]) {
    let pinData = conn.pinterestSearch[m.sender];

    if (Date.now() > pinData.timeout) {
      m.reply('⏱️ *Sesi Pinterest kamu telah berakhir (Batas 5 menit).* Silakan cari ulang.');
      delete conn.pinterestSearch[m.sender];
      return true;
    }

    pinData.currentIndex += 1;

    if (pinData.currentIndex >= pinData.urls.length) {
      m.reply('✅ *Sudah mencapai foto terakhir dari pencarian ini.*');
      delete conn.pinterestSearch[m.sender];
      return true;
    }

    let nextImageUrl = pinData.urls[pinData.currentIndex];
    let isLast = pinData.currentIndex === pinData.urls.length - 1;
    let captionText = `🍟 *Pinterest Search:* ${pinData.query}\n📷 *Foto:* ${pinData.currentIndex + 1}/${pinData.urls.length}`;
    
    let buttons = [];

    if (!isLast) {
      captionText += `\n\n💡 _Ketik "next" atau klik tombol untuk melihat foto selanjutnya._`;
      buttons.push({ buttonId: 'next_foto', buttonText: { displayText: 'Next Foto' }, type: 1 });
    } else {
      captionText += `\n\n✅ _Ini adalah foto terakhir._`;
      delete conn.pinterestSearch[m.sender];
    }

    if (buttons.length > 0) {
      await conn.sendMessage(m.chat, { 
        image: { url: nextImageUrl }, 
        caption: captionText,
        footer: "Batas waktu 5 Menit",
        buttons: buttons,
        headerType: 4
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, { 
        image: { url: nextImageUrl }, 
        caption: captionText 
      }, { quoted: m });
    }

    return true;
  }

  // --- LISTENER YOUTUBE SEARCH ---
  conn.ytsSearch = conn.ytsSearch || {};
  if (/^(next video|next_video|download|download_video)$/i.test(teks) && conn.ytsSearch[m.sender]) {
    let ytsData = conn.ytsSearch[m.sender];

    if (ytsData.hasDownloaded) {
      m.reply('⚠️ Mohon Cari Pencarian Lain Karna Kau Sudah Download Video Tersebut');
      delete conn.ytsSearch[m.sender];
      return true;
    }

    if (Date.now() > ytsData.timeout) {
      m.reply('⏱️ *Sesi YouTube kamu telah berakhir (Batas 5 menit).* Silakan cari ulang.');
      delete conn.ytsSearch[m.sender];
      return true;
    }

    if (/^(next video|next_video)$/i.test(teks)) {
      ytsData.currentIndex += 1;
      let totalVideos = ytsData.videos.length;

      if (ytsData.currentIndex >= totalVideos) {
        m.reply('✅ *Sudah mencapai hasil video terakhir dari pencarian ini.*');
        delete conn.ytsSearch[m.sender];
        return true;
      }

      let currentVid = ytsData.videos[ytsData.currentIndex];
      let urutan = ytsData.currentIndex + 1;

      let captionTeks = `📺 YouTube Search: ${ytsData.query}\n` + 
                        `📌 Judul: ${currentVid.title}\n` + 
                        `👁️ Views: ${currentVid.views.toLocaleString()}\n` + 
                        `👤 Oleh: ${currentVid.author.name}\n` + 
                        `⏱️ Durasi: ${currentVid.timestamp}\n` + 
                        `🎬 Video: ${urutan}/${totalVideos}`; 
      
      let footerTeks = `⏳ Sesi berlaku 5 menit • Item ${urutan}/${totalVideos}`; 
      
      let buttons = [];
      
      if (urutan < totalVideos) {
        buttons.push({ buttonId: 'next_video', buttonText: { displayText: 'Next Video' }, type: 1 });
      }
      buttons.push({ buttonId: 'download_video', buttonText: { displayText: 'Download' }, type: 1 });

      await conn.sendMessage(m.chat, { 
        image: { url: currentVid.thumbnail },
        caption: captionTeks,
        footer: footerTeks,
        buttons: buttons,
        headerType: 4 
      }, { quoted: m });

      return true;
    }

    if (/^(download|download_video)$/i.test(teks)) {
      let selectedVid = ytsData.videos[ytsData.currentIndex];
      m.reply(`⏳ _Sedang mengunduh video: *${selectedVid.title}*, mohon tunggu..._`);

      // Pasang flag agar user ga spam tombol
      ytsData.hasDownloaded = true; 

      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(selectedVid.url)}&apikey=${global.btc || btc}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp4) {
          await conn.sendMessage(m.chat, { 
            video: { url: result.result.mp4 },
            mimetype: 'video/mp4',
            caption: `🍟 *YT Search Downloader*\n🎬 ${selectedVid.title}`
          }, { quoted: m });
          
        } else {
          throw new Error('API gagal mengambil file media');
        }
      } catch (e) {
        m.reply('❌ Gagal mengunduh file media. API sedang bermasalah.');
        // Buka flag lagi kalau beneran error dari API, biar limit user ga rugi dicancel permanen
        ytsData.hasDownloaded = false; 
      }
      
      return true;
    }
  }

  // (Pendengar / Listener Spotify dihilangkan karena prosesnya otomatis langsung selesai)
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
