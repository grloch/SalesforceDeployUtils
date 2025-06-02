import log4js from 'log4js';

import Fs from 'fs';
import Path from 'path';

import Utils from './utils';

type LoggerName = 'main' | 'error' | 'info' | 'sfdx';

export function setDefaultLogger(context: string) {
    if (!global.logger?.main) {
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

        let logPath = global.loggerPath;

        if (!logPath) {
            Path.join(logsDirPath, `${fileName}_${context}.log`);

            if (log4jsDebugMode) {
                logPath = Path.join(logsDirPath, 'debug', `${fileName}_${context}.log`);

                if (Fs.existsSync(Path.join(logsDirPath, 'debug'))) {
                    Fs.mkdirSync(Path.join(logsDirPath, 'debug'), { recursive: true });
                }

                if (Fs.existsSync(logPath)) {
                    Fs.unlinkSync(logPath);
                }
            }
        }

        log4js.configure({
            appenders: {
                main: { type: 'file', filename: logPath },
                console: { type: 'console' },
            },
            categories: {
                default: { appenders: ['main'], level: 'ALL' },
                info: { appenders: ['main', 'console'], level: 'ALL' },
                sfdx: { appenders: ['main'], level: 'ALL' },
                error: { appenders: ['main', 'console'], level: 'ERROR' },
            },
        });

        global.logger = {
            main: log4js.getLogger('default'),
            info: log4js.getLogger('info'),
            error: log4js.getLogger('error'),
            sfdx: log4js.getLogger('sfdx'),
        };

        global.loggerPath = logPath;
    }
}

export function getLogger(loggerName: LoggerName) {
    return global.logger?.[loggerName];
}

export function functionError(methodPath: string, error: any): any {
    global.logger?.error.error(`${methodPath} got an error:`);
    global.logger?.error.error(error);
}
