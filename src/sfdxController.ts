import * as ChildProcess from 'child_process';

export default class SfdxController {
    private command: string;
    private commandArgs = new Map<string, string>();

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
    }

    async executeCommand() {
        const sfdxProcess = ChildProcess.exec(this.consoleCommand, async (e: any, sOut: any, sErr: any) => {
            global.logger?.sfdx.info(e);
        });

        sfdxProcess.stdout?.on('data', (data) => {
            for (var i of data.split('\n')) if (i && i.trim() != '') global.logger?.sfdx.info(i ?? '');
        });
    }
}
