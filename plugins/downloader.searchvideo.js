const fetch = require('node-fetch');
const yts = require('yt-search');
const { prepareWAMessageMedia, generateWAMessageFromContent } = require('@adiwajshing/baileys');
const crypto = require('crypto');

const wait = '⏳ _Sedang memproses permintaan Anda..._';
const eror = '❌ _Gagal mengambil data, silakan coba lagi nanti._';

// =========================================================================
// RAW PAYLOAD: Mengirim Gambar + Tombol (Native Flow + Spoofing Saluran)
// =========================================================================
async function sendButtonWithImage(conn, jid, imageUrl, caption, buttons, quoted) {
    try {
        let media = await conn.getFile(imageUrl);
        let mediaMsg = await prepareWAMessageMedia({ image: media.data }, { upload: conn.waUploadToServer });

        let dynamicButtons = buttons.map(btn => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({ display_text: btn.text, id: btn.id })
        }));

        let messageContent = {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        header: { hasMediaAttachment: true, imageMessage: mediaMsg.imageMessage },
                        body: { text: caption },
                        footer: { text: "🍟 Downloader Center" },
                        contextInfo: {
                            participant: quoted.sender,
                            quotedMessage: quoted.message || {},
                            isForwarded: true,
                            forwardingScore: 999,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363400911374213@newsletter",
                                newsletterName: "🍟 Downloader Center",
                                serverMessageId: 143
                            }
                        },
                        nativeFlowMessage: { buttons: dynamicButtons }
                    }
                }
            }
        };

        let msg = generateWAMessageFromContent(jid, messageContent, { quoted, userJid: conn.user?.id || conn.user?.jid });
        await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    } catch (e) {
        console.error("Gagal Native Flow Image:", e.message);
        await conn.sendMessage(jid, { 
            image: { url: imageUrl }, 
            caption: caption + '\n\n💡 _Ketik *next* untuk melihat foto selanjutnya._' 
        }, { quoted });
    }
}

// =========================================================================
// RAW PAYLOAD: Mengirim Video + Tombol (Native Flow + Spoofing Saluran)
// =========================================================================
async function sendButtonWithVideo(conn, jid, videoUrl, caption, buttons, quoted) {
    try {
        let mediaMsg = await prepareWAMessageMedia({ video: { url: videoUrl } }, { upload: conn.waUploadToServer });

        let dynamicButtons = buttons.map(btn => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({ display_text: btn.text, id: btn.id })
        }));

        let messageContent = {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        header: { hasMediaAttachment: true, videoMessage: mediaMsg.videoMessage },
                        body: { text: caption },
                        footer: { text: "🍟 YouTube Downloader" },
                        contextInfo: {
                            participant: quoted.sender,
                            quotedMessage: quoted.message || {},
                            isForwarded: true,
                            forwardingScore: 999
                        },
                        nativeFlowMessage: { buttons: dynamicButtons }
                    }
                }
            }
        };

        let msg = generateWAMessageFromContent(jid, messageContent, { quoted, userJid: conn.user?.id || conn.user?.jid });
        await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    } catch (e) {
        console.error("Gagal Native Flow Video:", e.message);
        await conn.sendMessage(jid, { 
            video: { url: videoUrl }, 
            caption: caption + '\n\n💡 _Ketik *nextvid* untuk melihat video selanjutnya._' 
        }, { quoted });
    }
}

