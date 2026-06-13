// ============================================================
// HASIL DECODE: WhatsApp Bot (Baileys) - main.js (FINAL FIX)
// ============================================================

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';

(async () => {
  require('./config');

  const { loadBaileys } = await import('./baileys-loader.mjs');
  const baileysLib = await loadBaileys();

  const {
    useMultiFileAuthState,
    DisconnectReason,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    jidDecode,
    fetchLatestBaileysVersion,
    proto,
    Browsers
  } = baileysLib;

  const NodeCache    = require('node-cache');
  const pino         = require('pino');
  const ws           = require('ws');
  const path         = require('path');
  const fs           = require('fs');
  const os           = require('os');
  const yargs        = require('yargs/yargs');
  const childProcess = require('child_process');
  const lodash       = require('lodash');
  const syntaxError  = require('syntax-error');
  const fetch        = require('node-fetch');
  const chalk        = require('chalk');

  // PERBAIKAN FATAL: Memanggil fungsi dari lib/simple agar conn.getName dll terbaca
  let baileys = require('./lib/simple'); 

  // lowdb setup
  var lowdb;
  try { lowdb = require('lowdb'); }
  catch (e) { lowdb = require('./lib/lowdb'); }
  const { Low, JSONFile } = lowdb;

  const mongoDB = require('./lib/mongoDB');
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (text) => new Promise(resolve => rl.question(text, resolve));

  global.API = (name, path = '/', params = {}, apiKey) =>
    (name in global.APIs ? global.APIs[name] : name) + path +
    (params || apiKey ? '?' + new URLSearchParams(Object.fromEntries({
      ...params,
      ...(apiKey ? { [apiKey]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {})
    })) : '');

  global.timestamp = { start: new Date() };
  global.opts = new Object(yargs(process.argv.slice(2)).parse());

  global.prefix = new RegExp('^[' + (opts.prefix || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');

  global.db = new Low(
    /https?:\/\//.test(opts.db || '') ? new cloudDBAdapter(opts.db) :
    /mongodb/.test(opts.db)           ? new mongoDB(opts.db) :
    new JSONFile((opts._[0] ? opts._[0] + '_' : '') + 'database.json')
  );

  global.DATABASE = global.db;
  global.loadDatabase = async function loadDatabase() {
    if (global.db.READ)
      return new Promise(resolve => setInterval(function () {
        if (!global.db.READ) {
          clearInterval(this);
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
      }, 1000));
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read();
    global.db.READ = false;
    global.db.data = {
      users: {}, chats: {}, stats: {}, msgs: {}, sticker: {},
      ...global.db.data || {}
    };
    global.db.chain = lodash.chain(global.db.data);
  };
  loadDatabase();

  const getBrowser = () => {
    return ['Ubuntu', 'Chrome', '20.0.04'];
  };

  const sessionFolder = '' + (opts._[0] || 'sessions');
  global.isInit = !fs.existsSync(sessionFolder);

  const { state, saveState, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version, isLatest }           = await fetchLatestBaileysVersion();

  console.log(chalk.black('-- using WA v' + version.join('.') + ', isLatest: ' + isLatest));

  const msgRetryCounterCache = new NodeCache();

  const socketConfig = {
    printQRInTerminal: false,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    generateHighQualityLinkPreview: true,
    patchMessageBeforeSending: (msg) => {
      const isSpecial = !!(msg.buttonsMessage || msg.templateMessage || msg.listMessage);
      if (isSpecial) msg = {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: {} },
            ...msg
          }
        }
      };
      return msg;
    },
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'silent', stream: 'store' }))
    },
    msgRetryCounterCache,
    browser: getBrowser(),
    logger: pino({ level: 'silent' }),
    version
  };

  global.conn = baileys.makeWASocket(socketConfig);

  if (!opts.test) {
    if (global.db) setInterval(async () => {
      if (global.db.data) await global.db.write();
      if (!opts.exitProcess && (global.support || {}).find)
        [os.tmpdir(), 'tmp'].forEach(dir =>
          childProcess.spawn('find', [dir, '-amin', '3', '-type', 'f', '-delete'])
        );
    }, 30 * 1000);
  }

  async function connectionUpdate({ connection, lastDisconnect }) {
    global.timestamp.connect = new Date();
    
    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason !== DisconnectReason.loggedOut) {
            global.reloadHandler(true);
        } else {
            console.log(chalk.red('-- Sesi telah Logout, silakan hapus folder sessions --'));
        }
    } else if (connection === 'open') {
        console.log(chalk.green('-- WhatsApp Terhubung! Bot Siap Digunakan --'));
    }

    if (global.db.data == null) await loadDatabase();
  }

  if (fs.existsSync('./sessions/creds.json') && !conn.authState.creds.registered) {
    console.log(chalk.yellow('-- WARNING: creds.json is broken, please delete it first --'));
    process.exit(0);
  }

  if (!conn.authState.creds.registered) {
    let phoneNumber = '';
    do {
      phoneNumber = await question(chalk.blueBright('ENTER A VALID NUMBER START WITH REGION CODE. Example : 62xxx:\n'));
      if (!/^\d+$/.test(phoneNumber) || phoneNumber.length < 10)
        console.log(chalk.red('Invalid phone number. Please enter a valid number.'));
    } while (!/^\d+$/.test(phoneNumber) || phoneNumber.length < 10);

    rl.close();
    phoneNumber = phoneNumber.replace(/\D/g, '');
    console.log(chalk.green(chalk.bold('-- Please wait, generating code... --')));

    setTimeout(async () => {
      try {
          // CUSTOM PAIRING KODE LU TETEP AMAN
          let pairingCode = 'RTXU4090'; 
          let code = await conn.requestPairingCode(phoneNumber, pairingCode);
          code = code?.match(/.{1,4}/g)?.join('-') || pairingCode.match(/.{1,4}/g)?.join('-');
          console.log(
            chalk.black(chalk.bgWhite('Your Pairing Code : ')),
            chalk.magenta(chalk.bold(code))
          );
      } catch (e) {
          console.error('Gagal mendapatkan kode pairing:', e);
      }
    }, 3000);
  }

  process.on('uncaughtException', console.error);

  const reloadModule = (filePath) => {
    filePath = require.resolve(filePath);
    let mod, attempts = 0;
    do {
      if (filePath in require.cache) delete require.cache[filePath];
      mod = require(filePath);
      attempts++;
    } while (
      (!mod || (Array.isArray(mod) || mod instanceof String)
        ? !(mod || []).length
        : typeof mod === 'object' && !Buffer.isBuffer(mod)
          ? !Object.keys(mod || {}).length
          : false
      ) && attempts <= 10
    );
    return mod;
  };

  let isFirstLoad = true;
  global.reloadHandler = function (reconnect) {
    let handler = reloadModule('./handler');
    if (reconnect) {
      try { global.conn.ws.close(); } catch {}
      global.conn = { ...global.conn, ...baileys.makeWASocket(socketConfig) };
    }
    if (!isFirstLoad) {
      conn.ev.off('messages.upsert',           conn.handler);
      conn.ev.off('group-participants.update', conn.participantsUpdate);
      conn.ev.off('message.delete',            conn.onDelete);
      conn.ev.off('connection.update',         conn.connectionUpdate);
      conn.ev.off('creds.update',              conn.credsUpdate);
    }
    
    conn.welcome = 'Selamat datang @user di group @subject utamakan baca desk ya \n@desc';
    conn.bye     = 'Selamat tinggal @user 👋';
    conn.promote = '@user sekarang admin!';
    conn.demote  = '@user sekarang bukan admin!';

    conn.handler           = handler.handler.bind(conn);
    conn.participantsUpdate = handler.participantsUpdate.bind(conn);
    conn.onDelete          = handler.delete.bind(conn); 
    conn.connectionUpdate  = connectionUpdate.bind(conn);
    conn.credsUpdate       = saveCreds.bind(conn);

    conn.ev.on('messages.upsert',           conn.handler);
    conn.ev.on('group-participants.update', conn.participantsUpdate);
    conn.ev.on('message.delete',            conn.onDelete);
    conn.ev.on('connection.update',         conn.connectionUpdate);
    conn.ev.on('creds.update',              conn.credsUpdate);

    isFirstLoad = false;
    return true;
  };

  const pluginsDir = path.join(__dirname, 'plugins');
  const isJsFile   = (f) => /\.js$/.test(f);
  global.plugins   = {};
  for (let file of fs.readdirSync(pluginsDir).filter(isJsFile)) {
    try {
      global.plugins[file] = require(path.join(pluginsDir, file));
    } catch (e) {
      conn.logger.error(e);
      delete global.plugins[file];
    }
  }
  console.log(Object.keys(global.plugins));

  global.reload = (event, filename) => {
    if (isJsFile(filename)) {
      let filePath = path.join(pluginsDir, filename);
      if (filePath in require.cache) {
        delete require.cache[filePath];
        if (fs.existsSync(filePath))
          conn.logger.info("requiring new plugin '" + filename + "'");
        else {
          conn.logger.warn("deleted plugin '" + filename + "'");
          return delete global.plugins[filename];
        }
      } else {
        conn.logger.info("re - require plugin '" + filename + "'");
      }
      const err = syntaxError(fs.readFileSync(filePath), filename);
      if (err)
        conn.logger.error("syntax error while loading '" + filename + "'\n" + err);
      else {
        try { global.plugins[filename] = require(filePath); }
        catch (e) { conn.logger.error(e); }
        finally {
          global.plugins = Object.fromEntries(
            Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
          );
        }
      }
    }
  };
  Object.freeze(global.reload);
  fs.watch(path.join(__dirname, 'plugins'), global.reload);
  global.reloadHandler();

  async function checkBinaries() {
    let results = await Promise.all([
      childProcess.spawn('ffmpeg'),
      childProcess.spawn('ffprobe'),
      childProcess.spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
      childProcess.spawn('convert'),
      childProcess.spawn('magick'),
      childProcess.spawn('gm'),
      childProcess.spawn('find', ['--version'])
    ].map(proc => Promise.race([
      new Promise(res => proc.on('close', code => res(code !== 127))),
      new Promise(res => proc.on('error', () => res(false)))
    ])));

    let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = results;
    global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
    Object.freeze(global.support);
  }

  checkBinaries()
    .then(() => conn.logger.info('Quick Test Done'))
    .catch(console.error);

})();
