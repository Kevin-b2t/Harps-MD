const fetch = require('node-fetch');
const yts = require('yt-search');

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  const timeoutMs = 5 * 60 * 1000; // Sesi 5 Menit

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

          let images = data.result.slice(0, 10); 
          
          conn.pinterestSearch = conn.pinterestSearch || {};
          if (conn.pinterestSearch[m.sender]) clearTimeout(conn.pinterestSearch[m.sender].timer);

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
          let captionText = `🍟 *Pinterest Search:* ${text}\n📷 *Foto:* 1/${images.length}\n⏳ Sesi berlaku 5 menit`;

          await conn.sendMessage(m.chat, { 
            image: { url: firstImage }, 
            caption: captionText,
            footer: 'Pinterest Search',
            buttons: [
              { buttonId: 'next_foto', buttonText: { displayText: 'Next Foto' }, type: 1 }
            ],
            headerType: 4
          }, { quoted: m });
          
        } catch (e) {
          throw eror;
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

        let topVideos = videos.slice(0, 10);
        
        conn.ytsSearch = conn.ytsSearch || {};
        if (conn.ytsSearch[m.sender]) clearTimeout(conn.ytsSearch[m.sender].timer);

        conn.ytsSearch[m.sender] = {
          query: text,
          videos: topVideos,
          currentIndex: 0,
          downloaded: false, 
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
                       `⏳ Sesi berlaku 5 menit • Item 1/${topVideos.length}`;
        
        await conn.sendMessage(m.chat, { 
          image: { url: v.thumbnail }, 
          caption: infoTeks,
          footer: 'YTS Downloader',
          buttons: [
            { buttonId: 'next_video', buttonText: { displayText: 'Next Video' }, type: 1 },
            { buttonId: 'download_video', buttonText: { displayText: 'Download' }, type: 1 }
          ],
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

// ================== LISTENER BUTTON (HANDLER.BEFORE) ==================
handler.before = async (m, { conn }) => {
  if (m.isBaileys) return; 
  
  // Ambil teks dari input biasa ATAU ID dari tombol langsung dari payload
  let teks = m.text || '';
  if (m.message && m.message.buttonsResponseMessage && m.message.buttonsResponseMessage.selectedButtonId) {
      teks = m.message.buttonsResponseMessage.selectedButtonId;
  } else if (m.message && m.message.templateButtonReplyMessage && m.message.templateButtonReplyMessage.selectedId) {
      teks = m.message.templateButtonReplyMessage.selectedId;
  } else if (m.message && m.message.interactiveResponseMessage) {
      try {
          let params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
          if (params && params.id) teks = params.id;
      } catch (e) {}
  }

  // Jika setelah dibongkar tetap tidak ada pesan/ID, hentikan
  if (!teks) return;

  teks = teks.toLowerCase().trim();
  const timeoutMs = 5 * 60 * 1000; 

  // Pengecekan kata kunci atau buttonId (Jauh lebih kebal)
  let isNextFoto = teks.includes('next foto') || teks.includes('next_foto');
  let isYtsNext = teks.includes('next video') || teks.includes('next_video');
  let isYtsDownload = teks.includes('download') || teks.includes('download_video');

  // --- LISTENER PINTEREST ---
  conn.pinterestSearch = conn.pinterestSearch || {};
  if (isNextFoto && conn.pinterestSearch[m.sender]) {
    let pinData = conn.pinterestSearch[m.sender];
    pinData.currentIndex += 1;

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
    
    let msgConfig = {
      image: { url: nextImageUrl }, 
      caption: captionText,
      footer: 'Pinterest Search',
      headerType: 4
    };

    if (!isLast) {
      msgConfig.buttons = [
        { buttonId: 'next_foto', buttonText: { displayText: 'Next Foto' }, type: 1 }
      ];
    } else {
      msgConfig.caption += `\n\n✅ _Ini adalah foto terakhir._`;
      delete conn.pinterestSearch[m.sender]; 
    }

    await conn.sendMessage(m.chat, msgConfig, { quoted: m });
    return true;
  }

  // --- LISTENER YTS ---
  conn.ytsSearch = conn.ytsSearch || {};
  if ((isYtsNext || isYtsDownload) && conn.ytsSearch[m.sender]) {
    let ytData = conn.ytsSearch[m.sender];

    if (ytData.downloaded) {
      m.reply('⚠️ *Ketik Perintah Lagi Untuk Mencari Pencarian Lainnya*');
      return true;
    }

    if (isYtsNext) {
      ytData.currentIndex += 1;

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
                     `⏳ Sesi berlaku 5 menit • Item ${ytData.currentIndex + 1}/${ytData.videos.length}`;

      await conn.sendMessage(m.chat, { 
        image: { url: v.thumbnail }, 
        caption: infoTeks,
        footer: 'YTS Downloader',
        buttons: [
          { buttonId: 'next_video', buttonText: { displayText: 'Next Video' }, type: 1 },
          { buttonId: 'download_video', buttonText: { displayText: 'Download' }, type: 1 }
        ],
        headerType: 4
      }, { quoted: m });

      return true;
    }

    if (isYtsDownload) {
      let v = ytData.videos[ytData.currentIndex];
      m.reply(`⏳ _Sedang mengunduh video: *${v.title}*, mohon tunggu..._`);
      
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
};

// ================== KONFIGURASI PLUGIN ==================
handler.help = [
  'pinterest <keyword/url>', 
  'ytmp3 <url>', 
  'ytmp4 <url>', 
  'yts <query>'
];
handler.tags = ['downloader', 'internet', 'tools'];
handler.command = /^(pinterest|ytmp3|yta|yts(earch)?|ytmp4|ytv)$/i;

handler.limit = true;
handler.exp = 0;
handler.premium = false;

module.exports = handler;
