require("dotenv").config();
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Bot está rodando...");
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor web rodando na porta ${PORT}`);
});

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
const chatId = process.env.TELEGRAM_CHAT_ID;

let lastPrice = null;

function formatBRL(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

async function checkBitcoin() {
  console.log("⏳ Checando preço do Bitcoin...");
  try {
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl"
    );
    const currentPrice = res.data.bitcoin.brl;

    if (lastPrice !== null) {
      console.log(currentPrice, lastPrice);
      if (currentPrice !== lastPrice) {
        const diff = currentPrice - lastPrice;
        const percentChange = (diff / lastPrice) * 100;
        const direction = percentChange > 0 ? "subiu 📈" : "caiu 📉";

        bot.sendMessage(
          chatId,
          `⚠️ O Bitcoin ${direction} ${percentChange.toFixed(
            2
          )}%\n💰 Preço atual: ${formatBRL(currentPrice)}`
        );
      } else {
        bot.sendMessage(
          chatId,
          `📊 O preço do Bitcoin se manteve estável.\n💰 Preço atual: ${formatBRL(
            currentPrice
          )}`
        );
      }
    } else {
      bot.sendMessage(
        chatId,
        `💰 Preço atual do Bitcoin: ${formatBRL(currentPrice)}`
      );
    }

    lastPrice = currentPrice;
    console.log(`💰 Preço atual (BRL): R$${currentPrice}`);
  } catch (err) {
    console.error("Erro ao consultar preço:", err.message);
  }
}

setInterval(checkBitcoin, 3 * 60 * 1000);
console.log("⏳ Bot rodando...");