// =========================================================================
// RAW PAYLOAD: Mengirim Gambar + List Menu (Native Flow + Spoofing Saluran)
// =========================================================================
async function sendListWithImage(conn, jid, imageUrl, caption, listTitle, sections, quoted) {
    try {
        let media = await conn.getFile(imageUrl);
        let mediaMsg = await prepareWAMessageMedia({ image: media.data }, { upload: conn.waUploadToServer });

        let messageContent = {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        header: { hasMediaAttachment: true, imageMessage: mediaMsg.imageMessage },
                        body: { text: caption },
                        footer: { text: "🎵 Spotify Downloader" },
                        contextInfo: {
                            participant: quoted.sender,
                            quotedMessage: quoted.message || {},
                            isForwarded: true,
                            forwardingScore: 999
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({ title: listTitle, sections: sections })
                            }]
                        }
                    }
                }
            }
        };

        let msg = generateWAMessageFromContent(jid, messageContent, { quoted, userJid: conn.user?.id || conn.user?.jid });
        await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    } catch (e) {
        console.error("Gagal Native List:", e.message);
        await conn.sendMessage(jid, { 
            image: { url: imageUrl }, 
            caption: caption + '\n\n💡 _Ketik *lagu 1* untuk mendownload._' 
        }, { quoted });
    }
}

