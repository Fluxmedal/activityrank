const guildModel = require('../../../models/guild/guildModel.js');
const { Modal, TextInputComponent, showModal } = require('discord-modals');


module.exports.execute = async function(i) {
  if (!i.member.permissionsIn(i.channel).has('MANAGE_GUILD')) {
    return await i.reply({
      content: 'You need the permission to manage the server in order to use this command.',
      ephemeral: true,
    });
  }

  const m = new Modal()
    .setCustomId('commandsSlash/settings/autosend/levelup-message.js')
    .setTitle('Welcome Message')
    .addComponents([
      new TextInputComponent()
        .setCustomId('msg-component-1')
        .setLabel('The message to send when a member gains a level')
        .setStyle('LONG')
        .setMaxLength(1000)
        .setRequired(true),
    ]);
  showModal(m, { client: i.client, interaction: i });
};

module.exports.modal = async function(i) {
  const msg = await i.getTextInputValue('msg-component-1');
  await guildModel.storage.set(i.guild, 'serverJoinMessage', msg);

  await i.deferReply({ ephemeral: true });
  i.followUp({
    content: 'Set the server\'s welcome message!',
    embeds: [{ description: msg, color: '#4fd6c8' }],
    ephemeral: true,
  });
};