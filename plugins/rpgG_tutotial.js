let handler = async (m, { conn, usedPrefix }) => {
    let tutorial = `🏰 *PANDUAN UTAMA SYSTEM GUILD RPG* 🏰

1. *Membuat Guild Baru*
   • *${usedPrefix}createguild <nama_guild>*
   _Biaya: 20M Money._

2. *Melihat Daftar Guild Server*
   • *${usedPrefix}guildlist* atau *${usedPrefix}guildlistacc*

3. *Bergabung / Request Masuk Guild*
   • *${usedPrefix}joinguild <nomor_urut_list>*

4. *Menerima Request Anggota (Owner/Staff)*
   • *${usedPrefix}guildaccept <@tagUser>*

5. *Mengundang User ke Waiting List (Owner)*
   • *${usedPrefix}guildinvite <@tagUser>*

6. *Memasukkan User dari Waiting List Resmi (Owner)*
   • *${usedPrefix}guildinviteacc <@tagUser>*

7. *Menolak/Keluar Antrean Guild*
   • *${usedPrefix}guilddecline*

8. *Melihat Profil Detail Guild*
   • *${usedPrefix}myguild* atau *${usedPrefix}guildinfo*

9. *Mempromosikan Anggota Jadi Staff (Owner)*
   • *${usedPrefix}guildpromote <@tagUser>*

10. *Menurunkan Pangkat Staff (Owner)*
    • *${usedPrefix}guilddemote <@tagUser>*

11. *Upgrade Fasilitas Guild (Owner/Staff)*
    • *${usedPrefix}guildupgrade <level/elixir/treasure/guardian/attack>*

12. *Menyerang Guild Lawan Secara Random (Owner/Staff)*
    • *${usedPrefix}attackguild*

13. *Tantang Perang Guild Spesifik (Owner/Staff)*
    • *${usedPrefix}guildwar <Nama Guild Lawan>*

14. *Keluar dari Guild Saat Ini*
    • *${usedPrefix}guildleave*

15. *Membubarkan Guild (Owner)*
    • *${usedPrefix}delguild <nomor_urut_list>*`;

    conn.reply(m.chat, tutorial, m);
};

handler.help = ['guildtutorial'];
handler.tags = ['rpgG'];
handler.command = /^(guildtutorial|guildtutorial)$/i;
handler.rpg = true;
module.exports = handler;
