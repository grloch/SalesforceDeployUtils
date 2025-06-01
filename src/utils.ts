import * as Fs from 'fs';
import * as path from 'path';
import inquirer from './inquirer';

const pjson = require('../package.json');

require('dotenv').config();

export function createDirIfDontExist(path: string) {
    if (!Fs.existsSync(path)) {
        Fs.mkdirSync(path, { recursive: true });

        return true;
    }

    return false;
}

export function safeString(input: string, fallback: string): string {
    if (!input || input.length == 0 || input === '') {
        return fallback;
    }

    return input;
}

export function getEnvVariable(envVariableName: string): any {
    return safeString(<string>process.env[envVariableName], pjson.defaultEnvValues[envVariableName]);
}

export async function selectManifestFile() {
    const message = 'Select a xml file to retrieve';
    const rootPath = getEnvVariable('MANIFEST_DIR');
    const allowedExtensions = ['.xml'];

    createDirIfDontExist(rootPath);

    global.logger?.default.trace(`Awaiting user choose target manifest at ${rootPath}`);

    return await inquirer.getFileOrDirPath({ message, rootPath, allowedExtensions });
}

export function listFilesByExtensions(dir: string, allowedExtensions: string[], fileList: string[] = []): Array<string> {
    const entries = Fs.readdirSync(dir);

    for (const entry of entries ?? []) {
        const fullPath = path.join(dir, entry);
        const stat = Fs.statSync(fullPath);

        if (stat.isDirectory()) {
            listFilesByExtensions(fullPath, allowedExtensions, fileList);
        } else {
            const ext = path.extname(entry)?.toLowerCase();
            if (!allowedExtensions || allowedExtensions.length == 0 || allowedExtensions.includes(ext)) {
                fileList.push(fullPath);
            }
        }
    }

    return fileList;
}

export async function getTargetOrg() {
    return await inquirer.getListItem({
        message: 'Select target environment',
        options: getOrgAlias(),
    });
}

export function getOrgAlias() {
    const aliasOptions: Array<{ name: string; value: string }> = [];

    const envOptions = Object.keys(process.env)
        .filter((i) => i.startsWith('SF_'))
        .sort();

    for (const i of envOptions) {
        if (!process.env[i] || process.env[i] == '') continue;

        aliasOptions.push({ name: `${i}: ${process.env[i]}`, value: <string>process.env[i] });
    }

    global.logger?.default.trace(`Avaliable org alias: ${JSON.stringify(aliasOptions)}`);

    if (aliasOptions.length == 0) {
        let error = `No Salesforce org alias founded on ./.env, make sure that all org alias variables starts with "SF_" and has a value: "SF_PROD=MyClientProdOrg"`;
        global.logger?.default.error(error);

        throw new Error(error);
    }

    return aliasOptions;
}

export function prettyNum(num: number) {
    if (!!!num) {
        return num;
    }

    if (num >= 0 && num < 10) {
        return `0${num}`;
    }

    if (num > -10 && num < 0) {
        return `0${num}`.replace('0-', '-0');
    }

    return `${num}`;
}

export default {
    prettyNum,
    createDirIfDontExist,
    safeString,
    selectManifestFile,
    listFilesByExtensions,
    getTargetOrg,
    getEnvVariable,
};
