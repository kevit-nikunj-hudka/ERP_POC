const log4js = require('log4js');

const configuration = {
    appenders: {
        out: { type: 'stdout' },
        allLogs: {
            type: 'file',
            filename: 'allLogs.log',
            maxLogSize: 10485761, // 10MB
            backups: 10,
            compress: true,
        },
    },
    categories: {
        default: { appenders: ['out', 'allLogs'], level: 'INFO' },
    },
};

log4js.configure(configuration);

const logger = log4js.getLogger();

module.exports = logger;


