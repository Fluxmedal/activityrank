const keys = {
  production: {
    botAuth: '',
    botId: '',
    managerApiAuth: '',
    managerHost: '',
    botInviteLink: '',
    managerDb: {
      dbUser: '',
      dbPassword: '',
      dbName: ''
    },
    shardDb: {
      dbUser: '',
      dbPassword: '',
      dbName: ''
    },
    admin: {
      serverIds: [''],
      channelIds: ['']
    }
  },
  development: {
    botAuth: '',
    botId: '',
    managerApiAuth: '',
    managerHost: '',
    botInviteLink: '',
    managerDb: {
      dbUser: '',
      dbPassword: '',
      dbName: ''
    },
    shardDb: {
      dbUser: '',
      dbPassword: '',
      dbName: ''
    },
    admin: {
      serverIds: [''],
      channelIds: ['']
    }
  }
};

module.exports.get = () => {
  if (process.env.NODE_ENV == 'production')
    return keys.production;
  else
    return keys.development;
}
