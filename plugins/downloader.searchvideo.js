const fetch = require('node-fetch');
const yts = require('yt-search');

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  switch (command) {

    // ================== PINTEREST ==================
    case 'pinterest': {
      if (!text) throw `*🚩 Example Pencarian:* \( {usedPrefix} \){command} Zhao Lusi\n*🚩 Example Download:* \( {usedPrefix} \){command} https://id.pinterest.com/pin/1234567890/`;
      
      if (text.match(/pin(?:terest)?(?:\.it|\.com)/i)) {
        m.reply(wait);
        try {
          let response = await fetch(`https://api.botcahx.eu.org/api/download/pinterest?url=\( {args[0]}&apikey= \){global.btc || btc}`);
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
          let response = await fetch(`https://api.botcahx.eu.org/api/search/pinterest?text1=\( {encodeURIComponent(text)}&apikey= \){global.btc || btc}`);
          let data = await response.json();   
          
          if (!data.result || data.result.length === 0) throw 'Gambar tidak ditemukan.';

          // Ambil maksimal 8 foto sesuai permintaan
          let images = data.result.slice(0, 8); 
          
          // Simpan data pencarian di memori bot untuk user ini + timeout 5 menit
          conn.pinterestSearch = conn.pinterestSearch || {};
          let pinSession = {
            query: text,
            urls: images,
            currentIndex: 0,
            timestamp: Date.now()
          };
          conn.pinterestSearch[m.sender] = pinSession;

          if (pinSession.timeout) clearTimeout(pinSession.timeout);
          pinSession.timeout = setTimeout(() => {
            if (conn.pinterestSearch[m.sender] === pinSession) {
              delete conn.pinterestSearch[m.sender];
            }
          }, 5 * 60 * 1000);

          let firstImage = images[0];
          let hasNext = images.length > 1;
          let captionText = `🍟 *Pinterest Search:* \( {text}\n📷 *Foto:* 1/ \){images.length}`;
          if (hasNext) {
            captionText += `\n\n💡 *Tekan tombol "📷Next Foto" untuk melihat foto selanjutnya.*`;
          } else {
            captionText += `\n\n✅ _Hanya 1 foto ditemukan._`;
          }

          let pinMsg = {
            image: { url: firstImage },
            caption: captionText
          };
          if (hasNext) {
            pinMsg.buttons = [
              { buttonId: 'next', buttonText: { displayText: '📷Next Foto' }, type: 1 }
            ];
            pinMsg.footer = '💡 Gunakan tombol untuk navigasi foto';
            pinMsg.headerType = 1;
          }

          await conn.sendMessage(m.chat, pinMsg, { quoted: m });
          
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
          const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=\( {args[0]}&apikey= \){global.btc || btc}`);
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
          const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=\( {encodeURIComponent(query)}&apikey= \){global.btc || btc}`);
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

    // ================== YOUTUBE AUDIO (MP3) ==================
    case 'ytmp3':
    case 'yta': {
      if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
      m.reply(wait);
      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=\( {encodeURIComponent(text)}&apikey= \){global.btc || btc}`);
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

    // ================== YOUTUBE SEARCH with BUTTONS (Next Video / Download) ==================
    case 'yts':
    case 'ytsearch': {
      if (!text) throw 'Cari apa?';
      m.reply(wait);
      try {
        let results = await yts(text);
        let videos = results.videos || []; 
        
        if (videos.length === 0) throw 'Video tidak ditemukan.';

        // Urutkan berdasarkan views tertinggi agar "Next Video" menampilkan yang lebih populer
        videos.sort((a, b) => (b.views || 0) - (a.views || 0));
        videos = videos.slice(0, 8); // Batasi 8 video untuk sesi

        // Simpan sesi YTS + timeout 5 menit
        conn.ytsSearch = conn.ytsSearch || {};
        let ytsSession = {
          query: text,
          videos: videos,
          currentIndex: 0,
          timestamp: Date.now()
        };
        conn.ytsSearch[m.sender] = ytsSession;

        if (ytsSession.timeout) clearTimeout(ytsSession.timeout);
        ytsSession.timeout = setTimeout(() => {
          if (conn.ytsSearch[m.sender] === ytsSession) {
            delete conn.ytsSearch[m.sender];
          }
        }, 5 * 60 * 1000);

        let currentVideo = videos[0];
        let infoTeks = `🔥 *Hasil Pencarian YT (Sorted by Views)*\n` +
                       `🔍 *Query:* ${text}\n\n` +
                       `📌 *Judul:* ${currentVideo.title}\n` +
                       `👁️ *Views:* ${currentVideo.views.toLocaleString()}x\n` +
                       `⏱️ *Durasi:* ${currentVideo.timestamp}\n` +
                       `👤 *Channel:* ${currentVideo.author?.name || 'Unknown'}\n` +
                       `🔗 *Link:* ${currentVideo.url}\n\n` +
                       `📹 *Video 1/${videos.length}*\n` +
                       `💡 *Gunakan tombol di bawah untuk Next atau Download:*`;

        let ytsMsg = {
          text: infoTeks,
          footer: 'Pilih aksi untuk video ini',
          buttons: [
            { buttonId: 'nextvid', buttonText: { displayText: '📼Next Video' }, type: 1 },
            { buttonId: 'downloadvid', buttonText: { displayText: '⬇Download' }, type: 1 }
          ],
          headerType: 1
        };

        await conn.sendMessage(m.chat, ytsMsg, { quoted: m });

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
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=\( {encodeURIComponent(text)}&apikey= \){global.btc || btc}`);
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
// Berfungsi untuk mendengarkan button clicks ("next", "nextvid", "downloadvid") dan "lagu X"
// Sesi otomatis expire setelah 5 menit tidak ada respon
handler.before = async (m, { conn }) => {
  if (m.isBaileys || !m.text) return;
  
  // Normalize button response (selectedButtonId) → m.text agar tombol berfungsi seperti ketikan
  if (m.message?.buttonsResponseMessage?.selectedButtonId) {
    m.text = m.message.buttonsResponseMessage.selectedButtonId;
  }
  
  let teks = m.text.toLowerCase();

  // --- LISTENER PINTEREST ("next") ---
  conn.pinterestSearch = conn.pinterestSearch || {};
  if (teks === 'next' && conn.pinterestSearch[m.sender]) {
    let pinData = conn.pinterestSearch[m.sender];

    // Cek expired session (5 menit)
    if (Date.now() - (pinData.timestamp || 0) > 5 * 60 * 1000) {
      if (pinData.timeout) clearTimeout(pinData.timeout);
      delete conn.pinterestSearch[m.sender];
      m.reply('⏰ Sesi Pinterest telah berakhir (5 menit). Silakan pencarian baru dengan .pinterest');
      return true;
    }

    // Reset timeout & timestamp karena user aktif
    if (pinData.timeout) clearTimeout(pinData.timeout);
    pinData.timestamp = Date.now();
    pinData.timeout = setTimeout(() => {
      if (conn.pinterestSearch[m.sender] === pinData) {
        delete conn.pinterestSearch[m.sender];
      }
    }, 5 * 60 * 1000);

    pinData.currentIndex += 1;

    // Cek apakah sudah melebihi jumlah foto yang disimpan (8 foto)
    if (pinData.currentIndex >= pinData.urls.length) {
      m.reply('✅ *Sudah mencapai foto terakhir dari pencarian ini.*');
      if (pinData.timeout) clearTimeout(pinData.timeout);
      delete conn.pinterestSearch[m.sender];
      return true;
    }

    let nextImageUrl = pinData.urls[pinData.currentIndex];
    let isLast = pinData.currentIndex === pinData.urls.length - 1;
    let captionText = `🍟 *Pinterest Search:* ${pinData.query}\n📷 *Foto:* \( {pinData.currentIndex + 1}/ \){pinData.urls.length}`;
    
    // Tambahkan info jika ini belum foto terakhir
    if (!isLast) {
      captionText += `\n\n💡 *Tekan tombol "📷Next Foto" untuk foto berikutnya.*`;
    } else {
      captionText += `\n\n✅ _Ini adalah foto terakhir._`;
      if (pinData.timeout) clearTimeout(pinData.timeout);
      delete conn.pinterestSearch[m.sender];
    }

    let nextPinMsg = {
      image: { url: nextImageUrl },
      caption: captionText
    };
    if (!isLast) {
      nextPinMsg.buttons = [
        { buttonId: 'next', buttonText: { displayText: '📷Next Foto' }, type: 1 }
      ];
      nextPinMsg.footer = '💡 Gunakan tombol untuk navigasi';
      nextPinMsg.headerType = 1;
    }

    await conn.sendMessage(m.chat, nextPinMsg, { quoted: m });

    return true;
  }

  // --- LISTENER YTS (button "nextvid" & "downloadvid") ---
  conn.ytsSearch = conn.ytsSearch || {};
  let ytsData = conn.ytsSearch[m.sender];
  if (ytsData) {
    if (Date.now() - (ytsData.timestamp || 0) > 5 * 60 * 1000) {
      if (ytsData.timeout) clearTimeout(ytsData.timeout);
      delete conn.ytsSearch[m.sender];
      m.reply('⏰ Sesi YTS telah kadaluarsa (5 menit). Silakan lakukan .yts <query> lagi.');
      return true;
    }
  }

  if (teks === 'nextvid' && ytsData) {
    // Reset timeout karena interaksi
    if (ytsData.timeout) clearTimeout(ytsData.timeout);
    ytsData.timestamp = Date.now();
    ytsData.timeout = setTimeout(() => {
      if (conn.ytsSearch[m.sender] === ytsData) {
        delete conn.ytsSearch[m.sender];
      }
    }, 5 * 60 * 1000);

    ytsData.currentIndex = (ytsData.currentIndex + 1) % ytsData.videos.length;

    let currentVideo = ytsData.videos[ytsData.currentIndex];
    let infoTeks = `🔥 *Video Selanjutnya (by Views)*\n` +
                   `🔍 *Query:* ${ytsData.query}\n\n` +
                   `📌 *Judul:* ${currentVideo.title}\n` +
                   `👁️ *Views:* ${currentVideo.views.toLocaleString()}x\n` +
                   `⏱️ *Durasi:* ${currentVideo.timestamp}\n` +
                   `👤 *Channel:* ${currentVideo.author?.name || 'Unknown'}\n` +
                   `🔗 *Link:* ${currentVideo.url}\n\n` +
                   `📹 *Video \( {ytsData.currentIndex + 1}/ \){ytsData.videos.length}*\n` +
                   `💡 *Gunakan tombol di bawah:*`;

    let ytsMsg = {
      text: infoTeks,
      footer: 'Pilih aksi',
      buttons: [
        { buttonId: 'nextvid', buttonText: { displayText: '📼Next Video' }, type: 1 },
        { buttonId: 'downloadvid', buttonText: { displayText: '⬇Download' }, type: 1 }
      ],
      headerType: 1
    };

    await conn.sendMessage(m.chat, ytsMsg, { quoted: m });
    return true;
  }

  if (teks === 'downloadvid' && ytsData) {
    // Reset timeout
    if (ytsData.timeout) clearTimeout(ytsData.timeout);
    ytsData.timestamp = Date.now();
    ytsData.timeout = setTimeout(() => {
      if (conn.ytsSearch[m.sender] === ytsData) {
        delete conn.ytsSearch[m.sender];
      }
    }, 5 * 60 * 1000);

    let currentVideo = ytsData.videos[ytsData.currentIndex];
    m.reply(wait);
    try {
      const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=\( {encodeURIComponent(currentVideo.url)}&apikey= \){global.btc || btc}`);
      const result = await response.json();

      if (result.status && result.result && result.result.mp4) {
        await conn.sendMessage(m.chat, { 
          video: { url: result.result.mp4 }, 
          mimetype: 'video/mp4',
          caption: `🍟 *YT Search Downloader*\n🎬 ${currentVideo.title}\n👁️ ${currentVideo.views.toLocaleString()} views`
        }, { quoted: m });
      } else {
        m.reply('🚩 Gagal mengunduh video dari server API.');
      }
    } catch (error) {
      m.reply(eror);
    }
    // Sesi tetap aktif setelah download (bisa next atau download lagi sampai timeout)
    return true;
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
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=\( {url}&apikey= \){global.btc || btc}`);
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