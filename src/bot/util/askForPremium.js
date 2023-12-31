const userModel = require('../models/userModel.js');
const fct = require('../../util/fct.js');
const cooldownUtil = require('./cooldownUtil.js');
const { EmbedBuilder } = require('discord.js');
const { oneLine } = require('common-tags');

let askForPremiumCdGuild, askForPremiumCdUser;
if (process.env.NODE_ENV == 'production') {
  askForPremiumCdGuild = 3600 * 0.4;
  askForPremiumCdUser = 3600 * 6;
} else {
  askForPremiumCdGuild = 3600 * 0.4; // 20
  askForPremiumCdUser = 3600 * 6; // 60
}

module.exports = async function (interaction) {
  if (
    cooldownUtil.getCachedCooldown(
      interaction.guild.appData,
      'lastAskForPremiumDate',
      askForPremiumCdGuild
    ) > 0
  )
    return;

  //if (fct.isPremiumGuild(interaction.guild)) return;
  const { userTier, ownerTier } = await fct.getPatreonTiers(interaction);
  if (userTier > 0 || ownerTier > 0) return;

  await userModel.cache.load(interaction.user);
  const myUser = await userModel.storage.get(interaction.user);

  const now = Date.now() / 1000;
  if (now - myUser.lastAskForPremiumDate < askForPremiumCdUser) return;

  await userModel.storage.set(interaction.user, 'lastAskForPremiumDate', now);
  interaction.guild.appData.lastAskForPremiumDate = now;

  await sendAskForPremiumEmbed(interaction);
  /*interaction.client.logger.debug(
    { guildId: interaction.guild.id },
    `Sent askForPremium in ${interaction.guild.name}`
  );*/
};

async function sendAskForPremiumEmbed(interaction) {
  const e = new EmbedBuilder()
    .setTitle('Thank you for using ActivityRank!')
    .setColor(0x00ae86)
    .setThumbnail(interaction.client.user.displayAvatarURL());

  e.addFields({
    name: 'The maintenance and development of this bot depend on your support!',
    value: oneLine`${interaction.user}, please consider helping us by becoming a Patron. 
      The Bot is mostly free! Activating Premium for you or your server can unlock some new 
      features and gives you quality of life upgrades, like reduced cooldowns on commands. 
      Simply go to https://patreon.com/rapha01/ select your suiting tier and become a Patron **Thank you!**`,
  });

  await interaction.followUp({ embeds: [e], ephemeral: true });
}
