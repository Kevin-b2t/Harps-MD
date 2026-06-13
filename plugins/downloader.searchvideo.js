const fetch = require('node-fetch');
const yts = require('yt-search');

// ================== TIMEOUT SESI 5 MENIT ==================
function setSesiTimeout(conn, sender, type) {
  const key = `_timeout_${type}`;
  conn[key] = conn[key] || {};
  if (conn[key][sender]) clearTimeout(conn[key][sender]);
  conn[key][sender] = setTimeout(() => {
    if (type === 'pinterest') delete conn.pinterestSearch?.[sender];
    if (type === 'yts') delete conn.ytsSearch?.[sender];
    delete conn[key][sender];
  }, 5 * 60 * 1000);
}

function clearSesiTimeout(conn, sender, type) {
  const key = `_timeout_${type}`;
  conn[key] = conn[key] || {};
  if (conn[key][sender]) { clearTimeout(conn[key][sender]); delete conn[key][sender]; }
}

// ================== KIRIM GAMBAR + TEMPLATE BUTTONS ==================
// templateButtons masih berfungsi di Baileys MD (quickReplyButton)
async function sendImageWithTemplateButtons(conn, chatId, quoted, imageUrl, caption, btns) {
  /*
   * btns = array of { display: 'Label', id: 'callback_id' }
   * Akan coba 3 metode secara urut:
   *   1. templateButtons (paling kompatibel di WhatsApp MD)
   *   2. listMessage sebagai fallback
   *   3. Teks biasa dengan instruksi ketik
   */
  const templateButtons = btns.map((b, i) => ({
    index: i + 1,
    quickReplyButton: {
      displayText: b.display,
      id: b.id
    }
  }));

  try {
    if (imageUrl) {
      await conn.sendMessage(chatId, {
        image: { url: imageUrl },
        caption: caption,
        footer: '⏱️ Sesi aktif 5 menit',
        templateButtons
      }, { quoted });
    } else {
      await conn.sendMessage(chatId, {
        text: caption,
        footer: '⏱️ Sesi aktif 5 menit',
        templateButtons
      }, { quoted });
    }
  } catch (e1) {
    // Fallback: teks biasa dengan instruksi
    const instruksi = btns.map(b => `› Ketik *${b.display}*`).join('\n');
    const fullCaption = `${caption}\n\n${instruksi}`;
    try {
      if (imageUrl) {
        await conn.sendMessage(chatId, { image: { url: imageUrl }, caption: fullCaption }, { quoted });
      } else {
        await conn.sendMessage(chatId, { text: fullCaption }, { quoted });
      }
    } catch (e2) {
      console.error('[sendImageWithTemplateButtons] Semua metode gagal:', e2);
    }
  }
}

// ================== CEK APAKAH PESAN ADALAH BUTTON RESPONSE ==================
function getButtonResponseId(m) {
  // Baileys menyimpan respons template button di sini
  return m.message?.templateButtonReplyMessage?.selectedId ||
    m.message?.buttonsResponseMessage?.selectedButtonId ||
    null;
}

