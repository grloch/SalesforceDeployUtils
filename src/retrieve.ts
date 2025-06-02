import Fs from 'fs';
import path from 'path';
import { confirm } from '@inquirer/prompts';

import SfdxController from './sfdxController';
import Utils from './utils';
import inquirer from './inquirer';

import * as logger from './logger';

require('dotenv').config();
logger.setDefaultLogger('retrieve');

async function retrieveExec(manifestFile?: string, targetOrgs?: Array<string>) {
    const mainLogger = logger.getLogger('main');

    mainLogger?.trace(`Preparing to retrive Salesforce source (${process.cwd()})`);
    Utils.createDirIfDontExist(Utils.getEnvVariable('MANIFEST_DIR'));

    if (!manifestFile) {
        manifestFile = await inquirer.selectManifestFile();
    }
    if (!manifestFile || manifestFile === '') return;

    if (!targetOrgs || targetOrgs.length == 0) {
        let selectedTargetOrgs = await inquirer.getTargetOrgs(true);
        if (!selectedTargetOrgs) return;

        if (!Array.isArray(selectedTargetOrgs)) {
            selectedTargetOrgs = [selectedTargetOrgs];
        }

        targetOrgs = [...new Set(selectedTargetOrgs.filter((i) => !!i))];
    }
    if (targetOrgs.length == 0) return;

    mainLogger?.info('Retrieving data from: ' + targetOrgs.join(', '));

    const targetOrgName = targetOrgs.shift();

    if (!targetOrgName || targetOrgName.length == 0) return;

    const retrieveController = new SfdxController('project retrieve start');
    retrieveController.addArgumment('--manifest', manifestFile);
    retrieveController.addArgumment('--target-org', targetOrgName);

    let destDir = path.join(Utils.getEnvVariable('RETRIVED_DIR'), targetOrgName);
    if (Utils.getEnvVariable('RETRIVED_DIR_WITH_MANIFEST')) {
        destDir = path.join(destDir, manifestFile.replace('.xml', ''));
    }

    retrieveController.addArgumment('--output-dir', destDir);

    mainLogger?.trace(`Ouput will be saved at ${destDir}`);

    if (Fs.existsSync(destDir)) {
        mainLogger?.trace(`Path ${destDir} already exist`);

        const confirmExclusion = await confirm({ message: `${destDir} already existe, replace it?` });
        if (confirmExclusion) {
            mainLogger?.trace(`User confirmed exclusion of path ${destDir}`);

            Utils.removeDirIfExist(destDir);
        } else {
            return;
        }
    }

    Utils.createDirIfDontExist(destDir);

    global.logger?.info?.info(`Enqueued async retriving for ${targetOrgName}`);

    await retrieveController.executeCommand();

    if (targetOrgs.length > 0) {
        mainLogger?.info(`====================================================================}`);

        retrieveExec(manifestFile, targetOrgs);
    }
}

retrieveExec('manifest/test.xml');
