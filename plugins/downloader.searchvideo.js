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

          let images = data.result.slice(0, 8);
          
          conn.pinterestSearch = conn.pinterestSearch || {};
          conn.pinterestSearch[m.sender] = {
            query: text,
            urls: images,
            currentIndex: 0,
            timeout: Date.now() + 300000 
          };

          let firstImage = images[0];
          let captionText = `🍟 *Pinterest Search:* ${text}\n📷 *Foto:* 1/${images.length}\n\n💡 _Gunakan tombol di bawah atau ketik *Next Foto* untuk melihat foto selanjutnya._`;

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
          
          // Simpan dengan penanda hasDownloaded untuk mencegah multi-download
          conn.spotifySearch = conn.spotifySearch || {};
          conn.spotifySearch[m.sender] = {
            results: res,
            hasDownloaded: false,
            timeout: Date.now() + 300000 
          };

          let teks = `🎵 *Hasil Pencarian Spotify: ${query}*\n\n`;
          let buttons = [];

          for (let i = 0; i < res.length; i++) {
            teks += `*${i + 1}.* ${res[i].title}\n`;
            teks += `   ∘ Duration: ${res[i].duration}\n`;
            teks += `   ∘ Popularity: ${res[i].popularity}\n\n`;
            
            // Tambahkan tombol untuk masing-masing lagu
            buttons.push({ buttonId: `lagu_${i+1}`, buttonText: { displayText: `Lagu ${i+1}` }, type: 1 });
          }
          
          await conn.sendMessage(m.chat, { 
            text: teks,
            footer: "💡 Pilih lagu untuk didownload (Batas 1 Lagu)",
            buttons: buttons,
            headerType: 1
          }, { quoted: m });
          
        } catch (e) {
          throw `🚩 ${eror}`;
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
          hasDownloaded: false // Penanda belum download
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

  // --- LISTENER PINTEREST ("next foto") ---
  conn.pinterestSearch = conn.pinterestSearch || {};
  if ((teks === 'next' || teks === 'next foto') && conn.pinterestSearch[m.sender]) {
    let pinData = conn.pinterestSearch[m.sender];

    if (Date.now() > pinData.timeout) {
      m.reply('⏱️ *Sesi Pinterest kamu telah berakhir (Batas 5 menit).* Silakan cari ulang.');
      delete conn.pinterestSearch[m.sender];
      return true;
    }

    pinData.currentIndex += 1;

    if (pinData.currentIndex >= pinData.urls.length) {
      m.reply('✅ *Sudah mencapai 8 foto maksimal dari pencarian ini.*');
      delete conn.pinterestSearch[m.sender];
      return true;
    }

    let nextImageUrl = pinData.urls[pinData.currentIndex];
    let isLast = pinData.currentIndex === pinData.urls.length - 1;
    let captionText = `🍟 *Pinterest Search:* ${pinData.query}\n📷 *Foto:* ${pinData.currentIndex + 1}/${pinData.urls.length}`;
    
    let buttons = [];

    if (!isLast) {
      captionText += `\n\n💡 _Gunakan tombol di bawah atau ketik *Next Foto* untuk melihat foto selanjutnya._`;
      buttons.push({ buttonId: 'next_foto', buttonText: { displayText: 'Next Foto' }, type: 1 });
    } else {
      captionText += `\n\n✅ _Ini adalah foto terakhir (Batas 8 foto)._`;
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

  // --- LISTENER YOUTUBE SEARCH ("next video" & "download") ---
  conn.ytsSearch = conn.ytsSearch || {};
  if ((teks === 'next video' || teks === 'download') && conn.ytsSearch[m.sender]) {
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

    if (teks === 'next video') {
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

    if (teks === 'download') {
      let selectedVid = ytsData.videos[ytsData.currentIndex];
      m.reply(`⏳ _Sedang mengunduh video: *${selectedVid.title}*, mohon tunggu..._`);

      // KUNCI SESI
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
          m.reply('❌ Gagal mengunduh file media dari server API.');
        }
      } catch (e) {
        m.reply('❌ Terjadi kesalahan saat mengunduh.');
      }
      
      return true;
    }
  }

  // --- LISTENER SPOTIFY ("lagu 1", "lagu 2", dst) ---
  conn.spotifySearch = conn.spotifySearch || {};
  let matchSpotify = teks.match(/^lagu\s+([1-5])$/);
  
  if (matchSpotify && conn.spotifySearch[m.sender]) {
    let spotifyData = conn.spotifySearch[m.sender];
    
    // Cek apakah user sudah mengunduh lagu sebelumnya di sesi ini
    if (spotifyData.hasDownloaded) {
      m.reply('⚠️ Mohon Cari Pencarian Lain Karna Kau Sudah Download Lagu Tersebut');
      delete conn.spotifySearch[m.sender]; 
      return true;
    }

    // Cek timeout
    if (Date.now() > spotifyData.timeout) {
      m.reply('⏱️ *Sesi Spotify kamu telah berakhir (Batas 5 menit).* Silakan cari ulang.');
      delete conn.spotifySearch[m.sender];
      return true;
    }

    let index = parseInt(matchSpotify[1]) - 1;
    let data = spotifyData.results;
    
    if (!data[index]) {
       m.reply('Pilihan lagu tidak ada di daftar. Silakan cari ulang.');
       return true;
    }
    
    // KUNCI SESI (Tandai telah di download)
    spotifyData.hasDownloaded = true;

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
