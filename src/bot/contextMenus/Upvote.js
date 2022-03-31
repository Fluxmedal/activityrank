const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { oneLine } = require('common-tags');
const statFlushCache = require('../statFlushCache.js');
const guildMemberModel = require('../models/guild/guildMemberModel.js');
const userModel = require('../models/userModel.js');
const fct = require('../../util/fct.js');
const cooldownUtil = require('../util/cooldownUtil.js');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Upvote')
    // User
    .setType(2),
  async execute(i) {
    if (!i.guild.appData.voteXp)
      return await i.reply({ content: 'Voting is disabled on this server.', ephemeral: true });

    const targetMember = await i.guild.members.fetch(i.targetId);

    if (!targetMember)
      return await i.reply({ content: 'Could not find member.', ephemeral: true });

    await guildMemberModel.cache.load(i.member);
    await guildMemberModel.cache.load(targetMember);

    if (targetMember.user.bot)
      return await i.reply({ content: 'You cannot upvote bots.', ephemeral: true });

    if (i.targetId == i.member.id)
      return await i.reply({ content: 'You cannot upvote yourself.', ephemeral: true });

    if (await fct.hasNoXpRole(targetMember)) {
      return await i.reply({
        content: 'The member you are trying to upvote cannot be upvoted, because of an assigned noxp role.',
        ephemeral: true,
      });
    }

    // Get author multiplier
    await userModel.cache.load(i.user);
    const myUser = await userModel.storage.get(i.user);
    const nowDate = Date.now() / 1000;

    let value = 1;

    if (myUser.voteMultiplierUntil > nowDate)
      value = value * myUser.voteMultiplier;

    // Check Command cooldown

    const toWait = cooldownUtil.getCachedCooldown(i.member.appData, 'lastVoteDate', i.guild.appData.voteCooldownSeconds);
    if (toWait > 0) {
      return await i.reply({
        content: `You already voted recently. You will be able to vote again <t:${Math.ceil(toWait + nowDate)}:R>.`,
        ephemeral: true,
      });
    }

    i.member.appData.lastVoteDate = nowDate;

    await statFlushCache.addVote(targetMember, value);

    if (myUser.voteMultiplierUntil > nowDate) {
      await i.reply(`You have successfully voted for ${targetMember}. Your vote counts \`${myUser.voteMultiplier}x\`.`);
    } else {
      await i.reply(oneLine`You have successfully voted for ${targetMember}. 
        Check \`/token get\` for information on how to increase your voting power!`);
    }
  },
};