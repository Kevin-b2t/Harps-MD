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
            currentIndex: 0
          };

          let firstImage = images[0];
          let captionText = `🍟 *Pinterest Search:* ${text}\n📷 *Foto:* 1/${images.length}`;

          // Format pesan dengan tombol (Buttons)
          await conn.sendMessage(m.chat, { 
            image: { url: firstImage }, 
            caption: captionText,
            footer: 'Pilih opsi di bawah ini:',
            buttons: [
              { buttonId: 'pin_next', buttonText: { displayText: '📷Next Foto' }, type: 1 }
            ],
            headerType: 4
          }, { quoted: m });
          
        } catch (e) {
          throw eror;
        }
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

        // Simpan data pencarian di memori bot untuk user ini
        conn.ytsSearch = conn.ytsSearch || {};
        conn.ytsSearch[m.sender] = {
          query: text,
          videos: videos,
          currentIndex: 0
        };

        let currentVid = videos[0];
        let infoTeks = `🔥 *YT Search Result*\n\n` +
                       `📌 *Judul:* ${currentVid.title}\n` +
                       `👁️ *Views:* ${currentVid.views.toLocaleString()}x ditonton\n` +
                       `⏱️ *Durasi:* ${currentVid.timestamp}\n` +
                       `🔗 *Link:* ${currentVid.url}`;
        
        // Format pesan dengan 2 tombol
        await conn.sendMessage(m.chat, { 
            image: { url: currentVid.thumbnail }, 
            caption: infoTeks,
            footer: 'Pilih opsi di bawah ini:',
            buttons: [
              { buttonId: 'yts_next', buttonText: { displayText: '🎥Next Video' }, type: 1 },
              { buttonId: 'yts_dl', buttonText: { displayText: '⬇Download' }, type: 1 }
            ],
            headerType: 4
        }, { quoted: m });

      } catch (e) {
        throw eror;
      }
      break;
    }

    // ================== YOUTUBE AUDIO & VIDEO ==================
    case 'ytmp3':
    case 'yta': {
      if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
      m.reply(wait);
      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
        const result = await response.json();
        if (result.status && result.result && result.result.mp3) {
          await conn.sendMessage(m.chat, { audio: { url: result.result.mp3 }, mimetype: 'audio/mpeg' }, { quoted: m });
        } else throw 'Error: Unable to fetch audio';
      } catch (error) { throw eror; }
      break;
    }

    case 'ytmp4':
    case 'ytv': {
      if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
      m.reply(wait);
      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
        const result = await response.json();
        if (result.status && result.result && result.result.mp4) {
          await conn.sendMessage(m.chat, { video: { url: result.result.mp4 }, mimetype: 'video/mp4' }, { quoted: m });
        } else throw 'Error: Unable to fetch video';
      } catch (error) { throw eror; }
      break;
    }
  }
};

// ================== LISTENER (TOMBOL BERFUNGSI DI SINI) ==================
handler.before = async (m, { conn }) => {
  if (m.isBaileys || !m.text) return;
  
  let teks = m.text.toLowerCase();

  // --- LISTENER PINTEREST ---
  conn.pinterestSearch = conn.pinterestSearch || {};
  // Menangkap balasan dari tombol atau ketikan manual
  if ((teks === '📷next foto' || teks === 'next foto' || teks === 'pin_next') && conn.pinterestSearch[m.sender]) {
    let pinData = conn.pinterestSearch[m.sender];
    pinData.currentIndex += 1;

    if (pinData.currentIndex >= pinData.urls.length) {
      m.reply('✅ *Sudah mencapai foto terakhir dari pencarian ini.*');
      delete conn.pinterestSearch[m.sender]; 
      return true;
    }

    let nextImageUrl = pinData.urls[pinData.currentIndex];
    let isLast = pinData.currentIndex === pinData.urls.length - 1;
    let captionText = `🍟 *Pinterest Search:* ${pinData.query}\n📷 *Foto:* ${pinData.currentIndex + 1}/${pinData.urls.length}`;
    
    let msgConfig = {
        image: { url: nextImageUrl },
        caption: captionText,
        headerType: 4
    };

    // Tetap kasih tombol kalau belum foto terakhir
    if (!isLast) {
        msgConfig.footer = 'Pilih opsi di bawah ini:';
        msgConfig.buttons = [{ buttonId: 'pin_next', buttonText: { displayText: '📷Next Foto' }, type: 1 }];
    } else {
        msgConfig.caption += `\n\n✅ _Ini adalah foto terakhir._`;
        delete conn.pinterestSearch[m.sender];
    }

    await conn.sendMessage(m.chat, msgConfig, { quoted: m });
    return true;
  }

  // --- LISTENER YTS (YOUTUBE SEARCH) ---
  conn.ytsSearch = conn.ytsSearch || {};
  
  if (conn.ytsSearch[m.sender]) {
    let ytsData = conn.ytsSearch[m.sender];

    // Jika user klik "Next Video"
    if (teks === '🎥next video' || teks === 'next video' || teks === 'yts_next') {
        ytsData.currentIndex += 1;

        if (ytsData.currentIndex >= ytsData.videos.length) {
            m.reply('✅ *Ini adalah hasil video terakhir dari pencarian.*');
            delete conn.ytsSearch[m.sender];
            return true;
        }

        let currentVid = ytsData.videos[ytsData.currentIndex];
        let infoTeks = `🔥 *YT Search Result*\n\n` +
                       `📌 *Judul:* ${currentVid.title}\n` +
                       `👁️ *Views:* ${currentVid.views.toLocaleString()}x ditonton\n` +
                       `⏱️ *Durasi:* ${currentVid.timestamp}\n` +
                       `🔗 *Link:* ${currentVid.url}`;

        await conn.sendMessage(m.chat, { 
            image: { url: currentVid.thumbnail }, 
            caption: infoTeks,
            footer: 'Pilih opsi di bawah ini:',
            buttons: [
              { buttonId: 'yts_next', buttonText: { displayText: '🎥Next Video' }, type: 1 },
              { buttonId: 'yts_dl', buttonText: { displayText: '⬇Download' }, type: 1 }
            ],
            headerType: 4
        }, { quoted: m });
        
        return true;
    }

    // Jika user klik "Download"
    if (teks === '⬇download' || teks === 'download' || teks === 'yts_dl') {
        let currentVid = ytsData.videos[ytsData.currentIndex];
        m.reply(`⏳ _Sedang mengunduh video: *${currentVid.title}*, mohon tunggu..._`);
        
        try {
            const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(currentVid.url)}&apikey=${global.btc || btc}`);
            const result = await response.json();

            if (result.status && result.result && result.result.mp4) {
                await conn.sendMessage(m.chat, { 
                    video: { url: result.result.mp4 }, 
                    mimetype: 'video/mp4',
                    caption: `🎬 ${currentVid.title}`
                }, { quoted: m });
                
                // Hapus sesi setelah didownload agar memori bersih
                delete conn.ytsSearch[m.sender];
            } else {
                throw 'Gagal mengunduh file media dari server API.';
            }
        } catch (e) {
            m.reply('Gagal mendownload video. Silakan coba lagi nanti.');
        }
        return true;
    }
  }
};

// ================== KONFIGURASI ==================
handler.help = ['pinterest <keyword>', 'ytmp3 <url>', 'ytmp4 <url>', 'yts <query>'];
handler.tags = ['downloader', 'internet'];
handler.command = /^(pinterest|ytmp3|yta|yts(earch)?|ytmp4|ytv)$/i;

handler.limit = true;
handler.premium = false;

module.exports = handler;
