const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { Navigator } = require("node-navigator");
const { maxHeaderSize } = require("http");
const navigator = new Navigator();

const token = "1821289878:AAH-WczznRA2-d6GTNcz72vBTkTIUrXsl2o";
const bot = new TelegramBot(token, { polling: true });
const BearerToken =
  "741jmzbKp7t3sV4KMdRbd5HtoTIPtTclXc4FKO51fqtxiCvV7CQ8HxAM9efMTw7fyICg8idGurZvSZEs3RaaDKqu2ZYQrtpPrwwo4ew9UXeH-PNKDE4AVAUSv2bGX3Yx";

let longitude;
let latitude;

bot.onText(/\/search (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1];

  axios.default.interceptors.request.use(
    (config) => {
      config.headers.authorization = `Bearer ${BearerToken}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  let result;
  const link = `https://api.yelp.com/v3/businesses/search?term=${input}&latitude=${latitude}&longitude=${longitude}&radius=10000&sort_by=rating&limit=10`;
  try {
    result = await axios.default.get(link);
  } catch (error) {
    console.log(error);
  }

  const list = result.data.businesses;

  for (let x = 0; x < list.length; x++) {
    const name = list[x].name;
    const image = list[x].image_url;
    const is_closed = list[x].is_closed;
    const review_count = list[x].review_count;
    const categories = list[x].categories[0].title;
    const rating = list[x].rating;
    const price = list[x].price;
    const location = list[x].location.display_address;
    const phone = list[x].phone;
    const distance = list[x].distance;

    const captionObj = {
      name: name,
      image: image,
      is_closed: is_closed,
      review_count: review_count,
      categories: categories,
      rating: rating,
      price: price,
      location: location,
      phone: phone,
      distance: distance,
    };

    const caption = buildCaption(captionObj);
    // const caption = `Food`;
    bot.sendPhoto(chatId, image, { caption: caption });
  }
});

function buildCaption(captionObj) {
  const addressArr = captionObj.location;
  let address = "";

  for (let x = 0; x < addressArr.length; x++) {
    address = address + addressArr[x] + ",\n";
  }

  let businessHours;
  if (captionObj.is_closed === true) {
    businessHours = "CLOSED";
  } else {
    businessHours = "OPEN";
  }
  let distance = captionObj.distance / 1000;
  distance = Math.round(distance * 10) / 10;

  const result =
    "Name: " +
    captionObj.name +
    "\n\n" +
    "Business: " +
    businessHours +
    "\n\n" +
    "Categories: " +
    captionObj.categories +
    "\n\n" +
    "Rating: " +
    captionObj.rating +
    " / 5 \n\n" +
    "Review Count: " +
    captionObj.review_count +
    "\n\n" +
    "Price: " +
    captionObj.price +
    "\n\n" +
    "Contact Number: " +
    captionObj.phone +
    "\n\n" +
    "Distance: " +
    distance +
    " KM\n\n" +
    "------  Address  ------\n\n" +
    address;

  return result;
}

bot.onText(/start/, (msg) => {
  const opts = {
    reply_markup: JSON.stringify({
      keyboard: [[{ text: "Get Location", request_location: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    }),
  };
  bot.sendMessage(msg.chat.id, "Contact and Location request", opts);
});

bot.on("location", (msg) => {
  latitude = msg.location.latitude;
  longitude = msg.location.longitude;
  bot.sendMessage(msg.chat.id, "Enter Food Keyword");
  bot.sendMessage(msg.chat.id, "Example --> '/search Chicken Rice'");
});
