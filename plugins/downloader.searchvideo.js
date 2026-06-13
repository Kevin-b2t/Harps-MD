const fetch = require('node-fetch');
const yts = require('yt-search');

// ================== HELPER: TIMEOUT SESI (5 MENIT) ==================
// Otomatis hapus sesi user jika tidak ada respon dalam 5 menit
function setSesiTimeout(conn, sender, type) {
  const key = `${type}Timeout`;
  conn[key] = conn[key] || {};

  // Bersihkan timeout lama jika ada
  if (conn[key][sender]) clearTimeout(conn[key][sender]);

  conn[key][sender] = setTimeout(() => {
    if (type === 'pinterest' && conn.pinterestSearch?.[sender]) {
      delete conn.pinterestSearch[sender];
    }
    if (type === 'yts' && conn.ytsSearch?.[sender]) {
      delete conn.ytsSearch[sender];
    }
    delete conn[key][sender];
  }, 5 * 60 * 1000); // 5 menit
}

function clearSesiTimeout(conn, sender, type) {
  const key = `${type}Timeout`;
  conn[key] = conn[key] || {};
  if (conn[key][sender]) {
    clearTimeout(conn[key][sender]);
    delete conn[key][sender];
  }
}

// ================== HELPER: KIRIM PESAN DENGAN BUTTON ==================
async function sendWithButtons(conn, chatId, quotedMsg, imageUrl, caption, buttons) {
  // Coba kirim dengan button interaktif (WhatsApp)
  // Jika gagal (misalnya bot tidak support), fallback ke teks biasa
  try {
    if (imageUrl) {
      await conn.sendMessage(chatId, {
        image: { url: imageUrl },
        caption: caption,
        buttons: buttons,
        headerType: 4,
        footer: '⏱️ Sesi aktif 5 menit'
      }, { quoted: quotedMsg });
    } else {
      await conn.sendMessage(chatId, {
        text: caption,
        buttons: buttons,
        footer: '⏱️ Sesi aktif 5 menit'
      }, { quoted: quotedMsg });
    }
  } catch (e) {
    // Fallback: kirim teks tanpa button
    let fallbackText = caption + '\n\n' + buttons.map(b => `• Ketik: *${b.buttonText.displayText}*`).join('\n');
    if (imageUrl) {
      await conn.sendMessage(chatId, {
        image: { url: imageUrl },
        caption: fallbackText
      }, { quoted: quotedMsg });
    } else {
      await conn.reply(chatId, fallbackText, quotedMsg);
    }
  }
}

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

          // Ambil maksimal 10 foto
          let images = data.result.slice(0, 10);

          // Simpan sesi pencarian
          conn.pinterestSearch = conn.pinterestSearch || {};
          conn.pinterestSearch[m.sender] = {
            query: text,
            urls: images,
            currentIndex: 0,
            chat: m.chat
          };

          // Set timeout 5 menit
          setSesiTimeout(conn, m.sender, 'pinterest');

          let captionText = `🍟 *Pinterest Search:* ${text}\n📷 *Foto:* 1/${images.length}`;

          let buttons = [
            { buttonId: 'pinterest_next', buttonText: { displayText: '📸 Next Foto' }, type: 1 }
          ];

          await sendWithButtons(conn, m.chat, m, images[0], captionText, buttons);

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

    // ================== YOUTUBE SEARCH (10 HASIL + BUTTON) ==================
    case 'yts':
    case 'ytsearch': {
      if (!text) throw '🔍 Cari video apa? Contoh: *!yts Dewa 19*';
      m.reply(wait);
      try {
        let results = await yts(text);
        let videos = results.videos.slice(0, 10); // Ambil 10 video

        if (!videos || videos.length === 0) throw 'Video tidak ditemukan.';

        // Simpan sesi pencarian YTS
        conn.ytsSearch = conn.ytsSearch || {};
        conn.ytsSearch[m.sender] = {
          query: text,
          videos: videos,
          currentIndex: 0,
          chat: m.chat
        };

        // Set timeout 5 menit
        setSesiTimeout(conn, m.sender, 'yts');

        let v = videos[0];
        let caption = `🎬 *YouTube Search: ${text}*\n\n` +
          `📌 *[1/${videos.length}] ${v.title}*\n` +
          `👁️ Views: ${v.views?.toLocaleString() || 'N/A'}\n` +
          `⏱️ Durasi: ${v.timestamp}\n` +
          `🔗 ${v.url}`;

        let buttons = [
          { buttonId: 'yts_next', buttonText: { displayText: '▶️ Next Video' }, type: 1 },
          { buttonId: 'yts_download', buttonText: { displayText: '⬇️ Download' }, type: 1 }
        ];

        // Kirim dengan thumbnail jika ada
        let thumbUrl = v.thumbnail || null;
        await sendWithButtons(conn, m.chat, m, thumbUrl, caption, buttons);

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

  // ===== LISTENER PINTEREST =====
  conn.pinterestSearch = conn.pinterestSearch || {};

  // Cek button response atau ketikan "next foto" / "next"
  let isPinterestNext = teks === 'next foto' || teks === 'next' ||
    m.selectedButtonId === 'pinterest_next';

  if (isPinterestNext && conn.pinterestSearch[m.sender]) {
    let pinData = conn.pinterestSearch[m.sender];
    pinData.currentIndex += 1;

    if (pinData.currentIndex >= pinData.urls.length) {
      clearSesiTimeout(conn, m.sender, 'pinterest');
      delete conn.pinterestSearch[m.sender];
      m.reply('✅ *Sudah mencapai foto terakhir dari pencarian ini.*');
      return true;
    }

    // Reset timeout karena user masih aktif
    setSesiTimeout(conn, m.sender, 'pinterest');

    let nextImageUrl = pinData.urls[pinData.currentIndex];
    let isLast = pinData.currentIndex === pinData.urls.length - 1;
    let captionText = `🍟 *Pinterest Search:* ${pinData.query}\n📷 *Foto:* ${pinData.currentIndex + 1}/${pinData.urls.length}`;

    if (isLast) {
      captionText += `\n\n✅ _Ini adalah foto terakhir._`;
      clearSesiTimeout(conn, m.sender, 'pinterest');
      delete conn.pinterestSearch[m.sender];
      await conn.sendMessage(m.chat, {
        image: { url: nextImageUrl },
        caption: captionText
      }, { quoted: m });
    } else {
      let buttons = [
        { buttonId: 'pinterest_next', buttonText: { displayText: '📸 Next Foto' }, type: 1 }
      ];
      await sendWithButtons(conn, m.chat, m, nextImageUrl, captionText, buttons);
    }

    return true;
  }

  // ===== LISTENER YTS (NEXT VIDEO / DOWNLOAD) =====
  conn.ytsSearch = conn.ytsSearch || {};

  let isYtsNext = teks === 'next video' || teks === 'next' ||
    m.selectedButtonId === 'yts_next';
  let isYtsDownload = teks === 'download' ||
    m.selectedButtonId === 'yts_download';

  if ((isYtsNext || isYtsDownload) && conn.ytsSearch[m.sender]) {
    let ytsData = conn.ytsSearch[m.sender];

    // --- DOWNLOAD video yang sedang ditampilkan ---
    if (isYtsDownload) {
      let currentVideo = ytsData.videos[ytsData.currentIndex];
      m.reply(`⏳ *Mengunduh video...*\n🎬 ${currentVideo.title}`);

      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(currentVideo.url)}&apikey=${global.btc || btc}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp4) {
          await conn.sendMessage(m.chat, {
            video: { url: result.result.mp4 },
            mimetype: 'video/mp4',
            caption: `🍟 *YT Search Downloader*\n🎬 ${currentVideo.title}`
          }, { quoted: m });
          // Hapus sesi setelah download berhasil
          clearSesiTimeout(conn, m.sender, 'yts');
          delete conn.ytsSearch[m.sender];
        } else {
          m.reply('❌ Gagal mengunduh video. Coba video lain atau gunakan link langsung.');
        }
      } catch (e) {
        m.reply('❌ Gagal mengunduh. API sedang bermasalah.');
      }
      return true;
    }

    // --- NEXT VIDEO ---
    if (isYtsNext) {
      ytsData.currentIndex += 1;

      if (ytsData.currentIndex >= ytsData.videos.length) {
        clearSesiTimeout(conn, m.sender, 'yts');
        delete conn.ytsSearch[m.sender];
        m.reply('✅ *Sudah mencapai video terakhir dari hasil pencarian ini.*');
        return true;
      }

      // Reset timeout karena user masih aktif
      setSesiTimeout(conn, m.sender, 'yts');

      let v = ytsData.videos[ytsData.currentIndex];
      let isLast = ytsData.currentIndex === ytsData.videos.length - 1;

      let caption = `🎬 *YouTube Search: ${ytsData.query}*\n\n` +
        `📌 *[${ytsData.currentIndex + 1}/${ytsData.videos.length}] ${v.title}*\n` +
        `👁️ Views: ${v.views?.toLocaleString() || 'N/A'}\n` +
        `⏱️ Durasi: ${v.timestamp}\n` +
        `🔗 ${v.url}`;

      if (isLast) {
        caption += `\n\n✅ _Ini adalah video terakhir._`;
        // Tetap bisa download video terakhir
        let buttons = [
          { buttonId: 'yts_download', buttonText: { displayText: '⬇️ Download' }, type: 1 }
        ];
        let thumbUrl = v.thumbnail || null;
        await sendWithButtons(conn, m.chat, m, thumbUrl, caption, buttons);
        // Hapus sesi next, tapi biarkan download masih bisa
        // (sesi tetap ada untuk tombol download)
      } else {
        let buttons = [
          { buttonId: 'yts_next', buttonText: { displayText: '▶️ Next Video' }, type: 1 },
          { buttonId: 'yts_download', buttonText: { displayText: '⬇️ Download' }, type: 1 }
        ];
        let thumbUrl = v.thumbnail || null;
        await sendWithButtons(conn, m.chat, m, thumbUrl, caption, buttons);
      }

      return true;
    }
  }

  // ===== LISTENER SPOTIFY =====
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
