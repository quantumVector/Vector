module.exports = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',

  production: {
    secret: 'it-is-so-cool-to-flex-on-the-internet',
    database: 'mongodb://username:password@192.168.xx.xx:27017,192.168.xx.xx:27017,192.168.xx.xx:27017/database',
  },
  development: {
    secret: 'it-is-so-cool-to-flex-on-the-internet',
    database: 'mongodb://localhost:27017/goalsCalendar',
  },
};
