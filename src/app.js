const scheduler = require('./cron/scheduler.js');
const fct = require('./util/fct.js');
const keys = require('./const/keys.js').get();
const deployGlobal = require('./util/deploy-global');
//const updateGl = require('./cron/updateGl.js');

if (!process.env.NODE_ENV || process.env.NODE_ENV != 'production')
  process.env.NODE_ENV = 'development';

const managerOptions = {
  token: keys.botAuth,
  // shardList: Array.from(Array(20).keys()),
  // totalShards: 20
};

const { ShardingManager } = require('discord.js');
const logger = require('./util/logger.js');
const manager = new ShardingManager('./bot/bot.js', managerOptions);

start().catch(async (e) => {
  logger.fatal(e);
  await fct.waitAndReboot(3000);
});

async function start() {
  return new Promise(async function (resolve, reject) {
    try {
      if (process.env.NODE_ENV == 'production') await deployGlobal();

      await manager.spawn({ delay: 10000, timeout: 120000 });

      await scheduler.start(manager);
      resolve();
    } catch (e) {
      return reject(e);
    }
  });
}

// Process Exit
process.on('SIGINT', () => {
  logger.warn('SIGINT signal received in Manager');
});

process.on('SIGTERM', () => {
  logger.warn('SIGTERM signal received in Manager');
});
