import { select } from '@inquirer/prompts';

import Utils from './utils';

interface getListItemParams {
    message: string;
    multiples?: Boolean;
    options: Array<string | { name: string; value: string }>;
}

async function getFileOrDirPath(options: { rootPath: string; message: string; allowedExtensions: string[] }) {
    const fileOptions = Utils.listFilesByExtensions(options.rootPath, options.allowedExtensions);

    return <string>await select({
        message: 'Select a package manager',
        choices: fileOptions,
    });
}

async function getListItem(options: getListItemParams) {
    return await select({
        message: options.message,
        choices: options.options.map((option) => (typeof option === 'string' ? { name: option, value: option } : option)),
        pageSize: 10,
    });
}

export default { getFileOrDirPath, getListItem };
