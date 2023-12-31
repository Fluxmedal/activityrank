const shardDb = require('../../models/shardDb/shardDb.js');
const config = require('../../const/config.js');


module.exports = async (supportGuild) => {

  // Get active Patrons and support server members
  const myUsers = await shardDb.queryAllHosts(`SELECT * FROM user WHERE patreonTier > 0 && patreonTierUntilDate > ${Date.now() / 1000}`);
  const members = await supportGuild.members.fetch({cache: false});

  let myUser;
  for (let member of members) {
    member = member[1];
    myUser = myUsers.find(u => u.userId == member.user.id);

    for (let patreonRole of config.supportServerPatreonRoles) {
      // Remove role, if user has role but no active tier was found
      if (!myUser && member.roles.cache.has(patreonRole.roleId))
        await member.roles.remove(patreonRole.roleId);
      
      if (!myUser) continue;
      
      // Remove role, if role does not match tier
      if (member.roles.cache.has(patreonRole.roleId) && myUser.patreonTier != patreonRole.tier) 
        await member.roles.remove(patreonRole.roleId);

      // Add role, if user has active tier and role matches the tier
      if (!member.roles.cache.has(patreonRole.roleId) && myUser.patreonTier == patreonRole.tier)
        await member.roles.add(patreonRole.roleId);
    }
  }
};