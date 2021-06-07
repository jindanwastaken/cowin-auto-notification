const TelegramBot = require("node-telegram-bot-api");
const utils = require("./utils");
const constants = require("./constants");
const cron = require('node-cron');

require("dotenv").config();

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, {polling: true});

bot.on("message", (msg) => {
	console.log(msg);
});

bot.on("polling_error", (error) => {
	console.error(error);
});

cron.schedule('*/15 * * * * *', () => {
	console.log('running a task every 15 minutes'); 
	testFunct();
});

const testFunct = async () => {
	let payload;
	try {
		payload = await utils.checkCowin();
	} catch (err) {
		console.log("Error when getting messages");
		console.error(err);
	}

	promiseArray = [];
	payload.forEach((msg) => {
		promiseArray.push(bot.sendMessage(constants.CHAT_ID, msg));
	});

	if(promiseArray.length === 0) {
		promiseArray.push(bot.sendMessage(constants.CHAT_ID, "No centres found!"));
	}

	try {
		await Promise.all(promiseArray);
	} catch (err) {
		console.log("Error sending messages");
		console.error(err);
	}
};
