import { spawn } from 'child_process';

export default class SfdxController {
    private consoleUsableArgsname: Array<string> = ['target-org'];
    private command: string;
    private commandArgs = new Map<string, string>();

    private consoleUsableArgs = new Map<string, string>();

    constructor(command: string) {
        this.command = `sf ${command}`;
    }

    get consoleCommand() {
        const argList: Array<string> = [];

        for (const argParam of this.commandArgs.entries()) {
            const [argName, argValue] = argParam;

            let item = argName;
            if (argValue) item += `="${argValue}"`;

            argList.push(item);
        }

        return `${this.command} ${argList.join(' ')}`.trim();
    }

    addArgumment(argumment: string, value: string) {
        this.commandArgs.set(argumment, value);
        global.logger?.sfdx?.trace(`SFDX controller add argumment "${argumment}${value && `=${value}`}"`);

        argumment = argumment.replace(/^(-+)|(-+)$/g, '');

        if (this.consoleUsableArgsname.includes(argumment)) {
            this.consoleUsableArgs.set(argumment, value);
        }
    }

    async executeCommand() {
        const targetOrg = this.getConsoleUsableArgsValue('target-org');

        // global.logger?.sfdx?.info(`Executing SFDX command ${targetOrg && `for target org "${targetOrg}"`}`);

        // const sfdxProcess = await ChildProcess.exec(
        //     this.consoleCommand,

        //     async (error: ChildProcess.ExecException | null, stdout: string, stderr: string) => {
        //         if (error) {
        //             global.logger?.info.fatal(error);
        //         }
        //     }
        // );

        // sfdxProcess.stdout?.on('data', (data) => {
        //     for (var i of data.split('\n')) {
        //         if (i && i.trim() != '' && i.trim() != 'null') {
        //             global.logger?.sfdx.info(i ?? '');
        //         }
        //     }
        // });

        // sfdxProcess.stdout?.on('end', () => {
        //     global.logger?.info?.trace(`Ended async command ${targetOrg && `for target org "${targetOrg}"`}`);
        // });

        global.logger?.sfdx?.info(`Executing SFDX command ${targetOrg && `for target org "${targetOrg}"`}`);

        return new Promise<void>((resolve, reject) => {
            const child = spawn(this.consoleCommand, {
                shell: true,
                stdio: ['ignore', 'pipe', 'pipe'],
            });

            child.stdout?.on('data', (data) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        global.logger?.sfdx.info(line.trim());
                    }
                }
            });

            child.stderr?.on('data', (data) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        global.logger?.info?.info(line.trim());
                    }
                }
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    global.logger?.sfdx.fatal(`Command failed with exit code ${code}`);
                }
            });

            child.on('error', (error) => {
                global.logger?.info?.fatal(error);
                reject(error);
            });
        });
    }

    private getConsoleUsableArgsValue(arg: string) {
        return this.consoleUsableArgs.get(arg);
    }
}
