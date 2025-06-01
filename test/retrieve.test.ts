import Fs from 'fs';
import path from 'path';
import setLogger from '../src/logger';
import SfdxController from '../src/sfdxController';
import Utils from '../src/utils';
import { confirm } from '@inquirer/prompts';

jest.mock('fs');
jest.mock('path');
jest.mock('../src/logger');
jest.mock('../src/sfdxController');
jest.mock('../src/utils');
jest.mock('@inquirer/prompts', () => ({
    confirm: jest.fn(),
}));

const mockLogger = {
    info: { trace: jest.fn(), info: jest.fn() },
    default: { trace: jest.fn(), info: jest.fn(), error: jest.fn() },
    sfdx: { error: jest.fn() },
};
global.logger = mockLogger as any;

describe('retrieve script', () => {
    let originalEnv: NodeJS.ProcessEnv;
    let origCwd: () => string;

    beforeEach(() => {
        jest.clearAllMocks();
        originalEnv = { ...process.env };
        origCwd = process.cwd;
        (process as any).cwd = () => '/cwd';
        (Utils.getEnvVariable as jest.Mock).mockImplementation((key: string) => {
            if (key === 'MANIFEST_DIR') return '/manifest';
            if (key === 'RETRIVED_DIR') return '/retrieved';
            if (key === 'RETRIVED_DIR_WITH_MANIFEST') return false;
            return '';
        });
        (Utils.createDirIfDontExist as jest.Mock).mockReturnValue(true);
        (Utils.selectManifestFile as jest.Mock).mockResolvedValue('manifest.xml');
        (Utils.getTargetOrg as jest.Mock).mockResolvedValue('myOrg');
        (path.join as jest.Mock).mockImplementation((...args: string[]) => args.join('/'));
        (Fs.existsSync as jest.Mock).mockReturnValue(false);
        (SfdxController as unknown as jest.Mock).mockImplementation(() => ({
            addArgumment: jest.fn(),
            executeCommand: jest.fn().mockResolvedValue(undefined),
            consoleCommand: 'sf ...',
        }));
        (confirm as jest.Mock).mockResolvedValue(true);
    });

    afterEach(() => {
        process.env = originalEnv;
        (process as any).cwd = origCwd;
    });

    // it('runs the happy path with no existing destDir', async () => {
    //     await import('../src/retrieve');
    //     expect(setLogger).toHaveBeenCalledWith('retrieve');
    //     expect(Utils.createDirIfDontExist).toHaveBeenCalledWith('/manifest');
    //     expect(Utils.selectManifestFile).toHaveBeenCalled();
    //     expect(Utils.getTargetOrg).toHaveBeenCalled();
    //     expect(SfdxController).toHaveBeenCalledWith('project retrieve start');
    //     expect(mockLogger.info.info).toHaveBeenCalledWith('Retrieving data from myOrg');
    //     expect(Utils.createDirIfDontExist).toHaveBeenCalledWith('/retrieved/myOrg');
    // });

    it('returns early if manifestFile is empty', async () => {
        (Utils.selectManifestFile as jest.Mock).mockResolvedValue('');
        await import('../src/retrieve');
        expect(Utils.getTargetOrg).not.toHaveBeenCalled();
    });

    it('returns early if targetOrg is empty', async () => {
        (Utils.getTargetOrg as jest.Mock).mockResolvedValue('');
        await import('../src/retrieve');
        expect(mockLogger.info.info).not.toHaveBeenCalledWith('Retrieving data from ');
    });

    // it('handles RETRIVED_DIR_WITH_MANIFEST', async () => {
    //     (Utils.getEnvVariable as jest.Mock).mockImplementation((key: string) => {
    //         if (key === 'MANIFEST_DIR') return '/manifest';
    //         if (key === 'RETRIVED_DIR') return '/retrieved';
    //         if (key === 'RETRIVED_DIR_WITH_MANIFEST') return true;
    //         return '';
    //     });
    //     await import('../src/retrieve');
    //     expect(path.join).toHaveBeenCalledWith('/retrieved', 'myOrg', 'manifest');
    // });

    // it('confirms and removes existing destDir', async () => {
    //     (Fs.existsSync as jest.Mock)
    //         .mockReturnValueOnce(false) // for createDirIfDontExist
    //         .mockReturnValueOnce(true); // for destDir existence
    //     (confirm as jest.Mock).mockResolvedValue(true);
    //     (Fs.rmSync as jest.Mock).mockImplementation(() => {});
    //     await import('../src/retrieve');
    //     expect(confirm).toHaveBeenCalled();
    //     expect(Fs.rmSync).toHaveBeenCalledWith('/retrieved/myOrg', { recursive: true, force: true });
    // });

    it('returns if user does not confirm exclusion', async () => {
        (Fs.existsSync as jest.Mock).mockReturnValueOnce(false).mockReturnValueOnce(true);
        (confirm as jest.Mock).mockResolvedValue(false);
        await import('../src/retrieve');
        expect(Fs.rmSync).not.toHaveBeenCalled();
    });

    // it('copies manifest.xml after command execution if destDir exists', async () => {
    //     (Fs.existsSync as jest.Mock)
    //         .mockReturnValueOnce(false) // for createDirIfDontExist
    //         .mockReturnValueOnce(false) // for destDir existence
    //         .mockReturnValueOnce(true); // after command
    //     (Fs.copyFileSync as jest.Mock).mockImplementation(() => {});
    //     await import('../src/retrieve');
    //     expect(Fs.copyFileSync).toHaveBeenCalledWith('manifest.xml', '/retrieved/myOrg/manifest.xml');
    // });

    // it('logs error if executeCommand throws', async () => {
    //     (SfdxController as unknown as jest.Mock).mockImplementation(() => ({
    //         addArgumment: jest.fn(),
    //         executeCommand: jest.fn().mockRejectedValue(new Error('fail')),
    //         consoleCommand: 'sf ...',
    //     }));
    //     await import('../src/retrieve');
    //     expect(mockLogger.sfdx.error).toHaveBeenCalled();
    // });
});
