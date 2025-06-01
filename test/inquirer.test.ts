import { select } from '@inquirer/prompts';
import Utils from '../src/utils';
import inquirer from '../src/inquirer';

jest.mock('@inquirer/prompts', () => ({
    select: jest.fn(),
}));
jest.mock('../src/utils', () => ({
    listFilesByExtensions: jest.fn(),
}));

describe('inquirer', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getFileOrDirPath', () => {
        it('must list files and call select', async () => {
            (Utils.listFilesByExtensions as jest.Mock).mockReturnValue(['file1.xml', 'file2.xml']);
            (select as jest.Mock).mockResolvedValue('file1.xml');

            const result = await inquirer.getFileOrDirPath({
                rootPath: 'dir',
                message: 'Escolha um arquivo',
                allowedExtensions: ['.xml'],
            });

            expect(Utils.listFilesByExtensions).toHaveBeenCalledWith('dir', ['.xml']);
            expect(select).toHaveBeenCalledWith({
                message: 'Select a package manager',
                choices: ['file1.xml', 'file2.xml'],
            });
            expect(result).toBe('file1.xml');
        });
    });

    describe('getListItem', () => {
        it('must call select with formatted options', async () => {
            (select as jest.Mock).mockResolvedValue('valor');

            const options = ['opcao1', { name: 'Nome 2', value: 'valor2' }];

            const result = await inquirer.getListItem({
                message: 'Escolha uma opção',
                options,
            });

            expect(select).toHaveBeenCalledWith({
                message: 'Escolha uma opção',
                choices: [
                    { name: 'opcao1', value: 'opcao1' },
                    { name: 'Nome 2', value: 'valor2' },
                ],
                pageSize: 10,
            });
            expect(result).toBe('valor');
        });
    });
});
