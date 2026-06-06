const { color } = require('../lib/color')
const moment = require("moment-timezone")
let levelling = require('../lib/levelling')

module.exports = {
    before(m) {
        let user = global.db.data.users[m.sender]
        
        // Pastikan data user ada
        if (!user) return !0
        
        let loopCount = 0 // Variabel pembatas agar tidak membuat bot freeze
        
        // Tetap menaikkan level di latar belakang, dibatasi maksimal 10 level per satu pesan
        while (levelling.canLevelUp(user.level, user.exp, global.multiplier)) {
            user.level++
            loopCount++
            if (loopCount >= 100) break; // Rem darurat agar bot tidak down
        }
        
        // Tanpa m.reply (tidak mengirim pesan/autorespon ke chat room)
        return !0 // Lanjut ke plugin berikutnya
    }
}
