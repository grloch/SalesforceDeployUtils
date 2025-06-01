import * as Fs from 'fs';
import * as path from 'path';
import inquirer from '../src/inquirer';
import * as utils from '../src/utils';

jest.mock('fs');
jest.mock('path');
jest.mock('../src/inquirer');

const mockLogger = {
    default: {
        trace: jest.fn(),
        error: jest.fn(),
    },
};

describe('utils', () => {
    afterEach(() => {
        jest.clearAllMocks();
        process.env = {};
    });

    describe('createDirIfDontExist', () => {
        it('create directory if not exists', () => {
            (Fs.existsSync as jest.Mock).mockReturnValue(false);
            (Fs.mkdirSync as jest.Mock).mockImplementation(() => {});

            expect(utils.createDirIfDontExist('foo')).toBe(true);
            expect(Fs.mkdirSync).toHaveBeenCalledWith('foo', { recursive: true });
        });

        it('do not create directory if it already exists', () => {
            (Fs.existsSync as jest.Mock).mockReturnValue(true);

            expect(utils.createDirIfDontExist('foo')).toBe(false);

            expect(Fs.mkdirSync).not.toHaveBeenCalled();
        });
    });

    describe('safeString', () => {
        it('returns fallback if input is empty', () => {
            expect(utils.safeString('', 'fallback')).toBe('fallback');

            expect(utils.safeString(undefined as any, 'fallback')).toBe('fallback');
        });

        it('returns input if not empty', () => {
            expect(utils.safeString('abc', 'fallback')).toBe('abc');
        });
    });

    describe('getEnvVariable', () => {
        it('return env value if exists', () => {
            process.env.TEST_VAR = 'abc';
            expect(utils.getEnvVariable('TEST_VAR')).toBe('abc');
        });

        it('returns default value from package.json if env does not exist', () => {
            jest.spyOn(require('../src/utils'), 'safeString').mockImplementation((input, fallback) => fallback);

            expect(utils.getEnvVariable('NOT_SET')).toBe(require('../package.json').defaultEnvValues['NOT_SET']);
        });
    });

    describe('selectManifestFile', () => {
        it('calls inquirer.getFileOrDirPath', async () => {
            process.env.MANIFEST_DIR = 'dir';

            (inquirer.getFileOrDirPath as jest.Mock).mockResolvedValue('file.xml');

            jest.spyOn(utils, 'getEnvVariable').mockReturnValue('dir');
            jest.spyOn(utils, 'createDirIfDontExist').mockReturnValue(true);

            const result = await utils.selectManifestFile();

            expect(inquirer.getFileOrDirPath).toHaveBeenCalled();
            expect(result).toBe('file.xml');
        });
    });

    describe('getTargetOrg', () => {
        it('calls inquirer.getListItem', async () => {
            (inquirer.getListItem as jest.Mock).mockResolvedValue('SF_ORG_A');
            jest.spyOn(utils, 'getOrgAlias').mockReturnValue([{ name: 'SF_ORG_A: alias', value: 'alias' }]);

            process.env.SF_ORG_A = 'SF_ORG_A';
            process.env.SF_ORG_B = 'SF_ORG_B';

            const result = await utils.getTargetOrg();

            expect(inquirer.getListItem).toHaveBeenCalled();
            expect(result).toBe('SF_ORG_A');
        });

        it('calls inquirer.getListItem no envOrg', async () => {
            (inquirer.getListItem as jest.Mock).mockResolvedValue('SF_ORG_A');
            jest.spyOn(utils, 'getOrgAlias').mockReturnValue([{ name: 'SF_ORG_A: alias', value: 'alias' }]);

            let error;

            try {
                await utils.getTargetOrg();
            } catch (catchError) {
                error = catchError + '';
            }

            expect(error?.includes('No Salesforce org alias founded on ./.env')).toBeTruthy();
        });
    });

    describe('getOrgAlias', () => {
        it('returns aliases if they exist', () => {
            for (const envKey in process.env) {
                if (envKey.startsWith('SF_')) {
                    process.env[envKey] = '';
                }
            }

            process.env.SF_TEST = 'alias1';
            const aliases = utils.getOrgAlias();

            expect(aliases).toHaveLength(1);

            expect(aliases[0].name).toEqual('SF_ORG_A: alias');
            expect(aliases[0]?.value).toEqual('alias');
        });

        it('throws error if there are no aliases', () => {
            for (const envKey in process.env) {
                if (envKey.startsWith('SF_')) {
                    process.env[envKey] = '';
                }
            }

            utils.getOrgAlias();
        });
    });

    describe('prettyNum', () => {
        it('formats numbers less than 10 with leading zero', () => {
            expect(utils.prettyNum(5)).toBe('05');
            expect(utils.prettyNum(-5)).toBe('-05');

            expect(utils.prettyNum(10)).toBe('10');
            expect(utils.prettyNum(-10)).toBe('-10');

            //@ts-ignore
            expect(utils.prettyNum(undefined)).toBe(undefined);
        });
    });
});
