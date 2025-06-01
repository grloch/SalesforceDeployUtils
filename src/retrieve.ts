import Fs from 'fs';
import path from 'path';
import setLogger from './logger';
import SfdxController from './sfdxController';
import Utils from './utils';
import { confirm } from '@inquirer/prompts';

require('dotenv').config();
setLogger('retrieve');

(async () => {
    global.logger?.info.trace(`Preparing to retrive Salesforce source (${process.cwd()})`);
    Utils.createDirIfDontExist(Utils.getEnvVariable('MANIFEST_DIR'));

    const manifestFile: string = await Utils.selectManifestFile();
    if (!!!manifestFile || manifestFile == '') return;

    const targetOrg = await Utils.getTargetOrg();
    if (!!!targetOrg || targetOrg == '') return;

    global.logger?.info.info('Retrieving data from ' + targetOrg);

    const retrieveController = new SfdxController('project retrieve start');
    retrieveController.addArgumment('--manifest', manifestFile);
    retrieveController.addArgumment('--target-org', targetOrg);

    var destDir = path.join(Utils.getEnvVariable('RETRIVED_DIR'), targetOrg);
    if (Utils.getEnvVariable('RETRIVED_DIR_WITH_MANIFEST')) {
        destDir = path.join(destDir, manifestFile.replace('.xml', ''));
    }

    retrieveController.addArgumment('--output-dir', destDir);
    Utils.createDirIfDontExist(destDir);

    global.logger?.default.trace('command ', `'${retrieveController.consoleCommand}'`);
    global.logger?.default.trace(`Ouput will be saved at ${destDir}`);

    if (Fs.existsSync(destDir)) {
        const confirmExclusion = await confirm({ message: `${destDir} already existe, replace it?` });
        if (confirmExclusion) {
            Fs.rmSync(destDir, { recursive: true, force: true });
        } else {
            return;
        }
    }

    try {
        global.logger?.default.trace(`Executing SFDX command`);

        retrieveController.executeCommand().then(() => {
            if (Fs.existsSync(destDir)) {
                Fs.copyFileSync(manifestFile, path.join(destDir, 'manifest.xml'));
            }
        });
    } catch (error) {
        global.logger?.sfdx.error('SFDX process error: ' + error);
    }
})();