// Helper: Fungsi Mengirim YTS Secara Berurutan
async function sendNextYts(conn, m, videoData, index, total, apiKey) {
    m.reply(`⏳ _Sedang mengambil video ${index + 1}/${total}, mohon tunggu..._`);
    try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(videoData.url)}&apikey=${apiKey}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp4) {
            let caption = `🍟 *YT Search:* ${videoData.title}\n👁️ *Views:* ${videoData.views.toLocaleString()}x\n⏱️ *Durasi:* ${videoData.timestamp}\n🎬 *Video:* ${index + 1}/${total}`;
            let isLast = index === total - 1;

            if (!isLast) {
                await sendButtonWithVideo(conn, m.chat, result.result.mp4, caption, [{ text: "➡️ Next Video", id: "nextvid" }], m);
            } else {
                caption += `\n\n✅ _Ini adalah video terakhir dari pencarian._`;
                await conn.sendMessage(m.chat, { video: { url: result.result.mp4 }, caption: caption }, { quoted: m });
            }
        } else {
            m.reply('❌ Gagal mengunduh video ini, silakan ketik *nextvid* atau klik tombol sebelumnya untuk lanjut ke antrean berikutnya.');
        }
    } catch (e) {
         m.reply('❌ Error saat memproses video API.');
    }
}

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  const apiKey = global.btc || global.APIKey || global.apikey || global.api_key || '';
  
  if (!apiKey) return m.reply('❌ *API Key belum diset!*\nSilakan set `global.btc` di config bot kamu.');

  switch (command) {

    // ================== PINTEREST ==================
    case 'pinterest': {
      if (!text) throw `*🚩 Example Pencarian:* ${usedPrefix}${command} shiroko\n*🚩 Example Download:* ${usedPrefix}${command} https://id.pinterest.com/pin/1234567890/`;
      
      if (text.match(/pin(?:terest)?(?:\.it|\.com)/i)) {
        m.reply(wait);
        try {
          let response = await fetch(`https://api.botcahx.eu.org/api/download/pinterest?url=${args[0]}&apikey=${apiKey}`);
          let json = await response.json();
          
          if (json.status && json.result) {
            let mediaUrl = json.result.url || json.result.result || json.result;
            await conn.sendFile(m.chat, mediaUrl, 'pinterest.jpg', '🍟 *Pinterest Downloader*', m);
          } else {
            m.reply('❌ Gagal mengambil data dari URL Pinterest.');
          }
        } catch (e) {
          m.reply(eror);
        }
      } 
      else {
        m.reply(wait);
        try {
          let response = await fetch(`https://api.botcahx.eu.org/api/search/pinterest?text1=${encodeURIComponent(text)}&apikey=${apiKey}`);
          let data = await response.json();   
          
          if (!data.result || data.result.length === 0) return m.reply('❌ Gambar tidak ditemukan dari API.');

          let images = data.result.slice(0, 8); 
          
          conn.pinterestSearch = conn.pinterestSearch || {};
          conn.pinterestSearch[m.sender] = {
            query: text,
            urls: images,
            currentIndex: 0
          };

          let firstImage = images[0];
          let captionText = `🍟 *Pinterest Search:* ${text}\n📷 *Foto:* 1/${images.length}`;

          await sendButtonWithImage(
              conn, 
              m.chat, 
              firstImage, 
              captionText, 
              [{ text: "➡️ Next Foto", id: "next" }], 
              m
          );
          
        } catch (e) {
          console.error("Pinterest Error:", e);
          m.reply(`❌ Gagal mengambil data: ${e.message}`);
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
          const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${args[0]}&apikey=${apiKey}`);
          let jsons = await res.json();
          const { title, duration, url } = jsons.result.data;
          const { id, type } = jsons.result.data.artist;
          
          let captionvid = ` ∘ Title: ${title}\n∘ Id: ${id}\n∘ Duration: ${duration}\n∘ Type: ${type}`;
          await conn.reply(m.chat, captionvid, m);
          await conn.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg' }, { quoted: m });
        } catch (e) {
          m.reply(eror);
        }
      } 
      else { 
        m.reply(wait);
        const query = args.join(" ");
        try {
          const api = await fetch(`https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(query)}&apikey=${apiKey}`);
          let json = await api.json();
          let res = json.result.data.slice(0, 5); 

          conn.spotifySearch = conn.spotifySearch || {};
          conn.spotifySearch[m.sender] = res;
          
          let sections = [{
            title: `Hasil Pencarian Spotify`,
            rows: res.map((v) => ({
              title: v.title.slice(0, 24), 
              description: `Durasi: ${v.duration} | Populer: ${v.popularity}`,
              id: `dl-spotify|${v.url}` 
            }))
          }];

          let spotifyThumb = 'https://i.ibb.co/GFVf3h3/spotify.png';
          let caption = `🎵 *Hasil Pencarian: ${query}*\n\nSilakan klik tombol di bawah untuk memilih lagu.`;
          
          await sendListWithImage(conn, m.chat, spotifyThumb, caption, '🎶 Pilih Lagu', sections, m);

        } catch (e) {
          console.error("Spotify Error:", e);
          m.reply(`❌ Gagal mengambil data: ${e.message}`);
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
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${apiKey}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp3) {
          await conn.sendMessage(m.chat, { 
            audio: { url: result.result.mp3 }, 
            mimetype: 'audio/mpeg' 
          }, { quoted: m });
        } else {
          m.reply('❌ Gagal mengunduh audio dari API.');
        }
      } catch (error) {
        m.reply(eror);
      }
      break;
    }

    // ================== YOUTUBE SEARCH DENGAN NEXT BUTTON ==================
    case 'yts':
    case 'ytsearch': {
      if (!text) throw 'Cari apa?';
      m.reply('🔍 _Mencari video, mohon tunggu sebentar..._');
      try {
        let results = await yts(text);
        let videos = results.videos; 
        
        if (!videos || videos.length === 0) return m.reply('❌ Video tidak ditemukan.');

        // Simpan 5 video teratas (bisa disesuaikan angkanya)
        let topVideos = videos.slice(0, 5);

        conn.ytsSearch = conn.ytsSearch || {};
        conn.ytsSearch[m.sender] = {
            query: text,
            videos: topVideos,
            currentIndex: 0
        };

        // Langsung kirim video urutan pertama
        let firstVideo = topVideos[0];
        await sendNextYts(conn, m, firstVideo, 0, topVideos.length, apiKey);

      } catch (e) {
        m.reply(eror);
      }
      break;
    }

    // ================== YOUTUBE VIDEO (MP4) ==================
    case 'ytmp4':
    case 'ytv': {
      if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
      m.reply(wait);
      try {
        const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/yt?url=${encodeURIComponent(text)}&apikey=${apiKey}`);
        const result = await response.json();

        if (result.status && result.result && result.result.mp4) {
            await conn.sendMessage(m.chat, { 
              video: { url: result.result.mp4 }, 
              mimetype: 'video/mp4' 
            }, { quoted: m });
        } else {
          m.reply('❌ Gagal mengunduh video dari API.');
        }
      } catch (error) {
        m.reply(eror);
      }
      break;
    }

  }
};

