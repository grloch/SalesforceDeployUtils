import { select } from '@inquirer/prompts';
import { select as inquirerSelectPro } from 'inquirer-select-pro';

import Utils from './utils';
import * as logger from './logger';

// interface getListItemParams {
//     message: string;
//     multiples?: Boolean;
//     options: Array<string | { name: string; value: string }>;
// }

function handleInquirerTryCatch(inquirerMessage: string, error: Error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
        global.logger?.main.error(`User canceled operation "${inquirerMessage}"`);
    } else {
        global.logger?.main.fatal(`"${inquirerMessage}" error: ${error}`);

        throw error;
    }
}

// TODO add logs
async function getFileOrDirPath(options: { rootPath: string; message: string; allowedExtensions: string[] }) {
    const fileOptions = Utils.listFilesByExtensions(options.rootPath, options.allowedExtensions);

    return <string>await select({
        message: 'Select a path',
        choices: fileOptions,
    });
}

// TODO add logs
// async function getListItem(options: getListItemParams) {
//     return await select({
//         message: options.message,
//         choices: options.options.map((option) => (typeof option === 'string' ? { name: option, value: option } : option)),
//         pageSize: 10,
//     });
// }

export async function selectManifestFile(): Promise<string | undefined> {
    const message = 'Select a xml file to retrieve';
    const rootPath = Utils.getEnvVariable('MANIFEST_DIR');

    Utils.createDirIfDontExist(rootPath);

    global.logger?.main?.trace(`Awaiting for "${message}" at "${rootPath}"`);

    let response;

    try {
        response = await getFileOrDirPath({ message, rootPath, allowedExtensions: ['.xml'] });
    } catch (error) {
        handleInquirerTryCatch(message, error);
    }

    global.logger?.main?.trace(`${message}=${response}`);

    return response;
}

export async function getTargetOrg(multiples: boolean) {
    const mainLogger = logger.getLogger('main');

    const message = 'Select target environment';
    const options = Utils.getOrgAlias();

    mainLogger?.trace(`Awaiting for "${message}" (multiples=${multiples})`);

    let response;
    try {
        if (multiples) {
            response = await inquirerSelectPro({
                message,
                options,
                loop: false,
                required: true,
                canToggleAll: true,
            });
        } else {
            response = await select({
                message,
                choices: options,
                loop: false,
            });
        }
    } catch (error) {
        handleInquirerTryCatch(message, error);
    }

    mainLogger?.trace(`${message}=${response}`);

    return response;
}

export default { getFileOrDirPath, selectManifestFile, getTargetOrgs: getTargetOrg };
