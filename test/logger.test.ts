import log4js from 'log4js';
import Fs from 'fs';
import Path from 'path';
import Utils from '../src/utils';
import setDefaultLogger from '../src/logger';

jest.mock('log4js');
jest.mock('fs');
jest.mock('path');
jest.mock('../src/utils');

describe('setDefaultLogger', () => {
    let originalLogger: any;

    beforeEach(() => {
        jest.clearAllMocks();
        originalLogger = global.logger;
        global.logger = undefined as any;

        (Utils.getEnvVariable as jest.Mock).mockImplementation((key: string) => {
            if (key === 'LOG4JS_DEBUG_MODE') return false;
            if (key === 'LOG_DIR') return '/logs';
            return '';
        });
        (Utils.prettyNum as jest.Mock).mockImplementation((n: number) => (n < 10 ? `0${n}` : `${n}`));

        (Path.join as jest.Mock).mockImplementation((...args: string[]) => args.join('/'));

        (Fs.existsSync as jest.Mock).mockReturnValue(false);
        (Fs.mkdirSync as jest.Mock).mockImplementation(() => {});
        (Fs.unlinkSync as jest.Mock).mockImplementation(() => {});

        (log4js.getLogger as jest.Mock).mockImplementation((name: string) => ({ name }));
        (log4js.configure as jest.Mock).mockImplementation(() => {});
    });

    afterEach(() => {
        global.logger = originalLogger;
    });

    it('should configure log4js and set global.logger in normal mode', () => {
        setDefaultLogger('CTX');
        expect(Utils.getEnvVariable).toHaveBeenCalledWith('LOG4JS_DEBUG_MODE');
        expect(Utils.getEnvVariable).toHaveBeenCalledWith('LOG_DIR');
        expect(log4js.configure).toHaveBeenCalled();
        expect(global.logger).toHaveProperty('default');
        expect(global.logger).toHaveProperty('info');
        expect(global.logger).toHaveProperty('sfdx');
        expect(global.logger).toHaveProperty('path');
        expect(global.logger.default.name).toBe('default');
    });

    it('should configure log4js and set global.logger in debug mode', () => {
        (Utils.getEnvVariable as jest.Mock).mockImplementation((key: string) => {
            if (key === 'LOG4JS_DEBUG_MODE') return true;
            if (key === 'LOG_DIR') return '/logs';
            return '';
        });
        (Fs.existsSync as jest.Mock).mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true);

        setDefaultLogger('DEBUGCTX');
        expect(log4js.configure).toHaveBeenCalled();
        expect(global.logger.path).toContain('debug');
    });

    it('should not reconfigure logger if already set', () => {
        global.logger = { default: { name: 'already' } } as any;
        setDefaultLogger('CTX');
        expect(log4js.configure).not.toHaveBeenCalled();
    });

    it('should remove log file in debug mode if exists', () => {
        (Utils.getEnvVariable as jest.Mock).mockImplementation((key: string) => {
            if (key === 'LOG4JS_DEBUG_MODE') return true;
            if (key === 'LOG_DIR') return '/logs';
            return '';
        });
        (Fs.existsSync as jest.Mock).mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true);

        setDefaultLogger('DEBUGCTX');
        expect(Fs.unlinkSync).toHaveBeenCalled();
    });
});