// ================== LISTENER (TANGKAP RESPONSE TOMBOL) ==================
handler.before = async (m, { conn }) => {
  if (m.isBaileys) return;
  
  let teks = m.text || '';

  if (m.msg && m.msg.nativeFlowResponseMessage) {
    try {
      let params = JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson);
      if (params && params.id) teks = params.id;
    } catch (e) {}
  }

  teks = teks.toLowerCase();
  if (!teks) return;

  const apiKey = global.btc || global.APIKey || global.apikey || global.api_key || '';

  // --- LISTENER PINTEREST ---
  conn.pinterestSearch = conn.pinterestSearch || {};
  if (teks === 'next' && conn.pinterestSearch[m.sender]) {
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

    if (!isLast) {
      await sendButtonWithImage(
          conn, 
          m.chat, 
          nextImageUrl, 
          captionText, 
          [{ text: "➡️ Next Foto", id: "next" }], 
          m
      );
    } else {
      captionText += `\n\n✅ _Ini adalah foto terakhir dari pencarian._`;
      await conn.sendMessage(m.chat, { image: { url: nextImageUrl }, caption: captionText }, { quoted: m });
      delete conn.pinterestSearch[m.sender];
    }
    return true;
  }

  // --- LISTENER YTS (NEXT VIDEO) ---
  conn.ytsSearch = conn.ytsSearch || {};
  if (teks === 'nextvid' && conn.ytsSearch[m.sender]) {
    let ytData = conn.ytsSearch[m.sender];
    ytData.currentIndex += 1;

    if (ytData.currentIndex >= ytData.videos.length) {
      m.reply('✅ *Sudah mencapai video terakhir dari daftar pencarian.*');
      delete conn.ytsSearch[m.sender]; 
      return true;
    }

    let nextVideo = ytData.videos[ytData.currentIndex];
    await sendNextYts(conn, m, nextVideo, ytData.currentIndex, ytData.videos.length, apiKey);
    
    // Jika sudah di urutan terakhir, hapus sesi agar menghemat memori
    if (ytData.currentIndex === ytData.videos.length - 1) {
        delete conn.ytsSearch[m.sender];
    }
    return true;
  }

  // --- LISTENER SPOTIFY ---
  if (teks.startsWith('dl-spotify|')) {
    let url = teks.split('|')[1];
    m.reply('⏳ *Mendownload lagu, harap tunggu...*');
    
    try {
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${url}&apikey=${apiKey}`);
      let jsons = await res.json();
      const { title, url: audioUrl } = jsons.result.data;
      
      await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mpeg' }, { quoted: m });
    } catch (e) {
       m.reply('❌ Gagal mendownload lagu. API sedang bermasalah.');
    }
    return true; 
  }

  // Fallback teks kalau list ditekan manual
  let matchSpotify = teks.match(/^lagu\s+([1-5])$/);
  if (matchSpotify && conn.spotifySearch && conn.spotifySearch[m.sender]) {
    let index = parseInt(matchSpotify[1]) - 1;
    let data = conn.spotifySearch[m.sender];
    
    if (!data[index]) return m.reply('❌ Pilihan lagu tidak ada di daftar.');
    
    let url = data[index].url;
    m.reply(`⏳ *Mendownload ${data[index].title}...*`);
    
    try {
      const res = await fetch(`https://api.botcahx.eu.org/api/download/spotify?url=${url}&apikey=${apiKey}`);
      let jsons = await res.json();
      const { title, url: audioUrl } = jsons.result.data;
      
      await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mpeg' }, { quoted: m });
      delete conn.spotifySearch[m.sender];
    } catch (e) {
       m.reply('❌ Gagal mendownload lagu.');
    }
    return true; 
  }
};

handler.help = ['pinterest', 'spotify', 'ytmp3', 'ytmp4', 'yts'];
handler.tags = ['downloader'];
handler.command = /^(pinterest|spotify|ytmp3|yta|yts(earch)?|ytmp4|ytv)$/i;

handler.limit = true;
module.exports = handler;
