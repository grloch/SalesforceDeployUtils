import log4js from 'log4js';

import Fs from 'fs';
import Path from 'path';

import Utils from './utils';

export default function setDefaultLogger(context: string) {
    if (!global.logger?.default) {
        context = context ?? '';

        const log4jsDebugMode = !!Utils.getEnvVariable('LOG4JS_DEBUG_MODE');
        const logsDirPath = Path.join(Utils.getEnvVariable('LOG_DIR'));

        let startDate = new Date();
        let fileName;

        if (Fs.existsSync(logsDirPath)) {
            Fs.mkdirSync(logsDirPath, { recursive: true });
        }

        if (!log4jsDebugMode) {
            let year = startDate.getFullYear();
            let mouth = Utils.prettyNum(startDate.getMonth() + 1);
            let day = Utils.prettyNum(startDate.getDate());
            let hour = Utils.prettyNum(startDate.getHours());
            let minute = Utils.prettyNum(startDate.getMinutes());
            let seconds = Utils.prettyNum(startDate.getSeconds());

            fileName = `${year}-${mouth}-${day}_${hour}-${minute}-${seconds}`;
        } else {
            fileName = `debug`;
        }

        let logPath = Path.join(logsDirPath, `${fileName}_${context}.log`);

        if (log4jsDebugMode) {
            logPath = Path.join(logsDirPath, 'debug', `${fileName}_${context}.log`);

            if (Fs.existsSync(Path.join(logsDirPath, 'debug'))) {
                Fs.mkdirSync(Path.join(logsDirPath, 'debug'), { recursive: true });
            }

            if (Fs.existsSync(logPath)) {
                Fs.unlinkSync(logPath);
            }
        }

        log4js.configure({
            appenders: {
                default: { type: 'file', filename: logPath },
                info: { type: 'console' },
            },
            categories: {
                default: { appenders: ['default'], level: 'all' },
                info: { appenders: ['default', 'info'], level: 'all' },
                sfdx: { appenders: ['default', 'info'], level: 'all' },
            },
        });

        global.logger = {
            default: log4js.getLogger('default'),
            info: log4js.getLogger('info'),
            sfdx: log4js.getLogger('sfdx'),
            path: logPath,
        };
    }
}
