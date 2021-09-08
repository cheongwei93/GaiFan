const http = require("http");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { Navigator } = require("node-navigator");
const navigator = new Navigator();

const token = "1821289878:AAH-WczznRA2-d6GTNcz72vBTkTIUrXsl2o";
const bot = new TelegramBot(token, { polling: true });
const BearerToken =
  "741jmzbKp7t3sV4KMdRbd5HtoTIPtTclXc4FKO51fqtxiCvV7CQ8HxAM9efMTw7fyICg8idGurZvSZEs3RaaDKqu2ZYQrtpPrwwo4ew9UXeH-PNKDE4AVAUSv2bGX3Yx";

bot.onText(/\/search (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1];

  navigator.geolocation.getCurrentPosition(async (res, error) => {
    if (error) {
      console.log(error);
    } else {
      let longitude = res.longitude;
      let latitude = res.latitude;

      longitude = longitude.toString();
      latitude = latitude.toString();

      axios.default.interceptors.request.use(
        (config) => {
          config.headers.authorization = `Bearer ${BearerToken}`;
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      const link = `https://api.yelp.com/v3/businesses/search?term=${input}&latitude=${latitude}&longitude=${longitude}&radius=10000&sort_by=rating&limit=10`;
      const result = await axios.default.get(link);
      const list = result.data.businesses;

      for (let x = 0; x < list.length; x++) {}
      const image = list[0].image_url;
      const caption = `Food`;

      bot.sendPhoto(chatId, image, { caption: caption });
    }
  });
});
