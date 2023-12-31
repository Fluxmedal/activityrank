const guildModel = require('../models/guild/guildModel.js');

module.exports = {
  name: 'guildDelete',
  execute(guild) {
    return new Promise(async function (resolve, reject) {
      try {
        await guildModel.cache.load(guild);
        await guildModel.storage.set(guild, 'leftAtDate', Date.now() / 1000);

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
};
