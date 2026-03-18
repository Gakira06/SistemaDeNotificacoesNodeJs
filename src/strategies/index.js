const discordStrategy = require("./discordStrategy");
const emailStrategy = require("./emailStrategy");
const phoneCallStrategy = require("./phoneCallStrategy");
const smsStrategy = require("./smsStrategy");
const whatsappStrategy = require("./whatsappStrategy");

const strategies = new Map([
  [discordStrategy.type, discordStrategy],
  [emailStrategy.type, emailStrategy],
  [phoneCallStrategy.type, phoneCallStrategy],
  [smsStrategy.type, smsStrategy],
  [whatsappStrategy.type, whatsappStrategy],
]);

function getStrategy(type) {
  return strategies.get(type);
}

module.exports = {
  getStrategy,
};
