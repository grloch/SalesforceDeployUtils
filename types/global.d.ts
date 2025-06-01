import log4js from 'log4js';

declare global {
  // namespace globalThis {
    var logger: {
      default: log4js.Logger;
      info: log4js.Logger;
      sfdx: log4js.Logger;
      path: string;
    };
  // }
}

export default global;