// ================== MAIN HANDLER ==================
let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  switch (command) {

    // ============================================================
    // PINTEREST
    // ============================================================
    case 'pinterest': {
      if (!text) throw `*🚩 Pencarian:* ${usedPrefix}${command} Zhao Lusi\n*🚩 Download:* ${usedPrefix}${command} https://id.pinterest.com/pin/xxx/`;

      if (text.match(/pin(?:terest)?(?:\.it|\.com)/i)) {
        // MODE DOWNLOAD URL
        m.reply(wait);
        try {
          let res = await fetch(`https://api.botcahx.eu.org/api/download/pinterest?url=${args[0]}&apikey=${global.btc || btc}`);
          let json = await res.json();
          if (json.status && json.result) {
            let mediaUrl = json.result.url || json.result.result || json.result;
            await conn.sendFile(m.chat, mediaUrl, 'pinterest.jpg', '🍟 *Pinterest Downloader*', m);
          } else throw 'Gagal mengambil data dari URL Pinterest.';
        } catch (e) { throw `🚩 ${eror}`; }

      } else {
        // MODE SEARCH
        m.reply(wait);
        try {
          let res = await fetch(`https://api.botcahx.eu.org/api/search/pinterest?text1=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
          let data = await res.json();

          if (!data.result || data.result.length === 0) throw 'Gambar tidak ditemukan.';

          let images = data.result.slice(0, 10);

          conn.pinterestSearch = conn.pinterestSearch || {};
          conn.pinterestSearch[m.sender] = {
            query: text,
            urls: images,
            currentIndex: 0,
            chat: m.chat
          };
          setSesiTimeout(conn, m.sender, 'pinterest');

          let caption = `🍟 *Pinterest Search:* ${text}\n📷 *Foto:* 1/${images.length}\n\n› Ketik *next foto* atau tekan tombol di bawah`;

          await sendImageWithTemplateButtons(conn, m.chat, m, images[0], caption, [
            { display: '📸 Next Foto', id: 'pinterest_next' }
          ]);

        } catch (e) { throw eror; }
      }
      break;
    }

    // ============================================================
    // SPOTIFY
    // ============================================================
    case 'spotify': {
      if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nContoh: ${usedPrefix + command} payung teduh`;

      if (args[0].match(/https:\/\/open\.spotify\.com/i)) {
        m.reply(wait);
        try {
          const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${args[0]}&apikey=${global.btc || btc}`);
          let jsons = await res.json();
          const { title, duration, url } = jsons.result.data;
          const { id, type } = jsons.result.data.artist;
          await conn.reply(m.chat, `∘ Title: ${title}\n∘ Id: ${id}\n∘ Duration: ${duration}\n∘ Type: ${type}`, m);
          await conn.sendMessage(m.chat, { audio: { url }, mimetype: 'audio/mpeg' }, { quoted: m });
        } catch (e) { throw `🚩 ${eror}`; }
      } else {
        m.reply(wait);
        const query = args.join(' ');
        try {
          const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${global.btc || btc}`);
          let json = await api.json();
          let res = json.result.data.slice(0, 5);

          conn.spotifySearch = conn.spotifySearch || {};
          conn.spotifySearch[m.sender] = res;

          let teks = `🎵 *Hasil Pencarian Spotify: ${query}*\n\n`;
          for (let i = 0; i < res.length; i++) {
            teks += `*${i + 1}.* ${res[i].title}\n   ∘ Duration: ${res[i].duration}\n   ∘ Popularity: ${res[i].popularity}\n\n`;
          }
          teks += `💡 Ketik *lagu 1* sampai *lagu ${res.length}* untuk download.`;
          await conn.reply(m.chat, teks, m);
        } catch (e) { throw `🚩 ${eror}`; }
      }
      break;
    }

    // ============================================================
    // YOUTUBE AUDIO MP3
    // ============================================================
    case 'ytmp3':
    case 'yta': {
      if (!text) throw `*Contoh:* ${usedPrefix + command} https://youtu.be/xxxxx`;
      m.reply(wait);
      try {
        const res = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
        const result = await res.json();
        if (result.status && result.result?.mp3) {
          await conn.sendMessage(m.chat, { audio: { url: result.result.mp3 }, mimetype: 'audio/mpeg' }, { quoted: m });
        } else throw 'Gagal mengambil audio.';
      } catch (e) { throw eror; }
      break;
    }

    // ============================================================
    // YOUTUBE SEARCH — 10 HASIL + TEMPLATE BUTTON
    // ============================================================
    case 'yts':
    case 'ytsearch': {
      if (!text) throw '🔍 Cari video apa? Contoh: *!yts Dewa 19*';
      m.reply(wait);
      try {
        let results = await yts(text);
        let videos = results.videos.slice(0, 10);
        if (!videos.length) throw 'Video tidak ditemukan.';

        conn.ytsSearch = conn.ytsSearch || {};
        conn.ytsSearch[m.sender] = {
          query: text,
          videos,
          currentIndex: 0,
          chat: m.chat
        };
        setSesiTimeout(conn, m.sender, 'yts');

        let v = videos[0];
        let caption = `🎬 *YouTube Search: ${text}*\n\n` +
          `📌 *[1/${videos.length}] ${v.title}*\n` +
          `👁️ Views: ${v.views?.toLocaleString() || 'N/A'}\n` +
          `⏱️ Durasi: ${v.timestamp}\n` +
          `🔗 ${v.url}\n\n` +
          `› Ketik *next video* atau *download*`;

        await sendImageWithTemplateButtons(conn, m.chat, m, v.thumbnail || null, caption, [
          { display: '▶️ Next Video', id: 'yts_next' },
          { display: '⬇️ Download',   id: 'yts_download' }
        ]);

      } catch (e) { throw eror; }
      break;
    }

    // ============================================================
    // YOUTUBE VIDEO MP4
    // ============================================================
    case 'ytmp4':
    case 'ytv': {
      if (!text) throw `*Contoh:* ${usedPrefix + command} https://youtu.be/xxxxx`;
      m.reply(wait);
      try {
        const res = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${global.btc || btc}`);
        const result = await res.json();
        if (result.status && result.result?.mp4) {
          await conn.sendMessage(m.chat, { video: { url: result.result.mp4 }, mimetype: 'video/mp4' }, { quoted: m });
        } else throw 'Gagal mengambil video.';
      } catch (e) { throw eror; }
      break;
    }

  }
};

// ================== LISTENER handler.before ==================
handler.before = async (m, { conn }) => {
  if (m.isBaileys) return;

  // Ambil teks (ketikan biasa) ATAU id dari template button yang ditekan
  const teks   = (m.text || '').toLowerCase().trim();
  const btnId  = getButtonResponseId(m); // null jika bukan button response

  // ===========================================================
  // PINTEREST LISTENER
  // ===========================================================
  conn.pinterestSearch = conn.pinterestSearch || {};

  const isPinterestNext =
    btnId === 'pinterest_next' ||
    teks === 'next foto' ||
    teks === 'next';

  if (isPinterestNext && conn.pinterestSearch[m.sender]) {
    let pin = conn.pinterestSearch[m.sender];
    pin.currentIndex++;

    if (pin.currentIndex >= pin.urls.length) {
      clearSesiTimeout(conn, m.sender, 'pinterest');
      delete conn.pinterestSearch[m.sender];
      await m.reply('✅ *Sudah mencapai foto terakhir.*');
      return true;
    }

    setSesiTimeout(conn, m.sender, 'pinterest');

    const isLast   = pin.currentIndex === pin.urls.length - 1;
    const imgUrl   = pin.urls[pin.currentIndex];
    let   caption  = `🍟 *Pinterest Search:* ${pin.query}\n📷 *Foto:* ${pin.currentIndex + 1}/${pin.urls.length}`;

    if (isLast) {
      caption += '\n\n✅ _Ini foto terakhir._';
      clearSesiTimeout(conn, m.sender, 'pinterest');
      delete conn.pinterestSearch[m.sender];
      await conn.sendMessage(m.chat, { image: { url: imgUrl }, caption }, { quoted: m });
    } else {
      caption += '\n\n› Ketik *next foto* atau tekan tombol';
      await sendImageWithTemplateButtons(conn, m.chat, m, imgUrl, caption, [
        { display: '📸 Next Foto', id: 'pinterest_next' }
      ]);
    }
    return true;
  }

  // ===========================================================
  // YTS LISTENER
  // ===========================================================
  conn.ytsSearch = conn.ytsSearch || {};

  const isYtsNext     = btnId === 'yts_next'     || teks === 'next video' || teks === 'next';
  const isYtsDownload = btnId === 'yts_download'  || teks === 'download';

  if ((isYtsNext || isYtsDownload) && conn.ytsSearch[m.sender]) {
    const yts = conn.ytsSearch[m.sender];

    // ---- DOWNLOAD ----
    if (isYtsDownload) {
      const v = yts.videos[yts.currentIndex];
      await m.reply(`⏳ *Mengunduh video...*\n🎬 ${v.title}`);
      try {
        const res    = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(v.url)}&apikey=${global.btc || btc}`);
        const result = await res.json();
        if (result.status && result.result?.mp4) {
          await conn.sendMessage(m.chat, {
            video:    { url: result.result.mp4 },
            mimetype: 'video/mp4',
            caption:  `🍟 *YT Downloader*\n🎬 ${v.title}`
          }, { quoted: m });
          clearSesiTimeout(conn, m.sender, 'yts');
          delete conn.ytsSearch[m.sender];
        } else {
          await m.reply('❌ Gagal unduh. Coba video lain atau pakai *.ytmp4 <link>*');
        }
      } catch (e) {
        await m.reply('❌ API error. Coba lagi nanti.');
      }
      return true;
    }

    // ---- NEXT VIDEO ----
    if (isYtsNext) {
      yts.currentIndex++;

      if (yts.currentIndex >= yts.videos.length) {
        clearSesiTimeout(conn, m.sender, 'yts');
        delete conn.ytsSearch[m.sender];
        await m.reply('✅ *Sudah mencapai video terakhir.*');
        return true;
      }

      setSesiTimeout(conn, m.sender, 'yts');

      const v      = yts.videos[yts.currentIndex];
      const isLast = yts.currentIndex === yts.videos.length - 1;
      let   caption = `🎬 *YouTube Search: ${yts.query}*\n\n` +
        `📌 *[${yts.currentIndex + 1}/${yts.videos.length}] ${v.title}*\n` +
        `👁️ Views: ${v.views?.toLocaleString() || 'N/A'}\n` +
        `⏱️ Durasi: ${v.timestamp}\n` +
        `🔗 ${v.url}\n\n` +
        `› Ketik *next video* atau *download*`;

      const btns = isLast
        ? [{ display: '⬇️ Download', id: 'yts_download' }]
        : [{ display: '▶️ Next Video', id: 'yts_next' }, { display: '⬇️ Download', id: 'yts_download' }];

      if (isLast) { caption += '\n✅ _Video terakhir._'; }

      await sendImageWithTemplateButtons(conn, m.chat, m, v.thumbnail || null, caption, btns);
      return true;
    }
  }

  // ===========================================================
  // SPOTIFY LISTENER
  // ===========================================================
  conn.spotifySearch = conn.spotifySearch || {};
  const matchSpotify = teks.match(/^lagu\s+([1-5])$/);

  if (matchSpotify && conn.spotifySearch[m.sender]) {
    const index = parseInt(matchSpotify[1]) - 1;
    const data  = conn.spotifySearch[m.sender];
    if (!data[index]) { await m.reply('Pilihan tidak ada. Cari ulang ya.'); return true; }

    await m.reply(`⏳ *Mendownload ${data[index].title}...*`);
    try {
      const res   = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${data[index].url}&apikey=${global.btc || btc}`);
      const jsons = await res.json();
      await conn.sendMessage(m.chat, { audio: { url: jsons.result.data.url }, mimetype: 'audio/mpeg' }, { quoted: m });
      delete conn.spotifySearch[m.sender];
    } catch (e) { await m.reply('Gagal download. API bermasalah.'); }
    return true;
  }
};

// ================== KONFIGURASI PLUGIN ==================
handler.help    = ['pinterest <keyword/url>', 'spotify <query/url>', 'ytmp3 <url>', 'ytmp4 <url>', 'yts <query>'];
handler.tags    = ['downloader', 'internet', 'tools'];
handler.command = /^(pinterest|spotify|ytmp3|yta|yts(earch)?|ytmp4|ytv)$/i;
handler.limit   = true;
handler.exp     = 0;
handler.premium = false;

module.exports = handler;
