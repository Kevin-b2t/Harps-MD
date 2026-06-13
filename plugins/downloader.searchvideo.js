const fetch = require('node-fetch'); //[span_1](start_span)[span_1](end_span)
const yts = require('yt-search'); //[span_2](start_span)[span_2](end_span)

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  switch (command) {

    // ================== PINTEREST ==================
    case 'pinterest': {
      if (!text) throw `*🚩 Example Pencarian:* ${usedPrefix}${command} Zhao Lusi\n*🚩 Example Download:* ${usedPrefix}${command} https://id.pinterest.com/pin/1234567890/`; //[span_3](start_span)[span_3](end_span)
      
      if (text.match(/pin(?:terest)?(?:\.it|\.com)/i)) { //[span_4](start_span)[span_4](end_span)
        m.reply(wait); //[span_5](start_span)[span_5](end_span)
        try {
          let response = await fetch(`https://api.botcahx.eu.org/api/download/pinterest?url=${args[0]}&apikey=${global.btc || btc}`); //[span_6](start_span)[span_6](end_span)
          let json = await response.json(); //[span_7](start_span)[span_7](end_span)
          
          if (json.status && json.result) { //[span_8](start_span)[span_8](end_span)
            let mediaUrl = json.result.url || json.result.result || json.result; //[span_9](start_span)[span_9](end_span)
            await conn.sendFile(m.chat, mediaUrl, 'pinterest.jpg', '🍟 *Pinterest Downloader*', m); //[span_10](start_span)[span_10](end_span)
          } else {
            throw 'Gagal mengambil data dari URL Pinterest.'; //[span_11](start_span)[span_11](end_span)
          }
        } catch (e) {
          throw `🚩 ${eror}`; //[span_12](start_span)[span_12](end_span)
        }
      } 
      else {
        m.reply(wait); //[span_13](start_span)[span_13](end_span)
        try {
          let response = await fetch(`https://api.botcahx.eu.org/api/search/pinterest?text1=${encodeURIComponent(text)}&apikey=${global.btc || btc}`); //[span_14](start_span)[span_14](end_span)
          let data = await response.json(); //[span_15](start_span)[span_15](end_span)
          
          if (!data.result || data.result.length === 0) throw 'Gambar tidak ditemukan.'; //[span_16](start_span)[span_16](end_span)

          // Ambil maksimal 8 foto sesuai permintaan
          let images = data.result.slice(0, 8); //[span_17](start_span)[span_17](end_span)
          
          // Simpan data pencarian di memori bot untuk user ini, dengan timeout 5 menit
          conn.pinterestSearch = conn.pinterestSearch || {}; //[span_18](start_span)[span_18](end_span)
          conn.pinterestSearch[m.sender] = {
            query: text, //[span_19](start_span)[span_19](end_span)
            urls: images, //[span_20](start_span)[span_20](end_span)
            currentIndex: 0, //[span_21](start_span)[span_21](end_span)
            timeout: Date.now() + 300000 // Batas 5 menit
          };

          let firstImage = images[0]; //[span_22](start_span)[span_22](end_span)
          let captionText = `🍟 *Pinterest Search:* ${text}\n📷 *Foto:* 1/${images.length}\n\n💡 _Gunakan tombol di bawah atau ketik *Next Foto* untuk melihat foto selanjutnya._`;

          // Format tombol standar
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
          throw eror; //[span_23](start_span)[span_23](end_span)
        }
      }
      break; //[span_24](start_span)[span_24](end_span)
    }

    // ================== SPOTIFY ==================
    case 'spotify': {
      if (!args[0]) throw `*🚩 Masukkan URL atau judul lagu!*\n\nExample:\n${usedPrefix + command} payung teduh`; //[span_25](start_span)[span_25](end_span)
      
      if (args[0].match(/https:\/\/open\.spotify\.com/i)) { //[span_26](start_span)[span_26](end_span)
        m.reply(wait); //[span_27](start_span)[span_27](end_span)
        try {
          const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${args[0]}&apikey=${global.btc || btc}`); //[span_28](start_span)[span_28](end_span)
          let jsons = await res.json(); //[span_29](start_span)[span_29](end_span)
          const { title, duration, url } = jsons.result.data; //[span_30](start_span)[span_30](end_span)
          const { id, type } = jsons.result.data.artist; //[span_31](start_span)[span_31](end_span)
          
          let captionvid = ` ∘ Title: ${title}\n∘ Id: ${id}\n∘ Duration: ${duration}\n∘ Type: ${type}`; //[span_32](start_span)[span_32](end_span)
          await conn.reply(m.chat, captionvid, m); //[span_33](start_span)[span_33](end_span)
          await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m }); //[span_34](start_span)[span_34](end_span)
        } catch (e) {
          throw `🚩 ${eror}`; //[span_35](start_span)[span_35](end_span)
        }
      } 
      else { 
        m.reply(wait); //[span_36](start_span)[span_36](end_span)
        const query = args.join(" "); //[span_37](start_span)[span_37](end_span)
        try {
          const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${global.btc || btc}`); //[span_38](start_span)[span_38](end_span)
          let json = await api.json(); //[span_39](start_span)[span_39](end_span)
          let res = json.result.data.slice(0, 5); //[span_40](start_span)[span_40](end_span)
          
          conn.spotifySearch = conn.spotifySearch || {}; //[span_41](start_span)[span_41](end_span)
          conn.spotifySearch[m.sender] = res; //[span_42](start_span)[span_42](end_span)

          let teks = `🎵 *Hasil Pencarian Spotify: ${query}*\n\n`; //[span_43](start_span)[span_43](end_span)
          for (let i = 0; i < res.length; i++) { //[span_44](start_span)[span_44](end_span)
            teks += `*${i + 1}.* ${res[i].title}\n`; //[span_45](start_span)[span_45](end_span)
            teks += `   ∘ Duration: ${res[i].duration}\n`; //[span_46](start_span)[span_46](end_span)
            teks += `   ∘ Popularity: ${res[i].popularity}\n\n`; //[span_47](start_span)[span_47](end_span)
          }
          teks += `💡 *Silakan ketik "lagu 1" sampai "lagu ${res.length}" untuk mendownload audionya.*`; //[span_48](start_span)[span_48](end_span)
          await conn.reply(m.chat, teks, m); //[span_49](start_span)[span_49](end_span)
        } catch (e) {
          throw `🚩 ${eror}`; //[span_50](start_span)[span_50](end_span)
        }
      }
      break; //[span_51](start_span)[span_51](end_span)
    }

    // ================== YOUTUBE AUDIO (MP3) ==================
    case 'ytmp3':
    case 'yta': {
      if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`; //[span_52](start_span)[span_52](end_span)
      m.reply(wait); //[span_53](start_span)[span_53](end_span)
      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${global.btc || btc}`); //[span_54](start_span)[span_54](end_span)
        const result = await response.json(); //[span_55](start_span)[span_55](end_span)

        if (result.status && result.result && result.result.mp3) { //[span_56](start_span)[span_56](end_span)
          await conn.sendMessage(m.chat, { 
            audio: { url: result.result.mp3 }, //[span_57](start_span)[span_57](end_span)
            mimetype: 'audio/mpeg' //[span_58](start_span)[span_58](end_span)
          }, { quoted: m }); //[span_59](start_span)[span_59](end_span)
        } else {
          throw 'Error: Unable to fetch audio'; //[span_60](start_span)[span_60](end_span)
        }
      } catch (error) {
        throw eror; //[span_61](start_span)[span_61](end_span)
      }
      break; //[span_62](start_span)[span_62](end_span)
    }

    // ================== YOUTUBE SEARCH ==================
    case 'yts':
    case 'ytsearch': {
      if (!text) throw 'Cari apa?'; //[span_63](start_span)[span_63](end_span)
      m.reply(wait); //[span_64](start_span)[span_64](end_span)
      try {
        let results = await yts(text); //[span_65](start_span)[span_65](end_span)
        let videos = results.videos; //[span_66](start_span)[span_66](end_span)
        
        if (!videos || videos.length === 0) throw 'Video tidak ditemukan.'; //[span_67](start_span)[span_67](end_span)

        // Simpan dalam memori dengan batas 10 video dan timeout 5 menit
        let searchResults = videos.slice(0, 10);
        conn.ytsSearch = conn.ytsSearch || {};
        conn.ytsSearch[m.sender] = {
          query: text,
          videos: searchResults,
          currentIndex: 0,
          timeout: Date.now() + 300000 // 5 menit
        };

        let currentVideo = searchResults[0];
        
        // Format caption sesuai screenshot
        let captionTeks = `📺 YouTube Search: ${text}\n` + //
                          `📌 Judul: ${currentVideo.title}\n` + //
                          `👁️ Views: ${currentVideo.views.toLocaleString()}\n` + //
                          `👤 Oleh: ${currentVideo.author.name}\n` + //
                          `⏱️ Durasi: ${currentVideo.timestamp}\n` + //
                          `🎬 Video: 1/${searchResults.length}`; //
        
        let footerTeks = `⏳ Sesi berlaku 5 menit • Item 1/${searchResults.length}`; //

        let buttons = [
          { buttonId: 'next_video', buttonText: { displayText: 'Next Video' }, type: 1 },
          { buttonId: 'download_video', buttonText: { displayText: 'Download' }, type: 1 }
        ];

        // Kirim pesan berupa Gambar (Thumbnail) + Tombol
        await conn.sendMessage(m.chat, { 
          image: { url: currentVideo.thumbnail }, 
          caption: captionTeks,
          footer: footerTeks,
          buttons: buttons,
          headerType: 4 // Tipe header untuk Image Message di Baileys
        }, { quoted: m });

      } catch (e) {
        throw eror; //[span_68](start_span)[span_68](end_span)
      }
      break; //[span_69](start_span)[span_69](end_span)
    }

    // ================== YOUTUBE VIDEO (MP4) ==================
    case 'ytmp4':
    case 'ytv': {
      if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`; //[span_70](start_span)[span_70](end_span)
      m.reply(wait); //[span_71](start_span)[span_71](end_span)
      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${global.btc || btc}`); //[span_72](start_span)[span_72](end_span)
        const result = await response.json(); //[span_73](start_span)[span_73](end_span)

        if (result.status && result.result && result.result.mp4) { //[span_74](start_span)[span_74](end_span)
          await conn.sendMessage(m.chat, { 
            video: { url: result.result.mp4 }, //[span_75](start_span)[span_75](end_span)
            mimetype: 'video/mp4' //[span_76](start_span)[span_76](end_span)
          }, { quoted: m }); //[span_77](start_span)[span_77](end_span)
        } else {
          throw 'Error: Unable to fetch video'; //[span_78](start_span)[span_78](end_span)
        }
      } catch (error) {
        throw eror; //[span_79](start_span)[span_79](end_span)
      }
      break; //[span_80](start_span)[span_80](end_span)
    }

  }
};

