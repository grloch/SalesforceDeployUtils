import log4js from 'log4js';

declare global {
    var loggerPath: string;

    var logger: {
        main: log4js.Logger;
        error: log4js.Logger;
        sfdx: log4js.Logger;
        info: log4js.Logger;
    };
}
