const { Client, LocalAuth } = require("whatsapp-web.js");
const { attachAllCommands } = require("./commands_handler");

const rawPhone = (process.env.PHONE_NUMBER || "201119815662").replace(/\D+/g, "");
let pairingDone = false;

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "ahmed-bot-session" }),
  pairWithPhoneNumber: {
    phoneNumber: rawPhone,
    showNotification: true
  },
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  }
});

async function requestCodeNow() {
  if (pairingDone) return;
  try {
    if (typeof client.requestPairingCode === "function") {
      await new Promise((r) => setTimeout(r, 3000));
      const code = await client.requestPairingCode(rawPhone);
      pairingDone = true;
      console.log("\n=================================");
      console.log("PAIRING CODE لرقم", rawPhone, ":", code);
      console.log("=================================\n");
    } else {
      console.log("requestPairingCode غير متاحة في نسخة whatsapp-web.js الحالية.");
    }
  } catch (err) {
    console.error("خطأ أثناء طلب كود الاقتران:", err && err.message ? err.message : err);
  }
}

client.on("qr", () => {
  requestCodeNow();
});

client.on("code", (code) => {
  pairingDone = true;
  console.log("\n=================================");
  console.log("PAIRING CODE لرقم", rawPhone, ":", code);
  console.log("=================================\n");
});

client.on("ready", () => {
  console.log("BOT IS READY!");
});

attachAllCommands(client);
client.initialize();