// ================== LISTENER (HANDLER.BEFORE) ==================
handler.before = async (m, { conn }) => {
  if (m.isBaileys || !m.text) return; //[span_81](start_span)[span_81](end_span)
  
  let teks = m.text.toLowerCase().trim(); //[span_82](start_span)[span_82](end_span)

  // --- LISTENER PINTEREST ("next foto") ---
  conn.pinterestSearch = conn.pinterestSearch || {}; //[span_83](start_span)[span_83](end_span)
  if ((teks === 'next' || teks === 'next foto') && conn.pinterestSearch[m.sender]) { //[span_84](start_span)[span_84](end_span)
    let pinData = conn.pinterestSearch[m.sender]; //[span_85](start_span)[span_85](end_span)

    // Cek batas waktu 5 menit
    if (Date.now() > pinData.timeout) {
      m.reply('⏱️ *Sesi Pinterest kamu telah berakhir (Batas 5 menit).* Silakan cari ulang.');
      delete conn.pinterestSearch[m.sender];
      return true;
    }

    pinData.currentIndex += 1; //[span_86](start_span)[span_86](end_span)

    // Cek apakah sudah melebihi 8 foto
    if (pinData.currentIndex >= pinData.urls.length) { //[span_87](start_span)[span_87](end_span)
      m.reply('✅ *Sudah mencapai 8 foto maksimal dari pencarian ini.*'); //[span_88](start_span)[span_88](end_span)
      delete conn.pinterestSearch[m.sender]; //[span_89](start_span)[span_89](end_span)
      return true; //[span_90](start_span)[span_90](end_span)
    }

    let nextImageUrl = pinData.urls[pinData.currentIndex]; //[span_91](start_span)[span_91](end_span)
    let isLast = pinData.currentIndex === pinData.urls.length - 1; //[span_92](start_span)[span_92](end_span)
    let captionText = `🍟 *Pinterest Search:* ${pinData.query}\n📷 *Foto:* ${pinData.currentIndex + 1}/${pinData.urls.length}`; //[span_93](start_span)[span_93](end_span)
    
    let buttons = [];

    if (!isLast) { //[span_94](start_span)[span_94](end_span)
      captionText += `\n\n💡 _Gunakan tombol di bawah atau ketik *Next Foto* untuk melihat foto selanjutnya._`;
      buttons.push({ buttonId: 'next_foto', buttonText: { displayText: 'Next Foto' }, type: 1 });
    } else {
      captionText += `\n\n✅ _Ini adalah foto terakhir (Batas 8 foto)._`;
      delete conn.pinterestSearch[m.sender]; //[span_95](start_span)[span_95](end_span)
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

    return true; //[span_96](start_span)[span_96](end_span)
  }

  // --- LISTENER YOUTUBE SEARCH ("next video" & "download") ---
  conn.ytsSearch = conn.ytsSearch || {};
  if ((teks === 'next video' || teks === 'download') && conn.ytsSearch[m.sender]) {
    let ytsData = conn.ytsSearch[m.sender];

    // Cek timeout 5 menit
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

      // Format caption sesuai screenshot
      let captionTeks = `📺 YouTube Search: ${ytsData.query}\n` + //
                        `📌 Judul: ${currentVid.title}\n` + //
                        `👁️ Views: ${currentVid.views.toLocaleString()}\n` + //
                        `👤 Oleh: ${currentVid.author.name}\n` + //
                        `⏱️ Durasi: ${currentVid.timestamp}\n` + //
                        `🎬 Video: ${urutan}/${totalVideos}`; //
      
      let footerTeks = `⏳ Sesi berlaku 5 menit • Item ${urutan}/${totalVideos}`; //
      
      let buttons = [];
      
      // Sembunyikan tombol Next jika sudah di video terakhir
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

      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(selectedVid.url)}&apikey=${global.btc || btc}`); //[span_97](start_span)[span_97](end_span)
        const result = await response.json(); //[span_98](start_span)[span_98](end_span)

        if (result.status && result.result && result.result.mp4) { //[span_99](start_span)[span_99](end_span)
          await conn.sendMessage(m.chat, { 
            video: { url: result.result.mp4 }, //[span_100](start_span)[span_100](end_span)
            mimetype: 'video/mp4', //[span_101](start_span)[span_101](end_span)
            caption: `🍟 *YT Search Downloader*\n🎬 ${selectedVid.title}` //[span_102](start_span)[span_102](end_span)
          }, { quoted: m }); //[span_103](start_span)[span_103](end_span)
        } else {
          m.reply('❌ Gagal mengunduh file media dari server API.'); //[span_104](start_span)[span_104](end_span)
        }
      } catch (e) {
        m.reply('❌ Terjadi kesalahan saat mengunduh.');
      }
      
      // Hapus sesi setelah pengguna melakukan download
      delete conn.ytsSearch[m.sender];
      return true;
    }
  }

  // --- LISTENER SPOTIFY ("lagu 1", "lagu 2", dst) ---
  conn.spotifySearch = conn.spotifySearch || {}; //[span_105](start_span)[span_105](end_span)
  let matchSpotify = teks.match(/^lagu\s+([1-5])$/); //[span_106](start_span)[span_106](end_span)
  
  if (matchSpotify && conn.spotifySearch[m.sender]) { //[span_107](start_span)[span_107](end_span)
    let index = parseInt(matchSpotify[1]) - 1; //[span_108](start_span)[span_108](end_span)
    let data = conn.spotifySearch[m.sender]; //[span_109](start_span)[span_109](end_span)
    
    if (!data[index]) { //[span_110](start_span)[span_110](end_span)
       m.reply('Pilihan lagu tidak ada di daftar. Silakan cari ulang.'); //[span_111](start_span)[span_111](end_span)
       return true; //[span_112](start_span)[span_112](end_span)
    }
    
    let url = data[index].url; //[span_113](start_span)[span_113](end_span)
    m.reply(`⏳ *Mendownload ${data[index].title}...*`); //[span_114](start_span)[span_114](end_span)
    
    try {
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${url}&apikey=${global.btc || btc}`); //[span_115](start_span)[span_115](end_span)
      let jsons = await res.json(); //[span_116](start_span)[span_116](end_span)
      const { title, url: audioUrl } = jsons.result.data; //[span_117](start_span)[span_117](end_span)
      
      await conn.sendMessage(m.chat, { 
        audio: { url: audioUrl }, //[span_118](start_span)[span_118](end_span)
        mimetype: 'audio/mpeg' //[span_119](start_span)[span_119](end_span)
      }, { quoted: m }); //[span_120](start_span)[span_120](end_span)
      
      delete conn.spotifySearch[m.sender]; //[span_121](start_span)[span_121](end_span)
    } catch (e) {
       m.reply('Gagal mendownload lagu. API sedang bermasalah.'); //[span_122](start_span)[span_122](end_span)
    }
    return true; //[span_123](start_span)[span_123](end_span)
  }
};

// ================== KONFIGURASI PLUGIN ==================
handler.help = [
  'pinterest <keyword/url>', //[span_124](start_span)[span_124](end_span)
  'spotify <query/url>', //[span_125](start_span)[span_125](end_span)
  'ytmp3 <url>', //[span_126](start_span)[span_126](end_span)
  'ytmp4 <url>', //[span_127](start_span)[span_127](end_span)
  'yts <query>' //[span_128](start_span)[span_128](end_span)
];
handler.tags = ['downloader', 'internet', 'tools']; //[span_129](start_span)[span_129](end_span)
handler.command = /^(pinterest|spotify|ytmp3|yta|yts(earch)?|ytmp4|ytv)$/i; //[span_130](start_span)[span_130](end_span)

handler.limit = true; //[span_131](start_span)[span_131](end_span)
handler.exp = 0; //[span_132](start_span)[span_132](end_span)
handler.premium = false; //[span_133](start_span)[span_133](end_span)

module.exports = handler; //[span_134](start_span)[span_134](end_span)
